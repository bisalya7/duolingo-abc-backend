# models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Date, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    parent = "parent"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True, nullable=False)
    password_hash  = Column(String, nullable=False)
    role           = Column(Enum(UserRole), default=UserRole.parent, nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

    children       = relationship("Child", back_populates="parent", cascade="all, delete-orphan")
    notifications  = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    """Хранит refresh-токены для каждого пользователя."""
    __tablename__ = "refresh_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token      = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked    = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")


class Child(Base):
    __tablename__ = "children"

    id               = Column(Integer, primary_key=True, index=True)
    parent_id        = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name             = Column(String, nullable=False)
    age              = Column(Integer, nullable=False)
    avatar           = Column(String, default="🐱")
    level            = Column(Integer, default=1)
    total_xp         = Column(Integer, default=0)
    daily_streak     = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)

    parent   = relationship("User", back_populates="children")
    progress = relationship("Progress", back_populates="child", cascade="all, delete-orphan")
    badges   = relationship("ChildBadge", back_populates="child", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order       = Column(Integer, default=0)

    lessons = relationship("Lesson", back_populates="unit", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id        = Column(Integer, primary_key=True, index=True)
    unit_id   = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    title     = Column(String, nullable=False)
    order     = Column(Integer, default=0)
    xp_reward = Column(Integer, default=10)

    unit      = relationship("Unit", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan")
    progress  = relationship("Progress", back_populates="lesson")


class Exercise(Base):
    __tablename__ = "exercises"

    id        = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    type      = Column(String, nullable=False)  # match | listen | select_image | build_word
    content   = Column(Text, nullable=False)    # JSON-строка
    answer    = Column(String, nullable=True)   # правильный ответ (опционально)

    lesson = relationship("Lesson", back_populates="exercises")


class Progress(Base):
    __tablename__ = "progress"

    id           = Column(Integer, primary_key=True, index=True)
    child_id     = Column(Integer, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    lesson_id    = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    score        = Column(Integer, default=0)
    completed_at = Column(DateTime, default=datetime.utcnow)

    child  = relationship("Child", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")


class Badge(Base):
    __tablename__ = "badges"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    icon_url    = Column(String, nullable=False)

    child_badges = relationship("ChildBadge", back_populates="badge")


class ChildBadge(Base):
    __tablename__ = "child_badges"

    id        = Column(Integer, primary_key=True, index=True)
    child_id  = Column(Integer, ForeignKey("children.id", ondelete="CASCADE"), nullable=False)
    badge_id  = Column(Integer, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    earned_at = Column(DateTime, default=datetime.utcnow)

    child = relationship("Child", back_populates="badges")
    badge = relationship("Badge", back_populates="child_badges")


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message    = Column(String, nullable=False)
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")