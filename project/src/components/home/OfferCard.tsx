import React, { useState } from 'react';
import { MapPin, Heart, Calendar, ThumbsUp, Flame, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deal } from '@/types';
import { useNavigate } from 'react-router-dom';
import { getTrustBadges, getNextAvailabilityLabel } from '@/utils/trustBadges';
import { useAuth } from '@/hooks/useAuth';
import { AuthGateModal } from '@/components/AuthGateModal';
import { FEATURES } from '@/config/features';

interface OfferCardProps {
  deal: Deal;
  onBook?: () => void;
  distance?: number;
}

import { motion } from 'framer-motion';

export const OfferCard: React.FC<OfferCardProps> = ({ deal, onBook, distance }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authAction, setAuthAction] = useState<'book' | 'save'>('book');

  const businessName = deal.business?.name || deal.businesses?.name || 'Business';
  const businessCity = deal.business?.city || deal.businesses?.city;
  const imageUrl = deal.image_url || deal.business?.image_url || deal.businesses?.image_url;

  const trustBadges = getTrustBadges(deal);
  const nextAvailability = getNextAvailabilityLabel();
  const isFav = false;

  const totalVotes = (deal.likes_count || 0) + (deal.dislikes_count || 0);
  const satisfactionPercentage = totalVotes >= 10
    ? Math.round(((deal.likes_count || 0) / totalVotes) * 100)
    : null;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      e.stopPropagation();
      return;
    }
    navigate(`/deal/${deal.id}`);
  };

  const hapticFeedback = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback();
    if (!user) {
      setAuthAction('save');
      setShowAuthGate(true);
      return;
    }
    // toggleFavorite(deal.id);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback();
    if (onBook) {
      onBook();
    } else {
      navigate(`/deal/${deal.id}`);
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          className="group cursor-pointer overflow-hidden rounded-2xl transition-all hover:shadow-lg hover:shadow-black/5 glass-card"
          onClick={handleClick}
        >
          <div className="flex gap-3 p-3">
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={deal.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-xs">No image</span>
                </div>
              )}
              <Badge className="absolute top-1.5 left-1.5 bg-primary/90 text-primary-foreground font-bold px-1.5 py-0.5 text-[10px]">
                -{deal.discount_percentage}%
              </Badge>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1 tracking-tight">{deal.title}</h3>
                    <div className="flex gap-1">
                      {deal.discount_percentage >= 20 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-none text-[8px] h-4 px-1.5 font-bold uppercase tracking-wider flex items-center">
                          <Flame className="h-2.5 w-2.5 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {satisfactionPercentage && satisfactionPercentage >= 90 && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-none text-[8px] h-4 px-1.5 font-bold uppercase tracking-wider flex items-center">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          Top Rated
                        </Badge>
                      )}
                    </div>
                  </div>
                  {FEATURES.FAVORITES && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 -mt-1 -mr-1"
                      onClick={handleSave}
                    >
                      <Heart
                        className={`h-4 w-4 ${isFav ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                          }`}
                      />
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs line-clamp-1">{businessName}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  {(distance || businessCity) && (
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{distance ? `${distance.toFixed(1)} km` : businessCity}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-primary text-[10px] font-medium">
                    <Calendar className="h-2.5 w-2.5" />
                    <span>{nextAvailability}</span>
                  </div>
                  {satisfactionPercentage !== null && (
                    <div className="flex items-center gap-1 text-[#c8a2c9] dark:text-[#d6aad7] text-[10px] font-medium">
                      <ThumbsUp className="h-2.5 w-2.5" />
                      <span>{satisfactionPercentage}%</span>
                    </div>
                  )}
                </div>

                {trustBadges.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {trustBadges.map((badge) => (
                      <Badge
                        key={badge.id}
                        variant="secondary"
                        className={`${badge.color} text-[9px] px-1.5 py-0 h-4 font-medium`}
                      >
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 mt-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-foreground leading-none">{deal.discounted_price} DH</span>
                  <span className="text-xs text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
                </div>
                <Button
                  size="sm"
                  className="h-9 text-xs px-4 rounded-xl font-medium bg-gradient-to-b from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm hover:shadow-md active:scale-95 transition-all"
                  onClick={handleBook}
                >
                  Book
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        action={authAction}
      />
    </>
  );
};
