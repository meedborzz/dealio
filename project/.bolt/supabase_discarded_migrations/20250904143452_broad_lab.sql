/*
  # Add missing notification types

  1. Add new notification types for booking flow
  2. Update notification type enum
*/

-- Add new notification types
DO $$
BEGIN
  -- Add new enum values if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'new_booking' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'new_booking';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'booking_request_sent' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'booking_request_sent';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'new_review' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'new_review';
  END IF;
END $$;

-- Update notifications table to use the enum if not already
DO $$
BEGIN
  -- Check if type column exists and is not using enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'type' 
    AND data_type = 'text'
  ) THEN
    -- Convert text column to enum
    ALTER TABLE notifications 
    ALTER COLUMN type TYPE notification_type 
    USING type::notification_type;
  END IF;
END $$;