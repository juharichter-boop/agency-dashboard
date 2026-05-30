import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className={`bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-slate-700 transition-colors ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-slate-500">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={`mt-4 flex items-center gap-2 text-sm font-semibold ${
          trend.direction === 'up'
            ? 'text-lime-400'
            : 'text-red-400'
        }`}>
          {trend.direction === 'up' ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-slate-500 font-normal">vs last period</span>
        </div>
      )}
    </div>
  );
}
