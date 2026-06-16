// src/components/Authform.jsx
// PRESERVED: All Clerk hooks (signIn.create, signUp.create, setActive),
//            localStorage userProfile storage, verification flow
// FIXED: navigate('/Home') → navigate('/userhome') (route case bug)
// IMPROVED: alerts → toasts, loading states, accessible inputs

import React, { useState } from 'react';
import '../styles/Authform.css';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ui/Toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    education: '',
    gender: '',
    email: '',
    password: '',
    code: '',
  });

  const { signIn } = useSignIn();
  const { signUp, setActive } = useSignUp();
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleToggle = (mode) => {
    setIsLogin(mode === 'login');
    setFormData({ name: '', age: '', education: '', gender: '', email: '', password: '', code: '' });
    setIsVerificationStep(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        // --- LOGIN (preserved exactly) ---
        const result = await signIn.create({
          identifier: formData.email,
          password: formData.password,
        });
        await result.attemptFirstFactor({
          strategy: 'password',
          password: formData.password,
        });

        localStorage.setItem('userProfile', JSON.stringify({ email: formData.email }));
        toast.success('Welcome back! Signing you in…');
        navigate('/userhome'); // BUG FIX: was '/Home'

      } else {
        // --- SIGNUP (preserved exactly) ---
        await signUp.create({
          emailAddress: formData.email,
          password: formData.password,
        });
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setIsVerificationStep(true);
        toast.info('Verification code sent to your email. Check your inbox!');
      }
    } catch (error) {
      const msg = error?.errors?.[0]?.longMessage || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // --- EMAIL VERIFICATION (preserved exactly) ---
      const result = await signUp.attemptEmailAddressVerification({ code: formData.code });
      await setActive({ session: result.createdSessionId });

      localStorage.setItem('userProfile', JSON.stringify({
        name: formData.name,
        age: formData.age,
        education: formData.education,
        gender: formData.gender,
        email: formData.email,
      }));

      toast.success('Account verified! Welcome to WellCheck.');
      setIsVerificationStep(false);
      navigate('/userhome'); // BUG FIX: was '/Home'
    } catch (error) {
      const msg = error?.errors?.[0]?.longMessage || 'Verification failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass animate-fade-in" role="main">
        {/* Header */}
        <div className="auth-card__header">
          <div className="auth-card__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-card__title">
              {isVerificationStep ? 'Check your email' : isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-card__subtitle">
              {isVerificationStep
                ? 'Enter the 6-digit code we sent you'
                : isLogin
                ? 'Sign in to access your wellbeing dashboard'
                : 'Start monitoring your burnout risk today'}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        {!isVerificationStep && (
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              role="tab"
              aria-selected={isLogin}
              className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => handleToggle('login')}
            >
              Sign In
            </button>
            <button
              role="tab"
              aria-selected={!isLogin}
              className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => handleToggle('signup')}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Forms */}
        {!isVerificationStep ? (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <>
                <div className="auth-field">
                  <label htmlFor="auth-name" className="auth-field__label">Full Name</label>
                  <input
                    id="auth-name"
                    type="text"
                    name="name"
                    placeholder="Alex Johnson"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="auth-field__input"
                    autoComplete="name"
                  />
                </div>
                <div className="auth-field-row">
                  <div className="auth-field">
                    <label htmlFor="auth-age" className="auth-field__label">Age</label>
                    <input
                      id="auth-age"
                      type="number"
                      name="age"
                      placeholder="21"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="auth-field__input"
                      min="10"
                      max="100"
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="auth-gender" className="auth-field__label">Gender</label>
                    <select
                      id="auth-gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="auth-field__input auth-field__select"
                    >
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Other</option>
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="auth-education" className="auth-field__label">Education Level</label>
                  <input
                    id="auth-education"
                    type="text"
                    name="education"
                    placeholder="Undergraduate, Graduate…"
                    value={formData.education}
                    onChange={handleChange}
                    required
                    className="auth-field__input"
                  />
                </div>
              </>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-field__label">Email Address</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-field__input"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field__label-row">
                <label htmlFor="auth-password" className="auth-field__label">Password</label>
                {isLogin && (
                  <a href="#" className="auth-field__forgot">Forgot password?</a>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-field__input"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--md auth-submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            <p className="auth-footer">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                className="auth-footer__link"
                onClick={() => handleToggle(isLogin ? 'signup' : 'login')}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="auth-code" className="auth-field__label">Verification Code</label>
              <input
                id="auth-code"
                type="text"
                name="code"
                placeholder="123456"
                value={formData.code}
                onChange={handleChange}
                required
                className="auth-field__input auth-field__code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--md auth-submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <><span className="auth-spinner" aria-hidden="true" />Verifying…</>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              type="button"
              className="auth-footer__link"
              onClick={() => setIsVerificationStep(false)}
              style={{ marginTop: 'var(--space-2)', display: 'block', width: '100%', textAlign: 'center' }}
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
