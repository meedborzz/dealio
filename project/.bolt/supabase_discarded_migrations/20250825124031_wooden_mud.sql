/*
  # Create Sample Offers for Testing

  This script creates sample businesses and offers for testing the Dealio Beauty platform.
  It will create 5 businesses with 6 diverse offers and generate time slots for booking testing.

  ## What will be created:
  1. 5 businesses in different cities and categories
  2. 6 offers with varied pricing, durations, and validity periods
  3. Time slots for the next 21 days for each offer

  ## Business Owner ID:
  All businesses will be assigned to: 14961e21-7c51-46d4-9832-fbe12aa8b3f9
*/

DO $$
DECLARE
    business_owner_id UUID := '14961e21-7c51-46d4-9832-fbe12aa8b3f9';
    business1_id UUID;
    business2_id UUID;
    business3_id UUID;
    business4_id UUID;
    business5_id UUID;
    deal1_id UUID;
    deal2_id UUID;
    deal3_id UUID;
    deal4_id UUID;
    deal5_id UUID;
    deal6_id UUID;
    slot_date DATE;
    slot_time TIME;
    i INTEGER;
    j INTEGER;
BEGIN
    RAISE NOTICE '🚀 Starting sample offers creation...';
    
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
        status,
        coordinates
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
        'approved',
        '{"lat": 33.5731, "lng": -7.5898}'::jsonb
    ) RETURNING id INTO business1_id;
    
    RAISE NOTICE '✅ Created business: Salon Prestige Casablanca (ID: %)', business1_id;

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
        status,
        coordinates
    ) VALUES (
        'Spa Serenity Rabat',
        'Centre de bien-être proposant massages thérapeutiques et soins du corps dans un cadre zen.',
        '45 Avenue Hassan II',
        'Rabat',
        'Massage',
        '+212 537 654 321',
        'info@spa-serenity.ma',
        4.9,
        203,
        business_owner_id,
        'approved',
        '{"lat": 34.0209, "lng": -6.8416}'::jsonb
    ) RETURNING id INTO business2_id;
    
    RAISE NOTICE '✅ Created business: Spa Serenity Rabat (ID: %)', business2_id;

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
        status,
        coordinates
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
        'approved',
        '{"lat": 31.6295, "lng": -7.9811}'::jsonb
    ) RETURNING id INTO business3_id;
    
    RAISE NOTICE '✅ Created business: Beauty Nails Studio (ID: %)', business3_id;

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
        status,
        coordinates
    ) VALUES (
        'Esthétique Moderne Fès',
        'Centre d''esthétique avancée proposant soins du visage, épilation et traitements anti-âge.',
        '56 Boulevard Allal Ben Abdellah',
        'Fès',
        'Esthetique',
        '+212 535 741 852',
        'info@esthetique-moderne.ma',
        4.6,
        98,
        business_owner_id,
        'approved',
        '{"lat": 34.0181, "lng": -5.0078}'::jsonb
    ) RETURNING id INTO business4_id;
    
    RAISE NOTICE '✅ Created business: Esthétique Moderne Fès (ID: %)', business4_id;

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
        status,
        coordinates
    ) VALUES (
        'Studio Maquillage Pro',
        'Studio professionnel de maquillage pour événements, formations et conseils beauté personnalisés.',
        '28 Rue Prince Héritier',
        'Casablanca',
        'Manucure',
        '+212 522 741 852',
        'info@maquillage-pro.ma',
        4.8,
        76,
        business_owner_id,
        'approved',
        '{"lat": 33.5831, "lng": -7.5998}'::jsonb
    ) RETURNING id INTO business5_id;
    
    RAISE NOTICE '✅ Created business: Studio Maquillage Pro (ID: %)', business5_id;

    -- Create Deal 1: Coupe + Brushing + Soin (Business 1)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        max_bookings_per_slot,
        valid_until,
        is_active
    ) VALUES (
        business1_id,
        'Coupe + Brushing + Soin Professionnel',
        'Service complet incluant coupe moderne, brushing professionnel et soin capillaire nourrissant. Nos stylistes expérimentés vous conseillent pour sublimer votre look.',
        'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
        450.00,
        225.00,
        50,
        90,
        1,
        CURRENT_DATE + INTERVAL '30 days',
        true
    ) RETURNING id INTO deal1_id;
    
    RAISE NOTICE '✅ Created deal: Coupe + Brushing + Soin (ID: %)', deal1_id;

    -- Create Deal 2: Coloration Complète (Business 1)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        max_bookings_per_slot,
        valid_until,
        is_active
    ) VALUES (
        business1_id,
        'Coloration Complète + Coupe + Brushing',
        'Transformation capillaire complète avec coloration professionnelle, coupe personnalisée et brushing. Produits haut de gamme pour un résultat exceptionnel.',
        'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
        800.00,
        480.00,
        40,
        180,
        1,
        CURRENT_DATE + INTERVAL '45 days',
        true
    ) RETURNING id INTO deal2_id;
    
    RAISE NOTICE '✅ Created deal: Coloration Complète (ID: %)', deal2_id;

    -- Create Deal 3: Massage Relaxant (Business 2)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        max_bookings_per_slot,
        valid_until,
        is_active
    ) VALUES (
        business2_id,
        'Massage Relaxant aux Huiles Essentielles',
        'Massage complet du corps de 60 minutes aux huiles essentielles d''argan et de lavande. Technique de relaxation profonde pour évacuer le stress.',
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        400.00,
        240.00,
        40,
        60,
        2,
        CURRENT_DATE + INTERVAL '21 days',
        true
    ) RETURNING id INTO deal3_id;
    
    RAISE NOTICE '✅ Created deal: Massage Relaxant (ID: %)', deal3_id;

    -- Create Deal 4: Manucure + Vernis (Business 3)
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        max_bookings_per_slot,
        valid_until,
        is_active
    ) VALUES (
        business3_id,
        'Manucure Complète + Vernis Semi-Permanent',
        'Manucure professionnelle avec soin des cuticules, limage, polissage et pose de vernis semi-permanent longue tenue. Plus de 50 couleurs disponibles.',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        200.00,
        140.00,
        30,
        75,
        2,
        CURRENT_DATE + INTERVAL '14 days',
        true
    ) RETURNING id INTO deal4_id;
    
    RAISE NOTICE '✅ Created deal: Manucure + Vernis (ID: %)', deal4_id;

    -- Create Deal 5: Soin Anti-Âge (Business 4) - SHORT TERM OFFER
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        max_bookings_per_slot,
        valid_until,
        is_active
    ) VALUES (
        business4_id,
        'Soin Visage Anti-Âge Premium',
        'Soin complet anti-âge avec nettoyage profond, peeling enzymatique, masque collagène et sérum hydratant. Technologie LED incluse.',
        'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        600.00,
        300.00,
        50,
        90,
        1,
        CURRENT_DATE + INTERVAL '7 days',
        true
    ) RETURNING id INTO deal5_id;
    
    RAISE NOTICE '✅ Created deal: Soin Anti-Âge (EXPIRES SOON - ID: %)', deal5_id;

    -- Create Deal 6: Épilation Laser (Business 4) - LONG TERM OFFER
    INSERT INTO deals (
        business_id,
        title,
        description,
        image_url,
        original_price,
        discounted_price,
        discount_percentage,
        duration_minutes,
        max_bookings_per_slot,
        valid_until,
        is_active
    ) VALUES (
        business4_id,
        'Épilation Laser - Zone au Choix',
        'Séance d''épilation laser définitive sur zone au choix (jambes, aisselles, maillot). Technologie laser dernière génération, résultats durables.',
        'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
        300.00,
        180.00,
        40,
        45,
        3,
        CURRENT_DATE + INTERVAL '120 days',
        true
    ) RETURNING id INTO deal6_id;
    
    RAISE NOTICE '✅ Created deal: Épilation Laser (LONG TERM - ID: %)', deal6_id;

    -- Generate time slots for all deals (next 21 days, excluding Sundays)
    RAISE NOTICE '⏰ Generating time slots for all deals...';
    
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        -- Skip Sundays (0 = Sunday)
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        -- Generate morning slots (9:00-12:00)
        FOR j IN 0..5 LOOP
            slot_time := ('09:00'::TIME + (j * INTERVAL '30 minutes'))::TIME;
            
            -- Insert slots for each deal
            INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
            VALUES 
                (deal1_id, slot_date, slot_time, 1, 0),
                (deal2_id, slot_date, slot_time, 1, 0),
                (deal3_id, slot_date, slot_time, 2, 0),
                (deal4_id, slot_date, slot_time, 2, 0),
                (deal5_id, slot_date, slot_time, 1, 0),
                (deal6_id, slot_date, slot_time, 3, 0);
        END LOOP;
        
        -- Generate afternoon slots (14:00-17:30)
        FOR j IN 0..6 LOOP
            slot_time := ('14:00'::TIME + (j * INTERVAL '30 minutes'))::TIME;
            
            -- Insert slots for each deal
            INSERT INTO time_slots (deal_id, slot_date, slot_time, available_spots, booked_spots)
            VALUES 
                (deal1_id, slot_date, slot_time, 1, 0),
                (deal2_id, slot_date, slot_time, 1, 0),
                (deal3_id, slot_date, slot_time, 2, 0),
                (deal4_id, slot_date, slot_time, 2, 0),
                (deal5_id, slot_date, slot_time, 1, 0),
                (deal6_id, slot_date, slot_time, 3, 0);
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '⏰ Time slots generation completed!';
    
    -- Final summary
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SAMPLE OFFERS CREATION COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    RAISE NOTICE '   • Business Owner ID: %', business_owner_id;
    RAISE NOTICE '   • Businesses created: 5';
    RAISE NOTICE '   • Deals created: 6';
    RAISE NOTICE '   • Time slots created: ~1000+ (21 days × 6 deals × 12 slots/day)';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 BUSINESSES CREATED:';
    RAISE NOTICE '   1. Salon Prestige Casablanca (Coiffure) - ID: %', business1_id;
    RAISE NOTICE '   2. Spa Serenity Rabat (Massage) - ID: %', business2_id;
    RAISE NOTICE '   3. Beauty Nails Studio (Ongles) - ID: %', business3_id;
    RAISE NOTICE '   4. Esthétique Moderne Fès (Esthetique) - ID: %', business4_id;
    RAISE NOTICE '   5. Studio Maquillage Pro (Manucure) - ID: %', business5_id;
    RAISE NOTICE '';
    RAISE NOTICE '💎 DEALS CREATED:';
    RAISE NOTICE '   1. Coupe + Brushing + Soin: 450→225 DH (50%% off) - ID: %', deal1_id;
    RAISE NOTICE '   2. Coloration Complète: 800→480 DH (40%% off) - ID: %', deal2_id;
    RAISE NOTICE '   3. Massage Relaxant: 400→240 DH (40%% off) - ID: %', deal3_id;
    RAISE NOTICE '   4. Manucure + Vernis: 200→140 DH (30%% off) - ID: %', deal4_id;
    RAISE NOTICE '   5. Soin Anti-Âge: 600→300 DH (50%% off, expires in 7 days) - ID: %', deal5_id;
    RAISE NOTICE '   6. Épilation Laser: 300→180 DH (40%% off, 120 days validity) - ID: %', deal6_id;
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTING SCENARIOS:';
    RAISE NOTICE '   • Short-term offer (7 days): Deal 5';
    RAISE NOTICE '   • Long-term offer (120 days): Deal 6';
    RAISE NOTICE '   • Single booking: Deals 1, 2, 5';
    RAISE NOTICE '   • Group booking: Deals 3, 4, 6';
    RAISE NOTICE '   • Various durations: 45-180 minutes';
    RAISE NOTICE '   • Different cities: Casablanca, Rabat, Marrakech, Fès';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Ready for testing! Login with your business account to manage offers.';
    
END $$;