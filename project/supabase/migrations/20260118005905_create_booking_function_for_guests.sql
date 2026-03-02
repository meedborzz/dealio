/*
  # Create Booking Function for Guest Support

  1. Changes
    - Creates a SECURITY DEFINER function to handle complete booking creation
    - Handles all booking operations atomically:
      * Validates time slot availability
      * Creates booking record
      * Updates time slot availability
      * Triggers notifications
    - Works for both authenticated users and guests

  2. Security
    - Function runs as SECURITY DEFINER to bypass RLS for internal operations
    - Still validates all business logic and constraints
    - Ensures data integrity through transactions

  3. Notes
    - This enables seamless guest bookings without exposing RLS policies
    - All booking logic centralized in one place
    - Atomic operations prevent race conditions
*/

CREATE OR REPLACE FUNCTION create_booking(
  p_deal_id uuid,
  p_time_slot_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_notes text DEFAULT NULL,
  p_booking_date timestamptz DEFAULT NULL,
  p_start_at timestamptz DEFAULT NULL,
  p_end_at timestamptz DEFAULT NULL,
  p_service_summary text DEFAULT NULL,
  p_total_price numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_booking_id uuid;
  v_current_spots integer;
  v_is_available boolean;
  v_deal record;
  v_booking record;
BEGIN
  -- Get current user ID (will be NULL for guests)
  v_user_id := auth.uid();

  -- Validate required fields for all users
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer name is required'
    );
  END IF;

  IF p_customer_phone IS NULL OR p_customer_phone = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer phone is required'
    );
  END IF;

  IF p_customer_email IS NULL OR p_customer_email = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer email is required'
    );
  END IF;

  -- Get deal information
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Deal not found'
    );
  END IF;

  -- Check quota if enabled
  IF v_deal.quota_enabled AND v_deal.booking_quota_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No quota remaining for this deal'
    );
  END IF;

  -- Lock the time slot row for update
  SELECT available_spots, is_available 
  INTO v_current_spots, v_is_available
  FROM time_slots
  WHERE id = p_time_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Time slot not found'
    );
  END IF;

  -- Validate time slot availability
  IF NOT v_is_available OR v_current_spots <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Time slot is no longer available',
      'conflict', true
    );
  END IF;

  -- Create the booking
  INSERT INTO bookings (
    deal_id,
    time_slot_id,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    notes,
    booking_date,
    start_at,
    end_at,
    service_summary,
    total_price,
    status
  ) VALUES (
    p_deal_id,
    p_time_slot_id,
    v_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_notes,
    COALESCE(p_booking_date, now()),
    p_start_at,
    p_end_at,
    COALESCE(p_service_summary, v_deal.title),
    COALESCE(p_total_price, v_deal.discounted_price),
    'pending'
  )
  RETURNING * INTO v_booking;

  v_booking_id := v_booking.id;

  -- Update time slot availability
  UPDATE time_slots
  SET 
    available_spots = v_current_spots - 1,
    is_available = (v_current_spots - 1) > 0
  WHERE id = p_time_slot_id;

  -- Send notifications (wrapped in exception handler to not fail booking if notification fails)
  BEGIN
    PERFORM notify_booking_created(v_booking_id);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the booking
    RAISE WARNING 'Failed to send booking notification: %', SQLERRM;
  END;

  -- Return success with booking data
  RETURN jsonb_build_object(
    'success', true,
    'booking', row_to_json(v_booking)
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking conflict - this slot may already be taken',
      'conflict', true
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION create_booking TO anon, authenticated;
