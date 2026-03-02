import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Palette, Tag, MapPin, Bell, Download, RefreshCw, Smartphone, Mail, MessageSquare, Check, Share2, Plus, AlertCircle } from 'lucide-react';
import { usePreferences } from '@/hooks/usePreferences';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useOneSignal } from '@/hooks/useOneSignal';
import { Button } from '@/components/ui/button';
import { AVAILABLE_CATEGORIES, AVAILABLE_CITIES, resetPreferences } from '@/lib/preferences';
import PageHeader from '@/components/PageHeader';
import { t } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SettingsPage: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const { preferences: notifPrefs, updatePreference, saving: savingNotifPrefs } = useNotificationPreferences();
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, loading: pushLoading, isIOSNotInstalled, subscribe, unsubscribe } = useOneSignal();
  const navigate = useNavigate();
  const lang = preferences.language;

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleLanguageChange = (language: 'ar' | 'fr' | 'en') => {
    updatePreferences({ language });
  };

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    updatePreferences({ theme });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const categories = preferences.categories.includes(categoryId)
      ? preferences.categories.filter((id) => id !== categoryId)
      : [...preferences.categories, categoryId];
    updatePreferences({ categories });
  };

  const handleCityChange = (city: string) => {
    updatePreferences({
      location: { ...preferences.location, city },
    });
  };

  const handleLocationToggle = () => {
    updatePreferences({
      location: { ...preferences.location, enabled: !preferences.location.enabled },
    });
  };

  const handleNotificationsToggle = () => {
    updatePreferences({
      notifications: { enabled: !preferences.notifications.enabled },
    });
  };

  const handleResetSetup = () => {
    if (confirm(preferences.language === 'ar' ? 'هل أنت متأكد؟' : preferences.language === 'fr' ? 'Etes-vous sur ?' : 'Are you sure?')) {
      resetPreferences();
      window.location.reload();
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title={preferences.language === 'ar' ? 'الإعدادات' : preferences.language === 'fr' ? 'Paramètres' : 'Settings'}
        onBack={() => navigate(-1)}
      />

      <div className="p-4 space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'ar' ? 'اللغة' : preferences.language === 'fr' ? 'Langue' : 'Language'}
            </h2>
          </div>
          <div className="space-y-2">
            {[
              { code: 'ar' as const, name: 'العربية' },
              { code: 'fr' as const, name: 'Français' },
              { code: 'en' as const, name: 'English' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  preferences.language === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="font-medium text-foreground">{lang.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'ar' ? 'المظهر' : preferences.language === 'fr' ? 'Thème' : 'Theme'}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'system' as const, label: preferences.language === 'ar' ? 'نظام' : preferences.language === 'fr' ? 'Système' : 'System' },
              { value: 'light' as const, label: preferences.language === 'ar' ? 'فاتح' : preferences.language === 'fr' ? 'Clair' : 'Light' },
              { value: 'dark' as const, label: preferences.language === 'ar' ? 'داكن' : preferences.language === 'fr' ? 'Sombre' : 'Dark' },
            ].map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={`p-3 rounded-lg border transition-all ${
                  preferences.theme === theme.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <span className="text-sm font-medium text-foreground">{theme.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'ar' ? 'الفئات' : preferences.language === 'fr' ? 'Catégories' : 'Categories'}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_CATEGORIES.map((category) => {
              const isSelected = preferences.categories.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium text-foreground">{category.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'ar' ? 'الموقع' : preferences.language === 'fr' ? 'Localisation' : 'Location'}
            </h2>
          </div>
          <div className="space-y-2">
            <button
              onClick={handleLocationToggle}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                preferences.location.enabled
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <span className="font-medium text-foreground">
                {preferences.location.enabled
                  ? preferences.language === 'ar' ? 'مفعل' : preferences.language === 'fr' ? 'Activé' : 'Enabled'
                  : preferences.language === 'ar' ? 'معطل' : preferences.language === 'fr' ? 'Désactivé' : 'Disabled'}
              </span>
            </button>
            {preferences.location.enabled && !preferences.location.lat && (
              <select
                value={preferences.location.city || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
              >
                <option value="">
                  {preferences.language === 'ar' ? 'اختر المدينة' : preferences.language === 'fr' ? 'Choisissez une ville' : 'Choose a city'}
                </option>
                {AVAILABLE_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'ar' ? 'الإشعارات' : preferences.language === 'fr' ? 'Notifications' : 'Notifications'}
            </h2>
          </div>

          <div className="space-y-3">
            {isIOSNotInstalled && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {preferences.language === 'fr'
                      ? 'Pour activer les notifications sur iPhone: Ajouter Dealio à l\'écran d\'accueil d\'abord.'
                      : 'To enable notifications on iPhone: Add Dealio to home screen first.'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {preferences.language === 'fr' ? 'Canaux de notification' : 'Notification Channels'}
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {preferences.language === 'fr' ? 'Notifications push' : 'Push notifications'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.push_enabled && pushSubscribed}
                    onChange={async (e) => {
                      if (e.target.checked) {
                        const success = await subscribe();
                        if (success) {
                          await updatePreference('push_enabled', true);
                        }
                      } else {
                        await unsubscribe();
                        await updatePreference('push_enabled', false);
                      }
                    }}
                    disabled={!pushSupported || savingNotifPrefs || pushLoading || isIOSNotInstalled}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {preferences.language === 'fr' ? 'Email' : 'Email'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.email_enabled}
                    onChange={(e) => updatePreference('email_enabled', e.target.checked)}
                    disabled={savingNotifPrefs}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {preferences.language === 'fr' ? 'SMS' : 'SMS'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrefs.sms_enabled}
                    onChange={(e) => updatePreference('sms_enabled', e.target.checked)}
                    disabled={savingNotifPrefs}
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {preferences.language === 'fr' ? 'Types de notifications' : 'Notification Types'}
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer">
                  <span className="text-sm text-foreground">
                    {preferences.language === 'fr' ? 'Rappels de réservation' : 'Booking reminders'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifPrefs.booking_reminders}
                    onChange={(e) => updatePreference('booking_reminders', e.target.checked)}
                    disabled={savingNotifPrefs}
                    className="w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded hover:bg-accent/50 cursor-pointer">
                  <span className="text-sm text-foreground">
                    {preferences.language === 'fr' ? 'Alertes de nouvelles offres' : 'New deal alerts'}
                  </span>
                  <input
                    type="checkbox"
                    checked={notifPrefs.deal_alerts}
                    onChange={(e) => updatePreference('deal_alerts', e.target.checked)}
                    disabled={savingNotifPrefs}
                    className="w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t('install.title', lang)}
            </h2>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            {isInstalled ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#c8a2c9]/20 dark:bg-[#c8a2c9]/30 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#c8a2c9] dark:text-[#d6aad7]" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('install.installed', lang)}</p>
                  <p className="text-sm text-muted-foreground">{t('install.subtitle', lang)}</p>
                </div>
              </div>
            ) : isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground">{t('install.ios_instructions', lang)}</p>
                <div className="flex items-center gap-4 justify-center py-2">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">1. Share</span>
                  </div>
                  <div className="w-4 h-0.5 bg-muted-foreground/30" />
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">2. Add</span>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t('install.subtitle', lang)}</p>
                <Button onClick={handleInstall} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  {t('install.button', lang)}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {lang === 'ar' ? 'التطبيق متاح للتثبيت من المتصفح' : lang === 'fr' ? 'L\'app est disponible pour installation depuis le navigateur' : 'App is available for installation from the browser'}
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {preferences.language === 'ar' ? 'إعادة تعيين' : preferences.language === 'fr' ? 'Reinitialiser' : 'Reset'}
            </h2>
          </div>
          <Button onClick={handleResetSetup} variant="destructive" className="w-full">
            {preferences.language === 'ar' ? 'إعادة تعيين الإعدادات' : preferences.language === 'fr' ? 'Reinitialiser les preferences' : 'Reset preferences'}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
