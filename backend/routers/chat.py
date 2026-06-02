from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Annotated

from database import get_db
from routers.auth import _get_current_user
from models.schema import User
from services.ai_agent import ask_financial_coach

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/message", response_model=ChatResponse)
def send_chat_message(
    payload: ChatMessage,
    current_user: Annotated[User, Depends(_get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Send a message to the AI Advisor. 
    Requires user to have `has_ai_access` == True.
    """
    if not current_user.has_ai_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to the AI Advisor. Please contact support."
        )
        
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )
        
    reply = ask_financial_coach(current_user, payload.message, db)
    return {"reply": reply}
