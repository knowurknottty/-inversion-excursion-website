/**
 * SynSync Bridge - Resonance Calculator
 * Game mechanics for card effectiveness based on frequency matching
 */

import { EntrainmentConfig, ResonanceResult, CARD_FREQUENCY_MAP } from './SynSyncEngine';

export interface CardData {
  id: string;
  name: string;
  type: 'focus' | 'calm' | 'dream' | 'grounding' | 'attack' | 'defense';
  baseEffect: number;
  frequencyTag?: string;  // Override for specific card frequencies
}

// Resonance thresholds
const RESONANCE_THRESHOLDS = {
  PERFECT: 0.95,      // 95%+ match = perfect resonance (+50%)
  STRONG: 0.80,       // 80-95% = strong resonance (+30%)
  MATCH: 0.60,        // 60-80% = match (+10%)
  NEUTRAL: 0.40,      // 40-60% = neutral (0%)
  WEAK: 0.20,         // 20-40% = weak (-10%)
  DISSONANT: 0.00     // 0-20% = dissonant (-20%)
};

// Multiplier values
const RESONANCE_MULTIPLIERS = {
  PERFECT: 1.5,       // +50% bonus
  STRONG: 1.3,        // +30% bonus
  MATCH: 1.1,         // +10% bonus
  NEUTRAL: 1.0,       // No change
  WEAK: 0.9,          // -10% penalty
  DISSONANT: 0.8      // -20% penalty
};

/**
 * Calculate resonance between user's entrainment frequency and card frequency
 */
export function calculateResonance(
  userFrequency: number,
  cardId: string
): ResonanceResult {
  const cardFrequency = getCardFrequency(cardId);
  
  // Calculate match percentage (inverse of relative difference)
  const diff = Math.abs(userFrequency - cardFrequency);
  const maxFreq = Math.max(userFrequency, cardFrequency);
  const matchRatio = 1 - (diff / maxFreq);
  
  // Determine resonance tier and multiplier
  let multiplier = RESONANCE_MULTIPLIERS.NEUTRAL;
  let isResonant = false;
  let isDissonant = false;

  if (matchRatio >= RESONANCE_THRESHOLDS.PERFECT) {
    multiplier = RESONANCE_MULTIPLIERS.PERFECT;
    isResonant = true;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.STRONG) {
    multiplier = RESONANCE_MULTIPLIERS.STRONG;
    isResonant = true;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.MATCH) {
    multiplier = RESONANCE_MULTIPLIERS.MATCH;
    isResonant = true;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.NEUTRAL) {
    multiplier = RESONANCE_MULTIPLIERS.NEUTRAL;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.WEAK) {
    multiplier = RESONANCE_MULTIPLIERS.WEAK;
    isDissonant = true;
  } else {
    multiplier = RESONANCE_MULTIPLIERS.DISSONANT;
    isDissonant = true;
  }

  // Special case: Schumann resonance (7.83Hz) has wider tolerance
  // It's the Earth's frequency, naturally grounding regardless of card
  if (Math.abs(userFrequency - 7.83) < 0.5 && cardFrequency !== 7.83) {
    // Slight bonus for being grounded, but not full resonance
    if (multiplier < 1.0) {
      multiplier = 1.0;
      isDissonant = false;
    }
  }

  return {
    cardFrequency,
    userFrequency,
    resonance: matchRatio,
    multiplier,
    isResonant,
    isDissonant
  };
}

/**
 * Get the target frequency for a card
 */
export function getCardFrequency(cardId: string): number {
  // Direct lookup
  if (CARD_FREQUENCY_MAP[cardId]) {
    return CARD_FREQUENCY_MAP[cardId];
  }
  
  // Pattern matching for dynamic cards
  if (cardId.includes('focus') || cardId.includes('stim') || cardId.includes('energy')) {
    return CARD_FREQUENCY_MAP['focus_boost'];
  }
  if (cardId.includes('calm') || cardId.includes('heal') || cardId.includes('peace')) {
    return CARD_FREQUENCY_MAP['meditation'];
  }
  if (cardId.includes('dream') || cardId.includes('sleep') || cardId.includes('void')) {
    return CARD_FREQUENCY_MAP['dream_walk'];
  }
  if (cardId.includes('earth') || cardId.includes('ground') || cardId.includes('root')) {
    return CARD_FREQUENCY_MAP['earth_anchor'];
  }
  
  return CARD_FREQUENCY_MAP['default'];
}

/**
 * Get recommended frequency for a deck type
 */
export function getDeckFrequency(deckType: string): number {
  const deckFreqMap: Record<string, number> = {
    'gamma_rush': 40,      // Focus/aggression deck
    'alpha_flow': 10,      // Balanced/control deck
    'theta_dream': 6,      // Trickery/illusion deck
    'schumann_ground': 7.83, // Defense/stability deck
    'omni_harmonic': 10    // Default
  };
  
  return deckFreqMap[deckType] || 10;
}

/**
 * Calculate final card effect with resonance applied
 */
export function calculateCardEffect(
  card: CardData,
  userFrequency: number
): { baseEffect: number; finalEffect: number; resonance: ResonanceResult } {
  const resonance = calculateResonance(userFrequency, card.id);
  const finalEffect = card.baseEffect * resonance.multiplier;
  
  return {
    baseEffect: card.baseEffect,
    finalEffect,
    resonance
  };
}

/**
 * Get resonance tier label for UI display
 */
export function getResonanceLabel(multiplier: number): string {
  if (multiplier >= 1.5) return 'Perfect Resonance ✦✦✦';
  if (multiplier >= 1.3) return 'Strong Resonance ✦✦';
  if (multiplier >= 1.1) return 'Resonance ✦';
  if (multiplier >= 1.0) return 'Neutral';
  if (multiplier >= 0.9) return 'Weak';
  return 'Dissonant ⚠';
}

/**
 * Get resonance color for UI
 */
export function getResonanceColor(multiplier: number): string {
  if (multiplier >= 1.5) return '#00ff88'; // Bright green
  if (multiplier >= 1.3) return '#88ff00'; // Green-yellow
  if (multiplier >= 1.1) return '#ffff00'; // Yellow
  if (multiplier >= 1.0) return '#ffffff'; // White
  if (multiplier >= 0.9) return '#ffaa00'; // Orange
  return '#ff4444'; // Red
}

/**
 * Get frequency name for display
 */
export function getFrequencyName(frequency: number): string {
  if (Math.abs(frequency - 40) < 2) return 'Gamma (40Hz)';
  if (Math.abs(frequency - 10) < 1) return 'Alpha (10Hz)';
  if (frequency >= 4 && frequency <= 8) return `Theta (${frequency.toFixed(1)}Hz)`;
  if (Math.abs(frequency - 7.83) < 0.5) return 'Schumann (7.83Hz)';
  return `${frequency.toFixed(1)}Hz`;
}

/**
 * Suggest optimal frequency for current hand
 */
export function suggestOptimalFrequency(hand: CardData[]): { frequency: number; confidence: number; reason: string } {
  const frequencies = hand.map(card => getCardFrequency(card.id));
  const freqCounts: Record<number, number> = {};
  
  frequencies.forEach(f => {
    freqCounts[f] = (freqCounts[f] || 0) + 1;
  });
  
  // Find most common frequency in hand
  let bestFreq = 10;
  let bestCount = 0;
  
  Object.entries(freqCounts).forEach(([freq, count]) => {
    if (count > bestCount) {
      bestCount = count;
      bestFreq = parseFloat(freq);
    }
  });
  
  const confidence = bestCount / hand.length;
  
  const reasons: Record<number, string> = {
    40: 'Your hand wants focus and speed. Sync to Gamma.',
    10: 'Your hand rewards calm control. Sync to Alpha.',
    6: 'Your hand plays the dream realm. Sync to Theta.',
    7.83: 'Your hand values grounding. Sync to Earth pulse.'
  };
  
  return {
    frequency: bestFreq,
    confidence,
    reason: reasons[bestFreq] || 'Sync to match your hand.'
  };
}
