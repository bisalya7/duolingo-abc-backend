# routers/auth.py

import os
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv
from pydantic import BaseModel

from database import get_db
from models import User, RefreshToken, UserRole
from schemas import UserCreate
import bcrypt

load_dotenv()

SECRET_KEY                    = os.getenv("JWT_SECRET", "change-this-in-production")
ALGORITHM                     = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES   = 60          # access-токен живёт 1 час
REFRESH_TOKEN_EXPIRE_DAYS     = 30          # refresh-токен живёт 30 дней

router = APIRouter(tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ── Утилиты ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["type"] = "access"
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(db: Session, user_id: int) -> str:
    """Создаёт и сохраняет refresh-токен в БД."""
    raw_token = secrets.token_urlsafe(48)
    db_token = RefreshToken(
        user_id    = user_id,
        token      = raw_token,
        expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        revoked    = False,
    )
    db.add(db_token)
    db.commit()
    return raw_token


# ── Зависимости (RBAC) ───────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учётные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise exc
        user_id: str = payload.get("sub")
        if user_id is None:
            raise exc
    except JWTError:
        raise exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise exc
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Разрешает доступ только администраторам."""
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещён: требуется роль admin",
        )
    return current_user


def require_parent(current_user: User = Depends(get_current_user)) -> User:
    """Разрешает доступ только родителям (и администраторам)."""
    if current_user.role not in (UserRole.parent, UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещён: требуется роль parent",
        )
    return current_user


# ── Схема для /auth/refresh ───────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str


# ── Эндпоинты ────────────────────────────────────────────────────────────────

@router.post("/register", status_code=200)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Этот email уже зарегистрирован")

    new_user = User(
        email         = user.email,
        password_hash = hash_password(user.password),
        role          = UserRole.parent,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Успешная регистрация"}


@router.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token  = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(db, user.id)

    return {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "token_type":    "bearer",
        "role":          user.role,
    }


@router.post("/auth/refresh")
def refresh_access_token(body: RefreshRequest, db: Session = Depends(get_db)):
    """
    Принимает refresh_token, возвращает новый access_token.
    Старый refresh_token инвалидируется (rotation).
    """
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token   == body.refresh_token,
        RefreshToken.revoked == False,
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Недействительный refresh-токен")

    if db_token.expires_at < datetime.utcnow():
        db_token.revoked = True
        db.commit()
        raise HTTPException(status_code=401, detail="Refresh-токен истёк, войдите снова")

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    # Ротация: отзываем старый, выдаём новый
    db_token.revoked = True
    db.commit()

    new_access  = create_access_token({"sub": str(user.id), "role": user.role})
    new_refresh = create_refresh_token(db, user.id)

    return {
        "access_token":  new_access,
        "refresh_token": new_refresh,
        "token_type":    "bearer",
    }


@router.post("/auth/logout")
def logout(
    body: RefreshRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Отзывает refresh-токен текущего пользователя."""
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token   == body.refresh_token,
        RefreshToken.user_id == current_user.id,
    ).first()

    if db_token:
        db_token.revoked = True
        db.commit()

    return {"message": "Выход выполнен успешно"}


@router.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Возвращает профиль текущего пользователя."""
    return {
        "id":    current_user.id,
        "email": current_user.email,
        "role":  current_user.role,
    }