from sqlalchemy.orm import Session
from models import Child, Lesson, Progress, Badge, ChildBadge, Notification
from datetime import date, timedelta
import logging

logger = logging.getLogger(__name__)


def complete_lesson(db: Session, child_id: int, lesson_id: int, score: int):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None

    # ФИКС: не записывать повторно уже пройденный урок
    existing = db.query(Progress).filter(
        Progress.child_id == child_id,
        Progress.lesson_id == lesson_id
    ).first()
    if existing:
        # Обновить score если новый результат лучше, но XP не начислять
        if score > existing.score:
            existing.score = score
            db.commit()
        child = db.query(Child).filter(Child.id == child_id).first()
        return {"child": child, "new_badges": []}

    try:
        new_progress = Progress(child_id=child_id, lesson_id=lesson_id, score=score)
        db.add(new_progress)
        # ... остальной код без изменений

        child = db.query(Child).filter(Child.id == child_id).first()
        new_badges_awarded = []

        if child:
            child.total_xp += lesson.xp_reward
            # ЕДИНАЯ ФОРМУЛА: 100 XP = 1 уровень
            child.level = (child.total_xp // 100) + 1

            today = date.today()
            if child.last_active_date == today - timedelta(days=1):
                child.daily_streak += 1
            elif child.last_active_date != today:
                child.daily_streak = 1
            
            child.last_active_date = today

            # Бейдж "Первый урок"
            first_lesson_badge = db.query(Badge).filter(Badge.name == "Первый урок").first()
            if first_lesson_badge:
                has_badge = db.query(ChildBadge).filter(
                    ChildBadge.child_id == child_id, 
                    ChildBadge.badge_id == first_lesson_badge.id
                ).first()
                if not has_badge:
                    db.add(ChildBadge(child_id=child_id, badge_id=first_lesson_badge.id))
                    new_badges_awarded.append(first_lesson_badge.name)

            # Бейдж "100 XP"
            if child.total_xp >= 100:
                xp_badge = db.query(Badge).filter(Badge.name == "100 XP").first()
                if xp_badge:
                    has_badge = db.query(ChildBadge).filter(
                        ChildBadge.child_id == child_id, 
                        ChildBadge.badge_id == xp_badge.id
                    ).first()
                    if not has_badge:
                        db.add(ChildBadge(child_id=child_id, badge_id=xp_badge.id))
                        new_badges_awarded.append(xp_badge.name)

            # Уведомление родителю
            if new_badges_awarded:
                msg = f"Ваш ребенок {child.name} получил новые награды: {', '.join(new_badges_awarded)}!"
                db.add(Notification(user_id=child.parent_id, message=msg))

            db.commit()
            db.refresh(child)
            logger.info(f"Lesson completed: child_id={child_id}, lesson_id={lesson_id}, xp={child.total_xp}")

            return {
                "child": child,
                "new_badges": new_badges_awarded
            }
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Complete lesson error: {e}")
        raise