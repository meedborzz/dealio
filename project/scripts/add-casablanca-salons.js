import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const OWNER_ID = '14961e21-7c51-46d4-9832-fbe12aa8b3f9';

const businesses = [
  {
    name: 'Salon Alba',
    category: 'Ongles',
    description: 'Salon professionnel de soins des ongles et nail art premium à Casablanca',
    address: '45 Bd Zerktouni, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-234567',
    email: 'contact@salonalba.ma',
    coordinates: { lat: 33.5731, lng: -7.6298 },
    status: 'approved',
    id: 'a6cd0312-b90e-403f-bb86-37994d197e88'
  },
  {
    name: 'Coiffure Royale',
    category: 'Coiffure',
    description: 'Salon de coiffure haut de gamme pour hommes et femmes au coeur de Casablanca',
    address: '78 Rue Mohammed V, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-456789',
    email: 'info@coiffureroyale.ma',
    coordinates: { lat: 33.5892, lng: -7.6114 },
    status: 'approved'
  },
  {
    name: 'Barber Shop Anfa',
    category: 'Barbier',
    description: 'Barbershop moderne offrant des coupes traditionnelles et contemporaines',
    address: '12 Boulevard d\'Anfa, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-789012',
    email: 'contact@barbershopanfa.ma',
    coordinates: { lat: 33.5883, lng: -7.6339 },
    status: 'approved'
  },
  {
    name: 'Spa & Wellness Maarif',
    category: 'Spa',
    description: 'Spa luxueux proposant hammam, massages et soins du corps',
    address: '156 Rue Abou Hanifa, Maarif, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-345678',
    email: 'reservation@spawellnessmaarif.ma',
    coordinates: { lat: 33.5764, lng: -7.6403 },
    status: 'approved'
  },
  {
    name: 'Zenith Massage Center',
    category: 'Massage',
    description: 'Centre spécialisé en massages thérapeutiques et relaxants',
    address: '89 Rue de Fès, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-567890',
    email: 'info@zenithmassage.ma',
    coordinates: { lat: 33.5958, lng: -7.6201 },
    status: 'approved'
  },
  {
    name: 'Institut Beauté Prestigia',
    category: 'Esthetique',
    description: 'Institut de beauté offrant soins du visage, épilation et maquillage',
    address: '234 Boulevard Moulay Youssef, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-678901',
    email: 'contact@beauteprestigia.ma',
    coordinates: { lat: 33.5889, lng: -7.6267 },
    status: 'approved'
  },
  {
    name: 'Epilation & Soins Casa',
    category: 'Epilation',
    description: 'Salon spécialisé en épilation définitive et traditionnelle',
    address: '67 Rue Allal Ben Abdallah, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-890123',
    email: 'info@epilationcasa.ma',
    coordinates: { lat: 33.5912, lng: -7.6156 },
    status: 'approved'
  },
  {
    name: 'Nails & Beauty Corniche',
    category: 'Manucure',
    description: 'Salon de manucure et pédicure moderne avec vue sur la mer',
    address: '45 Corniche Ain Diab, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-901234',
    email: 'contact@nailscorniche.ma',
    coordinates: { lat: 33.5786, lng: -7.6547 },
    status: 'approved'
  },
  {
    name: 'FitZone Casablanca',
    category: 'Fitness',
    description: 'Salle de sport moderne avec équipements professionnels et coaching',
    address: '123 Boulevard d\'Anfa, Casablanca',
    city: 'Casablanca',
    phone: '+212 522-012345',
    email: 'info@fitzonecasa.ma',
    coordinates: { lat: 33.5894, lng: -7.6398 },
    status: 'approved'
  }
];

const deals = [
  {
    title: 'Manucure + Pose Vernis Semi-Permanent',
    description: 'Manucure complète avec pose de vernis semi-permanent longue tenue, large choix de couleurs',
    category: 'Ongles',
    original_price: 250,
    discounted_price: 150,
    discount_percentage: 40,
    duration_minutes: 60,
    booking_quota_total: 50,
    booking_quota_remaining: 50
  },
  {
    title: 'Pédicure Spa Luxe',
    description: 'Pédicure spa avec bain relaxant, gommage, massage et vernis au choix',
    category: 'Ongles',
    original_price: 180,
    discounted_price: 99,
    discount_percentage: 45,
    duration_minutes: 75,
    booking_quota_total: 40,
    booking_quota_remaining: 40
  },
  {
    title: 'Coupe + Brushing Femme',
    description: 'Coupe personnalisée selon votre style avec brushing professionnel',
    category: 'Coiffure',
    original_price: 300,
    discounted_price: 180,
    discount_percentage: 40,
    duration_minutes: 90,
    booking_quota_total: 60,
    booking_quota_remaining: 60
  },
  {
    title: 'Coloration + Mèches',
    description: 'Coloration complète ou mèches avec produits professionnels premium',
    category: 'Coiffure',
    original_price: 800,
    discounted_price: 500,
    discount_percentage: 38,
    duration_minutes: 180,
    booking_quota_total: 30,
    booking_quota_remaining: 30
  },
  {
    title: 'Coupe Classique Homme',
    description: 'Coupe homme classique avec finitions et styling',
    category: 'Barbier',
    original_price: 150,
    discounted_price: 89,
    discount_percentage: 41,
    duration_minutes: 45,
    booking_quota_total: 80,
    booking_quota_remaining: 80
  },
  {
    title: 'Rasage Traditional + Soin Barbe',
    description: 'Rasage traditionnel au coupe-chou avec serviette chaude et soin barbe complet',
    category: 'Barbier',
    original_price: 200,
    discounted_price: 120,
    discount_percentage: 40,
    duration_minutes: 60,
    booking_quota_total: 50,
    booking_quota_remaining: 50
  },
  {
    title: 'Hammam + Gommage Oriental',
    description: 'Séance de hammam traditionnelle avec gommage au savon noir',
    category: 'Spa',
    original_price: 400,
    discounted_price: 220,
    discount_percentage: 45,
    duration_minutes: 90,
    booking_quota_total: 40,
    booking_quota_remaining: 40
  },
  {
    title: 'Spa Jour Complet',
    description: 'Journée spa complète: hammam, gommage, enveloppement et massage',
    category: 'Spa',
    original_price: 1200,
    discounted_price: 700,
    discount_percentage: 42,
    duration_minutes: 240,
    booking_quota_total: 20,
    booking_quota_remaining: 20
  },
  {
    title: 'Massage Relaxant 60min',
    description: 'Massage corps complet aux huiles essentielles pour détente totale',
    category: 'Massage',
    original_price: 450,
    discounted_price: 270,
    discount_percentage: 40,
    duration_minutes: 60,
    booking_quota_total: 50,
    booking_quota_remaining: 50
  },
  {
    title: 'Massage Pierres Chaudes',
    description: 'Massage thérapeutique aux pierres volcaniques chaudes',
    category: 'Massage',
    original_price: 550,
    discounted_price: 350,
    discount_percentage: 36,
    duration_minutes: 90,
    booking_quota_total: 35,
    booking_quota_remaining: 35
  },
  {
    title: 'Soin Visage Anti-Âge',
    description: 'Soin du visage complet avec produits anti-âge et massage facial',
    category: 'Esthetique',
    original_price: 500,
    discounted_price: 300,
    discount_percentage: 40,
    duration_minutes: 75,
    booking_quota_total: 45,
    booking_quota_remaining: 45
  },
  {
    title: 'Nettoyage de Peau Profond',
    description: 'Nettoyage en profondeur avec extraction, masque et hydratation',
    category: 'Esthetique',
    original_price: 350,
    discounted_price: 199,
    discount_percentage: 43,
    duration_minutes: 60,
    booking_quota_total: 50,
    booking_quota_remaining: 50
  },
  {
    title: 'Épilation Complète Femme',
    description: 'Épilation complète du corps à la cire orientale',
    category: 'Epilation',
    original_price: 600,
    discounted_price: 350,
    discount_percentage: 42,
    duration_minutes: 90,
    booking_quota_total: 40,
    booking_quota_remaining: 40
  },
  {
    title: 'Épilation Laser - 3 Séances',
    description: 'Package de 3 séances d\'épilation laser définitive zone au choix',
    category: 'Epilation',
    original_price: 1500,
    discounted_price: 999,
    discount_percentage: 33,
    duration_minutes: 45,
    booking_quota_total: 25,
    booking_quota_remaining: 25
  },
  {
    title: 'Manucure Express + Vernis',
    description: 'Manucure rapide avec lime, soin des cuticules et vernis classique',
    category: 'Manucure',
    original_price: 120,
    discounted_price: 70,
    discount_percentage: 42,
    duration_minutes: 30,
    booking_quota_total: 70,
    booking_quota_remaining: 70
  },
  {
    title: 'Nail Art Design Premium',
    description: 'Création de nail art personnalisé avec strass et décorations',
    category: 'Manucure',
    original_price: 400,
    discounted_price: 250,
    discount_percentage: 38,
    duration_minutes: 90,
    booking_quota_total: 30,
    booking_quota_remaining: 30
  },
  {
    title: 'Abonnement 3 Mois Fitness',
    description: 'Accès illimité salle de sport + 2 séances coaching incluses',
    category: 'Fitness',
    original_price: 2400,
    discounted_price: 1500,
    discount_percentage: 38,
    duration_minutes: 60,
    booking_quota_total: 50,
    booking_quota_remaining: 50
  },
  {
    title: 'Séance Personal Training',
    description: 'Session individuelle avec coach sportif certifié',
    category: 'Fitness',
    original_price: 350,
    discounted_price: 200,
    discount_percentage: 43,
    duration_minutes: 60,
    booking_quota_total: 60,
    booking_quota_remaining: 60
  }
];

async function insertData() {
  console.log('Starting data insertion...');

  for (const business of businesses) {
    const existingBusiness = business.id === 'a6cd0312-b90e-403f-bb86-37994d197e88';

    if (!existingBusiness) {
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          ...business,
          owner_id: OWNER_ID
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating business ${business.name}:`, error);
        continue;
      }

      console.log(`✓ Created business: ${business.name}`);
      business.id = data.id;
    } else {
      console.log(`✓ Using existing business: ${business.name}`);
    }
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 60);

  for (const deal of deals) {
    const business = businesses.find(b => b.category === deal.category);

    if (!business) {
      console.error(`No business found for category ${deal.category}`);
      continue;
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...deal,
        business_id: business.id,
        valid_until: validUntil.toISOString().split('T')[0],
        is_active: true,
        booking_enabled: true,
        quota_enabled: true,
        deal_type: 'standard'
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating deal ${deal.title}:`, error);
      continue;
    }

    console.log(`✓ Created deal: ${deal.title} for ${business.name}`);

    const slots = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];

      for (let hour = 9; hour < 18; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00:00`;
        const endHour = hour + Math.floor(deal.duration_minutes / 60);
        const endMinutes = deal.duration_minutes % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;

        slots.push({
          deal_id: data.id,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          available_spots: 1,
          is_available: true
        });
      }
    }

    if (slots.length > 0) {
      const { error: slotsError } = await supabase
        .from('time_slots')
        .insert(slots);

      if (slotsError) {
        console.error(`Error creating time slots for ${deal.title}:`, slotsError);
      } else {
        console.log(`  ✓ Created ${slots.length} time slots`);
      }
    }
  }

  console.log('\nData insertion completed!');
  console.log(`Total businesses: ${businesses.length}`);
  console.log(`Total deals: ${deals.length}`);
}

insertData().catch(console.error);
