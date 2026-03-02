import React, { useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LocationPermissionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onManualLocation: () => void;
}

const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  isOpen,
  onClose,
  onAllow,
  onManualLocation
}) => {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleAllowLocation = async () => {
    setIsDetecting(true);
    try {
      await onAllow();
    } catch (error) {
      console.error('Location detection failed:', error);
      alert('Impossible de détecter votre position. Veuillez choisir manuellement.');
      onManualLocation();
    } finally {
      setIsDetecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Localisation</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">
              Trouvez les offres près de vous
            </h4>
            <p className="text-sm text-muted-foreground">
              Nous utilisons votre position pour vous montrer les meilleures offres à proximité
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleAllowLocation}
              disabled={isDetecting}
              className="w-full"
              size="lg"
            >
              {isDetecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Détection...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Autoriser la localisation
                </>
              )}
            </Button>
            
            <Button
              onClick={onManualLocation}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Choisir manuellement
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Vos données restent privées et sécurisées
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationPermissionPrompt;