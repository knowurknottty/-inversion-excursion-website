/**
 * SynSync Audio Engine
 * Web Audio API-based frequency generation for brainwave entrainment
 * 
 * Architecture: Modular design with clean separation of concerns
 * - AudioEngine: Core audio context management
 * - BinauralGenerator: Dual oscillator binaural beat synthesis
 * - IsochronicGenerator: Pulsed tone generation
 * - EnvelopeManager: ADSR-style volume control
 * - PanningManager: Spatial audio positioning
 * 
 * @author SynSync Team
 * @version 1.0.0
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type FrequencyBand = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'schumann';
export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface FrequencyPreset {
  name: string;
  frequency: number;      // Target frequency in Hz
  description: string;
  benefits: string[];
  recommendedDuration: number; // in minutes
}

export interface BinauralConfig {
  baseFrequency: number;   // Carrier frequency (left ear)
  beatFrequency: number;   // Difference frequency (beat rate)
  waveform?: Waveform;
}

export interface IsochronicConfig {
  frequency: number;       // Pulse frequency
  toneFrequency: number;   // Carrier tone frequency
  dutyCycle?: number;      // Pulse width (0.0 - 1.0, default 0.5)
  waveform?: Waveform;
}

export interface EnvelopeConfig {
  attackTime: number;      // Fade-in duration in seconds
  sustainLevel: number;    // Volume level during sustain (0.0 - 1.0)
  releaseTime: number;     // Fade-out duration in seconds
}

export interface AudioSession {
  id: string;
  type: 'binaural' | 'isochronic';
  startTime: number;
  gainNode: GainNode;
  oscillators: OscillatorNode[];
  isActive: boolean;
}

// ============================================================================
// FREQUENCY PRESETS (Scientifically-backed brainwave ranges)
// ============================================================================

export const FREQUENCY_PRESETS: Record<FrequencyBand, FrequencyPreset> = {
  delta: {
    name: 'Delta',
    frequency: 2.5,  // Sweet spot in 2-4 Hz range
    description: 'Deep sleep, healing, regeneration',
    benefits: [
      'Deep restorative sleep',
      'Physical healing acceleration',
      'Access to unconscious mind',
      'Human growth hormone release'
    ],
    recommendedDuration: 20
  },
  theta: {
    name: 'Theta',
    frequency: 6,    // Middle of 4-8 Hz range
    description: 'Meditation, creativity, REM sleep',
    benefits: [
      'Deep meditation states',
      'Enhanced creativity',
      'Vivid visualization',
      'Emotional processing',
      'Memory consolidation'
    ],
    recommendedDuration: 15
  },
  alpha: {
    name: 'Alpha',
    frequency: 10,   // Classic alpha frequency
    description: 'Relaxed focus, flow state, stress relief',
    benefits: [
      'Relaxed alertness',
      'Stress reduction',
      'Enhanced learning',
      'Mind-body coordination',
      'Serotonin production'
    ],
    recommendedDuration: 10
  },
  beta: {
    name: 'Beta',
    frequency: 20,   // Middle of 14-30 Hz range
    description: 'Active focus, cognitive performance',
    benefits: [
      'Focused attention',
      'Analytical thinking',
      'Problem solving',
      'Mental alertness',
      'Motivation boost'
    ],
    recommendedDuration: 10
  },
  gamma: {
    name: 'Gamma',
    frequency: 40,   // Sweet spot for gamma entrainment
    description: 'Peak cognition, insight, high-level processing',
    benefits: [
      'Peak mental performance',
      'Enhanced perception',
      'Insight and epiphany',
      'Information processing',
      'Higher consciousness states'
    ],
    recommendedDuration: 5
  },
  schumann: {
    name: 'Schumann Resonance',
    frequency: 7.83, // Earth's fundamental frequency
    description: 'Earth resonance, grounding, natural harmony',
    benefits: [
      'Grounding and centering',
      'Connection to nature',
      'Stress reduction',
      'Improved sleep quality',
      'EMF protection support'
    ],
    recommendedDuration: 15
  }
};

// ============================================================================
// AUDIO ENGINE CORE
// ============================================================================

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private sessions: Map<string, AudioSession> = new Map();
  private isInitialized = false;

  // Default envelope: gentle fade to prevent audio shock
  private defaultEnvelope: EnvelopeConfig = {
    attackTime: 2.0,
    sustainLevel: 0.5,
    releaseTime: 3.0
  };

  // Default carrier frequency for binaural beats
  // Sweet spot: audible but not harsh, works across all brainwave ranges
  private defaultCarrierFrequency = 200;

  /**
   * Initialize the audio engine
   * Must be called after user interaction (browser autoplay policy)
   */
  async initialize(): Promise<boolean> {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }

      this.context = new AudioContextClass();

      // Create master gain for overall volume control
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 1.0;

      // Add compressor for safety - prevents clipping and protects hearing
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Signal chain: compressor -> masterGain -> destination
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('AudioEngine initialization failed:', error);
      return false;
    }
  }

  /**
   * Resume audio context (needed after suspension)
   */
  async resume(): Promise<void> {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  /**
   * Suspend audio context (pause all audio)
   */
  async suspend(): Promise<void> {
    if (this.context && this.context.state === 'running') {
      await this.context.suspend();
    }
  }

  /**
   * Check if audio context is running
   */
  isRunning(): boolean {
    return this.context?.state === 'running';
  }

  /**
   * Get audio context state
   */
  getState(): AudioContextState | 'uninitialized' {
    return this.context?.state || 'uninitialized';
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    if (this.masterGain && this.context) {
      // Smooth transition to prevent clicks
      this.masterGain.gain.setTargetAtTime(
        Math.max(0, Math.min(1, volume)),
        this.context.currentTime,
        0.1
      );
    }
  }

  /**
   * Get current audio context time
   */
  getCurrentTime(): number {
    return this.context?.currentTime || 0;
  }

  // ============================================================================
  // BINAURAL BEAT GENERATION
  // ============================================================================

  /**
   * Start binaural beat generation
   * 
   * Binaural beats work by playing two slightly different frequencies
   * in each ear. The brain perceives the difference frequency as a beat.
   * Example: 200 Hz left + 210 Hz right = 10 Hz binaural beat (Alpha)
   */
  async startBinaural(
    preset: FrequencyBand | BinauralConfig,
    envelope: Partial<EnvelopeConfig> = {},
    sessionId?: string
  ): Promise<string> {
    if (!this.context) {
      throw new Error('AudioEngine not initialized');
    }

    await this.resume();

    const config: BinauralConfig = typeof preset === 'string' 
      ? this.getBinauralConfigFromPreset(preset)
      : preset;

    const env = { ...this.defaultEnvelope, ...envelope };
    const id = sessionId || this.generateSessionId();

    // Calculate frequencies
    const leftFreq = config.baseFrequency;
    const rightFreq = config.baseFrequency + config.beatFrequency;

    // Create oscillators
    const leftOsc = this.context.createOscillator();
    const rightOsc = this.context.createOscillator();

    leftOsc.type = config.waveform || 'sine';
    rightOsc.type = config.waveform || 'sine';

    leftOsc.frequency.value = leftFreq;
    rightOsc.frequency.value = rightFreq;

    // Create panner nodes for stereo separation
    const leftPanner = this.context.createStereoPanner();
    const rightPanner = this.context.createStereoPanner();
    leftPanner.pan.value = -1;  // Full left
    rightPanner.pan.value = 1;   // Full right

    // Create gain nodes for envelope control
    const leftGain = this.context.createGain();
    const rightGain = this.context.createGain();
    leftGain.gain.value = 0;
    rightGain.gain.value = 0;

    // Connect signal chain
    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(leftPanner);
    rightGain.connect(rightPanner);
    leftPanner.connect(this.compressor!);
    rightPanner.connect(this.compressor!);

    // Apply envelope (gentle fade in)
    const now = this.context.currentTime;
    const targetGain = env.sustainLevel;

    leftGain.gain.setTargetAtTime(targetGain, now, env.attackTime / 3);
    rightGain.gain.setTargetAtTime(targetGain, now, env.attackTime / 3);

    // Start oscillators
    leftOsc.start(now);
    rightOsc.start(now);

    // Create merged gain node for session control
    const sessionGain = this.context.createGain();
    sessionGain.gain.value = 1.0;
    
    // Re-route through session gain for unified control
    leftPanner.disconnect();
    rightPanner.disconnect();
    leftPanner.connect(sessionGain);
    rightPanner.connect(sessionGain);
    sessionGain.connect(this.compressor!);

    // Store session
    const session: AudioSession = {
      id,
      type: 'binaural',
      startTime: now,
      gainNode: sessionGain,
      oscillators: [leftOsc, rightOsc],
      isActive: true
    };

    this.sessions.set(id, session);

    return id;
  }

  /**
   * Get binaural config from preset
   */
  private getBinauralConfigFromPreset(preset: FrequencyBand): BinauralConfig {
    const freq = FREQUENCY_PRESETS[preset].frequency;
    return {
      baseFrequency: this.defaultCarrierFrequency,
      beatFrequency: freq,
      waveform: 'sine'
    };
  }

  // ============================================================================
  // ISOCHRONIC TONE GENERATION
  // ============================================================================

  /**
   * Start isochronic tone generation
   * 
   * Isochronic tones work by pulsing a single tone on and off at the target frequency.
   * Unlike binaural beats, they don't require headphones and are more effective
   * for some entrainment protocols.
   */
  async startIsochronic(
    preset: FrequencyBand | IsochronicConfig,
    envelope: Partial<EnvelopeConfig> = {},
    sessionId?: string
  ): Promise<string> {
    if (!this.context) {
      throw new Error('AudioEngine not initialized');
    }

    await this.resume();

    const config: IsochronicConfig = typeof preset === 'string'
      ? this.getIsochronicConfigFromPreset(preset)
      : preset;

    const env = { ...this.defaultEnvelope, ...envelope };
    const id = sessionId || this.generateSessionId();
    const now = this.context.currentTime;

    // Create main oscillator
    const oscillator = this.context.createOscillator();
    oscillator.type = config.waveform || 'sine';
    oscillator.frequency.value = config.toneFrequency;

    // Create amplitude modulation oscillator for pulsing effect
    const pulseOsc = this.context.createOscillator();
    pulseOsc.type = 'square';
    pulseOsc.frequency.value = config.frequency;

    // Use duty cycle to create pulse width (default 50%)
    const dutyCycle = config.dutyCycle ?? 0.5;
    
    // Create gain nodes
    const toneGain = this.context.createGain();
    const pulseGain = this.context.createGain();
    const sessionGain = this.context.createGain();

    // Start with zero volume
    toneGain.gain.value = 0;
    sessionGain.gain.value = 0;

    // Connect pulse oscillator to tone gain for AM effect
    // We'll use a custom waveshaper for duty cycle control
    const dutyShaper = this.createDutyCycleShaper(dutyCycle);
    pulseOsc.connect(dutyShaper);
    dutyShaper.connect(pulseGain);

    // Alternative: Use gain modulation directly
    oscillator.connect(toneGain);
    
    // Create a more sophisticated pulsing using gain automation
    // This gives us better control than simple AM
    this.scheduleIsochronicPulse(
      toneGain.gain,
      config.frequency,
      env.sustainLevel,
      dutyCycle,
      now
    );

    toneGain.connect(sessionGain);
    sessionGain.connect(this.compressor!);

    // Start oscillators
    oscillator.start(now);
    pulseOsc.start(now);

    // Apply envelope fade-in
    sessionGain.gain.setTargetAtTime(1.0, now, env.attackTime / 3);

    // Store session
    const session: AudioSession = {
      id,
      type: 'isochronic',
      startTime: now,
      gainNode: sessionGain,
      oscillators: [oscillator, pulseOsc],
      isActive: true
    };

    this.sessions.set(id, session);

    return id;
  }

  /**
   * Create waveshaper for duty cycle control
   */
  private createDutyCycleShaper(dutyCycle: number): WaveShaperNode {
    if (!this.context) throw new Error('AudioContext not available');

    const shaper = this.context.createWaveShaper();
    const samples = 1024;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const phase = i / samples;
      curve[i] = phase < dutyCycle ? 1 : 0;
    }

    shaper.curve = curve;
    return shaper;
  }

  /**
   * Schedule isochronic pulse pattern using gain automation
   */
  private scheduleIsochronicPulse(
    gainParam: AudioParam,
    frequency: number,
    amplitude: number,
    dutyCycle: number,
    startTime: number
  ): void {
    const period = 1 / frequency;
    const onTime = period * dutyCycle;
    const offTime = period * (1 - dutyCycle);

    // Schedule a repeating pulse pattern
    // Using exponential ramp for smoother transitions
    const iterations = 1000; // Schedule many iterations ahead
    let currentTime = startTime;

    for (let i = 0; i < iterations; i++) {
      // On phase
      gainParam.setTargetAtTime(amplitude, currentTime, 0.01);
      currentTime += onTime;

      // Off phase
      gainParam.setTargetAtTime(0.001, currentTime, 0.01);
      currentTime += offTime;
    }
  }

  /**
   * Get isochronic config from preset
   */
  private getIsochronicConfigFromPreset(preset: FrequencyBand): IsochronicConfig {
    const freq = FREQUENCY_PRESETS[preset].frequency;
    return {
      frequency: freq,
      toneFrequency: this.defaultCarrierFrequency,
      dutyCycle: 0.5,
      waveform: 'sine'
    };
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Stop a specific session with gentle fade-out
   */
  async stopSession(sessionId: string, fadeOutTime?: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.context) return;

    const releaseTime = fadeOutTime ?? this.defaultEnvelope.releaseTime;
    const now = this.context.currentTime;

    // Gentle fade out
    session.gainNode.gain.setTargetAtTime(0, now, releaseTime / 3);

    // Stop oscillators after fade completes
    setTimeout(() => {
      session.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Oscillator might already be stopped
        }
      });
      session.isActive = false;
    }, releaseTime * 1000 * 2);

    // Remove from active sessions after cleanup
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, releaseTime * 1000 * 2 + 100);
  }

  /**
   * Stop all active sessions
   */
  async stopAll(fadeOutTime?: number): Promise<void> {
    const stopPromises = Array.from(this.sessions.keys()).map(id =>
      this.stopSession(id, fadeOutTime)
    );
    await Promise.all(stopPromises);
  }

  /**
   * Get active session info
   */
  getActiveSessions(): Array<{ id: string; type: string; duration: number }> {
    const now = this.getCurrentTime();
    return Array.from(this.sessions.values())
      .filter(s => s.isActive)
      .map(s => ({
        id: s.id,
        type: s.type,
        duration: now - s.startTime
      }));
  }

  /**
   * Check if a session is active
   */
  isSessionActive(sessionId: string): boolean {
    return this.sessions.get(sessionId)?.isActive ?? false;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Dispose of audio engine and release resources
   */
  dispose(): void {
    this.stopAll(0.1);
    
    if (this.context && this.context.state !== 'closed') {
      this.context.close();
    }

    this.sessions.clear();
    this.isInitialized = false;
  }
}

// ============================================================================
// ENVELOPE MANAGER
// Advanced envelope control for smooth transitions
// ============================================================================

export class EnvelopeManager {
  constructor(private context: AudioContext) {}

  /**
   * Apply ADSR envelope to gain node
   */
  applyADSR(
    gainNode: GainNode,
    adsr: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    },
    peakLevel = 1.0
  ): void {
    const now = this.context.currentTime;
    const { attack, decay, sustain, release } = adsr;

    // Attack phase
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakLevel, now + attack);

    // Decay to sustain
    gainNode.gain.exponentialRampToValueAtTime(
      peakLevel * sustain,
      now + attack + decay
    );

    // Note: Sustain continues until release is called
  }

  /**
   * Release envelope (call when stopping)
   */
  release(gainNode: GainNode, releaseTime: number): void {
    const now = this.context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
  }
}

// ============================================================================
// PANNING MANAGER
// Spatial audio positioning for enhanced binaural effect
// ============================================================================

export class PanningManager {
  constructor(private context: AudioContext) {}

  /**
   * Create stereo panners for binaural setup
   */
  createBinauralPanners(): { left: StereoPannerNode; right: StereoPannerNode } {
    const left = this.context.createStereoPanner();
    const right = this.context.createStereoPanner();

    left.pan.value = -1;
    right.pan.value = 1;

    return { left, right };
  }

  /**
   * Create rotating panner effect (for advanced protocols)
   */
  createRotatingPanner(
    frequency: number,
    depth = 1.0
  ): { panner: StereoPannerNode; lfo: OscillatorNode } {
    const panner = this.context.createStereoPanner();
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();

    lfo.frequency.value = frequency;
    lfoGain.gain.value = depth;

    lfo.connect(lfoGain);
    lfoGain.connect(panner.pan);

    return { panner, lfo };
  }
}

// ============================================================================
// PERFORMANCE MONITOR
// Real-time audio performance metrics
// ============================================================================

export class AudioPerformanceMonitor {
  private context: AudioContext;
  private callbacks: Array<(metrics: AudioMetrics) => void> = [];
  private intervalId: number | null = null;

  constructor(context: AudioContext) {
    this.context = context;
  }

  startMonitoring(intervalMs = 1000): void {
    this.stopMonitoring();
    this.intervalId = window.setInterval(() => {
      const metrics = this.getMetrics();
      this.callbacks.forEach(cb => cb(metrics));
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onMetrics(callback: (metrics: AudioMetrics) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  }

  private getMetrics(): AudioMetrics {
    const baseLatency = this.context.baseLatency || 0;
    const outputLatency = (this.context as any).outputLatency || 0;

    return {
      sampleRate: this.context.sampleRate,
      baseLatency,
      outputLatency,
      totalLatency: baseLatency + outputLatency,
      state: this.context.state,
      currentTime: this.context.currentTime
    };
  }
}

export interface AudioMetrics {
  sampleRate: number;
  baseLatency: number;
  outputLatency: number;
  totalLatency: number;
  state: AudioContextState;
  currentTime: number;
}

// ============================================================================
// EXPORT FACTORY
// ============================================================================

/**
 * Create and initialize audio engine
 * Convenience function for quick setup
 */
export async function createAudioEngine(): Promise<AudioEngine> {
  const engine = new AudioEngine();
  const success = await engine.initialize();
  
  if (!success) {
    throw new Error('Failed to initialize AudioEngine');
  }
  
  return engine;
}

// Default export
export default AudioEngine;
