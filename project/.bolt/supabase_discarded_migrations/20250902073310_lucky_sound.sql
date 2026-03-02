/*
  # Create Admin User and Sample Data

  1. Admin User Setup
    - Creates admin user profile
    - Sets up proper permissions

  2. Sample Business Data
    - Creates sample businesses for testing
    - Adds sample deals and time slots

  3. Sample Client Data
    - Creates sample client profiles
    - Adds sample bookings and reviews
*/

-- Create admin user profile (replace with your actual admin email)
INSERT INTO user_profiles (id, full_name, role, loyalty_points, completed_bookings_count)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual admin user ID
  'Admin User',
  'admin',
  0,
  0
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User';

-- Create sample business owner
INSERT INTO user_profiles (id, full_name, phone, role, loyalty_points, completed_bookings_count)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Business Owner Demo',
  '+212 6XX XXX XXX',
  'business_owner',
  0,
  0
) ON CONFLICT (id) DO NOTHING;

-- Create sample businesses
INSERT INTO businesses (id, name, description, address, city, phone, email, category, rating, review_count, owner_id, status, commission_rate, total_commission_owed, total_validated_bookings)
VALUES 
  (
    'bus-1111-1111-1111-111111111111',
    'Salon Élégance Casablanca',
    'Salon de coiffure moderne spécialisé dans les coupes tendance et colorations professionnelles.',
    '123 Boulevard Mohammed V',
    'Casablanca',
    '+212 522 123 456',
    'contact@salon-elegance.ma',
    'Coiffure',
    4.8,
    156,
    '11111111-1111-1111-1111-111111111111',
    'approved',
    0.15,
    2450.00,
    23
  ),
  (
    'bus-2222-2222-2222-222222222222',
    'Spa Wellness Rabat',
    'Centre de bien-être proposant massages thérapeutiques et soins du corps.',
    '45 Avenue Hassan II',
    'Rabat',
    '+212 537 654 321',
    'info@spa-wellness.ma',
    'Spa',
    4.9,
    203,
    '11111111-1111-1111-1111-111111111111',
    'approved',
    0.15,
    3200.00,
    31
  ),
  (
    'bus-3333-3333-3333-333333333333',
    'Beauty Nails Studio',
    'Studio spécialisé dans les soins des ongles et nail art créatif.',
    '78 Rue de la Liberté',
    'Marrakech',
    '+212 524 987 654',
    'contact@beauty-nails.ma',
    'Ongles',
    4.7,
    142,
    '11111111-1111-1111-1111-111111111111',
    'pending',
    0.15,
    1800.00,
    18
  )
ON CONFLICT (id) DO NOTHING;

-- Create sample deals
INSERT INTO deals (id, business_id, title, description, image_url, original_price, discounted_price, discount_percentage, valid_until, is_active, booking_enabled, max_bookings_per_slot, duration_minutes)
VALUES 
  (
    'deal-1111-1111-1111-111111111111',
    'bus-1111-1111-1111-111111111111',
    'Coupe + Brushing Femme',
    'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent.',
    'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
    400,
    200,
    50,
    '2024-12-31',
    true,
    true,
    2,
    60
  ),
  (
    'deal-2222-2222-2222-222222222222',
    'bus-2222-2222-2222-222222222222',
    'Massage Relaxant 60min',
    'Massage complet du corps aux huiles essentielles d\'argan pour une relaxation totale.',
    'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
    350,
    210,
    40,
    '2024-12-31',
    true,
    true,
    1,
    60
  ),
  (
    'deal-3333-3333-3333-333333333333',
    'bus-3333-3333-3333-333333333333',
    'Manucure + Vernis Semi-Permanent',
    'Manucure complète avec pose de vernis semi-permanent longue tenue.',
    'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
    200,
    150,
    25,
    '2024-12-31',
    true,
    true,
    3,
    90
  )
ON CONFLICT (id) DO NOTHING;

-- Create sample client profiles
INSERT INTO user_profiles (id, full_name, phone, role, loyalty_points, completed_bookings_count)
VALUES 
  ('client-1111-1111-1111-111111111111', 'Sarah Benali', '+212 6XX XXX XX1', 'client', 150, 5),
  ('client-2222-2222-2222-222222222222', 'Fatima Alami', '+212 6XX XXX XX2', 'client', 320, 12),
  ('client-3333-3333-3333-333333333333', 'Aicha Mansouri', '+212 6XX XXX XX3', 'client', 80, 3),
  ('client-4444-4444-4444-444444444444', 'Khadija Berrada', '+212 6XX XXX XX4', 'client', 500, 18),
  ('client-5555-5555-5555-555555555555', 'Latifa Bennani', '+212 6XX XXX XX5', 'client', 45, 2)
ON CONFLICT (id) DO NOTHING;

-- Create sample time slots for next 30 days
INSERT INTO time_slots (deal_id, date, start_time, end_time, available_spots, is_available)
SELECT 
  deal_id,
  (CURRENT_DATE + (day_offset || ' days')::interval)::date as date,
  (hour_offset || ':00:00')::time as start_time,
  ((hour_offset + 1) || ':00:00')::time as end_time,
  CASE WHEN random() > 0.3 THEN 2 ELSE 1 END as available_spots,
  true as is_available
FROM 
  (SELECT unnest(ARRAY['deal-1111-1111-1111-111111111111', 'deal-2222-2222-2222-222222222222', 'deal-3333-3333-3333-333333333333']) as deal_id) deals,
  (SELECT generate_series(0, 29) as day_offset) days,
  (SELECT unnest(ARRAY[9, 10, 11, 14, 15, 16, 17]) as hour_offset) hours
ON CONFLICT DO NOTHING;

-- Create sample bookings
INSERT INTO bookings (id, deal_id, time_slot_id, user_id, customer_name, customer_phone, customer_email, status, booking_date, total_price, commission_calculated)
SELECT 
  'booking-' || generate_random_uuid(),
  'deal-1111-1111-1111-111111111111',
  ts.id,
  'client-1111-1111-1111-111111111111',
  'Sarah Benali',
  '+212 6XX XXX XX1',
  'sarah@example.com',
  CASE WHEN random() > 0.7 THEN 'completed' ELSE 'confirmed' END,
  (ts.date || ' ' || ts.start_time)::timestamp,
  200,
  true
FROM time_slots ts 
WHERE ts.deal_id = 'deal-1111-1111-1111-111111111111' 
AND ts.date >= CURRENT_DATE 
AND ts.date <= CURRENT_DATE + interval '7 days'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Create sample reviews
INSERT INTO reviews (business_id, user_id, rating, comment)
VALUES 
  ('bus-1111-1111-1111-111111111111', 'client-1111-1111-1111-111111111111', 5, 'Excellent service, très professionnel. Je recommande vivement!'),
  ('bus-1111-1111-1111-111111111111', 'client-2222-2222-2222-222222222222', 5, 'Ambiance très agréable et résultat parfait. Merci!'),
  ('bus-2222-2222-2222-222222222222', 'client-3333-3333-3333-333333333333', 4, 'Très satisfaite du service, personnel accueillant.'),
  ('bus-3333-3333-3333-333333333333', 'client-4444-4444-4444-444444444444', 5, 'Nail art magnifique, je reviendrai certainement!')
ON CONFLICT DO NOTHING;