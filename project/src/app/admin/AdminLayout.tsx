import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Building2, Users, Star, BarChart3, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminLayoutContent: React.FC = () => {
  const { user, signOut, userProfile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check admin access
  if (!user || !userProfile || !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">You need administrator privileges to access this area.</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/businesses', label: 'Businesses', icon: Building2 },
    { path: '/admin/clients', label: 'Clients', icon: Users },
    { path: '/admin/offers', label: 'Offers', icon: Star },
    { path: '/admin/stats', label: 'Analytics', icon: BarChart3 },
  ];

  const currentPage = sidebarItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Full screen layout */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="bg-card border-b border-border pt-safe px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex-1 text-center">
            <h1 className="text-sm font-semibold text-foreground truncate">{currentPage?.label || 'Admin'}</h1>
            <p className="text-xs text-muted-foreground truncate">Platform Management</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col">
              {/* Mobile Sidebar Header */}
              <div className="p-4 pt-safe border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Admin Panel</h2>
                      <p className="text-xs text-muted-foreground">Platform Control</p>
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

              {/* Mobile Navigation */}
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

              {/* Mobile User Info */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
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
          </>
        )}

        {/* Mobile Content */}
        <div className="p-3">
          <Outlet />
        </div>
      </div>

      {/* Desktop: Sidebar layout */}
      <div className="hidden md:flex">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          {/* Desktop Admin Info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-semibold text-foreground truncate">Admin Panel</h1>
                <p className="text-sm text-muted-foreground truncate">Platform Management</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
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

          {/* Desktop User Menu */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
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

        {/* Desktop Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Top Bar */}
          <div className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {currentPage?.label || 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Dealio Platform
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Page Content */}
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return <AdminLayoutContent />;
};

export default AdminLayout;