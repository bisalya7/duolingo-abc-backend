from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Child, User
from schemas import ChildCreate, ChildResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/v1/children", tags=["Children"])

@router.post("/", response_model=ChildResponse)
def create_child(child: ChildCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_child = Child(name=child.name, age=child.age, parent_id=current_user.id)
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

@router.get("/", response_model=list[ChildResponse])
def get_my_children(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    children = db.query(Child).filter(Child.parent_id == current_user.id).all()
    return children
# ДОБАВИТЬ В КОНЕЦ ФАЙЛА children.py

@router.get("/{child_id}")
def get_child_by_id(child_id: int):
    """Получить профиль конкретного ребенка"""
    return {"id": child_id, "name": "Имя", "xp": 100, "level": 2}

@router.put("/{child_id}")
def update_child(child_id: int, child_data: dict):
    """Изменить данные ребенка (имя, аватар)"""
    return {"message": "Профиль ребенка обновлен"}

@router.delete("/{child_id}")
def delete_child(child_id: int):
    """Удалить профиль ребенка"""
    return {"message": "Профиль удален"}

@router.get("/{child_id}/progress")
def get_child_progress(child_id: int):
    """Получить историю уроков для графиков родителя (Progress)"""
    return {"lessons_completed": 10, "accuracy": 95}

@router.get("/{child_id}/badges")
def get_child_badges(child_id: int):
    """Получить заработанные награды и бейджи"""
    return [{"badge": "Первая кровь... ой, Первая буква!", "icon": "star"}]