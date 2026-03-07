# SynSync Audio Engine - Browser Compatibility Notes

## Overview

The SynSync Audio Engine is built on the **Web Audio API**, which has excellent support across modern browsers. This document outlines compatibility details, known issues, and recommended polyfills.

---

## Browser Support Matrix

| Browser | Version | Web Audio API | Notes |
|---------|---------|---------------|-------|
| **Chrome** | 66+ | ✅ Full | Best performance, recommended |
| **Firefox** | 60+ | ✅ Full | Excellent support |
| **Safari** | 14.1+ | ✅ Full | Uses `webkitAudioContext` prefix |
| **Edge** | 79+ | ✅ Full | Chromium-based, same as Chrome |
| **Opera** | 53+ | ✅ Full | Chromium-based |
| **iOS Safari** | 14.5+ | ✅ Full | May have latency issues |
| **Android Chrome** | 66+ | ✅ Full | Performance varies by device |
| **Samsung Internet** | 9.0+ | ✅ Full | Based on Chromium |

---

## Feature Detection

### Recommended Pattern

```typescript
function checkWebAudioSupport(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

function getAudioContextClass(): typeof AudioContext {
  return window.AudioContext || (window as any).webkitAudioContext;
}
```

### Engine-Level Detection

```typescript
import { AudioEngine } from './audio-engine';

async function initWithFallback(): Promise<void> {
  const engine = new AudioEngine();
  
  try {
    const success = await engine.initialize();
    
    if (!success) {
      showError('Web Audio API not available');
      return;
    }
    
    // Check for specific features
    const features = {
      stereoPanner: 'StereoPannerNode' in window,
      createPeriodicWave: 'createPeriodicWave' in engine.context!,
      audioWorklet: 'audioWorklet' in engine.context!
    };
    
    console.log('Audio features:', features);
    
  } catch (error) {
    showError('Failed to initialize audio');
  }
}
```

---

## Known Issues and Workarounds

### 1. Safari WebKit Prefix

**Issue**: Safari uses `webkitAudioContext` instead of `AudioContext`.

**Solution**: Already handled in AudioEngine:
```typescript
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
```

### 2. Autoplay Policy

**Issue**: Browsers block audio playback without user interaction.

**Solution**: Initialize audio after user gesture:
```typescript
// ❌ Won't work
await engine.initialize();
await engine.startBinaural('alpha');

// ✅ Works
button.addEventListener('click', async () => {
  await engine.initialize();
  await engine.startBinaural('alpha');
});
```

### 3. iOS AudioContext Suspension

**Issue**: iOS suspends audio context when app goes to background.

**Solution**: Resume on visibility change:
```typescript
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    await engine.resume();
  } else {
    await engine.suspend();
  }
});
```

### 4. Sample Rate Mismatch

**Issue**: Some devices have non-standard sample rates (e.g., 48kHz vs 44.1kHz).

**Solution**: Always use context.sampleRate:
```typescript
const sampleRate = engine.context?.sampleRate || 44100;
```

### 5. Memory Leaks on Mobile

**Issue**: Creating many AudioContexts causes memory issues.

**Solution**: Reuse single AudioContext:
```typescript
// ❌ Don't do this
function playSound() {
  const ctx = new AudioContext(); // New context every time!
  // ...
}

// ✅ Do this
const engine = new AudioEngine();
await engine.initialize();

function playSound() {
  // Reuse existing context
  engine.startBinaural('alpha');
}
```

---

## Performance Considerations by Platform

### Desktop

| Browser | Notes |
|---------|-------|
| Chrome | Best overall performance, use `chrome://flags/#enable-low-latency` for lower latency |
| Firefox | Very good, slightly higher latency than Chrome |
| Safari | Good, but audio processing may pause in background tabs |
| Edge | Same as Chrome (Chromium-based) |

### Mobile

| Platform | Notes |
|----------|-------|
| iOS Safari | Higher latency (~20-30ms), limited background audio |
| Android Chrome | Performance varies widely by device |
| Android Firefox | Good, but may have audio glitches on some devices |

### Recommended Minimum Specs

- **CPU**: 1.5 GHz dual-core
- **RAM**: 2 GB
- **Browser**: Latest 2 versions of major browsers

---

## Polyfills and Shims

### Web Audio API Polyfill

For older browsers (not recommended for production):

```bash
npm install web-audio-api
```

```typescript
// Polyfill for Node.js or older browsers
import { AudioContext as PolyfillContext } from 'web-audio-api';

if (!window.AudioContext) {
  window.AudioContext = PolyfillContext as any;
}
```

### StereoPannerNode Polyfill

For Safari < 15:

```typescript
function createStereoPanner(context: AudioContext): StereoPannerNode {
  if ('createStereoPanner' in context) {
    return context.createStereoPanner();
  }
  
  // Fallback: Use ChannelMerger and GainNodes
  const merger = context.createChannelMerger(2);
  const leftGain = context.createGain();
  const rightGain = context.createGain();
  
  // Manual panning implementation
  return {
    connect: merger.connect.bind(merger),
    disconnect: merger.disconnect.bind(merger),
    pan: {
      value: 0,
      setValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    }
  } as any;
}
```

---

## Testing Compatibility

### Automated Testing

```typescript
// test/audio-compatibility.test.ts

describe('AudioEngine Compatibility', () => {
  test('should detect Web Audio API support', () => {
    expect(AudioEngine.isSupported()).toBe(true);
  });

  test('should initialize successfully', async () => {
    const engine = new AudioEngine();
    const result = await engine.initialize();
    expect(result).toBe(true);
    engine.dispose();
  });

  test('should handle suspend/resume', async () => {
    const engine = await createAudioEngine();
    
    await engine.suspend();
    expect(engine.getState()).toBe('suspended');
    
    await engine.resume();
    expect(engine.getState()).toBe('running');
    
    engine.dispose();
  });
});
```

### Manual Testing Checklist

- [ ] Audio plays after user interaction
- [ ] No console errors on initialization
- [ ] Volume controls work smoothly
- [ ] Sessions can be stopped and restarted
- [ ] Multiple browsers tested (Chrome, Firefox, Safari)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Background/foreground behavior correct

---

## Troubleshooting

### "The AudioContext was not allowed to start"

**Cause**: Autoplay policy violation.

**Fix**: Ensure initialization happens after user gesture:
```typescript
button.addEventListener('click', initAudio, { once: true });
```

### "Cannot read property 'createOscillator' of null"

**Cause**: AudioContext not initialized.

**Fix**: Check initialization before use:
```typescript
if (!engine.isRunning()) {
  await engine.initialize();
}
```

### Audio cuts out after a few seconds

**Cause**: Garbage collection of AudioNodes.

**Fix**: Store references to active nodes:
```typescript
// AudioEngine stores oscillator references internally
// Don't let them go out of scope
```

### Crackling or distortion

**Cause**: Buffer underrun or too many concurrent nodes.

**Fix**: Reduce concurrent sessions, increase buffer size:
```typescript
const context = new AudioContext({
  latencyHint: 'balanced' // or 'playback' for higher latency
});
```

---

## Browser-Specific Optimizations

### Chrome

```typescript
// Enable low-latency mode (user must set flag manually)
const context = new AudioContext({
  latencyHint: 'interactive'
});
```

### Safari

```typescript
// Resume audio context on every interaction
// Safari is aggressive about suspending
document.addEventListener('click', () => {
  if (engine.getState() === 'suspended') {
    engine.resume();
  }
}, true);
```

### Firefox

```typescript
// Firefox may need larger buffers on some systems
const context = new AudioContext({
  latencyHint: 'playback' // Higher latency, more stable
});
```

---

## Summary

| Feature | Support | Notes |
|---------|---------|-------|
| Core Web Audio API | 97%+ | Excellent support |
| StereoPannerNode | 95%+ | Use polyfill for older Safari |
| AudioWorklet | 85%+ | Not used in this engine |
| Autoplay Policy | N/A | Requires user interaction |

**Recommendation**: Target the latest 2 versions of Chrome, Firefox, Safari, and Edge for best experience.
