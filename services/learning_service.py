from sqlalchemy.orm import Session
from models import Child, Lesson, Progress, Badge, ChildBadge, Notification
from datetime import date, timedelta

def complete_lesson(db: Session, child_id: int, lesson_id: int, score: int):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        return None

    # 1. Записываем сам факт прохождения урока
    new_progress = Progress(child_id=child_id, lesson_id=lesson_id, score=score)
    db.add(new_progress)

    child = db.query(Child).filter(Child.id == child_id).first()
    new_badges_awarded = []

    if child:
        # 2. Начисляем XP и Уровень
        child.total_xp += lesson.xp_reward
        child.level = (child.total_xp // 100) + 1

        # 3. Логика Стриков (Daily Streak)
        today = date.today()
        if child.last_active_date == today - timedelta(days=1):
            # Был активен вчера -> стрик растет!
            child.daily_streak += 1
        elif child.last_active_date != today:
            # Пропустил день (или это вообще первый урок) -> стрик сбрасывается на 1
            child.daily_streak = 1
        
        child.last_active_date = today

        # 4. Логика выдачи Бейджей (Наград)
        # Проверка 1: "Первый урок"
        first_lesson_badge = db.query(Badge).filter(Badge.name == "Первый урок").first()
        if first_lesson_badge:
            has_badge = db.query(ChildBadge).filter(ChildBadge.child_id == child_id, ChildBadge.badge_id == first_lesson_badge.id).first()
            if not has_badge:
                db.add(ChildBadge(child_id=child_id, badge_id=first_lesson_badge.id))
                new_badges_awarded.append(first_lesson_badge.name)

        # Проверка 2: "100 XP"
        if child.total_xp >= 100:
            xp_badge = db.query(Badge).filter(Badge.name == "100 XP").first()
            if xp_badge:
                has_badge = db.query(ChildBadge).filter(ChildBadge.child_id == child_id, ChildBadge.badge_id == xp_badge.id).first()
                if not has_badge:
                    db.add(ChildBadge(child_id=child_id, badge_id=xp_badge.id))
                    new_badges_awarded.append(xp_badge.name)

        # 5. Создаем уведомление для родителя
        if new_badges_awarded:
            msg = f"Ваш ребенок {child.name} получил новые награды: {', '.join(new_badges_awarded)}!"
            db.add(Notification(user_id=child.parent_id, message=msg))

        db.commit()
        db.refresh(child)

        return {
            "child": child,
            "new_badges": new_badges_awarded
        }
    return None