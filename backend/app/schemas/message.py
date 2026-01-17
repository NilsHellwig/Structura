from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"


class OutputFormat(str, Enum):
    default = "default"
    json = "json"
    template = "template"
    regex = "regex"


class LLMBackend(str, Enum):
    openai = "openai"
    vllm = "vllm"
    ollama = "ollama"


class MessageBase(BaseModel):
    role: MessageRole
    content: str


class MessageCreate(BaseModel):
    content: str
    backend: LLMBackend
    model: str
    output_format: OutputFormat
    llm_parameters: Optional[Dict[str, Any]] = None
    format_spec: Optional[str] = None  # JSON schema, template, or regex


class MessageUpdate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: MessageRole
    content: str
    created_at: datetime
    backend: Optional[LLMBackend] = None
    model: Optional[str] = None
    output_format: Optional[OutputFormat] = None
    llm_parameters: Optional[Dict[str, Any]] = None
    format_spec: Optional[str] = None

    class Config:
        from_attributes = True
