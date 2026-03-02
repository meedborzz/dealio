/*
  # Add total_price column to bookings table

  1. Schema Changes
    - Add `total_price` column to `bookings` table
      - Type: DECIMAL(10, 2) for monetary values
      - NOT NULL with DEFAULT 0 for data consistency
      - Allows storing the total booking amount

  2. Notes
    - This column will store the total price paid for each booking
    - Default value of 0 ensures existing records remain valid
    - DECIMAL type provides precise monetary calculations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN total_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;