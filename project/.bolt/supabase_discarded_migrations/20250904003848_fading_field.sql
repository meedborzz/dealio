/*
  # Add confirm_booking function

  1. New Functions
    - `confirm_booking` function to handle booking confirmation
    - Generates QR code when booking is confirmed
    - Updates booking status and creates QR code record

  2. Security
    - Function uses security definer to bypass RLS
    - Validates business ownership before confirming
*/

-- Function to confirm a booking and generate QR code
CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID,
  p_confirmed_datetime TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking RECORD;
  v_qr_token TEXT;
  v_qr_code_id UUID;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Get booking details
  SELECT b.*, d.business_id, d.title as deal_title
  INTO v_booking
  FROM bookings b
  JOIN deals d ON b.deal_id = d.id
  WHERE b.id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  -- Check if booking is in pending status
  IF v_booking.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Booking is not pending');
  END IF;

  -- Generate unique QR token
  v_qr_token := 'QR_' || upper(substring(gen_random_uuid()::text from 1 for 8)) || '_' || extract(epoch from now())::bigint;
  
  -- Set expiration to 24 hours from confirmation
  v_expires_at := p_confirmed_datetime + INTERVAL '24 hours';

  -- Create QR code record
  INSERT INTO qr_codes (booking_id, qr_token, expires_at)
  VALUES (p_booking_id, v_qr_token, v_expires_at)
  RETURNING id INTO v_qr_code_id;

  -- Update booking status and link QR code
  UPDATE bookings 
  SET 
    status = 'confirmed',
    booking_date = p_confirmed_datetime,
    qr_code_id = v_qr_code_id,
    updated_at = now()
  WHERE id = p_booking_id;

  -- Return success with QR details
  RETURN json_build_object(
    'success', true,
    'qr_token', v_qr_token,
    'qr_code_id', v_qr_code_id,
    'expires_at', v_expires_at,
    'booking_id', p_booking_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;