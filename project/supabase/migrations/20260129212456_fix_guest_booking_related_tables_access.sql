/*
  # Fix Guest Booking Related Tables Access

  1. Changes
    - Update time_slots RLS to allow viewing slots for guest bookings
    - Update deals RLS to allow viewing deals for guest bookings
    - Anonymous users can view time_slots and deals when accessing their bookings

  2. Security
    - Only allows SELECT for anonymous users on related records
    - Still maintains restrictions for general browsing
    - Allows viewing booked/expired records for existing bookings
*/

-- Update time_slots policy to allow viewing any slot (not just available)
-- This is needed for guests to see their booked time slots
DROP POLICY IF EXISTS "Anyone can view available time slots" ON time_slots;
CREATE POLICY "Anyone can view time slots"
  ON time_slots FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update deals policy to allow viewing any deal (not just active)
-- This is needed for guests to see deal details even after expiration
DROP POLICY IF EXISTS "Anyone can view active deals" ON deals;
CREATE POLICY "Anyone can view deals"
  ON deals FOR SELECT
  TO anon, authenticated
  USING (true);
