# Design System — Fastly LMS

Glassmorphic dark theme with teal-400/500 as the primary accent color.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#2dd4bf` (teal-400) | Icons, active states, focus rings, primary buttons |
| Primary Dark | `#14b8a6` (teal-500) | Gradients, hover states, borders |
| Primary Deep | `#0d9488` (teal-600) | Gradient endpoints |
| Primary Darkest | `#115e59` (teal-800) | Backgrounds, glow shadows |
| Neutral Surface | `#020617` (slate-950) | Page backgrounds |
| Glass Surface | `rgba(255,255,255,0.05)` | Cards, panels |
| Border | `rgba(255,255,255,0.1)` | Subtle borders |

## Layout & Spacing

- **Border Radius**: Cards `1rem`, Buttons/Inputs `0.5rem`
- **Spacing Unit**: `4px` grid. Use multiples: `4, 8, 12, 16, 24, 32, 48`
- **Card Padding**: `1.5rem` (24px)
- **Section Spacing**: `1.5rem` (24px) between major sections
- **Max Content Width**: Admin `none` (sidebar), Landing `1280px`

## Typography

- **Font**: `Geist Sans` (body), `Geist Mono` (code)
- **Weights**: `400` regular, `500` medium, `600` semibold, `700` bold, `900` black
- **Scale**: Display `5xl/6xl`, H1 `3xl/4xl`, H2 `2xl/3xl`, H3 `xl/2xl`, H4 `lg/xl`, Body `sm/base`, Small `xs/sm`
- **Line Heights**: Headings `1.2`, Body `1.5`
- **Tracking**: `tracking-tight` for headings, `tracking-wider` for labels

## Glass Surfaces

| Surface | Classes |
|---------|---------|
| Card | `bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg` |
| Card Dark | `bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06]` |
| Card Light | `bg-white/10 backdrop-blur-xl border border-white/15` |
| Card Premium | `bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12]` |
| Header/Sidebar | `bg-white/[0.03] backdrop-blur-2xl border-r border-white/[0.08]` |
| Page BG | `bg-slate-950` |

## Animations

| Animation | Value | Usage |
|-----------|-------|-------|
| Fast | `150ms ease` | Hover states, toggles |
| Base | `200ms ease` | Micro-interactions |
| Smooth | `300ms ease-out` | Dropdowns, slides |
| Spring | `500ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Emphasized entrances |
| Glow Pulse | `2s infinite` | Active indicator dots |
| Float | `6s infinite alternate` | Background orbs |

## Component Patterns

### Dashboard Stats Cards
- Number: `text-3xl font-bold text-white`
- Label: `text-sm text-white/60`
- Change: `text-xs font-semibold text-teal-300`
- Icon container: `p-3 rounded-lg bg-teal-500/20 border border-teal-400/30`
- Icon color: `text-teal-300`

### Navigation Items
- Active: `bg-teal-500/20 text-white border border-teal-400/30`
- Active indicator: `w-1 h-6 bg-teal-400 rounded-full`
- Inactive: `text-white/60 hover:text-white hover:bg-white/5`
- Icon active: `text-teal-300`
- Icon inactive: `text-white/40`

### Primary Button
- `bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500`
- `text-white font-semibold shadow-lg shadow-teal-500/25`

### Focus Ring
- `focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50`

### Page Header
- Icon container: `bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-400/30`

### Form Inputs
- `bg-white/5 border border-white/10 text-white placeholder:text-white/40`
- `focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50`

### Info Card (sidebar bottom)
- `bg-gradient-to-br from-teal-500/15 to-teal-600/10 border border-teal-400/30`

## Background Effects

Every page includes fixed blurred orbs behind content:
- Primary orb: `w-96 h-96 bg-teal-500/10 rounded-full blur-3xl`
- Secondary orb: `w-96 h-96 bg-blue-500/10 rounded-full blur-3xl`
- Optional third: `w-64 h-64 bg-purple-500/10 rounded-full blur-3xl`

## Design Principles

1. **Hierarchy**: Large bold numbers > medium labels > small metadata
2. **Restraint**: Content breathes with `space-y-6` sections
3. **Depth**: Layer glass surfaces at different opacity levels
4. **Consistency**: All interactive elements use `transition-all duration-300`
5. **Accessibility**: WCAG AA contrast with `text-white` on dark surfaces

## Anti-patterns

- No flat colored backgrounds on content areas
- No borders stronger than `border-white/15`
- No mixed accent colors — use teal only
- No heavy shadows — use `shadow-lg` maximum