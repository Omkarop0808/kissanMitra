# Kisaan Saathi - Project Requirements

## Project Overview
AI-powered Farmer Dashboard for Indian farmers providing real-time data, smart decision-making tools, and access to vital agricultural resources. Built with FastAPI (Python) backend and HTML/TailwindCSS/JS frontend.

## Core Features

### 1. Disease Detection (Crop Care)
- Upload crop/leaf image for disease identification
- Xception-based ML model classifying 38 disease categories
- Gemini AI fallback for image analysis when ML model unavailable
- LLM-generated explanation (cause, prevention, treatment) via Groq
- Multi-language support (9 languages: English, Hindi, Punjabi, Kannada, Tamil, Telugu, Malayalam, Marathi, Gujarati)
- Disease hotspot mapping via DBSCAN clustering (Folium map)
- Geolocation support for disease report coordinates

### 2. Water Footprint Calculator
- Predict water requirements based on crop, soil, climate data
- Random Forest model (pkl) or calculation-based fallback
- Daily/weekly water need estimates
- Inputs: crop type, soil type, irrigation method, area, temperature, humidity, rainfall

### 3. Farmer AI Assistant (Multi-Agent RAG)
- LangGraph-based multi-agent workflow with category routing
- Categories: Financial, Personal, Farming, Education, Government Schemes, Plant Disease, Weather
- ChromaDB vector storage for mental health PDF documents (RAG)
- Chat history persistence across conversation
- Voice input (Web Speech API - browser native STT)
- Text-to-Speech (Web Speech API - browser native TTS)
- 9 Indian language support with language selector
- Web search integration (Perplexity AI) with toggle
- Markdown rendering of AI responses
- Follow-up suggestion questions
- Quick question sidebar

### 4. Market Analysis
- Real-time commodity pricing via Data.gov.in API
- Price trend visualization with Chart.js
- Regional market comparisons
- Search and filter by commodity and state

### 5. Weather Advisory
- Current weather via OpenWeatherMap API
- 5-day/3-hour forecast (grouped by day)
- Agricultural advisory based on conditions
- Location search by city name

### 6. Government Schemes
- Gemini-powered chatbot for scheme information
- Pre-built scheme buttons (PM-KISAN, PMFBY, PMKSY, KCC, NBHM)
- Eligibility and application details
- Markdown-formatted responses

### 7. Equipment Rental
- Browse/filter farm equipment by type, location, price range
- Booking system with date range and cost calculation
- Add new equipment listings
- Default equipment: Tractor, Sprayer, Harvester, Rotavator, Drone, Plough

### 8. Crop Waste Exchange
- List agricultural waste for sale (rice straw, wheat straw, sugarcane bagasse, etc.)
- Browse available waste listings
- Auto-pricing based on waste type and quantity
- Delete listings

### 9. User Authentication
- Signup/Login system with name, email, password, phone, farm name
- JSON file-based storage (data/users.json)
- Password hashing with SHA-256 + salt

### 10. Donation Page
- Support page for farmer aid donations

## API Keys Required
| Key | Purpose | Source | Required |
|-----|---------|--------|----------|
| GROQ_API_KEY | Disease LLM + Farmer Assistant | https://console.groq.com/keys | Yes |
| GEMINI_API_KEY | Schemes chatbot + Image analysis fallback | https://aistudio.google.com/apikey | Yes |
| OPEN_WEATHER_API_KEY | Weather advisory | https://home.openweathermap.org/api_keys | Yes |
| DATA_GOV_API_KEY | Market prices | https://data.gov.in/user/register | Yes |
| PERPLEXITY_API_KEY | Web search in farmer assistant | https://www.perplexity.ai/settings/api | Optional |

## Tech Stack
- **Backend:** FastAPI, Uvicorn, Python 3.10+
- **Frontend:** HTML5, TailwindCSS (CDN), JavaScript (ES6+), Chart.js, Bootstrap 5
- **ML/AI:** TensorFlow, Scikit-learn, Xception, Random Forest, DBSCAN
- **LLM:** LangChain, LangGraph, ChromaDB, Groq (Llama 3.3 70B), Gemini 2.0 Flash
- **APIs:** OpenWeatherMap, Data.gov.in, Perplexity AI
- **Maps:** Folium (Python map library)
- **Markdown:** marked.js (client-side rendering)
- **Voice:** Web Speech API (browser-native STT/TTS)
