"use client";

import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dark" | "light" | "premium";
  interactive?: boolean;
  glow?: boolean;
  hover?: "none" | "card" | "interactive";
}

export function GlassCard({
  children,
  className,
  variant = "default",
  interactive = false,
  glow = false,
  hover = "card",
  ...rest
}: GlassCardProps) {
  const bgClass =
    variant === "dark"
      ? glassTheme.bg.glassDark
      : variant === "light"
        ? glassTheme.bg.glassLight
        : variant === "premium"
        ? glassTheme.bg.premium
        : glassTheme.bg.card;

  const hoverClass = hover === "none" ? "" : hover === "interactive" ? glassTheme.hover.interactive : glassTheme.hover.card;
  const interactiveClass = interactive ? `${hoverClass} cursor-pointer transition-all` : "";
  const glowClass = glow ? glassTheme.shadow.glowLarge : glassTheme.shadow.lg;

  return (
    <div className={cn(bgClass, interactiveClass, glowClass, "rounded-xl p-6", className)} {...rest}>
      {children}
    </div>
  );
}
