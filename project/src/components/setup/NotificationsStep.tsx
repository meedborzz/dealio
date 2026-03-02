import React from 'react';
import { Bell } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface NotificationsStepProps {
  language: Language;
  onAllow: () => void;
  onSkip: () => void;
}

export const NotificationsStep: React.FC<NotificationsStepProps> = ({
  language,
  onAllow,
  onSkip,
}) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.notifications.title', language)}
        </h2>
        <p className="text-muted-foreground">
          {t('setup.notifications.subtitle', language)}
        </p>
      </div>

      <div className="space-y-3">
        <Button onClick={onAllow} className="w-full h-12" size="lg">
          {t('button.allow', language)}
        </Button>

        <Button onClick={onSkip} variant="outline" className="w-full h-12" size="lg">
          {t('button.not_now', language)}
        </Button>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground text-center">
          {t('setup.notifications.tip', language)}
        </p>
      </div>
    </div>
  );
};
