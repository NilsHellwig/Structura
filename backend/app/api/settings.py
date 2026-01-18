from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, BackendSetting
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/settings", tags=["settings"])

class BackendSettingSchema(BaseModel):
    backend: str
    base_url: Optional[str] = None
    api_key: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/backends", response_model=List[BackendSettingSchema])
async def get_backend_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(BackendSetting).filter(BackendSetting.user_id == current_user.id).all()

@router.post("/backends", response_model=BackendSettingSchema)
async def update_backend_setting(
    setting: BackendSettingSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_setting = db.query(BackendSetting).filter(
        BackendSetting.user_id == current_user.id,
        BackendSetting.backend == setting.backend
    ).first()

    if db_setting:
        db_setting.base_url = setting.base_url
        db_setting.api_key = setting.api_key
    else:
        db_setting = BackendSetting(
            user_id=current_user.id,
            backend=setting.backend,
            base_url=setting.base_url,
            api_key=setting.api_key
        )
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting
