-- Create Sample Offers for Business Testing
-- Business Owner ID: 14961e21-7c51-46d4-9832-fbe12aa8b3f9

-- First, let's create or update the business for this owner
DO $$
DECLARE
    business_uuid UUID;
    deal_uuid UUID;
    slot_date DATE;
    slot_time TIME;
    i INTEGER;
    j INTEGER;
BEGIN
    -- Create or get the main business
    INSERT INTO businesses (
        id,
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
        status,
        image_url
    ) VALUES (
        gen_random_uuid(),
        'Salon Prestige Casablanca',
        'Salon de coiffure haut de gamme spécialisé dans les coupes tendance et colorations professionnelles.',
        '123 Boulevard Mohammed V',
        'Casablanca',
        'Coiffure',
        '+212 522 123 456',
        'contact@salon-prestige.ma',
        4.8,
        156,
        '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
        'approved',
        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'
    ) ON CONFLICT (owner_id) DO UPDATE SET
        status = 'approved',
        updated_at = NOW()
    RETURNING id INTO business_uuid;

    -- If no business was returned (conflict), get the existing one
    IF business_uuid IS NULL THEN
        SELECT id INTO business_uuid 
        FROM businesses 
        WHERE owner_id = '14961e21-7c51-46d4-9832-fbe12aa8b3f9' 
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Business ID: %', business_uuid;

    -- Create Deal 1: Coupe + Brushing + Soin
    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
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
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for Deal 1
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        -- Skip Sundays
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..8 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '10:30'::TIME;
                    WHEN 3 THEN slot_time := '11:00'::TIME;
                    WHEN 4 THEN slot_time := '14:00'::TIME;
                    WHEN 5 THEN slot_time := '15:30'::TIME;
                    WHEN 6 THEN slot_time := '16:00'::TIME;
                    WHEN 7 THEN slot_time := '17:00'::TIME;
                    WHEN 8 THEN slot_time := '17:30'::TIME;
                END CASE;

                INSERT INTO time_slots (
                    deal_id,
                    slot_date,
                    slot_time,
                    available_spots,
                    booked_spots
                ) VALUES (
                    deal_uuid,
                    slot_date,
                    slot_time,
                    1,
                    0
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Create Deal 2: Coloration Complète
    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
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
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for Deal 2 (longer sessions, fewer slots)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..4 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '12:00'::TIME;
                    WHEN 3 THEN slot_time := '14:00'::TIME;
                    WHEN 4 THEN slot_time := '16:30'::TIME;
                END CASE;

                INSERT INTO time_slots (
                    deal_id,
                    slot_date,
                    slot_time,
                    available_spots,
                    booked_spots
                ) VALUES (
                    deal_uuid,
                    slot_date,
                    slot_time,
                    1,
                    0
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Create Deal 3: Massage Service (different business)
    INSERT INTO businesses (
        id,
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
        status,
        image_url
    ) VALUES (
        gen_random_uuid(),
        'Spa Serenity Rabat',
        'Centre de bien-être proposant massages thérapeutiques et soins du corps dans un cadre zen.',
        '89 Avenue Hassan II',
        'Rabat',
        'Massage',
        '+212 537 321 654',
        'info@spa-serenity.ma',
        4.9,
        203,
        '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
        'approved',
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800'
    ) RETURNING id INTO business_uuid;

    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
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
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for massage (multiple people per slot)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..10 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '10:00'::TIME;
                    WHEN 3 THEN slot_time := '11:00'::TIME;
                    WHEN 4 THEN slot_time := '12:00'::TIME;
                    WHEN 5 THEN slot_time := '14:00'::TIME;
                    WHEN 6 THEN slot_time := '15:00'::TIME;
                    WHEN 7 THEN slot_time := '16:00'::TIME;
                    WHEN 8 THEN slot_time := '17:00'::TIME;
                    WHEN 9 THEN slot_time := '18:00'::TIME;
                    WHEN 10 THEN slot_time := '19:00'::TIME;
                END CASE;

                INSERT INTO time_slots (
                    deal_id,
                    slot_date,
                    slot_time,
                    available_spots,
                    booked_spots
                ) VALUES (
                    deal_uuid,
                    slot_date,
                    slot_time,
                    2,
                    0
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Create Deal 4: Nail Studio
    INSERT INTO businesses (
        id,
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
        status,
        image_url
    ) VALUES (
        gen_random_uuid(),
        'Beauty Nails Studio',
        'Studio spécialisé dans les soins des ongles, nail art créatif et manucure/pédicure professionnelle.',
        '78 Rue de la Liberté',
        'Marrakech',
        'Ongles',
        '+212 524 987 654',
        'contact@beauty-nails.ma',
        4.7,
        142,
        '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
        'approved',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800'
    ) RETURNING id INTO business_uuid;

    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
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
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for nails (quick turnaround)
    FOR i IN 0..13 LOOP
        slot_date := CURRENT_DATE + i;
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

            INSERT INTO time_slots (
                deal_id,
                slot_date,
                slot_time,
                available_spots,
                booked_spots
            ) VALUES (
                deal_uuid,
                slot_date,
                slot_time,
                2,
                0
            );
        END LOOP;
    END LOOP;

    -- Create Deal 5: Esthetics Business
    INSERT INTO businesses (
        id,
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
        status,
        image_url
    ) VALUES (
        gen_random_uuid(),
        'Esthétique Moderne Fès',
        'Centre d''esthétique avancée proposant soins du visage, épilation laser et traitements anti-âge.',
        '56 Boulevard Allal Ben Abdellah',
        'Fès',
        'Esthetique',
        '+212 535 741 852',
        'info@esthetique-moderne.ma',
        4.6,
        98,
        '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
        'approved',
        'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800'
    ) RETURNING id INTO business_uuid;

    -- Deal 5a: Anti-aging facial (expiring soon - edge case)
    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
        'Soin Visage Anti-Âge Premium',
        'Soin complet anti-âge avec nettoyage profond, peeling enzymatique, masque collagène et sérum hydratant. Technologie LED incluse.',
        'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        600,
        300,
        90,
        1,
        24,
        12,
        NOW(),
        NOW() + INTERVAL '7 days', -- Expiring soon for testing
        true
    ) RETURNING id INTO deal_uuid;

    -- Generate limited time slots for expiring deal
    FOR i IN 0..6 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..6 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '11:00'::TIME;
                    WHEN 3 THEN slot_time := '14:00'::TIME;
                    WHEN 4 THEN slot_time := '15:30'::TIME;
                    WHEN 5 THEN slot_time := '16:30'::TIME;
                    WHEN 6 THEN slot_time := '17:30'::TIME;
                END CASE;

                INSERT INTO time_slots (
                    deal_id,
                    slot_date,
                    slot_time,
                    available_spots,
                    booked_spots
                ) VALUES (
                    deal_uuid,
                    slot_date,
                    slot_time,
                    1,
                    0
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Deal 5b: Laser hair removal (long-term offer)
    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
        'Épilation Laser - Zone au Choix',
        'Séance d''épilation laser définitive sur zone au choix (jambes, aisselles, maillot). Technologie laser dernière génération, résultats durables.',
        'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
        300,
        180,
        45,
        3,
        72,
        48,
        NOW(),
        NOW() + INTERVAL '120 days', -- Long-term offer
        true
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for laser (multiple people per slot)
    FOR i IN 0..30 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..8 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '10:00'::TIME;
                    WHEN 3 THEN slot_time := '11:00'::TIME;
                    WHEN 4 THEN slot_time := '14:00'::TIME;
                    WHEN 5 THEN slot_time := '15:00'::TIME;
                    WHEN 6 THEN slot_time := '16:00'::TIME;
                    WHEN 7 THEN slot_time := '17:00'::TIME;
                    WHEN 8 THEN slot_time := '18:00'::TIME;
                END CASE;

                INSERT INTO time_slots (
                    deal_id,
                    slot_date,
                    slot_time,
                    available_spots,
                    booked_spots
                ) VALUES (
                    deal_uuid,
                    slot_date,
                    slot_time,
                    3,
                    0
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Create Deal 6: Spa Business
    INSERT INTO businesses (
        id,
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
        status,
        image_url
    ) VALUES (
        gen_random_uuid(),
        'Hammam Atlas Traditionnel',
        'Hammam traditionnel marocain avec gommage au savon noir et soins du corps authentiques.',
        '45 Boulevard Ziraoui',
        'Casablanca',
        'Spa',
        '+212 522 369 147',
        'contact@hammam-atlas.ma',
        4.6,
        89,
        '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
        'approved',
        'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800'
    ) RETURNING id INTO business_uuid;

    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
        'Hammam Traditionnel + Gommage + Enveloppement',
        'Expérience hammam authentique avec gommage au savon noir, enveloppement à l''argile et relaxation. Rituel complet de purification et détente.',
        'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
        350,
        210,
        120,
        4,
        24,
        12,
        NOW(),
        NOW() + INTERVAL '60 days',
        true
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for hammam (group sessions)
    FOR i IN 0..25 LOOP
        slot_date := CURRENT_DATE + i;
        FOR j IN 1..6 LOOP
            CASE j
                WHEN 1 THEN slot_time := '10:00'::TIME;
                WHEN 2 THEN slot_time := '12:00'::TIME;
                WHEN 3 THEN slot_time := '14:00'::TIME;
                WHEN 4 THEN slot_time := '16:00'::TIME;
                WHEN 5 THEN slot_time := '18:00'::TIME;
                WHEN 6 THEN slot_time := '20:00'::TIME;
            END CASE;

            INSERT INTO time_slots (
                deal_id,
                slot_date,
                slot_time,
                available_spots,
                booked_spots
            ) VALUES (
                deal_uuid,
                slot_date,
                slot_time,
                4,
                0
            );
        END LOOP;
    END LOOP;

    -- Create Deal 7: Makeup Business
    INSERT INTO businesses (
        id,
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
        status,
        image_url
    ) VALUES (
        gen_random_uuid(),
        'Studio Maquillage Pro',
        'Studio professionnel de maquillage pour événements, mariages et formations beauté.',
        '28 Rue Prince Héritier',
        'Casablanca',
        'Manucure',
        '+212 522 741 852',
        'info@maquillage-pro.ma',
        4.8,
        76,
        '14961e21-7c51-46d4-9832-fbe12aa8b3f9',
        'approved',
        'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800'
    ) RETURNING id INTO business_uuid;

    -- Deal 7a: Evening makeup
    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
        'Maquillage Soirée Professionnel',
        'Maquillage professionnel pour soirée avec produits haut de gamme. Look personnalisé selon votre style et l''occasion.',
        'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
        300,
        180,
        60,
        1,
        12,
        6,
        NOW(),
        NOW() + INTERVAL '30 days',
        true
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for makeup
    FOR i IN 0..29 LOOP
        slot_date := CURRENT_DATE + i;
        IF EXTRACT(DOW FROM slot_date) != 0 THEN
            FOR j IN 1..8 LOOP
                CASE j
                    WHEN 1 THEN slot_time := '09:00'::TIME;
                    WHEN 2 THEN slot_time := '10:00'::TIME;
                    WHEN 3 THEN slot_time := '11:00'::TIME;
                    WHEN 4 THEN slot_time := '14:00'::TIME;
                    WHEN 5 THEN slot_time := '15:00'::TIME;
                    WHEN 6 THEN slot_time := '16:00'::TIME;
                    WHEN 7 THEN slot_time := '17:00'::TIME;
                    WHEN 8 THEN slot_time := '18:00'::TIME;
                END CASE;

                INSERT INTO time_slots (
                    deal_id,
                    slot_date,
                    slot_time,
                    available_spots,
                    booked_spots
                ) VALUES (
                    deal_uuid,
                    slot_date,
                    slot_time,
                    1,
                    0
                );
            END LOOP;
        END IF;
    END LOOP;

    -- Deal 7b: Bridal makeup (premium service)
    INSERT INTO deals (
        id,
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
        gen_random_uuid(),
        business_uuid,
        'Maquillage Mariée + Essai',
        'Maquillage complet pour mariée avec essai préalable inclus. Service premium avec produits longue tenue.',
        'https://images.pexels.com/photos/4041398/pexels-photo-4041398.jpeg?auto=compress&cs=tinysrgb&w=800',
        800,
        560,
        120,
        1,
        168, -- 1 week advance booking
        72,  -- 3 days cancellation notice
        NOW(),
        NOW() + INTERVAL '90 days',
        true
    ) RETURNING id INTO deal_uuid;

    -- Generate time slots for bridal makeup (weekend focused)
    FOR i IN 0..12 LOOP -- 12 weeks
        slot_date := CURRENT_DATE + (i * 7) + 5; -- Fridays
        INSERT INTO time_slots (
            deal_id,
            slot_date,
            slot_time,
            available_spots,
            booked_spots
        ) VALUES (
            deal_uuid,
            slot_date,
            '09:00'::TIME,
            1,
            0
        );
        
        slot_date := CURRENT_DATE + (i * 7) + 6; -- Saturdays
        FOR j IN 1..3 LOOP
            CASE j
                WHEN 1 THEN slot_time := '08:00'::TIME;
                WHEN 2 THEN slot_time := '10:30'::TIME;
                WHEN 3 THEN slot_time := '13:00'::TIME;
            END CASE;

            INSERT INTO time_slots (
                deal_id,
                slot_date,
                slot_time,
                available_spots,
                booked_spots
            ) VALUES (
                deal_uuid,
                slot_date,
                slot_time,
                1,
                0
            );
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Sample offers creation completed successfully!';
    RAISE NOTICE 'Business Owner ID: %', '14961e21-7c51-46d4-9832-fbe12aa8b3f9';
    RAISE NOTICE 'Created multiple businesses with diverse offers and time slots';

END $$;

-- Verify the created data
SELECT 
    b.name as business_name,
    b.city,
    b.category,
    COUNT(d.id) as deal_count,
    AVG(d.deal_price) as avg_price,
    MIN(d.valid_until) as earliest_expiry,
    MAX(d.valid_until) as latest_expiry
FROM businesses b
LEFT JOIN deals d ON b.id = d.business_id
WHERE b.owner_id = '14961e21-7c51-46d4-9832-fbe12aa8b3f9'
GROUP BY b.id, b.name, b.city, b.category
ORDER BY b.created_at;

-- Show time slots summary
SELECT 
    d.title,
    COUNT(ts.id) as total_slots,
    SUM(ts.available_spots) as total_capacity,
    MIN(ts.slot_date) as first_available,
    MAX(ts.slot_date) as last_available
FROM deals d
JOIN businesses b ON d.business_id = b.id
LEFT JOIN time_slots ts ON d.id = ts.deal_id
WHERE b.owner_id = '14961e21-7c51-46d4-9832-fbe12aa8b3f9'
GROUP BY d.id, d.title
ORDER BY d.created_at;