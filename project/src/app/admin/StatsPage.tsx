import { useState, useEffect } from 'react';
import { Users, Building2, Star, Calendar, BarChart3, ArrowUp, ArrowDown, Target, CheckCircle, Clock, XCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { safeQuery, SafeResult } from '../../lib/supabaseSafe';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { formatRating, formatPercentage, formatCount } from './adminHelpers';

interface AdvancedStats {
  totalBookings: number;
  bookingsLast7Days: number;
  bookingsLast30Days: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalBusinesses: number;
  totalClients: number;
  averageRating: number | null;
  conversionRate: number;
  growthMetrics: {
    bookingGrowth: number;
    businessGrowth: number;
    clientGrowth: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    businesses: number;
    bookings: number;
  }>;
  chartData: {
    bookingsChart: Array<{
      date: string;
      bookings: number;
      confirmed: number;
    }>;
    categoryChart: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
}

export const AdminStatsPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdvancedStats>({
    totalBookings: 0,
    bookingsLast7Days: 0,
    bookingsLast30Days: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalBusinesses: 0,
    totalClients: 0,
    averageRating: null,
    conversionRate: 0,
    growthMetrics: {
      bookingGrowth: 0,
      businessGrowth: 0,
      clientGrowth: 0
    },
    topCategories: [],
    topCities: [],
    chartData: {
      bookingsChart: [],
      categoryChart: []
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');

  useEffect(() => {
    fetchAdvancedStats();
  }, [timeframe]);

  const fetchAdvancedStats = async () => {
    try {
      setError(null);

      // Calculate date ranges (limit to last 30 days for performance)
      const now = new Date();
      const last30Days = new Date(now);
      last30Days.setDate(now.getDate() - 30);
      const last7Days = new Date(now);
      last7Days.setDate(now.getDate() - 7);

      // Fetch all data in parallel with limited date ranges
      const [
        businessesResult,
        clientsResult,
        bookingsResult
      ] = await Promise.all([
        safeQuery(
          supabase
            .from('businesses')
            .select('id, status, rating, city, category, created_at')
            .gte('created_at', last30Days.toISOString())
            .order('created_at', { ascending: false })
        ),
        safeQuery(
          supabase
            .from('user_profiles')
            .select('id, role, created_at')
            .eq('role', 'client')
            .gte('created_at', last30Days.toISOString())
            .order('created_at', { ascending: false })
        ),
        safeQuery(
          supabase
            .from('bookings')
            .select('id, status, created_at')
            .gte('created_at', last30Days.toISOString())
            .order('created_at', { ascending: false })
        )
      ]);

      if (businessesResult.error || clientsResult.error || bookingsResult.error) {
        throw new Error('Failed to fetch stats data');
      }

      const businesses: any[] = businessesResult.data || [];
      const clients: any[] = clientsResult.data || [];
      const bookings: any[] = bookingsResult.data || [];

      // Fetch total counts (not limited by date)
      const [
        totalBusinessesResult,
        totalClientsResult,
        totalBookingsResult,
        confirmedCountResult,
        pendingCountResult,
        cancelledCountResult,
        allBusinessesWithRatingResult
      ] = await Promise.all([
        safeQuery(supabase.from('businesses').select('id', { count: 'exact', head: true })),
        safeQuery(supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'client')),
        safeQuery(supabase.from('bookings').select('id', { count: 'exact', head: true })),
        safeQuery(supabase.from('bookings').select('id', { count: 'exact', head: true }).in('status', ['confirmed', 'completed', 'checked_in'])),
        safeQuery(supabase.from('bookings').select('id', { count: 'exact', head: true }).in('status', ['pending', 'requested'])),
        safeQuery(supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'cancelled')),
        safeQuery(supabase.from('businesses').select('rating').not('rating', 'is', 'null').gt('rating', 0)) as Promise<SafeResult<{ rating: number | null }[]>>
      ]);

      // Calculate basic stats
      const totalBusinesses = totalBusinessesResult.count || 0;
      const totalClients = totalClientsResult.count || 0;
      const totalBookings = totalBookingsResult.count || 0;
      const confirmedBookings = confirmedCountResult.count || 0;
      const pendingBookings = pendingCountResult.count || 0;
      const cancelledBookings = cancelledCountResult.count || 0;

      const bookingsLast7Days = bookings.filter(b => new Date(b.created_at || new Date()) > last7Days).length;
      const bookingsLast30Days = bookings.length;

      // Calculate global average rating
      const ratedBusinesses = allBusinessesWithRatingResult.data || [];
      const averageRating = ratedBusinesses.length > 0
        ? ratedBusinesses.reduce((sum: number, b: any) => sum + (b.rating || 0), 0) / ratedBusinesses.length
        : null;

      const conversionRate = bookingsLast30Days > 0 ? (confirmedBookings / bookingsLast30Days) * 100 : 0;

      // Calculate growth metrics based on timeframe
      const timeframeDays = timeframe === 'week' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

      const previousCutoffDate = new Date(cutoffDate);
      previousCutoffDate.setDate(previousCutoffDate.getDate() - timeframeDays);

      // Current period data
      const currentBusinesses = businesses.filter(b => new Date(b.created_at || new Date()) > cutoffDate);
      const currentClients = clients.filter(c => new Date(c.created_at || new Date()) > cutoffDate);
      const currentBookings = bookings.filter(b => new Date(b.created_at || new Date()) > cutoffDate);

      // Previous period data
      const previousBusinesses = businesses.filter(b => {
        const date = new Date(b.created_at || new Date());
        return date > previousCutoffDate && date <= cutoffDate;
      });
      const previousClients = clients.filter(c => {
        const date = new Date(c.created_at || new Date());
        return date > previousCutoffDate && date <= cutoffDate;
      });
      const previousBookings = bookings.filter(b => {
        const date = new Date(b.created_at || new Date());
        return date > previousCutoffDate && date <= cutoffDate;
      });

      // Calculate growth rates
      const businessGrowth = previousBusinesses.length > 0
        ? ((currentBusinesses.length - previousBusinesses.length) / previousBusinesses.length) * 100
        : 0;
      const clientGrowth = previousClients.length > 0
        ? ((currentClients.length - previousClients.length) / previousClients.length) * 100
        : 0;
      const bookingGrowth = previousBookings.length > 0
        ? ((currentBookings.length - previousBookings.length) / previousBookings.length) * 100
        : 0;

      // Calculate top categories
      const categoryStats = businesses.reduce((acc, business) => {
        const category = business.category || 'Autre';
        if (!acc[category]) {
          acc[category] = { count: 0 };
        }
        acc[category].count++;
        return acc;
      }, {} as { [key: string]: { count: number } });

      const topCategories = Object.entries(categoryStats)
        .map(([category, stats]: [string, any]) => ({ category, count: (stats as { count: number }).count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate top cities
      const cityStats = businesses.reduce((acc, business) => {
        const city = business.city || 'Autre';
        if (!acc[city]) {
          acc[city] = { businesses: 0, bookings: 0 };
        }
        acc[city].businesses++;
        return acc;
      }, {} as { [key: string]: { businesses: number; bookings: number } });

      const topCities = Object.entries(cityStats)
        .map(([city, data]: [string, any]) => ({
          city,
          businesses: (data as { businesses: number }).businesses,
          bookings: (data as { bookings: number }).bookings
        }))
        .sort((a, b) => b.businesses - a.businesses)
        .slice(0, 5);

      // Prepare chart data
      const timeframeDaysNum = timeframeDays;
      const bookingsChart = [];
      const categoryColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0'];

      // Generate bookings chart data for the selected timeframe
      for (let i = timeframeDaysNum - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayBookings = bookings.filter(b => {
          const bookingDate = new Date(b.created_at || new Date()).toISOString().split('T')[0];
          return bookingDate === dateStr;
        });

        const dayConfirmed = dayBookings.filter(b => b.status === 'confirmed').length;

        bookingsChart.push({
          date: dateStr,
          bookings: dayBookings.length,
          confirmed: dayConfirmed
        });
      }

      // Prepare category chart data
      const categoryChart = topCategories.slice(0, 5).map((cat, index) => ({
        name: cat.category,
        value: cat.count,
        color: categoryColors[index] || '#8884d8'
      }));

      setStats({
        totalBookings,
        bookingsLast7Days,
        bookingsLast30Days,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalBusinesses,
        totalClients,
        averageRating,
        conversionRate,
        growthMetrics: {
          bookingGrowth,
          businessGrowth,
          clientGrowth
        },
        topCategories,
        topCities,
        chartData: {
          bookingsChart,
          categoryChart
        }
      });
    } catch (error) {
      console.error('Error fetching advanced stats:', error);
      setError('Failed to load statistics. Please try again.');
    } finally {
      // Intentionally omitting setLoading as the component does not use it for rendering
    }
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeframe Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics Avancées
            </CardTitle>
            <div className="flex space-x-2">
              {[
                { key: 'week', label: 'Semaine' },
                { key: 'month', label: 'Mois' }
              ].map(period => (
                <Button
                  key={period.key}
                  onClick={() => setTimeframe(period.key as any)}
                  variant={timeframe === period.key ? 'default' : 'outline'}
                  size="sm"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            key: 'bookingGrowth',
            label: 'Croissance Réservations',
            value: stats.growthMetrics.bookingGrowth,
            icon: Calendar
          },
          {
            key: 'businessGrowth',
            label: 'Croissance Business',
            value: stats.growthMetrics.businessGrowth,
            icon: Building2
          },
          {
            key: 'clientGrowth',
            label: 'Croissance Clients',
            value: stats.growthMetrics.clientGrowth,
            icon: Users
          }
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.key}>
              <CardContent className="p-4 text-center">
                <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-foreground mb-2">{metric.label}</h4>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getTrendIcon(metric.value)}
                  <span className={`text - 2xl font - bold ${metric.value >= 0 ? 'text-green-600' : 'text-red-600'
                    } `}>
                    {metric.value >= 0 ? '+' : ''}{metric.value.toFixed(1)}%
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  vs période précédente
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* Bookings & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Réservations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Derniers 7 jours:</span>
                <span className="font-bold text-primary">{formatCount(stats.bookingsLast7Days)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Derniers 30 jours:</span>
                <span className="font-bold text-primary">{formatCount(stats.bookingsLast30Days)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Confirmées:</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-600">{formatCount(stats.confirmedBookings)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">En attente:</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-amber-600">{formatCount(stats.pendingBookings)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Annulées:</span>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-bold text-red-600">{formatCount(stats.cancelledBookings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Performance Globale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Établissements actifs:</span>
                <span className="font-bold text-primary">{formatCount(stats.totalBusinesses)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Clients inscrits:</span>
                <span className="font-bold text-primary">{formatCount(stats.totalClients)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Note moyenne:</span>
                <span className="font-bold text-foreground">{formatRating(stats.averageRating)}{stats.averageRating ? '/5' : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Taux de confirmation:</span>
                <span className="font-bold text-[#c8a2c9] dark:text-[#d6aad7]">{formatPercentage(stats.conversionRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total réservations:</span>
                <span className="font-bold text-foreground">{formatCount(stats.totalBookings)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories & Cities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Top Catégories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{category.category}</h4>
                      <p className="text-muted-foreground text-sm">{category.count} établissements</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Top Villes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topCities.map((city, index) => (
                <div key={city.city} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{city.city}</h4>
                      <p className="text-muted-foreground text-sm">{city.businesses} établissements</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{city.bookings}</span>
                    <p className="text-muted-foreground text-xs">réservations</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Graphiques Interactifs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Bookings Chart */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Réservations par jour</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData.bookingsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value, name) => [
                      value,
                      name === 'bookings' ? 'Total réservations' : 'Confirmées'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="bookings" fill="#8884d8" name="Total réservations" />
                  <Bar dataKey="confirmed" fill="#82ca9d" name="Confirmées" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution Chart */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Répartition par Catégorie</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.chartData.categoryChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  >
                    {stats.chartData.categoryChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStatsPage;