export const LAUNCH_MODE = {
  enabled: false,
  defaultCity: "Casablanca",
  allowedCities: ["Casablanca"],
  allowedCategories: ["Coiffure", "Onglerie", "Soins du Visage"],
  maxActiveOffersPerBusiness: 2,
  requireFirstOffer: true,
} as const;

export type LaunchModeConfig = typeof LAUNCH_MODE;

export function isLaunchModeActive(): boolean {
  return LAUNCH_MODE.enabled;
}

export function isCategoryAllowed(category: string): boolean {
  if (!LAUNCH_MODE.enabled) return true;
  return LAUNCH_MODE.allowedCategories.includes(category);
}

export function isCityAllowed(city: string): boolean {
  if (!LAUNCH_MODE.enabled) return true;
  return LAUNCH_MODE.allowedCities.includes(city);
}

export function getDefaultCity(): string {
  return LAUNCH_MODE.defaultCity;
}

export function getAllowedCategories(): readonly string[] {
  return LAUNCH_MODE.enabled ? LAUNCH_MODE.allowedCategories : [];
}

export function getMaxActiveOffers(): number {
  return LAUNCH_MODE.maxActiveOffersPerBusiness;
}
