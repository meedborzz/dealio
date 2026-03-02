/*
  # Create Business POS Tables

  1. New Tables
    - `staff` - Business personnel management
    - `services` - Service catalog with pricing
    - `customers` - Customer database per business
    - `bookings` - Enhanced booking system for POS

  2. Security
    - Enable RLS on all tables
    - Add policies for business owners to manage their data

  3. Indexes
    - Performance indexes for common queries
    - Unique constraints for data integrity

  4. Constraints
    - Prevent double-booking for same staff (TODO: EXCLUDE constraint)
    - Ensure valid pricing and timing
*/

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  duration_min integer NOT NULL CHECK (duration_min > 0),
  buffer_min integer CHECK (buffer_min >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(business_id, phone)
);

-- Enhanced bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  title text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  discount_percent integer DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  origin text NOT NULL DEFAULT 'online' CHECK (origin IN ('online', 'offline')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'no_show', 'cancelled')),
  pay_status text NOT NULL DEFAULT 'unpaid' CHECK (pay_status IN ('unpaid', 'paid', 'refunded')),
  pay_method text CHECK (pay_method IN ('cash', 'card', 'transfer', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_at > start_at)
);

-- Add opening_hours_json to businesses if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'opening_hours_json'
  ) THEN
    ALTER TABLE businesses ADD COLUMN opening_hours_json jsonb;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(business_id, is_active);

CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(business_id, category);

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(business_id, phone);

CREATE INDEX IF NOT EXISTS idx_bookings_business_id ON bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_at ON bookings(business_id, start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_time ON bookings(staff_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(business_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_origin ON bookings(business_id, origin);

-- TODO: Add EXCLUDE constraint for double-booking prevention
-- This requires PostgreSQL GIST extension which may not be available
-- EXCLUDE USING gist (staff_id WITH =, tstzrange(start_at,end_at,'[)') WITH &&) WHERE staff_id IS NOT NULL;

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff
CREATE POLICY "Business owners can manage their staff"
  ON staff
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = staff.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = staff.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for services
CREATE POLICY "Business owners can manage their services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = services.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = services.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for customers
CREATE POLICY "Business owners can manage their customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = customers.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = customers.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Business owners can manage their bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = bookings.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = bookings.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );