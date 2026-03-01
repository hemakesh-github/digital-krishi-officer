from datetime import datetime, timedelta, timezone
import secrets
import string
from database import get_session
import bcrypt
from Utils.messageSending import TwillioClient
from models import UserReq
from Utils.db_operations import addOTP, getOtp, getUserFromDB, setOtpUsed
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import status, HTTPException, Depends
<<<<<<< HEAD
from dotenv import load_dotenv

load_dotenv()
=======
>>>>>>> fbdc8e8b99e9d36f0be6a8a84d44d6e4469d881d

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify")

ACCESS_TOKEN_EXPIRE_MINUTES = 10080

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

class OTP:
    def genOTP(self, length: int = 6) -> str:
        # Generate a random OTP of the specified length
        characters = string.digits 
        otp = ''.join(secrets.choice(characters) for _ in range(length))
        
        return otp
    
    def sendOTP(self, session, mobile_number: str):
        # Logic to send OTP to the given mobile number
        twilio_client = TwillioClient()
        otp = self.genOTP()
        body = f"Your OTP is for digital krishi officer is : {otp}"
        print(body)
        # twilio_client.send_sms(to_number=mobile_number, body=body)
        otp_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()
        for _ in range(3):
            added = addOTP(session, UserReq(mobileNo=mobile_number, otp=otp_hash))
            if added:
                return added
        return added

    def verifyOTP(self, session, mobile_number: str, otp: str):
        otp_record = getOtp(session, mobile_number)
        if not otp_record:
            raise ValueError("Failed to verify OTP")
    
        x = bcrypt.checkpw(otp.encode(), otp_record.otp_hash.encode())
        if x:
            setOtpUsed(session, mobile_number)
        return x

class JWTOperations: 

    @staticmethod
    def create_access_token(phno: str, expires_delta: timedelta | None = None):
        to_encode = {'phno': phno}
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else: 
            expire = datetime.now(timezone.utc) + timedelta(minutes = 10)
        to_encode.update({'exp': expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(phno: str):
        to_encode = {'phno': phno}
        expire = datetime.now(timezone.utc) + timedelta(days=1)
        to_encode.update({'exp': expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_jwt(token):
        credential_exception = HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail= "Could not validate credentials",
            headers = {"WWW-Authenticate": "Bearer"},
        )
        try: 
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            print(payload)
            mobileNo = payload.get("phno")
            print(mobileNo, payload)
            if mobileNo is None:
                raise credential_exception
        except InvalidTokenError:
            raise credential_exception
        return mobileNo
    
    @staticmethod
    def refresh(refresh_token: str, session = Depends(get_session)):
        mobileNo = JWTOperations.decode_jwt(refresh_token)
        
        user = getUserFromDB(session, mobileNo)
        
        if user is None:
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = JWTOperations.create_access_token(mobileNo, access_token_expires)
        return access_token
