from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Notification, User
from schemas import NotificationResponse
from services.auth_service import get_current_user
from fastapi import WebSocket, WebSocketDisconnect
from socket_manager import manager
from fastapi import WebSocket, WebSocketDisconnect
from socket_manager import manager

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Получить список уведомлений (прочитанные и непрочитанные) текущего родителя"""
    # Ищем уведомления только для того пользователя, чей токен сейчас передан
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications

@router.patch("/{notification_id}", response_model=NotificationResponse)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Отметить уведомление как прочитанное"""
    # Ищем уведомление, и проверяем, что оно принадлежит этому родителю (безопасность!)
    notification = db.query(Notification).filter(
        Notification.id == notification_id, 
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Уведомление не найдено")
    
    # Меняем статус и сохраняем
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
# ДОБАВИТЬ ЭТИ ИМПОРТЫ В НАЧАЛО ФАЙЛА (если их там нет):
# ... твои старые эндпоинты ...

# ДОБАВИТЬ В САМЫЙ КОНЕЦ ФАЙЛА:
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """
    WebSocket эндпоинт. Сюда фронтенд подключается при входе в дашборд.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Просто слушаем соединение, чтобы оно не закрывалось.
            # Нам не нужно получать данные от родителя, мы только отправляем.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        # ДОБАВИТЬ ЭТИ ИМПОРТЫ В НАЧАЛО ФАЙЛА (если их там нет):


# ... твои старые эндпоинты ...

# ДОБАВИТЬ В САМЫЙ КОНЕЦ ФАЙЛА:
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """
    WebSocket эндпоинт. Сюда фронтенд подключается при входе в дашборд.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Просто слушаем соединение, чтобы оно не закрывалось.
            # Нам не нужно получать данные от родителя, мы только отправляем.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)