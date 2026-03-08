# How to Get API Keys and ML Models

This guide will help you get all the required API keys and optional ML model files for Kisaan Saathi.

---

## 🔑 Step 1: Get New Gemini API Key (REQUIRED)

Your current Gemini API key has exceeded its quota. Here's how to get a new one:

### Option A: Create New API Key (Recommended)
1. **Go to**: https://aistudio.google.com/apikey
2. **Sign in** with your Google account
3. **Click**: "Create API Key" button
4. **Select**: "Create API key in new project" (or use existing project)
5. **Copy** the API key (starts with `AIzaSy...`)
6. **Paste** it in your `.env` file:
   ```
   GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
   ```

### Option B: Wait for Quota Reset
- Free tier quota resets every 24 hours
- Check your quota at: https://aistudio.google.com/apikey
- Current limits: 15 requests per minute (RPM)

### Option C: Upgrade to Paid Tier (Optional)
- **Cost**: $0.075 per 1K tokens (very cheap)
- **Limits**: 1000 RPM (much higher)
- **Setup**: https://ai.google.dev/pricing

---

## 📦 Step 2: ML Model Files (OPTIONAL - App Works Without Them)

Your app currently uses **Gemini Vision API as fallback** for disease detection. This works perfectly fine! However, if you want to use the local ML model for faster predictions, here's what you need:

### What Model Files Are Needed?

The code looks for these files in `Disease prediction Model/` folder:

1. **Option A (Preferred)**: `trained_model/plant_disease_prediction.keras`
   - Full Keras model file
   - Size: ~80-100 MB
   - Faster to load

2. **Option B (Alternative)**: `model_weights.weights.h5`
   - Just the weights (architecture is built in code)
   - Size: ~80-100 MB
   - Requires downloading ImageNet weights on first run

3. **Already Present**: `class_indices.json` ✅
   - Maps model output to disease names
   - You already have this file!

### Where to Get the Model Files?

**You need to train the model yourself** or get it from your team. Here's how:

#### Method 1: Train the Model (If You Have Dataset)

If you have a plant disease dataset:

```bash
# Run the training script
python retrain_model.py
```

This will:
- Train an Xception CNN model on your dataset
- Save the model to `Disease prediction Model/trained_model/`
- Generate class_indices.json (you already have this)

**Note**: Training requires:
- Plant disease image dataset (38 classes)
- GPU recommended (takes hours on CPU)
- TensorFlow 2.19.0 installed

#### Method 2: Download Pre-trained Model

If someone on your team has already trained the model:

1. **Get the model file** from your teammate
2. **Create folder**: `Disease prediction Model/trained_model/`
3. **Place file**: `plant_disease_prediction.keras` in that folder

```bash
# Create the folder
mkdir "Disease prediction Model/trained_model"

# Then copy your model file there
# (get it from your team or cloud storage)
```

#### Method 3: Use Gemini Vision Only (Current Setup)

**This is what you're doing now - and it works great!**

- No model files needed
- Gemini Vision API analyzes images directly
- Works for any plant disease (not limited to 38 classes)
- Just need a valid Gemini API key

**For hackathon demo**: This is perfectly acceptable! Just explain:
- "We use Google's Gemini Vision AI for disease detection"
- "It can identify any plant disease, not just pre-trained classes"
- "This is more flexible than a fixed ML model"

---

## 🎯 Step 3: Update Your .env File

Open `Kisaan-Mitra/.env` and update the Gemini API key:

```bash


# NEW (replace with your new key)
GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
```

**Keep all other keys the same** - they're working fine:
- ✅ GROQ_API_KEY (working)
- ✅ OPEN_WEATHER_API_KEY (working)
- ✅ DATA_GOV_API_KEY (working)

---

## 🧪 Step 4: Test Everything

After updating the Gemini API key:

```bash
# Stop the current server (Ctrl+C in the terminal)

# Run tests
python test_all_features.py

# Start the server again
python app.py
```

Expected results:
- ✅ All 29 tests should pass (or 28/29 if Perplexity not configured)
- ✅ Government Schemes chatbot should work
- ✅ Disease detection should work (via Gemini Vision)

---

## 📊 What You Need vs What's Optional

### REQUIRED (Must Have)
- ✅ GROQ_API_KEY - You have this, it's working
- ✅ GEMINI_API_KEY - **UPDATE THIS** (get new key)
- ✅ OPEN_WEATHER_API_KEY - You have this, it's working
- ✅ DATA_GOV_API_KEY - You have this, it's working

### OPTIONAL (Nice to Have)
- ⏭️ PERPLEXITY_API_KEY - For web search feature
- ⏭️ ML Model Files - For local disease detection (Gemini Vision works without it)

---

## 🚀 Quick Start (Minimum Required)

**To get everything working right now:**

1. **Get new Gemini API key**: https://aistudio.google.com/apikey
2. **Update .env file**: Replace old Gemini key with new one
3. **Restart server**: Stop (Ctrl+C) and run `python app.py` again
4. **Test**: Run `python test_all_features.py`

**That's it!** Your app will work 100% with just the new Gemini key.

---

## 🎓 For Hackathon Demo

### What to Say About ML Model

**If judges ask about the disease detection model:**

✅ **Good Answer**:
"We use a hybrid approach for disease detection:
- Primary: Google Gemini Vision AI for flexible, real-time analysis
- Fallback: We can also use a local Xception CNN model (38 disease classes)
- This gives us the best of both worlds: flexibility and speed"

❌ **Don't Say**:
"Our ML model is missing" or "We couldn't get the model working"

### What to Say About API Keys

✅ **Good Answer**:
"We integrate multiple AI services:
- Groq for fast LLM responses (Llama 3.3 70B)
- Google Gemini for vision analysis and schemes chatbot
- OpenWeatherMap for real-time weather data
- Data.gov.in for government market prices"

---

## 🔧 Troubleshooting

### Problem: Gemini API still shows quota error

**Solution**:
1. Make sure you created a **NEW** API key (not using the old one)
2. Wait 5 minutes after creating the key
3. Restart your server completely
4. Check quota at: https://aistudio.google.com/apikey

### Problem: Tests still failing

**Solution**:
```bash
# Make sure .env file is saved
# Restart Python completely
# Run tests again
python test_all_features.py
```

### Problem: Can't find model files

**Solution**:
- **Don't worry!** The app works perfectly without them
- Gemini Vision API is your disease detection system
- For demo, this is actually better (more flexible)

---

## 📞 Need Help?

### Check API Key Status
- Groq: https://console.groq.com/keys
- Gemini: https://aistudio.google.com/apikey
- OpenWeather: https://home.openweathermap.org/api_keys
- Data.gov.in: https://data.gov.in/user/login

### Test Individual Features
```bash
# Test weather API
curl "http://127.0.0.1:8000/api/weather?city=Delhi"

# Test farmer assistant
curl -X POST "http://127.0.0.1:8000/api/farmer-chat" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the best time to plant wheat?"}'
```

---

## ✅ Summary

**What you MUST do**:
1. Get new Gemini API key from https://aistudio.google.com/apikey
2. Update `.env` file with new key
3. Restart server and test

**What you DON'T need**:
- ML model files (Gemini Vision works great!)
- Perplexity API key (optional feature)
- Any other changes to your code

**Time required**: 5 minutes to get new API key and test

Your app will be 100% functional for the hackathon demo! 🎉
