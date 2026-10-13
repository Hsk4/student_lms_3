// Enhanced glassmorphism theme with improved typography
export const glassTheme = {
  // Backgrounds
  bg: {
    dark: "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950",
    glass: "backdrop-blur-xl bg-white/10 border border-white/20",
    glassLight: "backdrop-blur-md bg-white/20 border border-white/30",
    glassDark: "backdrop-blur-md bg-emerald-950/40 border border-emerald-400/20",
    card: "backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl",
    sidebar: "backdrop-blur-xl bg-white/10 border-white/20 shadow-xl",
    premium: "backdrop-blur-xl bg-gradient-to-br from-white/15 to-white/10 border border-white/20 shadow-2xl",
    // Teal dashboard theme
    teal: "backdrop-blur-xl bg-gradient-to-br from-teal-950/60 via-slate-900/40 to-slate-950/60 border border-teal-400/20",
    tealCard: "backdrop-blur-xl bg-gradient-to-br from-teal-900/30 to-slate-900/20 border border-teal-500/30",
    tealPremium: "backdrop-blur-xl bg-gradient-to-br from-teal-900/40 via-slate-800/30 to-slate-900/40 border border-teal-400/40 shadow-xl shadow-teal-500/10",
  },
  // Hover states
  hover: {
    glass: "hover:bg-white/15 hover:border-white/30",
    glassDark: "hover:bg-emerald-950/60 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20",
    card: "hover:shadow-2xl hover:shadow-black/10 hover:bg-white/15",
    interactive: "hover:bg-white/20 hover:shadow-lg hover:scale-105",
    teal: "hover:bg-teal-900/40 hover:border-teal-400/40 hover:shadow-lg hover:shadow-teal-500/15 transition-all",
    tealCard: "hover:bg-teal-900/50 hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-500/20 transition-all",
  },
  // Interactive states
  interactive: {
    focus: "focus:ring-2 focus:ring-emerald-400/50 focus-visible:outline-none",
    active: "active:scale-98",
    disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  },
  // Shadows
  shadow: {
    sm: "shadow-sm shadow-black/5",
    md: "shadow-md shadow-black/10",
    lg: "shadow-lg shadow-black/20",
    xl: "shadow-xl shadow-black/30",
    glow: "shadow-lg shadow-emerald-500/20",
    glowLarge: "shadow-2xl shadow-emerald-500/30",
  },
  // Text colors
  text: {
    primary: "text-white",
    secondary: "text-white/70",
    muted: "text-white/60",
    accent: "text-teal-300",
    accentBright: "text-emerald-400",
  },
  // Typography scales
  typography: {
    h1: "text-6xl sm:text-7xl font-black tracking-tighter leading-tight",
    h2: "text-4xl sm:text-5xl font-black tracking-tight",
    h3: "text-2xl font-bold tracking-tight",
    h4: "text-lg font-bold",
    body: "text-base leading-relaxed",
    small: "text-sm",
    tiny: "text-xs",
  },
  // Gradient effects
  gradient: {
    primary: "bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-transparent bg-clip-text",
    emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    blue: "bg-gradient-to-r from-blue-400 to-blue-600",
    purple: "bg-gradient-to-r from-purple-400 to-purple-600",
    glow: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400",
  },
  // Button styles
  button: {
    primary: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all",
    secondary: "backdrop-blur-md border border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30 font-semibold transition-all",
    glass: "backdrop-blur-md border border-white/20 bg-white/10 text-white/70 hover:text-white hover:bg-white/15 transition-all",
  },
} as const;

export const blurEffects = {
  backdrop: "backdrop-blur-xl",
  header: "backdrop-blur-md",
  card: "backdrop-blur-lg",
  subtle: "backdrop-blur-sm",
} as const;

// Enhanced icon sizes for consistency
export const iconSizes = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
  "2xl": "w-10 h-10",
  "3xl": "w-12 h-12",
} as const;

// Spacing utilities
export const spacing = {
  "card-padding": "p-6",
  "card-gap": "gap-4",
  "section-padding": "py-20 px-4 sm:px-6 lg:px-8",
  "section-gap": "gap-6",
} as const;
