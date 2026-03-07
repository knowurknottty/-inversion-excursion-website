# SynSync Audio Engine - Performance Optimization Guide

## Overview

This document provides detailed performance optimization strategies for the SynSync Audio Engine. These recommendations ensure smooth audio generation across all supported devices.

---

## Performance Metrics

### Target Specifications

| Metric | Target | Notes |
|--------|--------|-------|
| Latency | < 50ms | User-perceivable threshold |
| CPU Usage | < 15% | On mid-range devices |
| Memory | < 50 MB | For audio components |
| Battery Impact | Minimal | Efficient oscillators |

### Measuring Performance

```typescript
import { AudioPerformanceMonitor } from './audio-engine';

const engine = await createAudioEngine();
const monitor = new AudioPerformanceMonitor(engine.context!);

monitor.onMetrics((metrics) => {
  console.log('Latency:', metrics.totalLatency * 1000, 'ms');
  console.log('Sample Rate:', metrics.sampleRate);
  console.log('State:', metrics.state);
});

monitor.startMonitoring(1000); // Update every second
```

---

## Optimization Strategies

### 1. AudioContext Configuration

```typescript
// ✅ Optimal configuration
const context = new AudioContext({
  latencyHint: 'balanced',     // Balance latency vs. power
  sampleRate: 48000            // Match device native rate
});

// For low-latency (desktop mostly)
const lowLatencyContext = new AudioContext({
  latencyHint: 'interactive'   // Lowest latency possible
});

// For battery conservation
const powerSaveContext = new AudioContext({
  latencyHint: 'playback'      // Higher latency, less CPU
});
```

**Recommendation**: Use `'balanced'` as default. Switch to `'interactive'` only when needed.

### 2. Oscillator Optimization

#### Reuse vs. Create

```typescript
// ❌ Expensive: Creating oscillators frequently
function playTone() {
  const osc = engine.context!.createOscillator();
  // ... use and discard
}

// ✅ Better: Pool and reuse oscillators (if possible)
// Note: Web Audio API oscillators are one-use only
// Instead, minimize concurrent oscillators
```

#### Concurrent Oscillator Limits

| Device Type | Max Oscillators | Notes |
|-------------|-----------------|-------|
| High-end desktop | 200+ | Multiple binaural pairs possible |
| Mid-range laptop | 100 | Comfortable limit |
| Mobile | 20-30 | Monitor carefully |
| Low-end mobile | 10 | Minimal setup |

```typescript
// Monitor oscillator count
class OscillatorLimiter {
  private activeCount = 0;
  private maxOscillators = 50;

  canCreateOscillator(): boolean {
    return this.activeCount < this.maxOscillators;
  }

  trackOscillator(osc: OscillatorNode): void {
    this.activeCount++;
    
    // Listen for stop
    const originalStop = osc.stop.bind(osc);
    osc.stop = (...args) => {
      this.activeCount = Math.max(0, this.activeCount - 1);
      return originalStop(...args);
    };
  }
}
```

### 3. Gain Node Optimization

#### Efficient Volume Changes

```typescript
// ❌ Avoid: Rapid gain changes
gainNode.gain.value = newValue; // Immediate, may click

// ✅ Use: Smooth transitions
gainNode.gain.setTargetAtTime(
  targetValue,
  context.currentTime,
  timeConstant
);

// ❌ Avoid: Scheduling too far ahead
gainNode.gain.setValueAtTime(value, time + 1000); // 1000s ahead!

// ✅ Better: Schedule within reasonable window
gainNode.gain.setValueAtTime(value, time + 0.1); // 100ms ahead
```

#### Gain Scheduling Best Practices

```typescript
class GainScheduler {
  constructor(
    private gainNode: GainNode,
    private context: AudioContext
  ) {}

  fadeIn(duration: number, targetLevel = 1.0): void {
    const now = this.context.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.setTargetAtTime(
      targetLevel,
      now,
      duration / 3  // Time constant for 95% completion
    );
  }

  fadeOut(duration: number): void {
    const now = this.context.currentTime;
    this.gainNode.gain.setTargetAtTime(
      0.001,  // Never go to absolute 0
      now,
      duration / 3
    );
  }

  cancelScheduled(): void {
    const now = this.context.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(
      this.gainNode.gain.value,
      now
    );
  }
}
```

### 4. Memory Management

#### Cleaning Up Resources

```typescript
class ResourceManager {
  private nodes: AudioNode[] = [];
  private intervals: number[] = [];

  trackNode(node: AudioNode): AudioNode {
    this.nodes.push(node);
    return node;
  }

  trackInterval(id: number): void {
    this.intervals.push(id);
  }

  dispose(): void {
    // Stop all oscillators
    this.nodes.forEach(node => {
      try {
        if ('stop' in node) {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch (e) {
        // Already stopped/disconnected
      }
    });

    // Clear intervals
    this.intervals.forEach(id => clearInterval(id));

    // Clear arrays
    this.nodes = [];
    this.intervals = [];
  }
}
```

#### Preventing Memory Leaks

```typescript
// ❌ Memory leak: Event listeners not removed
oscillator.addEventListener('ended', handler);

// ✅ Proper cleanup
const handler = () => {
  oscillator.removeEventListener('ended', handler);
  // Cleanup
};
oscillator.addEventListener('ended', handler, { once: true });
```

### 5. Mobile Optimization

#### Battery-Friendly Oscillators

```typescript
class MobileOptimizer {
  private isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  getOptimizedCarrierFrequency(): number {
    // Lower frequencies use less CPU on mobile
    return this.isMobile ? 150 : 200;
  }

  getEnvelopeTimes(): { attack: number; release: number } {
    // Shorter fades on mobile to reduce processing
    return this.isMobile 
      ? { attack: 1.0, release: 2.0 }
      : { attack: 2.0, release: 3.0 };
  }

  getMaxConcurrentSessions(): number {
    return this.isMobile ? 2 : 4;
  }
}
```

#### Page Visibility Handling

```typescript
class VisibilityAwareAudio {
  private wasPlaying = false;

  constructor(private engine: AudioEngine) {
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page hidden - suspend audio to save battery
      this.wasPlaying = this.engine.getActiveSessions().length > 0;
      this.engine.suspend();
    } else {
      // Page visible - resume if was playing
      if (this.wasPlaying) {
        this.engine.resume();
      }
    }
  }
}
```

### 6. Audio Buffer Optimization

#### Pre-calculating Waveforms (Advanced)

For complex waveforms, consider pre-calculating:

```typescript
class OptimizedWaveform {
  private context: AudioContext;
  private periodicWave?: PeriodicWave;

  constructor(context: AudioContext) {
    this.context = context;
  }

  createCustomWaveform(harmonics: number[]): PeriodicWave {
    if (this.periodicWave) {
      return this.periodicWave;
    }

    const real = new Float32Array(harmonics.length + 1);
    const imag = new Float32Array(harmonics.length + 1);

    harmonics.forEach((amp, i) => {
      real[i + 1] = amp;
    });

    this.periodicWave = this.context.createPeriodicWave(real, imag);
    return this.periodicWave;
  }

  applyToOscillator(osc: OscillatorNode): void {
    const wave = this.createCustomWaveform([0, 1, 0.5, 0.25]);
    osc.setPeriodicWave(wave);
  }
}
```

---

## Profiling Tools

### Chrome DevTools

```typescript
// Enable audio debugging in Chrome
debugger; // Set breakpoint here

// Profile audio graph
console.profile('Audio Graph');
// ... audio operations
console.profileEnd('Audio Graph');
```

### Performance Observer

```typescript
// Monitor long tasks that might affect audio
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn('Long task detected:', entry.duration, 'ms');
      console.warn('This may cause audio glitches');
    }
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

### Custom Profiler

```typescript
class AudioProfiler {
  private startTime: number = 0;
  private measurements: number[] = [];

  start(): void {
    this.startTime = performance.now();
  }

  mark(label: string): void {
    const elapsed = performance.now() - this.startTime;
    this.measurements.push(elapsed);
    console.log(`[${label}] ${elapsed.toFixed(2)}ms`);
  }

  report(): void {
    const avg = this.measurements.reduce((a, b) => a + b, 0) 
                / this.measurements.length;
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Max: ${Math.max(...this.measurements).toFixed(2)}ms`);
  }
}
```

---

## Benchmarking

### Oscillator Performance Test

```typescript
async function benchmarkOscillators(): Promise<void> {
  const context = new AudioContext();
  const results: number[] = [];

  for (let count = 10; count <= 200; count += 10) {
    const oscillators: OscillatorNode[] = [];
    const start = performance.now();

    for (let i = 0; i < count; i++) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      gain.gain.value = 0.01; // Quiet
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      oscillators.push(osc);
    }

    // Let audio engine stabilize
    await new Promise(r => setTimeout(r, 100));

    const end = performance.now();
    results.push(end - start);

    // Cleanup
    oscillators.forEach(o => o.stop());
    
    console.log(`${count} oscillators: ${(end - start).toFixed(2)}ms`);
  }

  await context.close();
}
```

### Memory Usage Test

```typescript
function measureMemory(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    });
  }
}
```

---

## Best Practices Checklist

### Initialization
- [ ] Initialize after user gesture
- [ ] Use appropriate `latencyHint`
- [ ] Match `sampleRate` to device
- [ ] Handle initialization errors gracefully

### Runtime
- [ ] Limit concurrent oscillators
- [ ] Use smooth gain transitions
- [ ] Cancel unnecessary scheduled events
- [ ] Monitor active session count

### Cleanup
- [ ] Stop oscillators before disconnecting
- [ ] Disconnect nodes in reverse order
- [ ] Clear all intervals/timeouts
- [ ] Close AudioContext when done

### Mobile
- [ ] Suspend on page hide
- [ ] Resume on page show
- [ ] Use lower carrier frequencies
- [ ] Reduce envelope times

---

## Performance Targets Summary

| Scenario | Oscillators | CPU | Memory | Latency |
|----------|-------------|-----|--------|---------|
| Single Binaural | 2 | < 1% | < 5 MB | < 20ms |
| Multiple Binaural | 4-8 | < 5% | < 10 MB | < 30ms |
| With Isochronic | 6-10 | < 10% | < 15 MB | < 40ms |
| Mobile Single | 2 | < 3% | < 5 MB | < 50ms |
| Mobile Multiple | 4 | < 8% | < 10 MB | < 60ms |

---

## Further Reading

- [Web Audio API Spec](https://webaudio.github.io/web-audio-api/)
- [Google Web Audio Best Practices](https://developers.google.com/web/fundamentals/media/audio-and-video)
- [Firefox Audio Performance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
