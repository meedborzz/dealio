export type UserType = 'personal' | 'business';

export interface UserPreferences {
  language: 'ar' | 'fr' | 'en';
  theme: 'system' | 'light' | 'dark';
  categories: string[];
  location: {
    enabled: boolean;
    city?: string;
    lat?: number;
    lng?: number;
  };
  notifications: {
    enabled: boolean;
  };
  setupCompleted: boolean;
  setupStep: number;
  installPromptDismissed: boolean;
  userType?: UserType;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'fr',
  theme: 'system',
  categories: [],
  location: {
    enabled: false,
  },
  notifications: {
    enabled: false,
  },
  setupCompleted: false,
  setupStep: 0,
  installPromptDismissed: false,
};

const STORAGE_KEY = 'dealio-preferences';

export const getPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
  return DEFAULT_PREFERENCES;
};

export const savePreferences = (preferences: Partial<UserPreferences>): UserPreferences => {
  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return getPreferences();
  }
};

export const resetPreferences = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting preferences:', error);
  }
};

export const AVAILABLE_CATEGORIES = [
  { id: 'nails', label: 'Nails', icon: 'Hand' },
  { id: 'hair', label: 'Hair', icon: 'Scissors' },
  { id: 'barber', label: 'Barber', icon: 'Scissors' },
  { id: 'spa', label: 'Spa', icon: 'Sparkles' },
  { id: 'massage', label: 'Massage', icon: 'Heart' },
  { id: 'skincare', label: 'Skincare', icon: 'Droplets' },
  { id: 'makeup', label: 'Makeup', icon: 'Palette' },
  { id: 'brows_lashes', label: 'Brows & Lashes', icon: 'Eye' },
  { id: 'laser', label: 'Laser', icon: 'Zap' },
  { id: 'fitness', label: 'Fitness', icon: 'Dumbbell' },
];

export const AVAILABLE_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
];
