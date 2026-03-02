/*
  # Fix Complete Booking Flow

  1. Database Functions
    - Drop old/duplicate functions
    - Create unified confirm_booking_and_generate_qr function
    - Create unified validate_booking_with_qr function
    - Both with SECURITY DEFINER for RLS bypass

  2. RLS Policies
    - Ensure proper policies for qr_codes table
    - Fix any missing policies

  3. Constraints
    - Ensure businesses.owner_id uniqueness
*/

-- Drop any old/duplicate functions
DROP FUNCTION IF EXISTS public.confirm_booking(uuid, timestamptz);
DROP FUNCTION IF EXISTS public.validate_qr_code(text, uuid, uuid);

-- Create unified booking confirmation function
CREATE OR REPLACE FUNCTION public.confirm_booking_and_generate_qr(
  p_booking_id uuid,
  p_confirmed_datetime timestamptz
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_deal deals%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_qr_token text;
  v_qr_code_id uuid;
  v_expires_at timestamptz;
  v_time_slot time_slots%ROWTYPE;
BEGIN
  -- Get current user
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Non authentifié'
    );
  END IF;

  -- Get booking with related data
  SELECT b.*, d.*, bus.*
  INTO v_booking, v_deal, v_business
  FROM bookings b
  JOIN deals d ON b.deal_id = d.id
  JOIN businesses bus ON d.business_id = bus.id
  WHERE b.id = p_booking_id;

  -- Validate booking exists
  IF v_booking.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Réservation non trouvée'
    );
  END IF;

  -- Validate booking status
  IF v_booking.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cette réservation a déjà été traitée'
    );
  END IF;

  -- Validate business ownership
  IF v_business.owner_id != auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Vous n''êtes pas autorisé à confirmer cette réservation'
    );
  END IF;

  -- Generate QR token
  v_qr_token := 'QR_' || encode(gen_random_bytes(18), 'hex');
  v_expires_at := NOW() + interval '7 days';

  -- Update booking
  UPDATE bookings 
  SET 
    status = 'confirmed',
    booking_date = p_confirmed_datetime,
    booking_time = p_confirmed_datetime::time,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Create QR code
  INSERT INTO qr_codes (booking_id, qr_token, expires_at)
  VALUES (p_booking_id, v_qr_token, v_expires_at)
  RETURNING id INTO v_qr_code_id;

  -- Update booking with QR code reference
  UPDATE bookings 
  SET qr_code_id = v_qr_code_id
  WHERE id = p_booking_id;

  -- Update time slot if linked
  IF v_booking.time_slot_id IS NOT NULL THEN
    SELECT * INTO v_time_slot
    FROM time_slots
    WHERE id = v_booking.time_slot_id;

    IF v_time_slot.id IS NOT NULL THEN
      UPDATE time_slots
      SET 
        available_spots = GREATEST(0, available_spots - 1),
        is_available = CASE 
          WHEN available_spots - 1 <= 0 THEN false 
          ELSE true 
        END
      WHERE id = v_booking.time_slot_id;
    END IF;
  END IF;

  -- Return success with all needed data
  RETURN json_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'qr_token', v_qr_token,
    'qr_code_id', v_qr_code_id,
    'expires_at', v_expires_at,
    'customer_name', v_booking.customer_name,
    'service_name', v_deal.title,
    'deal_amount', v_booking.total_price,
    'commission_rate', v_business.commission_rate
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la confirmation: ' || SQLERRM
    );
END;
$$;

-- Create unified QR validation function
CREATE OR REPLACE FUNCTION public.validate_booking_with_qr(
  p_qr_token text,
  p_business_id uuid,
  p_staff_id uuid
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr_code qr_codes%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_deal deals%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_commission_amount numeric(10,2);
  v_salon_amount numeric(10,2);
  v_loyalty_points integer := 10;
BEGIN
  -- Validate inputs
  IF p_qr_token IS NULL OR p_business_id IS NULL OR p_staff_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Paramètres manquants'
    );
  END IF;

  -- Get QR code
  SELECT * INTO v_qr_code
  FROM qr_codes
  WHERE qr_token = p_qr_token;

  -- Check if QR code exists
  IF v_qr_code.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code QR invalide'
    );
  END IF;

  -- Check if QR code is already used
  IF v_qr_code.is_used THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ce code QR a déjà été utilisé'
    );
  END IF;

  -- Check if QR code is expired
  IF v_qr_code.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code QR expiré'
    );
  END IF;

  -- Get booking with related data
  SELECT b.*, d.*, bus.*
  INTO v_booking, v_deal, v_business
  FROM bookings b
  JOIN deals d ON b.deal_id = d.id
  JOIN businesses bus ON d.business_id = bus.id
  WHERE b.id = v_qr_code.booking_id;

  -- Validate booking exists
  IF v_booking.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Réservation non trouvée'
    );
  END IF;

  -- Validate business ownership
  IF v_business.id != p_business_id OR v_business.owner_id != p_staff_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cette réservation n''appartient pas à cet établissement'
    );
  END IF;

  -- Check booking status
  IF v_booking.status != 'confirmed' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cette réservation n''est pas confirmée'
    );
  END IF;

  -- Calculate commission
  v_commission_amount := v_booking.total_price * v_business.commission_rate;
  v_salon_amount := v_booking.total_price - v_commission_amount;

  -- Mark QR as used
  UPDATE qr_codes
  SET is_used = true
  WHERE id = v_qr_code.id;

  -- Update booking status
  UPDATE bookings
  SET 
    status = 'completed',
    validated_at = NOW(),
    commission_calculated = true,
    updated_at = NOW()
  WHERE id = v_booking.id;

  -- Insert booking validation record
  INSERT INTO booking_validations (
    booking_id,
    qr_code_id,
    business_id,
    validated_by,
    validated_at
  ) VALUES (
    v_booking.id,
    v_qr_code.id,
    p_business_id,
    p_staff_id,
    NOW()
  );

  -- Insert commission log
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
    v_booking.id,
    p_business_id,
    v_business.commission_rate,
    v_booking.total_price,
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

  -- Update user loyalty points (if user exists)
  IF v_booking.user_id IS NOT NULL THEN
    UPDATE user_profiles
    SET 
      loyalty_points = loyalty_points + v_loyalty_points,
      completed_bookings_count = completed_bookings_count + 1,
      updated_at = NOW()
    WHERE id = v_booking.user_id;
  END IF;

  -- Return success with all data
  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking.id,
    'customer_name', v_booking.customer_name,
    'service_name', v_deal.title,
    'deal_amount', v_booking.total_price,
    'commission_amount', v_commission_amount,
    'salon_amount', v_salon_amount,
    'commission_rate', v_business.commission_rate,
    'loyalty_points_earned', v_loyalty_points
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la validation: ' || SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.confirm_booking_and_generate_qr(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_booking_with_qr(text, uuid, uuid) TO authenticated;

-- Ensure businesses.owner_id is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'businesses' 
    AND constraint_name = 'businesses_owner_id_key'
  ) THEN
    ALTER TABLE businesses ADD CONSTRAINT businesses_owner_id_key UNIQUE (owner_id);
  END IF;
END $$;

-- Clean any duplicate businesses (keep the first one for each owner)
DELETE FROM businesses 
WHERE id NOT IN (
  SELECT DISTINCT ON (owner_id) id 
  FROM businesses 
  ORDER BY owner_id, created_at ASC
);

-- Ensure proper RLS policies for qr_codes
DROP POLICY IF EXISTS "System functions can insert QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Business owners can manage QR codes" ON qr_codes;

-- Business owners can view QR codes for their bookings
CREATE POLICY "Business owners can view QR codes for their bookings"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings b
      JOIN deals d ON b.deal_id = d.id
      JOIN businesses bus ON d.business_id = bus.id
      WHERE b.id = qr_codes.booking_id
      AND bus.owner_id = auth.uid()
    )
  );

-- Users can view their own booking QR codes
CREATE POLICY "Users can view own booking QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM bookings
      WHERE bookings.id = qr_codes.booking_id
      AND bookings.user_id = auth.uid()
    )
  );