from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate

# БЕЗ всяких префиксов, просто чистые пути
router = APIRouter(tags=["Auth"])

@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Проверяем, есть ли такой email
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Этот email уже зарегистрирован")
    
    # Создаем пользователя (в реальном проекте тут нужно хэшировать пароль!)
    new_user = User(email=user.email, password_hash=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Успешная регистрация", "user_id": new_user.id}

@router.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    # Простейшая проверка (потом добавишь токены)
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    
    # Пока возвращаем заглушку токена для тестов
    return {"access_token": "fake-super-secret-token", "token_type": "bearer"}