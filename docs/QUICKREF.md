# Quick Reference Guide

## 🎨 Using the Glass Theme

### Import the Theme
```typescript
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
```

### Common Patterns

#### Glass Card
```typescript
<GlassCard variant="default" glow interactive>
  <h2 className={glassTheme.text.primary}>Title</h2>
  <p className={glassTheme.text.secondary}>Subtitle</p>
</GlassCard>
```

#### Page Header
```typescript
<GlassPageHeader 
  title="Dashboard" 
  description="Your metrics"
/>
```

#### Text Styles
```typescript
// Primary (white, large)
<h1 className={glassTheme.text.primary}>Heading</h1>

// Secondary (white/70, labels)
<p className={glassTheme.text.secondary}>Label</p>

// Muted (white/60, timestamps)
<span className={glassTheme.text.muted}>2 hours ago</span>

// Accent (emerald, highlights)
<span className={glassTheme.text.accent}>78%</span>
```

#### Hover States
```typescript
<button className={cn(
  glassTheme.bg.glass,
  glassTheme.hover.glass,
  "transition-all"
)}>
  Hover me
</button>
```

#### Shadow System
```typescript
<div className={cn(
  glassTheme.bg.card,
  glassTheme.shadow.lg
)}>
  Shadowed card
</div>
```

---

## 🎮 Drag-and-Drop Dashboards

### Basic Setup
```typescript
import { DraggableGrid } from "@/components/glass/draggable-grid";

const [order, setOrder] = useState(["widget1", "widget2"]);

<DraggableGrid
  items={order}
  storageKey="my-dashboard:order"
  onReorder={setOrder}
>
  {(id, isOver, isDragging) => (
    <Widget 
      id={id} 
      isOver={isOver}
      isDragging={isDragging}
    />
  )}
</DraggableGrid>
```

### Widget Component
```typescript
function Widget({ id, isDragging }) {
  return (
    <GlassCard 
      className={isDragging ? "opacity-20" : ""}
    >
      Content for {id}
    </GlassCard>
  );
}
```

---

## 📐 Layout Patterns

### Full Dashboard
```typescript
<div className="space-y-6">
  <GlassPageHeader title="My Dashboard" />
  
  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <StatCard />
    <StatCard />
    <StatCard />
    <StatCard />
  </div>
  
  {/* Main Content */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <GlassCard>Content 1</GlassCard>
    <GlassCard>Content 2</GlassCard>
    <GlassCard>Content 3</GlassCard>
  </div>
</div>
```

---

## 🎯 Color Reference

### Semantic Colors
```
Emerald:  emerald-500/20 bg + emerald-400/30 border
Blue:     blue-500/20 bg + blue-400/30 border
Amber:    amber-500/20 bg + amber-400/30 border
Purple:   purple-500/20 bg + purple-400/30 border
```

### Text on Glass
```
Primary:   text-white
Secondary: text-white/70
Muted:     text-white/60
Accent:    text-emerald-300
```

---

## ⚡ Do's and Don'ts

### ✅ Do
- Use `glassTheme` values
- Use `GlassCard` wrapper
- Use `glassTheme.text.*` for typography
- Keep components modular
- Use `cn()` for class merging

### ❌ Don't
- Hardcode colors (e.g., `bg-white/10`)
- Use old `Card` component for new features
- Mix theme systems
- Duplicate theme logic
- Use vanilla Tailwind colors

---

## 📚 File Locations

```
Theme:
  lib/theme/glass.ts

Components:
  components/glass/glass-card.tsx
  components/glass/glass-page-header.tsx
  components/glass/draggable-grid.tsx

Dashboards:
  app/admin/page.tsx
  app/teacher/page.tsx
  app/student/page.tsx

Documentation:
  ARCHITECTURE.md (complete guide)
  IMPLEMENTATION.md (feature summary)
  QUICKREF.md (this file)
```

---

## 🔧 Troubleshooting

### Theme not applying?
- Ensure import: `import { glassTheme } from "@/lib/theme/glass"`
- Check you're using `className=` not `style=`

### Drag not working?
- Verify `storageKey` is unique per page
- Ensure items array doesn't have duplicates
- Check browser localStorage is enabled

### Colors looking off?
- Verify dark background: `bg-gradient-to-br from-slate-950...`
- Check backdrop blur: `backdrop-blur-xl`
- Confirm border color: `border-white/20`

---

**Happy building! 🚀**
