import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useUser, SignOutButton } from '@clerk/clerk-react';
import { useUserFlow } from '../context/UserFlowContext';
import '../styles/NavBar.css';

const Logo = () => (
  <Link to="/" className="navbar__logo" aria-label="WellCheck — Home">
    <div className="navbar__logo-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </div>
    <span className="navbar__logo-text">WellCheck</span>
  </Link>
);

const ThemeToggleBtn = () => {
  const { theme, toggleTheme } = useUserFlow();
  return (
    <button
      onClick={toggleTheme}
      className="navbar__icon-btn"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
};

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="navbar glass">
      <nav className="navbar__inner container" aria-label="Main navigation">
        <Logo />

        {/* Desktop nav */}
        <div className="navbar__links" role="list">
          <NavLink
            to="/"
            className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            role="listitem"
            end
          >
            Home
          </NavLink>

          {isSignedIn ? (
            <>
              <NavLink
                to="/userhome"
                className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                role="listitem"
              >
                Predictor
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
                role="listitem"
              >
                Dashboard
              </NavLink>
            </>
          ) : (
            <NavLink
              to="/predictor"
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
              role="listitem"
            >
              Try Free
            </NavLink>
          )}
        </div>


        {/* Right side */}
        <div className="navbar__actions">
          <ThemeToggleBtn />

          {isSignedIn ? (
            <div className="navbar__user">
              <NavLink to="/profile" className="navbar__avatar-link" aria-label="View profile">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user?.fullName || 'User avatar'}
                    className="navbar__avatar"
                  />
                ) : (
                  <div className="navbar__avatar navbar__avatar--fallback" aria-hidden="true">
                    {(user?.fullName || user?.primaryEmailAddress?.emailAddress || 'U')[0].toUpperCase()}
                  </div>
                )}
              </NavLink>
              <SignOutButton>
                <button className="btn btn--ghost btn--sm">Sign out</button>
              </SignOutButton>
            </div>
          ) : (
            <Link to="/auth" className="btn btn--primary btn--sm">
              Get Started
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`hamburger-line ${menuOpen ? 'hamburger-line--open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'hamburger-line--open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'hamburger-line--open' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <NavLink to="/" className="navbar__mobile-link" end>Home</NavLink>
        {isSignedIn ? (
          <>
            <NavLink to="/userhome" className="navbar__mobile-link">Predictor</NavLink>
            <NavLink to="/dashboard" className="navbar__mobile-link">Dashboard</NavLink>
            <NavLink to="/profile" className="navbar__mobile-link">Profile</NavLink>
            <SignOutButton>
              <button className="navbar__mobile-link navbar__mobile-signout">Sign Out</button>
            </SignOutButton>
          </>
        ) : (
          <>
            <NavLink to="/predictor" className="navbar__mobile-link">Try Free</NavLink>
            <NavLink to="/auth" className="navbar__mobile-link navbar__mobile-cta">Get Started</NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
