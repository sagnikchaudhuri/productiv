import enum
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
from core.database import Base

class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    done = "done"
    skipped = "skipped"

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    subject = Column(String(100))
    notes = Column(String(500))
    scheduled_date = Column(Date, nullable=False)
    start_time = Column(String(10))
    duration_minutes = Column(Integer, default=60)
    status = Column(Enum(TaskStatus), default=TaskStatus.pending)
    priority = Column(Integer, default=2)
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="tasks")
