import React from 'react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface BookingRecapFooterProps {
  formattedDate: string;
  formattedTime: string;
  discountedPrice: number;
  originalPrice: number;
  canConfirm: boolean;
  loading: boolean;
  ctaLabel: string;
  onConfirm: () => void;
}

const BookingRecapFooter: React.FC<BookingRecapFooterProps> = ({
  formattedDate,
  formattedTime,
  discountedPrice,
  originalPrice,
  canConfirm,
  loading,
  ctaLabel,
  onConfirm,
}) => {
  return (
    <div className="flex-shrink-0 bg-card border-t border-border px-4 pt-3 pb-24">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            )}
            {formattedTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedTime}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">{discountedPrice} DH</span>
          {originalPrice > discountedPrice && (
            <span className="text-xs text-muted-foreground line-through ml-1.5">{originalPrice} DH</span>
          )}
        </div>
      </div>

      <Button
        onClick={onConfirm}
        disabled={!canConfirm || loading}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a882a9] disabled:opacity-50"
        size="lg"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
        ) : ctaLabel === 'confirm' ? (
          <>
            Confirmer la reservation
            <ChevronRight className="h-4 w-4 ml-2" />
          </>
        ) : (
          ctaLabel
        )}
      </Button>
    </div>
  );
};

export default React.memo(BookingRecapFooter);
