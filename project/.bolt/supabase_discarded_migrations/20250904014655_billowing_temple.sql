/*
  # Fix QR codes RLS violation for booking confirmation

  1. Database Function
    - `confirm_booking_and_generate_qr` function with SECURITY DEFINER
    - Handles booking confirmation and QR code generation in one transaction
    - Bypasses RLS policies for QR code insertion

  2. Security
    - Function validates business ownership before proceeding
    - Ensures only authorized business owners can confirm their bookings
    - Maintains data integrity with proper error handling
*/

CREATE OR REPLACE FUNCTION public.confirm_booking_and_generate_qr(
    p_booking_id uuid,
    p_confirmed_datetime timestamptz
)
RETURNS TABLE (
    success boolean,
    message text,
    qr_token text
)
LANGUAGE plpgsql
SECURITY DEFINER -- Crucial to bypass RLS for qr_codes table
AS $$
DECLARE
    v_qr_token text;
    v_expires_at timestamptz;
    v_qr_code_id uuid;
    v_current_booking_status text;
    v_business_id uuid;
    v_deal_id uuid;
    v_user_id uuid;
BEGIN
    -- Get booking details and verify it exists
    SELECT b.status, d.business_id, b.deal_id, b.user_id
    INTO v_current_booking_status, v_business_id, v_deal_id, v_user_id
    FROM public.bookings b
    JOIN public.deals d ON b.deal_id = d.id
    WHERE b.id = p_booking_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Booking not found'::text, NULL::text;
        RETURN;
    END IF;

    -- Verify the current user owns the business
    IF NOT EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = v_business_id AND owner_id = auth.uid()
    ) THEN
        RETURN QUERY SELECT FALSE, 'Unauthorized: You do not own this business'::text, NULL::text;
        RETURN;
    END IF;

    IF v_current_booking_status = 'confirmed' THEN
        RETURN QUERY SELECT FALSE, 'Booking already confirmed'::text, NULL::text;
        RETURN;
    END IF;

    -- Update booking status and date
    UPDATE public.bookings
    SET
        status = 'confirmed',
        booking_date = p_confirmed_datetime,
        updated_at = NOW()
    WHERE id = p_booking_id;

    -- Generate QR code
    v_qr_token := 'QR_' || EXTRACT(EPOCH FROM NOW())::text || '_' || MD5(RANDOM()::text);
    v_expires_at := p_confirmed_datetime + INTERVAL '24 hours';

    INSERT INTO public.qr_codes (booking_id, qr_token, expires_at, is_used)
    VALUES (p_booking_id, v_qr_token, v_expires_at, FALSE)
    RETURNING id INTO v_qr_code_id;

    -- Link QR code to booking
    UPDATE public.bookings
    SET qr_code_id = v_qr_code_id
    WHERE id = p_booking_id;

    -- Return success
    RETURN QUERY SELECT TRUE, 'Booking confirmed and QR code generated successfully'::text, v_qr_token;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, SQLERRM::text, NULL::text;
END;
$$;