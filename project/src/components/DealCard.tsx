import React from 'react';
import { memo } from 'react';
import { Clock, MapPin, Heart, ChevronRight, ThumbsUp } from 'lucide-react';
import { Deal } from '../shared/types/contracts';
import { useAuth } from '../hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/features';

interface DealCardProps {
  deal: Deal;
  onClick?: () => void;
  onBook?: () => void;
  distance?: number;
  variant?: 'default' | 'compact' | 'featured' | 'search';
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  onClick,
  onBook,
  distance,
  variant = 'default'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        className="cursor-pointer hover:shadow-md transition-all duration-200 group overflow-hidden bg-card border-border"
        onClick={handleCardClick}
      >
        <div className="flex p-3">
          <div className="relative w-20 h-20 flex-shrink-0">
            <img
              src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={deal.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-lg"
            />
            <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
              -{deal.discount_percentage}%
            </Badge>
          </div>

          <div className="flex-1 ml-3 min-w-0">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{deal.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{deal.business?.name}</p>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground leading-none">{deal.discounted_price} DH</span>
                <span className="text-xs text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
              </div>
              {FEATURES.FAVORITES && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteClick}
                  className="h-6 w-6"
                >
                  <Heart className={`h-3.5 w-3.5 ${user && isFavorite(deal.id) ? 'fill-current text-red-500' : 'text-muted-foreground'}`} />
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
      className="cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200 group overflow-hidden bg-card border-border"
      onClick={handleCardClick}
    >
      <div className="flex">
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-muted">
          <img
            src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=200'}
            alt={deal.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-1.5 left-1.5 bg-destructive text-destructive-foreground font-bold px-1.5 py-0.5 text-[10px]">
            -{deal.discount_percentage}%
          </Badge>
          {FEATURES.FAVORITES && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="absolute top-1 right-1 h-6 w-6 bg-black/40 hover:bg-black/60"
            >
              <Heart className={`h-3 w-3 ${user && isFavorite(deal.id) ? 'fill-current text-red-500' : 'text-white'}`} />
            </Button>
          )}
        </div>

        <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{deal.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{deal.business?.name}</span>
              {distance && (
                <>
                  <span>|</span>
                  <span className="text-primary font-medium flex-shrink-0">{distance.toFixed(1)}km</span>
                </>
              )}
              {satisfactionPercentage !== null && (
                <>
                  <span>|</span>
                  <div className="flex items-center gap-0.5 text-[#c8a2c9] dark:text-[#d6aad7] flex-shrink-0">
                    <ThumbsUp className="h-2.5 w-2.5" />
                    <span className="font-medium">{satisfactionPercentage}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-foreground leading-none">{deal.discounted_price} DH</span>
              <span className="text-xs text-muted-foreground line-through leading-none">{deal.original_price} DH</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default memo(DealCard);
