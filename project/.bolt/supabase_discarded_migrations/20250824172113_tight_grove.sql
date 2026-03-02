/*
  # Create notifications system

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
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
    - `conversations`
      - `id` (uuid, primary key)
      - `client_user_id` (uuid, foreign key to user_profiles)
      - `business_id` (uuid, foreign key to businesses)
      - `last_message_at` (timestamptz)
      - `client_unread_count` (integer)
      - `business_unread_count` (integer)
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `sender_id` (uuid, foreign key to user_profiles)
      - `content` (text, message content)
      - `sent_at` (timestamptz)
      - `is_read_by_recipient` (boolean)
    - `user_device_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `device_token` (text, push notification token)
      - `platform` (text, device platform)
      - `is_active` (boolean)
    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `deal_id` (uuid, foreign key to deals)
      - `interaction_type` (text, type of interaction)

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control
    - Ensure proper data isolation
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  sent_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  related_deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  related_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  client_unread_count integer DEFAULT 0,
  business_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    client_user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()) OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()) OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update their own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    client_user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()) OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  is_read_by_recipient boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE client_user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()) OR
            business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT id FROM user_profiles WHERE id = auth.uid()) AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE client_user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()) OR
            business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- Create user device tokens table
CREATE TABLE IF NOT EXISTS user_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  platform text DEFAULT 'web',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device tokens"
  ON user_device_tokens
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- Create user interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions"
  ON user_interactions
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create their own interactions"
  ON user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON conversations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_id ON user_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_deal_id ON user_interactions(deal_id);