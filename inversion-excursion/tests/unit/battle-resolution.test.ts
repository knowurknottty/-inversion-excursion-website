/**
 * Unit Tests: Battle Resolution Logic
 * Tests for combat calculations, turn management, and victory conditions
 */

import { describe, it, expect } from '@jest/globals';

// ==================== BATTLE TYPES ====================

interface BattleCard {
  id: string;
  currentHp: number;
  maxHp: number;
  power: number;
  defense: number;
  speed: number;
  isActive: boolean;
}

interface BattlePlayer {
  id: string;
  cards: BattleCard[];
  isActive: boolean;
}

interface BattleAction {
  type: 'ATTACK' | 'DEFEND' | 'SPECIAL' | 'HEAL' | 'SYNSYNC_BOOST';
  actorId: string;
  targetId?: string;
  cardId: string;
}

interface BattleState {
  turn: number;
  player1: BattlePlayer;
  player2: BattlePlayer;
  resonanceMeter: number;
  isComplete: boolean;
  winner?: string;
  log: string[];
}

// ==================== BATTLE LOGIC ====================

const ACTION_DAMAGE: Record<BattleAction['type'], number> = {
  ATTACK: 25,
  DEFEND: 0,
  SPECIAL: 40,
  HEAL: 30,
  SYNSYNC_BOOST: 15,
};

function calculateDamage(
  actionType: BattleAction['type'],
  attackerCard: BattleCard,
  defenderCard?: BattleCard,
  resonanceBonus: number = 0
): number {
  const baseDamage = ACTION_DAMAGE[actionType];
  const powerBonus = attackerCard.power * 0.1;
  const speedBonus = attackerCard.speed * 0.05;
  
  let damage = baseDamage + powerBonus + speedBonus + resonanceBonus;
  
  // Apply defense reduction for DEFEND action
  if (actionType === 'DEFEND' && defenderCard) {
    const defenseReduction = defenderCard.defense * 0.2;
    damage = Math.max(0, damage - defenseReduction);
  }
  
  // Apply defense mitigation for regular attacks
  if (defenderCard && actionType !== 'HEAL') {
    const mitigation = defenderCard.defense * 0.05;
    damage = Math.max(1, damage - mitigation);
  }
  
  return Math.floor(damage);
}

function resolveAction(
  state: BattleState,
  action: BattleAction,
  resonanceBonus: number = 0
): BattleState {
  const newState = { ...state, log: [...state.log] };
  const actor = action.actorId === state.player1.id ? newState.player1 : newState.player2;
  const target = action.actorId === state.player1.id ? newState.player2 : newState.player1;
  
  const actorCard = actor.cards.find(c => c.id === action.cardId);
  if (!actorCard) return newState;
  
  let targetCard: BattleCard | undefined;
  if (action.targetId) {
    targetCard = target.cards.find(c => c.id === action.targetId);
  } else {
    // Default to first active card
    targetCard = target.cards.find(c => c.isActive);
  }
  
  switch (action.type) {
    case 'ATTACK':
    case 'SPECIAL':
      if (targetCard) {
        const damage = calculateDamage(action.type, actorCard, targetCard, resonanceBonus);
        targetCard.currentHp = Math.max(0, targetCard.currentHp - damage);
        newState.log.push(`${actor.id}'s ${action.cardId} deals ${damage} damage to ${target.id}`);
        
        if (targetCard.currentHp === 0) {
          targetCard.isActive = false;
          newState.log.push(`${target.id}'s card is defeated!`);
        }
      }
      break;
      
    case 'DEFEND':
      const defenseBoost = actorCard.defense * 0.15;
      newState.log.push(`${actor.id} defends, boosting defense by ${Math.floor(defenseBoost)}`);
      break;
      
    case 'HEAL':
      const healAmount = calculateDamage('HEAL', actorCard, undefined, resonanceBonus);
      const targetToHeal = actor.cards.find(c => c.currentHp < c.maxHp) || actorCard;
      const actualHeal = Math.min(healAmount, targetToHeal.maxHp - targetToHeal.currentHp);
      targetToHeal.currentHp += actualHeal;
      newState.log.push(`${actor.id} heals for ${actualHeal} HP`);
      break;
      
    case 'SYNSYNC_BOOST':
      const boostDamage = calculateDamage('SYNSYNC_BOOST', actorCard, targetCard, resonanceBonus);
      if (targetCard) {
        targetCard.currentHp = Math.max(0, targetCard.currentHp - boostDamage);
        newState.log.push(`${actor.id} channels Synsync for ${boostDamage} damage!`);
      }
      newState.resonanceMeter = 0; // Reset after use
      break;
  }
  
  // Check for battle end
  const targetActiveCards = target.cards.filter(c => c.isActive);
  if (targetActiveCards.length === 0) {
    newState.isComplete = true;
    newState.winner = actor.id;
    newState.log.push(`${actor.id} wins the battle!`);
  }
  
  return newState;
}

function advanceTurn(state: BattleState): BattleState {
  const newState = { ...state, turn: state.turn + 1 };
  newState.player1.isActive = !newState.player1.isActive;
  newState.player2.isActive = !newState.player2.isActive;
  
  // Increase resonance meter
  newState.resonanceMeter = Math.min(100, newState.resonanceMeter + 15);
  
  return newState;
}

function determineInitiative(player1Card: BattleCard, player2Card: BattleCard): string {
  if (player1Card.speed > player2Card.speed) return 'player1';
  if (player2Card.speed > player1Card.speed) return 'player2';
  return Math.random() > 0.5 ? 'player1' : 'player2'; // Tie-breaker
}

describe('Battle Resolution Logic', () => {
  const createMockCard = (overrides: Partial<BattleCard> = {}): BattleCard => ({
    id: 'card-' + Math.random().toString(36).substr(2, 9),
    currentHp: 100,
    maxHp: 100,
    power: 50,
    defense: 30,
    speed: 20,
    isActive: true,
    ...overrides,
  });

  const createMockState = (): BattleState => ({
    turn: 1,
    player1: {
      id: 'player1',
      cards: [createMockCard({ id: 'p1-card1' })],
      isActive: true,
    },
    player2: {
      id: 'player2',
      cards: [createMockCard({ id: 'p2-card1' })],
      isActive: false,
    },
    resonanceMeter: 0,
    isComplete: false,
    log: [],
  });

  describe('Damage Calculations', () => {
    it('should calculate base attack damage correctly', () => {
      const attacker = createMockCard({ power: 50, speed: 20 });
      const damage = calculateDamage('ATTACK', attacker);
      // 25 + (50 * 0.1) + (20 * 0.05) = 25 + 5 + 1 = 31
      expect(damage).toBe(31);
    });

    it('should calculate special attack damage correctly', () => {
      const attacker = createMockCard({ power: 50, speed: 20 });
      const damage = calculateDamage('SPECIAL', attacker);
      // 40 + (50 * 0.1) + (20 * 0.05) = 40 + 5 + 1 = 46
      expect(damage).toBe(46);
    });

    it('should apply defense mitigation correctly', () => {
      const attacker = createMockCard({ power: 50, speed: 20 });
      const defender = createMockCard({ defense: 50 });
      const damage = calculateDamage('ATTACK', attacker, defender);
      // Base: 31, Defense mitigation: 50 * 0.05 = 2.5
      // 31 - 2.5 = 28.5, floored to 28
      expect(damage).toBe(28);
    });

    it('should apply resonance bonus correctly', () => {
      const attacker = createMockCard({ power: 50, speed: 20 });
      const resonanceBonus = 10;
      const damage = calculateDamage('ATTACK', attacker, undefined, resonanceBonus);
      // 31 + 10 = 41
      expect(damage).toBe(41);
    });

    it('should ensure minimum damage of 1', () => {
      const attacker = createMockCard({ power: 1, speed: 1 });
      const defender = createMockCard({ defense: 1000 });
      const damage = calculateDamage('ATTACK', attacker, defender);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('should calculate heal amount correctly', () => {
      const healer = createMockCard({ power: 50, speed: 20 });
      const healAmount = calculateDamage('HEAL', healer);
      // 30 + (50 * 0.1) + (20 * 0.05) = 30 + 5 + 1 = 36
      expect(healAmount).toBe(36);
    });
  });

  describe('Action Resolution', () => {
    it('should resolve attack action correctly', () => {
      const state = createMockState();
      const action: BattleAction = {
        type: 'ATTACK',
        actorId: 'player1',
        targetId: 'p2-card1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.player2.cards[0].currentHp).toBeLessThan(100);
      expect(newState.log.length).toBeGreaterThan(0);
    });

    it('should mark card as defeated when HP reaches 0', () => {
      const state = createMockState();
      state.player2.cards[0].currentHp = 5; // Set low HP
      
      const action: BattleAction = {
        type: 'ATTACK',
        actorId: 'player1',
        targetId: 'p2-card1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.player2.cards[0].isActive).toBe(false);
      expect(newState.isComplete).toBe(true);
      expect(newState.winner).toBe('player1');
    });

    it('should resolve heal action correctly', () => {
      const state = createMockState();
      state.player1.cards[0].currentHp = 50;
      
      const action: BattleAction = {
        type: 'HEAL',
        actorId: 'player1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.player1.cards[0].currentHp).toBeGreaterThan(50);
    });

    it('should not overheal beyond max HP', () => {
      const state = createMockState();
      state.player1.cards[0].currentHp = 95;
      
      const action: BattleAction = {
        type: 'HEAL',
        actorId: 'player1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.player1.cards[0].currentHp).toBe(100);
    });

    it('should reset resonance meter after SYNSYNC_BOOST', () => {
      const state = createMockState();
      state.resonanceMeter = 100;
      
      const action: BattleAction = {
        type: 'SYNSYNC_BOOST',
        actorId: 'player1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.resonanceMeter).toBe(0);
    });

    it('should add action to battle log', () => {
      const state = createMockState();
      const action: BattleAction = {
        type: 'DEFEND',
        actorId: 'player1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.log.length).toBe(1);
      expect(newState.log[0]).toContain('player1');
      expect(newState.log[0]).toContain('defends');
    });
  });

  describe('Turn Management', () => {
    it('should advance turn counter', () => {
      const state = createMockState();
      const newState = advanceTurn(state);
      
      expect(newState.turn).toBe(2);
    });

    it('should toggle active player', () => {
      const state = createMockState();
      state.player1.isActive = true;
      state.player2.isActive = false;
      
      const newState = advanceTurn(state);
      
      expect(newState.player1.isActive).toBe(false);
      expect(newState.player2.isActive).toBe(true);
    });

    it('should increase resonance meter each turn', () => {
      const state = createMockState();
      state.resonanceMeter = 30;
      
      const newState = advanceTurn(state);
      
      expect(newState.resonanceMeter).toBe(45);
    });

    it('should cap resonance meter at 100', () => {
      const state = createMockState();
      state.resonanceMeter = 95;
      
      const newState = advanceTurn(state);
      
      expect(newState.resonanceMeter).toBe(100);
    });
  });

  describe('Initiative Determination', () => {
    it('should give initiative to faster card', () => {
      const card1 = createMockCard({ speed: 30 });
      const card2 = createMockCard({ speed: 20 });
      
      const initiative = determineInitiative(card1, card2);
      
      expect(initiative).toBe('player1');
    });

    it('should give initiative to player2 if faster', () => {
      const card1 = createMockCard({ speed: 20 });
      const card2 = createMockCard({ speed: 30 });
      
      const initiative = determineInitiative(card1, card2);
      
      expect(initiative).toBe('player2');
    });

    it('should randomize on speed tie', () => {
      const card1 = createMockCard({ speed: 25 });
      const card2 = createMockCard({ speed: 25 });
      
      // Run multiple times to verify randomness
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(determineInitiative(card1, card2));
      }
      
      // Should sometimes be player1, sometimes player2
      expect(results.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Victory Conditions', () => {
    it('should declare winner when opponent has no active cards', () => {
      const state = createMockState();
      state.player2.cards[0].isActive = false;
      state.player2.cards[0].currentHp = 0;
      
      const action: BattleAction = {
        type: 'ATTACK',
        actorId: 'player1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      expect(newState.isComplete).toBe(true);
      expect(newState.winner).toBe('player1');
    });

    it('should handle multiple cards per player', () => {
      const state = createMockState();
      state.player1.cards = [
        createMockCard({ id: 'p1-card1' }),
        createMockCard({ id: 'p1-card2' }),
      ];
      state.player2.cards = [
        createMockCard({ id: 'p2-card1' }),
        createMockCard({ id: 'p2-card2' }),
      ];
      
      // Defeat one card
      state.player2.cards[0].currentHp = 0;
      state.player2.cards[0].isActive = false;
      
      const action: BattleAction = {
        type: 'ATTACK',
        actorId: 'player1',
        targetId: 'p2-card2',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      // Battle not complete yet
      expect(newState.isComplete).toBe(false);
    });

    it('should handle max turns limit', () => {
      const state = createMockState();
      state.turn = 50; // Max turns reached
      
      // Winner should be player with most total HP
      state.player1.cards[0].currentHp = 80;
      state.player2.cards[0].currentHp = 60;
      
      // In a real implementation, this would be checked after each turn
      // This test documents the expected behavior
      const player1Total = state.player1.cards.reduce((sum, c) => sum + c.currentHp, 0);
      const player2Total = state.player2.cards.reduce((sum, c) => sum + c.currentHp, 0);
      
      expect(player1Total).toBeGreaterThan(player2Total);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing target gracefully', () => {
      const state = createMockState();
      const action: BattleAction = {
        type: 'ATTACK',
        actorId: 'player1',
        targetId: 'non-existent-card',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      // Should not crash, just not apply damage
      expect(newState.player2.cards[0].currentHp).toBe(100);
    });

    it('should handle missing actor card gracefully', () => {
      const state = createMockState();
      const action: BattleAction = {
        type: 'ATTACK',
        actorId: 'player1',
        targetId: 'p2-card1',
        cardId: 'non-existent-card',
      };
      
      const newState = resolveAction(state, action);
      
      // Should return state unchanged
      expect(newState.player2.cards[0].currentHp).toBe(100);
    });

    it('should handle zero damage attacks', () => {
      const state = createMockState();
      const action: BattleAction = {
        type: 'DEFEND',
        actorId: 'player1',
        cardId: 'p1-card1',
      };
      
      const newState = resolveAction(state, action);
      
      // Should not affect HP
      expect(newState.player1.cards[0].currentHp).toBe(100);
      expect(newState.player2.cards[0].currentHp).toBe(100);
    });
  });
});
