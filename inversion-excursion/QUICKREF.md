# The Inversion Excursion — Architecture Quick Reference

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ENTITY RELATIONSHIPS                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│      PLAYER         │◄───────►│       CELL          │◄───────►│      BATTLE         │
│  (fid: primary key) │   M:1   │  (id: primary key)  │   1:M   │  (id: primary key)  │
├─────────────────────┤         ├─────────────────────┤         ├─────────────────────┤
│ • fid (PK)          │         │ • id (PK)           │         │ • id (PK)           │
│ • username          │         │ • name              │         │ • dungeon_id (FK)   │
│ • custody_address   │         │ • tag               │         │ • cell_id (FK)      │
│ • level             │         │ • status            │         │ • system_state      │
│ • frequency_profile │         │ • members[]         │         │ • turn              │
│ • stats             │         │ • resonance_field   │         │ • log[]             │
│ • preferences       │         │ • current_dungeon   │         │ • result            │
└─────────┬───────────┘         └──────────┬──────────┘         └──────────┬──────────┘
          │                                │                               │
          │ 1:M                            │ M:1                           │ M:1
          ▼                                ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
│       CARD          │         │      DUNGEON        │         │      SYSTEM         │
│  (id: primary key)  │         │  (id: primary key)  │         │  (template)         │
├─────────────────────┤         ├─────────────────────┤         ├─────────────────────┤
│ • id (PK)           │         │ • id (PK)           │         │ • name              │
│ • owner_fid (FK)    │         │ • tier              │         │ • health            │
│ • token_id          │         │ • name              │         │ • attack            │
│ • screenshot_cid    │         │ • difficulty        │         │ • defense           │
│ • protocol_data     │         │ • system_template   │         │ • frequency_sig     │
│ • stats             │         │ • encounters[]      │         │ • vulnerabilities   │
│ • tier              │         │ • rewards           │         │ • abilities[]       │
│ • minted_at         │         │ • theme             │         │ • adaptation        │
└─────────────────────┘         └─────────────────────┘         └─────────────────────┘
          │
          │ 1:1
          ▼
┌─────────────────────┐
│      SESSION        │
│  (SynSync sync)     │
├─────────────────────┤
│ • id (PK)           │
│ • fid (FK)          │
│ • protocol_id       │
│ • frequency_actual  │
│ • duration          │
│ • resonance_score   │
│ • screenshot_cid    │
│ • card_generated    │
└─────────────────────┘
```

## State Machine Summaries

### Battle States

```
SETUP → PLANNING → RESOLUTION → SYSTEM → CHECK → [VICTORY/DEFEAT/CONTINUE]
                    ▲                                           │
                    └───────────────────────────────────────────┘ (loop back)
```

| State | Description | Transitions |
|-------|-------------|-------------|
| `SETUP` | Initialize battle, snapshot Cell | → `PLANNING` |
| `PLANNING` | Players submit actions | → `RESOLUTION` (all actions in OR timeout) |
| `RESOLUTION` | Execute player actions | → `SYSTEM` |
| `SYSTEM` | The System acts | → `CHECK` |
| `CHECK` | Check victory/defeat conditions | → `VICTORY` / `DEFEAT` / `CONTINUE` |
| `CONTINUE` | Next encounter or boss | → `PLANNING` |
| `VICTORY` | Battle won, rewards distributed | → `REWARD` → `COOLDOWN` |
| `DEFEAT` | Battle lost, revive option | → `REVIVE` / `DISSOLVE` |

### Cell States

| State | Description | Transitions |
|-------|-------------|-------------|
| `FORMING` | Not enough members (<3) | → `READY` (3+ members) / `DISSOLVED` (timeout) |
| `READY` | Can enter dungeon | → `IN_DUNGEON` / `DISSOLVED` (leader disbands) |
| `IN_DUNGEON` | Currently battling | → `COOLDOWN` (victory/defeat) |
| `COOLDOWN` | Post-battle recovery | → `DISSOLVED` (after 10 min) |
| `DISSOLVED` | Cell no longer active | (terminal) |

## API Quick Reference

### Authentication
All requests require Farcaster-signed message or JWT from `/auth/farcaster`.

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/player/{fid}` | Get player profile |
| POST | `/api/v1/player/{fid}/sync` | Sync SynSync session |
| GET | `/api/v1/cards` | List collection |
| POST | `/api/v1/cards/{id}/mint` | Mint to Zora |
| POST | `/api/v1/cards/{id}/burn` | Burn for essence |
| POST | `/api/v1/cells` | Create Cell |
| POST | `/api/v1/cells/{id}/join` | Join Cell |
| POST | `/api/v1/cells/{id}/enter-dungeon` | Start battle |
| GET | `/api/v1/battles/{id}` | Get battle state |
| POST | `/api/v1/battles/{id}/action` | Submit action |
| WS | `/ws` | WebSocket for real-time |

## Card Stat Formula

```typescript
// Base stats from alignment
power = frequency_alignment * 0.4 + resonance * 0.3 + duration_factor * 0.3
resonance_score = session_resonance * category_weight
stability = duration_factor * category_weight
inversion = (100 - frequency) * 0.8

// Tier determination
if (composite_score >= 96) tier = MYTHIC
else if (composite_score >= 86) tier = LEGENDARY
else if (composite_score >= 71) tier = EPIC
else if (composite_score >= 51) tier = RARE
else if (composite_score >= 31) tier = UNCOMMON
else tier = COMMON
```

## The System — Boss Quick Stats

| Tier | Name | HP | ATK | DEF | Key Mechanic |
|------|------|-----|-----|-----|--------------|
| I | The Observer | 1,000 | 40 | 20 | Data Harvest (tracks cards) |
| II | The Administrator | 2,500 | 60 | 35 | Protocol Lock (disables category) |
| III | The Architect | 5,000 | 85 | 50 | Rebuild (heals on harmony) |
| IV | The Sovereign | 10,000 | 120 | 75 | Decree (forces same category) |
| V | The Oracle | 20,000 | 160 | 100 | Prediction (counters popular moves) |
| VI | The Singularity | 50,000 | 220 | 150 | Adaptive Evolution (resists frequent) |
| VII | The Inversion | 100,000 | 300 | 200 | Mirror Protocol (copies best card) |

## Resonance Field Bonuses

| Bonus | Trigger | Effect |
|-------|---------|--------|
| **Harmonic** | All members within 2Hz | +20% attack power |
| **Diverse** | 4+ different categories | +15% defense, immune to lock |
| **Unified** | All same category | +30% category, -20% others |
| **Chaotic** | Variance > 20Hz | Random crits & self-damage |

## Integration Checklist

### Farcaster SDK
- [ ] Frame embed manifest
- [ ] Cast composer actions (share, invite, challenge)
- [ ] Neynar auth integration
- [ ] Notification webhooks

### Zora Coins
- [ ] ERC1155 contract deployment
- [ ] Mint function integration
- [ ] Trading pool setup
- [ ] Burn mechanics

### SynSync Pro
- [ ] Screenshot validation API
- [ ] Session webhook handler
- [ ] Protocol metadata sync
- [ ] Frequency accuracy verification

## Key Constants

```typescript
const CONSTANTS = {
  // Cell
  CELL_MIN_MEMBERS: 3,
  CELL_MAX_MEMBERS: 7,
  CELL_FORMATION_TIMEOUT_MINUTES: 5,
  CELL_COOLDOWN_MINUTES: 10,
  
  // Battle
  BATTLE_TURN_TIMEOUT_HOURS: 24,
  MAX_TURNS_BEFORE_ENRAGE: 50,
  
  // Cards
  MAX_DECK_SIZE: 20,
  MAX_MINTS_PER_DAY: 10,
  SCREENSHOT_MAX_AGE_HOURS: 24,
  MIN_RESONANCE_TO_MINT: 60,
  
  // Dungeons
  DUNGEON_TIERS: 7,
  ENCOUNTERS_PER_DUNGEON: [3, 4, 5, 5, 6, 7, 8],
  
  // Frequencies
  MIN_FREQUENCY: 0.5,
  MAX_FREQUENCY: 100,
  
  // Fees (in %)
  PLATFORM_FEE: 2.5,
  CREATOR_FEE: 5.0,
  BURN_FEE: 1.0
};
```

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `CELL_FULL` | Cell already has 7 members | 403 |
| `CELL_TOO_SMALL` | Need 3+ members to enter dungeon | 403 |
| `INVALID_FREQUENCY` | Frequency out of valid range | 400 |
| `SCREENSHOT_TOO_OLD` | Screenshot older than 24 hours | 400 |
| `ALREADY_MINTED` | Session already used for mint | 409 |
| `NOT_YOUR_TURN` | Action submitted out of turn | 409 |
| `BATTLE_ENDED` | Battle already completed | 410 |
| `INSUFFICIENT_ESSENCE` | Not enough essence for action | 402 |

---

**Reference:** Full specification in `SPEC.md`
