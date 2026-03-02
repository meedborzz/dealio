/*
  # Create Test Business and Deal

  1. New Data
    - One test business (Salon Belle Époque in Casablanca)
    - One test deal (Coupe + Brushing with 40% discount)
    - Time slots for the next 7 days
    - Admin user setup

  2. Security
    - All existing RLS policies remain active
    - Test data follows proper ownership rules

  3. Purpose
    - Clean slate for testing core functionality
    - Single business/deal to focus on features
*/

-- First, let's create an admin user profile (you'll need to sign up with this email first)
INSERT INTO user_profiles (id, full_name, role, loyalty_points, completed_bookings_count)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin User',
  'admin',
  0,
  0
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = now();

-- Create a business owner user profile
INSERT INTO user_profiles (id, full_name, phone, role, loyalty_points, completed_bookings_count)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Salon Owner',
  '+212 6 12 34 56 78',
  'business_owner',
  0,
  0
) ON CONFLICT (id) DO UPDATE SET
  role = 'business_owner',
  full_name = 'Salon Owner',
  phone = '+212 6 12 34 56 78',
  updated_at = now();

-- Create a test client user profile
INSERT INTO user_profiles (id, full_name, phone, role, loyalty_points, completed_bookings_count)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Test Client',
  '+212 6 98 76 54 32',
  'client',
  150,
  3
) ON CONFLICT (id) DO UPDATE SET
  role = 'client',
  full_name = 'Test Client',
  phone = '+212 6 98 76 54 32',
  loyalty_points = 150,
  completed_bookings_count = 3,
  updated_at = now();

-- Create the test business
INSERT INTO businesses (
  id,
  name,
  description,
  address,
  city,
  phone,
  email,
  website,
  category,
  rating,
  review_count,
  coordinates,
  owner_id,
  status,
  commission_rate,
  total_commission_owed,
  total_validated_bookings
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'Salon Belle Époque',
  'Salon de coiffure moderne spécialisé dans les coupes tendance et les soins capillaires. Ambiance chaleureuse et équipe professionnelle.',
  '123 Boulevard Mohammed V',
  'Casablanca',
  '+212 5 22 12 34 56',
  'contact@belleepoque.ma',
  'https://www.belleepoque.ma',
  'Coiffure',
  4.7,
  89,
  '{"lat": 33.5731, "lng": -7.5898}'::jsonb,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'approved',
  0.15,
  450.00,
  12
) ON CONFLICT (id) DO UPDATE SET
  name = 'Salon Belle Époque',
  description = 'Salon de coiffure moderne spécialisé dans les coupes tendance et les soins capillaires. Ambiance chaleureuse et équipe professionnelle.',
  address = '123 Boulevard Mohammed V',
  city = 'Casablanca',
  phone = '+212 5 22 12 34 56',
  email = 'contact@belleepoque.ma',
  website = 'https://www.belleepoque.ma',
  category = 'Coiffure',
  rating = 4.7,
  review_count = 89,
  coordinates = '{"lat": 33.5731, "lng": -7.5898}'::jsonb,
  owner_id = '11111111-1111-1111-1111-111111111111'::uuid,
  status = 'approved',
  commission_rate = 0.15,
  total_commission_owed = 450.00,
  total_validated_bookings = 12,
  updated_at = now();

-- Create the test deal
INSERT INTO deals (
  id,
  business_id,
  title,
  description,
  image_url,
  original_price,
  discounted_price,
  discount_percentage,
  valid_until,
  is_active,
  booking_enabled,
  max_bookings_per_slot,
  duration_minutes,
  deal_type,
  per_user_limit,
  requires_deposit,
  deposit_cents
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'Coupe + Brushing Femme',
  'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look. Produits de qualité premium inclus.',
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
  250.00,
  150.00,
  40,
  (CURRENT_DATE + INTERVAL '30 days')::date,
  true,
  true,
  2,
  75,
  'standard',
  3,
  false,
  0
) ON CONFLICT (id) DO UPDATE SET
  business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  title = 'Coupe + Brushing Femme',
  description = 'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look. Produits de qualité premium inclus.',
  image_url = 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
  original_price = 250.00,
  discounted_price = 150.00,
  discount_percentage = 40,
  valid_until = (CURRENT_DATE + INTERVAL '30 days')::date,
  is_active = true,
  booking_enabled = true,
  max_bookings_per_slot = 2,
  duration_minutes = 75,
  deal_type = 'standard',
  per_user_limit = 3,
  requires_deposit = false,
  deposit_cents = 0,
  updated_at = now();

-- Create time slots for the next 7 days (9 AM to 6 PM, every 75 minutes)
DO $$
DECLARE
  current_date_iter DATE;
  current_time TIME;
  slot_id UUID;
BEGIN
  -- Loop through next 7 days
  FOR i IN 0..6 LOOP
    current_date_iter := CURRENT_DATE + i;
    
    -- Skip Sundays (assuming Sunday = 0)
    IF EXTRACT(DOW FROM current_date_iter) != 0 THEN
      -- Create slots from 9 AM to 6 PM
      current_time := '09:00:00'::TIME;
      
      WHILE current_time <= '18:00:00'::TIME LOOP
        slot_id := gen_random_uuid();
        
        INSERT INTO time_slots (
          id,
          deal_id,
          date,
          start_time,
          end_time,
          slot_date,
          slot_time,
          available_spots,
          is_available
        ) VALUES (
          slot_id,
          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
          current_date_iter,
          current_time,
          (current_time + INTERVAL '75 minutes')::TIME,
          current_date_iter,
          current_time,
          2, -- max_bookings_per_slot
          true
        ) ON CONFLICT (deal_id, date, start_time) DO NOTHING;
        
        -- Move to next slot (75 minutes later)
        current_time := (current_time + INTERVAL '75 minutes')::TIME;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Add a sample review
INSERT INTO reviews (
  id,
  business_id,
  user_id,
  rating,
  comment,
  created_at
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  5,
  'Excellent service ! Coupe parfaite et accueil chaleureux. Je recommande vivement ce salon.',
  now() - INTERVAL '2 days'
) ON CONFLICT (id) DO UPDATE SET
  rating = 5,
  comment = 'Excellent service ! Coupe parfaite et accueil chaleureux. Je recommande vivement ce salon.',
  created_at = now() - INTERVAL '2 days';