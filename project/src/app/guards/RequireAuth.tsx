import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading } = useAuth();
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
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    localStorage.setItem('dealio-redirect-after-login', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;