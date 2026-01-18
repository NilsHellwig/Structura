from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import JSONSchema, Template, RegexPattern, CSVPreset
from app.schemas.formats import (
    JSONSchemaResponse, JSONSchemaCreate, JSONSchemaUpdate,
    TemplateResponse, TemplateCreate, TemplateUpdate,
    RegexPatternResponse, RegexPatternCreate, RegexPatternUpdate,
    CSVPresetResponse, CSVPresetCreate, CSVPresetUpdate
)
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/formats", tags=["formats"])


# JSON Schema endpoints
@router.get("/schemas", response_model=List[JSONSchemaResponse])
def get_json_schemas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all JSON schemas for the current user"""
    schemas = db.query(JSONSchema).filter(
        JSONSchema.user_id == current_user.id
    ).order_by(JSONSchema.updated_at.desc()).all()
    return schemas


@router.post("/schemas", response_model=JSONSchemaResponse, status_code=status.HTTP_201_CREATED)
def create_json_schema(
    schema: JSONSchemaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new JSON schema"""
    new_schema = JSONSchema(
        user_id=current_user.id,
        name=schema.name,
        schema=schema.schema
    )
    db.add(new_schema)
    db.commit()
    db.refresh(new_schema)
    return new_schema


@router.patch("/schemas/{schema_id}", response_model=JSONSchemaResponse)
def update_json_schema(
    schema_id: int,
    schema_update: JSONSchemaUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a JSON schema"""
    schema = db.query(JSONSchema).filter(
        JSONSchema.id == schema_id,
        JSONSchema.user_id == current_user.id
    ).first()
    
    if not schema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schema not found"
        )
    
    if schema_update.name is not None:
        schema.name = schema_update.name
    if schema_update.schema is not None:
        schema.schema = schema_update.schema
    
    db.commit()
    db.refresh(schema)
    return schema


@router.delete("/schemas/{schema_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_json_schema(
    schema_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a JSON schema"""
    schema = db.query(JSONSchema).filter(
        JSONSchema.id == schema_id,
        JSONSchema.user_id == current_user.id
    ).first()
    
    if not schema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schema not found"
        )
    
    db.delete(schema)
    db.commit()
    return None


# Template endpoints
@router.get("/templates", response_model=List[TemplateResponse])
def get_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all templates for the current user"""
    templates = db.query(Template).filter(
        Template.user_id == current_user.id
    ).order_by(Template.updated_at.desc()).all()
    return templates


@router.post("/templates", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    template: TemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new template"""
    new_template = Template(
        user_id=current_user.id,
        name=template.name,
        content=template.content
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template


@router.patch("/templates/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    template_update: TemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a template"""
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if template_update.name is not None:
        template.name = template_update.name
    if template_update.content is not None:
        template.content = template_update.content
    
    db.commit()
    db.refresh(template)
    return template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a template"""
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    db.delete(template)
    db.commit()
    return None


# Regex Pattern endpoints
@router.get("/regex", response_model=List[RegexPatternResponse])
def get_regex_patterns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all regex patterns for the current user"""
    patterns = db.query(RegexPattern).filter(
        RegexPattern.user_id == current_user.id
    ).order_by(RegexPattern.updated_at.desc()).all()
    return patterns


@router.post("/regex", response_model=RegexPatternResponse, status_code=status.HTTP_201_CREATED)
def create_regex_pattern(
    pattern: RegexPatternCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new regex pattern"""
    new_pattern = RegexPattern(
        user_id=current_user.id,
        name=pattern.name,
        pattern=pattern.pattern
    )
    db.add(new_pattern)
    db.commit()
    db.refresh(new_pattern)
    return new_pattern


@router.patch("/regex/{pattern_id}", response_model=RegexPatternResponse)
def update_regex_pattern(
    pattern_id: int,
    pattern_update: RegexPatternUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a regex pattern"""
    pattern = db.query(RegexPattern).filter(
        RegexPattern.id == pattern_id,
        RegexPattern.user_id == current_user.id
    ).first()
    
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pattern not found"
        )
    
    if pattern_update.name is not None:
        pattern.name = pattern_update.name
    if pattern_update.pattern is not None:
        pattern.pattern = pattern_update.pattern
    
    db.commit()
    db.refresh(pattern)
    return pattern


@router.delete("/regex/{pattern_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_regex_pattern(
    pattern_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a regex pattern"""
    pattern = db.query(RegexPattern).filter(
        RegexPattern.id == pattern_id,
        RegexPattern.user_id == current_user.id
    ).first()
    
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pattern not found"
        )
    
    db.delete(pattern)
    db.commit()
    return None


# CSV Preset endpoints
@router.get("/csv", response_model=List[CSVPresetResponse])
def get_csv_presets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all CSV presets for the current user"""
    presets = db.query(CSVPreset).filter(
        CSVPreset.user_id == current_user.id
    ).order_by(CSVPreset.updated_at.desc()).all()
    return presets


@router.post("/csv", response_model=CSVPresetResponse, status_code=status.HTTP_201_CREATED)
def create_csv_preset(
    preset: CSVPresetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new CSV preset"""
    new_preset = CSVPreset(
        user_id=current_user.id,
        name=preset.name,
        columns=preset.columns
    )
    db.add(new_preset)
    db.commit()
    db.refresh(new_preset)
    return new_preset


@router.patch("/csv/{preset_id}", response_model=CSVPresetResponse)
def update_csv_preset(
    preset_id: int,
    preset_update: CSVPresetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a CSV preset"""
    preset = db.query(CSVPreset).filter(
        CSVPreset.id == preset_id,
        CSVPreset.user_id == current_user.id
    ).first()
    
    if not preset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preset not found"
        )
    
    if preset_update.name is not None:
        preset.name = preset_update.name
    if preset_update.columns is not None:
        preset.columns = preset_update.columns
    
    db.commit()
    db.refresh(preset)
    return preset


@router.delete("/csv/{preset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_csv_preset(
    preset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a CSV preset"""
    preset = db.query(CSVPreset).filter(
        CSVPreset.id == preset_id,
        CSVPreset.user_id == current_user.id
    ).first()
    
    if not preset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preset not found"
        )
    
    db.delete(preset)
    db.commit()
    return None
