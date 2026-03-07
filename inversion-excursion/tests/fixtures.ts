/**
 * Test fixtures for The Inversion Excursion
 * Provides mock data for consistent testing
 */

import type { Card, CardTier, Cell, CellMember, Player, Battle } from '@/types';

// ==================== CARD FIXTURES ====================

export const mockCards: Card[] = [
  {
    id: 'card-1',
    name: 'CITATION REQUIRED',
    tier: 'physical',
    artUrl: 'https://example.com/card1.png',
    frequency: 21.5, // Beta
    resonance: 75,
    harmonic: 0.8,
    entropy: 0.3,
    synergy: 0.6,
    wyrdEtymology: {
      origin: 'Latin',
      evolution: ['citare', 'citation', 'cite'],
      meaning: 'To summon or call forth',
      quote: 'Your argument is valid but improperly formatted.',
    },
    abilities: [
      {
        id: 'defense-1',
        name: 'FRAGILITY',
        description: 'Next card you play costs +1 energy',
        cooldown: 0,
        power: 15,
      },
    ],
    flavorText: 'The first rule of academic combat: always cite your sources.',
  },
  {
    id: 'card-2',
    name: 'CLAY FIST',
    tier: 'physical',
    artUrl: 'https://example.com/card2.png',
    frequency: 2.5, // Delta
    resonance: 60,
    harmonic: 0.9,
    entropy: 0.1,
    synergy: 0.7,
    wyrdEtymology: {
      origin: 'Old English',
      evolution: ['clæg', 'clay', 'earth'],
      meaning: 'Earth that can be molded',
      quote: 'Earth remembers the shape of violence.',
    },
    abilities: [
      {
        id: 'attack-1',
        name: 'SLOW',
        description: 'Reduce your next card\'s speed by 1',
        cooldown: 0,
        power: 20,
      },
    ],
  },
  {
    id: 'card-3',
    name: 'INDEX OF FORBIDDEN KNOWLEDGE',
    tier: 'emotional',
    artUrl: 'https://example.com/card3.png',
    frequency: 10.5, // Alpha
    resonance: 85,
    harmonic: 0.7,
    entropy: 0.4,
    synergy: 0.8,
    wyrdEtymology: {
      origin: 'Latin',
      evolution: ['index', 'indicare', 'point out'],
      meaning: 'A sign or pointer',
      quote: 'To catalog is to control. To control is to contain.',
    },
    abilities: [
      {
        id: 'control-1',
        name: 'OBSESSION',
        description: 'Discard your highest-cost card',
        cooldown: 1,
        power: 18,
      },
    ],
  },
  {
    id: 'card-4',
    name: 'THE FINAL FOOTNOTE',
    tier: 'atomic',
    artUrl: 'https://example.com/card4.png',
    frequency: 65.0, // Gamma
    resonance: 95,
    harmonic: 0.95,
    entropy: 0.2,
    synergy: 0.9,
    wyrdEtymology: {
      origin: 'Old English',
      evolution: ['fot', 'note', 'footnote'],
      meaning: 'A note at the foot of the page',
      quote: 'Even endings require proper attribution.',
    },
    abilities: [
      {
        id: 'attack-scaling',
        name: 'EXHAUSTION',
        description: 'Skip your next draw phase',
        cooldown: 2,
        power: 40,
      },
    ],
  },
  {
    id: 'card-5',
    name: 'PHILOSOPHER\'S STONE',
    tier: 'atomic',
    artUrl: 'https://example.com/card5.png',
    frequency: 432.0, // 432Hz
    resonance: 100,
    harmonic: 1.0,
    entropy: 0.0,
    synergy: 1.0,
    wyrdEtymology: {
      origin: 'Greek',
      evolution: ['philosophia', 'stone', 'transmutation'],
      meaning: 'The substance that turns base metal to gold',
      quote: 'Nothing is created, nothing destroyed. Only rearranged.',
    },
    abilities: [
      {
        id: 'conversion-1',
        name: 'EQUIVALENCE',
        description: 'Opponent gains half that amount as shield',
        cooldown: 3,
        power: 50,
      },
    ],
  },
];

// ==================== CELL FIXTURES ====================

export const mockCell: Cell = {
  id: 'cell-1',
  name: 'Test Cell',
  inviteCode: 'TEST123',
  leaderId: 'player-1',
  members: [],
  maxMembers: 5,
  sharedField: {
    combinedFrequency: 10.5,
    fieldStrength: 75,
    activeEffects: [],
    stability: 0.8,
  },
  createdAt: new Date('2024-01-01'),
};

export const mockCellMembers: CellMember[] = [
  {
    id: 'member-1',
    displayName: 'Player One',
    avatarUrl: 'https://example.com/avatar1.png',
    deckResonance: 85,
    status: 'online',
    lastActive: new Date(),
    currentDeck: [mockCards[0], mockCards[1]],
  },
  {
    id: 'member-2',
    displayName: 'Player Two',
    avatarUrl: 'https://example.com/avatar2.png',
    deckResonance: 70,
    status: 'in_battle',
    lastActive: new Date(),
    currentDeck: [mockCards[2], mockCards[3]],
  },
];

// ==================== PLAYER FIXTURES ====================

export const mockPlayers: Player[] = [
  {
    id: 'player-1',
    fid: 12345,
    displayName: 'Test Player 1',
    avatarUrl: 'https://example.com/avatar1.png',
    address: '0x1234567890123456789012345678901234567890',
    reputation: 100,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'player-2',
    fid: 67890,
    displayName: 'Test Player 2',
    avatarUrl: 'https://example.com/avatar2.png',
    address: '0x0987654321098765432109876543210987654321',
    reputation: 150,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date(),
  },
];

// ==================== BATTLE FIXTURES ====================

export const mockBattle: Battle = {
  id: 'battle-1',
  phase: 'player_turn',
  currentPlayerIndex: 0,
  turnNumber: 1,
  resonanceMeter: 50,
  isResonanceReady: false,
  enemy: {
    id: 'enemy-1',
    name: 'The Pedant',
    maxHealth: 100,
    currentHealth: 100,
    intention: {
      type: 'attack',
      power: 15,
      warning: true,
      description: 'The Pedant prepares a devastating citation.',
    },
    phase: 1,
    avatarUrl: 'https://example.com/pedant.png',
    resistances: { physical: 0.8, emotional: 1.0, atomic: 1.2 },
    weaknesses: { physical: 1.0, emotional: 0.8, atomic: 0.9 },
  },
  players: [
    {
      id: 'player-1',
      displayName: 'Test Player',
      avatarUrl: 'https://example.com/avatar.png',
      hand: [mockCards[0], mockCards[1]],
      maxHandSize: 5,
      isActive: true,
      statusEffects: [],
    },
  ],
  field: [],
};

// ==================== FREQUENCY FIXTURES ====================

export const frequencyPresets = {
  delta: { hz: 2.5, range: '0.5-4Hz', name: 'Delta' },
  theta: { hz: 6.0, range: '4-8Hz', name: 'Theta' },
  alpha: { hz: 10.5, range: '8-13Hz', name: 'Alpha' },
  beta: { hz: 21.5, range: '13-30Hz', name: 'Beta' },
  gamma: { hz: 65.0, range: '30-100Hz', name: 'Gamma' },
  schumann: { hz: 7.83, range: '7.83Hz', name: 'Schumann' },
  hz432: { hz: 432.0, range: '432Hz', name: '432Hz' },
};

// ==================== HELPER FUNCTIONS ====================

export function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    ...mockCards[0],
    id: `card-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides,
  };
}

export function createMockCell(overrides: Partial<Cell> = {}): Cell {
  return {
    ...mockCell,
    id: `cell-${Math.random().toString(36).substring(2, 9)}`,
    inviteCode: `CODE${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    ...overrides,
  };
}

export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    ...mockPlayers[0],
    id: `player-${Math.random().toString(36).substring(2, 9)}`,
    fid: Math.floor(Math.random() * 100000),
    ...overrides,
  };
}
