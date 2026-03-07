/**
 * Unit Tests: Card Balance Calculations
 * Tests for power scores, tier multipliers, and curse calculations
 */

import { describe, it, expect } from '@jest/globals';

// Card balance formula: Power = (BaseStat × TierMultiplier) - (CurseSeverity × 0.7)

interface CardBalanceInput {
  baseStat: number;
  tier: 'Physical' | 'Emotional' | 'Atomic' | 'Galactic' | 'Cosmic' | 'Hybrid';
  curseSeverity: number;
}

const TIER_MULTIPLIERS: Record<string, number> = {
  Physical: 1.0,
  Emotional: 1.2,
  Atomic: 1.5,
  Galactic: 2.0,
  Cosmic: 3.0,
  Hybrid: 1.8,
};

function calculatePower(input: CardBalanceInput): number {
  const tierMultiplier = TIER_MULTIPLIERS[input.tier];
  const rawPower = input.baseStat * tierMultiplier;
  const cursePenalty = input.curseSeverity * 0.7;
  return Math.max(0, rawPower - cursePenalty);
}

function calculateEfficiency(power: number, energyCost: number): number {
  return power / Math.max(1, energyCost);
}

describe('Card Balance Calculations', () => {
  describe('Tier Multipliers', () => {
    it('should apply Physical tier multiplier correctly', () => {
      const input: CardBalanceInput = {
        baseStat: 20,
        tier: 'Physical',
        curseSeverity: 5,
      };
      const power = calculatePower(input);
      // (20 × 1.0) - (5 × 0.7) = 20 - 3.5 = 16.5
      expect(power).toBeCloseTo(16.5, 1);
    });

    it('should apply Emotional tier multiplier correctly', () => {
      const input: CardBalanceInput = {
        baseStat: 20,
        tier: 'Emotional',
        curseSeverity: 5,
      };
      const power = calculatePower(input);
      // (20 × 1.2) - (5 × 0.7) = 24 - 3.5 = 20.5
      expect(power).toBeCloseTo(20.5, 1);
    });

    it('should apply Atomic tier multiplier correctly', () => {
      const input: CardBalanceInput = {
        baseStat: 25,
        tier: 'Atomic',
        curseSeverity: 15,
      };
      const power = calculatePower(input);
      // (25 × 1.5) - (15 × 0.7) = 37.5 - 10.5 = 27
      expect(power).toBeCloseTo(27, 1);
    });

    it('should apply Galactic tier multiplier correctly', () => {
      const input: CardBalanceInput = {
        baseStat: 30,
        tier: 'Galactic',
        curseSeverity: 10,
      };
      const power = calculatePower(input);
      // (30 × 2.0) - (10 × 0.7) = 60 - 7 = 53
      expect(power).toBeCloseTo(53, 1);
    });

    it('should apply Cosmic tier multiplier correctly', () => {
      const input: CardBalanceInput = {
        baseStat: 40,
        tier: 'Cosmic',
        curseSeverity: 20,
      };
      const power = calculatePower(input);
      // (40 × 3.0) - (20 × 0.7) = 120 - 14 = 106
      expect(power).toBeCloseTo(106, 1);
    });

    it('should apply Hybrid tier multiplier correctly', () => {
      const input: CardBalanceInput = {
        baseStat: 25,
        tier: 'Hybrid',
        curseSeverity: 8,
      };
      const power = calculatePower(input);
      // (25 × 1.8) - (8 × 0.7) = 45 - 5.6 = 39.4
      expect(power).toBeCloseTo(39.4, 1);
    });
  });

  describe('Curse Penalty Calculations', () => {
    it('should calculate curse penalty correctly for low severity', () => {
      const input: CardBalanceInput = {
        baseStat: 20,
        tier: 'Physical',
        curseSeverity: 4,
      };
      const power = calculatePower(input);
      // (20 × 1.0) - (4 × 0.7) = 20 - 2.8 = 17.2
      expect(power).toBeCloseTo(17.2, 1);
    });

    it('should calculate curse penalty correctly for medium severity', () => {
      const input: CardBalanceInput = {
        baseStat: 20,
        tier: 'Physical',
        curseSeverity: 10,
      };
      const power = calculatePower(input);
      // (20 × 1.0) - (10 × 0.7) = 20 - 7 = 13
      expect(power).toBeCloseTo(13, 1);
    });

    it('should calculate curse penalty correctly for high severity', () => {
      const input: CardBalanceInput = {
        baseStat: 20,
        tier: 'Physical',
        curseSeverity: 18,
      };
      const power = calculatePower(input);
      // (20 × 1.0) - (18 × 0.7) = 20 - 12.6 = 7.4
      expect(power).toBeCloseTo(7.4, 1);
    });

    it('should never return negative power', () => {
      const input: CardBalanceInput = {
        baseStat: 10,
        tier: 'Physical',
        curseSeverity: 20,
      };
      const power = calculatePower(input);
      // (10 × 1.0) - (20 × 0.7) = 10 - 14 = -4 → should be 0
      expect(power).toBe(0);
    });

    it('should handle zero curse severity', () => {
      const input: CardBalanceInput = {
        baseStat: 20,
        tier: 'Physical',
        curseSeverity: 0,
      };
      const power = calculatePower(input);
      expect(power).toBe(20);
    });
  });

  describe('Efficiency Calculations', () => {
    it('should calculate efficiency for low cost cards', () => {
      const power = 20;
      const energyCost = 1;
      const efficiency = calculateEfficiency(power, energyCost);
      expect(efficiency).toBe(20);
    });

    it('should calculate efficiency for medium cost cards', () => {
      const power = 35;
      const energyCost = 2;
      const efficiency = calculateEfficiency(power, energyCost);
      expect(efficiency).toBe(17.5);
    });

    it('should calculate efficiency for high cost cards', () => {
      const power = 42;
      const energyCost = 3;
      const efficiency = calculateEfficiency(power, energyCost);
      expect(efficiency).toBe(14);
    });

    it('should handle zero energy cost gracefully', () => {
      const power = 20;
      const energyCost = 0;
      const efficiency = calculateEfficiency(power, energyCost);
      expect(efficiency).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero base stat', () => {
      const input: CardBalanceInput = {
        baseStat: 0,
        tier: 'Physical',
        curseSeverity: 5,
      };
      const power = calculatePower(input);
      expect(power).toBe(0);
    });

    it('should handle very high base stats', () => {
      const input: CardBalanceInput = {
        baseStat: 1000,
        tier: 'Cosmic',
        curseSeverity: 50,
      };
      const power = calculatePower(input);
      // (1000 × 3.0) - (50 × 0.7) = 3000 - 35 = 2965
      expect(power).toBeCloseTo(2965, 1);
    });

    it('should maintain consistency across multiple calculations', () => {
      const input: CardBalanceInput = {
        baseStat: 25,
        tier: 'Atomic',
        curseSeverity: 12,
      };
      const power1 = calculatePower(input);
      const power2 = calculatePower(input);
      const power3 = calculatePower(input);
      expect(power1).toBe(power2);
      expect(power2).toBe(power3);
    });
  });

  describe('Real Card Database Validation', () => {
    // Test against actual card database values
    const realCards = [
      { id: 'P-1', name: 'CITATION REQUIRED', baseStat: 16, tier: 'Physical', curseSeverity: 5, expectedPower: 12.5 },
      { id: 'P-2', name: 'INDEX OF FORBIDDEN KNOWLEDGE', baseStat: 18, tier: 'Emotional', curseSeverity: 12, expectedPower: 9.6 },
      { id: 'P-3', name: 'THE FINAL FOOTNOTE', baseStat: 52.5, tier: 'Atomic', curseSeverity: 15, expectedPower: 42.0 },
      { id: 'G-1', name: 'CLAY FIST', baseStat: 22.5, tier: 'Physical', curseSeverity: 4, expectedPower: 19.2 },
    ];

    realCards.forEach(card => {
      it(`should match database power for ${card.name}`, () => {
        const input: CardBalanceInput = {
          baseStat: card.baseStat,
          tier: card.tier as any,
          curseSeverity: card.curseSeverity,
        };
        const power = calculatePower(input);
        expect(power).toBeCloseTo(card.expectedPower, 1);
      });
    });
  });
});
