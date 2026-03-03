
from Utils.db_operations import addMessage, getChatSession, getExpertDashboard, getExpertRequests
from data_gen.weekly_sug_extract import extract_and_load_weekly_advice
from database import get_session
from models import ChatSession, Expert, ExpertRequests, MessageData, User
from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy import func
from Utils.dependencies import verify_token
from Utils.messageSending import EmailClient

router = APIRouter()

@router.post("/addWeeklyAdvice")
def addWeeklyAdvice(session=Depends(get_session)):
    extract_and_load_weekly_advice(session, "C:\\Documents\\farmerAssist\\backend\\data_gen\\weekly_advice_example.json")
    return


@router.post("/expertAdvice")
def expertAdvice(MessageData: MessageData, session=Depends(get_session)):
    try:
        addMessage(session, MessageData)
        # Mark the expert request as answered for this session (so it moves off pending)
        try:
            # Below filter is intentionally lenient (avoid breaking if no request exists)
            expert_request = session.query(ExpertRequests).filter(ExpertRequests.session_id == MessageData.sessionId).first()
            if expert_request:
                expert_request.status = "answered"
                try:
                    expert_request.responded_at = func.now()
                except Exception:
                    pass
                session.commit()
        except Exception as e:
            # Rollback to prevent subsequent queries from failing due to aborted transaction
            session.rollback()
            # Don't fail message send if request status update fails
            print(f"Expert request status update skipped: {e}")
            
        chat_session = getChatSession(session, MessageData.sessionId)
        if chat_session:
            user = session.query(User).filter(User.id == chat_session.user_id).first()
            if user and user.email:
                to_email = user.email
                try:
                    email_client = EmailClient()
                    chat_url = f"http://localhost:5173/chat?session={MessageData.sessionId}"
                    user_lang = chat_session.cropdata.get('user_language', 'en') if chat_session.cropdata else 'en'
                    email_client.send_expert_reply_email(to_email, chat_url, user_lang)
                    
                    from models import Notification
                    new_notif = Notification(
                        user_id=user.id,
                        session_id=MessageData.sessionId,
                        expert_name="Expert",
                        message=MessageData.content
                    )
                    session.add(new_notif)
                    session.commit()
                except Exception as e:
                    print(f"Failed to send email notification or save notif: {e}")

        return {"success": True, "message": "Reply sent"}
    except Exception as e:
        print(f"Error in expertAdvice endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add expert reply"
        )


@router.get("/getPendingQueries")
def getPendingQueries(session=Depends(get_session), expert_id: int = None):
    if expert_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expert ID is required"
        )
    try:
        pending_queries = getExpertRequests(session, expert_id)
        return {"success": True, "pending_queries": pending_queries}
    except Exception as e:
        print(f"Error in getPendingQueries endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pending queries"
        )

@router.get("/dashboard")
def expertDashboard(session=Depends(get_session), user=Depends(verify_token)):
    """
    Get expert dashboard data:
    - All escalated/pending sessions
    - Answered/closed sessions for this expert
    """
    try:
        # Check if user is an expert
        if user.role != "expert":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not an expert"
            )
        
        # Get expert record to get expert_id (which is user_id for experts)
        expert_record = session.query(Expert).filter(Expert.user_id == user.id).first()
        if not expert_record:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Expert record not found"
            )
        
        expert_id = expert_record.user_id
        dashboard_data = getExpertDashboard(session, expert_id)
        return dashboard_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in expertDashboard endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expert dashboard data"
        )
    
