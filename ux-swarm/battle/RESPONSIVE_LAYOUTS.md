# EPWORLD Battle UX - Mobile Responsive Layouts

## Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

## Layout Strategy

### Mobile First Approach
- Base styles target mobile devices
- Progressive enhancement for larger screens
- Touch-first interactions

### Layout Components

#### 1. Battle Arena (Mobile < lg)
```
Stack Layout:
┌─────────────────────────┐
│ Enemy Status            │
├─────────────────────────┤
│                         │
│    Battle Arena         │
│    (aspect-video)       │
│                         │
├─────────────────────────┤
│ Player Status           │
├─────────────────────────┤
│ Card Hand (horizontal   │
│ scroll, fixed bottom)   │
├─────────────────────────┤
│ Action Bar (fixed)      │
└─────────────────────────┘
```

#### 2. Battle Arena (Desktop >= lg)
```
Grid Layout (3 columns):
┌──────────────────────────┬───────────────┐
│                          │               │
│  Battle Arena (col-span-2)│   Sidebar     │
│                          │  - Timer      │
│  - Enemy Status          │  - AI Response│
│  - Arena View            │  - Battle Log │
│  - Player Status         │  - Actions    │
│  - Card Grid (4 cols)    │               │
│                          │               │
└──────────────────────────┴───────────────┘
```

---

## Component Breakpoints

### Enemy/Player Status Cards

**Mobile (< md):**
```css
.status-card {
  @apply p-3 rounded-lg;
}
.status-avatar {
  @apply w-10 h-10;
}
.status-name {
  @apply text-base font-semibold;
}
.status-health {
  @apply text-2xl font-bold;
}
```

**Tablet (md - lg):**
```css
.status-card {
  @apply p-4 rounded-xl;
}
.status-avatar {
  @apply w-12 h-12;
}
.status-name {
  @apply text-lg font-bold;
}
.status-health {
  @apply text-3xl font-black;
}
```

**Desktop (>= lg):**
```css
.status-card {
  @apply p-5 rounded-xl;
}
.status-avatar {
  @apply w-14 h-14;
}
.status-name {
  @apply text-xl font-bold;
}
.status-health {
  @apply text-4xl font-black;
}
```

### Battle Arena Visualization

**Mobile:**
- Aspect ratio: `aspect-[4/3]` (more square for small screens)
- VS indicator: 80px diameter
- Turn banner: Compact pill, smaller text
- Grid overlay: 30px cells

**Tablet:**
- Aspect ratio: `aspect-video`
- VS indicator: 100px diameter
- Turn banner: Standard pill

**Desktop:**
- Aspect ratio: `aspect-video` with max-height constraint
- VS indicator: 128px diameter
- Turn banner: Large with animation
- Grid overlay: 40px cells

### Card Hand

**Mobile:**
```
Position: Fixed bottom-24 (above action bar)
Layout: Horizontal scroll
Card size: 96px width
Gap: 12px
Visible: 3-4 cards at once
```

**Desktop:**
```
Position: Static (in grid)
Layout: 4-column grid
Card size: Full width of column
Gap: 16px
All cards visible
```

### Sidebar (Timer, Battle Log, Actions)

**Mobile:**
- Collapsed into drawer or modal
- Accessible via "Menu" button
- Full-screen overlay when open

**Tablet:**
- Narrow sidebar (240px)
- Visible alongside arena
- Stacked vertically

**Desktop:**
- Full sidebar (320px)
- All elements visible
- Battle log has larger max-height

---

## Touch Interactions

### Card Selection
**Mobile:**
- Single tap: Select card (lift animation)
- Double tap: Play card
- Long press: View card details

**Desktop:**
- Hover: Lift preview
- Click: Select
- Click again: Play

### Action Bar (Mobile Only)
```
Position: Fixed bottom-0
Height: 80px + safe-area-inset-bottom
Background: slate-950/95 backdrop-blur

Buttons:
┌─────────┬─────────┬───────────┐
│ Defend  │ Charge  │  ATTACK   │
│  (flex) │  (flex) │ (flex-2)  │
└─────────┴─────────┴───────────┘

Touch targets: Minimum 56px height
Gap: 12px
Padding: 16px horizontal, 12px vertical
```

---

## Typography Scale

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Health numbers | 24px | 30px | 36px |
| Character names | 16px | 18px | 20px |
| Turn indicator | 12px | 14px | 16px |
| Battle log | 12px | 13px | 14px |
| Card names | 11px | 12px | 14px |
| Button text | 14px | 14px | 16px |

---

## Spacing Scale

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Section gap | 12px | 16px | 24px |
| Card gap | 8px | 12px | 16px |
| Padding | 12px | 16px | 20px |
| Border radius | 8px | 12px | 16px |

---

## Color Adaptations

### Mobile (OLED Friendly)
```
Background: bg-slate-950 (true black)
Borders: Use sparingly (reduce power consumption)
Glow effects: Reduced opacity
```

### Desktop (Richer Visuals)
```
Background: bg-slate-900/50 (slightly lighter)
Borders: More prominent
Glow effects: Full intensity
Gradients: More stops
```

---

## Animation Scaling

### Mobile
- Reduce particle count by 50%
- Disable screen shake (accessibility)
- Simplify transformation cinematic
- Reduce motion distances by 30%
- Shorter durations (0.8x)

### Tablet
- Standard particle count
- Screen shake on critical hits only
- Full transformation cinematic
- Standard motion distances

### Desktop
- Full particle effects
- All screen shake effects
- Cinematic with additional particles
- Larger motion distances

---

## Safe Areas

### Mobile Notch/Island Handling
```css
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Fixed Elements
```
Action Bar:
- Bottom: max(16px, env(safe-area-inset-bottom))
- Padding-bottom included in height

Spectator Overlay:
- Top: env(safe-area-inset-top)
```

---

## Responsive Code Examples

### Container
```tsx
<div className="
  grid 
  grid-cols-1 
  lg:grid-cols-3 
  gap-3 
  lg:gap-6
  px-3 
  lg:px-4
  pb-24 
  lg:pb-0
">
```

### Card Hand
```tsx
// Mobile: Horizontal scroll
<div className="
  lg:hidden 
  fixed 
  bottom-24 
  left-0 
  right-0 
  overflow-x-auto 
  scrollbar-hide 
  px-4
">
  <div className="flex gap-3" style={{ width: 'max-content' }}>
    {/* Cards */}
  </div>
</div>

// Desktop: Grid
<div className="
  hidden 
  lg:grid 
  grid-cols-4 
  gap-4
">
  {/* Cards */}
</div>
```

### Status Health
```tsx
<div className="
  text-2xl 
  md:text-3xl 
  lg:text-4xl 
  font-black
">
  {health}
</div>
```

### Arena Aspect Ratio
```tsx
<div className="
  aspect-[4/3] 
  md:aspect-video
  rounded-xl
">
```

---

## Testing Checklist

### Mobile (iPhone SE / Android Small)
- [ ] All UI elements fit within viewport
- [ ] No horizontal scroll (except card hand)
- [ ] Touch targets >= 44px
- [ ] Bottom action bar doesn't obstruct content
- [ ] Text readable at 100% zoom

### Tablet (iPad / Android Tablet)
- [ ] Sidebar visible alongside arena
- [ ] Card grid uses available space
- [ ] Touch targets comfortable
- [ ] Landscape and portrait orientations work

### Desktop (Various sizes)
- [ ] Full layout visible without scroll
- [ ] Hover states work correctly
- [ ] Animations perform at 60fps
- [ ] No layout shift on window resize

---

## Accessibility

### Reduced Motion
```tsx
const prefersReducedMotion = 
  typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

// Disable animations for users who prefer reduced motion
```

### Touch Targets
- All interactive elements: minimum 44x44px
- Primary actions: minimum 56x56px
- Spacing between targets: minimum 8px

### Contrast
- Text on dark backgrounds: WCAG AA minimum
- Health bars: High contrast indicators
- Turn indicators: Clear visual + text
