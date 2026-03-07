# Smart Contract Reference

Complete reference for The Inversion Excursion smart contracts deployed on Base network.

---

## Table of Contents

1. [Contract Overview](#contract-overview)
2. [ScrollCard.sol](#scrollcardsol)
3. [VictoryMinter.sol](#victorymintersol)
4. [CellRegistry.sol](#cellregistrysol)
5. [TradingPost.sol](#tradingpostsol)
6. [GamePaymaster.sol](#gamepaymastersol)
7. [TheInversionExcursion.sol](#theinversionexcursionsol)
8. [Deployment Addresses](#deployment-addresses)
9. [ABIs](#abis)
10. [Upgrade Patterns](#upgrade-patterns)

---

## Contract Overview

| Contract | Type | Purpose | Upgradeable |
|----------|------|---------|-------------|
| `ScrollCard` | ERC-721 | Core game cards | ❌ No |
| `VictoryMinter` | ERC-721 | Achievement NFTs | ✅ Yes |
| `CellRegistry` | Custom | Cell management | ✅ Yes |
| `TradingPost` | Custom | Gift mechanics | ✅ Yes |
| `GamePaymaster` | ERC-4337 | Gasless transactions | ✅ Yes |
| `TheInversionExcursion` | Main | Game coordination | ✅ Yes |

**Network**: Base Mainnet (Chain ID: 8453)

---

## ScrollCard.sol

Core NFT contract for Scroll Cards.

### Deployment Address
```
Base Mainnet: TBD
Base Sepolia: TBD
```

### Key Functions

#### Minting

```solidity
function mintCard(
    address to,
    Dungeon dungeon,
    Tier tier,
    Frequency frequency,
    uint8 power,
    uint8 curse,
    uint16 durability,
    uint256 dungeonSeed,
    string calldata frameUrl
) external onlyRole(MINTER_ROLE) returns (uint256 tokenId);
```

Mints a new Scroll Card with specified attributes.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `to` | address | Recipient address |
| `dungeon` | Dungeon | Dungeon type (0-5) |
| `tier` | Tier | Rarity tier (0-4) |
| `frequency` | Frequency | Usage pattern (0-3) |
| `power` | uint8 | Attack power (0-100) |
| `curse` | uint8 | Curse level (0-100) |
| `durability` | uint16 | Uses remaining (0 = infinite) |
| `dungeonSeed` | uint256 | Procedural generation seed |
| `frameUrl` | string | Farcaster frame URL |

**Returns**: `tokenId` of minted card

**Emits**: `CardMinted(tokenId, to, dungeon, tier, dungeonSeed)`

#### Batch Minting

```solidity
function batchMintCards(
    address[] calldata recipients,
    Dungeon[] calldata dungeons,
    Tier[] calldata tiers,
    uint256[] calldata dungeonSeeds
) external onlyRole(MINTER_ROLE);
```

Gas-efficient batch minting for airdrops and rewards.

#### Game Mechanics

```solidity
function useCard(uint256 tokenId, uint16 amount) external onlyRole(GAME_MASTER);
```

Consumes card durability during gameplay.

```solidity
function setBinding(uint256 tokenId, bool bound) external onlyRole(TRADING_POST);
```

Toggles soulbound status (only callable by TradingPost).

#### Query Functions

```solidity
function getCard(uint256 tokenId) external view returns (CardAttributes memory, FrameMetadata memory);
function getCardsByOwner(address owner) external view returns (uint256[] memory);
function getCardsByDungeon(address owner, Dungeon dungeon) external view returns (uint256[] memory);
function getEffectivePower(uint256 tokenId) external view returns (uint8);
```

### Events

```solidity
event CardMinted(
    uint256 indexed tokenId,
    address indexed to,
    Dungeon dungeon,
    Tier tier,
    uint256 dungeonSeed
);

event CardBound(uint256 indexed tokenId, bool bound);
event CardUsed(uint256 indexed tokenId, uint16 remainingDurability);
event DungeonSupplySet(Dungeon dungeon, Tier tier, uint256 maxSupply);
event FrameMetadataSet(uint256 indexed tokenId, string frameUrl);
```

### Enums

```solidity
enum Dungeon {
    THE_SPIRE,      // 0
    THE_MAZE,       // 1
    THE_ABYSS,      // 2
    THE_MIRROR,     // 3
    THE_FORGE,      // 4
    THE_VOID        // 5
}

enum Tier {
    ASH,            // 0 - Common
    IRON,           // 1 - Uncommon
    SILVER,         // 2 - Rare
    GOLD,           // 3 - Epic
    PRISM           // 4 - Legendary
}

enum Frequency {
    STATIC,         // 0 - Single use
    PULSING,        // 1 - Recharges
    RESONANT,       // 2 - Synergizes
    INFINITE        // 3 - Unlimited
}
```

### Structs

```solidity
struct CardAttributes {
    Dungeon dungeon;
    Tier tier;
    Frequency frequency;
    uint8 power;
    uint8 curse;
    uint16 durability;
    uint256 mintedAt;
    uint256 dungeonSeed;
    address originalOwner;
    bool isBound;
}

struct FrameMetadata {
    string frameUrl;
    string splashImage;
    string buttonText;
    string attribution;
}
```

---

## VictoryMinter.sol

Mints victory screenshots and achievements.

### Deployment Address
```
Base Mainnet: TBD
Base Sepolia: TBD
```

### Key Functions

#### Mint Victory

```solidity
function mintVictory(
    address to,
    uint256 battleId,
    address[] calldata participants,
    uint256 victoryScore,
    string calldata screenshotCID,
    string calldata metadataCID,
    bytes32 battleHash,
    bytes calldata signature
) external payable returns (uint256 tokenId);
```

Mints a victory NFT with cryptographic proof.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `to` | address | Primary recipient |
| `battleId` | uint256 | Reference to CellRegistry battle |
| `participants` | address[] | All Cell members |
| `victoryScore` | uint256 | Calculated score (0-10000) |
| `screenshotCID` | string | IPFS CID of screenshot |
| `metadataCID` | string | IPFS CID of metadata |
| `battleHash` | bytes32 | Cryptographic battle proof |
| `signature` | bytes | Oracle signature |

**Requirements**:
- Valid oracle signature
- Battle not already recorded
- Sufficient mint fee (if applicable)

#### Gasless Minting

```solidity
function mintVictoryGasless(
    address to,
    uint256 battleId,
    address[] calldata participants,
    uint256 victoryScore,
    string calldata screenshotCID,
    string calldata metadataCID,
    bytes32 battleHash,
    uint256 validUntil,
    bytes calldata signature
) external onlyRole(VERIFIER_ROLE) returns (uint256);
```

Mint via paymaster (no ETH required from user).

#### Frame Integration

```solidity
function getFrameMetadata(uint256 tokenId) external view returns (string memory);
function validateFrameAction(uint256 tokenId, address user, bytes calldata signature) external view returns (bool);
```

Farcaster Frame integration functions.

### Events

```solidity
event VictoryMinted(
    uint256 indexed tokenId,
    uint256 indexed battleId,
    address indexed recipient,
    string screenshotCID
);

event SharedVictory(
    uint256 indexed tokenId,
    uint256 indexed battleId,
    address[] recipients
);
```

---

## CellRegistry.sol

Manages Cell formations and battle history.

### Deployment Address
```
Base Mainnet: TBD
Base Sepolia: TBD
```

### Key Functions

#### Cell Management

```solidity
function formCell(
    string calldata name,
    string calldata crestCID,
    string calldata faction
) external returns (uint256 cellId);
```

Create a new Cell.

```solidity
function joinCell(uint256 cellId) external;
function leaveCell(uint256 cellId) external;
function disbandCell(uint256 cellId) external;
function transferLeadership(uint256 cellId, address newLeader) external;
```

Member management functions.

#### Battle Recording

```solidity
function recordBattle(
    uint256 cellId,
    uint256 dungeonId,
    uint256 victoryScore,
    bool isVictory,
    bytes32 battleHash,
    uint256[] calldata cardIds,
    address[] calldata participants,
    string calldata outcomeCID
) external onlyRole(BATTLE_ORACLE) returns (uint256 battleId);
```

Record battle outcome (oracle only).

#### Query Functions

```solidity
function getCell(uint256 cellId) external view returns (Cell memory);
function getCellMembers(uint256 cellId) external view returns (address[] memory);
function isCellMember(uint256 cellId, address member) external view returns (bool);
function getTopCells(uint256 count) external view returns (uint256[] memory);
```

### Constants

```solidity
uint256 public constant MAX_CELL_SIZE = 6;
uint256 public constant MIN_CELL_LIFETIME = 1 hours;
```

### Structs

```solidity
struct Cell {
    uint256 cellId;
    string name;
    string crestCID;
    address leader;
    uint256 formedAt;
    uint256 disbandedAt;
    bool isActive;
    uint256 totalBattles;
    uint256 totalVictories;
    uint256 reputation;
    string faction;
}

struct Battle {
    uint256 battleId;
    uint256 cellId;
    uint256 dungeonId;
    uint256 startedAt;
    uint256 endedAt;
    uint256 victoryScore;
    bool isVictory;
    bytes32 battleHash;
    uint256[] cardIds;
    address[] participants;
    string outcomeCID;
}
```

---

## TradingPost.sol

One-way gifting system.

### Deployment Address
```
Base Mainnet: TBD
Base Sepolia: TBD
```

### Key Functions

#### Create Gift

```solidity
function createGift(
    address to,
    uint256[] calldata cardIds,
    string calldata message,
    string calldata wrappingCID,
    uint256 expiresIn
) external returns (uint256 giftId);
```

Create a gift of Scroll Cards.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `to` | address | Recipient |
| `cardIds` | uint256[] | Cards to gift |
| `message` | string | Personal message (max 280 chars) |
| `wrappingCID` | string | IPFS visual wrapping |
| `expiresIn` | uint256 | Seconds until expiry (0 = 7 days) |

**Constraints**:
- Max 10 cards per gift
- Cards must be owned by sender
- Message max 280 characters

#### Claim Gift

```solidity
function claimGift(uint256 giftId) external;
```

Recipient claims the gift.

#### Refund Expired

```solidity
function refundExpiredGift(uint256 giftId) external;
```

Sender retrieves unclaimed expired gift.

#### Direct Gift

```solidity
function giftDirect(
    address to,
    uint256[] calldata cardIds,
    string calldata message
) external;
```

Immediate transfer without escrow.

### Events

```solidity
event GiftCreated(
    uint256 indexed giftId,
    address indexed from,
    address indexed to,
    uint256[] cardIds,
    bytes32 giftHash
);

event GiftClaimed(uint256 indexed giftId, address indexed by, uint256 timestamp);
event GiftRefunded(uint256 indexed giftId, address indexed to, uint256 timestamp);
event CardsGifted(address indexed from, address indexed to, uint256[] cardIds, uint256 timestamp);
```

---

## GamePaymaster.sol

ERC-4337 paymaster for gasless transactions.

### Deployment Address
```
Base Mainnet: TBD
Base Sepolia: TBD
```

### Key Functions

#### Configuration

```solidity
function configureSponsorship(
    address target,
    bool enabled,
    uint256 dailyLimit,
    uint256 maxGasLimit,
    uint256 maxCostPerOp
) external onlyRole(OPERATOR_ROLE);
```

Configure gas sponsorship for target contract.

#### Query

```solidity
function getUserRemainingOps(address user, address target) external view returns (uint256);
function isOperationSponsored(address target) external view returns (bool);
```

### SponsorshipConfig

```solidity
struct SponsorshipConfig {
    bool enabled;
    uint256 dailyLimit;
    uint256 maxGasLimit;
    uint256 maxCostPerOp;
}
```

### ERC-4337 Functions

```solidity
function _validatePaymasterUserOp(
    UserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 maxCost
) internal view override returns (bytes memory context, uint256 validationData);

function _postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
) internal override;
```

### Events

```solidity
event SponsorshipConfigured(
    address indexed target,
    bool enabled,
    uint256 dailyLimit,
    uint256 maxGasLimit
);

event UserOperationSponsored(
    address indexed user,
    address indexed target,
    uint256 actualCost,
    uint256 timestamp
);
```

---

## TheInversionExcursion.sol

Main game coordination contract.

### Deployment Address
```
Base Mainnet: TBD
Base Sepolia: TBD
```

### Key Functions

#### Battle Management

```solidity
function enterDungeon(
    uint256 cellId,
    uint8 dungeonId,
    uint256[] calldata cardIds
) external payable returns (uint256 battleId);
```

Enter a dungeon with your Cell.

```solidity
function completeBattle(
    uint256 battleId,
    bool won,
    uint256 score,
    bytes calldata battleProof
) external onlyRole(GAME_MASTER);
```

Complete battle and record outcome.

#### Admin Functions

```solidity
function setDungeonStatus(uint8 dungeonId, bool open) external onlyRole(GAME_MASTER);
function setEntryFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE);
function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE);
```

---

## Deployment Addresses

### Base Mainnet

| Contract | Address | Status |
|----------|---------|--------|
| ScrollCard | `TBD` | Not deployed |
| VictoryMinter | `TBD` | Not deployed |
| CellRegistry | `TBD` | Not deployed |
| TradingPost | `TBD` | Not deployed |
| GamePaymaster | `TBD` | Not deployed |
| TheInversionExcursion | `TBD` | Not deployed |
| EntryPoint (ERC-4337) | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` | Standard |

### Base Sepolia (Testnet)

| Contract | Address | Status |
|----------|---------|--------|
| ScrollCard | `TBD` | Not deployed |
| VictoryMinter | `TBD` | Not deployed |
| CellRegistry | `TBD` | Not deployed |
| TradingPost | `TBD` | Not deployed |
| GamePaymaster | `TBD` | Not deployed |
| TheInversionExcursion | `TBD` | Not deployed |

---

## ABIs

### ScrollCard ABI (Key Functions)

```json
[
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "dungeon", "type": "uint8" },
      { "name": "tier", "type": "uint8" },
      { "name": "frequency", "type": "uint8" },
      { "name": "power", "type": "uint8" },
      { "name": "curse", "type": "uint8" },
      { "name": "durability", "type": "uint16" },
      { "name": "dungeonSeed", "type": "uint256" },
      { "name": "frameUrl", "type": "string" }
    ],
    "name": "mintCard",
    "outputs": [{ "name": "tokenId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getCard",
    "outputs": [
      {
        "components": [
          { "name": "dungeon", "type": "uint8" },
          { "name": "tier", "type": "uint8" },
          { "name": "frequency", "type": "uint8" },
          { "name": "power", "type": "uint8" },
          { "name": "curse", "type": "uint8" },
          { "name": "durability", "type": "uint16" },
          { "name": "mintedAt", "type": "uint256" },
          { "name": "dungeonSeed", "type": "uint256" },
          { "name": "originalOwner", "type": "address" },
          { "name": "isBound", "type": "bool" }
        ],
        "name": "attributes",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
```

Full ABIs available in `/contracts/abis/` directory.

---

## Upgrade Patterns

### UUPS Proxy Pattern

Upgradeable contracts use OpenZeppelin's UUPS pattern:

```solidity
// Upgrade flow
1. Deploy new implementation
2. Call upgradeTo(newImplementation) via proxy
3. New logic active immediately
```

### Timelock

Critical operations require 24-hour timelock:
- Contract upgrades
- Parameter changes
- Role assignments

### Emergency Pause

All contracts include pause functionality:

```solidity
function pause() external onlyRole(GAME_MASTER);
function unpause() external onlyRole(GAME_MASTER);
```

---

*Last updated: March 2026*
