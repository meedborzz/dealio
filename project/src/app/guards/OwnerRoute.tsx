import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../AppLayout';
import LoadingSpinner from '../../components/LoadingSpinner';

interface OwnerRouteProps {
  children: React.ReactNode;
}

const OwnerRoute: React.FC<OwnerRouteProps> = ({ children }) => {
  const { user, userProfile, loading, isBusinessOwner } = useAppContext();
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
    console.log('OwnerRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isBusinessOwner()) {
    console.log('OwnerRoute: User is not business owner', { role: userProfile?.role });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default OwnerRoute;