import React, { useState, useEffect } from 'react';
import { Download, X, Zap, Bell, Wifi, Share2, Plus, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { usePreferences } from '@/hooks/usePreferences';
import { t } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isActualMobileDevice = (): boolean => {
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileScreen = window.innerWidth < 768;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return hasTouchScreen && isMobileScreen && isMobileUserAgent;
};

const isActualIOSDevice = (): boolean => {
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isInSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

  return iOS && hasTouchScreen && isInSafari;
};

const InstallBottomSheet: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [promptType, setPromptType] = useState<'ios' | 'android' | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const { preferences } = usePreferences();
  const lang = preferences.language;
  const isRTL = lang === 'ar';

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone || !isActualMobileDevice()) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const hasBeenPrompted = localStorage.getItem('dealio-install-prompted');
      const promptDismissedCount = parseInt(localStorage.getItem('dealio-install-dismissed-count') || '0');

      if (!hasBeenPrompted && promptDismissedCount < 3) {
        setTimeout(() => {
          setPromptType('android');
          setShowSheet(true);
        }, 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    const lastPromptTime = localStorage.getItem('dealio-last-install-prompt');
    if (lastPromptTime) {
      const daysSinceLastPrompt = (Date.now() - parseInt(lastPromptTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastPrompt > 7) {
        localStorage.removeItem('dealio-install-prompted');
        localStorage.removeItem('dealio-install-dismissed-count');
      }
    }

    if (isActualIOSDevice()) {
      const hasBeenPrompted = localStorage.getItem('dealio-install-prompted');
      const promptDismissedCount = parseInt(localStorage.getItem('dealio-install-dismissed-count') || '0');

      if (!hasBeenPrompted && promptDismissedCount < 3) {
        setTimeout(() => {
          setPromptType('ios');
          setShowSheet(true);
        }, 5000);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      localStorage.setItem('dealio-install-prompted', 'true');

      if (outcome === 'accepted') {
        handleClose();
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSheet(false);
      setIsClosing(false);
    }, 300);
  };

  const handleDismiss = () => {
    const currentCount = parseInt(localStorage.getItem('dealio-install-dismissed-count') || '0');
    localStorage.setItem('dealio-install-dismissed-count', (currentCount + 1).toString());
    localStorage.setItem('dealio-last-install-prompt', Date.now().toString());

    if (currentCount + 1 >= 3) {
      localStorage.setItem('dealio-install-prompted', 'true');
    }

    handleClose();
  };

  if (!showSheet || isStandalone || !promptType) {
    return null;
  }

  const isIOS = promptType === 'ios';
  const canInstall = deferredPrompt !== null && promptType === 'android';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleDismiss}
        style={{
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[61] bg-card rounded-t-3xl shadow-2xl border-t border-border transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto ${
          isClosing ? 'translate-y-full' : 'translate-y-0'
        } ${isRTL ? 'rtl' : 'ltr'}`}
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
          touchAction: 'pan-y'
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#c8a2c9] to-[#b892b9] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{t('install.title', lang)}</h3>
                <p className="text-sm text-muted-foreground">{t('install.subtitle', lang)}</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-center font-medium text-foreground">{t('install.benefit1', lang)}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-center font-medium text-foreground">{t('install.benefit2', lang)}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Wifi className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-center font-medium text-foreground">{t('install.benefit3', lang)}</span>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-foreground mb-3">{t('install.ios_instructions', lang)}</p>
                <div className="flex items-center gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">1. Share</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">2. Add</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="w-full h-12"
              >
                {t('button.not_now', lang)}
              </Button>
            </div>
          ) : canInstall ? (
            <div className="space-y-3">
              <Button
                onClick={handleInstall}
                className="w-full h-12 bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a67ba8]"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('install.button', lang)}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="w-full h-10"
              >
                {t('button.not_now', lang)}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="w-full h-12"
            >
              {t('button.not_now', lang)}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default InstallBottomSheet;
