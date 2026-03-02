import { isLaunchModeActive, getDefaultCity, isCityAllowed } from './launchMode';

export const DEFAULT_CITY = {
  name: 'Casablanca',
  country: 'MA',
  lat: 33.5731,
  lng: -7.5898,
};

export const AVAILABLE_CITIES = [
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416 },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  { name: 'Fès', lat: 34.0181, lng: -5.0078 },
  { name: 'Tanger', lat: 35.7595, lng: -5.8340 },
  { name: 'Agadir', lat: 30.4278, lng: -9.5981 },
];

export const LOCATION_STORAGE_KEY = 'dealio_city';

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

export const getAvailableCities = (): LocationData[] => {
  if (isLaunchModeActive()) {
    return AVAILABLE_CITIES.filter(city => isCityAllowed(city.name));
  }
  return AVAILABLE_CITIES;
};

export const getStoredCity = (): LocationData => {
  if (isLaunchModeActive()) {
    const launchCity = getDefaultCity();
    const cityData = AVAILABLE_CITIES.find(c => c.name === launchCity);
    return cityData || DEFAULT_CITY;
  }

  const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (isCityAllowed(parsed.name)) {
        return parsed;
      }
    } catch {
      return DEFAULT_CITY;
    }
  }
  return DEFAULT_CITY;
};

export const setStoredCity = (city: LocationData): void => {
  if (isLaunchModeActive() && !isCityAllowed(city.name)) {
    return;
  }
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(city));
};
