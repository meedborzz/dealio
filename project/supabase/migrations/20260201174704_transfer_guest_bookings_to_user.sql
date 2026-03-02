/*
  # Transfer Guest Bookings to User Account

  1. Changes
    - Create RPC function `transfer_guest_bookings_to_user`
    - Function links guest bookings to a newly created user account
    - Updates bookings where guest_session_id or booking_token matches
    - Returns count of transferred bookings

  2. Security
    - Function uses SECURITY DEFINER to allow updates
    - Only transfers bookings that don't already have a user_id
    - Validates user_id exists before transfer

  3. Purpose
    - When a guest creates an account, their previous bookings are linked
    - Provides seamless transition from guest to registered user
*/

-- Create function to transfer guest bookings to user account
CREATE OR REPLACE FUNCTION transfer_guest_bookings_to_user(
  p_user_id uuid,
  p_guest_session_id uuid DEFAULT NULL,
  p_booking_tokens text[] DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transferred_count int := 0;
  v_temp_count int := 0;
BEGIN
  -- Validate that user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Transfer bookings by guest_session_id
  IF p_guest_session_id IS NOT NULL THEN
    UPDATE bookings
    SET user_id = p_user_id
    WHERE guest_session_id = p_guest_session_id
      AND user_id IS NULL;
    
    GET DIAGNOSTICS v_transferred_count = ROW_COUNT;
  END IF;

  -- Transfer bookings by booking_tokens
  IF p_booking_tokens IS NOT NULL AND array_length(p_booking_tokens, 1) > 0 THEN
    UPDATE bookings
    SET user_id = p_user_id
    WHERE booking_token::text = ANY(p_booking_tokens)
      AND user_id IS NULL;
    
    GET DIAGNOSTICS v_temp_count = ROW_COUNT;
    v_transferred_count := v_transferred_count + v_temp_count;
  END IF;

  RETURN v_transferred_count;
END;
$$;
