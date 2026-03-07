# Development Guide

This guide covers local development setup, contributor guidelines, and environment configuration for The Inversion Excursion.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Environment Variables](#environment-variables)
4. [Development Workflow](#development-workflow)
5. [Database Management](#database-management)
6. [Smart Contract Development](#smart-contract-development)
7. [Testing](#testing)
8. [Code Style](#code-style)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or 20.x | Runtime environment |
| npm | 9.x+ | Package manager |
| PostgreSQL | 14.x+ | Primary database |
| Git | 2.x+ | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| Redis | Production rate limiting |
| Foundry | Smart contract development |
| Docker | Containerized services |

### Accounts & API Keys

You'll need:
- [Alchemy](https://alchemy.com) or [Infura](https://infura.io) API key
- [Farcaster](https://farcaster.xyz) account (for testing Frames)
- [Pinata](https://pinata.cloud) or [NFT.Storage](https://nft.storage) (for IPFS)
- [SynSync Pro](https://synsync.pro) API access (optional)

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/inversion-excursion.git
cd inversion-excursion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

**Option A: Local PostgreSQL**

```bash
# Create database
createdb inversion_excursion

# Or using psql
psql -U postgres -c "CREATE DATABASE inversion_excursion;"
```

**Option B: Docker**

```bash
docker run -d \
  --name ie-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=inversion_excursion \
  -p 5432:5432 \
  postgres:15
```

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values (see [Environment Variables](#environment-variables) below).

### 5. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Optional: Open Prisma Studio
npm run db:studio
```

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/inversion_excursion` |
| `JWT_SECRET` | Secret for JWT signing | Minimum 32 characters |
| `NEXTAUTH_URL` | App URL for auth callbacks | `http://localhost:3000` |

### Blockchain Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ETHEREUM_RPC_URL` | Base network RPC | `https://base-mainnet.g.alchemy.com/v2/...` |
| `NFT_CONTRACT_ADDRESS` | ScrollCard contract | `0x...` |
| `BATTLE_CONTRACT_ADDRESS` | Battle registry | `0x...` |
| `CELL_REGISTRY_ADDRESS` | CellRegistry contract | `0x...` |
| `PAYMASTER_ADDRESS` | GamePaymaster contract | `0x...` |

### Farcaster Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FARCASTER_HUB_URL` | Farcaster Hub API | `https://hub.pinata.cloud` |
| `FARCASTER_APP_FID` | Your app's FID | `12345` |
| `FARCASTER_APP_MNEMONIC` | App signer mnemonic | Recovery phrase |

### SynSync Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SYNSYNC_API_URL` | SynSync API endpoint | `https://api.synsync.pro` |
| `SYNSYNC_API_KEY` | API authentication | `sk_live_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection | In-memory fallback |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `LOG_LEVEL` | Logging verbosity | `info` |
| `NODE_ENV` | Environment mode | `development` |

### Environment Files

```bash
.env.local          # Local development (not committed)
.env.example        # Template for new developers
.env.production     # Production defaults
```

---

## Development Workflow

### Branch Naming

```
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation
refactor/description   # Code refactoring
test/description       # Test additions
```

### Commit Messages

Follow conventional commits:

```
feat: add resonance burst animation
fix: correct card rarity calculation
docs: update API reference
refactor: simplify battle state machine
test: add cell formation tests
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with tests
3. Run full test suite
4. Update documentation
5. Submit PR with description
6. Require 2 approvals before merge

### Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests added for new features
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Types are correct
- [ ] No security vulnerabilities
- [ ] Documentation updated

---

## Database Management

### Prisma Commands

```bash
# Generate client after schema changes
npm run db:generate

# Create and apply migration
npm run db:migrate

# Apply pending migrations
npx prisma migrate deploy

# Reset database (destructive!)
npx prisma migrate reset

# Open Prisma Studio
npm run db:studio

# Push schema without migration (dev only)
npx prisma db push
```

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Create migration: `npx prisma migrate dev --name description`
4. Test migration: `npx prisma migrate deploy`
5. Commit both schema and migration

### Seeding Data

```bash
# Run seed script
npx prisma db seed

# Seed file location
prisma/seed.ts
```

Example seed:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test player
  await prisma.player.create({
    data: {
      fid: 12345,
      address: '0x...',
      reputation: 100,
    }
  })
}

main()
```

---

## Smart Contract Development

### Foundry Setup

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Deploy to local Anvil
anvil
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Contract Development Workflow

1. Write contract in `contracts/`
2. Add tests in `test/`
3. Run `forge test`
4. Deploy to testnet
5. Verify on Basescan
6. Update contract addresses in `.env.local`

### Local Contract Testing

```bash
# Start local node
anvil --fork-url $BASE_RPC

# Deploy contracts
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast

# Run contract tests
forge test --fork-url http://localhost:8545
```

---

## Testing

### Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── lib/
│   ├── api/
│   └── components/
├── integration/          # Integration tests
│   ├── battle/
│   ├── cell/
│   └── mint/
└── e2e/                 # End-to-end tests
    ├── deck-builder.spec.ts
    ├── battle.spec.ts
    └── cell-formation.spec.ts
```

### Running Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Contract tests
forge test

# All tests
npm run test:all
```

### Writing Tests

```typescript
// Example API test
import { describe, it, expect } from 'vitest'
import { mintCard } from '@/lib/cards'

describe('Card Minting', () => {
  it('should mint a card with valid data', async () => {
    const card = await mintCard({
      name: 'Test Card',
      rarity: 'COMMON',
      power: 50,
    })
    
    expect(card).toHaveProperty('id')
    expect(card.rarity).toBe('COMMON')
  })
  
  it('should reject invalid rarity', async () => {
    await expect(mintCard({
      name: 'Test Card',
      rarity: 'INVALID',
    })).rejects.toThrow()
  })
})
```

---

## Code Style

### TypeScript

- Use strict mode
- Explicit return types on exported functions
- No `any` types (use `unknown` with type guards)
- Prefer interfaces over type aliases for objects

```typescript
// Good
interface Card {
  id: string
  name: string
  power: number
}

function calculateDamage(card: Card): number {
  return card.power * 1.5
}

// Avoid
function calculateDamage(card: any) {
  return card.power * 1.5
}
```

### React Components

- Use functional components with hooks
- Props interface named `{ComponentName}Props`
- Default exports for pages
- Named exports for components

```typescript
// components/CardFrame.tsx
interface CardFrameProps {
  card: Card
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function CardFrame({ card, size = 'md', onClick }: CardFrameProps) {
  // ...
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Custom classes in `globals.css` for complex animations
- CSS variables for theme colors
- Mobile-first responsive design

```tsx
// Good
<div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-900">

// Avoid (unless complex animations)
<div className="card-container">
```

### File Naming

- Components: PascalCase (`CardFrame.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE in constants files
- Tests: `*.test.ts` or `*.spec.ts`

---

## Contributing Guidelines

### Getting Started

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit pull request

### Reporting Issues

Use GitHub Issues with templates:

- **Bug Report**: Describe expected vs actual behavior
- **Feature Request**: Explain use case and proposed solution
- **Security Issue**: See [SECURITY.md](./SECURITY.md)

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Credit original authors

### Attribution

When contributing code from other projects:
- Maintain original license headers
- Credit authors in comments
- Ensure license compatibility (MIT)

---

## Troubleshooting

### Common Issues

**Database connection fails**
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string format
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Prisma client errors**
```bash
# Regenerate client
npm run db:generate

# Clear cache
rm -rf node_modules/.prisma
npm run db:generate
```

**Type errors after schema change**
```bash
# Regenerate types
npm run db:generate

# Restart TypeScript server in IDE
```

**Rate limiting in development**
```bash
# Disable in .env.local
RATE_LIMIT_ENABLED=false
```

**Contract deployment fails**
```bash
# Check RPC URL
# Verify private key has funds on testnet
# Confirm compiler version matches
```

### Getting Help

- Discord: [The Inversion Excursion](https://discord.gg/...)
- Farcaster: [@inversion](https://warpcast.com/inversion)
- GitHub Discussions: [Q&A](https://github.com/.../discussions)

### Debug Mode

Enable detailed logging:

```bash
# .env.local
LOG_LEVEL=debug
DEBUG=ie:*
```

---

## Deployment

### Preview Deployments

Vercel automatically deploys PRs to preview URLs.

### Production Deployment

1. Merge PR to `main`
2. Run production migrations
3. Verify contract addresses
4. Check environment variables
5. Monitor error rates

### Database Migrations

```bash
# Production migration
npx prisma migrate deploy

# Verify migration applied
npx prisma migrate status
```

---

*Last updated: March 2026*
