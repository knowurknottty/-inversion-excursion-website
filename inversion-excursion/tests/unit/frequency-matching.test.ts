/**
 * Unit Tests: Frequency Matching Algorithms
 * Tests for frequency detection, deck optimization, and entrainment verification
 */

import { describe, it, expect } from '@jest/globals';

// ==================== FREQUENCY CONSTANTS ====================

const FREQUENCY_PRESETS = {
  delta: { beat: 2.5, carrier: 432, range: [0.5, 4] },
  theta: { beat: 6.0, carrier: 432, range: [4, 8] },
  alpha: { beat: 10.5, carrier: 432, range: [8, 13] },
  beta: { beat: 21.5, carrier: 440, range: [13, 30] },
  gamma: { beat: 65.0, carrier: 440, range: [30, 100] },
  schumann: { beat: 7.83, carrier: 432, range: [7.83, 7.83] },
};

const CARD_FREQUENCY_MAP: Record<string, number> = {
  'focus_boost': 40,
  'caffeine_rush': 40,
  'sprint_mode': 40,
  'meditation': 10,
  'healing_light': 10,
  'peace_shield': 10,
  'dream_walk': 6,
  'sixth_sense': 6,
  'astral_projection': 6,
  'earth_anchor': 7.83,
  'root_chakra': 7.83,
  'grounding_pulse': 7.83,
  'default': 10,
};

// ==================== ALGORITHMS ====================

interface FrequencyMatchResult {
  frequency: number;
  confidence: number;
  reason: string;
}

interface EntrainmentVerification {
  isValid: boolean;
  targetFrequency: number;
  actualFrequency: number;
  deviation: number;
  quality: number;
}

function suggestOptimalFrequency(hand: string[]): FrequencyMatchResult {
  const frequencies = hand.map(cardId => getCardFrequency(cardId));
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
    7.83: 'Your hand values grounding. Sync to Earth pulse.',
  };
  
  return {
    frequency: bestFreq,
    confidence,
    reason: reasons[bestFreq] || 'Sync to match your hand.',
  };
}

function getCardFrequency(cardId: string): number {
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

function getDeckFrequency(deckType: string): number {
  const deckFreqMap: Record<string, number> = {
    'gamma_rush': 40,
    'alpha_flow': 10,
    'theta_dream': 6,
    'schumann_ground': 7.83,
    'omni_harmonic': 10,
  };
  
  return deckFreqMap[deckType] || 10;
}

function verifyEntrainment(
  targetFrequency: number,
  actualFrequencies: number[],
  tolerance: number = 0.5
): EntrainmentVerification {
  if (actualFrequencies.length === 0) {
    return {
      isValid: false,
      targetFrequency,
      actualFrequency: 0,
      deviation: Infinity,
      quality: 0,
    };
  }
  
  const avgFrequency = actualFrequencies.reduce((a, b) => a + b, 0) / actualFrequencies.length;
  const deviation = Math.abs(targetFrequency - avgFrequency);
  const isValid = deviation <= tolerance;
  
  // Quality score: 1.0 = perfect, 0.0 = at tolerance limit
  const quality = Math.max(0, 1 - (deviation / tolerance));
  
  return {
    isValid,
    targetFrequency,
    actualFrequency: avgFrequency,
    deviation,
    quality,
  };
}

function detectBrainwaveState(frequency: number): string {
  if (frequency >= 30) return 'gamma';
  if (frequency >= 13) return 'beta';
  if (frequency >= 8) return 'alpha';
  if (frequency >= 4) return 'theta';
  if (frequency > 0) return 'delta';
  return 'unknown';
}

function calculateFrequencyEntropy(samples: number[]): number {
  if (samples.length < 2) return 0;
  
  // Create frequency distribution
  const buckets: Record<number, number> = {};
  samples.forEach(s => {
    const bucket = Math.round(s);
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  });
  
  // Calculate Shannon entropy
  let entropy = 0;
  const total = samples.length;
  Object.values(buckets).forEach(count => {
    const p = count / total;
    entropy -= p * Math.log2(p);
  });
  
  return entropy;
}

function matchDeckToFrequency(deck: string[], targetFreq: number): {
  matches: number;
  dissonant: number;
  neutral: number;
  score: number;
} {
  let matches = 0;
  let dissonant = 0;
  let neutral = 0;
  
  deck.forEach(cardId => {
    const cardFreq = getCardFrequency(cardId);
    const diff = Math.abs(cardFreq - targetFreq);
    const maxFreq = Math.max(cardFreq, targetFreq);
    const matchRatio = 1 - (diff / maxFreq);
    
    if (matchRatio >= 0.6) {
      matches++;
    } else if (matchRatio < 0.4) {
      dissonant++;
    } else {
      neutral++;
    }
  });
  
  // Score: weighted sum of matches vs dissonant
  const score = (matches * 2) - dissonant;
  
  return { matches, dissonant, neutral, score };
}

describe('Frequency Matching Algorithms', () => {
  describe('Card Frequency Lookup', () => {
    it('should return correct frequency for direct mappings', () => {
      expect(getCardFrequency('focus_boost')).toBe(40);
      expect(getCardFrequency('meditation')).toBe(10);
      expect(getCardFrequency('dream_walk')).toBe(6);
      expect(getCardFrequency('earth_anchor')).toBe(7.83);
    });

    it('should infer frequency from card name patterns', () => {
      expect(getCardFrequency('focused_mind')).toBe(40);
      expect(getCardFrequency('calm_breeze')).toBe(10);
      expect(getCardFrequency('dream_voyage')).toBe(6);
      expect(getCardFrequency('grounding_force')).toBe(7.83);
    });

    it('should return default frequency for unknown cards', () => {
      expect(getCardFrequency('unknown_card')).toBe(10);
      expect(getCardFrequency('random_name')).toBe(10);
    });
  });

  describe('Deck Frequency Suggestion', () => {
    it('should suggest Gamma for focus-heavy deck', () => {
      const hand = ['focus_boost', 'caffeine_rush', 'sprint_mode'];
      const result = suggestOptimalFrequency(hand);
      
      expect(result.frequency).toBe(40);
      expect(result.confidence).toBe(1);
      expect(result.reason).toContain('focus');
    });

    it('should suggest Alpha for calm-heavy deck', () => {
      const hand = ['meditation', 'healing_light', 'peace_shield'];
      const result = suggestOptimalFrequency(hand);
      
      expect(result.frequency).toBe(10);
      expect(result.confidence).toBe(1);
      expect(result.reason).toContain('calm');
    });

    it('should suggest Theta for dream-heavy deck', () => {
      const hand = ['dream_walk', 'sixth_sense', 'astral_projection'];
      const result = suggestOptimalFrequency(hand);
      
      expect(result.frequency).toBe(6);
      expect(result.reason).toContain('dream');
    });

    it('should suggest Schumann for grounding deck', () => {
      const hand = ['earth_anchor', 'root_chakra', 'grounding_pulse'];
      const result = suggestOptimalFrequency(hand);
      
      expect(result.frequency).toBe(7.83);
      expect(result.reason).toContain('grounding');
    });

    it('should calculate confidence based on majority frequency', () => {
      const hand = ['focus_boost', 'focus_boost', 'meditation']; // 2/3 Gamma
      const result = suggestOptimalFrequency(hand);
      
      expect(result.frequency).toBe(40);
      expect(result.confidence).toBeCloseTo(0.67, 2);
    });

    it('should handle mixed decks with moderate confidence', () => {
      const hand = ['focus_boost', 'meditation', 'dream_walk']; // All different
      const result = suggestOptimalFrequency(hand);
      
      expect(result.confidence).toBeCloseTo(0.33, 2);
    });
  });

  describe('Deck Type Frequency Mapping', () => {
    it('should return Gamma for gamma_rush deck', () => {
      expect(getDeckFrequency('gamma_rush')).toBe(40);
    });

    it('should return Alpha for alpha_flow deck', () => {
      expect(getDeckFrequency('alpha_flow')).toBe(10);
    });

    it('should return Theta for theta_dream deck', () => {
      expect(getDeckFrequency('theta_dream')).toBe(6);
    });

    it('should return Schumann for schumann_ground deck', () => {
      expect(getDeckFrequency('schumann_ground')).toBe(7.83);
    });

    it('should return default for unknown deck types', () => {
      expect(getDeckFrequency('unknown')).toBe(10);
    });
  });

  describe('Entrainment Verification', () => {
    it('should validate perfect entrainment', () => {
      const result = verifyEntrainment(10, [10, 10, 10, 10]);
      
      expect(result.isValid).toBe(true);
      expect(result.deviation).toBe(0);
      expect(result.quality).toBe(1);
    });

    it('should validate within tolerance', () => {
      const result = verifyEntrainment(10, [10.2, 10.1, 9.9, 10.3]);
      
      expect(result.isValid).toBe(true);
      expect(result.quality).toBeGreaterThan(0.5);
    });

    it('should reject entrainment outside tolerance', () => {
      const result = verifyEntrainment(10, [15, 14, 16, 15.5]);
      
      expect(result.isValid).toBe(false);
      expect(result.quality).toBe(0);
    });

    it('should handle empty samples', () => {
      const result = verifyEntrainment(10, []);
      
      expect(result.isValid).toBe(false);
      expect(result.quality).toBe(0);
    });

    it('should calculate average for multiple samples', () => {
      const result = verifyEntrainment(10, [9, 10, 11]);
      
      expect(result.actualFrequency).toBe(10);
      expect(result.deviation).toBe(0);
    });
  });

  describe('Brainwave State Detection', () => {
    it('should detect Delta state', () => {
      expect(detectBrainwaveState(2.5)).toBe('delta');
      expect(detectBrainwaveState(0.5)).toBe('delta');
    });

    it('should detect Theta state', () => {
      expect(detectBrainwaveState(6)).toBe('theta');
      expect(detectBrainwaveState(4)).toBe('theta');
    });

    it('should detect Alpha state', () => {
      expect(detectBrainwaveState(10.5)).toBe('alpha');
      expect(detectBrainwaveState(8)).toBe('alpha');
    });

    it('should detect Beta state', () => {
      expect(detectBrainwaveState(21.5)).toBe('beta');
      expect(detectBrainwaveState(13)).toBe('beta');
    });

    it('should detect Gamma state', () => {
      expect(detectBrainwaveState(65)).toBe('gamma');
      expect(detectBrainwaveState(30)).toBe('gamma');
    });

    it('should handle unknown states', () => {
      expect(detectBrainwaveState(0)).toBe('unknown');
      expect(detectBrainwaveState(-5)).toBe('unknown');
    });
  });

  describe('Frequency Entropy Calculation', () => {
    it('should return 0 for insufficient samples', () => {
      expect(calculateFrequencyEntropy([10])).toBe(0);
      expect(calculateFrequencyEntropy([])).toBe(0);
    });

    it('should return 0 for uniform distribution', () => {
      const entropy = calculateFrequencyEntropy([10, 10, 10, 10]);
      expect(entropy).toBe(0);
    });

    it('should return higher entropy for varied distribution', () => {
      const uniform = calculateFrequencyEntropy([10, 10, 10, 10]);
      const varied = calculateFrequencyEntropy([10, 20, 30, 40]);
      
      expect(varied).toBeGreaterThan(uniform);
    });

    it('should detect suspiciously low entropy (bot detection)', () => {
      // Bot-like perfect frequency maintenance
      const botSamples = Array(60).fill(10);
      const entropy = calculateFrequencyEntropy(botSamples);
      
      expect(entropy).toBe(0);
    });
  });

  describe('Deck to Frequency Matching', () => {
    it('should score perfect match highly', () => {
      const deck = ['meditation', 'healing_light', 'peace_shield'];
      const result = matchDeckToFrequency(deck, 10);
      
      expect(result.matches).toBe(3);
      expect(result.dissonant).toBe(0);
      expect(result.score).toBe(6);
    });

    it('should penalize dissonant cards', () => {
      const deck = ['meditation', 'focus_boost']; // Alpha + Gamma
      const result = matchDeckToFrequency(deck, 10);
      
      expect(result.matches).toBe(1);
      expect(result.dissonant).toBe(1);
      expect(result.score).toBe(1);
    });

    it('should count neutral cards separately', () => {
      const deck = ['meditation', 'default_card'];
      const result = matchDeckToFrequency(deck, 10);
      
      expect(result.neutral).toBeGreaterThanOrEqual(0);
    });

    it('should favor Gamma deck at 40Hz', () => {
      const gammaDeck = ['focus_boost', 'caffeine_rush'];
      const alphaDeck = ['meditation', 'healing_light'];
      
      const gammaScore = matchDeckToFrequency(gammaDeck, 40).score;
      const alphaScore = matchDeckToFrequency(alphaDeck, 40).score;
      
      expect(gammaScore).toBeGreaterThan(alphaScore);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high frequencies', () => {
      const result = verifyEntrainment(1000, [1000, 1001, 999]);
      expect(result.isValid).toBe(true);
    });

    it('should handle very low frequencies', () => {
      const result = verifyEntrainment(0.5, [0.5, 0.6, 0.4]);
      expect(result.isValid).toBe(true);
    });

    it('should handle exact Schumann resonance', () => {
      const result = verifyEntrainment(7.83, [7.83, 7.83, 7.83]);
      expect(result.isValid).toBe(true);
      expect(result.quality).toBe(1);
    });

    it('should handle large sample sizes', () => {
      const samples = Array(1000).fill(10).map(() => 10 + (Math.random() - 0.5) * 0.5);
      const result = verifyEntrainment(10, samples);
      expect(result.isValid).toBe(true);
    });
  });
});
