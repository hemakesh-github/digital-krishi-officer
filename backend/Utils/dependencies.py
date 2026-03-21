
from Auth.auth import JWTOperations
from Utils.db_operations import getUserFromDB
from database import get_session
from fastapi import HTTPException, status, Depends, Cookie


def verify_token(access_token: str = Cookie(None), session=Depends(get_session)):
    try:
        email = JWTOperations.decode_jwt(access_token)
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = getUserFromDB(session, email)
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
    
def verify_admin(user = Depends(verify_token)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have admin privileges"
        )
    return user

def verify_expert(user = Depends(verify_token)):
    if user.role != "expert":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have expert privileges"
        )
    return user
