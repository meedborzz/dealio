import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { supabase } from '../../lib/supabase';
import { CalendarBooking } from '../../components/BusinessCalendarView';
import BookingAnalytics from '../../components/BookingAnalytics';
import { subMonths } from 'date-fns';

const BookingStatsPage: React.FC = () => {
  const { businessId } = useBusinessContext();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      fetchBookings();
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel(`business-stats-${businessId}`)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto -m-3 sm:-m-6">
      <BookingAnalytics bookings={bookings} />
    </div>
  );
};

export default BookingStatsPage;
