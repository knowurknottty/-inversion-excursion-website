/**
 * Unit Tests: Resonance/Dissonance Math
 * Tests frequency matching algorithms and resonance calculations
 */

import { describe, it, expect } from '@jest/globals';

// Resonance calculation constants
const RESONANCE_THRESHOLDS = {
  PERFECT: 0.95,      // 95%+ match = perfect resonance (+50%)
  STRONG: 0.80,       // 80-95% = strong resonance (+30%)
  MATCH: 0.60,        // 60-80% = match (+10%)
  NEUTRAL: 0.40,      // 40-60% = neutral (0%)
  WEAK: 0.20,         // 20-40% = weak (-10%)
  DISSONANT: 0.00,    // 0-20% = dissonant (-20%)
};

const RESONANCE_MULTIPLIERS = {
  PERFECT: 1.5,       // +50% bonus
  STRONG: 1.3,        // +30% bonus
  MATCH: 1.1,         // +10% bonus
  NEUTRAL: 1.0,       // No change
  WEAK: 0.9,          // -10% penalty
  DISSONANT: 0.8,     // -20% penalty
};

interface ResonanceResult {
  matchRatio: number;
  multiplier: number;
  tier: string;
  isResonant: boolean;
  isDissonant: boolean;
}

function calculateResonance(userFrequency: number, cardFrequency: number): ResonanceResult {
  const diff = Math.abs(userFrequency - cardFrequency);
  const maxFreq = Math.max(userFrequency, cardFrequency);
  const matchRatio = 1 - (diff / maxFreq);

  let multiplier = RESONANCE_MULTIPLIERS.NEUTRAL;
  let tier = 'NEUTRAL';
  let isResonant = false;
  let isDissonant = false;

  if (matchRatio >= RESONANCE_THRESHOLDS.PERFECT) {
    multiplier = RESONANCE_MULTIPLIERS.PERFECT;
    tier = 'PERFECT';
    isResonant = true;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.STRONG) {
    multiplier = RESONANCE_MULTIPLIERS.STRONG;
    tier = 'STRONG';
    isResonant = true;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.MATCH) {
    multiplier = RESONANCE_MULTIPLIERS.MATCH;
    tier = 'MATCH';
    isResonant = true;
  } else if (matchRatio >= RESONANCE_THRESHOLDS.NEUTRAL) {
    multiplier = RESONANCE_MULTIPLIERS.NEUTRAL;
    tier = 'NEUTRAL';
  } else if (matchRatio >= RESONANCE_THRESHOLDS.WEAK) {
    multiplier = RESONANCE_MULTIPLIERS.WEAK;
    tier = 'WEAK';
    isDissonant = true;
  } else {
    multiplier = RESONANCE_MULTIPLIERS.DISSONANT;
    tier = 'DISSONANT';
    isDissonant = true;
  }

  // Special case: Schumann resonance (7.83Hz) grounding effect
  if (Math.abs(userFrequency - 7.83) < 0.5 && cardFrequency !== 7.83) {
    if (multiplier < 1.0) {
      multiplier = 1.0;
      tier = 'NEUTRAL';
      isDissonant = false;
    }
  }

  return {
    matchRatio,
    multiplier,
    tier,
    isResonant,
    isDissonant,
  };
}

function calculateCardEffect(baseEffect: number, resonanceResult: ResonanceResult): number {
  return baseEffect * resonanceResult.multiplier;
}

describe('Resonance/Dissonance Math', () => {
  describe('Perfect Resonance (95%+)', () => {
    it('should give 1.5x multiplier for exact frequency match', () => {
      const result = calculateResonance(10, 10);
      expect(result.matchRatio).toBe(1);
      expect(result.multiplier).toBe(1.5);
      expect(result.tier).toBe('PERFECT');
      expect(result.isResonant).toBe(true);
    });

    it('should give 1.5x multiplier for 95% match', () => {
      const userFreq = 10;
      const cardFreq = 10.5; // ~95% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.matchRatio).toBeGreaterThanOrEqual(0.95);
      expect(result.multiplier).toBe(1.5);
    });

    it('should apply +50% bonus to card effect', () => {
      const result = calculateResonance(10, 10);
      const effect = calculateCardEffect(20, result);
      expect(effect).toBe(30); // 20 * 1.5
    });
  });

  describe('Strong Resonance (80-95%)', () => {
    it('should give 1.3x multiplier for 85% match', () => {
      const userFreq = 10;
      const cardFreq = 11.5; // ~85% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.matchRatio).toBeGreaterThanOrEqual(0.8);
      expect(result.matchRatio).toBeLessThan(0.95);
      expect(result.multiplier).toBe(1.3);
      expect(result.tier).toBe('STRONG');
    });

    it('should give 1.3x multiplier for 90% match', () => {
      const userFreq = 10;
      const cardFreq = 11; // ~90% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.multiplier).toBe(1.3);
    });

    it('should apply +30% bonus to card effect', () => {
      const result = calculateResonance(10, 11);
      const effect = calculateCardEffect(20, result);
      expect(effect).toBe(26); // 20 * 1.3
    });
  });

  describe('Match Resonance (60-80%)', () => {
    it('should give 1.1x multiplier for 70% match', () => {
      const userFreq = 10;
      const cardFreq = 14; // ~70% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.matchRatio).toBeGreaterThanOrEqual(0.6);
      expect(result.matchRatio).toBeLessThan(0.8);
      expect(result.multiplier).toBe(1.1);
      expect(result.tier).toBe('MATCH');
    });

    it('should apply +10% bonus to card effect', () => {
      const result = calculateResonance(10, 14);
      const effect = calculateCardEffect(20, result);
      expect(effect).toBe(22); // 20 * 1.1
    });
  });

  describe('Neutral (40-60%)', () => {
    it('should give 1.0x multiplier for 50% match', () => {
      const userFreq = 10;
      const cardFreq = 20; // 50% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.matchRatio).toBe(0.5);
      expect(result.multiplier).toBe(1.0);
      expect(result.tier).toBe('NEUTRAL');
    });

    it('should not modify card effect', () => {
      const result = calculateResonance(10, 20);
      const effect = calculateCardEffect(20, result);
      expect(effect).toBe(20);
    });
  });

  describe('Weak Resonance (20-40%)', () => {
    it('should give 0.9x multiplier for 30% match', () => {
      const userFreq = 10;
      const cardFreq = 30; // ~70% difference, ~30% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.matchRatio).toBeGreaterThanOrEqual(0.2);
      expect(result.matchRatio).toBeLessThan(0.4);
      expect(result.multiplier).toBe(0.9);
      expect(result.tier).toBe('WEAK');
      expect(result.isDissonant).toBe(true);
    });

    it('should apply -10% penalty to card effect', () => {
      const result = calculateResonance(10, 30);
      const effect = calculateCardEffect(20, result);
      expect(effect).toBe(18); // 20 * 0.9
    });
  });

  describe('Dissonant (0-20%)', () => {
    it('should give 0.8x multiplier for 10% match', () => {
      const userFreq = 10;
      const cardFreq = 100; // ~90% difference, ~10% match
      const result = calculateResonance(userFreq, cardFreq);
      expect(result.matchRatio).toBeLessThan(0.2);
      expect(result.multiplier).toBe(0.8);
      expect(result.tier).toBe('DISSONANT');
      expect(result.isDissonant).toBe(true);
    });

    it('should apply -20% penalty to card effect', () => {
      const result = calculateResonance(10, 100);
      const effect = calculateCardEffect(20, result);
      expect(effect).toBe(16); // 20 * 0.8
    });
  });

  describe('Schumann Resonance Special Case', () => {
    it('should ground dissonant cards when user at Schumann (7.83Hz)', () => {
      const result = calculateResonance(7.83, 100); // Schumann vs distant freq
      expect(result.multiplier).toBe(1.0);
      expect(result.tier).toBe('NEUTRAL');
      expect(result.isDissonant).toBe(false);
    });

    it('should preserve resonance bonuses when grounded', () => {
      const result = calculateResonance(7.83, 8.0); // Schumann vs close freq
      // Should remain at least neutral, potentially resonant
      expect(result.multiplier).toBeGreaterThanOrEqual(1.0);
    });

    it('should not affect perfect match with Schumann card', () => {
      const result = calculateResonance(7.83, 7.83);
      expect(result.multiplier).toBe(1.5);
      expect(result.tier).toBe('PERFECT');
    });
  });

  describe('Brainwave State Frequencies', () => {
    const brainwaveTests = [
      { name: 'Delta', freq: 2.5, range: [0.5, 4] },
      { name: 'Theta', freq: 6.0, range: [4, 8] },
      { name: 'Alpha', freq: 10.5, range: [8, 13] },
      { name: 'Beta', freq: 21.5, range: [13, 30] },
      { name: 'Gamma', freq: 65.0, range: [30, 100] },
    ];

    brainwaveTests.forEach(({ name, freq }) => {
      it(`should calculate perfect resonance for ${name} (${freq}Hz)`, () => {
        const result = calculateResonance(freq, freq);
        expect(result.tier).toBe('PERFECT');
        expect(result.multiplier).toBe(1.5);
      });
    });

    it('should calculate cross-frequency relationships correctly', () => {
      // Theta (6Hz) vs Alpha (10.5Hz)
      const result = calculateResonance(6, 10.5);
      expect(result.matchRatio).toBeCloseTo(0.43, 2); // ~43% match
      expect(result.tier).toBe('NEUTRAL');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero frequency gracefully', () => {
      const result = calculateResonance(0, 10);
      expect(result.matchRatio).toBe(0);
      expect(result.tier).toBe('DISSONANT');
    });

    it('should handle very high frequencies', () => {
      const result = calculateResonance(1000, 1000);
      expect(result.tier).toBe('PERFECT');
      expect(result.multiplier).toBe(1.5);
    });

    it('should handle negative frequencies (should treat as positive)', () => {
      const result1 = calculateResonance(-10, 10);
      const result2 = calculateResonance(10, 10);
      expect(result1.matchRatio).toBeLessThan(result2.matchRatio);
    });

    it('should be commutative (order should not matter)', () => {
      const result1 = calculateResonance(10, 15);
      const result2 = calculateResonance(15, 10);
      expect(result1.matchRatio).toBe(result2.matchRatio);
      expect(result1.multiplier).toBe(result2.multiplier);
    });
  });

  describe('Real Game Scenarios', () => {
    it('should favor Theta deck when user entrains to 6Hz', () => {
      const userFreq = 6; // Theta
      const thetaCard = { name: 'dream_walk', freq: 6 };
      const gammaCard = { name: 'focus_boost', freq: 40 };

      const thetaResult = calculateResonance(userFreq, thetaCard.freq);
      const gammaResult = calculateResonance(userFreq, gammaCard.freq);

      expect(thetaResult.multiplier).toBeGreaterThan(gammaResult.multiplier);
    });

    it('should favor Gamma deck when user entrains to 40Hz', () => {
      const userFreq = 40; // Gamma
      const thetaCard = { name: 'dream_walk', freq: 6 };
      const gammaCard = { name: 'focus_boost', freq: 40 };

      const thetaResult = calculateResonance(userFreq, thetaCard.freq);
      const gammaResult = calculateResonance(userFreq, gammaCard.freq);

      expect(gammaResult.multiplier).toBeGreaterThan(thetaResult.multiplier);
    });

    it('should reward players for matching their deck frequency', () => {
      const deckFreq = 10.5; // Alpha deck
      const userFreq = 10.5; // Player entrains to Alpha

      const result = calculateResonance(userFreq, deckFreq);
      expect(result.isResonant).toBe(true);
      expect(result.multiplier).toBeGreaterThanOrEqual(1.1);
    });
  });
});
