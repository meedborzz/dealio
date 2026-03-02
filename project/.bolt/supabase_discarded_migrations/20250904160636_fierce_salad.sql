/*
  # Create comprehensive sample deals for testing

  1. New Tables
    - Enhanced deals table with deal_type and special offer features
    - Time slots for all deals

  2. Sample Data
    - 25+ deals across all categories for business a6cd0312-b90e-403f-bb86-37994d197e88
    - Time slots for next 30 days
    - Various deal types: standard, flash, happy_hour, limited, bundle

  3. Features
    - Realistic pricing and discounts
    - Professional French descriptions
    - Different durations and booking limits
*/

-- First, add the missing columns to deals table if they don't exist
DO $$
BEGIN
  -- Add deal_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'deal_type'
  ) THEN
    ALTER TABLE deals ADD COLUMN deal_type text DEFAULT 'standard';
  END IF;

  -- Add starts_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'starts_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN starts_at timestamptz;
  END IF;

  -- Add ends_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'ends_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN ends_at timestamptz;
  END IF;

  -- Add limited_qty column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'limited_qty'
  ) THEN
    ALTER TABLE deals ADD COLUMN limited_qty integer;
  END IF;

  -- Add per_user_limit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'per_user_limit'
  ) THEN
    ALTER TABLE deals ADD COLUMN per_user_limit integer DEFAULT 1;
  END IF;

  -- Add days_of_week column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'days_of_week'
  ) THEN
    ALTER TABLE deals ADD COLUMN days_of_week integer[];
  END IF;

  -- Add happy_hour_start column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'happy_hour_start'
  ) THEN
    ALTER TABLE deals ADD COLUMN happy_hour_start time;
  END IF;

  -- Add happy_hour_end column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'happy_hour_end'
  ) THEN
    ALTER TABLE deals ADD COLUMN happy_hour_end time;
  END IF;

  -- Add requires_deposit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'requires_deposit'
  ) THEN
    ALTER TABLE deals ADD COLUMN requires_deposit boolean DEFAULT false;
  END IF;

  -- Add deposit_cents column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'deposit_cents'
  ) THEN
    ALTER TABLE deals ADD COLUMN deposit_cents integer DEFAULT 0;
  END IF;
END $$;

-- Insert comprehensive sample deals
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
  happy_hour_end,
  requires_deposit,
  deposit_cents
) VALUES 
-- COIFFURE (6 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe + Brushing Femme',
  'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look.',
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 200, 50,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coloration Complète + Coupe',
  'Coloration professionnelle avec coupe et coiffage. Conseils personnalisés pour votre style.',
  'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
  800, 480, 40,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Balayage + Soin Profond',
  'Technique de balayage naturel avec soin réparateur profond. Résultat lumineux et naturel.',
  'https://images.pexels.com/photos/3993454/pexels-photo-3993454.jpeg?auto=compress&cs=tinysrgb&w=800',
  1200, 720, 40,
  CURRENT_DATE + INTERVAL '60 days',
  true, true, 1, 180,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, true, 10000
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe Express Homme',
  'Coupe rapide et moderne pour homme. Service express sans compromis sur la qualité.',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 120, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 3, 30,
  'standard', NULL, NULL, NULL, 2, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Lissage Brésilien',
  'Lissage longue durée pour cheveux lisses et brillants pendant 4-6 mois.',
  'https://images.pexels.com/photos/3993452/pexels-photo-3993452.jpeg?auto=compress&cs=tinysrgb&w=800',
  1500, 900, 40,
  CURRENT_DATE + INTERVAL '90 days',
  true, true, 1, 240,
  'limited', NULL, NULL, 10, 1, NULL, NULL, NULL, true, 15000
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coiffure Mariage',
  'Coiffure élégante pour votre jour J. Essai inclus + coiffure le jour du mariage.',
  'https://images.pexels.com/photos/3993448/pexels-photo-3993448.jpeg?auto=compress&cs=tinysrgb&w=800',
  700, 420, 40,
  CURRENT_DATE + INTERVAL '120 days',
  true, true, 1, 150,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, true, 20000
),

-- ONGLES (4 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Manucure + Vernis Semi-Permanent',
  'Manucure complète avec pose de vernis semi-permanent longue tenue. Large choix de couleurs tendance.',
  'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
  250, 150, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Pédicure Spa Complète',
  'Pédicure avec gommage, soins des ongles et pose de vernis. Relaxation et beauté des pieds.',
  'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Nail Art Créatif',
  'Création artistique sur ongles avec motifs personnalisés. Art unique pour vos ongles.',
  'https://images.pexels.com/photos/3997994/pexels-photo-3997994.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 280, 30,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Pose Faux Ongles + Décoration',
  'Pose de faux ongles en gel avec décoration artistique. Ongles longs et résistants.',
  'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=800',
  350, 245, 30,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 1, 150,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- MASSAGE (4 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Relaxant 60min',
  'Massage complet du corps aux huiles essentielles d''argan pour une relaxation totale. Idéal pour évacuer le stress.',
  'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Pierres Chaudes',
  'Massage thérapeutique aux pierres volcaniques chaudes. Détente profonde et décontraction musculaire.',
  'https://images.pexels.com/photos/3757941/pexels-photo-3757941.jpeg?auto=compress&cs=tinysrgb&w=800',
  500, 350, 30,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Couple Romantique',
  'Massage relaxant en duo dans une ambiance romantique. Moment privilégié à partager.',
  'https://images.pexels.com/photos/3757943/pexels-photo-3757943.jpeg?auto=compress&cs=tinysrgb&w=800',
  800, 560, 30,
  CURRENT_DATE + INTERVAL '60 days',
  true, true, 1, 120,
  'bundle', NULL, NULL, 5, 1, NULL, NULL, NULL, true, 20000
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Massage Express 30min',
  'Massage ciblé dos et nuque pour soulager rapidement les tensions. Parfait en pause déjeuner.',
  'https://images.pexels.com/photos/3757940/pexels-photo-3757940.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 140, 30,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 3, 30,
  'standard', NULL, NULL, NULL, 2, NULL, NULL, NULL, false, 0
),

-- SPA (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Hammam Traditionnel + Gommage',
  'Détendez-vous avec notre hammam traditionnel marocain suivi d''un gommage au savon noir. Une expérience authentique et relaxante.',
  'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
  350, 210, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Journée Spa Complète',
  'Forfait spa complet: hammam, gommage, massage et soin visage. Une journée de pure détente.',
  'https://images.pexels.com/photos/6663590/pexels-photo-6663590.jpeg?auto=compress&cs=tinysrgb&w=800',
  1200, 720, 40,
  CURRENT_DATE + INTERVAL '90 days',
  true, true, 1, 360,
  'bundle', NULL, NULL, 3, 1, NULL, NULL, NULL, true, 30000
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Bain Turc + Relaxation',
  'Séance de bain turc traditionnel avec temps de relaxation dans notre espace zen.',
  'https://images.pexels.com/photos/6663591/pexels-photo-6663591.jpeg?auto=compress&cs=tinysrgb&w=800',
  250, 175, 30,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 3, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- ESTHÉTIQUE (4 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Visage Anti-Âge',
  'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation. Produits haut de gamme.',
  'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
  600, 360, 40,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Nettoyage de Peau Profond',
  'Nettoyage en profondeur avec extraction des impuretés. Peau purifiée et éclatante.',
  'https://images.pexels.com/photos/4041393/pexels-photo-4041393.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Hydratant Intensif',
  'Soin hydratant profond pour peaux sèches et déshydratées. Confort et souplesse retrouvés.',
  'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 280, 30,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Microdermabrasion + LED',
  'Traitement de microdermabrasion suivi de thérapie LED pour une peau lisse et éclatante.',
  'https://images.pexels.com/photos/4041395/pexels-photo-4041395.jpeg?auto=compress&cs=tinysrgb&w=800',
  800, 480, 40,
  CURRENT_DATE + INTERVAL '60 days',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, true, 15000
),

-- BARBIER (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coupe Homme + Barbe',
  'Coupe moderne avec taille et entretien de barbe. Service professionnel dans une ambiance conviviale.',
  'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  180, 108, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 3, 45,
  'standard', NULL, NULL, NULL, 2, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Rasage Traditionnel',
  'Rasage à l''ancienne au rasoir avec serviettes chaudes. Expérience authentique et relaxante.',
  'https://images.pexels.com/photos/1813273/pexels-photo-1813273.jpeg?auto=compress&cs=tinysrgb&w=800',
  150, 90, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Forfait Gentleman Complet',
  'Coupe + barbe + rasage + soin visage homme. Le forfait complet pour l''homme moderne.',
  'https://images.pexels.com/photos/1813274/pexels-photo-1813274.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 120,
  'bundle', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- ÉPILATION (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Laser Jambes Complètes',
  'Épilation définitive au laser dernière génération. Résultats durables et peau douce.',
  'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
  1000, 600, 40,
  CURRENT_DATE + INTERVAL '90 days',
  true, true, 1, 45,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, true, 20000
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Cire Maillot Brésilien',
  'Épilation complète du maillot à la cire chaude. Technique professionnelle et hygiénique.',
  'https://images.pexels.com/photos/4041396/pexels-photo-4041396.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 120, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 30,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Visage Complète',
  'Épilation sourcils, lèvre supérieure et menton. Visage parfaitement épilé.',
  'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
  150, 90, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 3, 20,
  'standard', NULL, NULL, NULL, 2, NULL, NULL, NULL, false, 0
),

-- MAQUILLAGE (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Maquillage Professionnel Jour',
  'Maquillage naturel et élégant pour la journée. Mise en valeur de votre beauté naturelle.',
  'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Maquillage Soirée Glamour',
  'Maquillage sophistiqué pour vos soirées spéciales. Look glamour et longue tenue.',
  'https://images.pexels.com/photos/4041398/pexels-photo-4041398.jpeg?auto=compress&cs=tinysrgb&w=800',
  450, 315, 30,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Cours Maquillage Personnel',
  'Cours privé pour apprendre les techniques de maquillage. Conseils personnalisés et produits inclus.',
  'https://images.pexels.com/photos/4041399/pexels-photo-4041399.jpeg?auto=compress&cs=tinysrgb&w=800',
  500, 300, 40,
  CURRENT_DATE + INTERVAL '60 days',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- FITNESS (2 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Cours Yoga Privé',
  'Séance de yoga personnalisée avec instructeur certifié dans un cadre zen.',
  'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 210, 30,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 1, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Coaching Sportif Personnel',
  'Séance de coaching sportif personnalisé. Programme adapté à vos objectifs.',
  'https://images.pexels.com/photos/1552244/pexels-photo-1552244.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- SOURCILS (2 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Restructuration Sourcils + Teinture',
  'Restructuration complète des sourcils avec teinture pour un regard intense.',
  'https://images.pexels.com/photos/4041400/pexels-photo-4041400.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 120, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 3, 45,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Extension Cils Volume',
  'Pose d''extensions de cils pour un regard volumineux et intense. Effet naturel garanti.',
  'https://images.pexels.com/photos/4041401/pexels-photo-4041401.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 280, 30,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 120,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- SOINS CORPS (3 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Gommage Corps Complet',
  'Gommage exfoliant sur tout le corps pour une peau douce et soyeuse.',
  'https://images.pexels.com/photos/4041402/pexels-photo-4041402.jpeg?auto=compress&cs=tinysrgb&w=800',
  250, 150, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 60,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Enveloppement Minceur',
  'Enveloppement corporel aux algues marines pour raffermir et tonifier la peau.',
  'https://images.pexels.com/photos/4041403/pexels-photo-4041403.jpeg?auto=compress&cs=tinysrgb&w=800',
  400, 240, 40,
  CURRENT_DATE + INTERVAL '45 days',
  true, true, 1, 90,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Soin Hydratant Corps',
  'Soin hydratant complet du corps avec massage relaxant. Peau nourrie et apaisée.',
  'https://images.pexels.com/photos/4041404/pexels-photo-4041404.jpeg?auto=compress&cs=tinysrgb&w=800',
  300, 180, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 75,
  'standard', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),

-- OFFRES SPÉCIALES (6 deals)
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'FLASH: Coupe + Couleur Express',
  'Offre flash limitée! Coupe et couleur express en 2h. Quantité très limitée!',
  'https://images.pexels.com/photos/3993450/pexels-photo-3993450.jpeg?auto=compress&cs=tinysrgb&w=800',
  500, 200, 60,
  CURRENT_DATE + INTERVAL '7 days',
  true, true, 1, 120,
  'flash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 5, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Happy Hour: Manucure 10h-15h',
  'Tarif spécial manucure pendant nos heures creuses en semaine uniquement.',
  'https://images.pexels.com/photos/3997995/pexels-photo-3997995.jpeg?auto=compress&cs=tinysrgb&w=800',
  200, 99, 50,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 60,
  'happy_hour', NULL, NULL, NULL, 1, ARRAY[1,2,3,4,5], '10:00', '15:00', false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Forfait Découverte Spa',
  'Découvrez notre spa avec ce forfait d''initiation: hammam + massage 30min.',
  'https://images.pexels.com/photos/6663592/pexels-photo-6663592.jpeg?auto=compress&cs=tinysrgb&w=800',
  600, 300, 50,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 2, 120,
  'bundle', NULL, NULL, NULL, 1, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Brushing Express',
  'Brushing rapide et efficace. Parfait pour un rendez-vous de dernière minute.',
  'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800',
  120, 75, 38,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 4, 20,
  'standard', NULL, NULL, NULL, 3, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Épilation Sourcils Simple',
  'Épilation et restructuration des sourcils. Look soigné en quelques minutes.',
  'https://images.pexels.com/photos/4041405/pexels-photo-4041405.jpeg?auto=compress&cs=tinysrgb&w=800',
  100, 60, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 4, 15,
  'standard', NULL, NULL, NULL, 2, NULL, NULL, NULL, false, 0
),
(
  'a6cd0312-b90e-403f-bb86-37994d197e88',
  'Vernis Simple Mains',
  'Application de vernis classique sur ongles préparés. Finition parfaite.',
  'https://images.pexels.com/photos/3997996/pexels-photo-3997996.jpeg?auto=compress&cs=tinysrgb&w=800',
  80, 48, 40,
  CURRENT_DATE + INTERVAL '30 days',
  true, true, 5, 20,
  'standard', NULL, NULL, NULL, 3, NULL, NULL, NULL, false, 0
);

-- Generate time slots for all deals for the next 30 days
DO $$
DECLARE
  deal_record RECORD;
  slot_date DATE;
  slot_time TIME;
  current_time TIME;
  end_time TIME;
  day_of_week INTEGER;
BEGIN
  -- Loop through all deals for this business
  FOR deal_record IN 
    SELECT id, duration_minutes, max_bookings_per_slot, deal_type, days_of_week, happy_hour_start, happy_hour_end
    FROM deals 
    WHERE business_id = 'a6cd0312-b90e-403f-bb86-37994d197e88'
  LOOP
    -- Generate slots for next 30 days
    FOR i IN 0..29 LOOP
      slot_date := CURRENT_DATE + i;
      day_of_week := EXTRACT(DOW FROM slot_date); -- 0=Sunday, 1=Monday, etc.
      
      -- Skip Sundays (day 0) for most deals
      IF day_of_week = 0 THEN
        CONTINUE;
      END IF;
      
      -- Check if deal is restricted to specific days
      IF deal_record.days_of_week IS NOT NULL THEN
        IF NOT (day_of_week = ANY(deal_record.days_of_week)) THEN
          CONTINUE;
        END IF;
      END IF;
      
      -- Set working hours based on deal type
      IF deal_record.deal_type = 'happy_hour' AND deal_record.happy_hour_start IS NOT NULL THEN
        current_time := deal_record.happy_hour_start;
        end_time := deal_record.happy_hour_end;
      ELSE
        current_time := '09:00'::TIME;
        end_time := '18:00'::TIME;
      END IF;
      
      -- Generate time slots for the day
      WHILE current_time < end_time LOOP
        -- Calculate slot end time
        slot_time := current_time + (deal_record.duration_minutes || ' minutes')::INTERVAL;
        
        -- Only create slot if it fits within working hours
        IF slot_time <= end_time THEN
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
            current_time,
            slot_time,
            slot_date,
            current_time,
            deal_record.max_bookings_per_slot,
            true
          );
        END IF;
        
        -- Move to next slot (add duration + 15 min break)
        current_time := current_time + (deal_record.duration_minutes + 15 || ' minutes')::INTERVAL;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;