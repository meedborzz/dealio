/*
  # Recreate Booking Validation Function with Wallet Credits
  
  1. Changes
    - Drops existing function if exists
    - Creates new function `validate_booking_with_qr` to handle QR code validation
    - Marks QR code as used
    - Updates booking status to completed
    - Awards loyalty points (1 point = 1 DH spent)
    - Credits wallet with 5% cashback
    - Creates wallet transaction record
    - Creates commission log record
    - Creates booking validation record
    - Returns detailed validation result
    
  2. Security
    - Function uses SECURITY DEFINER for necessary permissions
    - Validates business ownership
    - Checks QR code validity and expiration
    - Uses transactions for data consistency
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_booking_with_qr(text, uuid, uuid);

-- Create the function
CREATE OR REPLACE FUNCTION validate_booking_with_qr(
  p_qr_token text,
  p_business_id uuid,
  p_staff_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_qr_code_record record;
  v_booking_record record;
  v_deal_record record;
  v_business_record record;
  v_user_id uuid;
  v_loyalty_points_earned integer;
  v_wallet_credit numeric;
  v_commission_amount numeric;
  v_salon_amount numeric;
  v_cashback_percentage numeric := 0.05; -- 5% cashback
BEGIN
  -- Find and validate QR code
  SELECT * INTO v_qr_code_record
  FROM qr_codes
  WHERE qr_token = p_qr_token;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Code QR invalide'
    );
  END IF;
  
  -- Check if already used
  IF v_qr_code_record.is_used THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce code QR a déjà été utilisé'
    );
  END IF;
  
  -- Check if expired
  IF v_qr_code_record.expires_at < now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ce code QR a expiré'
    );
  END IF;
  
  -- Get booking details
  SELECT b.*, d.title as deal_title, d.business_id
  INTO v_booking_record
  FROM bookings b
  JOIN deals d ON b.deal_id = d.id
  WHERE b.id = v_qr_code_record.booking_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Réservation introuvable'
    );
  END IF;
  
  -- Verify business ownership
  IF v_booking_record.business_id != p_business_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cette réservation n''appartient pas à votre salon'
    );
  END IF;
  
  -- Check if booking is already completed
  IF v_booking_record.status = 'completed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cette réservation a déjà été complétée'
    );
  END IF;
  
  -- Get business details
  SELECT * INTO v_business_record
  FROM businesses
  WHERE id = p_business_id;
  
  -- Calculate amounts
  v_commission_amount := v_booking_record.total_price * v_business_record.commission_rate;
  v_salon_amount := v_booking_record.total_price - v_commission_amount;
  
  -- Calculate loyalty points (1 DH = 1 point)
  v_loyalty_points_earned := FLOOR(v_booking_record.total_price);
  
  -- Calculate wallet credit (5% cashback)
  v_wallet_credit := v_booking_record.total_price * v_cashback_percentage;
  
  -- Start transaction
  BEGIN
    -- Mark QR code as used
    UPDATE qr_codes
    SET is_used = true
    WHERE id = v_qr_code_record.id;
    
    -- Update booking status
    UPDATE bookings
    SET 
      status = 'completed',
      validated_at = now(),
      staff_id = p_staff_id,
      commission_calculated = true,
      updated_at = now()
    WHERE id = v_booking_record.id;
    
    -- Create booking validation record
    INSERT INTO booking_validations (
      booking_id,
      qr_code_id,
      business_id,
      validated_by,
      validated_at
    ) VALUES (
      v_booking_record.id,
      v_qr_code_record.id,
      p_business_id,
      p_staff_id,
      now()
    );
    
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
      v_business_record.commission_rate,
      v_booking_record.total_price,
      v_commission_amount,
      v_salon_amount,
      'pending',
      now()
    );
    
    -- Update business totals
    UPDATE businesses
    SET 
      total_commission_owed = COALESCE(total_commission_owed, 0) + v_commission_amount,
      total_validated_bookings = COALESCE(total_validated_bookings, 0) + 1,
      updated_at = now()
    WHERE id = p_business_id;
    
    -- If user is authenticated, update their profile and wallet
    IF v_booking_record.user_id IS NOT NULL THEN
      v_user_id := v_booking_record.user_id;
      
      -- Update user profile with loyalty points, wallet balance, and completed bookings
      UPDATE user_profiles
      SET 
        loyalty_points = COALESCE(loyalty_points, 0) + v_loyalty_points_earned,
        wallet_balance = COALESCE(wallet_balance, 0) + v_wallet_credit,
        completed_bookings_count = COALESCE(completed_bookings_count, 0) + 1,
        total_spent = COALESCE(total_spent, 0) + v_booking_record.total_price,
        updated_at = now()
      WHERE id = v_user_id;
      
      -- Create wallet transaction record for cashback
      INSERT INTO wallet_transactions (
        user_id,
        transaction_type,
        amount,
        description,
        booking_id
      ) VALUES (
        v_user_id,
        'cashback',
        v_wallet_credit,
        'Cashback 5% - ' || v_booking_record.deal_title,
        v_booking_record.id
      );
      
      -- Create notification for user
      INSERT INTO notifications (
        user_id,
        type,
        channel,
        title,
        content,
        related_booking_id,
        related_deal_id
      ) VALUES (
        v_user_id,
        'booking_completed',
        'in_app',
        'Service complété !',
        'Vous avez gagné ' || v_loyalty_points_earned || ' points et ' || ROUND(v_wallet_credit, 2) || ' DH dans votre portefeuille !',
        v_booking_record.id,
        v_booking_record.deal_id
      );
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Erreur lors de la validation: ' || SQLERRM
      );
  END;
  
  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_record.id,
    'customer_name', v_booking_record.customer_name,
    'service_name', v_booking_record.deal_title,
    'deal_amount', v_booking_record.total_price,
    'commission_amount', ROUND(v_commission_amount, 2),
    'salon_amount', ROUND(v_salon_amount, 2),
    'commission_rate', v_business_record.commission_rate,
    'loyalty_points_earned', v_loyalty_points_earned,
    'wallet_credit', ROUND(v_wallet_credit, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;