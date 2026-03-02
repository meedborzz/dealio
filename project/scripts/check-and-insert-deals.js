import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const businessId = 'a6cd0312-b90e-403f-bb86-37994d197e88';

async function checkAndInsertDeals() {
  console.log('🔍 Checking existing deals for Salon Alba...');
  
  try {
    // Check existing deals
    const { data: existingDeals, error: dealsError } = await supabase
      .from('deals')
      .select('id, title')
      .eq('business_id', businessId);

    if (dealsError) {
      console.error('❌ Error checking deals:', dealsError.message);
      return;
    }

    console.log(`📊 Found ${existingDeals?.length || 0} existing deals`);

    if (existingDeals && existingDeals.length > 0) {
      console.log('📋 Existing deals:');
      existingDeals.forEach((deal, index) => {
        console.log(`  ${index + 1}. ${deal.title}`);
      });
      console.log('\n✅ Deals already exist. Skipping insertion.');
      return;
    }

    // Insert comprehensive sample deals
    console.log('📝 Creating 25+ sample deals for Salon Alba...');

    const sampleDeals = [
      // Coiffure (6 deals)
      {
        title: 'Coupe + Brushing Femme',
        description: 'Coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look.',
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 400,
        discounted_price: 200,
        discount_percentage: 50,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Coloration Complète + Coupe',
        description: 'Coloration professionnelle complète avec coupe et coiffage personnalisé selon vos envies.',
        image_url: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 600,
        discounted_price: 480,
        discount_percentage: 20,
        duration_minutes: 150,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Balayage + Soin Profond',
        description: 'Technique de balayage naturel avec soin réparateur profond pour des cheveux éclatants.',
        image_url: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 900,
        discounted_price: 720,
        discount_percentage: 20,
        duration_minutes: 180,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Coupe Express Homme',
        description: 'Coupe rapide et moderne pour homme actif. Service express sans compromis sur la qualité.',
        image_url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 150,
        discounted_price: 120,
        discount_percentage: 20,
        duration_minutes: 30,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 3
      },
      {
        title: 'Lissage Brésilien',
        description: 'Lissage brésilien longue durée pour des cheveux lisses et brillants pendant des mois.',
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 1200,
        discounted_price: 900,
        discount_percentage: 25,
        duration_minutes: 240,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Coiffure Mariage',
        description: 'Coiffure élégante pour votre jour J avec essai inclus. Réservez votre créneau spécial.',
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 600,
        discounted_price: 420,
        discount_percentage: 30,
        duration_minutes: 120,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Ongles (4 deals)
      {
        title: 'Manucure + Vernis Semi-Permanent',
        description: 'Manucure complète avec pose de vernis semi-permanent longue tenue. Large choix de couleurs tendance.',
        image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 200,
        discounted_price: 150,
        discount_percentage: 25,
        duration_minutes: 75,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Pédicure Spa Complète',
        description: 'Pédicure avec bain relaxant, gommage, soins des ongles et massage des pieds.',
        image_url: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 250,
        discounted_price: 180,
        discount_percentage: 28,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Nail Art Créatif',
        description: 'Création artistique sur ongles avec motifs personnalisés et strass. Art unique pour vos ongles.',
        image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 350,
        discounted_price: 280,
        discount_percentage: 20,
        duration_minutes: 120,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Pose Faux Ongles + Décoration',
        description: 'Pose de faux ongles en gel avec décoration personnalisée selon vos goûts.',
        image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 350,
        discounted_price: 245,
        discount_percentage: 30,
        duration_minutes: 105,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Massage (4 deals)
      {
        title: 'Massage Relaxant 60min',
        description: 'Massage complet du corps aux huiles essentielles pour une relaxation totale. Idéal pour évacuer le stress.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 350,
        discounted_price: 240,
        discount_percentage: 31,
        duration_minutes: 60,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Massage Pierres Chaudes',
        description: 'Massage relaxant aux pierres chaudes volcaniques pour une détente profonde et durable.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 500,
        discounted_price: 350,
        discount_percentage: 30,
        duration_minutes: 75,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Massage Couple Romantique',
        description: 'Massage relaxant en duo dans une ambiance romantique avec bougies et musique douce.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 800,
        discounted_price: 560,
        discount_percentage: 30,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Massage Express 30min',
        description: 'Massage express ciblé pour soulager les tensions rapidement pendant votre pause.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 200,
        discounted_price: 140,
        discount_percentage: 30,
        duration_minutes: 30,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 3
      },

      // Spa (3 deals)
      {
        title: 'Hammam Traditionnel + Gommage',
        description: 'Détendez-vous avec notre hammam traditionnel marocain suivi d\'un gommage au savon noir authentique.',
        image_url: 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 300,
        discounted_price: 210,
        discount_percentage: 30,
        duration_minutes: 120,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Journée Spa Complète',
        description: 'Forfait spa complet: hammam, gommage, massage et soin visage pour une journée de pure détente.',
        image_url: 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 1000,
        discounted_price: 720,
        discount_percentage: 28,
        duration_minutes: 360,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Bain Turc + Relaxation',
        description: 'Bain turc traditionnel avec temps de relaxation dans notre espace zen.',
        image_url: 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 250,
        discounted_price: 175,
        discount_percentage: 30,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 3
      },

      // Esthétique (4 deals)
      {
        title: 'Soin Visage Anti-Âge',
        description: 'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation. Produits haut de gamme.',
        image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 500,
        discounted_price: 360,
        discount_percentage: 28,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Nettoyage de Peau Profond',
        description: 'Nettoyage en profondeur avec extraction des impuretés et soin hydratant personnalisé.',
        image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 250,
        discounted_price: 180,
        discount_percentage: 28,
        duration_minutes: 60,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Soin Hydratant Intensif',
        description: 'Soin hydratant intensif pour peaux sèches avec masque nourrissant et massage facial.',
        image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 350,
        discounted_price: 280,
        discount_percentage: 20,
        duration_minutes: 75,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Microdermabrasion + LED',
        description: 'Traitement microdermabrasion suivi de thérapie LED pour une peau lisse et éclatante.',
        image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 600,
        discounted_price: 480,
        discount_percentage: 20,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Barbier (3 deals)
      {
        title: 'Coupe Homme + Barbe',
        description: 'Coupe moderne avec taille et entretien de barbe. Service professionnel dans une ambiance conviviale.',
        image_url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 150,
        discounted_price: 108,
        discount_percentage: 28,
        duration_minutes: 45,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 3
      },
      {
        title: 'Rasage Traditionnel',
        description: 'Rasage traditionnel au rasoir avec serviettes chaudes et soins après-rasage premium.',
        image_url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 120,
        discounted_price: 90,
        discount_percentage: 25,
        duration_minutes: 30,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Forfait Gentleman Complet',
        description: 'Forfait complet: coupe, barbe, rasage et soins du visage pour le gentleman moderne.',
        image_url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 300,
        discounted_price: 240,
        discount_percentage: 20,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Épilation (3 deals)
      {
        title: 'Épilation Laser Jambes Complètes',
        description: 'Épilation définitive au laser dernière génération. Résultats durables et peau douce.',
        image_url: 'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 800,
        discounted_price: 600,
        discount_percentage: 25,
        duration_minutes: 45,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Épilation Cire Maillot Brésilien',
        description: 'Épilation complète du maillot à la cire chaude avec soins apaisants post-épilation.',
        image_url: 'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 150,
        discounted_price: 120,
        discount_percentage: 20,
        duration_minutes: 30,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Épilation Visage Complète',
        description: 'Épilation complète du visage (sourcils, lèvre, menton) pour un résultat net et précis.',
        image_url: 'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 120,
        discounted_price: 90,
        discount_percentage: 25,
        duration_minutes: 45,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },

      // Maquillage (3 deals)
      {
        title: 'Maquillage Professionnel Jour',
        description: 'Maquillage naturel et élégant pour vos rendez-vous professionnels et occasions spéciales.',
        image_url: 'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 250,
        discounted_price: 180,
        discount_percentage: 28,
        duration_minutes: 60,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Maquillage Soirée Glamour',
        description: 'Maquillage sophistiqué pour vos soirées spéciales avec produits haute gamme longue tenue.',
        image_url: 'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 450,
        discounted_price: 315,
        discount_percentage: 30,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Cours Maquillage Personnel',
        description: 'Cours de maquillage personnalisé pour apprendre les techniques adaptées à votre visage.',
        image_url: 'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 400,
        discounted_price: 300,
        discount_percentage: 25,
        duration_minutes: 120,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Fitness (2 deals)
      {
        title: 'Cours Yoga Privé',
        description: 'Séance de yoga personnalisée avec instructeur certifié dans un cadre zen et relaxant.',
        image_url: 'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 300,
        discounted_price: 210,
        discount_percentage: 30,
        duration_minutes: 75,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Coaching Sportif Personnel',
        description: 'Séance de coaching sportif personnalisé avec programme adapté à vos objectifs.',
        image_url: 'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 350,
        discounted_price: 240,
        discount_percentage: 31,
        duration_minutes: 60,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Sourcils (2 deals)
      {
        title: 'Restructuration Sourcils + Teinture',
        description: 'Restructuration complète des sourcils avec teinture pour un regard parfait et naturel.',
        image_url: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 150,
        discounted_price: 120,
        discount_percentage: 20,
        duration_minutes: 45,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Extension Cils Volume',
        description: 'Pose d\'extensions de cils pour un regard intense et volumineux qui dure plusieurs semaines.',
        image_url: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 400,
        discounted_price: 280,
        discount_percentage: 30,
        duration_minutes: 120,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },

      // Soins Corps (3 deals)
      {
        title: 'Gommage Corps Complet',
        description: 'Gommage exfoliant complet du corps pour une peau douce et régénérée avec huiles nourrissantes.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 200,
        discounted_price: 150,
        discount_percentage: 25,
        duration_minutes: 60,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Enveloppement Minceur',
        description: 'Enveloppement corporel minceur avec produits actifs pour raffermir et tonifier la peau.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 350,
        discounted_price: 240,
        discount_percentage: 31,
        duration_minutes: 90,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Soin Hydratant Corps',
        description: 'Soin hydratant complet du corps avec massage relaxant et crèmes nourrissantes.',
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 250,
        discounted_price: 180,
        discount_percentage: 28,
        duration_minutes: 75,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },

      // Offres Spéciales (5 deals)
      {
        title: 'FLASH: Coupe + Couleur Express',
        description: 'Offre flash limitée! Coupe + coloration express avec produits premium. Quantité limitée!',
        image_url: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 500,
        discounted_price: 200,
        discount_percentage: 60,
        duration_minutes: 120,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 1
      },
      {
        title: 'Happy Hour: Manucure Express',
        description: 'Manucure express disponible uniquement de 10h à 15h en semaine. Prix spécial!',
        image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 120,
        discounted_price: 99,
        discount_percentage: 18,
        duration_minutes: 45,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 2
      },
      {
        title: 'Brushing Express',
        description: 'Brushing rapide et efficace pour un look parfait en moins de 30 minutes.',
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 100,
        discounted_price: 75,
        discount_percentage: 25,
        duration_minutes: 30,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 3
      },
      {
        title: 'Épilation Sourcils Simple',
        description: 'Épilation simple des sourcils pour un regard net et soigné. Prix mini!',
        image_url: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 80,
        discounted_price: 60,
        discount_percentage: 25,
        duration_minutes: 20,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 4
      },
      {
        title: 'Vernis Simple Mains',
        description: 'Application de vernis classique sur ongles naturels. Parfait pour un look soigné.',
        image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
        original_price: 60,
        discounted_price: 48,
        discount_percentage: 20,
        duration_minutes: 25,
        valid_until: '2024-12-31',
        is_active: true,
        booking_enabled: true,
        max_bookings_per_slot: 3
      }
    ];

    // Insert deals in batches to avoid overwhelming the database
    const batchSize = 5;
    let successCount = 0;
    
    for (let i = 0; i < sampleDeals.length; i += batchSize) {
      const batch = sampleDeals.slice(i, i + batchSize);
      
      try {
        const dealsToInsert = batch.map(deal => ({
          business_id: businessId,
          ...deal
        }));

        const { data, error } = await supabase
          .from('deals')
          .insert(dealsToInsert)
          .select('id, title');

        if (error) {
          console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        } else {
          console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${data?.length || 0} deals`);
          successCount += data?.length || 0;
        }
      } catch (err) {
        console.error(`❌ Error with batch ${Math.floor(i/batchSize) + 1}:`, err);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Successfully created ${successCount}/${sampleDeals.length} deals for Salon Alba!`);

    // Verify the deals were inserted
    const { data: finalDeals, error: verifyError } = await supabase
      .from('deals')
      .select('id, title, discounted_price, discount_percentage')
      .eq('business_id', businessId)
      .order('discounted_price', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying deals:', verifyError.message);
    } else {
      console.log(`\n📊 Total deals now in database: ${finalDeals?.length || 0}`);
      if (finalDeals && finalDeals.length > 0) {
        console.log('\n📋 All deals for Salon Alba:');
        finalDeals.forEach((deal, index) => {
          console.log(`  ${index + 1}. ${deal.title} - ${deal.discounted_price} DH (-${deal.discount_percentage}%)`);
        });
      }
    }

    console.log('\n✨ Your app should now be fully populated with deals!');
    console.log('🔄 Refresh your browser to see all the new content.');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkAndInsertDeals();