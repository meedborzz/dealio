import React from 'react';
import { User, Heart, Star, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface GuestPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'favorites' | 'profile' | 'reviews' | 'notifications';
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
        return <Heart className="h-8 w-8 text-primary-foreground" />;
      case 'profile':
        return <User className="h-8 w-8 text-primary-foreground" />;
      case 'reviews':
        return <Star className="h-8 w-8 text-primary-foreground" />;
      case 'notifications':
        return <Bell className="h-8 w-8 text-primary-foreground" />;
      default:
        return <User className="h-8 w-8 text-primary-foreground" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-primary p-6 text-center relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
          >
            <X className="h-4 w-4 text-primary-foreground" />
          </button>

          <div className="w-16 h-16 bg-white/20 dark:bg-black/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {getFeatureIcon()}
          </div>
          <h2 className="text-xl font-bold text-primary-foreground mb-2">{title}</h2>
          <p className="text-primary-foreground/90 text-sm">{description}</p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="w-full py-3 rounded-xl font-bold transition-colors"
            >
              Se connecter
            </Button>

            <Button
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              variant="outline"
              className="w-full"
            >
              Créer un compte
            </Button>

            <Button
              onClick={() => {
                onClose();
                if (feature === 'bookings') {
                  navigate('/');
                }
              }}
              variant="ghost"
              className="w-full text-muted-foreground py-2 text-sm"
            >
              {feature === 'bookings' ? 'Explorer les offres' : 'Continuer sans compte'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestPrompt;