/*
  # Create Sample Offers for Business Testing

  This script creates diverse sample offers for testing the complete business workflow.
  
  1. Business Account
     - Uses existing business owner ID: 14961e21-7c51-46d4-9832-fbe12aa8b3f9
     - Creates/updates businesses with approved status
  
  2. Sample Offers
     - 6 diverse offers across different categories
     - Varied pricing, durations, and booking policies
     - Edge cases for comprehensive testing
  
  3. Time Slots
     - Auto-generated for next 21 days
     - Realistic working hours (9:00-18:00)
     - Weekend availability for special services
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
    end_time TIME;
    total_businesses INTEGER := 0;
    total_deals INTEGER := 0;
    total_slots INTEGER := 0;
BEGIN
    RAISE NOTICE '🚀 Creating sample offers for business owner: %', business_owner_id;
    
    -- Create/Update Salon Prestige Casablanca
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
    ) RETURNING id INTO salon_id;
    total_businesses := total_businesses + 1;
    RAISE NOTICE '✅ Created business: Salon Prestige Casablanca (ID: %)', salon_id;

    -- Create/Update Spa Serenity Rabat
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
        'Centre de bien-être proposant massages thérapeutiques, soins du corps et relaxation dans un cadre zen.',
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
    ) RETURNING id INTO spa_id;
    total_businesses := total_businesses + 1;
    RAISE NOTICE '✅ Created business: Spa Serenity Rabat (ID: %)', spa_id;

    -- Create/Update Beauty Nails Studio
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
    ) RETURNING id INTO nails_id;
    total_businesses := total_businesses + 1;
    RAISE NOTICE '✅ Created business: Beauty Nails Studio (ID: %)', nails_id;

    -- Create/Update Esthétique Moderne Fès
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
        'Centre d''esthétique avancée proposant soins du visage, épilation laser et traitements anti-âge.',
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
    ) RETURNING id INTO esthetic_id;
    total_businesses := total_businesses + 1;
    RAISE NOTICE '✅ Created business: Esthétique Moderne Fès (ID: %)', esthetic_id;

    -- Create/Update Studio Maquillage Pro
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
        'Studio professionnel de maquillage pour événements, mariages et formations beauté.',
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
    ) RETURNING id INTO makeup_id;
    total_businesses := total_businesses + 1;
    RAISE NOTICE '✅ Created business: Studio Maquillage Pro (ID: %)', makeup_id;

    -- Create Deal 1: Coupe + Brushing + Soin (Salon)
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
        450.00,
        225.00,
        50,
        90,
        1,
        24,
        12,
        NOW(),
        (NOW() + INTERVAL '30 days')::date
    ) RETURNING id INTO deal_id;
    total_deals := total_deals + 1;
    RAISE NOTICE '  ✅ Created deal: Coupe + Brushing + Soin (ID: %)', deal_id;

    -- Create Deal 2: Coloration Complète (Salon)
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
        800.00,
        480.00,
        40,
        180,
        1,
        48,
        24,
        NOW(),
        (NOW() + INTERVAL '45 days')::date
    ) RETURNING id INTO deal_id;
    total_deals := total_deals + 1;
    RAISE NOTICE '  ✅ Created deal: Coloration Complète (ID: %)', deal_id;

    -- Create Deal 3: Massage Relaxant (Spa)
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
        advance_booking_hours,
        cancellation_hours,
        valid_from,
        valid_until,
        is_active
    ) VALUES (
        spa_id,
        'Massage Relaxant aux Huiles Essentielles',
        'Massage complet du corps de 60 minutes aux huiles essentielles d''argan et de lavande. Technique de relaxation profonde pour évacuer le stress et les tensions musculaires.',
        'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        400.00,
        240.00,
        40,
        60,
        2,
        12,
        6,
        NOW(),
        (NOW() + INTERVAL '21 days')::date
    ) RETURNING id INTO deal_id;
    total_deals := total_deals + 1;
    RAISE NOTICE '  ✅ Created deal: Massage Relaxant (ID: %)', deal_id;

    -- Create Deal 4: Manucure + Vernis (Nails)
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
        200.00,
        140.00,
        30,
        75,
        2,
        6,
        3,
        NOW(),
        (NOW() + INTERVAL '14 days')::date
    ) RETURNING id INTO deal_id;
    total_deals := total_deals + 1;
    RAISE NOTICE '  ✅ Created deal: Manucure + Vernis (ID: %)', deal_id;

    -- Create Deal 5: Soin Anti-Âge (Esthetic) - SHORT TERM OFFER
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
        600.00,
        300.00,
        50,
        90,
        1,
        24,
        12,
        NOW(),
        (NOW() + INTERVAL '7 days')::date  -- SHORT TERM: Expires in 7 days
    ) RETURNING id INTO deal_id;
    total_deals := total_deals + 1;
    RAISE NOTICE '  ✅ Created deal: Soin Anti-Âge (EXPIRES SOON - ID: %)', deal_id;

    -- Create Deal 6: Épilation Laser (Esthetic) - LONG TERM OFFER
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
        300.00,
        180.00,
        40,
        45,
        3,
        72,
        48,
        NOW(),
        (NOW() + INTERVAL '120 days')::date  -- LONG TERM: 4 months validity
    ) RETURNING id INTO deal_id;
    total_deals := total_deals + 1;
    RAISE NOTICE '  ✅ Created deal: Épilation Laser (LONG TERM - ID: %)', deal_id;

    -- Generate time slots for all deals
    RAISE NOTICE '⏰ Generating time slots for all deals...';
    
    FOR deal_id IN (
        SELECT id FROM deals WHERE business_id IN (salon_id, spa_id, nails_id, esthetic_id, makeup_id)
    ) LOOP
        -- Get deal details for slot generation
        SELECT duration_minutes, max_bookings_per_slot 
        INTO slot_time, end_time 
        FROM deals 
        WHERE id = deal_id;
        
        -- Generate slots for next 21 days
        FOR i IN 0..20 LOOP
            slot_date := (CURRENT_DATE + i);
            
            -- Skip Sundays (0 = Sunday)
            IF EXTRACT(DOW FROM slot_date) = 0 THEN
                CONTINUE;
            END IF;
            
            -- Generate morning slots (9:00-12:00)
            FOR hour IN 9..11 LOOP
                FOR minute_slot IN 0..1 LOOP
                    slot_time := (hour || ':' || (minute_slot * 30) || ':00')::TIME;
                    
                    INSERT INTO time_slots (
                        deal_id,
                        slot_date,
                        slot_time,
                        available_spots,
                        booked_spots
                    ) VALUES (
                        deal_id,
                        slot_date,
                        slot_time,
                        (SELECT max_bookings_per_slot FROM deals WHERE id = deal_id),
                        0
                    );
                    total_slots := total_slots + 1;
                END LOOP;
            END LOOP;
            
            -- Generate afternoon slots (14:00-17:30)
            FOR hour IN 14..17 LOOP
                FOR minute_slot IN 0..1 LOOP
                    -- Don't create 17:30 slot
                    IF hour = 17 AND minute_slot = 1 THEN
                        CONTINUE;
                    END IF;
                    
                    slot_time := (hour || ':' || (minute_slot * 30) || ':00')::TIME;
                    
                    INSERT INTO time_slots (
                        deal_id,
                        slot_date,
                        slot_time,
                        available_spots,
                        booked_spots
                    ) VALUES (
                        deal_id,
                        slot_date,
                        slot_time,
                        (SELECT max_bookings_per_slot FROM deals WHERE id = deal_id),
                        0
                    );
                    total_slots := total_slots + 1;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;

    -- Final summary
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Sample offers creation completed successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '   • Business Owner ID: %', business_owner_id;
    RAISE NOTICE '   • Businesses created: %', total_businesses;
    RAISE NOTICE '   • Deals created: %', total_deals;
    RAISE NOTICE '   • Time slots generated: %', total_slots;
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Test scenarios available:';
    RAISE NOTICE '   1. Login with business account to manage offers';
    RAISE NOTICE '   2. Browse offers on homepage as client';
    RAISE NOTICE '   3. Make bookings and test QR validation';
    RAISE NOTICE '   4. Test different offer types and edge cases';
    RAISE NOTICE '   5. Verify booking policies and cancellations';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Ready for comprehensive testing!';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error occurred: %', SQLERRM;
        RAISE;
END $$;