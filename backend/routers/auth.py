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
    if not user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No email provided")
    if user.userType == "Expert" and getExpert(session, user.email) is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not registered as an expert")
    otp_handler = OTP()
    added = otp_handler.sendOTP(session, user.email)
    if not added:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Login failed, try again")
    return {"success": True, "message": "OTP sent to your email"}


@router.post("/verifyOTP")
def verify(response: Response, userReq: UserReq, session=Depends(get_session)):
    otp_handler = OTP()
    verified = otp_handler.verifyOTP(session, userReq.email, userReq.otp)

    if userReq.userType == "Expert":
        user = getExpert(session, userReq.email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not registered as an expert")
    else:
        user = getUserFromDB(session, userReq.email)

    if verified:
        if user is None:
            user = addUser(session, userReq)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = JWTOperations.create_access_token(userReq.email, access_token_expires)
        refresh_token = JWTOperations.create_refresh_token(userReq.email)
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age=24 * 60 * 60
        )
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age=24 * 60 * 60
        )
        return {"success": True, "email": user.email, "userType": user.role, "userId": user.id}
    return {"success": False, "message": "Invalid OTP"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}


@router.get("/getUser")
def getUser(session=Depends(get_session), user=Depends(verify_token)):
    try:
        return {"success": True, "user": user}
    except Exception as e:
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
            key='access_token',
            value=access_token,
            httponly=True,
            secure=True,
            samesite='None',
            max_age=24 * 60 * 60
        )
        return {"success": True}

    except Exception as e:
        print(f"Error in refresh_token endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
