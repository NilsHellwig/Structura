from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Message, Conversation, MessageRole
from app.schemas.message import MessageResponse, MessageCreate
from app.dependencies import get_current_user
from app.models import User
from app.services.llm import generate_llm_response

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["messages"])


@router.get("/", response_model=List[MessageResponse])
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a conversation"""
    # Verify conversation belongs to user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    return messages


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    conversation_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message and get LLM response"""
    # Verify conversation belongs to user
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Save user message
    user_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.user,
        content=message.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Generate LLM response
    try:
        llm_response = await generate_llm_response(
            backend=message.backend,
            model=message.model,
            messages=_get_conversation_history(conversation_id, db),
            output_format=message.output_format,
            format_spec=message.format_spec,
            parameters=message.llm_parameters or {}
        )
        
        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation_id,
            role=MessageRole.assistant,
            content=llm_response,
            backend=message.backend,
            model=message.model,
            output_format=message.output_format,
            llm_parameters=message.llm_parameters,
            format_spec=message.format_spec
        )
        db.add(assistant_message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        
        # Auto-generate title if it's the first message
        if len(conversation.messages) == 0:
            conversation.title = message.content[:50] + ("..." if len(message.content) > 50 else "")
        
        db.commit()
        db.refresh(assistant_message)
        
        return assistant_message
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating LLM response: {str(e)}"
        )


def _get_conversation_history(conversation_id: int, db: Session) -> List[dict]:
    """Get conversation history for LLM context"""
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    return [
        {"role": msg.role.value, "content": msg.content}
        for msg in messages
    ]
