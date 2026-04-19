from fastapi import FastAPI, File, UploadFile, Form, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import io
import os
import logging
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta
from fastapi.staticfiles import StaticFiles
import pandas as pd
from PIL import Image
from dotenv import load_dotenv
import requests
import joblib
from google import genai
from supabase import create_client, Client
from prediction import model_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found. Please check your .env file.")
    supabase = None

def hash_password(password):
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password, stored_hash):
    if ":" not in stored_hash:
        return False
    salt, hashed = stored_hash.split(":")
    return hashlib.sha256((password + salt).encode()).hexdigest() == hashed

WASTE_RATES = {"rice-straw": 1.00, "wheat-straw": 0.90, "sugarcane-bagasse": 1.20, "corn-stalks": 0.80, "cotton-stalks": 0.70, "other": 0.50}

try:
    water_footprint_model = joblib.load("Water Footprint Model/Model/water_footprint_model.pkl")
    logger.info("Water footprint model loaded successfully")
except Exception as e:
    logger.error(f"Error loading water footprint model: {str(e)}")
    water_footprint_model = None

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")
OPEN_WEATHER_API_KEY = os.getenv("OPEN_WEATHER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set in the .env file")
    gemini_client = None
else:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)

if not GROQ_API_KEY:
    logger.warning("GROQ API KEY is not set in the .env file")

farmer_assistant_app = None
farmer_assistant_initialized = False

def ensure_farmer_assistant_initialized():
    global farmer_assistant_initialized, farmer_assistant_app
    if not farmer_assistant_initialized:
        logger.info("Initializing Farmer Assistant (first use)...")
        from FarmerAssistant import app as fa_app, main as init_farmer_assistant
        farmer_assistant_app = fa_app
        init_farmer_assistant()
        farmer_assistant_initialized = True
        logger.info("Farmer Assistant initialized successfully")

# --- HTML Routes ---
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/donation.html", response_class=HTMLResponse)
async def donation_page(request: Request):
    return templates.TemplateResponse("donation.html", {"request": request})

@app.get("/dashboard.html", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/crop-care.html", response_class=HTMLResponse)
async def crop_care_page(request: Request):
    return templates.TemplateResponse("crop-care.html", {"request": request})

@app.get("/market-analysis.html", response_class=HTMLResponse)
async def market_analysis_page(request: Request):
    return templates.TemplateResponse("market-analysis.html", {"request": request, "data_gov_api_key": DATA_GOV_API_KEY})

@app.get("/equipment-rental.html", response_class=HTMLResponse)
async def equipment_rental_page(request: Request):
    return templates.TemplateResponse("equipment-rental.html", {"request": request})

@app.get("/farmer-assistant.html", response_class=HTMLResponse)
async def farmer_assistant_page(request: Request):
    return templates.TemplateResponse("farmer-assistant.html", {"request": request})

@app.get("/water-footprint.html", response_class=HTMLResponse)
async def water_footprint_page(request: Request):
    return templates.TemplateResponse("water-footprint.html", {"request": request})

@app.get("/weather-advisory.html", response_class=HTMLResponse)
async def weather_advisory_page(request: Request):
    return templates.TemplateResponse("weather-advisory.html", {"request": request, "weather_api_key": OPEN_WEATHER_API_KEY or ""})

@app.get("/schemes.html", response_class=HTMLResponse)
async def schemes_page(request: Request):
    return templates.TemplateResponse("schemes.html", {"request": request})

@app.get("/waste-exchange.html", response_class=HTMLResponse)
async def waste_exchange_page(request: Request):
    return templates.TemplateResponse("waste-exchange.html", {"request": request})

# --- APIs ---

@app.post("/api/auth/signup")
async def signup(request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        name = body.get("name", "").strip()
        email = body.get("email", "").strip()
        password = body.get("password", "")
        phone = body.get("phone", "").strip()
        farm_name = body.get("farm_name", "").strip()
        
        if not email or not password or not name:
            raise HTTPException(status_code=400, detail="Name, email and password are required")
            
        # Check if user exists
        existing = supabase.table("users").select("*").eq("email", email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User with this email already exists")
            
        new_user = {
            "name": name,
            "email": email,
            "phone": phone,
            "farm_name": farm_name or name + " Farm",
            "password_hash": hash_password(password)
        }
        
        res = supabase.table("users").insert(new_user).execute()
        if res.data:
            user = res.data[0]
            return JSONResponse(content={"success": True, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "phone": user["phone"], "farm_name": user["farm_name"]}})
        raise HTTPException(status_code=500, detail="Failed to create user")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login(request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        email = body.get("email", "").strip()
        password = body.get("password", "")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
            
        res = supabase.table("users").select("*").eq("email", email).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found. Please register first.")
            
        user = res.data[0]
        if verify_password(password, user["password_hash"]):
            return JSONResponse(content={"success": True, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "phone": user.get("phone", ""), "farm_name": user.get("farm_name", "")}})
        else:
            raise HTTPException(status_code=401, detail="Invalid password")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/equipment")
async def get_equipment(type: str = "", location: str = "", min_price: float = 0, max_price: float = 999999):
    if not supabase: return JSONResponse(content={"equipment": [], "total": 0})
    query = supabase.table("equipment").select("*")
    if type:
        query = query.eq("type", type)
    if min_price > 0:
        query = query.gte("daily_rate", min_price)
    if max_price < 999999:
        query = query.lte("daily_rate", max_price)
        
    res = query.execute()
    filtered = res.data
    
    if location:
        filtered = [e for e in filtered if location.lower() in (e.get("location") or "").lower()]
        
    return JSONResponse(content={"equipment": filtered, "total": len(filtered)})

@app.post("/api/equipment")
async def add_equipment(request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        new_item = {
            "type": body.get("type", "other"),
            "name": body.get("name", ""),
            "daily_rate": float(body.get("daily_rate", 0)),
            "location": body.get("location", ""),
            "description": body.get("description", ""),
            "owner": body.get("owner", "anonymous"),
            "image": "/static/images/" + body.get("type", "equipment") + ".jpg"
        }
        res = supabase.table("equipment").insert(new_item).execute()
        return JSONResponse(content={"success": True, "equipment": res.data[0]})
    except Exception as e:
        logger.error(f"Error adding equipment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/equipment/{equipment_id}/book")
async def book_equipment(equipment_id: str, request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        eq_res = supabase.table("equipment").select("*").eq("id", equipment_id).execute()
        if not eq_res.data:
            raise HTTPException(status_code=404, detail="Equipment not found")
            
        item = eq_res.data[0]
        start_date = body.get("start_date", "")
        end_date = body.get("end_date", "")
        
        days = 1
        total_cost = item["daily_rate"]
        if start_date and end_date:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            days = max((end - start).days, 1)
            total_cost = item["daily_rate"] * days
            
        booking = {
            "equipment_id": equipment_id,
            "equipment_name": item["name"],
            "equipment_owner": item.get("owner", ""),
            "renter_name": body.get("renter_name", ""),
            "renter_phone": body.get("renter_phone", ""),
            "start_date": start_date,
            "end_date": end_date,
            "daily_rate": item["daily_rate"],
            "total_cost": total_cost,
            "days": days
        }
        
        res = supabase.table("bookings").insert(booking).execute()
        return JSONResponse(content={"success": True, "booking": res.data[0]})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error booking equipment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bookings")
async def get_bookings(owner: str = "", renter: str = ""):
    if not supabase: return JSONResponse(content={"bookings": [], "total": 0})
    query = supabase.table("bookings").select("*")
    if owner:
        query = query.eq("equipment_owner", owner)
    if renter:
        query = query.eq("renter_name", renter)
        
    res = query.order("created_at", desc=True).execute()
    return JSONResponse(content={"bookings": res.data, "total": len(res.data)})

@app.post("/api/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        new_status = body.get("status", "")
        updates = {"status": new_status}
        if "payment_method" in body: updates["payment_method"] = body["payment_method"]
        if "payment_details" in body: updates["payment_details"] = body["payment_details"]
        
        res = supabase.table("bookings").update(updates).eq("id", booking_id).execute()
        if res.data:
            return JSONResponse(content={"success": True, "booking": res.data[0]})
        raise HTTPException(status_code=404, detail="Booking not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/waste")
async def get_waste_listings():
    if not supabase: return JSONResponse(content={"listings": [], "rates": WASTE_RATES})
    res = supabase.table("waste_listings").select("*").order("created_at", desc=True).execute()
    return JSONResponse(content={"listings": res.data, "rates": WASTE_RATES})

@app.post("/api/waste")
async def add_waste_listing(request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        waste_type = body.get("waste_type", "")
        raw_qty = body.get("quantity", 0)
        if isinstance(raw_qty, str):
            import re
            num_match = re.search(r'[\d.]+', raw_qty)
            quantity = float(num_match.group()) if num_match else 0.0
        else:
            quantity = float(raw_qty)
            
        rate = WASTE_RATES.get(waste_type, 0.50)
        waste_labels = {"rice-straw": "Rice Straw", "wheat-straw": "Wheat Straw", "sugarcane-bagasse": "Sugarcane Bagasse", "corn-stalks": "Corn Stalks", "cotton-stalks": "Cotton Stalks", "other": "Other"}
        
        new_listing = {
            "waste_type": waste_type,
            "waste_type_label": waste_labels.get(waste_type, waste_type),
            "quantity": quantity,
            "location": body.get("location", ""),
            "pickup_date": body.get("pickup_date", ""),
            "price": round(quantity * rate, 2),
            "seller": body.get("seller", "anonymous")
        }
        res = supabase.table("waste_listings").insert(new_listing).execute()
        return JSONResponse(content={"success": True, "listing": res.data[0]})
    except Exception as e:
        logger.error(f"Error adding waste listing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/waste/{listing_id}")
async def delete_waste_listing(listing_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        supabase.table("waste_listings").delete().eq("id", listing_id).execute()
        return JSONResponse(content={"success": True})
    except Exception as e:
        logger.error(f"Error deleting waste listing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather/current")
async def get_current_weather(city: str = "Jaipur"):
    try:
        api_key = OPEN_WEATHER_API_KEY
        if not api_key:
            raise HTTPException(status_code=500, detail="Weather API key not configured")
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        response = await asyncio.to_thread(requests.get, url, timeout=10)
        if response.status_code == 200:
            return JSONResponse(content=response.json())
        else:
            raise HTTPException(status_code=response.status_code, detail="Weather API error")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/weather/forecast")
async def get_weather_forecast(city: str = "Jaipur"):
    try:
        api_key = OPEN_WEATHER_API_KEY
        if not api_key:
            raise HTTPException(status_code=500, detail="Weather API key not configured")
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
        response = await asyncio.to_thread(requests.get, url, timeout=10)
        if response.status_code == 200:
            return JSONResponse(content=response.json())
        else:
            raise HTTPException(status_code=response.status_code, detail="Weather API error")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Weather forecast error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/disease_prediction")
async def disease_prediction(file: UploadFile = File(...), selected_language: str = Form(...)):
    try:
        logger.info(f"Received request with file: {file.filename}, selected_language: {selected_language}")
        if not selected_language:
            raise HTTPException(status_code=400, detail="Language is required")
        contents = await file.read()
        try:
            img = Image.open(io.BytesIO(contents))
            img.verify()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")
        temp_image_path = f"temp_{file.filename}"
        try:
            with open(temp_image_path, "wb") as temp_file:
                temp_file.write(contents)
            response = await asyncio.to_thread(model_response, temp_image_path, selected_language)
            if "error" in response:
                raise HTTPException(status_code=500, detail=response["error"])
            return JSONResponse(status_code=200, content=response)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in model_response: {str(e)}", exc_info=True)
            error_detail = str(e)
            if hasattr(e, "detail"):
                error_detail = e.detail
            raise HTTPException(status_code=500, detail=f"Error in model processing: {error_detail}")
        finally:
            import time
            for attempt in range(3):
                try:
                    if os.path.exists(temp_image_path):
                        os.remove(temp_image_path)
                    break
                except PermissionError:
                    time.sleep(0.2)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/chat")
async def chat(request: Request):
    try:
        body = await request.json()
        question = body.get("question", "")
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        prompt = "You are an AI assistant helping farmers understand government schemes. Please provide detailed, accurate information about the following question related to government schemes for farmers. Format your response with: Use **bold** for important points, Use *italics* for emphasis, Include relevant links where applicable, Use bullet points for lists, Add line breaks between sections, Keep the language simple and easy to understand. If the question is not about government schemes, politely inform the user that you can only help with government scheme related queries. Question: " + question
        if gemini_client:
            response = await asyncio.to_thread(
                gemini_client.models.generate_content,
                model="gemini-2.5-flash",
                contents=prompt
            )
            return JSONResponse(content={"response": response.text})
        else:
            return JSONResponse(content={"response": "Gemini API key not configured"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/farmer-chat")
async def farmer_chat(request: Request):
    try:
        from langchain_core.messages import HumanMessage, AIMessage
        await asyncio.to_thread(ensure_farmer_assistant_initialized)

        body = await request.json()
        question = body.get("question", "")
        chat_history = body.get("chat_history", [])
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        lc_history = []
        try:
            for i in range(0, len(chat_history), 2):
                if i + 1 < len(chat_history):
                    lc_history.append(HumanMessage(content=chat_history[i]))
                    lc_history.append(AIMessage(content=chat_history[i + 1]))
        except Exception as e:
            logger.error(f"Error converting chat history: {str(e)}")
            lc_history = []
        try:
            current_state = {"query": question, "chat_history": lc_history}
            final_state = await asyncio.to_thread(farmer_assistant_app.invoke, current_state)
            serialized_history = []
            for msg in final_state["chat_history"]:
                if isinstance(msg, (HumanMessage, AIMessage)):
                    serialized_history.append(msg.content)
            return JSONResponse(content={"response": final_state["response"], "chat_history": serialized_history})
        except Exception as e:
            logger.error(f"Error in LangChain processing: {str(e)}")
            return JSONResponse(content={"response": "I apologize, but I am having trouble processing your request right now. Please try again later.", "chat_history": chat_history})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in farmer chat: {str(e)}")
        return JSONResponse(status_code=500, content={"error": f"Chat processing error: {str(e)}"})

@app.post("/api/calculate-water-footprint")
async def calculate_water_footprint(request: Request):
    try:
        data = await request.json()
        area = float(data.get("area", 1))
        temperature = float(data.get("temperature", 25))
        humidity = float(data.get("humidity", 50))
        rainfall = float(data.get("rainfall", 100))
        crop_type = data.get("cropType", "")
        soil_type = data.get("soilType", "")
        irrigation_method = data.get("irrigationMethod", "")

        if water_footprint_model is not None:
            input_data = pd.DataFrame([{"CropType": crop_type, "Region": data.get("region", ""), "SoilType": soil_type, "IrrigationMethod": irrigation_method, "Rainfall": rainfall, "Temperature": temperature, "Humidity": humidity}])
            prediction = water_footprint_model.predict(input_data)[0]
            total_water = prediction * area / 1000
        else:
            base_water = {"Rice": 1200, "Wheat": 450, "Cotton": 700, "Sugarcane": 1500, "Maize": 500, "Soybean": 450}.get(crop_type, 600)
            soil_factor = {"Clay": 0.8, "Loam": 1.0, "Sandy": 1.3, "Silt": 0.9}.get(soil_type, 1.0)
            irrigation_factor = {"Drip": 0.6, "Sprinkler": 0.8, "Flood": 1.2, "Furrow": 1.0, "Rainfed": 0.5}.get(irrigation_method, 1.0)

            if temperature < 20: temp_factor = 0.8
            elif temperature <= 30: temp_factor = 1.0
            elif temperature <= 40: temp_factor = 1.2
            else: temp_factor = 1.5

            if humidity > 70: humidity_factor = 0.8
            elif humidity >= 40: humidity_factor = 1.0
            else: humidity_factor = 1.2

            if rainfall > 200: rainfall_adj = -0.2
            elif rainfall >= 100: rainfall_adj = -0.1
            else: rainfall_adj = 0

            total_water = base_water * soil_factor * irrigation_factor * temp_factor * humidity_factor * (1 + rainfall_adj) * area / 1000

        water_per_day = total_water / 90
        water_per_week = water_per_day * 7
        return JSONResponse(content={"totalWater": total_water, "dailyWater": water_per_day, "weeklyWater": water_per_week})
    except Exception as e:
        logger.error(f"Error calculating water footprint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/web-search")
async def web_search(request: Request):
    try:
        body = await request.json()
        question = body.get("question", "")
        tavily_key = os.getenv("TAVILY_API_KEY")
        if not tavily_key:
            raise HTTPException(status_code=500, detail="TAVILY_API_KEY not configured. Please set it in .env file. Get free API key from https://app.tavily.com")

        try:
            response = await asyncio.to_thread(
                requests.post,
                "https://api.tavily.com/search",
                json={"api_key": tavily_key, "query": question, "search_depth": "basic", "include_answer": True, "max_results": 5},
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                answer = data.get("answer", "")
                results = data.get("results", [])

                response_text = answer
                if results:
                    response_text += "\n\nSources:\n"
                    for i, result in enumerate(results[:3], 1):
                        response_text += f"{i}. {result.get('title', 'Source')} - {result.get('url', '')}\n"

                return JSONResponse(content={"choices": [{"message": {"role": "assistant", "content": response_text}}]})
            else:
                raise HTTPException(status_code=response.status_code, detail=f"Tavily API error: {response.text}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Tavily search failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Web search error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Web search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini-analyze")
async def gemini_analyze_image(file: UploadFile = File(...), language: str = Form("English")):
    try:
        from google.genai import types
        contents = await file.read()
        prompt = f"Analyze this agricultural/plant image. Identify any disease, pest damage, or health issues. Provide causes, prevention, and treatment. Respond in {language}."

        if gemini_client:
            response = await asyncio.to_thread(
                gemini_client.models.generate_content,
                model="gemini-2.5-flash",
                contents=[types.Part.from_text(text=prompt), types.Part.from_bytes(data=contents, mime_type=file.content_type or "image/jpeg")]
            )
            return JSONResponse(content={"response": response.text})
        else:
            return JSONResponse(content={"response": "Gemini API key not configured"})
    except Exception as e:
        logger.error(f"Gemini image analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/community")
async def get_community_posts():
    if not supabase: return JSONResponse(content={"posts": [], "total": 0})
    res = supabase.table("community_posts").select("*").order("created_at", desc=True).execute()
    return JSONResponse(content={"posts": res.data, "total": len(res.data)})

@app.post("/api/community")
async def create_community_post(request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        title = body.get("title", "").strip()
        content = body.get("content", "").strip()
        if not title or not content:
            raise HTTPException(status_code=400, detail="Title and content are required")
            
        new_post = {
            "title": title,
            "content": content,
            "category": body.get("category", "general"),
            "author": body.get("author", "Anonymous Farmer"),
            "type": body.get("type", "post"),
            "lat": body.get("lat"),
            "lng": body.get("lng"),
            "district": body.get("district", "")
        }
        res = supabase.table("community_posts").insert(new_post).execute()
        return JSONResponse(content={"success": True, "post": res.data[0]})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating community post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/community/{post_id}/answer")
async def add_answer_to_post(post_id: str, request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        content = body.get("content", "").strip()
        if not content:
            raise HTTPException(status_code=400, detail="Answer content is required")
            
        res = supabase.table("community_posts").select("answers").eq("id", post_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Post not found")
            
        answers = res.data[0].get("answers") or []
        answer = {
            "id": str(uuid.uuid4()),
            "content": content,
            "author": body.get("author", "Anonymous Farmer"),
            "created_at": datetime.now().isoformat(),
        }
        answers.append(answer)
        
        upd = supabase.table("community_posts").update({"answers": answers}).eq("id", post_id).execute()
        return JSONResponse(content={"success": True, "answer": answer})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/community/{post_id}/best-answer")
async def mark_best_answer(post_id: str, request: Request):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        body = await request.json()
        answer_id = body.get("answerId", "")
        res = supabase.table("community_posts").update({"bestAnswerId": answer_id}).eq("id", post_id).execute()
        if res.data:
            return JSONResponse(content={"success": True})
        raise HTTPException(status_code=404, detail="Post not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking best answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/community/{post_id}")
async def delete_community_post(post_id: str):
    if not supabase: raise HTTPException(status_code=500, detail="Database not configured")
    try:
        supabase.table("community_posts").delete().eq("id", post_id).execute()
        return JSONResponse(content={"success": True})
    except Exception as e:
        logger.error(f"Error deleting community post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8001"))
    uvicorn.run(app, host=host, port=port)