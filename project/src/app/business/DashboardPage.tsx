import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Clock, Star, QrCode, Tag, MessageSquare, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardKpiCard } from '@/components/business/DashboardKpiCard';
import { UpcomingAppointmentsCard } from '@/components/business/UpcomingAppointmentsCard';
import { OfferInsightsCard } from '@/components/business/OfferInsightsCard';
import { subDays } from 'date-fns';

interface BusinessStats {
  todayBookings: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingBookings: number;
  averageRating: number;
  previousWeekRevenue: number;
  previousWeekBookings: number;
}

type DateRange = 'today' | '7days' | '30days';

const BusinessDashboard: React.FC = () => {
  const { user, isBusinessOwner } = useAuth();
  const { biz, loading: bizLoading, err: bizError } = useCurrentBusiness();
  const [stats, setStats] = useState<BusinessStats>({
    todayBookings: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingBookings: 0,
    averageRating: 0,
    previousWeekRevenue: 0,
    previousWeekBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const saved = localStorage.getItem('dealio-business-dashboard-range');
    return (saved as DateRange) || '7days';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user && biz?.id) {
      fetchStats();
    }
  }, [user, biz?.id, dateRange]);

  useEffect(() => {
    localStorage.setItem('dealio-business-dashboard-range', dateRange);
  }, [dateRange]);

  const getDateRangeFilters = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (dateRange) {
      case 'today':
        return {
          start: today,
          end: today,
          prevStart: subDays(now, 1).toISOString().split('T')[0],
          prevEnd: subDays(now, 1).toISOString().split('T')[0]
        };
      case '7days':
        return {
          start: subDays(now, 6).toISOString().split('T')[0],
          end: today,
          prevStart: subDays(now, 13).toISOString().split('T')[0],
          prevEnd: subDays(now, 7).toISOString().split('T')[0]
        };
      case '30days':
        return {
          start: subDays(now, 29).toISOString().split('T')[0],
          end: today,
          prevStart: subDays(now, 59).toISOString().split('T')[0],
          prevEnd: subDays(now, 30).toISOString().split('T')[0]
        };
    }
  };

  const fetchStats = async () => {
    if (!biz) return;

    try {
      setLoading(true);

      console.log('Fetching stats for business:', biz.id);
      const dealsPromise = supabase
        .from('deals')
        .select('id')
        .eq('business_id', biz.id);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Stats fetch timeout')), 8000)
      );

      const { data: deals, error: dError } = await Promise.race([dealsPromise, timeoutPromise]) as any;
      if (dError) console.error('Deals fetch error:', dError);

      const dealIds = deals?.map(d => d.id) || [];
      console.log(`Found ${dealIds.length} deals:`, dealIds);

      if (dealIds.length === 0) {
        console.warn('No deals found for this business. Stats will be 0.');
        setStats({
          todayBookings: 0,
          weekRevenue: 0,
          monthRevenue: 0,
          pendingBookings: 0,
          averageRating: biz.rating || 0,
          previousWeekRevenue: 0,
          previousWeekBookings: 0
        });
        setLoading(false);
        return;
      }

      const filters = getDateRangeFilters();
      const today = new Date().toISOString().split('T')[0];

      const [
        { count: todayCount },
        { data: currentPeriodBookings },
        { data: prevPeriodBookings },
        { count: pendingCount }
      ] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .in('deal_id', dealIds)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lte('created_at', `${today}T23:59:59.999Z`),

        supabase
          .from('bookings')
          .select('total_price, status, created_at')
          .in('deal_id', dealIds)
          .gte('booking_date', filters.start)
          .lte('booking_date', filters.end),

        supabase
          .from('bookings')
          .select('total_price, status, created_at')
          .in('deal_id', dealIds)
          .gte('booking_date', filters.prevStart)
          .lte('booking_date', filters.prevEnd),

        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .in('deal_id', dealIds)
          .in('status', ['pending', 'requested'])
      ]);

      const currentRevenue = (currentPeriodBookings || [])
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      const previousRevenue = (prevPeriodBookings || [])
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_price || 0), 0);

      const monthRevenue = await fetchMonthRevenue(dealIds);

      setStats({
        todayBookings: todayCount || 0,
        weekRevenue: currentRevenue,
        monthRevenue,
        pendingBookings: pendingCount || 0,
        averageRating: biz.rating || 0,
        previousWeekRevenue: previousRevenue,
        previousWeekBookings: prevPeriodBookings?.length || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error?.message || error);
      setStats({
        todayBookings: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        pendingBookings: 0,
        averageRating: biz.rating || 0,
        previousWeekRevenue: 0,
        previousWeekBookings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthRevenue = async (dealIds: string[]) => {
    const now = new Date();
    const monthStart = subDays(now, 29).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const { data } = await supabase
      .from('bookings')
      .select('total_price')
      .in('deal_id', dealIds)
      .eq('status', 'completed')
      .gte('booking_date', monthStart)
      .lte('booking_date', today);

    return (data || []).reduce((sum, b) => sum + (b.total_price || 0), 0);
  };

  const calculateTrend = (current: number, previous: number): number | undefined => {
    if (previous === 0) return undefined;
    return ((current - previous) / previous) * 100;
  };

  if (!user || !isBusinessOwner()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Accès professionnel requis</h2>
            <p className="text-muted-foreground mb-6">
              Vous devez être connecté en tant que propriétaire d'entreprise pour accéder à cette zone.
            </p>
            <Button onClick={() => navigate('/login')} size="lg" className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bizLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bizError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <ErrorState message={bizError} />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Aucune entreprise trouvée</h2>
            <p className="text-muted-foreground mb-6">
              Créez votre profil d'entreprise pour accéder au tableau de bord.
            </p>
            <Button onClick={() => navigate('/register')} size="lg" className="w-full">
              Créer votre entreprise
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueTrend = calculateTrend(stats.weekRevenue, stats.previousWeekRevenue);
  const bookingsTrend = calculateTrend(stats.todayBookings, stats.previousWeekBookings / 7);

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{biz.name}</h1>
                <p className="text-muted-foreground">{biz.city} • {biz.category}</p>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setDateRange('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${dateRange === 'today'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setDateRange('7days')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${dateRange === '7days'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                7 jours
              </button>
              <button
                onClick={() => setDateRange('30days')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${dateRange === '30days'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                30 jours
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helper Info */}
      <div className="bg-muted/50 border border-border rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          Les places diminuent à chaque réservation confirmée.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCard
          title={dateRange === 'today' ? "Aujourd'hui" : 'Réservations'}
          value={stats.todayBookings}
          subtitle={dateRange === 'today' ? 'Nouvelles réservations' : 'Dans la période'}
          icon={Calendar}
          trend={bookingsTrend}
          loading={loading}
        />

        <DashboardKpiCard
          title="Revenu période"
          value={`${stats.weekRevenue.toLocaleString()} DH`}
          subtitle="Réservations terminées"
          icon={DollarSign}
          trend={revenueTrend}
          loading={loading}
        />

        <DashboardKpiCard
          title="En attente"
          value={stats.pendingBookings}
          subtitle="À confirmer"
          icon={Clock}
          loading={loading}
        />

        <DashboardKpiCard
          title="Note moyenne"
          value={stats.averageRating.toFixed(1)}
          subtitle={`${biz.review_count || 0} avis`}
          icon={Star}
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <UpcomingAppointmentsCard
            businessId={biz.id}
            onViewAll={() => navigate('/business/bookings')}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col space-y-2"
                  onClick={() => navigate('/business/bookings')}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Gérer réservations</p>
                    <p className="text-xs text-muted-foreground">{stats.todayBookings} aujourd'hui</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col space-y-2"
                  onClick={() => navigate('/business/offers')}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Gérer offres</p>
                    <p className="text-xs text-muted-foreground">Créer et modifier</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col space-y-2"
                  onClick={() => navigate('/business/scan')}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Scanner QR</p>
                    <p className="text-xs text-muted-foreground">Valider clients</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col space-y-2"
                  onClick={() => navigate('/business/reviews')}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Avis clients</p>
                    <p className="text-xs text-muted-foreground">{stats.averageRating.toFixed(1)} étoiles</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Offer Insights */}
          <OfferInsightsCard
            businessId={biz.id}
            dateRange={getDateRangeFilters() ? {
              start: new Date(getDateRangeFilters().start),
              end: new Date(getDateRangeFilters().end)
            } : undefined}
            onManageOffers={() => navigate('/business/offers')}
          />

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Aperçu mensuel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Revenu 30 jours</span>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.monthRevenue.toLocaleString()} DH
                </p>
              </div>

              {stats.pendingBookings > 0 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-900 dark:text-amber-400">Attention requise</span>
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  </div>
                  <p className="text-xl font-bold text-amber-900 dark:text-amber-400 mb-1">
                    {stats.pendingBookings} en attente
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate('/business/bookings')}
                  >
                    Voir maintenant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
