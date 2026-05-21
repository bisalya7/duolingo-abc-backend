import json
from database import SessionLocal, engine
from models import Base, Unit, Lesson, Exercise, Badge

def seed_database():
    db = SessionLocal()
    
    try:
        if db.query(Badge).first():
            print("База данных уже содержит данные. Пропускаем наполнение.")
            return

        print("Начинаем наполнение базы данных...")

        badges = [
            Badge(name="Первооткрыватель", description="Получи 1 уровень!", icon_url="🌟"),
            Badge(name="Умник",            description="Достигни 5 уровня",    icon_url="🧠"),
            Badge(name="Огонек",           description="Занимайся 3 дня подряд", icon_url="🔥"),
            Badge(name="Марафонец",        description="Занимайся 7 дней подряд", icon_url="⚡"),
        ]
        db.add_all(badges)
        db.commit()
        print("✅ Бейджи добавлены")

        unit1 = Unit(title="Алфавит: А, О, У", order=1)
        unit2 = Unit(title="Первые слоги",     order=2)
        db.add_all([unit1, unit2])
        db.commit()
        print("✅ Юниты добавлены")

        lesson1 = Lesson(unit_id=unit1.id, title="Буква А", order=1, xp_reward=10)
        lesson2 = Lesson(unit_id=unit1.id, title="Буква О", order=2, xp_reward=10)
        lesson3 = Lesson(unit_id=unit2.id, title="Слоги МА и ПА", order=1, xp_reward=10)
        db.add_all([lesson1, lesson2, lesson3])
        db.commit()
        print("✅ Уроки добавлены")

        exercises = [
            Exercise(lesson_id=lesson1.id, type="match", content=json.dumps({
                "question": "Найди букву А",
                "options": ["Б", "А", "В"],
                "correct_answer": "А"
            })),

            Exercise(lesson_id=lesson1.id, type="listen", content=json.dumps({
                "text": "Послушай и нажми на правильную букву",
                "audio_url": "/sounds/a.mp3",
                "options": ["О", "У", "А"],
                "correct_answer": "А"
            })),
            Exercise(lesson_id=lesson1.id, type="select_image", content=json.dumps({
                "question": "Что начинается на звук «А»?",
                "options": [
                    {"icon": "🍉", "word": "Арбуз"},
                    {"icon": "🍌", "word": "Банан"},
                    {"icon": "🐱", "word": "Кот"}
                ],
                "correct_answer": "Арбуз"
            })),
            Exercise(lesson_id=lesson2.id, type="match", content=json.dumps({
                "question": "Найди букву О",
                "options": ["А", "О", "У"],
                "correct_answer": "О"
            })),

            Exercise(lesson_id=lesson2.id, type="listen", content=json.dumps({
                "text": "Какой звук ты слышишь?",
                "audio_url": "/sounds/o.mp3",
                "options": ["А", "И", "О"],
                "correct_answer": "О"
            })),

            Exercise(lesson_id=lesson2.id, type="select_image", content=json.dumps({
                "question": "Где спряталась буква О?",
                "options": [
                    {"icon": "☁️", "word": "Облако"},
                    {"icon": "☀️", "word": "Солнце"},
                    {"icon": "🌲", "word": "Дерево"}
                ],
                "correct_answer": "Облако"
            })),
            Exercise(lesson_id=lesson3.id, type="match", content=json.dumps({
                "question": "Где написан слог МА?",
                "options": ["ПА", "БА", "МА"],
                "correct_answer": "МА"
            })),

            Exercise(lesson_id=lesson3.id, type="build_word", content=json.dumps({
                "question": "Собери слово МАМА",
                "options": ["МА", "ПА", "БА", "МА"],
                "correct_answer": "МАМА"
            })),

            Exercise(lesson_id=lesson3.id, type="select_image", content=json.dumps({
                "question": "Кто это?",
                "options": [
                    {"icon": "👩", "word": "МАМА"},
                    {"icon": "👨", "word": "ПАПА"},
                    {"icon": "👵", "word": "БАБА"}
                ],
                "correct_answer": "ПАПА"
            })),
            Exercise(
    lesson_id=lesson1.id,
    type="handwriting",
    content=json.dumps({
        "question": "Обведи букву А",
        "letter": "А",
        "guide_color": "#e5e5e5",
        "trace_color": "#1cb0f6"
    }),
    answer="А"
),
Exercise(
    lesson_id=lesson2.id,
    type="handwriting",
    content=json.dumps({
        "question": "Обведи букву О",
        "letter": "О",
        "guide_color": "#e5e5e5",
        "trace_color": "#58cc02"
    }),
    answer="О"
),
        ]

        db.add_all(exercises)
        db.commit()
        print(f"✅ Добавлено {len(exercises)} упражнений!")
        print("🎉 База данных успешно наполнена стартовым контентом!")

    except Exception as e:
        print(f"❌ Ошибка при наполнении базы: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()