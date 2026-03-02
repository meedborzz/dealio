import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Filter, Calendar, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarBooking } from './BusinessCalendarView';

interface BookingHistoryProps {
  bookings: CalendarBooking[];
  onViewBooking: (booking: CalendarBooking) => void;
  loading?: boolean;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  onViewBooking,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [filteredBookings, setFilteredBookings] = useState<CalendarBooking[]>([]);

  useEffect(() => {
    let filtered = [...bookings];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer_name.toLowerCase().includes(search) ||
        booking.customer_phone.includes(search) ||
        booking.service_summary.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = new Date();

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'thisWeek':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          break;
        case 'thisMonth':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'lastMonth':
          const lastMonth = subMonths(now, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.start_at);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    filtered.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      confirmed: { label: 'Confirmé', className: 'bg-[#c8a2c9]/20 text-[#c8a2c9] border-[#c8a2c9]/30' },
      completed: { label: 'Terminé', className: 'bg-muted text-muted-foreground border-border' },
      cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800 border-red-300' },
      noshow: { label: 'Absent', className: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    const { label, className } = config[status] || config.pending;
    return <span className={`px-2 py-1 rounded text-xs font-semibold border ${className}`}>{label}</span>;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Heure', 'Client', 'Téléphone', 'Service', 'Prix', 'Statut'];
    const rows = filteredBookings.map(booking => [
      format(new Date(booking.start_at), 'dd/MM/yyyy'),
      format(new Date(booking.start_at), 'HH:mm'),
      booking.customer_name,
      booking.customer_phone,
      booking.service_summary,
      `${booking.total_price} DH`,
      booking.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: filteredBookings.length,
    completed: filteredBookings.filter(b => b.status === 'completed').length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
    revenue: filteredBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_price, 0)
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 p-3 sm:p-4 bg-card border-b border-border">
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-[#c8a2c9] dark:text-[#d6aad7]">{stats.completed}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Terminés</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">En attente</div>
        </div>
        <div className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Annulés</div>
        </div>
        <div className="text-center col-span-3 sm:col-span-1">
          <div className="text-xl sm:text-2xl font-bold text-primary">{stats.revenue} DH</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Revenu</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-4 border-b border-border bg-card space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
            <option value="noshow">Absent</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="thisWeek">Cette semaine</option>
            <option value="thisMonth">Ce mois</option>
            <option value="lastMonth">Mois dernier</option>
          </select>

          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredBookings.length === 0}
            className="col-span-2 sm:col-span-1"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune réservation trouvée
            </h3>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBookings.map(booking => (
              <div
                key={booking.id}
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => onViewBooking(booking)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-foreground">
                        {booking.customer_name}
                      </h4>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-medium">Service:</span> {booking.service_summary}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Date:</span>{' '}
                        {format(new Date(booking.start_at), 'EEEE d MMMM yyyy', { locale: fr })} à{' '}
                        {format(new Date(booking.start_at), 'HH:mm')}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Téléphone:</span> {booking.customer_phone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground mb-2">
                      {booking.total_price} DH
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
