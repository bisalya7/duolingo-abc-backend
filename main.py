import models, schemas
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from datetime import date, timedelta
from routers import auth, children, learning, admin, parents

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры БЕЗ двойных префиксов
app.include_router(auth.router)
app.include_router(children.router)
app.include_router(learning.router)

@app.post("/children/{child_id}/progress", response_model=schemas.ChildResponse)
def update_child_progress(child_id: int, progress: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Защита от NULL (для Postgres)
    child.total_xp = (child.total_xp or 0) + progress.xp_added
    child.level = (child.total_xp // 50) + 1
    
    db.commit()
    db.refresh(child)
    return child