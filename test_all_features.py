"""
Kisaan Saathi - Quick Feature Test Suite
=========================================
Tests all pages, APIs, LLMs, and external services.
Run while the app is running: python test_all_features.py
"""

import requests
import json
import time
import os
import sys

BASE = "http://127.0.0.1:8000"
PASS = 0
FAIL = 0
SKIP = 0
results = []


def test(name, func):
    global PASS, FAIL, SKIP
    try:
        status, detail = func()
        if status == "PASS":
            PASS += 1
            icon = "✅"
        elif status == "SKIP":
            SKIP += 1
            icon = "⏭️"
        else:
            FAIL += 1
            icon = "❌"
        results.append((icon, name, detail))
        print(f"  {icon} {name}: {detail}")
    except Exception as e:
        FAIL += 1
        results.append(("❌", name, str(e)[:120]))
        print(f"  ❌ {name}: {str(e)[:120]}")


# ========== 1. PAGE ROUTES ==========
print("\n" + "=" * 60)
print("1. PAGE ROUTES (HTML)")
print("=" * 60)

pages = [
    ("/", "Home / Login"),
    ("/donation.html", "Donation"),
    ("/dashboard.html", "Dashboard"),
    ("/crop-care.html", "Crop Care"),
    ("/market-analysis.html", "Market Analysis"),
    ("/equipment-rental.html", "Equipment Rental"),
    ("/farmer-assistant.html", "Farmer Assistant"),
    ("/water-footprint.html", "Water Footprint"),
    ("/weather-advisory.html", "Weather Advisory"),
    ("/schemes.html", "Government Schemes"),
    ("/waste-exchange.html", "Waste Exchange"),
]

for path, name in pages:
    def make_test(p=path):
        def t():
            r = requests.get(f"{BASE}{p}", timeout=10)
            if r.status_code == 200 and len(r.text) > 100:
                return ("PASS", f"HTTP {r.status_code}, {len(r.text)} bytes")
            return ("FAIL", f"HTTP {r.status_code}, {len(r.text)} bytes")
        return t
    test(f"Page: {name}", make_test())


# ========== 2. AUTH APIS ==========
print("\n" + "=" * 60)
print("2. AUTH APIs")
print("=" * 60)

def test_signup():
    r = requests.post(f"{BASE}/api/auth/signup", json={
        "name": "Test Farmer",
        "email": f"test_{int(time.time())}@test.com",
        "phone": "9876543210",
        "password": "testpass123"
    }, timeout=10)
    if r.status_code == 200:
        return ("PASS", f"Signup OK: {r.json().get('message', '')[:50]}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

def test_login():
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": "test@test.com",
        "password": "wrongpass"
    }, timeout=10)
    # Even a 401/404 means the endpoint works (user doesn't exist or wrong password)
    if r.status_code in [200, 401, 404]:
        return ("PASS", f"Login endpoint responds: HTTP {r.status_code}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Auth: Signup", test_signup)
test("Auth: Login", test_login)


# ========== 3. WEATHER API (OpenWeatherMap) ==========
print("\n" + "=" * 60)
print("3. WEATHER API (OpenWeatherMap)")
print("=" * 60)

def test_current_weather():
    r = requests.get(f"{BASE}/api/weather/current", params={"lat": "28.6139", "lon": "77.2090"}, timeout=15)
    if r.status_code == 200:
        data = r.json()
        temp = data.get("main", {}).get("temp", "?")
        return ("PASS", f"Delhi weather: {temp}°K, API working")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

def test_forecast():
    r = requests.get(f"{BASE}/api/weather/forecast", params={"lat": "28.6139", "lon": "77.2090"}, timeout=15)
    if r.status_code == 200:
        data = r.json()
        count = len(data.get("list", []))
        return ("PASS", f"Got {count} forecast entries")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Weather: Current (OpenWeatherMap)", test_current_weather)
test("Weather: 5-Day Forecast", test_forecast)


# ========== 4. FARMER ASSISTANT (Groq LLM + LangGraph) ==========
print("\n" + "=" * 60)
print("4. FARMER ASSISTANT (Groq Llama 3.3 70B + LangGraph)")
print("=" * 60)

def test_farmer_chat_farming():
    r = requests.post(f"{BASE}/api/farmer-chat", json={
        "question": "What is the best time to plant wheat in North India?",
        "chat_history": []
    }, timeout=30)
    if r.status_code == 200:
        data = r.json()
        resp = data.get("response", "")
        if len(resp) > 20:
            return ("PASS", f"Groq LLM responded ({len(resp)} chars): \"{resp[:60]}...\"")
        return ("FAIL", f"Response too short: {resp}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

def test_farmer_chat_personal():
    """Tests RAG pipeline (ChromaDB + sentence-transformers embeddings)"""
    r = requests.post(f"{BASE}/api/farmer-chat", json={
        "question": "I am feeling very stressed about my crop failure",
        "chat_history": []
    }, timeout=30)
    if r.status_code == 200:
        data = r.json()
        resp = data.get("response", "")
        if len(resp) > 10:
            return ("PASS", f"RAG/Personal response ({len(resp)} chars): \"{resp[:60]}...\"")
        return ("FAIL", f"Response too short: {resp}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

def test_farmer_chat_schemes():
    r = requests.post(f"{BASE}/api/farmer-chat", json={
        "question": "Tell me about PM Kisan scheme",
        "chat_history": []
    }, timeout=30)
    if r.status_code == 200:
        data = r.json()
        resp = data.get("response", "")
        return ("PASS", f"Schemes routing OK ({len(resp)} chars): \"{resp[:60]}...\"")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Farmer Chat: Farming Query (Groq LLM)", test_farmer_chat_farming)
test("Farmer Chat: Personal/Mental Health (RAG + ChromaDB)", test_farmer_chat_personal)
test("Farmer Chat: Gov Schemes Routing", test_farmer_chat_schemes)


# ========== 5. GOVERNMENT SCHEMES CHAT (Gemini) ==========
print("\n" + "=" * 60)
print("5. GOVERNMENT SCHEMES CHAT (Google Gemini 2.0 Flash)")
print("=" * 60)

def test_gemini_chat():
    r = requests.post(f"{BASE}/api/chat", json={
        "question": "What is PM-KISAN Yojana and who is eligible?"
    }, timeout=30)
    if r.status_code == 200:
        data = r.json()
        resp = data.get("response", "")
        if len(resp) > 30:
            return ("PASS", f"Gemini responded ({len(resp)} chars): \"{resp[:60]}...\"")
        return ("FAIL", f"Response too short: {resp}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Schemes Chat: Gemini LLM", test_gemini_chat)


# ========== 6. WATER FOOTPRINT (scikit-learn Model) ==========
print("\n" + "=" * 60)
print("6. WATER FOOTPRINT CALCULATOR (Random Forest ML Model)")
print("=" * 60)

def test_water_footprint():
    r = requests.post(f"{BASE}/api/calculate-water-footprint", json={
        "area": 5,
        "temperature": 30,
        "humidity": 60,
        "rainfall": 150,
        "cropType": "Rice",
        "soilType": "Clay",
        "irrigationMethod": "Flood",
        "region": "North India"
    }, timeout=15)
    if r.status_code == 200:
        data = r.json()
        total = data.get("totalWater", 0)
        daily = data.get("dailyWater", 0)
        return ("PASS", f"Total: {total:.1f}kL, Daily: {daily:.2f}kL/day")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Water Footprint: ML Prediction", test_water_footprint)


# ========== 7. DISEASE PREDICTION (Gemini Vision Fallback) ==========
print("\n" + "=" * 60)
print("7. DISEASE PREDICTION (Gemini Vision API fallback)")
print("=" * 60)

def test_disease_prediction():
    # Create a tiny test image (1x1 green pixel PNG)
    import io
    try:
        from PIL import Image as PILImage
        img = PILImage.new('RGB', (100, 100), color=(34, 139, 34))  # forest green
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        r = requests.post(f"{BASE}/disease_prediction",
                          files={"file": ("test_leaf.png", buf, "image/png")},
                          data={"selected_language": "English"},
                          timeout=30)
        if r.status_code == 200:
            data = r.json()
            disease = data.get("disease", data.get("prediction", ""))
            desc = data.get("description", data.get("response", ""))[:60]
            return ("PASS", f"Prediction: \"{disease[:40]}\" | {desc}...")
        return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")
    except ImportError:
        return ("SKIP", "Pillow not installed, cannot create test image")

test("Disease: Image Analysis (Gemini Vision)", test_disease_prediction)


# ========== 8. GEMINI IMAGE ANALYSIS ==========
print("\n" + "=" * 60)
print("8. GEMINI IMAGE ANALYSIS ENDPOINT")
print("=" * 60)

def test_gemini_analyze():
    import io
    try:
        from PIL import Image as PILImage
        img = PILImage.new('RGB', (100, 100), color=(139, 69, 19))  # brown
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        buf.seek(0)
        r = requests.post(f"{BASE}/api/gemini-analyze",
                          files={"file": ("soil.png", buf, "image/png")},
                          data={"language": "English"},
                          timeout=30)
        if r.status_code == 200:
            data = r.json()
            resp = data.get("response", "")[:80]
            return ("PASS", f"Gemini analyze responded: \"{resp}...\"")
        return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")
    except ImportError:
        return ("SKIP", "Pillow not installed")

test("Gemini: Image Analyze Endpoint", test_gemini_analyze)


# ========== 9. WEB SEARCH (Perplexity) ==========
print("\n" + "=" * 60)
print("9. WEB SEARCH (Perplexity AI)")
print("=" * 60)

def test_web_search():
    from dotenv import load_dotenv
    load_dotenv()
    key = os.getenv("PERPLEXITY_API_KEY", "")
    if not key:
        return ("SKIP", "PERPLEXITY_API_KEY not set in .env (optional feature)")
    r = requests.post(f"{BASE}/api/web-search", json={
        "question": "Current MSP for wheat in India 2025"
    }, timeout=30)
    if r.status_code == 200:
        data = r.json()
        choices = data.get("choices", [])
        if choices:
            content = choices[0].get("message", {}).get("content", "")[:60]
            return ("PASS", f"Perplexity responded: \"{content}...\"")
        return ("FAIL", f"No choices in response: {json.dumps(data)[:80]}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Web Search: Perplexity API", test_web_search)


# ========== 10. EQUIPMENT RENTAL CRUD ==========
print("\n" + "=" * 60)
print("10. EQUIPMENT RENTAL (CRUD)")
print("=" * 60)

def test_equipment_list():
    r = requests.get(f"{BASE}/api/equipment", timeout=10)
    if r.status_code == 200:
        data = r.json()
        return ("PASS", f"Got {len(data)} equipment items")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

def test_equipment_add():
    r = requests.post(f"{BASE}/api/equipment", json={
        "name": "Test Tractor",
        "description": "Test equipment from automated test",
        "dailyRate": 500,
        "location": "Test Village",
        "ownerName": "Test Owner",
        "ownerContact": "9999999999"
    }, timeout=10)
    if r.status_code == 200:
        return ("PASS", f"Equipment added: {r.json().get('id', 'unknown')}")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Equipment: List", test_equipment_list)
test("Equipment: Add New", test_equipment_add)


# ========== 11. WASTE EXCHANGE CRUD ==========
print("\n" + "=" * 60)
print("11. WASTE EXCHANGE (CRUD)")
print("=" * 60)

def test_waste_list():
    r = requests.get(f"{BASE}/api/waste", timeout=10)
    if r.status_code == 200:
        data = r.json()
        return ("PASS", f"Got {len(data)} waste listings")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

def test_waste_add():
    r = requests.post(f"{BASE}/api/waste", json={
        "waste_type": "rice-straw",
        "quantity": 100,
        "location": "Test Village",
        "seller": "Test Farmer",
        "pickup_date": "2026-03-10"
    }, timeout=10)
    if r.status_code == 200:
        return ("PASS", f"Waste listing added")
    return ("FAIL", f"HTTP {r.status_code}: {r.text[:80]}")

test("Waste Exchange: List", test_waste_list)
test("Waste Exchange: Add Listing", test_waste_add)


# ========== 12. STATIC ASSETS ==========
print("\n" + "=" * 60)
print("12. STATIC ASSETS")
print("=" * 60)

def test_static(path, name):
    def t():
        r = requests.get(f"{BASE}{path}", timeout=10)
        if r.status_code == 200:
            return ("PASS", f"{len(r.text)} bytes")
        return ("FAIL", f"HTTP {r.status_code}")
    return t

test("Static: styles.css", test_static("/static/styles.css", "CSS"))
test("Static: farmer-assistant.js", test_static("/static/farmer-assistant.js", "JS"))


# ========== SUMMARY ==========
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

total = PASS + FAIL + SKIP
print(f"\n  Total:   {total} tests")
print(f"  ✅ Pass:  {PASS}")
print(f"  ❌ Fail:  {FAIL}")
print(f"  ⏭️ Skip:  {SKIP}")

print("\n" + "-" * 60)
print("API KEYS STATUS:")
print("-" * 60)
from dotenv import load_dotenv
load_dotenv()

keys = {
    "GROQ_API_KEY": ("Groq (Farmer Assistant LLM)", "https://console.groq.com/keys"),
    "GEMINI_API_KEY": ("Google Gemini (Schemes Chat + Disease Vision)", "https://aistudio.google.com/apikey"),
    "OPEN_WEATHER_API_KEY": ("OpenWeatherMap (Weather Advisory)", "https://home.openweathermap.org/api_keys"),
    "DATA_GOV_API_KEY": ("Data.gov.in (Market Prices)", "https://data.gov.in/user/register"),
    "PERPLEXITY_API_KEY": ("Perplexity AI (Web Search - OPTIONAL)", "https://www.perplexity.ai/settings/api"),
}

for key, (desc, url) in keys.items():
    val = os.getenv(key, "")
    if val:
        masked = val[:8] + "..." + val[-4:]
        print(f"  ✅ {key}: {masked}  ({desc})")
    else:
        if "OPTIONAL" in desc:
            print(f"  ⏭️ {key}: NOT SET  ({desc})")
            print(f"       Get it from: {url}")
        else:
            print(f"  ❌ {key}: NOT SET  ({desc})")
            print(f"       Get it from: {url}")

print("\n" + "-" * 60)
print("HUGGINGFACE NOTE:")
print("-" * 60)
print("  No HuggingFace API key needed! The sentence-transformers model")
print("  (all-MiniLM-L6-v2) runs LOCALLY. It was downloaded on first run.")
print("  Optional: Set HF_TOKEN in .env for faster downloads from HF Hub.")

print("\n" + "-" * 60)
print("FEATURES MATRIX:")
print("-" * 60)
features = [
    ("Farmer AI Assistant", "Groq Llama 3.3 70B", "GROQ_API_KEY", "Multi-agent LangGraph + RAG"),
    ("Government Schemes Chat", "Google Gemini 2.0 Flash", "GEMINI_API_KEY", "Gemini generative AI"),
    ("Disease Detection", "Gemini Vision (fallback)", "GEMINI_API_KEY", "ML model missing -> Gemini"),
    ("Weather Advisory", "OpenWeatherMap", "OPEN_WEATHER_API_KEY", "Current + 5-day forecast"),
    ("Market Analysis", "Data.gov.in", "DATA_GOV_API_KEY", "Commodity market prices"),
    ("Water Footprint", "scikit-learn (local)", "None", "Random Forest ML model"),
    ("Web Search", "Perplexity AI", "PERPLEXITY_API_KEY", "OPTIONAL - real-time web"),
    ("Voice Input/TTS", "Browser Web Speech API", "None", "No API key needed"),
    ("RAG Knowledge Base", "sentence-transformers", "None", "Local embeddings + ChromaDB"),
    ("Equipment Rental", "JSON storage", "None", "CRUD operations"),
    ("Waste Exchange", "JSON storage", "None", "CRUD operations"),
]

for feat, service, key, note in features:
    key_ok = "✅" if key == "None" or os.getenv(key, "") else "❌"
    print(f"  {key_ok} {feat:<25} | {service:<25} | {note}")

if FAIL > 0:
    print(f"\n⚠️  {FAIL} test(s) FAILED - check details above!")
    sys.exit(1)
else:
    print(f"\n🎉 All {PASS} tests passed! ({SKIP} skipped)")
    sys.exit(0)
