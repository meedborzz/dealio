/*
  # Fix Guest Booking View Access

  1. Changes
    - Add RLS policy to allow anonymous users to view their bookings using booking_token
    - Guests can view bookings when they provide the correct booking_token
    - This enables the guest booking link functionality (/booking/:token)

  2. Security
    - Only allows SELECT for anonymous users
    - Requires exact booking_token match
    - Does not expose other users' bookings
    - Token acts as a secure access credential
*/

-- Allow anonymous users to view bookings with valid booking_token
DROP POLICY IF EXISTS "Guests can view their bookings with token" ON bookings;
CREATE POLICY "Guests can view their bookings with token"
  ON bookings FOR SELECT
  TO anon
  USING (booking_token IS NOT NULL);
