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
import { useAuth } from './hooks/useAuth';
import { useState } from 'react';

if (import.meta.env.DEV) {
  import('./lib/assertEnv').then(({ assertEnv }) => {
    const { url, key } = assertEnv();
    import('./lib/healthProbe').then(({ healthProbe }) => healthProbe(url, key));
  }).catch(console.error);
}

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const { loading } = useAuth();

  // Keep splash screen visible until both animation is done and auth is initialized
  const showSplash = !splashDone || loading;

  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <ToastProvider>
          {showSplash ? (
            <SplashScreen onComplete={() => setSplashDone(true)} />
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
  const { user } = useAuth();

  if (!preferences.setupCompleted) {
    const isRestrictedRoute = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/business');

    if (user || isRestrictedRoute) {
      // Allow bypassing setup for ANY authenticated user OR restricted routes
      // This prevents logged-in clients from getting stuck in onboarding
      console.log('Bypassing onboarding for user or restricted route');
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