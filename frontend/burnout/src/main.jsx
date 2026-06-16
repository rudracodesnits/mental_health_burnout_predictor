import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/ui/Toast';
import './index.css';
import App from './App.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key — check your .env file');
}

// Full-page loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '12px',
      color: 'var(--color-text-secondary)',
      fontFamily: 'var(--font-sans)',
    }}
  >
    <div
      style={{
        width: '24px',
        height: '24px',
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    Loading…
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <App />
          </Suspense>
        </ToastProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>,
);
