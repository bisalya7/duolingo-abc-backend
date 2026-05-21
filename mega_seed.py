import sys
import io
import json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from database import engine, get_db
import models

db = next(get_db())

# Типы заданий (все поддерживаются фронтом):
#   match          — выбрать правильный вариант из текстовых кнопок
#   listen         — послушать и выбрать (бывший "audio")
#   select_image   — выбрать картинку/иконку
#   build_word     — собрать слово из букв/слогов (бывший "word_building")
#   handwriting    — написать пальцем

try:
    print("🔥 ИНИЦИАЛИЗАЦИЯ МЕГА-СИДА: Очистка старых данных...")
    db.query(models.Exercise).delete()
    db.query(models.Lesson).delete()
    if hasattr(models, 'Unit'):
        db.query(models.Unit).delete()
    db.commit()

    # =========================================================================
    # 🌟 РАЗДЕЛ 1: ПЕРВЫЕ БУКВЫ (Гласные А, О, У и согласные М, П)
    # =========================================================================
    print("📚 Создаем Раздел 1: Первые буквы...")
    unit1 = models.Unit(title="Раздел 1: Знакомимся с буквами", order=1)
    db.add(unit1)
    db.commit()
    db.refresh(unit1)

    # --- Урок 1.1: Гласные А, О, У ---
    l1_1 = models.Lesson(title="Урок 1: Звуки А, О, У", order=1, xp_reward=10, unit_id=unit1.id)
    db.add(l1_1)
    db.commit()
    db.refresh(l1_1)
    db.add_all([
        # match
        models.Exercise(lesson_id=l1_1.id, type="match", answer="А",
            content=json.dumps({"question": "С какой буквы начинается слово АРБУЗ?",
                "options": ["О", "А", "У", "М"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l1_1.id, type="listen", answer="О",
            content=json.dumps({"text": "Послушай звук и выбери букву",
                "audio_url": "/sounds/O.mp3", "options": ["А", "О", "У"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l1_1.id, type="select_image", answer="Утка",
            content=json.dumps({"question": "Что начинается на звук «У»?",
                "options": [
                    {"icon": "🦆", "word": "Утка"},
                    {"icon": "🍎", "word": "Яблоко"},
                    {"icon": "🐱", "word": "Кот"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l1_1.id, type="build_word", answer="АУ",
            content=json.dumps({"question": "Собери крик в лесу: АУ",
                "options": ["У", "М", "А", "О"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l1_1.id, type="handwriting", answer="У",
            content=json.dumps({"question": "Напиши пальчиком букву У",
                "letter": "У", "guide_color": "#e5e5e5", "trace_color": "#1cb0f6"}, ensure_ascii=False)),
    ])

    # --- Урок 1.2: Согласные М и П ---
    l1_2 = models.Lesson(title="Урок 2: Губные звуки М и П", order=2, xp_reward=10, unit_id=unit1.id)
    db.add(l1_2)
    db.commit()
    db.refresh(l1_2)
    db.add_all([
        # match
        models.Exercise(lesson_id=l1_2.id, type="match", answer="М",
            content=json.dumps({"question": "Какая буква мычит как корова?",
                "options": ["П", "М", "А", "У"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l1_2.id, type="listen", answer="П",
            content=json.dumps({"text": "Послушай и найди звук [П]",
                "audio_url": "/sounds/P.mp3", "options": ["М", "П", "Б"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l1_2.id, type="select_image", answer="Мяч",
            content=json.dumps({"question": "Что начинается на букву М?",
                "options": [
                    {"icon": "⚽", "word": "Мяч"},
                    {"icon": "🍌", "word": "Банан"},
                    {"icon": "🐶", "word": "Собака"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l1_2.id, type="build_word", answer="УМ",
            content=json.dumps({"question": "Собери короткое слово УМ",
                "options": ["М", "А", "У", "П"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l1_2.id, type="handwriting", answer="М",
            content=json.dumps({"question": "Обведи букву М",
                "letter": "М", "guide_color": "#e5e5e5", "trace_color": "#58cc02"}, ensure_ascii=False)),
    ])

    # --- Урок 1.3: Буква Б и Д ---
    l1_3 = models.Lesson(title="Урок 3: Буквы Б и Д", order=3, xp_reward=10, unit_id=unit1.id)
    db.add(l1_3)
    db.commit()
    db.refresh(l1_3)
    db.add_all([
        # match
        models.Exercise(lesson_id=l1_3.id, type="match", answer="Б",
            content=json.dumps({"question": "С какой буквы начинается БАРАБАН?",
                "options": ["Д", "Б", "В", "Г"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l1_3.id, type="listen", answer="Д",
            content=json.dumps({"text": "Послушай — какой звук в начале слова ДОМ?",
                "audio_url": "/sounds/D.mp3", "options": ["Б", "Д", "Г"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l1_3.id, type="select_image", answer="Бабочка",
            content=json.dumps({"question": "Что начинается на букву Б?",
                "options": [
                    {"icon": "🦋", "word": "Бабочка"},
                    {"icon": "🌸", "word": "Цветок"},
                    {"icon": "🐢", "word": "Черепаха"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l1_3.id, type="build_word", answer="ДУБ",
            content=json.dumps({"question": "Собери название дерева: ДУБ",
                "options": ["Д", "У", "Б", "А", "М"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l1_3.id, type="handwriting", answer="Б",
            content=json.dumps({"question": "Напиши букву Б",
                "letter": "Б", "guide_color": "#e5e5e5", "trace_color": "#ff9600"}, ensure_ascii=False)),
    ])

    # --- Урок 1.4: Повторение + буква К ---
    l1_4 = models.Lesson(title="Урок 4: Знакомься, буква К!", order=4, xp_reward=15, unit_id=unit1.id)
    db.add(l1_4)
    db.commit()
    db.refresh(l1_4)
    db.add_all([
        # match
        models.Exercise(lesson_id=l1_4.id, type="match", answer="К",
            content=json.dumps({"question": "Как начинается слово КОТ?",
                "options": ["Г", "К", "Х", "Ч"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l1_4.id, type="listen", answer="К",
            content=json.dumps({"text": "Какой звук стоит первым?",
                "audio_url": "/sounds/K.mp3", "options": ["Г", "К", "Х"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l1_4.id, type="select_image", answer="Кот",
            content=json.dumps({"question": "Кто начинается на К?",
                "options": [
                    {"icon": "🐱", "word": "Кот"},
                    {"icon": "🐶", "word": "Пес"},
                    {"icon": "🐇", "word": "Заяц"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l1_4.id, type="build_word", answer="КОТ",
            content=json.dumps({"question": "Собери слово КОТ",
                "options": ["К", "О", "Т", "А", "М"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l1_4.id, type="handwriting", answer="К",
            content=json.dumps({"question": "Напиши букву К",
                "letter": "К", "guide_color": "#e5e5e5", "trace_color": "#ce82ff"}, ensure_ascii=False)),
    ])


    # =========================================================================
    # 🌟 РАЗДЕЛ 2: СЛОГИ (Соединяем буквы)
    # =========================================================================
    print("📚 Создаем Раздел 2: Читаем слоги...")
    unit2 = models.Unit(title="Раздел 2: Волшебные слоги", order=2)
    db.add(unit2)
    db.commit()
    db.refresh(unit2)

    # --- Урок 2.1: Слоги с А ---
    l2_1 = models.Lesson(title="Урок 1: Слоги МА, ПА, БА", order=1, xp_reward=10, unit_id=unit2.id)
    db.add(l2_1)
    db.commit()
    db.refresh(l2_1)
    db.add_all([
        # match
        models.Exercise(lesson_id=l2_1.id, type="match", answer="МА",
            content=json.dumps({"question": "М + А = ?",
                "options": ["МУ", "МА", "АМ", "МО"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l2_1.id, type="listen", answer="БА",
            content=json.dumps({"text": "Угадай слог на слух",
                "audio_url": "/sounds/BA.mp3", "options": ["ПА", "БА", "МА"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l2_1.id, type="select_image", answer="МАМА",
            content=json.dumps({"question": "Найди слог МА на картинке",
                "options": [
                    {"icon": "👩", "word": "МАМА"},
                    {"icon": "👨", "word": "ПАПА"},
                    {"icon": "👵", "word": "БАБА"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l2_1.id, type="build_word", answer="МАМА",
            content=json.dumps({"question": "Собери самое важное слово: МАМА",
                "options": ["А", "М", "А", "М", "П"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l2_1.id, type="handwriting", answer="МА",
            content=json.dumps({"question": "Напиши слог МА",
                "letter": "МА", "guide_color": "#e5e5e5", "trace_color": "#1cb0f6"}, ensure_ascii=False)),
    ])

    # --- Урок 2.2: Слоги с У ---
    l2_2 = models.Lesson(title="Урок 2: Слоги МУ, БУ, ДУ", order=2, xp_reward=10, unit_id=unit2.id)
    db.add(l2_2)
    db.commit()
    db.refresh(l2_2)
    db.add_all([
        # match
        models.Exercise(lesson_id=l2_2.id, type="match", answer="МУ",
            content=json.dumps({"question": "Какой слог говорит корова?",
                "options": ["МА", "МЕ", "МУ", "МО"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l2_2.id, type="listen", answer="ДУ",
            content=json.dumps({"text": "Послушай дудочку: ДУ-ДУ. Найди слог ДУ",
                "audio_url": "/sounds/DU.mp3", "options": ["БУ", "ДУ", "МУ"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l2_2.id, type="select_image", answer="Утка",
            content=json.dumps({"question": "У кого слог «УТ»?",
                "options": [
                    {"icon": "🦆", "word": "Утка"},
                    {"icon": "🐸", "word": "Лягушка"},
                    {"icon": "🐠", "word": "Рыбка"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l2_2.id, type="build_word", answer="ДУБ",
            content=json.dumps({"question": "Собери слово ДУБ",
                "options": ["Д", "У", "Б", "А", "О"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l2_2.id, type="handwriting", answer="БУ",
            content=json.dumps({"question": "Напиши слог БУ",
                "letter": "БУ", "guide_color": "#e5e5e5", "trace_color": "#58cc02"}, ensure_ascii=False)),
    ])

    # --- Урок 2.3: Слоги с О ---
    l2_3 = models.Lesson(title="Урок 3: Слоги КО, ДО, МО", order=3, xp_reward=10, unit_id=unit2.id)
    db.add(l2_3)
    db.commit()
    db.refresh(l2_3)
    db.add_all([
        # match
        models.Exercise(lesson_id=l2_3.id, type="match", answer="КО",
            content=json.dumps({"question": "Что говорит петушок? КО-...",
                "options": ["КА", "КО", "КУ", "КЕ"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l2_3.id, type="listen", answer="МО",
            content=json.dumps({"text": "Послушай — какой слог?",
                "audio_url": "/sounds/MO.mp3", "options": ["МА", "МО", "МУ"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l2_3.id, type="select_image", answer="Домик",
            content=json.dumps({"question": "Где слог ДО?",
                "options": [
                    {"icon": "🏠", "word": "Домик"},
                    {"icon": "🌊", "word": "Море"},
                    {"icon": "🌙", "word": "Луна"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l2_3.id, type="build_word", answer="КОКА",
            content=json.dumps({"question": "Собери слово КОКА",
                "options": ["К", "О", "К", "А", "У"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l2_3.id, type="handwriting", answer="КО",
            content=json.dumps({"question": "Напиши слог КО",
                "letter": "КО", "guide_color": "#e5e5e5", "trace_color": "#ff9600"}, ensure_ascii=False)),
    ])

    # --- Урок 2.4: Битва слогов (повторение) ---
    l2_4 = models.Lesson(title="Урок 4: Битва слогов!", order=4, xp_reward=15, unit_id=unit2.id)
    db.add(l2_4)
    db.commit()
    db.refresh(l2_4)
    db.add_all([
        # match
        models.Exercise(lesson_id=l2_4.id, type="match", answer="ПАПА",
            content=json.dumps({"question": "ПА + ПА = ?",
                "options": ["МАМА", "ПАПА", "БАБА", "ДАДА"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l2_4.id, type="listen", answer="БА",
            content=json.dumps({"text": "Какой слог ты слышишь?",
                "audio_url": "/sounds/BA.mp3", "options": ["БА", "БО", "БУ"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l2_4.id, type="select_image", answer="ПАПА",
            content=json.dumps({"question": "ПА-ПА — это кто?",
                "options": [
                    {"icon": "👨", "word": "ПАПА"},
                    {"icon": "👩", "word": "МАМА"},
                    {"icon": "👧", "word": "ДОЧКА"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l2_4.id, type="build_word", answer="БУМАГА",
            content=json.dumps({"question": "Сложное задание! Собери слово БУМАГА",
                "options": ["А", "Б", "Г", "М", "У", "А", "О"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l2_4.id, type="handwriting", answer="ПА",
            content=json.dumps({"question": "Напиши слог ПА",
                "letter": "ПА", "guide_color": "#e5e5e5", "trace_color": "#ce82ff"}, ensure_ascii=False)),
    ])


    # =========================================================================
    # 🌟 РАЗДЕЛ 3: ПЕРВЫЕ СЛОВА (Короткие слова из 3-4 букв)
    # =========================================================================
    print("📚 Создаем Раздел 3: Первые слова...")
    unit3 = models.Unit(title="Раздел 3: Читаем слова целиком", order=3)
    db.add(unit3)
    db.commit()
    db.refresh(unit3)

    # --- Урок 3.1: Животные ---
    l3_1 = models.Lesson(title="Урок 1: Звери вокруг нас", order=1, xp_reward=10, unit_id=unit3.id)
    db.add(l3_1)
    db.commit()
    db.refresh(l3_1)
    db.add_all([
        # match
        models.Exercise(lesson_id=l3_1.id, type="match", answer="КОТ",
            content=json.dumps({"question": "Как зовут пушистого зверя, который ловит мышей?",
                "options": ["ПЕС", "КОТ", "ЖУК", "БЫК"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l3_1.id, type="listen", answer="ЖУК",
            content=json.dumps({"text": "Послушай жужжание и найди слово",
                "audio_url": "/sounds/ZHUK.mp3", "options": ["ЖУК", "ЛУК", "СУК"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l3_1.id, type="select_image", answer="КОТ",
            content=json.dumps({"question": "Найди кота!",
                "options": [
                    {"icon": "🐱", "word": "КОТ"},
                    {"icon": "🐶", "word": "ПЕС"},
                    {"icon": "🐇", "word": "ЗАЯЦ"},
                    {"icon": "🐠", "word": "РЫБА"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l3_1.id, type="build_word", answer="ЖУК",
            content=json.dumps({"question": "Собери слово ЖУК",
                "options": ["Ж", "У", "К", "А", "Б"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l3_1.id, type="handwriting", answer="КОТ",
            content=json.dumps({"question": "Напиши слово КОТ",
                "letter": "КОТ", "guide_color": "#e5e5e5", "trace_color": "#1cb0f6"}, ensure_ascii=False)),
    ])

    # --- Урок 3.2: Еда ---
    l3_2 = models.Lesson(title="Урок 2: Вкусные слова", order=2, xp_reward=10, unit_id=unit3.id)
    db.add(l3_2)
    db.commit()
    db.refresh(l3_2)
    db.add_all([
        # match
        models.Exercise(lesson_id=l3_2.id, type="match", answer="СОК",
            content=json.dumps({"question": "Что мы пьем из стакана?",
                "options": ["СУП", "СОК", "СЫР", "ДОМ"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l3_2.id, type="listen", answer="СУП",
            content=json.dumps({"text": "Что варят в кастрюле? Выбери услышанное слово",
                "audio_url": "/sounds/SUP.mp3", "options": ["СУП", "СОК", "СЫР"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l3_2.id, type="select_image", answer="СЫР",
            content=json.dumps({"question": "Что любит мышка?",
                "options": [
                    {"icon": "🧀", "word": "СЫР"},
                    {"icon": "🍎", "word": "ЯБЛОКО"},
                    {"icon": "🍌", "word": "БАНАН"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l3_2.id, type="build_word", answer="СЫР",
            content=json.dumps({"question": "Собери любимую еду мышки: СЫР",
                "options": ["Р", "С", "Ы", "М", "О"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l3_2.id, type="handwriting", answer="СОК",
            content=json.dumps({"question": "Напиши слово СОК",
                "letter": "СОК", "guide_color": "#e5e5e5", "trace_color": "#58cc02"}, ensure_ascii=False)),
    ])

    # --- Урок 3.3: Дом и вещи ---
    l3_3 = models.Lesson(title="Урок 3: Дома и вещи", order=3, xp_reward=10, unit_id=unit3.id)
    db.add(l3_3)
    db.commit()
    db.refresh(l3_3)
    db.add_all([
        # match
        models.Exercise(lesson_id=l3_3.id, type="match", answer="ДОМ",
            content=json.dumps({"question": "Где живет семья?",
                "options": ["ЛОМ", "ДОМ", "КОМ", "СОМ"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l3_3.id, type="listen", answer="ШАР",
            content=json.dumps({"text": "Послушай и найди слово",
                "audio_url": "/sounds/SHAR.mp3", "options": ["ШАР", "МЯЧ", "КУБ"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l3_3.id, type="select_image", answer="ДОМ",
            content=json.dumps({"question": "Покажи домик!",
                "options": [
                    {"icon": "🏠", "word": "ДОМ"},
                    {"icon": "🚗", "word": "МАШИНА"},
                    {"icon": "✈️", "word": "САМОЛЕТ"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l3_3.id, type="build_word", answer="ШАР",
            content=json.dumps({"question": "Собери слово ШАР",
                "options": ["Ш", "А", "Р", "О", "М"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l3_3.id, type="handwriting", answer="ДОМ",
            content=json.dumps({"question": "Напиши слово ДОМ",
                "letter": "ДОМ", "guide_color": "#e5e5e5", "trace_color": "#ff9600"}, ensure_ascii=False)),
    ])

    # --- Урок 3.4: Природа ---
    l3_4 = models.Lesson(title="Урок 4: Природа вокруг", order=4, xp_reward=10, unit_id=unit3.id)
    db.add(l3_4)
    db.commit()
    db.refresh(l3_4)
    db.add_all([
        # match
        models.Exercise(lesson_id=l3_4.id, type="match", answer="ЛУНА",
            content=json.dumps({"question": "Что светит ночью на небе?",
                "options": ["ЛУНА", "СОЛНЦЕ", "ЗВЕЗДА", "ТУЧА"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l3_4.id, type="listen", answer="ЛЕС",
            content=json.dumps({"text": "Послушай и выбери слово",
                "audio_url": "/sounds/LES.mp3", "options": ["ЛЕС", "РЕС", "МЕС"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l3_4.id, type="select_image", answer="Луна",
            content=json.dumps({"question": "Что появляется ночью?",
                "options": [
                    {"icon": "🌙", "word": "Луна"},
                    {"icon": "☀️", "word": "Солнце"},
                    {"icon": "🌈", "word": "Радуга"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l3_4.id, type="build_word", answer="ЛЕС",
            content=json.dumps({"question": "Собери слово ЛЕС",
                "options": ["Л", "Е", "С", "А", "М"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l3_4.id, type="handwriting", answer="ЛЕС",
            content=json.dumps({"question": "Напиши слово ЛЕС",
                "letter": "ЛЕС", "guide_color": "#e5e5e5", "trace_color": "#ce82ff"}, ensure_ascii=False)),
    ])

    # --- Урок 3.5: ФИНАЛЬНЫЙ ЭКЗАМЕН ---
    l3_5 = models.Lesson(title="Урок 5: Большой экзамен 🏆", order=5, xp_reward=20, unit_id=unit3.id)
    db.add(l3_5)
    db.commit()
    db.refresh(l3_5)
    db.add_all([
        # match
        models.Exercise(lesson_id=l3_5.id, type="match", answer="СОБАКА",
            content=json.dumps({"question": "Самый верный друг человека — это...",
                "options": ["КОШКА", "СОБАКА", "ПОПУГАЙ", "ХОМЯК"]}, ensure_ascii=False)),
        # listen
        models.Exercise(lesson_id=l3_5.id, type="listen", answer="МОЛОКО",
            content=json.dumps({"text": "Что дает корова? Послушай!",
                "audio_url": "/sounds/MOLOKO.mp3", "options": ["МОЛОКО", "СОК", "ЧАЙ"]}, ensure_ascii=False)),
        # select_image
        models.Exercise(lesson_id=l3_5.id, type="select_image", answer="СОБАКА",
            content=json.dumps({"question": "Найди лучшего друга человека!",
                "options": [
                    {"icon": "🐶", "word": "СОБАКА"},
                    {"icon": "🐍", "word": "ЗМЕЯ"},
                    {"icon": "🦎", "word": "ЯЩЕРИЦА"},
                    {"icon": "🐟", "word": "РЫБКА"}
                ]}, ensure_ascii=False)),
        # build_word
        models.Exercise(lesson_id=l3_5.id, type="build_word", answer="СОБАКА",
            content=json.dumps({"question": "Супер-задание! Собери слово СОБАКА",
                "options": ["А", "Б", "О", "С", "А", "К", "У"]}, ensure_ascii=False)),
        # handwriting
        models.Exercise(lesson_id=l3_5.id, type="handwriting", answer="МОЛОДЕЦ",
            content=json.dumps({"question": "Ты молодец! Напиши МОЛОДЕЦ",
                "letter": "МОЛОДЕЦ", "guide_color": "#e5e5e5", "trace_color": "#58cc02"}, ensure_ascii=False)),
    ])

    db.commit()
    print("✅ ВСЕ ПРОШЛО УСПЕШНО!")
    print("📊 Итого: 3 Раздела | 13 Уроков | 65 Заданий")
    print("🎯 Каждый урок содержит все 5 типов: match, listen, select_image, build_word, handwriting")
    print("🚀 Открывай фронтенд — карта должна выглядеть бомбически!")

except Exception as e:
    db.rollback()
    print(f"❌ ПРОИЗОШЛА ОШИБКА: {e}")
    import traceback
    traceback.print_exc()