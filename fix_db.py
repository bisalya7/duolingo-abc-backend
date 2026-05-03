from database import engine
from sqlalchemy import text

print("Пробуем обновить таблицу children...")

with engine.begin() as conn:
    # 1. Принудительно добавляем колонку daily_streak
    try:
        conn.execute(text('ALTER TABLE children ADD COLUMN daily_streak INTEGER DEFAULT 0;'))
        print("✅ Колонка daily_streak успешно добавлена!")
    except Exception as e:
        print("⚠️ Колонка daily_streak уже существует или произошла ошибка.")

    # 2. Принудительно добавляем колонку last_active_date
    try:
        conn.execute(text('ALTER TABLE children ADD COLUMN last_active_date DATE;'))
        print("✅ Колонка last_active_date успешно добавлена!")
    except Exception as e:
        print("⚠️ Колонка last_active_date уже существует или произошла ошибка.")

print("Готово! Можно запускать сервер.")