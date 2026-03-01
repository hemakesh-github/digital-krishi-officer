from Utils.db_operations import getCitiesFromDB, getDistrictsFromDB
from database import get_session
from fastapi import APIRouter, Depends, HTTPException, status


router = APIRouter()

@router.get("/getDistrict")
def getDistrict(state: str, session=Depends(get_session)):
    try:
        return getDistrictsFromDB(session, state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load data"
        )

@router.get("/getCity")
def getCity(district: str, q: str = "", session=Depends(get_session)):
    try:
        return getCitiesFromDB(session, district, query=q)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load data"+e
        )
