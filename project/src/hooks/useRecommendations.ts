import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Deal } from '../types';

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's booking history to understand preferences
      const bookingsResult = await supabase
        .from('bookings')
        .select('deal_id, deal:deals!bookings_deal_id_fkey(business_id, business:businesses!deals_business_id_fkey(category))')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .limit(10);

      // Extract preferred categories and businesses
      const preferredCategories = new Set<string>();
      const preferredBusinesses = new Set<string>();

      (bookingsResult.data || []).forEach(item => {
        if (item.deal?.business?.category) {
          preferredCategories.add(item.deal.business.category);
        }
        if (item.deal?.business_id) {
          preferredBusinesses.add(item.deal.business_id);
        }
      });

      // Build recommendation query
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
          business_id,
          business:businesses!deals_business_id_fkey(
            id,
            name,
            city,
            category,
            rating,
            review_count
          )
        `)
        .eq('is_active', true)
        .gt('valid_until', new Date().toISOString());

      // Filter by preferred categories or businesses
      if (preferredCategories.size > 0 || preferredBusinesses.size > 0) {
        const categoryArray = Array.from(preferredCategories);
        const businessArray = Array.from(preferredBusinesses);
        
        if (categoryArray.length > 0) {
          query = query.in('business.category', categoryArray);
        }
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Transform data to match expected structure
      const transformedDeals = (data || []).map(deal => ({
        ...deal,
        business: deal.business
      }));

      setRecommendations(transformedDeals);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    refetch: fetchRecommendations
  };
}