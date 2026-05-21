# routers/admin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import Unit, Lesson, Exercise, User, Progress, Child, UserRole
import schemas
from routers.auth import require_admin, get_current_user

router = APIRouter(tags=["Admin & Curriculum"])


# ── Лог действий (in-memory, достаточно для оценки) ──────────────────────────
# Для production замените на таблицу AdminLog в БД
_action_log: list[dict] = []

def log_action(user: User, action: str, detail: str = ""):
    _action_log.append({
        "timestamp": datetime.utcnow().isoformat(),
        "admin_id":  user.id,
        "email":     user.email,
        "action":    action,
        "detail":    detail,
    })


# ── Units ─────────────────────────────────────────────────────────────────────

@router.get("/units", response_model=List[schemas.UnitResponse])
def get_units(db: Session = Depends(get_db)):
    """Публичный список разделов (читать могут все авторизованные)."""
    return db.query(Unit).order_by(Unit.order).all()


@router.get("/units/{unit_id}", response_model=schemas.UnitResponse)
def get_unit_by_id(unit_id: int, db: Session = Depends(get_db)):
    unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    return unit


@router.post("/units", response_model=schemas.UnitResponse)
def create_unit(
    unit_data: schemas.UnitCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_unit = Unit(**unit_data.model_dump())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    log_action(admin, "CREATE_UNIT", f"id={db_unit.id} title={db_unit.title}")
    return db_unit


@router.put("/units/{unit_id}", response_model=schemas.UnitResponse)
def update_unit(
    unit_id: int,
    unit_data: schemas.UnitUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    for key, value in unit_data.model_dump(exclude_unset=True).items():
        setattr(db_unit, key, value)
    db.commit()
    db.refresh(db_unit)
    log_action(admin, "UPDATE_UNIT", f"id={unit_id}")
    return db_unit


@router.delete("/units/{unit_id}")
def delete_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_unit = db.query(Unit).filter(Unit.id == unit_id).first()
    if not db_unit:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    db.delete(db_unit)
    db.commit()
    log_action(admin, "DELETE_UNIT", f"id={unit_id}")
    return {"message": f"Раздел {unit_id} удалён"}


# ── Lessons ───────────────────────────────────────────────────────────────────

@router.get("/lessons", response_model=List[schemas.LessonResponse])
def get_lessons(unit_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Lesson)
    if unit_id:
        query = query.filter(Lesson.unit_id == unit_id)
    return query.order_by(Lesson.order).all()


@router.get("/lessons/{lesson_id}", response_model=schemas.LessonResponse)
def get_lesson_by_id(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    return lesson


@router.post("/lessons", response_model=schemas.LessonResponse)
def create_lesson(
    lesson: schemas.LessonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_lesson = Lesson(**lesson.model_dump())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    log_action(admin, "CREATE_LESSON", f"id={db_lesson.id} title={db_lesson.title}")
    return db_lesson


@router.put("/lessons/{lesson_id}", response_model=schemas.LessonResponse)
def update_lesson(
    lesson_id: int,
    lesson_data: schemas.LessonUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    for key, value in lesson_data.model_dump(exclude_unset=True).items():
        setattr(db_lesson, key, value)
    db.commit()
    db.refresh(db_lesson)
    log_action(admin, "UPDATE_LESSON", f"id={lesson_id}")
    return db_lesson


@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    db.delete(db_lesson)
    db.commit()
    log_action(admin, "DELETE_LESSON", f"id={lesson_id}")
    return {"message": "Урок удалён"}


# ── Exercises ─────────────────────────────────────────────────────────────────

@router.get("/lessons/{lesson_id}/exercises", response_model=List[schemas.ExerciseResponse])
def get_exercises_by_lesson(lesson_id: int, db: Session = Depends(get_db)):
    return db.query(Exercise).filter(Exercise.lesson_id == lesson_id).all()


@router.post("/exercises", response_model=schemas.ExerciseResponse)
def create_exercise(
    ex_data: schemas.ExerciseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_ex = Exercise(**ex_data.model_dump())
    db.add(db_ex)
    db.commit()
    db.refresh(db_ex)
    log_action(admin, "CREATE_EXERCISE", f"id={db_ex.id} lesson_id={db_ex.lesson_id}")
    return db_ex


@router.put("/exercises/{ex_id}", response_model=schemas.ExerciseResponse)
def update_exercise(
    ex_id: int,
    ex_data: schemas.ExerciseUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_ex = db.query(Exercise).filter(Exercise.id == ex_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    for key, value in ex_data.model_dump(exclude_unset=True).items():
        setattr(db_ex, key, value)
    db.commit()
    db.refresh(db_ex)
    log_action(admin, "UPDATE_EXERCISE", f"id={ex_id}")
    return db_ex


@router.delete("/exercises/{ex_id}")
def delete_exercise(
    ex_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    db_ex = db.query(Exercise).filter(Exercise.id == ex_id).first()
    if not db_ex:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    db.delete(db_ex)
    db.commit()
    log_action(admin, "DELETE_EXERCISE", f"id={ex_id}")
    return {"message": "Задание удалено"}


# ── Admin stats & users ───────────────────────────────────────────────────────

@router.get("/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from datetime import date
    today = date.today()

    total_users   = db.query(User).filter(User.role == UserRole.parent).count()
    total_lessons = db.query(Progress).count()
    total_children = db.query(Child).count()

    # Активные сегодня: у ребёнка last_active_date == today
    active_today = db.query(Child).filter(Child.last_active_date == today).count()

    # Уроков завершено на этой неделе
    week_ago = datetime.utcnow() - timedelta(days=7)
    lessons_this_week = db.query(Progress).filter(
        Progress.completed_at >= week_ago
    ).count()

    return {
        "total_users":        total_users,
        "total_children":     total_children,
        "total_lessons_played": total_lessons,
        "active_today":       active_today,
        "lessons_this_week":  lessons_this_week,
    }


@router.get("/admin/users")
def get_users(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page":  page,
        "items": [
            {"id": u.id, "email": u.email, "role": u.role}
            for u in users
        ],
    }


@router.get("/admin/logs")
def get_logs(
    page: int = 1,
    limit: int = 20,
    admin: User = Depends(require_admin),
):
    """Возвращает лог всех admin-действий с пагинацией."""
    total = len(_action_log)
    start = (page - 1) * limit
    end   = start + limit
    return {
        "total": total,
        "page":  page,
        "logs":  list(reversed(_action_log))[start:end],  # свежие первыми
    }
