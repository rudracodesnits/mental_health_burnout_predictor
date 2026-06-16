// src/context/UserFlowContext.jsx
// Manages: (1) Whether user has left the landing page, (2) Dark/Light theme
// ThemeContext merged here to avoid prop-drilling through two separate providers

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserFlowContext = createContext();

export const UserFlowProvider = ({ children }) => {
  const [hasProceeded, setHasProceeded] = useState(false);

  // Theme — persisted to localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('wc-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wc-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <UserFlowContext.Provider
      value={{ hasProceeded, setHasProceeded, theme, toggleTheme }}
    >
      {children}
    </UserFlowContext.Provider>
  );
};

export const useUserFlow = () => useContext(UserFlowContext);
