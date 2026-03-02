/*
  # Fix Security Issues - Part 3: Bookings, QR Codes, Messaging RLS Optimization

  Optimize RLS policies for bookings, qr_codes, conversations, messages, and notifications tables
*/

-- ============================================================================
-- BOOKINGS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

DROP POLICY IF EXISTS "Business owners can view bookings for their deals" ON bookings;
CREATE POLICY "Business owners can view bookings for their deals"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Business owners can update bookings for their deals" ON bookings;
CREATE POLICY "Business owners can update bookings for their deals"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can cancel own bookings" ON bookings;
CREATE POLICY "Clients can cancel own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()) AND status IN ('pending', 'confirmed'))
  WITH CHECK (user_id = (select auth.uid()) AND status = 'cancelled');

DROP POLICY IF EXISTS "Businesses can view their bookings" ON bookings;
CREATE POLICY "Businesses can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Businesses can update their bookings" ON bookings;
CREATE POLICY "Businesses can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Businesses can insert bookings" ON bookings;
CREATE POLICY "Businesses can insert bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers can view their bookings" ON bookings;
CREATE POLICY "Customers can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

-- ============================================================================
-- QR CODES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own booking QR codes" ON qr_codes;
CREATE POLICY "Users can view own booking QR codes"
  ON qr_codes FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = qr_codes.booking_id
      AND (b.user_id = (select auth.uid()) OR (select auth.uid()) IS NULL)
    )
  );

DROP POLICY IF EXISTS "Business owners can view QR codes for their bookings" ON qr_codes;
CREATE POLICY "Business owners can view QR codes for their bookings"
  ON qr_codes FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings bk
      JOIN deals d ON d.id = bk.deal_id
      JOIN businesses b ON b.id = d.business_id
      WHERE bk.id = qr_codes.booking_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Clients can manage own conversations" ON conversations;
CREATE POLICY "Clients can manage own conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (client_user_id = (select auth.uid()))
  WITH CHECK (client_user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Business owners can manage conversations for their business" ON conversations;
CREATE POLICY "Business owners can manage conversations for their business"
  ON conversations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = conversations.business_id
      AND b.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = conversations.business_id
      AND b.owner_id = (select auth.uid())
    )
  );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read messages in their conversations" ON messages;
CREATE POLICY "Users can read messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.client_user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM businesses b
          WHERE b.id = c.business_id
          AND b.owner_id = (select auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.client_user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM businesses b
          WHERE b.id = c.business_id
          AND b.owner_id = (select auth.uid())
        )
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Business owners can send notifications to clients" ON notifications;
CREATE POLICY "Business owners can send notifications to clients"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = notifications.related_business_id
      AND b.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Business owners can read business notifications" ON notifications;
CREATE POLICY "Business owners can read business notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = notifications.related_business_id
      AND b.owner_id = (select auth.uid())
    )
  );