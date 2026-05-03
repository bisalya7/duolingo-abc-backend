from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Child, User, ChildBadge, Progress
from schemas import ChildCreate, ChildResponse
# ✅ Единственный источник get_current_user
from routers.auth import get_current_user

router = APIRouter(prefix="/children", tags=["Children"])


@router.post("/", response_model=ChildResponse)
def create_child(
    child: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
def get_my_children(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Child).filter(Child.parent_id == current_user.id).all()


@router.get("/{child_id}", response_model=ChildResponse)
def get_child_by_id(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = db.query(Child).filter(
        Child.id == child_id,
        Child.parent_id == current_user.id  # ✅ Владелец может видеть только своих детей
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Ребенок не найден")
    return child


@router.put("/{child_id}", response_model=ChildResponse)
def update_child(
    child_id: int,
    child_data: ChildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = db.query(Child).filter(
        Child.id == child_id,
        Child.parent_id == current_user.id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Ребенок не найден")

    child.name = child_data.name
    child.age = child_data.age
    db.commit()
    db.refresh(child)
    return child


@router.delete("/{child_id}")
def delete_child(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = db.query(Child).filter(
        Child.id == child_id,
        Child.parent_id == current_user.id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Ребенок не найден")

    db.delete(child)
    db.commit()
    return {"message": "Профиль удален"}


@router.get("/{child_id}/progress")
def get_child_progress(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Проверяем владельца
    child = db.query(Child).filter(
        Child.id == child_id,
        Child.parent_id == current_user.id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Ребенок не найден")

    progress_records = db.query(Progress).filter(
        Progress.child_id == child_id
    ).order_by(Progress.completed_at.asc()).all()

    history = []
    for p in progress_records:
        history.append({
            "lesson_id": p.lesson_id,
            "lesson_title": p.lesson.title,
            "score": p.score,
            "completed_at": p.completed_at
        })

    return {
        "total_completed_lessons": len(progress_records),
        "history": history
    }


@router.get("/{child_id}/badges")
def get_child_badges(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Проверяем владельца
    child = db.query(Child).filter(
        Child.id == child_id,
        Child.parent_id == current_user.id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Ребенок не найден")

    child_badges = db.query(ChildBadge).filter(
        ChildBadge.child_id == child_id
    ).all()

    return [
        {
            "id": cb.badge.id,
            "name": cb.badge.name,
            "description": cb.badge.description,
            "icon_url": cb.badge.icon_url,
            "earned_at": cb.earned_at
        }
        for cb in child_badges
    ]