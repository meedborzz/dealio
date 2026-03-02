import React, { useState, useEffect } from 'react';
import { Tag, TrendingUp, Eye, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface OfferInsight {
  activeOffers: number;
  totalOffers: number;
  bookingsThisPeriod: number;
  topOffers: Array<{
    id: string;
    title: string;
    bookingCount: number;
  }>;
}

interface OfferInsightsCardProps {
  businessId: string;
  dateRange?: { start: Date; end: Date };
  onManageOffers?: () => void;
}

export const OfferInsightsCard: React.FC<OfferInsightsCardProps> = ({
  businessId,
  dateRange,
  onManageOffers
}) => {
  const [insights, setInsights] = useState<OfferInsight>({
    activeOffers: 0,
    totalOffers: 0,
    bookingsThisPeriod: 0,
    topOffers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfferInsights();
  }, [businessId, dateRange]);

  const fetchOfferInsights = async () => {
    try {
      setLoading(true);

      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, title, is_active')
        .eq('business_id', businessId);

      if (dealsError) throw dealsError;

      const activeOffers = deals?.filter(d => d.is_active).length || 0;
      const totalOffers = deals?.length || 0;
      const dealIds = deals?.map(d => d.id) || [];

      let bookingsThisPeriod = 0;
      const offerBookingCounts: Record<string, { title: string; count: number }> = {};

      if (dealIds.length > 0) {
        let query = supabase
          .from('bookings')
          .select('deal_id, created_at', { count: 'exact', head: false })
          .in('deal_id', dealIds);

        if (dateRange) {
          query = query
            .gte('created_at', dateRange.start.toISOString())
            .lte('created_at', dateRange.end.toISOString());
        }

        const { data: bookings, error: bookingsError } = await query;

        if (bookingsError) throw bookingsError;

        bookingsThisPeriod = bookings?.length || 0;

        bookings?.forEach((booking: any) => {
          const deal = deals?.find(d => d.id === booking.deal_id);
          if (deal) {
            if (!offerBookingCounts[deal.id]) {
              offerBookingCounts[deal.id] = { title: deal.title, count: 0 };
            }
            offerBookingCounts[deal.id].count++;
          }
        });
      }

      const topOffers = Object.entries(offerBookingCounts)
        .map(([id, data]) => ({
          id,
          title: data.title,
          bookingCount: data.count
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 3);

      setInsights({
        activeOffers,
        totalOffers,
        bookingsThisPeriod,
        topOffers
      });
    } catch (error) {
      console.error('Error fetching offer insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Aperçu des offres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Aperçu des offres
        </CardTitle>
        {onManageOffers && (
          <Button variant="ghost" size="sm" onClick={onManageOffers}>
            Gérer
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-2xl font-bold text-foreground">{insights.activeOffers}</p>
            <p className="text-xs text-muted-foreground mt-1">Offres actives</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-2xl font-bold text-foreground">{insights.totalOffers}</p>
            <p className="text-xs text-muted-foreground mt-1">Total offres</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-2xl font-bold text-foreground">{insights.bookingsThisPeriod}</p>
            <p className="text-xs text-muted-foreground mt-1">Réservations</p>
          </div>
        </div>

        {insights.topOffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Top 3 offres</h4>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              {insights.topOffers.map((offer, index) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground truncate">{offer.title}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground shrink-0 ml-2">
                    <Eye className="h-3 w-3" />
                    <span className="text-xs font-semibold">{offer.bookingCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.activeOffers === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Aucune offre active
            </p>
            {onManageOffers && (
              <Button variant="outline" size="sm" onClick={onManageOffers}>
                Créer une offre
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
