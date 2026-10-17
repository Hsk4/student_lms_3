import React from 'react';
import { Card } from '@/components/ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon: LucideIcon;
  colorScheme?: 'indigo' | 'cyan' | 'purple' | 'emerald' | 'amber';
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  colorScheme = 'indigo',
}: StatCardProps) {
  const schemes = {
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
      glow: 'from-indigo-600/10 to-transparent',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      glow: 'from-cyan-600/10 to-transparent',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      glow: 'from-purple-600/10 to-transparent',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      glow: 'from-emerald-600/10 to-transparent',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      glow: 'from-amber-600/10 to-transparent',
    },
  };

  const scheme = schemes[colorScheme];

  return (
    <Card
      hoverEffect
      className={cn('relative p-5 group overflow-hidden border-indigo-500/15', scheme.border)}
    >
      {/* Subtle top corner gradient glow */}
      <div
        className={cn(
          'absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br blur-2xl pointer-events-none transition-opacity opacity-50 group-hover:opacity-100',
          scheme.glow
        )}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </div>
        </div>
        <div
          className={cn(
            'p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-110 shadow-lg',
            scheme.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={cn(
                'font-semibold px-2 py-0.5 rounded-full text-[11px]',
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
