import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  userProfile: any | null;
  isBusinessOwner: () => boolean;
  isAdmin: () => boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppLayout');
  }
  return context;
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, userProfile, isBusinessOwner, isAdmin, loading } = useAuth();

  const contextValue: AppContextType = {
    user,
    userProfile,
    isBusinessOwner,
    isAdmin,
    loading
  };

  // Debug: Log context updates
  React.useEffect(() => {
    console.log('🏗️ AppLayout Context Update:', {
      hasUser: !!user,
      profileId: userProfile?.id,
      role: userProfile?.role,
      loading
    });
  }, [user, userProfile, loading]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppLayout;