import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Monitor, Sun, Moon, MapPin, Bell, Loader2,
  Download, Smartphone, Eye, EyeOff, User, Building2,
  Heart, Calendar, Star, MessageSquare, BarChart3, Users, AlertCircle,
  Hand, Scissors as ScissorsIcon, Sparkles as SparklesIcon, Heart as HeartIcon,
  Droplets, Palette as PaletteIcon, Eye as EyeIcon, Zap as ZapIcon, Dumbbell as DumbbellIcon
} from 'lucide-react';
import { usePreferences } from '@/hooks/usePreferences';
import { useAuth } from '@/hooks/useAuth';
import { AVAILABLE_CATEGORIES, AVAILABLE_CITIES, UserType } from '@/lib/preferences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { t } from '@/lib/i18n';
import Logo from '@/components/Logo';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'fr' as const, name: 'Francais', flag: '🇫🇷' },
  { code: 'ar' as const, name: 'العربية', flag: '🇲🇦' },
];

const themes = [
  { value: 'system' as const, icon: Monitor },
  { value: 'light' as const, icon: Sun },
  { value: 'dark' as const, icon: Moon },
];

const iconMap: Record<string, React.ElementType> = {
  Hand: () => <Hand className="w-4 h-4" />,
  Scissors: () => <ScissorsIcon className="w-4 h-4" />,
  Sparkles: () => <SparklesIcon className="w-4 h-4" />,
  Heart: () => <HeartIcon className="w-4 h-4" />,
  Droplets: () => <Droplets className="w-4 h-4" />,
  Palette: () => <PaletteIcon className="w-4 h-4" />,
  Eye: () => <EyeIcon className="w-4 h-4" />,
  Zap: () => <ZapIcon className="w-4 h-4" />,
  Dumbbell: () => <DumbbellIcon className="w-4 h-4" />,
};

export const SetupWizard: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(preferences.userType || null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showCitySelect, setShowCitySelect] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [notificationBlocked, setNotificationBlocked] = useState(false);

  const lang = preferences.language;

  const getStepCount = () => {
    return selectedUserType ? 5 : 1;
  };

  const getStepButtonText = () => {
    if (currentStep === 0) {
      return t('setup.button.type_select', lang);
    }
    if (currentStep === 1) {
      return selectedUserType === 'personal'
        ? t('setup.button.categories', lang)
        : t('setup.button.business_basics', lang);
    }
    if (currentStep === 2) {
      return t('setup.button.permissions', lang);
    }
    if (currentStep === 3) {
      return t('setup.button.tips', lang);
    }
    return t('button.next', lang);
  };

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleNext = () => {
    if (currentStep < getStepCount() - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowCitySelect(false);
    }
  };

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
    updatePreferences({ userType: type });
  };

  const handleLocationPermission = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      updatePreferences({
        location: { enabled: true, lat: position.coords.latitude, lng: position.coords.longitude },
      });
    } catch {
      setShowCitySelect(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleNotificationPermission = async () => {
    setNotificationLoading(true);
    setNotificationBlocked(false);
    try {
      if ('Notification' in window) {
        const currentPermission = Notification.permission;

        if (currentPermission === 'granted') {
          updatePreferences({ notifications: { enabled: true } });
          return;
        }

        if (currentPermission === 'denied') {
          setNotificationBlocked(true);
          updatePreferences({ notifications: { enabled: false } });
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'denied') {
          setNotificationBlocked(true);
        }
        updatePreferences({ notifications: { enabled: permission === 'granted' } });
      }
    } catch {
      updatePreferences({ notifications: { enabled: false } });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const completeSetupAndGoHome = () => {
    updatePreferences({ setupCompleted: true, userType: selectedUserType || undefined });
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        setAuthError(error.message || 'Login failed');
      } else {
        completeSetupAndGoHome();
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterClick = () => {
    const typeParam = selectedUserType === 'business' ? 'business' : 'personal';
    navigate(`/register?type=${typeParam}`);
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return selectedUserType !== null;
    }
    if (currentStep === 1 && selectedUserType === 'personal') {
      return preferences.categories.length >= 1;
    }
    return true;
  };

  const renderStep0_TypeSelection = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <Logo className="h-12 w-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {t('setup.welcome.title', lang)}
          </h2>
          <p className="text-muted-foreground">
            {lang === 'ar' ? 'كيف ستستخدم التطبيق؟' : lang === 'fr' ? 'Comment allez-vous utiliser l\'app?' : 'How will you use the app?'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleUserTypeSelect('personal')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedUserType === 'personal'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50'
            }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedUserType === 'personal' ? 'bg-primary/10' : 'bg-muted'
            }`}>
            <User className={`w-6 h-6 ${selectedUserType === 'personal' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-left flex-1">
            <p className={`font-semibold ${selectedUserType === 'personal' ? 'text-primary' : 'text-foreground'}`}>
              {lang === 'ar' ? 'شخصي' : lang === 'fr' ? 'Personnel' : 'Personal'}
            </p>
            <p className="text-sm text-muted-foreground">
              {lang === 'ar' ? 'اكتشف واحجز عروض التجميل' : lang === 'fr' ? 'Decouvrez et reservez des offres beaute' : 'Discover and book beauty deals'}
            </p>
          </div>
        </button>

        <button
          onClick={() => handleUserTypeSelect('business')}
          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${selectedUserType === 'business'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50'
            }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedUserType === 'business' ? 'bg-primary/10' : 'bg-muted'
            }`}>
            <Building2 className={`w-6 h-6 ${selectedUserType === 'business' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="text-left flex-1">
            <p className={`font-semibold ${selectedUserType === 'business' ? 'text-primary' : 'text-foreground'}`}>
              {lang === 'ar' ? 'أعمال' : lang === 'fr' ? 'Professionnel' : 'Business'}
            </p>
            <p className="text-sm text-muted-foreground">
              {lang === 'ar' ? 'أدر حجوزاتك وطور نشاطك' : lang === 'fr' ? 'Gerez vos reservations et developpez votre activite' : 'Manage bookings and grow your business'}
            </p>
          </div>
        </button>
      </div>

      <div className="space-y-2 pt-4">
        <p className="text-sm font-medium text-foreground mb-3">
          {lang === 'ar' ? 'اختر لغتك' : lang === 'fr' ? 'Choisissez votre langue' : 'Choose your language'}
        </p>
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => updatePreferences({ language: l.code })}
            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${preferences.language === l.code
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
              }`}
          >
            <span className="text-xl">{l.flag}</span>
            <span className={`font-medium ${preferences.language === l.code ? 'text-primary' : 'text-foreground'}`}>
              {l.name}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground mb-3">
          {lang === 'ar' ? 'اختر المظهر' : lang === 'fr' ? 'Choisissez le theme' : 'Choose theme'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.value}
                onClick={() => updatePreferences({ theme: themeOption.value })}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${preferences.theme === themeOption.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <Icon className={`w-5 h-5 ${preferences.theme === themeOption.value ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${preferences.theme === themeOption.value ? 'text-primary' : 'text-foreground'}`}>
                  {t(`setup.theme.${themeOption.value}`, lang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep1_PersonalCategories = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.categories.title', lang)}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('setup.categories.subtitle', lang)}
        </p>
        <p className="text-xs font-medium text-primary">
          {preferences.categories.length} selected {preferences.categories.length >= 1 && '✓'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {AVAILABLE_CATEGORIES.map((category) => {
          const isSelected = preferences.categories.includes(category.id);
          const IconComponent = iconMap[category.icon];
          return (
            <button
              key={category.id}
              onClick={() => {
                const categories = preferences.categories.includes(category.id)
                  ? preferences.categories.filter((id) => id !== category.id)
                  : [...preferences.categories, category.id];
                updatePreferences({ categories });
              }}
              className={`p-3 rounded-xl border-2 transition-all ${isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
                }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                  {IconComponent && <IconComponent />}
                </div>
                <p className={`text-[10px] font-medium leading-tight text-center ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {category.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep1_BusinessBasics = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {lang === 'ar' ? 'مرحباً بك في Dealio' : lang === 'fr' ? 'Bienvenue sur Dealio' : 'Welcome to Dealio'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {lang === 'ar' ? 'منصة لتطوير أعمالك' : lang === 'fr' ? 'La plateforme pour developper votre activite' : 'The platform to grow your business'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {lang === 'ar' ? 'إدارة الحجوزات' : lang === 'fr' ? 'Gestion des reservations' : 'Booking Management'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'ar' ? 'استقبل وأدر حجوزات العملاء بسهولة'
                : lang === 'fr' ? 'Recevez et gerez facilement les reservations clients'
                  : 'Receive and manage customer bookings easily'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {lang === 'ar' ? 'تحليلات الأداء' : lang === 'fr' ? 'Analyses de performance' : 'Performance Analytics'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'ar' ? 'تتبع إحصائيات نشاطك ونموك'
                : lang === 'fr' ? 'Suivez les statistiques de votre activite et croissance'
                  : 'Track your business stats and growth'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {lang === 'ar' ? 'زيادة الظهور' : lang === 'fr' ? 'Augmentez votre visibilite' : 'Increase Visibility'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'ar' ? 'انشر عروضك واجذب عملاء جدد'
                : lang === 'fr' ? 'Publiez vos offres et attirez de nouveaux clients'
                  : 'Publish your offers and attract new customers'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {lang === 'ar' ? 'التواصل مع العملاء' : lang === 'fr' ? 'Communication clients' : 'Customer Communication'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'ar' ? 'تواصل مباشرة مع عملائك عبر الرسائل'
                : lang === 'fr' ? 'Communiquez directement avec vos clients par messagerie'
                  : 'Communicate directly with your customers via messaging'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2_Permissions = () => {
    if (showCitySelect) {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {lang === 'ar' ? 'اختر مدينتك' : lang === 'fr' ? 'Choisissez votre ville' : 'Choose your city'}
            </h2>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {AVAILABLE_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  updatePreferences({ location: { enabled: true, city } });
                  setShowCitySelect(false);
                }}
                className={`w-full p-3 rounded-lg border transition-all text-left ${preferences.location.city === city
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <p className="font-medium text-foreground">{city}</p>
              </button>
            ))}
          </div>

          <Button variant="ghost" onClick={() => setShowCitySelect(false)} className="w-full">
            {lang === 'ar' ? 'رجوع' : lang === 'fr' ? 'Retour' : 'Back'}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'إعداد الأذونات' : lang === 'fr' ? 'Configurer les permissions' : 'Setup Permissions'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {lang === 'ar' ? 'اختياري - يمكنك تخطي هذه الخطوة' : lang === 'fr' ? 'Optionnel - vous pouvez ignorer' : 'Optional - you can skip this'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {lang === 'ar' ? 'الموقع' : lang === 'fr' ? 'Localisation' : 'Location'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {preferences.location.enabled
                    ? (lang === 'ar' ? 'مفعل ✓' : lang === 'fr' ? 'Active ✓' : 'Enabled ✓')
                    : (lang === 'ar' ? 'ابحث عن عروض قريبة' : lang === 'fr' ? 'Trouvez des offres proches' : 'Find nearby deals')}
                </p>
              </div>
              {!preferences.location.enabled && (
                <Button size="sm" onClick={handleLocationPermission} disabled={locationLoading}>
                  {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'ar' ? 'تفعيل' : lang === 'fr' ? 'Activer' : 'Enable')}
                </Button>
              )}
            </div>
            {!preferences.location.enabled && (
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowCitySelect(true)}>
                {lang === 'ar' ? 'أو اختر مدينة يدوياً' : lang === 'fr' ? 'Ou choisir une ville' : 'Or choose city manually'}
              </Button>
            )}
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notificationBlocked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/10'}`}>
                {notificationBlocked ? <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" /> : <Bell className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  {lang === 'ar' ? 'الإشعارات' : lang === 'fr' ? 'Notifications' : 'Notifications'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {preferences.notifications.enabled
                    ? (lang === 'ar' ? 'مفعل ✓' : lang === 'fr' ? 'Active ✓' : 'Enabled ✓')
                    : notificationBlocked
                      ? (lang === 'ar' ? 'محظور في المتصفح' : lang === 'fr' ? 'Bloque dans le navigateur' : 'Blocked in browser')
                      : (lang === 'ar' ? 'تنبيهات العروض والحجوزات' : lang === 'fr' ? 'Alertes offres et reservations' : 'Deal and booking alerts')}
                </p>
              </div>
              {!preferences.notifications.enabled && !notificationBlocked && (
                <Button size="sm" onClick={handleNotificationPermission} disabled={notificationLoading}>
                  {notificationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'ar' ? 'تفعيل' : lang === 'fr' ? 'Activer' : 'Enable')}
                </Button>
              )}
            </div>
            {notificationBlocked && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {lang === 'ar'
                    ? 'انقر على أيقونة القفل بجوار شريط العنوان، ثم اسمح بالإشعارات'
                    : lang === 'fr'
                      ? 'Cliquez sur l\'icone du cadenas pres de la barre d\'adresse, puis autorisez les notifications'
                      : 'Click the lock icon near the address bar, then allow notifications'}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleNotificationPermission}
                  className="mt-2 h-7 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  {lang === 'ar' ? 'إعادة المحاولة' : lang === 'fr' ? 'Reessayer' : 'Try Again'}
                </Button>
              </div>
            )}
          </div>

          {(deferredPrompt || isIOS) && (
            <div className="p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  {isIOS ? <Smartphone className="w-5 h-5 text-primary" /> : <Download className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {lang === 'ar' ? 'تثبيت التطبيق' : lang === 'fr' ? 'Installer l\'app' : 'Install App'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === 'ar' ? 'وصول أسرع من الشاشة الرئيسية' : lang === 'fr' ? 'Acces rapide depuis l\'ecran d\'accueil' : 'Quick access from home screen'}
                  </p>
                </div>
                {deferredPrompt && !isIOS && (
                  <Button size="sm" onClick={handleInstall}>
                    {lang === 'ar' ? 'تثبيت' : lang === 'fr' ? 'Installer' : 'Install'}
                  </Button>
                )}
              </div>
              {isIOS && (
                <p className="text-xs text-muted-foreground mt-2 pl-13">
                  {lang === 'ar'
                    ? 'في Safari: اضغط على المشاركة -> إضافة للشاشة الرئيسية'
                    : lang === 'fr'
                      ? 'Dans Safari: Appuyez Partager -> Sur l\'ecran d\'accueil'
                      : 'In Safari: Tap Share -> Add to Home Screen'}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep2_GoodToKnow = () => {
    if (selectedUserType === 'business') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {lang === 'ar' ? 'معلومات مفيدة' : lang === 'fr' ? 'Bon a savoir' : 'Good to Know'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {lang === 'ar' ? 'نصائح للأعمال' : lang === 'fr' ? 'Conseils pour les pros' : 'Tips for businesses'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {lang === 'ar' ? 'إدارة الحجوزات' : lang === 'fr' ? 'Gestion des reservations' : 'Booking Management'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'ar' ? 'استخدم وضع الجهاز اللوحي لإدارة الحجوزات بسهولة في صالونك'
                    : lang === 'fr' ? 'Utilisez le mode tablette pour gerer facilement les reservations dans votre salon'
                      : 'Use tablet mode to easily manage bookings at your salon'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {lang === 'ar' ? 'الرد على الطلبات' : lang === 'fr' ? 'Repondre aux demandes' : 'Respond to Requests'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'ar' ? 'رد بسرعة على طلبات العملاء للحصول على تقييمات أفضل'
                    : lang === 'fr' ? 'Repondez rapidement aux demandes clients pour de meilleurs avis'
                      : 'Respond quickly to customer requests for better ratings'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {lang === 'ar' ? 'زيادة الظهور' : lang === 'fr' ? 'Augmentez votre visibilite' : 'Increase Visibility'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'ar' ? 'أضف صور عالية الجودة وعروض جذابة لجذب المزيد من العملاء'
                    : lang === 'fr' ? 'Ajoutez des photos de qualite et des offres attractives'
                      : 'Add quality photos and attractive offers to attract more customers'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {lang === 'ar' ? 'إكمال الإعداد لاحقاً' : lang === 'fr' ? 'Configuration complete plus tard' : 'Complete Setup Later'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === 'ar' ? 'يمكنك إكمال ملفك الشخصي للأعمال بعد التسجيل'
                    : lang === 'fr' ? 'Vous pouvez completer votre profil business apres inscription'
                      : 'You can complete your business profile after registration'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {lang === 'ar' ? 'معلومات مفيدة' : lang === 'fr' ? 'Bon a savoir' : 'Good to Know'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {lang === 'ar' ? 'نصائح للاستفادة القصوى' : lang === 'fr' ? 'Conseils pour en profiter au max' : 'Tips to get the most out of it'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {lang === 'ar' ? 'اكتشف العروض' : lang === 'fr' ? 'Decouvrez les offres' : 'Discover Deals'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar' ? 'تصفح العروض الحصرية من صالونات التجميل القريبة منك'
                  : lang === 'fr' ? 'Parcourez les offres exclusives des salons pres de chez vous'
                    : 'Browse exclusive offers from beauty salons near you'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {lang === 'ar' ? 'احفظ المفضلة' : lang === 'fr' ? 'Sauvegardez vos favoris' : 'Save Favorites'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar' ? 'احفظ صالوناتك المفضلة للوصول السريع إليها'
                  : lang === 'fr' ? 'Enregistrez vos salons preferes pour un acces rapide'
                    : 'Save your favorite salons for quick access'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {lang === 'ar' ? 'تنبيهات فورية' : lang === 'fr' ? 'Alertes instantanees' : 'Instant Alerts'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar' ? 'فعّل الإشعارات لتكون أول من يعرف عن العروض الجديدة'
                  : lang === 'fr' ? 'Activez les notifs pour etre le premier informe des nouvelles offres'
                    : 'Enable notifications to be the first to know about new deals'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {lang === 'ar' ? 'احجز بسهولة' : lang === 'fr' ? 'Reservez facilement' : 'Book Easily'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar' ? 'احجز موعدك في ثوانٍ واحصل على تأكيد فوري'
                  : lang === 'fr' ? 'Reservez en quelques secondes et recevez une confirmation instantanee'
                    : 'Book in seconds and receive instant confirmation'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep3_FinalAuth = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          {lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Connexion' : 'Sign In'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {lang === 'ar' ? 'سجل الدخول للمتابعة' : lang === 'fr' ? 'Connectez-vous pour continuer' : 'Sign in to continue'}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {lang === 'ar' ? 'البريد الإلكتروني' : lang === 'fr' ? 'Email' : 'Email'}
          </label>
          <Input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : lang === 'fr' ? 'Entrez votre email' : 'Enter your email'}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {lang === 'ar' ? 'كلمة المرور' : lang === 'fr' ? 'Mot de passe' : 'Password'}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder={lang === 'ar' ? 'أدخل كلمة المرور' : lang === 'fr' ? 'Entrez votre mot de passe' : 'Enter your password'}
              required
              className="h-12 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {authError && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {authError}
          </p>
        )}

        <Button type="submit" disabled={authLoading} className="w-full h-12" size="lg">
          {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (lang === 'ar' ? 'تسجيل الدخول' : lang === 'fr' ? 'Se connecter' : 'Sign In')}
        </Button>
      </form>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            {lang === 'ar' ? 'أو' : lang === 'fr' ? 'ou' : 'or'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={handleRegisterClick} variant="outline" className="w-full h-12" size="lg">
          {lang === 'ar' ? 'إنشاء حساب جديد' : lang === 'fr' ? 'Creer un compte' : 'Create Account'}
        </Button>

        <Button onClick={completeSetupAndGoHome} variant="ghost" className="w-full h-12" size="lg">
          {t('button.continue_guest', lang)}
        </Button>
      </div>
    </div>
  );

  const renderStep = () => {
    if (currentStep === 0) {
      return renderStep0_TypeSelection();
    }

    if (selectedUserType === 'personal') {
      switch (currentStep) {
        case 1: return renderStep1_PersonalCategories();
        case 2: return renderStep2_Permissions();
        case 3: return renderStep2_GoodToKnow();
        case 4: return renderStep3_FinalAuth();
        default: return null;
      }
    }

    if (selectedUserType === 'business') {
      switch (currentStep) {
        case 1: return renderStep1_BusinessBasics();
        case 2: return renderStep2_Permissions();
        case 3: return renderStep2_GoodToKnow();
        case 4: return renderStep3_FinalAuth();
        default: return null;
      }
    }

    return null;
  };

  const isLastStep = currentStep === getStepCount() - 1;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        {currentStep > 0 ? (
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="flex-1 mx-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / getStepCount()) * 100}%` }}
            />
          </div>
        </div>

        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-lg mx-auto">{renderStep()}</div>
      </div>

      {!isLastStep && (
        <div className="p-4 border-t border-border bg-background">
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="w-full h-12"
            size="lg"
          >
            {getStepButtonText()}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
