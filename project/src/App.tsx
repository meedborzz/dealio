import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/toast';
import Shell from './app/Shell';
import AppLayout from './app/AppLayout';
import SplashScreen from './components/SplashScreen';
import OnboardingPage from './pages/OnboardingPage';
import AppRoutes from './app/routes';
import ScrollToTop from './components/ScrollToTop';
import { usePreferences } from './hooks/usePreferences';

if (import.meta.env.DEV) {
  import('./lib/assertEnv').then(({ assertEnv }) => {
    const { url, key } = assertEnv();
    import('./lib/healthProbe').then(({ healthProbe }) => healthProbe(url, key));
  }).catch(console.error);
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <ToastProvider>
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <AppContent />
          )}
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

function AppContent() {
  const { preferences } = usePreferences();

  if (!preferences.setupCompleted) {
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/business')) {
      // Allow bypassing setup for admin/business routes if user is trying to access them directly
      console.log('Bypassing onboarding for admin/business route');
    } else {
      return <OnboardingPage />;
    }
  }

  return (
    <AppLayout>
      <Shell>
        <AppRoutes />
      </Shell>
    </AppLayout>
  );
}

export default App;