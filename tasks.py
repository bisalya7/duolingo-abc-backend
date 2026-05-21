from celery_app import celery_app
from database import SessionLocal
from models import Child, Notification
from datetime import date, timedelta
from sqlalchemy.orm import Session


@celery_app.task
def check_expired_streaks():
    """
    Сбрасывает streak у детей, которые не были активны вчера.
    Запускается ежедневно в 00:00 UTC.
    """
    db: Session = SessionLocal()
    try:
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Находим детей с активным стриком, но last_active_date < вчера
        # (то есть пропустили вчерашний день)
        expired_children = db.query(Child).filter(
            Child.daily_streak > 0,
            Child.last_active_date < yesterday
        ).all()

        reset_count = 0
        for child in expired_children:
            # Уведомляем родителя о сгорании стрика ДО обнуления
            if child.daily_streak >= 3:  # Только если стрик был значимый
                msg = f"🔥 Стрик {child.name} сгорел! Ребёнок не занимался вчера."
                db.add(Notification(user_id=child.parent_id, message=msg))

            child.daily_streak = 0
            reset_count += 1

        db.commit()
        return {
            "checked_date": str(today),
            "reset_count": reset_count,
            "message": f"Сброшено стриков: {reset_count}"
        }

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


@celery_app.task
def send_weekly_progress():
    """
    Отправляет родителям еженедельную сводку прогресса.
    Запускается по воскресеньям.
    """
    db: Session = SessionLocal()
    try:
        from datetime import datetime, timedelta

        week_ago = datetime.utcnow() - timedelta(days=7)

        # Группируем прогресс по детям
        from models import Progress, User

        children = db.query(Child).all()
        sent_count = 0

        for child in children:
            lessons_this_week = db.query(Progress).filter(
                Progress.child_id == child.id,
                Progress.completed_at >= week_ago
            ).count()

            if lessons_this_week > 0:
                msg = (
                    f"📊 Еженедельный отчёт: {child.name} прошёл "
                    f"{lessons_this_week} уроков на этой неделе! "
                    f"Всего XP: {child.total_xp}"
                )
                db.add(Notification(user_id=child.parent_id, message=msg))
                sent_count += 1

        db.commit()
        return {
            "sent_count": sent_count,
            "message": f"Отправлено сводок: {sent_count}"
        }

    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()