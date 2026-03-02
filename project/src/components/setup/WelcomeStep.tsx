import React from 'react';
import { Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

interface WelcomeStepProps {
  language: Language;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ language }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.welcome.title', language)}
        </h2>
        <p className="text-muted-foreground text-base">
          {t('setup.welcome.subtitle', language)}
        </p>
      </div>

      <div className="w-full p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-sm text-foreground flex items-center justify-center gap-2">
          <span className="text-primary">✨</span>
          {t('setup.welcome.tip', language)}
        </p>
      </div>
    </div>
  );
};
