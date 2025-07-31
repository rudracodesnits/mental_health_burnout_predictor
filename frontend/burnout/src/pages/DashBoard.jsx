import React, { useState } from 'react';
import '../styles/Home.css'; // Make sure this path is correct

const Home = () => {
  const [formData, setFormData] = useState({
    stress: 0.5,
    depression: 0.5,
    anxiety: 0.5,
    sleep: 0.5,
    activity: 0.5,
    diet: 0.5,
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      const API_URL = "http://127.0.0.1:5000/predict";

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });
      
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Prediction done:", result);
      setPredictionResult(result);
    } catch(err) {
      console.error("Submission error:", err);
      setError('Failed to get prediction, backend down');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div>
      <form onSubmit={handleSubmit}>
        {/* Example for one slider */}
        <label>
          Stress Level: {formData.stress}
          <input
            type="range"
            name="stress"
            min="0"
            max="1"
            step="0.01"
            value={formData.stress}
            onChange={handleChange}
          />
        </label>
        {/* ... add other sliders for depression, anxiety, etc. ... */}
        
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Predict Burnout'}
        </button>
      </form>

      {/* Display the prediction results */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {predictionResult && (
        <div>
          <h3>Prediction Results:</h3>
          <p>Predicted Burnout Level: <strong>{predictionResult.predicted_level}</strong></p>
          <p>Predicted Burnout Score: <strong>{predictionResult.predicted_score}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Home;
