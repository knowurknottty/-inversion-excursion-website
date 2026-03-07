# Deployment Infrastructure

Complete DevOps setup for The Inversion Excursion mini app.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Fill in environment variables
# See docs/ENVIRONMENT_VARIABLES.md

# 4. Deploy contracts to testnet
npm run deploy:testnet

# 5. Deploy frontend to Vercel
vercel --prod
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │  API Routes  │  │  Middleware  │          │
│  │   Frontend   │  │  /api/*      │  │  Auth/Rate   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                │                  │                   │
│         ▼                ▼                  ▼                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │              Vercel Analytics                    │          │
│  │              Sentry Error Tracking               │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Base Network                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Battleground│  │CellRegistry │  │  Catalyst   │             │
│  │   (Game)    │  │  (ERC-6551) │  │  (ERC-20)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Inversion   │  │ Resonance   │  │Achievements │             │
│  │  Card       │  │   Keeper    │  │   (SBT)     │             │
│  │  (ERC-721)  │  │ (Paymaster) │  │  (ERC-5192) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                  │                   │
│         ▼                ▼                  ▼                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │           Basescan Verification                  │          │
│  │           Event Monitoring                       │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   players   │  │    cells    │  │   battles   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │player_cards │  │    txs      │  │achievements │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Realtime   │  │   Auth      │  │   Storage   │             │
│  │  Subs       │  │  (wallets)  │  │  (metadata) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing (`npm test`)
- [ ] Lint checks passing (`npm run lint`)
- [ ] Environment variables configured
- [ ] Contract addresses documented
- [ ] GitHub secrets configured

### Smart Contract Deployment

- [ ] Deploy to Base Sepolia
- [ ] Verify contracts on Basescan
- [ ] Run integration tests
- [ ] Deploy to Base Mainnet
- [ ] Verify mainnet contracts
- [ ] Update frontend environment

### Frontend Deployment

- [ ] Configure Vercel project
- [ ] Set environment variables
- [ ] Deploy to preview
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Configure custom domain

### Database Setup

- [ ] Create Supabase project
- [ ] Run migrations
- [ ] Set up RLS policies
- [ ] Configure backups
- [ ] Generate TypeScript types

### Monitoring

- [ ] Enable Vercel Analytics
- [ ] Configure Sentry
- [ ] Deploy contract event monitor
- [ ] Set up alerting
- [ ] Test error tracking

---

## Scripts

### Contract Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Verify contracts
npm run verify

# Interactive deployment
./scripts/deploy.sh testnet
```

### Frontend Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit
```

### Database Scripts

```bash
# Run migrations
npx supabase db push

# Reset database
npx supabase db reset

# Generate types
npx supabase gen types typescript > types/database.ts
```

---

## CI/CD Pipeline

### Workflow Triggers

| Trigger | Action |
|---------|--------|
| PR to `develop` | Lint, test, deploy preview |
| Push to `develop` | Deploy to testnet |
| PR to `main` | Full test suite, preview deploy |
| Push to `main` | Deploy to production |

### Pipeline Stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Lint    │ → │   Test   │ → │ Security │ → │  Deploy  │ → │  Notify  │
│  + Type  │   │ Contracts│   │  Audit   │   │  + Verify│   │  Slack   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

---

## File Structure

```
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              # Main CI/CD pipeline
│       ├── deploy-contracts.yml   # Manual contract deployment
│       └── database.yml           # Database migrations
├── contracts/
│   ├── Battleground.sol
│   ├── CellRegistry.sol
│   ├── FrequencyCatalyst.sol
│   ├── InversionCard.sol
│   ├── ResonanceKeeper.sol
│   └── Achievements.sol
├── deployments/
│   ├── baseSepolia/
│   │   └── latest.json
│   └── base/
│       └── latest.json
├── docs/
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── MONITORING_SETUP.md
│   └── DEPLOYMENT.md (this file)
├── scripts/
│   ├── deploy.js                  # Hardhat deployment script
│   └── deploy.sh                  # Interactive deployment script
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── vercel.json                    # Vercel configuration
├── hardhat.config.js
├── foundry.toml
└── package.json
```

---

## Troubleshooting

### Contract Deployment Issues

| Issue | Solution |
|-------|----------|
| "Insufficient funds" | Check wallet balance on Base |
| "Nonce too low" | Wait for pending transactions or reset nonce |
| "Gas price too low" | Increase gas settings in hardhat.config.js |
| "Verification failed" | Wait 30s after deployment before verifying |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| "Build failed" | Check for TypeScript errors (`npx tsc`) |
| "Environment variable not found" | Check Vercel dashboard env vars |
| "API route timeout" | Increase function timeout in vercel.json |

### Database Issues

| Issue | Solution |
|-------|----------|
| "Migration failed" | Check SQL syntax, run `supabase db reset` locally |
| "RLS policy error" | Verify policy definitions, check auth context |
| "Connection refused" | Check Supabase project status |

---

## Security Checklist

### Smart Contracts

- [ ] Slither analysis passing
- [ ] Unit tests > 90% coverage
- [ ] Integration tests passing
- [ ] Admin keys secured (hardware wallet)
- [ ] Timelock on critical functions
- [ ] Emergency pause functionality

### Frontend

- [ ] No private keys in client code
- [ ] Input validation on all forms
- [ ] Rate limiting on API routes
- [ ] CSP headers configured
- [ ] Dependencies audited (`npm audit`)

### Infrastructure

- [ ] GitHub secrets encrypted
- [ ] Vercel access restricted
- [ ] Supabase RLS enabled
- [ ] Database backups configured
- [ ] Monitoring alerts active

---

## Support

- **Contract Issues**: Check Basescan for transaction details
- **Frontend Issues**: Review Vercel function logs
- **Database Issues**: Check Supabase logs and query performance
- **General**: Open issue in GitHub repository

---

## Resources

- [Base Documentation](https://docs.base.org)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Foundry Documentation](https://book.getfoundry.sh)
