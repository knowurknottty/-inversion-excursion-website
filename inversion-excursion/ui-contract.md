# The Inversion Excursion — UI/UX Architecture Contract

**Version:** 1.0.0  
**Status:** TIER 2 — Frontend Contract  
**Target Platform:** Farcaster Mini App (Mobile + Desktop)  
**Theme:** Mystical Dark / Esoteric Sci-Fi

---

## 1. Design System Foundation

### 1.1 Color Palette

```typescript
// Design Tokens — colors.ts
export const colors = {
  // Core Backgrounds
  void: '#0A0A0F',           // Deepest background
  abyss: '#12121A',          // Card/Panel backgrounds
  shadow: '#1A1A24',         // Elevated surfaces
  mist: '#252532',           // Borders, dividers
  
  // Accents
  resonance: {
    primary: '#8B5CF6',      // Violet — base resonance
    glow: '#A78BFA',         // Soft glow
    pulse: '#C4B5FD',        // Active pulse
  },
  
  // Card Tier Colors
  tiers: {
    physical: {
      base: '#8B4513',       // Bronze
      glow: '#CD853F',
      shimmer: '#D2691E',
    },
    emotional: {
      base: '#C0C0C0',       // Silver
      glow: '#E8E8E8',
      shimmer: '#F5F5F5',
    },
    atomic: {
      base: '#FFD700',       // Gold
      glow: '#FFF8DC',
      shimmer: '#FFFACD',
    },
    galactic: {
      base: '#00CED1',       // Aurora cyan base
      gradient: 'linear-gradient(135deg, #00CED1, #FF6B9D, #4ECDC4)',
      shimmer: '#E0FFFF',
    },
    cosmic: {
      base: '#000000',       // Void
      gradient: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a2e 50%, #16213e 100%)',
      shimmer: '#FFFFFF',
    },
  },
  
  // SynSync Integration
  brainwave: {
    gamma: '#FF006E',        // 40Hz — Peak concentration
    beta: '#FB5607',         // 20Hz — Active thought
    alpha: '#FFBE0B',        // 10Hz — Relaxed awareness
    theta: '#8338EC',        // 6Hz — Deep meditation
    delta: '#3A86FF',        // 2Hz — Deep sleep
  },
  
  // UI States
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Text
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    disabled: '#475569',
  },
} as const;
```

### 1.2 Typography Scale

```typescript
// typography.ts
export const typography = {
  fontFamily: {
    display: '"Cinzel", "Times New Roman", serif',      // Headers, card names
    body: '"Inter", "SF Pro Display", system-ui, sans-serif', // UI text
    mono: '"JetBrains Mono", "Fira Code", monospace',   // Stats, frequencies
    mystical: '"Uncial Antiqua", "Cinzel Decorative", serif', // WYRD text
  },
  
  sizes: {
    xs: '0.75rem',      // 12px — Captions, labels
    sm: '0.875rem',     // 14px — Secondary text
    base: '1rem',       // 16px — Body
    lg: '1.125rem',     // 18px — Emphasized body
    xl: '1.25rem',      // 20px — Card titles
    '2xl': '1.5rem',    // 24px — Section headers
    '3xl': '1.875rem',  // 30px — Screen titles
    '4xl': '2.25rem',   // 36px — Major headers
    '5xl': '3rem',      // 48px — Victory/Defeat
  },
  
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;
```

### 1.3 Spacing & Layout

```typescript
// spacing.ts
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

export const layout = {
  maxWidth: '480px',        // Farcaster mobile constraint
  cardAspectRatio: '2/3',   // Standard tarot proportion
  gridGap: '12px',
  safeAreaBottom: 'env(safe-area-inset-bottom, 20px)',
  headerHeight: '56px',
  bottomNavHeight: '64px',
} as const;
```

### 1.4 Animation Timing

```typescript
// animations.ts
export const timing = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  dramatic: '800ms',
  cinematic: '1200ms',
} as const;

export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  dramatic: 'cubic-bezier(0.87, 0, 0.13, 1)',
  resonant: 'cubic-bezier(0.37, 0, 0.63, 1)', // Sine-like for wave feel
} as const;
```

---

## 2. Component Tree (React Structure)

```
src/
├── components/
│   ├── core/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── Button.styles.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── CardFrame.tsx          # Tier-based frame rendering
│   │   │   ├── CardArt.tsx
│   │   │   ├── CardStats.tsx
│   │   │   └── CardFrequency.tsx      # Waveform overlay
│   │   ├── FrequencyWave/
│   │   │   ├── FrequencyWave.tsx      # Animated waveform
│   │   │   └── FrequencyWave.types.ts
│   │   ├── ResonanceMeter/
│   │   │   ├── ResonanceMeter.tsx     # Shared field visualization
│   │   │   └── ResonancePulse.tsx
│   │   └── SynSync/
│   │       ├── ProtocolSelector.tsx
│   │       ├── EntrainmentTimer.tsx   # 60s challenge
│   │       └── BrainwaveIndicator.tsx
│   │
│   ├── screens/
│   │   ├── DeckBuilder/
│   │   │   ├── DeckBuilder.tsx
│   │   │   ├── CollectionGrid.tsx
│   │   │   ├── DeckSlots.tsx          # 7-card deck slots
│   │   │   ├── FrequencyTuner.tsx
│   │   │   └── DeckStats.tsx
│   │   ├── CellFormation/
│   │   │   ├── CellFormation.tsx
│   │   │   ├── InvitePanel.tsx
│   │   │   ├── CellMembers.tsx
│   │   │   └── SharedField.tsx        # Combined resonance
│   │   ├── BattleInterface/
│   │   │   ├── BattleInterface.tsx
│   │   │   ├── BattleField.tsx
│   │   │   ├── TurnIndicator.tsx
│   │   │   ├── ActionBar.tsx
│   │   │   ├── EnemySystem.tsx        # The System boss
│   │   │   ├── CombatLog.tsx
│   │   │   └── ResonanceBurst.tsx     # Ultimate animation
│   │   ├── VictoryDefeat/
│   │   │   ├── VictoryDefeat.tsx
│   │   │   ├── VictoryCelebration.tsx
│   │   │   ├── DefeatReflection.tsx
│   │   │   ├── MintScreenshot.tsx
│   │   │   └── ShareCast.tsx
│   │   └── CardDetail/
│   │       ├── CardDetail.tsx
│   │       ├── EtymologyPanel.tsx     # WYRD history
│   │       ├── FrequencyGraph.tsx
│   │       └── CardLore.tsx
│   │
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── SafeArea.tsx
│   │
│   └── animations/
│       ├── CardDrawAnimation.tsx
│       ├── AttackAnimation.tsx
│       ├── ResonanceBurstAnimation.tsx
│       ├── ShuffleAnimation.tsx
│       └── TransitionWrapper.tsx
│
├── hooks/
│   ├── useSynSync.ts
│   ├── useResonance.ts
│   ├── useBattleState.ts
│   ├── useAnimation.ts
│   └── useFarcaster.ts
│
├── types/
│   ├── card.types.ts
│   ├── battle.types.ts
│   ├── cell.types.ts
│   └── synsync.types.ts
│
└── utils/
    ├── frequency.ts
    ├── tierStyles.ts
    └── animations.ts
```

---

## 3. Screen Wireframe Descriptions

### 3.1 Deck Builder Screen

```
┌─────────────────────────────────────┐
│  ←  DECK BUILDER              [?]   │  Header (56px)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │     SHARED RESONANCE        │    │  Resonance Meter
│  │    ╭─────────────────╮      │    │  (120px height)
│  │    │  ~~~~ WAVE ~~~~  │      │    │
│  │    │  ~~~~ FORM ~~~~  │      │    │
│  │    ╰─────────────────╯      │    │
│  │         7.83 Hz              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [SLOT 1] [SLOT 2] [SLOT 3] │    │  Deck Slots
│  │  [SLOT 4] [SLOT 5] [SLOT 6] │    │  (7 slots, 2 rows)
│  │      [SLOT 7 — CORE]         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ───────── COLLECTION ─────────     │  Section divider
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │CARD│ │CARD│ │CARD│ │CARD│       │  Collection Grid
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │       │  (scrollable)
│  └────┘ └────┘ └────┘ └────┘       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │CARD│ │CARD│ │CARD│ │CARD│       │
│  │ 5  │ │ 6  │ │ 7  │ │ 8  │       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│         [FILTERS]                   │  Tier filter chips
│                                     │
├─────────────────────────────────────┤
│   [COLLECTION] [BUILD] [BATTLE]     │  Bottom Nav
└─────────────────────────────────────┘
```

**Interactions:**
- **Tap card in collection** → Card animates to nearest empty deck slot
- **Long-press card** → Opens Card Detail modal
- **Drag card in deck** → Reorder slots (affects frequency blend)
- **Tap slot** → Remove card, returns to collection with spring animation
- **Frequency tuner** → Slider appears when 3+ cards in deck

---

### 3.2 Cell Formation Screen

```
┌─────────────────────────────────────┐
│  ←  CELL FORMATION            [+]   │  Header with invite button
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      ◉  ◉  ◉  ◉  ◉         │    │  Pentagonal cell layout
│  │         ╲ │ ╱               │    │  (Members positioned
│  │      ◉ — ◯ — ◉             │    │   in circle)
│  │         ╱ │ ╲               │    │
│  │      ◉  ◉  ◉  ◉  ◉         │    │
│  │                             │    │
│  │    ╭─────────────────╮      │    │  Central resonance field
│  │    │  ~~~ FIELD ~~~  │      │    │  (combines all members)
│  │    ╰─────────────────╯      │    │
│  │      CELL RESONANCE: 44Hz    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────── CELL MEMBERS (3/7) ─────   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ◉  @username    8.2Hz  🟢   │    │  Member list with
│  │ ◉  @friend2     7.9Hz  🟢   │    │  online/status
│  │ ○  Pending...           ⏳   │    │  indicators
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │    [INVITE TO CELL]         │    │  CTA Button
│  │      Share resonance        │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│   [COLLECTION] [BUILD] [BATTLE]     │
└─────────────────────────────────────┘
```

**Interactions:**
- **Tap member avatar** → View their deck
- **Tap invite button** → Farcaster invite flow
- **Shared field pulses** → Syncs with all online members
- **Drag to rotate** → View cell from different angles (3D feel)

---

### 3.3 Battle Interface Screen

```
┌─────────────────────────────────────┐
│  ⚡ BATTLE: THE SYSTEM       [⚙️]   │  Header with settings
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │     ╔═══════════════╗       │    │
│  │     ║  ▓▓▓▓▓▓▓▓░░░  ║       │    │  The System (Enemy)
│  │     ║  THE  SYSTEM  ║       │    │  HP bar + avatar
│  │     ╚═══════════════╝       │    │
│  │        INTENTION:           │    │
│  │    [ SCANNING... ]          │    │  Intent indicator
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    ◉       ◉       ◉        │    │  Cell members in
│  │   ╱│╲     ╱│╲     ╱│╲       │    │  formation
│  │  ───┼───┼───┼───         │    │
│  │   ╲│╱     ╲│╱     ╲│╱       │    │
│  │    ◉       ◉       ◉        │    │
│  │                             │    │
│  │  [RESONANCE METER: 73%]     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────── YOUR TURN — PLAYER 1 ────  │  Turn indicator
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │CARD│ │CARD│ │CARD│ │CARD│       │  Hand (4 cards)
│  │ 1  │ │ 2  │ │ 3  │ │ 4  │       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [PLAY CARD]  [SYNCHRONIZE] │    │  Action bar
│  │  [DEFEND]     [RESONANCE ⚡]│    │  (Resonance = ultimate)
│  └─────────────────────────────┘    │
│                                     │
│  ▓▓▓ Enemy prepares... ▓▓▓         │  Combat log
│                                     │
├─────────────────────────────────────┤
│   [DECK] [FIELD] [BATTLE] [CELL]    │
└─────────────────────────────────────┘
```

**Interactions:**
- **Tap card** → Card lifts, highlights valid targets
- **Drag card to enemy** → Attack animation
- **Tap SYNCHRONIZE** → 60s SynSync entrainment challenge
- **RESONANCE button** → Glowing when full, triggers burst animation
- **Enemy intention** → Warning indicator 2s before attack

---

### 3.4 Victory/Defeat Screen

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         ✦ VICTORY ✦                 │  Large dramatic text
│                                     │
│    ╭─────────────────────╮          │
│    │                     │          │
│    │   [BATTLE SCENE     │          │  Screenshot preview
│    │    MINT CARD]       │          │  (auto-generated)
│    │                     │          │
│    ╰─────────────────────╯          │
│                                     │
│    "The System falters...           │  Victory quote
│     inversion complete."            │
│                                     │
│    ━━━━━━━━━━━━━━━━━━━━━━━━         │
│    LOOT ACQUIRED:                   │
│    ┌────┐ ┌────┐ ┌────┐            │
│    │CARD│ │ +47│ │RARE│            │  Rewards
│    │    │ │ESS│ │DROP│            │
│    └────┘ └────┘ └────┘            │
│    ━━━━━━━━━━━━━━━━━━━━━━━━         │
│                                     │
│    ┌─────────────────────┐          │
│    │   [MINT MEMORY]     │          │  Primary CTA
│    └─────────────────────┘          │
│                                     │
│    ┌─────────────────────┐          │
│    │   SHARE TO CAST →   │          │  Secondary CTA
│    └─────────────────────┘          │
│                                     │
│    [PLAY AGAIN]  [RETURN]           │
│                                     │
└─────────────────────────────────────┘
```

**Defeat Variant:**
- Text: "The System adapts... but so do you."
- Instead of loot: "INSIGHT GAINED: +12 essence"
- "Study the WYRD" button → Card analysis

---

### 3.5 Card Detail Screen

```
┌─────────────────────────────────────┐
│  ←  CARD DETAIL               [♡]   │  Header with favorite
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ╭─────────────────────╮    │    │
│  │  │                     │    │    │  Large card art
│  │  │    [CARD ART]       │    │    │  (full card display)
│  │  │                     │    │    │
│  │  │   THE TOWER         │    │    │
│  │  │   ═══════════       │    │    │
│  │  │   ATOMIC TIER       │    │    │
│  │  ╰─────────────────────╯    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ╭─────────────────────╮    │    │
│  │  │ ~~~~ FREQUENCY ~~~~ │    │    │  Frequency graph
│  │  │  ╲    ╱╲    ╱      │    │    │
│  │  │   ╲  ╱  ╲  ╱       │    │    │  (waveform)
│  │  │    ╲╱    ╲╱        │    │    │
│  │  │    8.7 Hz          │    │    │
│  │  ╰─────────────────────╯    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────── WYRD ETYMOLOGY ───────     │
│                                     │
│  The Tower emerges from ancient     │
│  tarot tradition, representing...   │  Scrollable text
│                                     │
│  [VIEW FULL HISTORY →]              │
│                                     │
│  ────────── STATISTICS ─────────    │
│                                     │
│  RESONANCE:     ████████░░  80%    │
│  HARMONIC:      ██████░░░░  60%    │  Stat bars
│  ENTROPY:       ███░░░░░░░  30%    │
│  SYNERGY:       █████████░  90%    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [ADD TO DECK]              │    │  CTA
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## 4. Animation Specifications

### 4.1 Card Draw Animation

```typescript
// CardDrawAnimation.tsx
interface CardDrawAnimationProps {
  from: { x: number; y: number };    // Deck position
  to: { x: number; y: number };      // Hand position
  card: Card;
  onComplete?: () => void;
}

const cardDrawVariants = {
  initial: {
    x: 0,
    y: 0,
    scale: 0.5,
    opacity: 0,
    rotateY: 180,          // Face down
  },
  animate: {
    x: [0, -50, 100, 0],   // Arc path
    y: [0, -100, -50, 0],
    scale: [0.5, 0.8, 1.1, 1],
    opacity: 1,
    rotateY: [180, 180, 90, 0], // Flip reveal
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
      times: [0, 0.3, 0.7, 1],
    },
  },
};

// Visual: Card emerges from deck, arcs through air
// with slight rotation, flips mid-air, lands in hand
// with a subtle bounce settle
```

### 4.2 Attack Animation

```typescript
// AttackAnimation.tsx
interface AttackAnimationProps {
  attacker: Position;
  target: Position;
  card: Card;
  damage: number;
  type: 'physical' | 'resonance' | 'synchronised';
}

const attackVariants = {
  windup: {
    x: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
  strike: {
    x: '100%',             // Lunge toward target
    scale: 1.1,
    transition: {
      duration: 0.15,
      ease: [0.68, -0.55, 0.265, 1.55], // Bounce
    },
  },
  impact: {
    x: '90%',
    scale: [1.1, 0.9, 1],
    transition: { duration: 0.1 },
  },
  recover: {
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Particle burst on impact
const particleBurst = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 2, 3],
    opacity: [1, 0.5, 0],
    transition: { duration: 0.4 },
  },
};

// Visual: Card lunges forward, tier-colored particles
// burst from impact point, damage number floats up
// with fade, target shakes on hit
```

### 4.3 Resonance Burst Animation

```typescript
// ResonanceBurstAnimation.tsx
interface ResonanceBurstProps {
  cellMembers: CellMember[];
  resonanceLevel: number;    // 0-100
  onComplete?: () => void;
}

const burstSequence = {
  // Phase 1: Charge (all members glow)
  charge: {
    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(2)'],
    boxShadow: [
      '0 0 0px rgba(139, 92, 246, 0)',
      '0 0 20px rgba(139, 92, 246, 0.5)',
      '0 0 40px rgba(139, 92, 246, 1)',
    ],
    transition: { duration: 1.2, ease: 'easeIn' },
  },
  
  // Phase 2: Convergence (energy to center)
  converge: {
    scale: [1, 0.8, 0.5],
    x: 0, // All move to center
    y: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
  
  // Phase 3: Burst (explosive release)
  burst: {
    scale: [0.5, 3, 5],
    opacity: [1, 1, 0],
    filter: ['brightness(2)', 'brightness(5)', 'brightness(10)'],
    transition: { duration: 0.8, ease: [0.87, 0, 0.13, 1] },
  },
  
  // Phase 4: Shockwave
  shockwave: {
    scale: [0, 10],
    opacity: [0.8, 0],
    borderWidth: ['2px', '0px'],
    transition: { duration: 1, ease: 'easeOut' },
  },
};

// Visual: All cell members glow brighter and brighter,
// beams of light connect them to center, energy compresses
// to a singularity, then EXPLODES outward with tier-colored
// shockwave rings, screen shake, enemy takes massive damage
```

### 4.4 Frequency Wave Animation

```typescript
// FrequencyWave.tsx - Continuous animation
interface FrequencyWaveProps {
  frequency: number;        // Hz value
  amplitude: number;        // 0-1
  color: string;
  isActive: boolean;
}

const waveAnimation = {
  path: {
    d: [
      'M0,50 Q25,50 50,50 T100,50',           // Flat
      'M0,50 Q25,25 50,50 T100,50',           // Wave 1
      'M0,50 Q25,25 50,50 Q75,75 100,50',     // Wave 2
      'M0,50 Q25,75 50,50 T100,50',           // Invert
    ],
    transition: {
      duration: 2 / frequency,  // Speed based on Hz
      repeat: Infinity,
      ease: 'linear',
    },
  },
  glow: {
    filter: [
      'drop-shadow(0 0 2px currentColor)',
      'drop-shadow(0 0 8px currentColor)',
      'drop-shadow(0 0 2px currentColor)',
    ],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Visual: SVG path animates through waveforms matching
// the card's frequency. Higher frequency = faster animation.
// Glow pulses in sync.
```

### 4.5 SynSync Entrainment Animation

```typescript
// EntrainmentTimer.tsx - 60 second challenge
interface EntrainmentAnimation {
  progress: number;         // 0-100
  brainwaveState: BrainwaveState;
  syncQuality: number;      // 0-1 how well synced
}

const entrainmentVariants = {
  container: {
    background: [
      'radial-gradient(circle, #1a1a2e 0%, #0A0A0F 100%)',
      'radial-gradient(circle, #2d1b69 0%, #0A0A0F 100%)',
      'radial-gradient(circle, #1a1a2e 0%, #0A0A0F 100%)',
    ],
    transition: { duration: 4, repeat: Infinity },
  },
  
  circle: {
    strokeDashoffset: [283, 0],  // Full circle to empty
    stroke: [
      '#3B82F6',  // Beta
      '#8338EC',  // Theta  
      '#FFBE0B',  // Alpha
    ],
    transition: { duration: 60, ease: 'linear' },
  },
  
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 60 / targetFrequency, // Pulse at target Hz
      repeat: Infinity,
    },
  },
};

// Visual: Breathing circle that pulses at target frequency.
// 60-second countdown with color shifts matching brainwave states.
// Progress ring shrinks. "SYNC ACHIEVED" flashes when quality > 0.8.
```

---

## 5. Mobile-Responsive Considerations (Farcaster)

### 5.1 Viewport Constraints

```typescript
// Farcaster Mini App specific
const farcasterConstraints = {
  // Frame SDK viewport
  safeArea: {
    top: 'env(safe-area-inset-top, 0px)',
    bottom: 'env(safe-area-inset-bottom, 20px)',
    left: 'env(safe-area-inset-left, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
  },
  
  // iOS status bar + Frame header
  topOffset: '44px',
  
  // Bottom action bar + home indicator
  bottomOffset: '84px',
  
  // Usable screen
  maxContentHeight: 'calc(100vh - 128px)',
  
  // Card sizing for mobile
  cardSize: {
    width: '72px',
    height: '108px',  // 2:3 ratio
    gap: '8px',
  },
};
```

### 5.2 Touch Optimizations

```typescript
// Touch targets minimum 44x44px
const touchTargets = {
  button: {
    minHeight: '44px',
    minWidth: '44px',
    padding: '12px 16px',
  },
  card: {
    minHeight: '108px',
    minWidth: '72px',
    touchAction: 'pan-y pinch-zoom', // Allow scroll, prevent zoom
  },
  navItem: {
    minHeight: '44px',
    minWidth: '64px',
  },
};

// Gesture handling
const gestures = {
  // Card swipe to play
  swipeThreshold: 50,
  
  // Long press for details
  longPressDuration: 400,
  
  // Double tap to zoom card
  doubleTapDelay: 300,
  
  // Pull to refresh in collection
  pullThreshold: 80,
};
```

### 5.3 Performance Optimizations

```typescript
// Mobile performance
const mobileOptimizations = {
  // Reduce particle counts
  particles: {
    desktop: 100,
    mobile: 30,
  },
  
  // Simplified animations
  useSimpleAnimations: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  // Lazy load card art
  imageLoading: 'lazy',
  
  // Debounce scroll handlers
  scrollDebounce: 16, // 1 frame
  
  // Use transform instead of position
  useTransform: true,
  
  // GPU acceleration hints
  willChange: 'transform, opacity',
};
```

### 5.4 Responsive Breakpoints

```typescript
// Farcaster Mini App breakpoints
const breakpoints = {
  // Small phones (iPhone SE, mini)
  xs: '375px',
  
  // Standard phones (iPhone 14, Pixel 7)
  sm: '390px',
  
  // Large phones (iPhone 14 Pro Max)
  md: '430px',
  
  // Tablets / Desktop Frame view
  lg: '768px',
};

// Component adaptations
const responsiveStyles = {
  // Deck Builder
  collectionGrid: {
    xs: '3 columns',
    sm: '4 columns',
    md: '4 columns',
  },
  
  // Battle Interface
  handSize: {
    xs: '3 cards visible',
    sm: '4 cards visible',
    md: '5 cards visible',
  },
  
  // Cell Formation
  memberOrbit: {
    xs: 'simplified 2D',
    sm: 'subtle 3D',
    md: 'full 3D depth',
  },
};
```

---

## 6. Props Interfaces

### 6.1 Core Components

```typescript
// Card.types.ts
export interface Card {
  id: string;
  name: string;
  tier: 'physical' | 'emotional' | 'atomic' | 'galactic' | 'cosmic';
  artUrl: string;
  frequency: number;           // Base frequency in Hz
  resonance: number;           // 0-100
  harmonic: number;
  entropy: number;
  synergy: number;
  wyrdEtymology: Etymology;
  abilities: Ability[];
}

export interface Etymology {
  origin: string;
  evolution: string[];
  meaning: string;
  quote: string;
}

export interface Ability {
  name: string;
  description: string;
  cooldown: number;
  power: number;
}
```

```typescript
// CardFrame.props.ts
interface CardFrameProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHighlighted?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

// CardFrequency.props.ts
interface CardFrequencyProps {
  frequency: number;
  isActive?: boolean;
  showWaveform?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### 6.2 Screen Components

```typescript
// DeckBuilder.props.ts
interface DeckBuilderProps {
  collection: Card[];
  currentDeck: Card[];         // Max 7 cards
  maxDeckSize: number;
  sharedResonance: number;     // Calculated from deck
  onAddCard: (card: Card) => void;
  onRemoveCard: (index: number) => void;
  onReorderDeck: (from: number, to: number) => void;
  onFrequencyTune: (frequency: number) => void;
  onViewCardDetail: (card: Card) => void;
}
```

```typescript
// CellFormation.props.ts
interface CellFormationProps {
  cellId: string;
  members: CellMember[];
  maxMembers: number;
  sharedField: ResonanceField;
  isLeader: boolean;
  onInvite: () => void;
  onViewMember: (member: CellMember) => void;
  onLeaveCell: () => void;
}

interface CellMember {
  id: string;
  displayName: string;
  avatarUrl: string;
  deckResonance: number;
  status: 'online' | 'offline' | 'in_battle';
  lastActive: Date;
}

interface ResonanceField {
  combinedFrequency: number;
  fieldStrength: number;       // 0-100
  activeEffects: FieldEffect[];
}
```

```typescript
// BattleInterface.props.ts
interface BattleInterfaceProps {
  battleId: string;
  cell: Cell;
  enemy: Enemy;
  phase: 'setup' | 'player_turn' | 'enemy_turn' | 'resolution' | 'ended';
  currentPlayer: string;
  hand: Card[];
  field: FieldCard[];
  resonanceMeter: number;      // 0-100 for burst
  combatLog: CombatLogEntry[];
  onPlayCard: (cardId: string, target?: string) => void;
  onSynchronize: () => void;   // SynSync challenge
  onResonanceBurst: () => void;
  onDefend: () => void;
  onPass: () => void;
}

interface Enemy {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  intention: EnemyIntention;
  phase: number;
  avatarUrl: string;
}

interface EnemyIntention {
  type: 'attack' | 'defend' | 'special' | 'charge';
  target?: string;
  power: number;
  warning: boolean;            // True if visible to players
}
```

```typescript
// VictoryDefeat.props.ts
interface VictoryDefeatProps {
  result: 'victory' | 'defeat';
  battleSnapshot: BattleSnapshot;
  rewards: Reward[];
  quote: string;
  onMint: () => Promise<void>;
  onShare: () => void;
  onPlayAgain: () => void;
  onReturn: () => void;
}

interface BattleSnapshot {
  imageUrl: string;
  cellMembers: string[];
  enemyName: string;
  duration: number;
  turns: number;
  resonancePeak: number;
}

interface Reward {
  type: 'card' | 'essence' | 'rare_drop' | 'synthesis';
  item?: Card;
  amount?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}
```

```typescript
// CardDetail.props.ts
interface CardDetailProps {
  card: Card;
  isOwned: boolean;
  isInDeck: boolean;
  similarCards: Card[];
  usageStats: {
    battlesUsed: number;
    winRate: number;
    avgResonance: number;
  };
  onAddToDeck: () => void;
  onRemoveFromDeck: () => void;
  onViewFullEtymology: () => void;
  onClose: () => void;
}
```

### 6.3 SynSync Integration Components

```typescript
// ProtocolSelector.props.ts
interface ProtocolSelectorProps {
  protocols: BrainwaveProtocol[];
  selectedProtocol: string;
  onSelect: (protocolId: string) => void;
  disabled?: boolean;
}

interface BrainwaveProtocol {
  id: string;
  name: string;
  frequency: number;
  description: string;
  color: string;
  duration: number;            // Default seconds
  category: 'focus' | 'relax' | 'sleep' | 'creative' | 'meditation';
}
```

```typescript
// EntrainmentTimer.props.ts
interface EntrainmentTimerProps {
  targetFrequency: number;
  duration: number;            // Seconds (default 60)
  onStart: () => void;
  onComplete: (result: EntrainmentResult) => void;
  onCancel: () => void;
}

interface EntrainmentResult {
  success: boolean;
  quality: number;             // 0-1 sync quality
  avgDeviation: number;        // Hz deviation from target
  timeInSync: number;          // Seconds within threshold
  bonusMultiplier: number;     // Applied to battle action
}
```

---

## 7. SynSync Integration UI Specifications

### 7.1 Protocol Selector

```
┌─────────────────────────────────────┐
│  SELECT RESONANCE PROTOCOL          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔴 GAMMA (40Hz)            │    │
│  │  Peak focus & cognition     │    │
│  │  [SELECT]                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🟠 BETA (20Hz)             │    │
│  │  Active problem solving     │    │
│  │  [SELECT]                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🟡 ALPHA (10Hz) ← RECOMMENDED│
│  │  Relaxed awareness          │    │
│  │  [SELECT]                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🟣 THETA (6Hz)             │    │
│  │  Deep meditation            │    │
│  │  [SELECT]                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔵 DELTA (2Hz)             │    │
│  │  Deep sleep states          │    │
│  │  [SELECT]                   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 7.2 Entrainment Challenge UI

```
┌─────────────────────────────────────┐
│  60-SECOND ENTRAINMENT              │
│                                     │
│                                     │
│        ╭─────────────╮              │
│       ╱               ╲             │
│      │    ◉──────◉    │            │  Breathing circle
│      │   /          \   │            │  pulses at target Hz
│      │  │   0:42    │  │            │
│      │   \          /   │            │
│       ╲               ╱             │
│        ╰─────────────╯              │
│                                     │
│     ●─────────────────○             │
│     SYNC QUALITY: 73%               │
│                                     │
│     Inhale... Exhale...             │
│     Match the pulse                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      [CANCEL]               │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## 8. Implementation Notes

### 8.1 State Management

```typescript
// Recommended: Zustand for state
interface AppState {
  // Deck
  collection: Card[];
  currentDeck: Card[];
  deckResonance: number;
  
  // Cell
  currentCell: Cell | null;
  cellMembers: CellMember[];
  sharedField: ResonanceField;
  
  // Battle
  battleState: BattleState | null;
  combatLog: CombatLogEntry[];
  resonanceMeter: number;
  
  // SynSync
  synSyncStatus: 'idle' | 'connecting' | 'active' | 'synced';
  currentProtocol: BrainwaveProtocol | null;
  entrainmentProgress: number;
}
```

### 8.2 Animation Library Recommendations

- **Framer Motion** — Primary animation library for React
- **GSAP** — Complex sequences (Resonance Burst)
- **Lottie** — Complex icon animations
- **CSS Animations** — Simple continuous effects (waveforms)

### 8.3 Accessibility Considerations

```typescript
const a11y = {
  // Reduced motion support
  respectPrefersReducedMotion: true,
  
  // Focus management
  trapFocusInModals: true,
  returnFocusOnClose: true,
  
  // Screen reader
  announceCombatActions: true,
  cardDescriptions: true,
  
  // Color contrast
  minimumContrast: 4.5,
  
  // Touch
  minimumTouchTarget: 44,
};
```

---

## 9. Asset Requirements

### 9.1 Card Frame Assets (by Tier)

| Tier | Frame Style | Effects |
|------|-------------|---------|
| Physical | Bronze metallic border, subtle weathering | Dust particles |
| Emotional | Silver polished border, reflection | Soft glow pulse |
| Atomic | Gold ornate border, intricate patterns | Shimmer overlay |
| Galactic | Aurora gradient border, shifting colors | Color shift animation |
| Cosmic | Void black border, starfield inside | Stars twinkle |

### 9.2 Iconography

- Navigation: Simple line icons (Lucide or similar)
- Tier badges: Stylized elemental symbols
- Status effects: Animated SVG icons
- Frequency indicators: Waveform glyphs

### 9.3 Audio (Optional)

- Card draw: Soft whoosh
- Attack: Impact sound (tier-colored timbre)
- Resonance burst: Crescendo + release
- Victory: Chord progression
- Defeat: Dissonant resolution

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-07  
**Status:** Ready for Implementation
