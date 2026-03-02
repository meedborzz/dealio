import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Deal, SearchFilters } from '../shared/types/contracts';
import { useMemo } from 'react';

const CACHE_KEY_PREFIX = 'dealio-deals-cache';
const CACHE_DURATION = 2 * 60 * 1000;
const MAX_CACHE_ENTRIES = 3;

interface CachedData {
  data: Deal[];
  timestamp: number;
  filters: string;
}

const clearOldCacheEntries = () => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
    if (keys.length > MAX_CACHE_ENTRIES) {
      const entries = keys.map(key => {
        try {
          const item = localStorage.getItem(key);
          const parsed = item ? JSON.parse(item) : null;
          return { key, timestamp: parsed?.timestamp || 0 };
        } catch { return { key, timestamp: 0 }; }
      }).sort((a, b) => a.timestamp - b.timestamp);

      const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
      toRemove.forEach(e => localStorage.removeItem(e.key));
    }
  } catch {}
};

interface UseDealsFilters extends Partial<SearchFilters> {
  location?: { lat: number; lng: number };
}

export function useDeals(filters?: UseDealsFilters) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCacheKey = (filters?: UseDealsFilters) => {
    const filterString = JSON.stringify(filters || {});
    return `${CACHE_KEY_PREFIX}-${btoa(filterString)}`;
  };

  // Memoize cache key to prevent unnecessary re-fetches
  const cacheKey = useMemo(() => getCacheKey(filters), [filters]);

  useEffect(() => {
    // Check cache immediately on mount
    const cachedDeals = getCachedData(cacheKey);
    if (cachedDeals && cachedDeals.length > 0) {
      setDeals(cachedDeals);
      setLoading(false);
      // Fetch fresh data in background
      fetchDealsInBackground();
    } else {
      // Only show loading if no cache
      fetchDeals();
    }
  }, [cacheKey]);

  const getCachedData = (cacheKey: string): Deal[] | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cachedData: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cachedData.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached deals data');
        return cachedData.data;
      }
      
      // Remove expired cache
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  const setCachedData = (cacheKey: string, data: Deal[]) => {
    try {
      clearOldCacheEntries();
      const cachedData: CachedData = {
        data: data.slice(0, 20),
        timestamp: Date.now(),
        filters: JSON.stringify(filters || {})
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
      } catch {}
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  const fetchDealsInBackground = async () => {
    try {
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          image_url,
          original_price,
          discounted_price,
          discount_percentage,
          duration_minutes,
          valid_until,
          is_active,
          booking_enabled,
          max_bookings_per_slot,
          business_id,
          category,
          booking_quota_total,
          booking_quota_remaining,
          quota_enabled,
          business:businesses!deals_business_id_fkey(
            id,
            name,
            address,
            city
          )
        `)
        .eq('is_active', true)
        .eq('business.status', 'approved')
        .gt('booking_quota_remaining', 0)
        .gte('valid_until', today)
        .limit(30);

      // Apply same filters as regular fetch
      if (filters?.city) query = query.eq('business.city', filters.city);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.query) query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      if (filters?.maxPrice) query = query.lte('discounted_price', filters.maxPrice);
      if (filters?.minDiscountPercentage) query = query.gte('discount_percentage', filters.minDiscountPercentage);
      if (filters?.maxDiscountPercentage) query = query.lte('discount_percentage', filters.maxDiscountPercentage);

      // Apply sorting
      switch (filters?.sortBy) {
        case 'price':
          query = query.order('discounted_price', { ascending: true });
          break;
        case 'discount':
          query = query.order('discount_percentage', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'expiring':
          query = query.order('valid_until', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let transformedDeals = (data || []).map(deal => ({
        ...deal,
        business: deal.business
      }));

      if (filters?.location && filters.sortBy === 'distance') {
        transformedDeals = transformedDeals
          .filter(deal => deal.business?.coordinates)
          .map(deal => ({
            ...deal,
            distance: calculateDistance(
              filters.location!.lat,
              filters.location!.lng,
              deal.business!.coordinates!.lat,
              deal.business!.coordinates!.lng
            )
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setDeals(transformedDeals);
      setCachedData(cacheKey, transformedDeals);
    } catch (err) {
      console.error('Background fetch error:', err);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          image_url,
          original_price,
          discounted_price,
          discount_percentage,
          duration_minutes,
          valid_until,
          is_active,
          booking_enabled,
          max_bookings_per_slot,
          business_id,
          category,
          booking_quota_total,
          booking_quota_remaining,
          quota_enabled,
          business:businesses!deals_business_id_fkey(
            id,
            name,
            address,
            city
          )
        `)
        .eq('is_active', true)
        .eq('business.status', 'approved')
        .gt('booking_quota_remaining', 0)
        .gte('valid_until', today)
        .limit(30);

      // Apply filters
      if (filters?.city) {
        query = query.eq('business.city', filters.city);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      // Apply filters
      if (filters?.maxPrice) {
        query = query.lte('discounted_price', filters.maxPrice);
      }

      if (filters?.minDiscountPercentage) {
        query = query.gte('discount_percentage', filters.minDiscountPercentage);
      }

      if (filters?.maxDiscountPercentage) {
        query = query.lte('discount_percentage', filters.maxDiscountPercentage);
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'price':
          query = query.order('discounted_price', { ascending: true });
          break;
        case 'discount':
          query = query.order('discount_percentage', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'expiring':
          query = query.order('valid_until', { ascending: true });
          break;
        case 'distance':
          // Distance sorting will be done client-side if location is available
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match expected structure
      let transformedDeals = (data || []).map(deal => ({
        ...deal,
        business: deal.business
      }));
      
      // Apply distance sorting if location is available
      if (filters?.location && filters.sortBy === 'distance') {
        transformedDeals = transformedDeals
          .filter(deal => deal.business?.coordinates) // Only deals with coordinates
          .map(deal => ({
            ...deal,
            distance: calculateDistance(
              filters.location!.lat,
              filters.location!.lng,
              deal.business!.coordinates!.lat,
              deal.business!.coordinates!.lng
            )
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
      
      setDeals(transformedDeals);
      
      // Cache the results
      setCachedData(cacheKey, transformedDeals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { deals, loading, error, refetch: fetchDeals };
}