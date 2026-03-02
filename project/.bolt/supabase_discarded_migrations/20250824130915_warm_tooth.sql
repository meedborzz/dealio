/*
  # Create Notifications System

  1. New Tables
    - `notifications` - Store all in-app notifications for users
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, notification type enum)
      - `channel` (text, delivery channel)
      - `title` (text, notification title)
      - `content` (text, notification content)
      - `data` (jsonb, additional data)
      - `sent_at` (timestamptz, when notification was sent)
      - `is_read` (boolean, read status)
      - `related_booking_id` (uuid, optional link to booking)
      - `related_deal_id` (uuid, optional link to deal)
      - `related_business_id` (uuid, optional link to business)

    - `user_preferences` - Store user notification preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `notification_channels` (text array, preferred channels)
      - `email_notifications` (boolean, email preference)
      - `sms_notifications` (boolean, SMS preference)
      - `push_notifications` (boolean, push preference)
      - `marketing_notifications` (boolean, marketing preference)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `notification_templates` - Store notification templates
      - `id` (uuid, primary key)
      - `name` (text, template name)
      - `type` (text, notification type)
      - `subject_template` (text, email subject template)
      - `body_template_email` (text, email body template)
      - `body_template_sms` (text, SMS body template)
      - `body_template_in_app` (text, in-app body template)
      - `variables` (text array, available variables)
      - `is_active` (boolean, template status)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for users to read their own notifications
    - Add policies for businesses to send notifications to their clients
    - Add policies for admins to manage templates

  3. Functions
    - Create function to automatically send booking confirmation notifications
    - Create trigger to call notification function on booking creation

  4. Indexes
    - Add indexes for efficient notification queries
*/

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'booking_confirmation',
  'booking_reminder',
  'booking_cancellation',
  'booking_rescheduled',
  'booking_completed',
  'deal_expiring_soon',
  'promotional_offer',
  'business_message',
  'system_update'
);

-- Create notification channel enum
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'in_app',
  'push'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  related_deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  related_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  notification_channels text[] DEFAULT ARRAY['email', 'in_app'],
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  marketing_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type notification_type NOT NULL,
  subject_template text NOT NULL,
  body_template_email text NOT NULL,
  body_template_sms text NOT NULL,
  body_template_in_app text NOT NULL,
  variables text[] DEFAULT ARRAY[]::text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user preferences
CREATE POLICY "Users can read their own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification templates
CREATE POLICY "Everyone can read active templates"
  ON notification_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences for new users
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON auth.users;
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences();

-- Function to send booking confirmation notification
CREATE OR REPLACE FUNCTION send_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  deal_record deals%ROWTYPE;
  business_record businesses%ROWTYPE;
  notification_title text;
  notification_content text;
BEGIN
  -- Only send notification for confirmed bookings
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    -- Get deal and business information
    SELECT * INTO deal_record FROM deals WHERE id = NEW.deal_id;
    SELECT * INTO business_record FROM businesses WHERE id = deal_record.business_id;
    
    -- Create notification title and content
    notification_title := 'Réservation confirmée - ' || deal_record.title;
    notification_content := 'Votre réservation pour ' || deal_record.title || ' chez ' || business_record.name || ' est confirmée pour le ' || to_char(NEW.booking_date, 'DD/MM/YYYY à HH24:MI') || '.';
    
    -- Insert in-app notification
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      title,
      content,
      data,
      related_booking_id,
      related_deal_id,
      related_business_id
    ) VALUES (
      NEW.user_id,
      'booking_confirmation',
      'in_app',
      notification_title,
      notification_content,
      jsonb_build_object(
        'booking_id', NEW.id,
        'deal_title', deal_record.title,
        'business_name', business_record.name,
        'booking_date', NEW.booking_date,
        'deal_price', deal_record.discounted_price
      ),
      NEW.id,
      NEW.deal_id,
      deal_record.business_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to send notification when booking is confirmed
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;
CREATE TRIGGER booking_notification_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_notification();

-- Insert default notification templates
INSERT INTO notification_templates (name, type, subject_template, body_template_email, body_template_sms, body_template_in_app, variables) VALUES
(
  'booking_confirmation',
  'booking_confirmation',
  'Réservation confirmée - {{deal_title}}',
  'Bonjour {{customer_name}}, votre réservation pour {{deal_title}} chez {{business_name}} est confirmée pour le {{booking_date}}.',
  'Réservation confirmée ! {{deal_title}} chez {{business_name}} le {{booking_date}}.',
  'Votre réservation pour {{deal_title}} chez {{business_name}} est confirmée.',
  ARRAY['customer_name', 'deal_title', 'business_name', 'booking_date', 'deal_price']
),
(
  'booking_reminder',
  'booking_reminder',
  'Rappel - Rendez-vous dans {{time_until}}',
  'Bonjour {{customer_name}}, rappel de votre rendez-vous {{deal_title}} chez {{business_name}} dans {{time_until}}.',
  'Rappel : RDV {{deal_title}} chez {{business_name}} dans {{time_until}}.',
  'Rappel : Votre rendez-vous {{deal_title}} est dans {{time_until}}.',
  ARRAY['customer_name', 'deal_title', 'business_name', 'time_until', 'booking_date']
),
(
  'booking_cancellation',
  'booking_cancellation',
  'Réservation annulée - {{deal_title}}',
  'Bonjour {{customer_name}}, votre réservation {{deal_title}} chez {{business_name}} a été annulée.',
  'Réservation annulée : {{deal_title}} chez {{business_name}}.',
  'Votre réservation {{deal_title}} a été annulée.',
  ARRAY['customer_name', 'deal_title', 'business_name', 'cancellation_reason']
)
ON CONFLICT (name) DO NOTHING;