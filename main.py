import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from schemas import UserCreate, Token 
from routers import auth, children, learning 

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Duolingo ABC Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(children.router)
app.include_router(learning.router)

@app.get("/")
def read_root():
    return {"message": "Server is running! Check /docs"}