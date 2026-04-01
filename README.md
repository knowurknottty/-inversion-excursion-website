# Inversion Excursion — Transcendent Edition

A digital sacred space embodying the journey of awakening described in the book *Inversion Excursion*. Optimized for both desktop and mobile experiences.

## Overview

This is not a typical book website. It is an immersive digital experience featuring:

- **🎭 Dual Platform Experience**: Automatic detection serves desktop or mobile-optimized version
- **🔮 Three.js Sacred Geometry**: Breathing, responsive geometric forms that evolve with your reading
- **🎵 Spatial Audio**: Chapter-specific binaural soundscapes using Tone.js
- **✨ Progressive Revelation**: Text that emerges as you scroll, rewarding presence
- **🧘 Embedded Practices**: Interactive meditation timers within reflection sections
- **🌀 Journey Mandala**: Circular chapter navigation that mirrors the spiral nature of awakening
- **📱 PWA Support**: Install as an app on mobile devices

## Platform Support

### Desktop Experience
- Full keyboard navigation (`←`, `→`, `Space`, `M`)
- Enhanced Three.js sacred geometry with detailed visualizations
- Scroll-based progress tracking
- Chapter portal entry animation

### Mobile Experience
- Touch-optimized gestures (swipe to navigate chapters)
- Simplified, performant sacred geometry
- Floating audio controls
- Haptic feedback on supported devices
- Portrait-optimized layout
- Automatic pause/resume on app backgrounding

### Automatic Platform Detection
The site automatically detects your device type and serves the appropriate experience:
- **Mobile** (≤768px): Touch-optimized interface
- **Tablet** (769px–1024px): Mobile experience with responsive scaling
- **Desktop** (>1024px): Full desktop experience

## Technology Stack

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Three.js** — Sacred geometry visualization
- **Tone.js** — Spatial audio and binaural beats
- **Zustand** — State management with persistence
- **Vite** — Build tooling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone or navigate to the project
cd /root/.openclaw/workspace/-inversion-excursion-website-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── App.tsx                  # Unified entry with platform detection
├── App.desktop.tsx          # Desktop experience
├── App.mobile.tsx           # Mobile experience
├── App.css                  # Desktop styles
├── App.mobile.css           # Mobile styles
├── components/
│   ├── desktop/             # Desktop-specific components
│   │   └── (see structure)
│   ├── mobile/              # Mobile-specific components
│   │   ├── ChapterBottomSheet/
│   │   ├── FloatingAudioButton/
│   │   ├── MobileNavigation/
│   │   ├── SacredGeometryMobile/
│   │   ├── SwipeableChapter/
│   │   └── TouchMeditationTimer/
│   ├── SacredGeometry/      # Desktop Three.js components
│   │   ├── TorusField.tsx   # Primary background geometry
│   │   ├── FlowerOfLife.tsx
│   │   └── MetatronCube.tsx
│   ├── ChapterPortal/       # Chapter entry animations
│   ├── JourneyMandala/      # Circular navigation
│   ├── MeditationTimer/     # Desktop practice timer
│   └── TextReveal/          # Animated text components
├── hooks/
│   ├── usePlatform.ts       # Platform detection hook
│   ├── desktop/             # Desktop-specific hooks
│   │   ├── useAudioEngine.ts
│   │   └── useScrollProgress.ts
│   └── mobile/              # Mobile-specific hooks
│       ├── useDeviceOrientation.ts
│       ├── useMobileAudio.ts
│       ├── useSwipeGesture.ts
│       └── useTouchFeedback.ts
├── stores/
│   └── journeyStore.ts      # Zustand state management
├── content/
│   └── bookContent.ts       # The book's 7 chapters (shared)
└── utils/
    ├── gestureHandlers.ts   # Mobile gesture utilities
    └── mobilePerformance.ts # Mobile optimization utilities
```

## Features

### Platform Detection Hook
```typescript
import { usePlatform } from '@hooks/usePlatform';

function MyComponent() {
  const platform = usePlatform(); // 'mobile' | 'tablet' | 'desktop'
  // ...
}
```

### Chapter-Specific Sacred Geometry
Each chapter has its own color palette and geometric presence:

1. **The Inversion** — Gold/Purple — Torus Field
2. **The Mirror** — Silver/Gray — Flower of Life
3. **The Threshold** — Deep Void — Breathing Void
4. **The Labyrinth** — Blue — Complex Torus
5. **The Revelation** — Golden Light — Metatron's Cube
6. **The Integration** — Earth Green — Grounded Torus
7. **The Return** — Cosmic Violet — Expanding Field

### Audio Experience
- Each chapter has unique binaural frequencies
- Audio responds to scroll position (desktop) or app state (mobile)
- Box-breathing meditation timer with visual guidance

### Navigation

**Desktop:**
- `←` / `→` — Previous/Next chapter
- `Space` — Toggle audio
- `M` — Open Journey Mandala

**Mobile:**
- Swipe left/right — Navigate chapters
- Long press — Open meditation timer
- Tap menu button — Chapter navigation
- Floating button — Audio controls

### PWA Features
- Install as standalone app on mobile home screen
- Offline support via service worker
- Optimized icons and splash screens
- App shortcuts for quick actions

## Design Philosophy

The design embodies the book's central teaching: the medium is the message. Every element serves the purpose of turning attention inward:

- **Sacred Slowness**: No animation completes in less than 0.3s
- **Breathing Rhythm**: Base animation frequency matches relaxed human breathing (0.1Hz)
- **Progressive Revelation**: Content rewards patience and presence
- **Depth Over Breadth**: The experience deepens rather than expands
- **Platform Respect**: Each platform gets an experience suited to its strengths

Read the full [Design Vision](./docs/DESIGN_VISION.md) for detailed philosophy.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile Safari (iOS 15+)
- Chrome Android

## Performance

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Maintains 60fps during animations
- Respects `prefers-reduced-motion`
- Mobile-optimized asset loading

## Credits

Created by the OpenClaw Agent Swarm as a digital sacred space for the book *Inversion Excursion*.

The book explores themes of awakening, consciousness, shadow work, and the hero's journey — this website attempts to embody those themes in its very interface.

## License

MIT

---

*"As the veil of slumber lifts, the path to awakening unfolds..."*
