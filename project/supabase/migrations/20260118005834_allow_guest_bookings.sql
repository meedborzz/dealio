/*
  # Allow Guest Bookings

  1. Changes
    - Adds RLS policy to allow anonymous/guest users to create bookings
    - Guests can create bookings with user_id set to NULL
    - Ensures guest bookings require customer_name, customer_phone, and customer_email

  2. Security
    - Only allows INSERT for anonymous users
    - Guest bookings must have NULL user_id
    - Maintains existing authenticated user policies
    - Validates required guest information fields

  3. Notes
    - This enables the "Continue as Guest" booking flow
    - Guest bookings are tracked via customer contact information
    - Business owners can still view and manage all bookings for their deals
*/

-- Allow anonymous users to create guest bookings
DROP POLICY IF EXISTS "Guests can create bookings" ON bookings;
CREATE POLICY "Guests can create bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND customer_name IS NOT NULL
    AND customer_phone IS NOT NULL
    AND customer_email IS NOT NULL
  );

-- Also need to allow anon users to read time slots to check availability
DROP POLICY IF EXISTS "Anyone can view available time slots" ON time_slots;
CREATE POLICY "Anyone can view available time slots"
  ON time_slots FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- Allow anon users to view deals to get deal information
DROP POLICY IF EXISTS "Anyone can view active deals" ON deals;
CREATE POLICY "Anyone can view active deals"
  ON deals FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
