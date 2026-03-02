import { useBusinessContext } from '../contexts/BusinessContext';

type BizLite = {
  id: string;
  name: string;
  status: string;
  commission_rate?: number;
  total_commission_owed?: number;
  total_validated_bookings?: number;
  rating: number;
  review_count: number;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: string;
  created_at: string;
};

/**
 * @deprecated Use useBusinessContext instead. This hook now delegates to BusinessContext.
 *
 * This hook is maintained for backward compatibility but delegates to BusinessContext
 * to prevent duplicate business fetches. Please migrate to useBusinessContext directly.
 */
export function useCurrentBusiness() {
  const { business, loading, error } = useBusinessContext();

  // Map BusinessContext data to the legacy BizLite format
  const biz: BizLite | null = business ? {
    id: business.id,
    name: business.name,
    status: business.status,
    rating: business.rating,
    review_count: business.review_count,
    description: business.description || null,
    address: business.address,
    city: business.city,
    phone: business.phone || null,
    email: business.email || null,
    website: business.website || null,
    category: business.category,
    created_at: business.created_at,
  } : null;

  return { biz, loading, err: error } as const;
}