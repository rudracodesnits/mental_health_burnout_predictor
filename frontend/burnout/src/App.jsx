// src/App.jsx
import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserFlowProvider, useUserFlow } from './context/UserFlowContext';
import { useUser } from '@clerk/clerk-react';
import Navbar from './components/NavBar';

// Lazy-load all pages for code splitting + better TTI
const Home          = lazy(() => import('./pages/Home'));
const AuthForm      = lazy(() => import('./components/Authform'));
const UserHome      = lazy(() => import('./pages/UserHome'));
const BurnoutPredictor = lazy(() => import('./pages/BurnoutPredict'));
const Profile       = lazy(() => import('./pages/Profile'));
const DashBoard     = lazy(() => import('./pages/DashBoard'));
const AdminPage     = lazy(() => import('./pages/AdminPage'));

const AppLayout = ({ children }) => {
  const { hasProceeded } = useUserFlow();
  const { isSignedIn } = useUser();

  return (
    <>
      {(hasProceeded || isSignedIn) && <Navbar />}
      <main id="main-content" className="page-wrapper">
        {children}
      </main>
    </>
  );
};

const AppRoutes = () => {
  const { isSignedIn } = useUser();

  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Home />} />

      {/* Auth form */}
      <Route path="/auth" element={<AuthForm />} />

      {/* Authenticated routes */}
      <Route
        path="/userhome"
        element={isSignedIn ? <UserHome /> : <Navigate to="/" replace />}
      />
      <Route
        path="/dashboard"
        element={isSignedIn ? <DashBoard /> : <Navigate to="/" replace />}
      />

      {/* Public routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/predictor" element={<BurnoutPredictor />} />

      {/* Admin — PIN-gated, no auth required from Clerk */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
