import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { CalendarBooking } from './BusinessCalendarView';

interface BookingAnalyticsProps {
  bookings: CalendarBooking[];
}

const BookingAnalytics: React.FC<BookingAnalyticsProps> = ({ bookings }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now
    });
    const last30Days = eachDayOfInterval({
      start: subDays(now, 29),
      end: now
    });

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });

    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const filterByDateRange = (start: Date, end: Date) =>
      bookings.filter(b => {
        const bookingDate = new Date(b.start_at);
        return bookingDate >= start && bookingDate <= end;
      });

    const thisWeekBookings = filterByDateRange(thisWeekStart, thisWeekEnd);
    const lastWeekBookings = filterByDateRange(lastWeekStart, lastWeekEnd);
    const thisMonthBookings = filterByDateRange(thisMonthStart, thisMonthEnd);
    const lastMonthBookings = filterByDateRange(lastMonthStart, lastMonthEnd);

    const calculateRevenue = (bookings: CalendarBooking[]) =>
      bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0);

    const thisWeekRevenue = calculateRevenue(thisWeekBookings);
    const lastWeekRevenue = calculateRevenue(lastWeekBookings);
    const thisMonthRevenue = calculateRevenue(thisMonthBookings);
    const lastMonthRevenue = calculateRevenue(lastMonthBookings);

    const revenueGrowth = lastWeekRevenue > 0
      ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
      : 0;

    const bookingsGrowth = lastWeekBookings.length > 0
      ? ((thisWeekBookings.length - lastWeekBookings.length) / lastWeekBookings.length) * 100
      : 0;

    const dailyData = last7Days.map(day => {
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.start_at);
        return format(bookingDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      return {
        date: format(day, 'EEE', { locale: fr }),
        bookings: dayBookings.length,
        revenue: calculateRevenue(dayBookings),
        completed: dayBookings.filter(b => b.status === 'completed').length
      };
    });

    const monthlyData = last30Days.reduce((acc: any[], day) => {
      const weekNum = Math.floor((last30Days.indexOf(day)) / 7);
      if (!acc[weekNum]) {
        acc[weekNum] = {
          week: `Sem ${weekNum + 1}`,
          bookings: 0,
          revenue: 0
        };
      }

      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.start_at);
        return format(bookingDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      acc[weekNum].bookings += dayBookings.length;
      acc[weekNum].revenue += calculateRevenue(dayBookings);

      return acc;
    }, []);

    const statusDistribution = [
      { name: 'Terminé', value: bookings.filter(b => b.status === 'completed').length, color: 'hsl(var(--chart-1))' },
      { name: 'Confirmé', value: bookings.filter(b => b.status === 'confirmed').length, color: 'hsl(var(--chart-2))' },
      { name: 'En attente', value: bookings.filter(b => b.status === 'pending').length, color: 'hsl(var(--chart-3))' },
      { name: 'Annulé', value: bookings.filter(b => b.status === 'cancelled').length, color: 'hsl(var(--chart-4))' },
      { name: 'Absent', value: bookings.filter(b => b.status === 'noshow').length, color: 'hsl(var(--chart-5))' }
    ].filter(item => item.value > 0);

    const topServices = Object.entries(
      bookings
        .filter(b => b.status === 'completed')
        .reduce((acc: Record<string, { count: number; revenue: number }>, b) => {
          if (!acc[b.service_summary]) {
            acc[b.service_summary] = { count: 0, revenue: 0 };
          }
          acc[b.service_summary].count++;
          acc[b.service_summary].revenue += b.total_price;
          return acc;
        }, {})
    )
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const averageBookingValue = thisMonthBookings.length > 0
      ? thisMonthRevenue / thisMonthBookings.filter(b => b.status === 'completed').length
      : 0;

    const peakHours = Object.entries(
      bookings.reduce((acc: Record<string, number>, b) => {
        const hour = format(new Date(b.start_at), 'HH:00');
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      thisWeek: {
        bookings: thisWeekBookings.length,
        revenue: thisWeekRevenue,
        completed: thisWeekBookings.filter(b => b.status === 'completed').length
      },
      thisMonth: {
        bookings: thisMonthBookings.length,
        revenue: thisMonthRevenue,
        completed: thisMonthBookings.filter(b => b.status === 'completed').length
      },
      growth: {
        revenue: revenueGrowth,
        bookings: bookingsGrowth
      },
      dailyData,
      monthlyData,
      statusDistribution,
      topServices,
      averageBookingValue,
      peakHours
    };
  }, [bookings]);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="text-xs sm:text-sm font-semibold">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Revenu cette semaine"
          value={`${analytics.thisWeek.revenue.toLocaleString()} DH`}
          subtitle={`${analytics.thisWeek.completed} réservations terminées`}
          icon={DollarSign}
          trend={analytics.growth.revenue}
        />
        <StatCard
          title="Réservations cette semaine"
          value={analytics.thisWeek.bookings}
          subtitle="Total toutes statuts"
          icon={Calendar}
          trend={analytics.growth.bookings}
        />
        <StatCard
          title="Revenu ce mois"
          value={`${analytics.thisMonth.revenue.toLocaleString()} DH`}
          subtitle={`${analytics.thisMonth.bookings} réservations au total`}
          icon={TrendingUp}
        />
        <StatCard
          title="Valeur moyenne"
          value={`${analytics.averageBookingValue.toFixed(0)} DH`}
          subtitle="Par réservation terminée"
          icon={Users}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Performance */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Performance 7 jours
          </h3>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenu" />
                <Bar dataKey="bookings" fill="hsl(var(--chart-2))" name="Réservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Tendance 30 jours
          </h3>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="week"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Revenu" />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Réservations" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Status Distribution */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Distribution par statut
          </h3>
          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  dataKey="value"
                  label={(entry) => entry.name}
                  labelLine={false}
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Services populaires
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {analytics.topServices.slice(0, 5).map((service, index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                    {service.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {service.count} rés.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-semibold text-primary whitespace-nowrap">
                    {service.revenue.toLocaleString()} DH
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
            Heures de pointe
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {analytics.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    {hour.hour}
                  </span>
                </div>
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="flex-1 bg-accent rounded-full h-2 min-w-0">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(hour.count / analytics.peakHours[0].count) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0 w-6 sm:w-8 text-right">
                    {hour.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAnalytics;
