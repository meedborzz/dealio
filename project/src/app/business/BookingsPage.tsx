import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { supabase } from '../../lib/supabase';
import { safeSingle, safeQuery } from '../../lib/supabaseSafe';
import { useToast } from '@/components/ui/toast';
import BusinessCalendarView, { CalendarBooking } from '../../components/BusinessCalendarView';
import CalendarBookingModal from '../../components/CalendarBookingModal';
import { startOfDay, endOfDay, addDays, subMonths } from 'date-fns';
import { sendBookingConfirmation, sendBookingCancellation } from '../../lib/notifications';

interface Deal {
  id: string;
  title: string;
  duration_minutes: number;
  discounted_price: number;
}

interface Business {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

const BookingsPage: React.FC = () => {
  const { businessId } = useBusinessContext();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subMonths(new Date(), 3)),
    end: endOfDay(addDays(new Date(), 90))
  });

  useEffect(() => {
    if (businessId) {
      fetchBusiness();
      fetchDeals();
      fetchBookings();
    }
  }, [businessId, dateRange]);

  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel(`business-calendar-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  const fetchBusiness = async () => {
    if (!businessId) return;
    const { data } = await safeSingle(
      supabase
        .from('businesses')
        .select('id, name, address, phone, email')
        .eq('id', businessId)
        .maybeSingle()
    );
    if (data) setBusiness(data);
  };

  const fetchDeals = async () => {
    if (!businessId) return;
    const { data } = await safeQuery(
      supabase
        .from('deals')
        .select('id, title, duration_minutes, discounted_price')
        .eq('business_id', businessId)
        .eq('is_active', true)
    );
    setDeals(data || []);
  };

  const fetchBookings = async () => {
    if (!businessId) return;

    try {
      setLoading(true);

      const dealIds = deals.map(d => d.id);
      if (dealIds.length === 0) {
        const { data: dealsData } = await safeQuery(
          supabase
            .from('deals')
            .select('id')
            .eq('business_id', businessId)
        );
        if (dealsData) {
          dealIds.push(...dealsData.map(d => d.id));
        }
      }

      if (dealIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await safeQuery(
        supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            deal_id,
            customer_name,
            customer_phone,
            customer_email,
            service_summary,
            start_at,
            end_at,
            status,
            staff_id,
            notes,
            total_price,
            created_at,
            deal:deals!bookings_deal_id_fkey(title)
          `)
          .in('deal_id', dealIds)
          .gte('start_at', dateRange.start.toISOString())
          .lte('start_at', dateRange.end.toISOString())
          .not('status', 'eq', 'cancelled')
          .order('start_at', { ascending: true })
      );

      if (error) {
        setBookings([]);
        return;
      }

      const mappedBookings: CalendarBooking[] = (data || []).map(booking => ({
        ...booking,
        service_summary: booking.service_summary || booking.deal?.title || 'Service',
        start_at: booking.start_at || new Date().toISOString(),
        end_at: booking.end_at || new Date().toISOString()
      }));

      setBookings(mappedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddBooking = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleBookingClick = (booking: CalendarBooking) => {
    setSelectedBooking(booking);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsModalOpen(true);
  };

  const handleSaveBooking = async (bookingData: any) => {
    try {
      const selectedDeal = deals.find(d => d.id === bookingData.deal_id);

      const insertData = {
        deal_id: bookingData.deal_id,
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
        customer_email: bookingData.customer_email || '',
        notes: bookingData.notes || '',
        start_at: bookingData.start_at,
        end_at: bookingData.end_at,
        booking_date: bookingData.booking_date,
        booking_time: new Date(bookingData.start_at).toTimeString().slice(0, 5),
        total_price: bookingData.total_price,
        status: 'confirmed',
        service_summary: selectedDeal?.title || 'Service',
        time_slot_id: null,
        user_id: null
      };

      const { error } = await supabase
        .from('bookings')
        .insert(insertData);

      if (error) throw error;

      await fetchBookings();

      showToast('Réservation créée avec succès', 'success');
    } catch (error) {
      console.error('Error saving booking:', error);
      showToast('Erreur lors de la création de la réservation', 'error');
      throw error;
    }
  };

  const getRlsErrorMessage = (error: any, fallback: string): string => {
    const code = error?.code || '';
    const msg = error?.message || '';
    if (code === '42501' || msg.includes('policy') || msg.includes('permission')) {
      return 'Problème de permission - vérifiez votre accès';
    }
    return fallback;
  };

  const handleConfirmBooking = async (bookingId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error confirming booking:', error);
      showToast(getRlsErrorMessage(error, 'Erreur lors de la confirmation'), 'error');
      throw error;
    }

    if (!data) {
      console.error('No booking updated - possible RLS issue');
      showToast('Impossible de confirmer la réservation - vérifiez vos permissions', 'error');
      throw new Error('No booking updated');
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.user_id) {
      const deal = deals.find(d => d.id === booking.deal_id);
      if (deal && business) {
        await sendBookingConfirmation(
          booking.user_id,
          {
            id: booking.id,
            customer_name: booking.customer_name,
            booking_date: booking.start_at
          },
          deal,
          business
        ).catch(() => {});
      }
    }

    await fetchBookings();
    showToast('Réservation confirmée', 'success');
  };

  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    const updateData: any = { status: 'cancelled' };
    if (reason) {
      updateData.notes = `Annulée: ${reason}`;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error cancelling booking:', error);
      showToast(getRlsErrorMessage(error, 'Erreur lors de l\'annulation'), 'error');
      throw error;
    }

    if (!data) {
      console.error('No booking updated - possible RLS issue');
      showToast('Impossible d\'annuler la réservation - vérifiez vos permissions', 'error');
      throw new Error('No booking updated');
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.user_id) {
      const deal = deals.find(d => d.id === booking.deal_id);
      if (deal && business) {
        await sendBookingCancellation(
          booking.user_id,
          {
            id: booking.id,
            customer_name: booking.customer_name,
            booking_date: booking.start_at
          },
          deal,
          business
        ).catch(() => {});
      }
    }

    await fetchBookings();
    showToast('Réservation annulée', 'info');
  };

  const handleCompleteBooking = async (bookingId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error completing booking:', error);
      showToast(getRlsErrorMessage(error, 'Erreur lors de la finalisation'), 'error');
      throw error;
    }

    if (!data) {
      console.error('No booking updated - possible RLS issue');
      showToast('Impossible de marquer comme terminée - vérifiez vos permissions', 'error');
      throw new Error('No booking updated');
    }

    await fetchBookings();
    showToast('Réservation marquée comme terminée', 'success');
  };

  return (
    <div className="h-full flex flex-col -m-3 sm:-m-6">
      <BusinessCalendarView
        bookings={bookings}
        onAddBooking={handleAddBooking}
        onBookingClick={handleBookingClick}
        loading={loading}
      />

      <CalendarBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        selectedDate={selectedDate || undefined}
        selectedTime={selectedTime || undefined}
        deals={deals}
        businessInfo={business ? {
          name: business.name,
          address: business.address,
          phone: business.phone,
          email: business.email
        } : undefined}
        onSave={handleSaveBooking}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
        onComplete={handleCompleteBooking}
      />
    </div>
  );
};

export default BookingsPage;
