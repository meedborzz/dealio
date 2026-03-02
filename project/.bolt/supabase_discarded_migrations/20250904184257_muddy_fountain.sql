/*
  # Create notification RPC functions

  1. New Functions
    - `notify_booking_created` - Sends notifications when a booking is created
    - `notify_booking_confirmed` - Sends notifications when a booking is confirmed
    - `confirm_booking_and_generate_qr` - Confirms booking and generates QR code with notifications

  2. Security
    - Functions run with definer rights to bypass RLS
    - Input validation to ensure data integrity
    - Proper error handling
*/

-- Function to notify when a booking is created
CREATE OR REPLACE FUNCTION notify_booking_created(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_deal deals%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_time_slot time_slots%ROWTYPE;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Get deal details
  SELECT * INTO v_deal
  FROM deals
  WHERE id = v_booking.deal_id;

  -- Get business details
  SELECT * INTO v_business
  FROM businesses
  WHERE id = v_deal.business_id;

  -- Get time slot details
  SELECT * INTO v_time_slot
  FROM time_slots
  WHERE id = v_booking.time_slot_id;

  -- Send notification to business owner
  IF v_business.owner_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      title,
      content,
      data,
      related_booking_id,
      related_business_id
    ) VALUES (
      v_business.owner_id,
      'booking_confirmation',
      'in_app',
      'Nouvelle réservation',
      v_booking.customer_name || ' a réservé ' || v_deal.title,
      jsonb_build_object(
        'customer_name', v_booking.customer_name,
        'deal_title', v_deal.title,
        'booking_date', v_time_slot.date,
        'booking_time', v_time_slot.start_time
      ),
      p_booking_id,
      v_business.id
    );
  END IF;

  -- Send confirmation notification to client
  IF v_booking.user_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      title,
      content,
      data,
      related_booking_id,
      related_deal_id,
      related_business_id
    ) VALUES (
      v_booking.user_id,
      'booking_confirmation',
      'in_app',
      'Demande envoyée',
      'Votre demande de réservation a été envoyée à ' || v_business.name,
      jsonb_build_object(
        'deal_title', v_deal.title,
        'business_name', v_business.name,
        'booking_date', v_time_slot.date,
        'booking_time', v_time_slot.start_time
      ),
      p_booking_id,
      v_deal.id,
      v_business.id
    );
  END IF;
END;
$$;

-- Function to notify when a booking is confirmed
CREATE OR REPLACE FUNCTION notify_booking_confirmed(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_deal deals%ROWTYPE;
  v_business businesses%ROWTYPE;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Get deal details
  SELECT * INTO v_deal
  FROM deals
  WHERE id = v_booking.deal_id;

  -- Get business details
  SELECT * INTO v_business
  FROM businesses
  WHERE id = v_deal.business_id;

  -- Send confirmation notification to client
  IF v_booking.user_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      title,
      content,
      data,
      related_booking_id
    ) VALUES (
      v_booking.user_id,
      'booking_confirmation',
      'in_app',
      'Réservation confirmée!',
      'Votre réservation pour ' || v_deal.title || ' a été confirmée',
      jsonb_build_object(
        'booking_id', p_booking_id,
        'deal_title', v_deal.title,
        'booking_date', v_booking.booking_date
      ),
      p_booking_id
    );
  END IF;
END;
$$;

-- Enhanced function to confirm booking and generate QR with notifications
CREATE OR REPLACE FUNCTION confirm_booking_and_generate_qr(
  p_booking_id uuid,
  p_new_booking_date timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_qr_token text;
  v_qr_code_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Update booking status and date if provided
  UPDATE bookings
  SET 
    status = 'confirmed',
    booking_date = COALESCE(p_new_booking_date, booking_date),
    updated_at = now()
  WHERE id = p_booking_id;

  -- Generate QR code if not exists
  IF v_booking.qr_code_id IS NULL THEN
    -- Generate unique QR token
    v_qr_token := 'QR_' || upper(substring(gen_random_uuid()::text from 1 for 8)) || '_' || extract(epoch from now())::bigint;
    v_expires_at := now() + interval '30 days';

    -- Insert QR code
    INSERT INTO qr_codes (booking_id, qr_token, expires_at)
    VALUES (p_booking_id, v_qr_token, v_expires_at)
    RETURNING id INTO v_qr_code_id;

    -- Update booking with QR code reference
    UPDATE bookings
    SET qr_code_id = v_qr_code_id
    WHERE id = p_booking_id;
  END IF;

  -- Send confirmation notifications
  PERFORM notify_booking_confirmed(p_booking_id);

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'qr_code_id', v_qr_code_id,
    'qr_token', v_qr_token
  );
END;
$$;