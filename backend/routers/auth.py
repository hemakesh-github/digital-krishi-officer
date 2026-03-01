from datetime import timedelta

from Auth.auth import OTP, JWTOperations
from Utils.db_operations import addUser, getExpert, getOtp, getUserFromDB
from Utils.dependencies import verify_token
from database import get_session
from models import UserOTPReq, UserReq
from fastapi import APIRouter, Depends, Response, HTTPException, status, Cookie

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 5


@router.post("/genOTP")
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

@router.post("/verifyOTP")
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
    print(verified, user.mobileNo if user else "No user")  # Debugging statement

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
        return {"success": True, "mobile_number": user.mobileNo, "userType": user.role, "userId": user.id}
    print("OTP verification failed", verified)
    return {"success": False, "message": "Invalid OTP"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}



@router.get("/getUser")
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
    

@router.post("/refresh")
def refresh_token(response: Response, session=Depends(get_session), refresh_token: str = Cookie(None)):
    try:
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = JWTOperations.refresh(refresh_token, session)
        response.set_cookie(
                key = 'access_token',
                value = access_token,
                httponly=True,
                secure=True,
                samesite='None',
                max_age = 24 * 60 * 60
            )
        return {"success": True}

    except Exception as e:
        print(f"Error in refresh_token endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )    
