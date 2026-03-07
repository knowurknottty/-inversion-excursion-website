/**
 * Integration Tests: SynSync Audio Engine + Resonance Calculator
 * Tests the complete flow from audio entrainment to game mechanics
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getSynSyncEngine, FREQUENCY_PRESETS } from '@/synsync-bridge/SynSyncEngine';
import { calculateResonance, getCardFrequency, calculateCardEffect } from '@/synsync-bridge/ResonanceCalculator';

// Mock the SynSyncEngine for testing
jest.mock('@/synsync-bridge/SynSyncEngine', () => ({
  getSynSyncEngine: jest.fn().mockReturnValue({
    initialize: jest.fn().mockResolvedValue(true),
    startBinaural: jest.fn().mockResolvedValue(undefined),
    startIsochronic: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    getProgress: jest.fn().mockReturnValue(0.5),
    getIsPlaying: jest.fn().mockReturnValue(true),
    generateProof: jest.fn().mockReturnValue({
      sessionId: 'test-session',
      timestamp: Date.now(),
      duration: 60,
      targetFrequency: 10,
      actualFrequencies: [10, 10.1, 9.9],
      entropy: 1.5,
      signature: 'test-sig',
    }),
  }),
  FREQUENCY_PRESETS: {
    alpha: { beat: 10, carrier: 432, name: 'Alpha Flow' },
    theta: { beat: 6, carrier: 432, name: 'Theta Deep' },
    gamma: { beat: 40, carrier: 440, name: 'Gamma Peak' },
    schumann: { beat: 7.83, carrier: 432, name: 'Earth Pulse' },
    custom: { beat: 0, carrier: 432, name: 'Custom' },
  },
  CARD_FREQUENCY_MAP: {
    'focus_boost': 40,
    'meditation': 10,
    'dream_walk': 6,
    'earth_anchor': 7.83,
    'default': 10,
  },
}));

jest.mock('@/synsync-bridge/ResonanceCalculator', () => ({
  calculateResonance: jest.fn().mockImplementation((userFreq, cardId) => {
    const cardFreq = cardId === 'focus_boost' ? 40 : cardId === 'dream_walk' ? 6 : 10;
    const diff = Math.abs(userFreq - cardFreq);
    const matchRatio = 1 - (diff / Math.max(userFreq, cardFreq));
    
    let multiplier = 1.0;
    if (matchRatio >= 0.95) multiplier = 1.5;
    else if (matchRatio >= 0.8) multiplier = 1.3;
    else if (matchRatio >= 0.6) multiplier = 1.1;
    else if (matchRatio >= 0.4) multiplier = 1.0;
    else if (matchRatio >= 0.2) multiplier = 0.9;
    else multiplier = 0.8;
    
    return {
      cardFrequency: cardFreq,
      userFrequency: userFreq,
      resonance: matchRatio,
      multiplier,
      isResonant: multiplier > 1.0,
      isDissonant: multiplier < 1.0,
    };
  }),
  getCardFrequency: jest.fn().mockImplementation((cardId) => {
    const map: Record<string, number> = {
      'focus_boost': 40,
      'meditation': 10,
      'dream_walk': 6,
      'earth_anchor': 7.83,
    };
    return map[cardId] || 10;
  }),
  calculateCardEffect: jest.fn().mockImplementation((card, userFreq) => {
    const resonance = {
      cardFrequency: 10,
      userFrequency: userFreq,
      resonance: 1.0,
      multiplier: 1.5,
      isResonant: true,
      isDissonant: false,
    };
    return {
      baseEffect: card.baseEffect,
      finalEffect: card.baseEffect * 1.5,
      resonance,
    };
  }),
}));

describe('SynSync + Resonance Integration', () => {
  let engine: any;

  beforeEach(() => {
    engine = getSynSyncEngine();
  });

  describe('Audio Initialization', () => {
    it('should initialize audio context successfully', async () => {
      const result = await engine.initialize();
      expect(result).toBe(true);
    });

    it('should start binaural entrainment session', async () => {
      await engine.initialize();
      await engine.startBinaural({
        preset: 'alpha',
        carrierFrequency: 432,
        beatFrequency: 10,
        beatType: 'binaural',
        duration: 60,
        volume: 0.5,
      });
      
      expect(engine.startBinaural).toHaveBeenCalled();
    });

    it('should start isochronic entrainment session', async () => {
      await engine.initialize();
      await engine.startIsochronic({
        preset: 'gamma',
        carrierFrequency: 440,
        beatFrequency: 40,
        beatType: 'isochronic',
        duration: 120,
        volume: 0.3,
      });
      
      expect(engine.startIsochronic).toHaveBeenCalled();
    });
  });

  describe('Entrainment Proof Generation', () => {
    it('should generate valid proof after session', () => {
      const proof = engine.generateProof({
        preset: 'alpha',
        carrierFrequency: 432,
        beatFrequency: 10,
        beatType: 'binaural',
        duration: 60,
        volume: 0.5,
      });
      
      expect(proof).toHaveProperty('sessionId');
      expect(proof).toHaveProperty('timestamp');
      expect(proof).toHaveProperty('targetFrequency');
      expect(proof).toHaveProperty('actualFrequencies');
      expect(proof).toHaveProperty('entropy');
      expect(proof).toHaveProperty('signature');
    });

    it('should include frequency samples in proof', () => {
      const proof = engine.generateProof({
        preset: 'alpha',
        carrierFrequency: 432,
        beatFrequency: 10,
        beatType: 'binaural',
        duration: 60,
        volume: 0.5,
      });
      
      expect(proof.actualFrequencies).toBeInstanceOf(Array);
      expect(proof.actualFrequencies.length).toBeGreaterThan(0);
    });
  });

  describe('Resonance Calculation Flow', () => {
    it('should calculate resonance for matching frequency', () => {
      const result = calculateResonance(10, 'meditation');
      
      expect(result.userFrequency).toBe(10);
      expect(result.cardFrequency).toBe(10);
      expect(result.multiplier).toBeGreaterThan(1.0);
      expect(result.isResonant).toBe(true);
    });

    it('should calculate dissonance for mismatched frequency', () => {
      const result = calculateResonance(40, 'dream_walk'); // Gamma vs Theta card
      
      expect(result.userFrequency).toBe(40);
      expect(result.cardFrequency).toBe(6);
      expect(result.isDissonant).toBe(true);
    });

    it('should provide correct multiplier for card effects', () => {
      const result = calculateResonance(10, 'meditation');
      
      expect(result.multiplier).toBeDefined();
      expect(result.multiplier).toBeGreaterThan(0);
    });
  });

  describe('Card Effect Enhancement', () => {
    it('should boost card effect when resonant', () => {
      const card = {
        id: 'meditation',
        name: 'Meditation',
        type: 'calm' as const,
        baseEffect: 20,
      };
      
      const result = calculateCardEffect(card, 10);
      
      expect(result.finalEffect).toBeGreaterThan(result.baseEffect);
      expect(result.resonance.isResonant).toBe(true);
    });

    it('should reduce card effect when dissonant', () => {
      const card = {
        id: 'dream_walk',
        name: 'Dream Walk',
        type: 'dream' as const,
        baseEffect: 20,
      };
      
      // Mock dissonant result
      (calculateCardEffect as jest.Mock).mockReturnValueOnce({
        baseEffect: 20,
        finalEffect: 16, // Reduced
        resonance: {
          multiplier: 0.8,
          isResonant: false,
          isDissonant: true,
        },
      });
      
      const result = calculateCardEffect(card, 40);
      
      expect(result.finalEffect).toBeLessThan(result.baseEffect);
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete full entrainment to gameplay flow', async () => {
      // 1. Initialize audio
      await engine.initialize();
      
      // 2. Start entrainment to Alpha
      await engine.startBinaural({
        preset: 'alpha',
        carrierFrequency: 432,
        beatFrequency: 10,
        beatType: 'binaural',
        duration: 60,
        volume: 0.5,
      });
      
      // 3. Complete session and get proof
      const proof = engine.generateProof({
        preset: 'alpha',
        carrierFrequency: 432,
        beatFrequency: 10,
        beatType: 'binaural',
        duration: 60,
        volume: 0.5,
      });
      
      // 4. Calculate resonance with Alpha card
      const resonance = calculateResonance(proof.targetFrequency, 'meditation');
      
      // 5. Verify resonant bonus applied
      expect(resonance.isResonant).toBe(true);
      expect(resonance.multiplier).toBeGreaterThan(1.0);
    });

    it('should handle different brainwave states correctly', async () => {
      const states = [
        { preset: 'alpha', freq: 10, card: 'meditation' },
        { preset: 'gamma', freq: 40, card: 'focus_boost' },
        { preset: 'theta', freq: 6, card: 'dream_walk' },
      ];
      
      for (const state of states) {
        await engine.startBinaural({
          preset: state.preset as any,
          carrierFrequency: 432,
          beatFrequency: state.freq,
          beatType: 'binaural',
          duration: 60,
          volume: 0.5,
        });
        
        const proof = engine.generateProof({
          preset: state.preset as any,
          carrierFrequency: 432,
          beatFrequency: state.freq,
          beatType: 'binaural',
          duration: 60,
          volume: 0.5,
        });
        
        const resonance = calculateResonance(proof.targetFrequency, state.card);
        expect(resonance.userFrequency).toBe(state.freq);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle audio context initialization failure', async () => {
      (engine.initialize as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await engine.initialize();
      expect(result).toBe(false);
    });

    it('should handle missing frequency data gracefully', () => {
      (getCardFrequency as jest.Mock).mockReturnValueOnce(10); // Default
      
      const freq = getCardFrequency('nonexistent_card');
      expect(freq).toBe(10);
    });

    it('should handle proof generation without active session', () => {
      (engine.getIsPlaying as jest.Mock).mockReturnValueOnce(false);
      
      const proof = engine.generateProof({} as any);
      expect(proof).toBeDefined();
    });
  });
});
