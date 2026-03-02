/*
  # Enhanced Booking System Triggers

  1. QR Code Generation
    - Automatic QR code creation for confirmed bookings
    - Secure token generation with expiry
    
  2. Business Rating Updates
    - Automatic rating recalculation when reviews are added/updated
    - Review count maintenance
    
  3. Notification Triggers
    - Booking confirmation notifications
    - Status change notifications
*/

-- Enhanced QR code generation function
CREATE OR REPLACE FUNCTION generate_qr_code_for_booking() RETURNS TRIGGER AS $$
DECLARE
  v_qr_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_qr_id UUID;
BEGIN
  -- Only generate QR for confirmed bookings
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    -- Generate unique QR token
    v_qr_token := 'QR_' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8)) || '_' || 
                  UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
    
    -- Set expiry to 30 days from booking date or 7 days from now, whichever is later
    v_expires_at := GREATEST(
      NEW.booking_date + INTERVAL '30 days',
      NOW() + INTERVAL '7 days'
    );
    
    -- Insert QR code
    INSERT INTO qr_codes (
      booking_id,
      qr_token,
      is_used,
      expires_at
    ) VALUES (
      NEW.id,
      v_qr_token,
      false,
      v_expires_at
    ) RETURNING id INTO v_qr_id;
    
    -- Update booking with QR code reference
    UPDATE bookings 
    SET qr_code_id = v_qr_id 
    WHERE id = NEW.id;
    
    RAISE LOG 'QR code generated for booking %: %', NEW.id, v_qr_token;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced business rating update function
CREATE OR REPLACE FUNCTION update_business_rating() RETURNS TRIGGER AS $$
DECLARE
  v_business_id UUID;
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
BEGIN
  -- Get business ID from the review
  IF TG_OP = 'DELETE' THEN
    v_business_id := OLD.business_id;
  ELSE
    v_business_id := NEW.business_id;
  END IF;
  
  -- Calculate new average rating and count
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM reviews 
  WHERE business_id = v_business_id;
  
  -- Update business with new rating
  UPDATE businesses 
  SET 
    rating = ROUND(v_avg_rating, 1),
    review_count = v_review_count,
    updated_at = NOW()
  WHERE id = v_business_id;
  
  RAISE LOG 'Business % rating updated: % (% reviews)', v_business_id, v_avg_rating, v_review_count;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send booking notifications (placeholder for edge function integration)
CREATE OR REPLACE FUNCTION notify_booking_status_change() RETURNS TRIGGER AS $$
BEGIN
  -- Log the status change for notification processing
  RAISE LOG 'Booking % status changed from % to %', NEW.id, OLD.status, NEW.status;
  
  -- In a real implementation, this would trigger an edge function
  -- or insert into a notifications queue table
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers with enhanced functions
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;
CREATE TRIGGER trigger_generate_qr_code
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_code_for_booking();

DROP TRIGGER IF EXISTS trigger_update_business_rating ON reviews;
CREATE TRIGGER trigger_update_business_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_business_rating();

-- Add booking status change notification trigger
DROP TRIGGER IF EXISTS trigger_booking_status_notification ON bookings;
CREATE TRIGGER trigger_booking_status_notification
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_booking_status_change();

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, booking_date);
CREATE INDEX IF NOT EXISTS idx_qr_codes_booking_lookup ON qr_codes(booking_id) WHERE NOT is_used;
CREATE INDEX IF NOT EXISTS idx_commission_logs_business_status ON commission_logs(business_id, status, validated_at DESC);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_qr_code_for_booking() TO authenticated;
GRANT EXECUTE ON FUNCTION update_business_rating() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_booking_status_change() TO authenticated;