# The Inversion Excursion - Test Suite

Comprehensive test coverage for The Inversion Excursion mini app, including unit tests, integration tests, E2E tests, contract tests, and security tests.

## Test Structure

```
tests/
├── unit/                          # Unit Tests (Jest)
│   ├── card-balance.test.ts       # Card power/efficiency calculations
│   ├── resonance-math.test.ts     # Resonance/dissonance algorithms
│   ├── battle-resolution.test.ts  # Combat mechanics
│   └── frequency-matching.test.ts # Frequency detection algorithms
├── integration/                   # Integration Tests (Jest)
│   ├── synsync-resonance.test.ts  # Audio engine + game mechanics
│   ├── zora-minting.test.ts       # NFT minting flow (mocked)
│   ├── farcaster-sdk.test.ts      # Frame SDK integration
│   └── api-routes.test.ts         # API route handlers
├── e2e/                           # E2E Tests (Playwright)
│   ├── game-loop.spec.ts          # Full game flow
│   ├── mobile-responsiveness.spec.ts  # Mobile/Farcaster app
│   ├── global-setup.ts            # E2E setup
│   └── global-teardown.ts         # E2E teardown
├── contracts/                     # Contract Tests (Hardhat)
│   ├── ScrollCard.test.ts         # NFT minting & soulbound
│   ├── CellRegistry.test.ts       # Cell formation & battles
│   ├── TradingPost.test.ts        # Gift system
│   └── GamePaymaster.test.ts      # Gasless transactions
├── security/                      # Security Tests (Jest)
│   └── security.test.ts           # Anti-cheat, validation, vulns
├── fixtures.ts                    # Test data fixtures
├── setup.ts                       # Jest setup
└── setup-integration.ts           # Integration test setup
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Security tests
npm run test:security

# Contract tests
npm run test:contracts

# E2E tests
npm run test:e2e
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Test Categories

### 1. Unit Tests

Tests individual functions and algorithms in isolation.

**Coverage:**
- Card balance calculations (power scores, tier multipliers, curse penalties)
- Resonance/dissonance math (frequency matching, multipliers)
- Battle resolution logic (damage calc, turn management, victory conditions)
- Frequency matching algorithms (card→frequency mapping, entrainment verification)

### 2. Integration Tests

Tests component interactions and API integrations.

**Coverage:**
- SynSync audio engine + resonance calculator
- Zora minting flow (with mocks)
- Farcaster SDK initialization
- API route handlers (Next.js)

### 3. E2E Tests

Tests complete user journeys using Playwright.

**Coverage:**
- Full game loop: build deck → form cell → battle → mint
- Mobile responsiveness (Farcaster app viewport)
- Audio playback and entrainment flow
- Wallet connection and transactions

### 4. Contract Tests

Tests Solidity smart contracts using Hardhat.

**Coverage:**
- `ScrollCard.sol`: Minting, soulbound mechanics, metadata
- `CellRegistry.sol`: Cell formation, membership, battle recording
- `TradingPost.sol`: One-way gifting system
- `GamePaymaster.sol`: ERC-4337 gasless transactions

### 5. Security Tests

Tests security measures and vulnerability protections.

**Coverage:**
- Input validation and sanitization
- Rate limiting
- Anti-cheat validation
- Contract vulnerability checks (reentrancy, overflow, access control)

## Configuration

### Jest Configuration (`jest.config.ts`)

- **Unit tests**: Fast, isolated tests for algorithms and logic
- **Integration tests**: Database-connected tests for API and services
- **Security tests**: Focused security validation tests

### Playwright Configuration (`playwright.config.ts`)

- Multiple browser projects (Chromium, Firefox, WebKit)
- Mobile viewports (iPhone 14, Pixel 7)
- Farcaster app-specific viewport

### Hardhat Configuration (`hardhat.config.ts`)

- Network configs for local, testnet, and mainnet
- Gas reporting
- Coverage reporting

## Environment Variables

Create a `.env.test` file:

```env
# Database
DATABASE_URL="file:./test.db"

# Redis (for rate limiting)
REDIS_URL="redis://localhost:6379"

# Blockchain
BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
BASE_RPC_URL="https://mainnet.base.org"
PRIVATE_KEY="0x..."

# APIs
ZORA_API_KEY="..."
PINATA_JWT="..."

# Testing
CI=true
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/test-pipeline.yml`):

1. **Unit Tests** → Coverage report
2. **Integration Tests** → With Redis service
3. **Contract Tests** → Hardhat + coverage
4. **Security Tests** → Slither analysis + npm audit
5. **E2E Tests** → Playwright
6. **Build Verification** → Next.js + Hardhat compile
7. **Deploy** → Vercel (production on main branch)

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateResonance } from '@/synsync-bridge/ResonanceCalculator';

describe('Resonance Calculation', () => {
  it('should return perfect resonance for exact match', () => {
    const result = calculateResonance(10, 'meditation');
    expect(result.multiplier).toBe(1.5);
    expect(result.isResonant).toBe(true);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('player can build deck', async ({ page }) => {
  await page.goto('/deck');
  await page.click('[data-testid="collection-card"]').first();
  await expect(page.locator('[data-testid="deck-card"]')).toHaveCount(1);
});
```

### Contract Test Example

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('ScrollCard', () => {
  it('should mint token', async () => {
    await expect(contract.mint(addr1.address, 1, 0, 0))
      .to.emit(contract, 'ScrollMinted');
  });
});
```

## Fixtures

Use `tests/fixtures.ts` for consistent test data:

```typescript
import { mockCards, mockCell, createMockPlayer } from '@tests/fixtures';

const card = mockCards[0];
const player = createMockPlayer({ reputation: 200 });
```

## Best Practices

1. **Test isolation**: Each test should be independent
2. **Descriptive names**: Test names should describe the behavior
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Use fixtures**: Keep test data consistent
5. **Mock external APIs**: Don't hit real services in tests
6. **Clean up**: Reset state between tests

## Troubleshooting

### Common Issues

**Jest module resolution errors:**
```bash
# Check tsconfig paths are correct
npx tsc --noEmit
```

**Playwright browser not found:**
```bash
npx playwright install
```

**Hardhat compilation errors:**
```bash
npx hardhat clean
npx hardhat compile
```

**Database connection issues:**
```bash
# Ensure SQLite file exists
npx prisma db push
```

## License

MIT - See LICENSE file
