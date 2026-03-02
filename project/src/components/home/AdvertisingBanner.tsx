import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AdvertisingBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-6 backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />

      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base mb-1 tracking-tight">
            Dealio est gratuit
          </h3>
          <p className="text-sm text-muted-foreground">
            Réservez en 30 secondes, sans frais cachés
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/categories')}
          className="flex-shrink-0 h-9 px-4 rounded-xl font-medium bg-gradient-to-b from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-sm hover:shadow-md active:scale-95 transition-all"
        >
          Découvrir
        </Button>
      </div>
    </div>
  );
};
