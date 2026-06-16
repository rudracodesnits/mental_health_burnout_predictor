// src/pages/DashBoard.jsx
// Analytics dashboard for authenticated users.
// Shows history trend from localStorage and at-a-glance stats.
// All data comes from existing localStorage 'burnoutResults' key — no backend changes.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ResultCard from '../components/ResultCard';
import { useUser } from '@clerk/clerk-react';
import './DashBoard.css';

const LEVEL_COLORS = {
  Low:    'var(--color-success)',
  Medium: 'var(--color-warning)',
  High:   'var(--color-danger)',
};

const LEVEL_ICONS = {
  Low:    '🟢',
  Medium: '🟡',
  High:   '🔴',
};

const StatCard = ({ title, value, subtitle, color }) => (
  <div className="stat-card glass">
    <p className="stat-card__title">{title}</p>
    <p className="stat-card__value" style={{ color }}>{value}</p>
    {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
  </div>
);

const DashBoard = () => {
  const { user } = useUser();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('burnoutResults');
    if (stored) {
      try { setHistory(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const latestResult = history[0] || null;

  const avgScore = history.length > 0
    ? (history.reduce((sum, r) => sum + r.score, 0) / history.length).toFixed(4)
    : null;

  const dominantLevel = history.length > 0
    ? (['Low', 'Medium', 'High'].reduce((max, level) => {
        const count = history.filter(r => r.level === level).length;
        const maxCount = history.filter(r => r.level === max).length;
        return count > maxCount ? level : max;
      }, 'Low'))
    : null;

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">
              {user?.firstName ? `${user.firstName}'s` : 'Your'} wellbeing overview
            </p>
          </div>
          <Link to="/userhome" className="btn btn--primary btn--md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            New Assessment
          </Link>
        </div>

        {history.length === 0 ? (
          /* Empty state */
          <div className="dashboard__empty glass animate-fade-in">
            <div className="dashboard__empty-icon" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h2>No assessments yet</h2>
            <p>Run your first burnout assessment to see your data here.</p>
            <Link to="/userhome" className="btn btn--primary btn--md">
              Run Assessment
            </Link>
          </div>
        ) : (
          <div className="dashboard__body animate-fade-in">
            {/* Stats row */}
            <div className="dashboard__stats">
              <StatCard
                title="Assessments Taken"
                value={history.length}
                subtitle="Saved locally"
                color="var(--color-primary-light)"
              />
              <StatCard
                title="Average Score"
                value={avgScore || '—'}
                subtitle="Across all sessions"
                color={latestResult ? LEVEL_COLORS[dominantLevel] : undefined}
              />
              <StatCard
                title="Most Common Level"
                value={dominantLevel ? `${LEVEL_ICONS[dominantLevel]} ${dominantLevel}` : '—'}
                subtitle="Across sessions"
                color={LEVEL_COLORS[dominantLevel]}
              />
            </div>

            {/* Two-column: latest result + history */}
            <div className="dashboard__panels">
              {/* Latest result */}
              <section aria-labelledby="latest-heading">
                <h2 id="latest-heading" className="dashboard__panel-title">
                  Latest Result
                </h2>
                {latestResult ? (
                  <ResultCard
                    result={{
                      predicted_level: latestResult.level,
                      predicted_score: latestResult.score,
                    }}
                    animate={false}
                  />
                ) : (
                  <p className="dashboard__no-data">No results yet.</p>
                )}
              </section>

              {/* Full history */}
              <section aria-labelledby="history-heading">
                <h2 id="history-heading" className="dashboard__panel-title">
                  Assessment History
                </h2>
                <div className="dashboard__history" role="list">
                  {history.map((entry, i) => (
                    <div key={i} className="dashboard__history-item glass" role="listitem">
                      <div className="dashboard__history-rank">#{i + 1}</div>
                      <div className="dashboard__history-info">
                        <span className="dashboard__history-time">{entry.timestamp}</span>
                        <span
                          className="dashboard__history-level"
                          style={{ color: LEVEL_COLORS[entry.level] }}
                        >
                          {LEVEL_ICONS[entry.level]} {entry.level}
                        </span>
                      </div>
                      <div
                        className="dashboard__history-score"
                        style={{ color: LEVEL_COLORS[entry.level] }}
                      >
                        {entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
