from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
# ✅ Все импорты моделей в одном месте
from models import Unit, Lesson, Exercise, User, Progress
import schemas

router = APIRouter(prefix="/api/v1", tags=["Admin & Curriculum"])


# ─── UNITS CRUD ───────────────────────────────────────────────────────────────

@router.get("/units", response_model=List[schemas.UnitResponse])
def get_units(db: Session = Depends(get_db)):
    return db.query(Unit).order_by(Unit.order).all()


@router.post("/units", response_model=schemas.UnitResponse)
def create_unit(unit_data: schemas.UnitCreate, db: Session = Depends(get_db)):
    db_unit = Unit(**unit_data.model_dump())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit


@router.get("/units/{id}", response_model=schemas.UnitResponse)
def get_unit_by_id(id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    return unit


@router.put("/units/{id}", response_model=schemas.UnitResponse)
def update_unit(id: int, unit_data: schemas.UnitUpdate, db: Session = Depends(get_db)):
    db_unit = db.query(Unit).filter(Unit.id == id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    for key, value in unit_data.model_dump(exclude_unset=True).items():
        setattr(db_unit, key, value)
    db.commit()
    db.refresh(db_unit)
    return db_unit


@router.delete("/units/{id}")
def delete_unit(id: int, db: Session = Depends(get_db)):
    db_unit = db.query(Unit).filter(Unit.id == id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    db.delete(db_unit)
    db.commit()
    return {"message": f"Раздел {id} удален"}


# ─── LESSONS CRUD ─────────────────────────────────────────────────────────────

@router.get("/lessons", response_model=List[schemas.LessonResponse])
def get_lessons(unit_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Lesson)
    if unit_id:
        query = query.filter(Lesson.unit_id == unit_id)
    return query.order_by(Lesson.order).all()


@router.post("/lessons", response_model=schemas.LessonResponse)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db)):
    db_lesson = Lesson(**lesson.model_dump())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson


@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    db.delete(db_lesson)
    db.commit()
    return {"message": "Урок удален"}


# ─── EXERCISES CRUD ───────────────────────────────────────────────────────────

@router.get("/lessons/{lesson_id}/exercises", response_model=List[schemas.ExerciseResponse])
def get_exercises_by_lesson(lesson_id: int, db: Session = Depends(get_db)):
    return db.query(Exercise).filter(Exercise.lesson_id == lesson_id).all()


@router.post("/exercises", response_model=schemas.ExerciseResponse)
def create_exercise(ex_data: schemas.ExerciseCreate, db: Session = Depends(get_db)):
    db_ex = Exercise(**ex_data.model_dump())
    db.add(db_ex)
    db.commit()
    db.refresh(db_ex)
    return db_ex


@router.delete("/exercises/{ex_id}")
def delete_exercise(ex_id: int, db: Session = Depends(get_db)):
    db_ex = db.query(Exercise).filter(Exercise.id == ex_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    db.delete(db_ex)
    db.commit()
    return {"message": "Задание удалено"}


# ─── ADMIN STATS ──────────────────────────────────────────────────────────────

@router.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_lessons = db.query(Progress).count()
    return {
        "total_users": total_users,
        "total_lessons_played": total_lessons,
        "total_badges": 0,
        "active_today": 0,
    }


# ─── ADMIN USERS ──────────────────────────────────────────────────────────────

@router.get("/admin/users")
def get_users(
    page: int = 1,
    limit: int = 10,
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "items": [
            {"id": u.id, "email": u.email, "role": u.role}
            for u in users
        ]
    }


# ─── ADMIN LOGS ───────────────────────────────────────────────────────────────

@router.get("/admin/logs")
def get_logs(page: int = 1, limit: int = 20):
    # Заглушка — в продакшене заменить на реальную таблицу логов
    return {"logs": [], "total": 0}