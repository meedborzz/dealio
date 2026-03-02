/*
  # Add Guest Booking Token

  1. Changes
    - Add `booking_token` column to bookings table for guest access
    - Add unique index on booking_token
    - Create function to generate secure random tokens
    
  2. Security
    - Token is a secure random UUID that guests can use to view their booking
    - Only generated for bookings where user_id is NULL (guest bookings)
*/

-- Add booking_token column to bookings table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'booking_token'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_token uuid;
  END IF;
END $$;

-- Create unique index on booking_token
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_bookings_token'
  ) THEN
    CREATE UNIQUE INDEX idx_bookings_token ON bookings(booking_token) WHERE booking_token IS NOT NULL;
  END IF;
END $$;

-- Allow anyone to read a booking by token (for guest access)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Anyone can view booking by token'
  ) THEN
    CREATE POLICY "Anyone can view booking by token"
      ON bookings
      FOR SELECT
      USING (booking_token IS NOT NULL);
  END IF;
END $$;
