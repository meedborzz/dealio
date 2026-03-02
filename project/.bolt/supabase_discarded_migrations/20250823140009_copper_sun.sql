/*
  # Populate Demo Data for Dealio Beauty Platform

  1. Demo Users
    - Creates demo users for different roles (client, business_owner, admin)
  
  2. Demo Businesses
    - Creates sample beauty businesses across different categories
  
  3. Demo Deals
    - Creates sample deals with discounts for each business
  
  4. Time Slots
    - Generates available time slots for bookings
*/

-- Insert demo user profiles (these will be linked to auth.users)
INSERT INTO user_profiles (id, full_name, phone, role, loyalty_points, completed_bookings_count) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User', '+212 600 000 001', 'admin', 0, 0),
  ('00000000-0000-0000-0000-000000000002', 'Business Owner Demo', '+212 600 000 002', 'business_owner', 0, 0),
  ('00000000-0000-0000-0000-000000000003', 'Client Demo', '+212 600 000 003', 'client', 50, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert demo businesses
INSERT INTO businesses (id, name, description, address, city, phone, email, category, rating, review_count, owner_id, coordinates, status) VALUES
  ('b1', 'Salon Élégance', 'Salon de coiffure moderne spécialisé dans les coupes tendance et colorations.', '45 Boulevard Mohammed V', 'Casablanca', '+212 522 123 456', 'contact@salon-elegance.ma', 'hair-styling', 4.8, 156, '00000000-0000-0000-0000-000000000002', '{"lat": 33.5731, "lng": -7.5898}', 'approved'),
  ('b2', 'Nail Art Studio', 'Studio spécialisé dans la manucure, pédicure et nail art créatif.', '12 Avenue Hassan II', 'Marrakech', '+212 524 987 654', 'contact@nailart-studio.ma', 'nails', 4.7, 92, '00000000-0000-0000-0000-000000000002', '{"lat": 31.6295, "lng": -7.9811}', 'approved'),
  ('b3', 'Spa Serenity', 'Centre de bien-être proposant massages relaxants et thérapeutiques.', '89 Boulevard Mohammed VI', 'Rabat', '+212 537 321 654', 'info@spa-serenity.ma', 'massage', 4.9, 156, '00000000-0000-0000-0000-000000000002', '{"lat": 34.0209, "lng": -6.8416}', 'approved'),
  ('b4', 'Barbershop Royal', 'Barbier traditionnel pour hommes, ambiance vintage et service premium.', '23 Rue Ibnou Sina', 'Marrakech', '+212 524 654 987', 'contact@barbershop-royal.ma', 'barbering', 4.5, 78, '00000000-0000-0000-0000-000000000002', '{"lat": 31.6295, "lng": -7.9811}', 'approved'),
  ('b5', 'Hammam Atlas', 'Hammam traditionnel marocain avec gommage au savon noir et soins du corps.', '45 Boulevard Ziraoui', 'Casablanca', '+212 522 369 147', 'contact@hammam-atlas.ma', 'body', 4.6, 89, '00000000-0000-0000-0000-000000000002', '{"lat": 33.5731, "lng": -7.5898}', 'approved'),
  ('b6', 'Clinique Esthétique Moderne', 'Clinique esthétique proposant soins du visage et traitements anti-âge.', '91 Rue Al Massira', 'Rabat', '+212 537 852 963', 'contact@clinique-moderne.ma', 'facials-skincare', 4.8, 134, '00000000-0000-0000-0000-000000000002', '{"lat": 34.0209, "lng": -6.8416}', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Insert demo deals
INSERT INTO deals (id, business_id, title, description, image_url, original_price, discounted_price, discount_percentage, valid_until, is_active, booking_enabled, max_bookings_per_slot, duration_minutes) VALUES
  ('d1', 'b1', 'Coupe + Brushing Femme', 'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent.', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800', 400, 200, 50, '2024-06-15', true, true, 2, 60),
  ('d2', 'b1', 'Coloration + Coupe + Brushing', 'Service complet avec coloration professionnelle, coupe et brushing.', 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800', 800, 480, 40, '2024-06-20', true, true, 2, 120),
  ('d3', 'b2', 'Manucure + Pose Vernis Semi-Permanent', 'Manucure complète avec pose de vernis semi-permanent longue tenue.', 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800', 200, 150, 25, '2024-06-18', true, true, 2, 90),
  ('d4', 'b2', 'Pédicure Complète + Vernis', 'Pédicure avec gommage, soins des ongles et pose de vernis.', 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800', 180, 126, 30, '2024-06-24', true, true, 2, 75),
  ('d5', 'b3', 'Massage Relaxant 60min', 'Massage complet du corps aux huiles essentielles d''argan pour une relaxation totale.', 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800', 350, 210, 40, '2024-06-25', true, true, 2, 60),
  ('d6', 'b3', 'Massage Thérapeutique', 'Massage thérapeutique pour soulager tensions et douleurs musculaires.', 'https://images.pexels.com/photos/3757943/pexels-photo-3757943.jpeg?auto=compress&cs=tinysrgb&w=800', 400, 280, 30, '2024-06-28', true, true, 2, 75),
  ('d7', 'b4', 'Coupe Homme + Barbe', 'Coupe moderne avec taille et entretien de barbe. Service professionnel.', 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800', 150, 98, 35, '2024-06-22', true, true, 2, 45),
  ('d8', 'b4', 'Rasage Traditionnel', 'Rasage traditionnel au rasoir avec serviettes chaudes et soins après-rasage.', 'https://images.pexels.com/photos/1813273/pexels-photo-1813273.jpeg?auto=compress&cs=tinysrgb&w=800', 120, 84, 30, '2024-06-26', true, true, 2, 30),
  ('d9', 'b5', 'Hammam Traditionnel + Gommage', 'Détendez-vous avec notre hammam traditionnel marocain suivi d''un gommage au savon noir.', 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800', 250, 175, 30, '2024-06-20', true, true, 2, 90),
  ('d10', 'b5', 'Enveloppement Corps Argan', 'Enveloppement hydratant à l''huile d''argan pour une peau douce et nourrie.', 'https://images.pexels.com/photos/6663590/pexels-photo-6663590.jpeg?auto=compress&cs=tinysrgb&w=800', 350, 245, 30, '2024-06-24', true, true, 2, 75),
  ('d11', 'b6', 'Soin Visage Anti-Âge', 'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation.', 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800', 500, 275, 45, '2024-06-28', true, true, 2, 90),
  ('d12', 'b6', 'Nettoyage de Peau Profond', 'Nettoyage professionnel avec extraction des impuretés et masque purifiant.', 'https://images.pexels.com/photos/4041396/pexels-photo-4041396.jpeg?auto=compress&cs=tinysrgb&w=800', 300, 180, 40, '2024-06-25', true, true, 2, 75)
ON CONFLICT (id) DO NOTHING;

-- Generate time slots for the next 14 days for each deal
DO $$
DECLARE
    deal_record RECORD;
    slot_date DATE;
    slot_time TIME;
    slot_times TIME[] := ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    end_time TIME;
BEGIN
    -- Loop through each deal
    FOR deal_record IN SELECT id, duration_minutes FROM deals LOOP
        -- Generate slots for next 14 days
        FOR i IN 0..13 LOOP
            slot_date := CURRENT_DATE + i;
            
            -- Generate slots for each time
            FOREACH slot_time IN ARRAY slot_times LOOP
                -- Calculate end time based on duration
                end_time := slot_time + (deal_record.duration_minutes || ' minutes')::INTERVAL;
                
                -- Insert time slot
                INSERT INTO time_slots (deal_id, date, start_time, end_time, available_spots, is_available)
                VALUES (
                    deal_record.id,
                    slot_date,
                    slot_time,
                    end_time,
                    FLOOR(RANDOM() * 3) + 1, -- Random spots between 1-3
                    true
                )
                ON CONFLICT DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Insert some sample reviews
INSERT INTO reviews (business_id, user_id, rating, comment) VALUES
  ('b1', '00000000-0000-0000-0000-000000000003', 5, 'Excellent service, très professionnel. Je recommande vivement!'),
  ('b1', '00000000-0000-0000-0000-000000000003', 4, 'Très satisfaite du résultat, personnel accueillant.'),
  ('b2', '00000000-0000-0000-0000-000000000003', 5, 'Nail art magnifique, travail très soigné.'),
  ('b3', '00000000-0000-0000-0000-000000000003', 5, 'Massage relaxant parfait, ambiance zen.'),
  ('b4', '00000000-0000-0000-0000-000000000003', 4, 'Coupe impeccable, service rapide.'),
  ('b5', '00000000-0000-0000-0000-000000000003', 5, 'Hammam traditionnel authentique, très relaxant.'),
  ('b6', '00000000-0000-0000-0000-000000000003', 5, 'Soin visage exceptionnel, peau transformée.')
ON CONFLICT DO NOTHING;

-- Insert some sample favorites
INSERT INTO favorites (user_id, deal_id) VALUES
  ('00000000-0000-0000-0000-000000000003', 'd1'),
  ('00000000-0000-0000-0000-000000000003', 'd3'),
  ('00000000-0000-0000-0000-000000000003', 'd5'),
  ('00000000-0000-0000-0000-000000000003', 'd7')
ON CONFLICT DO NOTHING;