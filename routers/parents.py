from fastapi import APIRouter

router = APIRouter(prefix="/parents", tags=["Parents & Notifications"])

@router.get("/{parent_id}")
def get_parent_profile(parent_id: int):
    """Профиль родителя"""
    return {"email": "parent@mail.com"}

@router.get("/{parent_id}/notifications")
def get_notifications(parent_id: int):
    """Уведомления для родителя (ребенок прошел урок, стрик сгорает)"""
    return [{"type": "success", "text": "Ваш ребенок получил новый уровень!"}]
