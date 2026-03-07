# EPWORLD Battle UX - Animation Specifications

## Overview
Visual design inspired by **Arc System Works** fighting games (Guilty Gear, Dragon Ball FighterZ) combined with **Blizzard's Hearthstone** card interactions. The goal is to create cinematic, responsive, and satisfying battle feedback.

## Core Animation Principles

### 1. Impact Feel
- Every action should feel **weighty** and **responsive**
- Use spring physics for natural motion
- Timing: 0.3s for micro-interactions, 0.5-1s for major effects

### 2. Visual Hierarchy
- **Critical hits**: Maximum impact, screen shake, particle burst
- **Normal attacks**: Smooth, satisfying motion
- **Status effects**: Persistent subtle animations
- **Transformation**: Full-screen cinematic takeover

### 3. Performance
- Use `transform` and `opacity` for GPU acceleration
- Limit simultaneous particle effects to 5-10
- Respect `prefers-reduced-motion`

---

## Component Specifications

### 1. Turn Indicator Animation

#### Visual Design
```
State: Player's Turn
├── Container: Rounded pill, indigo-500/20 background
├── Border: 2px solid indigo-500/50
├── Glow: Box-shadow pulse (0 → 20px → 0)
└── Text: "YOUR TURN" in indigo-300

State: Enemy's Turn  
├── Container: Rounded pill, red-500/20 background
├── Border: 2px solid red-500/50
├── Glow: Box-shadow pulse (0 → 20px → 0)
└── Text: "ENEMY'S TURN" in red-300
```

#### Animation Specs
| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| scale | 1 → 1.05 → 1 | 1s | ease-in-out |
| boxShadow | 0 → 20px → 0 | 1s | ease-in-out |
| backgroundColor | crossfade | 0.3s | spring |

**Framer Motion Config:**
```tsx
animate={{
  scale: [1, 1.05, 1],
  boxShadow: [
    "0 0 0 rgba(99, 102, 241, 0)",
    "0 0 20px rgba(99, 102, 241, 0.3)",
    "0 0 0 rgba(99, 102, 241, 0)"
  ]
}}
transition={{ duration: 1, repeat: Infinity }}
```

---

### 2. Ki Energy Bar

#### Visual Design (Dragon Ball Style)
```
Container: Rounded-full, dark background
├── Segments: 10 vertical dividers for DBZ feel
├── Fill: Gradient based on Ki level
│   ├── Base (0-24): blue-400 → blue-600
│   ├── Charged (25-49): cyan-400 → cyan-600
│   ├── Powered (50-74): yellow-400 → yellow-600
│   ├── Super (75-99): orange-400 → orange-600
│   └── Spirit Bomb (100): red-400 → pink-500
└── Sparkle: White glow at high ki
```

#### Animation Specs

**Aura Background:**
```tsx
const auraVariants = {
  idle: {
    scale: [1, 1.02, 1],
    opacity: [0.3, 0.5, 0.3],
  },
  charged: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 0.8, 0.5],
  },
  super: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
  },
};
transition: { duration: 0.5, repeat: Infinity }
```

**Fill Animation:**
```tsx
<motion.div
  animate={{ width: `${percentage}%` }}
  transition={{ type: "spring", stiffness: 100, damping: 15 }}
/>
```

**Sparkle at High Ki:**
```tsx
const kiPulseVariants = {
  pulse: {
    scale: [1, 1.3, 1],
    opacity: [0.8, 0, 0.8],
    transition: { duration: 1, repeat: Infinity }
  }
};
```

---

### 3. Damage Numbers (Floating Combat Text)

#### Visual Design
```
Types:
├── Damage: Red (#ef4444), -XX format
├── Heal: Green (#4ade80), +XX format  
├── Critical: Yellow (#facc15), XX! format with "CRIT!" badge
└── Miss: Gray (#9ca3af), "MISS!" text

Style:
├── Font: Black (900 weight), 36px
├── Shadow: Drop shadow for readability
└── Critical: Additional glow effect
```

#### Animation Specs

**Standard Damage:**
```tsx
initial={{ opacity: 0, y: 0, scale: 0.5 }}
animate={{ 
  opacity: [0, 1, 1, 0], 
  y: [-20, -60, -80],
  scale: [0.5, 1.2, 1, 0.8]
}}
transition={{ 
  duration: 1.2, 
  times: [0, 0.2, 0.7, 1] 
}}
```

**Critical Hit:**
- Same as damage + additional "CRIT!" badge
- Badge animates: scale 0 → 1 with spring
- Text glow: `textShadow: '0 0 20px rgba(250, 204, 21, 0.8)'`

---

### 4. Card Hover & Selection

#### Visual Design
```
Rest State:
├── scale: 1
├── y: 0
└── shadow: default

Hover State:
├── scale: 1.05
├── y: -10px (lift effect)
└── shadow: Elevated

Selected State:
├── scale: 1.1
├── y: -20px (more lift)
├── shadow: Indigo glow
└── indicator: "Tap again to play" tooltip
```

#### Animation Specs
```tsx
const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -10,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20 
    }
  },
  selected: {
    scale: 1.1,
    y: -20,
    boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)"
  }
};
```

**Selection Glow:**
```tsx
<motion.div
  layoutId="cardSelection"
  className="absolute -inset-2 bg-indigo-500/20 rounded-2xl blur-md"
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

---

### 5. Transformation Cinematic

#### Visual Design (Dragon Ball Style)
```
Background: Black screen
├── Flash: White flash overlay (fades in 0.5s)
├── Energy Waves: 5 concentric circles
│   ├── Colors based on transformation level
│   ├── Scale: 0 → 3x
│   └── Rotation: 0° → 360°
├── Character Name: Top, slate-400
└── Transformation Name: Center, gradient text
```

#### Transformation Levels
| Level | Name | Gradient | Trigger |
|-------|------|----------|---------|
| 0 | Base Form | blue-400 → cyan-400 | Initial |
| 1 | Charged | cyan-400 → teal-400 | 25+ Ki |
| 2 | Powered Up | yellow-400 → amber-400 | 50+ Ki |
| 3 | SUPER SAIYAN | yellow-300 → orange-400 | 75+ Ki |
| 4 | SPIRIT BOMB READY | red-400 → pink-500 | 100 Ki |

#### Animation Specs

**Flash Effect:**
```tsx
initial={{ opacity: 1 }}
animate={{ opacity: [1, 0.3, 1, 0] }}
transition={{ duration: 0.5 }}
```

**Energy Waves:**
```tsx
{[...Array(5)].map((_, i) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 2, 3], 
      opacity: [0.8, 0.4, 0],
      rotate: [0, 180, 360]
    }}
    transition={{ 
      duration: 2, 
      delay: i * 0.1,
      repeat: 1
    }}
  />
))}
```

**Screen Shake:**
```tsx
animate={{ 
  x: [0, -5, 5, -5, 5, 0],
  y: [0, -3, 3, -3, 3, 0]
}}
transition={{ duration: 0.3, repeat: 5 }}
```

**Text Reveal:**
```tsx
// Name
initial={{ y: 20, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}

// Transformation
initial={{ scale: 0.5, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
```

---

### 6. Health Bar Animations

#### Visual Design
```
Container: Rounded-full, dark background
├── Background glow: Pulsing at low health (<30%)
├── Fill: Gradient based on health percent
│   ├── 100-50%: green → emerald → teal
│   ├── 50-25%: yellow → orange
│   └── 25-0%: red (urgent pulse)
└── Shine: Top highlight overlay
```

#### Animation Specs

**Health Change:**
```tsx
<motion.div
  initial={{ width: '100%' }}
  animate={{ width: `${healthPercent}%` }}
  transition={{ type: "spring", stiffness: 100, damping: 20 }}
/>
```

**Low Health Warning:**
```tsx
animate={healthPercent < 30 ? { 
  opacity: [0.3, 0.6, 0.3] 
} : {}}
transition={{ duration: 0.5, repeat: Infinity }}
```

---

### 7. Battle Arena Background

#### Visual Design
```
Base: Dark slate with gradient
├── Dynamic glow: Shifts with turn
│   ├── Player turn: Indigo glow from left
│   └── Enemy turn: Red glow from right
├── Grid overlay: 40px grid, low opacity
└── Clash zone: VS indicator center
```

#### Animation Specs

**Background Shift:**
```tsx
animate={{ 
  background: currentTurn === 'player' 
    ? ['radial-gradient(circle at 30% 50%, rgba(99,102,241,0.1)...', '...40%...']
    : ['radial-gradient(circle at 70% 50%, rgba(239,68,68,0.1)...', '...60%...']
}}
transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
```

**VS Indicator:**
```tsx
animate={{ 
  scale: currentTurn === 'player' ? [1, 1.05, 1] : [1, 0.95, 1],
  rotate: currentTurn === 'player' ? [0, 5, -5, 0] : [0, -5, 5, 0]
}}
transition={{ duration: 2, repeat: Infinity }}
```

---

### 8. Battle Log Entries

#### Visual Design
```
Entry types:
├── Player action: slate-800/30, slate-600 border
├── Enemy action: red-500/5, red-500/30 border, red-200 text
├── Victory: green-500/10, green-500 border, green-300 text
└── Defeat: red-500/10, red-500 border, red-300 text

Animation: Slide in from left, fade in
```

#### Animation Specs
```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  className="..."
/>
```

---

### 9. Mobile Battle Controls

#### Visual Design
```
Position: Fixed bottom
Background: slate-950/95 backdrop-blur
Layout: 3 buttons (Defend, Charge, Attack)

Defend: slate-800, icon + text
Charge: slate-800, yellow zap icon
Attack: Large, indigo-600 when active
```

#### Animation Specs
```tsx
whileTap={{ scale: 0.95 }}
transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

---

### 10. Spectator Mode Overlay

#### Visual Design
```
Position: Fixed top
Background: slate-950/90 backdrop-blur
Border: Bottom slate-800

Content:
├── Left: Eye icon + viewer count
├── Center: Player names with vs
└── Right: LIVE indicator (red pulse)
```

#### Animation Specs

**Entry:**
```tsx
initial={{ y: -50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
```

**Live Indicator:**
```tsx
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
</span>
```

---

## Easing Functions Reference

```typescript
// Standard easings
const easings = {
  // Bouncy, energetic
  spring: { type: "spring", stiffness: 300, damping: 20 },
  
  // Smooth, natural motion
  smooth: { type: "spring", stiffness: 100, damping: 15 },
  
  // Quick response
  snappy: { type: "spring", stiffness: 400, damping: 25 },
  
  // Heavy, impactful
  heavy: { type: "spring", stiffness: 150, damping: 10 },
};
```

---

## Performance Guidelines

### Do
- ✅ Use `transform` and `opacity` only
- ✅ Set `will-change` on animated elements
- ✅ Use `layoutId` for shared element transitions
- ✅ Implement `prefers-reduced-motion` media query

### Don't
- ❌ Animate `width`, `height`, `top`, `left`
- ❌ Run more than 5 particle effects simultaneously
- ❌ Use blur filters on large areas during animation
- ❌ Animate on every frame without throttling

### Reduced Motion Support
```tsx
const prefersReducedMotion = 
  typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

const animationProps = prefersReducedMotion 
  ? {} 
  : { animate: { scale: [1, 1.05, 1] } };
```

---

## Mobile Considerations

- Reduce particle count by 50% on mobile
- Simplify transformation cinematic on low-end devices
- Use `touch-action: manipulation` for buttons
- Ensure 44px minimum touch target size
- Test at 60fps on mid-range devices

---

## Implementation Priority

1. **P0 - Core**: Turn indicators, health bars, damage numbers
2. **P1 - Polish**: Card animations, Ki bar, battle log
3. **P2 - Flair**: Transformation cinematic, particle effects
4. **P3 - Extra**: Spectator mode, advanced mobile controls
