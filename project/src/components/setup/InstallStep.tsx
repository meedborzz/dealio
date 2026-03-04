import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Zap, Bell } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { SetupTip } from './SetupTip';

interface InstallStepProps {
  language: Language;
  onInstall: () => void;
  onSkip: () => void;
}

export const InstallStep: React.FC<InstallStepProps> = ({ language, onInstall, onSkip }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstall();
      }
      setDeferredPrompt(null);
    }
  };

  if (isIOS) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {t('setup.install.title', language)}
          </h2>
          <p className="text-muted-foreground">
            {t('setup.install.subtitle', language)}
          </p>
        </div>

        <div className="space-y-4 p-4 bg-card border border-border rounded-xl">
          <p className="text-sm font-medium text-foreground">
            {language === 'ar'
              ? 'لتثبيت التطبيق على iOS:'
              : language === 'fr'
                ? 'Pour installer l\'application sur iOS :'
                : 'To install on iOS:'}
          </p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>
              {language === 'ar'
                ? 'انقر على زر المشاركة في Safari'
                : language === 'fr'
                  ? 'Appuyez sur le bouton Partager dans Safari'
                  : 'Tap the Share button in Safari'}
            </li>
            <li>
              {language === 'ar'
                ? 'اختر "إضافة إلى الشاشة الرئيسية"'
                : language === 'fr'
                  ? 'Sélectionnez "Sur l\'écran d\'accueil"'
                  : 'Select "Add to Home Screen"'}
            </li>
            <li>
              {language === 'ar'
                ? 'انقر على "إضافة"'
                : language === 'fr'
                  ? 'Appuyez sur "Ajouter"'
                  : 'Tap "Add"'}
            </li>
          </ol>
        </div>

        <Button onClick={onSkip} variant="outline" className="w-full h-12" size="lg">
          {t('button.not_now', language)}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.install.title', language)}
        </h2>
        <p className="text-muted-foreground">{t('setup.install.subtitle', language)}</p>
      </div>

      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm text-foreground font-medium">
            {language === 'ar' ? 'وصول أسرع' : language === 'fr' ? 'Accès plus rapide' : 'Faster access'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm text-foreground font-medium">
            {language === 'ar' ? 'يعمل دون اتصال' : language === 'fr' ? 'Fonctionne hors ligne' : 'Works offline'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm text-foreground font-medium">
            {language === 'ar' ? 'إشعارات فورية' : language === 'fr' ? 'Notifications push' : 'Push notifications'}
          </p>
        </div>
      </div>

      <SetupTip text={t('setup.install.tip', language)} />

      <div className="space-y-3">
        {isInstallable ? (
          <Button onClick={handleInstall} className="w-full h-12" size="lg">
            {t('button.install', language)}
          </Button>
        ) : (
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'التطبيق مثبت بالفعل'
                : language === 'fr'
                  ? 'Application déjà installée'
                  : 'App already installed'}
            </p>
          </div>
        )}

        <Button onClick={onSkip} variant="outline" className="w-full h-12" size="lg">
          {t('button.not_now', language)}
        </Button>
      </div>
    </div>
  );
};
