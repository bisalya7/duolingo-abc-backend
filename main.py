import models
import schemas
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect as sa_inspect
import logging
import traceback
import sys

from database import engine, get_db
from routers import auth, children, learning, admin, parents, notifications
from celery_app import celery_app

# === ЛОГИРОВАНИЕ ===
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# 1. Создание таблиц
models.Base.metadata.create_all(bind=engine)

# 2. Приложение
app = FastAPI(
    title="Children's Literacy Platform API",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# 3. CORS — один раз
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Глобальный обработчик ошибок
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = f"🔥 UNHANDLED EXCEPTION:\nURL: {request.url}\nMethod: {request.method}\nError: {str(exc)}\n{traceback.format_exc()}"
    logger.error(error_detail)
    print(error_detail, flush=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "error": str(exc)})

# 5. Health эндпоинты
@app.get("/api/v1/health")
def health():
    return {"status": "ok"}

@app.get("/api/v1/health/db")
def health_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        tables = sa_inspect(engine).get_table_names()
        return {"status": "ok", "tables": tables}
    except Exception as e:
        logger.error(f"DB health check failed: {e}")
        return {"status": "error", "detail": str(e)}

@app.get("/api/v1/health/celery")
def celery_health():
    try:
        i = celery_app.control.inspect()
        active = i.active()
        return {"status": "ok", "workers": list(active.keys()) if active else []}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# 6. Роутеры
app.include_router(auth.router, prefix="/api/v1")
app.include_router(children.router, prefix="/api/v1")
app.include_router(learning.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(parents.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")

# 7. Прогресс
@app.post("/api/v1/children/{child_id}/progress", response_model=schemas.ChildResponse)
def update_child_progress(child_id: int, progress: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    child.total_xp = (child.total_xp or 0) + progress.xp_added
    child.level = (child.total_xp // 100) + 1
    db.commit()
    db.refresh(child)
    return child