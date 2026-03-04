import React from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { SetupTip } from './SetupTip';

interface ThemeStepProps {
  language: Language;
  theme: 'system' | 'light' | 'dark';
  onSelect: (theme: 'system' | 'light' | 'dark') => void;
}

const themes = [
  { value: 'system' as const, icon: Monitor, key: 'setup.theme.system' },
  { value: 'light' as const, icon: Sun, key: 'setup.theme.light' },
  { value: 'dark' as const, icon: Moon, key: 'setup.theme.dark' },
];

export const ThemeStep: React.FC<ThemeStepProps> = ({ language, theme, onSelect }) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.theme.title', language)}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <button
              key={themeOption.value}
              onClick={() => onSelect(themeOption.value)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === themeOption.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
                }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === themeOption.value ? 'bg-primary/20' : 'bg-muted'
                  }`}
              >
                <Icon
                  className={`w-6 h-6 ${theme === themeOption.value ? 'text-primary' : 'text-muted-foreground'
                    }`}
                />
              </div>
              <p
                className={`text-sm font-medium ${theme === themeOption.value ? 'text-primary' : 'text-foreground'
                  }`}
              >
                {t(themeOption.key, language)}
              </p>
            </button>
          );
        })}
      </div>

      <SetupTip text={t('setup.theme.tip', language)} />
    </div>
  );
};
