/*
  # Add booking_time column to bookings table

  1. Changes
    - Add `booking_time` column to `bookings` table as time without time zone
    - Column is nullable to handle existing records
    - New bookings can store the specific time for the appointment

  2. Notes
    - This column will store the time portion of the booking appointment
    - Works alongside the existing booking_date field
    - Nullable to avoid breaking existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_time'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_time time without time zone;
  END IF;
END $$;