import React from 'react';
import { UserCircle } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface AccountStepProps {
  language: Language;
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
}

export const AccountStep: React.FC<AccountStepProps> = ({
  language,
  onLogin,
  onRegister,
  onGuest,
}) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.account.title', language)}
        </h2>
        <p className="text-muted-foreground">{t('setup.account.subtitle', language)}</p>
      </div>

      <div className="space-y-3">
        <Button onClick={onLogin} className="w-full h-12" size="lg">
          {t('button.login', language)}
        </Button>

        <Button onClick={onRegister} variant="outline" className="w-full h-12" size="lg">
          {t('button.register', language)}
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              {language === 'ar' ? 'أو' : language === 'fr' ? 'ou' : 'or'}
            </span>
          </div>
        </div>

        <Button onClick={onGuest} variant="ghost" className="w-full h-12" size="lg">
          {t('button.continue_guest', language)}
        </Button>
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-foreground text-center font-medium">
          {language === 'ar'
            ? '💡 جيد أن تعرف: شارك تجربتك واكسب مكافآت - كل تقييم وحجز يساهم في تحسين المجتمع ويكسبك نقاط'
            : language === 'fr'
            ? '💡 Bon à savoir : Partagez votre expérience et gagnez - chaque avis et réservation améliore la communauté'
            : '💡 Good to know: Share your experience and earn - every review and booking improves the community'}
        </p>
      </div>
    </div>
  );
};
