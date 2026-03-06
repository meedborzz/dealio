import React from 'react';
import { User, Heart, Star, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface GuestPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'favorites' | 'profile' | 'reviews' | 'notifications' | 'bookings';
  title: string;
  description: string;
}

const GuestPrompt: React.FC<GuestPromptProps> = ({
  isOpen,
  onClose,
  feature,
  title,
  description
}) => {
  const navigate = useNavigate();

  const getFeatureIcon = () => {
    switch (feature) {
      case 'favorites':
        return <Heart className="h-8 w-8 text-primary relative z-10" />;
      case 'profile':
        return <User className="h-8 w-8 text-primary relative z-10" />;
      case 'reviews':
        return <Star className="h-8 w-8 text-primary relative z-10" />;
      case 'notifications':
        return <Bell className="h-8 w-8 text-primary relative z-10" />;
      default:
        return <User className="h-8 w-8 text-primary relative z-10" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-background border border-border shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Soft Background Mesh */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Header Section */}
          <div className="pt-10 pb-6 px-6 flex flex-col items-center text-center">

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-md flex items-center justify-center transition-colors border border-border"
            >
              <X className="h-4 w-4 text-foreground/70 hover:text-foreground" />
            </button>

            {/* Icon Container with Glassmorphism */}
            <div className="w-20 h-20 rounded-[20px] bg-white/50 dark:bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/50 dark:border-white/10 shadow-lg relative overflow-hidden mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 transition-opacity group-hover:opacity-70" />
              {getFeatureIcon()}
            </div>

            <h2 className="text-2xl font-extrabold text-foreground mb-2 tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
              {description}
            </p>
          </div>

          {/* Actions Section */}
          <div className="px-6 pb-8 space-y-3">
            <Button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="w-full h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95 text-base"
            >
              Se connecter
            </Button>

            <Button
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              variant="outline"
              className="w-full h-12 rounded-2xl font-bold border-2 hover:bg-primary/5 transition-all text-base"
            >
              Créer un compte
            </Button>

            <button
              onClick={() => {
                onClose();
                if (feature === 'bookings') {
                  navigate('/');
                }
              }}
              className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              {feature === 'bookings' ? 'Explorer les offres' : 'Continuer sans compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPrompt;