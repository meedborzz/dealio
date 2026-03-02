export interface ServicePreset {
  id: string;
  name: string;
  category: string;
}

export interface CategoryPreset {
  id: string;
  name: string;
  services: ServicePreset[];
}

export const SERVICE_CATEGORIES: CategoryPreset[] = [
  {
    id: 'Coiffure',
    name: 'Coiffure',
    services: [
      { id: 'coupe_femme', name: 'Coupe femme', category: 'Coiffure' },
      { id: 'coupe_homme', name: 'Coupe homme', category: 'Coiffure' },
      { id: 'coupe_enfant', name: 'Coupe enfant', category: 'Coiffure' },
      { id: 'brushing_classique', name: 'Brushing classique', category: 'Coiffure' },
      { id: 'brushing_travaille', name: 'Brushing travaillé', category: 'Coiffure' },
      { id: 'coiffage_evenementiel', name: 'Coiffage événementiel', category: 'Coiffure' },
      { id: 'coloration_classique', name: 'Coloration classique', category: 'Coiffure' },
      { id: 'coloration_sans_ammoniaque', name: 'Coloration sans ammoniaque', category: 'Coiffure' },
      { id: 'meches', name: 'Mèches', category: 'Coiffure' },
      { id: 'balayage', name: 'Balayage', category: 'Coiffure' },
      { id: 'ombre_hair', name: 'Ombré hair', category: 'Coiffure' },
      { id: 'patine_gloss', name: 'Patine & gloss', category: 'Coiffure' },
      { id: 'lissage_keratine', name: 'Lissage kératine', category: 'Coiffure' },
      { id: 'lissage_bresilien', name: 'Lissage brésilien', category: 'Coiffure' },
      { id: 'lissage_indien', name: 'Lissage indien', category: 'Coiffure' },
      { id: 'lissage_japonais', name: 'Lissage japonais', category: 'Coiffure' },
      { id: 'botox_capillaire', name: 'Botox capillaire', category: 'Coiffure' },
      { id: 'soin_reconstructeur', name: 'Soin reconstructeur', category: 'Coiffure' },
      { id: 'soin_cuir_chevelu', name: 'Soin cuir chevelu', category: 'Coiffure' },
      { id: 'permanente', name: 'Permanente', category: 'Coiffure' },
      { id: 'coiffure_mariee', name: 'Coiffure mariée (essai + jour J)', category: 'Coiffure' },
      { id: 'extensions_capillaires', name: 'Extensions capillaires', category: 'Coiffure' },
    ],
  },
  {
    id: 'Soins du Visage',
    name: 'Soins du Visage',
    services: [
      { id: 'diagnostic_peau', name: 'Diagnostic de peau', category: 'Soins du Visage' },
      { id: 'nettoyage_peau_profond', name: 'Nettoyage de peau profond', category: 'Soins du Visage' },
      { id: 'soin_hydratant', name: 'Soin hydratant', category: 'Soins du Visage' },
      { id: 'soin_purifiant', name: 'Soin purifiant', category: 'Soins du Visage' },
      { id: 'soin_apaisant', name: 'Soin apaisant', category: 'Soins du Visage' },
      { id: 'soin_anti_age', name: 'Soin anti-âge', category: 'Soins du Visage' },
      { id: 'soin_anti_taches', name: 'Soin anti-taches', category: 'Soins du Visage' },
      { id: 'soin_eclat', name: 'Soin éclat', category: 'Soins du Visage' },
      { id: 'soin_contour_yeux', name: 'Soin contour des yeux', category: 'Soins du Visage' },
      { id: 'peeling_doux', name: 'Peeling doux', category: 'Soins du Visage' },
      { id: 'exfoliation', name: 'Exfoliation', category: 'Soins du Visage' },
      { id: 'masque_professionnel', name: 'Masque professionnel', category: 'Soins du Visage' },
      { id: 'radiofrequence_visage', name: 'Radiofréquence visage', category: 'Soins du Visage' },
      { id: 'microneedling', name: 'Microneedling', category: 'Soins du Visage' },
    ],
  },
  {
    id: 'Onglerie',
    name: 'Onglerie',
    services: [
      { id: 'manucure_simple', name: 'Manucure simple', category: 'Onglerie' },
      { id: 'manucure_spa', name: 'Manucure spa', category: 'Onglerie' },
      { id: 'pedicure_simple', name: 'Pédicure simple', category: 'Onglerie' },
      { id: 'pedicure_spa', name: 'Pédicure spa', category: 'Onglerie' },
      { id: 'vernis_classique', name: 'Vernis classique', category: 'Onglerie' },
      { id: 'vernis_semi_permanent_mains', name: 'Vernis semi-permanent mains', category: 'Onglerie' },
      { id: 'vernis_semi_permanent_pieds', name: 'Vernis semi-permanent pieds', category: 'Onglerie' },
      { id: 'pose_gel', name: 'Pose gel', category: 'Onglerie' },
      { id: 'pose_resine', name: 'Pose résine', category: 'Onglerie' },
      { id: 'pose_acrygel', name: 'Pose acrygel', category: 'Onglerie' },
      { id: 'remplissage', name: 'Remplissage', category: 'Onglerie' },
      { id: 'depose', name: 'Dépose', category: 'Onglerie' },
      { id: 'nail_art', name: 'Nail art personnalisé', category: 'Onglerie' },
      { id: 'french', name: 'French', category: 'Onglerie' },
      { id: 'baby_boomer', name: 'Baby boomer', category: 'Onglerie' },
      { id: 'soin_fortifiant_ongles', name: 'Soin fortifiant ongles', category: 'Onglerie' },
    ],
  },
  {
    id: 'Spa & Corps',
    name: 'Spa & Corps',
    services: [
      { id: 'massage_relaxant', name: 'Massage relaxant', category: 'Spa & Corps' },
      { id: 'massage_tonifiant', name: 'Massage tonifiant', category: 'Spa & Corps' },
      { id: 'massage_pierres_chaudes', name: 'Massage aux pierres chaudes', category: 'Spa & Corps' },
      { id: 'massage_drainant', name: 'Massage drainant lymphatique', category: 'Spa & Corps' },
      { id: 'massage_amincissant', name: 'Massage amincissant', category: 'Spa & Corps' },
      { id: 'massage_prenatal', name: 'Massage prénatal', category: 'Spa & Corps' },
      { id: 'hammam_beldi', name: 'Hammam beldi traditionnel', category: 'Spa & Corps' },
      { id: 'gommage_corps', name: 'Gommage corps', category: 'Spa & Corps' },
      { id: 'enveloppement_corps', name: 'Enveloppement corps', category: 'Spa & Corps' },
      { id: 'soin_dos_purifiant', name: 'Soin dos purifiant', category: 'Spa & Corps' },
    ],
  },
  {
    id: 'Esthetique & Regard',
    name: 'Esthétique & Regard',
    services: [
      { id: 'epilation_cire_tiede', name: 'Épilation cire tiède', category: 'Esthetique & Regard' },
      { id: 'epilation_cire_orientale', name: 'Épilation cire orientale', category: 'Esthetique & Regard' },
      { id: 'epilation_visage', name: 'Épilation visage complète', category: 'Esthetique & Regard' },
      { id: 'restructuration_sourcils', name: 'Restructuration sourcils', category: 'Esthetique & Regard' },
      { id: 'epilation_sourcils', name: 'Épilation sourcils', category: 'Esthetique & Regard' },
      { id: 'teinture_sourcils', name: 'Teinture sourcils', category: 'Esthetique & Regard' },
      { id: 'teinture_cils', name: 'Teinture cils', category: 'Esthetique & Regard' },
      { id: 'brow_lift', name: 'Brow lift', category: 'Esthetique & Regard' },
      { id: 'rehaussement_cils', name: 'Rehaussement de cils', category: 'Esthetique & Regard' },
      { id: 'extension_cils_classique', name: 'Extension de cils classique', category: 'Esthetique & Regard' },
      { id: 'extension_cils_volume', name: 'Extension de cils volume', category: 'Esthetique & Regard' },
      { id: 'extension_cils_mixte', name: 'Extension de cils mixte', category: 'Esthetique & Regard' },
      { id: 'soin_keratine_cils', name: 'Soin kératine cils', category: 'Esthetique & Regard' },
    ],
  },
  {
    id: 'Maquillage',
    name: 'Maquillage',
    services: [
      { id: 'maquillage_jour', name: 'Maquillage jour', category: 'Maquillage' },
      { id: 'maquillage_soiree', name: 'Maquillage soirée', category: 'Maquillage' },
      { id: 'maquillage_mariee', name: 'Maquillage mariée (essai + jour J)', category: 'Maquillage' },
      { id: 'maquillage_evenementiel', name: 'Maquillage événementiel', category: 'Maquillage' },
      { id: 'maquillage_artistique', name: 'Maquillage artistique', category: 'Maquillage' },
      { id: 'maquillage_invitees', name: 'Maquillage invitées', category: 'Maquillage' },
    ],
  },
  {
    id: 'Bien-être & Minceur',
    name: 'Bien-être & Minceur',
    services: [
      { id: 'drainage_lymphatique', name: 'Drainage lymphatique', category: 'Bien-être & Minceur' },
      { id: 'soins_amincissants', name: 'Soins amincissants localisés', category: 'Bien-être & Minceur' },
      { id: 'pressotherapie', name: 'Pressothérapie', category: 'Bien-être & Minceur' },
      { id: 'maderotherapie', name: 'Madérothérapie', category: 'Bien-être & Minceur' },
      { id: 'soins_anti_cellulite', name: 'Soins anti-cellulite', category: 'Bien-être & Minceur' },
      { id: 'rituel_detente', name: 'Rituel détente corps & esprit', category: 'Bien-être & Minceur' },
    ],
  },
  {
    id: 'Forfaits Spéciaux',
    name: 'Forfaits Spéciaux',
    services: [
      { id: 'forfait_mariee', name: 'Forfait mariée', category: 'Forfaits Spéciaux' },
      { id: 'forfait_future_maman', name: 'Forfait future maman', category: 'Forfaits Spéciaux' },
      { id: 'forfait_detente_spa', name: 'Forfait détente spa', category: 'Forfaits Spéciaux' },
      { id: 'forfait_beaute_express', name: 'Forfait beauté express', category: 'Forfaits Spéciaux' },
      { id: 'journee_bien_etre', name: 'Journée bien-être', category: 'Forfaits Spéciaux' },
    ],
  },
];

export const DISCOUNT_OPTIONS = [
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
  { value: 30, label: '30%' },
];

export function generateOfferTitle(serviceNames: string[], discountPercent: number): string {
  if (serviceNames.length === 0) return '';

  if (serviceNames.length === 1) {
    return `${serviceNames[0]} –${discountPercent}%`;
  }

  if (serviceNames.length === 2) {
    return `${serviceNames[0]} + ${serviceNames[1]} –${discountPercent}%`;
  }

  return `${serviceNames[0]} + ${serviceNames.length - 1} autres –${discountPercent}%`;
}

export function getServicesByCategory(categoryId: string): ServicePreset[] {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.services || [];
}

export function getCategoryName(categoryId: string): string {
  const category = SERVICE_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.name || categoryId;
}

export function getServiceName(serviceId: string): string {
  for (const category of SERVICE_CATEGORIES) {
    const service = category.services.find(s => s.id === serviceId);
    if (service) return service.name;
  }
  return serviceId;
}

import { isLaunchModeActive, getAllowedCategories } from './launchMode';

export const LAUNCH_CATEGORIES: CategoryPreset[] = SERVICE_CATEGORIES.filter(cat =>
  cat.id === 'Coiffure' || cat.id === 'Onglerie' || cat.id === 'Soins du Visage'
);

export function getAvailableCategories(): CategoryPreset[] {
  if (!isLaunchModeActive()) {
    return SERVICE_CATEGORIES;
  }
  const allowed = getAllowedCategories();
  return SERVICE_CATEGORIES.filter(cat => allowed.includes(cat.id));
}

export function validateCategory(categoryId: string): boolean {
  const available = getAvailableCategories();
  return available.some(cat => cat.id === categoryId);
}

export function validateService(serviceId: string, categoryId: string): boolean {
  const services = getServicesByCategory(categoryId);
  return services.some(s => s.id === serviceId);
}

export function getAllServiceIds(categoryId: string): string[] {
  const services = getServicesByCategory(categoryId);
  return services.map(s => s.id);
}
