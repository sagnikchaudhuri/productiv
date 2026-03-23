from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from core.database import Base

class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(String(400))
    target_days_per_week = Column(Integer, default=7)
    color = Column(String(20), default="cyan")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")

class HabitLog(Base):
    __tablename__ = "habit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False, index=True)
    log_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=True)
    note = Column(String(300))
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="habit_logs")
    habit = relationship("Habit", back_populates="logs")
