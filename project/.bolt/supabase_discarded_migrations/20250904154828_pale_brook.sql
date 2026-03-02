/*
  # Create comprehensive sample deals for testing

  1. New Data
    - 25+ sample deals across all categories
    - Realistic pricing and descriptions
    - Various discount percentages
    - Different durations and valid dates
    - All for business ID: a6cd0312-b90e-403f-bb86-37994d197e88

  2. Categories Covered
    - Coiffure (Hair)
    - Ongles (Nails) 
    - Massage
    - Spa
    - Esthetique (Aesthetic)
    - Barbier (Barbershop)
    - Epilation (Hair Removal)
    - Maquillage (Makeup)
    - Fitness
    - Tatouage (Tattoo)
    - Sourcils (Eyebrows)
    - Soins (Body Care)

  3. Features
    - Varied pricing from budget to premium
    - Different discount levels (20% to 70%)
    - Realistic service durations
    - Professional descriptions in French
    - Valid until dates spread over next 3 months
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
  per_user_limit
) VALUES 
-- COIFFURE (Hair) - 6 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe + Brushing Femme',
  'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look selon votre morphologie.',
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  200,
  50,
  '2025-03-15',
  true,
  true,
  2,
  90,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coloration Complète + Coupe',
  'Coloration professionnelle avec coupe et coiffage. Conseils personnalisés pour votre style et entretien optimal.',
  'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
  800,
  480,
  40,
  '2025-04-20',
  true,
  true,
  1,
  180,
  'standard',
  2
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Balayage + Soin Profond',
  'Technique de balayage naturel avec soin réparateur. Effet soleil garanti avec des produits haut de gamme.',
  'https://images.pexels.com/photos/3993454/pexels-photo-3993454.jpeg?auto=compress&cs=tinysrgb&w=800',
  1200,
  720,
  40,
  '2025-05-10',
  true,
  true,
  1,
  240,
  'standard',
  1
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe Express Homme',
  'Coupe rapide et moderne pour homme actif. Style professionnel ou décontracté selon vos préférences.',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  200,
  120,
  40,
  '2025-03-30',
  true,
  true,
  3,
  45,
  'flash',
  5
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Lissage Brésilien',
  'Lissage longue durée pour cheveux lisses et brillants pendant 4-6 mois. Technique professionnelle certifiée.',
  'https://images.pexels.com/photos/3993452/pexels-photo-3993452.jpeg?auto=compress&cs=tinysrgb&w=800',
  1500,
  900,
  40,
  '2025-06-15',
  true,
  true,
  1,
  300,
  'standard',
  1
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coiffure Mariage',
  'Coiffure élégante pour votre jour J. Essai inclus et fixation longue tenue garantie.',
  'https://images.pexels.com/photos/3993448/pexels-photo-3993448.jpeg?auto=compress&cs=tinysrgb&w=800',
  600,
  420,
  30,
  '2025-07-31',
  true,
  true,
  1,
  120,
  'standard',
  1
),

-- ONGLES (Nails) - 4 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Manucure + Vernis Semi-Permanent',
  'Manucure complète avec pose de vernis semi-permanent longue tenue. Large choix de couleurs tendance.',
  'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
  250,
  150,
  40,
  '2025-03-25',
  true,
  true,
  2,
  90,
  'standard',
  4
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Pédicure Spa Complète',
  'Pédicure avec gommage, soins des ongles et massage relaxant. Parfait pour des pieds parfaits.',
  'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
  300,
  180,
  40,
  '2025-04-15',
  true,
  true,
  2,
  75,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Nail Art Créatif',
  'Création artistique sur ongles avec motifs personnalisés. Laissez libre cours à votre créativité.',
  'https://images.pexels.com/photos/3997994/pexels-photo-3997994.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  280,
  30,
  '2025-05-20',
  true,
  true,
  1,
  120,
  'standard',
  2
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Pose Faux Ongles + Décoration',
  'Pose de faux ongles en gel avec décoration au choix. Résultat naturel et élégant.',
  'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800',
  350,
  245,
  30,
  '2025-04-30',
  true,
  true,
  1,
  150,
  'standard',
  2
),

-- MASSAGE - 4 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Relaxant 60min',
  'Massage complet du corps aux huiles essentielles d''argan pour une relaxation totale. Idéal pour évacuer le stress.',
  'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  240,
  40,
  '2025-03-20',
  true,
  true,
  2,
  60,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Pierres Chaudes',
  'Massage thérapeutique aux pierres volcaniques chaudes. Détente profonde et décontraction musculaire.',
  'https://images.pexels.com/photos/3757941/pexels-photo-3757941.jpeg?auto=compress&cs=tinysrgb&w=800',
  500,
  350,
  30,
  '2025-04-25',
  true,
  true,
  1,
  90,
  'standard',
  2
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Couple Romantique',
  'Séance de massage en duo dans une ambiance romantique. Moment privilégié à partager.',
  'https://images.pexels.com/photos/3757943/pexels-photo-3757943.jpeg?auto=compress&cs=tinysrgb&w=800',
  800,
  560,
  30,
  '2025-06-14',
  true,
  true,
  1,
  120,
  'standard',
  1
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Express 30min',
  'Massage ciblé dos et nuque pour une pause détente rapide. Parfait pendant la pause déjeuner.',
  'https://images.pexels.com/photos/3757940/pexels-photo-3757940.jpeg?auto=compress&cs=tinysrgb&w=800',
  200,
  140,
  30,
  '2025-03-10',
  true,
  true,
  3,
  30,
  'happy_hour',
  5
),

-- SPA - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Hammam Traditionnel + Gommage',
  'Détendez-vous avec notre hammam traditionnel marocain suivi d''un gommage au savon noir. Expérience authentique.',
  'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
  350,
  210,
  40,
  '2025-04-10',
  true,
  true,
  2,
  120,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Journée Spa Complète',
  'Forfait spa complet : hammam, gommage, massage et soin visage. Une journée de pure détente.',
  'https://images.pexels.com/photos/6663590/pexels-photo-6663590.jpeg?auto=compress&cs=tinysrgb&w=800',
  1200,
  720,
  40,
  '2025-05-30',
  true,
  true,
  1,
  360,
  'standard',
  1
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Bain Turc + Relaxation',
  'Séance de bain turc avec temps de relaxation dans notre espace zen. Purification et bien-être.',
  'https://images.pexels.com/photos/6663591/pexels-photo-6663591.jpeg?auto=compress&cs=tinysrgb&w=800',
  250,
  175,
  30,
  '2025-04-05',
  true,
  true,
  2,
  90,
  'standard',
  3
),

-- ESTHETIQUE (Aesthetic) - 4 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Visage Anti-Âge',
  'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation. Produits haut de gamme.',
  'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
  600,
  360,
  40,
  '2025-03-28',
  true,
  true,
  1,
  90,
  'standard',
  2
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Nettoyage de Peau Profond',
  'Extraction des impuretés et nettoyage en profondeur. Peau nette et purifiée garantie.',
  'https://images.pexels.com/photos/4041393/pexels-photo-4041393.jpeg?auto=compress&cs=tinysrgb&w=800',
  300,
  180,
  40,
  '2025-04-12',
  true,
  true,
  2,
  75,
  'standard',
  4
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Hydratant Intensif',
  'Soin hydratant pour peaux sèches avec masque nourrissant. Confort et éclat retrouvés.',
  'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  280,
  30,
  '2025-05-05',
  true,
  true,
  2,
  60,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Microdermabrasion + LED',
  'Traitement de microdermabrasion suivi de thérapie LED. Peau lisse et rajeunie.',
  'https://images.pexels.com/photos/4041395/pexels-photo-4041395.jpeg?auto=compress&cs=tinysrgb&w=800',
  800,
  480,
  40,
  '2025-06-20',
  true,
  true,
  1,
  120,
  'standard',
  1
),

-- BARBIER (Barbershop) - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe Homme + Barbe',
  'Coupe moderne avec taille et entretien de barbe. Service professionnel dans une ambiance conviviale.',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  180,
  108,
  40,
  '2025-03-22',
  true,
  true,
  3,
  60,
  'standard',
  5
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Rasage Traditionnel',
  'Rasage à l''ancienne au rasoir avec serviettes chaudes. Expérience authentique du barbier.',
  'https://images.pexels.com/photos/1813273/pexels-photo-1813273.jpeg?auto=compress&cs=tinysrgb&w=800',
  150,
  90,
  40,
  '2025-04-08',
  true,
  true,
  2,
  45,
  'standard',
  4
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Forfait Gentleman Complet',
  'Coupe + barbe + rasage + soin visage homme. Le forfait complet pour l''homme moderne.',
  'https://images.pexels.com/photos/1813274/pexels-photo-1813274.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  240,
  40,
  '2025-05-15',
  true,
  true,
  1,
  120,
  'standard',
  2
),

-- EPILATION (Hair Removal) - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Laser Jambes Complètes',
  'Épilation définitive au laser dernière génération. Résultats durables et peau douce.',
  'https://images.pexels.com/photos/4041396/pexels-photo-4041396.jpeg?auto=compress&cs=tinysrgb&w=800',
  1000,
  600,
  40,
  '2025-07-30',
  true,
  true,
  1,
  60,
  'standard',
  1
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Cire Maillot Brésilien',
  'Épilation intégrale à la cire chaude avec soins apaisants. Technique douce et professionnelle.',
  'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
  200,
  120,
  40,
  '2025-03-18',
  true,
  true,
  2,
  45,
  'standard',
  4
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Visage Complète',
  'Épilation sourcils, lèvre supérieure et duvet. Visage parfaitement net et soigné.',
  'https://images.pexels.com/photos/4041398/pexels-photo-4041398.jpeg?auto=compress&cs=tinysrgb&w=800',
  150,
  90,
  40,
  '2025-04-02',
  true,
  true,
  3,
  30,
  'standard',
  5
),

-- MAQUILLAGE (Makeup) - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Maquillage Professionnel Jour',
  'Maquillage naturel et élégant pour toutes occasions. Techniques professionnelles et produits premium.',
  'https://images.pexels.com/photos/4041399/pexels-photo-4041399.jpeg?auto=compress&cs=tinysrgb&w=800',
  300,
  180,
  40,
  '2025-04-18',
  true,
  true,
  2,
  60,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Maquillage Soirée Glamour',
  'Maquillage sophistiqué pour événements spéciaux. Look glamour et tenue longue durée.',
  'https://images.pexels.com/photos/4041400/pexels-photo-4041400.jpeg?auto=compress&cs=tinysrgb&w=800',
  450,
  315,
  30,
  '2025-06-30',
  true,
  true,
  1,
  90,
  'standard',
  2
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Cours Maquillage Personnel',
  'Apprenez les techniques de maquillage avec une professionnelle. Cours personnalisé selon vos besoins.',
  'https://images.pexels.com/photos/4041401/pexels-photo-4041401.jpeg?auto=compress&cs=tinysrgb&w=800',
  500,
  300,
  40,
  '2025-05-25',
  true,
  true,
  1,
  120,
  'standard',
  1
),

-- FITNESS - 2 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Cours Yoga Privé',
  'Séance de yoga personnalisée avec instructeur certifié dans un cadre zen et apaisant.',
  'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800',
  350,
  210,
  40,
  '2025-04-22',
  true,
  true,
  1,
  75,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coaching Sportif Personnel',
  'Séance de coaching sportif personnalisé avec programme adapté à vos objectifs.',
  'https://images.pexels.com/photos/1552244/pexels-photo-1552244.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  240,
  40,
  '2025-05-12',
  true,
  true,
  1,
  60,
  'standard',
  2
),

-- SOURCILS (Eyebrows) - 2 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Restructuration Sourcils + Teinture',
  'Épilation et restructuration des sourcils avec teinture pour un regard intense et naturel.',
  'https://images.pexels.com/photos/4041402/pexels-photo-4041402.jpeg?auto=compress&cs=tinysrgb&w=800',
  200,
  120,
  40,
  '2025-03-26',
  true,
  true,
  3,
  45,
  'standard',
  4
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Extension Cils Volume',
  'Pose d''extensions de cils pour un regard volumineux et naturel. Tenue 3-4 semaines.',
  'https://images.pexels.com/photos/4041403/pexels-photo-4041403.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  280,
  30,
  '2025-05-08',
  true,
  true,
  1,
  120,
  'standard',
  2
),

-- SOINS (Body Care) - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Gommage Corps Complet',
  'Gommage exfoliant corps avec huiles nourrissantes. Peau douce et régénérée.',
  'https://images.pexels.com/photos/4041404/pexels-photo-4041404.jpeg?auto=compress&cs=tinysrgb&w=800',
  250,
  150,
  40,
  '2025-04-14',
  true,
  true,
  2,
  60,
  'standard',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Enveloppement Minceur',
  'Soin minceur avec enveloppement aux algues marines. Effet drainant et raffermissant.',
  'https://images.pexels.com/photos/4041405/pexels-photo-4041405.jpeg?auto=compress&cs=tinysrgb&w=800',
  400,
  240,
  40,
  '2025-05-18',
  true,
  true,
  1,
  90,
  'standard',
  2
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Hydratant Corps',
  'Soin hydratant intensif pour corps avec massage relaxant. Peau nourrie et apaisée.',
  'https://images.pexels.com/photos/4041406/pexels-photo-4041406.jpeg?auto=compress&cs=tinysrgb&w=800',
  300,
  180,
  40,
  '2025-04-28',
  true,
  true,
  2,
  75,
  'standard',
  3
),

-- OFFRES FLASH ET SPECIALES - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'FLASH: Coupe + Couleur Express',
  'Offre flash limitée ! Coupe et couleur rapide avec produits professionnels. Quantité limitée !',
  'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=800',
  500,
  200,
  60,
  '2025-02-28',
  true,
  true,
  1,
  120,
  'flash',
  1
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Happy Hour: Manucure 10h-15h',
  'Tarif spécial manucure pendant les heures creuses. Profitez de cette offre exclusive !',
  'https://images.pexels.com/photos/3997995/pexels-photo-3997995.jpeg?auto=compress&cs=tinysrgb&w=800',
  200,
  99,
  50,
  '2025-04-30',
  true,
  true,
  2,
  60,
  'happy_hour',
  3
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Forfait Découverte Spa',
  'Découvrez notre spa avec ce forfait d''initiation : massage + hammam + soin visage.',
  'https://images.pexels.com/photos/6663592/pexels-photo-6663592.jpeg?auto=compress&cs=tinysrgb&w=800',
  600,
  300,
  50,
  '2025-03-31',
  true,
  true,
  1,
  180,
  'limited',
  1
),

-- OFFRES BUDGET (moins de 99 DH) - 3 deals
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Brushing Express',
  'Brushing rapide et professionnel. Parfait pour un rendez-vous de dernière minute.',
  'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800',
  120,
  75,
  38,
  '2025-03-12',
  true,
  true,
  4,
  30,
  'standard',
  6
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Sourcils Simple',
  'Épilation et mise en forme des sourcils. Service rapide et précis.',
  'https://images.pexels.com/photos/4041407/pexels-photo-4041407.jpeg?auto=compress&cs=tinysrgb&w=800',
  100,
  60,
  40,
  '2025-03-15',
  true,
  true,
  5,
  20,
  'standard',
  8
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Vernis Simple Mains',
  'Application de vernis classique sur ongles préparés. Choix parmi 50 couleurs.',
  'https://images.pexels.com/photos/3997996/pexels-photo-3997996.jpeg?auto=compress&cs=tinysrgb&w=800',
  80,
  48,
  40,
  '2025-03-08',
  true,
  true,
  4,
  25,
  'standard',
  6
);

-- Generate time slots for all these deals (next 30 days)
DO $$
DECLARE
    deal_record RECORD;
    slot_date DATE;
    slot_time TIME;
    start_hour INTEGER;
    end_hour INTEGER;
BEGIN
    -- For each deal we just created
    FOR deal_record IN 
        SELECT id, duration_minutes, deal_type, max_bookings_per_slot
        FROM deals 
        WHERE business_id = 'a6cd0312-b90e-403f-bb86-37994d197e88'
        AND created_at >= NOW() - INTERVAL '1 minute'
    LOOP
        -- Set working hours based on deal type
        IF deal_record.deal_type = 'happy_hour' THEN
            start_hour := 10;
            end_hour := 15;
        ELSE
            start_hour := 9;
            end_hour := 18;
        END IF;

        -- Generate slots for next 30 days
        FOR i IN 0..29 LOOP
            slot_date := CURRENT_DATE + i;
            
            -- Skip Sundays (day 0)
            IF EXTRACT(DOW FROM slot_date) != 0 THEN
                -- Generate hourly slots
                FOR hour IN start_hour..end_hour-1 LOOP
                    slot_time := (hour || ':00')::TIME;
                    
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
                        slot_date,
                        slot_time,
                        (slot_time + (deal_record.duration_minutes || ' minutes')::INTERVAL)::TIME,
                        slot_date,
                        slot_time,
                        deal_record.max_bookings_per_slot,
                        true
                    )
                    ON CONFLICT (deal_id, date, start_time) DO NOTHING;
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;