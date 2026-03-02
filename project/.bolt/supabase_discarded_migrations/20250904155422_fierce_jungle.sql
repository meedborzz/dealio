/*
  # Create comprehensive sample deals for testing

  1. Sample Data
    - 25+ deals across all categories
    - Various deal types (standard, flash, happy_hour, limited)
    - Realistic pricing and discounts
    - Professional descriptions in French

  2. Time Slots
    - Generate time slots for next 30 days
    - Business hours 9h-18h (except Sundays)
    - Proper slot intervals based on service duration
*/

-- Insert comprehensive sample deals for business a6cd0312-b90e-403f-bb86-37994d197e88
INSERT INTO deals (
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
  starts_at,
  ends_at,
  limited_qty,
  per_user_limit,
  days_of_week,
  happy_hour_start,
  happy_hour_end
) VALUES 
-- COIFFURE (6 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe + Brushing Femme',
  'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look.',
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 200, 50,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coloration Complète + Coupe',
  'Coloration professionnelle avec coupe et coiffage. Conseils personnalisés pour votre style.',
  'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
  800, 480, 40,
  '2024-12-31',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Balayage + Soin Profond',
  'Technique de balayage naturel avec soin réparateur profond. Résultat lumineux et naturel.',
  'https://images.pexels.com/photos/3993454/pexels-photo-3993454.jpeg?auto=compress&cs=tinysrgb&w=800',
  1200, 720, 40,
  '2024-12-31',
  true, true, 1, 180,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe Express Homme',
  'Coupe rapide et moderne pour homme. Service express sans compromis sur la qualité.',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 120, 40,
  '2024-12-31',
  true, true, 2, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Lissage Brésilien',
  'Lissage longue durée avec produits premium. Cheveux soyeux pendant 3-4 mois.',
  'https://images.pexels.com/photos/3993452/pexels-photo-3993452.jpeg?auto=compress&cs=tinysrgb&w=800',
  1500, 900, 40,
  '2024-12-31',
  true, true, 1, 240,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coiffure Mariage',
  'Coiffure élégante pour votre jour J. Essai inclus + coiffure le jour du mariage.',
  'https://images.pexels.com/photos/3993448/pexels-photo-3993448.jpeg?auto=compress&cs=tinysrgb&w=800',
  700, 420, 40,
  '2024-12-31',
  true, true, 1, 150,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- ONGLES (4 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Manucure + Vernis Semi-Permanent',
  'Manucure complète avec pose de vernis semi-permanent longue tenue. Large choix de couleurs.',
  'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
  250, 150, 40,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Pédicure Spa Complète',
  'Pédicure avec bain relaxant, gommage, soins des ongles et massage des pieds.',
  'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  '2024-12-31',
  true, true, 1, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Nail Art Créatif',
  'Création artistique sur ongles avec motifs personnalisés. Art unique et tendance.',
  'https://images.pexels.com/photos/3997994/pexels-photo-3997994.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 280, 30,
  '2024-12-31',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Pose Faux Ongles + Décoration',
  'Pose de faux ongles en gel avec décoration au choix. Tenue 3-4 semaines.',
  'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800',
  350, 245, 30,
  '2024-12-31',
  true, true, 1, 105,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- MASSAGE (4 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Relaxant 60min',
  'Massage complet du corps aux huiles essentielles pour une relaxation totale.',
  'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Pierres Chaudes',
  'Massage thérapeutique aux pierres volcaniques chaudes. Détente profonde garantie.',
  'https://images.pexels.com/photos/3757941/pexels-photo-3757941.jpeg?auto=compress&cs=tinysrgb&w=800',
  500, 350, 30,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Couple Romantique',
  'Séance de massage en duo dans une ambiance romantique. Moment privilégié à deux.',
  'https://images.pexels.com/photos/3757943/pexels-photo-3757943.jpeg?auto=compress&cs=tinysrgb&w=800',
  800, 560, 30,
  '2024-12-31',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Express 30min',
  'Massage ciblé dos et nuque pour soulager les tensions rapidement.',
  'https://images.pexels.com/photos/3757940/pexels-photo-3757940.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 140, 30,
  '2024-12-31',
  true, true, 2, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- SPA (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Hammam Traditionnel + Gommage',
  'Hammam marocain authentique avec gommage au savon noir et relaxation.',
  'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
  350, 210, 40,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Journée Spa Complète',
  'Forfait spa complet: hammam, gommage, massage, soin visage et relaxation.',
  'https://images.pexels.com/photos/6663590/pexels-photo-6663590.jpeg?auto=compress&cs=tinysrgb&w=800',
  1200, 720, 40,
  '2024-12-31',
  true, true, 1, 360,
  'bundle', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Bain Turc + Relaxation',
  'Bain de vapeur traditionnel suivi d''une séance de relaxation guidée.',
  'https://images.pexels.com/photos/6663591/pexels-photo-6663591.jpeg?auto=compress&cs=tinysrgb&w=800',
  250, 175, 30,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- ESTHETIQUE (4 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Visage Anti-Âge',
  'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation. Produits haut de gamme.',
  'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
  600, 360, 40,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Nettoyage de Peau Profond',
  'Nettoyage en profondeur avec extraction des impuretés et masque purifiant.',
  'https://images.pexels.com/photos/4041393/pexels-photo-4041393.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Hydratant Intensif',
  'Soin hydratant profond pour peaux sèches avec masque nourrissant et massage facial.',
  'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 280, 30,
  '2024-12-31',
  true, true, 1, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Microdermabrasion + LED',
  'Traitement microdermabrasion suivi de thérapie LED pour une peau éclatante.',
  'https://images.pexels.com/photos/4041395/pexels-photo-4041395.jpeg?auto=compress&cs=tinysrgb&w=800',
  800, 480, 40,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- BARBIER (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe Homme + Barbe',
  'Coupe moderne avec taille et entretien de barbe. Service professionnel dans une ambiance conviviale.',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  180, 108, 40,
  '2024-12-31',
  true, true, 2, 45,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Rasage Traditionnel',
  'Rasage à l''ancienne au rasoir avec serviettes chaudes et soins après-rasage.',
  'https://images.pexels.com/photos/1813273/pexels-photo-1813273.jpeg?auto=compress&cs=tinysrgb&w=800',
  150, 90, 40,
  '2024-12-31',
  true, true, 2, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Forfait Gentleman Complet',
  'Coupe + barbe + rasage + soins. L''expérience barbier complète pour l''homme moderne.',
  'https://images.pexels.com/photos/1813274/pexels-photo-1813274.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  '2024-12-31',
  true, true, 1, 90,
  'bundle', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- EPILATION (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Laser Jambes Complètes',
  'Épilation définitive au laser dernière génération. Résultats durables et peau douce.',
  'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
  1000, 600, 40,
  '2024-12-31',
  true, true, 1, 45,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Cire Maillot Brésilien',
  'Épilation complète du maillot à la cire chaude. Technique professionnelle et hygiénique.',
  'https://images.pexels.com/photos/4041396/pexels-photo-4041396.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 120, 40,
  '2024-12-31',
  true, true, 1, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Visage Complète',
  'Épilation sourcils, lèvre supérieure et duvet. Finition parfaite pour un visage impeccable.',
  'https://images.pexels.com/photos/4041398/pexels-photo-4041398.jpeg?auto=compress&cs=tinysrgb&w=800',
  150, 90, 40,
  '2024-12-31',
  true, true, 2, 20,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- MAQUILLAGE (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Maquillage Professionnel Jour',
  'Maquillage naturel et élégant pour la journée. Techniques professionnelles adaptées.',
  'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Maquillage Soirée Glamour',
  'Maquillage sophistiqué pour événements spéciaux. Look glamour et longue tenue.',
  'https://images.pexels.com/photos/4041399/pexels-photo-4041399.jpeg?auto=compress&cs=tinysrgb&w=800',
  450, 315, 30,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Cours Maquillage Personnel',
  'Cours privé pour apprendre les techniques de maquillage adaptées à votre visage.',
  'https://images.pexels.com/photos/4041400/pexels-photo-4041400.jpeg?auto=compress&cs=tinysrgb&w=800',
  500, 300, 40,
  '2024-12-31',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- FITNESS (2 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Cours Yoga Privé',
  'Séance de yoga personnalisée avec instructeur certifié dans un cadre zen.',
  'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800',
  350, 210, 40,
  '2024-12-31',
  true, true, 1, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coaching Sportif Personnel',
  'Séance de coaching sportif personnalisé avec programme adapté à vos objectifs.',
  'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- SOURCILS (2 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Restructuration Sourcils + Teinture',
  'Restructuration complète des sourcils avec teinture pour un regard intense.',
  'https://images.pexels.com/photos/4041401/pexels-photo-4041401.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 120, 40,
  '2024-12-31',
  true, true, 2, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Extension Cils Volume',
  'Pose d''extensions de cils pour un regard volumineux et naturel. Tenue 3-4 semaines.',
  'https://images.pexels.com/photos/4041402/pexels-photo-4041402.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 280, 30,
  '2024-12-31',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- SOINS CORPS (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Gommage Corps Complet',
  'Gommage exfoliant sur tout le corps suivi d''une hydratation nourrissante.',
  'https://images.pexels.com/photos/4041403/pexels-photo-4041403.jpeg?auto=compress&cs=tinysrgb&w=800',
  250, 150, 40,
  '2024-12-31',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Enveloppement Minceur',
  'Enveloppement corporel aux algues marines pour raffermir et tonifier la peau.',
  'https://images.pexels.com/photos/4041404/pexels-photo-4041404.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  '2024-12-31',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Hydratant Corps',
  'Soin hydratant complet avec massage relaxant et produits nourrissants.',
  'https://images.pexels.com/photos/4041405/pexels-photo-4041405.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  '2024-12-31',
  true, true, 1, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),

-- OFFRES SPECIALES (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'FLASH: Coupe + Couleur Express',
  'Offre flash limitée! Coupe et couleur express en 2h. Quantité limitée.',
  'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=800',
  500, 200, 60,
  '2024-12-31',
  true, true, 1, 120,
  'flash', 
  NOW(), 
  NOW() + INTERVAL '24 hours',
  10, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Happy Hour: Manucure 10h-15h',
  'Tarif spécial manucure pendant les heures creuses. Disponible uniquement de 10h à 15h.',
  'https://images.pexels.com/photos/3997995/pexels-photo-3997995.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 99, 50,
  '2024-12-31',
  true, true, 2, 60,
  'happy_hour', NULL, NULL, NULL, 1, 
  ARRAY[1,2,3,4,5], '10:00:00', '15:00:00'
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Forfait Découverte Spa',
  'Offre découverte: hammam + gommage + massage 30min. Parfait pour découvrir nos services.',
  'https://images.pexels.com/photos/6663592/pexels-photo-6663592.jpeg?auto=compress&cs=tinysrgb&w=800',
  600, 300, 50,
  '2024-12-31',
  true, true, 1, 150,
  'limited', NULL, NULL, 20, 1, NULL, NULL, NULL
),

-- OFFRES BUDGET (3 deals sous 99 DH)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Brushing Express',
  'Brushing rapide et efficace pour un look parfait en 20 minutes.',
  'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800',
  120, 75, 38,
  '2024-12-31',
  true, true, 3, 20,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Sourcils Simple',
  'Épilation et restructuration des sourcils. Service rapide et précis.',
  'https://images.pexels.com/photos/4041406/pexels-photo-4041406.jpeg?auto=compress&cs=tinysrgb&w=800',
  100, 60, 40,
  '2024-12-31',
  true, true, 4, 15,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Vernis Simple Mains',
  'Application de vernis classique sur les mains. Choix parmi 50 couleurs.',
  'https://images.pexels.com/photos/3997996/pexels-photo-3997996.jpeg?auto=compress&cs=tinysrgb&w=800',
  80, 48, 40,
  '2024-12-31',
  true, true, 4, 20,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL
);

-- Generate time slots for all deals for the next 30 days
DO $$
DECLARE
    deal_record RECORD;
    current_date DATE;
    current_time TIME;
    slot_duration INTEGER;
    slots_per_hour INTEGER;
    day_of_week INTEGER;
BEGIN
    -- Loop through all deals for this business
    FOR deal_record IN 
        SELECT id, duration_minutes, max_bookings_per_slot, deal_type, days_of_week, happy_hour_start, happy_hour_end
        FROM deals 
        WHERE business_id = 'a6cd0312-b90e-403f-bb86-37994d197e88'
    LOOP
        slot_duration := COALESCE(deal_record.duration_minutes, 60);
        
        -- Generate slots for next 30 days
        FOR i IN 0..29 LOOP
            current_date := CURRENT_DATE + i;
            day_of_week := EXTRACT(DOW FROM current_date); -- 0=Sunday, 1=Monday, etc.
            
            -- Skip Sundays (day 0)
            IF day_of_week != 0 THEN
                -- Check if deal is restricted to specific days
                IF deal_record.days_of_week IS NULL OR day_of_week = ANY(deal_record.days_of_week) THEN
                    
                    -- Determine time range based on deal type
                    IF deal_record.deal_type = 'happy_hour' AND deal_record.happy_hour_start IS NOT NULL THEN
                        -- Happy hour deals: only during specified hours
                        current_time := deal_record.happy_hour_start;
                        WHILE current_time < deal_record.happy_hour_end LOOP
                            INSERT INTO time_slots (
                                deal_id, 
                                date, 
                                start_time, 
                                end_time,
                                slot_date,
                                slot_time,
                                available_spots, 
                                is_available
                            ) VALUES (
                                deal_record.id,
                                current_date,
                                current_time,
                                current_time + (slot_duration || ' minutes')::INTERVAL,
                                current_date,
                                current_time,
                                deal_record.max_bookings_per_slot,
                                true
                            )
                            ON CONFLICT (deal_id, date, start_time) DO NOTHING;
                            
                            current_time := current_time + (slot_duration || ' minutes')::INTERVAL;
                        END LOOP;
                    ELSE
                        -- Regular deals: 9h-18h
                        current_time := '09:00:00'::TIME;
                        WHILE current_time < '18:00:00'::TIME LOOP
                            INSERT INTO time_slots (
                                deal_id, 
                                date, 
                                start_time, 
                                end_time,
                                slot_date,
                                slot_time,
                                available_spots, 
                                is_available
                            ) VALUES (
                                deal_record.id,
                                current_date,
                                current_time,
                                current_time + (slot_duration || ' minutes')::INTERVAL,
                                current_date,
                                current_time,
                                deal_record.max_bookings_per_slot,
                                true
                            )
                            ON CONFLICT (deal_id, date, start_time) DO NOTHING;
                            
                            current_time := current_time + (slot_duration || ' minutes')::INTERVAL;
                        END LOOP;
                    END IF;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END $$;