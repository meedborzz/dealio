import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AdvertisingBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-5 sm:p-6 shadow-lg backdrop-blur-xl group">
      {/* Animated gradient background mesh */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />

      <div className="relative flex items-center gap-4 z-10">
        {/* Icon Container with Glassmorphism */}
        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/50 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
          <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary relative z-10" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-foreground text-base sm:text-lg mb-0.5 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Dealio est gratuit
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-snug">
            Réservez en 30 secondes, sans frais cachés
          </p>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          onClick={() => navigate('/categories')}
          className="flex-shrink-0 h-9 sm:h-10 px-4 sm:px-5 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center gap-1 sm:gap-1.5"
        >
          Découvrir
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
        </Button>
      </div>
    </div>
  );
};
