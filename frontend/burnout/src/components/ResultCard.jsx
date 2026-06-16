// src/components/ResultCard.jsx
// Displays the ML prediction result with visual indicators.
// Handles Low / Medium / High levels with distinct colors and icons.

import React from 'react';
import './ResultCard.css';

const LEVEL_CONFIG = {
  Low: {
    color: 'var(--color-success)',
    bg: 'var(--color-success-muted)',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    message: 'Your burnout risk is low. Keep maintaining your healthy habits!',
    emoji: '✅',
  },
  Medium: {
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-muted)',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    message: 'Moderate burnout risk detected. Consider taking breaks and seeking support.',
    emoji: '⚠️',
  },
  High: {
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-muted)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    message: 'High burnout risk detected. Please reach out to a counselor or trusted person.',
    emoji: '🚨',
  },
};

const ScoreBar = ({ score }) => {
  const percentage = Math.round(score * 100);
  const color =
    score < 0.426801
      ? 'var(--color-success)'
      : score < 0.545343
      ? 'var(--color-warning)'
      : 'var(--color-danger)';

  return (
    <div className="score-bar">
      <div className="score-bar__labels">
        <span className="score-bar__label-left">Low Risk</span>
        <span className="score-bar__label-right">High Risk</span>
      </div>
      <div className="score-bar__track" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="score-bar__fill"
          style={{ width: `${percentage}%`, background: color }}
        />
        <div
          className="score-bar__thumb"
          style={{ left: `${percentage}%`, background: color }}
          aria-hidden="true"
        />
      </div>
      <div className="score-bar__percentage" style={{ color }}>
        {score.toFixed(4)} <span className="score-bar__percent-label">risk score</span>
      </div>
    </div>
  );
};

const ResultCard = ({ result, animate = true }) => {
  const level = result?.predicted_level;
  const score = result?.predicted_score;
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.Low;

  return (
    <div
      className={`result-card ${animate ? 'animate-fade-in' : ''}`}
      style={{
        borderColor: config.border,
        background: `linear-gradient(135deg, var(--color-card) 0%, ${config.bg} 100%)`,
      }}
      role="region"
      aria-label="Burnout Prediction Result"
    >
      <div className="result-card__header">
        <div className="result-card__icon" style={{ color: config.color }}>
          {config.icon}
        </div>
        <div>
          <p className="result-card__label">Burnout Level</p>
          <h3 className="result-card__level" style={{ color: config.color }}>
            {level}
          </h3>
        </div>
      </div>

      <ScoreBar score={score} />

      <p className="result-card__message">{config.message}</p>
    </div>
  );
};

export default ResultCard;
