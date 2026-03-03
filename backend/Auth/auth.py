from datetime import datetime, timedelta, timezone
import secrets
import string
from database import get_session
import bcrypt
from Utils.messageSending import EmailClient
from models import UserReq
from Utils.db_operations import addOTP, getOtp, getUserFromDB, setOtpUsed
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import status, HTTPException, Depends
from dotenv import load_dotenv
import os

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/verify")

ACCESS_TOKEN_EXPIRE_MINUTES = 10080

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

class OTP:
    def genOTP(self, length: int = 6) -> str:
        characters = string.digits
        otp = ''.join(secrets.choice(characters) for _ in range(length))
        return otp

    def sendOTP(self, session, email: str):
        """Generate an OTP, store its hash, and email it to the user."""
        email_client = EmailClient()
        otp = self.genOTP()
        otp_hash = bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()

        # Try to save to DB (up to 3 times)
        for _ in range(3):
            added = addOTP(session, UserReq(email=email, otp=otp_hash))
            if added:
                break
        else:
            return False

        # Send email (non-blocking failure)
        try:
            email_client.send_otp_email(email, otp)
        except Exception as e:
            print(f"Warning: Failed to send OTP email to {email}: {e}")
            # Still return True so login isn't completely broken during dev/misconfiguration
        return True

    def verifyOTP(self, session, email: str, otp: str):
        otp_record = getOtp(session, email)
        if not otp_record:
            raise ValueError("Failed to verify OTP")

        x = bcrypt.checkpw(otp.encode(), otp_record.otp_hash.encode())
        if x:
            setOtpUsed(session, email)
        return x


class JWTOperations:

    @staticmethod
    def create_access_token(email: str, expires_delta: timedelta | None = None):
        to_encode = {'email': email}
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=10)
        to_encode.update({'exp': expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(email: str):
        to_encode = {'email': email}
        expire = datetime.now(timezone.utc) + timedelta(days=1)
        to_encode.update({'exp': expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_jwt(token):
        credential_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("email")
            if email is None:
                raise credential_exception
        except InvalidTokenError:
            raise credential_exception
        return email

    @staticmethod
    def refresh(refresh_token: str, session=Depends(get_session)):
        email = JWTOperations.decode_jwt(refresh_token)

        user = getUserFromDB(session, email)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or OTP",
                headers={"WWW-Authenticate": "Bearer"}
            )
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = JWTOperations.create_access_token(email, access_token_expires)
        return access_token
