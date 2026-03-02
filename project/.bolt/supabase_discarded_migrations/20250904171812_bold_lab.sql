/*
  # Fix notifications RLS policy for business owners

  1. Security Updates
    - Update INSERT policy on notifications table to allow business owners to send notifications
    - Allow business owners to insert notifications for their own businesses
    - Maintain existing user notification policies

  2. Changes
    - Drop existing INSERT policy for notifications
    - Create new INSERT policy that allows both users and business owners to insert notifications
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

-- Create a new INSERT policy that allows both users and business owners
CREATE POLICY "Users and business owners can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can insert notifications for themselves
    (uid() = user_id) 
    OR 
    -- Business owners can insert notifications when related_business_id is their business
    (
      related_business_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = related_business_id 
        AND businesses.owner_id = uid()
      )
    )
  );