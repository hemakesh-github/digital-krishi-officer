from Utils.db_operations import getChatSessions, getDiseaseDetectionHistory
from Utils.dependencies import verify_token
from database import get_session
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.post("/history")
def get_history(userId: dict, user: str = Depends(verify_token), session=Depends(get_session)):
    userId = userId["userId"]
    
    print(user)
    try:
        chat_sessions = getChatSessions(session, userId)
        disease_detections = getDiseaseDetectionHistory(session, userId)
        return chat_sessions + disease_detections
    except Exception as e:
        print(f"Error in get_history endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve history"
        )