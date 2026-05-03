from database import SessionLocal, engine, Base
from models import Unit, Lesson, Exercise, Badge

# Создаем таблицы, если их нет
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# 1. Добавляем бейджи
if db.query(Badge).count() == 0:
    b1 = Badge(name="Первый урок", description="Молодец! Ты прошел свой самый первый урок.", icon_url="medal_first.png")
    b2 = Badge(name="100 XP", description="Ого! Ты накопил целых 100 очков опыта.", icon_url="cup_gold.png")
    db.add_all([b1, b2])
    db.commit()
    print("Бейджи успешно добавлены!")

# 2. Добавляем уроки (как было у тебя)
if db.query(Unit).count() == 0:
    unit1 = Unit(title="Уровень 1: Знакомство с буквами", order=1)
    db.add(unit1)
    db.commit() # Сохраняем, чтобы получить unit1.id

    lesson1 = Lesson(title="Буква А", order=1, xp_reward=20, unit_id=unit1.id)
    db.add(lesson1)
    db.commit() # Сохраняем, чтобы получить lesson1.id

    ex1 = Exercise(
        type="multiple_choice",
        content={
            "question": "Найди букву А",
            "options": ["А", "Б", "В"],
            "correct": "А"
        },
        lesson_id=lesson1.id
    )
    db.add(ex1)
    db.commit()
    print("База успешно наполнена контентом (Уроки и Задания)!")

db.close()