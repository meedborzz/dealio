import React from 'react';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAvailableCities } from '../config/location';
import { isLaunchModeActive } from '../config/launchMode';

interface LocationSelectorProps {
  currentLocation: string;
  onSelect: (location: string) => void;
  onClose: () => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onSelect,
  onClose,
}) => {
  const availableCities = getAvailableCities();
  const cities = availableCities.map(city => ({
    id: city.name.toLowerCase().replace(/\s+/g, '_'),
    name: city.name,
  }));

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          onSelect('Near me');
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <Card
        className="relative w-full max-w-md mx-4 mb-24 sm:mb-0 bg-card border-border rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Select Location</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-2 max-h-[50vh] overflow-y-auto">
          {!isLaunchModeActive() && (
            <>
              <button
                onClick={handleLocationDetection}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-foreground">Use my location</div>
                  <div className="text-sm text-muted-foreground">Auto-detect</div>
                </div>
              </button>

              <div className="h-px bg-border my-2" />
            </>
          )}

          {cities.map((city) => {
            const isSelected = currentLocation === city.name;
            return (
              <button
                key={city.id}
                onClick={() => onSelect(city.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <span className={`font-medium flex-1 text-left ${
                  isSelected ? 'text-primary' : 'text-foreground'
                }`}>
                  {city.name}
                </span>
                {isSelected && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default LocationSelector;
