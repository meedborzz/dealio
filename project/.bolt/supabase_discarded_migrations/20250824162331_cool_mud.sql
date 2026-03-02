/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `type` (text, notification type)
      - `channel` (text, delivery channel)
      - `title` (text, notification title)
      - `content` (text, notification content)
      - `data` (jsonb, additional data)
      - `sent_at` (timestamptz, when sent)
      - `is_read` (boolean, read status)
      - `related_booking_id` (uuid, optional booking reference)
      - `related_deal_id` (uuid, optional deal reference)
      - `related_business_id` (uuid, optional business reference)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications
    - Add policy for business owners to create notifications for their customers

  3. Indexes
    - Index on user_id for efficient queries
    - Index on sent_at for ordering
    - Index on is_read for filtering
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now() NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  related_deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  related_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);

-- RLS Policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

CREATE POLICY "Business owners can create notifications for their customers"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE owner_id = uid() 
      AND id = related_business_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN deals d ON d.id = b.deal_id
      JOIN businesses bus ON bus.id = d.business_id
      WHERE bus.owner_id = uid()
      AND b.id = related_booking_id
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();