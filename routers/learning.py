from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import learning_service
from schemas import ProgressCreate, LessonResponse
from models import Lesson, Unit
from schemas import LeaderboardEntry
from models import Child
from socket_manager import manager
router = APIRouter(prefix="/api/v1/learning", tags=["Learning"])

# ==========================================
# ТВОЙ РАБОЧИЙ КОД (С небольшими правками путей под ТЗ)
# ==========================================

# ОБНОВЛЕННЫЙ ЭНДПОИНТ (замени старый finish_lesson на этот):

@router.post("/lessons/{lesson_id}/complete")
async def finish_lesson(lesson_id: int, data: ProgressCreate, db: Session = Depends(get_db)):
    # Для теста фиксируем child_id = 1
    result = learning_service.complete_lesson(db, 1, lesson_id, data.score)
    
    if not result:
        raise HTTPException(status_code=404, detail="Error completing lesson")
        
    child = result["child"]
    new_badges = result["new_badges"]
    
    # 🌟 ВОТ ОНА — РЕАЛ-ТАЙМ МАГИЯ! 🌟
    # Если ребенок получил новые награды, стреляем по WebSockets родителю
    if new_badges:
        ws_message = f"Ура! Ваш ребенок {child.name} получил награды: {', '.join(new_badges)}"
        await manager.send_personal_message(ws_message, child.parent_id)

    return {
        "message": "Урок успешно пройден!",
        "current_xp": child.total_xp,
        "level": child.level,
        "streak": child.daily_streak,
        "new_badges": new_badges
    }
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

# Путь изменен под таблицу ТЗ: /lessons/{id}/complete
# ОБНОВЛЕННЫЙ ЭНДПОИНТ (замени старый finish_lesson на этот):

@router.post("/lessons/{lesson_id}/complete")
async def finish_lesson(lesson_id: int, data: ProgressCreate, db: Session = Depends(get_db)):
    # Для теста фиксируем child_id = 1
    result = learning_service.complete_lesson(db, 1, lesson_id, data.score)
    
    if not result:
        raise HTTPException(status_code=404, detail="Error completing lesson")
        
    child = result["child"]
    new_badges = result["new_badges"]
    
    # 🌟 ВОТ ОНА — РЕАЛ-ТАЙМ МАГИЯ! 🌟
    # Если ребенок получил новые награды, стреляем по WebSockets родителю
    if new_badges:
        ws_message = f"Ура! Ваш ребенок {child.name} получил награды: {', '.join(new_badges)}"
        await manager.send_personal_message(ws_message, child.parent_id)

    return {
        "message": "Урок успешно пройден!",
        "current_xp": child.total_xp,
        "level": child.level,
        "streak": child.daily_streak,
        "new_badges": new_badges
    }
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
# Не забудь добавить этот импорт в начало файла learning.py:


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(age_group: str = "all", db: Session = Depends(get_db)):
    """Таблица лидеров по XP (с фильтром по возрастной группе)"""
    
    # Берем всех детей из базы и сортируем по XP (от большего к меньшему)
    query = db.query(Child).order_by(Child.total_xp.desc())
    
    # Фильтрация по ТЗ
    if age_group == "3-5":
        query = query.filter(Child.age >= 3, Child.age <= 5)
    elif age_group == "6-8":
        query = query.filter(Child.age >= 6, Child.age <= 8)
        
    # Берем топ-10
    top_children = query.limit(10).all()
    
    # Формируем красивый ответ с местами (rank)
    leaderboard = []
    for rank, child in enumerate(top_children, start=1):
        leaderboard.append({
            "rank": rank,
            "child_name": child.name,
            "total_xp": child.total_xp,
            "level": child.level
        })
        
    return leaderboard