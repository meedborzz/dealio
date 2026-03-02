import React from 'react';
import { Globe } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface LanguageStepProps {
  language: Language;
  onSelect: (lang: Language) => void;
}

const languages: Array<{ code: Language; name: string; nativeName: string }> = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

export const LanguageStep: React.FC<LanguageStepProps> = ({ language, onSelect }) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.language.title', language)}
        </h2>
      </div>

      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              language === lang.code
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="font-semibold text-foreground">{lang.nativeName}</p>
                <p className="text-sm text-muted-foreground">{lang.name}</p>
              </div>
              {language === lang.code && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          {t('setup.language.tip', language)}
        </p>
      </div>
    </div>
  );
};
