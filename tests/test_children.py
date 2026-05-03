from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

# Вспомогательная функция, чтобы быстро получать токен для тестов
def get_auth_token():
    email = f"parent_{uuid.uuid4()}@mail.com"
    password = "testpassword123"
    
    # Регистрируем пользователя
    client.post("/register", json={"email": email, "password": password})
    # Логинимся
    response = client.post("/login", data={"username": email, "password": password})
    return response.json()["access_token"]

def test_create_and_get_children():
    # 1. Получаем токен
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Создаем ребенка с правильным токеном
    child_data = {"name": "Test Anya", "age": 5}
    response = client.post("/children/", json=child_data, headers=headers)
    
    assert response.status_code == 200
    created_child = response.json()
    assert created_child["name"] == "Test Anya"
    assert created_child["age"] == 5
    
    # 3. Проверяем, что ребенок появился в списке
    response_get = client.get("/children/", headers=headers)
    assert response_get.status_code == 200
    children_list = response_get.json()
    assert len(children_list) >= 1
    assert children_list[-1]["name"] == "Test Anya"

def test_unauthorized_access():
    # 4. Проверяем, что хакеры без токена получат 401 ошибку
    response = client.get("/children/")
    assert response.status_code == 401
    
    response_post = client.post("/children/", json={"name": "Hacker", "age": 10})
    assert response_post.status_code == 401