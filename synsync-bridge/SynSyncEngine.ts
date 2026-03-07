/**
 * SynSync Bridge - Audio Entrainment Engine
 * Self-contained Web Audio API implementation for Farcaster mini apps
 * No external dependencies, zero CORS issues
 */

export type FrequencyPreset = 'alpha' | 'theta' | 'gamma' | 'schumann' | 'custom';
export type BeatType = 'binaural' | 'isochronic';

export interface EntrainmentConfig {
  preset: FrequencyPreset;
  carrierFrequency: number;  // Base frequency (Hz)
  beatFrequency: number;     // Target brainwave frequency (Hz)
  beatType: BeatType;
  duration: number;          // Seconds (default: 60)
  volume: number;            // 0.0 - 1.0
}

export interface ResonanceResult {
  cardFrequency: number;
  userFrequency: number;
  resonance: number;         // 0.0 - 1.5 (1.0 = neutral, 1.5 = max bonus, 0.8 = penalty)
  multiplier: number;        // Card effect multiplier
  isResonant: boolean;
  isDissonant: boolean;
}

export interface EntrainmentProof {
  sessionId: string;
  timestamp: number;
  duration: number;
  targetFrequency: number;
  actualFrequencies: number[];  // Sampled frequency data
  entropy: number;              // Randomness measure (anti-bot)
  signature: string;            // HMAC-like verification
}

// Frequency Presets (Neuroscience-backed)
export const FREQUENCY_PRESETS: Record<FrequencyPreset, { beat: number; carrier: number; name: string }> = {
  alpha: { beat: 10, carrier: 432, name: 'Alpha Flow' },      // 10Hz - Relaxed alertness
  theta: { beat: 6, carrier: 432, name: 'Theta Deep' },       // 4-8Hz - Deep meditation
  gamma: { beat: 40, carrier: 440, name: 'Gamma Peak' },      // 40Hz - Cognitive enhancement
  schumann: { beat: 7.83, carrier: 432, name: 'Earth Pulse' }, // 7.83Hz - Grounding
  custom: { beat: 0, carrier: 432, name: 'Custom' }
};

// Card-to-Frequency Mapping for Game Mechanics
export const CARD_FREQUENCY_MAP: Record<string, number> = {
  // Focus/Stim cards → Gamma
  'focus_boost': 40,
  'caffeine_rush': 40,
  'sprint_mode': 40,
  
  // Calm/Heal cards → Alpha
  'meditation': 10,
  'healing_light': 10,
  'peace_shield': 10,
  
  // Dream/Intuition cards → Theta
  'dream_walk': 6,
  'sixth_sense': 6,
  'astral_projection': 6,
  
  // Grounding/Balance cards → Schumann
  'earth_anchor': 7.83,
  'root_chakra': 7.83,
  'grounding_pulse': 7.83,
  
  // Default for unmatched cards
  'default': 10
};

class SynSyncEngine {
  private audioContext: AudioContext | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerLeft: StereoPannerNode | null = null;
  private pannerRight: StereoPannerNode | null = null;
  private isochronicOsc: OscillatorNode | null = null;
  private isochronicGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  private isPlaying = false;
  private sessionStartTime = 0;
  private frequencySamples: number[] = [];
  private sessionId = '';
  
  // Audio fingerprint for proof generation
  private audioFingerprint = {
    sampleRate: 0,
    maxChannelCount: 0,
    baseLatency: 0
  };

  constructor() {
    this.generateSessionId();
  }

  private generateSessionId(): void {
    this.sessionId = `synsync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize AudioContext (must be called after user interaction)
   */
  async initialize(): Promise<boolean> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }

      this.audioContext = new AudioContextClass();
      
      // Capture audio fingerprint for proof
      this.audioFingerprint = {
        sampleRate: this.audioContext.sampleRate,
        maxChannelCount: this.audioContext.destination.maxChannelCount || 2,
        baseLatency: this.audioContext.baseLatency || 0
      };

      // Resume if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create analyser for frequency verification
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      return true;
    } catch (error) {
      console.error('SynSync initialization failed:', error);
      return false;
    }
  }

  /**
   * Start binaural beat entrainment
   */
  async startBinaural(config: EntrainmentConfig): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (!this.audioContext) throw new Error('AudioContext not available');

    this.stop(); // Clear any existing session
    this.isPlaying = true;
    this.sessionStartTime = Date.now();
    this.frequencySamples = [];

    const { carrierFrequency, beatFrequency, volume } = config;

    // Create stereo panner nodes for left/right separation
    this.pannerLeft = this.audioContext.createStereoPanner();
    this.pannerRight = this.audioContext.createStereoPanner();
    this.pannerLeft.pan.value = -1; // Full left
    this.pannerRight.pan.value = 1;  // Full right

    // Create master gain
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 2);

    // Left ear: carrier frequency
    this.leftOscillator = this.audioContext.createOscillator();
    this.leftOscillator.type = 'sine';
    this.leftOscillator.frequency.value = carrierFrequency;

    // Right ear: carrier + beat frequency
    this.rightOscillator = this.audioContext.createOscillator();
    this.rightOscillator.type = 'sine';
    this.rightOscillator.frequency.value = carrierFrequency + beatFrequency;

    // Connect left chain
    this.leftOscillator.connect(this.pannerLeft);
    this.pannerLeft.connect(this.gainNode);

    // Connect right chain
    this.rightOscillator.connect(this.pannerRight);
    this.pannerRight.connect(this.gainNode);

    // Connect to analyser and output
    this.gainNode.connect(this.analyser!);
    this.gainNode.connect(this.audioContext.destination);

    // Start oscillators
    this.leftOscillator.start();
    this.rightOscillator.start();

    // Start frequency sampling for proof
    this.startFrequencySampling();
  }

  /**
   * Start isochronic tone entrainment
   * Better for mono speakers, more pronounced beat
   */
  async startIsochronic(config: EntrainmentConfig): Promise<void> {
    if (!this.audioContext) {
      await this.initialize();
    }

    if (!this.audioContext) throw new Error('AudioContext not available');

    this.stop();
    this.isPlaying = true;
    this.sessionStartTime = Date.now();
    this.frequencySamples = [];

    const { carrierFrequency, beatFrequency, volume } = config;

    // Create carrier oscillator
    this.isochronicOsc = this.audioContext.createOscillator();
    this.isochronicOsc.type = 'sine';
    this.isochronicOsc.frequency.value = carrierFrequency;

    // Create amplitude modulation for beat frequency
    this.isochronicGain = this.audioContext.createGain();
    
    // Create LFO for amplitude modulation at beat frequency
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'square'; // Sharp on/off for stronger entrainment
    lfo.frequency.value = beatFrequency;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = volume * 0.5; // Modulation depth

    // Set up the amplitude modulation
    this.isochronicGain.gain.value = volume * 0.25; // Base level

    lfo.connect(lfoGain);
    lfoGain.connect(this.isochronicGain.gain);

    // Connect chain
    this.isochronicOsc.connect(this.isochronicGain);
    this.isochronicGain.connect(this.analyser!);
    this.isochronicGain.connect(this.audioContext.destination);

    // Start
    this.isochronicOsc.start();
    lfo.start();

    // Store LFO reference for cleanup
    (this.isochronicOsc as any).lfo = lfo;
    (this.isochronicOsc as any).lfoGain = lfoGain;

    this.startFrequencySampling();
  }

  /**
   * Sample actual output frequencies for proof generation
   */
  private startFrequencySampling(): void {
    const sampleInterval = setInterval(() => {
      if (!this.isPlaying || !this.analyser) {
        clearInterval(sampleInterval);
        return;
      }

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      // Find dominant frequency
      const dominantFreq = this.findDominantFrequency(dataArray);
      if (dominantFreq > 0) {
        this.frequencySamples.push(dominantFreq);
      }
    }, 1000); // Sample every second
  }

  /**
   * Find dominant frequency from FFT data
   */
  private findDominantFrequency(dataArray: Uint8Array): number {
    if (!this.audioContext) return 0;

    let maxVal = 0;
    let maxIndex = 0;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i];
        maxIndex = i;
      }
    }

    // Convert bin index to frequency
    const nyquist = this.audioContext.sampleRate / 2;
    return (maxIndex / dataArray.length) * nyquist;
  }

  /**
   * Stop entrainment session
   */
  stop(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Fade out
    if (this.gainNode) {
      this.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
    }
    if (this.isochronicGain) {
      this.isochronicGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }

    // Stop oscillators after fade
    setTimeout(() => {
      this.leftOscillator?.stop();
      this.rightOscillator?.stop();
      this.isochronicOsc?.stop();
      (this.isochronicOsc as any)?.lfo?.stop();

      this.leftOscillator?.disconnect();
      this.rightOscillator?.disconnect();
      this.isochronicOsc?.disconnect();

      this.leftOscillator = null;
      this.rightOscillator = null;
      this.isochronicOsc = null;
    }, 600);

    this.isPlaying = false;
  }

  /**
   * Get current progress (0.0 - 1.0)
   */
  getProgress(duration: number): number {
    if (!this.isPlaying) return 0;
    const elapsed = (Date.now() - this.sessionStartTime) / 1000;
    return Math.min(elapsed / duration, 1);
  }

  /**
   * Generate proof of entrainment
   * Cryptographically-inspired verification data
   */
  generateProof(config: EntrainmentConfig): EntrainmentProof {
    const duration = (Date.now() - this.sessionStartTime) / 1000;
    
    // Calculate entropy from frequency samples (anti-bot measure)
    const entropy = this.calculateEntropy(this.frequencySamples);
    
    // Generate signature from session data
    const signature = this.generateSignature({
      sessionId: this.sessionId,
      timestamp: this.sessionStartTime,
      targetFreq: config.beatFrequency,
      samples: this.frequencySamples,
      fingerprint: this.audioFingerprint
    });

    return {
      sessionId: this.sessionId,
      timestamp: this.sessionStartTime,
      duration,
      targetFrequency: config.beatFrequency,
      actualFrequencies: this.frequencySamples.slice(-10), // Last 10 samples
      entropy,
      signature
    };
  }

  /**
   * Calculate Shannon entropy of frequency distribution
   * Low entropy = suspiciously regular (likely bot)
   */
  private calculateEntropy(samples: number[]): number {
    if (samples.length < 2) return 0;

    // Create frequency distribution
    const buckets: Record<number, number> = {};
    samples.forEach(s => {
      const bucket = Math.round(s);
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });

    // Calculate entropy
    let entropy = 0;
    const total = samples.length;
    Object.values(buckets).forEach(count => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });

    return entropy;
  }

  /**
   * Generate verification signature
   * Not true crypto (client-side), but makes spoofing harder
   */
  private generateSignature(data: any): string {
    const payload = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Combine with audio fingerprint
    const fp = this.audioFingerprint;
    const fingerprint = `${fp.sampleRate}:${fp.maxChannelCount}:${fp.baseLatency}`;
    
    return `v1_${Math.abs(hash).toString(16)}_${btoa(fingerprint).slice(0, 16)}`;
  }

  /**
   * Check if entrainment is currently active
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get audio context state
   */
  getState(): string {
    return this.audioContext?.state || 'closed';
  }
}

// Singleton instance
let engineInstance: SynSyncEngine | null = null;

export function getSynSyncEngine(): SynSyncEngine {
  if (!engineInstance) {
    engineInstance = new SynSyncEngine();
  }
  return engineInstance;
}

export { SynSyncEngine };
export default SynSyncEngine;
