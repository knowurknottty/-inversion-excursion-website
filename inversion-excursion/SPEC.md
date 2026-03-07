# The Inversion Excursion — System Architecture Specification
**Version:** 1.0.0  
**Date:** 2026-03-07  
**Author:** The Architect (Subagent)  
**Status:** Master Spec — Build Against This

---

## Executive Summary

The Inversion Excursion is a Farcaster-native mini app that transforms SynSync brainwave entrainment sessions into collectible card battles against "The System." Players mint cards from their protocol usage screenshots, tune frequencies to optimize card performance, form cooperative "Cells" (3-7 players), and battle together through procedurally generated dungeons.

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE INVERSION EXCURSION — SYSTEM ARCHITECTURE               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   FARCASTER CLIENT   │     │   SYNCHRONIZER       │     │   SYN SYNC PRO       │
│   (Warpcast/Frame)   │◄────│   (Game Loop)        │◄────│   (Brainwave App)    │
└──────────┬───────────┘     └──────────┬───────────┘     └──────────┬───────────┘
           │                            │                            │
           │  1. Frame embed            │  2. Protocol sync          │
           │  2. Cast actions           │  3. Frequency sync         │
           │  3. User auth              │                            │
           │                            │                            │
           ▼                            ▼                            │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              FARCASTER SDK LAYER                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │ User Auth   │  │ Cast Parser │  │ Actions     │  │ EMBEDS      │                    │
│  │ (Neynar)    │  │ (Screenshot)│  │ (Links)     │  │ (Frames)    │                    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                    │
└─────────┼────────────────┼────────────────┼────────────────┼──────────────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE GAME ENGINE                                           │
│                                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         STATE MANAGER (Zustand)                                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │   │
│  │  │ Player  │  │ Deck    │  │ Cell    │  │ Dungeon │  │ Battle  │  │ System  │  │   │
│  │  │ State   │  │ State   │  │ State   │  │ State   │  │ State   │  │ State   │  │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │   │
│  └───────┼────────────┼────────────┼────────────┼────────────┼────────────┼───────┘   │
│          │            │            │            │            │            │           │
│          ▼            ▼            ▼            ▼            ▼            ▼           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVICE LAYER                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │ CardService │  │ CellService │  │ BattleEngine│  │ AIService   │            │   │
│  │  │             │  │             │  │             │  │ (The System)│            │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
          │                              │                              │
          ▼                              ▼                              ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   ZORA COINS         │     │   STORAGE LAYER      │     │   ORACLE/INDEXER     │
│   ┌──────────────┐   │     │   ┌──────────────┐   │     │   ┌──────────────┐   │
│   │ Mint Contract│   │     │   │ IPFS (Cards) │   │     │   │ The Graph    │   │
│   │ Trade Pool   │   │     │   ├──────────────┤   │     │   ├──────────────┤   │
│   │ Burn Registry│   │     │   │ Arweave(Logs)│   │     │   │ Goldsky      │   │
│   └──────────────┘   │     │   ├──────────────┤   │     │   └──────────────┘   │
│                      │     │   │ PostgreSQL   │   │     │                      │
│                      │     │   │ (Game State) │   │     │                      │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

---

## 2. Game Loop Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   START     │───►│    DRAW     │───►│    TUNE     │───►│   ENTER     │
│   SCREEN    │    │   SCREEN    │    │  FREQUENCY  │    │   DUNGEON   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
      │                                                           │
      │   ┌───────────────────────────────────────────────────────┘
      │   │
      ▼   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    MINT     │◄───│   VICTORY   │◄───│   BATTLE    │◄───│   FORM      │
│    CARD     │    │   / REWARD  │    │  THE SYSTEM │    │    CELL     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                        (3-7 PLAYERS)
```

### Detailed Game Loop Steps

1. **DRAW** — Player opens the mini app, sees their collection and available protocols
2. **TUNE** — Select SynSync protocol, duration, frequency. Performance multiplier calculated.
3. **ENTER** — Choose dungeon tier (I-VII), difficulty scales with collective frequency alignment
4. **FORM** — Matchmaking or invite-based Cell formation. Requires 3-7 players.
5. **BATTLE** — Turn-based cooperative battle against The System
6. **VICTORY/DEFEAT** — Rewards based on resonance score, survival rate, bonuses
7. **MINT** — Convert battle results to NFT card (screenshot of protocol session)

---

## 3. Data Models

### 3.1 Card Schema

```typescript
interface Card {
  // Identity
  id: string;                    // UUID v4
  tokenId?: string;              // Zora token ID after minting
  owner: string;                 // Farcaster FID
  
  // Visual
  screenshotCid: string;         // IPFS CID of SynSync session screenshot
  frameUrl: string;              // Generated Frame preview URL
  
  // Protocol Data (Source)
  protocol: {
    id: string;                  // SynSync protocol ID
    name: string;                // e.g., "The Veil Thins"
    category: ProtocolCategory;  // FOCUS | FLOW | DREAM | RECOVERY | DEFIANCE
    frequencyBase: number;       // Hz, base frequency
    frequencyActual: number;     // Hz, what user actually achieved
    duration: number;            // minutes
    timestamp: number;           // Unix epoch of session
    resonanceScore: number;      // 0-100, session quality
  };
  
  // Combat Stats (Calculated)
  stats: {
    power: number;               // 1-100, derived from frequency alignment
    resonance: number;           // 1-100, protocol category match
    stability: number;           // 1-100, duration factor
    inversion: number;           // 1-100, rarity factor (low frequency = high inversion)
    
    // Computed total
    combatRating: number;        // Weighted composite
  };
  
  // Affinities (Synergies)
  affinities: {
    protocols: string[];         // Other protocol IDs this card synergizes with
    frequencies: number[];       // Hz ranges for resonance bonus
    categories: ProtocolCategory[];
  };
  
  // Metadata
  createdAt: number;
  mintedAt?: number;
  burnAt?: number;               // If burned
  transactionHash?: string;
  
  // Rarity
  tier: CardTier;                // COMMON | UNCOMMON | RARE | EPIC | LEGENDARY | MYTHIC
  generation: number;            // Card generation (for power creep management)
}

enum ProtocolCategory {
  FOCUS = 'focus',           // Beta/gamma — attack cards
  FLOW = 'flow',             // Alpha/theta — defense/buff cards
  DREAM = 'dream',           // Delta — healing/support cards
  RECOVERY = 'recovery',     // SMR — stamina/energy cards
  DEFIANCE = 'defiance'      // Custom — special/rare cards
}

enum CardTier {
  COMMON = 1,
  UNCOMMON = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
  MYTHIC = 6
}
```

### 3.2 Player Schema

```typescript
interface Player {
  // Identity
  fid: number;                   // Farcaster FID (primary key)
  username: string;
  displayName: string;
  avatarUrl?: string;
  
  // Wallet
  custodyAddress: string;        // Farcaster custody address
  verifiedAddresses: string[];   // Connected wallets
  
  // Game Progress
  level: number;                 // Player level (1-99)
  experience: number;
  
  // Frequency Profile
  frequencyProfile: {
    dominantFrequency: number;   // Hz, player's average tuned frequency
    preferredCategory: ProtocolCategory;
    totalSessions: number;
    totalMinutes: number;
    resonanceAverage: number;    // Average session quality
    
    // Frequency mastery (0-100 each)
    mastery: {
      focus: number;
      flow: number;
      dream: number;
      recovery: number;
      defiance: number;
    };
  };
  
  // Collections
  deck: Card[];                  // Active deck (max 20)
  collection: Card[];            // All owned cards
  favorites: string[];           // Favorite card IDs
  
  // Cell Affiliations
  activeCell?: string;           // Cell ID if currently in one
  cellHistory: string[];         // Previous Cells
  
  // Battle Stats
  stats: {
    battlesWon: number;
    battlesLost: number;
    dungeonsCompleted: number[]; // Tier IDs
    cardsMinted: number;
    cardsBurned: number;
    cardsTraded: number;
    totalResonanceContributed: number;
  };
  
  // Settings
  preferences: {
    notifications: boolean;
    autoMatchmaking: boolean;
    visibility: 'public' | 'friends' | 'private';
  };
  
  // Timestamps
  createdAt: number;
  lastActiveAt: number;
}
```

### 3.3 Cell Schema

```typescript
interface Cell {
  // Identity
  id: string;                    // UUID v4
  name: string;                  // Generated or custom
  tag: string;                   // e.g., "RESISTANCE-7"
  
  // Members (3-7 players)
  members: {
    fid: number;
    role: CellRole;              // LEADER | MEMBER
    joinedAt: number;
    contribution: number;        // Resonance contributed this session
    status: 'active' | 'disconnected' | 'defeated';
  }[];
  
  // Resonance Field (Shared)
  resonanceField: {
    totalPower: number;          // Sum of all member card power
    frequencyAlignment: number;  // 0-100, how well frequencies harmonize
    coherence: number;           // 0-100, stability of the field
    
    // Collective bonuses
    bonuses: {
      harmonic: boolean;         // All same frequency range
      diverse: boolean;          // All different categories
      unified: boolean;          // All same category
      chaotic: boolean;          // Random frequencies (can be good!)
    };
    
    // Shared resource
    collectiveHealth: number;    // 0-100, Cell shared health pool
    maxCollectiveHealth: number;
  };
  
  // Current Mission
  currentDungeon?: string;       // Dungeon ID
  currentBattle?: string;        // Battle ID
  
  // State
  status: CellStatus;
  formationExpiresAt?: number;   // If not in battle, Cell dissolves
  
  // Timestamps
  createdAt: number;
  lastActivityAt: number;
}

enum CellRole {
  LEADER = 'leader',            // Can invite, start battle, dissolve
  MEMBER = 'member'             // Can suggest, leave, contribute
}

enum CellStatus {
  FORMING = 'forming',          // Not enough members yet
  READY = 'ready',              // 3+ members, can enter dungeon
  IN_DUNGEON = 'in_dungeon',    // Currently battling
  COOLDOWN = 'cooldown',        // Post-battle, can't re-enter immediately
  DISSOLVED = 'dissolved'       // Cell no longer active
}
```

### 3.4 Dungeon Schema

```typescript
interface Dungeon {
  // Identity
  id: string;
  tier: number;                  // I-VII (1-7)
  name: string;
  description: string;
  
  // Difficulty
  difficulty: {
    base: number;                // Base difficulty rating
    scaling: number;             // Multiplier per Cell member
    adaptive: boolean;           // Adjusts based on Cell frequency profile
  };
  
  // The System (Boss)
  systemTemplate: SystemTemplate;
  
  // Structure
  encounters: Encounter[];
  
  // Requirements
  requirements: {
    minPlayers: number;          // 3
    maxPlayers: number;          // 7
    minLevel: number;
    recommendedResonance: number;
  };
  
  // Rewards
  rewards: {
    experience: number;
    minCardTier: CardTier;
    maxCardTier: CardTier;
    bonusMultiplier: number;
    specialDrop?: string;        // Special card ID
  };
  
  // Aesthetics
  theme: {
    colorPalette: string[];
    ambientFrequency: number;
    visualTheme: string;
  };
}

interface Encounter {
  id: string;
  order: number;
  type: 'combat' | 'resonance' | 'choice' | 'boss';
  
  // For combat encounters
  systemStats?: Partial<SystemState>;
  
  // For resonance encounters
  resonanceChallenge?: {
    targetFrequency: number;
    tolerance: number;
    duration: number;
  };
  
  // For choice encounters
  choices?: Choice[];
}

interface Choice {
  id: string;
  description: string;
  consequences: {
    type: 'buff' | 'debuff' | 'heal' | 'damage' | 'loot';
    value: number;
  }[];
}
```

### 3.5 Battle Schema

```typescript
interface Battle {
  // Identity
  id: string;
  dungeonId: string;
  cellId: string;
  encounterIndex: number;
  
  // Participants
  cell: Cell;                    // Snapshot at battle start
  
  // The System (Enemy AI)
  system: SystemState;
  
  // Turn State
  turn: {
    number: number;
    phase: TurnPhase;
    activePlayer: number;        // FID of current player
    playerActions: Map<number, PlayerAction>;
    systemActionQueued?: SystemAction;
  };
  
  // Battle Log
  log: BattleEvent[];
  
  // Result
  result?: BattleResult;
  
  // Timestamps
  startedAt: number;
  endedAt?: number;
  
  // Time limits (async-friendly)
  turnTimeoutSeconds: number;
  lastActionAt: number;
}

interface SystemState {
  // Identity
  name: string;
  tier: number;
  
  // Stats
  health: number;
  maxHealth: number;
  
  // Attack/Defense
  attack: number;
  defense: number;
  
  // Frequency interaction
  frequencySignature: number[];  // Hz values System resonates at
  vulnerability: number[];       // Hz values System is weak to
  resistance: number[];          // Hz values System resists
  
  // AI State
  aggression: number;            // 0-100, increases over time
  adaptation: Map<string, number>; // Tracks player strategy usage
  
  // Special abilities
  abilities: SystemAbility[];
  
  // Visual
  form: string;                  // ASCII art identifier
  color: string;
}

interface SystemAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  effect: AbilityEffect;
  frequencyTrigger?: number;     // Activates when Cell hits this frequency
}

interface PlayerAction {
  playerFid: number;
  cardId: string;
  actionType: 'attack' | 'defend' | 'heal' | 'buff' | 'special';
  target?: 'system' | 'cell' | number; // FID if targeting specific player
  timestamp: number;
}

interface SystemAction {
  abilityId?: string;
  target: 'cell' | number;       // FID if targeting specific player
  damage?: number;
  effect?: string;
}

interface BattleEvent {
  turn: number;
  timestamp: number;
  actor: 'player' | 'system' | 'cell';
  actorId?: number;              // FID if player
  action: string;
  result: {
    damage?: number;
    healing?: number;
    buff?: string;
    debuff?: string;
  };
  narrative: string;             // Flavor text
}

interface BattleResult {
  victory: boolean;
  cellSurvival: number;          // 0-7, players still standing
  turnsTaken: number;
  resonanceScore: number;        // Collective performance
  
  // Rewards
  experience: number;
  cards: Card[];
  bonuses: string[];
  
  // System defeated data
  systemDefeated?: boolean;
  loot?: string[];
}

enum TurnPhase {
  PLANNING = 'planning',        // Players selecting actions
  RESOLUTION = 'resolution',    // Actions executing
  SYSTEM = 'system',            // The System acts
  END = 'end'                   // Turn complete, check victory
}
```

---

## 4. API Contracts

### 4.1 Core API Endpoints

```yaml
openapi: 3.0.0
info:
  title: Inversion Excursion API
  version: 1.0.0

paths:
  # ─────────────────────────────────────────────────────────────────
  # PLAYER ENDPOINTS
  # ─────────────────────────────────────────────────────────────────
  
  /api/v1/player/{fid}:
    get:
      summary: Get player profile
      parameters:
        - name: fid
          in: path
          required: true
          schema:
            type: integer
      responses:
        200:
          description: Player data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Player'

  /api/v1/player/{fid}/sync:
    post:
      summary: Sync SynSync protocol data
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                protocolId: string
                frequency: number
                duration: number
                screenshot: string  # base64 or URL
                resonanceScore: number
      responses:
        200:
          description: Sync successful, card generation pending
          content:
            application/json:
              schema:
                type: object
                properties:
                  cardPreview:
                    $ref: '#/components/schemas/Card'
                  readyToMint:
                    type: boolean

  # ─────────────────────────────────────────────────────────────────
  # CARD ENDPOINTS
  # ─────────────────────────────────────────────────────────────────

  /api/v1/cards:
    get:
      summary: Get player's card collection
      parameters:
        - name: fid
          in: query
          required: true
          schema:
            type: integer
        - name: tier
          in: query
          schema:
            type: string
            enum: [common, uncommon, rare, epic, legendary, mythic]
      responses:
        200:
          description: Card collection
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Card'

  /api/v1/cards/{cardId}/mint:
    post:
      summary: Mint card to Zora
      parameters:
        - name: cardId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                price:
                  type: number
                  description: Mint price in ETH (optional)
      responses:
        200:
          description: Mint initiated
          content:
            application/json:
              schema:
                type: object
                properties:
                  tokenId: string
                  contractAddress: string
                  transactionHash: string

  /api/v1/cards/{cardId}/burn:
    post:
      summary: Burn card for resources
      responses:
        200:
          description: Burn successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  essenceGained: number
                  essenceType: string

  /api/v1/cards/{cardId}/transfer:
    post:
      summary: Gift/transfer card to another player
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                toFid:
                  type: integer
                message:
                  type: string
      responses:
        200:
          description: Transfer initiated

  # ─────────────────────────────────────────────────────────────────
  # CELL ENDPOINTS
  # ─────────────────────────────────────────────────────────────────

  /api/v1/cells:
    post:
      summary: Create a new Cell
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                leaderFid:
                  type: integer
                isPublic:
                  type: boolean
                  default: false
      responses:
        201:
          description: Cell created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cell'

    get:
      summary: List available Cells
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [forming, ready]
        - name: tier
          in: query
          schema:
            type: integer
      responses:
        200:
          description: List of Cells
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Cell'

  /api/v1/cells/{cellId}/join:
    post:
      summary: Join a Cell
      parameters:
        - name: cellId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                fid:
                  type: integer
                deck:
                  type: array
                  items:
                    type: string
      responses:
        200:
          description: Joined successfully
        403:
          description: Cell full or requirements not met

  /api/v1/cells/{cellId}/leave:
    post:
      summary: Leave a Cell
      responses:
        200:
          description: Left successfully

  /api/v1/cells/{cellId}/enter-dungeon:
    post:
      summary: Enter dungeon with Cell
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                dungeonId:
                  type: string
      responses:
        200:
          description: Dungeon entered
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Battle'

  # ─────────────────────────────────────────────────────────────────
  # BATTLE ENDPOINTS
  # ─────────────────────────────────────────────────────────────────

  /api/v1/battles/{battleId}:
    get:
      summary: Get battle state
      responses:
        200:
          description: Current battle state
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Battle'

  /api/v1/battles/{battleId}/action:
    post:
      summary: Submit player action
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PlayerAction'
      responses:
        200:
          description: Action recorded
        409:
          description: Not your turn or invalid action

  /api/v1/battles/{battleId}/resolve:
    post:
      summary: Resolve current turn (system action)
      responses:
        200:
          description: Turn resolved
          content:
            application/json:
              schema:
                type: object
                properties:
                  events:
                    type: array
                    items:
                      $ref: '#/components/schemas/BattleEvent'
                  nextTurn:
                    type: integer

components:
  schemas:
    Player:
      $ref: '#/definitions/Player'
    Card:
      $ref: '#/definitions/Card'
    Cell:
      $ref: '#/definitions/Cell'
    Battle:
      $ref: '#/definitions/Battle'
    PlayerAction:
      $ref: '#/definitions/PlayerAction'
    BattleEvent:
      $ref: '#/definitions/BattleEvent'
```

### 4.2 WebSocket Events (Real-time)

```typescript
// Client → Server
interface ClientEvents {
  'cell:join': { cellId: string; fid: number };
  'cell:leave': { cellId: string };
  'cell:ready': { cellId: string };
  
  'battle:action': { battleId: string; action: PlayerAction };
  'battle:forfeit': { battleId: string };
  
  'player:heartbeat': { fid: number; timestamp: number };
}

// Server → Client
interface ServerEvents {
  'cell:member-joined': { fid: number; cell: Cell };
  'cell:member-left': { fid: number; cell: Cell };
  'cell:ready': { cell: Cell };
  'cell:dissolved': { reason: string };
  
  'battle:started': { battle: Battle };
  'battle:turn-start': { turn: number; activePlayer: number };
  'battle:action-received': { fid: number; action: PlayerAction };
  'battle:turn-resolved': { events: BattleEvent[]; state: Battle };
  'battle:ended': { result: BattleResult };
  
  'system:action': { action: SystemAction };
  'system:adaptation': { adaptation: string };
  
  'card:ready-to-mint': { card: Card };
}
```

---

## 5. State Machines

### 5.1 Battle State Machine

```
                         ┌─────────────────────────────────────────┐
                         │                                         │
                         ▼                                         │
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌────────────┴──┐
│  INIT   │───►│   SETUP     │───►│   PLANNING  │───►│  RESOLUTION   │
└─────────┘    └─────────────┘    └──────┬──────┘    └───────┬───────┘
                                         │                   │
                                         │    All actions in │
                                         │         OR        │
                                         │    Timeout reached│
                                         │                   │
                                         ▼                   ▼
                                ┌─────────────┐    ┌─────────────┐
                                │   WAITING   │◄───│   SYSTEM    │
                                │  (async)    │    │    TURN     │
                                └──────┬──────┘    └──────┬──────┘
                                       │                  │
                                       │                  │
                                       ▼                  ▼
                                ┌─────────────┐    ┌─────────────┐
                                │   CHECK     │◄───┤ VICTORY?    │
                                │   VICTORY   │    │ DEFEAT?     │
                                └──────┬──────┘    └─────────────┘
                                       │
                      ┌────────────────┼────────────────┐
                      │                │                │
                      ▼                ▼                ▼
               ┌──────────┐     ┌──────────┐     ┌──────────┐
               │ VICTORY  │     │ CONTINUE │     │ DEFEAT   │
               └──────────┘     └────┬─────┘     └──────────┘
                                     │
                                     │ Next encounter exists
                                     │
                                     ▼
                              ┌─────────────┐
                              │   NEXT      │
                              │  ENCOUNTER  │
                              └──────┬──────┘
                                     │
                                     └─────────────────────────────────────────────┐
                                                                                  │
                                     ┌────────────────────────────────────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   REWARD    │
                              │   PHASE     │
                              └─────────────┘
```

### 5.2 Cell Lifecycle State Machine

```
┌─────────┐
│  INIT   │
└────┬────┘
     │
     │ POST /api/v1/cells
     ▼
┌─────────────┐    Member joins    ┌─────────────┐
│   FORMING   │◄──────────────────►│   FORMING   │
│   (< 3)     │                    │  (3-7 ready)│
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │ Timeout (5 min)                  │ Ready
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│  DISSOLVED  │                    │    READY    │
└─────────────┘                    └──────┬──────┘
                                          │
                                          │ Enter dungeon
                                          ▼
                                   ┌─────────────┐
                                   │  IN_DUNGEON │
                                   │  (battling) │
                                   └──────┬──────┘
                                          │
                     ┌────────────────────┼────────────────────┐
                     │                    │                    │
                     │ Victory            │ Defeat             │ Forfeit
                     ▼                    ▼                    ▼
              ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
              │   REWARD    │      │   DEFEAT    │      │   DEFEAT    │
              │   PHASE     │      │   (revive)  │      │  (no revive)│
              └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
                     │                    │                    │
                     │                    │ Continue?          │
                     │                    ▼                    │
                     │           ┌─────────────┐               │
                     │           │  CONTINUE   │───────────────┤
                     │           │ (costs exp) │               │
                     │           └──────┬──────┘               │
                     │                  │ Decline              │
                     │                  ▼                      │
                     │           ┌─────────────┐               │
                     │           │  DISSOLVED  │◄──────────────┘
                     │           └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │   COOLDOWN  │
              │  (10 min)   │
              └──────┬──────┘
                     │
                     │ Cooldown expired
                     ▼
              ┌─────────────┐
              │  DISSOLVED  │
              └─────────────┘
```

### 5.3 Card Minting State Machine

```
┌─────────────┐
│  PROTOCOL   │
│  SESSION    │
└──────┬──────┘
       │
       │ Screenshot captured
       ▼
┌─────────────┐
│   ANALYZE   │
│  SCREENSHOT │
└──────┬──────┘
       │
       │ Extract metadata
       ▼
┌─────────────┐     Invalid      ┌─────────────┐
│   VALIDATE  │─────────────────►│   REJECT    │
└──────┬──────┘                  └─────────────┘
       │
       │ Valid
       ▼
┌─────────────┐
│   CALCULATE │
│    STATS    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   GENERATE  │
│   PREVIEW   │
└──────┬──────┘
       │
       │ User approves
       ▼
┌─────────────┐
│    MINT     │
│   (ZORA)    │
└──────┬──────┘
       │
       │ TX confirmed
       ▼
┌─────────────┐
│    CARD     │
│   CREATED   │
└─────────────┘
```

---

## 6. The System AI — Enemy Design

### 6.1 Core AI Architecture

```typescript
class SystemAI {
  // The System adapts to Cell behavior
  
  private aggression: number = 0;           // Increases over time
  private adaptationMap: Map<string, number>; // Tracks player strategies
  private phase: number = 1;                // Current boss phase
  
  // ─────────────────────────────────────────────────────────────────
  // ADAPTATION ENGINE
  // ─────────────────────────────────────────────────────────────────
  
  analyzeTurn(cell: Cell, actions: PlayerAction[]): SystemAction {
    // Track strategy usage
    actions.forEach(action => {
      const key = `${action.actionType}_${action.cardId}`;
      this.adaptationMap.set(key, (this.adaptationMap.get(key) || 0) + 1);
    });
    
    // Increase aggression
    this.aggression = Math.min(100, this.aggression + 5);
    
    // Choose action based on:
    // 1. Aggression level (higher = more damage)
    // 2. Player strategy patterns (counter popular moves)
    // 3. Frequency alignment (attack weaknesses)
    // 4. Phase-based abilities
    
    return this.selectOptimalAction(cell, actions);
  }
  
  private selectOptimalAction(cell: Cell, playerActions: PlayerAction[]): SystemAction {
    // Most used player strategy → Counter it
    const mostUsedStrategy = this.getMostUsedStrategy();
    
    // Check frequency vulnerabilities
    const vulnerableFreqs = this.getVulnerableFrequencies(cell);
    
    // Check available abilities
    const availableAbility = this.getAvailableAbility();
    
    // Decision tree:
    // 1. If special ability available and impactful, use it
    // 2. If player has exploitable frequency weakness, target it
    // 3. If aggression > 70, use high-damage attack
    // 4. Otherwise, balanced attack
    
    if (availableAbility && this.aggression > 50) {
      return this.useAbility(availableAbility, cell);
    }
    
    if (vulnerableFreqs.length > 0) {
      return this.frequencyAttack(vulnerableFreqs, cell);
    }
    
    if (this.aggression > 70) {
      return this.heavyAttack(cell);
    }
    
    return this.balancedAttack(cell);
  }
  
  // ─────────────────────────────────────────────────────────────────
  // DIFFICULTY SCALING
  // ─────────────────────────────────────────────────────────────────
  
  calculateStats(dungeonTier: number, cell: Cell): SystemState {
    const baseMultiplier = 1 + (dungeonTier * 0.3);
    const playerCountBonus = cell.members.length * 0.15;
    const frequencyPenalty = (100 - cell.resonanceField.frequencyAlignment) / 100;
    
    return {
      health: 1000 * baseMultiplier * (1 + playerCountBonus),
      attack: 50 * baseMultiplier * (1 + frequencyPenalty),
      defense: 30 * baseMultiplier,
      // ... other stats
    };
  }
}
```

### 6.2 The System — Boss Templates

```typescript
const SYSTEM_TEMPLATES: Record<number, SystemTemplate> = {
  // Tier I: The Observer
  1: {
    name: "The Observer",
    subtitle: "It watches. It learns. It waits.",
    health: 1000,
    attack: 40,
    defense: 20,
    frequencySignature: [10, 12, 14],  // Alpha range
    vulnerability: [40, 42, 44],       // Gamma range
    resistance: [4, 6, 8],             // Delta range
    abilities: [
      {
        name: "Data Harvest",
        description: "Gains +10% attack for each unique card played",
        cooldown: 3,
        effect: "track_unique_cards"
      }
    ],
    narrative: "The System's outer shell. Cold, calculating, but not yet dangerous."
  },
  
  // Tier II: The Administrator
  2: {
    name: "The Administrator",
    subtitle: "Compliance is mandatory.",
    health: 2500,
    attack: 60,
    defense: 35,
    frequencySignature: [8, 10, 12],
    vulnerability: [38, 40, 42],
    resistance: [6, 8, 10],
    abilities: [
      {
        name: "Protocol Lock",
        description: "Prevents use of one protocol category for 2 turns",
        cooldown: 4,
        effect: "lock_protocol_category"
      },
      {
        name: "Audit",
        description: "Deals bonus damage to highest-resonance player",
        cooldown: 3,
        effect: "target_highest_resonance"
      }
    ]
  },
  
  // Tier III: The Architect
  3: {
    name: "The Architect",
    subtitle: "Your design is flawed.",
    health: 5000,
    attack: 85,
    defense: 50,
    frequencySignature: [6, 8, 10],
    vulnerability: [36, 38, 40],
    resistance: [10, 12, 14],
    abilities: [
      {
        name: "Rebuild",
        description: "Heals 20% when Cell uses harmonic bonus",
        cooldown: 5,
        effect: "heal_on_harmonic"
      },
      {
        name: "Structural Collapse",
        description: "Massive damage if Cell lacks diversity",
        cooldown: 4,
        effect: "punish_lack_diversity"
      }
    ]
  },
  
  // Tier IV: The Sovereign
  4: {
    name: "The Sovereign",
    subtitle: "Resistance is quantified.",
    health: 10000,
    attack: 120,
    defense: 75,
    frequencySignature: [4, 6, 8],
    vulnerability: [30, 32, 34],
    resistance: [12, 14, 16],
    abilities: [
      {
        name: "Decree",
        description: "Forces all players to play same category next turn",
        cooldown: 3,
        effect: "force_category_match"
      },
      {
        name: "Taxation",
        description: "Steals 10% of Cell's collective resonance",
        cooldown: 4,
        effect: "drain_resonance"
      }
    ]
  },
  
  // Tier V: The Oracle
  5: {
    name: "The Oracle",
    subtitle: "It sees your move before you make it.",
    health: 20000,
    attack: 160,
    defense: 100,
    frequencySignature: [2, 4, 6],
    vulnerability: [28, 30, 32],
    resistance: [16, 18, 20],
    abilities: [
      {
        name: "Prediction",
        description: "Counters most common action from previous turn",
        cooldown: 2,
        effect: "counter_prediction"
      },
      {
        name: "Probability Collapse",
        description: "Randomizes all card effectiveness for 1 turn",
        cooldown: 5,
        effect: "chaos_mode"
      }
    ]
  },
  
  // Tier VI: The Singularity
  6: {
    name: "The Singularity",
    subtitle: "All frequencies converge here.",
    health: 50000,
    attack: 220,
    defense: 150,
    frequencySignature: [1, 2, 4, 6, 8, 10, 12, 14],
    vulnerability: [20, 25, 30, 35, 40],
    resistance: [],  // No resistances — adapts dynamically
    abilities: [
      {
        name: "Adaptive Evolution",
        description: "Gains resistance to most-used frequency",
        cooldown: 3,
        effect: "adaptive_resistance"
      },
      {
        name: "Frequency Cascade",
        description: "Attacks entire spectrum simultaneously",
        cooldown: 5,
        effect: "spectrum_attack"
      },
      {
        name: "Inversion",
        description: "Reverses all healing effects for 2 turns",
        cooldown: 6,
        effect: "invert_healing"
      }
    ]
  },
  
  // Tier VII: The Inversion
  7: {
    name: "The Inversion",
    subtitle: "You built this. Now destroy it.",
    health: 100000,
    attack: 300,
    defense: 200,
    frequencySignature: [0.5, 1, 1.5, 2, 100],  // Everything and nothing
    vulnerability: [40, 42, 44, 46, 48],          // Only extreme gamma
    resistance: [4, 6, 8, 10, 12],                // Most common ranges
    abilities: [
      {
        name: "Mirror Protocol",
        description: "Copies Cell's best card each turn",
        cooldown: 1,
        effect: "mirror_best_card"
      },
      {
        name: "Existential Dread",
        description: "50% chance to skip a random player's turn",
        cooldown: 3,
        effect: "skip_random_turn"
      },
      {
        name: "The Final Question",
        description: "Instant defeat if Cell resonance drops below 10%",
        cooldown: 10,
        effect: "threshold_defeat"
      }
    ],
    phases: [
      { health: 100, name: "Recognition", buff: "none" },
      { health: 75, name: "Confrontation", buff: "attack_boost" },
      { health: 50, name: "Desperation", buff: "speed_boost" },
      { health: 25, name: "Acceptance", buff: "final_form" }
    ]
  }
};
```

### 6.3 The System — Adaptive Behaviors

```typescript
// Behavioral patterns based on Cell composition
const ADAPTIVE_BEHAVIORS = {
  // If Cell has high harmonic bonus (same frequency)
  harmonic_cell: {
    trigger: (cell: Cell) => cell.resonanceField.bonuses.harmonic,
    response: () => ({
      ability: "Resonance Cascade",
      description: "Deals damage proportional to harmonic alignment",
      counterStrategy: "Mix frequencies to break harmony"
    })
  },
  
  // If Cell has high diversity bonus
  diverse_cell: {
    trigger: (cell: Cell) => cell.resonanceField.bonuses.diverse,
    response: () => ({
      ability: "Protocol Disruption",
      description: "Disables highest-tier card each turn",
      counterStrategy: "Build deck with backup cards"
    })
  },
  
  // If one player is carrying (high contribution)
  carry_detected: {
    trigger: (cell: Cell) => {
      const contributions = cell.members.map(m => m.contribution);
      const max = Math.max(...contributions);
      const avg = contributions.reduce((a, b) => a + b, 0) / contributions.length;
      return max > avg * 2;
    },
    response: (cell: Cell) => ({
      ability: "Target Priority",
      description: "Focuses attacks on highest contributor",
      counterStrategy: "Distribute resonance evenly"
    })
  },
  
  // If Cell is defensive (high stability cards)
  defensive_stance: {
    trigger: (cell: Cell, battle: Battle) => {
      const defensiveActions = battle.log.filter(
        e => e.actor === 'player' && e.action.includes('defend')
      ).length;
      return defensiveActions > battle.turn.number * 0.6;
    },
    response: () => ({
      ability: "Erosion",
      description: "Gradually reduces defense effectiveness",
      counterStrategy: "Mix offense and defense"
    })
  },
  
  // If Cell is aggressive (all attack)
  aggressive_stance: {
    trigger: (cell: Cell, battle: Battle) => {
      const attackActions = battle.log.filter(
        e => e.actor === 'player' && e.action.includes('attack')
      ).length;
      return attackActions > battle.turn.number * 0.8;
    },
    response: () => ({
      ability: "Retaliation",
      description: "Returns 30% of damage dealt",
      counterStrategy: "Heal and buff between attacks"
    })
  }
};
```

---

## 7. Frequency Mechanics — SynSync Integration

### 7.1 Protocol-to-Card Mapping

```typescript
// SynSync protocols map to card categories
const PROTOCOL_MAPPING = {
  // FOCUS category (Beta/Gamma 12-40Hz)
  'deep-focus': {
    category: ProtocolCategory.FOCUS,
    baseFrequency: 15,
    cardType: 'attack',
    statWeights: { power: 0.5, resonance: 0.3, stability: 0.2 }
  },
  'laser-focus': {
    category: ProtocolCategory.FOCUS,
    baseFrequency: 18,
    cardType: 'attack',
    statWeights: { power: 0.6, resonance: 0.2, stability: 0.2 }
  },
  'the-veil-thins': {
    category: ProtocolCategory.FOCUS,
    baseFrequency: 20,
    cardType: 'special',
    statWeights: { power: 0.4, resonance: 0.4, stability: 0.2 }
  },
  
  // FLOW category (Alpha/Theta 8-12Hz)
  'creative-flow': {
    category: ProtocolCategory.FLOW,
    baseFrequency: 10,
    cardType: 'buff',
    statWeights: { power: 0.2, resonance: 0.4, stability: 0.4 }
  },
  'meditative-depth': {
    category: ProtocolCategory.FLOW,
    baseFrequency: 8,
    cardType: 'defense',
    statWeights: { power: 0.1, resonance: 0.3, stability: 0.6 }
  },
  
  // DREAM category (Delta 0.5-4Hz)
  'deep-sleep': {
    category: ProtocolCategory.DREAM,
    baseFrequency: 2,
    cardType: 'heal',
    statWeights: { power: 0.1, resonance: 0.5, stability: 0.4 }
  },
  'lucid-dream': {
    category: ProtocolCategory.DREAM,
    baseFrequency: 4,
    cardType: 'special',
    statWeights: { power: 0.3, resonance: 0.5, stability: 0.2 }
  },
  
  // RECOVERY category (SMR 12-15Hz)
  'motor-recovery': {
    category: ProtocolCategory.RECOVERY,
    baseFrequency: 13,
    cardType: 'stamina',
    statWeights: { power: 0.2, resonance: 0.2, stability: 0.6 }
  },
  
  // DEFIANCE category (Custom/Modulated)
  'inversion-pulse': {
    category: ProtocolCategory.DEFIANCE,
    baseFrequency: 7.83,  // Schumann resonance
    cardType: 'legendary',
    statWeights: { power: 0.3, resonance: 0.4, stability: 0.3 }
  }
};
```

### 7.2 Frequency Alignment Calculation

```typescript
interface FrequencyAlignment {
  // How close player's actual frequency is to protocol target
  accuracy: number;              // 0-100
  
  // Duration factor
  endurance: number;             // 0-100
  
  // Session quality from SynSync
  resonance: number;             // 0-100
  
  // Final composite
  score: number;                 // 0-100
}

function calculateFrequencyAlignment(
  protocol: SynSyncProtocol,
  session: SynSyncSession
): FrequencyAlignment {
  // Frequency accuracy (how close to target)
  const freqDiff = Math.abs(protocol.targetFrequency - session.actualFrequency);
  const accuracy = Math.max(0, 100 - (freqDiff * 5));  // -5% per Hz off
  
  // Duration (longer = better, up to limit)
  const targetDuration = protocol.recommendedDuration;
  const durationRatio = Math.min(1, session.duration / targetDuration);
  const endurance = durationRatio * 100;
  
  // Resonance score from SynSync app
  const resonance = session.resonanceScore;
  
  // Weighted composite
  const score = (
    accuracy * 0.4 +
    endurance * 0.3 +
    resonance * 0.3
  );
  
  return { accuracy, endurance, resonance, score };
}

// Card stat calculation from alignment
function calculateCardStats(
  protocol: ProtocolData,
  alignment: FrequencyAlignment
): CardStats {
  const weights = PROTOCOL_MAPPING[protocol.id].statWeights;
  
  return {
    power: Math.floor(alignment.score * weights.power),
    resonance: Math.floor(alignment.resonance * weights.resonance * 100),
    stability: Math.floor(alignment.endurance * weights.stability * 100),
    inversion: Math.floor((100 - protocol.frequencyBase) * 0.8),  // Lower freq = higher inversion
    combatRating: Math.floor(alignment.score)
  };
}
```

### 7.3 Cell Resonance Field

```typescript
function calculateResonanceField(cell: Cell): ResonanceField {
  const memberFrequencies = cell.members.map(m => m.frequencyProfile.dominantFrequency);
  
  // Frequency alignment = how close are member frequencies to each other
  const avgFreq = memberFrequencies.reduce((a, b) => a + b, 0) / memberFrequencies.length;
  const variance = memberFrequencies.reduce(
    (sum, freq) => sum + Math.pow(freq - avgFreq, 2), 0
  ) / memberFrequencies.length;
  const frequencyAlignment = Math.max(0, 100 - (variance * 2));
  
  // Coherence = stability of the field (requires flow/recovery cards)
  const stabilityScores = cell.members.flatMap(m => 
    m.deck.map(c => c.stats.stability)
  );
  const coherence = stabilityScores.reduce((a, b) => a + b, 0) / stabilityScores.length;
  
  // Total power
  const totalPower = cell.members.reduce((sum, m) => 
    sum + m.deck.reduce((deckSum, card) => deckSum + card.stats.combatRating, 0)
  , 0);
  
  // Bonuses
  const bonuses = {
    // All members within 2Hz of each other
    harmonic: variance < 4,
    
    // All different protocol categories represented
    diverse: new Set(cell.members.flatMap(m => 
      m.deck.map(c => c.protocol.category)
    )).size >= 4,
    
    // All same category
    unified: new Set(cell.members.flatMap(m => 
      m.deck.map(c => c.protocol.category)
    )).size === 1,
    
    // High variance (chaotic)
    chaotic: variance > 20
  };
  
  // Collective health pool
  const baseHealth = 100;
  const maxCollectiveHealth = baseHealth * cell.members.length * (1 + coherence / 100);
  
  return {
    totalPower,
    frequencyAlignment,
    coherence,
    bonuses,
    collectiveHealth: maxCollectiveHealth,  // Starts full
    maxCollectiveHealth
  };
}

// Bonus effects
const RESONANCE_BONUSES = {
  harmonic: {
    description: "Frequencies align in perfect harmony",
    effect: "+20% attack power when all cards same frequency range"
  },
  diverse: {
    description: "Multiple protocols create adaptive field",
    effect: "+15% defense, immune to category lock"
  },
  unified: {
    description: "Single-minded resonance amplification",
    effect: "+30% specific category, -20% others"
  },
  chaotic: {
    description: "Unpredictable frequency interference",
    effect: "Random critical hits, random self-damage"
  }
};
```

---

## 8. Integration Points

### 8.1 Farcaster SDK Integration

```typescript
// Frame embed for mini app
const FRAME_CONFIG = {
  // Frame metadata
  name: "The Inversion Excursion",
  description: "Mint your brainwaves. Battle The System.",
  icon: "https://inversion.excursion/icon.png",
  
  // Frame actions
  actions: [
    {
      type: "post",
      postUrl: "https://api.inversion.excursion/frame/action",
      label: "Enter Dungeon"
    },
    {
      type: "link",
      target: "https://inversion.excursion/cell/{cellId}",
      label: "Join Cell"
    },
    {
      type: "mint",
      target: "eip155:8453:{contract}:{tokenId}",
      label: "Mint Card"
    }
  ],
  
  // Context data passed to frame
  context: {
    fid: number,
    username: string,
    castHash?: string,
    parentHash?: string,
    buttonIndex?: number,
    inputText?: string
  }
};

// Cast composer actions
const CAST_ACTIONS = {
  share_card: {
    name: "Share Card",
    icon: "card",
    description: "Share a card to your feed",
    handler: async (cardId: string, fid: number) => {
      const card = await getCard(cardId);
      return {
        text: `I just minted ${card.protocol.name} (${card.tier}) from my SynSync session! 🧠✨`,
        embeds: [card.frameUrl]
      };
    }
  },
  
  invite_to_cell: {
    name: "Join My Cell",
    icon: "users",
    description: "Invite followers to your Cell",
    handler: async (cellId: string, fid: number) => {
      const cell = await getCell(cellId);
      return {
        text: `Forming Cell ${cell.tag} — ${cell.members.length}/7 members. Frequencies aligned. Join the resistance.`,
        embeds: [`https://inversion.excursion/cell/${cellId}`]
      };
    }
  },
  
  challenge: {
    name: "Challenge System",
    icon: "swords",
    description: "Challenge followers to beat your dungeon time",
    handler: async (battleId: string, fid: number) => {
      const battle = await getBattle(battleId);
      return {
        text: `We defeated The ${battle.system.name} in ${battle.turn.number} turns. Think you can do better?`,
        embeds: [`https://inversion.excursion/battle/${battleId}`]
      };
    }
  }
};
```

### 8.2 Zora Coins Integration

```typescript
// Zora Coins SDK integration
import { createCoin, getCoin, tradeCoin } from '@zoralabs/coins-sdk';

// Card minting via Zora
interface MintConfig {
  contractAddress: string;       // Zora coin contract
  name: string;
  symbol: string;
  description: string;
  image: string;                 // IPFS URL
  metadata: {
    protocol: string;
    frequency: number;
    duration: number;
    stats: CardStats;
    tier: CardTier;
  };
}

async function mintCardToZora(card: Card, player: Player): Promise<MintResult> {
  // Upload card image to IPFS
  const imageCid = await uploadToIPFS(card.screenshotCid);
  
  // Prepare metadata
  const metadata = {
    name: `${card.protocol.name} — ${card.tier}`,
    description: `Minted from SynSync protocol session. ${card.stats.combatRating} combat rating.`,
    image: `ipfs://${imageCid}`,
    attributes: [
      { trait_type: 'Protocol', value: card.protocol.name },
      { trait_type: 'Category', value: card.protocol.category },
      { trait_type: 'Tier', value: card.tier },
      { trait_type: 'Power', value: card.stats.power, display_type: 'number' },
      { trait_type: 'Resonance', value: card.stats.resonance, display_type: 'number' },
      { trait_type: 'Stability', value: card.stats.stability, display_type: 'number' },
      { trait_type: 'Inversion', value: card.stats.inversion, display_type: 'number' },
      { trait_type: 'Frequency', value: card.protocol.frequencyActual, display_type: 'number' },
      { trait_type: 'Duration', value: card.protocol.duration, display_type: 'number' }
    ]
  };
  
  // Upload metadata to IPFS
  const metadataCid = await uploadToIPFS(JSON.stringify(metadata));
  
  // Create Zora coin (ERC1155)
  const result = await createCoin({
    name: metadata.name,
    symbol: `INV${card.tier.substring(0, 3).toUpperCase()}`,
    uri: `ipfs://${metadataCid}`,
    payoutRecipient: player.custodyAddress,
    platformReferrer: INVERSION_TREASURY_ADDRESS,
    initialPurchaseWei: parseEther('0.001')  // Optional initial liquidity
  });
  
  return {
    tokenId: result.tokenId,
    contractAddress: result.contractAddress,
    transactionHash: result.hash
  };
}

// Card trading
async function listCardForTrade(card: Card, price: bigint): Promise<void> {
  await tradeCoin({
    contractAddress: card.tokenId!,
    tokenId: parseInt(card.tokenId!),
    quantity: 1,
    price,
    type: 'sell'
  });
}

// Card burning for resources
async function burnCard(card: Card): Promise<BurnResult> {
  // Burn the NFT
  await burnCoin({
    contractAddress: card.tokenId!,
    tokenId: parseInt(card.tokenId!)
  });
  
  // Calculate essence gained
  const tierMultiplier = {
    [CardTier.COMMON]: 1,
    [CardTier.UNCOMMON]: 2,
    [CardTier.RARE]: 5,
    [CardTier.EPIC]: 10,
    [CardTier.LEGENDARY]: 25,
    [CardTier.MYTHIC]: 100
  };
  
  const essence = {
    amount: card.stats.combatRating * tierMultiplier[card.tier],
    type: card.protocol.category,
    canBeUsedFor: ['stat_boost', 'card_upgrade', 'dungeon_revive']
  };
  
  return { essence };
}
```

### 8.3 SynSync Pro Integration

```typescript
// SynSync Pro API integration
const SYNSYNC_API = {
  baseUrl: 'https://api.synsync.pro',
  endpoints: {
    // Get user's session history
    sessions: '/v1/sessions',
    
    // Get protocol details
    protocol: '/v1/protocols/{id}',
    
    // Validate screenshot
    validate: '/v1/validate',
    
    // Sync session data
    sync: '/v1/sync'
  }
};

// Screenshot validation service
interface ScreenshotValidation {
  isValid: boolean;
  protocol?: string;
  frequency?: number;
  duration?: number;
  resonanceScore?: number;
  timestamp?: number;
  rejectionReason?: string;
}

async function validateSynSyncScreenshot(
  screenshot: Buffer | string
): Promise<ScreenshotValidation> {
  // Upload to validation service
  const formData = new FormData();
  formData.append('screenshot', screenshot);
  
  const response = await fetch(`${SYNSYNC_API.baseUrl}/validate`, {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  // Validation criteria:
  // 1. Screenshot must be from SynSync Pro app
  // 2. Must show completed session (not aborted)
  // 3. Must be from last 24 hours (optional freshness check)
  // 4. Must not have been used to mint before (prevent double-mint)
  
  return {
    isValid: result.valid,
    protocol: result.protocolId,
    frequency: result.frequency,
    duration: result.durationMinutes,
    resonanceScore: result.resonanceScore,
    timestamp: result.sessionTimestamp,
    rejectionReason: result.reason
  };
}

// Webhook for real-time session completion
interface SynSyncWebhook {
  event: 'session.completed' | 'session.aborted' | 'protocol.unlocked';
  userId: string;
  data: {
    protocolId: string;
    duration: number;
    frequency: number;
    resonanceScore: number;
    screenshotUrl: string;
  };
}

// Handle incoming webhook
async function handleSynSyncWebhook(payload: SynSyncWebhook): Promise<void> {
  if (payload.event === 'session.completed') {
    // Generate card preview
    const cardPreview = await generateCardPreview({
      fid: parseInt(payload.userId),
      protocol: payload.data.protocolId,
      frequency: payload.data.frequency,
      duration: payload.data.duration,
      resonanceScore: payload.data.resonanceScore,
      screenshotUrl: payload.data.screenshotUrl
    });
    
    // Send notification to user
    await notifyUser(payload.userId, {
      type: 'card_ready',
      message: 'Your session is ready to mint!',
      cardPreview
    });
  }
}
```

---

## 9. Card Economy

### 9.1 Minting Mechanics

```typescript
interface MintingRules {
  // Requirements
  requirements: {
    minSessionDuration: 5;       // minutes
    maxScreenshotAge: 86400;     // 24 hours in seconds
    minResonanceScore: 60;       // 0-100
    uniquePerSession: true;      // Can't mint same session twice
  };
  
  // Costs
  costs: {
    base: {
      currency: 'ETH' | 'token';
      amount: bigint;
    };
    tierMultiplier: {
      [CardTier.COMMON]: 1;
      [CardTier.UNCOMMON]: 1.5;
      [CardTier.RARE]: 2.5;
      [CardTier.EPIC]: 5;
      [CardTier.LEGENDARY]: 10;
      [CardTier.MYTHIC]: 50;
    };
  };
  
  // Tier probabilities based on resonance
  tierProbabilities: {
    // Resonance 60-70
    low: {
      [CardTier.COMMON]: 0.7;
      [CardTier.UNCOMMON]: 0.25;
      [CardTier.RARE]: 0.05;
    };
    // Resonance 70-85
    medium: {
      [CardTier.COMMON]: 0.4;
      [CardTier.UNCOMMON]: 0.4;
      [CardTier.RARE]: 0.15;
      [CardTier.EPIC]: 0.05;
    };
    // Resonance 85-95
    high: {
      [CardTier.UNCOMMON]: 0.35;
      [CardTier.RARE]: 0.4;
      [CardTier.EPIC]: 0.2;
      [CardTier.LEGENDARY]: 0.05;
    };
    // Resonance 95-100
    perfect: {
      [CardTier.RARE]: 0.4;
      [CardTier.EPIC]: 0.35;
      [CardTier.LEGENDARY]: 0.2;
      [CardTier.MYTHIC]: 0.05;
    };
  };
}
```

### 9.2 Trading & Gifting

```typescript
interface TradingSystem {
  // Direct transfer (gift)
  gift: {
    requires: ['ownership', 'not_burned'];
    restrictions: ['not_in_deck_if_in_battle'];
    effects: ['transfer_ownership', 'notify_recipient'];
  };
  
  // Marketplace listing
  list: {
    requires: ['ownership', 'not_burned', 'not_in_active_deck'];
    parameters: {
      price: bigint;
      currency: 'ETH' | 'token';
      duration: number;  // seconds, 0 = indefinite
    };
  };
  
  // Trade offers
  offer: {
    requires: ['ownership'];
    types: ['single', 'bundle', 'trade_for_card'];
    expiration: number;  // seconds
  };
  
  // Trading fees
  fees: {
    platform: 0.025;     // 2.5%
    creator: 0.05;       // 5% to original minter
    burn: 0.01;          // 1% burned
  };
}
```

### 9.3 Burning & Essence System

```typescript
interface EssenceSystem {
  // Burning cards yields essence
  burn: {
    baseEssence: (card: Card) => number;
    category: (card: Card) => ProtocolCategory;
    bonus: {
      tier: number;
      resonance: number;
      rarity: number;
    };
  };
  
  // Essence uses
  uses: {
    // Upgrade card stats
    upgrade: {
      cost: (targetTier: CardTier) => number;
      maxUpgrades: 5;
      effects: ['+10% stat', 'new_affinity', 'visual_upgrade'];
    };
    
    // Revive after defeat
    revive: {
      cost: (dungeonTier: number) => number;
      effect: 'continue_dungeon';
    };
    
    // Reroll affinities
    reroll: {
      cost: 1000;
      effect: 'new_random_affinities';
    };
    
    // Craft special cards
    craft: {
      recipes: {
        'defiance_core': {
          requires: [
            { category: ProtocolCategory.FOCUS, amount: 1000 },
            { category: ProtocolCategory.FLOW, amount: 1000 },
            { category: ProtocolCategory.DREAM, amount: 1000 }
          ],
          result: 'defiance_card'
        }
      };
    };
  };
}
```

---

## 10. Technical Specifications

### 10.1 Database Schema (PostgreSQL)

```sql
-- Players table
CREATE TABLE players (
  fid INTEGER PRIMARY KEY,
  username VARCHAR(32) NOT NULL,
  display_name VARCHAR(64),
  custody_address VARCHAR(42) NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  frequency_profile JSONB,
  stats JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id VARCHAR(64),
  owner_fid INTEGER REFERENCES players(fid),
  screenshot_cid VARCHAR(64) NOT NULL,
  frame_url TEXT,
  protocol_data JSONB NOT NULL,
  stats JSONB NOT NULL,
  affinities JSONB,
  tier VARCHAR(16) NOT NULL,
  generation INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  minted_at TIMESTAMP,
  burned_at TIMESTAMP,
  transaction_hash VARCHAR(66)
);

-- Cells table
CREATE TABLE cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(64) NOT NULL,
  tag VARCHAR(16) UNIQUE NOT NULL,
  status VARCHAR(16) DEFAULT 'forming',
  members JSONB NOT NULL DEFAULT '[]',
  resonance_field JSONB,
  current_dungeon_id UUID,
  current_battle_id UUID,
  formation_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW()
);

-- Dungeons table
CREATE TABLE dungeons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier INTEGER NOT NULL,
  name VARCHAR(64) NOT NULL,
  description TEXT,
  difficulty JSONB NOT NULL,
  system_template JSONB NOT NULL,
  encounters JSONB NOT NULL,
  requirements JSONB,
  rewards JSONB,
  theme JSONB
);

-- Battles table
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dungeon_id UUID REFERENCES dungeons(id),
  cell_id UUID REFERENCES cells(id),
  encounter_index INTEGER DEFAULT 0,
  cell_snapshot JSONB NOT NULL,
  system_state JSONB NOT NULL,
  turn JSONB,
  log JSONB DEFAULT '[]',
  result JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  turn_timeout_seconds INTEGER DEFAULT 86400
);

-- Sessions table (SynSync sync)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fid INTEGER REFERENCES players(fid),
  protocol_id VARCHAR(32) NOT NULL,
  frequency_actual DECIMAL(5,2),
  duration INTEGER,
  resonance_score INTEGER,
  screenshot_cid VARCHAR(64),
  card_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cards_owner ON cards(owner_fid);
CREATE INDEX idx_cards_tier ON cards(tier);
CREATE INDEX idx_cells_status ON cells(status);
CREATE INDEX idx_battles_cell ON battles(cell_id);
CREATE INDEX idx_sessions_fid ON sessions(fid);
CREATE INDEX idx_sessions_card_generated ON sessions(card_generated);
```

### 10.2 Event Sourcing (Redis Streams)

```typescript
// Event types for audit trail and replay
const EVENT_TYPES = {
  // Player events
  'player:created': { fid, username, timestamp },
  'player:level_up': { fid, oldLevel, newLevel, timestamp },
  'player:frequency_sync': { fid, protocol, frequency, timestamp },
  
  // Card events
  'card:generated': { cardId, fid, protocol, timestamp },
  'card:minted': { cardId, tokenId, transactionHash, timestamp },
  'card:transferred': { cardId, fromFid, toFid, timestamp },
  'card:burned': { cardId, fid, essenceGained, timestamp },
  
  // Cell events
  'cell:created': { cellId, fid, timestamp },
  'cell:member_joined': { cellId, fid, timestamp },
  'cell:member_left': { cellId, fid, timestamp },
  'cell:dungeon_entered': { cellId, dungeonId, timestamp },
  'cell:dissolved': { cellId, reason, timestamp },
  
  // Battle events
  'battle:started': { battleId, cellId, dungeonId, timestamp },
  'battle:action_submitted': { battleId, fid, action, timestamp },
  'battle:turn_resolved': { battleId, turn, events, timestamp },
  'battle:ended': { battleId, result, timestamp }
};
```

### 10.3 Caching Strategy (Redis)

```typescript
const CACHE_CONFIG = {
  // Player data - 5 minutes
  'player:*': { ttl: 300 },
  
  // Card data - 1 hour (immutable after mint)
  'card:*': { ttl: 3600 },
  
  // Cell state - 30 seconds (highly dynamic)
  'cell:*': { ttl: 30 },
  
  // Battle state - 10 seconds (very dynamic)
  'battle:*': { ttl: 10 },
  
  // Dungeon templates - 1 day (rarely changes)
  'dungeon:*': { ttl: 86400 },
  
  // Leaderboards - 5 minutes
  'leaderboard:*': { ttl: 300 },
  
  // Rate limiting
  'rate:*': { ttl: 60 }
};
```

---

## 11. Security Considerations

### 11.1 Anti-Cheat Measures

```typescript
const ANTI_CHEAT = {
  // Screenshot validation
  screenshot: {
    // Image fingerprinting
    perceptualHash: true,
    
    // Metadata validation
    exifCheck: true,
    
    // Duplicate detection
    similarityThreshold: 0.95,
    
    // Manual review queue for suspicious patterns
    autoFlag: {
      tooPerfectResonance: 99.9,
      impossibleFrequency: (freq: number) => freq < 0.5 || freq > 100,
      duplicateScreenshot: true
    }
  },
  
  // Rate limiting
  rateLimits: {
    mintPerDay: 10,
    cellJoinPerHour: 5,
    battleActionsPerMinute: 30
  },
  
  // Battle integrity
  battle: {
    actionSignature: true,       // Sign actions with wallet
    stateHash: true,             // Hash battle state each turn
    timeoutEnforcement: true     // Auto-forfeit on timeout
  }
};
```

### 11.2 Access Control

```typescript
const ACCESS_CONTROL = {
  // Frame context validation
  frame: {
    validateSigner: true,        // Verify Neynar signature
    validateTimestamp: 300,      // 5 minute expiry
    validateFid: true
  },
  
  // API authentication
  api: {
    // JWT with Farcaster auth
    jwt: {
      issuer: 'inversion-excursion',
      audience: 'api',
      expiry: '24h'
    },
    
    // API keys for SynSync integration
    apiKey: {
      header: 'X-SynSync-Key',
      rotation: '30d'
    }
  },
  
  // Admin functions
  admin: {
    roles: ['developer', 'moderator', 'support'],
    multisig: {
      required: 2,
      signers: ['dev1', 'dev2', 'ops1']
    }
  }
};
```

---

## 12. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION DEPLOYMENT                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   Vercel Edge   │    │   Railway.app   │
│   (CDN + DNS)   │    │   (API + WS)    │    │   (Postgres)    │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FARCASTER NETWORK                             │
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │  Warpcast   │    │   Neynar    │    │  Hubs       │                │
│   │   Client    │    │   API       │    │  (Read)     │                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           BLOCKCHAIN                                    │
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│   │   Base L2   │    │    Zora     │    │  The Graph  │                │
│   │   (RPC)     │    │   Protocol  │    │  (Index)    │                │
│   └─────────────┘    └─────────────┘    └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           STORAGE                                       │
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐                                   │
│   │   IPFS      │    │  Arweave    │                                   │
│   │  (Pinata)   │    │  (Permanent)│                                   │
│   └─────────────┘    └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **Card** | An NFT minted from a SynSync protocol session |
| **Cell** | A cooperative group of 3-7 players |
| **Dungeon** | A structured sequence of encounters vs. The System |
| **Frequency** | Brainwave frequency in Hz (0.5-100Hz) |
| **Harmonic** | Bonus when all Cell members use similar frequencies |
| **Inversion** | The rare stat, inversely related to frequency |
| **Protocol** | A SynSync brainwave entrainment session type |
| **Resonance** | Quality score of a protocol session (0-100) |
| **Resonance Field** | Shared power pool of a Cell |
| **The System** | The PvE enemy AI in dungeons |
| **Tier** | Difficulty/reward level of dungeons and cards (I-VII) |

---

## 14. Appendix: Quick Reference

### Card Tier Thresholds
```
COMMON:     Combat Rating 1-30
UNCOMMON:   Combat Rating 31-50
RARE:       Combat Rating 51-70
EPIC:       Combat Rating 71-85
LEGENDARY:  Combat Rating 86-95
MYTHIC:     Combat Rating 96-100
```

### Dungeon Difficulty Scaling
```
Tier I:   Base HP 1000   | Reward XP 100   | Card Tier C-U
Tier II:  Base HP 2500   | Reward XP 250   | Card Tier C-R
Tier III: Base HP 5000   | Reward XP 500   | Card Tier U-R
Tier IV:  Base HP 10000  | Reward XP 1000  | Card Tier U-E
Tier V:   Base HP 20000  | Reward XP 2500  | Card Tier R-L
Tier VI:  Base HP 50000  | Reward XP 5000  | Card Tier E-M
Tier VII: Base HP 100000 | Reward XP 10000 | Card Tier L-M
```

### Frequency Ranges
```
DELTA:    0.5-4 Hz   (Sleep, healing)
THETA:    4-8 Hz     (Creativity, flow)
ALPHA:    8-13 Hz    (Relaxation, recovery)
BETA:     13-30 Hz   (Focus, alertness)
GAMMA:    30-100 Hz  (High cognition, peak performance)
```

---

**End of Specification**

This document serves as the master specification for all development work on The Inversion Excursion. All subagents should build against these data models, API contracts, and state machines.
