from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Boolean, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="PARENT") # По ТЗ роли: PARENT, ADMIN
    children = relationship("Child", back_populates="parent")
    notifications = relationship("Notification", back_populates="user")

class Child(Base):
    __tablename__ = "children"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    
    daily_streak = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)

    parent_id = Column(Integer, ForeignKey("users.id"))
    parent = relationship("User", back_populates="children")
    progress = relationship("Progress", back_populates="child")
    badges = relationship("ChildBadge", back_populates="child")

class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    order = Column(Integer)
    lessons = relationship("Lesson", back_populates="unit")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    order = Column(Integer)
    xp_reward = Column(Integer, default=10)
    unit_id = Column(Integer, ForeignKey("units.id"))
    unit = relationship("Unit", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson")
    progress = relationship("Progress", back_populates="lesson")

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # phonics, handwriting, sight_words, vocabulary
    content = Column(JSON)
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    lesson = relationship("Lesson", back_populates="exercises")

class Progress(Base):
    __tablename__ = "progress"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    score = Column(Integer) # Количество звезд (1-3)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    child = relationship("Child", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Родитель, которому пришло уведомление
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="notifications")

class Badge(Base):
    """Справочник всех возможных достижений (Например: 'Первый урок', '100 XP')"""
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    icon_url = Column(String) # Название иконки для фронтенда

class ChildBadge(Base):
    """Связь: какой ребенок какой бейдж получил и когда"""
    __tablename__ = "child_badges"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("children.id"))
    badge_id = Column(Integer, ForeignKey("badges.id"))
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    child = relationship("Child", back_populates="badges")
    badge = relationship("Badge")