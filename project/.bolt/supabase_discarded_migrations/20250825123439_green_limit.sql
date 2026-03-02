/*
  # Create Sample Offers for Business Testing

  This script creates diverse sample offers for testing the complete business workflow.
  
  1. Businesses Created
     - Salon Prestige Casablanca (Coiffure)
     - Spa Serenity Rabat (Massage)
     - Beauty Nails Studio (Ongles)
     - Esthétique Moderne Fès (Esthetique)
     - Studio Maquillage Pro (Manucure)

  2. Sample Offers
     - 8 diverse offers with different categories, pricing, and durations
     - Includes edge cases for testing (short/long term, different booking policies)
     - Time slots generated for 21 days

  3. Testing Scenarios
     - Business dashboard management
     - Client booking experience
     - QR code validation
     - Different offer types and policies
*/

DO $$
DECLARE
    business_owner_id UUID := '14961e21-7c51-46d4-9832-fbe12aa8b3f9';
    salon_id UUID;
    spa_id UUID;
    nails_id UUID;
    esthetic_id UUID;
    makeup_id UUID;
    deal_id UUID;
    slot_date DATE;
    slot_time TIME;
    i INTEGER;
    j INTEGER;
BEGIN
    -- Create Business 1: Salon Prestige Casablanca
    INSERT INTO businesses (
        name,
        description,
        address,
        city,
        category,
        phone,
        email,
        rating,
        review_count,
        owner_id,
        status
    ) VALUES (
        'Salon Prestige Casablanca',
        'Salon de coiffure haut de gamme spécialisé dans les coupes tendance et colorations professionnelles.',
        '123 Boulevard Mohammed V',
        'Casablanca',
        'Coiffure',
        '+212 522 123 456',
        'contact@salon-prestige.ma',
        4.8,
        156,
        business_owner_id,
        'approved'
    ) RETURNING id INTO salon_id;

    -- Deal 1: Coupe + Brushing + Soin
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        salon_id,
        'Coupe + Brushing + Soin Professionnel',
        'Service complet incluant coupe moderne, brushing professionnel et soin capillaire nourrissant. Nos stylistes expérimentés vous conseillent pour sublimer votre look selon votre morphologie et style de vie.',
        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
        450,
        225,
        90,
        1,
        24,
        12,
        NOW(),
        NOW() + INTERVAL '30 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 1
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        -- Skip Sundays
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..8 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '10:30'::TIME;
                    WHEN 3 THEN slot_time := '11:30'::TIME;
                    WHEN 4 THEN slot_time := '14:00'::TIME;
                    WHEN 5 THEN slot_time := '15:00'::TIME;
                    WHEN 6 THEN slot_time := '16:00'::TIME;
                    WHEN 7 THEN slot_time := '17:00'::TIME;
                    WHEN 8 THEN slot_time := '18:00'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 1, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Deal 2: Coloration Complète
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        salon_id,
        'Coloration Complète + Coupe + Brushing',
        'Transformation capillaire complète avec coloration professionnelle, coupe personnalisée et brushing. Produits haut de gamme et techniques avancées pour un résultat exceptionnel.',
        'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
        800,
        480,
        180,
        1,
        48,
        24,
        NOW(),
        NOW() + INTERVAL '45 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 2
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..4 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '12:00'::TIME;
                    WHEN 3 THEN slot_time := '14:00'::TIME;
                    WHEN 4 THEN slot_time := '16:00'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 1, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Create Business 2: Spa Serenity Rabat
    INSERT INTO businesses (
        name,
        description,
        address,
        city,
        category,
        phone,
        email,
        rating,
        review_count,
        owner_id,
        status
    ) VALUES (
        'Spa Serenity Rabat',
        'Centre de bien-être proposant massages thérapeutiques, soins du corps et relaxation dans un cadre zen.',
        '45 Avenue Hassan II',
        'Rabat',
        'Massage',
        '+212 537 654 321',
        'info@spa-serenity.ma',
        4.9,
        203,
        business_owner_id,
        'approved'
    ) RETURNING id INTO spa_id;

    -- Deal 3: Massage Relaxant
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        spa_id,
        'Massage Relaxant aux Huiles Essentielles',
        'Massage complet du corps de 60 minutes aux huiles essentielles d''argan et de lavande. Technique de relaxation profonde pour évacuer le stress et les tensions.',
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        400,
        240,
        60,
        2,
        12,
        6,
        NOW(),
        NOW() + INTERVAL '21 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 3
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..10 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '10:00'::TIME;
                    WHEN 3 THEN slot_time := '11:00'::TIME;
                    WHEN 4 THEN slot_time := '14:00'::TIME;
                    WHEN 5 THEN slot_time := '15:00'::TIME;
                    WHEN 6 THEN slot_time := '16:00'::TIME;
                    WHEN 7 THEN slot_time := '17:00'::TIME;
                    WHEN 8 THEN slot_time := '18:00'::TIME;
                    WHEN 9 THEN slot_time := '19:00'::TIME;
                    WHEN 10 THEN slot_time := '20:00'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 2, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Create Business 3: Beauty Nails Studio
    INSERT INTO businesses (
        name,
        description,
        address,
        city,
        category,
        phone,
        email,
        rating,
        review_count,
        owner_id,
        status
    ) VALUES (
        'Beauty Nails Studio',
        'Studio spécialisé dans les soins des ongles, nail art créatif et manucure/pédicure professionnelle.',
        '78 Rue de la Liberté',
        'Marrakech',
        'Ongles',
        '+212 524 987 654',
        'contact@beauty-nails.ma',
        4.7,
        142,
        business_owner_id,
        'approved'
    ) RETURNING id INTO nails_id;

    -- Deal 4: Manucure + Vernis Semi-Permanent
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        nails_id,
        'Manucure Complète + Vernis Semi-Permanent',
        'Manucure professionnelle avec soin des cuticules, limage, polissage et pose de vernis semi-permanent longue tenue. Plus de 50 couleurs disponibles.',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        200,
        140,
        75,
        2,
        6,
        3,
        NOW(),
        NOW() + INTERVAL '14 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 4
    FOR i IN 0..13 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..12 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '09:30'::TIME;
                    WHEN 3 THEN slot_time := '10:00'::TIME;
                    WHEN 4 THEN slot_time := '10:30'::TIME;
                    WHEN 5 THEN slot_time := '11:00'::TIME;
                    WHEN 6 THEN slot_time := '11:30'::TIME;
                    WHEN 7 THEN slot_time := '14:00'::TIME;
                    WHEN 8 THEN slot_time := '14:30'::TIME;
                    WHEN 9 THEN slot_time := '15:00'::TIME;
                    WHEN 10 THEN slot_time := '15:30'::TIME;
                    WHEN 11 THEN slot_time := '16:00'::TIME;
                    WHEN 12 THEN slot_time := '16:30'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 2, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Create Business 4: Esthétique Moderne Fès
    INSERT INTO businesses (
        name,
        description,
        address,
        city,
        category,
        phone,
        email,
        rating,
        review_count,
        owner_id,
        status
    ) VALUES (
        'Esthétique Moderne Fès',
        'Centre d''esthétique avancée proposant soins du visage, épilation laser et traitements anti-âge.',
        '56 Boulevard Allal Ben Abdellah',
        'Fès',
        'Esthetique',
        '+212 535 741 852',
        'info@esthetique-moderne.ma',
        4.6,
        98,
        business_owner_id,
        'approved'
    ) RETURNING id INTO esthetic_id;

    -- Deal 5: Soin Anti-Âge (Short-term offer - expires soon)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        esthetic_id,
        'Soin Visage Anti-Âge Premium',
        'Soin complet anti-âge avec nettoyage profond, peeling enzymatique, masque collagène et sérum hydratant. Technologie LED incluse pour stimuler la régénération cellulaire.',
        'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        600,
        300,
        90,
        1,
        24,
        12,
        NOW(),
        NOW() + INTERVAL '7 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 5 (limited slots due to short duration)
    FOR i IN 0..6 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..6 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '11:00'::TIME;
                    WHEN 3 THEN slot_time := '14:00'::TIME;
                    WHEN 4 THEN slot_time := '15:30'::TIME;
                    WHEN 5 THEN slot_time := '17:00'::TIME;
                    WHEN 6 THEN slot_time := '18:30'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 1, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Deal 6: Épilation Laser (Long-term offer)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        esthetic_id,
        'Épilation Laser - Zone au Choix',
        'Séance d''épilation laser définitive sur zone au choix (jambes, aisselles, maillot). Technologie laser dernière génération, résultats durables et peau douce.',
        'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
        300,
        180,
        45,
        3,
        72,
        48,
        NOW(),
        NOW() + INTERVAL '120 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 6 (more availability due to longer duration)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..14 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '08:30'::TIME;
                    WHEN 2 THEN slot_time := '09:15'::TIME;
                    WHEN 3 THEN slot_time := '10:00'::TIME;
                    WHEN 4 THEN slot_time := '10:45'::TIME;
                    WHEN 5 THEN slot_time := '11:30'::TIME;
                    WHEN 6 THEN slot_time := '12:15'::TIME;
                    WHEN 7 THEN slot_time := '14:00'::TIME;
                    WHEN 8 THEN slot_time := '14:45'::TIME;
                    WHEN 9 THEN slot_time := '15:30'::TIME;
                    WHEN 10 THEN slot_time := '16:15'::TIME;
                    WHEN 11 THEN slot_time := '17:00'::TIME;
                    WHEN 12 THEN slot_time := '17:45'::TIME;
                    WHEN 13 THEN slot_time := '18:30'::TIME;
                    WHEN 14 THEN slot_time := '19:15'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 3, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Create Business 5: Studio Maquillage Pro
    INSERT INTO businesses (
        name,
        description,
        address,
        city,
        category,
        phone,
        email,
        rating,
        review_count,
        owner_id,
        status
    ) VALUES (
        'Studio Maquillage Pro',
        'Studio professionnel de maquillage pour événements, formations et séances photo.',
        '28 Rue Prince Héritier',
        'Casablanca',
        'Manucure',
        '+212 522 741 852',
        'info@maquillage-pro.ma',
        4.7,
        95,
        business_owner_id,
        'approved'
    ) RETURNING id INTO makeup_id;

    -- Deal 7: Maquillage Soirée
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        makeup_id,
        'Maquillage Soirée Professionnel',
        'Maquillage professionnel pour soirée avec produits haut de gamme. Consultation personnalisée pour créer le look parfait selon votre style et l''événement.',
        'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
        300,
        180,
        60,
        2,
        12,
        6,
        NOW(),
        NOW() + INTERVAL '30 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 7
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..8 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '10:00'::TIME;
                    WHEN 2 THEN slot_time := '11:00'::TIME;
                    WHEN 3 THEN slot_time := '12:00'::TIME;
                    WHEN 4 THEN slot_time := '14:00'::TIME;
                    WHEN 5 THEN slot_time := '15:00'::TIME;
                    WHEN 6 THEN slot_time := '16:00'::TIME;
                    WHEN 7 THEN slot_time := '17:00'::TIME;
                    WHEN 8 THEN slot_time := '18:00'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 2, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Deal 8: Maquillage Mariée (Premium service)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        deal_price,
        duration_minutes,
        max_bookings_per_slot,
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        makeup_id,
        'Forfait Maquillage Mariée Complet',
        'Package mariée incluant essai maquillage, maquillage jour J avec retouches, et kit de retouche personnel. Service premium pour votre jour le plus important.',
        'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800',
        800,
        560,
        180,
        1,
        168,
        72,
        NOW(),
        NOW() + INTERVAL '90 days',
        true
    ) RETURNING id INTO deal_id;

    -- Generate time slots for Deal 8 (weekend focus for weddings)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        -- Focus on weekends for bridal services
        IF EXTRACT(DOW FROM slot_date) IN (5, 6, 0) THEN -- Friday, Saturday, Sunday
            FOR j IN 1..4 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '08:00'::TIME;
                    WHEN 2 THEN slot_time := '11:00'::TIME;
                    WHEN 3 THEN slot_time := '14:00'::TIME;
                    WHEN 4 THEN slot_time := '17:00'::TIME;
                END CASE;
                
                INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
                VALUES (deal_id, slot_date, slot_time, 1, 0);
            END LOOP;
        END IF;
    END LOOP;

    -- Output summary
    RAISE NOTICE '🎉 Sample offers created successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   • Business Owner ID: %', business_owner_id;
    RAISE NOTICE '   • Businesses created: 4';
    RAISE NOTICE '   • Deals created: 6';
    RAISE NOTICE '   • Categories covered: Coiffure, Massage, Ongles, Esthetique, Manucure';
    RAISE NOTICE '   • Cities: Casablanca, Rabat, Marrakech, Fès';
    RAISE NOTICE '   • Price range: 140-560 DH';
    RAISE NOTICE '   • Duration range: 45-180 minutes';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Testing scenarios included:';
    RAISE NOTICE '   • Short-term offer (7 days)';
    RAISE NOTICE '   • Long-term offer (120 days)';
    RAISE NOTICE '   • Premium services (560 DH)';
    RAISE NOTICE '   • Quick services (45min)';
    RAISE NOTICE '   • Group bookings (up to 3 people)';
    RAISE NOTICE '   • Strict booking policies (72h advance)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Ready for testing! Login with your business account to manage offers.';

END $$;