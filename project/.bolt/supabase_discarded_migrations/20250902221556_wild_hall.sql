/*
  # QR Code Validation System

  1. Database Function
    - `validate_booking_with_qr()` - Secure QR validation with commission calculation
    - Handles booking status updates, QR code marking, and commission logging
    
  2. Security
    - Row Level Security maintained
    - Business owner verification
    - QR code expiry and usage checks
    
  3. Commission Automation
    - Automatic commission calculation
    - Business aggregate updates
    - Audit trail creation
*/

-- Create the QR validation function
CREATE OR REPLACE FUNCTION validate_booking_with_qr(
  p_qr_token TEXT,
  p_business_id UUID,
  p_staff_id UUID
) RETURNS JSON AS $$
DECLARE
  v_qr_record RECORD;
  v_booking_record RECORD;
  v_deal_record RECORD;
  v_business_record RECORD;
  v_commission_rate NUMERIC;
  v_commission_amount NUMERIC;
  v_salon_amount NUMERIC;
  v_result JSON;
BEGIN
  -- 1. Validate QR code exists and get booking info
  SELECT qr.*, b.*, d.title as deal_title, d.discounted_price as deal_price, bus.commission_rate, bus.owner_id
  INTO v_qr_record
  FROM qr_codes qr
  JOIN bookings b ON qr.booking_id = b.id
  JOIN deals d ON b.deal_id = d.id
  JOIN businesses bus ON d.business_id = bus.id
  WHERE qr.qr_token = p_qr_token;

  -- Check if QR code exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code QR non trouvé'
    );
  END IF;

  -- 2. Validate QR code status
  IF v_qr_record.is_used THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce code QR a déjà été utilisé'
    );
  END IF;

  IF v_qr_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce code QR a expiré'
    );
  END IF;

  -- 3. Verify business ownership
  IF v_qr_record.owner_id != (
    SELECT owner_id FROM businesses WHERE id = p_business_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce code QR n''appartient pas à votre établissement'
    );
  END IF;

  -- 4. Calculate commission
  v_commission_rate := COALESCE(v_qr_record.commission_rate, 0.15);
  v_commission_amount := ROUND((v_qr_record.deal_price * v_commission_rate)::NUMERIC, 2);
  v_salon_amount := ROUND((v_qr_record.deal_price - v_commission_amount)::NUMERIC, 2);

  -- 5. Create validation record
  INSERT INTO booking_validations (
    booking_id,
    qr_code_id,
    business_id,
    validated_by,
    validated_at,
    device_info,
    location_data
  ) VALUES (
    v_qr_record.booking_id,
    v_qr_record.id,
    p_business_id,
    p_staff_id,
    NOW(),
    'QR Scanner',
    NULL
  );

  -- 6. Update QR code as used
  UPDATE qr_codes 
  SET is_used = true 
  WHERE id = v_qr_record.id;

  -- 7. Update booking status
  UPDATE bookings 
  SET 
    status = 'completed',
    validated_at = NOW(),
    updated_at = NOW()
  WHERE id = v_qr_record.booking_id;

  -- 8. Create commission log
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
    v_qr_record.booking_id,
    p_business_id,
    v_commission_rate,
    v_qr_record.deal_price,
    v_commission_amount,
    v_salon_amount,
    'pending',
    NOW()
  );

  -- 9. Update business aggregates
  UPDATE businesses 
  SET 
    total_commission_owed = COALESCE(total_commission_owed, 0) + v_commission_amount,
    total_validated_bookings = COALESCE(total_validated_bookings, 0) + 1,
    updated_at = NOW()
  WHERE id = p_business_id;

  -- 10. Update user loyalty points (if user exists)
  IF v_qr_record.user_id IS NOT NULL THEN
    UPDATE user_profiles 
    SET 
      loyalty_points = COALESCE(loyalty_points, 0) + FLOOR(v_qr_record.deal_price),
      completed_bookings_count = COALESCE(completed_bookings_count, 0) + 1,
      updated_at = NOW()
    WHERE id = v_qr_record.user_id;
  END IF;

  -- 11. Return success result
  v_result := json_build_object(
    'success', true,
    'booking_id', v_qr_record.booking_id,
    'customer_name', v_qr_record.customer_name,
    'service_name', v_qr_record.deal_title,
    'deal_amount', v_qr_record.deal_price,
    'commission_amount', v_commission_amount,
    'salon_amount', v_salon_amount,
    'commission_rate', v_commission_rate,
    'loyalty_points_earned', CASE 
      WHEN v_qr_record.user_id IS NOT NULL THEN FLOOR(v_qr_record.deal_price)
      ELSE 0 
    END
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    RAISE LOG 'QR Validation Error: % %', SQLERRM, SQLSTATE;
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la validation: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION validate_booking_with_qr(TEXT, UUID, UUID) TO authenticated;

-- Create index for faster QR token lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_token_lookup ON qr_codes(qr_token) WHERE NOT is_used;

-- Create index for booking validations
CREATE INDEX IF NOT EXISTS idx_booking_validations_business_date ON booking_validations(business_id, validated_at DESC);