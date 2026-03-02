import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tag, CalendarCheck, LogOut, Settings, Menu, X, Building2, Moon, Sun, History, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FEATURES } from '../../config/features';

const BusinessLayout: React.FC = () => {
  const { user, signOut, userProfile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('BusinessLayout loading timeout - redirecting to home');
        setLoadingTimeout(true);
        navigate('/', { replace: true });
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [loading, navigate]);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || userProfile?.role !== 'business_owner') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need a business owner account to access this area.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allSidebarItems = [
    { path: '/business', label: 'Dashboard', icon: Building2, enabled: true },
    { path: '/business/offers', label: 'Offers', icon: Tag, enabled: true },
    { path: '/business/bookings', label: 'Calendar', icon: CalendarCheck, enabled: true },
    { path: '/business/bookings/history', label: 'History', icon: History, enabled: FEATURES.BUSINESS_ANALYTICS },
    { path: '/business/bookings/stats', label: 'Statistics', icon: BarChart3, enabled: FEATURES.BUSINESS_ANALYTICS },
    { path: '/business/profile', label: 'Profile', icon: Settings, enabled: true },
  ];

  const sidebarItems = allSidebarItems.filter(item => item.enabled);
  const currentPage = sidebarItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="h-8 w-8"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex-1 text-center">
          <h1 className="text-sm font-semibold text-foreground truncate">
            {currentPage?.label || 'Business Dashboard'}
          </h1>
          <p className="text-xs text-muted-foreground truncate">Dealio</p>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col md:hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Business Panel</h2>
                    <p className="text-xs text-muted-foreground">Dealio</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <nav className="flex-1 p-2">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Button
                        onClick={() => {
                          navigate(item.path);
                          setSidebarOpen(false);
                        }}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-10"
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Business Owner</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-8 w-8"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut()}
                    className="h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="hidden md:flex">
        <div className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold text-foreground truncate">Business Panel</h1>
                <p className="text-sm text-muted-foreground truncate">Dealio</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Button
                      onClick={() => navigate(item.path)}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start h-10"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Business Owner</p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {currentPage?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Business Management
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-8 w-8"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="p-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BusinessLayout;
