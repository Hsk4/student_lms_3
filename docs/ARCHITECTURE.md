# Student LMS - Architecture & Design System

## Overview

Student LMS is a multi-tenant educational platform built with Next.js 16, Clerk authentication, and a glassmorphism design system. The entire UI follows a consistent glass aesthetic with drag-and-drop dashboard customization across all user roles.

---

## Design System: Glassmorphism

### Theme Configuration (`lib/theme/glass.ts`)

All UI elements inherit from a centralized theme configuration:

```typescript
glassTheme = {
  bg: {
    dark,           // Main background gradient
    glass,          // Standard glass card
    glassLight,     // Lighter glass variant
    glassDark,      // Dark emerald glass
    card,           // Premium card with shadow
    sidebar,        // Sidebar styling
  },
  hover,            // Interactive hover states
  interactive,      // Focus, active, disabled states
  shadow,           // Consistent shadow system
  text: {
    primary,        // White text
    secondary,      // White/70
    muted,          // White/60
    accent,         // Emerald accent
  },
}
```

### Color Palette

- **Background**: `slate-950/900/emerald-950` gradient
- **Glass**: `white/10` (light), `emerald-400/20` (accents)
- **Borders**: `white/20`, `emerald-400/30`
- **Shadows**: `black/5 → black/20`, `emerald-500/10 → emerald-500/20`
- **Accents**: Emerald, Blue, Amber, Purple

---

## Component Architecture

### Reusable Glass Components

#### 1. **GlassCard** (`components/glass/glass-card.tsx`)
Wrapper for all card content with glassmorphism styling.

```typescript
<GlassCard variant="default" | "dark" | "light" glow interactive>
  {children}
</GlassCard>
```

#### 2. **GlassPageHeader** (`components/glass/glass-page-header.tsx`)
Consistent page title/description card.

```typescript
<GlassPageHeader 
  title="Dashboard Overview" 
  description="Your metrics here"
/>
```

#### 3. **DraggableGrid** (`components/glass/draggable-grid.tsx`)
Generic drag-and-drop grid system with localStorage persistence.

**Features:**
- Automatic layout persistence
- Multi-tab sync
- Keyboard support
- Touch-friendly
- Custom gap sizes

```typescript
<DraggableGrid
  items={["widget1", "widget2"]}
  storageKey="admin-dashboard:order"
  onReorder={(items) => {}}
>
  {(id, isOver, isDragging) => <Widget id={id} />}
</DraggableGrid>
```

---

## Dashboard Layouts

### Admin Dashboard (`/admin`)
- **Bento grid** with 10+ customizable widgets
- Drag-to-rearrange with layout persistence
- Real-time data from MongoDB aggregations
- Glass cards with colored accents

### Teacher Dashboard (`/teacher`)
- Quick stats cards (emerald, blue, amber, purple)
- Course management grid
- Assignment tracking
- Performance analytics

### Student Dashboard (`/student`)
- Progress tracking
- Course enrollment overview
- Upcoming assignments
- Recent activity feed

---

## Authentication & Authorization

### Role-Based Access (`lib/auth/roles.ts`)

| Role    | Routes    | Permissions |
|---------|-----------|-------------|
| admin   | `/admin`  | courseManage, memberManage, billingManage |
| teacher | `/teacher`| courseCreate, courseManage, gradeWrite |
| student | `/student`| courseView |

### Guards (`lib/auth/guards.ts`)

- `requirePageRole(roles)` - Redirect on auth failure
- `requirePermission(perm)` - Fresh token checks
- `requireOrgContext()` - Org-scoped operations

---

## Modular Structure

```
components/glass/
  ├── glass-card.tsx           # Base card wrapper
  ├── glass-page-header.tsx    # Page title card
  ├── draggable-grid.tsx       # Generic drag system
  └── ...

lib/theme/
  └── glass.ts                 # Theme configuration

app/
  ├── layout.tsx               # Root with dark gradient
  ├── page.tsx                 # Homepage
  ├── /admin
  │   ├── layout.tsx           # Admin sidebar + header
  │   ├── page.tsx             # Bento dashboard
  │   ├── /accounts            # Role assignment panel
  │   └── /courses             # Course management
  ├── /teacher
  │   └── page.tsx             # Teacher dashboard
  ├── /student
  │   └── page.tsx             # Student dashboard
  └── /auth
      ├── /sign-up             # Generic signup
      ├── /complete            # Post-auth redirect
      └── /pending             # Awaiting role assignment
```

---

## Key Features

### 1. **Glassmorphism Everywhere**
- Every page uses `backdrop-blur-xl` + `bg-white/10`
- Consistent border styling: `white/20`
- Dark gradient backgrounds with radial blur effects
- Smooth hover transitions

### 2. **Drag-and-Drop Dashboards**
- Reusable `DraggableGrid` component
- localStorage persistence (session-safe)
- Smooth animations (220ms cubic-bezier)
- Keyboard support (arrow keys)
- Multi-tab sync via storage events

### 3. **Role-Based UI**
- Admin: Full dashboard customization
- Teacher: Class management tools
- Student: Enrollment & progress tracking
- Unassigned users: Pending approval page

### 4. **Unified Theming**
- Single source of truth (`lib/theme/glass.ts`)
- No color hardcoding in components
- Consistent spacing & shadows
- Easy theme swapping

---

## Development Best Practices

### 1. **Component Reusability**
Always use `GlassCard` and `GlassPageHeader` for new pages.

```typescript
<GlassPageHeader title="New Feature" />
<GlassCard>
  {/* content */}
</GlassCard>
```

### 2. **Typography Classes**
Use theme text classes for consistency:

```typescript
import { glassTheme } from "@/lib/theme/glass";
<p className={glassTheme.text.secondary}>Muted text</p>
```

### 3. **Drag-and-Drop**
For any sortable content, use `DraggableGrid`:

```typescript
<DraggableGrid items={items} storageKey="unique-key">
  {(id) => <YourWidget id={id} />}
</DraggableGrid>
```

### 4. **Avoid Hardcoding**
❌ `className="bg-white/10 border border-white/20"`
✅ `className={glassTheme.bg.glass}`

---

## Performance Optimizations

- **Cache Components**: Enabled in Next.js config
- **Partial Prefetching**: Reduces bundle size
- **React Compiler**: Automatic memoization
- **Turbopack**: Fast dev builds (<1s)
- **Selective Revalidation**: ISR for dashboards

---

## Authentication Flow

```
User Signs Up
    ↓
Create Account (No Role)
    ↓
Redirects to /auth/pending
    ↓
Admin Assigns Role in /admin/accounts
    ↓
User Login → Auto-redirect to /{role} dashboard
```

---

## Future Enhancements

- [ ] Dark mode toggle (already glass-ready)
- [ ] Additional widgets library
- [ ] Real-time updates via WebSockets
- [ ] Mobile app (React Native)
- [ ] Analytics export (PDF/CSV)
- [ ] Custom theme builder

---

**Built with ❤️ for Fastly LMS**
