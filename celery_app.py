from celery import Celery
from celery.schedules import crontab
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "duolingo_abc",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["tasks"],
)

celery_app.conf.update(
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "check-streaks-daily": {
            "task": "tasks.check_expired_streaks",
            "schedule": crontab(hour=0, minute=0),
        },
        "send-weekly-progress": {
            "task": "tasks.send_weekly_progress",
            "schedule": crontab(hour=10, minute=0, day_of_week=0),  # Воскресенье 10:00 UTC
        },
    },
)

if __name__ == "__main__":
    celery_app.start()