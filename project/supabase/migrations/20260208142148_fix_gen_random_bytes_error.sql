/*
  # Fix gen_random_bytes Function Error

  1. Changes
    - Drop and recreate generate_qr_code_for_booking function with proper extension references
    - Drop and recreate create_booking function with proper extension references
    - Ensures pgcrypto functions are accessible in the proper schema

  2. Security
    - Maintains SECURITY DEFINER for necessary permissions
    - No changes to RLS policies

  3. Notes
    - The error occurs because gen_random_bytes needs explicit extension reference
    - This migration ensures all cryptographic functions are properly accessible
*/

-- First ensure pgcrypto is enabled (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Drop and recreate the QR code generation function with proper schema reference
DROP FUNCTION IF EXISTS generate_qr_code_for_booking() CASCADE;

CREATE OR REPLACE FUNCTION generate_qr_code_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_qr_token text;
  v_expires_at timestamptz;
BEGIN
  -- Only generate QR code if status is confirmed and qr_code_id is null
  IF NEW.status = 'confirmed' AND NEW.qr_code_id IS NULL THEN
    -- Generate a unique QR token using pgcrypto extension
    v_qr_token := encode(extensions.gen_random_bytes(16), 'hex');
    
    -- Set expiration to 24 hours after booking date
    v_expires_at := NEW.booking_date + interval '24 hours';
    
    -- Insert QR code
    INSERT INTO qr_codes (qr_token, booking_id, expires_at, is_used)
    VALUES (v_qr_token, NEW.id, v_expires_at, false)
    RETURNING id INTO NEW.qr_code_id;
    
    -- Create in-app notification for user
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO notifications (
        user_id,
        type,
        channel,
        title,
        content,
        related_booking_id,
        related_deal_id
      )
      VALUES (
        NEW.user_id,
        'booking_confirmation',
        'in_app',
        'Réservation confirmée',
        'Votre réservation a été confirmée ! Votre code QR est maintenant disponible.',
        NEW.id,
        NEW.deal_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_generate_qr_code_for_booking ON bookings;
CREATE TRIGGER trigger_generate_qr_code_for_booking
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
  EXECUTE FUNCTION generate_qr_code_for_booking();

-- Now fix the create_booking function
DROP FUNCTION IF EXISTS create_booking(uuid, uuid, uuid, text, text, text, date, time, uuid);

CREATE OR REPLACE FUNCTION create_booking(
  p_user_id uuid,
  p_deal_id uuid,
  p_time_slot_id uuid,
  p_guest_name text DEFAULT NULL,
  p_guest_email text DEFAULT NULL,
  p_guest_phone text DEFAULT NULL,
  p_booking_date date DEFAULT NULL,
  p_preferred_time time DEFAULT NULL,
  p_guest_session_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_booking_id uuid;
  v_business_id uuid;
  v_slot_start_time time;
  v_business_name text;
  v_booking_token uuid;
  v_qr_code text;
BEGIN
  SELECT business_id INTO v_business_id
  FROM deals
  WHERE id = p_deal_id;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Deal not found';
  END IF;

  SELECT name INTO v_business_name
  FROM businesses
  WHERE id = v_business_id;

  IF p_time_slot_id IS NOT NULL THEN
    SELECT start_time INTO v_slot_start_time
    FROM time_slots
    WHERE id = p_time_slot_id AND business_id = v_business_id;

    IF v_slot_start_time IS NULL THEN
      RAISE EXCEPTION 'Time slot not found';
    END IF;
  END IF;

  v_booking_token := gen_random_uuid();
  -- Use proper schema reference for gen_random_bytes
  v_qr_code := encode(extensions.gen_random_bytes(32), 'base64');

  INSERT INTO bookings (
    user_id,
    deal_id,
    time_slot_id,
    business_id,
    status,
    booking_token,
    qr_code,
    guest_name,
    guest_email,
    guest_phone,
    guest_session_id,
    booking_date,
    preferred_time
  )
  VALUES (
    p_user_id,
    p_deal_id,
    p_time_slot_id,
    v_business_id,
    'pending',
    v_booking_token,
    v_qr_code,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_guest_session_id,
    p_booking_date,
    p_preferred_time
  )
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
