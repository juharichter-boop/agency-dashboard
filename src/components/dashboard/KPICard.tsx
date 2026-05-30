import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function KPICard({
  title,
  value,
  unit,
  icon,
  trend,
  className = '',
}: KPICardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-slate-400 dark:text-slate-600">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={`mt-4 flex items-center gap-1 text-sm font-medium ${
          trend.direction === 'up'
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}% vs last period</span>
        </div>
      )}
    </div>
  );
}
