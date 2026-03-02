/*
  # Fix QR codes RLS policy for business owners

  1. Security Updates
    - Add INSERT policy for business owners to create QR codes
    - Allow business owners to create QR codes for bookings from their deals
    - Ensure proper access control for QR code creation

  2. Policy Details
    - Business owners can INSERT QR codes for their own bookings
    - Clients can SELECT their own booking QR codes
    - Proper JOIN verification through bookings -> deals -> businesses
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Business owners can view QR codes for their bookings" ON qr_codes;
DROP POLICY IF EXISTS "Users can view own booking QR codes" ON qr_codes;

-- Allow business owners to INSERT QR codes for bookings from their deals
CREATE POLICY "Business owners can create QR codes for their bookings"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM bookings b
      JOIN deals d ON b.deal_id = d.id
      JOIN businesses bus ON d.business_id = bus.id
      WHERE b.id = qr_codes.booking_id 
        AND bus.owner_id = auth.uid()
    )
  );

-- Allow business owners to UPDATE QR codes for bookings from their deals
CREATE POLICY "Business owners can update QR codes for their bookings"
  ON qr_codes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      JOIN deals d ON b.deal_id = d.id
      JOIN businesses bus ON d.business_id = bus.id
      WHERE b.id = qr_codes.booking_id 
        AND bus.owner_id = auth.uid()
    )
  );

-- Allow business owners to SELECT QR codes for bookings from their deals
CREATE POLICY "Business owners can view QR codes for their bookings"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      JOIN deals d ON b.deal_id = d.id
      JOIN businesses bus ON d.business_id = bus.id
      WHERE b.id = qr_codes.booking_id 
        AND bus.owner_id = auth.uid()
    )
  );

-- Allow clients to SELECT their own booking QR codes
CREATE POLICY "Users can view own booking QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings
      WHERE bookings.id = qr_codes.booking_id 
        AND bookings.user_id = auth.uid()
    )
  );