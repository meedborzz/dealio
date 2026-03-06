import React, { useState } from 'react';
import { Search, Menu, User, LogOut, Download, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';
import { FEATURES } from '../config/features';

interface HeaderProps {
  user: any;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-ui-bg shadow-card border-b border-ui-line sticky top-0 z-50 pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 px-safe">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-primary text-primary-foreground p-2 rounded-2xl mr-3">
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Dealio
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Découvrez les meilleures offres beauté</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400 h-5 w-5" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Chercher un salon, un soin, ou une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-ui-line rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-ui-bg"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}

                {/* Notification Bell */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative p-2 text-ink-600 hover:text-brand transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6" strokeWidth={1.75} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-ink-700 hover:text-brand transition-colors"
                >
                  <div className="bg-brand text-white p-2 rounded-full">
                    <User className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <span className="hidden sm:block font-medium">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-ui-bg rounded-2xl shadow-card border border-ui-line py-2 z-50">
                    <div className="px-4 py-2 flex items-center justify-between">
                      <span className="text-ink-700 text-sm">Thème</span>
                      <ThemeToggle variant="icon" />
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-ink-700 hover:bg-ui-soft transition-colors"
                    >
                      Mon Profil
                    </button>
                    {FEATURES.FAVORITES && (
                      <button
                        onClick={() => {
                          navigate('/favorites');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-ink-700 hover:bg-ui-soft transition-colors"
                      >
                        Mes Favoris
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-ink-700 hover:bg-ui-soft transition-colors flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" strokeWidth={1.75} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/profile')}
                className="bg-brand text-white px-4 py-2 rounded-2xl hover:bg-brand-dark transition-all duration-150 ease flex items-center space-x-2 shadow-card"
              >
                <User className="h-4 w-4" strokeWidth={1.75} />
                <span className="hidden sm:block">Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
};

export default Header;