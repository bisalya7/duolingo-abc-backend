from sqlalchemy.orm import Session
from models import Child, Lesson, Progress

def complete_lesson(db: Session, child_id: int, lesson_id: int, score: int):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None

    new_progress = Progress(child_id=child_id, lesson_id=lesson_id, score=score)
    db.add(new_progress)

    child = db.query(Child).filter(Child.id == child_id).first()
    if child:
        child.total_xp += lesson.xp_reward
        child.level = (child.total_xp // 100) + 1
        db.commit()
        db.refresh(child)
        return child
    return None