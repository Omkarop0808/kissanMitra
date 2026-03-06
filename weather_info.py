"""
Weather information utility module for Kisaan Saathi.
Provides functions to fetch current weather and forecasts via OpenWeatherMap API.
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def get_api_key():
    """Get the OpenWeatherMap API key from environment."""
    key = os.getenv("OPEN_WEATHER_API_KEY")
    if not key:
        raise ValueError("OPEN_WEATHER_API_KEY is not set in .env file")
    return key


def get_current_weather(city="Chennai", units="metric"):
    """Fetch current weather data for a city."""
    api_key = get_api_key()
    params = {"q": city, "appid": api_key, "units": units}
    response = requests.get(BASE_URL, params=params, timeout=10)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Weather API error ({response.status_code}): {response.text}")


def get_forecast(city="Chennai", units="metric"):
    """Fetch 5-day forecast data for a city."""
    api_key = get_api_key()
    params = {"q": city, "appid": api_key, "units": units}
    response = requests.get(FORECAST_URL, params=params, timeout=10)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Forecast API error ({response.status_code}): {response.text}")


if __name__ == "__main__":
    city = "Chennai"
    data = get_current_weather(city)
    print(f"Weather in {city}:")
    print(f"Temperature: {data['main']['temp']}°C")
    print(f"Weather: {data['weather'][0]['description']}")
    print(f"Humidity: {data['main']['humidity']}%")
    print(f"Wind Speed: {data['wind']['speed']} m/s")
