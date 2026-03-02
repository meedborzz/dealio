import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal } from '@/types';
import { Image } from 'lucide-react';

interface OfferSliderProps {
  deals: Deal[];
}

export const OfferSlider: React.FC<OfferSliderProps> = ({ deals }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
      {deals.map((deal) => {
        const business = deal.business || deal.businesses;
        const imageUrl = deal.image_url || business?.images?.[0] || business?.image_url;

        return (
          <button
            key={deal.id}
            onClick={() => navigate(`/deal/${deal.id}`)}
            className="flex-shrink-0 w-36 snap-start group"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={deal.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <Image className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg">
                -{deal.discount_percentage}%
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
              {deal.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
              {business?.name}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-primary leading-none">
                {deal.discounted_price} DH
              </span>
              <span className="text-xs text-muted-foreground line-through leading-none">
                {deal.original_price} DH
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
