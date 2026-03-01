from models import MessageData
from database import get_session
from Utils.db_operations import getMessages, addMessage
from fastapi import APIRouter, Depends, HTTPException, status
import json


router = APIRouter()

@router.get("/{sessionId}")
async def get_chat_session(sessionId, session=Depends(get_session)):
    messages = getMessages(session, sessionId)
    import ast
    for message in messages:
        try:
            message.content = json.loads(message.content)
        except json.JSONDecodeError:
            try:
                # Fallback for single-quoted strings (legacy data)
                message.content = ast.literal_eval(message.content)
            except:
                pass # Keep original string if all parsing fails
    return messages

@router.post("/message")
async def add_message(message: MessageData, session=Depends(get_session)):
    addMessage(session, message)
    return {"success": True}


