
from Utils.db_operations import addMessage, getChatSession, getExpertDashboard, getExpertRequests
from data_gen.weekly_sug_extract import extract_and_load_weekly_advice
from database import get_session
from models import ChatSession, Expert, ExpertRequests, MessageData, User
from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy import func
from Utils.dependencies import verify_token


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
            expert_request = (
                session.query(ExpertRequests)
                .filter(ExpertRequests.session_id == MessageData.sessionId)
                .filter(ExpertRequests.expert_id == session.query(Expert).filter(Expert.user_id == ExpertRequests.expert_id).first().user_id if False else ExpertRequests.expert_id)
                .first()
            )
            # Above filter is intentionally lenient (avoid breaking if no request exists)
            expert_request = session.query(ExpertRequests).filter(ExpertRequests.session_id == MessageData.sessionId).first()
            if expert_request:
                expert_request.status = "answered"
                try:
                    
                    expert_request.responded_at = func.now()
                except Exception:
                    pass
                session.commit()
        except Exception as e:
            # Don't fail message send if request status update fails
            print(f"Expert request status update skipped: {e}")
        chat_session = getChatSession(session, MessageData.sessionId)
        if chat_session:
            user = session.query(User).filter(User.id == chat_session.user_id).first()
            if user:
                to_number = user.mobileNo
        # twillio_client = TwillioClient()
        # msg = "An expert has replied to your query on digital krishi officer application. Please visit the website for details."
        # twillio_client.send_sms(to_number, msg)

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
    
