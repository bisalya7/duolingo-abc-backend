from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["Admin & Curriculum"])

# --- УПРАВЛЕНИЕ КУРСОМ (Units CRUD) ---
@router.get("/units")
def get_units():
    """Получить все разделы (Curriculum unit management)"""
    return [{"id": 1, "title": "Основы чтения"}]

@router.post("/units")
def create_unit(unit_data: dict):
    return {"message": "Раздел создан"}

@router.get("/units/{id}")
def get_unit_by_id(id: int):
    return {"id": id, "title": "Основы чтения"}

@router.put("/units/{id}")
def update_unit(id: int, unit_data: dict):
    return {"message": "Раздел обновлен"}

@router.delete("/units/{id}")
def delete_unit(id: int):
    return {"message": "Раздел удален"}

# --- СТАТИСТИКА И ЛОГИ (Admin-only) ---
@router.get("/admin/logs")
def get_admin_logs(page: int = 1, limit: int = 20):
    """Пагинированный список активности пользователей (activity log)"""
    return {"page": page, "logs": [{"action": "user_login", "user_id": 5}]}

@router.get("/admin/stats")
def get_admin_stats():
    """Глобальная статистика для дашборда администратора"""
    return {"total_users": 150, "total_lessons_played": 4500}