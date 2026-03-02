/*
  # Fix QR codes RLS policies and client access

  1. Security Updates
    - Add proper RLS policies for qr_codes table
    - Allow business owners to create/update QR codes for their bookings
    - Allow clients to view their own booking QR codes
    
  2. Policy Details
    - Business owners can manage QR codes for bookings from their deals
    - Clients can view QR codes for their own bookings
    - Proper join conditions to verify ownership
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Business owners can create QR codes for their bookings" ON qr_codes;
DROP POLICY IF EXISTS "Business owners can update QR codes for their bookings" ON qr_codes;
DROP POLICY IF EXISTS "Business owners can view QR codes for their bookings" ON qr_codes;
DROP POLICY IF EXISTS "Users can view own booking QR codes" ON qr_codes;

-- Allow business owners to create QR codes for bookings from their deals
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

-- Allow business owners to update QR codes for bookings from their deals
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

-- Allow business owners to view QR codes for bookings from their deals
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

-- Allow clients to view QR codes for their own bookings
CREATE POLICY "Clients can view own booking QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.id = qr_codes.booking_id
        AND b.user_id = auth.uid()
    )
  );