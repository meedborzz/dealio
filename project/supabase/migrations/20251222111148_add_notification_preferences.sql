/*
  # Notification Preferences System
  
  1. New Table
    - `notification_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `booking_reminders` (boolean) - Enable/disable booking reminders
      - `deal_alerts` (boolean) - Enable/disable deal alerts
      - `business_messages` (boolean) - Enable/disable business messages
      - `promotional_offers` (boolean) - Enable/disable promotional offers
      - `push_enabled` (boolean) - Enable/disable push notifications
      - `email_enabled` (boolean) - Enable/disable email notifications
      - `sms_enabled` (boolean) - Enable/disable SMS notifications
      - `quiet_hours_start` (time) - Start of quiet hours
      - `quiet_hours_end` (time) - End of quiet hours
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `notification_preferences` table
    - Add policies for users to manage their own preferences
*/

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  booking_reminders boolean DEFAULT true,
  deal_alerts boolean DEFAULT true,
  business_messages boolean DEFAULT true,
  promotional_offers boolean DEFAULT false,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT false,
  sms_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT NULL,
  quiet_hours_end time DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own preferences
CREATE POLICY "Users can read own notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own preferences
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
  ON notification_preferences(user_id);
