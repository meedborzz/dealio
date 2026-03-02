/*
  # Fix Security Issues - Part 2: RLS Policy Optimization

  Replace auth.uid() with (select auth.uid()) in all RLS policies
  This prevents re-evaluation on each row for better performance at scale
*/

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- BUSINESSES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Business owners can manage own business" ON businesses;
CREATE POLICY "Business owners can manage own business"
  ON businesses FOR ALL
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all businesses" ON businesses;
CREATE POLICY "Admins can manage all businesses"
  ON businesses FOR ALL
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
-- DEALS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Business owners can manage own deals" ON deals;
CREATE POLICY "Business owners can manage own deals"
  ON deals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = deals.business_id
      AND b.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = deals.business_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TIME SLOTS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Business owners can manage own time slots" ON time_slots;
CREATE POLICY "Business owners can manage own time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = time_slots.deal_id
      AND b.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = time_slots.deal_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- FAVORITES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "business_owners_can_reply_to_reviews" ON reviews;
CREATE POLICY "business_owners_can_reply_to_reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = reviews.business_id
      AND b.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = reviews.business_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- COMMISSION LOGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Business owners can view own commission logs" ON commission_logs;
CREATE POLICY "Business owners can view own commission logs"
  ON commission_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = commission_logs.business_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all commission logs" ON commission_logs;
CREATE POLICY "Admins can view all commission logs"
  ON commission_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = (select auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- USER INTERACTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own interactions" ON user_interactions;
CREATE POLICY "Users can manage own interactions"
  ON user_interactions FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- PUSH SUBSCRIPTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- WALLET TRANSACTIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- SAVED SEARCHES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own saved searches" ON saved_searches;
CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- NOTIFICATION PREFERENCES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own notification preferences" ON notification_preferences;
CREATE POLICY "Users can read own notification preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));