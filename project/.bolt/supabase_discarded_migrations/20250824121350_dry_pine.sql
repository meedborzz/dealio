/*
  # Create Demo User Accounts

  1. Authentication Users
    - Create demo users for testing different roles
    - Admin, Business Owner, and Client accounts
  
  2. User Profiles
    - Link auth users to user_profiles table
    - Set appropriate roles and initial data
*/

-- Insert demo users into auth.users (this requires service role key)
-- Note: In production, users would sign up through the app

-- Create user profiles for demo accounts
INSERT INTO user_profiles (id, full_name, phone, role, loyalty_points, completed_bookings_count) VALUES
  -- Admin user
  ('11111111-1111-1111-1111-111111111111', 'Admin User', '+212 600 000 001', 'admin', 0, 0),
  -- Business owner user  
  ('22222222-2222-2222-2222-222222222222', 'Business Owner', '+212 600 000 002', 'business_owner', 0, 0),
  -- Client user
  ('33333333-3333-3333-3333-333333333333', 'Client User', '+212 600 000 003', 'client', 150, 5),
  -- Demo user (from populate script)
  ('44444444-4444-4444-4444-444444444444', 'Demo Business Owner', '+212 600 000 004', 'business_owner', 0, 0)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  loyalty_points = EXCLUDED.loyalty_points,
  completed_bookings_count = EXCLUDED.completed_bookings_count;