import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

const submittedBookingKeys = new Set<string>();

const BookingFlowPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      display: format(date, 'EEE d MMM', { locale: fr }),
      isToday: i === 0
    };
  });

  useEffect(() => {
    if (dealId) {
      fetchDealDetails();
      if (user) {
        fetchUserProfile();
      }
    }
  }, [dealId, user]);

  useEffect(() => {
    if (user && profile) {
      setCustomerName(user.user_metadata?.name || profile.full_name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(profile.phone || '');
    }
  }, [user, profile]);

  useEffect(() => {
    if (selectedDate && deal) {
      fetchTimeSlots();
    }
  }, [selectedDate, deal]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchDealDetails = async () => {
    try {
      const { data, error } = await supabase
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
          max_bookings_per_slot,
          category,
          business_id,
          business:businesses!deals_business_id_fkey(
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
        .eq('id', dealId)
        .eq('is_active', true)
        .eq('business.status', 'approved')
        .single();

      if (error) throw error;

      // Transform the data to match expected structure
      const transformedDeal = {
        ...data,
        business: data.business
      };

      setDeal(transformedDeal);
      setBusiness(data.business);

      setSelectedDate(availableDates[0].date);
    } catch (error) {
      console.error('Error fetching deal:', error);
      navigate('/');
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('date', selectedDate)
        .order('start_time');

      if (error) throw error;

      if (!data || data.length === 0) {
        console.log('No time slots found, generating for deal:', deal.id);

        try {
          // Generate time slots for the selected date
          const slotsToInsert = [];

          // Generate slots from 9 AM to 6 PM with 1-hour intervals
          for (let hour = 9; hour < 18; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`;

            slotsToInsert.push({
              deal_id: deal.id,
              date: selectedDate,
              start_time: startTime,
              end_time: endTime,
              available_spots: deal.max_bookings_per_slot || 1,
              is_available: true
            });
          }

          const { data: insertedSlots, error: insertError } = await supabase
            .from('time_slots')
            .insert(slotsToInsert)
            .select('*')
            .order('start_time');

          if (insertError) {
            console.error('Error generating time slots:', insertError);
            setAvailableSlots([]);
          } else {
            setAvailableSlots(insertedSlots || []);
          }
        } catch (generationError) {
          console.error('Error generating time slots:', generationError);
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots(data);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedTimeSlot || !customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      showToast('Veuillez remplir tous les champs', 'warning');
      return;
    }

    const idempotencyKey = `${deal.id}|${selectedDate}|${selectedTimeSlot.id}|${customerEmail.trim().toLowerCase()}`;
    if (submittedBookingKeys.has(idempotencyKey)) {
      showToast('Cette réservation a déjà été envoyée', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      submittedBookingKeys.add(idempotencyKey);

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          deal_id: deal.id,
          time_slot_id: selectedTimeSlot.id,
          user_id: user.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim(),
          booking_date: new Date(`${selectedDate}T${selectedTimeSlot.start_time}`).toISOString(),
          total_price: deal.discounted_price,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Send notifications using RPC function
      await supabase.rpc('notify_booking_created', { p_booking_id: booking.id });

      // Send confirmation notification to client
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'booking_confirmation',
          channel: 'in_app',
          title: 'Demande envoyée',
          content: `Votre demande de réservation a été envoyée à ${deal.business?.name}`,
          data: {
            deal_title: deal.title,
            business_name: deal.business?.name,
            booking_date: selectedDate,
            booking_time: selectedTimeSlot.start_time
          },
          related_booking_id: booking.id,
          related_deal_id: deal.id,
          related_business_id: deal.business_id
        });
      await supabase
        .from('time_slots')
        .update({
          available_spots: selectedTimeSlot.available_spots - 1,
          is_available: selectedTimeSlot.available_spots - 1 > 0
        })
        .eq('id', selectedTimeSlot.id);

      await fetchTimeSlots();

      setBookingComplete(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      submittedBookingKeys.delete(idempotencyKey);
      const code = error?.code || '';
      const msg = error?.message || '';
      if (code === '23505' || msg.includes('duplicate') || msg.includes('already exists')) {
        showToast('Cette réservation existe déjà', 'warning');
      } else {
        showToast('Erreur lors de la réservation', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!deal || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-[#c8a2c9]" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Demande envoyée!</h2>
              <p className="text-muted-foreground mb-6">En attente de confirmation du salon</p>

              <Card className="mb-6">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{deal.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salon:</span>
                    <span className="font-medium">{business.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {availableDates.find(d => d.date === selectedDate)?.display}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heure:</span>
                    <span className="font-medium">{selectedTimeSlot.start_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut:</span>
                    <span className="font-medium text-purple-600">En attente</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Prix:</span>
                    <span className="text-primary">{deal.discounted_price} DH</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => navigate('/')} className="w-full">
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Réserver</h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Deal Summary */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-foreground mb-1">{deal.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">{business.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">{deal.discounted_price} DH</span>
              <span className="text-sm text-muted-foreground line-through">{deal.original_price} DH</span>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Choisir une date</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((dateOption) => (
                <Button
                  key={dateOption.date}
                  variant={selectedDate === dateOption.date ? "default" : "outline"}
                  onClick={() => setSelectedDate(dateOption.date)}
                  className="h-auto p-2 flex-col text-xs"
                >
                  {dateOption.display}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        {selectedDate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Choisir l'heure</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {availableSlots.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun créneau disponible</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => {
                    const isFull = !slot.is_available || slot.available_spots <= 0;
                    const isSelected = selectedTimeSlot?.id === slot.id;

                    return (
                      <Button
                        key={slot.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => !isFull && setSelectedTimeSlot(slot)}
                        disabled={isFull}
                        className={`h-16 text-sm flex-col justify-center p-2 ${isFull ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <div className="font-medium">{slot.start_time?.slice(0, 5)}</div>
                        {isFull ? (
                          <div className="text-xs text-muted-foreground mt-1">Complet</div>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-1">
                            {slot.available_spots} place{slot.available_spots > 1 ? 's' : ''}
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        {selectedTimeSlot && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Vos informations</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nom complet"
              />
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Téléphone"
              />
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email"
              />
            </CardContent>
          </Card>
        )}

        {/* Book Button */}
        {selectedTimeSlot && customerName.trim() && customerPhone.trim() && customerEmail.trim() && (
          <Button
            onClick={handleBooking}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Réservation...
              </>
            ) : (
              'Confirmer la réservation'
            )}
          </Button>
        )}
      </div>

      {/* Bottom spacing for nav */}
      <div className="h-20"></div>
    </div>
  );
};

export default BookingFlowPage;