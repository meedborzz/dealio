import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness';
import { isLaunchModeActive } from '../../config/launchMode';
import LoadingSpinner from '../../components/LoadingSpinner';

interface RequireOfferGuardProps {
  children: React.ReactNode;
}

const RequireOfferGuard: React.FC<RequireOfferGuardProps> = ({ children }) => {
  const { biz, loading: bizLoading } = useCurrentBusiness();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasActiveOffers, setHasActiveOffers] = useState(false);

  useEffect(() => {
    const checkActiveOffers = async () => {
      if (bizLoading) {
        return;
      }

      if (!biz) {
        setLoading(false);
        return;
      }

      if (!isLaunchModeActive()) {
        setHasActiveOffers(true);
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('deals')
          .select('id')
          .eq('business_id', biz.id)
          .eq('is_active', true)
          .eq('booking_enabled', true)
          .gt('booking_quota_remaining', 0)
          .gte('valid_until', today)
          .limit(1);

        if (error) throw error;

        setHasActiveOffers(data && data.length > 0);
      } catch (error) {
        console.error('Error checking active offers:', error);
        setHasActiveOffers(false);
      } finally {
        setLoading(false);
      }
    };

    checkActiveOffers();
  }, [biz, bizLoading]);

  if (loading || bizLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // if (!hasActiveOffers && location.pathname !== '/business/intro' && location.pathname !== '/business/offers/create') {
  //   return <Navigate to="/business/intro" replace />;
  // }

  return <>{children}</>;
};

export default RequireOfferGuard;
