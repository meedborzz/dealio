import React, { useState, useEffect } from 'react';
import { Building2, BarChart3, Calendar, Star, LogOut, Plus, MessageSquare, DollarSign, Clock, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCurrentBusiness } from '../hooks/useCurrentBusiness';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

interface BusinessStats {
  todayBookings: number;
  weekRevenue: number;
  totalBookings: number;
  averageRating: number;
  pendingBookings: number;
  completedBookings: number;
}

const BusinessDashboard: React.FC = () => {
  const { user, signOut, isBusinessOwner } = useAuth();
  const { biz, loading: bizLoading, err: bizError } = useCurrentBusiness();
  const [stats, setStats] = useState<BusinessStats>({
    todayBookings: 0,
    weekRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    pendingBookings: 0,
    completedBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && biz) {
      fetchStats();
    }
  }, [user, biz]);

  const fetchStats = async () => {
    if (!biz) return;

    try {
      // Get deals for this business
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id')
        .eq('business_id', biz.id);

      if (dealsError) throw dealsError;

      const dealIds = deals?.map(d => d.id) || [];

      if (dealIds.length > 0) {
        // Get bookings for these deals
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, status, total_price, created_at')
          .in('deal_id', dealIds);

        if (bookingsError) throw bookingsError;

        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayBookings = bookings?.filter(b =>
          new Date(b.created_at).toDateString() === today.toDateString()
        ).length || 0;

        const weekBookings = bookings?.filter(b =>
          new Date(b.created_at) >= weekAgo
        ) || [];

        const weekRevenue = weekBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.total_price || 0), 0);

        const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
        const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;

        setStats({
          todayBookings,
          weekRevenue,
          totalBookings: bookings?.length || 0,
          averageRating: biz.rating || 0,
          pendingBookings,
          completedBookings
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Show dashboard immediately when business data is available
  useEffect(() => {
    if (biz) {
      setLoading(false);
    }
  }, [biz]);

  // Fetch stats after business is loaded
  useEffect(() => {
    if (biz && !loading) {
      fetchStats();
    }
  }, [biz, loading]);

  if (!user || !isBusinessOwner()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-teal-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Business Requis</h2>
          <p className="text-gray-600 mb-4">
            Vous devez être connecté en tant que propriétaire d'établissement.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (bizLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bizError) {
    return (
      <div className="min-h-screen bg-white">
        <ErrorState message={bizError} />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucun établissement trouvé</h2>
          <p className="text-gray-600 mb-4">
            Créez votre établissement pour accéder au tableau de bord.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Créer mon établissement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg pb-20 md:pb-8">
      {/* Clean Header */}
      <div className="bg-ui-bg border-b border-ui-line px-4 md:px-6 py-4 md:py-6 mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand rounded-2xl flex items-center justify-center">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-ink-900">{biz.name}</h1>
              <p className="text-sm md:text-base text-ink-600">{biz.city} • {biz.category}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="text-ink-500 hover:text-ink-700 flex items-center space-x-1 md:space-x-2 transition-colors"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 md:py-6">
        {/* Key Stats - Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-ui-bg rounded-2xl p-3 md:p-4 shadow-card border border-ui-line mobile-stat-card">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-ui-soft rounded-2xl flex items-center justify-center">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-ink-600" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-semibold text-ink-900 stat-number">{stats.todayBookings}</p>
                <p className="text-xs md:text-sm text-ink-500 stat-label">Aujourd'hui</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 mobile-stat-card">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#c8a2c9]/20 rounded-lg flex items-center justify-center">
                <DollarSign className="mobile-icon-sm text-[#c8a2c9]" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.weekRevenue}</p>
                <p className="text-xs md:text-sm text-gray-600">Semaine</p>
              </div>
            </div>
          </div>

          <div className="bg-white mobile-rounded mobile-p-2 mobile-shadow border border-gray-100">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                <p className="text-xs md:text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 mobile-stat-card">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-10 md:h-10 bg-yellow-100 rounded-md md:rounded-lg flex items-center justify-center">
                <Star className="mobile-icon text-yellow-600" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="mobile-caption text-gray-600">Note moyenne</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mobile-section">
          <button
            onClick={() => navigate('/business/reservations')}
            className="bg-white rounded-lg md:rounded-xl mobile-card-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group mobile-action-card"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="mobile-icon-lg text-white" />
              </div>
              <span className="text-blue-600 font-bold text-sm md:text-base">{stats.totalBookings}</span>
            </div>
            <h3 className="mobile-title font-bold text-gray-900 mb-1 md:mb-2">Réservations</h3>
            <p className="text-gray-600 mobile-caption">Gérer vos rendez-vous</p>
          </button>

          <button
            onClick={() => navigate('/business/messages')}
            className="bg-white rounded-lg md:rounded-xl mobile-card-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 text-left group mobile-action-card"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-500 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="mobile-icon-lg text-white" />
              </div>
              <span className="text-purple-600 font-bold text-sm md:text-base">•</span>
            </div>
            <h3 className="mobile-title font-bold text-gray-900 mb-1 md:mb-2">Messages</h3>
            <p className="text-gray-600 mobile-caption">Communiquer avec clients</p>
          </button>
        </div>

        {/* Recent Activity - Simplified */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 mobile-section">
          <div className="mobile-card-lg border-b border-gray-100">
            <h3 className="mobile-title font-bold text-gray-900">Activité Récente</h3>
          </div>
          <div className="mobile-card-lg">
            {stats.pendingBookings > 0 ? (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between mobile-card bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-teal-500 rounded-md md:rounded-lg flex items-center justify-center">
                      <Clock className="mobile-icon text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mobile-subtitle">Nouvelles réservations</p>
                      <p className="mobile-caption text-gray-600">{stats.pendingBookings} en attente de confirmation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/business/reservations')}
                    className="bg-teal-500 text-white mobile-btn rounded-md md:rounded-lg hover:bg-teal-600 transition-colors text-sm md:text-base"
                  >
                    Voir
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <BarChart3 className="mobile-icon-lg text-gray-400" />
                </div>
                <p className="text-gray-600 mobile-subtitle">Aucune activité récente</p>
                <p className="mobile-caption text-gray-500">Les nouvelles réservations apparaîtront ici</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tools */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100">
          <div className="mobile-card-lg border-b border-gray-100">
            <h3 className="mobile-title font-bold text-gray-900">Outils Rapides</h3>
          </div>
          <div className="mobile-card-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => navigate('/business/profile')}
                className="bg-ui-bg rounded-lg md:rounded-xl mobile-card-lg shadow-card border border-ui-line hover:shadow-md transition-all duration-200 text-left group mobile-action-card"
              >
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-ink-600 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="mobile-icon-lg text-white" strokeWidth={1.75} />
                  </div>
                  <span className="text-ink-600 font-bold text-sm md:text-base">•</span>
                </div>
                <h3 className="mobile-title font-semibold text-ink-900 mb-1 md:mb-2">Profile</h3>
                <p className="text-ink-600 mobile-caption">Manage business info</p>
              </button>



              <button
                onClick={() => {
                  // Create new booking (POS)
                  console.log('Open POS system');
                }}
                className="flex items-center space-x-2 md:space-x-3 mobile-card bg-purple-500 text-white rounded-lg md:rounded-xl hover:bg-purple-600 transition-colors"
              >
                <Plus className="mobile-icon-lg" />
                <div className="text-left">
                  <p className="font-bold mobile-subtitle">Nouvelle Réservation</p>
                  <p className="mobile-caption opacity-90">Créer sur place</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;