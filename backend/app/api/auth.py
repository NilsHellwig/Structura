from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, JSONSchema
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth import verify_password, get_password_hash, create_access_token
import json

router = APIRouter(prefix="/auth", tags=["auth"])

DEFAULT_SCHEMAS = [
    {
        "name": "Sentiment Analysis",
        "schema": json.dumps({
            "type": "object",
            "properties": {
                "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                "confidence": {"type": "number"}
            },
            "required": ["sentiment", "confidence"]
        }, indent=2)
    },
    {
        "name": "Entity Extraction",
        "schema": json.dumps({
            "type": "object",
            "properties": {
                "entities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "type": {"type": "string", "enum": ["person", "location", "organization", "other"]}
                        }
                    }
                }
            }
        }, indent=2)
    },
    {
        "name": "Simple To-Do",
        "schema": json.dumps({
            "type": "object",
            "properties": {
                "tasks": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "priority": {"type": "string", "enum": ["low", "medium", "high"]}
            }
        }, indent=2)
    }
]

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Seed default schemas for the user
    for default_schema in DEFAULT_SCHEMAS:
        schema_obj = JSONSchema(
            user_id=new_user.id,
            name=default_schema["name"],
            schema=default_schema["schema"]
        )
        db.add(schema_obj)
    
    db.commit()
    
    return new_user


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    # Find user
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}
