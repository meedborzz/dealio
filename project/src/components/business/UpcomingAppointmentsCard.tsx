import React, { useState, useEffect } from 'react';
import { Calendar, Phone, MessageCircle, Check, X, ExternalLink, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { sendBookingConfirmation, sendBookingCancellation } from '@/lib/notifications';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UpcomingBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_title: string;
  start_at: string;
  end_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'requested';
  user_id: string | null;
  total_price: number;
}

interface UpcomingAppointmentsCardProps {
  businessId: string;
  onViewAll?: () => void;
}

export const UpcomingAppointmentsCard: React.FC<UpcomingAppointmentsCardProps> = ({
  businessId,
  onViewAll
}) => {
  const [bookings, setBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingBookings();
  }, [businessId]);

  const fetchUpcomingBookings = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: deals } = await supabase
        .from('deals')
        .select('id')
        .eq('business_id', businessId);

      if (!deals || deals.length === 0) {
        setBookings([]);
        return;
      }

      const dealIds = deals.map(d => d.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          customer_name,
          customer_phone,
          user_id,
          status,
          booking_date,
          booking_time,
          total_price,
          deal_id,
          deals!inner(title)
        `)
        .in('deal_id', dealIds)
        .gte('booking_date', now.split('T')[0])
        .lte('booking_date', sevenDaysLater.split('T')[0])
        .in('status', ['pending', 'confirmed', 'requested'])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true })
        .limit(15);

      if (error) throw error;

      const formattedBookings = (data || []).map((b: any) => {
        if (!b.booking_date) {
          return null;
        }

        const startAt = `${b.booking_date}T${b.booking_time || '09:00:00'}`;
        const startDate = new Date(startAt);

        if (isNaN(startDate.getTime())) {
          return null;
        }

        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        return {
          id: b.id,
          customer_name: b.customer_name,
          customer_phone: b.customer_phone,
          service_title: b.deals?.title || 'Service',
          start_at: startAt,
          end_at: endDate.toISOString(),
          status: b.status,
          user_id: b.user_id,
          total_price: b.total_price
        };
      }).filter(Boolean);

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (booking: UpcomingBooking) => {
    try {
      setUpdatingId(booking.id);

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id);

      if (error) throw error;

      if (booking.user_id) {
        await sendBookingConfirmation(booking.user_id, {
          bookingId: booking.id,
          serviceName: booking.service_title,
          date: booking.start_at
        }).catch(err => console.warn('Notification failed:', err));
      }

      await fetchUpcomingBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (booking: UpcomingBooking) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      setUpdatingId(booking.id);

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      if (booking.user_id) {
        await sendBookingCancellation(booking.user_id, {
          bookingId: booking.id,
          serviceName: booking.service_title,
          date: booking.start_at
        }).catch(err => console.warn('Notification failed:', err));
      }

      await fetchUpcomingBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'En attente', className: 'border-amber-500/50 text-amber-700 dark:text-amber-400' },
      requested: { variant: 'outline' as const, label: 'Demandé', className: 'border-amber-500/50 text-amber-700 dark:text-amber-400' },
      confirmed: { variant: 'default' as const, label: 'Confirmé', className: 'bg-primary/10 text-primary border-primary/20' },
      cancelled: { variant: 'outline' as const, label: 'Annulé', className: 'border-red-500/50 text-red-700 dark:text-red-400' },
      completed: { variant: 'outline' as const, label: 'Terminé', className: 'border-emerald-500/50 text-emerald-700 dark:text-emerald-400' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Rendez-vous à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Rendez-vous à venir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">Aucun rendez-vous à venir</p>
            <p className="text-sm text-muted-foreground mb-4">
              Les nouvelles réservations apparaîtront ici
            </p>
            {onViewAll && (
              <Button variant="outline" size="sm" onClick={onViewAll}>
                <Calendar className="h-4 w-4 mr-2" />
                Ouvrir le calendrier
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Rendez-vous à venir
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Tout voir
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <span className="text-sm font-semibold text-primary">
                  {getInitials(booking.customer_name)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {booking.customer_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {booking.service_title}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(booking.start_at), 'EEE d MMM • HH:mm', { locale: fr })}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {booking.customer_phone}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {(booking.status === 'pending' || booking.status === 'requested') && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs"
                      onClick={() => handleConfirm(booking)}
                      disabled={updatingId === booking.id}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Confirmer
                    </Button>
                  )}

                  {booking.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleCancel(booking)}
                      disabled={updatingId === booking.id}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Annuler
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => window.open(`tel:${booking.customer_phone}`)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Appeler
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => window.open(`https://wa.me/${booking.customer_phone.replace(/\D/g, '')}`)}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
