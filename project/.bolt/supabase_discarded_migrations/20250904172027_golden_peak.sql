/*
  # Fix notifications RLS policy for business owners

  1. Security Updates
    - Update RLS policy to allow business owners to send notifications to clients
    - Use correct auth.uid() function instead of uid()
    - Allow notifications when related_business_id matches user's business

  2. Policy Changes
    - Drop existing policies that may conflict
    - Create comprehensive policy for notification management
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Create comprehensive notification policies
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow business owners to send notifications to clients
CREATE POLICY "Business owners can send notifications to clients"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if user owns the related business
    related_business_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = notifications.related_business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Allow business owners to read notifications related to their business
CREATE POLICY "Business owners can read business notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    related_business_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = notifications.related_business_id 
      AND businesses.owner_id = auth.uid()
    )
  );