from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class ChildCreate(BaseModel):
    name: str
    age: int

class ChildResponse(BaseModel):
    id: int
    name: str
    age: int
    level: int
    total_xp: int
    class Config: from_attributes = True

class ExerciseResponse(BaseModel):
    id: int
    type: str
    content: Any
    class Config: from_attributes = True

class LessonResponse(BaseModel):
    id: int
    title: str
    order: int
    xp_reward: int
    exercises: List[ExerciseResponse] = []
    class Config: from_attributes = True

class ProgressCreate(BaseModel):
    lesson_id: int
    score: int