/*
  # Create offline bookings table for POS functionality

  1. New Tables
    - `offline_bookings`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key to businesses)
      - `customer_name` (text, required)
      - `customer_phone` (text, required)
      - `customer_email` (text, optional)
      - `service_name` (text, required)
      - `service_price` (numeric, required)
      - `booking_date` (timestamptz, required)
      - `notes` (text, optional)
      - `synced_booking_id` (uuid, optional - for future sync)
      - `created_by` (uuid, foreign key to users)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `offline_bookings` table
    - Add policy for business owners to manage their offline bookings
*/

CREATE TABLE IF NOT EXISTS offline_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  service_name text NOT NULL,
  service_price numeric(10,2) NOT NULL,
  booking_date timestamptz NOT NULL,
  notes text,
  synced_booking_id uuid REFERENCES bookings(id),
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE offline_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can manage their offline bookings"
  ON offline_bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = offline_bookings.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = offline_bookings.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_offline_bookings_business_id ON offline_bookings(business_id);
CREATE INDEX IF NOT EXISTS idx_offline_bookings_created_by ON offline_bookings(created_by);
CREATE INDEX IF NOT EXISTS idx_offline_bookings_booking_date ON offline_bookings(booking_date);