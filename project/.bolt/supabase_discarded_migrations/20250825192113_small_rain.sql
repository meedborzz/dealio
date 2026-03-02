/*
  # Create conversations and messages tables for in-app messaging

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `client_user_id` (uuid, references user_profiles)
      - `business_id` (uuid, references businesses)
      - `last_message_at` (timestamp)
      - `client_unread_count` (integer)
      - `business_unread_count` (integer)
      - `created_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references user_profiles)
      - `content` (text)
      - `is_read_by_recipient` (boolean)
      - `sent_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for clients and business owners to manage their conversations
    - Add policies for reading and sending messages

  3. Indexes
    - Add indexes for performance on frequently queried columns
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  client_unread_count integer DEFAULT 0,
  business_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_user_id, business_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read_by_recipient boolean DEFAULT false,
  sent_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Clients can manage own conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (client_user_id = auth.uid())
  WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Business owners can manage conversations for their business"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = conversations.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can read messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (
        conversations.client_user_id = auth.uid() 
        OR EXISTS (
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
        conversations.client_user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = conversations.business_id 
          AND businesses.owner_id = auth.uid()
        )
      )
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON conversations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);