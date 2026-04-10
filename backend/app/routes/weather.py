from fastapi import APIRouter, Query
import os
import httpx

router = APIRouter(prefix="/weather", tags=["weather"])

OWM_KEY = os.getenv("OPENWEATHER_API_KEY", "")

RISK_MAP = {
    "Thunderstorm": ("RED",   "⛈️ Thunderstorm warning — stay indoors"),
    "Drizzle":      ("YELLOW","🌦️ Light rain — watch for flooding"),
    "Rain":         ("YELLOW","🌧️ Rain alert — flood risk in low areas"),
    "Snow":         ("YELLOW","❄️ Unusual cold — protect crops"),
    "Clear":        ("GREEN", "☀️ Clear skies — good farming conditions"),
    "Clouds":       ("GREEN", "⛅ Cloudy — normal conditions"),
    "Mist":         ("GREEN", "🌫️ Misty morning — visibility low"),
    "Haze":         ("YELLOW","🌫️ Haze — poor air quality"),
    "Dust":         ("RED",   "🌪️ Dust storm — stay indoors"),
    "Tornado":      ("RED",   "🌪️ Tornado warning — seek shelter now!"),
    "Extreme":      ("RED",   "🚨 Extreme weather — do not go to farm"),
}

@router.get("/current")
async def get_weather(lat: float = Query(...), lon: float = Query(...)):
    if not OWM_KEY:
        # Return mock data if no API key configured
        return {
            "temp": 28,
            "feels_like": 31,
            "description": "Partly cloudy",
            "main": "Clouds",
            "humidity": 72,
            "wind_speed": 3.2,
            "risk_level": "GREEN",
            "farm_advice": "⛅ Cloudy — normal farming conditions",
            "icon": "04d",
            "source": "mock"
        }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": OWM_KEY, "units": "metric"},
                timeout=5.0
            )
            data = resp.json()

        main_weather = data["weather"][0]["main"]
        risk, advice = RISK_MAP.get(main_weather, ("GREEN", "🌤️ Check local conditions"))

        # Extra heat check
        temp = data["main"]["temp"]
        if temp >= 38:
            risk = "RED"
            advice = f"🔥 Extreme heat ({temp:.0f}°C) — risk of drought and crop damage"
        elif temp >= 33 and risk == "GREEN":
            risk = "YELLOW"
            advice = f"☀️ High heat ({temp:.0f}°C) — water crops early morning"

        return {
            "temp": round(temp, 1),
            "feels_like": round(data["main"]["feels_like"], 1),
            "description": data["weather"][0]["description"].title(),
            "main": main_weather,
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "risk_level": risk,
            "farm_advice": advice,
            "icon": data["weather"][0]["icon"],
            "source": "OpenWeatherMap"
        }
    except Exception as e:
        return {
            "temp": 29, "feels_like": 32, "description": "Partly cloudy",
            "main": "Clouds", "humidity": 68, "wind_speed": 2.8,
            "risk_level": "GREEN", "farm_advice": "⛅ Weather data unavailable — check locally",
            "icon": "04d", "source": "fallback"
        }
