from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Храним активные подключения в виде словаря: {user_id: [websocket1, websocket2]}
        # Список нужен, если родитель открыл сайт на ноутбуке и телефоне одновременно
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            # Если вкладок не осталось, удаляем пользователя из словаря
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        # Если родитель сейчас онлайн, отправляем ему сообщение!
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

# Создаем единственный экземпляр диспетчера для всего приложения
manager = ConnectionManager()