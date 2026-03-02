/*
  # Create conversations and messages tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `client_user_id` (uuid, references user_profiles)
      - `business_id` (uuid, references businesses)
      - `business_name` (text, for quick access)
      - `business_phone` (text, for quick access)
      - `last_message_at` (timestamp)
      - `client_unread_count` (integer)
      - `business_unread_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references user_profiles)
      - `content` (text)
      - `sent_at` (timestamp)
      - `is_read_by_recipient` (boolean)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own conversations and messages
    - Add policies for business owners to access conversations for their businesses
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  business_name text,
  business_phone text,
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

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (client_user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (client_user_id = auth.uid());

CREATE POLICY "Business owners can read conversations for their businesses"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update conversations for their businesses"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can read messages from own conversations"
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

CREATE POLICY "Users can create messages in own conversations"
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

CREATE POLICY "Users can update messages they sent"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON conversations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);

-- Create trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.sent_at,
    updated_at = now(),
    client_unread_count = CASE 
      WHEN NEW.sender_id != (SELECT client_user_id FROM conversations WHERE id = NEW.conversation_id)
      THEN client_unread_count + 1
      ELSE client_unread_count
    END,
    business_unread_count = CASE 
      WHEN NEW.sender_id = (SELECT client_user_id FROM conversations WHERE id = NEW.conversation_id)
      THEN business_unread_count + 1
      ELSE business_unread_count
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Create trigger to update conversations updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();