import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, Star, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface PlatformStats {
  totalBusinesses: number;
  totalClients: number;
  totalDeals: number;
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  pendingBusinesses: number;
  activeDeals: number;
  completedBookings: number;
  averageRating: number;
  growthRate: number;
  conversionRate: number;
}

const AdminDashboard: React.FC = () => {
  useAuth();
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalBusinesses: 0,
    totalClients: 0,
    totalDeals: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCommission: 0,
    pendingBusinesses: 0,
    activeDeals: 0,
    completedBookings: 0,
    averageRating: 0,
    growthRate: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true); // used in fetchPlatformStats
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);

      // Fetch all platform statistics with real data
      const [businessesResult, clientsResult, dealsResult, bookingsResult] = await Promise.all([
        supabase.from('businesses').select('id, status, rating, total_commission_owed'),
        supabase.from('user_profiles').select('id, role').eq('role', 'client'),
        supabase.from('deals').select('id, is_active'),
        supabase.from('bookings').select('id, status, total_price')
      ]);

      const businesses = businessesResult.data || [];
      const clients = clientsResult.data || [];
      const deals = dealsResult.data || [];
      const bookings = bookingsResult.data || [];

      const totalBusinesses = businesses.length;
      const totalClients = clients.length;
      const totalDeals = deals.length;
      const activeDeals = deals.filter(d => d.is_active).length;
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const totalCommission = businesses.reduce((sum, b) => sum + (b.total_commission_owed || 0), 0);
      const pendingBusinesses = businesses.filter(b => b.status === 'pending').length;
      const averageRating = businesses.length > 0
        ? businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length
        : 0;

      // Calculate growth rate (compare with previous period)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const [prevBusinessesResult, prevClientsResult] = await Promise.all([
        supabase.from('businesses').select('id').lt('created_at', oneMonthAgo.toISOString()),
        supabase.from('user_profiles').select('id').eq('role', 'client').lt('created_at', oneMonthAgo.toISOString())
      ]);

      const prevBusinesses = prevBusinessesResult.data?.length || 0;
      const prevClients = prevClientsResult.data?.length || 0;

      const businessGrowthRate = prevBusinesses > 0 ? ((totalBusinesses - prevBusinesses) / prevBusinesses) * 100 : 0;
      const clientGrowthRate = prevClients > 0 ? ((totalClients - prevClients) / prevClients) * 100 : 0;
      const overallGrowthRate = (businessGrowthRate + clientGrowthRate) / 2;

      setPlatformStats({
        totalBusinesses,
        totalClients,
        totalDeals,
        totalBookings,
        totalRevenue,
        totalCommission,
        pendingBusinesses,
        activeDeals,
        completedBookings: completedBookings.length,
        averageRating,
        growthRate: overallGrowthRate,
        conversionRate: totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mr-2" />
          Chargement des statistiques…
        </div>
      )}
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Établissements</p>
                <p className="text-2xl font-bold text-foreground">{platformStats.totalBusinesses}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold text-foreground">{platformStats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-foreground">{platformStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-foreground">{platformStats.pendingBusinesses}</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate('/admin/businesses')}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">{platformStats.totalBusinesses}</span>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Établissements</h3>
            <p className="text-sm text-muted-foreground">Gérer les salons</p>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/admin/clients')}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full">
            <Users className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">{platformStats.totalClients}</span>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Clients</h3>
            <p className="text-sm text-muted-foreground">Base utilisateurs</p>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/admin/offers')}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full">
            <Star className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">{platformStats.activeDeals}</span>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Offres</h3>
            <p className="text-sm text-muted-foreground">Modération</p>
          </div>
        </Button>

        <Button
          onClick={() => navigate('/admin/stats')}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-accent"
        >
          <div className="flex items-center justify-between w-full">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">{platformStats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Analytics</h3>
            <p className="text-sm text-muted-foreground">Statistiques</p>
          </div>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux de conversion:</span>
              <span className="font-medium">{platformStats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Croissance:</span>
              <span className="font-medium text-[#c8a2c9] dark:text-[#d6aad7]">+{platformStats.growthRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Note moyenne:</span>
              <span className="font-medium">{platformStats.averageRating.toFixed(1)}/5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-primary" />
              Finances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenus totaux:</span>
              <span className="font-medium">{platformStats.totalRevenue.toLocaleString()} DH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commissions:</span>
              <span className="font-medium">{platformStats.totalCommission.toLocaleString()} DH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux commission:</span>
              <span className="font-medium">15%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;