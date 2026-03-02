/*
  # Add QR Code Generation and Booking Notifications

  1. Changes
    - Creates function to generate QR codes for confirmed bookings
    - Creates function to send notifications when bookings are confirmed
    - Creates trigger to automatically generate QR codes and send notifications
    
  2. Security
    - Functions use SECURITY DEFINER to have necessary permissions
*/

-- Function to generate QR code for a booking
CREATE OR REPLACE FUNCTION generate_qr_code_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_qr_token text;
  v_expires_at timestamptz;
BEGIN
  -- Only generate QR code if status is confirmed and qr_code_id is null
  IF NEW.status = 'confirmed' AND NEW.qr_code_id IS NULL THEN
    -- Generate a unique QR token
    v_qr_token := encode(gen_random_bytes(16), 'hex');
    
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

-- Create trigger for QR code generation
DROP TRIGGER IF EXISTS trigger_generate_qr_code_for_booking ON bookings;
CREATE TRIGGER trigger_generate_qr_code_for_booking
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
  EXECUTE FUNCTION generate_qr_code_for_booking();