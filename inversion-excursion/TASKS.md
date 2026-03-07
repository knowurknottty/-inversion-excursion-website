# The Inversion Excursion — Agent Task Breakdown

## Overview
This document breaks down the architecture into discrete tasks for swarm agents.

---

## Tier 2 Agent Assignments

### Agent: Frame Engineer
**Focus:** Farcaster Frame integration and UI

**Tasks:**
1. Create Frame manifest and metadata
2. Implement Frame action handlers
3. Build cast composer actions (share, invite, challenge)
4. Design Frame UI components (card display, battle view, cell lobby)
5. Implement Neynar authentication flow

**Outputs:**
- `/frames/manifest.json`
- `/frames/handlers/*.ts`
- `/frames/components/*.tsx`

**Depends on:** None

---

### Agent: Smart Contract Dev
**Focus:** Zora Coins integration and on-chain logic

**Tasks:**
1. Design ERC1155 card contract
2. Implement mint/burn/transfer functions
3. Set up Zora Coins trading pool integration
4. Create essence token contract (ERC20)
5. Implement upgrade mechanics on-chain

**Outputs:**
- `/contracts/CardNFT.sol`
- `/contracts/EssenceToken.sol`
- `/contracts/CardUpgrade.sol`

**Depends on:** None (read-only reference to Card schema)

---

### Agent: Battle Engine Dev
**Focus:** Turn-based battle system and The System AI

**Tasks:**
1. Implement battle state machine
2. Build turn resolution engine
3. Create The System AI decision trees
4. Implement frequency vulnerability system
5. Build battle log and event system
6. Create phase-based boss mechanics

**Outputs:**
- `/engine/battle.ts`
- `/engine/system-ai.ts`
- `/engine/turn-resolver.ts`
- `/engine/bosses/*.ts`

**Depends on:** Card schema, Player schema

---

### Agent: Backend Engineer
**Focus:** API, database, and real-time sync

**Tasks:**
1. Set up PostgreSQL schema
2. Implement REST API endpoints
3. Build WebSocket server for real-time
4. Create Redis caching layer
5. Implement event sourcing
6. Set up rate limiting and auth middleware

**Outputs:**
- `/api/**/*.ts`
- `/db/schema.sql`
- `/db/migrations/*.sql`
- `/realtime/websocket.ts`

**Depends on:** All data models from SPEC.md

---

### Agent: SynSync Integrator
**Focus:** SynSync Pro protocol integration

**Tasks:**
1. Implement screenshot validation service
2. Build protocol-to-card mapping
3. Create frequency alignment calculator
4. Set up webhook handler for session completion
5. Implement duplicate detection
6. Build resonance score verification

**Outputs:**
- `/synsync/validator.ts`
- `/synsync/mapping.ts`
- `/synsync/webhook.ts`
- `/synsync/calculator.ts`

**Depends on:** Card generation logic

---

### Agent: Frontend Dev
**Focus:** React/Next.js mini app UI

**Tasks:**
1. Build player dashboard
2. Create card collection viewer
3. Implement deck builder
4. Build Cell formation UI
5. Create battle interface
6. Design dungeon selector
7. Implement minting flow

**Outputs:**
- `/app/**/*.tsx`
- `/components/**/*.tsx`
- `/hooks/*.ts`

**Depends on:** API endpoints, Frame components

---

### Agent: Economy Designer
**Focus:** Card economy balancing

**Tasks:**
1. Implement tier probability system
2. Build essence calculation formulas
3. Create upgrade cost curves
4. Design trading fee structure
5. Balance dungeon rewards
6. Implement anti-inflation mechanisms

**Outputs:**
- `/economy/tiers.ts`
- `/economy/essence.ts`
- `/economy/rewards.ts`
- `/economy/balancing.ts`

**Depends on:** Card stats, Battle rewards

---

## Implementation Order

```
WEEK 1: Foundation
├── Smart Contract Dev (base contracts)
├── Backend Engineer (schema + basic API)
└── SynSync Integrator (validation)

WEEK 2: Core Systems
├── Battle Engine Dev (turn system)
├── Frame Engineer (frame shell)
└── Economy Designer (balancing formulas)

WEEK 3: Integration
├── Frontend Dev (full UI)
├── Backend Engineer (WebSocket + polish)
└── Smart Contract Dev (Zora integration)

WEEK 4: Polish & Launch
├── All agents (testing + bugfixes)
└── Frame Engineer (composer actions)
```

---

## Interface Contracts Between Agents

### Card Service Interface (Frame ↔ Backend)

```typescript
interface ICardService {
  generatePreview(session: SynSyncSession): Promise<CardPreview>;
  mint(cardId: string, ownerFid: number): Promise<MintResult>;
  transfer(cardId: string, toFid: number): Promise<void>;
  burn(cardId: string): Promise<EssenceResult>;
  getCollection(fid: number): Promise<Card[]>;
  getDeck(fid: number): Promise<Card[]>;
}
```

### Battle Service Interface (Battle ↔ Backend)

```typescript
interface IBattleService {
  createBattle(cellId: string, dungeonId: string): Promise<Battle>;
  submitAction(battleId: string, action: PlayerAction): Promise<void>;
  resolveTurn(battleId: string): Promise<BattleEvent[]>;
  getState(battleId: string): Promise<Battle>;
  forfeit(battleId: string, fid: number): Promise<void>;
}
```

### Cell Service Interface (Frontend ↔ Backend)

```typescript
interface ICellService {
  createCell(leaderFid: number, name: string): Promise<Cell>;
  joinCell(cellId: string, fid: number): Promise<Cell>;
  leaveCell(cellId: string, fid: number): Promise<void>;
  ready(cellId: string, fid: number): Promise<void>;
  enterDungeon(cellId: string, dungeonId: string): Promise<Battle>;
  disband(cellId: string, fid: number): Promise<void>;
}
```

### SynSync Service Interface (SynSync ↔ Card)

```typescript
interface ISynSyncService {
  validateScreenshot(screenshot: Buffer): Promise<ValidationResult>;
  calculateAlignment(session: SynSyncSession): Promise<Alignment>;
  checkDuplicate(screenshotHash: string): Promise<boolean>;
  getProtocolMetadata(protocolId: string): Promise<ProtocolData>;
}
```

---

## Testing Strategy

### Unit Tests (Per Agent)
- Card stat calculations
- Battle turn resolution
- System AI decisions
- Frequency alignment math

### Integration Tests (Cross-Agent)
- Full game loop: Draw → Tune → Battle → Mint
- Cell formation and dungeon entry
- Real-time battle sync
- Minting flow end-to-end

### E2E Tests (Full Stack)
- Player journey: New user → first battle → first mint
- Multiplayer: 7-player Cell vs Tier VII boss
- Economy: Mint → Trade → Burn cycle

---

## Common Pitfalls to Avoid

1. **Frequency precision** — Store as DECIMAL(5,2), not FLOAT
2. **Battle async** — Use timeouts, don't wait indefinitely
3. **Double mint** — Always check `card_generated` flag
4. **Race conditions** — Lock Cell during battle operations
5. **Gas costs** — Batch Zora operations where possible
6. **Screenshot fraud** — Implement perceptual hashing early

---

## Communication Protocol

Agents should update this file with their status:

```markdown
### Status: Agent Name [DATE]
- ✅ Completed: Task A, Task B
- 🔄 In Progress: Task C
- ⏳ Blocked: Task D (waiting for Agent X)
- 📝 Notes: Any important decisions or changes
```

---

**Questions?** Reference `SPEC.md` for complete data models and API contracts.
