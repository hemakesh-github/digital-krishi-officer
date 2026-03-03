from contextlib import asynccontextmanager
from Utils.db_operations import get_suggestion
from fastapi import FastAPI, Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from Auth.auth import JWTOperations
from data_gen.weekly_sug_extract import extract_and_load_weekly_advice, load_locations
from database import get_session, init_db
from fastapi.security import HTTPBearer
from routers import users, admin, expert, chats, auth, location, weather, crop_advice, disease, transcription
from Utils.dependencies import verify_token, verify_admin, verify_expert
import os
load_dotenv()

security = HTTPBearer()

# Disease prediction model instance (loaded at startup)
disease_predictor = None

ALLOWED_URL = os.getenv("ALLOWED_FRONTEND")

def get_disease_predictor():
    global disease_predictor
    return disease_predictor


def load_disease_model():
    global disease_predictor
    from diseasePrediction.disease_model import DiseasePrediction
    try:
        disease_predictor = DiseasePrediction()
        print(f"disease model loaded successfully on {disease_predictor.device}")
        return True
    except Exception as e:
        print(f"Error loading model")
    print("Warning: Disease model not found at startup")
    return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Load disease model on startup
    load_disease_model()
    # Preload the retrieval embedding model to avoid delay on first request
    from LLM.retrieval.get_model import get_model
    get_model()
    print("Application startup complete")
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
    allow_origins=["https://localhost:5173", "http://localhost:5174", "https://127.0.0.1:5174", "https://192.168.0.100:5173", ALLOWED_URL], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(admin.router, prefix="/admin", dependencies=[Depends(verify_admin)], tags=["admin"])
app.include_router(expert.router, prefix="/expert", dependencies=[Depends(verify_expert)], tags=["expert"])
app.include_router(chats.router, prefix="/chat", tags=["chats"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(location.router, prefix="/location", tags=["location"])
app.include_router(weather.router, prefix="/weather", tags=["weather"])
app.include_router(crop_advice.router, prefix="/crop_advice", tags=["crop_advice"])
app.include_router(disease.router, prefix="/disease", tags=["disease"])
app.include_router(transcription.router, prefix="/transcription", tags=["transcription"])

@app.get("/")
async def root():
    return {"message": "Welcome to Farmer Assist API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/temp/load-data-to-db")
async def load_locations_from_csv(session = Depends(get_session)):
    """
    Temporary endpoint to load location data from CSV file into database.
    This will insert all locations from data_gen/locations.csv into the locations table.
    """
    return {**load_locations(session), **extract_and_load_weekly_advice(session)}

    


# @app.post("/retrieval")
# def retrieval(crop: str = None, disease: str = None, district: str = None):
#     from LLM.retrieval import retrieve_answer
#     get_suggestion(crop=crop, disease=disease, district=None)
#     return retrieve_answer("borrer attack")

# ✅ Fixed - reads PORT from environment
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)