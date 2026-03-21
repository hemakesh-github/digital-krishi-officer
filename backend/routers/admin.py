
from Utils.db_operations import addExpertToDB, getBotChatSessionCount, getChatSessionsList, getEscalatedChatSessionCount, getExpertReqByStatus, getExpertsList, getTotalDiseaseDetectionsCount, getTotalFarmers
from fastapi import APIRouter, Depends, HTTPException, status
from database import get_session
from models import ExpertData


router = APIRouter()


@router.post("/addExpert")
def addExpert(expert: ExpertData, session=Depends(get_session)):
    try:
        if not expert.mobileNo or not expert.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number and name are required"
            )
        
        expert_obj, is_new = addExpertToDB(session, expert.mobileNo, expert.name)
        
        if is_new:
            message = "Expert added successfully"
        else:
            message = f"Expert with mobile number {expert.mobileNo} already exists"
        
        return {
            "success": True,
            "is_new": is_new,
            "message": message,
            "expert": {
                "user_id": expert_obj.user_id,
                "name": expert_obj.name,
                "is_available": expert_obj.is_available
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error in addExpert endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add expert"
        )
    


@router.get("/dashboard")
async def admin_dashboard(session = Depends(get_session)):

    # Users
    total_users = getTotalFarmers(session)

    # Experts
    experts_list = getExpertsList(session)
    total_experts = len(experts_list)
    available_experts = sum(1 for e in experts_list if e.is_available)

    # Chat Sessions 
    total_sessions = getChatSessionsList(session)

    # Escalated
    escalated_sessions = getEscalatedChatSessionCount(session)

    # Bot-only
    bot_sessions = getBotChatSessionCount(session)

    # Disease Detections 
    total_scans = getTotalDiseaseDetectionsCount(session)

   
    expert_req_by_status = getExpertReqByStatus(session)

    expert_req_stats = {row.status: row.count for row in expert_req_by_status}

    # Assemble response
    return {
        # Counts
        "total_users":         total_users,
        "total_experts":       total_experts,
        "available_experts":   available_experts,
        "total_sessions":      total_sessions,
        "escalated_sessions":  escalated_sessions,
        "bot_sessions":        bot_sessions,
        "total_scans":         total_scans,

        "expert_requests": expert_req_stats,  

        "experts": [
            {
                "user_id":      e.user_id,
                "name":         e.name,
                "is_available": e.is_available,
                "mobileNo":     e.mobileNo,
            }
            for e in experts_list
        ],
    }

