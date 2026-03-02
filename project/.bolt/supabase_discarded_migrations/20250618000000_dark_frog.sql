/*
  # Insert Sample Data for Dealio Beauty Platform

  1. Sample Businesses
    - Various beauty businesses across Moroccan cities
    - Different categories (hair, hammam, massage, etc.)

  2. Sample Deals
    - Active deals with booking capabilities
    - Various price points and discounts

  3. Sample Time Slots
    - Available booking slots for the next 30 days
    - Different time ranges throughout the day
*/

-- Insert sample businesses
INSERT INTO businesses (id, name, description, address, city, phone, email, category, rating, review_count, coordinates) VALUES
('b1111111-1111-1111-1111-111111111111', 'Salon Chic & Style', 'Salon de coiffure moderne offrant des services de qualité pour femmes et hommes', '123 Rue Mohammed V', 'Casablanca', '+212 522 123 456', 'contact@chicstyle.ma', 'hair', 4.8, 124, '{"lat": 33.5731, "lng": -7.5898}'),
('b2222222-2222-2222-2222-222222222222', 'Hammam Atlas', 'Hammam traditionnel marocain avec services de gommage et relaxation', '45 Boulevard Ziraoui', 'Casablanca', '+212 522 234 567', 'info@hammamatlas.ma', 'hammam', 4.6, 89, '{"lat": 33.5892, "lng": -7.6261}'),
('b3333333-3333-3333-3333-333333333333', 'Spa Serenity', 'Spa luxueux proposant massages et soins du corps', '78 Rue Allal Ben Abdellah', 'Rabat', '+212 537 345 678', 'spa@serenity.ma', 'massage', 4.9, 156, '{"lat": 34.0209, "lng": -6.8416}'),
('b4444444-4444-4444-4444-444444444444', 'Nail Art Studio', 'Studio spécialisé en manucure et nail art créatif', '12 Avenue Hassan II', 'Marrakech', '+212 524 456 789', 'hello@nailart.ma', 'nails', 4.7, 92, '{"lat": 31.6295, "lng": -7.9811}'),
('b5555555-5555-5555-5555-555555555555', 'Barbershop Royal', 'Salon de coiffure traditionnel pour hommes', '34 Rue de la Liberté', 'Casablanca', '+212 522 567 890', 'royal@barbershop.ma', 'barbershop', 4.5, 67, '{"lat": 33.5731, "lng": -7.5898}'),
('b6666666-6666-6666-6666-666666666666', 'Clinique Esthétique Moderne', 'Clinique esthétique avec soins anti-âge et traitements avancés', '89 Boulevard Mohammed VI', 'Rabat', '+212 537 678 901', 'contact@clinique-moderne.ma', 'aesthetic-clinic', 4.8, 134, '{"lat": 34.0209, "lng": -6.8416}');

-- Insert sample deals
INSERT INTO deals (id, business_id, title, description, image_url, original_price, discounted_price, discount_percentage, valid_until, booking_enabled, duration_minutes) VALUES
('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Coupe + Brushing Femme', 'Profitez d''une coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look.', 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800', 400, 200, 50, '2024-03-15', true, 90),
('d2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Hammam Traditionnel + Gommage', 'Détendez-vous avec notre hammam traditionnel marocain suivi d''un gommage au savon noir. Une expérience authentique et relaxante.', 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800', 250, 175, 30, '2024-03-20', true, 120),
('d3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Massage Relaxant 60min', 'Massage complet du corps aux huiles essentielles d''argan pour une relaxation totale. Idéal pour évacuer le stress.', 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800', 350, 210, 40, '2024-03-25', true, 60),
('d4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Manucure + Pose Vernis Semi-Permanent', 'Manucure complète avec pose de vernis semi-permanent longue tenue. Large choix de couleurs tendance.', 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800', 200, 150, 25, '2024-03-18', true, 75),
('d5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'Coupe Homme + Barbe', 'Coupe moderne avec taille et entretien de barbe. Service professionnel dans une ambiance conviviale.', 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800', 150, 98, 35, '2024-03-22', true, 45),
('d6666666-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', 'Soin Visage Anti-Âge', 'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation. Produits haut de gamme.', 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800', 500, 275, 45, '2024-03-28', true, 90);

-- Insert sample time slots for the next 7 days
DO $$
DECLARE
    deal_record RECORD;
    slot_date DATE;
    slot_time TIME;
    slot_end TIME;
BEGIN
    -- Loop through each deal
    FOR deal_record IN SELECT id, duration_minutes FROM deals LOOP
        -- Generate slots for next 7 days
        FOR i IN 0..6 LOOP
            slot_date := CURRENT_DATE + i;
            
            -- Skip Sundays (day of week 0)
            IF EXTRACT(DOW FROM slot_date) != 0 THEN
                -- Morning slots: 9:00 - 12:00
                slot_time := '09:00'::TIME;
                WHILE slot_time < '12:00'::TIME LOOP
                    slot_end := slot_time + (deal_record.duration_minutes || ' minutes')::INTERVAL;
                    IF slot_end <= '12:00'::TIME THEN
                        INSERT INTO time_slots (deal_id, date, start_time, end_time, available_spots, is_available)
                        VALUES (deal_record.id, slot_date, slot_time, slot_end::TIME, 2, true);
                    END IF;
                    slot_time := slot_time + '30 minutes'::INTERVAL;
                END LOOP;
                
                -- Afternoon slots: 14:00 - 18:00
                slot_time := '14:00'::TIME;
                WHILE slot_time < '18:00'::TIME LOOP
                    slot_end := slot_time + (deal_record.duration_minutes || ' minutes')::INTERVAL;
                    IF slot_end <= '18:00'::TIME THEN
                        INSERT INTO time_slots (deal_id, date, start_time, end_time, available_spots, is_available)
                        VALUES (deal_record.id, slot_date, slot_time, slot_end::TIME, 2, true);
                    END IF;
                    slot_time := slot_time + '30 minutes'::INTERVAL;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;