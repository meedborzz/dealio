/*
  # Add Row Level Security policies

  1. Enable RLS on all tables
  2. Add policies for businesses
  3. Add policies for bookings
  4. Add policies for other tables
*/

-- Enable RLS on businesses table
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Business policies
CREATE POLICY IF NOT EXISTS "owner_read_own_business"
  ON public.businesses FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    EXISTS(
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "owner_write_own_business"
  ON public.businesses FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "owner_insert_business"
  ON public.businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Booking policies
CREATE POLICY IF NOT EXISTS "client_read_own_bookings"
  ON public.bookings FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS(
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = auth.uid() AND up.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "business_read_own_bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      JOIN public.businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "business_update_own_bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      JOIN public.businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "client_insert_bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Enable RLS on deals table
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Deal policies
CREATE POLICY IF NOT EXISTS "business_manage_own_deals"
  ON public.deals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = deals.business_id AND b.owner_id = auth.uid()
    )
  );

-- Enable RLS on time_slots table
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Time slot policies
CREATE POLICY IF NOT EXISTS "business_manage_own_time_slots"
  ON public.time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.deals d
      JOIN public.businesses b ON b.id = d.business_id
      WHERE d.id = time_slots.deal_id AND b.owner_id = auth.uid()
    )
  );