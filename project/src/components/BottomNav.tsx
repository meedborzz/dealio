import React from 'react';
import { Home, Search, User, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGuestPrompt } from '../hooks/useGuestPrompt';
import GuestPrompt from './GuestPrompt';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, isBusinessOwner } = useAuth();
  const { isOpen: isGuestPromptOpen, promptConfig, showPrompt, hidePrompt } = useGuestPrompt();

  if (['/login', '/register'].includes(location.pathname) ||
      (user && userProfile && isBusinessOwner() && location.pathname.startsWith('/business')) ||
      (user && userProfile && isAdmin() && location.pathname.startsWith('/admin'))) {
    return null;
  }

  const handleGuestNavigation = (path: string, feature: 'profile' | 'bookings') => {
    if (!user) {
      if (feature === 'profile') {
        showPrompt('profile', 'Accedez a votre profil', 'Creez un compte pour gerer vos reservations');
      }
      return;
    }
    navigate(path);
  };

  const clientNavItems = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/categories', label: 'Explorer', icon: Search },
    { to: '/bookings', label: 'Reservations', icon: Calendar },
    { to: '/profile', label: 'Profil', icon: User, requiresAuth: true, feature: 'profile' as const },
  ];

  const navItems = clientNavItems;

  return (
    <>
      <nav className="fixed left-4 right-4 bg-background/80 backdrop-blur-md border border-border/50 shadow-lg rounded-2xl z-50 mobile-bottom-nav pb-safe" style={{ bottom: 'calc(1rem + var(--safe-area-inset-bottom))' }}>
        <div className="flex justify-around items-center py-2 px-2 px-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <button
                key={item.to}
                onClick={() => {
                  if (item.requiresAuth && !user) {
                    handleGuestNavigation(item.to, item.feature);
                  } else {
                    navigate(item.to);
                  }
                }}
                className={`relative flex flex-col items-center justify-center mobile-nav-item transition-all min-h-[50px] md:min-h-[60px] flex-1 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 md:h-6 md:w-6 mb-0.5 md:mb-1" strokeWidth={1.75} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <GuestPrompt
        isOpen={isGuestPromptOpen}
        onClose={hidePrompt}
        feature={promptConfig.feature}
        title={promptConfig.title}
        description={promptConfig.description}
      />
    </>
  );
};

export default BottomNav;
