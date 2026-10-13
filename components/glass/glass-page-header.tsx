"use client";

import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";

interface GlassPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  cta?: React.ReactNode;
}

export function GlassPageHeader({ 
  title, 
  description, 
  subtitle,
  icon,
  cta,
  className 
}: GlassPageHeaderProps) {
  return (
    <div className={cn(glassTheme.bg.premium, "rounded-xl p-8 shadow-xl", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className={cn(
                "p-3 rounded-lg",
                "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30"
              )}>
                {icon}
              </div>
            )}
            {subtitle && (
              <span className={cn("text-xs font-bold uppercase tracking-wider", glassTheme.text.accent)}>
                {subtitle}
              </span>
            )}
          </div>
          <h1 className={cn(glassTheme.typography.h2, glassTheme.text.primary, "mb-2")}>
            {title}
          </h1>
          {description && (
            <p className={cn("text-lg", glassTheme.text.secondary, "max-w-2xl")}>
              {description}
            </p>
          )}
        </div>
        {cta && <div className="flex-shrink-0">{cta}</div>}
      </div>
    </div>
  );
}
