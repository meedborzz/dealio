import { useState, useEffect, useCallback } from 'react';
import { getPreferences, savePreferences, UserPreferences } from '@/lib/preferences';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences());

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    const updated = savePreferences(updates);
    setPreferences(updated);

    if (updates.language) {
      document.documentElement.lang = updates.language;
      document.documentElement.dir = updates.language === 'ar' ? 'rtl' : 'ltr';
    }

    if (updates.theme !== undefined) {
      applyTheme(updated.theme);
    }

    window.dispatchEvent(new CustomEvent('preferences-updated', { detail: updated }));
  }, []);

  useEffect(() => {
    const onPrefsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<UserPreferences>).detail;
      if (detail) {
        setPreferences(detail);
      } else {
        setPreferences(getPreferences());
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'dealio-preferences') {
        setPreferences(getPreferences());
      }
    };

    window.addEventListener('preferences-updated', onPrefsUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('preferences-updated', onPrefsUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const applyTheme = useCallback((theme: 'system' | 'light' | 'dark') => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(preferences.theme);
    document.documentElement.lang = preferences.language;
    document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
  }, [preferences.theme, preferences.language, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preferences.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme, applyTheme]);

  return {
    preferences,
    updatePreferences,
  };
};
