# The Inversion Excursion - Contract Quick Reference

## Contract Addresses (Mainnet Deployment)

| Contract | Address | Purpose |
|----------|---------|---------|
| EntryPoint | `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789` | ERC-4337 EntryPoint (singleton) |
| ScrollCard | TBD | Core game NFT |
| VictoryMinter | TBD | Victory screenshot NFTs |
| CellRegistry | TBD | Cell formation tracking |
| TradingPost | TBD | One-way card gifting |
| GamePaymaster | TBD | Gasless transaction sponsor |

## Key Roles

```solidity
// ScrollCard
MINTER_ROLE      // Can mint new cards
TRADING_POST     // Can transfer soulbound cards
DUNGEON_ORACLE   // Can update card attributes

// VictoryMinter
ORACLE_ROLE      // Can sign victory proofs
VERIFIER_ROLE    // Can approve gasless mints

// CellRegistry
GAME_MASTER      // Can form/disband cells
BATTLE_ORACLE    // Can record battles

// TradingPost
GAME_MASTER      // Can configure system

// GamePaymaster
OPERATOR_ROLE    // Can configure sponsorships
```

## Critical Functions

### ScrollCard
```solidity
mintCard(to, dungeon, tier, frequency, power, curse, durability, seed, frameUrl)
batchMintCards(recipients, dungeons, tiers, seeds)
getCard(tokenId) -> (attributes, frameMetadata)
getCardsByOwner(owner) -> tokenIds[]
setBinding(tokenId, bound) // TRADING_POST only
```

### VictoryMinter
```solidity
mintVictory(to, battleId, participants, score, screenshotCID, metadataCID, battleHash, signature)
mintVictoryGasless(to, battleId, participants, score, screenshotCID, metadataCID, battleHash, validUntil, signature)
getFrameMetadata(tokenId) -> JSON string
validateFrameAction(tokenId, user, signature) -> bool
```

### CellRegistry
```solidity
formCell(name, crestCID, faction) -> cellId
joinCell(cellId)
leaveCell(cellId)
recordBattle(cellId, dungeonId, score, isVictory, battleHash, cardIds, participants, outcomeCID) -> battleId
getCell(cellId) -> Cell
getCellMembers(cellId) -> addresses[]
getBattle(battleId) -> Battle
```

### TradingPost
```solidity
createGift(to, cardIds, message, wrappingCID, expiresIn) -> giftId
claimGift(giftId)
giftDirect(to, cardIds, message)
refundExpiredGift(giftId)
getPendingGifts(recipient) -> giftIds[]
```

### GamePaymaster
```solidity
validatePaymasterUserOp(userOp, userOpHash, maxCost) -> (context, validationData)
configureSponsorship(target, enabled, dailyLimit, maxGasLimit, maxCostPerOp)
getUserRemainingOps(user, target) -> uint256
```

## Data Structures

### ScrollCard.CardAttributes
```solidity
struct CardAttributes {
    Dungeon dungeon;         // THE_SPIRE, THE_MAZE, THE_ABYSS, THE_MIRROR, THE_FORGE, THE_VOID
    Tier tier;               // ASH, IRON, SILVER, GOLD, PRISM
    Frequency frequency;     // STATIC, PULSING, RESONANT, INFINITE
    uint8 power;             // 0-100
    uint8 curse;             // 0-100
    uint16 durability;       // Uses remaining (0 = infinite)
    uint256 mintedAt;
    uint256 dungeonSeed;     // Procedural generation
    address originalOwner;
    bool isBound;            // Soulbound status
}
```

### CellRegistry.Cell
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
```

### TradingPost.Gift
```solidity
struct Gift {
    uint256 giftId;
    address from;
    address to;
    uint256[] cardIds;
    string message;
    uint256 createdAt;
    uint256 expiresAt;
    bool isClaimed;
    bool isRefunded;
    bytes32 giftHash;
}
```

## Gas Estimates (Base L2)

| Operation | Estimated Gas |
|-----------|---------------|
| mintCard | ~120,000 |
| batchMint (10) | ~450,000 |
| mintVictory | ~150,000 |
| mintVictoryGasless | ~180,000 |
| formCell | ~80,000 |
| joinCell | ~60,000 |
| recordBattle | ~100,000 |
| createGift (1 card) | ~90,000 |
| createGift (5 cards) | ~150,000 |
| claimGift | ~70,000 |
| UserOperation (paymaster) | +~30,000 base |

## Security Checklist

- [ ] Oracle keys stored in HSM/secrets manager
- [ ] Paymaster has sufficient ETH deposits
- [ ] All admin functions have timelock
- [ ] Emergency pause tested
- [ ] Rate limits configured
- [ ] IPFS pinning service active
- [ ] Farcaster frame endpoints secured
- [ ] Battle proofs cryptographically verified
- [ ] RNG uses commit-reveal pattern
- [ ] Contract upgrade path documented

## Integration Snippets

### Mint Card via Paymaster
```typescript
const userOp = await smartAccount.buildUserOp({
    to: scrollCardAddress,
    data: scrollCardInterface.encodeFunctionData("mintCard", [...])
});

const paymasterData = await paymasterAPI.getPaymasterData(userOp);
userOp.paymasterAndData = paymasterData;

const tx = await smartAccount.sendUserOperation(userOp);
```

### Gift Cards
```typescript
// 1. Approve TradingPost
await scrollCard.approve(tradingPostAddress, tokenId);

// 2. Create gift
await tradingPost.createGift(
    recipient,
    [tokenId1, tokenId2],
    "Good luck in the Void!",
    wrappingCID,
    7 * 24 * 60 * 60 // 7 days
);
```

### Get Cell History
```typescript
const cell = await cellRegistry.getCell(cellId);
const members = await cellRegistry.getCellMembers(cellId);
const battles = await cellRegistry.getCellBattleHistory(cellId, 10);
const formationHistory = await cellRegistry.getFormationHistory(cellId);
```

## Farcaster Frame Format

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://.../victory/42/image" />
<meta property="fc:frame:button:1" content="View Victory" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="https://.../victory/42" />
<meta property="fc:frame:button:2" content="Mint" />
<meta property="fc:frame:button:2:action" content="tx" />
```

## Error Codes

| Error | Contract | Meaning |
|-------|----------|---------|
| ScrollCard: Tier supply exhausted | ScrollCard | Max supply for this dungeon/tier reached |
| ScrollCard: Card is soulbound | ScrollCard | Transfer through TradingPost only |
| VictoryMinter: Battle already has victory | VictoryMinter | One victory NFT per battle |
| VictoryMinter: Invalid signature | VictoryMinter | Oracle signature verification failed |
| CellRegistry: Cell not active | CellRegistry | Cell has been disbanded |
| CellRegistry: Cell is full | CellRegistry | Max 6 members reached |
| TradingPost: Not card owner | TradingPost | Sender doesn't own the card |
| TradingPost: Gift expired | TradingPost | Claim window closed |
| GamePaymaster: Daily limit reached | GamePaymaster | User hit daily sponsored ops limit |
