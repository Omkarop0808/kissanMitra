# Kisaan Saathi — Quick Demo Guide for Hackathon Mentor

> **Live URL:** http://127.0.0.1:8000  
> **Python:** 3.11.0 (venv)  
> **Server:** FastAPI + Uvicorn  

---

## 1. Setup (One-Time)

```bash
cd Kisaan-Saathi

# Create virtual environment (Python 3.11 recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill API keys
copy .env.example .env   # then edit .env with your keys
```

### Required API Keys (.env)

| Key | Service | Get Free Key |
|-----|---------|-------------|
| `GROQ_API_KEY` | Groq (Farmer AI Assistant LLM) | https://console.groq.com/keys |
| `GEMINI_API_KEY` | Google Gemini (Schemes Chat + Disease Vision) | https://aistudio.google.com/apikey |
| `OPEN_WEATHER_API_KEY` | OpenWeatherMap (Weather Advisory) | https://home.openweathermap.org/api_keys |
| `DATA_GOV_API_KEY` | Data.gov.in (Market Prices) | https://data.gov.in/user/register |
| `PERPLEXITY_API_KEY` | Perplexity AI (Web Search) — **OPTIONAL** | https://www.perplexity.ai/settings/api |

### Start the Server

```bash
python app.py
```

Wait ~20-30 seconds for the HuggingFace sentence-transformers model to load (first run downloads ~90MB). You'll see:
```
QA chain initialized successfully
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## 2. Feature-by-Feature Demo Walkthrough

### Feature 1: Authentication (Signup + Login)
**Page:** http://127.0.0.1:8000/

1. On the landing page, click **"Register here"** link
2. Fill in: Name, Email, Password, Phone, Farm Name
3. Click **Create Account** → Success toast appears
4. Login with the same email/password → Redirects to **Dashboard**
5. User data stored in `data/users.json` (SHA-256 hashed passwords)

**Quick test credentials:** Sign up with any email (e.g., `demo@test.com` / `password123`)

---

### Feature 2: Dashboard
**Page:** http://127.0.0.1:8000/dashboard.html

- Overview with weather widget, quick-access cards to all features
- Navigation sidebar to all 9 feature pages
- Responsive layout

---

### Feature 3: Farmer AI Assistant (Groq LLM + LangGraph Multi-Agent + RAG)
**Page:** http://127.0.0.1:8000/farmer-assistant.html

This is the **flagship AI feature** — a multi-agent system with 3 specialized routes:

| Query Type | What Happens | Example Prompt |
|-----------|-------------|---------------|
| **Farming** | Groq Llama 3.3 70B answers directly | "When should I plant wheat in North India?" |
| **Mental Health** | RAG retrieval from ChromaDB knowledge base | "I'm feeling stressed about my crop failure" |
| **Gov Schemes** | Routed to schemes agent | "Tell me about PM Kisan scheme" |

**Demo steps:**
1. Type a farming question → Get detailed AI response
2. Try a personal/emotional query → See empathetic RAG-based response
3. Ask about schemes → Get structured scheme information
4. Click the **microphone icon** 🎤 → Speak a question (Web Speech API)
5. Click **speaker icon** 🔊 on any response → Text-to-Speech reads it aloud

**Tech:** LangGraph StateGraph → Routes to farming_agent / personal_agent / schemes_agent → LCEL chain with Groq LLM

---

### Feature 4: Crop Disease Detection (Gemini Vision API)
**Page:** http://127.0.0.1:8000/crop-care.html

1. Click **"Upload Image"** or drag-drop a crop/leaf photo
2. Click **"Analyze Disease"**
3. AI returns: Disease name, Cause, Prevention, Treatment
4. Uses **Gemini Vision API** for image analysis (local ML model files not included in repo)

**Test image:** Any photo of a diseased plant leaf (Google "tomato leaf blight" for a sample)

---

### Feature 5: Weather Advisory (OpenWeatherMap)
**Page:** http://127.0.0.1:8000/weather-advisory.html

1. Page loads with default city (Jaipur) weather
2. Type any city name in the search → Press Enter
3. See: Temperature, Humidity, Wind Speed, Weather condition
4. **5-Day Forecast** with daily breakdown
5. Click **"Detect Location"** 📍 → Uses browser geolocation + reverse geocoding
6. Crop calendar and farming advice based on season

**Tech:** OpenWeatherMap Current + Forecast APIs

---

### Feature 6: Government Schemes Chat (Gemini 2.0 Flash)
**Page:** http://127.0.0.1:8000/schemes.html

1. Type a question about Indian agricultural schemes
2. Example: "What is PM Kisan Yojana?" or "Schemes for drip irrigation"
3. Gemini 2.0 Flash LLM responds with scheme details

**Note:** If you see a 429 error, the Gemini free-tier quota is temporarily exhausted. Wait a minute and retry.

---

### Feature 7: Water Footprint Calculator (ML Model)
**Page:** http://127.0.0.1:8000/water-footprint.html

1. Select: **Crop Type** (Rice, Wheat, Cotton, etc.)
2. Enter: **Farm Area** (acres)
3. Select: **Soil Type**, **Region**, **Irrigation Method**
4. Enter: **Rainfall**, **Temperature**, **Humidity**
5. Click **Calculate** → Returns:
   - Total water requirement (kL)
   - Daily water need (kL/day)
   - Weekly water need
   - Irrigation recommendations

**Tech:** Random Forest Regressor (scikit-learn) trained model, runs locally

---

### Feature 8: Market Analysis (Data.gov.in)
**Page:** http://127.0.0.1:8000/market-analysis.html

1. Enter your **Data.gov.in API key** when prompted (or it uses the one from .env)
2. Select commodity and state
3. View current market prices, price trends (Chart.js)
4. Regional price comparisons

---

### Feature 9: Equipment Rental (CRUD)
**Page:** http://127.0.0.1:8000/equipment-rental.html

1. Browse pre-loaded equipment: Tractors, Harvesters, Drones, etc.
2. **Filter** by type, location, price range
3. Click **"Add Equipment"** → Fill form → Submit (adds to JSON store)
4. Click **"Book Now"** on any equipment → Booking confirmation

**Data:** Stored in `data/equipment.json`

---

### Feature 10: Waste Exchange (CRUD)
**Page:** http://127.0.0.1:8000/waste-exchange.html

1. View crop waste listings from farmers
2. Click **"List Waste"** → Fill: Waste type, quantity (e.g., "50 kg"), price, location
3. Submit → Listing appears immediately
4. Others can browse and contact sellers

**Data:** Stored in `data/waste_listings.json`

---

### Feature 11: Donation Page
**Page:** http://127.0.0.1:8000/donation.html

1. Quick-select donation amounts (₹500, ₹1000, ₹2000)
2. Or enter custom amount
3. Support farmers through contributions

---

## 3. Run Automated Test Suite

```bash
python test_all_features.py
```

**Expected output:** 25+ tests pass. The test suite covers:
- All 11 page routes (HTTP 200)
- Auth signup/login API
- Weather current + forecast APIs
- Farmer chat (3 query types: farming, personal, schemes)
- Government schemes chat (Gemini)
- Water footprint ML prediction
- Disease prediction (Gemini Vision)
- Equipment CRUD (list + add)
- Waste exchange CRUD (list + add)
- Static asset serving
- Perplexity web search (if key set)

**Known test notes:**
- Gemini tests may fail with **429 (quota exceeded)** on free-tier — this is an API rate limit, not a code bug
- Perplexity test **skips** if `PERPLEXITY_API_KEY` not set (optional feature)

---

## 4. Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  11 Jinja2 Templates + Tailwind CSS + Chart.js  │
│  Voice: Web Speech API (STT + TTS)              │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────┐
│              FastAPI (app.py)                     │
│  26 Routes: 11 Pages + 15 APIs                   │
│  Auth: SHA-256 hashed passwords (JSON store)     │
└──┬──────┬──────┬──────┬──────┬──────┬───────────┘
   │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼
 Groq   Gemini  OWM  Data.gov  sklearn  PIL
 LLM    Vision  API   API      RF Model  Image
   │      │                              Processing
   ▼      │
LangGraph │     ┌─────────────┐
MultiAgent├────►│  ChromaDB   │
   │      │     │ Vector Store│
   ▼      │     └─────────────┘
 LCEL     │
 Chain    ▼
       Gemini 2.0
       Flash LLM
```

**Key AI/ML Components:**
- **LangGraph StateGraph** — Multi-agent routing (farming/personal/schemes)
- **LCEL Chain** — Modern LangChain Expression Language (not deprecated RetrievalQA)
- **ChromaDB + sentence-transformers/all-MiniLM-L6-v2** — Local RAG embeddings (no API key needed)
- **Groq Llama 3.3 70B** — Primary LLM for farmer assistant
- **Google Gemini 2.0 Flash** — Schemes chat + disease vision analysis
- **Random Forest Regressor** — Water footprint prediction (scikit-learn, runs locally)

---

## 5. File Structure

```
Kisaan-Saathi/
├── app.py                    # FastAPI server (26 routes)
├── FarmerAssistant.py        # LangGraph multi-agent + RAG
├── prediction.py             # Disease prediction (ML + Gemini Vision)
├── weather_info.py           # Weather data processor
├── requirements.txt          # Python dependencies
├── .env                      # API keys (not in git)
├── .env.example              # Template for API keys
├── test_all_features.py      # Automated test suite (29 tests)
├── templates/                # 11 Jinja2 HTML templates
│   ├── index.html            # Landing page + Auth (login/signup)
│   ├── dashboard.html        # Main dashboard
│   ├── crop-care.html        # Disease detection
│   ├── farmer-assistant.html # AI chat assistant
│   ├── weather-advisory.html # Weather + forecast
│   ├── schemes.html          # Gov schemes chat
│   ├── water-footprint.html  # Water calculator
│   ├── market-analysis.html  # Market prices
│   ├── equipment-rental.html # Equipment CRUD
│   ├── waste-exchange.html   # Waste exchange CRUD
│   └── donation.html         # Donation page
├── static/                   # CSS + JS files
│   ├── styles.css
│   ├── farmer-assistant.js   # 340-line AI chat client
│   ├── weather.js            # Weather API client
│   ├── market-prices.js      # Market data client
│   ├── payment.js            # Donation handler
│   ├── schemes.js            # Schemes chat client
│   ├── calendar.js           # Crop calendar
│   └── testimonials.js       # Testimonial carousel
├── data/                     # JSON data store (auto-created)
│   ├── users.json
│   ├── equipment.json
│   └── waste_listings.json
├── Disease prediction Model/ # ML model files
├── Water_Model/              # Water footprint ML model
└── chroma_db/                # ChromaDB vector store
```

---

## 6. Quick 5-Minute Demo Script

For a fast mentor demo, follow this exact sequence:

1. **Start server** → `python app.py` → wait for "Uvicorn running"
2. **Landing page** → http://127.0.0.1:8000 → Show the polished UI
3. **Sign up** → Create account → Login (shows auth works)
4. **Dashboard** → Show overview cards
5. **Farmer Assistant** → Ask "Best crops for monsoon season in Maharashtra" → Show AI answer, then use voice input
6. **Weather** → Search "Mumbai" → Show current + forecast
7. **Water Calculator** → Select Rice, 5 acres, Clay soil → Show ML prediction
8. **Disease Detection** → Upload a leaf image → Show AI diagnosis
9. **Equipment Rental** → Filter by type → Book an item
10. **Waste Exchange** → Add a listing → Show it appears
11. **Run tests** → `python test_all_features.py` → Show 25+ green checks
