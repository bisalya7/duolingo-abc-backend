# tests/test_auth_rbac.py
"""
Тесты для refresh-токена и RBAC.
"""

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

from database import Base, get_db
from main import app

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


def register_and_login(role="parent"):
    email = unique_email()
    password = "pass123"
    client.post("/register", json={"email": email, "password": password})
    r = client.post("/login", data={"username": email, "password": password})
    data = r.json()
    return data.get("access_token"), data.get("refresh_token"), email


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ── Refresh token ─────────────────────────────────────────────────────────────

def test_login_returns_refresh_token():
    """Login должен возвращать access_token И refresh_token."""
    access, refresh, _ = register_and_login()
    assert access is not None
    assert refresh is not None


def test_refresh_returns_new_access_token():
    """Refresh-эндпоинт выдаёт новый access-токен."""
    access, refresh, _ = register_and_login()
    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data
    # Новый refresh-токен должен отличаться (ротация)
    assert data["refresh_token"] != refresh


def test_old_refresh_token_is_revoked_after_rotation():
    """После ротации старый refresh-токен должен быть инвалидирован."""
    _, refresh, _ = register_and_login()
    # Первый refresh
    client.post("/auth/refresh", json={"refresh_token": refresh})
    # Повторное использование старого токена — должно вернуть 401
    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 401


def test_invalid_refresh_token_rejected():
    """Случайный токен должен возвращать 401."""
    r = client.post("/auth/refresh", json={"refresh_token": "totally-fake-token"})
    assert r.status_code == 401


def test_logout_revokes_refresh_token():
    """После logout refresh-токен не должен работать."""
    access, refresh, _ = register_and_login()
    client.post(
        "/auth/logout",
        json={"refresh_token": refresh},
        headers=auth_headers(access),
    )
    r = client.post("/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 401


# ── RBAC: admin endpoints ─────────────────────────────────────────────────────

def test_parent_cannot_access_admin_stats():
    """Обычный parent не должен получать admin/stats."""
    access, _, _ = register_and_login()
    r = client.get("/api/v1/admin/stats", headers=auth_headers(access))
    assert r.status_code == 403


def test_parent_cannot_create_unit():
    """Parent не может создавать юниты."""
    access, _, _ = register_and_login()
    r = client.post(
        "/api/v1/units",
        json={"title": "Hacked unit", "order": 1},
        headers=auth_headers(access),
    )
    assert r.status_code == 403


def test_parent_cannot_access_admin_logs():
    """Parent не может видеть admin-логи."""
    access, _, _ = register_and_login()
    r = client.get("/api/v1/admin/logs", headers=auth_headers(access))
    assert r.status_code == 403


def test_unauthenticated_cannot_access_admin():
    """Без токена — 401 на admin endpoints."""
    r = client.get("/api/v1/admin/stats")
    assert r.status_code == 401


def test_get_me_returns_role():
    """/auth/me возвращает роль пользователя."""
    access, _, email = register_and_login()
    r = client.get("/auth/me", headers=auth_headers(access))
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == email
    assert data["role"] in ("parent", "admin")