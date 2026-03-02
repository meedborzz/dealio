/*
  # Fix Security Issues - Part 1: Indexes and Basic RLS

  1. Missing Foreign Key Indexes
    - Add indexes for all unindexed foreign key columns to improve query performance

  2. Enable RLS on categories table

  3. Add RLS policies for booking_validations table
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- booking_validations indexes
CREATE INDEX IF NOT EXISTS idx_booking_validations_booking_id ON booking_validations(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_validations_business_id ON booking_validations(business_id);
CREATE INDEX IF NOT EXISTS idx_booking_validations_qr_code_id ON booking_validations(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_booking_validations_validated_by ON booking_validations(validated_by);

-- bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_qr_code_id ON bookings(qr_code_id);

-- commission_logs indexes
CREATE INDEX IF NOT EXISTS idx_commission_logs_booking_id ON commission_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_commission_logs_business_id ON commission_logs(business_id);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_related_booking_id ON notifications(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_business_id ON notifications(related_business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_deal_id ON notifications(related_deal_id);

-- qr_codes indexes
CREATE INDEX IF NOT EXISTS idx_qr_codes_booking_id ON qr_codes(booking_id);

-- wallet_transactions indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking_id ON wallet_transactions(booking_id);

-- ============================================================================
-- 2. ENABLE RLS ON CATEGORIES TABLE
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- ============================================================================
-- 3. ADD RLS POLICIES FOR BOOKING_VALIDATIONS
-- ============================================================================

-- Business owners can view validations for their bookings
DROP POLICY IF EXISTS "Business owners can view own validations" ON booking_validations;
CREATE POLICY "Business owners can view own validations"
  ON booking_validations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = booking_validations.business_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- Business owners can insert validations for their bookings
DROP POLICY IF EXISTS "Business owners can insert validations" ON booking_validations;
CREATE POLICY "Business owners can insert validations"
  ON booking_validations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = booking_validations.business_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- Admins can view all validations
DROP POLICY IF EXISTS "Admins can view all validations" ON booking_validations;
CREATE POLICY "Admins can view all validations"
  ON booking_validations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );