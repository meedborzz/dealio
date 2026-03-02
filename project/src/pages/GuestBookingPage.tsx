import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle, Home } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SatisfactionRating } from '../components/SatisfactionRating';

const GuestBookingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchBooking();
    }
  }, [token]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching booking with token:', token);

      // First, try to fetch just the booking to see if it exists
      const { data: simpleBooking, error: simpleError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_token', token!)
        .maybeSingle();

      console.log('Simple booking query result:', { simpleBooking, simpleError });

      // Now fetch with all relations
      const { data, error: fetchError } = await (supabase
        .from('bookings')
        .select(`
          *,
          deal:deals!inner(
            id,
            title,
            description,
            duration_minutes,
            discounted_price,
            image_url,
            business:businesses!inner(
              id,
              name,
              phone,
              email,
              address,
              city
            )
          ),
          time_slot:time_slots!inner(
            date,
            start_time,
            end_time
          ),
          booking_feedback!left(id)
        `)
        .eq('booking_token', token!)
        .maybeSingle() as any);

      console.log('Full booking query result:', { data, fetchError });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(`Erreur: ${fetchError.message}`);
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('No booking found for token:', token);
        setError('Réservation introuvable. Veuillez vérifier le lien.');
        setLoading(false);
        return;
      }

      console.log('Booking data loaded:', data);

      const bookingWithFeedback = {
        ...(data as Record<string, unknown>),
        has_feedback: Array.isArray((data as any).booking_feedback) && (data as any).booking_feedback.length > 0
      };

      setBooking(bookingWithFeedback);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      setError(error?.message || 'Erreur lors du chargement de la réservation.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmée',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
      case 'pending':
        return {
          label: 'En attente',
          icon: Clock,
          className: 'bg-yellow-400 text-white border-transparent dark:bg-yellow-600'
        };
      case 'cancelled':
        return {
          label: 'Annulée',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
      case 'completed':
        return {
          label: 'Complétée',
          icon: CheckCircle,
          className: 'bg-muted text-muted-foreground'
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre réservation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Réservation introuvable</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'Nous ne trouvons pas cette réservation. Veuillez vérifier le lien.'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const StatusIcon = statusInfo.icon;
  const business = booking.deal.business;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Votre Réservation</h1>
          <Badge className={statusInfo.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Détails de la réservation</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium text-foreground">
                      {format(parseISO(booking.time_slot.date), 'EEEE d MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Heure</div>
                    <div className="font-medium text-foreground">
                      {booking.time_slot.start_time?.slice(0, 5)} - {booking.time_slot.end_time?.slice(0, 5)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">Service</div>
                  <div className="font-medium text-foreground">{booking.service_summary || booking.deal.title}</div>
                  {booking.deal.duration_minutes && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Durée: {booking.deal.duration_minutes} minutes
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-1">Prix</div>
                  <div className="text-xl font-bold text-primary">{booking.total_price} DH</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {business && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Informations du salon</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-foreground">{business.name}</div>
                  </div>

                  {business.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-foreground">
                          {business.address}
                          {business.city && `, ${business.city}`}
                        </div>
                      </div>
                    </div>
                  )}

                  {business.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <a href={`tel:${business.phone}`} className="text-sm text-primary hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <a href={`mailto:${business.email}`} className="text-sm text-primary hover:underline">
                        {business.email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {booking.status === 'confirmed' && !booking.has_feedback && (
            <SatisfactionRating
              bookingId={booking.id}
              dealId={booking.deal?.id || ''}
              businessId={booking.deal?.business?.id || ''}
              guestBookingToken={token}
              onRated={() => fetchBooking()}
            />
          )}

          {booking.status === 'pending' && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      En attente de confirmation
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Le salon va confirmer votre réservation sous peu. Vous recevrez une notification par email ou téléphone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {booking.notes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground">{booking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestBookingPage;
