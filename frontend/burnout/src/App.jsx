// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserFlowProvider, useUserFlow } from './context/UserFlowContext';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/NavBar';
import Profile from './pages/Profile';
import AuthForm from './components/Authform';
import Home from './pages/Home';
import BurnoutPredictor from './pages/BurnoutPredict';
import UserHome from './pages/UserHome'; // Import UserHome

const AppLayout = ({ children }) => {
  const { hasProceeded } = useUserFlow();
  const { isSignedIn } = useUser();

  return (
    <>
      {(hasProceeded || isSignedIn) && <Navbar />}
      {children}
    </>
  );
};

const AppRoutes = () => {
  const { isSignedIn } = useUser();

  return (
    <Routes>
      {/* Public home page */}
      <Route path="/" element={<Home />} />

      {/* Auth form */}
      <Route path="/auth" element={<AuthForm />} />

      {/* User homepage - only for signed in users */}
      <Route
        path="/userhome"
        element={isSignedIn ? <UserHome /> : <Navigate to="/" replace />}
      />

      {/* Optional other routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/predictor" element={<BurnoutPredictor />} />
    </Routes>
  );
};

const App = () => {
  return (
    <UserFlowProvider>
      <Router>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </UserFlowProvider>
  );
};

export default App;
