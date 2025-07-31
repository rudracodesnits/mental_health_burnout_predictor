from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load the pre-trained models
try:
    level_model = joblib.load('burnout_level_model.joblib')
    score_model = joblib.load('burnout_score_model.joblib')
except FileNotFoundError:
    print("Model files not found! Please run train_and_save_model.py first.")
    exit()

EXPECTED_FEATURES = [
    'Family_History', 'Social_Support', 'Counseling_Service_Use',
    'Extracurricular_Involvement', 'Semester_Credit_Load', 'Sleep_Quality',
    'Physical_Activity', 'Stress_Level', 'Financial_Stress',
    'Substance_Use', 'Diet_Quality', 'Depression_Score', 'Anxiety_Score',
    'Chronic_Illness'
]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # Validate and construct input data
    try:
        # Use default 0.0 if any feature is missing
        input_data = {feature: data.get(feature, 0.0) for feature in EXPECTED_FEATURES}
        input_df = pd.DataFrame([input_data])[EXPECTED_FEATURES]
    except Exception as e:
        return jsonify({'error': f'Error processing input: {e}'}), 400

    # Predict
    predicted_score = score_model.predict(input_df)[0]

# Derive level from score
    if predicted_score < 0.426801:
        predicted_level = "Low"
    elif predicted_score < 0.545343:
        predicted_level = "Medium"
    else:
        predicted_level = "High"


    return jsonify({
        'predicted_level': predicted_level,
        'predicted_score': round(predicted_score, 4)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
