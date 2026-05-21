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

        # ── Бейджи ────────────────────────────────────────────────────────────
        badges = [
            Badge(name="Первооткрыватель", description="Получи 1 уровень!", icon_url="🌟"),
            Badge(name="Умник",            description="Достигни 5 уровня",     icon_url="🧠"),
            Badge(name="Огонек",           description="Занимайся 3 дня подряд", icon_url="🔥"),
            Badge(name="Марафонец",        description="Занимайся 7 дней подряд", icon_url="⚡"),
            Badge(name="Первый урок",      description="Пройди первый урок",     icon_url="📚"),
            Badge(name="100 XP",           description="Набери 100 очков",       icon_url="💯"),
        ]
        db.add_all(badges)
        db.commit()
        print("✅ Бейджи добавлены")

        # ── Разделы ───────────────────────────────────────────────────────────
        unit1 = Unit(title="Раздел 1: Алфавит — А, О, У", order=1)
        unit2 = Unit(title="Раздел 2: Первые слоги",       order=2)
        unit3 = Unit(title="Раздел 3: Первые слова",        order=3)
        db.add_all([unit1, unit2, unit3])
        db.commit()
        print("✅ Разделы добавлены")

        # ── Уроки ─────────────────────────────────────────────────────────────
        # Раздел 1
        lesson1 = Lesson(unit_id=unit1.id, title="Буква А", order=1, xp_reward=10)
        lesson2 = Lesson(unit_id=unit1.id, title="Буква О", order=2, xp_reward=10)
        lesson3 = Lesson(unit_id=unit1.id, title="Буква У", order=3, xp_reward=10)
        # Раздел 2
        lesson4 = Lesson(unit_id=unit2.id, title="Слоги МА и ПА", order=1, xp_reward=10)
        lesson5 = Lesson(unit_id=unit2.id, title="Слоги МУ и БУ", order=2, xp_reward=10)
        # Раздел 3
        lesson6 = Lesson(unit_id=unit3.id, title="Животные", order=1, xp_reward=15)
        lesson7 = Lesson(unit_id=unit3.id, title="Еда",      order=2, xp_reward=15)
        db.add_all([lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7])
        db.commit()
        print("✅ Уроки добавлены")

        # ── Упражнения ────────────────────────────────────────────────────────
        # Каждый урок содержит все 5 типов:
        #   match, listen, select_image, build_word, handwriting

        exercises = [

            # ══════════════════════════════════════════════════════════════════
            # УРОК 1 — Буква А
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson1.id, type="match",
                answer="А",
                content=json.dumps({
                    "question": "Найди букву А",
                    "options": ["Б", "А", "В", "О"]
                })),
            Exercise(lesson_id=lesson1.id, type="listen",
                answer="А",
                content=json.dumps({
                    "text": "Послушай и нажми на правильную букву",
                    "audio_url": "/sounds/a.mp3",
                    "options": ["О", "У", "А"]
                })),
            Exercise(lesson_id=lesson1.id, type="select_image",
                answer="Арбуз",
                content=json.dumps({
                    "question": "Что начинается на звук «А»?",
                    "options": [
                        {"icon": "🍉", "word": "Арбуз"},
                        {"icon": "🍌", "word": "Банан"},
                        {"icon": "🐱", "word": "Кот"}
                    ]
                })),
            Exercise(lesson_id=lesson1.id, type="build_word",
                answer="АУ",
                content=json.dumps({
                    "question": "Собери крик в лесу: АУ",
                    "options": ["У", "М", "А", "О"]
                })),
            Exercise(lesson_id=lesson1.id, type="handwriting",
                answer="А",
                content=json.dumps({
                    "question": "Обведи букву А",
                    "letter": "А",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#1cb0f6"
                })),

            # ══════════════════════════════════════════════════════════════════
            # УРОК 2 — Буква О
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson2.id, type="match",
                answer="О",
                content=json.dumps({
                    "question": "Найди букву О",
                    "options": ["А", "О", "У", "М"]
                })),
            Exercise(lesson_id=lesson2.id, type="listen",
                answer="О",
                content=json.dumps({
                    "text": "Какой звук ты слышишь?",
                    "audio_url": "/sounds/o.mp3",
                    "options": ["А", "У", "О"]
                })),
            Exercise(lesson_id=lesson2.id, type="select_image",
                answer="Облако",
                content=json.dumps({
                    "question": "Что начинается на звук «О»?",
                    "options": [
                        {"icon": "☁️", "word": "Облако"},
                        {"icon": "☀️", "word": "Солнце"},
                        {"icon": "🌲", "word": "Дерево"}
                    ]
                })),
            Exercise(lesson_id=lesson2.id, type="build_word",
                answer="ОСА",
                content=json.dumps({
                    "question": "Собери слово ОСА",
                    "options": ["О", "С", "А", "У", "М"]
                })),
            Exercise(lesson_id=lesson2.id, type="handwriting",
                answer="О",
                content=json.dumps({
                    "question": "Обведи букву О",
                    "letter": "О",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#58cc02"
                })),

            # ══════════════════════════════════════════════════════════════════
            # УРОК 3 — Буква У
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson3.id, type="match",
                answer="У",
                content=json.dumps({
                    "question": "Какая буква говорит «У-у-у»?",
                    "options": ["А", "О", "У", "Б"]
                })),
            Exercise(lesson_id=lesson3.id, type="listen",
                answer="У",
                content=json.dumps({
                    "text": "Послушай гудок поезда и найди букву",
                    "audio_url": "/sounds/u.mp3",
                    "options": ["О", "У", "А"]
                })),
            Exercise(lesson_id=lesson3.id, type="select_image",
                answer="Утка",
                content=json.dumps({
                    "question": "Что начинается на букву У?",
                    "options": [
                        {"icon": "🦆", "word": "Утка"},
                        {"icon": "🍎", "word": "Яблоко"},
                        {"icon": "🐶", "word": "Собака"}
                    ]
                })),
            Exercise(lesson_id=lesson3.id, type="build_word",
                answer="УМ",
                content=json.dumps({
                    "question": "Собери слово УМ",
                    "options": ["У", "М", "А", "О"]
                })),
            Exercise(lesson_id=lesson3.id, type="handwriting",
                answer="У",
                content=json.dumps({
                    "question": "Напиши букву У",
                    "letter": "У",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#ff9600"
                })),

            # ══════════════════════════════════════════════════════════════════
            # УРОК 4 — Слоги МА и ПА
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson4.id, type="match",
                answer="МА",
                content=json.dumps({
                    "question": "Где написан слог МА?",
                    "options": ["ПА", "БА", "МА", "ДА"]
                })),
            Exercise(lesson_id=lesson4.id, type="listen",
                answer="МА",
                content=json.dumps({
                    "text": "Послушай слог и найди его",
                    "audio_url": "/sounds/ma.mp3",
                    "options": ["ПА", "МА", "БА"]
                })),
            Exercise(lesson_id=lesson4.id, type="select_image",
                answer="МАМА",
                content=json.dumps({
                    "question": "МА + МА — это кто?",
                    "options": [
                        {"icon": "👩", "word": "МАМА"},
                        {"icon": "👨", "word": "ПАПА"},
                        {"icon": "👵", "word": "БАБА"}
                    ]
                })),
            Exercise(lesson_id=lesson4.id, type="build_word",
                answer="МАМА",
                content=json.dumps({
                    "question": "Собери слово МАМА",
                    "options": ["МА", "ПА", "МА", "БА"]
                })),
            Exercise(lesson_id=lesson4.id, type="handwriting",
                answer="МА",
                content=json.dumps({
                    "question": "Напиши слог МА",
                    "letter": "МА",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#ce82ff"
                })),

            # ══════════════════════════════════════════════════════════════════
            # УРОК 5 — Слоги МУ и БУ
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson5.id, type="match",
                answer="МУ",
                content=json.dumps({
                    "question": "Как говорит корова?",
                    "options": ["МА", "МУ", "МО", "МЕ"]
                })),
            Exercise(lesson_id=lesson5.id, type="listen",
                answer="БУ",
                content=json.dumps({
                    "text": "Послушай и найди слог",
                    "audio_url": "/sounds/bu.mp3",
                    "options": ["МУ", "БУ", "ДУ"]
                })),
            Exercise(lesson_id=lesson5.id, type="select_image",
                answer="Корова",
                content=json.dumps({
                    "question": "Кто говорит МУ?",
                    "options": [
                        {"icon": "🐄", "word": "Корова"},
                        {"icon": "🐑", "word": "Овечка"},
                        {"icon": "🐖", "word": "Свинка"}
                    ]
                })),
            Exercise(lesson_id=lesson5.id, type="build_word",
                answer="ГУБЫ",
                content=json.dumps({
                    "question": "Собери слово ГУБЫ",
                    "options": ["Г", "У", "Б", "Ы", "А", "М"]
                })),
            Exercise(lesson_id=lesson5.id, type="handwriting",
                answer="БУ",
                content=json.dumps({
                    "question": "Напиши слог БУ",
                    "letter": "БУ",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#1cb0f6"
                })),

            # ══════════════════════════════════════════════════════════════════
            # УРОК 6 — Животные
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson6.id, type="match",
                answer="КОТ",
                content=json.dumps({
                    "question": "Кто мяукает?",
                    "options": ["КОТ", "ПЕС", "ЖУК", "БЫК"]
                })),
            Exercise(lesson_id=lesson6.id, type="listen",
                answer="ЖУК",
                content=json.dumps({
                    "text": "Послушай жужжание — кто это?",
                    "audio_url": "/sounds/zhuk.mp3",
                    "options": ["КОТ", "ЖУК", "ПЕС"]
                })),
            Exercise(lesson_id=lesson6.id, type="select_image",
                answer="Кот",
                content=json.dumps({
                    "question": "Найди пушистого котика!",
                    "options": [
                        {"icon": "🐱", "word": "Кот"},
                        {"icon": "🐶", "word": "Пес"},
                        {"icon": "🐇", "word": "Заяц"},
                        {"icon": "🪲", "word": "Жук"}
                    ]
                })),
            Exercise(lesson_id=lesson6.id, type="build_word",
                answer="КОТ",
                content=json.dumps({
                    "question": "Собери слово КОТ",
                    "options": ["К", "О", "Т", "А", "У"]
                })),
            Exercise(lesson_id=lesson6.id, type="handwriting",
                answer="КОТ",
                content=json.dumps({
                    "question": "Напиши слово КОТ",
                    "letter": "КОТ",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#58cc02"
                })),

            # ══════════════════════════════════════════════════════════════════
            # УРОК 7 — Еда
            # ══════════════════════════════════════════════════════════════════
            Exercise(lesson_id=lesson7.id, type="match",
                answer="СОК",
                content=json.dumps({
                    "question": "Что пьют из стакана?",
                    "options": ["СУП", "СОК", "СЫР", "ЧАЙ"]
                })),
            Exercise(lesson_id=lesson7.id, type="listen",
                answer="СУП",
                content=json.dumps({
                    "text": "Что варят в кастрюле? Послушай!",
                    "audio_url": "/sounds/sup.mp3",
                    "options": ["СУП", "СОК", "СЫР"]
                })),
            Exercise(lesson_id=lesson7.id, type="select_image",
                answer="СЫР",
                content=json.dumps({
                    "question": "Что любит мышка?",
                    "options": [
                        {"icon": "🧀", "word": "СЫР"},
                        {"icon": "🍎", "word": "ЯБЛОКО"},
                        {"icon": "🍌", "word": "БАНАН"}
                    ]
                })),
            Exercise(lesson_id=lesson7.id, type="build_word",
                answer="СЫР",
                content=json.dumps({
                    "question": "Собери слово СЫР",
                    "options": ["С", "Ы", "Р", "А", "О"]
                })),
            Exercise(lesson_id=lesson7.id, type="handwriting",
                answer="СОК",
                content=json.dumps({
                    "question": "Напиши слово СОК",
                    "letter": "СОК",
                    "guide_color": "#e5e5e5",
                    "trace_color": "#ff9600"
                })),
        ]

        db.add_all(exercises)
        db.commit()
        print(f"✅ Добавлено {len(exercises)} упражнений!")
        print("🎉 База данных успешно наполнена!")
        print(f"📊 Разделов: 3 | Уроков: 7 | Заданий: {len(exercises)}")
        print("🎯 Каждый урок: match + listen + select_image + build_word + handwriting")

    except Exception as e:
        print(f"❌ Ошибка при наполнении базы: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database()