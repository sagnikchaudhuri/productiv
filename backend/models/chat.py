import enum
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, func, Enum
from sqlalchemy.orm import relationship
from core.database import Base

class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    user = relationship("User", back_populates="chat_messages")
