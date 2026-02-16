from datetime import datetime, timedelta, timezone
from http.client import HTTPException
import secrets
import string
import bcrypt
from Utils.messageSending import TwillioClient
from models import UserReq
from Utils.db_operations import addOTP, getOtp, setOtpUsed
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import status

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify")


SECRET_KEY = "75b123488ab460702dd19f965580c8c8b2d99b9dfd7a2e5c6c68fac8198f2449"
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
        # Logic to verify the OTP for the given mobile number
        otp_record = getOtp(session, mobile_number)
        if not otp_record:
            raise ValueError("Failed to verify OTP")
    
        x = bcrypt.checkpw(otp.encode(), otp_record.otp_hash.encode())
        if x:
            setOtpUsed(session, mobile_number)
        return x

class JWTOperations: 

    def create_access_token(phno: str, expires_delta: timedelta | None = None):
        to_encode = {'phno': phno}
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else: 
            expire = datetime.now(timezone.utc) + timedelta(minutes = 10)
        to_encode.update({'exp': expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def create_refresh_token(phno: str):
        to_encode = {'phno': phno}
        expire = datetime.now(timezone.utc) + timedelta(days=1)
        to_encode.update({'exp': expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def decode_jwt(token):
        credential_exception = HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail= "Could not validate credentials",
            headers = {"WWW-Authenticate": "Bearer"},
        )
        try: 
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            mobileNo = payload.get("sub")
            if mobileNo is None:
                raise credential_exception
        except InvalidTokenError:
            raise credential_exception
        return mobileNo

