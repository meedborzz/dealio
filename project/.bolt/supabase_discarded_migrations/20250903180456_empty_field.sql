/*
  # Create notification function for booking confirmations

  1. Functions
    - `send_booking_notification` - Sends notification when booking is confirmed
    
  2. Triggers
    - Trigger on bookings table to send notification when status changes to confirmed
*/

-- Function to send booking notification
CREATE OR REPLACE FUNCTION send_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Insert notification
    INSERT INTO notifications (
      user_id,
      type,
      channel,
      title,
      content,
      data,
      related_booking_id
    ) VALUES (
      NEW.user_id,
      'booking_confirmation',
      'in_app',
      'Réservation confirmée!',
      'Votre réservation a été confirmée. Votre code QR est maintenant disponible.',
      jsonb_build_object(
        'booking_id', NEW.id,
        'redirect_url', '/bookings/' || NEW.id || '/qr'
      ),
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_send_booking_notification ON bookings;
CREATE TRIGGER trigger_send_booking_notification
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION send_booking_notification();