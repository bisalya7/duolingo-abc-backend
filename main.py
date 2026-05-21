import models
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from routers import auth, children, learning, admin, parents, notifications
import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Children's Literacy Platform API",
    description="API для детской платформы обучения грамоте",
    version="1.0.0",
    docs_url="/api/v1/docs",      # Swagger под /api/v1/docs
    redoc_url="/api/v1/redoc",    # ReDoc под /api/v1/redoc
    openapi_url="/api/v1/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Все роутеры под /api/v1/
app.include_router(auth.router, prefix="/api/v1")
app.include_router(children.router, prefix="/api/v1")
app.include_router(learning.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(parents.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")


@app.post("/api/v1/children/{child_id}/progress", response_model=schemas.ChildResponse)
def update_child_progress(
    child_id: int,
    progress: schemas.ProgressUpdate,
    db: Session = Depends(get_db)
):
    child = db.query(models.Child).filter(models.Child.id == child_id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    child.total_xp = (child.total_xp or 0) + progress.xp_added
    child.level = (child.total_xp // 50) + 1

    db.commit()
    db.refresh(child)
    return child