/**
 * Resonance State Manager
 * Manages entrainment state and card resonance calculations for The Inversion Excursion
 */

import { EventEmitter } from 'events';

// Frequency resonance types
export enum FrequencyResonance {
  ALPHA = 'alpha',
  THETA = 'theta',
  GAMMA = 'gamma',
  SCHUMANN = 'schumann',
  DELTA = 'delta',
  BETA = 'beta',
  SOLFEGGIO = 'solfeggio',
  MONROE = 'monroe'
}

// Protocol definitions
export const PROTOCOLS: Record<FrequencyResonance, {
  name: string;
  frequency: number;
  type: 'binaural' | 'isochronic';
  description: string;
  color: string;
}> = {
  [FrequencyResonance.ALPHA]: {
    name: 'Alpha Bridge',
    frequency: 10,
    type: 'binaural',
    description: 'Calm focus, relaxed alertness',
    color: '#6366f1'
  },
  [FrequencyResonance.THETA]: {
    name: 'Theta Dream',
    frequency: 6,
    type: 'isochronic',
    description: 'Deep meditation, creativity',
    color: '#8b5cf6'
  },
  [FrequencyResonance.GAMMA]: {
    name: 'Gamma Peak',
    frequency: 40,
    type: 'binaural',
    description: 'Peak cognition, memory',
    color: '#f59e0b'
  },
  [FrequencyResonance.SCHUMANN]: {
    name: 'Schumann Earth',
    frequency: 7.83,
    type: 'isochronic',
    description: 'Grounding, balance',
    color: '#10b981'
  },
  [FrequencyResonance.DELTA]: {
    name: 'Delta Deep',
    frequency: 2,
    type: 'binaural',
    description: 'Deep sleep, restoration',
    color: '#3b82f6'
  },
  [FrequencyResonance.BETA]: {
    name: 'Beta Boost',
    frequency: 20,
    type: 'isochronic',
    description: 'Active thought, energy',
    color: '#ef4444'
  },
  [FrequencyResonance.SOLFEGGIO]: {
    name: 'Solfeggio 528',
    frequency: 528,
    type: 'binaural',
    description: 'Transformation, DNA repair',
    color: '#ec4899'
  },
  [FrequencyResonance.MONROE]: {
    name: 'Monroe Focus',
    frequency: 4,
    type: 'isochronic',
    description: 'Out-of-body clarity',
    color: '#14b8a6'
  }
};

// Card resonance mapping
export interface CardResonance {
  primary: FrequencyResonance;
  secondary?: FrequencyResonance;
  dissonance?: FrequencyResonance[];
}

export const CARD_RESONANCE_MAP: Record<string, CardResonance> = {
  // Control archetype (Alpha)
  'time_warp': { primary: FrequencyResonance.ALPHA, secondary: FrequencyResonance.THETA },
  'gravity_anchor': { primary: FrequencyResonance.ALPHA, dissonance: [FrequencyResonance.GAMMA, FrequencyResonance.BETA] },
  'silence_field': { primary: FrequencyResonance.ALPHA },
  'temporal_shift': { primary: FrequencyResonance.ALPHA, secondary: FrequencyResonance.SCHUMANN },
  
  // Healing archetype (Theta)
  'dream_weave': { primary: FrequencyResonance.THETA, secondary: FrequencyResonance.DELTA },
  'mind_mend': { primary: FrequencyResonance.THETA },
  'astral_projection': { primary: FrequencyResonance.THETA, secondary: FrequencyResonance.MONROE },
  'lucid_barrier': { primary: FrequencyResonance.THETA },
  
  // Damage archetype (Gamma)
  'neural_spike': { primary: FrequencyResonance.GAMMA, secondary: FrequencyResonance.BETA },
  'cascade_burst': { primary: FrequencyResonance.GAMMA },
  'cognition_blade': { primary: FrequencyResonance.GAMMA, dissonance: [FrequencyResonance.THETA, FrequencyResonance.DELTA] },
  'synaptic_overload': { primary: FrequencyResonance.GAMMA },
  
  // Defense archetype (Schumann)
  'earth_shell': { primary: FrequencyResonance.SCHUMANN },
  'grounding_pulse': { primary: FrequencyResonance.SCHUMANN, secondary: FrequencyResonance.ALPHA },
  'resonance_shield': { primary: FrequencyResonance.SCHUMANN },
  'geomagnetic Ward': { primary: FrequencyResonance.SCHUMANN, secondary: FrequencyResonance.DELTA },
  
  // Recovery archetype (Delta)
  'deep_reset': { primary: FrequencyResonance.DELTA },
  'subconscious_restore': { primary: FrequencyResonance.DELTA, secondary: FrequencyResonance.THETA },
  'hibernate': { primary: FrequencyResonance.DELTA },
  
  // Speed archetype (Beta)
  'rapid_fire': { primary: FrequencyResonance.BETA, dissonance: [FrequencyResonance.DELTA, FrequencyResonance.THETA] },
  'neural_accelerator': { primary: FrequencyResonance.BETA, secondary: FrequencyResonance.GAMMA },
  'adrenal_rush': { primary: FrequencyResonance.BETA },
  
  // Transformation archetype (Solfeggio)
  'frequency_shift': { primary: FrequencyResonance.SOLFEGGIO },
  'morphic_resonance': { primary: FrequencyResonance.SOLFEGGIO, secondary: FrequencyResonance.SCHUMANN },
  'dna_rewrite': { primary: FrequencyResonance.SOLFEGGIO },
  
  // Precision archetype (Monroe)
  'third_eye': { primary: FrequencyResonance.MONROE, secondary: FrequencyResonance.GAMMA },
  'piercing_insight': { primary: FrequencyResonance.MONROE },
  'astral_sniper': { primary: FrequencyResonance.MONROE, secondary: FrequencyResonance.BETA }
};

// Entrainment state interface
export interface EntrainmentState {
  protocol: FrequencyResonance | null;
  entrainmentLevel: number; // 0.0 - 1.0
  verificationLevel: 'honor' | 'biofeedback' | 'proof' | 'prime';
  sessionTimestamp: number;
  sessionDuration: number;
  expiresAt: number;
}

// Effect modifiers interface
export interface EffectModifiers {
  damageMultiplier: number;
  healingMultiplier: number;
  durationMultiplier: number;
  costReduction: number;
  bonusEffects: string[];
  warnings: string[];
}

// Constants
const RESONANCE_BONUS = 0.50;
const SECONDARY_BONUS = 0.25;
const DISSONANCE_PENALTY = -0.20;
const HAND_DISHARMONY_THRESHOLD = 3;
const ENTRAINMENT_DECAY_PER_MINUTE = 0.05;
const MAX_ENTRAINMENT_AGE = 30 * 60 * 1000; // 30 minutes

export class ResonanceManager extends EventEmitter {
  private state: EntrainmentState | null = null;
  private decayInterval: NodeJS.Timeout | null = null;

  /**
   * Set entrainment from successful session
   */
  setEntrainment(
    protocol: FrequencyResonance,
    level: number,
    verificationLevel: EntrainmentState['verificationLevel'],
    duration: number
  ): void {
    const now = Date.now();
    
    this.state = {
      protocol,
      entrainmentLevel: Math.min(1, Math.max(0, level)),
      verificationLevel,
      sessionTimestamp: now,
      sessionDuration: duration,
      expiresAt: now + MAX_ENTRAINMENT_AGE
    };

    // Start decay tracking
    this.startDecayTracking();
    
    this.emit('entrainmentChanged', this.state);
  }

  /**
   * Get current effective entrainment level with decay
   */
  getCurrentEntrainment(): EntrainmentState | null {
    if (!this.state) return null;

    const age = Date.now() - this.state.sessionTimestamp;
    
    if (age > MAX_ENTRAINMENT_AGE) {
      this.clearEntrainment();
      return null;
    }

    const minutesPassed = age / (60 * 1000);
    const decay = minutesPassed * ENTRAINMENT_DECAY_PER_MINUTE;
    const currentLevel = Math.max(0, this.state.entrainmentLevel - decay);

    return {
      ...this.state,
      entrainmentLevel: currentLevel
    };
  }

  /**
   * Calculate effect modifiers for current hand
   */
  calculateModifiers(hand: Array<{ id: string }>): EffectModifiers {
    const modifiers: EffectModifiers = {
      damageMultiplier: 1.0,
      healingMultiplier: 1.0,
      durationMultiplier: 1.0,
      costReduction: 0,
      bonusEffects: [],
      warnings: []
    };

    const entrainment = this.getCurrentEntrainment();
    
    // Check for hand disharmony (always applies)
    this.applyHandDissonance(hand, modifiers);

    // No active entrainment = no bonuses
    if (!entrainment || entrainment.entrainmentLevel < 0.1) {
      return modifiers;
    }

    const currentFreq = entrainment.protocol;
    let totalBonus = 0;
    let dissonanceCount = 0;
    let resonanceCount = 0;

    hand.forEach(card => {
      const resonance = CARD_RESONANCE_MAP[card.id];
      if (!resonance) return;

      // Primary resonance match
      if (resonance.primary === currentFreq) {
        totalBonus += RESONANCE_BONUS * entrainment.entrainmentLevel;
        resonanceCount++;
        
        // Enhanced effects at high entrainment
        if (entrainment.entrainmentLevel > 0.85) {
          modifiers.bonusEffects.push(`${card.id}_enhanced`);
        }
        
        // Prime verification bonus
        if (entrainment.verificationLevel === 'prime' && entrainment.entrainmentLevel > 0.9) {
          modifiers.bonusEffects.push(`${card.id}_prime`);
          totalBonus += 0.1; // Extra 10% for prime
        }
      }
      // Secondary resonance match
      else if (resonance.secondary === currentFreq) {
        totalBonus += SECONDARY_BONUS * entrainment.entrainmentLevel;
        resonanceCount++;
      }
      // Dissonance check
      else if (resonance.dissonance?.includes(currentFreq)) {
        dissonanceCount++;
      }
    });

    // Apply bonuses
    const bonusMultiplier = 1 + totalBonus;
    modifiers.damageMultiplier *= bonusMultiplier;
    modifiers.healingMultiplier *= bonusMultiplier;
    modifiers.durationMultiplier *= bonusMultiplier;

    // Apply dissonance penalties
    if (dissonanceCount > 0) {
      const dissonanceMultiplier = 1 + (DISSONANCE_PENALTY * dissonanceCount);
      modifiers.damageMultiplier *= dissonanceMultiplier;
      modifiers.healingMultiplier *= dissonanceMultiplier;
      modifiers.warnings.push(`${dissonanceCount} cards in dissonance with current frequency`);
    }

    // Apply verification level display
    if (entrainment.verificationLevel === 'honor') {
      modifiers.warnings.push('Honor mode: Limited bonus (verified mode for full effect)');
    }

    return modifiers;
  }

  /**
   * Check hand disharmony (conflicting frequencies)
   */
  private applyHandDissonance(
    hand: Array<{ id: string }>,
    modifiers: EffectModifiers
  ): void {
    const frequencies = hand
      .map(c => CARD_RESONANCE_MAP[c.id]?.primary)
      .filter(Boolean);
    
    const uniqueFreqs = new Set(frequencies).size;
    
    if (uniqueFreqs >= HAND_DISHARMONY_THRESHOLD) {
      const disharmonyPenalty = 1 - (0.1 * (uniqueFreqs - 2));
      modifiers.damageMultiplier *= disharmonyPenalty;
      modifiers.healingMultiplier *= disharmonyPenalty;
      modifiers.warnings.push(`Hand disharmony: ${uniqueFreqs} different frequencies`);
    }

    // Check for opposite frequency pairs (major dissonance)
    const opposites: Array<[FrequencyResonance, FrequencyResonance]> = [
      [FrequencyResonance.GAMMA, FrequencyResonance.DELTA],
      [FrequencyResonance.BETA, FrequencyResonance.THETA],
      [FrequencyResonance.ALPHA, FrequencyResonance.BETA]
    ];

    for (const [freq1, freq2] of opposites) {
      const hasFreq1 = frequencies.includes(freq1);
      const hasFreq2 = frequencies.includes(freq2);
      
      if (hasFreq1 && hasFreq2) {
        modifiers.damageMultiplier *= 0.85;
        modifiers.healingMultiplier *= 0.85;
        modifiers.warnings.push(`Opposing frequencies: ${freq1} vs ${freq2}`);
      }
    }
  }

  /**
   * Get resonance preview for a protocol
   */
  getResonancePreview(protocol: FrequencyResonance, hand: Array<{ id: string }>): {
    primary: string[];
    secondary: string[];
    dissonant: string[];
    estimatedBonus: number;
  } {
    const primary: string[] = [];
    const secondary: string[] = [];
    const dissonant: string[] = [];

    hand.forEach(card => {
      const resonance = CARD_RESONANCE_MAP[card.id];
      if (!resonance) return;

      if (resonance.primary === protocol) {
        primary.push(card.id);
      } else if (resonance.secondary === protocol) {
        secondary.push(card.id);
      } else if (resonance.dissonance?.includes(protocol)) {
        dissonant.push(card.id);
      }
    });

    const estimatedBonus = (primary.length * RESONANCE_BONUS) + 
                          (secondary.length * SECONDARY_BONUS) -
                          (dissonant.length * Math.abs(DISSONANCE_PENALTY));

    return { primary, secondary, dissonant, estimatedBonus };
  }

  /**
   * Clear current entrainment
   */
  clearEntrainment(): void {
    this.state = null;
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
    this.emit('entrainmentExpired');
  }

  /**
   * Start tracking entrainment decay
   */
  private startDecayTracking(): void {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
    }

    this.decayInterval = setInterval(() => {
      const entrainment = this.getCurrentEntrainment();
      
      if (!entrainment) {
        this.emit('entrainmentExpired');
        return;
      }

      this.emit('entrainmentDecay', {
        level: entrainment.entrainmentLevel,
        expiresIn: entrainment.expiresAt - Date.now()
      });
    }, 60000); // Check every minute
  }

  /**
   * Serialize state for save/load
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /**
   * Restore state from serialization
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed && parsed.expiresAt > Date.now()) {
        this.state = parsed;
        this.startDecayTracking();
      }
    } catch {
      this.state = null;
    }
  }
}

// Singleton instance
export const resonanceManager = new ResonanceManager();
export default resonanceManager;
