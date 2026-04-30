from database import SessionLocal, engine, Base
from models import Unit, Lesson, Exercise

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(Unit).count() == 0:
    unit1 = Unit(title="Уровень 1: Знакомство с буквами", order=1)
    db.add(unit1)
    db.flush() 

    lesson1 = Lesson(title="Буква А", order=1, xp_reward=20, unit_id=unit1.id)
    db.add(lesson1)
    db.flush()

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
    print("База успешно наполнена контентом!")

db.close()