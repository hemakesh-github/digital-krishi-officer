from Utils.db_operations import getChatSessions, getDiseaseDetectionHistory
from Utils.dependencies import verify_token
from database import get_session
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.post("/history")
def get_history(userId: dict, user: str = Depends(verify_token), session=Depends(get_session)):
    userId = userId["userId"]
    
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

from models import Notification

@router.get("/notifications")
def get_notifications(session=Depends(get_session), user: str = Depends(verify_token)):
    try:
        notifications = session.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).all()
        return [{"id": n.id, "session_id": n.session_id, "expert_name": n.expert_name, "message": n.message, "created_at": n.created_at} for n in notifications]
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, session=Depends(get_session), user: str = Depends(verify_token)):
    try:
        notif = session.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user.id).first()
        if notif:
            notif.is_read = True
            session.commit()
            return {"success": True}
        return {"success": False, "error": "Not found"}
    except Exception as e:
        print(f"Error marking notification read: {e}")
        return {"success": False}