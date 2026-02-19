from models import OTPCode, UserReq, User, ChatSession, CropAdvice, Expert, Reply, Message, ExpertRequests, Locations
from sqlmodel import Session
from database import engine
from sqlalchemy import select, and_, func

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
        crop (str): The name of the crop (e.g., 'rice', 'cotton').
        district (str, optional): The district where the farm is located.
        disease (str, optional): The name of the disease affecting the crop.

    Returns:
        list: A list of dictionaries containing district, crop, stage, and advice.
    """
    
    crop = crop.strip().lower()
    
    
    print(crop, district)
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
            print(crop_advice)
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

    return crop_advice

def get_crop_data_from_chat_sessions(session: Session, sessionId):
    session_record = session.query(ChatSession).filter(ChatSession.id==sessionId).first()
    print(session_record.cropdata, "hello")
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


def getUser(session: Session, mobileNo: str):
    return session.query(User).filter(User.mobileNo == mobileNo).first()


def addExpertToDB(session: Session, mobileNo: str, name: str):
    
    try:
        user = getUser(session, mobileNo)
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


def getExpert(session: Session, user_id: int):
    return session.query(Expert).filter(Expert.user_id == user_id).first()

def getExpert(session: Session, mobileNo: str):
    return session.query(Expert).filter(Expert.mobileNo == Expert.mobileNo).first()


def addExpertReply(session: Session, reply: Reply):
    try:
        chat_session = session.query(ChatSession).filter(ChatSession.id == reply.sessionId).first()
        if not chat_session:
            print(f"No chat session found with ID: {reply.sessionId}")
            return False
        
        expert_message = Message(
            session_id=reply.sessionId,
            role="expert",
            content=reply.reply
        )
        session.add(expert_message)
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"Error adding expert reply: {e}")
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
                func.count(ExpertRequests.id).asc(),
                Expert.rating.desc()
            ).first().user_id
        expert_request = ExpertRequests(
            session_id=sessionId,
            expert_id=expertId,
            status="pending"
        )
        session.add(expert_request)
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
    
def getMessage(session: Session, sessionId):
    message = session.query(Message).filter(Message.session_id == sessionId).order_by(Message.created_at.desc()).first()
    return message.content if message else None


def getChatSession(session: Session, sessionId):
    return session.query(ChatSession).filter(ChatSession.id == sessionId).first()

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
