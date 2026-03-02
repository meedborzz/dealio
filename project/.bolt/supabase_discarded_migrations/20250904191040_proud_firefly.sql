/*
  # Fix QR Code Linking in Confirm Booking Function

  1. Function Updates
    - Update `confirm_booking_and_generate_qr` function to properly link QR code to booking
    - Ensure `bookings.qr_code_id` is populated when QR code is generated
    - Fix client-side QR code display issue

  2. Changes Made
    - Add proper variable declaration for QR code ID
    - Update bookings table with generated QR code ID
    - Maintain existing functionality for status updates and notifications
*/

-- Drop and recreate the confirm_booking_and_generate_qr function with proper QR code linking
DROP FUNCTION IF EXISTS confirm_booking_and_generate_qr(uuid, timestamp with time zone);

CREATE OR REPLACE FUNCTION confirm_booking_and_generate_qr(
  p_booking_id uuid,
  p_new_booking_date timestamp with time zone DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking record;
  v_deal record;
  v_business record;
  v_qr_token text;
  v_qr_code_id uuid;
  v_expires_at timestamp with time zone;
  v_final_booking_date timestamp with time zone;
BEGIN
  -- 1. Get booking details
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Booking not found'
    );
  END IF;

  -- 2. Get deal and business details
  SELECT d.*, b.name as business_name, b.owner_id as business_owner_id
  INTO v_deal
  FROM public.deals d
  JOIN public.businesses b ON d.business_id = b.id
  WHERE d.id = v_booking.deal_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Deal or business not found'
    );
  END IF;

  -- 3. Determine final booking date
  v_final_booking_date := COALESCE(p_new_booking_date, v_booking.booking_date);

  -- 4. Update booking status and date
  UPDATE public.bookings
  SET 
    status = 'confirmed',
    booking_date = v_final_booking_date,
    updated_at = now()
  WHERE id = p_booking_id;

  -- 5. Generate QR token
  v_qr_token := 'QR_' || p_booking_id::text || '_' || extract(epoch from now())::bigint::text;
  v_expires_at := v_final_booking_date + interval '24 hours';

  -- 6. Insert QR code and capture the ID
  INSERT INTO public.qr_codes (booking_id, qr_token, expires_at)
  VALUES (p_booking_id, v_qr_token, v_expires_at)
  RETURNING id INTO v_qr_code_id;

  -- 7. CRITICAL: Update bookings table with QR code ID
  UPDATE public.bookings
  SET qr_code_id = v_qr_code_id
  WHERE id = p_booking_id;

  -- 8. Send notification to client
  INSERT INTO public.notifications (
    user_id,
    type,
    channel,
    title,
    content,
    data,
    related_booking_id,
    related_deal_id,
    related_business_id
  )
  VALUES (
    v_booking.user_id,
    'booking_confirmation',
    'in_app',
    'Réservation confirmée',
    'Votre réservation pour ' || v_deal.title || ' chez ' || v_deal.business_name || ' est confirmée',
    jsonb_build_object(
      'booking_date', v_final_booking_date,
      'qr_token', v_qr_token,
      'business_name', v_deal.business_name,
      'deal_title', v_deal.title
    ),
    p_booking_id,
    v_booking.deal_id,
    v_deal.business_id
  );

  -- 9. Send notification to business owner
  IF v_deal.business_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      channel,
      title,
      content,
      data,
      related_booking_id,
      related_deal_id,
      related_business_id
    )
    VALUES (
      v_deal.business_owner_id,
      'booking_confirmation',
      'in_app',
      'Réservation confirmée',
      'Vous avez confirmé la réservation de ' || v_booking.customer_name || ' pour ' || v_deal.title,
      jsonb_build_object(
        'customer_name', v_booking.customer_name,
        'booking_date', v_final_booking_date,
        'deal_title', v_deal.title
      ),
      p_booking_id,
      v_booking.deal_id,
      v_deal.business_id
    );
  END IF;

  -- 10. Return success response
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'qr_code_id', v_qr_code_id,
    'qr_token', v_qr_token,
    'booking_date', v_final_booking_date,
    'expires_at', v_expires_at
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;