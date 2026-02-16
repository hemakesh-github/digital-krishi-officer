from datetime import timedelta
from uuid import UUID
from Utils.messageSending import TwillioClient
import bcrypt
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor
import asyncio
from fastapi import FastAPI, Depends, Response, HTTPException, status, Cookie, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from Auth.auth import OTP, JWTOperations
from Utils.db_operations import addExpertToDB, addOTP, get_suggestion, getChatSession, getExpertRequests, getOtp, getUser, get_crop_data_from_chat_sessions, addExpertReply
from models import User, UserReq, UserOTPReq, CropData, ChatSession, ExpertData, Reply
from database import get_session, init_db
from data_gen.weekly_sug_extract import extract_and_load_weekly_advice
from LLM.multi_tool_agent.agent import crop_query_agent, query_agent
from LLM.retrieval.get_model import get_model
from LLM.retrieval import retrieve_answer
from fastapi.security import HTTPBearer, HTTPAuthCredentials


load_dotenv()

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    print("Initializing database...")
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as executor:
        await loop.run_in_executor(executor, init_db)
    
    # Load model in thread pool to avoid blocking
    print("Loading SentenceTransformer model...")
    with ThreadPoolExecutor() as executor:
        await loop.run_in_executor(executor, get_model)
    print("Model loaded successfully!")
    
    yield
    print("App shutdown")

app = FastAPI(
    title="Farmer Assist API",
    description="Backend for the Farmer Assist application",
    lifespan=lifespan,
)

ACCESS_TOKEN_EXPIRE_MINUTES = 60
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def refresh(refresh_token: str, session = Depends(get_session)):
    username = JWTOperations.decode_jwt(refresh_token)
    
    user = getUser(session, username)
    
    if user is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = JWTOperations.create_access_token(username, access_token_expires)
    return {"access_token": access_token}

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        mobileNo = JWTOperations.decode_jwt(token)
        if mobileNo is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return mobileNo
    except Exception as e:
        print(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/")
async def root():
    return {"message": "Welcome to Farmer Assist API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/refresh")
def refresh_token(response: Response, user: str = Depends(verify_token),  session=Depends(get_session),  refresh_token: str = Cookie(None)):
    
    return refresh(refresh_token, session)    


@app.post("/auth/genOTP")
def genOTP(user: UserOTPReq, session=Depends(get_session)):
    if not (user.mobileNo):
        raise ValueError("No mobile number provided")
    otp_handler = OTP()
    added = otp_handler.sendOTP(session, user.mobileNo)
    print(getOtp(session, user.mobileNo))
    if not added:
        raise ValueError("Login failed, try again")
    return {"success": True, "message": "OTP generated"}

@app.post("/auth/verifyOTP")
def verify(response: Response, user: UserReq, session=Depends(get_session)):
    otp_handler = OTP()
    verified = otp_handler.verifyOTP(session, user.mobileNo, user.otp)
    print("OTP verification result:", verified)
    if verified:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = JWTOperations.create_access_token(user.mobileNo, access_token_expires)
        
        refresh_token = JWTOperations.create_refresh_token(user.mobileNo)
        response.set_cookie(
            key = 'refresh_token',
            value = refresh_token,
            httponly=True,
            secure=True,
            samesite='strict',
            max_age = 24 * 60 * 60
        )
        return {"success": True, "access_token": access_token, "mobile_number": user.mobileNo}
    print("OTP verification failed", verified)
    return {"success": False, "message": "Invalid OTP"}

@app.post("/crop_advice")
async def new_crop_advice_chat(cropData: CropData, session=Depends(get_session)):
    message = f"""crop: {cropData.crop}, location: {cropData.location}, query: {cropData.query}"""
    print("hello")
    x = await query_agent(message, cropData, dbSession = session)
    return {"message": x}

@app.post("/crop_advice/{sessionId}")
async def continue_crop_advice_chat(sessionId, query, session=Depends(get_session)):
    cropData = get_crop_data_from_chat_sessions(session, sessionId)
    print(cropData, sessionId)
    message = f"""crop: {cropData['crop']}, location: {cropData['location']}, query: {query}"""
    x = await query_agent(message, cropData, dbSession=session, sessionId = sessionId)
    return {"message": x}


@app.post("/expert/addWeeklyAdvice")
def addWeeklyAdvice(session=Depends(get_session)):
    extract_and_load_weekly_advice(session, "C:\\Documents\\farmerAssist\\backend\\data_gen\\weekly_advice_example.json")
    return


@app.post("/expert/expertAdvice")
def expertAdvice(reply: Reply, session=Depends(get_session)):
    try:
        addExpertReply(session, reply)
        message = getChatSession(session, reply.sessionId)
        user = getUser(session, message.user_id)
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


@app.get("/expert/getPendingQueries")
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
    

@app.post("/retrieval")
def retrieval(crop: str = None, disease: str = None, district: str = None):
    return get_suggestion(crop=crop, disease=disease, district=None)
    # return retrieve_answer(query)


@app.post("/admin/addExpert")
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
                "rating": float(expert_obj.rating),
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





if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
