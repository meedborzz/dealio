export const DISCOUNT_TIERS = [10, 20, 30] as const;

export const QUOTA_BY_DISCOUNT = {
  10: 10,
  20: 25,
  30: 40,
} as const;

export const DEFAULT_OFFER_DAYS = 7;

export type DiscountTier = typeof DISCOUNT_TIERS[number];

export function getQuotaForDiscount(discount: DiscountTier): number {
  return QUOTA_BY_DISCOUNT[discount];
}

export function calculateDiscountedPrice(originalPrice: number, discount: DiscountTier): number {
  return Math.round(originalPrice * (1 - discount / 100));
}

export function getOfferExpiryDate(daysFromNow: number = DEFAULT_OFFER_DAYS): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}
