from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import learning_service
from schemas import ProgressCreate, LessonResponse
from models import Lesson, Unit

router = APIRouter(prefix="/api/v1/learning", tags=["Learning"])

# ==========================================
# ТВОЙ РАБОЧИЙ КОД (С небольшими правками путей под ТЗ)
# ==========================================

@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

# Путь изменен под таблицу ТЗ: /lessons/{id}/complete
@router.post("/lessons/{lesson_id}/complete")
def finish_lesson(lesson_id: int, data: ProgressCreate, db: Session = Depends(get_db)):
    # Для теста фиксируем child_id = 1
    result = learning_service.complete_lesson(db, 1, lesson_id, data.score)
    if not result:
        raise HTTPException(status_code=404, detail="Error completing lesson")
    return {"message": "Success", "current_xp": result.total_xp, "level": result.level}

# ==========================================
# НОВЫЕ ЭНДПОИНТЫ ИЗ ТЗ (Пока заглушки для Swagger)
# ==========================================

@router.get("/lessons")
def get_all_lessons(unit_id: int = None, status: str = None, db: Session = Depends(get_db)):
    """Получить список уроков (фильтрация по разделу и статусу)"""
    return [{"id": 1, "title": "Буква А", "unit_id": 1}]

@router.post("/lessons")
def create_lesson(lesson_data: dict, db: Session = Depends(get_db)):
    """Создать новый урок (Admin)"""
    return {"message": "Урок создан"}

@router.put("/lessons/{lesson_id}")
def update_lesson(lesson_id: int, lesson_data: dict, db: Session = Depends(get_db)):
    """Изменить урок (Admin)"""
    return {"message": "Урок обновлен"}

@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Удалить урок (Admin)"""
    return {"message": "Урок удален"}

# --- УПРАЖНЕНИЯ (Exercises) ---

@router.get("/lessons/{lesson_id}/exercises")
def get_exercises_for_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Получить все задания внутри урока"""
    return [{"id": 1, "type": "phonics", "question": "Найди звук А"}]

@router.post("/lessons/{lesson_id}/exercises")
def create_exercise(lesson_id: int, exercise_data: dict, db: Session = Depends(get_db)):
    """Добавить задание в урок (Admin)"""
    return {"message": "Задание добавлено"}

@router.put("/exercises/{exercise_id}")
def update_exercise(exercise_id: int, exercise_data: dict, db: Session = Depends(get_db)):
    """Изменить задание (Admin)"""
    return {"message": "Задание обновлено"}

@router.delete("/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """Удалить задание (Admin)"""
    return {"message": "Задание удалено"}

@router.post("/exercises/{exercise_id}/submit")
def submit_exercise(exercise_id: int, answer_data: dict, db: Session = Depends(get_db)):
    """Отправка ответа на конкретное упражнение (проверка правильности и времени)"""
    return {"correct": True, "time_spent": "12s"}

# --- ЛИДЕРБОРД ---

@router.get("/leaderboard")
def get_leaderboard(age_group: str = "all", db: Session = Depends(get_db)):
    """Таблица лидеров по XP (с фильтром по возрастной группе)"""
    return [{"rank": 1, "child_name": "Аня", "xp": 1500, "age": 5}]