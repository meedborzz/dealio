/*
  # Fix QR Code Generation - Final Solution

  1. Changes Made
    - Remove ALL existing QR generation logic from triggers
    - Create single, simple trigger that generates QR only when booking is confirmed
    - Clean up any duplicate QR codes
    - Ensure proper token format for camera scanning

  2. Security
    - Maintain RLS policies
    - Ensure proper foreign key constraints
*/

-- First, clean up any existing triggers
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;
DROP FUNCTION IF EXISTS generate_qr_code_for_booking();

-- Clean up duplicate QR codes (keep only the first one for each booking)
DELETE FROM qr_codes 
WHERE id NOT IN (
  SELECT DISTINCT ON (booking_id) id 
  FROM qr_codes 
  ORDER BY booking_id, created_at ASC
);

-- Create simple QR generation function
CREATE OR REPLACE FUNCTION generate_qr_for_confirmed_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate QR when booking status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Check if QR code already exists
    IF NOT EXISTS (SELECT 1 FROM qr_codes WHERE booking_id = NEW.id) THEN
      -- Generate simple token format for camera scanning
      INSERT INTO qr_codes (
        booking_id,
        qr_token,
        expires_at,
        is_used
      ) VALUES (
        NEW.id,
        'QR_' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12)),
        NOW() + INTERVAL '30 days',
        false
      );
      
      -- Update booking with QR code ID
      UPDATE bookings 
      SET qr_code_id = (
        SELECT id FROM qr_codes WHERE booking_id = NEW.id LIMIT 1
      )
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_generate_qr_for_confirmed_booking
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_for_confirmed_booking();