from Utils.weatherData import WeatherData
from database import get_session
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.get("/getWeatherData")
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