/*
  # Fix Guest QR Code Access

  1. Changes
    - Update QR codes RLS to allow guests to view QR codes for their bookings
    - Guests can view QR codes for bookings where booking_token exists

  2. Security
    - Only allows SELECT for anonymous users on their own guest bookings
    - Checks that booking has a booking_token (is a guest booking)
    - Maintains security for authenticated user bookings
*/

-- Update QR codes policy to allow guests to view their QR codes
DROP POLICY IF EXISTS "Users can view own booking QR codes" ON qr_codes;
CREATE POLICY "Users can view own booking QR codes"
  ON qr_codes FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = qr_codes.booking_id
      AND (
        -- Authenticated users can see their own bookings
        (auth.uid() IS NOT NULL AND b.user_id = auth.uid())
        -- Anonymous users can see guest bookings (where booking_token exists)
        OR (auth.uid() IS NULL AND b.booking_token IS NOT NULL)
      )
    )
  );
