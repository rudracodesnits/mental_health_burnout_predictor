import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';
import { useUser, SignOutButton } from '@clerk/clerk-react';

const Navbar = () => {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="navbar">
      <h1 className="navbar-title">Wellcheck</h1>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        {!isSignedIn && <Link to="/auth" className="nav-link">Login / Signup</Link>}
        <Link to="/profile" className="nav-link">Profile</Link>

        {isSignedIn && (
          <>
            <Link to="/userhome" className="nav-link">UserHome</Link>
            <div className="auth-info">
              <span>{user?.primaryEmailAddress?.emailAddress}</span>
              <img
                src={user.imageUrl}
                alt="Profile"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  marginLeft: '10px'
                }}
              />
              <SignOutButton>
                <button className="logout-btn">Logout</button>
              </SignOutButton>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
