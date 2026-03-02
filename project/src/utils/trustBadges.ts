import { Deal } from '@/types';

export interface TrustBadge {
  id: string;
  label: string;
  color: string;
}

export function getTrustBadges(deal: Deal): TrustBadge[] {
  const badges: TrustBadge[] = [];
  const business = deal.business || deal.businesses;

  if (!business) return badges;

  const rating = business.rating || 0;
  const reviewCount = business.review_count || 0;
  const discount = deal.discount_percentage || 0;

  if (rating >= 4.6 && reviewCount >= 20) {
    badges.push({
      id: 'top_rated',
      label: 'Top rated',
      color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950',
    });
  }

  if (reviewCount >= 50) {
    badges.push({
      id: 'popular',
      label: 'Popular',
      color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
    });
  }

  return badges.slice(0, 2);
}

export function getNextAvailabilityLabel(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour < 18) {
    return 'Today';
  } else {
    return 'Tomorrow';
  }
}
