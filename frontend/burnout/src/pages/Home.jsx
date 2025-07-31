// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserFlow } from '../context/UserFlowContext';
import '../styles/Home.css'; // optional if you want styling

const Home = () => {
  const navigate = useNavigate();
  const { setHasProceeded } = useUserFlow();


  const handleAuthClick = () => {
    setHasProceeded(true);
    navigate('/auth');
  };

  const handleGuestClick = () => {
    setHasProceeded(true);
    navigate('/predictor');
  };

  return (
    <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <h1 style={{ fontSize: '2.5rem' }}>Welcome to <span style={{ color: '#4CAF50' }}>WellCheck</span></h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px' }}>Choose how you'd like to proceed</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={handleAuthClick}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Continue with Login/Signup
        </button>

        <button
          onClick={handleGuestClick}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            backgroundColor: '#9e9e9e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Continue without Login/Signup
        </button>
      </div>
    </div>
  );
};

export default Home;
