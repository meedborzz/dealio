/*
  # Create waiting_lists table

  1. New Tables
    - `waiting_lists`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, foreign key to deals)
      - `time_slot_id` (uuid, foreign key to time_slots)
      - `user_id` (uuid, foreign key to auth.users)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_email` (text)
      - `status` (text, check constraint)
      - `priority` (integer, default 1)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)

  2. Security
    - Enable RLS on `waiting_lists` table
    - Add policies for users to manage their own waiting list entries
    - Add policies for business owners to view waiting lists for their deals

  3. Indexes
    - Add indexes for performance on commonly queried columns
*/

CREATE TABLE IF NOT EXISTS waiting_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  time_slot_id uuid REFERENCES public.time_slots(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'cancelled')),
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waiting_lists_deal_id ON waiting_lists(deal_id);
CREATE INDEX IF NOT EXISTS idx_waiting_lists_time_slot_id ON waiting_lists(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_waiting_lists_user_id ON waiting_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_waiting_lists_status ON waiting_lists(status);
CREATE INDEX IF NOT EXISTS idx_waiting_lists_expires_at ON waiting_lists(expires_at);
CREATE INDEX IF NOT EXISTS idx_waiting_lists_priority ON waiting_lists(priority DESC);

-- Enable Row Level Security
ALTER TABLE waiting_lists ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own waiting list entries
CREATE POLICY "Users can create own waiting list entries"
  ON waiting_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own waiting list entries
CREATE POLICY "Users can view own waiting list entries"
  ON waiting_lists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to update their own waiting list entries
CREATE POLICY "Users can update own waiting list entries"
  ON waiting_lists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own waiting list entries
CREATE POLICY "Users can delete own waiting list entries"
  ON waiting_lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for business owners to view waiting lists for their deals
CREATE POLICY "Business owners can view waiting lists for their deals"
  ON waiting_lists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      JOIN businesses ON deals.business_id = businesses.id
      WHERE deals.id = waiting_lists.deal_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Function to notify users when a slot becomes available
CREATE OR REPLACE FUNCTION notify_waiting_list_slot_available()
RETURNS TRIGGER AS $$
BEGIN
  -- When a time slot gets more available spots, notify waiting list users
  IF NEW.available_spots > OLD.available_spots THEN
    -- Update the first waiting entry to 'notified'
    UPDATE waiting_lists 
    SET status = 'notified', expires_at = now() + interval '30 minutes'
    WHERE time_slot_id = NEW.id 
    AND status = 'waiting'
    ORDER BY priority DESC, created_at ASC
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for slot availability notifications
CREATE TRIGGER trigger_notify_waiting_list_slot_available
  AFTER UPDATE OF available_spots ON time_slots
  FOR EACH ROW
  EXECUTE FUNCTION notify_waiting_list_slot_available();