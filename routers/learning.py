from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import learning_service
from schemas import ProgressCreate, LeaderboardEntry
from models import Lesson, Child, User
from routers.auth import get_current_user
from socket_manager import manager

router = APIRouter(prefix="/api/v1/learning", tags=["Learning"])


@router.post("/lessons/{lesson_id}/complete")
async def finish_lesson(
    lesson_id: int,
    data: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    child = db.query(Child).filter(
        Child.id == data.child_id,
        Child.parent_id == current_user.id
    ).first()

    if not child:
        raise HTTPException(status_code=404, detail="Ребенок не найден")

    result = learning_service.complete_lesson(
        db, data.child_id, lesson_id, data.score
    )

    if not result:
        raise HTTPException(status_code=404, detail="Урок не найден")

    child = result["child"]
    new_badges = result["new_badges"]

    if new_badges:
        ws_message = (
            f"Ура! Ваш ребенок {child.name} получил "
            f"награды: {', '.join(new_badges)}"
        )
        await manager.send_personal_message(ws_message, child.parent_id)

    return {
        "message": "Урок успешно пройден!",
        "current_xp": child.total_xp,
        "level": child.level,
        "streak": child.daily_streak,
        "new_badges": new_badges
    }


@router.get("/lessons")
def get_all_lessons(
    unit_id: int = None,
    status: str = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Список уроков с фильтрацией и пагинацией"""
    query = db.query(Lesson)
    if unit_id:
        query = query.filter(Lesson.unit_id == unit_id)

    total = query.count()
    lessons = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "items": [
            {
                "id": l.id,
                "title": l.title,
                "order": l.order,
                "xp_reward": l.xp_reward,
                "unit_id": l.unit_id
            }
            for l in lessons
        ]
    }


@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    return lesson


@router.post("/lessons")
def create_lesson(lesson_data: dict, db: Session = Depends(get_db)):
    return {"message": "Урок создан"}


@router.put("/lessons/{lesson_id}")
def update_lesson(lesson_id: int, lesson_data: dict, db: Session = Depends(get_db)):
    return {"message": "Урок обновлен"}


@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    return {"message": "Урок удален"}


@router.get("/lessons/{lesson_id}/exercises")
def get_exercises_for_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    return lesson.exercises


@router.post("/lessons/{lesson_id}/exercises")
def create_exercise(lesson_id: int, exercise_data: dict, db: Session = Depends(get_db)):
    return {"message": "Задание добавлено"}


@router.put("/exercises/{exercise_id}")
def update_exercise(exercise_id: int, exercise_data: dict, db: Session = Depends(get_db)):
    return {"message": "Задание обновлено"}


@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    return {"message": "Задание удалено"}


@router.post("/exercises/{exercise_id}/submit")
def submit_exercise(exercise_id: int, answer_data: dict, db: Session = Depends(get_db)):
    return {"correct": True, "time_spent": "12s"}


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(age_group: str = "all", db: Session = Depends(get_db)):
    """Таблица лидеров по XP с фильтром по возрастной группе"""
    query = db.query(Child).order_by(Child.total_xp.desc())

    if age_group == "3-5":
        query = query.filter(Child.age >= 3, Child.age <= 5)
    elif age_group == "6-8":
        query = query.filter(Child.age >= 6, Child.age <= 8)

    top_children = query.limit(10).all()

    return [
        {
            "rank": rank,
            "child_name": child.name,
            "total_xp": child.total_xp,
            "level": child.level
        }
        for rank, child in enumerate(top_children, start=1)
    ]