/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, notification type)
      - `channel` (text, delivery channel)
      - `title` (text, notification title)
      - `content` (text, notification content)
      - `data` (jsonb, additional data)
      - `sent_at` (timestamp)
      - `is_read` (boolean, default false)
      - `related_booking_id` (uuid, optional foreign key)
      - `related_deal_id` (uuid, optional foreign key)
      - `related_business_id` (uuid, optional foreign key)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications (mark as read)
    - Add policy for authenticated users to insert notifications

  3. Indexes
    - Index on user_id for fast user notification queries
    - Index on is_read for filtering unread notifications
    - Index on sent_at for chronological ordering
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  related_deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  related_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS Policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);