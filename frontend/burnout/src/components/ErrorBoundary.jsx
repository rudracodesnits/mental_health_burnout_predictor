// src/components/ErrorBoundary.jsx
// Catches JS errors anywhere in the component tree.
// Prevents a single bug from crashing the entire app.

import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to a logging service (e.g., Sentry)
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__inner">
            <div className="error-boundary__icon" aria-hidden="true">⚠️</div>
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              className="btn btn--primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && (
              <details className="error-boundary__details">
                <summary>Error details (dev only)</summary>
                <pre>{this.state.error?.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
