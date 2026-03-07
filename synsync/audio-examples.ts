/**
 * SynSync Audio Engine - Usage Examples
 * 
 * This file demonstrates common usage patterns for the SynSync Audio Engine.
 * Copy these examples into your application as needed.
 */

import {
  AudioEngine,
  createAudioEngine,
  FREQUENCY_PRESETS,
  type FrequencyBand,
  type BinauralConfig,
  type IsochronicConfig,
  type EnvelopeConfig
} from './audio-engine';

import {
  DETAILED_PRESETS,
  PROTOCOL_PRESETS,
  getPreset,
  getProtocol,
  getRecommendedWaveform,
  getCarrierRecommendation
} from './frequency-presets';

// ============================================================================
// BASIC USAGE
// ============================================================================

/**
 * Example 1: Quick Start - Binaural Beats
 */
export async function example1_BinauralQuickStart(): Promise<void> {
  // Create and initialize engine
  const engine = await createAudioEngine();

  // Start alpha waves (10 Hz) for relaxed focus
  const sessionId = await engine.startBinaural('alpha');

  console.log('Alpha binaural beats playing. Session ID:', sessionId);

  // Stop after 10 minutes
  setTimeout(() => {
    engine.stopSession(sessionId);
    console.log('Session stopped');
  }, 10 * 60 * 1000);
}

/**
 * Example 2: Quick Start - Isochronic Tones
 */
export async function example2_IsochronicQuickStart(): Promise<void> {
  const engine = await createAudioEngine();

  // Start theta waves (6 Hz) for meditation
  // No headphones required!
  const sessionId = await engine.startIsochronic('theta');

  console.log('Theta isochronic tones playing. Session ID:', sessionId);

  // Stop after 15 minutes
  setTimeout(() => {
    engine.stopSession(sessionId);
    engine.dispose();
  }, 15 * 60 * 1000);
}

// ============================================================================
// ADVANCED CONFIGURATION
// ============================================================================

/**
 * Example 3: Custom Binaural Configuration
 */
export async function example3_CustomBinaural(): Promise<void> {
  const engine = await createAudioEngine();

  // Custom binaural configuration
  const customConfig: BinauralConfig = {
    baseFrequency: 250,      // Higher carrier for sharper perception
    beatFrequency: 7.83,     // Schumann resonance
    waveform: 'sine'
  };

  // Custom envelope for faster fade-in
  const envelope: Partial<EnvelopeConfig> = {
    attackTime: 0.5,         // Quick fade in
    sustainLevel: 0.7,       // Louder volume
    releaseTime: 5.0         // Long fade out
  };

  const sessionId = await engine.startBinaural(customConfig, envelope);

  // Monitor session
  setInterval(() => {
    const sessions = engine.getActiveSessions();
    console.log('Active sessions:', sessions);
  }, 5000);

  // Stop after 20 minutes
  setTimeout(() => {
    engine.stopSession(sessionId, 5.0); // 5 second fade out
  }, 20 * 60 * 1000);
}

/**
 * Example 4: Custom Isochronic with Duty Cycle
 */
export async function example4_CustomIsochronic(): Promise<void> {
  const engine = await createAudioEngine();

  // Custom isochronic configuration
  const customConfig: IsochronicConfig = {
    frequency: 40,           // Gamma for cognition
    toneFrequency: 400,      // Higher carrier
    dutyCycle: 0.3,          // 30% on, 70% off (sharper pulses)
    waveform: 'sine'
  };

  const sessionId = await engine.startIsochronic(customConfig);

  // Change master volume dynamically
  engine.setMasterVolume(0.6);

  // Stop after 5 minutes
  setTimeout(() => {
    engine.stopSession(sessionId);
    engine.dispose();
  }, 5 * 60 * 1000);
}

// ============================================================================
// PROTOCOL SEQUENCES
// ============================================================================

/**
 * Example 5: Sleep Protocol Sequence
 * Progresses from Alpha → Theta → Delta for sleep induction
 */
export async function example5_SleepProtocol(): Promise<void> {
  const engine = await createAudioEngine();

  console.log('Starting Sleep Protocol...');

  // Phase 1: Alpha (5 minutes) - Relax
  console.log('Phase 1: Alpha - Relaxation');
  const alphaSession = await engine.startBinaural('alpha');

  await wait(5 * 60 * 1000);

  // Phase 2: Transition to Theta (5 minutes) - Drowsy
  console.log('Phase 2: Theta - Drowsiness');
  await engine.stopSession(alphaSession, 10); // 10s crossfade out
  const thetaSession = await engine.startBinaural('theta');

  await wait(5 * 60 * 1000);

  // Phase 3: Delta (15 minutes) - Deep sleep
  console.log('Phase 3: Delta - Deep Sleep');
  await engine.stopSession(thetaSession, 15);
  const deltaSession = await engine.startBinaural('delta');

  await wait(15 * 60 * 1000);

  // Gradual fade out
  await engine.stopSession(deltaSession, 30);
  engine.dispose();

  console.log('Sleep protocol complete');
}

/**
 * Example 6: Focus Sprint Protocol
 */
export async function example6_FocusSprint(): Promise<void> {
  const engine = await createAudioEngine();

  console.log('Starting Focus Sprint...');

  // Beta waves for 25 minutes (Pomodoro)
  const sessionId = await engine.startBinaural('beta', {
    attackTime: 1.0,
    sustainLevel: 0.5,
    releaseTime: 2.0
  });

  // Set timer for 25 minutes
  const timer = setTimeout(async () => {
    await engine.stopSession(sessionId);
    console.log('Focus sprint complete! Take a break.');
    engine.dispose();
  }, 25 * 60 * 1000);

  // Allow early stop
  (global as any).stopFocusSprint = () => {
    clearTimeout(timer);
    engine.stopSession(sessionId);
    engine.dispose();
  };
}

/**
 * Example 7: Using Predefined Protocols
 */
export async function example7_ProtocolPreset(): Promise<void> {
  const engine = await createAudioEngine();

  // Load "Creative Flow" protocol
  const protocol = getProtocol('Creative Flow')!;
  console.log(`Running protocol: ${protocol.name}`);
  console.log(`Description: ${protocol.description}`);
  console.log(`Total time: ${protocol.totalTime} minutes`);

  let currentSessionId: string | null = null;

  for (const step of protocol.sequence) {
    console.log(`Starting ${step.band} (${step.duration} min)...`);

    // Stop previous session with crossfade
    if (currentSessionId) {
      await engine.stopSession(currentSessionId, step.transitionTime);
    }

    // Start new session
    currentSessionId = await engine.startBinaural(step.band);

    // Wait for duration
    await wait(step.duration * 60 * 1000);
  }

  // Final cleanup
  if (currentSessionId) {
    await engine.stopSession(currentSessionId, 30);
  }

  engine.dispose();
}

// ============================================================================
// MULTI-SESSION MANAGEMENT
// ============================================================================

/**
 * Example 8: Multiple Concurrent Sessions
 * WARNING: Use with caution - can cause audio overload
 */
export async function example8_MultipleSessions(): Promise<void> {
  const engine = await createAudioEngine();

  // Layer two different frequencies
  // Left ear: Delta for healing
  // Right ear: Theta for creativity
  const deltaConfig: BinauralConfig = {
    baseFrequency: 150,
    beatFrequency: 2.5,
    waveform: 'sine'
  };

  const thetaConfig: BinauralConfig = {
    baseFrequency: 200,
    beatFrequency: 6.0,
    waveform: 'triangle'
  };

  const session1 = await engine.startBinaural(deltaConfig, {}, 'delta-layer');
  const session2 = await engine.startBinaural(thetaConfig, {}, 'theta-layer');

  // Reduce volume since we have two sessions
  engine.setMasterVolume(0.4);

  console.log('Active sessions:', engine.getActiveSessions());

  // Stop after 10 minutes
  await wait(10 * 60 * 1000);

  await engine.stopAll(3.0);
  engine.dispose();
}

/**
 * Example 9: Session Monitoring
 */
export async function example9_SessionMonitoring(): Promise<void> {
  const engine = await createAudioEngine();

  // Start session
  const sessionId = await engine.startBinaural('alpha');

  // Monitor loop
  const monitorInterval = setInterval(() => {
    const active = engine.getActiveSessions();
    const isActive = engine.isSessionActive(sessionId);

    console.clear();
    console.log('=== SynSync Session Monitor ===');
    console.log('Audio State:', engine.getState());
    console.log('Active Sessions:', active.length);
    console.log('Current Session Active:', isActive);

    active.forEach(session => {
      console.log(`  - ${session.id} (${session.type}): ${formatDuration(session.duration)}`);
    });
  }, 1000);

  // Stop after 5 minutes
  await wait(5 * 60 * 1000);

  clearInterval(monitorInterval);
  await engine.stopSession(sessionId);
  engine.dispose();
}

// ============================================================================
// VOICE COMMANDS / UI INTEGRATION
// ============================================================================

/**
 * Example 10: React Hook for Audio Control
 */
export function useSynSyncAudio() {
  // Note: This is example code - adapt to your React setup
  /*
  import { useState, useEffect, useCallback } from 'react';

  export function useSynSyncAudio() {
    const [engine, setEngine] = useState<AudioEngine | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSession, setCurrentSession] = useState<string | null>(null);
    const [volume, setVolumeState] = useState(0.5);

    useEffect(() => {
      let mounted = true;
      
      createAudioEngine().then(eng => {
        if (mounted) setEngine(eng);
      });

      return () => {
        mounted = false;
        eng?.dispose();
      };
    }, []);

    const playPreset = useCallback(async (preset: FrequencyBand) => {
      if (!engine) return;
      
      if (currentSession) {
        await engine.stopSession(currentSession);
      }

      const sessionId = await engine.startBinaural(preset);
      setCurrentSession(sessionId);
      setIsPlaying(true);
    }, [engine, currentSession]);

    const stop = useCallback(async () => {
      if (!engine || !currentSession) return;
      
      await engine.stopSession(currentSession);
      setCurrentSession(null);
      setIsPlaying(false);
    }, [engine, currentSession]);

    const setVolume = useCallback((vol: number) => {
      if (!engine) return;
      engine.setMasterVolume(vol);
      setVolumeState(vol);
    }, [engine]);

    return {
      isPlaying,
      volume,
      playPreset,
      stop,
      setVolume,
      engine
    };
  }
  */
}

/**
 * Example 11: Preset Button Component
 */
export function presetButtonExample(): string {
  // Returns example HTML/JS for preset buttons
  return `
    <!-- SynSync Preset Buttons -->
    <div class="preset-grid">
      <button onclick="startPreset('delta')" data-preset="delta">
        🌙 Delta (Sleep)
      </button>
      <button onclick="startPreset('theta')" data-preset="theta">
        🧘 Theta (Meditate)
      </button>
      <button onclick="startPreset('alpha')" data-preset="alpha">
        🌊 Alpha (Focus)
      </button>
      <button onclick="startPreset('beta')" data-preset="beta">
        ⚡ Beta (Alert)
      </button>
      <button onclick="startPreset('gamma')" data-preset="gamma">
        🚀 Gamma (Peak)
      </button>
      <button onclick="startPreset('schumann')" data-preset="schumann">
        🌍 Schumann (Ground)
      </button>
    </div>
    <button onclick="stopAll()" class="stop-button">Stop</button>

    <script type="module">
      import { createAudioEngine } from './audio-engine.js';
      
      let engine = null;
      let currentSession = null;

      async function initEngine() {
        if (!engine) {
          engine = await createAudioEngine();
        }
      }

      window.startPreset = async (preset) => {
        await initEngine();
        
        if (currentSession) {
          await engine.stopSession(currentSession);
        }
        
        currentSession = await engine.startBinaural(preset);
        document.body.className = 'playing-' + preset;
      };

      window.stopAll = async () => {
        if (engine) {
          await engine.stopAll();
          currentSession = null;
          document.body.className = '';
        }
      };
    </script>
  `;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const examples = {
  example1_BinauralQuickStart,
  example2_IsochronicQuickStart,
  example3_CustomBinaural,
  example4_CustomIsochronic,
  example5_SleepProtocol,
  example6_FocusSprint,
  example7_ProtocolPreset,
  example8_MultipleSessions,
  example9_SessionMonitoring,
  presetButtonExample
};

export default examples;
