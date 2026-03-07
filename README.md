# The Inversion Excursion - Smart Contracts

Production-ready Solidity contracts for The Inversion Excursion mini app - a Farcaster Frame dungeon crawler with onchain progression.

## Overview

The Inversion Excursion is a fully onchain dungeon crawler where players form Cells (squads), battle through dungeons, and collect soulbound NFTs representing their achievements.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TheInversionExcursion                             │
│                         (Main Game Coordinator)                             │
│                    ┌──────────────────────────────────┐                     │
│                    │        UUPS Upgradeable          │                     │
└────────────────────┼──────────────────────────────────┼─────────────────────┘
                     │                                  │
        ┌────────────┼────────────┐    ┌───────────────┼──────────────┐
        ▼            ▼            ▼    ▼               ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────┐
│  ScrollCard  │ │Victory   │ │ CellRegistry │ │ TradingPost │ │GamePaymaster│
│  ERC-721 SBT │ │Minter SBT│ │   Registry   │ │ Gift System │ │ ERC-4337   │
└──────────────┘ └──────────┘ └──────────────┘ └─────────────┘ └────────────┘
       │                                                        │
       ▼                                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Farcaster Frame / Zora                              │
│                         (Metadata + Coins Integration)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Contracts

### 1. ScrollCard.sol
**ERC-721 with Dungeon/Tier/Frequency Attributes**
- Soulbound by default (non-transferable)
- Tradable only through TradingPost
- On-chain SVG generation with Farcaster Frame metadata
- Power score calculation based on tier × frequency

### 2. VictoryMinter.sol
**Achievement NFTs for Victories**
- Permanently soulbound (can never be transferred)
- Victory type determined by battle score
- Achievement tier: Bronze → Silver → Gold → Platinum → Diamond → Celestial
- On-chain metadata generation

### 3. CellRegistry.sol
**Cell Formation and Battle History**
- Form cells with leaders and members
- Track battle history and win/loss records
- Reputation system for cells
- Leaderboard support

### 4. TradingPost.sol
**One-way "Bullet Gifts" (No Marketplace)**
- Direct gifting only - no buy/sell functionality
- 7-day claim period with refund option
- Daily limits to prevent spam
- Escrow pattern for secure transfers

### 5. GamePaymaster.sol
**ERC-4337 Gasless Transactions**
- Sponsors gas for approved game operations
- Tier-based sponsorship limits
- EntryPoint integration for Account Abstraction

### 6. TheInversionExcursion.sol
**Main Game Coordinator (Upgradeable)**
- UUPS proxy pattern for upgrades
- Coordinates all game mechanics
- Role-based access control

## Features

### Soulbound Design
- ScrollCards: Tradable only through TradingPost
- Victory NFTs: Permanently non-transferable
- Prevents speculation, emphasizes achievement

### Farcaster Frame Support
- Frame-compatible metadata in token URIs
- Interactive buttons for viewing and gifting
- Embedded game links

### Zora Coins Compatible
- ScrollCard contract designed for Zora Coins integration
- Open minting interface for protocol integration

### Base Network Optimized
- Low gas costs (target < 0.02 ETH per major operation)
- EIP-1559 transaction support
- Optimized calldata usage

## Quick Start

### Prerequisites
```bash
# Node.js >= 18
node --version

# Foundry (optional, for Forge tests)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd inversion-excursion-contracts

# Install dependencies
npm install

# Install Foundry dependencies (if using Forge)
forge install
```

### Environment Setup
```bash
cp .env.example .env

# Edit .env with your values:
# PRIVATE_KEY=your_private_key
# BASE_RPC_URL=https://mainnet.base.org
# BASE_GOERLI_RPC_URL=https://goerli.base.org
# BASESCAN_API_KEY=your_basescan_api_key
```

### Compile
```bash
# Hardhat
npm run compile

# Foundry
forge build
```

### Test
```bash
# Hardhat tests
npm test

# Foundry tests
forge test

# Coverage
npm run test:coverage
forge coverage
```

### Deploy

#### Local Network
```bash
# Start local node
npm run node

# Deploy to local
npm run deploy:local
```

#### Base Goerli (Testnet)
```bash
npm run deploy:base-goerli
```

#### Base Mainnet
```bash
npm run deploy:base
```

### Foundry Deployment
```bash
# Set environment variables
export RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=your_key

# Deploy
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

## Contract Interactions

### Form a Cell
```javascript
const members = ["0x...", "0x..."];
await game.formCell(members);
```

### Enter Dungeon
```javascript
await game.enterDungeon(dungeonId, scrollCardId, {
  value: ethers.parseEther("0.001")
});
```

### Send Gift
```javascript
await tradingPost.sendBulletGift(
  recipientAddress,
  scrollCardId,
  "Enjoy this scroll!"
);
```

### Claim Gift
```javascript
const giftId = 1;
await tradingPost.claimGift(giftId);
```

## Gas Costs (Base Network)

| Operation | Gas | ~Cost @ 0.1 gwei |
|-----------|-----|-----------------|
| Mint ScrollCard | 145,000 | 0.0145 ETH |
| Mint Victory | 125,000 | 0.0125 ETH |
| Form Cell | 225,000 | 0.0225 ETH |
| Enter Dungeon | 85,000 | 0.0085 ETH |
| Send Gift | 165,000 | 0.0165 ETH |
| Claim Gift | 85,000 | 0.0085 ETH |

See [GAS_OPTIMIZATION.md](docs/GAS_OPTIMIZATION.md) for detailed analysis.

## Security

- OpenZeppelin libraries for battle-tested implementations
- ReentrancyGuard on all external functions
- Role-based access control
- UUPS proxy with upgrade authorization
- Soulbound enforcement at protocol level

See [SECURITY.md](docs/SECURITY.md) for comprehensive security analysis.

## Project Structure

```
.
├── contracts/
│   ├── TheInversionExcursion.sol    # Main game contract (upgradeable)
│   ├── ScrollCard.sol               # ERC-721 SBT for dungeon scrolls
│   ├── VictoryMinter.sol            # Achievement NFTs
│   ├── CellRegistry.sol             # Cell management
│   ├── TradingPost.sol              # Gift system
│   └── GamePaymaster.sol            # ERC-4337 paymaster
├── test/
│   ├── TheInversionExcursion.t.sol  # Foundry tests
│   └── TheInversionExcursion.test.js # Hardhat tests
├── script/
│   └── Deploy.s.sol                 # Foundry deployment script
├── scripts/
│   └── deploy.js                    # Hardhat deployment script
├── docs/
│   ├── GAS_OPTIMIZATION.md          # Gas analysis
│   └── SECURITY.md                  # Security considerations
├── hardhat.config.js                # Hardhat configuration
├── foundry.toml                     # Foundry configuration
└── package.json                     # Node.js dependencies
```

## Roles

| Role | Description |
|------|-------------|
| `DEFAULT_ADMIN_ROLE` | Contract ownership, role management |
| `MINTER_ROLE` | Mint ScrollCards and Victories |
| `GAME_MASTER_ROLE` | Record battles, complete dungeons |
| `TRADING_POST_ROLE` | Execute soulbound transfers |
| `UPGRADER_ROLE` | Upgrade proxy implementation |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Built with [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- Framework support from [Hardhat](https://hardhat.org/) and [Foundry](https://book.getfoundry.sh/)
- Deployed on [Base](https://base.org/)

## Contact

- **Security**: security@inversionexcursion.xyz
- **General**: hello@inversionexcursion.xyz
- **Twitter**: [@InversionExcursion](https://twitter.com/InversionExcursion)

---

*Built with ❤️ by the Inversion Collective*
