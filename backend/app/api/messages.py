from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
from app.database import get_db
from app.models import Message, Conversation, MessageRole
from app.schemas.message import MessageResponse, MessageCreate, MessageUpdate
from app.dependencies import get_current_user
from app.models import User
from app.services.llm import generate_llm_response, generate_llm_response_stream

router = APIRouter(prefix="/conversations/{conversation_id}/messages", tags=["messages"])


@router.get("", response_model=List[MessageResponse])
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
        response_data = await generate_llm_response(
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
            content=response_data.get("content", ""),
            backend=message.backend,
            model=message.model,
            output_format=message.output_format,
            llm_parameters=message.llm_parameters,
            format_spec=message.format_spec
        )
        db.add(assistant_message)
        
        # Update conversation timestamp and auto-title
        conversation.updated_at = datetime.utcnow()
        if len(conversation.messages) <= 1:
            conversation.title = message.content[:50] + ("..." if len(message.content) > 50 else "")
            
        db.commit()
        db.refresh(assistant_message)
        
        return assistant_message
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating LLM response: {str(e)}"
        )


@router.post("/stream")
async def create_message_stream(
    conversation_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message and get streaming LLM response"""
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
    
    async def generate():
        full_content = ""
        try:
            # Send initial IDs
            yield f"data: {json.dumps({'user_message_id': user_message.id})}\n\n"

            async for chunk in generate_llm_response_stream(
                backend=message.backend,
                model=message.model,
                messages=_get_conversation_history(conversation_id, db),
                output_format=message.output_format,
                format_spec=message.format_spec,
                parameters=message.llm_parameters or {}
            ):
                if "content" in chunk:
                    full_content += chunk["content"]
                
                yield f"data: {json.dumps(chunk)}\n\n"
            
            # Save complete assistant message
            assistant_message = Message(
                conversation_id=conversation_id,
                role=MessageRole.assistant,
                content=full_content,
                backend=message.backend,
                model=message.model,
                output_format=message.output_format,
                llm_parameters=message.llm_parameters,
                format_spec=message.format_spec
            )
            db.add(assistant_message)
            
            # Update conversation
            conversation.updated_at = datetime.utcnow()
            if len(conversation.messages) <= 2: # User + initial
                conversation.title = message.content[:50] + ("..." if len(message.content) > 50 else "")
            
            db.commit()
            db.refresh(assistant_message)
            
            yield f"data: {json.dumps({'done': True, 'assistant_message_id': assistant_message.id})}\n\n"
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@router.patch("/{message_id}", response_model=MessageResponse)
def update_message(
    conversation_id: int,
    message_id: int,
    message_update: MessageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a message. If it's a user message, delete all subsequent messages."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    message = db.query(Message).filter(Message.id == message_id, Message.conversation_id == conversation_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    message.content = message_update.content
    
    # If it's a user message, delete all subsequent messages in this conversation
    if message.role == MessageRole.user:
        db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.created_at > message.created_at
        ).delete()
    
    db.commit()
    db.refresh(message)
    return message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    conversation_id: int,
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a single message."""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    message = db.query(Message).filter(Message.id == message_id, Message.conversation_id == conversation_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    db.delete(message)
    db.commit()
    return None


def _get_conversation_history(conversation_id: int, db: Session) -> List[dict]:
    """Get conversation history for LLM context"""
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    history = []
    for msg in messages:
        history.append({"role": msg.role.value, "content": msg.content})
    return history
