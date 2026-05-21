from database import engine
from models import Base

print("Удаляем старые таблицы...")
Base.metadata.drop_all(bind=engine)

print("Создаем новые таблицы (со всеми нужными колонками)...")
Base.metadata.create_all(bind=engine)

print("База данных успешно обновлена!")