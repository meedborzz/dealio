/*
  # Create missing tables for user interactions and messaging

  1. New Tables
    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `deal_id` (uuid, foreign key to deals)
      - `interaction_type` (text)
      - `created_at` (timestamp)
    - `conversations`
      - `id` (uuid, primary key)
      - `client_user_id` (uuid, foreign key to user_profiles)
      - `business_id` (uuid, foreign key to businesses)
      - `last_message_at` (timestamp)
      - `client_unread_count` (integer)
      - `business_unread_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `sender_id` (uuid, foreign key to user_profiles)
      - `content` (text)
      - `sent_at` (timestamp)
      - `is_read_by_recipient` (boolean)
    - `user_device_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `device_token` (text)
      - `platform` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `type` (text)
      - `channel` (text)
      - `title` (text)
      - `content` (text)
      - `data` (jsonb)
      - `sent_at` (timestamp)
      - `is_read` (boolean)
      - `related_booking_id` (uuid, nullable)
      - `related_deal_id` (uuid, nullable)
      - `related_business_id` (uuid, nullable)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create user_interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'book', 'share')),
  created_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  client_unread_count integer DEFAULT 0,
  business_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_user_id, business_id)
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

-- Create user_device_tokens table
CREATE TABLE IF NOT EXISTS user_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  platform text DEFAULT 'web',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_token)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
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

-- Enable RLS on all tables
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interactions
CREATE POLICY "Users can manage own interactions"
  ON user_interactions
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- RLS Policies for conversations
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (client_user_id = uid());

CREATE POLICY "Business owners can read conversations for their businesses"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (client_user_id = uid());

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (client_user_id = uid())
  WITH CHECK (client_user_id = uid());

CREATE POLICY "Business owners can update conversations for their businesses"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can read messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_user_id = uid() OR 
           EXISTS (
             SELECT 1 FROM businesses 
             WHERE businesses.id = conversations.business_id 
             AND businesses.owner_id = uid()
           ))
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_user_id = uid() OR 
           EXISTS (
             SELECT 1 FROM businesses 
             WHERE businesses.id = conversations.business_id 
             AND businesses.owner_id = uid()
           ))
    )
  );

CREATE POLICY "Users can update messages they sent"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = uid())
  WITH CHECK (sender_id = uid());

-- RLS Policies for user_device_tokens
CREATE POLICY "Users can manage own device tokens"
  ON user_device_tokens
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());

-- RLS Policies for notifications
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

CREATE POLICY "System can manage all notifications"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_deal_id ON user_interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON conversations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);

CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_id ON user_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_active ON user_device_tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);

-- Create trigger function for updating conversations.updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Create trigger function for updating last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.sent_at,
      business_unread_count = CASE 
        WHEN NEW.sender_id = (SELECT client_user_id FROM conversations WHERE id = NEW.conversation_id) 
        THEN business_unread_count + 1 
        ELSE business_unread_count 
      END,
      client_unread_count = CASE 
        WHEN NEW.sender_id != (SELECT client_user_id FROM conversations WHERE id = NEW.conversation_id) 
        THEN client_unread_count + 1 
        ELSE client_unread_count 
      END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for messages
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();