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
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-3 sm:p-4 pt-6 bg-gradient-to-t from-background via-background/90 to-transparent">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 p-3.5 sm:p-5 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-premium flex flex-col gap-2.5 sm:gap-3">

          {(formattedDate || formattedTime) && (
            <div className="flex items-center gap-3 px-2 text-xs font-semibold text-muted-foreground/80">
              {formattedDate && (
                <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full border border-border/50">
                  <Calendar className="h-3.5 w-3.5 opacity-70" />
                  {formattedDate}
                </span>
              )}
              {formattedTime && (
                <span className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-full border border-border/50">
                  <Clock className="h-3.5 w-3.5 opacity-70" />
                  {formattedTime}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 sm:gap-6 mt-0.5 sm:mt-0">
            <div className="flex-shrink-0 pl-1 sm:pl-2">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-3xl font-black text-primary tracking-tighter">{discountedPrice}</span>
                  <span className="text-[10px] sm:text-xs font-black text-primary/70">DH</span>
                </div>
                {originalPrice > discountedPrice && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground line-through mt-0.5">{originalPrice} DH</span>
                )}
              </div>
            </div>

            <Button
              onClick={onConfirm}
              disabled={!canConfirm || loading}
              className={`flex-1 min-w-[130px] h-12 sm:h-16 rounded-[1.5rem] sm:rounded-[2rem] font-black text-[13px] sm:text-[17px] shadow-xl shadow-primary/20 transition-all duration-300 disabled:opacity-40 uppercase tracking-wide bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground px-2 sm:px-6 ${loading ? 'scale-95' : 'hover:scale-[1.02] active:scale-95'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-current flex-shrink-0" />
                  <span className="truncate">Traitement</span>
                </div>
              ) : ctaLabel === 'confirm' ? (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="truncate">Confirmer</span>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </div>
              ) : (
                <span className="truncate">{ctaLabel}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BookingRecapFooter);
