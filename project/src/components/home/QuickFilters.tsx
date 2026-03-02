import React from 'react';
import { MapPin, Clock, TrendingDown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

interface QuickFiltersProps {
  onFilterChange: (filterId: string) => void;
  activeFilters: string[];
}

const QUICK_FILTERS = [
  { id: 'near_me', label: 'Near me', icon: <MapPin className="h-3 w-3" /> },
  { id: 'open_now', label: 'Open now', icon: <Clock className="h-3 w-3" /> },
  { id: 'deals_today', label: 'Deals today', icon: <Sparkles className="h-3 w-3" /> },
  { id: 'under_200', label: 'Under 200 DH', icon: <TrendingDown className="h-3 w-3" /> },
];

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onFilterChange,
  activeFilters,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {QUICK_FILTERS.map((filter) => {
        const isActive = activeFilters.includes(filter.id);
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
};
