# Kisaan Saathi - Architecture & Design

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Browser (Frontend)                      │
│  HTML/TailwindCSS + JS (ES6) + Chart.js + marked.js      │
│  Web Speech API (STT/TTS) | Geolocation API              │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP (REST API)
┌──────────────────────▼───────────────────────────────────┐
│                FastAPI Backend (app.py)                    │
│  Uvicorn ASGI Server | Jinja2 Templates | Static Files    │
├──────────────────────────────────────────────────────────┤
│  Route Groups:                                            │
│  /              → Landing page                            │
│  /dashboard     → Main dashboard                          │
│  /crop-care     → Disease detection                       │
│  /farmer-assistant → AI chat                              │
│  /market-analysis  → Commodity prices                     │
│  /weather-advisory → Weather info                         │
│  /water-footprint  → Water calculator                     │
│  /schemes          → Government schemes chat              │
│  /equipment-rental → Equipment rental                     │
│  /waste-exchange   → Crop waste marketplace               │
│  /donation         → Donation page                        │
├──────────────────────────────────────────────────────────┤
│  API Endpoints:                                           │
│  POST /api/predict          → Disease ML prediction       │
│  POST /api/disease-info     → LLM disease explanation     │
│  POST /api/report-disease   → Report disease location     │
│  GET  /api/disease-hotspots → Folium hotspot map          │
│  POST /api/farmer-assistant → Multi-agent AI chat         │
│  POST /api/web-search       → Perplexity web search       │
│  GET  /api/weather/current  → Current weather             │
│  GET  /api/weather/forecast → 5-day forecast              │
│  GET  /api/market/prices    → Commodity prices            │
│  POST /api/water-footprint  → Water prediction            │
│  POST /api/schemes/chat     → Schemes chatbot             │
│  CRUD /api/equipment/*      → Equipment rental            │
│  CRUD /api/waste/*          → Waste exchange              │
│  POST /api/signup, /api/login → Authentication            │
└──────────────────────────────────────────────────────────┘
          │              │              │
  ┌───────▼──┐   ┌──────▼──────┐  ┌───▼────────────┐
  │ ML Models│   │ LLM Services│  │ External APIs   │
  │ Xception │   │ Groq        │  │ OpenWeatherMap  │
  │ Random   │   │ Gemini      │  │ Data.gov.in     │
  │ Forest   │   │ LangGraph   │  │ Perplexity      │
  │ DBSCAN   │   │ ChromaDB    │  │                 │
  └──────────┘   └─────────────┘  └─────────────────┘
```

## Directory Structure

```
Kisaan-Saathi/
├── app.py                  # FastAPI main application (all routes + APIs)
├── FarmerAssistant.py      # LangGraph multi-agent AI assistant
├── prediction.py           # Disease prediction (Xception + Gemini fallback)
├── hotspot.py              # Disease hotspot DBSCAN clustering + Folium map
├── weather_info.py         # OpenWeatherMap API integration
├── retrain_model.py        # Model retraining pipeline (offline)
├── requirements.txt        # Python dependencies
├── .env                    # API keys (not committed)
├── .env.example            # API key template
├── REQUIREMENTS.md         # Project requirements document
├── DESIGN.md               # This file
├── TASKS.md                # Implementation tasks
├── data/
│   ├── users.json          # User authentication data
│   ├── equipment.json      # Equipment rental listings
│   ├── waste_listings.json # Crop waste listings
│   └── disease_reports.json# Disease location reports
├── Disease prediction Model/
│   └── class_indices.json  # 38 disease classes
├── Farmer AI Assistant/
│   └── RAG Model Documents/# PDF docs for ChromaDB RAG
├── Water Footprint Model/
│   └── Model/              # Trained model (pkl)
├── chroma_db/              # ChromaDB vector store
├── templates/
│   ├── index.html          # Landing page with auth modals
│   ├── dashboard.html      # Main dashboard with overview cards
│   ├── crop-care.html      # Disease detection page
│   ├── farmer-assistant.html # AI chat interface
│   ├── market-analysis.html  # Market prices page
│   ├── weather-advisory.html # Weather page
│   ├── water-footprint.html  # Water calculator
│   ├── schemes.html          # Government schemes chat
│   ├── equipment-rental.html # Equipment rental marketplace
│   ├── waste-exchange.html   # Crop waste exchange
│   └── donation.html         # Donation page
└── static/
    ├── styles.css              # Global styles
    ├── testimonials.css        # Landing page testimonials carousel
    ├── farmer-assistant.js     # AI chat frontend logic
    ├── disease_detection_response.js # Disease detection UI
    ├── market-prices.js        # Market analysis logic
    ├── weather.js              # Weather UI logic
    ├── schemes.js              # Schemes chatbot logic
    ├── payment.js              # Payment modal handling
    ├── calendar.js             # Equipment booking calendar
    ├── testimonials.js         # Landing page carousel
    ├── hotspot_map.html        # Generated Folium map
    └── images/                 # Equipment images
```

## Key Design Decisions

### 1. Multi-Agent Farmer Assistant (LangGraph)
The AI assistant uses LangGraph StateGraph with category-based routing:
- **Classifier Agent**: Routes queries to the correct specialist agent
- **7 Specialist Agents**: Financial, Personal (RAG), Farming, Education, Schemes, Disease, Weather
- **Personal Agent** uses ChromaDB RAG for mental health document retrieval
- **Chat history** maintained in state for context-aware conversations

### 2. Disease Detection Pipeline
```
Image Upload → Xception Model (38 classes)
                    ↓ (if confidence > threshold)
              Disease Name → Groq LLM → Detailed Report
                    ↓ (fallback if model unavailable)
              Gemini Vision → Disease Name → Groq LLM → Report
```

### 3. Frontend Pattern
- Server-rendered HTML via Jinja2 templates
- TailwindCSS via CDN for all styling (dark agricultural theme)
- JavaScript modules per page (static/*.js)
- No build step required - all CDN-based
- Web Speech API for voice features (no server-side STT/TTS needed)
- marked.js for rendering LLM markdown responses

### 4. Data Storage
- JSON file-based storage (no database server required)
- ChromaDB for vector embeddings (farmer assistant RAG)
- Model files (.h5, .pkl) stored in respective model directories

### 5. Enhancement Features (from KisanSaathi reference)
- **9 Indian Languages**: English, Hindi, Punjabi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati
- **Voice Input**: Browser Web Speech API (SpeechRecognition) - no server needed
- **Text-to-Speech**: Browser Web Speech API (SpeechSynthesis) - no server needed
- **Web Search**: Perplexity AI integration for real-time farming info
- **Markdown Rendering**: marked.js for rich AI response display
- **Follow-up Suggestions**: Auto-extracted from AI responses
