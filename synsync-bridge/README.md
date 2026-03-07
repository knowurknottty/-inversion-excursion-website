# SynSync Bridge

Self-contained brainwave entrainment engine for Farcaster mini apps. Zero external dependencies, zero CORS issues.

## Overview

SynSync Bridge brings neuroscience-backed audio entrainment directly into Farcaster mini apps. All audio is generated client-side via the Web Audio API—no external files, no network requests, no CORS headaches.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Farcaster Frame                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │              SynSync Bridge Engine               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │   │
│  │  │   Binaural  │  │  Isochronic │  │  Analyser│ │   │
│  │  │  Generator  │  │  Generator  │  │   Node   │ │   │
│  │  └─────────────┘  └─────────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │           Breathing Circle UI                   │   │
│  │     (60s timer + visual entrainment)            │   │
│  └─────────────────────────────────────────────────┘   │
│                    │                                     │
│  ┌─────────────────▼───────────────────────────────┐   │
│  │         Resonance Calculator                    │   │
│  │    (Frequency-to-card matching)                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌──────────────────────┐
              │   Server Verification │
              │   (Proof validation)  │
              └──────────────────────┘
```

## Frequency Presets

| Preset | Frequency | Effect | Best For |
|--------|-----------|--------|----------|
| Gamma | 40Hz | Cognitive enhancement | Focus cards, speed decks |
| Alpha | 10Hz | Relaxed alertness | Control decks, healing |
| Theta | 6Hz | Deep meditation | Dream cards, intuition |
| Schumann | 7.83Hz | Earth grounding | Defense, stability |

## Game Mechanics

### Resonance System

```
Matching frequency = +50% card effect (Perfect Resonance ✦✦✦)
Close match (80%+) = +30% effect (Strong Resonance ✦✦)
Partial match (60%+) = +10% effect (Resonance ✦)
Mismatched = -20% effect (Dissonant ⚠)
```

### Card Frequency Mapping

```typescript
// Focus/Stim cards → Gamma (40Hz)
focus_boost, caffeine_rush, sprint_mode

// Calm/Heal cards → Alpha (10Hz)  
meditation, healing_light, peace_shield

// Dream/Intuition cards → Theta (6Hz)
dream_walk, sixth_sense, astral_projection

// Grounding/Balance cards → Schumann (7.83Hz)
earth_anchor, root_chakra, grounding_pulse
```

## Security: Proof of Entrainment

The system generates cryptographically-inspired proofs that make spoofing expensive:

### Client-Side Proof Generation

```typescript
interface EntrainmentProof {
  sessionId: string;           // Unique session identifier
  timestamp: number;           // Session start time
  duration: number;            // Actual listening time
  targetFrequency: number;     // Intended frequency
  actualFrequencies: number[]; // Sampled frequency data
  entropy: number;             // Shannon entropy (anti-bot)
  signature: string;           // Verification signature
}
```

### Anti-Cheat Measures

1. **Frequency Entropy**: Natural human listening produces variable FFT readings. Bots tend to be too regular.

2. **Audio Fingerprinting**: Captures Web Audio API characteristics (sample rate, channel count, base latency) to detect emulated environments.

3. **Timing Analysis**: Samples collected at ~1s intervals. Missing samples indicate manipulation.

4. **Replay Protection**: Session IDs are tracked server-side and cannot be reused.

5. **Rate Limiting**: 3 proofs per minute per user maximum.

### Server Verification

```typescript
import { fullServerVerification } from './SynSyncSecurity';

const result = fullServerVerification(proof, userId, expectedFrequency);
// Returns: { approved: boolean, multiplier: number, reasons: string[] }
```

## API Reference

### SynSyncEngine

```typescript
const engine = getSynSyncEngine();

// Initialize (call after user gesture)
await engine.initialize();

// Start binaural beats (headphones recommended)
await engine.startBinaural({
  preset: 'alpha',
  carrierFrequency: 432,
  beatFrequency: 10,
  beatType: 'binaural',
  duration: 60,
  volume: 0.5
});

// Start isochronic tones (works on speakers)
await engine.startIsochronic(config);

// Stop session
engine.stop();

// Get progress (0.0 - 1.0)
const progress = engine.getProgress(60);

// Generate proof
const proof = engine.generateProof(config);
```

### ResonanceCalculator

```typescript
import { calculateResonance, suggestOptimalFrequency } from './ResonanceCalculator';

// Calculate card effectiveness
const resonance = calculateResonance(userFrequency, cardId);
// Returns: { multiplier: 1.5, isResonant: true, ... }

// Get deck recommendation
const suggestion = suggestOptimalFrequency(hand);
// Returns: { frequency: 40, confidence: 0.67, reason: '...' }
```

## Deep Link Fallback

If the mini app environment is too constrained, users can open the full SynSync PWA:

```
https://app.synsync.pro/?source=farcaster&preset=alpha
```

Parameters:
- `source=farcaster` - Identifies origin for analytics
- `preset=alpha|theta|gamma|schumann` - Pre-selects frequency

## File Structure

```
synsync-bridge/
├── SynSyncEngine.ts        # Core audio engine
├── ResonanceCalculator.ts  # Game mechanics
├── SynSyncUI.tsx           # React components
├── SynSyncSecurity.ts      # Server verification
├── SynSyncIntegration.tsx  # Usage examples
└── README.md               # This file
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support (iOS requires user interaction)
- WebView: Full support

## Performance

- Bundle size: ~15KB gzipped
- Memory usage: ~5MB during session
- CPU: Minimal (Web Audio runs on separate thread)
- Battery: Low impact (no network, efficient oscillators)

## License

MIT - Part of the SynSync open-source ecosystem
