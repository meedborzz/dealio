/*
  # Fix QR codes RLS policy and function security

  1. Security Changes
    - Update confirm_booking_and_generate_qr function to run with SECURITY DEFINER
    - Add RLS policy for system functions to insert QR codes
    
  2. Function Updates
    - Set function to run with owner privileges
    - Ensure proper error handling for RLS violations
*/

-- Update the function to run with SECURITY DEFINER (owner privileges)
CREATE OR REPLACE FUNCTION public.confirm_booking_and_generate_qr(
    p_booking_id UUID,
    p_confirmed_datetime TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    booking_id UUID,
    qr_token TEXT,
    service_name TEXT,
    customer_name TEXT,
    deal_amount NUMERIC,
    commission_amount NUMERIC,
    salon_amount NUMERIC,
    commission_rate NUMERIC,
    loyalty_points_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS policies
SET search_path = public
AS $$
DECLARE
    v_booking_status booking_status;
    v_deal_id UUID;
    v_user_id UUID;
    v_customer_name TEXT;
    v_service_name TEXT;
    v_deal_price NUMERIC;
    v_business_id UUID;
    v_commission_rate NUMERIC;
    v_qr_token TEXT;
    v_qr_code_id UUID;
    v_loyalty_points_earned INTEGER;
    v_time_slot_id UUID;
    v_available_spots INTEGER;
    v_commission_amount NUMERIC;
    v_salon_amount NUMERIC;
BEGIN
    -- Fetch booking details
    SELECT
        b.status,
        b.deal_id,
        b.user_id,
        b.customer_name,
        d.title,
        d.discounted_price,
        d.business_id,
        bus.commission_rate,
        b.time_slot_id
    INTO
        v_booking_status,
        v_deal_id,
        v_user_id,
        v_customer_name,
        v_service_name,
        v_deal_price,
        v_business_id,
        v_commission_rate,
        v_time_slot_id
    FROM
        bookings b
    JOIN
        deals d ON b.deal_id = d.id
    JOIN
        businesses bus ON d.business_id = bus.id
    WHERE
        b.id = p_booking_id;

    -- Check if booking exists
    IF v_booking_status IS NULL THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN, 
            'Booking not found'::TEXT, 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Check if booking is already confirmed or cancelled
    IF v_booking_status <> 'pending' THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN, 
            'Booking is not in pending status'::TEXT, 
            p_booking_id::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Generate unique QR token
    v_qr_token := 'QR_' || replace(gen_random_uuid()::TEXT, '-', '');

    -- Insert into qr_codes table
    INSERT INTO qr_codes (booking_id, qr_token, expires_at)
    VALUES (p_booking_id, v_qr_token, p_confirmed_datetime + INTERVAL '24 hours')
    RETURNING id INTO v_qr_code_id;

    -- Update booking status and link QR code
    UPDATE bookings
    SET
        status = 'confirmed',
        qr_code_id = v_qr_code_id,
        validated_at = p_confirmed_datetime,
        updated_at = now()
    WHERE
        id = p_booking_id;

    -- Update time slot availability if time slot exists
    IF v_time_slot_id IS NOT NULL THEN
        SELECT available_spots INTO v_available_spots FROM time_slots WHERE id = v_time_slot_id;
        IF v_available_spots IS NOT NULL AND v_available_spots > 0 THEN
            UPDATE time_slots
            SET
                available_spots = available_spots - 1,
                is_available = (available_spots - 1) > 0
            WHERE
                id = v_time_slot_id;
        END IF;
    END IF;

    -- Calculate commission
    v_commission_amount := v_deal_price * v_commission_rate;
    v_salon_amount := v_deal_price - v_commission_amount;

    -- Log commission
    INSERT INTO commission_logs (booking_id, business_id, commission_rate, deal_amount, commission_amount, salon_amount, status, validated_at)
    VALUES (p_booking_id, v_business_id, v_commission_rate, v_deal_price, v_commission_amount, v_salon_amount, 'pending', p_confirmed_datetime);

    -- Update business total commission owed and validated bookings count
    UPDATE businesses
    SET
        total_commission_owed = total_commission_owed + v_commission_amount,
        total_validated_bookings = total_validated_bookings + 1
    WHERE
        id = v_business_id;

    -- Update user loyalty points (1 point per 10 DH spent)
    IF v_user_id IS NOT NULL THEN
        v_loyalty_points_earned := FLOOR(v_deal_price / 10);
        UPDATE user_profiles
        SET
            loyalty_points = loyalty_points + v_loyalty_points_earned,
            completed_bookings_count = completed_bookings_count + 1
        WHERE
            id = v_user_id;
    ELSE
        v_loyalty_points_earned := 0;
    END IF;

    -- Return success and relevant data
    RETURN QUERY SELECT
        TRUE::BOOLEAN,
        'Booking confirmed and QR code generated successfully'::TEXT,
        p_booking_id::UUID,
        v_qr_token::TEXT,
        v_service_name::TEXT,
        v_customer_name::TEXT,
        v_deal_price::NUMERIC,
        v_commission_amount::NUMERIC,
        v_salon_amount::NUMERIC,
        v_commission_rate::NUMERIC,
        v_loyalty_points_earned::INTEGER;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE::BOOLEAN, 
            SQLERRM::TEXT, 
            NULL::UUID, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::TEXT, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::NUMERIC, 
            NULL::INTEGER;
END;
$$;

-- Add RLS policy to allow system functions to insert QR codes
CREATE POLICY "System functions can insert QR codes"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION confirm_booking_and_generate_qr TO authenticated;