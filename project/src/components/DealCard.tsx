import React from 'react';
import { memo } from 'react';
import { MapPin, Heart, ChevronRight, ThumbsUp } from 'lucide-react';
import { Deal } from '../shared/types/contracts';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/features';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  distance?: number;
  variant?: 'default' | 'compact' | 'featured' | 'search';
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  onClick,
  distance,
  variant = 'default'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const totalVotes = (deal.likes_count || 0) + (deal.dislikes_count || 0);
  const satisfactionPercentage = totalVotes >= 10
    ? Math.round(((deal.likes_count || 0) / totalVotes) * 100)
    : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite(deal.id);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/deal/${deal.id}`);
    }
  };

  if (variant === 'search') {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-all duration-200 group overflow-hidden bg-card border-border"
        onClick={handleCardClick}
      >
        <div className="flex p-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <img
              src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={deal.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-lg"
            />
            <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] px-1 py-0">
              -{deal.discount_percentage}%
            </Badge>
          </div>

          <div className="flex-1 ml-3 min-w-0">
            <h4 className="font-semibold text-foreground text-sm line-clamp-1">
              {deal.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {deal.business?.name}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground text-sm leading-none">{deal.discounted_price} DH</span>
                <span className="text-xs text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className="cursor-pointer group overflow-hidden bg-card/40 backdrop-blur-sm border-border/40 hover:border-primary/30 shadow-sm hover:shadow-premium-hover active:scale-[0.98] transition-all duration-500 rounded-3xl relative"
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="flex p-3 relative z-10 gap-4 items-center">
          {/* Enhanced Image Container */}
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/5">
            <img
              src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=300'}
              alt={deal.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />

            <div className="absolute top-1.5 left-1.5">
              <Badge className="bg-red-500/90 backdrop-blur-md text-white border-white/20 font-black px-1.5 py-0.5 text-[10px] shadow-lg rounded-full">
                -{deal.discount_percentage}%
              </Badge>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col py-1">
            <div className="mb-2">
              <h3 className="font-extrabold text-foreground text-[16px] leading-[1.2] tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                {deal.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">{deal.duration_minutes} min</span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-foreground leading-none tracking-tight">
                  {deal.discounted_price} <span className="text-[11px] font-medium opacity-60">DH</span>
                </span>
                <span className="text-[11px] font-bold text-muted-foreground line-through leading-none decoration-muted-foreground/30">
                  {deal.original_price} DH
                </span>
              </div>

              {FEATURES.FAVORITES && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteClick}
                  className="h-9 w-9 rounded-2xl bg-ui-soft/50 hover:bg-primary/10 transition-all group/fav"
                >
                  <Heart className={`h-4 w-4 transition-all duration-300 ${user && isFavorite(deal.id) ? 'fill-red-500 text-red-500 scale-110' : 'text-muted-foreground/60 group-hover/fav:text-primary'}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 group overflow-hidden bg-card border-border"
        onClick={handleCardClick}
      >
        <div className="relative">
          <img
            src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600'}
            alt={deal.title}
            loading="lazy"
            decoding="async"
            className="w-full aspect-[5/2] object-cover"
          />
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground font-bold">
            -{deal.discount_percentage}%
          </Badge>
          {FEATURES.FAVORITES && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 bg-background/90 hover:bg-background h-8 w-8"
            >
              <Heart className={`h-4 w-4 ${user && isFavorite(deal.id) ? 'fill-current text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          )}
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{deal.title}</h3>

          <div className="text-xs text-muted-foreground">
            <span>{deal.business?.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground leading-none">{deal.discounted_price} DH</span>
              <span className="text-sm text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
            </div>
            <Button size="sm" className="h-8 px-4 text-xs font-semibold">
              Book
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer group overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/40 hover:border-primary/20 shadow-sm hover:shadow-xl active:scale-[0.98] transition-all duration-300 rounded-2xl relative"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />

      <div className="flex p-2.5 sm:p-3 relative z-10 gap-3.5 sm:gap-4">
        {/* Adjusted image container for better proportions */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-[14px] bg-muted shadow-sm">
          <img
            src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=300'}
            alt={deal.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />

          <div className="absolute top-1.5 left-1.5">
            <div className="relative overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/80 to-red-600/80 backdrop-blur-md" />
              <Badge className="relative bg-transparent hover:bg-transparent text-white border-white/20 font-extrabold px-1.5 py-0.5 text-[10px] shadow-sm">
                -{deal.discount_percentage}%
              </Badge>
            </div>
          </div>

          {FEATURES.FAVORITES && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 transition-colors"
            >
              <Heart className={`h-3.5 w-3.5 ${user && isFavorite(deal.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="space-y-1.5">
            <h3 className="font-bold text-foreground text-[15px] sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {deal.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
              <span className="truncate font-medium">{deal.business?.name}</span>

              {(distance || satisfactionPercentage !== null) && (
                <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-border">•</span>
                  {distance && (
                    <span className="text-primary font-semibold">{distance.toFixed(1)} km</span>
                  )}
                  {satisfactionPercentage !== null && (
                    <>
                      {distance && <span className="text-border">•</span>}
                      <div className="flex items-center gap-1 text-[#c8a2c9] dark:text-[#d6aad7]">
                        <ThumbsUp className="h-3 w-3" />
                        <span className="font-semibold">{satisfactionPercentage}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between mt-2 gap-2">
            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <span className="text-lg sm:text-xl font-bold text-foreground leading-none tracking-tight">
                {deal.discounted_price} <span className="text-sm font-medium">DH</span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground line-through leading-none decoration-muted-foreground/50">
                {deal.original_price} DH
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default memo(DealCard);
