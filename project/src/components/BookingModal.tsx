import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, User, MapPin, Home, ExternalLink, AlertTriangle, RefreshCw, CheckCircle2, CreditCard, Eye, EyeOff, LogIn } from 'lucide-react';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { safeSingle, safeQuery } from '../lib/supabaseSafe';
import { Deal, TimeSlot } from '../shared/types/contracts';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { generateTimeSlotsForDay } from '../utils/timeSlotGenerator';
import { FEATURES } from '../config/features';
import { saveGuestBooking } from '../lib/guestBookings';
import { ensureGuestSessionId } from '../lib/guestSession';
import { getGuestBookingTokens, clearGuestBookings } from '../lib/guestBookings';
import { getGuestSessionId, clearGuestSession } from '../lib/guestSession';
import BookingDateSection from './booking/BookingDateSection';
import BookingHourSection from './booking/BookingHourSection';
import BookingFormSection from './booking/BookingFormSection';
import BookingRecapFooter from './booking/BookingRecapFooter';

interface BookingModalProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
  skipServiceStep?: boolean;
}

type AuthMode = 'choice' | 'login' | 'register';

const BookingModal: React.FC<BookingModalProps> = ({
  deal,
  isOpen,
  onClose,
  onBookingComplete,
  skipServiceStep = false
}) => {
  const navigate = useNavigate();
  const { user, signUp, signIn, refreshProfile } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [useWalletPartial, setUseWalletPartial] = useState(false);
  const [businessClosed, setBusinessClosed] = useState(false);
  const [conflictError, setConflictError] = useState(false);
  const [alternativeSlots, setAlternativeSlots] = useState<TimeSlot[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('choice');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const timeRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  });

  const availableDates = useMemo(() => {
    const today = new Date();
    const validUntil = parseISO(deal.valid_until);
    const daysUntilExpiry = differenceInDays(validUntil, today);
    const maxDays = Math.min(daysUntilExpiry + 1, 14);

    return Array.from({ length: Math.max(maxDays, 0) }, (_, i) => {
      const date = addDays(today, i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        display: format(date, 'EEE d MMM', { locale: fr }),
        isToday: i === 0
      };
    });
  }, [deal.valid_until]);

  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      return format(parseISO(selectedDate), 'EEE d MMM', { locale: fr });
    } catch {
      return '';
    }
  }, [selectedDate]);

  const formattedTime = useMemo(() => {
    return selectedTimeSlot?.start_time?.slice(0, 5) || '';
  }, [selectedTimeSlot]);

  const formValid = useMemo(() => {
    const name = bookingData.customerName.trim();
    const phone = bookingData.customerPhone.trim();
    const email = bookingData.customerEmail.trim();
    return name.length > 0 && phone.length >= 8 && email.includes('@');
  }, [bookingData.customerName, bookingData.customerPhone, bookingData.customerEmail]);

  const ctaLabel = useMemo(() => {
    if (!selectedDate) return 'Selectionnez une date';
    if (!selectedTimeSlot) return 'Selectionnez un horaire';
    if (!formValid) return 'Remplissez vos informations';
    return 'confirm';
  }, [selectedDate, selectedTimeSlot, formValid]);

  const userId = user?.id;

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDate, deal.id]);

  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        customerName: profile?.full_name || user.user_metadata?.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: profile?.phone || prev.customerPhone
      }));
    }
  }, [userId, profile]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate('');
      setSelectedTimeSlot(null);
      setBookingComplete(false);
      setCompletedBooking(null);
      setConflictError(false);
      setAlternativeSlots([]);
      setShowForm(false);
      setShowAuthGate(false);
      setAuthMode('choice');
      setAuthError('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setLoginEmail('');
      setLoginPassword('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate && timeRef.current) {
      setTimeout(() => {
        timeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await safeSingle(
      supabase
        .from('user_profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .maybeSingle()
    );
    if (data) setProfile(data);
  };

  const fetchTimeSlots = async () => {
    try {
      setSlotsLoading(true);
      setBusinessClosed(false);
      const { data, error } = await safeQuery(
        supabase
          .from('time_slots')
          .select('*')
          .eq('deal_id', deal.id)
          .eq('date', selectedDate)
          .order('start_time')
      );

      if (error) {
        setAvailableSlots([]);
        return;
      }

      if (!data || data.length === 0) {
        try {
          const { data: businessData } = await safeSingle(
            supabase
              .from('businesses')
              .select('working_hours, special_dates')
              .eq('id', deal.business_id)
              .maybeSingle()
          );

          const workingHours = businessData?.working_hours || {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: true }
          };

          const generatedSlots = generateTimeSlotsForDay({
            date: selectedDate,
            workingHours,
            serviceDuration: deal.duration_minutes || 60,
            maxBookingsPerSlot: deal.max_bookings_per_slot || 1,
            specialDates: businessData?.special_dates || undefined
          });

          if (generatedSlots.length > 0) {
            const slotsToInsert = generatedSlots.map(slot => ({
              deal_id: deal.id,
              date: selectedDate,
              ...slot
            }));

            const { data: insertedSlots, error: insertError } = await supabase
              .from('time_slots')
              .insert(slotsToInsert)
              .select('*')
              .order('start_time');

            if (insertError) {
              console.error('Error inserting generated slots:', insertError);
              setAvailableSlots([]);
            } else {
              setAvailableSlots(insertedSlots || []);
            }
          } else {
            setBusinessClosed(true);
            setAvailableSlots([]);
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
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchAlternativeSlots = async () => {
    const { data } = await safeQuery(
      supabase
        .from('time_slots')
        .select('*')
        .eq('deal_id', deal.id)
        .eq('is_available', true)
        .gt('available_spots', 0)
        .gte('date', format(new Date(), 'yyyy-MM-dd'))
        .order('date')
        .order('start_time')
        .limit(3)
    );
    setAlternativeSlots(data || []);
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) return;
    if (submittingRef.current) return;

    const trimmedName = bookingData.customerName.trim();
    const trimmedPhone = bookingData.customerPhone.trim();
    const trimmedEmail = bookingData.customerEmail.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) return;

    try {
      submittingRef.current = true;
      setLoading(true);
      setConflictError(false);

      const startDateTime = new Date(`${selectedDate}T${selectedTimeSlot.start_time}`);
      const endDateTime = new Date(startDateTime.getTime() + (deal.duration_minutes || 60) * 60000);
      const guestSessionId = !user ? ensureGuestSessionId() : null;

      const { data, error } = await supabase.rpc('create_booking', {
        p_deal_id: deal.id,
        p_time_slot_id: selectedTimeSlot.id,
        p_customer_name: trimmedName,
        p_customer_phone: trimmedPhone,
        p_customer_email: trimmedEmail,
        p_notes: bookingData.notes || null,
        p_booking_date: startDateTime.toISOString(),
        p_start_at: startDateTime.toISOString(),
        p_end_at: endDateTime.toISOString(),
        p_service_summary: deal.title,
        p_total_price: deal.discounted_price,
        p_guest_session_id: guestSessionId,
      });

      if (error) throw error;

      if (!data.success) {
        if (data.conflict) {
          setConflictError(true);
          await fetchAlternativeSlots();
          return;
        }
        throw new Error(data.error || 'Failed to create booking');
      }

      setCompletedBooking(data.booking);
      setBookingComplete(true);

      if (!user && data.booking?.booking_token) {
        saveGuestBooking(data.booking.booking_token, deal.title, deal.business?.name);
      }

      await fetchTimeSlots();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Erreur lors de la reservation. Veuillez reessayer.');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const handleConfirmClick = useCallback(() => {
    if (!user) {
      setShowAuthGate(true);
      setAuthMode('choice');
      return;
    }
    handleBooking();
  }, [user, selectedTimeSlot, selectedDate, bookingData, deal]);

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setShowForm(false);
  }, []);

  const handleSelectSlot = useCallback((slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    setShowForm(true);
  }, []);

  const handleChangeName = useCallback((value: string) => {
    setBookingData(prev => ({ ...prev, customerName: value }));
  }, []);

  const handleChangePhone = useCallback((value: string) => {
    setBookingData(prev => ({ ...prev, customerPhone: value }));
  }, []);

  const handleChangeEmail = useCallback((value: string) => {
    setBookingData(prev => ({ ...prev, customerEmail: value }));
  }, []);

  const handleGuestContinue = () => {
    setShowAuthGate(false);
    handleBooking();
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await signIn(loginEmail, loginPassword);
      if (error) throw error;

      setShowAuthGate(false);

      setTimeout(() => {
        handleBooking();
      }, 500);
    } catch (error: any) {
      setAuthError(error.message || 'Erreur de connexion');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword !== authConfirmPassword) {
      setAuthError('Les mots de passe ne correspondent pas');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const email = bookingData.customerEmail.trim();
      const name = bookingData.customerName.trim();

      const { data, error } = await signUp(email, authPassword, name);
      if (error) throw error;

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            full_name: name,
            phone: bookingData.customerPhone.trim(),
            role: 'client',
            referral_code: 'DEAL' + data.user.id.substring(0, 6).toUpperCase(),
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        await refreshProfile();

        const guestSessionId = getGuestSessionId();
        const bookingTokens = getGuestBookingTokens();

        if (guestSessionId || bookingTokens.length > 0) {
          try {
            const { data: transferCount, error: transferError } = await supabase.rpc(
              'transfer_guest_bookings_to_user',
              {
                p_user_id: data.user.id,
                p_guest_session_id: guestSessionId,
                p_booking_tokens: bookingTokens.length > 0 ? bookingTokens : null
              }
            );

            if (!transferError && transferCount > 0) {
              clearGuestBookings();
              clearGuestSession();
            }
          } catch (err) {
            console.error('Error transferring bookings:', err);
          }
        }
      }

      setShowAuthGate(false);
      setTimeout(() => {
        handleBooking();
      }, 500);
    } catch (error: any) {
      if (error.message?.includes('User already registered')) {
        setAuthError('Un compte existe deja avec cet email. Connectez-vous.');
      } else {
        setAuthError(error.message || 'Erreur lors de la creation du compte');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSelectAlternativeSlot = (slot: TimeSlot) => {
    setSelectedDate(slot.date);
    setSelectedTimeSlot(slot);
    setConflictError(false);
    setAlternativeSlots([]);
  };

  const handleBookingComplete = () => {
    setBookingComplete(false);
    setCompletedBooking(null);
    onBookingComplete();
    onClose();
  };

  const handleViewBooking = () => {
    handleBookingComplete();
    navigate('/bookings');
  };

  const handleGoHome = () => {
    handleBookingComplete();
    navigate('/');
  };

  const handleGetDirections = () => {
    const business = deal.business;
    if (business?.address) {
      const query = encodeURIComponent(`${business.address}, ${business.city || ''}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const handleCopyBookingLink = async () => {
    if (!completedBooking?.booking_token) return;
    const bookingUrl = `${window.location.origin}/booking/${completedBooking.booking_token}`;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (!isOpen) return null;

  if (bookingComplete && completedBooking) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
        <Card className="w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-28">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#c8a2c9]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-[#c8a2c9]" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Demande envoyee!</h2>
              <p className="text-sm text-muted-foreground">En attente de confirmation du salon</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">{deal.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salon</span>
                <span className="font-medium text-foreground">{deal.business?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heure</span>
                <span className="font-medium text-foreground">{formattedTime}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{deal.discounted_price} DH</span>
              </div>
            </div>

            {!user && (
              <div className="bg-gradient-to-br from-[#c8a2c9]/10 to-[#b892b9]/10 border border-[#c8a2c9]/20 rounded-xl p-4 mb-6">
                <div className="text-center mb-3">
                  <h4 className="font-semibold text-foreground mb-1">Creez votre compte Dealio</h4>
                  <p className="text-xs text-muted-foreground">
                    Gerez vos reservations et profitez d'offres exclusives
                  </p>
                </div>
                <Button
                  onClick={() => {
                    handleBookingComplete();
                    navigate('/register?type=client');
                  }}
                  className="w-full h-10 font-semibold bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9]"
                >
                  Creer un compte gratuit
                </Button>
                <button
                  onClick={() => {
                    handleBookingComplete();
                    navigate('/login');
                  }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center mt-2 py-1"
                >
                  Deja un compte ? Se connecter
                </button>
              </div>
            )}

            <div className="space-y-2">
              {user ? (
                <Button onClick={handleViewBooking} className="w-full" size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir ma reservation
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleBookingComplete();
                    navigate('/bookings');
                  }}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir mes reservations
                </Button>
              )}

              <Button onClick={handleGoHome} variant="outline" className="w-full" size="lg">
                <Home className="h-4 w-4 mr-2" />
                Retour a l'accueil
              </Button>

              {deal.business?.address && (
                <Button onClick={handleGetDirections} variant="ghost" className="w-full" size="lg">
                  <MapPin className="h-4 w-4 mr-2" />
                  Obtenir l'itineraire
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              {user
                ? "Vous recevrez une notification une fois confirme"
                : "Le salon vous contactera par telephone ou email"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (showAuthGate) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
        <Card className="w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-28">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">
                {authMode === 'choice' && 'Finaliser la reservation'}
                {authMode === 'login' && 'Se connecter'}
                {authMode === 'register' && 'Creer un compte'}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAuthGate(false)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm">{authError}</p>
              </div>
            )}

            {authMode === 'choice' && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1 mb-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{deal.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {formattedDate} {formattedTime}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{deal.discounted_price} DH</span>
                  </div>
                </div>

                <Button onClick={handleGuestContinue} className="w-full h-12 text-base font-semibold" size="lg">
                  Continuer en tant qu'invite
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">ou</span>
                  </div>
                </div>

                <Button
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <User className="h-4 w-4 mr-2" />
                  Creer un compte gratuit
                </Button>

                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); setLoginEmail(bookingData.customerEmail); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2 transition-colors"
                >
                  Deja un compte ? <span className="font-medium text-primary">Se connecter</span>
                </button>
              </div>
            )}

            {authMode === 'login' && (
              <form onSubmit={handleAuthLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={authLoading} className="w-full h-12 text-base font-semibold" size="lg">
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Se connecter et reserver
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('choice'); setAuthError(''); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2"
                >
                  Retour
                </button>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleAuthRegister} className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground mb-1">Vos informations :</p>
                  <p className="font-medium text-foreground">{bookingData.customerName}</p>
                  <p className="text-muted-foreground">{bookingData.customerEmail}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Minimum 6 caracteres"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirmer le mot de passe *</label>
                  <Input
                    type="password"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                </div>

                <Button type="submit" disabled={authLoading} className="w-full h-12 text-base font-semibold" size="lg">
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                  ) : (
                    'Creer mon compte et reserver'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); setLoginEmail(bookingData.customerEmail); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2"
                >
                  Deja un compte ? <span className="font-medium text-primary">Se connecter</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('choice'); setAuthError(''); }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1"
                >
                  Retour
                </button>
              </form>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex-shrink-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {deal.image_url && (
            <img src={deal.image_url} alt={deal.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-foreground text-sm truncate">{deal.title}</h2>
            <p className="text-xs text-muted-foreground truncate">{deal.business?.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 space-y-6 pb-48">
          <BookingDateSection
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />

          {selectedDate && (
            <BookingHourSection
              ref={timeRef}
              slotsLoading={slotsLoading}
              availableSlots={availableSlots}
              businessClosed={businessClosed}
              selectedTimeSlotId={selectedTimeSlot?.id || null}
              onSelectSlot={handleSelectSlot}
            />
          )}

          {conflictError && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1 text-sm">Creneau non disponible</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                      Ce creneau vient d'etre reserve. Voici d'autres options:
                    </p>
                    {alternativeSlots.length > 0 ? (
                      <div className="space-y-2">
                        {alternativeSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant="outline"
                            onClick={() => handleSelectAlternativeSlot(slot)}
                            className="w-full justify-between bg-white dark:bg-background text-sm"
                            size="sm"
                          >
                            <span>{format(parseISO(slot.date), 'EEE d MMM', { locale: fr })} a {slot.start_time?.slice(0, 5)}</span>
                            <span className="text-xs text-muted-foreground">{slot.available_spots} place{slot.available_spots > 1 ? 's' : ''}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => { setSelectedTimeSlot(null); setConflictError(false); }} className="w-full" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Choisir un autre creneau
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showForm && selectedTimeSlot && (
            <BookingFormSection
              ref={formRef}
              bookingData={bookingData}
              onChangeName={handleChangeName}
              onChangePhone={handleChangePhone}
              onChangeEmail={handleChangeEmail}
            />
          )}

          {FEATURES.WALLET && user && profile && (profile.wallet_balance || 0) > 0 && showForm && (
            <div className="bg-gradient-to-r from-[#c8a2c9]/10 to-[#b892b9]/10 border border-[#c8a2c9]/20 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#c8a2c9]" />
                  <span className="text-sm font-medium text-foreground">Portefeuille</span>
                </div>
                <span className="text-sm font-semibold text-[#c8a2c9]">{(profile.wallet_balance || 0).toFixed(0)} DH</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(profile.wallet_balance || 0) >= deal.discounted_price ? useWallet : useWalletPartial}
                  onChange={(e) => {
                    if ((profile.wallet_balance || 0) >= deal.discounted_price) {
                      setUseWallet(e.target.checked);
                    } else {
                      setUseWalletPartial(e.target.checked);
                    }
                  }}
                  className="h-4 w-4 text-[#c8a2c9] rounded"
                />
                <span className="text-xs text-foreground">
                  {(profile.wallet_balance || 0) >= deal.discounted_price
                    ? 'Payer avec le portefeuille'
                    : `Utiliser le portefeuille (-${(profile.wallet_balance || 0).toFixed(0)} DH)`}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <BookingRecapFooter
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        discountedPrice={deal.discounted_price}
        originalPrice={deal.original_price}
        canConfirm={!!selectedTimeSlot && formValid && !conflictError}
        loading={loading}
        ctaLabel={ctaLabel}
        onConfirm={handleConfirmClick}
      />
    </div>
  );
};

export default BookingModal;
