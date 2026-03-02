/*
  # Fix time_slot_id constraint for manual bookings

  1. Changes
    - Make time_slot_id nullable in bookings table
    - This allows businesses to create manual bookings without requiring a pre-existing time slot
    - Useful for walk-ins, phone bookings, and manual calendar entries
  
  2. Security
    - No changes to RLS policies
    - Maintains existing access control
*/

DO $$ 
BEGIN
  -- Make time_slot_id nullable to allow manual bookings
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'time_slot_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE bookings ALTER COLUMN time_slot_id DROP NOT NULL;
  END IF;
END $$;
