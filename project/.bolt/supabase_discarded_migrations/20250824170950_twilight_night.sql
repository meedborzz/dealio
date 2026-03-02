/*
  # Add In-App Messaging System

  1. New Tables
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

    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `deal_id` (uuid, foreign key to deals)
      - `interaction_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for secure access
*/

-- Conversations table
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

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  is_read_by_recipient boolean DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- User device tokens for push notifications
CREATE TABLE IF NOT EXISTS user_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  platform text NOT NULL DEFAULT 'web',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_token)
);

ALTER TABLE user_device_tokens ENABLE ROW LEVEL SECURITY;

-- User interactions for recommendations
CREATE TABLE IF NOT EXISTS user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'book', 'share')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    client_user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    client_user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = auth.uid()
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
      AND (
        conversations.client_user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = conversations.business_id 
          AND businesses.owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (
        conversations.client_user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = conversations.business_id 
          AND businesses.owner_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies for device tokens
CREATE POLICY "Users can manage own device tokens"
  ON user_device_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user interactions
CREATE POLICY "Users can manage own interactions"
  ON user_interactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON conversations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);

CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_id ON user_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_deal_id ON user_interactions(deal_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

-- Function to update conversation metadata when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_message_at and unread counts
  UPDATE conversations 
  SET 
    last_message_at = NEW.sent_at,
    client_unread_count = CASE 
      WHEN NEW.sender_id != client_user_id THEN client_unread_count + 1 
      ELSE client_unread_count 
    END,
    business_unread_count = CASE 
      WHEN NEW.sender_id = client_user_id THEN business_unread_count + 1 
      ELSE business_unread_count 
    END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();