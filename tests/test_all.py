import pytest
import uuid
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from database import Base, get_db
from main import app

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/duolingo_db")

engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def unique_email():
    return f"test_{uuid.uuid4()}@test.com"

def register_and_login(password="pass123"):
    email = unique_email()
    client.post("/register", json={"email": email, "password": password})
    r = client.post("/login", data={"username": email, "password": password})
    return r.json().get("access_token"), email

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_register_success():
    r = client.post("/register", json={"email": unique_email(), "password": "pass123"})
    assert r.status_code == 200
    assert "message" in r.json()

def test_register_duplicate_email():
    email = unique_email()
    client.post("/register", json={"email": email, "password": "pass123"})
    r = client.post("/register", json={"email": email, "password": "pass123"})
    assert r.status_code == 400

def test_login_success():
    token, _ = register_and_login()
    assert token is not None

def test_login_wrong_password():
    email = unique_email()
    client.post("/register", json={"email": email, "password": "correct"})
    r = client.post("/login", data={"username": email, "password": "wrong"})
    assert r.status_code == 401

def test_login_nonexistent_user():
    r = client.post("/login", data={"username": unique_email(), "password": "pass"})
    assert r.status_code == 401


def test_create_child():
    token, _ = register_and_login()
    r = client.post("/children/", json={"name": "Аня", "age": 5}, headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json()["name"] == "Аня"
    assert r.json()["level"] == 1
    assert r.json()["total_xp"] == 0

def test_get_children_empty_for_new_user():
    token, _ = register_and_login()
    r = client.get("/children/", headers=auth_headers(token))
    assert r.status_code == 200
    assert r.json() == []

def test_unauthorized_access():
    r = client.get("/children/")
    assert r.status_code == 401

def test_child_isolation():
    """Родитель не видит детей другого родителя"""
    token1, _ = register_and_login()
    token2, _ = register_and_login()

    r = client.post("/children/", json={"name": "Маша", "age": 4}, headers=auth_headers(token1))
    child_id = r.json()["id"]

    r2 = client.get(f"/children/{child_id}", headers=auth_headers(token2))
    assert r2.status_code == 404

def test_update_child():
    token, _ = register_and_login()
    r = client.post("/children/", json={"name": "Коля", "age": 5}, headers=auth_headers(token))
    child_id = r.json()["id"]

    r2 = client.put(f"/children/{child_id}", json={"name": "Николай", "age": 6}, headers=auth_headers(token))
    assert r2.status_code == 200
    assert r2.json()["name"] == "Николай"

def test_delete_child():
    token, _ = register_and_login()
    r = client.post("/children/", json={"name": "Петя", "age": 7}, headers=auth_headers(token))
    child_id = r.json()["id"]

    client.delete(f"/children/{child_id}", headers=auth_headers(token))
    r2 = client.get(f"/children/{child_id}", headers=auth_headers(token))
    assert r2.status_code == 404


def test_xp_awarded_on_complete():
    from services.learning_service import complete_lesson
    from models import User, Child, Unit, Lesson, Badge
    from routers.auth import hash_password

    db = TestingSessionLocal()
    try:
        user = User(email=unique_email(), password_hash=hash_password("x"))
        db.add(user); db.commit()

        child = Child(name="XP тест", age=5, parent_id=user.id, total_xp=0, level=1, daily_streak=0)
        db.add(child); db.commit()

        unit = Unit(title=f"Юнит {uuid.uuid4()}", order=999)
        db.add(unit); db.commit()

        lesson = Lesson(title="Урок XP", order=1, xp_reward=10, unit_id=unit.id)
        db.add(lesson); db.commit()

        result = complete_lesson(db, child.id, lesson.id, score=3)
        assert result is not None
        assert result["child"].total_xp == 10
    finally:
        db.close()

def test_streak_increments_next_day():
    from services.learning_service import complete_lesson
    from models import User, Child, Unit, Lesson
    from routers.auth import hash_password
    from datetime import date, timedelta

    db = TestingSessionLocal()
    try:
        user = User(email=unique_email(), password_hash=hash_password("x"))
        db.add(user); db.commit()

        child = Child(
            name="Стрик тест", age=6, parent_id=user.id,
            total_xp=0, level=1, daily_streak=2,
            last_active_date=date.today() - timedelta(days=1)
        )
        db.add(child); db.commit()

        unit = Unit(title=f"Ю {uuid.uuid4()}", order=998)
        db.add(unit); db.commit()

        lesson = Lesson(title="Стрик урок", order=1, xp_reward=10, unit_id=unit.id)
        db.add(lesson); db.commit()

        result = complete_lesson(db, child.id, lesson.id, score=2)
        assert result["child"].daily_streak == 3
    finally:
        db.close()

def test_streak_resets_after_skip():
    from services.learning_service import complete_lesson
    from models import User, Child, Unit, Lesson
    from routers.auth import hash_password
    from datetime import date, timedelta

    db = TestingSessionLocal()
    try:
        user = User(email=unique_email(), password_hash=hash_password("x"))
        db.add(user); db.commit()

        child = Child(
            name="Пропустил", age=5, parent_id=user.id,
            total_xp=0, level=1, daily_streak=5,
            last_active_date=date.today() - timedelta(days=3)
        )
        db.add(child); db.commit()

        unit = Unit(title=f"Ю {uuid.uuid4()}", order=997)
        db.add(unit); db.commit()

        lesson = Lesson(title="После пропуска", order=1, xp_reward=10, unit_id=unit.id)
        db.add(lesson); db.commit()

        result = complete_lesson(db, child.id, lesson.id, score=1)
        assert result["child"].daily_streak == 1
    finally:
        db.close()

def test_first_lesson_badge():
    from services.learning_service import complete_lesson
    from models import User, Child, Unit, Lesson, Badge
    from routers.auth import hash_password

    db = TestingSessionLocal()
    try:
        badge = db.query(Badge).filter(Badge.name == "Первый урок").first()
        if not badge:
            badge = Badge(name="Первый урок", description="Первое занятие", icon_url="🌟")
            db.add(badge); db.commit()

        user = User(email=unique_email(), password_hash=hash_password("x"))
        db.add(user); db.commit()

        child = Child(name="Бейдж тест", age=5, parent_id=user.id, total_xp=0, level=1, daily_streak=0)
        db.add(child); db.commit()

        unit = Unit(title=f"Ю {uuid.uuid4()}", order=996)
        db.add(unit); db.commit()

        lesson = Lesson(title="Первый урок тест", order=1, xp_reward=10, unit_id=unit.id)
        db.add(lesson); db.commit()

        result = complete_lesson(db, child.id, lesson.id, score=3)
        assert "Первый урок" in result["new_badges"]
    finally:
        db.close()

def test_100xp_badge():
    from services.learning_service import complete_lesson
    from models import User, Child, Unit, Lesson, Badge
    from routers.auth import hash_password

    db = TestingSessionLocal()
    try:
        badge = db.query(Badge).filter(Badge.name == "100 XP").first()
        if not badge:
            badge = Badge(name="100 XP", description="100 очков", icon_url="⭐")
            db.add(badge); db.commit()

        user = User(email=unique_email(), password_hash=hash_password("x"))
        db.add(user); db.commit()

        # Начинаем с 90 XP
        child = Child(name="100XP тест", age=5, parent_id=user.id, total_xp=90, level=1, daily_streak=0)
        db.add(child); db.commit()

        unit = Unit(title=f"Ю {uuid.uuid4()}", order=995)
        db.add(unit); db.commit()

        lesson = Lesson(title="Финальный урок", order=1, xp_reward=10, unit_id=unit.id)
        db.add(lesson); db.commit()

        result = complete_lesson(db, child.id, lesson.id, score=3)
        assert "100 XP" in result["new_badges"]
    finally:
        db.close()