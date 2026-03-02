import React from 'react';
import { Hand, Scissors, Sparkles, Heart, Droplets, Palette, Eye, Zap, Dumbbell } from 'lucide-react';
import { t, type Language } from '@/lib/i18n';
import { AVAILABLE_CATEGORIES } from '@/lib/preferences';

interface CategoriesStepProps {
  language: Language;
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
}

const iconMap: Record<string, any> = {
  Hand,
  Scissors,
  Sparkles,
  Heart,
  Droplets,
  Palette,
  Eye,
  Zap,
  Dumbbell,
};

export const CategoriesStep: React.FC<CategoriesStepProps> = ({
  language,
  selectedCategories,
  onToggle,
}) => {
  const isMinimumSelected = selectedCategories.length >= 3;

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <div className="text-center space-y-2 mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-foreground">
          {t('setup.categories.title', language)}
        </h2>
        <p className="text-muted-foreground">
          {t('setup.categories.subtitle', language)}
        </p>
        <p className="text-sm font-medium text-primary">
          {selectedCategories.length} / 3 {isMinimumSelected && '✓'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 px-1">
        <div className="grid grid-cols-2 gap-3 pb-4">
          {AVAILABLE_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            const IconComponent = iconMap[category.icon];
            return (
              <button
                key={category.id}
                onClick={() => onToggle(category.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {IconComponent && <IconComponent className={`w-5 h-5 ${
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    }`} />}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {category.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex-shrink-0">
        <p className="text-xs text-foreground text-center font-medium">
          {t('setup.categories.tip', language)}
        </p>
      </div>
    </div>
  );
};
