
from LLM.multi_tool_agent.agent import query_agent
from Utils.db_operations import get_crop_data_from_chat_sessions
from Utils.dependencies import verify_token
from database import get_session
from models import CropData
from fastapi import APIRouter, Depends, HTTPException, status


router = APIRouter()

@router.post("/new_chat")
async def new_crop_advice_chat(cropData: CropData, user=Depends(verify_token), session=Depends(get_session)):
    x = await query_agent(cropData, dbSession = session, userId=user.id)
    # return {
    #     "crop_name": "Rice",
    #     "disease_identified": "Leaf Folder",
    #     "recommended_action": "Spray acephate @1.5 g/l or chlorantraniliprole @0.3 ml/l to control leaf folder.",
    #     "needs_escalation": False,
    #     "sessionId": "04cdf1fa-f733-4257-90d8-f3ffd3f63b3f"
    # }
    return x

@router.post("/continue_chat/{sessionId}")
async def continue_crop_advice_chat(sessionId, query: dict, session=Depends(get_session), user=Depends(verify_token)):
    cropData = get_crop_data_from_chat_sessions(session, sessionId)
    cropData = CropData(**cropData)
    cropData.query = query["query"]
    print(cropData, sessionId)
    x = await query_agent(cropData, dbSession=session, sessionId = sessionId, userId=user.id)
    return x