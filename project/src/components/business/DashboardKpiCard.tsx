import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  loading?: boolean;
}

export const DashboardKpiCard: React.FC<DashboardKpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading = false
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground truncate">{title}</p>
              {loading ? (
                <div className="h-7 w-20 bg-muted rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground truncate">{value}</p>
              )}
            </div>
          </div>
          {trend !== undefined && !loading && (
            <div className={`flex items-center space-x-1 shrink-0 ml-2 ${
              trend >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'
            }`}>
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-xs font-semibold">{Math.abs(trend).toFixed(0)}%</span>
            </div>
          )}
        </div>
        {subtitle && !loading && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
