import os
import secrets
import logging
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

logger = logging.getLogger(__name__)

SECRET_KEY                    = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET environment variable is not set!")

ALGORITHM                     = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES   = 60
REFRESH_TOKEN_EXPIRE_DAYS     = 30

router = APIRouter(prefix="/auth", tags=["Auth"])
# ИСПРАВЛЕН tokenUrl
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Утилиты ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["type"] = "access"
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(db: Session, user_id: int) -> str:
    """Создаёт и сохраняет refresh-токен в БД."""
    try:
        raw_token = secrets.token_urlsafe(48)
        db_token = RefreshToken(
            user_id    = user_id,
            token      = raw_token,
            expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            revoked    = False,
        )
        db.add(db_token)
        db.commit()
        logger.info(f"Refresh token created for user_id={user_id}")
        return raw_token
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create refresh token: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create refresh token: {str(e)}")


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
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise exc
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещён: требуется роль admin",
        )
    return current_user


def require_parent(current_user: User = Depends(get_current_user)) -> User:
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
    logger.info(f"Registration attempt: {user.email}")
    try:
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
        logger.info(f"User registered successfully: {user.email}")
        return {"message": "Успешная регистрация"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login")
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    logger.info(f"Login attempt: {form_data.username}")
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not verify_password(form_data.password, user.password_hash):
            logger.warning(f"Failed login: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token  = create_access_token({"sub": str(user.id), "role": user.role.value})
        refresh_token = create_refresh_token(db, user.id)

        logger.info(f"Login successful: {form_data.username}")
        return {
            "access_token":  access_token,
            "refresh_token": refresh_token,
            "token_type":    "bearer",
            "role":          user.role.value,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/refresh")
def refresh_access_token(body: RefreshRequest, db: Session = Depends(get_db)):
    logger.info("Refresh token attempt")
    try:
        db_token = db.query(RefreshToken).filter(
            RefreshToken.token   == body.refresh_token,
            RefreshToken.revoked == False,
        ).first()

        if not db_token:
            logger.warning("Invalid refresh token")
            raise HTTPException(status_code=401, detail="Недействительный refresh-токен")

        if db_token.expires_at < datetime.utcnow():
            db_token.revoked = True
            db.commit()
            logger.warning("Expired refresh token")
            raise HTTPException(status_code=401, detail="Refresh-токен истёк, войдите снова")

        user = db.query(User).filter(User.id == db_token.user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Пользователь не найден")

        # Ротация
        db_token.revoked = True
        db.commit()

        new_access  = create_access_token({"sub": str(user.id), "role": user.role})
        new_refresh = create_refresh_token(db, user.id)

        logger.info(f"Token refreshed for user_id={user.id}")
        return {
            "access_token":  new_access,
            "refresh_token": new_refresh,
            "token_type":    "bearer",
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Refresh error: {e}")
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")


@router.post("/logout")
def logout(
    body: RefreshRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        db_token = db.query(RefreshToken).filter(
            RefreshToken.token   == body.refresh_token,
            RefreshToken.user_id == current_user.id,
        ).first()

        if db_token:
            db_token.revoked = True
            db.commit()

        return {"message": "Выход выполнен успешно"}
    except Exception as e:
        db.rollback()
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id":    current_user.id,
        "email": current_user.email,
        "role":  current_user.role.value,
    }