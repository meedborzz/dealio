/*
  # Create confirm_booking function

  1. New Functions
    - `confirm_booking(p_booking_id, p_confirmed_datetime)`
      - Updates booking status to 'confirmed'
      - Sets the booking_date to the confirmed datetime
      - Extracts and sets booking_time from the datetime
      - Returns success/error status

  2. Security
    - Function is accessible to authenticated users
    - Business logic validates booking exists and is in pending status

  3. Integration
    - Works with existing QR code generation trigger
    - Maintains data consistency for booking workflow
*/

CREATE OR REPLACE FUNCTION public.confirm_booking(
  p_booking_id UUID,
  p_confirmed_datetime TIMESTAMP WITH TIME ZONE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_exists BOOLEAN;
  v_current_status booking_status;
BEGIN
  -- Check if booking exists and get current status
  SELECT EXISTS(SELECT 1 FROM bookings WHERE id = p_booking_id), 
         status
  INTO v_booking_exists, v_current_status
  FROM bookings 
  WHERE id = p_booking_id;

  -- Validate booking exists
  IF NOT v_booking_exists THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Booking not found'
    );
  END IF;

  -- Check if booking is in pending status
  IF v_current_status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Booking is not in pending status'
    );
  END IF;

  -- Update the booking
  UPDATE bookings 
  SET 
    status = 'confirmed',
    booking_date = p_confirmed_datetime,
    booking_time = p_confirmed_datetime::TIME,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Booking confirmed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error confirming booking: ' || SQLERRM
    );
END;
$$;