'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  barClassName?: string;
  color?: 'indigo' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'gradient';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  color = 'gradient',
  showLabel = false,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    indigo: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
    cyan: 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    emerald: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]',
    amber: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]',
    rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_14px_rgba(99,102,241,0.4)]',
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-1">
          <span>Progress</span>
          <span className="text-slate-200 font-semibold">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40 p-[1px]',
          heights[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            colorStyles[color],
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
