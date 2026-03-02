import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '@/components/ui/toast';
import { CalendarBooking } from '../../components/BusinessCalendarView';
import BookingHistory from '../../components/BookingHistory';
import CalendarBookingModal from '../../components/CalendarBookingModal';
import { subMonths } from 'date-fns';
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

const BookingHistoryPage: React.FC = () => {
  const { businessId } = useBusinessContext();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBusiness();
      fetchDeals();
      fetchBookings();
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel(`business-history-${businessId}`)
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

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, address, phone, email')
        .eq('id', businessId)
        .maybeSingle();

      if (error) throw error;
      if (data) setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const fetchDeals = async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, duration_minutes, discounted_price')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const fetchBookings = async () => {
    if (!businessId) return;

    try {
      setLoading(true);

      const { data: dealsData } = await supabase
        .from('deals')
        .select('id')
        .eq('business_id', businessId);

      const dealIds = dealsData?.map(d => d.id) || [];

      if (dealIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
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
        .gte('start_at', subMonths(new Date(), 6).toISOString())
        .order('start_at', { ascending: false });

      if (error) throw error;

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

  const handleBookingClick = (booking: CalendarBooking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

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
          );
        }
      }

      await fetchBookings();
      showToast('Réservation confirmée', 'success');
    } catch (error) {
      console.error('Error confirming booking:', error);
      showToast('Erreur lors de la confirmation', 'error');
      throw error;
    }
  };

  const handleCancelBooking = async (bookingId: string, reason?: string) => {
    try {
      const updateData: any = { status: 'cancelled' };
      if (reason) {
        updateData.notes = `Annulée: ${reason}`;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

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
          );
        }
      }

      await fetchBookings();
      showToast('Réservation annulée', 'info');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Erreur lors de l\'annulation', 'error');
      throw error;
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
      showToast('Réservation marquée comme terminée', 'success');
    } catch (error) {
      console.error('Error completing booking:', error);
      showToast('Erreur lors de la finalisation', 'error');
      throw error;
    }
  };

  return (
    <div className="h-full -m-3 sm:-m-6">
      <BookingHistory
        bookings={bookings}
        onViewBooking={handleBookingClick}
        loading={loading}
      />

      <CalendarBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        deals={deals}
        businessInfo={business ? {
          name: business.name,
          address: business.address,
          phone: business.phone,
          email: business.email
        } : undefined}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
        onComplete={handleCompleteBooking}
      />
    </div>
  );
};

export default BookingHistoryPage;
