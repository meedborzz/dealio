import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-primary/20 rotate-3">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>

          <h2 className="text-3xl font-black text-foreground mb-3 tracking-tighter">
            C'est réservé !
          </h2>
          <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
            Votre demande a été envoyée.<br />
            Le salon <span className="text-foreground font-bold">{business.name}</span> vous confirmera bientôt.
          </p>

          <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-premium mb-10 text-left space-y-5">
            <div className="flex justify-between items-center group">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Service</span>
                <p className="font-bold text-foreground line-clamp-1">{deal.title}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-5 border-t border-foreground/5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</span>
                <p className="font-bold text-foreground">
                  {availableDates.find(d => d.date === selectedDate)?.display}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Heure</span>
                <p className="font-bold text-foreground">
                  {selectedTimeSlot.start_time?.slice(0, 5)}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-5 border-t border-foreground/5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Statut</span>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full font-bold">En attente</Badge>
            </div>
          </div>

          <Button
            onClick={() => navigate('/')}
            className="w-full h-14 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Immersive Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 pt-safe">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full hover:bg-foreground/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1 pr-10">
              <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">
                Réservation
              </h1>
              <h2 className="text-xl font-black text-foreground tracking-tight line-clamp-1">
                {deal.title}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-10">
        {/* Salon Info - Subtle */}
        <div className="text-center space-y-1">
          <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
            Chez <span className="text-foreground font-bold">{business.name}</span>
          </p>
          <div className="flex items-center justify-center gap-4 text-sm font-bold">
            <span className="text-primary">{deal.discounted_price} DH</span>
            <span className="text-muted-foreground/40 line-through">{deal.original_price} DH</span>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary rounded-full px-3">
              {deal.discount_percentage}% OFF
            </Badge>
          </div>
        </div>

        {/* Date Selection */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-[17px] font-black tracking-tight text-foreground uppercase">
              Choisir une date
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {availableDates.map((dateOption) => {
              const isSelected = selectedDate === dateOption.date;
              return (
                <button
                  key={dateOption.date}
                  onClick={() => setSelectedDate(dateOption.date)}
                  className={`flex flex-col items-center justify-center min-w-[80px] h-[90px] rounded-[2rem] border-2 transition-all duration-300 ${isSelected
                    ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-105'
                    : 'bg-card border-border/50 hover:border-primary/30'
                    }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {dateOption.display.split(' ')[0]}
                  </span>
                  <span className={`text-xl font-black tracking-tighter ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {dateOption.display.split(' ')[1]}
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {dateOption.display.split(' ')[2]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time Selection */}
        {selectedDate && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-[17px] font-black tracking-tight text-foreground uppercase">
                Heure préférée
              </h3>
            </div>
            {availableSlots.length === 0 ? (
              <div className="p-10 text-center rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/50">
                <p className="text-muted-foreground font-medium">Aucun créneau disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isFull = !slot.is_available || slot.available_spots <= 0;
                  const isSelected = selectedTimeSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => !isFull && setSelectedTimeSlot(slot)}
                      disabled={isFull}
                      className={`h-14 rounded-2xl border-2 font-bold transition-all duration-300 ${isSelected
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/10 scale-105'
                        : isFull
                          ? 'bg-muted/10 border-border/30 opacity-40 cursor-not-allowed'
                          : 'bg-card border-border/50 hover:border-primary/30 text-foreground'
                        }`}
                    >
                      <span className="text-sm">{slot.start_time?.slice(0, 5)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Customer Info */}
        {selectedTimeSlot && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-[17px] font-black tracking-tight text-foreground uppercase">
                Vos informations
              </h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase ml-4">Nom complet</label>
                <div className="relative group">
                  <Input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Mohamed Berhiche"
                    className="h-14 rounded-[1.25rem] border-2 bg-card/50 transition-all duration-300 focus:ring-primary/20 group-hover:border-primary/30"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase ml-4">Téléphone</label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+212 6XXXXXXXX"
                  className="h-14 rounded-[1.25rem] border-2 bg-card/50 transition-all duration-300 focus:ring-primary/20 group-hover:border-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase ml-4">Email</label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-14 rounded-[1.25rem] border-2 bg-card/50 transition-all duration-300 focus:ring-primary/20 group-hover:border-primary/30"
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Summary & Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pt-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/40 backdrop-blur-2xl border border-white/20 p-5 rounded-[2.5rem] shadow-premium flex items-center justify-between gap-6">
            <div className="flex-shrink-0">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widert">Total</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary tracking-tighter">{deal.discounted_price}</span>
                  <span className="text-xs font-black text-primary/70">DH</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleBooking}
              disabled={isLoading || !selectedTimeSlot || !customerName.trim() || !customerPhone.trim() || !customerEmail.trim()}
              className={`flex-1 h-14 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 transition-all duration-500 ${isLoading ? 'scale-95 opacity-80' : 'hover:scale-[1.02] active:scale-95'
                }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Réservation...
                </>
              ) : selectedTimeSlot && customerName.trim() && customerPhone.trim() && customerEmail.trim() ? (
                'Confirmer'
              ) : (
                'Remplissez vos infos'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowPage;