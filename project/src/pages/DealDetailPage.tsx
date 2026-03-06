import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Heart, Calendar, Phone } from 'lucide-react';
import { Deal } from '../shared/types/contracts';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { trackInteraction } from '../lib/trackInteraction';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { supabase } from '../lib/supabase';
import { safeSingle } from '../lib/supabaseSafe';
import { useNavigate, useParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import ErrorBoundary from '../components/ErrorBoundary';
import SocialShareButton from '../components/SocialShareButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FEATURES } from '../config/features';

const DealDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (dealId) {
      fetchDealDetails(dealId);
      addToRecentlyViewed(dealId);
    }
  }, [dealId]);


  const fetchDealDetails = async (id: string) => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];

      const { data: dealData, error: dealError } = await safeSingle(
        supabase
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
            max_bookings_per_slot,
            booking_enabled,
            valid_until,
            is_active,
            category,
            business_id,
            booking_quota_total,
            booking_quota_remaining,
            quota_enabled,
            business:businesses!deals_business_id_fkey(
              id,
              name,
              address,
              city,
              phone,
              email
            )
          `)
          .eq('id', id)
          .eq('is_active', true)
          .eq('business.status', 'approved')
          .gt('booking_quota_remaining', 0)
          .gte('valid_until', today)
          .maybeSingle()
      );

      if (dealError || !dealData) {
        setDeal(null);
        return;
      }

      setDeal({ ...(dealData as any), business: (dealData as any).business });
    } catch (error) {
      console.error('Error fetching deal details:', error);
      setDeal(null);
    } finally {
      setLoading(false);
    }
  };


  const handleToggleFavorite = async () => {
    if (!user || !deal) {
      navigate('/login');
      return;
    }
    await toggleFavorite(deal.id);
    if (user) {
      trackInteraction(deal.id, 'favorite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative h-[60vh] bg-muted animate-pulse">
          <div className="absolute top-0 left-0 right-0 pt-12 px-4 z-10">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-black/10" />
              <div className="w-10 h-10 rounded-full bg-black/10" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
            <div className="bg-background/95 rounded-3xl p-4 sm:p-6 border border-border/50 space-y-3">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-8 w-36 bg-muted rounded" />
              <div className="flex gap-3 pt-2 border-t border-border/50">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 pt-6 space-y-4">
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal || !deal.business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Offre non trouvée</h2>
            <Button onClick={() => navigate('/')}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image Section with Overlay */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={deal.title}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

        {/* Floating Header Controls */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-4 z-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 backdrop-blur-md bg-black/20 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {FEATURES.FAVORITES && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="text-white hover:bg-white/20 backdrop-blur-md bg-black/20 rounded-full"
              >
                <Heart className={`h-5 w-5 ${isFavorite(deal.id) ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Share Button Overlay - top left */}
        <div className="absolute top-24 left-4 z-10">
          <div className="backdrop-blur-md bg-black/20 rounded-full">
            <SocialShareButton deal={deal} variant="icon" />
          </div>
        </div>

        {/* Discount Badge & Remaining Places */}
        <div className="absolute top-24 right-4 z-10 flex flex-col items-end gap-2">
          {/* Discount Badge */}
          <div className="relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 blur-md group-hover:blur-lg transition-all" />
            <div className="relative flex items-center gap-1.5 bg-gradient-to-br from-red-500/90 to-red-600/90 dark:from-red-500/80 dark:to-red-600/80 backdrop-blur-md border border-white/20 dark:border-white/10 text-white px-3 py-1.5 rounded-full shadow-lg">
              <span className="text-sm font-extrabold tracking-tight">-{deal.discount_percentage}%</span>
            </div>
          </div>

          {/* Quota Badge */}
          {deal.quota_enabled && (
            <div className="relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 blur-md group-hover:blur-lg transition-all" />
              <div className="relative flex items-center gap-1.5 bg-gradient-to-br from-primary/90 to-primary/80 dark:from-primary/50 dark:to-primary/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-primary-foreground dark:text-white px-3.5 py-1.5 rounded-full shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-wide">Plus que {deal.booking_quota_remaining} places</span>
              </div>
            </div>
          )}
        </div>

        {/* Price Card Floating at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
          <div className="bg-background/95 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6 border border-border/50">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">Prix spécial</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] bg-clip-text text-transparent leading-none">
                      {deal.discounted_price} DH
                    </span>
                    <span className="text-base sm:text-xl text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Paiement sur place</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pt-6 space-y-8">
        {/* Title & Business Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground leading-tight">{deal.title}</h1>

          <button
            onClick={() => navigate(`/business/${deal.business_id}`)}
            className="flex items-center gap-3 group min-w-0"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#c8a2c9] to-[#b892b9] rounded-full flex items-center justify-center shadow-md">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="text-left min-w-0">
              <div className="font-semibold text-foreground group-hover:text-[#c8a2c9] dark:group-hover:text-white transition-colors truncate">
                {deal.business?.name}
              </div>
              <div className="text-sm text-muted-foreground">{deal.business?.city}</div>
            </div>
          </button>
        </div>

        {/* Description Section */}
        {deal.description && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">À propos</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <p className="text-foreground/80 leading-relaxed text-base">{deal.description}</p>
          </div>
        )}

        {/* Business Details Card */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl p-6 space-y-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">Informations du salon</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/business/${deal.business_id}`)}
              className="text-[#c8a2c9] hover:text-[#b892b9] hover:bg-[#c8a2c9]/10 dark:text-[#d6aad7] dark:hover:text-white dark:hover:bg-[#d6aad7]/20"
            >
              Voir profil
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm">
                <MapPin className="h-4 w-4 text-[#c8a2c9]" />
              </div>
              <div className="flex-1 pt-2">
                <div className="text-sm text-muted-foreground mb-0.5">Adresse</div>
                <div className="text-foreground font-medium">{deal.business?.address}</div>
              </div>
            </div>

            {deal.business?.phone && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-background rounded-full flex items-center justify-center shadow-sm">
                  <Phone className="h-4 w-4 text-[#c8a2c9]" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="text-sm text-muted-foreground mb-0.5">Téléphone</div>
                  <a
                    href={`tel:${deal.business.phone}`}
                    className="text-foreground font-medium hover:text-[#c8a2c9] dark:hover:text-[#d6aad7] transition-colors"
                  >
                    {deal.business.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-40"></div>
      </div>

      {/* Sticky Booking Button */}
      <div className="fixed bottom-28 left-0 right-0 z-40 px-4">
        <Button
          onClick={() => setShowBookingModal(true)}
          className="w-full bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9] text-white shadow-2xl py-7 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          <div className="flex items-center justify-between w-full">
            <span>Réserver maintenant</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{deal.discounted_price}</span>
              <span className="text-base font-normal">DH</span>
            </div>
          </div>
        </Button>
      </div>

      {showBookingModal && deal && deal.business && (
        <ErrorBoundary>
          <BookingModal
            deal={deal}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            skipServiceStep
            onBookingComplete={() => {
              setShowBookingModal(false);
              navigate('/bookings');
            }}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default DealDetailPage;