import { Deal } from '../types';

export const mockDeals = [
  {
    id: 'a1b2c3d4-e5f6-4890-a234-567890abcdef',
    title: 'Coupe + Brushing Femme',
    description: 'Profitez d\'une coupe moderne avec brushing professionnel. Nos stylistes expérimentés vous conseillent pour sublimer votre look.',
    image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 50,
    original_price: 400,
    discounted_price: 200,
    businessName: 'Salon Chic & Style',
    businessAddress: '123 Rue Mohammed V, Casablanca',
    city: 'Casablanca',
    category: 'Hair',
    valid_until: '2024-02-15',
    duration_minutes: 60,
    coordinates: { lat: 33.5731, lng: -7.5898 },
    rating: 4.8,
    review_count: 124,
    business: {
      name: 'Salon Chic & Style',
      address: '123 Rue Mohammed V, Casablanca',
      city: 'Casablanca',
      rating: 4.8,
      review_count: 124
    }
  },
  {
    id: 'b2c3d4e5-f6a7-4901-b345-678901bcdef0',
    title: 'Hammam Traditionnel + Gommage',
    description: 'Détendez-vous avec notre hammam traditionnel marocain suivi d\'un gommage au savon noir. Une expérience authentique et relaxante.',
    image_url: 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 30,
    original_price: 250,
    discounted_price: 175,
    businessName: 'Hammam Atlas',
    businessAddress: '45 Boulevard Ziraoui, Casablanca',
    city: 'Casablanca',
    category: 'Hammam',
    valid_until: '2024-02-20',
    duration_minutes: 90,
    coordinates: { lat: 33.5892, lng: -7.6261 },
    rating: 4.6,
    review_count: 89,
    business: {
      name: 'Hammam Atlas',
      address: '45 Boulevard Ziraoui, Casablanca',
      city: 'Casablanca',
      rating: 4.6,
      review_count: 89
    }
  },
  {
    id: 'c3d4e5f6-a7b8-4012-c456-789012cdef01',
    title: 'Massage Relaxant 60min',
    description: 'Massage complet du corps aux huiles essentielles d\'argan pour une relaxation totale. Idéal pour évacuer le stress.',
    image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 40,
    original_price: 350,
    discounted_price: 210,
    businessName: 'Spa Serenity',
    businessAddress: '78 Rue Allal Ben Abdellah, Rabat',
    city: 'Rabat',
    category: 'Massage',
    valid_until: '2024-02-25',
    duration_minutes: 60,
    coordinates: { lat: 34.0209, lng: -6.8416 },
    rating: 4.9,
    review_count: 156,
    business: {
      name: 'Spa Serenity',
      address: '78 Rue Allal Ben Abdellah, Rabat',
      city: 'Rabat',
      rating: 4.9,
      review_count: 156
    }
  },
  {
    id: 'd4e5f6a7-b8c9-4123-d567-890123def012',
    title: 'Manucure + Pose Vernis Semi-Permanent',
    description: 'Manucure complète avec pose de vernis semi-permanent longue tenue. Large choix de couleurs tendance.',
    image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 25,
    original_price: 200,
    discounted_price: 150,
    businessName: 'Nail Art Studio',
    businessAddress: '12 Avenue Hassan II, Marrakech',
    city: 'Marrakech',
    category: 'Nails',
    valid_until: '2024-02-18',
    duration_minutes: 90,
    coordinates: { lat: 31.6295, lng: -7.9811 },
    rating: 4.7,
    review_count: 92,
    business: {
      name: 'Nail Art Studio',
      address: '12 Avenue Hassan II, Marrakech',
      city: 'Marrakech',
      rating: 4.7,
      review_count: 92
    }
  },
  {
    id: 'e5f6a7b8-c9d0-4234-e678-901234ef0123',
    title: 'Coupe Homme + Barbe',
    description: 'Coupe moderne avec taille et entretien de barbe. Service professionnel dans une ambiance conviviale.',
    image_url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 35,
    original_price: 150,
    discounted_price: 98,
    businessName: 'Barbershop Royal',
    businessAddress: '34 Rue de la Liberté, Casablanca',
    city: 'Casablanca',
    category: 'Barbershop',
    valid_until: '2024-02-22',
    duration_minutes: 45,
    coordinates: { lat: 33.5731, lng: -7.5898 },
    rating: 4.5,
    review_count: 67,
    business: {
      name: 'Barbershop Royal',
      address: '34 Rue de la Liberté, Casablanca',
      city: 'Casablanca',
      rating: 4.5,
      review_count: 67
    }
  },
  {
    id: 'f6a7b8c9-d0e1-4345-f789-012345f01234',
    title: 'Soin Visage Anti-Âge',
    description: 'Soin complet anti-âge avec nettoyage, gommage, masque et hydratation. Produits haut de gamme.',
    image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 45,
    original_price: 500,
    discounted_price: 275,
    businessName: 'Clinique Esthétique Moderne',
    businessAddress: '89 Boulevard Mohammed VI, Rabat',
    city: 'Rabat',
    category: 'Aesthetic Clinic',
    valid_until: '2024-02-28',
    duration_minutes: 90,
    coordinates: { lat: 34.0209, lng: -6.8416 },
    rating: 4.8,
    review_count: 134,
    business: {
      name: 'Clinique Esthétique Moderne',
      address: '89 Boulevard Mohammed VI, Rabat',
      city: 'Rabat',
      rating: 4.8,
      review_count: 134
    }
  },
  {
    id: 'a7b8c9d0-e1f2-4456-a890-123456012345',
    title: 'Coloration + Coupe Femme',
    description: 'Coloration professionnelle avec coupe et coiffage. Conseils personnalisés pour votre style.',
    image_url: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 40,
    original_price: 600,
    discounted_price: 360,
    businessName: 'Color Studio',
    businessAddress: '56 Avenue des FAR, Casablanca',
    city: 'Casablanca',
    category: 'Hair',
    valid_until: '2024-02-16',
    duration_minutes: 120,
    coordinates: { lat: 33.5731, lng: -7.5898 },
    rating: 4.6,
    review_count: 78,
    business: {
      name: 'Color Studio',
      address: '56 Avenue des FAR, Casablanca',
      city: 'Casablanca',
      rating: 4.6,
      review_count: 78
    }
  },
  {
    id: 'b8c9d0e1-f2a3-4567-b901-234567123456',
    title: 'Pédicure Complète',
    description: 'Pédicure avec gommage, soins des ongles et pose de vernis. Relaxation et beauté des pieds.',
    image_url: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 30,
    original_price: 180,
    discounted_price: 126,
    businessName: 'Beauty Lounge',
    businessAddress: '23 Rue Ibnou Sina, Marrakech',
    city: 'Marrakech',
    category: 'Nails',
    valid_until: '2024-02-24',
    duration_minutes: 75,
    coordinates: { lat: 31.6295, lng: -7.9811 },
    rating: 4.4,
    review_count: 45,
    business: {
      name: 'Beauty Lounge',
      address: '23 Rue Ibnou Sina, Marrakech',
      city: 'Marrakech',
      rating: 4.4,
      review_count: 45
    }
  },
  {
    id: 'c9d0e1f2-a3b4-4678-c012-345678234567',
    title: 'Épilation Laser Jambes',
    description: 'Épilation définitive au laser dernière génération. Résultats durables et peau douce.',
    image_url: 'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 60,
    original_price: 800,
    discounted_price: 320,
    businessName: 'Laser Beauty Center',
    businessAddress: '91 Avenue Mohammed VI',
    city: 'Rabat',
    category: 'Épilation',
    valid_until: '2024-03-30',
    duration_minutes: 45,
    coordinates: { lat: 34.0209, lng: -6.8416 },
    rating: 4.7,
    review_count: 98,
    business: {
      name: 'Laser Beauty Center',
      address: '91 Avenue Mohammed VI',
      city: 'Rabat',
      rating: 4.7,
      review_count: 98
    }
  },
  {
    id: 'd0e1f2a3-b4c5-4789-d123-456789345678',
    title: 'Maquillage Professionnel',
    description: 'Maquillage pour événements spéciaux par des professionnels certifiés.',
    image_url: 'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 45,
    original_price: 400,
    discounted_price: 220,
    businessName: 'Makeup Studio Pro',
    businessAddress: '28 Rue Prince Héritier',
    city: 'Casablanca',
    category: 'Maquillage',
    valid_until: '2024-04-05',
    duration_minutes: 90,
    coordinates: { lat: 33.5731, lng: -7.5898 },
    rating: 4.8,
    review_count: 76,
    business: {
      name: 'Makeup Studio Pro',
      address: '28 Rue Prince Héritier',
      city: 'Casablanca',
      rating: 4.8,
      review_count: 76
    }
  },
  {
    id: 'e1f2a3b4-c5d6-4890-e234-567890456789',
    title: 'Cours de Yoga Privé',
    description: 'Séance de yoga personnalisée avec instructeur certifié dans un cadre zen.',
    image_url: 'https://images.pexels.com/photos/1552243/pexels-photo-1552243.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 35,
    original_price: 300,
    discounted_price: 195,
    businessName: 'Zen Yoga Studio',
    businessAddress: '15 Boulevard Anfa',
    city: 'Casablanca',
    category: 'Fitness',
    valid_until: '2024-03-25',
    duration_minutes: 75,
    coordinates: { lat: 33.5731, lng: -7.5898 },
    rating: 4.9,
    review_count: 134,
    business: {
      name: 'Zen Yoga Studio',
      address: '15 Boulevard Anfa',
      city: 'Casablanca',
      rating: 4.9,
      review_count: 134
    }
  },
  {
    id: 'f2a3b4c5-d6e7-4901-f345-678901567890',
    title: 'Tatouage Artistique',
    description: 'Création de tatouages personnalisés par des artistes expérimentés.',
    image_url: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800',
    discount_percentage: 25,
    original_price: 600,
    discounted_price: 450,
    businessName: 'Ink Art Studio',
    businessAddress: '67 Rue de la Liberté',
    city: 'Marrakech',
    category: 'Tatouage',
    valid_until: '2024-04-10',
    duration_minutes: 120,
    coordinates: { lat: 31.6295, lng: -7.9811 },
    rating: 4.6,
    review_count: 89,
    business: {
      name: 'Ink Art Studio',
      address: '67 Rue de la Liberté',
      city: 'Marrakech',
      rating: 4.6,
      review_count: 89
    }
  }
];

export const categories = [
  { 
    id: 'Coiffure', 
    name: 'Coiffure',
    icon: 'Scissors',
    color: 'bg-pink-100'
  },
  { 
    id: 'Ongles', 
    name: 'Ongles',
    icon: 'Hand',
    color: 'bg-purple-100'
  },
  { 
    id: 'Massage', 
    name: 'Massage',
    icon: 'Waves',
    color: 'bg-green-100'
  },
  { 
    id: 'Spa', 
    name: 'Spa',
    icon: 'Bath',
    color: 'bg-blue-100'
  },
  { 
    id: 'Esthetique', 
    name: 'Esthétique',
    icon: 'Sparkles',
    color: 'bg-yellow-100'
  },
  { 
    id: 'Manucure', 
    name: 'Manucure',
    icon: 'Hand',
    color: 'bg-purple-100'
  },
  { 
    id: 'Barbier', 
    name: 'Barbier',
    icon: 'Scissors',
    color: 'bg-teal-100'
  }
];

// Additional categories for comprehensive coverage
export const allCategories = [
  ...categories,
  { 
    id: 'Epilation', 
    name: 'Épilation',
    icon: 'Zap',
    color: 'bg-red-100'
  },
  { 
    id: 'Maquillage', 
    name: 'Maquillage',
    icon: 'Palette',
    color: 'bg-rose-100'
  },
  { 
    id: 'Fitness', 
    name: 'Fitness',
    icon: 'Dumbbell',
    color: 'bg-amber-100'
  },
  { 
    id: 'Tatouage', 
    name: 'Tatouage',
    icon: 'Paintbrush',
    color: 'bg-gray-100'
  },
  { 
    id: 'Sourcils', 
    name: 'Sourcils & Cils',
    icon: 'Eye',
    color: 'bg-indigo-100'
  },
  { 
    id: 'Soins', 
    name: 'Soins du Corps',
    icon: 'Droplets',
    color: 'bg-teal-100'
  }
];

export const cities = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Salé',
  'Meknès'
];