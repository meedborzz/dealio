/*
  # Add guest session ID to bookings

  1. Changes
    - Add `guest_session_id` column to bookings table (uuid, nullable)
    - Add index on guest_session_id for efficient guest booking queries
    - Update create_booking function to accept and store guest_session_id

  2. Security
    - Existing RLS policies remain unchanged
    - Guest bookings accessible via booking_token or guest_session_id
*/

-- Add guest_session_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'guest_session_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN guest_session_id uuid;
  END IF;
END $$;

-- Create index for efficient guest booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_session_id ON bookings(guest_session_id);

-- Update the create_booking function to accept guest_session_id
CREATE OR REPLACE FUNCTION create_booking(
  p_deal_id uuid,
  p_time_slot_id uuid,
  p_guest_name text DEFAULT NULL,
  p_guest_email text DEFAULT NULL,
  p_guest_phone text DEFAULT NULL,
  p_guest_session_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_business_id uuid;
  v_booking_id uuid;
  v_qr_code text;
  v_booking_token uuid;
  v_deal_title text;
  v_business_name text;
  v_slot_start_time timestamptz;
BEGIN
  v_user_id := auth.uid();

  SELECT business_id, title INTO v_business_id, v_deal_title
  FROM deals
  WHERE id = p_deal_id;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Deal not found';
  END IF;

  SELECT name INTO v_business_name
  FROM businesses
  WHERE id = v_business_id;

  IF p_time_slot_id IS NOT NULL THEN
    SELECT start_time INTO v_slot_start_time
    FROM time_slots
    WHERE id = p_time_slot_id AND business_id = v_business_id;

    IF v_slot_start_time IS NULL THEN
      RAISE EXCEPTION 'Time slot not found';
    END IF;
  END IF;

  v_booking_token := gen_random_uuid();
  v_qr_code := encode(gen_random_bytes(32), 'base64');

  INSERT INTO bookings (
    user_id,
    deal_id,
    time_slot_id,
    business_id,
    status,
    booking_token,
    qr_code,
    guest_name,
    guest_email,
    guest_phone,
    guest_session_id
  ) VALUES (
    v_user_id,
    p_deal_id,
    p_time_slot_id,
    v_business_id,
    'confirmed',
    v_booking_token,
    v_qr_code,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_guest_session_id
  )
  RETURNING id INTO v_booking_id;

  UPDATE deals
  SET booking_quota_remaining = booking_quota_remaining - 1
  WHERE id = p_deal_id AND booking_quota_remaining > 0;

  IF p_time_slot_id IS NOT NULL THEN
    UPDATE time_slots
    SET is_booked = true
    WHERE id = p_time_slot_id;
  END IF;

  RETURN json_build_object(
    'booking_id', v_booking_id,
    'booking_token', v_booking_token,
    'qr_code', v_qr_code,
    'deal_title', v_deal_title,
    'business_name', v_business_name,
    'slot_start_time', v_slot_start_time
  );
END;
$$;
