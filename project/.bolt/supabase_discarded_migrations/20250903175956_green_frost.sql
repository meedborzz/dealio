/*
  # Create confirm_booking function

  1. New Functions
    - `confirm_booking(p_booking_id, p_confirmed_datetime)`
      - Updates booking status to 'confirmed'
      - Sets booking date and time from provided datetime
      - Returns success status and message
      - Includes validation for booking state

  2. Security
    - Function is accessible to authenticated users
    - Validates booking exists before updating
    - Prevents confirming already cancelled bookings
*/

CREATE OR REPLACE FUNCTION public.confirm_booking(
    p_booking_id uuid,
    p_confirmed_datetime text
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_status booking_status;
    parsed_datetime timestamp with time zone;
    parsed_date date;
    parsed_time time;
BEGIN
    -- Parse the ISO string into timestamp
    BEGIN
        parsed_datetime := p_confirmed_datetime::timestamp with time zone;
        parsed_date := parsed_datetime::date;
        parsed_time := parsed_datetime::time;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT FALSE, 'Invalid datetime format';
            RETURN;
    END;

    -- Check current status of the booking
    SELECT status INTO current_status
    FROM public.bookings
    WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Booking not found';
        RETURN;
    END IF;

    IF current_status = 'confirmed' THEN
        RETURN QUERY SELECT FALSE, 'Booking is already confirmed';
        RETURN;
    END IF;

    IF current_status = 'cancelled' THEN
        RETURN QUERY SELECT FALSE, 'Booking is cancelled and cannot be confirmed';
        RETURN;
    END IF;

    -- Update booking status and set the new confirmed date and time
    UPDATE public.bookings
    SET
        status = 'confirmed',
        booking_date = parsed_datetime,
        booking_time = parsed_time,
        updated_at = NOW()
    WHERE id = p_booking_id;

    RETURN QUERY SELECT TRUE, 'Booking confirmed successfully';

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM;
END;
$$;