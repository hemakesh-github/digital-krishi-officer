from datetime import timedelta
from uuid import UUID
from Utils.messageSending import TwillioClient
import bcrypt
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor
import asyncio
from fastapi import FastAPI, Depends, Response, HTTPException, status, Cookie, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from Auth.auth import OTP, JWTOperations
from Utils.db_operations import addExpertToDB, addOTP, get_suggestion, getChatSession, getExpertRequests, getOtp, getUserFromDB, get_crop_data_from_chat_sessions, addMessage, getStatesFromDB, getDistrictsFromDB, getCitiesFromDB, getMessages, addDiseaseDetection, getDiseaseDetectionHistory, getChatSessions, getExpert, addUser
from models import User, UserReq, UserOTPReq, CropData, ChatSession, ExpertData, MessageData, LocationData
from database import get_session, init_db
from data_gen.weekly_sug_extract import extract_and_load_weekly_advice
from LLM.multi_tool_agent.agent import crop_query_agent, query_agent
from LLM.retrieval.get_model import get_model
from LLM.retrieval import retrieve_answer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from Utils.weatherData import WeatherData
import json


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
    # print("Loading SentenceTransformer model...")
    # with ThreadPoolExecutor() as executor:
    #     await loop.run_in_executor(executor, get_model)
    # print("Model loaded successfully!")
    
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
    allow_origins=["https://localhost:5173", "http://localhost:5174", "https://127.0.0.1:5174", "https://192.168.0.100:5173", "https://192.168.0.100:5173/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def refresh(refresh_token: str, session = Depends(get_session)):
    mobileNo = JWTOperations.decode_jwt(refresh_token)
    
    user = getUserFromDb(session, mobileNo)
    
    if user is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = JWTOperations.create_access_token(mobileNo, access_token_expires)
    return {"access_token": access_token}

def verify_token(access_token: str = Cookie(None), session=Depends(get_session)):
    try:    
        print(access_token)
        mobileNo = JWTOperations.decode_jwt(access_token)
        user = getUserFromDB(session, mobileNo)
        print(access_token)
        if mobileNo is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
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
    print(user)
    return refresh(refresh_token, session)    


@app.post("/auth/genOTP")
def genOTP(user: UserOTPReq, session=Depends(get_session)):
    if not (user.mobileNo):
        raise ValueError("No mobile number provided")
    if (user.userType == "expert" and getExpert(session, user.mobileNo) is None):
        raise ValueError("You are not an expert")
    otp_handler = OTP()
    added = otp_handler.sendOTP(session, user.mobileNo)
    print(getOtp(session, user.mobileNo))
    if not added:
        raise ValueError("Login failed, try again")
    return {"success": True, "message": "OTP generated"}

@app.post("/auth/verifyOTP")
def verify(response: Response, userReq: UserReq, session=Depends(get_session)):
    otp_handler = OTP()
    verified = otp_handler.verifyOTP(session, userReq.mobileNo, userReq.otp)
    if (userReq.userType == "expert"):
        user = getExpert(session, userReq.mobileNo)
        print(user)
        if user is None:
            raise ValueError("You are not an expert")
    else: 
        user = getUserFromDB(session, userReq.mobileNo)

    print("OTP verification result:", verified)
    if verified:
        if user is None:
            user = addUser(session, userReq)
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = JWTOperations.create_access_token(userReq.mobileNo, access_token_expires)
        refresh_token = JWTOperations.create_refresh_token(userReq.mobileNo)
        response.set_cookie(
            key = 'refresh_token',
            value = refresh_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age = 24 * 60 * 60
        )
        response.set_cookie(
            key = 'access_token',
            value = access_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age = 24 * 60 * 60
        )
        return {"success": True, "access_token": access_token, "mobile_number": user.mobileNo, "userType": user.role, "userId": user.id}
    print("OTP verification failed", verified)
    return {"success": False, "message": "Invalid OTP"}

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

@app.post("/expert/addWeeklyAdvice")
def addWeeklyAdvice(session=Depends(get_session)):
    extract_and_load_weekly_advice(session, "C:\\Documents\\farmerAssist\\backend\\data_gen\\weekly_advice_example.json")
    return


@app.post("/expert/expertAdvice")
def expertAdvice(MessageData: MessageData, session=Depends(get_session)):
    try:
        addMessage(session, MessageData)
        message = getChatSession(session, MessageData.sessionId)
        user = getUserFromDb(session, message.user_id)
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

@app.get("/getUser")
def getUser(session=Depends(get_session), user = Depends(verify_token)):
    try:
        # user = getUser(session, session.mobileNo)
        return {"success": True, "user": user}
    except Exception as e:
        print(f"Error in getUser endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )


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


#Weather Feature
@app.get("/getDistrict")
def getDistrict(state: str, session=Depends(get_session)):
    try:
        return getDistrictsFromDB(session, state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load data"
        )


@app.get("/getCity")
def getCity(district: str, q: str = "", session=Depends(get_session)):
    try:
        return getCitiesFromDB(session, district, query=q)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load data"+e
        )

@app.get("/getWeatherData")
def getWeatherData(lat: float, lon: float, session=Depends(get_session)):
    try:
        x = WeatherData.getForecastWeatherData(lat, lon)
        print(x)
        return x
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load data"
        )


#Crop problem/advice

@app.post("/crop_advice")
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

@app.post("/crop_advice/{sessionId}")
async def continue_crop_advice_chat(sessionId, query: dict, session=Depends(get_session)):
    cropData = get_crop_data_from_chat_sessions(session, sessionId)
    cropData = CropData(**cropData)
    cropData.query = query["query"]
    print(cropData, sessionId)
    x = await query_agent(cropData, dbSession=session, sessionId = sessionId)
    return x


@app.get("/chat/{sessionId}")
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

@app.post("/chat/message")
async def add_message(message: MessageData, session=Depends(get_session)):
    addMessage(session, message)
    return {"success": True}




@app.post("/disease_detection")
async def disease_detection(image: UploadFile = File(...), session=Depends(get_session)):
    try:
        image_bytes = await image.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_path = save_image(image_base64)
        # Call the disease detection model
        # result = disease_detection_model(image_base64)
        result = {
            "disease": "Leaf Folder",
            "confidence": 0.95
        }
        userId = 1
        # Save the chat session
        addDiseaseDetection(session, userId, result, image_path)
        return result
    except Exception as e:
        print(f"Error in disease_detection endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to detect disease"
        )

@app.post("/history")
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


        






if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
