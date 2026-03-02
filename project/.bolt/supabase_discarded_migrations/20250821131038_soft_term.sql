/*
  # Commission-Based QR System Migration

  1. New Tables
    - `qr_codes` - One-time QR codes for bookings
    - `commission_logs` - Track commission calculations
    - `offline_bookings` - Salon-entered offline bookings
    - `booking_validations` - Track QR code scans and validations
    - `payment_transactions` - Handle upfront payments

  2. Updated Tables
    - Add commission fields to businesses
    - Add payment status to bookings
    - Add QR code reference to bookings

  3. Security
    - Enable RLS on all new tables
    - Add policies for salon owners and admin access
*/

-- QR Codes table for one-time validation
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  qr_token text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Commission tracking
CREATE TABLE IF NOT EXISTS commission_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  commission_rate numeric NOT NULL DEFAULT 0.15,
  deal_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  salon_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed')),
  validated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Offline bookings entered by salons
CREATE TABLE IF NOT EXISTS offline_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  service_name text NOT NULL,
  service_price numeric NOT NULL,
  booking_date timestamptz NOT NULL,
  notes text,
  synced_booking_id uuid REFERENCES bookings(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Booking validations (QR scans)
CREATE TABLE IF NOT EXISTS booking_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  validated_by uuid REFERENCES auth.users(id),
  validated_at timestamptz DEFAULT now(),
  location_data jsonb,
  device_info text
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'MAD',
  payment_method text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id text,
  payment_gateway text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Add commission fields to businesses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE businesses ADD COLUMN commission_rate numeric DEFAULT 0.15;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'total_commission_owed'
  ) THEN
    ALTER TABLE businesses ADD COLUMN total_commission_owed numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'total_validated_bookings'
  ) THEN
    ALTER TABLE businesses ADD COLUMN total_validated_bookings integer DEFAULT 0;
  END IF;
END $$;

-- Add payment and QR fields to bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'qr_code_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN qr_code_id uuid REFERENCES qr_codes(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'validated_at'
  ) THEN
    ALTER TABLE bookings ADD COLUMN validated_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'commission_calculated'
  ) THEN
    ALTER TABLE bookings ADD COLUMN commission_calculated boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- QR Codes policies
CREATE POLICY "Business owners can view their QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN deals d ON d.id = b.deal_id
      JOIN businesses bus ON bus.id = d.business_id
      WHERE b.id = qr_codes.booking_id AND bus.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = qr_codes.booking_id AND b.user_id = auth.uid()
    )
  );

-- Commission logs policies
CREATE POLICY "Business owners can view their commission logs"
  ON commission_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = commission_logs.business_id AND businesses.owner_id = auth.uid()
    )
  );

-- Offline bookings policies
CREATE POLICY "Business owners can manage offline bookings"
  ON offline_bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = offline_bookings.business_id AND businesses.owner_id = auth.uid()
    )
  );

-- Booking validations policies
CREATE POLICY "Business owners can view their validations"
  ON booking_validations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = booking_validations.business_id AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create validations"
  ON booking_validations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = booking_validations.business_id AND businesses.owner_id = auth.uid()
    )
  );

-- Payment transactions policies
CREATE POLICY "Users can view their payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payment_transactions.booking_id AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can view their payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN deals d ON d.id = b.deal_id
      JOIN businesses bus ON bus.id = d.business_id
      WHERE b.id = payment_transactions.booking_id AND bus.owner_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_booking_id ON qr_codes(booking_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(qr_token);
CREATE INDEX IF NOT EXISTS idx_commission_logs_business_id ON commission_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_commission_logs_booking_id ON commission_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_offline_bookings_business_id ON offline_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_booking_validations_business_id ON booking_validations(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);

-- Function to generate QR code when booking is confirmed
CREATE OR REPLACE FUNCTION generate_qr_code_for_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate QR code when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO qr_codes (booking_id, qr_token, expires_at)
    VALUES (
      NEW.id,
      'QR_' || NEW.id || '_' || extract(epoch from now())::text || '_' || floor(random() * 1000000)::text,
      NEW.booking_date + interval '1 day'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate QR codes
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;
CREATE TRIGGER trigger_generate_qr_code
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_code_for_booking();

-- Function to calculate commission when QR is validated
CREATE OR REPLACE FUNCTION calculate_commission_on_validation()
RETURNS TRIGGER AS $$
DECLARE
  deal_record RECORD;
  business_record RECORD;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  salon_amount NUMERIC;
BEGIN
  -- Get deal and business info
  SELECT d.*, b.commission_rate as bus_commission_rate
  INTO deal_record
  FROM bookings bk
  JOIN deals d ON d.id = bk.deal_id
  JOIN businesses b ON b.id = d.business_id
  WHERE bk.id = NEW.booking_id;
  
  commission_rate := COALESCE(deal_record.bus_commission_rate, 0.15);
  commission_amount := deal_record.discounted_price * commission_rate;
  salon_amount := deal_record.discounted_price - commission_amount;
  
  -- Create commission log
  INSERT INTO commission_logs (
    booking_id,
    business_id,
    commission_rate,
    deal_amount,
    commission_amount,
    salon_amount,
    validated_at
  ) VALUES (
    NEW.booking_id,
    NEW.business_id,
    commission_rate,
    deal_record.discounted_price,
    commission_amount,
    salon_amount,
    NEW.validated_at
  );
  
  -- Update booking as validated and commission calculated
  UPDATE bookings 
  SET validated_at = NEW.validated_at, commission_calculated = true
  WHERE id = NEW.booking_id;
  
  -- Update business totals
  UPDATE businesses 
  SET 
    total_commission_owed = total_commission_owed + commission_amount,
    total_validated_bookings = total_validated_bookings + 1
  WHERE id = NEW.business_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate commission on validation
DROP TRIGGER IF EXISTS trigger_calculate_commission ON booking_validations;
CREATE TRIGGER trigger_calculate_commission
  AFTER INSERT ON booking_validations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_commission_on_validation();