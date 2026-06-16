// src/pages/Profile.jsx
// PRESERVED: localStorage userProfile data source
// IMPROVED: Uses Clerk user data as primary source with localStorage fallback,
//           proper semantic HTML, loading state

import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

const ProfileField = ({ label, value, icon }) => {
  if (!value) return null;
  return (
    <div className="profile-field">
      <div className="profile-field__icon" aria-hidden="true">{icon}</div>
      <div className="profile-field__content">
        <span className="profile-field__label">{label}</span>
        <span className="profile-field__value">{value}</span>
      </div>
    </div>
  );
};

const Profile = () => {
  const { isSignedIn, user, isLoaded } = useUser();

  // localStorage fallback (preserved)
  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem('userProfile')) || {};
    } catch {
      return {};
    }
  })();

  // Clerk is the primary source; localStorage is the fallback
  const name     = user?.fullName || stored.name || null;
  const email    = user?.primaryEmailAddress?.emailAddress || stored.email || null;
  const avatar   = user?.imageUrl || null;
  const age      = stored.age || null;
  const gender   = stored.gender || null;
  const education = stored.education || null;

  if (!isLoaded) {
    return (
      <div className="profile-page">
        <div className="container profile-page__container">
          <div className="profile-card glass">
            <div className="profile-loading" aria-live="polite">Loading profile…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn && !email) {
    return (
      <div className="profile-page">
        <div className="container profile-page__container">
          <div className="profile-card glass animate-fade-in">
            <div className="profile-empty">
              <div className="profile-empty__icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2>No profile found</h2>
              <p>Sign in or create an account to view your profile.</p>
              <Link to="/auth" className="btn btn--primary btn--md">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container profile-page__container">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="profile-header">
            <h1 className="profile-header__title">Profile</h1>
          </div>

          <div className="profile-layout">
            {/* Avatar card */}
            <div className="profile-avatar-card glass">
              <div className="profile-avatar-wrapper">
                {avatar ? (
                  <img src={avatar} alt={name || 'User'} className="profile-avatar" />
                ) : (
                  <div className="profile-avatar profile-avatar--fallback" aria-hidden="true">
                    {(name || email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="profile-name">{name || 'WellCheck User'}</h2>
              {email && <p className="profile-email">{email}</p>}
              {isSignedIn && (
                <div className="profile-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Verified Account
                </div>
              )}
            </div>

            {/* Details card */}
            <div className="profile-details glass">
              <h3 className="profile-section-title">Personal Information</h3>

              <div className="profile-fields">
                <ProfileField
                  label="Full Name"
                  value={name}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                />
                <ProfileField
                  label="Email Address"
                  value={email}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                />
                <ProfileField
                  label="Age"
                  value={age}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                />
                <ProfileField
                  label="Gender"
                  value={gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : null}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                />
                <ProfileField
                  label="Education"
                  value={education}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
                />
              </div>

              <div className="profile-actions">
                <Link to="/userhome" className="btn btn--primary btn--md">
                  Run Assessment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
