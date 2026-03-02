/*
  # Eliminate Duplicate QR Code Generation

  1. Problem Analysis
    - Trigger `trigger_generate_qr_code` creates QR code on booking INSERT (first QR - doesn't work)
    - Function `confirm_booking_and_generate_qr` creates another QR code on confirmation (second QR - works)
    - This creates 2 QR codes per booking, causing confusion

  2. Solution
    - DROP the automatic trigger completely
    - Remove the trigger function
    - Clean up existing duplicate QR codes
    - Ensure QR codes are ONLY generated when bookings are confirmed
    - Update booking flow to not expect QR codes until confirmation

  3. Changes
    - Remove trigger_generate_qr_code trigger
    - Remove generate_qr_code_for_booking function
    - Clean up duplicate QR codes (keep only the working ones)
    - Update booking table to remove qr_code_id foreign key dependency
    - Ensure QR codes are only created during confirmation process
*/

-- Step 1: Drop the problematic trigger that creates QR codes on booking insert
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;

-- Step 2: Drop the function that was creating the first (non-working) QR code
DROP FUNCTION IF EXISTS generate_qr_code_for_booking();

-- Step 3: Clean up duplicate QR codes - keep only the most recent one per booking
WITH duplicate_qr_codes AS (
  SELECT 
    booking_id,
    id,
    ROW_NUMBER() OVER (PARTITION BY booking_id ORDER BY created_at DESC) as rn
  FROM qr_codes
  WHERE booking_id IS NOT NULL
)
DELETE FROM qr_codes 
WHERE id IN (
  SELECT id FROM duplicate_qr_codes WHERE rn > 1
);

-- Step 4: Update bookings table to remove the qr_code_id foreign key dependency
-- This prevents the automatic expectation of QR codes on booking creation
DO $$
BEGIN
  -- Remove the foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bookings_qr_code_id_fkey' 
    AND table_name = 'bookings'
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_qr_code_id_fkey;
  END IF;
END $$;

-- Step 5: Set qr_code_id to NULL for all pending bookings (they shouldn't have QR codes yet)
UPDATE bookings 
SET qr_code_id = NULL 
WHERE status = 'pending';

-- Step 6: Ensure the confirm_booking_and_generate_qr function is the ONLY way to create QR codes
CREATE OR REPLACE FUNCTION confirm_booking_and_generate_qr(
  p_booking_id UUID,
  p_confirmed_datetime TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_deal deals%ROWTYPE;
  v_business businesses%ROWTYPE;
  v_qr_token TEXT;
  v_qr_code_id UUID;
  v_commission_amount NUMERIC(10,2);
  v_salon_amount NUMERIC(10,2);
  v_result JSON;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  -- Check if booking is already confirmed
  IF v_booking.status = 'confirmed' THEN
    RETURN json_build_object('success', false, 'error', 'Booking already confirmed');
  END IF;

  -- Get deal and business details
  SELECT * INTO v_deal FROM deals WHERE id = v_booking.deal_id;
  SELECT * INTO v_business FROM businesses WHERE id = v_deal.business_id;

  -- Check if QR code already exists for this booking (prevent duplicates)
  IF EXISTS (SELECT 1 FROM qr_codes WHERE booking_id = p_booking_id) THEN
    RETURN json_build_object('success', false, 'error', 'QR code already exists for this booking');
  END IF;

  -- Generate unique QR token with consistent format
  v_qr_token := 'QR_' || p_booking_id || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;

  -- Create QR code record
  INSERT INTO qr_codes (
    booking_id,
    qr_token,
    is_used,
    expires_at
  ) VALUES (
    p_booking_id,
    v_qr_token,
    false,
    p_confirmed_datetime + INTERVAL '30 days'
  ) RETURNING id INTO v_qr_code_id;

  -- Update booking status and link QR code
  UPDATE bookings 
  SET 
    status = 'confirmed',
    qr_code_id = v_qr_code_id,
    booking_date = p_confirmed_datetime,
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Calculate commission (15% of deal amount)
  v_commission_amount := v_deal.discounted_price * 0.15;
  v_salon_amount := v_deal.discounted_price - v_commission_amount;

  -- Create commission log
  INSERT INTO commission_logs (
    booking_id,
    business_id,
    commission_rate,
    deal_amount,
    commission_amount,
    salon_amount,
    status
  ) VALUES (
    p_booking_id,
    v_business.id,
    0.15,
    v_deal.discounted_price,
    v_commission_amount,
    v_salon_amount,
    'pending'
  );

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'qr_token', v_qr_token,
    'qr_code_id', v_qr_code_id,
    'commission_amount', v_commission_amount,
    'salon_amount', v_salon_amount
  );

  RETURN v_result;
END;
$$;

-- Step 7: Create a simple function to generate QR codes ONLY when needed (not automatically)
CREATE OR REPLACE FUNCTION generate_qr_for_confirmed_booking(p_booking_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr_token TEXT;
  v_booking_status TEXT;
BEGIN
  -- Check booking status
  SELECT status INTO v_booking_status FROM bookings WHERE id = p_booking_id;
  
  IF v_booking_status != 'confirmed' THEN
    RAISE EXCEPTION 'QR codes can only be generated for confirmed bookings';
  END IF;

  -- Check if QR already exists
  SELECT qr_token INTO v_qr_token FROM qr_codes WHERE booking_id = p_booking_id;
  
  IF FOUND THEN
    RETURN v_qr_token;
  END IF;

  -- Generate new QR token
  v_qr_token := 'QR_' || p_booking_id || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  
  -- Insert QR code
  INSERT INTO qr_codes (booking_id, qr_token, expires_at)
  VALUES (p_booking_id, v_qr_token, NOW() + INTERVAL '30 days');
  
  RETURN v_qr_token;
END;
$$;

-- Step 8: Add a comment to document the QR code generation policy
COMMENT ON TABLE qr_codes IS 'QR codes are generated ONLY when bookings are confirmed, not on initial booking creation';