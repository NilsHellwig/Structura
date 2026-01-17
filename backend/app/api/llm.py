from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.schemas.message import LLMBackend
from app.services.llm import get_available_models
from pydantic import BaseModel

router = APIRouter(prefix="/llm", tags=["llm"])


class ModelsRequest(BaseModel):
    backend: LLMBackend
    parameters: Dict[str, Any] = {}


class ModelsResponse(BaseModel):
    models: List[str]


@router.post("/models", response_model=ModelsResponse)
async def list_models(request: ModelsRequest):
    """Get available models for a specific backend"""
    try:
        models = await get_available_models(request.backend, request.parameters)
        return ModelsResponse(models=models)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching models: {str(e)}"
        )
