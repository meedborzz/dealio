import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { AVAILABLE_CITIES } from '@/lib/preferences';
import { SetupTip } from './SetupTip';

interface LocationStepProps {
  language: Language;
  locationEnabled: boolean;
  selectedCity?: string;
  onLocationAllow: (lat: number, lng: number) => void;
  onCitySelect: (city: string) => void;
  onSkip: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  language,
  locationEnabled,
  selectedCity,
  onLocationAllow,
  onCitySelect,
  onSkip,
}) => {
  const [loading, setLoading] = useState(false);
  const [showCitySelect, setShowCitySelect] = useState(false);

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      onLocationAllow(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      setShowCitySelect(true);
    } finally {
      setLoading(false);
    }
  };

  if (showCitySelect) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === 'ar' ? 'اختر مدينتك' : language === 'fr' ? 'Choisissez votre ville' : 'Choose your city'}
          </h2>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {AVAILABLE_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => onCitySelect(city)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${selectedCity === city
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
                }`}
            >
              <p className="font-medium text-foreground">{city}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.location.title', language)}
        </h2>
        <p className="text-muted-foreground">
          {t('setup.location.subtitle', language)}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleAllowLocation}
          disabled={loading}
          className="w-full h-12"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'ar' ? 'جاري التحميل...' : language === 'fr' ? 'Chargement...' : 'Loading...'}
            </>
          ) : (
            t('button.allow', language)
          )}
        </Button>

        <Button
          onClick={() => setShowCitySelect(true)}
          variant="outline"
          className="w-full h-12"
          size="lg"
        >
          {language === 'ar' ? 'اختر مدينة يدوياً' : language === 'fr' ? 'Choisir une ville manuellement' : 'Choose city manually'}
        </Button>

        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full h-12"
          size="lg"
        >
          {t('button.not_now', language)}
        </Button>
      </div>

      <SetupTip text={t('setup.location.tip', language)} />
    </div>
  );
};
