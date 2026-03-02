/*
  # Fix Guest Booking RLS Security

  1. Changes
    - Update RLS policy to be more secure
    - Anonymous users can only view guest bookings (where user_id IS NULL)
    - This prevents potential exposure of authenticated user bookings

  2. Security
    - Only allows SELECT for anonymous users
    - Restricts to bookings where user_id IS NULL (guest bookings only)
    - Frontend query with booking_token provides the specific record filtering
*/

-- Update policy to be more restrictive
DROP POLICY IF EXISTS "Guests can view their bookings with token" ON bookings;
CREATE POLICY "Guests can view their bookings with token"
  ON bookings FOR SELECT
  TO anon
  USING (user_id IS NULL AND booking_token IS NOT NULL);
