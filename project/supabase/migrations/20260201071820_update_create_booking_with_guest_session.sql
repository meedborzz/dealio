/*
  # Update create_booking to support guest_session_id

  1. Changes
    - Add guest_session_id parameter to existing create_booking function
    - Store guest_session_id in bookings table for guest bookings

  2. Notes
    - Extends existing function signature
    - Maintains backward compatibility with existing calls
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
  p_total_price numeric DEFAULT NULL,
  p_guest_session_id uuid DEFAULT NULL
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
  v_booking_token uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    v_booking_token := gen_random_uuid();
  ELSE
    v_booking_token := NULL;
  END IF;

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

  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Deal not found'
    );
  END IF;

  IF v_deal.quota_enabled AND v_deal.booking_quota_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No quota remaining for this deal'
    );
  END IF;

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

  IF NOT v_is_available OR v_current_spots <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Time slot is no longer available',
      'conflict', true
    );
  END IF;

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
    status,
    booking_token,
    guest_session_id
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
    'pending',
    v_booking_token,
    p_guest_session_id
  )
  RETURNING * INTO v_booking;

  v_booking_id := v_booking.id;

  UPDATE time_slots
  SET 
    available_spots = v_current_spots - 1,
    is_available = (v_current_spots - 1) > 0
  WHERE id = p_time_slot_id;

  BEGIN
    PERFORM notify_booking_created(v_booking_id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send booking notification: %', SQLERRM;
  END;

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
