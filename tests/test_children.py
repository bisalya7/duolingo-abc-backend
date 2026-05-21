from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def get_auth_token():
    email = f"parent_{uuid.uuid4()}@mail.com"
    password = "testpassword123"
    
    client.post("/api/v1/auth/register", json={"email": email, "password": password})
    response = client.post("/api/v1/auth/login", data={"username": email, "password": password})
    return response.json()["access_token"]

def test_create_and_get_children():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    child_data = {"name": "Test Anya", "age": 5}
    response = client.post("/api/v1/children/", json=child_data, headers=headers)
    
    assert response.status_code == 200
    created_child = response.json()
    assert created_child["name"] == "Test Anya"
    assert created_child["age"] == 5
    
    response_get = client.get("/api/v1/children/", headers=headers)
    assert response_get.status_code == 200
    children_list = response_get.json()
    assert len(children_list) >= 1
    assert children_list[-1]["name"] == "Test Anya"

def test_unauthorized_access():
    response = client.get("/api/v1/children/")
    assert response.status_code == 401
    
    response_post = client.post("/api/v1/children/", json={"name": "Hacker", "age": 10})
    assert response_post.status_code == 401