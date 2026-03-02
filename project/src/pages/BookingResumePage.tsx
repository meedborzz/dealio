import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Deal, TimeSlot } from '../shared/types/contracts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '../components/LoadingSpinner';

interface PendingBookingData {
  dealId: string;
  timeSlotId: string;
  bookingData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
  };
  selectedDate: string;
  totalPrice: number;
  timestamp: number;
}

const BookingResumePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingRequestSent, setBookingRequestSent] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [pendingData, setPendingData] = useState<PendingBookingData | null>(null);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      processPendingBooking();
    }
  }, [user]);

  const processPendingBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      // Retrieve pending booking data
      const pendingBookingStr = localStorage.getItem('dealio-pending-booking');
      if (!pendingBookingStr) {
        setError('Aucune réservation en attente trouvée');
        return;
      }

      const pendingBooking: PendingBookingData = JSON.parse(pendingBookingStr);
      setPendingData(pendingBooking);

      // Check if the booking intent is not too old (24 hours)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (now - pendingBooking.timestamp > maxAge) {
        localStorage.removeItem('dealio-pending-booking');
        setError('La demande de réservation a expiré. Veuillez recommencer.');
        return;
      }

      // Fetch deal details
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          image_url,
          original_price,
          discounted_price,
          discount_percentage,
          duration_minutes,
          valid_until,
          is_active,
          category,
          business_id,
          businesses!inner(
            id,
            name,
            address,
            city,
            phone,
            email,
            rating,
            review_count
          )
        `)
        .eq('id', pendingBooking.dealId)
        .eq('is_active', true)
        .eq('businesses.status', 'approved')
        .single();

      if (dealError || !dealData) {
        localStorage.removeItem('dealio-pending-booking');
        setError('L\'offre n\'est plus disponible');
        return;
      }

      const transformedDeal = {
        ...dealData,
        business: dealData.businesses
      };
      setDeal(transformedDeal);

      // Fetch time slot details
      const { data: timeSlotData, error: timeSlotError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('id', pendingBooking.timeSlotId)
        .eq('is_available', true)
        .gt('available_spots', 0)
        .single();

      if (timeSlotError || !timeSlotData) {
        localStorage.removeItem('dealio-pending-booking');
        setError('Le créneau horaire n\'est plus disponible');
        return;
      }

      setTimeSlot(timeSlotData);

      // Auto-complete the booking
      await completeBooking(pendingBooking, transformedDeal, timeSlotData);

    } catch (error) {
      console.error('Error processing pending booking:', error);
      setError('Erreur lors du traitement de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async (
    pendingBooking: PendingBookingData,
    dealData: Deal,
    timeSlotData: TimeSlot
  ) => {
    if (!user) return;

    try {
      setProcessing(true);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          deal_id: dealData.id,
          time_slot_id: timeSlotData.id,
          user_id: user.id,
          customer_name: pendingBooking.bookingData.customerName,
          customer_phone: pendingBooking.bookingData.customerPhone,
          customer_email: pendingBooking.bookingData.customerEmail,
          notes: pendingBooking.bookingData.notes || null,
          booking_date: new Date(`${pendingBooking.selectedDate}T${timeSlotData.start_time}`).toISOString(),
          total_price: pendingBooking.totalPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update available spots
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({
          available_spots: timeSlotData.available_spots - 1,
          is_available: timeSlotData.available_spots - 1 > 0
        })
        .eq('id', timeSlotData.id);

      if (updateError) throw updateError;

      // Send notifications using RPC function
      await supabase.rpc('notify_booking_created', { p_booking_id: booking.id });

      // Clear pending booking data
      localStorage.removeItem('dealio-pending-booking');
      localStorage.removeItem('dealio-redirect-after-login');

      // Set booking request sent state
      setCompletedBooking(booking);
      setBookingRequestSent(true);

    } catch (error) {
      console.error('Error completing booking:', error);
      setError('Erreur lors de la finalisation de la réservation');
    } finally {
      setProcessing(false);
    }
  };

  const handleContinue = () => {
    if (bookingRequestSent) {
      navigate('/bookings');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 mb-24">
          <CardContent className="text-center py-12">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-bold text-foreground mt-4 mb-2">
              Finalisation de votre réservation
            </h2>
            <p className="text-muted-foreground">
              Nous traitons votre demande...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 mb-24">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Erreur de réservation
            </h2>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Retour à l'accueil
              </Button>
              <Button
                onClick={() => deal && navigate(`/deal/${deal.id}`)}
                variant="outline"
                className="w-full"
                disabled={!deal}
              >
                Voir l'offre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 mb-24">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Finalisation en cours
            </h2>
            <p className="text-muted-foreground mb-4">
              Nous créons votre réservation...
            </p>

            {deal && pendingData && (
              <Card className="mb-4">
                <CardContent className="p-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{deal.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span className="font-medium">{pendingData.bookingData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {format(parseISO(pendingData.selectedDate), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    {timeSlot && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heure:</span>
                        <span className="font-medium">{timeSlot.start_time?.slice(0, 5)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingRequestSent && completedBooking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600 px-4 pt-12 pb-4 z-10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Réservation</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <Card className="max-w-md w-full mx-4 mb-24">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Demande envoyée !
            </h2>
            <p className="text-muted-foreground mb-6">
              En attente de confirmation du salon. Vous recevrez une notification une fois confirmée.
            </p>

            {deal && pendingData && (
              <Card className="mb-6">
                <CardContent className="p-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{deal.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salon:</span>
                      <span className="font-medium">{deal.business?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {format(parseISO(pendingData.selectedDate), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    {timeSlot && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heure:</span>
                        <span className="font-medium">{timeSlot.start_time?.slice(0, 5)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut:</span>
                      <span className="font-medium">
                        <Badge className="bg-yellow-400 text-white border-transparent hover:bg-yellow-500 dark:bg-yellow-600">
                          En attente
                        </Badge>
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Prix:</span>
                      <span className="text-primary">{pendingData.totalPrice} DH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <Button onClick={() => navigate('/bookings')} className="w-full">
                Voir mes réservations
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full mx-4 mb-24">
        <CardContent className="text-center py-12">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Aucune réservation en attente
          </h2>
          <p className="text-muted-foreground mb-6">
            Il n'y a pas de réservation à finaliser
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingResumePage;