from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import learning_service
from schemas import ProgressCreate, LessonResponse
from models import Lesson, Unit

router = APIRouter(prefix="/api/v1/learning", tags=["Learning"])

@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/complete")
def finish_lesson(data: ProgressCreate, db: Session = Depends(get_db)):
    # Для теста фиксируем child_id = 1
    result = learning_service.complete_lesson(db, 1, data.lesson_id, data.score)
    if not result:
        raise HTTPException(status_code=404, detail="Error completing lesson")
    return {"message": "Success", "current_xp": result.total_xp, "level": result.level}