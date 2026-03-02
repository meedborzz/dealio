/*
  # Add User Profiles and Loyalty System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `date_of_birth` (date)
      - `completed_bookings_count` (integer, default 0)
      - `loyalty_points` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - Function to increment loyalty points when booking is completed
    - Function to automatically create user profile on signup

  3. Triggers
    - Trigger to create user profile when user signs up
    - Trigger to update loyalty points when booking is completed

  4. Security
    - Enable RLS on user_profiles table
    - Add policies for users to manage their own profiles
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  date_of_birth date,
  completed_bookings_count integer DEFAULT 0,
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update loyalty points when booking is completed
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS trigger AS $$
BEGIN
  -- Only update if status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update user profile loyalty points and booking count
    UPDATE user_profiles 
    SET 
      completed_bookings_count = completed_bookings_count + 1,
      loyalty_points = loyalty_points + 10, -- 10 points per completed booking
      updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Update business total validated bookings
    UPDATE businesses 
    SET total_validated_bookings = total_validated_bookings + 1
    WHERE id = (SELECT business_id FROM deals WHERE id = NEW.deal_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update loyalty points on booking completion
DROP TRIGGER IF EXISTS update_loyalty_on_completion ON bookings;
CREATE TRIGGER update_loyalty_on_completion
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_loyalty_points();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_loyalty_points ON user_profiles(loyalty_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completed_bookings ON user_profiles(completed_bookings_count DESC);