// src/pages/Home.jsx
// Public landing page — hero section with two CTAs
// Preserves: handleAuthClick → /auth, handleGuestClick → /predictor

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserFlow } from '../context/UserFlowContext';
import '../styles/Home.css';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
      </svg>
    ),
    title: 'ML-Powered Analysis',
    desc: 'Built on a stacking classifier model trained on real student wellness data.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Private & Secure',
    desc: 'Your responses are never stored on our servers. Analysis happens instantly.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Actionable Insights',
    desc: 'Get a clear Low / Medium / High risk score with personalized guidance.',
  },
];

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
    <div className="home">
      {/* Hero */}
      <section className="home__hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="home__hero-content animate-fade-in">
            <div className="home__badge">
              <span className="home__badge-dot" aria-hidden="true" />
              Mental Wellness Assessment
            </div>

            <h1 id="hero-heading" className="home__title">
              Predict burnout before
              <span className="gradient-text"> it catches up </span>
              to you
            </h1>

            <p className="home__subtitle">
              WellCheck uses a machine learning model trained on 14 wellness indicators to
              give you a personalised burnout risk score in under a minute.
            </p>

            <div className="home__ctas" role="group" aria-label="Sign in options">
              <button
                id="cta-auth"
                className="btn btn--primary btn--lg home__cta-primary"
                onClick={handleAuthClick}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Get Started Free
              </button>

              <button
                id="cta-guest"
                className="btn btn--outline btn--lg"
                onClick={handleGuestClick}
              >
                Try without signing up
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>

            <p className="home__trust">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              No data stored &nbsp;·&nbsp; Takes less than 60 seconds &nbsp;·&nbsp; Free to use
            </p>
          </div>

          {/* Visual panel */}
          <div className="home__hero-visual animate-fade-in" aria-hidden="true">
            <div className="home__preview-card glass">
              <div className="home__preview-header">
                <div className="home__preview-dots">
                  <span /><span /><span />
                </div>
                <span className="home__preview-title">Burnout Analysis</span>
              </div>
              <div className="home__preview-body">
                <div className="home__preview-level home__preview-level--low">
                  <span>Low Risk</span>
                  <span>✅</span>
                </div>
                <div className="home__preview-bar-track">
                  <div className="home__preview-bar-fill" />
                </div>
                <p className="home__preview-score">Score: 0.3241</p>
                <div className="home__preview-indicators">
                  {['Sleep Quality', 'Social Support', 'Physical Activity', 'Stress Level'].map(f => (
                    <div key={f} className="home__preview-indicator">
                      <span>{f}</span>
                      <div className="home__preview-indicator-bar" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home__features" aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" className="home__features-title">
            Why WellCheck?
          </h2>
          <div className="home__features-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="home__feature-card glass">
                <div className="home__feature-icon" aria-hidden="true">{f.icon}</div>
                <h3 className="home__feature-title">{f.title}</h3>
                <p className="home__feature-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
