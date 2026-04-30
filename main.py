import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from schemas import UserCreate, Token 

# Импортируем все наши роутеры из папки routers
from routers import auth, children, learning, admin, parents 

# Создаем таблицы в базе данных (если их еще нет)
models.Base.metadata.create_all(bind=engine)

# 1. СНАЧАЛА СОЗДАЕМ ПРИЛОЖЕНИЕ
app = FastAPI(title="Duolingo ABC Clone API")

# 2. НАСТРАИВАЕМ CORS (обязательно для работы с React/Vue)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. ПОДКЛЮЧАЕМ ВСЕ РОУТЕРЫ (Только после создания app!)
app.include_router(auth.router)
app.include_router(children.router)
app.include_router(learning.router)
app.include_router(admin.router)
app.include_router(parents.router)

# 4. БАЗОВЫЙ ЭНДПОИНТ (Проверка, что сервер жив)
@app.get("/")
def read_root():
    return {"message": "Server is running! Check /docs"}