from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class JSONSchemaBase(BaseModel):
    name: str
    schema_content: str


class JSONSchemaCreate(JSONSchemaBase):
    pass


class JSONSchemaUpdate(BaseModel):
    name: Optional[str] = None
    schema_content: Optional[str] = None


class JSONSchemaResponse(JSONSchemaBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TemplateBase(BaseModel):
    name: str
    content: str


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None


class TemplateResponse(TemplateBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RegexPatternBase(BaseModel):
    name: str
    pattern: str


class RegexPatternCreate(RegexPatternBase):
    pass


class RegexPatternUpdate(BaseModel):
    name: Optional[str] = None
    pattern: Optional[str] = None


class RegexPatternResponse(RegexPatternBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
