/*
  # Fix QR Code Generation Inconsistency

  1. Issues Fixed
    - Remove duplicate QR code generation trigger that creates invalid tokens
    - Ensure only one QR code is generated per booking with correct format
    - Update validation function to handle correct token format
    - Clean up existing invalid QR codes

  2. Changes Made
    - Drop the problematic trigger_generate_qr_code
    - Update generate_qr_code_for_booking function to use correct format
    - Ensure confirm_booking_and_generate_qr creates proper tokens
    - Clean up duplicate/invalid QR codes

  3. QR Token Format
    - Correct format: QR_<booking_id>_<timestamp>
    - Example: QR_11094663-94d6-49c3-9a24-986d823f3c3c_1756991973
*/

-- First, drop the problematic trigger that creates duplicate QR codes
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;

-- Drop the old function that generates incorrect QR tokens
DROP FUNCTION IF EXISTS generate_qr_code_for_booking();

-- Create the correct QR code generation function
CREATE OR REPLACE FUNCTION generate_qr_code_for_booking()
RETURNS TRIGGER AS $$
DECLARE
    qr_token_value TEXT;
    qr_expires_at TIMESTAMPTZ;
    new_qr_id UUID;
BEGIN
    -- Only generate QR code when booking is confirmed, not on initial insert
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        -- Generate QR token in the correct format: QR_<booking_id>_<timestamp>
        qr_token_value := 'QR_' || NEW.id::TEXT || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
        
        -- Set expiration to 30 days from now
        qr_expires_at := NOW() + INTERVAL '30 days';
        
        -- Insert the QR code
        INSERT INTO qr_codes (booking_id, qr_token, expires_at, is_used)
        VALUES (NEW.id, qr_token_value, qr_expires_at, false)
        RETURNING id INTO new_qr_id;
        
        -- Update the booking to reference this QR code
        UPDATE bookings 
        SET qr_code_id = new_qr_id 
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger only for confirmed bookings
CREATE TRIGGER trigger_generate_qr_code_on_confirm
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_qr_code_for_booking();

-- Update the validation function to handle the correct token format
CREATE OR REPLACE FUNCTION validate_booking_with_qr(
    p_qr_token TEXT,
    p_business_id UUID,
    p_staff_id UUID
) RETURNS JSON AS $$
DECLARE
    qr_record RECORD;
    booking_record RECORD;
    deal_record RECORD;
    business_record RECORD;
    commission_amount NUMERIC;
    salon_amount NUMERIC;
    result JSON;
BEGIN
    -- Find the QR code
    SELECT * INTO qr_record
    FROM qr_codes
    WHERE qr_token = p_qr_token;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Code QR invalide ou introuvable'
        );
    END IF;
    
    -- Check if QR code is already used
    IF qr_record.is_used THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ce code QR a déjà été utilisé'
        );
    END IF;
    
    -- Check if QR code is expired
    IF qr_record.expires_at < NOW() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ce code QR a expiré'
        );
    END IF;
    
    -- Get booking details
    SELECT * INTO booking_record
    FROM bookings
    WHERE id = qr_record.booking_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Réservation introuvable'
        );
    END IF;
    
    -- Get deal details
    SELECT * INTO deal_record
    FROM deals
    WHERE id = booking_record.deal_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Offre introuvable'
        );
    END IF;
    
    -- Verify business ownership
    SELECT * INTO business_record
    FROM businesses
    WHERE id = deal_record.business_id AND id = p_business_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Vous n''êtes pas autorisé à valider cette réservation'
        );
    END IF;
    
    -- Calculate commission (15% default)
    commission_amount := booking_record.total_price * COALESCE(business_record.commission_rate, 0.15);
    salon_amount := booking_record.total_price - commission_amount;
    
    -- Mark QR code as used
    UPDATE qr_codes 
    SET is_used = true 
    WHERE id = qr_record.id;
    
    -- Update booking status to completed
    UPDATE bookings 
    SET 
        status = 'completed',
        validated_at = NOW(),
        commission_calculated = true
    WHERE id = booking_record.id;
    
    -- Log commission
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
        booking_record.id,
        business_record.id,
        COALESCE(business_record.commission_rate, 0.15),
        booking_record.total_price,
        commission_amount,
        salon_amount,
        'pending',
        NOW()
    );
    
    -- Update business totals
    UPDATE businesses 
    SET 
        total_commission_owed = total_commission_owed + commission_amount,
        total_validated_bookings = total_validated_bookings + 1
    WHERE id = business_record.id;
    
    -- Award loyalty points to customer (1 point per DH spent)
    IF booking_record.user_id IS NOT NULL THEN
        UPDATE user_profiles 
        SET loyalty_points = loyalty_points + booking_record.total_price::INTEGER
        WHERE id = booking_record.user_id;
    END IF;
    
    -- Create validation record
    INSERT INTO booking_validations (
        booking_id,
        qr_code_id,
        business_id,
        validated_by,
        validated_at
    ) VALUES (
        booking_record.id,
        qr_record.id,
        business_record.id,
        p_staff_id,
        NOW()
    );
    
    -- Return success with details
    RETURN json_build_object(
        'success', true,
        'booking_id', booking_record.id,
        'customer_name', booking_record.customer_name,
        'service_name', deal_record.title,
        'deal_amount', booking_record.total_price,
        'commission_amount', commission_amount,
        'salon_amount', salon_amount,
        'commission_rate', COALESCE(business_record.commission_rate, 0.15),
        'loyalty_points_earned', booking_record.total_price::INTEGER
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la validation: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up existing duplicate/invalid QR codes
-- Keep only the most recent QR code for each booking
WITH ranked_qr_codes AS (
    SELECT 
        id,
        booking_id,
        qr_token,
        ROW_NUMBER() OVER (PARTITION BY booking_id ORDER BY created_at DESC) as rn
    FROM qr_codes
),
qr_codes_to_delete AS (
    SELECT id 
    FROM ranked_qr_codes 
    WHERE rn > 1
)
DELETE FROM qr_codes 
WHERE id IN (SELECT id FROM qr_codes_to_delete);

-- Update bookings to reference the correct (remaining) QR code
UPDATE bookings 
SET qr_code_id = (
    SELECT qr.id 
    FROM qr_codes qr 
    WHERE qr.booking_id = bookings.id 
    ORDER BY qr.created_at DESC 
    LIMIT 1
)
WHERE qr_code_id IS NULL OR qr_code_id NOT IN (
    SELECT id FROM qr_codes WHERE booking_id = bookings.id
);

-- Create improved confirm_booking_and_generate_qr function
CREATE OR REPLACE FUNCTION confirm_booking_and_generate_qr(
    p_booking_id UUID,
    p_confirmed_datetime TIMESTAMPTZ
) RETURNS JSON AS $$
DECLARE
    booking_record RECORD;
    qr_token_value TEXT;
    qr_expires_at TIMESTAMPTZ;
    new_qr_id UUID;
    result JSON;
BEGIN
    -- Get booking details
    SELECT * INTO booking_record
    FROM bookings
    WHERE id = p_booking_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Réservation introuvable'
        );
    END IF;
    
    -- Check if booking is already confirmed
    IF booking_record.status = 'confirmed' THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Cette réservation est déjà confirmée'
        );
    END IF;
    
    -- Delete any existing QR codes for this booking to prevent duplicates
    DELETE FROM qr_codes WHERE booking_id = p_booking_id;
    
    -- Generate new QR token in correct format
    qr_token_value := 'QR_' || p_booking_id::TEXT || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
    qr_expires_at := p_confirmed_datetime + INTERVAL '30 days';
    
    -- Insert new QR code
    INSERT INTO qr_codes (booking_id, qr_token, expires_at, is_used)
    VALUES (p_booking_id, qr_token_value, qr_expires_at, false)
    RETURNING id INTO new_qr_id;
    
    -- Update booking with confirmation and QR code reference
    UPDATE bookings 
    SET 
        status = 'confirmed',
        booking_date = p_confirmed_datetime,
        qr_code_id = new_qr_id,
        updated_at = NOW()
    WHERE id = p_booking_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Réservation confirmée avec succès',
        'qr_token', qr_token_value,
        'qr_code_id', new_qr_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Erreur lors de la confirmation: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;