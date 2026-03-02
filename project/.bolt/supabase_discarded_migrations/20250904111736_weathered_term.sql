/*
  # Fix QR Code Validation Function

  1. Function Updates
    - Fix QR token validation logic
    - Improve error handling and debugging
    - Add proper business verification
    - Handle expired QR codes gracefully

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.validate_booking_with_qr(text, uuid, uuid);

-- Create improved QR validation function
CREATE OR REPLACE FUNCTION public.validate_booking_with_qr(
    p_qr_token TEXT,
    p_business_id UUID,
    p_staff_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_qr_record RECORD;
    v_booking_record RECORD;
    v_deal_record RECORD;
    v_business_record RECORD;
    v_commission_amount NUMERIC;
    v_salon_amount NUMERIC;
    v_loyalty_points_earned INTEGER;
    v_result JSON;
BEGIN
    -- Debug: Log the input parameters
    RAISE NOTICE 'QR Validation - Token: %, Business: %, Staff: %', p_qr_token, p_business_id, p_staff_id;

    -- Step 1: Find QR code record
    SELECT 
        qr.id,
        qr.booking_id,
        qr.qr_token,
        qr.is_used,
        qr.expires_at
    INTO v_qr_record
    FROM qr_codes qr
    WHERE qr.qr_token = p_qr_token;

    -- Check if QR code exists
    IF v_qr_record.id IS NULL THEN
        RAISE NOTICE 'QR code not found: %', p_qr_token;
        v_result := json_build_object(
            'success', false,
            'error', 'Code QR invalide'
        );
        RETURN v_result;
    END IF;

    -- Check if QR code is already used
    IF v_qr_record.is_used THEN
        RAISE NOTICE 'QR code already used: %', p_qr_token;
        v_result := json_build_object(
            'success', false,
            'error', 'Ce code QR a déjà été utilisé'
        );
        RETURN v_result;
    END IF;

    -- Check if QR code is expired
    IF v_qr_record.expires_at < NOW() THEN
        RAISE NOTICE 'QR code expired: % (expired at: %)', p_qr_token, v_qr_record.expires_at;
        v_result := json_build_object(
            'success', false,
            'error', 'Ce code QR a expiré'
        );
        RETURN v_result;
    END IF;

    -- Step 2: Get booking details
    SELECT 
        b.id,
        b.deal_id,
        b.user_id,
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.status,
        b.total_price,
        b.booking_date
    INTO v_booking_record
    FROM bookings b
    WHERE b.id = v_qr_record.booking_id;

    -- Check if booking exists
    IF v_booking_record.id IS NULL THEN
        RAISE NOTICE 'Booking not found for QR: %', v_qr_record.booking_id;
        v_result := json_build_object(
            'success', false,
            'error', 'Réservation non trouvée'
        );
        RETURN v_result;
    END IF;

    -- Step 3: Get deal and business details
    SELECT 
        d.id,
        d.title,
        d.business_id,
        d.discounted_price,
        d.duration_minutes
    INTO v_deal_record
    FROM deals d
    WHERE d.id = v_booking_record.deal_id;

    -- Check if deal exists
    IF v_deal_record.id IS NULL THEN
        RAISE NOTICE 'Deal not found: %', v_booking_record.deal_id;
        v_result := json_build_object(
            'success', false,
            'error', 'Offre non trouvée'
        );
        RETURN v_result;
    END IF;

    -- Step 4: Verify business ownership
    SELECT 
        b.id,
        b.name,
        b.commission_rate,
        b.owner_id
    INTO v_business_record
    FROM businesses b
    WHERE b.id = v_deal_record.business_id;

    -- Check if business exists
    IF v_business_record.id IS NULL THEN
        RAISE NOTICE 'Business not found: %', v_deal_record.business_id;
        v_result := json_build_object(
            'success', false,
            'error', 'Établissement non trouvé'
        );
        RETURN v_result;
    END IF;

    -- Verify the scanning business matches the booking's business
    IF v_business_record.id != p_business_id THEN
        RAISE NOTICE 'Business mismatch - Expected: %, Got: %', v_business_record.id, p_business_id;
        v_result := json_build_object(
            'success', false,
            'error', 'Cette réservation n''appartient pas à cet établissement'
        );
        RETURN v_result;
    END IF;

    -- Verify staff has permission (is owner or authorized staff)
    IF v_business_record.owner_id != p_staff_id THEN
        RAISE NOTICE 'Staff not authorized - Owner: %, Staff: %', v_business_record.owner_id, p_staff_id;
        v_result := json_build_object(
            'success', false,
            'error', 'Vous n''êtes pas autorisé à valider cette réservation'
        );
        RETURN v_result;
    END IF;

    -- Check booking status
    IF v_booking_record.status != 'confirmed' THEN
        RAISE NOTICE 'Booking not confirmed - Status: %', v_booking_record.status;
        v_result := json_build_object(
            'success', false,
            'error', 'Cette réservation n''est pas confirmée'
        );
        RETURN v_result;
    END IF;

    -- Step 5: Process the validation
    BEGIN
        -- Mark QR code as used
        UPDATE qr_codes
        SET 
            is_used = true
        WHERE id = v_qr_record.id;

        -- Update booking status to completed
        UPDATE bookings
        SET 
            status = 'completed',
            validated_at = NOW(),
            updated_at = NOW()
        WHERE id = v_booking_record.id;

        -- Calculate commission
        v_commission_amount := v_booking_record.total_price * v_business_record.commission_rate;
        v_salon_amount := v_booking_record.total_price - v_commission_amount;

        -- Update commission log status to paid
        UPDATE commission_logs
        SET 
            status = 'paid',
            validated_at = NOW()
        WHERE booking_id = v_booking_record.id;

        -- Award loyalty points to customer (1 point per 10 DH)
        IF v_booking_record.user_id IS NOT NULL THEN
            v_loyalty_points_earned := FLOOR(v_booking_record.total_price / 10);
            
            UPDATE user_profiles
            SET 
                loyalty_points = loyalty_points + v_loyalty_points_earned,
                completed_bookings_count = completed_bookings_count + 1,
                updated_at = NOW()
            WHERE id = v_booking_record.user_id;
        ELSE
            v_loyalty_points_earned := 0;
        END IF;

        -- Create validation record
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

        -- Build success response
        v_result := json_build_object(
            'success', true,
            'booking_id', v_booking_record.id,
            'customer_name', v_booking_record.customer_name,
            'service_name', v_deal_record.title,
            'deal_amount', v_booking_record.total_price,
            'commission_amount', v_commission_amount,
            'salon_amount', v_salon_amount,
            'commission_rate', v_business_record.commission_rate,
            'loyalty_points_earned', v_loyalty_points_earned,
            'validated_at', NOW()
        );

        RAISE NOTICE 'QR validation successful for booking: %', v_booking_record.id;
        RETURN v_result;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'QR validation failed with error: %', SQLERRM;
            v_result := json_build_object(
                'success', false,
                'error', 'Erreur lors de la validation: ' || SQLERRM
            );
            RETURN v_result;
    END;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_booking_with_qr(text, uuid, uuid) TO authenticated;