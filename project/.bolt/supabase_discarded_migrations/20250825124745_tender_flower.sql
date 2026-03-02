/*
  # Create Sample Offers for Dealio Beauty

  This script creates comprehensive sample data for testing the Dealio Beauty platform:

  1. New Businesses
     - 5 different businesses across various categories
     - All owned by the specified business owner ID
     - Approved status for immediate testing
     - Realistic ratings and review counts

  2. Sample Deals
     - 6 diverse offers with different pricing strategies
     - Varied durations (45-180 minutes)
     - Different discount percentages (30-50%)
     - Mixed validity periods (7-120 days)
     - High-quality Pexels images

  3. Time Slots
     - 1000+ time slots generated for 21 days
     - Morning and afternoon availability
     - Skips Sundays (business logic)
     - Varied capacity per deal

  4. Testing Edge Cases
     - Short-term expiring offers
     - Long-term validity periods
     - Different booking capacities
     - Premium and budget services
*/

-- Business Owner ID (replace with actual ID if different)
DO $$
DECLARE
    business_owner_id UUID := '14961e21-7c51-46d4-9832-fbe12aa8b3f9';
    salon_prestige_id UUID;
    spa_serenity_id UUID;
    beauty_nails_id UUID;
    esthetique_moderne_id UUID;
    studio_maquillage_id UUID;
    
    deal_coupe_id UUID;
    deal_coloration_id UUID;
    deal_massage_id UUID;
    deal_manucure_id UUID;
    deal_soin_id UUID;
    deal_epilation_id UUID;
    
    slot_date DATE;
    slot_start_time TIME;
    slot_end_time TIME;
    i INTEGER;
    j INTEGER;
    working_hours TEXT[] := ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
BEGIN
    RAISE NOTICE 'Starting sample data creation for business owner: %', business_owner_id;
    
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
        coordinates,
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
        '{"lat": 33.5731, "lng": -7.5898}'::jsonb,
        business_owner_id,
        'approved'
    ) RETURNING id INTO salon_prestige_id;
    
    RAISE NOTICE 'Created business: Salon Prestige Casablanca (ID: %)', salon_prestige_id;

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
        coordinates,
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
        '{"lat": 34.0209, "lng": -6.8416}'::jsonb,
        business_owner_id,
        'approved'
    ) RETURNING id INTO spa_serenity_id;
    
    RAISE NOTICE 'Created business: Spa Serenity Rabat (ID: %)', spa_serenity_id;

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
        coordinates,
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
        '{"lat": 31.6295, "lng": -7.9811}'::jsonb,
        business_owner_id,
        'approved'
    ) RETURNING id INTO beauty_nails_id;
    
    RAISE NOTICE 'Created business: Beauty Nails Studio (ID: %)', beauty_nails_id;

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
        coordinates,
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
        '{"lat": 34.0181, "lng": -5.0078}'::jsonb,
        business_owner_id,
        'approved'
    ) RETURNING id INTO esthetique_moderne_id;
    
    RAISE NOTICE 'Created business: Esthétique Moderne Fès (ID: %)', esthetique_moderne_id;

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
        coordinates,
        owner_id,
        status
    ) VALUES (
        'Studio Maquillage Pro',
        'Studio professionnel de maquillage pour événements, formations et conseils beauté personnalisés.',
        '89 Rue Prince Héritier',
        'Casablanca',
        'Manucure',
        '+212 522 741 852',
        'info@maquillage-pro.ma',
        4.8,
        76,
        '{"lat": 33.5831, "lng": -7.5798}'::jsonb,
        business_owner_id,
        'approved'
    ) RETURNING id INTO studio_maquillage_id;
    
    RAISE NOTICE 'Created business: Studio Maquillage Pro (ID: %)', studio_maquillage_id;

    -- Create Deal 1: Coupe + Brushing + Soin
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
        salon_prestige_id,
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
    ) RETURNING id INTO deal_coupe_id;
    
    RAISE NOTICE 'Created deal: Coupe + Brushing + Soin (ID: %)', deal_coupe_id;

    -- Create Deal 2: Coloration Complète
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
        salon_prestige_id,
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
    ) RETURNING id INTO deal_coloration_id;
    
    RAISE NOTICE 'Created deal: Coloration Complète (ID: %)', deal_coloration_id;

    -- Create Deal 3: Massage Relaxant
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
        spa_serenity_id,
        'Massage Relaxant aux Huiles Essentielles',
        'Massage complet du corps de 60 minutes aux huiles essentielles d''argan et de lavande. Technique de relaxation profonde pour évacuer le stress.',
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        400.00,
        240.00,
        40,
        60,
        2,
        CURRENT_DATE + INTERVAL '25 days',
        true
    ) RETURNING id INTO deal_massage_id;
    
    RAISE NOTICE 'Created deal: Massage Relaxant (ID: %)', deal_massage_id;

    -- Create Deal 4: Manucure + Vernis
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
        beauty_nails_id,
        'Manucure Complète + Vernis Semi-Permanent',
        'Manucure professionnelle avec soin des cuticules, limage, polissage et pose de vernis semi-permanent longue tenue. Plus de 50 couleurs disponibles.',
        'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        200.00,
        140.00,
        30,
        75,
        2,
        CURRENT_DATE + INTERVAL '20 days',
        true
    ) RETURNING id INTO deal_manucure_id;
    
    RAISE NOTICE 'Created deal: Manucure + Vernis (ID: %)', deal_manucure_id;

    -- Create Deal 5: Soin Anti-Âge (Short-term for urgency testing)
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
        esthetique_moderne_id,
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
    ) RETURNING id INTO deal_soin_id;
    
    RAISE NOTICE 'Created deal: Soin Anti-Âge (ID: %) - EXPIRES IN 7 DAYS', deal_soin_id;

    -- Create Deal 6: Épilation Laser (Long-term for testing)
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
        esthetique_moderne_id,
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
    ) RETURNING id INTO deal_epilation_id;
    
    RAISE NOTICE 'Created deal: Épilation Laser (ID: %) - VALID FOR 120 DAYS', deal_epilation_id;

    -- Generate Time Slots for all deals
    RAISE NOTICE 'Generating time slots for all deals...';
    
    -- Time slots for Deal 1: Coupe + Brushing (90min slots)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        -- Skip Sundays
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        FOREACH slot_start_time IN ARRAY working_hours LOOP
            slot_end_time := slot_start_time + INTERVAL '90 minutes';
            
            -- Don't create slots that end after 18:00
            IF slot_end_time <= '18:00'::TIME THEN
                INSERT INTO time_slots (
                    deal_id,
                    date,
                    start_time,
                    end_time,
                    available_spots
                ) VALUES (
                    deal_coupe_id,
                    slot_date,
                    slot_start_time,
                    slot_end_time,
                    1
                );
            END IF;
        END LOOP;
    END LOOP;
    
    -- Time slots for Deal 2: Coloration (180min slots - fewer slots due to duration)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        -- Only morning slots for 3-hour services
        FOREACH slot_start_time IN ARRAY ARRAY['09:00', '10:00', '14:00'] LOOP
            slot_end_time := slot_start_time + INTERVAL '180 minutes';
            
            IF slot_end_time <= '18:00'::TIME THEN
                INSERT INTO time_slots (
                    deal_id,
                    date,
                    start_time,
                    end_time,
                    available_spots
                ) VALUES (
                    deal_coloration_id,
                    slot_date,
                    slot_start_time,
                    slot_end_time,
                    1
                );
            END IF;
        END LOOP;
    END LOOP;
    
    -- Time slots for Deal 3: Massage (60min slots, 2 people capacity)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        FOREACH slot_start_time IN ARRAY working_hours LOOP
            slot_end_time := slot_start_time + INTERVAL '60 minutes';
            
            IF slot_end_time <= '18:00'::TIME THEN
                INSERT INTO time_slots (
                    deal_id,
                    date,
                    start_time,
                    end_time,
                    available_spots
                ) VALUES (
                    deal_massage_id,
                    slot_date,
                    slot_start_time,
                    slot_end_time,
                    2
                );
            END IF;
        END LOOP;
    END LOOP;
    
    -- Time slots for Deal 4: Manucure (75min slots, 2 people capacity)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        FOREACH slot_start_time IN ARRAY working_hours LOOP
            slot_end_time := slot_start_time + INTERVAL '75 minutes';
            
            IF slot_end_time <= '18:00'::TIME THEN
                INSERT INTO time_slots (
                    deal_id,
                    date,
                    start_time,
                    end_time,
                    available_spots
                ) VALUES (
                    deal_manucure_id,
                    slot_date,
                    slot_start_time,
                    slot_end_time,
                    2
                );
            END IF;
        END LOOP;
    END LOOP;
    
    -- Time slots for Deal 5: Soin Anti-Âge (90min slots, premium service)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        FOREACH slot_start_time IN ARRAY working_hours LOOP
            slot_end_time := slot_start_time + INTERVAL '90 minutes';
            
            IF slot_end_time <= '18:00'::TIME THEN
                INSERT INTO time_slots (
                    deal_id,
                    date,
                    start_time,
                    end_time,
                    available_spots
                ) VALUES (
                    deal_soin_id,
                    slot_date,
                    slot_start_time,
                    slot_end_time,
                    1
                );
            END IF;
        END LOOP;
    END LOOP;
    
    -- Time slots for Deal 6: Épilation Laser (45min slots, 3 people capacity)
    FOR i IN 0..20 LOOP
        slot_date := CURRENT_DATE + i;
        
        IF EXTRACT(DOW FROM slot_date) = 0 THEN
            CONTINUE;
        END IF;
        
        FOREACH slot_start_time IN ARRAY working_hours LOOP
            slot_end_time := slot_start_time + INTERVAL '45 minutes';
            
            IF slot_end_time <= '18:00'::TIME THEN
                INSERT INTO time_slots (
                    deal_id,
                    date,
                    start_time,
                    end_time,
                    available_spots
                ) VALUES (
                    deal_epilation_id,
                    slot_date,
                    slot_start_time,
                    slot_end_time,
                    3
                );
            END IF;
        END LOOP;
    END LOOP;

    -- Final summary
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SAMPLE DATA CREATION COMPLETED!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    RAISE NOTICE '   • 5 businesses created (all approved)';
    RAISE NOTICE '   • 6 deals created with varied pricing';
    RAISE NOTICE '   • 1000+ time slots generated for 21 days';
    RAISE NOTICE '   • Business Owner ID: %', business_owner_id;
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTING SCENARIOS:';
    RAISE NOTICE '   1. Login as business owner to see dashboard';
    RAISE NOTICE '   2. View offers on homepage';
    RAISE NOTICE '   3. Make bookings as different clients';
    RAISE NOTICE '   4. Test QR code validation';
    RAISE NOTICE '   5. Test expiring offers (7-day deal)';
    RAISE NOTICE '   6. Test long-term offers (120-day deal)';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 LOGIN CREDENTIALS:';
    RAISE NOTICE '   Email: demo@dealio.ma';
    RAISE NOTICE '   Password: demo123456';
    RAISE NOTICE '';
    
END $$;