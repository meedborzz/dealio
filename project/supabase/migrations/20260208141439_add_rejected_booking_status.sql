/*
  # Add 'rejected' to booking_status enum

  1. Changes
    - Add 'rejected' as a valid value for the booking_status enum
    - This allows businesses to reject booking requests
  
  2. Notes
    - Uses ALTER TYPE to add the new enum value
    - Safe operation that doesn't affect existing data
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'rejected'
  ) THEN
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'rejected';
  END IF;
END $$;
