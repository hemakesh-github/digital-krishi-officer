import os
import requests
from dotenv import load_dotenv
load_dotenv()
class WeatherData:
    URL =  os.getenv("WEATHER_API_URL")
    API_KEY = os.getenv("WEATHER_API_KEY")
    

    def getCurrentWeatherData(lat, lon):
        # Logic to fetch weather data for the given location
        
        params = {
            'lat': lat,  # Placeholder latitude
            'lon': lon,  # Placeholder longitude
            'appid': API_KEY
        }
        data = requests.get(URL, params=params).json()
        parsedData = self.parseResponse([data])
        data = [parsedData, self.weather_advice(parsedData[0]["temperature"], parsedData[0]["humidity"], parsedData[0]["wind"], parsedData[0]["rain"])]
        return data
    
    def getForecastWeatherData(self, lat, lon):
        # Logic to fetch forecast weather data for the given location
        params = {
            'lat': lat,  # Placeholder latitude
            'lon': lon,  # Placeholder longitude
            'appid': API_KEY
        }
        data = requests.get(URL + "/forecast", params=params).json()

        parsedData = self.parseResponse(data)
        data = data[0]
        data = [parsedData, self.weather_advice(parsedData[0]["temperature"], parsedData[0]["humidity"], parsedData[0]["wind"], parsedData[0]["rain"])]
        return data


    def parseResponse(self, data):
        # Logic to parse the weather data response and extract relevant information
        # print(data)
        if (len(data) == 0):
            return
        elif ("message" in data):
            return data["message"]
        else:
            parsed = []
            for day in data:
                # print(day)
                p = {"Date": day['dt']}
                for i in day['weather']:
                    i = dict(i)
                    # print(i)
                    p["weather"] = f"{i['main']}, {i['description']}"
                p["temperature"] = round(day["main"]["temp"] - 273.15, 2)
                p["humidity"] = day["main"]["humidity"]
                p["wind"] = day["wind"]["speed"]
                p["rain"] = day.get("rain", dict({})).get("3h", 0)
                parsed.append(p)
                        
        return parsed

    def getLatLong(self, location: str):
        # Logic to fetch latitude for the given location
        

        return (23.0153, 70.0)

    def weather_advice(self, temp, humidity, wind, rain):

        # Heavy Rain
        if rain > 10:
            return {
                "message": "Heavy rain may come.",
                "actions": [
                    "Make sure water drains out",
                    "Do not apply fertilizer",
                    "Check field after rain"
                ]
            }

        # Light Rain
        elif rain > 0:
            return {
                "message": "Light rain may fall.",
                "actions": [
                    "Do not spray today",
                    "Wait until leaves dry"
                ]
            }

        # Strong Wind
        elif wind > 4:
            return {
                "message": "Wind is strong today.",
                "actions": [
                    "Do not spray",
                    "Avoid harvesting"
                ]
            }

        # Very Hot
        elif temp > 35:
            return {
                "message": "Weather is very hot.",
                "actions": [
                    "Give water in morning or evening",
                    "Do not spray in afternoon"
                ]
            }

        # Very Cold
        elif temp < 10:
            return {
                "message": "Weather is very cold.",
                "actions": [
                    "Light watering in evening",
                    "Protect small plants"
                ]
            }

        # High Humidity
        elif humidity > 80:
            return {
                "message": "Air is very wet.",
                "actions": [
                    "Check leaves daily",
                    "Avoid spraying before rain"
                ]
            }

        # Low Humidity
        elif humidity < 30:
            return {
                "message": "Air is dry.",
                "actions": [
                    "Check soil moisture",
                    "Give water if soil is dry"
                ]
            }

        # Good Weather
        else:
            return {
                "message": "Weather is good today.",
                "actions": [
                    "Good time for spraying",
                    "Good time for harvesting"
                ]
            }
    
# print(getWeatherData().getCurrentWeatherData("Ludhiana"))
# getWeatherData().getForecastWeatherData("Ludhiana")