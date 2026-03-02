/*
  # Create confirm_booking function

  1. New Functions
    - `confirm_booking(p_booking_id, p_confirmed_datetime)`
      - Updates booking status to 'confirmed'
      - Sets the confirmed date and time
      - Generates QR code for the booking
      - Returns success status and QR token

  2. Security
    - Function is accessible to authenticated users
    - Booking validation handled within function
*/

CREATE OR REPLACE FUNCTION public.confirm_booking(
    p_booking_id uuid,
    p_confirmed_datetime timestamp with time zone
)
RETURNS TABLE(
    success boolean,
    message text,
    booking_id uuid,
    qr_token text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_booking_status public.booking_status;
    v_qr_code_id uuid;
    v_qr_token text;
    v_expires_at timestamp with time zone;
BEGIN
    -- Check current booking status
    SELECT status INTO v_booking_status FROM public.bookings WHERE id = p_booking_id;

    IF v_booking_status IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Booking not found', NULL::uuid, NULL::text;
        RETURN;
    END IF;

    IF v_booking_status = 'confirmed' THEN
        RETURN QUERY SELECT FALSE, 'Booking is already confirmed', p_booking_id, NULL::text;
        RETURN;
    END IF;

    -- Generate QR token and expiry
    v_qr_token := gen_random_uuid()::text;
    v_expires_at := p_confirmed_datetime + INTERVAL '24 hours';

    -- Insert into qr_codes table
    INSERT INTO public.qr_codes (booking_id, qr_token, expires_at)
    VALUES (p_booking_id, v_qr_token, v_expires_at)
    RETURNING id INTO v_qr_code_id;

    -- Update booking status and link QR code
    UPDATE public.bookings
    SET
        status = 'confirmed',
        booking_date = p_confirmed_datetime,
        booking_time = p_confirmed_datetime::time,
        qr_code_id = v_qr_code_id,
        updated_at = now()
    WHERE id = p_booking_id;

    RETURN QUERY SELECT TRUE, 'Booking confirmed successfully', p_booking_id, v_qr_token;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM, NULL::uuid, NULL::text;
END;
$$;