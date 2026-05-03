from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Child, User
from schemas import ChildCreate, ChildResponse
from services.auth_service import get_current_user
from models import ChildBadge
from models import Progress
router = APIRouter(prefix="/children", tags=["Children"])

@router.post("/", response_model=ChildResponse)
def create_child(child: ChildCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Явно указываем начальные значения, чтобы Postgres и Pydantic были довольны
    new_child = Child(
        name=child.name, 
        age=child.age, 
        parent_id=current_user.id,
        total_xp=0,
        level=1,
        daily_streak=0
    )
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    return new_child

@router.get("/", response_model=list[ChildResponse])
def get_my_children(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Child).filter(Child.parent_id == current_user.id).all()
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
def get_child_progress(child_id: int, db: Session = Depends(get_db)):
    """Получить историю уроков для графиков родителя (Progress)"""
    
    # Достаем все записи о пройденных уроках для этого ребенка, сортируем по дате
    progress_records = db.query(Progress).filter(Progress.child_id == child_id).order_by(Progress.completed_at.asc()).all()
    
    history = []
    for p in progress_records:
        history.append({
            "lesson_id": p.lesson_id,
            "lesson_title": p.lesson.title, # SQLAlchemy сама подтянет название урока по связи
            "score": p.score, # Звездочки за урок (например, 3 из 3)
            "completed_at": p.completed_at
        })
        
    return {
        "total_completed_lessons": len(progress_records),
        "history": history
    }

@router.get("/{child_id}/badges")
def get_child_badges(child_id: int, db: Session = Depends(get_db)):
    """Получить заработанные награды и бейджи из базы данных"""
    child_badges = db.query(ChildBadge).filter(ChildBadge.child_id == child_id).all()
    
    result = []
    for cb in child_badges:
        result.append({
            "id": cb.badge.id,
            "name": cb.badge.name,
            "description": cb.badge.description,
            "icon_url": cb.badge.icon_url,
            "earned_at": cb.earned_at
        })
    return result