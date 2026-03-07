# The Inversion Excursion - Contract Architecture

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                   │
│                         (Farcaster Frame / Web)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ACCOUNT ABSTRACTION                                │
│                         (Smart Contract Wallet)                              │
│                         ┌──────────────────┐                                 │
│                         │   GamePaymaster  │ (ERC-4337 Paymaster)           │
│                         └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE INVERSION EXCURSION                               │
│                           (UUPS Upgradeable)                                  │
│                    ┌──────────────────────────────────┐                      │
│                    │         Main Coordinator         │                      │
│                    │   ┌────────┐ ┌────────┐ ┌────┐  │                      │
│                    │   │ Cells  │ │ Battles│ │Etc │  │                      │
│                    │   └────────┘ └────────┘ └────┘  │                      │
│                    └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
         │              │              │              │              │
         ▼              ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐
│ ScrollCard   │ │ Victory      │ │ CellRegistry │ │ TradingPost  │ │ Metadata│
│ ├─ ERC-721   │ │ ├─ ERC-721   │ │ ├─ Formation │ │ ├─ Gifting   │ │ ├─ Zora │
│ ├─ Soulbound │ │ ├─ Soulbound │ │ ├─ History   │ │ ├─ Escrow    │ │ ├─ FC   │
│ ├─ SVG Gen   │ │ ├─ Badges    │ │ ├─ Reputation│ │ ├─ Limits    │ │ └─ IPFS │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘
```

## Contract Relationships

### 1. TheInversionExcursion (Central Coordinator)

**Purpose**: Main entry point for all game operations

**Dependencies**:
- `ScrollCard` - For dungeon entry verification and minting
- `VictoryMinter` - For achievement minting
- `CellRegistry` - For cell formation and battle recording
- `TradingPost` - For gift functionality

**Key Functions**:
```solidity
function formCell(address[] calldata members) external returns (uint256)
function enterDungeon(uint8 dungeon, uint256 scrollCardId) external payable
function completeBattle(address player, uint256 cellId, uint8 dungeon, bool won, uint256 score) 
    external returns (uint256)
function sendBulletGift(address to, uint256 scrollCardId, string calldata message) external
```

**Design Pattern**: Facade + Mediator

### 2. ScrollCard (Game Assets)

**Purpose**: Soulbound NFTs representing dungeon access

**Key Features**:
- ERC-721 with enumerable extension
- Soulbound by default (non-transferable)
- Unlock/Lock mechanism for TradingPost
- On-chain SVG generation
- Farcaster Frame metadata

**State**:
```solidity
struct ScrollAttributes {
    uint8 dungeon;
    Tier tier;
    Frequency frequency;
    uint256 mintedAt;
    bool soulbound;
    string dungeonName;
    uint256 powerScore;
}
```

**Security Model**:
- Only `MINTER_ROLE` can mint
- Only `TRADING_POST_ROLE` can transfer soulbound tokens
- Supply caps enforced

### 3. VictoryMinter (Achievements)

**Purpose**: Permanent proof of battle victories

**Key Features**:
- Fully soulbound (can never be transferred)
- Victory type determined algorithmically from score
- Achievement tiers based on performance
- On-chain metadata

**State**:
```solidity
struct VictoryAttributes {
    uint256 cellId;
    uint8 dungeon;
    VictoryType victoryType;
    AchievementTier achievementTier;
    uint256 score;
    uint256 timestamp;
    string metadataURI;
}
```

**Security Model**:
- All transfers reverted at protocol level
- Only `MINTER_ROLE` can mint
- No approval mechanism

### 4. CellRegistry (Social Coordination)

**Purpose**: Manage player cells (squads) and battle history

**Key Features**:
- Cell formation with leader/member structure
- Battle recording with full history
- Reputation system
- Leaderboard support

**State**:
```solidity
struct Cell {
    uint256 id;
    address leader;
    address[] members;
    uint256 formedAt;
    uint256 lastActive;
    uint256 battlesWon;
    uint256 battlesLost;
    uint256 totalScore;
    bool active;
    string name;
}
```

**Security Model**:
- Only cell leader can add/remove members
- Leader cannot be removed (must transfer leadership)
- Only `GAME_MASTER_ROLE` can record battles

### 5. TradingPost (Asset Transfer)

**Purpose**: Enable gifting of soulbound assets

**Key Features**:
- One-way gifting (no marketplace)
- Escrow pattern for secure transfers
- Claim period with refund option
- Daily limits for spam prevention

**State**:
```solidity
struct Gift {
    uint256 id;
    uint256 scrollCardId;
    address from;
    address to;
    string message;
    uint256 timestamp;
    bool claimed;
    bool refunded;
}
```

**Security Model**:
- Tokens unlocked only during transfer
- ReentrancyGuard on all external functions
- Time-based expiration (miner-resistant)

### 6. GamePaymaster (Gas Abstraction)

**Purpose**: Sponsor gas for player transactions

**Key Features**:
- ERC-4337 compliant paymaster
- Tier-based sponsorship limits
- Operation-type filtering
- Deposit management

**Security Model**:
- Only EntryPoint can call validation
- No storage writes in validation phase
- Verifying signer can be rotated

## Data Flow

### Player Journey: Form Cell → Enter Dungeon → Win Battle

```
1. FORM CELL
   ┌─────────┐     ┌──────────────┐     ┌─────────────┐
   │ Player  │────▶│   Game       │────▶│ CellRegistry│
   │         │     │              │     │ ├─ create   │
   └─────────┘     │ formCell()   │     │ └─ emit     │
                   └──────────────┘     └─────────────┘

2. ENTER DUNGEON
   ┌─────────┐     ┌──────────────┐     ┌─────────────┐
   │ Player  │────▶│   Game       │────▶│ ScrollCard  │
   │         │     │              │     │ ├─ verify   │
   │ + Scroll│     │ enterDungeon │     │ └─ transfer │
   └─────────┘     │ + ETH fee    │     └─────────────┘
                   └──────────────┘

3. COMPLETE BATTLE (Game Master)
   ┌──────────┐    ┌──────────────┐     ┌─────────────────┐
   │GameMaster│───▶│   Game       │────▶│ VictoryMinter   │
   │          │    │              │     │ ├─ mintVictory  │
   └──────────┘    │completeBattle│     │ └─ emit         │
                   └──────────────┘     └─────────────────┘
                                        ▲
                                        │
                              ┌─────────┴─────────┐
                              │   CellRegistry    │
                              │   recordBattle    │
                              └───────────────────┘
```

### Gift Flow

```
SENDER                              TRADING_POST                           RECIPIENT
   │                                     │                                      │
   │ sendBulletGift(to, tokenId)         │                                      │
   │────────────────────────────────────▶│                                      │
   │                                     │ 1. unlockForTrading(tokenId)         │
   │                                     │──────▶ ScrollCard                    │
   │                                     │ 2. transferFrom(sender, this)        │
   │                                     │──────▶ ScrollCard                    │
   │                                     │ 3. lockAfterTrade(tokenId)           │
   │                                     │──────▶ ScrollCard                    │
   │                                     │ 4. Store in escrow                   │
   │                                     │                                      │
   │                                     │◀─────────────────────────────────────│ claimGift(giftId)
   │                                     │                                      │
   │                                     │ 1. unlockForTrading(tokenId)         │
   │                                     │──────▶ ScrollCard                    │
   │                                     │ 2. transferFrom(this, recipient)     │
   │                                     │──────▶ ScrollCard                    │
   │                                     │ 3. lockAfterTrade(tokenId)           │
   │                                     │──────▶ ScrollCard                    │
   │                                     │                                      │
```

## Upgrade Strategy

### UUPS Proxy Pattern

```
┌─────────────────┐         ┌──────────────────┐
│  Proxy Contract │────────▶│  Implementation  │
│                 │  DELEGATECALL               │
│  ┌───────────┐  │         │  TheInversion    │
│  │  State    │  │         │  Excursion       │
│  │  Storage  │  │         └──────────────────┘
│  └───────────┘  │
└─────────────────┘
```

**Upgrade Flow**:
1. Deploy new implementation contract
2. Call `upgradeTo(newImplementation)` via ProxyAdmin
3. State preserved, logic updated

**Access Control**:
- Only `UPGRADER_ROLE` can upgrade
- Timelock recommended for production

## Access Control Matrix

| Function | Admin | Game Master | Minter | Trading Post | Public |
|----------|-------|-------------|--------|--------------|--------|
| `mintScroll` | ✓ | ✗ | ✓ | ✗ | ✗ |
| `mintVictory` | ✓ | ✗ | ✓ | ✗ | ✗ |
| `recordBattle` | ✓ | ✓ | ✗ | ✗ | ✗ |
| `formCell` | ✓ | ✓ | ✗ | ✗ | ✓ |
| `sendGift` | ✓ | ✓ | ✗ | ✗ | ✓ |
| `claimGift` | ✓ | ✓ | ✗ | ✗ | ✓ (recipient only) |
| `upgradeTo` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `setGameParams` | ✓ | ✓ | ✗ | ✗ | ✗ |

## Event System

### Critical Events

```solidity
// ScrollCard
event ScrollMinted(uint256 indexed tokenId, address indexed to, uint8 indexed dungeon, ...);
event SoulboundStatusChanged(uint256 indexed tokenId, bool soulbound, address indexed triggeredBy);

// VictoryMinter
event VictoryMinted(uint256 indexed tokenId, address indexed to, uint256 indexed cellId, ...);

// CellRegistry
event CellFormed(uint256 indexed cellId, address indexed leader, address[] members);
event BattleRecorded(uint256 indexed battleId, uint256 indexed cellId, bool won, uint256 score);

// TradingPost
event GiftSent(uint256 indexed giftId, uint256 indexed scrollCardId, address indexed from, address indexed to);
event GiftClaimed(uint256 indexed giftId, uint256 indexed scrollCardId, address indexed claimer);

// GamePaymaster
event UserOperationSponsored(bytes32 indexed userOpHash, address indexed player, uint256 gasUsed);
```

## Storage Layout

### Optimized Packing

```solidity
// Slot 0: Frequently accessed together
struct ScrollAttributes {
    uint8 dungeon;      // 1 byte
    Tier tier;          // 1 byte
    Frequency frequency;// 1 byte
    bool soulbound;     // 1 byte
    uint32 mintedAt;    // 4 bytes (enough until year 2106)
    uint48 powerScore;  // 6 bytes
    // Total: 14 bytes (fits in one slot with padding)
}

// Slot 1: Strings (dynamic, stored separately)
string dungeonName;     // Keccak256 slot + data
```

## External Integrations

### Farcaster Frame

```json
{
  "frame": {
    "version": "vNext",
    "title": "Dungeon Scroll",
    "image": "data:image/svg+xml;base64,...",
    "buttons": [
      {"label": "View in Game", "action": "post_redirect"},
      {"label": "Gift to Friend", "action": "post"}
    ]
  }
}
```

### Zora Coins

- ScrollCard implements standard minting interface
- Compatible with Zora Creator toolkit
- Custom metadata renderer support

### ERC-4337 EntryPoint

```solidity
// Standard EntryPoint interface
interface IEntryPoint {
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external;
    function getUserOpHash(UserOperation calldata userOp) external view returns (bytes32);
}
```

## Error Handling

### Custom Errors (Gas Efficient)

```solidity
error SoulboundToken(uint256 tokenId);
error InvalidDungeon(uint8 dungeon);
error CellFull(uint256 cellId, uint256 maxSize);
error DailyLimitReached(address player, uint256 limit);
```

**Benefits**:
- ~50 gas vs ~200 gas for require strings
- Type-safe error handling
- Better tooling support

## Future Considerations

### Planned Features
1. **Cross-chain bridging** - LayerZero integration for scrolls
2. **DAO governance** - Move admin functions to governance
3. **Seasonal content** - Time-limited dungeons with new scroll types
4. **Tournament mode** - On-chain bracket competitions

### Scalability
1. **Batch operations** - Already implemented for minting
2. **Merkle proofs** - For large airdrops
3. **L2 expansion** - Beyond Base to other L2s

---

*This architecture is designed for upgradeability and extensibility while maintaining security and gas efficiency.*
