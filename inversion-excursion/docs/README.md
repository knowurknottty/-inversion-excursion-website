# The Inversion Excursion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Base Network](https://img.shields.io/badge/Network-Base-0052FF.svg)](https://base.org)
[![Farcaster](https://img.shields.io/badge/Farcaster-Frame-purple.svg)](https://farcaster.xyz)

> **A Farcaster-integrated card game where you fight The System together — not each other.**

The Inversion Excursion is a blockchain-based card game that combines:
- 🎴 **NFT Card Collection** — Mint Scroll Cards from screenshots
- 🧠 **SynSync Integration** — Brainwave entrainment boosts your gameplay
- 🤝 **Co-op Battles** — Form Cells (3-7 players) to fight dungeons
- 🔮 **WYRD Etymology** — Word origins become game mechanics

Every card is a *cursed blessing* — The Pedant gives knowledge but costs flexibility. The game IS the Inversion: you win by understanding how your own deck limits you.

---

## 🎮 How to Play

### Quick Start

1. **Connect Your Wallet** — Use any Farcaster-compatible wallet
2. **Mint Your First Card** — Screenshot from the book becomes a Scroll Card
3. **Join or Create a Cell** — Find 2-6 other players to form a Frequency Warrior Cell
4. **Run a SynSync Protocol** — Entrain your brainwaves for battle bonuses
5. **Enter a Dungeon** — Fight The System together in turn-based combat
6. **Mint Your Victory** — Capture the moment as an NFT

### The Seven Dungeons

| Dungeon | Theme | Mechanic |
|---------|-------|----------|
| **The Ivory Tower** | Credentials | Cards require "degrees" to play |
| **The Five Scrolls** | Narrative control | Rotating elemental resistances |
| **The Seven Dungeons** | Recursion | Each victory adds a debuff |
| **The Shadow Archive** | Projection | Your deck is mirrored against you |
| **The Mint of Chains** | Financialization | Every action costs something |
| **The Algorithm** | Engagement | Predictable patterns, hidden counters |
| **Transmission** | Final boss | Uses YOUR cards against you |

### Card Types

Cards represent inverted dungeon powers — you WIELD what once oppressed you:

- **The Pedant** — +3 Intellect (see enemy moves), -1 Speed (analysis paralysis)
- **The Golem** — +5 Defense (shield all), -2 Mobility (can't retreat)
- **The Puppeteer** — Control enemy for 1 turn, lose 2 cards (strings cut)
- **The Inquisitor** — Purge all debuffs, must reveal hand (confession)
- **The Alchemist** — Heal 50% HP, discard 3 cards (transmutation cost)
- **The Feed** — Draw 4 cards, opponent heals 20% (symbiosis)
- **The Identifier** — Copy enemy's best card, lose identity (random discard)

### Frequency Alignment

Cards have **frequencies** (from SynSync protocols):

| Frequency | Hz Range | Effect |
|-----------|----------|--------|
| Gamma | 30-100 | High damage, quick burnout |
| Beta | 14-30 | Balanced, intellect boost |
| Alpha | 8-14 | Defensive, healing |
| Theta | 4-8 | Creative, unpredictable |
| Delta | 0.5-4 | Deep power, slow activation |
| Schumann | 7.83 | Earth resonance, team buffs |
| 432 Hz | — | Universal harmony, rare |

**Resonance**: Matching frequencies in your hand creates combo bonuses.
**Dissonance**: Mismatched frequencies create penalties.

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** — App Router, Server Components
- **React 18** — Concurrent features
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Card animations, battle effects

### Backend
- **Next.js API Routes** — Serverless functions
- **Prisma ORM** — Type-safe database
- **PostgreSQL** — Primary database
- **Redis** — Rate limiting, caching

### Blockchain (Base Network)
- **ScrollCard.sol** — Core NFT contract (ERC-721)
- **VictoryMinter.sol** — Achievement minting
- **CellRegistry.sol** — Clan/Cell management
- **TradingPost.sol** — One-way gifting
- **GamePaymaster.sol** — ERC-4337 gasless transactions

### Integrations
- **Farcaster Frame SDK** — Social gameplay
- **SynSync API** — Brainwave entrainment
- **Zora Coins SDK** — NFT minting infrastructure
- **Viem** — Ethereum interactions
- **SIWE** — Sign-In with Ethereum

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for production)
- Base network wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/inversion-excursion.git
cd inversion-excursion

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inversion_excursion"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Ethereum
ETHEREUM_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_KEY"

# Farcaster
FARCASTER_HUB_URL="https://hub.pinata.cloud"

# SynSync
SYNSYNC_API_URL="https://api.synsync.pro"
SYNSYNC_API_KEY="your-synsync-api-key"

# Contracts
NFT_CONTRACT_ADDRESS="0x..."
BATTLE_CONTRACT_ADDRESS="0x..."
```

---

## 📁 Project Structure

```
inversion-excursion/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # SIWE authentication
│   │   ├── battle/        # Battle engine
│   │   ├── cell/          # Cell management
│   │   ├── mint/          # Card minting
│   │   └── synsync/       # Entrainment verification
│   ├── battle/            # Battle UI
│   ├── cell/              # Cell formation UI
│   ├── deck/              # Deck builder
│   └── page.tsx           # Home
├── components/            # React components
│   ├── battle/           # Battle interface
│   ├── cards/            # Card displays
│   ├── cells/            # Cell UI
│   └── shared/           # Common components
├── contracts/            # Solidity smart contracts
│   ├── ScrollCard.sol
│   ├── VictoryMinter.sol
│   ├── CellRegistry.sol
│   ├── TradingPost.sol
│   └── GamePaymaster.sol
├── lib/                  # Utilities
│   ├── auth.ts          # Authentication
│   ├── validation.ts    # Zod schemas
│   ├── rate-limit.ts    # Rate limiting
│   └── errors.ts        # Error handling
├── prisma/
│   └── schema.prisma    # Database schema
├── types/
│   └── index.ts         # TypeScript types
└── docs/                # Documentation
    ├── README.md
    ├── DEVELOPMENT.md
    ├── ARCHITECTURE.md
    ├── GAME_GUIDE.md
    ├── API.md
    ├── CONTRACTS.md
    └── SECURITY.md
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run contract tests
forge test
```

---

## 🎨 Design Philosophy

### The Inversion as Game Mechanic

The core insight: **every advantage carries a cost**. This mirrors the book's message about how systems of control invert to become tools of liberation.

- Cards that reveal enemy moves make you predictable
- Defense makes you immobile
- Knowledge creates obligation

### Co-op Not PvP

Players fight The System together. Victory requires:
- Cell coordination
- Frequency alignment
- Strategic sacrifice

### SynSync Requirement

You can't just buy wins. You must actually entrain your brainwaves:
- 10 Hz Alpha → Faster card draw
- 4 Hz Theta → Reduced curse effects
- 40 Hz Gamma + 963 Hz → Ultimate resonance chance

---

## 🤝 Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for contributor guidelines.

---

## 📜 License

MIT License — see LICENSE for details.

---

## 🔗 Links

- **Book**: [The Inversion Excursion](https://inversionexcursion.xyz)
- **Farcaster**: [@inversion](https://warpcast.com/inversion)
- **Documentation**: [docs.inversionexcursion.xyz](https://docs.inversionexcursion.xyz)
- **Smart Contracts**: [BaseScan](https://basescan.org)

---

## ⚠️ Security Notice

**CRITICAL**: This project is in active development. See [SECURITY.md](./SECURITY.md) for known issues and audit results. Do not deploy to mainnet without addressing critical findings.

---

*"The deck that defeats you is your own."*
