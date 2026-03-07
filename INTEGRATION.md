# SynSync Dungeon - Integration Guide

## Architecture Overview

This Next.js application integrates multiple systems:
- **SynSync Audio Engine** - Web Audio API for binaural beats
- **Zora Protocol** - NFT minting on Base
- **Farcaster** - Social authentication
- **Dungeon AI** - Battle narrative generation

## State Management (Zustand)

### Stores

```typescript
// Player's deck management
useDeckStore()
  - cards: Card[]              // All owned cards
  - selectedDeck: Card[]       // Cards for battle
  - selectCard(), deselectCard()

// Cell formation
useCellStore()
  - currentCell: Cell | null   // Active cell
  - connectedCells: Cell[]     // All joined cells
  - formationPower: number

// Battle state
useBattleStore()
  - isActive, playerHealth, opponentHealth
  - currentTurn, battleLog, victory
  - setDungeonResponse()       // AI narrative

// SynSync audio
useSynSyncStore()
  - frequency, targetFrequency
  - currentEntrainment, targetEntrainment
  - isPlaying, volume

// Authentication
useAuthStore()
  - isAuthenticated, fid, username
  - login(), logout()
```

## Custom Hooks Integration

### useSynSync()
```typescript
const synSync = useSynSync()

// Start binaural beats
synSync.play(432, 10)  // 432Hz base, 10Hz entrainment

// Real-time frequency update
synSync.updateFrequency(528)

// Get current brainwave band
const band = synSync.getBrainwaveBand(10)  // 'alpha'
```

### useCardFrequency()
```typescript
// Syncs card with SynSync engine
const freq = useCardFrequency(card.frequency, card.entrainmentTarget)

freq.isInSync      // True when frequencies align
freq.syncBonus     // 0-20% damage/healing bonus
freq.activateCardFrequency()  // Play card's resonance
```

### useBattle()
```typescript
const battle = useBattle(battleId)

// Initialize battle
battle.initBattle('ai-dungeon-master')

// Play card (calls Dungeon AI)
battle.playCard(card, target)

// Access state
battle.playerHealth, battle.battleLog
battle.dungeonResponse  // AI narrative
```

### useCell()
```typescript
const cell = useCell()

// Create/join cells
cell.createCell('My Cell', 'triangle')
cell.joinCell(cellId, inviteCode)
```

## Component Integration

### Card + SynSync
```tsx
// Card.tsx displays frequency sync status
<Card 
  card={card}
  showFrequency={true}  // Shows Hz + brainwave band
/>

// Visual indicator when in sync:
// - Glow effect
// - "+20% Sync" badge
// - Green frequency display
```

### BattleInterface + Dungeon AI
```tsx
// BattleInterface connects to API
// On card play:
POST /api/battle/action
{
  action: { type, cardId, value },
  battleState: { playerHealth, opponentHealth },
  playerDeck: Card[]
}

// Response:
{
  narrative: "Your Solar Flare pierces...",
  enemyAction: { type, value, description },
  battleEffects: { playerHealthDelta, enemyHealthDelta }
}
```

### VictoryModal + Zora
```tsx
// On victory:
POST /api/mint/victory
{
  victory: true,
  deck: playerDeck,
  timestamp
}

// Returns mint transaction data
// User signs via RainbowKit/wagmi
```

### FarcasterAuth + Global State
```tsx
// Sign in with Farcaster
<SignInButton onSuccess={({ fid, username }) => {
  authStore.login({ fid, username, ... })
}}/>

// Auth state available globally
const { isAuthenticated, fid } = useAuthStore()
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/battle/action` | POST | Process turn, call Dungeon AI |
| `/api/mint/victory` | POST | Prepare Zora mint transaction |
| `/api/cell` | POST | Create cell |
| `/api/cell` | GET | Get cell by ID |
| `/api/cell` | PUT | Join cell |
| `/api/cell` | DELETE | Leave cell |

## Environment Variables

```bash
# Required
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_WC_PROJECT_ID=    # WalletConnect
NEXT_PUBLIC_FARCASTER_DOMAIN=sinsync.fun

# Zora (Base mainnet)
NEXT_PUBLIC_ZORA_PROTOCOL_REWARDS=0x7777777F22aB542ce6A16c25EbA1028C5314E58B
NEXT_PUBLIC_ZORA_ERC1155_FACTORY=0x777777C338d93e2C7adf08D102d45CA7CC4Ed021

# Optional (AI)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Data Flow

```
User Action → Component → Hook → Store → API → External Service
                                           ↓
                                  Zora/Farcaster/OpenAI
                                           ↓
                                  Response → Store → UI Update

Examples:
1. Play Card → useBattle.playCard() → POST /api/battle/action
   → Dungeon AI → narrative → battleStore.setDungeonResponse()
   → BattleInterface displays narrative

2. Victory → VictoryModal → POST /api/mint/victory
   → Generate metadata → Return mint calldata
   → User signs → Zora contract → NFT minted

3. Card Click → useCardFrequency.activateCardFrequency()
   → useSynSync.play(card.frequency, card.entrainmentTarget)
   → Web Audio API → Binaural beats playing
```

## Key Integrations

### SynSync Audio ↔ Card System
- Each card has `frequency` (Hz) and `entrainmentTarget` (brainwave Hz)
- Cards glow when audio matches their frequency
- Sync bonus applies to damage/healing

### Dungeon AI ↔ Battle State
- AI generates narrative based on action type
- AI selects enemy response
- Battle effects applied to state

### Zora ↔ VictoryModal
- Victory NFTs with card composition metadata
- IPFS metadata generation
- ERC1155 minting on Base

### Farcaster ↔ Auth
- Sign in with Farcaster for social identity
- FID used for cell membership
- Username displayed throughout UI

## Extension Points

1. **New Card Elements**: Add to `ELEMENT_ICONS` and `ELEMENT_COLORS` in Card.tsx
2. **New Formations**: Add to `FORMATIONS` array and `FORMATION_BONUSES` in constants
3. **New AI Providers**: Extend `generateDungeonNarrative()` in battle/action route
4. **Custom Minting**: Modify metadata generation in mint/victory route
