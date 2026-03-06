import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from './AppLayout';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import InstallBottomSheet from '../components/InstallBottomSheet';
import { FEATURES } from '../config/features';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const { user, userProfile: profile, loading } = useAppContext();
  const location = useLocation();
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setForceRender(true);
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setForceRender(false);
    }
  }, [loading]);

  if (loading && !forceRender) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const authPages = ['/login', '/register', '/onboarding'];
  if (authPages.includes(location.pathname)) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // Onboarding check moved to AppContent in App.tsx

  if (user && profile && location.pathname === '/') {
    if (profile.role === 'business_owner') {
      return <Navigate to="/business" replace />;
    }
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  const protectedRoutes = ['/profile', '/business', '/admin'];
  if (FEATURES.FAVORITES) protectedRoutes.push('/favorites');

  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    localStorage.setItem('dealio-redirect-after-login', location.pathname);
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-dvh bg-background pb-[calc(64px+var(--safe-area-inset-bottom))] relative flex flex-col">
      {children}
      <BottomNav />
      <InstallBottomSheet />
    </div>
  );
};

export default Shell;
