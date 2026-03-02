/*
  # Add Admin Read Access Policies

  This migration adds comprehensive read and manage access for administrators
  across all critical tables needed for the admin dashboard.

  ## Changes
  1. Add admin read policy for user_profiles
  2. Add admin manage policy for deals
  3. Add admin read policy for bookings
  4. Add admin read policy for favorites
  5. Add admin read policy for reviews

  ## Security
  - All policies check for admin role in user_profiles
  - Admins get full read access to manage the platform
*/

-- ============================================================================
-- USER PROFILES - Admin can read all profiles
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all user profiles" ON user_profiles;
CREATE POLICY "Admins can read all user profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = (select auth.uid())
      AND up.role = 'admin'
    )
  );

-- ============================================================================
-- DEALS - Admin can manage all deals
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all deals" ON deals;
CREATE POLICY "Admins can manage all deals"
  ON deals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- BOOKINGS - Admin can read all bookings
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
CREATE POLICY "Admins can read all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- FAVORITES - Admin can read all favorites
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all favorites" ON favorites;
CREATE POLICY "Admins can read all favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- REVIEWS - Admin can read all reviews
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all reviews" ON reviews;
CREATE POLICY "Admins can read all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- TIME SLOTS - Admin can read all time slots
-- ============================================================================

DROP POLICY IF EXISTS "Admins can read all time slots" ON time_slots;
CREATE POLICY "Admins can read all time slots"
  ON time_slots FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );
