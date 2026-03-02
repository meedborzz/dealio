/*
  # Fix QR Code Generation - Final Solution

  1. Remove ALL existing QR generation mechanisms
  2. Create ONE proper trigger that generates working QR codes
  3. Clean up duplicate QR codes
  4. Fix QR token format for camera scanning
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;
DROP FUNCTION IF EXISTS generate_qr_code_for_booking();

-- Clean up duplicate QR codes (keep only the most recent one per booking)
DELETE FROM qr_codes 
WHERE id NOT IN (
  SELECT DISTINCT ON (booking_id) id 
  FROM qr_codes 
  ORDER BY booking_id, created_at DESC
);

-- Create proper QR generation function
CREATE OR REPLACE FUNCTION generate_qr_code_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  qr_token TEXT;
  expiry_date TIMESTAMPTZ;
BEGIN
  -- Only generate QR code when booking is confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Generate a simple, scannable QR token
    qr_token := 'QR' || EXTRACT(EPOCH FROM NOW())::BIGINT || SUBSTRING(NEW.id::TEXT, 1, 8);
    
    -- Set expiry to 30 days from now
    expiry_date := NOW() + INTERVAL '30 days';
    
    -- Insert QR code
    INSERT INTO qr_codes (booking_id, qr_token, expires_at, is_used)
    VALUES (NEW.id, qr_token, expiry_date, false);
    
    -- Update booking with QR code reference
    UPDATE bookings 
    SET qr_code_id = (
      SELECT id FROM qr_codes 
      WHERE booking_id = NEW.id 
      ORDER BY created_at DESC 
      LIMIT 1
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_generate_qr_code
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_code_for_booking();

-- Update existing confirmed bookings to have QR codes if they don't
DO $$
DECLARE
  booking_record RECORD;
  qr_token TEXT;
  qr_id UUID;
BEGIN
  FOR booking_record IN 
    SELECT id FROM bookings 
    WHERE status = 'confirmed' AND qr_code_id IS NULL
  LOOP
    -- Generate QR token
    qr_token := 'QR' || EXTRACT(EPOCH FROM NOW())::BIGINT || SUBSTRING(booking_record.id::TEXT, 1, 8);
    
    -- Insert QR code
    INSERT INTO qr_codes (booking_id, qr_token, expires_at, is_used)
    VALUES (booking_record.id, qr_token, NOW() + INTERVAL '30 days', false)
    RETURNING id INTO qr_id;
    
    -- Update booking
    UPDATE bookings SET qr_code_id = qr_id WHERE id = booking_record.id;
  END LOOP;
END $$;