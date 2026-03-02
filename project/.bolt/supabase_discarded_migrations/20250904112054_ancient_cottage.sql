/*
  # Fix QR Code Validation Logic

  1. Updates
    - Fix QR token format validation
    - Improve business ownership verification
    - Add better debugging and error handling
    - Ensure QR codes are properly linked to businesses

  2. Changes
    - Updated validate_booking_with_qr function
    - Fixed business verification logic
    - Added comprehensive error messages
*/

-- Drop and recreate the validation function with better logic
DROP FUNCTION IF EXISTS validate_booking_with_qr(text, uuid, uuid);

CREATE OR REPLACE FUNCTION validate_booking_with_qr(
  p_qr_token TEXT,
  p_business_id UUID,
  p_staff_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr_record RECORD;
  v_booking_record RECORD;
  v_deal_record RECORD;
  v_business_record RECORD;
  v_commission_amount NUMERIC(10,2);
  v_salon_amount NUMERIC(10,2);
  v_commission_rate NUMERIC(3,2);
BEGIN
  -- Debug: Log the input parameters
  RAISE NOTICE 'QR Validation - Token: %, Business: %, Staff: %', p_qr_token, p_business_id, p_staff_id;

  -- Validate input parameters
  IF p_qr_token IS NULL OR trim(p_qr_token) = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code QR manquant ou invalide'
    );
  END IF;

  IF p_business_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ID établissement manquant'
    );
  END IF;

  -- Clean the QR token (remove any whitespace)
  p_qr_token := trim(p_qr_token);

  -- Find the QR code record
  SELECT * INTO v_qr_record
  FROM qr_codes 
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RAISE NOTICE 'QR code not found for token: %', p_qr_token;
    RETURN json_build_object(
      'success', false,
      'error', 'Code QR invalide ou introuvable'
    );
  END IF;

  -- Check if QR code is already used
  IF v_qr_record.is_used THEN
    RAISE NOTICE 'QR code already used: %', p_qr_token;
    RETURN json_build_object(
      'success', false,
      'error', 'Ce code QR a déjà été utilisé'
    );
  END IF;

  -- Check if QR code is expired
  IF v_qr_record.expires_at < NOW() THEN
    RAISE NOTICE 'QR code expired: % (expired at: %)', p_qr_token, v_qr_record.expires_at;
    RETURN json_build_object(
      'success', false,
      'error', 'Code QR expiré'
    );
  END IF;

  -- Get the booking record
  SELECT * INTO v_booking_record
  FROM bookings 
  WHERE id = v_qr_record.booking_id;

  IF NOT FOUND THEN
    RAISE NOTICE 'Booking not found for QR: %', v_qr_record.booking_id;
    RETURN json_build_object(
      'success', false,
      'error', 'Réservation introuvable'
    );
  END IF;

  -- Get the deal record to find the business
  SELECT * INTO v_deal_record
  FROM deals 
  WHERE id = v_booking_record.deal_id;

  IF NOT FOUND THEN
    RAISE NOTICE 'Deal not found: %', v_booking_record.deal_id;
    RETURN json_build_object(
      'success', false,
      'error', 'Offre introuvable'
    );
  END IF;

  -- Verify the business ownership
  IF v_deal_record.business_id != p_business_id THEN
    RAISE NOTICE 'Business mismatch - Deal business: %, Provided business: %', v_deal_record.business_id, p_business_id;
    RETURN json_build_object(
      'success', false,
      'error', 'Cette réservation n''appartient pas à cet établissement'
    );
  END IF;

  -- Get business record for commission rate
  SELECT * INTO v_business_record
  FROM businesses 
  WHERE id = p_business_id;

  IF NOT FOUND THEN
    RAISE NOTICE 'Business not found: %', p_business_id;
    RETURN json_build_object(
      'success', false,
      'error', 'Établissement introuvable'
    );
  END IF;

  -- Check if booking is in confirmed status
  IF v_booking_record.status != 'confirmed' THEN
    RAISE NOTICE 'Booking not confirmed - Status: %', v_booking_record.status;
    RETURN json_build_object(
      'success', false,
      'error', 'Cette réservation n''est pas confirmée'
    );
  END IF;

  -- Calculate commission
  v_commission_rate := COALESCE(v_business_record.commission_rate, 0.15);
  v_commission_amount := v_booking_record.total_price * v_commission_rate;
  v_salon_amount := v_booking_record.total_price - v_commission_amount;

  -- Mark QR code as used
  UPDATE qr_codes 
  SET is_used = true 
  WHERE id = v_qr_record.id;

  -- Update booking status to completed
  UPDATE bookings 
  SET 
    status = 'completed',
    validated_at = NOW(),
    commission_calculated = true,
    updated_at = NOW()
  WHERE id = v_booking_record.id;

  -- Create commission log
  INSERT INTO commission_logs (
    booking_id,
    business_id,
    commission_rate,
    deal_amount,
    commission_amount,
    salon_amount,
    status,
    validated_at
  ) VALUES (
    v_booking_record.id,
    p_business_id,
    v_commission_rate,
    v_booking_record.total_price,
    v_commission_amount,
    v_salon_amount,
    'pending',
    NOW()
  );

  -- Update business totals
  UPDATE businesses 
  SET 
    total_commission_owed = total_commission_owed + v_commission_amount,
    total_validated_bookings = total_validated_bookings + 1,
    updated_at = NOW()
  WHERE id = p_business_id;

  -- Award loyalty points to customer (1 point per DH spent)
  IF v_booking_record.user_id IS NOT NULL THEN
    UPDATE user_profiles 
    SET 
      loyalty_points = loyalty_points + v_booking_record.total_price::INTEGER,
      completed_bookings_count = completed_bookings_count + 1,
      updated_at = NOW()
    WHERE id = v_booking_record.user_id;
  END IF;

  -- Create booking validation record
  INSERT INTO booking_validations (
    booking_id,
    qr_code_id,
    business_id,
    validated_by,
    validated_at
  ) VALUES (
    v_booking_record.id,
    v_qr_record.id,
    p_business_id,
    p_staff_id,
    NOW()
  );

  RAISE NOTICE 'QR validation successful for booking: %', v_booking_record.id;

  -- Return success with all details
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_record.id,
    'customer_name', v_booking_record.customer_name,
    'service_name', v_deal_record.title,
    'deal_amount', v_booking_record.total_price,
    'commission_amount', v_commission_amount,
    'salon_amount', v_salon_amount,
    'commission_rate', v_commission_rate,
    'loyalty_points_earned', v_booking_record.total_price::INTEGER,
    'qr_token', p_qr_token,
    'validated_at', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'QR validation error: % %', SQLSTATE, SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur système lors de la validation: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION validate_booking_with_qr(TEXT, UUID, UUID) TO authenticated;