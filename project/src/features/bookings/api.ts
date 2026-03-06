import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { BookingStatus } from '../../types';

export interface BookingFilters {
  status?: BookingStatus | 'all';
  limit?: number;
  offset?: number;
  sortBy?: 'date_desc' | 'date_asc' | 'status' | 'price';
}

export async function fetchUserBookings(
  supabase: SupabaseClient<Database>,
  userId: string,
  filters: BookingFilters = {}
) {
  const {
    status = 'all',
    limit = 10,
    offset = 0,
    sortBy = 'date_desc'
  } = filters;

  // Build optimized query with database-level filtering
  let query = supabase
    .from('bookings')
    .select(`
      id,
      deal_id,
      time_slot_id,
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      status,
      notes,
      booking_date,
      total_price,

      created_at,
      updated_at,
      booking_token,
      guest_session_id,
      deal:deals!inner (
        id,
        title,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        business:businesses!inner (
          id,
          name,
          city,
          address,
          phone,
          email
        )
      ),
      time_slot:time_slots (
        id,
        date,
        start_time
      )
    `)
    .eq('user_id', userId);

  // Apply status filter at database level
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply sorting at database level
  switch (sortBy) {
    case 'date_asc':
      query = query.order('booking_date', { ascending: true });
      break;
    case 'status':
      query = query.order('status').order('booking_date', { ascending: false });
      break;
    case 'price':
      query = query.order('total_price', { ascending: false });
      break;
    default: // date_desc
      query = query.order('booking_date', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await (query as any);

  if (error) throw error;

  // Check if booking has reviews and feedback (optimized single query)
  const bookingIds = (data as any[])?.map(b => b.id) || [];
  let reviewsData: any[] = [];
  let feedbackData: any[] = [];

  if (bookingIds.length > 0) {
    const [reviewsResult, feedbackResult] = await Promise.all([
      (supabase.from('reviews') as any).select('booking_id').in('booking_id', bookingIds),
      (supabase.from('booking_feedback') as any).select('booking_id').in('booking_id', bookingIds)
    ]);

    reviewsData = reviewsResult.data || [];
    feedbackData = feedbackResult.data || [];
  }

  // Add has_review and has_feedback properties efficiently
  const bookingsWithReviewStatus = (data as any[] || []).map(booking => ({
    ...booking,
    has_review: reviewsData.some(review => review.booking_id === booking.id),
    has_feedback: feedbackData.some(feedback => feedback.booking_id === booking.id)
  }));

  return {
    bookings: bookingsWithReviewStatus,
    hasMore: data ? (data as any[]).length === limit : false,
    total: count || 0
  };
}

// Fast count query for status badges
export async function getBookingStatusCounts(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('status')
    .eq('user_id', userId);

  if (error) throw error;

  const counts = {
    all: data?.length || 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };

  (data as any[])?.forEach(booking => {
    if (booking.status in counts) {
      counts[booking.status as keyof typeof counts]++;
    }
  });

  return counts;
}