/*
  # Add roles and business status support

  1. Schema Changes
    - Add `status` column to `businesses` table for approval workflow
    - Add `role` column to `user_profiles` table for user type identification
    - Update existing demo users with proper roles

  2. Security
    - Update RLS policies to respect business status
    - Ensure only approved businesses can create deals

  3. Data Updates
    - Set admin role for admin@dealio.ma
    - Set business_owner role for business@dealio.ma
    - Set client role for client@dealio.ma
*/

-- Add status column to businesses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'status'
  ) THEN
    ALTER TABLE businesses ADD COLUMN status TEXT DEFAULT 'pending' NOT NULL;
  END IF;
END $$;

-- Add role column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'client' NOT NULL;
  END IF;
END $$;

-- Add check constraint for business status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'businesses_status_check'
  ) THEN
    ALTER TABLE businesses ADD CONSTRAINT businesses_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));
  END IF;
END $$;

-- Add check constraint for user roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_role_check'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
    CHECK (role IN ('client', 'business_owner', 'admin'));
  END IF;
END $$;

-- Update existing demo users with proper roles
UPDATE user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@dealio.ma');

UPDATE user_profiles
SET role = 'business_owner'
WHERE id = (SELECT id FROM auth.users WHERE email = 'business@dealio.ma');

UPDATE user_profiles
SET role = 'client'
WHERE id = (SELECT id FROM auth.users WHERE email = 'client@dealio.ma');

-- Update existing businesses to approved status (for demo data)
UPDATE businesses
SET status = 'approved'
WHERE owner_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('business@dealio.ma', 'demo@dealio.ma')
);

-- Update RLS policies for businesses to respect status
DROP POLICY IF EXISTS "Public can view active businesses" ON businesses;
CREATE POLICY "Public can view approved businesses"
  ON businesses
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Update RLS policies for deals to only show deals from approved businesses
DROP POLICY IF EXISTS "Public can view active deals" ON deals;
CREATE POLICY "Public can view deals from approved businesses"
  ON deals
  FOR SELECT
  TO public
  USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = deals.business_id 
      AND businesses.status = 'approved'
    )
  );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();