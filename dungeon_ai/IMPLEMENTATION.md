# THE SYSTEM - Implementation Guide

## File Structure

```
dungeon_ai/
├── THE_SYSTEM_AI.md      # Full architecture documentation
├── ALGORITHMS.md         # Pseudocode reference  
├── IMPLEMENTATION.md     # This file - integration guide
├── state_diagram.png     # Visual state machine (optional)
└── test_scenarios/       # Test cases
    ├── ivory_tower_tests.json
    ├── five_scrolls_tests.json
    ├── seven_dungeons_tests.json
    ├── shadow_archive_tests.json
    └── transmission_tests.json
```

---

## Core Classes Overview

```typescript
// Main AI Controller
class TheSystemAI {
    context: SystemContext;
    currentState: SystemState;
    dungeonAI: DungeonAI;
    adaptationEngine: AdaptationEngine;
    
    constructor(dungeonType: DungeonType, cell: Cell) {
        this.context = new SystemContext(dungeonType, cell);
        this.dungeonAI = this.createDungeonAI(dungeonType);
        this.adaptationEngine = new AdaptationEngine();
        this.currentState = SystemState.IDLE;
    }
    
    async takeTurn(roundState: RoundState): Promise<SystemAction[]> {
        // Main AI loop
        this.currentState = SystemState.ASSESS;
        this.assessThreats(roundState);
        
        this.currentState = SystemState.STRATEGIZE;
        const strategy = this.dungeonAI.selectStrategy(this.context);
        
        this.currentState = SystemState.EXECUTE;
        const actions = this.executeStrategy(strategy);
        
        this.currentState = SystemState.LEARN;
        this.adaptationEngine.recordTurn(this.context.cell, this.context.roundNumber);
        this.context.adaptationLevel = this.adaptationEngine.calculateAdaptation();
        
        this.currentState = SystemState.IDLE;
        return actions;
    }
}

// Base class for all dungeons
abstract class DungeonAI {
    abstract selectStrategy(context: SystemContext): Strategy;
    abstract executeAttackPattern(context: SystemContext): SystemAction[];
    abstract getSpecialAbility(roundNumber: number): Ability | null;
}

// Specific dungeon implementations
class IvoryTowerAI extends DungeonAI { /* ... */ }
class FiveScrollsAI extends DungeonAI { /* ... */ }
class SevenDungeonsAI extends DungeonAI { /* ... */ }
class ShadowArchiveAI extends DungeonAI { /* ... */ }
class TransmissionAI extends DungeonAI { /* ... */ }

// Adaptation system
class AdaptationEngine {
    memory: PatternMemory;
    
    recordTurn(cell: Cell, roundNumber: number): void;
    calculatePredictability(player: Player): number;
    predictNextAction(player: Player): Prediction;
    calculateAdaptation(): number;
}
```

---

## Game Engine Integration

```typescript
// Integration with your game engine

interface GameEngineHooks {
    // Called at dungeon start
    onDungeonStart(dungeonType: DungeonType, cell: Cell): void {
        this.systemAI = new TheSystemAI(dungeonType, cell);
        
        // Special initialization for Transmission
        if (dungeonType === 'TRANSMISSION') {
            this.loadPlayerNFTs(cell);
        }
    }
    
    // Called when System's turn begins
    async onSystemTurnStart(): Promise<void> {
        const roundState = this.captureRoundState();
        const actions = await this.systemAI.takeTurn(roundState);
        
        // Execute actions with visual effects
        for (const action of actions) {
            await this.executeAction(action);
            await this.wait(500); // Animation timing
        }
    }
    
    // Called whenever a player plays a card
    onPlayerCardPlayed(player: Player, card: Card): void {
        this.systemAI.adaptationEngine.recordCardPlay(player, card);
        
        // Shadow Archive special handling
        if (this.systemAI.dungeonAI instanceof ShadowArchiveAI) {
            this.systemAI.dungeonAI.addToMirrorDeck(card);
        }
    }
    
    // Check victory conditions
    checkVictoryConditions(): Outcome | null {
        return this.systemAI.checkVictory(this.context);
    }
}
```

---

## Blockchain Integration (Transmission Dungeon)

```typescript
// NFT/Card fetching for Transmission

interface BlockchainAdapter {
    async fetchRareCards(
        walletAddress: string, 
        minRarity: Rarity = 'EPIC'
    ): Promise<Card[]> {
        
        // Query your NFT contract
        const nfts = await this.nftContract.getTokensByOwner(walletAddress);
        
        // Filter by rarity
        const rareCards = nfts
            .filter(nft => this.parseRarity(nft.metadata) >= minRarity)
            .map(nft => ({
                tokenId: nft.tokenId,
                name: nft.metadata.name,
                rarity: this.parseRarity(nft.metadata),
                power: this.parsePower(nft.metadata),
                effects: this.parseEffects(nft.metadata),
                visual: nft.metadata.image
            }));
        
        return rareCards;
    }
    
    // Parse rarity from metadata
    parseRarity(metadata: any): Rarity {
        const rarityMap: Record<string, Rarity> = {
            'common': Rarity.COMMON,
            'uncommon': Rarity.UNCOMMON,
            'rare': Rarity.RARE,
            'epic': Rarity.EPIC,
            'legendary': Rarity.LEGENDARY
        };
        return rarityMap[metadata.attributes.find((a: any) => 
            a.trait_type === 'Rarity')?.value?.toLowerCase()] || Rarity.COMMON;
    }
}
```

---

## Difficulty Configuration

```typescript
// Easy configuration tweaks

const DIFFICULTY_PRESETS = {
    // For testing/tutorials
    CASUAL: {
        baseHPMultiplier: 0.7,
        baseDamageMultiplier: 0.6,
        roundHPGrowth: 0.03,
        roundDamageGrowth: 0.04,
        maxAdaptation: 1.3
    },
    
    // Standard experience
    NORMAL: {
        baseHPMultiplier: 1.0,
        baseDamageMultiplier: 1.0,
        roundHPGrowth: 0.05,
        roundDamageGrowth: 0.08,
        maxAdaptation: 2.0
    },
    
    // Hardcore challenge
    NIGHTMARE: {
        baseHPMultiplier: 1.3,
        baseDamageMultiplier: 1.4,
        roundHPGrowth: 0.08,
        roundDamageGrowth: 0.12,
        maxAdaptation: 3.0
    }
};

// Apply at dungeon start
function setDifficulty(preset: keyof typeof DIFFICULTY_PRESETS) {
    const config = DIFFICULTY_PRESETS[preset];
    TheSystemAI.globalConfig = config;
}
```

---

## Test Scenarios

```typescript
// Key test cases for each dungeon

const TEST_SCENARIOS = {
    ivory_tower: [
        {
            name: "All High Intellect",
            setup: { players: 5, allIntellect: 4 },
            expected: "System takes humiliation damage, no credential failures"
        },
        {
            name: "Mixed Intellect",
            setup: { players: 5, intellects: [2, 3, 4, 2, 5] },
            expected: "Low intellect players fail checks, take bonus damage"
        },
        {
            name: "Scholar Card Counter",
            setup: { players: 3, hasScholarCard: true },
            expected: "Degree requirement check passes"
        }
    ],
    
    five_scrolls: [
        {
            name: "Earth Rotation",
            setup: { element: 'EARTH', playersHaveGolems: true },
            expected: "Golem cards deal 0 damage"
        },
        {
            name: "Water vs Flame",
            setup: { element: 'WATER', flameCardsPlayed: 3 },
            expected: "System heals 45 HP from flame attempts"
        },
        {
            name: "Element Rotation Trigger",
            setup: { elementRound: 4, cellSize: 3 },
            expected: "Element advances to next in cycle"
        }
    ],
    
    seven_dungeons: [
        {
            name: "Boss Transition",
            setup: { currentBoss: 0, bossHP: 0 },
            expected: "Boss 1 defeated, debuff applied, Boss 2 loaded"
        },
        {
            name: "Persistent Debuffs",
            setup: { defeatedBosses: 3 },
            expected: "3 permanent debuffs active on all players"
        }
    ],
    
    shadow_archive: [
        {
            name: "Mirror Accuracy",
            setup: { playerPlays: ['Fireball', 'Heal', 'Shield'] },
            expected: "System has shadow copies of all 3 cards"
        },
        {
            name: "Pattern Prediction",
            setup: { playerHistory: ['Attack', 'Attack', 'Attack'] },
            expected: "High predictability score, counter-strike prepared"
        }
    ],
    
    transmission: [
        {
            name: "Phase Transition",
            setup: { roundNumber: 4 },
            expected: "Phase 2 (Domination) active, card theft begins"
        },
        {
            name: "Ultimate Calculation",
            setup: { 
                phase: 3, 
                stolenCards: [
                    { rarity: 'EPIC', power: 50 },
                    { rarity: 'LEGENDARY', power: 100 }
                ]
            },
            expected: "Ultimate damage = 50 + (17 * 5) + (15 * 2) = 165"
        }
    ]
};
```

---

## Performance Budget

| Operation | Target Time | Notes |
|-----------|-------------|-------|
| Threat Assessment | <10ms | Simple stat comparison |
| Strategy Selection | <30ms | Limited to top 5 options |
| Pattern Prediction | <20ms | Cache recent calculations |
| Card Mirroring | <15ms | Shadow copy creation |
| NFT Fetching | <1000ms | Async, during loading |
| Total Turn Time | <100ms | Excluding animations |

---

## Error Handling

```typescript
// Graceful degradation

class SystemAIFailsafe {
    static handleError(error: Error, context: SystemContext): SystemAction[] {
        console.error('System AI Error:', error);
        
        // Fallback to basic attack
        return [{
            type: 'ATTACK',
            target: 'RANDOM_PLAYER',
            damage: 20 * context.roundNumber
        }];
    }
}

// Wrap AI turn
try {
    return await systemAI.takeTurn(roundState);
} catch (error) {
    return SystemAIFailsafe.handleError(error, systemAI.context);
}
```

---

## Deployment Checklist

- [ ] Core state machine implemented
- [ ] All 5 dungeon AIs implemented
- [ ] Difficulty scaling tested (3, 5, 7 players)
- [ ] Adaptation system records and learns
- [ ] Victory conditions checked each round
- [ ] Special abilities have visual effects
- [ ] Blockchain integration for Transmission (if applicable)
- [ ] Performance within budget (<100ms/turn)
- [ ] Error handling tested
- [ ] Balance tuned for fun factor
