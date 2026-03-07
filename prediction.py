import os
import json
import numpy as np
import io
import logging
import base64
import requests
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# API keys & endpoints
# ---------------------------------------------------------------------------
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY is not set in the .env file -- Groq LLM calls will fail.")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set in the .env file -- Gemini vision fallback will be unavailable.")

# ---------------------------------------------------------------------------
# Supported languages (9 languages)
# ---------------------------------------------------------------------------
LANGUAGES = {
    "English":    "en",
    "हिन्दी":     "hi",   # Hindi
    "ਪੰਜਾਬੀ":    "pa",   # Punjabi
    "ಕನ್ನಡ":     "kn",   # Kannada
    "தமிழ்":     "ta",   # Tamil
    "తెలుగు":    "te",   # Telugu
    "മലയാളം":   "ml",   # Malayalam
    "मराठी":     "mr",   # Marathi
    "ગુજરાતી":   "gu",   # Gujarati
}

# ---------------------------------------------------------------------------
# Working directory & paths
# ---------------------------------------------------------------------------
working_dir = os.getcwd()

MODEL_DIR = os.path.join(working_dir, "Disease prediction Model")
KERAS_MODEL_PATH = os.path.join(MODEL_DIR, "trained_model", "plant_disease_prediction.keras")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "model_weights.weights.h5")
CLASS_INDICES_PATH = os.path.join(MODEL_DIR, "class_indices.json")

# ---------------------------------------------------------------------------
# Lazy / graceful model loading  (no crash on missing files)
# ---------------------------------------------------------------------------
prediction_model = None
class_indices = None


def _load_class_indices():
    """Load class_indices.json if it exists."""
    global class_indices
    if class_indices is not None:
        return class_indices
    if os.path.exists(CLASS_INDICES_PATH):
        with open(CLASS_INDICES_PATH, "r") as f:
            class_indices = json.load(f)
            logger.info("Class indices loaded successfully from %s", CLASS_INDICES_PATH)
    else:
        logger.warning("class_indices.json not found at %s", CLASS_INDICES_PATH)
    return class_indices


def _load_ml_model():
    """
    Attempt to load the TensorFlow / Keras model.
    Returns the model on success, or None on failure.
    TensorFlow is imported only inside this function so the rest of the app
    never pays the import cost when the model files are absent.
    """
    global prediction_model

    if prediction_model is not None:
        return prediction_model

    # --- fast-fail if neither model file exists ---
    has_keras = os.path.exists(KERAS_MODEL_PATH)
    has_weights = os.path.exists(WEIGHTS_PATH)

    if not has_keras and not has_weights:
        logger.warning(
            "Neither .keras model nor weights file found -- ML prediction disabled.\n"
            "  Looked for: %s\n"
            "  Looked for: %s",
            KERAS_MODEL_PATH,
            WEIGHTS_PATH,
        )
        return None

    try:
        import tensorflow as tf
        from tensorflow.keras.applications import Xception
        from tensorflow.keras.layers import BatchNormalization

        if has_keras:
            logger.info("Loading full Keras model from %s ...", KERAS_MODEL_PATH)
            prediction_model = tf.keras.models.load_model(KERAS_MODEL_PATH)
            logger.info("Keras model loaded successfully.")
            return prediction_model

        # Fall back to building architecture + loading weights
        logger.info("Building Xception architecture and loading weights from %s ...", WEIGHTS_PATH)
        base_model = Xception(
            weights="imagenet",
            include_top=False,
            input_shape=(224, 224, 3),
            pooling="avg",
        )
        model = tf.keras.Sequential([
            base_model,
            BatchNormalization(),
            tf.keras.layers.Dense(256, activation="relu"),
            tf.keras.layers.Dropout(0.5),
            tf.keras.layers.Dense(38, activation="softmax"),
        ])
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
            loss="categorical_crossentropy",
            metrics=["accuracy"],
        )
        model.load_weights(WEIGHTS_PATH)
        prediction_model = model
        logger.info("Model architecture built and weights loaded successfully.")
        return prediction_model

    except Exception as exc:
        logger.error("Failed to load ML model: %s", exc, exc_info=True)
        prediction_model = None
        return None


# Eagerly attempt to load (but do NOT crash if it fails)
_load_class_indices()
_load_ml_model()

# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------

def _preprocess_image_for_model(image_path):
    """Open, resize, normalise an image for the Keras model."""
    img = Image.open(image_path)
    img_resized = img.resize((224, 224))
    img.close()  # Release file handle on Windows
    arr = np.array(img_resized) / 255.0
    return np.expand_dims(arr, axis=0)


# ---------------------------------------------------------------------------
# Prediction strategies
# ---------------------------------------------------------------------------

def _predict_disease_ml(image_path):
    """
    Use the local TensorFlow model to classify the disease.
    Returns the predicted class name string, or None on failure.
    """
    model = _load_ml_model()
    indices = _load_class_indices()

    if model is None or indices is None:
        return None

    try:
        processed = _preprocess_image_for_model(image_path)
        predictions = model.predict(processed)
        predicted_idx = str(np.argmax(predictions))
        disease_name = indices.get(predicted_idx)
        if disease_name:
            logger.info("ML model predicted: %s", disease_name)
        return disease_name
    except Exception as exc:
        logger.error("ML prediction failed: %s", exc, exc_info=True)
        return None


def _get_groq_explanation(disease_name, selected_language):
    """
    Ask Groq LLM for a detailed explanation of *disease_name* in
    *selected_language*. Returns a response dict in the OpenAI-compatible
    format that the caller expects, or None on failure.
    """
    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY not set -- cannot call Groq.")
        return None

    query = (
        f"Given the crop disease: {disease_name}, please provide a detailed "
        f"explanation of its causes, prevention methods, and treatment options. "
        f"Respond in the following language: {selected_language}."
    )

    try:
        response = requests.post(
            GROQ_API_URL,
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": query}],
                "max_tokens": 4000,
            },
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        if response.status_code == 200:
            result = response.json()
            logger.info("Groq LLM call succeeded for disease '%s'.", disease_name)
            return result
        else:
            logger.error("Groq API error %s: %s", response.status_code, response.text)
            return None
    except Exception as exc:
        logger.error("Groq request failed: %s", exc, exc_info=True)
        return None


def _gemini_vision_analysis(image_path, selected_language):
    """
    Use Google Gemini vision API to analyse the plant image directly.
    Returns a dict in the same format as the Groq response so the caller
    can treat it identically.
    """
    if not GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set -- Gemini vision fallback unavailable.")
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        # Read image file
        with open(image_path, "rb") as img_file:
            img_data = img_file.read()

        prompt = (
            "You are an expert agricultural scientist and plant pathologist. "
            "Analyse the provided image of a crop / plant leaf. "
            "1. Identify the plant species if possible.\n"
            "2. Identify any disease, pest damage, or nutritional deficiency visible.\n"
            "3. Explain the likely causes.\n"
            "4. Recommend prevention methods and treatment options.\n"
            "5. If the plant looks healthy, say so and give general care tips.\n\n"
            f"Respond entirely in the following language: {selected_language}."
        )

        # Use the correct format for the new API
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part(text=prompt),
                types.Part(inline_data=types.Blob(mime_type="image/jpeg", data=img_data))
            ]
        )
        
        content_text = response.text

        logger.info("Gemini vision analysis succeeded.")

        # Wrap in the same OpenAI-compatible dict structure
        return {
            "choices": [
                {
                    "message": {
                        "content": content_text,
                        "role": "assistant",
                    },
                    "index": 0,
                    "finish_reason": "stop",
                }
            ]
        }

    except Exception as exc:
        logger.error("Gemini vision analysis failed: %s", exc, exc_info=True)
        return None


# ---------------------------------------------------------------------------
# Helper to build the standard response envelope
# ---------------------------------------------------------------------------

def _wrap_response(content_text):
    """Wrap a plain text string in the expected response dict structure."""
    return {
        "choices": [
            {
                "message": {
                    "content": content_text,
                    "role": "assistant",
                },
                "index": 0,
                "finish_reason": "stop",
            }
        ]
    }


def _wrap_error(error_message):
    """Return an error dict the caller can detect via the 'error' key."""
    return {"error": error_message}


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def model_response(image_path: str, selected_language: str) -> dict:
    """
    Analyse a plant / crop image and return a disease report.

    Flow
    ----
    1. Try local ML model  -> on success ask Groq LLM for explanation
    2. If ML fails          -> use Gemini vision API as fallback
    3. If both fail         -> return a user-friendly error message

    Parameters
    ----------
    image_path : str
        Path to the uploaded image file on disk.
    selected_language : str
        Display name of the desired response language (e.g. "English",
        "हिन्दी").  Falls back to English if the value is not recognised.

    Returns
    -------
    dict
        {"choices": [{"message": {"content": "...", "role": "assistant"},
        "index": 0, "finish_reason": "stop"}]}  on success, or
        {"error": "..."}  on failure.
    """
    try:
        logger.info("Processing image: %s", image_path)
        logger.info("Selected language: %s", selected_language)

        # --- validate image file ---
        if not os.path.exists(image_path):
            return _wrap_error(f"Image file not found: {image_path}")

        try:
            with open(image_path, "rb") as f:
                img_bytes = f.read()
            img_check = Image.open(io.BytesIO(img_bytes))
            img_check.verify()
        except Exception as exc:
            return _wrap_error(f"Invalid image format: {exc}")

        # --- gracefully default language ---
        if selected_language not in LANGUAGES:
            logger.warning(
                "Unsupported language '%s' -- defaulting to English.", selected_language
            )
            selected_language = "English"

        # ------------------------------------------------------------------
        # Strategy 1: Local ML model  ->  Groq LLM explanation
        # ------------------------------------------------------------------
        disease_name = _predict_disease_ml(image_path)

        if disease_name:
            groq_result = _get_groq_explanation(disease_name, selected_language)
            if groq_result is not None:
                return groq_result
            # Groq failed but we still have the disease name -- return it raw
            logger.warning(
                "Groq LLM call failed; returning raw ML prediction instead."
            )
            return _wrap_response(
                f"Detected disease: {disease_name}. "
                f"(Detailed explanation unavailable -- the language model service "
                f"could not be reached.)"
            )

        # ------------------------------------------------------------------
        # Strategy 2: Gemini vision fallback
        # ------------------------------------------------------------------
        logger.info("ML model unavailable or prediction failed -- trying Gemini vision.")
        gemini_result = _gemini_vision_analysis(image_path, selected_language)
        if gemini_result is not None:
            return gemini_result

        # ------------------------------------------------------------------
        # Strategy 3: Everything failed
        # ------------------------------------------------------------------
        logger.error("All prediction strategies failed.")
        return _wrap_error(
            "Unable to analyse the image. Both the local ML model and the "
            "Gemini vision service are unavailable. Please check your model "
            "files and API keys."
        )

    except Exception as exc:
        logger.error("Unexpected error in model_response: %s", exc, exc_info=True)
        return _wrap_error(f"Unexpected error: {exc}")


# ---------------------------------------------------------------------------
# Quick manual test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    test_image = os.path.join(working_dir, "test_leaf.jpg")  # change as needed
    result = model_response(test_image, selected_language="English")
    if "error" in result:
        print("ERROR:", result["error"])
    else:
        print(result["choices"][0]["message"]["content"])
