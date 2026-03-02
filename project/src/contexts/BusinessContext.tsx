import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Business {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  category: string;
  rating: number;
  review_count: number;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface BusinessContextType {
  business: Business | null;
  businessId: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedUserId = useRef<string | null>(null);
  const fetchingBusiness = useRef(false);

  const fetchBusiness = async () => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      lastFetchedUserId.current = null;
      return;
    }

    // Prevent duplicate fetches for the same user
    if (fetchingBusiness.current) {
      console.log('Business fetch already in progress, skipping...');
      return;
    }

    if (lastFetchedUserId.current === user.id) {
      console.log('Business already fetched for this user, skipping...');
      setLoading(false);
      return;
    }

    try {
      fetchingBusiness.current = true;
      lastFetchedUserId.current = user.id;
      setLoading(true);
      setError(null);

      console.log('Fetching business for owner:', user.id);

      const businessPromise = supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Business fetch timeout')), 5000)
      );

      const { data, error: fetchError } = await Promise.race([businessPromise, timeoutPromise]) as any;

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('No business found for this owner');
          setBusiness(null);
        } else if (fetchError.message?.includes('timeout')) {
          console.error('Business fetch timed out');
          setError('Connection timeout - please try again');
          setBusiness(null);
        } else {
          throw fetchError;
        }
      } else {
        console.log('Business found:', data?.name);
        setBusiness(data);
      }
    } catch (err) {
      console.error('Error fetching business:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch business');
      setBusiness(null);
    } finally {
      setLoading(false);
      fetchingBusiness.current = false;
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [user?.id]);

  const value: BusinessContextType = {
    business,
    businessId: business?.id || null,
    loading,
    error,
    refetch: fetchBusiness
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};