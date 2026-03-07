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

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 Full README](./docs/README.md) | Project overview, how to play, tech stack |
| [🔧 Development Guide](./docs/DEVELOPMENT.md) | Contributor guide, local setup |
| [🏗️ Architecture](./docs/ARCHITECTURE.md) | System diagrams, data flow |
| [🎮 Game Guide](./docs/GAME_GUIDE.md) | Player guide, strategies |
| [📡 API Reference](./docs/API.md) | Endpoints, schemas |
| [📜 Contracts](./docs/CONTRACTS.md) | Smart contract reference |
| [🔒 Security](./docs/SECURITY.md) | Audit results, security info |
| [❓ FAQ](./docs/FAQ.md) | Frequently asked questions |
| [🔧 Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)
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

# Initialize database
npm run db:generate
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## 🎮 How to Play

1. **Connect Your Wallet** — Use any Farcaster-compatible wallet
2. **Mint Your First Card** — Screenshot from the book becomes a Scroll Card
3. **Join or Create a Cell** — Find 2-6 other players
4. **Run a SynSync Protocol** — Entrain your brainwaves for bonuses
5. **Enter a Dungeon** — Fight The System together
6. **Mint Your Victory** — Capture the moment as an NFT

See [GAME_GUIDE.md](./docs/GAME_GUIDE.md) for complete strategies.

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** — App Router, Server Components
- **React 18** — Concurrent features
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Card animations

### Backend
- **Next.js API Routes** — Serverless functions
- **Prisma ORM** — Type-safe database
- **PostgreSQL** — Primary database
- **Redis** — Rate limiting, caching

### Blockchain (Base Network)
- **ScrollCard.sol** — Core NFT contract
- **VictoryMinter.sol** — Achievement minting
- **CellRegistry.sol** — Cell management
- **TradingPost.sol** — One-way gifting
- **GamePaymaster.sol** — Gasless transactions

### Integrations
- **Farcaster Frame SDK** — Social gameplay
- **SynSync API** — Brainwave entrainment
- **Zora Coins SDK** — NFT minting
- **Viem** — Ethereum interactions
- **SIWE** — Sign-In with Ethereum

---

## 📡 API Endpoints

### Authentication
- `GET /api/auth/nonce` — Get SIWE nonce
- `POST /api/auth/verify` — Verify signature

### Cards
- `GET /api/cards/[id]` — Get card metadata
- `POST /api/mint` — Mint new card

### Cells
- `POST /api/cell/create` — Create new Cell
- `POST /api/cell/join` — Join existing Cell

### Battles
- `POST /api/battle/start` — Initialize battle
- `POST /api/battle/action` — Submit action

### SynSync
- `POST /api/synsync/verify` — Verify entrainment

### Leaderboard
- `GET /api/leaderboard` — Get rankings

See [API.md](./docs/API.md) for complete reference.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Contract tests
forge test
```

---

## 🤝 Contributing

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for:
- Setup instructions
- Code style guide
- Testing guidelines
- PR process

---

## ⚠️ Security Notice

**CRITICAL**: This project has known security issues. See [SECURITY.md](./docs/SECURITY.md) for:
- Audit results
- Critical findings
- Mitigation roadmap

**Do not deploy to mainnet without addressing critical issues.**

---

## 📜 License

MIT License — see LICENSE for details.

---

## 🔗 Links

- **Book**: [The Inversion Excursion](https://inversionexcursion.xyz)
- **Farcaster**: [@inversion](https://warpcast.com/inversion)
- **Discord**: [discord.gg/inversion](https://discord.gg/inversion)

---

*"The deck that defeats you is your own."*
