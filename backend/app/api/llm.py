from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Message, Conversation, MessageRole
from app.schemas.message import LLMBackend, OutputFormat
from app.services.llm import get_available_models, generate_llm_response_stream
from app.dependencies import get_current_user
from app.models import User
from pydantic import BaseModel
import json
from datetime import datetime

router = APIRouter(prefix="/llm", tags=["llm"])


class ModelsRequest(BaseModel):
    backend: LLMBackend
    parameters: Dict[str, Any] = {}


class ModelsResponse(BaseModel):
    models: List[str]


class GenerateRequest(BaseModel):
    conversation_id: int
    message: str
    backend: LLMBackend
    model: str
    output_format: OutputFormat
    format_spec: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    message_id: Optional[int] = None


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


@router.post("/generate")
async def generate(
    request: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a streaming response from the LLM"""
    try:
        # Verify conversation belongs to user
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if request.message_id:
            # Edit mode: Update existing message and delete subsequent ones
            user_message = db.query(Message).filter(
                Message.id == request.message_id,
                Message.conversation_id == request.conversation_id
            ).first()
            if not user_message:
                raise HTTPException(status_code=404, detail="Message to edit not found")
            
            user_message.content = request.message
            user_message.backend = request.backend
            user_message.model = request.model
            user_message.output_format = request.output_format
            
            # Delete all messages after this one
            db.query(Message).filter(
                Message.conversation_id == request.conversation_id,
                Message.created_at > user_message.created_at
            ).delete()
            db.commit()
        else:
            # New message mode
            user_message = Message(
                conversation_id=request.conversation_id,
                role=MessageRole.user,
                content=request.message,
                backend=request.backend,
                model=request.model,
                output_format=request.output_format
            )
            db.add(user_message)
            db.commit()

        # Update title if it's the first message
        if not conversation.title or conversation.title == "New Conversation":
            conversation.title = request.message[:50] + ("..." if len(request.message) > 50 else "")
            db.commit()

        # Get history for the LLM
        history = db.query(Message).filter(
            Message.conversation_id == request.conversation_id
        ).order_by(Message.created_at).all()
        
        llm_messages = [{"role": m.role.value, "content": m.content} for m in history]
        
        async def stream_generator():
            # Send the IDs of the messages to the client
            yield f"data: {json.dumps({'user_message_id': user_message.id})}\n\n"
            
            accumulated_content = ""
            async for chunk in generate_llm_response_stream(
                backend=request.backend,
                model=request.model,
                messages=llm_messages,
                output_format=request.output_format,
                format_spec=request.format_spec,
                parameters=request.parameters or {}
            ):
                if chunk:
                    accumulated_content += chunk
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
            
            # Save assistant message once done
            if accumulated_content:
                assistant_message = Message(
                    conversation_id=request.conversation_id,
                    role=MessageRole.assistant,
                    content=accumulated_content,
                    backend=request.backend,
                    model=request.model,
                    output_format=request.output_format,
                    format_spec=request.format_spec,
                    llm_parameters=request.parameters
                )
                db.add(assistant_message)
                conversation.updated_at = datetime.utcnow()
                db.commit()
                yield f"data: {json.dumps({'assistant_message_id': assistant_message.id})}\n\n"
                
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating response: {str(e)}"
        )

