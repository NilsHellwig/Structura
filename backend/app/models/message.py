from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"


class OutputFormat(str, enum.Enum):
    freetext = "freetext"
    json = "json"
    template = "template"
    regex = "regex"


class LLMBackend(str, enum.Enum):
    openai = "openai"
    vllm = "vllm"
    ollama = "ollama"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # LLM-specific fields (only for assistant messages)
    backend = Column(Enum(LLMBackend), nullable=True)
    model = Column(String, nullable=True)
    output_format = Column(Enum(OutputFormat), nullable=True)
    
    # Parameters used for generation (stored as JSON)
    llm_parameters = Column(JSON, nullable=True)
    
    # Format specification (JSON schema, template, or regex)
    format_spec = Column(Text, nullable=True)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
