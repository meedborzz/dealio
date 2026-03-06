import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, X, Phone, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchUserBookings, getBookingStatusCounts, BookingFilters } from './api';
import { supabase } from '../../lib/supabase';
import { Booking, BookingStatus } from '../../types';
import SkeletonLoader from '../../components/SkeletonLoader';
import { format, parseISO, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendBookingCancellation } from '../../lib/notifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SatisfactionRating } from '../../components/SatisfactionRating';

import NotificationToast from '../../components/NotificationToast';
import { getGuestBookings } from '../../lib/guestBookings';

const ClientBookingsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusCounts, setStatusCounts] = useState<any>({});
  const [bookingFilter, setBookingFilter] = useState<BookingStatus | 'all'>('pending');
  const [bookingSortBy] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);
  const [guestBookingsLoading, setGuestBookingsLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const navigate = useNavigate();

  // Function to generate ICS file for calendar
  const handleAddToCalendar = (booking: Booking) => {
    if (!booking.deal || !booking.deal.business) {
      alert("Impossible d'ajouter au calendrier: informations manquantes.");
      return;
    }

    const startDate = parseISO(booking.booking_date);
    const endDate = addMinutes(startDate, booking.deal.duration_minutes || 60); // Default to 60 min if duration is missing

    // Format dates to UTC for ICS (YYYYMMDDTHHMMSSZ)
    const dtStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'"); // Current time in UTC
    const dtStart = format(startDate, "yyyyMMdd'T'HHmmss'Z'");
    const dtEnd = format(endDate, "yyyyMMdd'T'HHmmss'Z'");

    const summary = booking.deal.title;
    const description = `Service: ${booking.deal.title}\\nSalon: ${booking.deal.business.name}\\nAdresse: ${booking.deal.business.address}`;
    const location = `${booking.deal.business.address}, ${booking.deal.business.city}`;

    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Dealio//NONSGML v1.0//EN\nBEGIN:VEVENT\nUID:${booking.id}\nDTSTAMP:${dtStamp}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSUMMARY:${summary}\nDESCRIPTION:${description}\nLOCATION:${location}\nEND:VEVENT\nEND:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `dealio_booking_${booking.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadInitialData();
    } else if (!authLoading && !user) {
      fetchGuestBookings();
    }
  }, [authLoading, user]);

  // Separate effect for filter changes to reset pagination
  useEffect(() => {
    if (user && !authLoading) {
      setCurrentPage(0);
      fetchBookings(true); // Reset to first page
    }
  }, [bookingFilter, bookingSortBy]);

  const loadInitialData = async () => {
    if (!user) return;

    try {
      setInitialLoading(true);

      // Load status counts and bookings in parallel
      const [countsData] = await Promise.all([
        getBookingStatusCounts(supabase, user.id),
        fetchBookings(true) // Reset pagination
      ]);

      setStatusCounts(countsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setInitialLoading(false);
    }
  };
  const fetchGuestBookings = async () => {
    try {
      setInitialLoading(true);
      setGuestBookingsLoading(true);
      const guestBookingRefs = getGuestBookings();

      if (guestBookingRefs.length === 0) {
        setGuestBookings([]);
        return;
      }

      const bookingPromises = guestBookingRefs.map(async (ref) => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              *,
              deal:deals(
                id,
                title,
                image_url,
                original_price,
                duration_minutes,
                business:businesses(
                  id,
                  name,
                  phone,
                  address,
                  city
                )
              ),
              time_slot:time_slots(
                date,
                start_time,
                end_time
              )
            `)
            .eq('booking_token', ref.booking_token)
            .maybeSingle();

          if (error) throw error;
          return data;
        } catch (error) {
          console.error(`Error fetching guest booking ${ref.booking_token}:`, error);
          return null;
        }
      });

      const bookingsData = await Promise.all(bookingPromises);
      const validBookings = bookingsData.filter(b => b !== null) as Booking[];
      setGuestBookings(validBookings);
    } catch (error) {
      console.error('Error fetching guest bookings:', error);
    } finally {
      setGuestBookingsLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchBookings = async (reset = false) => {
    if (!user) return;

    const page = reset ? 0 : currentPage;

    try {
      if (reset) {
        setCurrentPage(0);
      } else {
        setLoadingMore(true);
      }

      const filters: BookingFilters = {
        status: bookingFilter,
        limit: ITEMS_PER_PAGE,
        offset: page * ITEMS_PER_PAGE,
        sortBy: bookingSortBy
      };

      const result = await fetchUserBookings(supabase, user.id, filters);

      if (reset) {
        setBookings(result.bookings);
      } else {
        setBookings(prev => [...prev, ...result.bookings]);
        setCurrentPage(page + 1);
      }

      if (bookingFilter !== 'all') {
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setToastMessage('Erreur lors du chargement des réservations');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreBookings = () => {
    if (!loadingMore && hasMore) {
      fetchBookings(false);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (!user || !bookingToCancel || !bookingToCancel.deal || !bookingToCancel.deal.business) return;

    try {
      const { error: updateError } = await (supabase
        .from('bookings') as any)
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', bookingToCancel.id);

      if (updateError) throw updateError;

      if (bookingToCancel.time_slot_id) {
        const { data: timeSlot, error: slotError } = await supabase
          .from('time_slots')
          .select('available_spots')
          .eq('id', bookingToCancel.time_slot_id)
          .single();

        if (!slotError && timeSlot) {
          await (supabase
            .from('time_slots') as any)
            .update({
              available_spots: ((timeSlot as any).available_spots || 0) + 1,
              is_available: true
            } as any)
            .eq('id', bookingToCancel.time_slot_id);
        }
      }

      await sendBookingCancellation(
        user.id,
        bookingToCancel,
        bookingToCancel.deal,
        bookingToCancel.deal.business
      );

      setShowCancelDialog(false);
      setBookingToCancel(null);
      setBookingFilter('cancelled'); // Switch to cancelled tab first
      await fetchBookings(true);
      setToastMessage('Réservation annulée avec succès!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setToastMessage('Erreur lors de l\'annulation. Veuillez réessayer.');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'confirmed': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (authLoading || (initialLoading && user)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="safe-area-top" />
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground">Mes Reservations</h1>
                <p className="text-xs text-muted-foreground">Gerez vos rendez-vous</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(4)].map((_, index) => (
            <SkeletonLoader key={index} type="booking-item" />
          ))}
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
          <div className="safe-area-top" />
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-9 w-9 rounded-full flex-shrink-0 hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-foreground tracking-tight">Mes Reservations</h1>
                <p className="text-xs text-muted-foreground">
                  {guestBookings.length > 0 ? `${guestBookings.length} reservation${guestBookings.length > 1 ? 's' : ''}` : 'Vos reservations'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6 max-w-2xl mx-auto">
          {guestBookingsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <SkeletonLoader key={index} type="booking-item" />
              ))}
            </div>
          ) : guestBookings.length === 0 ? (
            <Card className="border-none shadow-2xl bg-gradient-to-br from-card to-muted/30 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-12 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Calendar className="h-14 w-14 text-primary" />
                </div>
                <h3 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
                  Aucune réservation
                </h3>
                <p className="text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed text-lg">
                  Vous pouvez réserver sans compte ! Explorez nos offres beauté et réservez votre premier service dès maintenant.
                </p>
                <div className="space-y-4 max-w-xs mx-auto">
                  <Button onClick={() => navigate('/')} className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all bg-primary text-primary-foreground">
                    Explorer les offres
                  </Button>
                  <Button onClick={() => navigate('/login')} variant="outline" className="w-full rounded-2xl h-14 text-lg font-semibold border-2">
                    Se connecter
                  </Button>
                </div>
                <div className="mt-12 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                  <p className="text-sm text-primary font-medium">
                    <span className="opacity-70">Astuce:</span> Après une réservation, vos rendez-vous apparaîtront ici automatiquement.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {guestBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group bg-card border border-border/40">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <Badge
                        className={`rounded-full px-5 py-2 text-xs font-bold shadow-xl backdrop-blur-md border border-white/20 ${booking.status === 'completed' ? 'bg-green-500/90 text-white' :
                          booking.status === 'confirmed' ? 'bg-blue-500/90 text-white' :
                            booking.status === 'pending' ? 'bg-amber-500/90 text-white' :
                              'bg-red-500/90 text-white'
                          }`}
                      >
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>
                    <img
                      src={booking.deal?.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={booking.deal?.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                  </div>

                  <CardContent className="p-6 relative">
                    <div className="mb-5">
                      <h4 className="font-extrabold text-foreground text-xl mb-1.5 tracking-tight group-hover:text-primary transition-colors">{booking.deal?.title}</h4>
                      <div className="flex items-center gap-2 text-muted-foreground/80">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{booking.deal?.business?.name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-3 p-4 rounded-3xl bg-secondary/30 border border-white/10">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">
                            {booking.time_slot?.date
                              ? format(parseISO(booking.time_slot.date), 'dd MMM', { locale: fr })
                              : format(parseISO(booking.booking_date), 'dd MMM', { locale: fr })
                            }
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-3xl bg-secondary/30 border border-white/10">
                        <Clock className="h-5 w-5 text-primary" />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm">
                            {booking.time_slot?.start_time
                              ? booking.time_slot.start_time.slice(0, 5)
                              : '--:--'
                            }
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Heure</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-border/40">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black text-primary tracking-tighter">{booking.total_price} DH</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Payé</p>
                      </div>

                      <Button
                        onClick={() => booking.booking_token && navigate(`/booking/${booking.booking_token}`)}
                        className="rounded-2xl px-6 h-12 font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-105 transition-all"
                      >
                        Détails
                        <ChevronRight className="h-5 w-5 ml-1.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20 shadow-md rounded-3xl mt-6">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 dark:bg-blue-400/10 rounded-full p-3 flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-2">
                        Reservations sans compte
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-200/90 mb-4 leading-relaxed">
                        Vos reservations sont stockees localement. Connectez-vous pour y acceder depuis tous vos appareils.
                      </p>
                      <Button
                        onClick={() => navigate('/login')}
                        size="sm"
                        className="w-full rounded-full h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      >
                        Se connecter maintenant
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="safe-area-top" />
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-9 w-9 rounded-full flex-shrink-0 hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground tracking-tight">Mes Reservations</h1>
              <p className="text-xs text-muted-foreground">
                {statusCounts.all > 0 ? `${statusCounts.all} reservation${statusCounts.all > 1 ? 's' : ''}` : 'Gerez vos rendez-vous'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
            {[
              { key: 'all', label: 'Toutes', count: statusCounts.all },
              { key: 'pending', label: 'En attente', count: statusCounts.pending },
              { key: 'confirmed', label: 'Confirmees', count: statusCounts.confirmed },
              { key: 'completed', label: 'Terminees', count: statusCounts.completed },
              { key: 'cancelled', label: 'Annulees', count: statusCounts.cancelled }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={bookingFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setBookingFilter(filter.key as any)}
                className={`rounded-full px-4 h-9 text-xs font-medium flex-shrink-0 transition-all ${bookingFilter === filter.key ? 'shadow-md' : ''
                  }`}
              >
                {filter.label} {filter.count > 0 && `(${filter.count})`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-2xl mx-auto">
        {bookings.length === 0 ? (
          <Card className="border-none shadow-2xl bg-gradient-to-br from-card to-muted/30 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-12 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-500">
                <Calendar className="h-14 w-14 text-primary" />
              </div>
              <h3 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
                Aucune réservation
              </h3>
              <p className="text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed text-lg">
                Vous n'avez pas encore de réservations. Découvrez nos offres beauté et réservez votre premier service !
              </p>
              <Button onClick={() => navigate('/')} className="w-full max-w-xs rounded-2xl h-14 text-lg font-bold shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all bg-primary text-primary-foreground">
                Explorer les offres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group bg-card border border-border/40">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Badge
                      className={`rounded-full px-5 py-2 text-xs font-bold shadow-xl backdrop-blur-md border border-white/20 ${booking.status === 'completed' ? 'bg-green-500/90 text-white' :
                        booking.status === 'confirmed' ? 'bg-blue-500/90 text-white' :
                          booking.status === 'pending' ? 'bg-amber-500/90 text-white' :
                            'bg-red-500/90 text-white'
                        }`}
                    >
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <Button
                      onClick={() => handleCancelBooking(booking)}
                      variant="secondary"
                      size="icon"
                      className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/90 hover:bg-white hover:text-destructive shadow-xl backdrop-blur-md transition-all duration-300 scale-90 group-hover:scale-100"
                      title="Annuler"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                  <img
                    src={booking.deal?.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={booking.deal?.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                </div>

                <CardContent className="p-6 relative">
                  <div className="mb-5">
                    <h4 className="font-extrabold text-foreground text-xl mb-1.5 tracking-tight group-hover:text-primary transition-colors">{booking.deal?.title}</h4>
                    <div className="flex items-center gap-2 text-muted-foreground/80">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{booking.deal?.business?.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-3xl bg-secondary/30 border border-white/10">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">
                          {booking.time_slot?.date
                            ? format(parseISO(booking.time_slot.date), 'dd MMM', { locale: fr })
                            : format(parseISO(booking.booking_date), 'dd MMM', { locale: fr })
                          }
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-3xl bg-secondary/30 border border-white/10">
                      <Clock className="h-5 w-5 text-primary" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-sm">
                          {booking.time_slot?.start_time
                            ? booking.time_slot.start_time.slice(0, 5)
                            : '--:--'
                          }
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Heure</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pt-5 border-t border-border/40">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-black text-primary tracking-tighter">{booking.total_price} DH</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Payé</p>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && booking.deal?.business?.phone && (
                          <Button
                            onClick={() => window.open(`tel:${booking.deal?.business?.phone}`)}
                            variant="outline"
                            className="rounded-2xl w-12 h-12 p-0 shadow-lg border-2"
                            title="Appeler"
                          >
                            <Phone className="h-5 w-5" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleAddToCalendar(booking)}
                          variant="outline"
                          className="rounded-2xl w-12 h-12 p-0 shadow-lg border-2"
                          title="Ajouter au calendrier"
                        >
                          <Calendar className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {booking.status === 'confirmed' && !booking.has_feedback && (
                      <div className="pt-2">
                        <SatisfactionRating
                          bookingId={booking.id}
                          dealId={booking.deal_id}
                          businessId={booking.deal?.business?.id || ''}
                          userId={user?.id}
                          onRated={() => fetchBookings(true)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <Button
                  onClick={loadMoreBookings}
                  variant="outline"
                  disabled={loadingMore}
                  className="w-full rounded-full h-12 font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                      Chargement...
                    </>
                  ) : (
                    `Charger plus de reservations`
                  )}
                </Button>
              </div>
            )}

            {loadingMore && (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <SkeletonLoader key={`loading-more-${index}`} type="booking-item" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-[90vw] w-full sm:max-w-md mx-auto p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-destructive text-center text-wrap break-words">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Annuler la réservation
            </DialogTitle>
            <DialogDescription className="text-center text-wrap break-words px-2">
              Êtes-vous sûr de vouloir annuler cette réservation ?
            </DialogDescription>
          </DialogHeader>

          {bookingToCancel && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex-shrink-0">Service:</span>
                      <span className="font-medium text-right break-words ml-2">{bookingToCancel.deal?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex-shrink-0">Salon:</span>
                      <span className="font-medium text-right break-words ml-2">{bookingToCancel.deal?.business?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex-shrink-0">Date:</span>
                      <span className="font-medium text-right break-words ml-2">
                        {bookingToCancel.time_slot?.date && bookingToCancel.time_slot?.start_time
                          ? format(parseISO(`${bookingToCancel.time_slot.date}T${bookingToCancel.time_slot.start_time}`), 'dd MMM yyyy à HH:mm', { locale: fr })
                          : format(parseISO(bookingToCancel.booking_date), 'dd MMM yyyy', { locale: fr })
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex-shrink-0">Prix:</span>
                      <span className="font-medium text-right break-words ml-2">{bookingToCancel.total_price} DH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-destructive min-w-0 flex-1">
                    <p className="font-medium mb-1">Attention</p>
                    <p className="break-words">Des frais d'annulation peuvent s'appliquer selon la politique du salon.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                  className="flex-1 w-full"
                >
                  Garder la réservation
                </Button>
                <Button
                  onClick={confirmCancelBooking}
                  variant="destructive"
                  className="flex-1 w-full"
                >
                  Confirmer l'annulation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      <NotificationToast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ClientBookingsPage;