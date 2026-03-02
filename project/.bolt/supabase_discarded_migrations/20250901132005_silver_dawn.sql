/*
  # Business POS System Tables

  1. New Tables
    - `staff` - Personnel management for businesses
    - `services` - Services offered by businesses with pricing and duration
    - `customers` - Customer database for businesses
    - Enhanced `bookings` table structure for POS functionality

  2. Security
    - Enable RLS on all new tables
    - Add policies for business owners to manage their data
    - Ensure data isolation between businesses

  3. Features
    - Staff management with active/inactive status
    - Service catalog with categories, pricing, duration, and buffer time
    - Customer management with contact information
    - Enhanced booking system with payment tracking and origin (online/offline)
    - Double-booking prevention for staff scheduling
*/

-- Staff table for personnel management
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

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
  );

-- Services table for service catalog
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price_cents integer NOT NULL DEFAULT 0,
  duration_min integer NOT NULL DEFAULT 60,
  buffer_min integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

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
  );

-- Customers table for customer management
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id, phone)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

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
  );

-- Enhanced bookings table structure
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_id') THEN
    ALTER TABLE bookings ADD COLUMN service_id uuid REFERENCES services(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'staff_id') THEN
    ALTER TABLE bookings ADD COLUMN staff_id uuid REFERENCES staff(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'customer_id') THEN
    ALTER TABLE bookings ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'title') THEN
    ALTER TABLE bookings ADD COLUMN title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'start_at') THEN
    ALTER TABLE bookings ADD COLUMN start_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'end_at') THEN
    ALTER TABLE bookings ADD COLUMN end_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'price_cents') THEN
    ALTER TABLE bookings ADD COLUMN price_cents integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'discount_percent') THEN
    ALTER TABLE bookings ADD COLUMN discount_percent numeric(5,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'origin') THEN
    ALTER TABLE bookings ADD COLUMN origin text DEFAULT 'online' CHECK (origin IN ('online', 'offline'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'pay_status') THEN
    ALTER TABLE bookings ADD COLUMN pay_status text DEFAULT 'unpaid' CHECK (pay_status IN ('unpaid', 'paid', 'refunded'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'pay_method') THEN
    ALTER TABLE bookings ADD COLUMN pay_method text CHECK (pay_method IN ('cash', 'card', 'transfer', 'other'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_business_id ON staff(business_id);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_time ON bookings(staff_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_bookings_business_time ON bookings(business_id, start_at);

-- TODO: Double-booking prevention constraint
-- This would prevent overlapping bookings for the same staff member:
-- ALTER TABLE bookings ADD CONSTRAINT no_staff_double_booking 
-- EXCLUDE USING gist (staff_id WITH =, tstzrange(start_at, end_at, '[)') WITH &&) 
-- WHERE (staff_id IS NOT NULL);
-- 
-- Note: Requires btree_gist extension. If not available, rely on UI validation.