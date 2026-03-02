import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Deal } from '../types';

const RECENTLY_VIEWED_KEY = 'dealio-recently-viewed';
const MAX_RECENTLY_VIEWED = 8;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      
      if (!stored) {
        setRecentlyViewed([]);
        return;
      }

      const dealIds = JSON.parse(stored) as string[];
      
      if (dealIds.length === 0) {
        setRecentlyViewed([]);
        return;
      }

      // Fetch deal details from Supabase
      const { data, error } = await supabase
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
          business_id,
          business:businesses!deals_business_id_fkey(
            id,
            name,
            city,
            rating,
            review_count
          )
        `)
        .in('id', dealIds)
        .eq('is_active', true);

      if (error) throw error;

      // Transform and maintain order from localStorage
      const transformedDeals = (data || []).map(deal => ({
        ...deal,
        business: deal.business
      }));

      // Sort by the order in localStorage
      const orderedDeals = dealIds
        .map(id => transformedDeals.find(deal => deal.id === id))
        .filter(Boolean) as Deal[];

      setRecentlyViewed(orderedDeals);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      setRecentlyViewed([]);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentlyViewed = (dealId: string) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let dealIds: string[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists to avoid duplicates
      dealIds = dealIds.filter(id => id !== dealId);
      
      // Add to beginning
      dealIds.unshift(dealId);
      
      // Keep only the most recent items
      dealIds = dealIds.slice(0, MAX_RECENTLY_VIEWED);
      
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(dealIds));
      
      // Reload the deals
      loadRecentlyViewed();
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  return {
    recentlyViewed,
    loading,
    addToRecentlyViewed
  };
}