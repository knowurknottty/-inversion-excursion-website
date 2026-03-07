# SynSync Audio Engine

A high-performance Web Audio API engine for brainwave entrainment and frequency generation. Built for the SynSync Pro platform.

## Features

- 🎵 **Binaural Beat Generation** — Precise dual-oscillator synthesis
- 🎶 **Isochronic Tones** — Pulsed frequency patterns (no headphones required)
- 🧠 **6 Science-Backed Presets** — Delta, Theta, Alpha, Beta, Gamma, Schumann
- 📊 **Volume Envelope System** — Gentle fade in/out prevents audio shock
- 🔊 **Stereo Panning** — Spatial audio for enhanced binaural effect
- ⚡ **Performance Optimized** — Minimal CPU/battery impact
- 📱 **Mobile Ready** — Adaptive to device capabilities
- 🔒 **Type Safe** — Full TypeScript support

## Quick Start

```typescript
import { createAudioEngine } from './audio-engine';

// Initialize (must be after user interaction)
const engine = await createAudioEngine();

// Start Alpha waves (10 Hz) for relaxed focus
const sessionId = await engine.startBinaural('alpha');

// Stop after 10 minutes
setTimeout(() => engine.stopSession(sessionId), 10 * 60 * 1000);
```

## Installation

```bash
# Copy files to your project
cp -r synsync/ ./src/

# Import in your code
import { AudioEngine, FREQUENCY_PRESETS } from './synsync';
```

## Usage Examples

### Binaural Beats

```typescript
import { AudioEngine } from './synsync';

const engine = new AudioEngine();
await engine.initialize();

// Use preset
await engine.startBinaural('theta'); // Meditation

// Or custom configuration
await engine.startBinaural({
  baseFrequency: 200,    // Left ear
  beatFrequency: 7.83,   // Schumann resonance
  waveform: 'sine'
});
```

### Isochronic Tones

```typescript
// Isochronic tones work without headphones!
await engine.startIsochronic('gamma', {
  attackTime: 1.0,
  sustainLevel: 0.7,
  releaseTime: 2.0
});
```

### Protocol Sequences

```typescript
import { getProtocol } from './synsync';

const sleepProtocol = getProtocol('Sleep Onset');

// Runs: Alpha (5 min) → Theta (5 min) → Delta (15 min)
for (const step of sleepProtocol.sequence) {
  await engine.startBinaural(step.band);
  await wait(step.duration * 60 * 1000);
  await engine.stopSession(currentSession);
}
```

## Frequency Presets

| Band | Frequency | State | Use Case |
|------|-----------|-------|----------|
| **Delta** | 2-4 Hz | Deep sleep | Healing, regeneration |
| **Theta** | 4-8 Hz | Meditation | Creativity, emotional processing |
| **Alpha** | 8-14 Hz | Relaxed focus | Stress relief, learning |
| **Beta** | 14-30 Hz | Active focus | Cognitive performance |
| **Gamma** | 30-100 Hz | Peak cognition | Insight, high-level processing |
| **Schumann** | 7.83 Hz | Earth resonance | Grounding, harmony |

## API Reference

### AudioEngine

```typescript
class AudioEngine {
  // Initialize the audio context
  async initialize(): Promise<boolean>
  
  // Start binaural beat generation
  async startBinaural(
    preset: FrequencyBand | BinauralConfig,
    envelope?: Partial<EnvelopeConfig>,
    sessionId?: string
  ): Promise<string>
  
  // Start isochronic tone generation
  async startIsochronic(
    preset: FrequencyBand | IsochronicConfig,
    envelope?: Partial<EnvelopeConfig>,
    sessionId?: string
  ): Promise<string>
  
  // Stop a session with fade out
  async stopSession(sessionId: string, fadeOutTime?: number): Promise<void>
  
  // Stop all sessions
  async stopAll(fadeOutTime?: number): Promise<void>
  
  // Volume control
  setMasterVolume(volume: number): void
  
  // Session management
  getActiveSessions(): Array<{ id: string; type: string; duration: number }>
  isSessionActive(sessionId: string): boolean
  
  // Cleanup
  dispose(): void
}
```

### Configuration Types

```typescript
interface BinauralConfig {
  baseFrequency: number;   // Carrier frequency (Hz)
  beatFrequency: number;   // Target brainwave frequency (Hz)
  waveform?: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

interface IsochronicConfig {
  frequency: number;       // Pulse frequency (Hz)
  toneFrequency: number;   // Carrier tone (Hz)
  dutyCycle?: number;      // Pulse width (0.0 - 1.0)
  waveform?: Waveform;
}

interface EnvelopeConfig {
  attackTime: number;      // Fade-in duration (seconds)
  sustainLevel: number;    // Volume level (0.0 - 1.0)
  releaseTime: number;     // Fade-out duration (seconds)
}
```

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 66+ | ✅ Full |
| Firefox | 60+ | ✅ Full |
| Safari | 14.1+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| iOS Safari | 14.5+ | ✅ Full |
| Android Chrome | 66+ | ✅ Full |

See [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md) for details.

## Performance

- **Latency**: < 50ms target
- **CPU**: < 15% on mid-range devices
- **Memory**: < 50MB audio overhead
- **Mobile**: Adaptive to device capabilities

See [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) for optimization strategies.

## Architecture

```
┌─────────────────────────────────────────────┐
│              AudioEngine                    │
├─────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐      │
│  │   Binaural   │    │  Isochronic  │      │
│  │  Generator   │    │  Generator   │      │
│  └──────┬───────┘    └──────┬───────┘      │
│         │                   │               │
│         └───────┬───────────┘               │
│                 ▼                           │
│         ┌──────────────┐                   │
│         │   Envelope   │                   │
│         │   Manager    │                   │
│         └──────┬───────┘                   │
│                ▼                            │
│        ┌──────────────┐                    │
│        │   Compressor │                    │
│        └──────┬───────┘                    │
│               ▼                             │
│        ┌──────────────┐                    │
│        │  Master Gain │                    │
│        └──────┬───────┘                    │
│               ▼                             │
│         ┌──────────┐                       │
│         │  Output  │                       │
│         └──────────┘                       │
└─────────────────────────────────────────────┘
```

## File Structure

```
synsync/
├── audio-engine.ts           # Core audio engine
├── frequency-presets.ts      # Frequency configurations
├── audio-examples.ts         # Usage examples
├── index.ts                  # Main exports
├── BROWSER_COMPATIBILITY.md  # Browser support details
└── PERFORMANCE_OPTIMIZATION.md # Performance guide
```

## Research References

- Oster, G. (1973). Auditory beats in the brain. *Scientific American*.
- Dr. Jeffrey Thompson - Neuroacoustic Research
- Monroe Institute - Hemi-Sync research
- Schumann, W.O. (1952). On the free oscillations of the Earth's ionosphere

## License

MIT - Open source for the SynSync Pro project.

---

Built with 🔥 for brainwave entrainment that respects your privacy.
