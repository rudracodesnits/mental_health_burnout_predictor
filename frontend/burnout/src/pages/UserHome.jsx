import React, { useState, useEffect } from 'react';
import '../styles/Home.css';

const UserHome = () => {
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
    Chronic_Illness: 0,
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [pastResults, setPastResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('burnoutResults');
    if (stored) {
      setPastResults(JSON.parse(stored));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPredictionResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      setPredictionResult(result);

      const newEntry = {
        timestamp: new Date().toLocaleString(),
        level: result.predicted_level,
        score: result.predicted_score,
      };
      const updatedResults = [newEntry, ...pastResults].slice(0, 3);
      setPastResults(updatedResults);
      localStorage.setItem('burnoutResults', JSON.stringify(updatedResults));
    } catch (err) {
      console.error("Prediction error:", err);
      setError('Failed to get prediction, backend might be down.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-home">
      <h2>Burnout Predictor</h2>

      <form onSubmit={handleSubmit} className="home-form-grid">
        {Object.entries(formData).map(([key, value]) => {
          let min = 0, max = 1, step = 0.01;
          if (key === 'Semester_Credit_Load') {
            max = 28; step = 1;
          } else if (['Family_History', 'Chronic_Illness'].includes(key)) {
            max = 1; step = 1;
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
            <label key={key} className="home-formGroup">
              {key.replace(/_/g, ' ')}: {value}
              <input
                type="range"
                name={key}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
              />
            </label>
          );
        })}

        <button className="home-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Predict Burnout'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {predictionResult && (
        <div style={{ marginTop: '20px' }}>
          <h3>Current Prediction:</h3>
          <p><strong>Level:</strong> {predictionResult.predicted_level}</p>
          <p><strong>Score:</strong> {predictionResult.predicted_score}</p>
        </div>
      )}

      {pastResults.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Last 3 Predictions:</h3>
          <ul>
            {pastResults.map((res, index) => (
              <li key={index}>
                <strong>{res.timestamp}</strong> — Level: <strong>{res.level}</strong>, Score: <strong>{res.score}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserHome;
