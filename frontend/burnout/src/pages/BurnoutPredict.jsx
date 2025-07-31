// src/pages/BurnoutPredictor.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/BurnOutPredict.css';

const BurnoutPredictor = () => {
  const [formData, setFormData] = useState({
    Family_History: 0,
    Social_Support: 0.5,
    Counseling_Service_Use: 0,
    Extracurricular_Involvement: 0.5,
    Semester_Credit_Load: 14,
    Sleep_Quality: 0.5,
    Physical_Activity: 0.5,
    Stress_Level: 0.5,
    Financial_Stress: 0.5,
    Substance_Use: 0.5,
    Diet_Quality: 0.5,
    Depression_Score: 0.5,
    Anxiety_Score: 0.5,
    Chronic_Illness: 0
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', formData);
      setResult(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error predicting burnout.');
    }
  };

  return (
    <div className="predictor-container">
      <h2>Burnout Predictor</h2>
      <form className="predictor-form" onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => {
          let step = 0.01;
          let min = 0;
          let max = 1;

          if (key === 'Semester_Credit_Load') {
            step = 1;
            max = 28;
          } else if ([
            'Family_History',
            'Chronic_Illness'
          ].includes(key)) {
            step = 1;
            max = 1;
          } else if ([
            'Social_Support',
            'Counseling_Service_Use',
            'Extracurricular_Involvement',
            'Sleep_Quality',
            'Physical_Activity',
            'Substance_Use'
          ].includes(key)) {
            step = 0.5;
          }

          return (
            <div key={key} className="form-group">
              <label htmlFor={key}>{key.replace(/_/g, ' ')}:</label>
              <input
                type="range"
                name={key}
                min={min}
                max={max}
                step={step}
                value={formData[key]}
                onChange={handleChange}
              />
              <span className="slider-value">{formData[key]}</span>
            </div>
          );
        })}
        <button type="submit" className="predict-btn">Predict Burnout</button>
      </form>

      {result && (
        <div className="prediction-result">
          <h3>Prediction Results:</h3>
          <p><strong>Predicted Burnout Level:</strong> {result.predicted_level}</p>
          <p><strong>Predicted Burnout Score:</strong> {result.predicted_score}</p>
        </div>
      )}
    </div>
  );
};

export default BurnoutPredictor;
