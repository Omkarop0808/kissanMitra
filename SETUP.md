# Kisaan Saathi - Setup Guide

## What You Need to Provide (API Keys)

You need **4 API keys** to run this project. All are **free** to obtain.

### 1. Groq API Key (REQUIRED)
- **Used for:** Disease detection AI explanations + Farmer AI Assistant
- **Get it:** https://console.groq.com/keys
- **Steps:** Sign up > Dashboard > API Keys > Create API Key
- **Free tier:** Yes (generous free tier)

### 2. Google Gemini API Key (REQUIRED)
- **Used for:** Government Schemes chatbot
- **Get it:** https://aistudio.google.com/apikey
- **Steps:** Sign in with Google > Click "Create API Key" > Copy
- **Free tier:** Yes (15 RPM free)

### 3. OpenWeatherMap API Key (REQUIRED)
- **Used for:** Weather advisory & 7-day forecast
- **Get it:** https://home.openweathermap.org/api_keys
- **Steps:** Sign up > Go to "API Keys" tab > Copy default key
- **Free tier:** Yes (1000 calls/day)

### 4. Data.gov.in API Key (REQUIRED)
- **Used for:** Real-time agricultural market prices
- **Get it:** https://data.gov.in/user/register
- **Steps:** Register on data.gov.in > Go to profile > Copy API Key
- **Free tier:** Yes (completely free, Indian government portal)

## Quick Setup Instructions

### Step 1: Create your `.env` file
```bash
cp .env.example .env
```
Then open `.env` and paste your API keys.

### Step 2: Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run the application
```bash
python app.py
```
The app will start at http://127.0.0.1:8000

## Notes on Disease Detection Model

The plant disease detection model uses an Xception architecture. On first run:
- If no pre-trained weights are found, the model will use ImageNet base weights
- Predictions will still work but won't be accurate for specific crop diseases
- For accurate disease detection, you'd need to train the model on a plant disease dataset (e.g., PlantVillage dataset)

## Project Features

| Feature | Status | API Required |
|---------|--------|-------------|
| Dashboard | Working | None |
| Disease Detection | Working | Groq |
| Water Footprint Calculator | Working | None |
| Farmer AI Assistant | Working | Groq |
| Government Schemes Chat | Working | Gemini |
| Weather Advisory | Working | OpenWeatherMap |
| Market Price Analysis | Working | Data.gov.in |
| Equipment Rental | Working | None |
| Waste Exchange | Working | None |
| User Authentication | Working | None |
| Disease Hotspot Map | Working | None |
| Donation Page | Working | None |

## Troubleshooting

- **"GROQ_API_KEY is not set"**: Make sure your `.env` file exists and has the key
- **"GEMINI_API_KEY is not set"**: Same as above, check your `.env` file
- **TensorFlow errors**: Make sure you have `tensorflow==2.19.0` installed
- **ChromaDB errors**: The vector database will be auto-created on first run
- **Port 8000 in use**: Change `APP_PORT` in `.env` or kill the process using that port
