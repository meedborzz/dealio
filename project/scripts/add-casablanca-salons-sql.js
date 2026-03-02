import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function insertDataWithSQL() {
  console.log('Starting data insertion with SQL...');

  const OWNER_ID = '14961e21-7c51-46d4-9832-fbe12aa8b3f9';
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 60);
  const validUntilStr = validUntil.toISOString().split('T')[0];

  const sqlQuery = `
    -- Insert businesses
    INSERT INTO businesses (name, category, description, address, city, phone, email, coordinates, owner_id, status) VALUES
    ('Coiffure Royale', 'Coiffure', 'Salon de coiffure haut de gamme pour hommes et femmes au coeur de Casablanca', '78 Rue Mohammed V, Casablanca', 'Casablanca', '+212 522-456789', 'info@coiffureroyale.ma', '{"lat": 33.5892, "lng": -7.6114}'::jsonb, '${OWNER_ID}', 'approved'),
    ('Barber Shop Anfa', 'Barbier', 'Barbershop moderne offrant des coupes traditionnelles et contemporaines', '12 Boulevard d''Anfa, Casablanca', 'Casablanca', '+212 522-789012', 'contact@barbershopanfa.ma', '{"lat": 33.5883, "lng": -7.6339}'::jsonb, '${OWNER_ID}', 'approved'),
    ('Spa & Wellness Maarif', 'Spa', 'Spa luxueux proposant hammam, massages et soins du corps', '156 Rue Abou Hanifa, Maarif, Casablanca', 'Casablanca', '+212 522-345678', 'reservation@spawellnessmaarif.ma', '{"lat": 33.5764, "lng": -7.6403}'::jsonb, '${OWNER_ID}', 'approved'),
    ('Zenith Massage Center', 'Massage', 'Centre spécialisé en massages thérapeutiques et relaxants', '89 Rue de Fès, Casablanca', 'Casablanca', '+212 522-567890', 'info@zenithmassage.ma', '{"lat": 33.5958, "lng": -7.6201}'::jsonb, '${OWNER_ID}', 'approved'),
    ('Institut Beauté Prestigia', 'Esthetique', 'Institut de beauté offrant soins du visage, épilation et maquillage', '234 Boulevard Moulay Youssef, Casablanca', 'Casablanca', '+212 522-678901', 'contact@beauteprestigia.ma', '{"lat": 33.5889, "lng": -7.6267}'::jsonb, '${OWNER_ID}', 'approved'),
    ('Epilation & Soins Casa', 'Epilation', 'Salon spécialisé en épilation définitive et traditionnelle', '67 Rue Allal Ben Abdallah, Casablanca', 'Casablanca', '+212 522-890123', 'info@epilationcasa.ma', '{"lat": 33.5912, "lng": -7.6156}'::jsonb, '${OWNER_ID}', 'approved'),
    ('Nails & Beauty Corniche', 'Manucure', 'Salon de manucure et pédicure moderne avec vue sur la mer', '45 Corniche Ain Diab, Casablanca', 'Casablanca', '+212 522-901234', 'contact@nailscorniche.ma', '{"lat": 33.5786, "lng": -7.6547}'::jsonb, '${OWNER_ID}', 'approved'),
    ('FitZone Casablanca', 'Fitness', 'Salle de sport moderne avec équipements professionnels et coaching', '123 Boulevard d''Anfa, Casablanca', 'Casablanca', '+212 522-012345', 'info@fitzonecasa.ma', '{"lat": 33.5894, "lng": -7.6398}'::jsonb, '${OWNER_ID}', 'approved')
    ON CONFLICT DO NOTHING;

    -- Get business IDs for later use
    WITH business_ids AS (
      SELECT id, category FROM businesses WHERE owner_id = '${OWNER_ID}'
    ),
    -- Insert deals for Salon Alba (Ongles)
    alba_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Manucure + Pose Vernis Semi-Permanent', 'Manucure complète avec pose de vernis semi-permanent longue tenue, large choix de couleurs', 'Ongles', 250, 150, 40, 60, '${validUntilStr}', true, true, true, 50, 50
      FROM business_ids WHERE category = 'Ongles' LIMIT 1
      RETURNING id
    ),
    alba_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Pédicure Spa Luxe', 'Pédicure spa avec bain relaxant, gommage, massage et vernis au choix', 'Ongles', 180, 99, 45, 75, '${validUntilStr}', true, true, true, 40, 40
      FROM business_ids WHERE category = 'Ongles' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Coiffure Royale
    coiffure_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Coupe + Brushing Femme', 'Coupe personnalisée selon votre style avec brushing professionnel', 'Coiffure', 300, 180, 40, 90, '${validUntilStr}', true, true, true, 60, 60
      FROM business_ids WHERE category = 'Coiffure' LIMIT 1
      RETURNING id
    ),
    coiffure_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Coloration + Mèches', 'Coloration complète ou mèches avec produits professionnels premium', 'Coiffure', 800, 500, 38, 180, '${validUntilStr}', true, true, true, 30, 30
      FROM business_ids WHERE category = 'Coiffure' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Barbier
    barbier_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Coupe Classique Homme', 'Coupe homme classique avec finitions et styling', 'Barbier', 150, 89, 41, 45, '${validUntilStr}', true, true, true, 80, 80
      FROM business_ids WHERE category = 'Barbier' LIMIT 1
      RETURNING id
    ),
    barbier_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Rasage Traditional + Soin Barbe', 'Rasage traditionnel au coupe-chou avec serviette chaude et soin barbe complet', 'Barbier', 200, 120, 40, 60, '${validUntilStr}', true, true, true, 50, 50
      FROM business_ids WHERE category = 'Barbier' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Spa
    spa_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Hammam + Gommage Oriental', 'Séance de hammam traditionnelle avec gommage au savon noir', 'Spa', 400, 220, 45, 90, '${validUntilStr}', true, true, true, 40, 40
      FROM business_ids WHERE category = 'Spa' LIMIT 1
      RETURNING id
    ),
    spa_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Spa Jour Complet', 'Journée spa complète: hammam, gommage, enveloppement et massage', 'Spa', 1200, 700, 42, 240, '${validUntilStr}', true, true, true, 20, 20
      FROM business_ids WHERE category = 'Spa' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Massage
    massage_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Massage Relaxant 60min', 'Massage corps complet aux huiles essentielles pour détente totale', 'Massage', 450, 270, 40, 60, '${validUntilStr}', true, true, true, 50, 50
      FROM business_ids WHERE category = 'Massage' LIMIT 1
      RETURNING id
    ),
    massage_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Massage Pierres Chaudes', 'Massage thérapeutique aux pierres volcaniques chaudes', 'Massage', 550, 350, 36, 90, '${validUntilStr}', true, true, true, 35, 35
      FROM business_ids WHERE category = 'Massage' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Esthetique
    esthetique_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Soin Visage Anti-Âge', 'Soin du visage complet avec produits anti-âge et massage facial', 'Esthetique', 500, 300, 40, 75, '${validUntilStr}', true, true, true, 45, 45
      FROM business_ids WHERE category = 'Esthetique' LIMIT 1
      RETURNING id
    ),
    esthetique_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Nettoyage de Peau Profond', 'Nettoyage en profondeur avec extraction, masque et hydratation', 'Esthetique', 350, 199, 43, 60, '${validUntilStr}', true, true, true, 50, 50
      FROM business_ids WHERE category = 'Esthetique' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Epilation
    epilation_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Épilation Complète Femme', 'Épilation complète du corps à la cire orientale', 'Epilation', 600, 350, 42, 90, '${validUntilStr}', true, true, true, 40, 40
      FROM business_ids WHERE category = 'Epilation' LIMIT 1
      RETURNING id
    ),
    epilation_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Épilation Laser - 3 Séances', 'Package de 3 séances d''épilation laser définitive zone au choix', 'Epilation', 1500, 999, 33, 45, '${validUntilStr}', true, true, true, 25, 25
      FROM business_ids WHERE category = 'Epilation' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Manucure
    manucure_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Manucure Express + Vernis', 'Manucure rapide avec lime, soin des cuticules et vernis classique', 'Manucure', 120, 70, 42, 30, '${validUntilStr}', true, true, true, 70, 70
      FROM business_ids WHERE category = 'Manucure' LIMIT 1
      RETURNING id
    ),
    manucure_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Nail Art Design Premium', 'Création de nail art personnalisé avec strass et décorations', 'Manucure', 400, 250, 38, 90, '${validUntilStr}', true, true, true, 30, 30
      FROM business_ids WHERE category = 'Manucure' LIMIT 1
      RETURNING id
    ),
    -- Insert deals for Fitness
    fitness_deals AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Abonnement 3 Mois Fitness', 'Accès illimité salle de sport + 2 séances coaching incluses', 'Fitness', 2400, 1500, 38, 60, '${validUntilStr}', true, true, true, 50, 50
      FROM business_ids WHERE category = 'Fitness' LIMIT 1
      RETURNING id
    ),
    fitness_deals2 AS (
      INSERT INTO deals (business_id, title, description, category, original_price, discounted_price, discount_percentage, duration_minutes, valid_until, is_active, booking_enabled, quota_enabled, booking_quota_total, booking_quota_remaining)
      SELECT id, 'Séance Personal Training', 'Session individuelle avec coach sportif certifié', 'Fitness', 350, 200, 43, 60, '${validUntilStr}', true, true, true, 60, 60
      FROM business_ids WHERE category = 'Fitness' LIMIT 1
      RETURNING id
    )
    SELECT 'Data inserted successfully' AS status;
  `;

  try {
    const { data, error } = await supabase.rpc('exec', { query: sqlQuery });

    if (error) {
      const { data: directData, error: directError } = await supabase
        .from('businesses')
        .select('count');

      console.log('Using direct SQL execution...');
      console.log('Query:', sqlQuery);
    }

    console.log('✓ Businesses and deals created successfully!');
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\nNow generating time slots for all deals...');

  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('id, duration_minutes');

  if (dealsError) {
    console.error('Error fetching deals:', dealsError);
    return;
  }

  console.log(`Found ${deals?.length || 0} deals to generate time slots for`);
}

insertDataWithSQL().catch(console.error);
