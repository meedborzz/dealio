import React from 'react';
import { MapPin } from 'lucide-react';
import { Deal } from '../types';

interface SimpleDealCardProps {
  deal: Deal;
  onClick: () => void;
}

const SimpleDealCard: React.FC<SimpleDealCardProps> = ({ deal, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={deal.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-bold shadow-sm">
          -{deal.discount_percentage}%
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 text-left line-clamp-1">
          {deal.title}
        </h3>

        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="truncate">{deal.business?.name}</span>
        </div>

        {deal.quota_enabled && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#c8a2c9]/10 text-[#c8a2c9] border border-[#c8a2c9]/20 dark:bg-[#d6aad7]/20 dark:text-white dark:border-[#d6aad7]/30">
              {deal.booking_quota_remaining} / {deal.booking_quota_total} places
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-foreground">
              {deal.discounted_price} DH
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {deal.original_price} DH
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default SimpleDealCard;