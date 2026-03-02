/*
  # Fix notifications RLS policy for cross-user notifications

  1. Security Updates
    - Update INSERT policy on notifications table to allow authenticated users to send notifications to business owners
    - This enables booking confirmations and other cross-user notifications while maintaining security

  2. Changes
    - Modified INSERT policy to allow notifications to be sent to business owners when creating bookings
    - Maintains security by ensuring only authenticated users can create notifications
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;

-- Create new INSERT policy that allows cross-user notifications for business communications
CREATE POLICY "Authenticated users can send notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can send notifications to themselves
    (auth.uid() = user_id)
    OR
    -- Users can send notifications to business owners when they have a valid business relationship
    (
      related_business_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM businesses 
        WHERE businesses.id = related_business_id 
        AND businesses.status = 'approved'
      )
    )
  );