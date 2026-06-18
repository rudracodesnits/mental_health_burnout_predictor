from flask import Flask, request, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
import joblib
import pandas as pd
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
frontend_url = os.environ.get("FRONTEND_URL", "*")
CORS(app, resources={r"/*": {"origins": frontend_url}})

# Expected features
EXPECTED_FEATURES = [
    "Family_History",
    "Social_Support",
    "Counseling_Service_Use",
    "Extracurricular_Involvement",
    "Semester_Credit_Load",
    "Sleep_Quality",
    "Physical_Activity",
    "Stress_Level",
    "Financial_Stress",
    "Substance_Use",
    "Diet_Quality",
    "Depression_Score",
    "Anxiety_Score",
    "Chronic_Illness",
]

# Load models
try:
    level_model = joblib.load("burnout_level_model.joblib")
    score_model = joblib.load("burnout_score_model.joblib")
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    level_model = None
    score_model = None


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "healthy",
        "message": "WellCheck Burnout Prediction API is running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    if score_model is None:
        return jsonify({
            "error": "Model not loaded on server."
        }), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No JSON payload provided."
            }), 400

        # Build feature vector
        input_data = {
            feature: float(data.get(feature, 0.0))
            for feature in EXPECTED_FEATURES
        }

        input_df = pd.DataFrame([input_data])[EXPECTED_FEATURES]

        # Predict score
        predicted_score = float(score_model.predict(input_df)[0])

        # Convert score to risk level
        if predicted_score < 0.426801:
            predicted_level = "Low"
        elif predicted_score < 0.545343:
            predicted_level = "Medium"
        else:
            predicted_level = "High"

        return jsonify({
            "predicted_level": predicted_level,
            "predicted_score": round(predicted_score, 4)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="[IP_ADDRESS]", port=port)