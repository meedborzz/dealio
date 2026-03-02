import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../AppLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userProfile, loading, isAdmin } = useAppContext();
  const [waitingForProfile, setWaitingForProfile] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (userProfile) {
        setWaitingForProfile(false);
      } else if (user) {
        const timeout = setTimeout(() => {
          setWaitingForProfile(false);
        }, 3000);
        return () => clearTimeout(timeout);
      } else {
        setWaitingForProfile(false);
      }
    }
  }, [loading, user, userProfile]);

  if (loading || (user && !userProfile && waitingForProfile)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log('AdminRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    console.log('AdminRoute: User is not admin', { role: userProfile?.role });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;