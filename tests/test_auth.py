from fastapi.testclient import TestClient
from main import app  
import uuid

client = TestClient(app)

def test_register_user():
    test_email = f"test_{uuid.uuid4()}@mail.com"
    test_password = "password123"

    response = client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "password": test_password}
    )
    
    assert response.status_code == 200
    
    data = response.json()
    assert "Успешная регистрация" in data.get("message", "")

def test_login_user():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@mail.com", "password": "wrongpassword"}
    )
    
    assert response.status_code == 401