/*
  # Initial Schema for Dealio Beauty Platform

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `address` (text)
      - `city` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `category` (text)
      - `rating` (decimal)
      - `review_count` (integer)
      - `coordinates` (jsonb)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `deals`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `original_price` (decimal)
      - `discounted_price` (decimal)
      - `discount_percentage` (integer)
      - `valid_until` (date)
      - `is_active` (boolean)
      - `booking_enabled` (boolean)
      - `max_bookings_per_slot` (integer)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `time_slots`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, references deals)
      - `date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `available_spots` (integer)
      - `is_available` (boolean)
      - `created_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `deal_id` (uuid, references deals)
      - `time_slot_id` (uuid, references time_slots)
      - `user_id` (uuid, references auth.users)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_email` (text)
      - `status` (text) -- 'pending', 'confirmed', 'cancelled', 'completed'
      - `notes` (text)
      - `booking_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `deal_id` (uuid, references deals)
      - `created_at` (timestamp)

    - `reviews`
      - `id` (uuid, primary key)
      - `business_id` (uuid, references businesses)
      - `user_id` (uuid, references auth.users)
      - `booking_id` (uuid, references bookings)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for business owners to manage their businesses
    - Add policies for public read access to active deals and businesses
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  phone text,
  email text,
  website text,
  category text NOT NULL,
  rating decimal DEFAULT 0,
  review_count integer DEFAULT 0,
  coordinates jsonb,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  original_price decimal NOT NULL,
  discounted_price decimal NOT NULL,
  discount_percentage integer NOT NULL,
  valid_until date NOT NULL,
  is_active boolean DEFAULT true,
  booking_enabled boolean DEFAULT true,
  max_bookings_per_slot integer DEFAULT 1,
  duration_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  available_spots integer NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  time_slot_id uuid REFERENCES time_slots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  booking_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, deal_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for businesses
CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Business owners can manage their businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policies for deals
CREATE POLICY "Public can view active deals"
  ON deals FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Business owners can manage their deals"
  ON deals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = deals.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Policies for time_slots
CREATE POLICY "Public can view available time slots"
  ON time_slots FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Business owners can manage their time slots"
  ON time_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals 
      JOIN businesses ON businesses.id = deals.business_id
      WHERE deals.id = time_slots.deal_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view bookings for their deals"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals 
      JOIN businesses ON businesses.id = deals.business_id
      WHERE deals.id = bookings.deal_id 
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals 
      JOIN businesses ON businesses.id = deals.business_id
      WHERE deals.id = bookings.deal_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Policies for favorites
CREATE POLICY "Users can manage their own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for reviews
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = reviews.booking_id 
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_deals_business_id ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_deal_date ON time_slots(deal_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_deal_id ON bookings(deal_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_deal ON favorites(user_id, deal_id);