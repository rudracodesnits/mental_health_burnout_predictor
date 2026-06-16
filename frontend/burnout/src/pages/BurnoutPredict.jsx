// src/pages/BurnoutPredict.jsx
// Guest predictor page — no history, no auth required
// PRESERVED: All 14 form fields, step/min/max logic, axios POST to /predict
// IMPROVED: Loading state, error state, ResultCard, SliderField, toasts

import React, { useState } from 'react';
import SliderField from '../components/SliderField';
import ResultCard from '../components/ResultCard';
import { useToast } from '../components/ui/Toast';
import { predictBurnout } from '../lib/api';
import '../styles/BurnOutPredict.css';

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

const BurnoutPredictor = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: parseFloat(e.target.value),
    }));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      // Preserves same API call — now uses centralized client
      const data = await predictBurnout(formData);
      setResult(data);
      toast.success(`Analysis complete — ${data.predicted_level} burnout risk.`);
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Could not reach the prediction server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="predictor">
      {/* Header */}
      <div className="predictor__header container">
        <div>
          <div className="predictor__badge">Guest Mode</div>
          <h1 className="predictor__title">Burnout Risk Assessment</h1>
          <p className="predictor__subtitle">
            Adjust each slider to match your current situation. Your data is never saved.
          </p>
        </div>
      </div>

      <div className="predictor__body container">
        {/* Form */}
        <section aria-labelledby="predictor-form-heading">
          <h2 id="predictor-form-heading" className="predictor__section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Wellness Indicators
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="predictor__sliders">
              {Object.entries(formData).map(([key, value]) => (
                <SliderField
                  key={key}
                  fieldKey={key}
                  value={value}
                  onChange={handleChange}
                />
              ))}
            </div>

            <div className="predictor__actions">
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
                className="btn btn--primary btn--md predictor__submit-btn"
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

        {/* Results */}
        {(result || isLoading) && (
          <section className="predictor__results-section" aria-label="Analysis Results" aria-live="polite">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 className="predictor__section-title" style={{ marginBottom: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Your Result
              </h2>
              {!isLoading && result && (
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
              <div className="predictor__loading">
                <div className="userhome__spinner" aria-hidden="true" />
                <p>Running ML model…</p>
              </div>
            )}

            {!isLoading && result && <ResultCard result={result} />}

            <div className="predictor__signup-cta glass">
              <p>
                <strong>Sign up free</strong> to save your results and track your
                burnout risk over time.
              </p>
              <a href="/auth" className="btn btn--primary btn--sm">Create Account</a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BurnoutPredictor;
