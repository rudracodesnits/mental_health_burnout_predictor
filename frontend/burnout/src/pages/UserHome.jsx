// src/pages/UserHome.jsx
// Authenticated burnout predictor with history.
// PRESERVED: all formData fields, localStorage burnoutResults, API call structure
// FIXED: key prop on <label> → moved to wrapping <div>
// IMPROVED: SliderField components, ResultCard, skeleton loader, toasts

import React, { useState, useEffect } from 'react';
import SliderField from '../components/SliderField';
import ResultCard from '../components/ResultCard';
import { useToast } from '../components/ui/Toast';
import { predictBurnout } from '../lib/api';
import { useUser } from '@clerk/clerk-react';
import '../styles/UserHome.css';

const INITIAL_FORM = {
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
};

const LEVEL_COLORS = {
  Low:    'var(--color-success)',
  Medium: 'var(--color-warning)',
  High:   'var(--color-danger)',
};

const HistoryItem = ({ entry, index }) => (
  <div className="history-item animate-fade-in">
    <div className="history-item__meta">
      <span className="history-item__index">#{index + 1}</span>
      <span className="history-item__time">{entry.timestamp}</span>
    </div>
    <div className="history-item__result">
      <span
        className="history-item__level"
        style={{ color: LEVEL_COLORS[entry.level] || 'inherit' }}
      >
        {entry.level}
      </span>
      <span className="history-item__score">{entry.score} score</span>
    </div>
  </div>
);

const UserHome = () => {
  const { user } = useUser();
  const toast = useToast();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [predictionResult, setPredictionResult] = useState(null);
  const [pastResults, setPastResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved results from localStorage (preserved)
  useEffect(() => {
    const stored = localStorage.getItem('burnoutResults');
    if (stored) {
      try {
        setPastResults(JSON.parse(stored));
      } catch {
        localStorage.removeItem('burnoutResults');
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value),
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setPredictionResult(null);
    toast.info('Form reset to defaults.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPredictionResult(null);

    try {
      // API call preserved — uses centralized client which reads VITE_API_BASE_URL
      const result = await predictBurnout(formData, {
        mode:      'authenticated',
        userEmail: user?.primaryEmailAddress?.emailAddress || null,
        userName:  user?.fullName || null,
      });
      setPredictionResult(result);

      // localStorage persistence preserved
      const newEntry = {
        timestamp: new Date().toLocaleString(),
        level: result.predicted_level,
        score: result.predicted_score,
      };
      const updatedResults = [newEntry, ...pastResults].slice(0, 3);
      setPastResults(updatedResults);
      localStorage.setItem('burnoutResults', JSON.stringify(updatedResults));

      toast.success(`Prediction complete — ${result.predicted_level} burnout risk.`);
    } catch (err) {
      console.error('Prediction error:', err);
      toast.error('Could not reach the prediction server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const greeting = user?.firstName ? `Hi, ${user.firstName}` : 'Burnout Assessment';

  return (
    <div className="userhome">
      {/* Page header */}
      <div className="userhome__header container">
        <div>
          <h1 className="userhome__title">{greeting}</h1>
          <p className="userhome__subtitle">
            Adjust the sliders to reflect your current situation, then run the analysis.
          </p>
        </div>
        {pastResults.length > 0 && (
          <div className="userhome__history-badge">
            <span>{pastResults.length} past result{pastResults.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="userhome__body container">
        {/* Left: Form */}
        <section className="userhome__form-section" aria-labelledby="form-heading">
          <h2 id="form-heading" className="userhome__section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Wellness Indicators
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="userhome__sliders">
              {Object.entries(formData).map(([key, value]) => (
                <SliderField
                  key={key}
                  fieldKey={key}
                  value={value}
                  onChange={handleChange}
                />
              ))}
            </div>

            <div className="userhome__form-actions">
              <button
                type="button"
                className="btn btn--ghost btn--md"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </button>
              <button
                type="submit"
                id="predict-btn"
                className="btn btn--primary btn--md userhome__submit-btn"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="auth-spinner" aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Right: Results + History */}
        <aside className="userhome__results-section" aria-label="Results panel">
          {/* Current result */}
          <div className="userhome__panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="userhome__section-title" style={{ marginBottom: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Your Result
              </h2>
              {!isLoading && predictionResult && (
                <button
                  className="btn btn--ghost btn--sm print-btn"
                  onClick={() => window.print()}
                  aria-label="Print or save result as PDF"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Save PDF
                </button>
              )}
            </div>

            {isLoading && (
              <div className="userhome__loading-state" aria-live="polite">
                <div className="userhome__spinner" aria-hidden="true" />
                <p>Running ML analysis…</p>
              </div>
            )}

            {!isLoading && predictionResult && (
              <ResultCard result={predictionResult} />
            )}

            {!isLoading && !predictionResult && (
              <div className="userhome__empty-state">
                <div className="userhome__empty-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <p>Adjust the sliders and click <strong>Run Analysis</strong> to see your burnout risk score.</p>
              </div>
            )}
          </div>

          {/* History */}
          {pastResults.length > 0 && (
            <div className="userhome__panel">
              <h2 className="userhome__section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Recent History
              </h2>
              <div className="history-list" role="list">
                {pastResults.map((res, index) => (
                  <HistoryItem key={index} entry={res} index={index} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default UserHome;
