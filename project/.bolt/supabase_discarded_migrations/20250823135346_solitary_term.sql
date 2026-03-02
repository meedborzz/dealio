/*
  # Create Dealio Beauty Database Schema

  1. New Tables
    - `user_profiles` - Extended user information with roles
    - `businesses` - Beauty businesses and salons
    - `deals` - Beauty service deals and offers
    - `time_slots` - Available booking time slots
    - `bookings` - Customer bookings
    - `qr_codes` - QR codes for booking validation
    - `favorites` - User favorite deals
    - `reviews` - Business reviews and ratings
    - `commission_logs` - Commission tracking
    - `booking_validations` - QR code validation logs
    - `payment_transactions` - Payment tracking
    - `offline_bookings` - Offline booking management

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Create secure functions for business operations

  3. Functions
    - QR code generation trigger
    - Commission calculation function
    - Booking validation function
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('client', 'business_owner', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE business_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE commission_status AS ENUM ('pending', 'paid', 'disputed');

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  role user_role DEFAULT 'client',
  completed_bookings_count INTEGER DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  coordinates JSONB,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status business_status DEFAULT 'pending',
  commission_rate DECIMAL(3,2) DEFAULT 0.15,
  total_commission_owed DECIMAL(10,2) DEFAULT 0,
  total_validated_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals Table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  booking_enabled BOOLEAN DEFAULT true,
  max_bookings_per_slot INTEGER DEFAULT 1,
  duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  CONSTRAINT valid_prices CHECK (discounted_price <= original_price)
);

-- Time Slots Table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_spots INTEGER NOT NULL DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  qr_token TEXT NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  booking_date TIMESTAMPTZ NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  qr_code_id UUID REFERENCES qr_codes(id),
  validated_at TIMESTAMPTZ,
  commission_calculated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for qr_codes.booking_id
ALTER TABLE qr_codes ADD CONSTRAINT fk_qr_codes_booking 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, deal_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission Logs Table
CREATE TABLE IF NOT EXISTS commission_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  commission_rate DECIMAL(3,2) NOT NULL,
  deal_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  salon_amount DECIMAL(10,2) NOT NULL,
  status commission_status DEFAULT 'pending',
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking Validations Table
CREATE TABLE IF NOT EXISTS booking_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  validated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  validated_at TIMESTAMPTZ DEFAULT NOW(),
  location_data JSONB,
  device_info TEXT
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  payment_method TEXT,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  payment_gateway TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Offline Bookings Table
CREATE TABLE IF NOT EXISTS offline_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_name TEXT NOT NULL,
  service_price DECIMAL(10,2) NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  synced_booking_id UUID REFERENCES bookings(id),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses Policies
CREATE POLICY "Anyone can view approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Business owners can manage own business" ON businesses
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all businesses" ON businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Deals Policies
CREATE POLICY "Anyone can view active deals" ON deals
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = deals.business_id AND status = 'approved'
    )
  );

CREATE POLICY "Business owners can manage own deals" ON deals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = deals.business_id AND owner_id = auth.uid()
    )
  );

-- Time Slots Policies
CREATE POLICY "Anyone can view available time slots" ON time_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON d.business_id = b.id
      WHERE d.id = time_slots.deal_id 
      AND d.is_active = true 
      AND b.status = 'approved'
    )
  );

CREATE POLICY "Business owners can manage own time slots" ON time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON d.business_id = b.id
      WHERE d.id = time_slots.deal_id AND b.owner_id = auth.uid()
    )
  );

-- Bookings Policies
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Business owners can view bookings for their deals" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON d.business_id = b.id
      WHERE d.id = bookings.deal_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update bookings for their deals" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON d.business_id = b.id
      WHERE d.id = bookings.deal_id AND b.owner_id = auth.uid()
    )
  );

-- QR Codes Policies
CREATE POLICY "Users can view own booking QR codes" ON qr_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = qr_codes.booking_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can view QR codes for their bookings" ON qr_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN deals d ON b.deal_id = d.id
      JOIN businesses bus ON d.business_id = bus.id
      WHERE b.id = qr_codes.booking_id AND bus.owner_id = auth.uid()
    )
  );

-- Favorites Policies
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Commission Logs Policies
CREATE POLICY "Business owners can view own commission logs" ON commission_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = commission_logs.business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all commission logs" ON commission_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions and Triggers

-- Function to generate QR code for bookings
CREATE OR REPLACE FUNCTION generate_qr_code_for_booking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO qr_codes (booking_id, qr_token, expires_at)
  VALUES (
    NEW.id,
    'QR_' || NEW.id || '_' || EXTRACT(EPOCH FROM NOW())::bigint,
    NEW.booking_date + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate QR codes
DROP TRIGGER IF EXISTS trigger_generate_qr_code ON bookings;
CREATE TRIGGER trigger_generate_qr_code
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_qr_code_for_booking();

-- Function to update business rating
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE business_id = NEW.business_id
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE business_id = NEW.business_id
    )
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update business rating on new reviews
DROP TRIGGER IF EXISTS trigger_update_business_rating ON reviews;
CREATE TRIGGER trigger_update_business_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_business_rating();

-- Function to validate booking with QR code
CREATE OR REPLACE FUNCTION validate_booking_with_qr(
  p_qr_token TEXT,
  p_business_id UUID,
  p_staff_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_qr_code qr_codes%ROWTYPE;
  v_booking bookings%ROWTYPE;
  v_deal deals%ROWTYPE;
  v_commission_amount DECIMAL(10,2);
  v_salon_amount DECIMAL(10,2);
  v_result JSON;
BEGIN
  -- Find QR code
  SELECT * INTO v_qr_code
  FROM qr_codes
  WHERE qr_token = p_qr_token AND NOT is_used AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Code QR invalide ou expiré');
  END IF;

  -- Get booking details
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = v_qr_code.booking_id;

  -- Get deal details
  SELECT * INTO v_deal
  FROM deals
  WHERE id = v_booking.deal_id AND business_id = p_business_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Réservation non trouvée pour cet établissement');
  END IF;

  -- Mark QR code as used
  UPDATE qr_codes
  SET is_used = true
  WHERE id = v_qr_code.id;

  -- Update booking status
  UPDATE bookings
  SET 
    status = 'completed',
    validated_at = NOW(),
    commission_calculated = true
  WHERE id = v_booking.id;

  -- Calculate commission
  v_commission_amount := v_deal.discounted_price * 0.15;
  v_salon_amount := v_deal.discounted_price - v_commission_amount;

  -- Log commission
  INSERT INTO commission_logs (
    booking_id, business_id, commission_rate, deal_amount,
    commission_amount, salon_amount, status, validated_at
  ) VALUES (
    v_booking.id, p_business_id, 0.15, v_deal.discounted_price,
    v_commission_amount, v_salon_amount, 'pending', NOW()
  );

  -- Update business totals
  UPDATE businesses
  SET 
    total_commission_owed = total_commission_owed + v_commission_amount,
    total_validated_bookings = total_validated_bookings + 1
  WHERE id = p_business_id;

  -- Log validation
  INSERT INTO booking_validations (
    booking_id, qr_code_id, business_id, validated_by
  ) VALUES (
    v_booking.id, v_qr_code.id, p_business_id, p_staff_id
  );

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'booking_id', v_booking.id,
    'customer_name', v_booking.customer_name,
    'service_name', v_deal.title,
    'commission_amount', v_commission_amount,
    'salon_amount', v_salon_amount
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_deals_business_id ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_deal_id ON time_slots(deal_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_deal_id ON bookings(deal_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(qr_token);
CREATE INDEX IF NOT EXISTS idx_favorites_user_deal ON favorites(user_id, deal_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);