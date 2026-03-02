/*
  # Secure QR Validation System with Commission Accrual

  1. Database Functions
    - `app.validate_booking_with_qr()` - Secure QR validation with commission calculation
    - Auto QR generation trigger for confirmed bookings

  2. Security Enhancements
    - Tightened RLS policies for all validation-related tables
    - Unique constraints and proper indexing
    - Audit trail for all validation attempts

  3. Commission System
    - Automatic commission calculation on validation
    - Proper rounding and status tracking
    - Audit logs for financial transparency

  4. QR Code Management
    - Time-limited QR codes (72 hours)
    - One-time use enforcement
    - Business ownership validation
*/

-- Create app schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Add missing columns to existing tables
DO $$
BEGIN
  -- Add used_at to qr_codes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'used_at'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN used_at timestamptz;
  END IF;

  -- Add validated_by to bookings if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'validated_by'
  ) THEN
    ALTER TABLE bookings ADD COLUMN validated_by uuid REFERENCES auth.users(id);
  END IF;

  -- Add total_amount to bookings if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE bookings ADD COLUMN total_amount numeric;
  END IF;

  -- Add method and result to booking_validations if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_validations' AND column_name = 'method'
  ) THEN
    ALTER TABLE booking_validations ADD COLUMN method text DEFAULT 'qr_scan';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_validations' AND column_name = 'result'
  ) THEN
    ALTER TABLE booking_validations ADD COLUMN result text DEFAULT 'success';
  END IF;
END $$;

-- Create unique index on qr_token if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'qr_codes' AND indexname = 'idx_qr_codes_token_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_qr_codes_token_unique ON qr_codes(qr_token);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_commission_logs_status ON commission_logs(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_business_lookup ON qr_codes(qr_token, is_used, expires_at);

-- Main validation function
CREATE OR REPLACE FUNCTION app.validate_booking_with_qr(
  p_qr_token text,
  p_business_id uuid,
  p_staff_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr_record qr_codes%ROWTYPE;
  v_booking_record bookings%ROWTYPE;
  v_deal_record deals%ROWTYPE;
  v_business_record businesses%ROWTYPE;
  v_commission_amount numeric;
  v_result jsonb;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock and validate QR code
    SELECT * INTO v_qr_record
    FROM qr_codes
    WHERE qr_token = p_qr_token
    FOR UPDATE;

    -- Check if QR code exists
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Code QR invalide');
    END IF;

    -- Check if already used
    IF v_qr_record.is_used THEN
      RETURN jsonb_build_object('error', 'Code QR déjà utilisé');
    END IF;

    -- Check if expired
    IF v_qr_record.expires_at < NOW() THEN
      RETURN jsonb_build_object('error', 'Code QR expiré');
    END IF;

    -- Get booking details
    SELECT * INTO v_booking_record
    FROM bookings
    WHERE id = v_qr_record.booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Réservation introuvable');
    END IF;

    -- Check if booking is confirmed
    IF v_booking_record.status != 'confirmed' THEN
      RETURN jsonb_build_object('error', 'Réservation non confirmée');
    END IF;

    -- Get deal and business details
    SELECT * INTO v_deal_record
    FROM deals
    WHERE id = v_booking_record.deal_id;

    SELECT * INTO v_business_record
    FROM businesses
    WHERE id = v_deal_record.business_id;

    -- Verify business ownership
    IF v_business_record.id != p_business_id THEN
      RETURN jsonb_build_object('error', 'Code QR non valide pour ce salon');
    END IF;

    -- Calculate commission
    v_commission_amount := ROUND(
      COALESCE(v_booking_record.total_amount, v_deal_record.discounted_price) * 
      v_business_record.commission_rate, 
      2
    );

    -- Mark QR as used
    UPDATE qr_codes
    SET 
      is_used = true,
      used_at = NOW()
    WHERE id = v_qr_record.id;

    -- Update booking status
    UPDATE bookings
    SET 
      status = 'completed',
      validated_at = NOW(),
      validated_by = p_staff_id,
      commission_calculated = true
    WHERE id = v_booking_record.id;

    -- Insert commission log
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
      v_business_record.id,
      v_business_record.commission_rate,
      COALESCE(v_booking_record.total_amount, v_deal_record.discounted_price),
      v_commission_amount,
      COALESCE(v_booking_record.total_amount, v_deal_record.discounted_price) - v_commission_amount,
      'accrued',
      NOW()
    );

    -- Update business commission totals
    UPDATE businesses
    SET 
      total_commission_owed = total_commission_owed + v_commission_amount,
      total_validated_bookings = total_validated_bookings + 1
    WHERE id = v_business_record.id;

    -- Insert audit record
    INSERT INTO booking_validations (
      booking_id,
      qr_code_id,
      business_id,
      validated_by,
      method,
      result,
      validated_at
    ) VALUES (
      v_booking_record.id,
      v_qr_record.id,
      v_business_record.id,
      p_staff_id,
      'qr_scan',
      'success',
      NOW()
    );

    -- Return success
    RETURN jsonb_build_object(
      'ok', true,
      'booking_id', v_booking_record.id,
      'commission_amount', v_commission_amount,
      'customer_name', v_booking_record.customer_name,
      'service_name', v_deal_record.title
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Log failed validation attempt
      INSERT INTO booking_validations (
        booking_id,
        qr_code_id,
        business_id,
        validated_by,
        method,
        result,
        validated_at
      ) VALUES (
        COALESCE(v_booking_record.id, NULL),
        COALESCE(v_qr_record.id, NULL),
        p_business_id,
        p_staff_id,
        'qr_scan',
        'error',
        NOW()
      );
      
      RETURN jsonb_build_object('error', 'Erreur lors de la validation: ' || SQLERRM);
  END;
END;
$$;

-- Function to generate QR code for confirmed bookings
CREATE OR REPLACE FUNCTION app.generate_qr_for_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_qr_token text;
  v_expires_at timestamptz;
BEGIN
  -- Only generate QR for confirmed bookings
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Generate unique QR token
    v_qr_token := 'QR_' || NEW.id || '_' || EXTRACT(EPOCH FROM NOW())::bigint;
    v_expires_at := NOW() + INTERVAL '72 hours';

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
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for QR generation
DROP TRIGGER IF EXISTS trg_generate_qr ON bookings;
CREATE TRIGGER trg_generate_qr
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION app.generate_qr_for_booking();

-- Tighten RLS policies

-- Bookings RLS
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Business owners can view bookings for their deals" ON bookings;
DROP POLICY IF EXISTS "Business owners can update booking status" ON bookings;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Business staff can view their business bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id 
      AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business staff can update their business bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id 
      AND b.owner_id = auth.uid()
    )
  );

-- QR Codes RLS
DROP POLICY IF EXISTS "Users can view their own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Business owners can view their QR codes" ON qr_codes;

CREATE POLICY "Users can view their booking QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = qr_codes.booking_id 
      AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "Business staff can view their business QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN deals d ON d.id = b.deal_id
      JOIN businesses bus ON bus.id = d.business_id
      WHERE b.id = qr_codes.booking_id 
      AND bus.owner_id = auth.uid()
    )
  );

-- Commission Logs RLS
DROP POLICY IF EXISTS "Business owners can view their commission logs" ON commission_logs;

CREATE POLICY "Business staff can view their commission logs"
  ON commission_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = commission_logs.business_id 
      AND b.owner_id = auth.uid()
    )
  );

-- Booking Validations RLS
DROP POLICY IF EXISTS "Business owners can view their validations" ON booking_validations;
DROP POLICY IF EXISTS "Business owners can create validations" ON booking_validations;

CREATE POLICY "Business staff can view their validations"
  ON booking_validations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = booking_validations.business_id 
      AND b.owner_id = auth.uid()
    )
  );

-- Only the edge function can insert validations (via service role)
CREATE POLICY "Service role can insert validations"
  ON booking_validations FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA app TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app.validate_booking_with_qr TO service_role;
GRANT EXECUTE ON FUNCTION app.generate_qr_for_booking TO service_role;