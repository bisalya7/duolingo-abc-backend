from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

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

# --- Новые схемы для геймификации и уведомлений ---

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime
    class Config: from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    child_name: str
    total_xp: int
    level: int

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon_url: str
    earned_at: datetime
    class Config: from_attributes = True

class ProgressUpdate(BaseModel):
        xp_added: int