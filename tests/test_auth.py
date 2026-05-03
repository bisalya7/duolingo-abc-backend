from fastapi.testclient import TestClient
from main import app  # Импортируем твое приложение FastAPI

client = TestClient(app)

def test_register_user():
    # Генерируем уникальную почту для каждого запуска теста
    import uuid
    test_email = f"test_{uuid.uuid4()}@mail.com"
    test_password = "password123"

    # Отправляем POST запрос на регистрацию
    response = client.post(
        "/register",
        json={"email": test_email, "password": test_password}
    )
    
    # Проверяем, что сервер ответил "Успешно" (статус 200)
    assert response.status_code == 200
    
    # Проверяем, что в ответе есть сообщение об успехе
    data = response.json()
    assert "Успешная регистрация" in data.get("message", "")

def test_login_user():
    # Пытаемся войти с заведомо неправильными данными
    response = client.post(
        "/login",
        data={"username": "wrong@mail.com", "password": "wrongpassword"}
    )
    
    # Сервер должен выдать ошибку 401 Unauthorized
    assert response.status_code == 401