from models import OTPCode, UserReq, User, ChatSession, CropAdvice, Expert, Message, ExpertRequests, Locations, MessageData, DiseaseDetection
from sqlmodel import Session
from database import engine, get_session
from sqlalchemy import select, and_, func
from fastapi import Depends

def addOTP(session: Session, user: UserReq):
    try:
        otpcode = OTPCode(
            mobileNo=user.mobileNo,
            otp_hash=user.otp,
        )
        session.add(otpcode)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error adding OTP: {e}")
        return False
    return True

def getOtp(session: Session, mobileNo: str): 
    otp_record = (
        session.query(OTPCode)
        .filter(
            OTPCode.mobileNo == mobileNo,
            OTPCode.is_used == False
        )
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    return otp_record

def setOtpUsed(session: Session, mobileNo: str):
    otp_record = getOtp(session, mobileNo)
    if otp_record:
        otp_record.is_used = True
        session.commit()
        return True
    return False

def get_suggestion(crop, district=None, disease=None):
    
    """Fetches agricultural advice and suggestions from the database.

    Args:
        crop (str): The name of the crop (e.g., 'rice', 'cotton'), This takes crop name in english.
        district (str, optional): The district where the farm is located.
        disease (str, optional): The name of the disease affecting the crop.

    Returns:
        list: A list of dictionaries containing district, crop, stage, and advice.
    """
    if crop:
        crop = crop.strip().lower()

    with Session(engine) as session:
        if district == None and disease == None:
            stmt = select(CropAdvice.id,
            CropAdvice.district,
            CropAdvice.crop,
            CropAdvice.stage,
            CropAdvice.problem_disease,
            CropAdvice.advice,
            ).where(
                CropAdvice.crop.ilike(f"%{crop}%")
            )

            crop_advice = session.execute(stmt).mappings().all()
            return [dict(row) for row in crop_advice]
        elif district!=None and disease==None:
            district=district.strip().lower()
            stmt = select(CropAdvice.id,
            CropAdvice.district,
            CropAdvice.crop,
            CropAdvice.stage,
            CropAdvice.problem_disease,
            CropAdvice.advice,
            ).where(
                CropAdvice.crop.ilike(f"%{crop}%"), CropAdvice.district==district
            )
            crop_advice = session.execute(stmt).mappings().all()
            if crop_advice==[]:
                return get_suggestion(crop)
            return [dict(row) for row in crop_advice]

        elif district==None and disease!=None:
            disease = disease.strip().lower()
            stmt = select(CropAdvice.id,
            CropAdvice.district,
            CropAdvice.crop,
            CropAdvice.stage,
            CropAdvice.problem_disease,
            CropAdvice.advice,
            ).where(
                CropAdvice.crop.ilike(f"%{crop}%"), CropAdvice.problem_disease==disease
            )
            crop_advice = session.execute(stmt).mappings().all()
            if crop_advice==[]:
                return get_suggestion(crop)
            return [dict(row) for row in crop_advice]
        else:
            disease = disease.strip().lower()
            district=district.strip().lower()
            disease = disease.strip().lower()
            district=district.strip().lower()
            stmt = select(CropAdvice.id,
            CropAdvice.district,
            CropAdvice.crop,
            CropAdvice.stage,
            CropAdvice.problem_disease,
            CropAdvice.advice,
            ).where(
                CropAdvice.crop.ilike(f"%{crop}%"), CropAdvice.problem_disease==disease, CropAdvice.district==district
            )
            crop_advice = session.execute(stmt).mappings().all()
            if crop_advice==[]:
                return get_suggestion(crop, district) + get_suggestion(crop, disease=disease)
            return [dict(row) for row in crop_advice]


def get_crop_data_from_chat_sessions(session: Session, sessionId):
    session_record = session.query(ChatSession).filter(ChatSession.id==sessionId).first()
    return session_record.cropdata
 

def addUser(session: Session, user: UserReq):
    try:
        new_user = User(mobileNo=user.mobileNo)
        session.add(new_user)
        session.commit()
        return new_user
    except Exception as e:
        session.rollback()
        print(f"Error adding user: {e}")
        return None


def getUserFromDB(session: Session, mobileNo: str):
    return session.query(User).filter(User.mobileNo == mobileNo).first()

def getExpert(session: Session, mobileNo: str):
   return session.query(User).filter(User.mobileNo == mobileNo, User.role == "expert").join(Expert, User.id == Expert.user_id).first()


def addExpertToDB(session: Session, mobileNo: str, name: str):
    
    try:
        user = getUserFromDB(session, mobileNo)
        if not user:
            user = User(mobileNo=mobileNo, role="expert")
            session.add(user)
            session.flush()  # Flush to get the user ID
        else:
            user.role = "expert"
        
        existing_expert = session.query(Expert).filter(Expert.user_id == user.id).first()
        if existing_expert:
            return (existing_expert, False)
        
        expert = Expert(
            user_id=user.id,
            name=name
        )
        session.add(expert)
        session.commit()
        return (expert, True)
    except Exception as e:
        session.rollback()
        print(f"Error adding expert: {e}")
        raise



def addMessage(session: Session, message: MessageData):
    try:
        message = Message(
            session_id=message.sessionId,
            role=message.role,
            content=message.content
        )
        session.add(message)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"Error adding message: {e}")
        return False
    
def addExpertRequest(session: Session, sessionId):
    try:
        expertId = session.query(Expert).outerjoin(
                ExpertRequests,
                and_(
                    Expert.user_id == ExpertRequests.expert_id,
                    ExpertRequests.status.in_(["pending", "in_progress"])
                )
            ).filter(
                Expert.is_available == True
            ).group_by(
                Expert.user_id
            ).order_by(
                func.count(ExpertRequests.id).asc()
            ).first().user_id
        expert_request = ExpertRequests(
            session_id=sessionId,
            expert_id=expertId,
            status="pending"
        )
        session.add(expert_request)
        session.query(ChatSession).filter(ChatSession.id == sessionId).update({"escalated": True})
        session.commit()
        return session.query(Expert).filter(Expert.user_id == expertId).first()
    except Exception as e:
        session.rollback()
        print(f"Error adding expert request: {e}")
        return None
    

def getExpertRequests(session: Session, expert_id: int):
    requests = (
        session.query(ExpertRequests)
        .filter(ExpertRequests.expert_id == expert_id)
        .order_by(ExpertRequests.created_at.asc())
        .all()
    )
    return [
        {
            "id": r.id,
            "session_id": str(r.session_id),
            "expert_id": r.expert_id,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in requests
    ]    

def deleteExpertRequest(session: Session, sessionId):
    try:
        expert_request = session.query(ExpertRequests).filter(ExpertRequests.session_id == sessionId).first()
        if expert_request:
            session.delete(expert_request)
            session.commit()
            return True
        return False
    except Exception as e:
        session.rollback()
        print(f"Error deleting expert request: {e}")
        return False
    
def getMessages(session: Session, sessionId):
    messages = session.query(Message).filter(Message.session_id == sessionId).order_by(Message.created_at.asc()).all()
    return [message for message in messages]


def getChatSession(session: Session, sessionId):
    return session.query(ChatSession).filter(ChatSession.id == sessionId).first()

def getChatSessions(session: Session, userId: int):
    results = session.query(ChatSession).filter(ChatSession.user_id == userId).order_by(ChatSession.created_at.desc()).all()
    ans = []
    for result in results:
        ans.append({
            "id": result.id,
            "cropdata": result.cropdata,
            "user_id": result.user_id,
            "created_at": result.created_at,
            "escalated": result.escalated,
            "type": "crop_advice"
        })
    return ans


def getDistrictsFromDB(session: Session, state):
    rows = session.query(Locations.district).filter(Locations.state.ilike(state)).distinct().order_by(Locations.district).all()
    return [row[0] for row in rows]

def getStatesFromDB(session: Session):
    rows = session.query(Locations.state).distinct().order_by(Locations.state).all()
    return [row[0] for row in rows]

def getCitiesFromDB(session: Session, district: str, query: str = ""):
    rows = (
        session.query(Locations.city)
        .filter(Locations.district.ilike(district))
        .filter(Locations.city.ilike(f"{query}%") if query else True)
        .distinct()
        .order_by(Locations.city)
        .limit(10)
        .all()
    )
    return [row[0] for row in rows]


def addDiseaseDetection(session: Session, userId: int, result: dict, image_path: str):
    try:
        disease_detection = DiseaseDetection(
            userId=userId,
            image=image_path,
            disease=result["disease"],
            confidence=result["confidence"]
        )
        session.add(disease_detection)
        session.commit()
        session.refresh(disease_detection)
        return disease_detection.id
    except Exception as e:
        session.rollback()
        print(f"Error adding disease detection: {e}")
        return False

def getDiseaseDetectionHistory(session: Session, userId: int):
    results = session.query(DiseaseDetection).filter(DiseaseDetection.userId == userId).all()
    ans = []
    for result in results:
        ans.append({
            "id": result.id,
            "image": result.image,
            "disease": result.disease,
            "confidence": result.confidence,
            "created_at": result.created_at,
            "type": "disease_detection"
        })
    return ans


def getDiseaseDetectionById(session: Session, detectionId: int, userId: int):
    result = session.query(DiseaseDetection).filter(DiseaseDetection.id == detectionId, DiseaseDetection.userId == userId).first()
    if result:
        return {
            "id": result.id,
            "image": result.image,
            "disease": result.disease,
            "confidence": result.confidence,
            "created_at": result.created_at,
            "type": "disease_detection"
        }
    return None

def getExpertDashboard(session: Session, expert_id: int = None):
    """
    Get dashboard data for experts.
    Returns: {pending: [], answered: []}
    - pending: expert_requests with status pending/in_progress for this expert
    - answered: expert_requests with status answered/closed for this expert
    """
    def _build_session_item(req, cs, user):
        return {
            "session_id": str(cs.id),
            "cropdata": cs.cropdata or {},
            "farmer_mobile": user.mobileNo if user else None,
            "user_id": cs.user_id,
            "created_at": cs.created_at.isoformat() if cs.created_at else None,
            "escalated": cs.escalated,
            "expert_request_status": req.status,
            "expert_request_id": req.id,
        }

    pending = []
    answered = []

    if not expert_id:
        return {"pending": pending, "answered": answered}

    all_requests = (
        session.query(ExpertRequests)
        .filter(ExpertRequests.expert_id == expert_id)
        .order_by(ExpertRequests.created_at.desc())
        .all()
    )

    for req in all_requests:
        cs = session.query(ChatSession).filter(ChatSession.id == req.session_id).first()
        if not cs:
            continue
        user = session.query(User).filter(User.id == cs.user_id).first()
        item = _build_session_item(req, cs, user)

        if req.status in ("pending", "in_progress"):
            pending.append(item)
        elif req.status in ("answered", "closed"):
            answered.append(item)

    return {"pending": pending, "answered": answered}


def getTotalFarmers(session: Session):
    total_users = session.query(func.count(User.id))\
        .filter(User.role == "farmer")\
        .scalar()
    return total_users

def getExpertsList(session: Session):
    total_experts = session.query(
        Expert.user_id,
        Expert.name,
        Expert.is_available,
        User.mobileNo
    ).join(User, User.id == Expert.user_id).all()
    return total_experts

def getChatSessionsList(session: Session):
    sessions = session.query(func.count(ChatSession.id)).scalar()
    return sessions



def getEscalatedChatSessionCount(session: Session):
    escalated_sessions = session.query(func.count(ChatSession.id))\
        .filter(ChatSession.escalated == True)\
        .scalar()
    return escalated_sessions

def getBotChatSessionCount(session: Session):
    bot_sessions = session.query(func.count(ChatSession.id))\
        .filter(ChatSession.escalated == False)\
        .scalar()
    return bot_sessions



def getTotalDiseaseDetectionsCount(session: Session):
    total_scans = session.query(func.count(DiseaseDetection.id)).scalar()
    return total_scans


def getExpertReqByStatus(session: Session):
    expert_req_by_status = session.query(
        ExpertRequests.status,
        func.count(ExpertRequests.id).label("count")
    ).group_by(ExpertRequests.status).all()
    return expert_req_by_status
