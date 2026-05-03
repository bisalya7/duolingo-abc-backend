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
    level: int = 1
    total_xp: int = 0
    daily_streak: int = 0

    class Config:
        from_attributes = True


class ExerciseResponse(BaseModel):
    id: int
    type: str
    content: Any

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: int
    title: str
    order: int
    xp_reward: int
    exercises: List[ExerciseResponse] = []

    class Config:
        from_attributes = True


# ✅ Добавили child_id — больше не захардкожен как 1
class ProgressCreate(BaseModel):
    child_id: int
    lesson_id: int
    score: int


class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    xp_added: int
    # === СХЕМЫ ДЛЯ АДМИНКИ (Units & Lessons CRUD) ===

class UnitCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order: int

class UnitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class UnitResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order: int
    
    class Config:
        from_attributes = True

class LessonCreate(BaseModel):
    unit_id: int
    title: str
    order: int
    xp_reward: int = 10  # По умолчанию даем 10 XP за урок

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None
    xp_reward: Optional[int] = None
    unit_id: Optional[int] = None
    # schemas.py

class ExerciseCreate(BaseModel):
    lesson_id: int
    type: str  # 'match', 'listen', 'drag' и т.д.
    content: Any  # JSON с вопросом и вариантами
    answer: str

class ExerciseUpdate(BaseModel):
    type: Optional[str] = None
    content: Optional[Any] = None
    answer: Optional[str] = None
