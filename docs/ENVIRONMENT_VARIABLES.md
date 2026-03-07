# Environment Variables Documentation

This document describes all environment variables required for The Inversion Excursion deployment.

## Table of Contents
- [Frontend Variables](#frontend-variables)
- [Backend Variables](#backend-variables)
- [Contract Deployment Variables](#contract-deployment-variables)
- [Monitoring Variables](#monitoring-variables)
- [CI/CD Secrets](#cicd-secrets)

---

## Frontend Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FARCASTER_APP_ID` | Your Farcaster app ID from the Developer Portal | `inversion-excursion` |
| `NEXT_PUBLIC_URL` | Production URL of your application | `https://inversionexcursion.xyz` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abcdefgh12345678.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbG...` |
| `NEXT_PUBLIC_BASE_RPC_URL` | Public Base RPC endpoint | `https://mainnet.base.org` |

### Contract Addresses (Auto-populated after deployment)

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_CONTRACT_BATTLEGROUND` | Battleground contract address | Deployment output |
| `NEXT_PUBLIC_CONTRACT_CELL_REGISTRY` | CellRegistry contract address | Deployment output |
| `NEXT_PUBLIC_CONTRACT_FREQUENCY_CATALYST` | FrequencyCatalyst token address | Deployment output |
| `NEXT_PUBLIC_CONTRACT_INVERSION_CARD` | InversionCard NFT address | Deployment output |
| `NEXT_PUBLIC_CONTRACT_RESONANCE_KEEPER` | ResonanceKeeper paymaster address | Deployment output |
| `NEXT_PUBLIC_ZORA_COLLECTION_BASE` | Zora 1155 collection address | Zora deployment |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | - |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Vercel Analytics ID | Auto-detected |

---

## Backend Variables

### Supabase (Server-side)

| Variable | Description | Location |
|----------|-------------|----------|
| `SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL | Vercel/Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** service role key | Supabase Dashboard |
| `SUPABASE_PROJECT_REF` | Project reference ID | Project Settings |
| `SUPABASE_ACCESS_TOKEN` | CLI access token | Account Settings |

### Zora API

| Variable | Description | Source |
|----------|-------------|--------|
| `ZORA_API_KEY` | Zora API key for minting | [Zora Dev Portal](https://developer.zora.co) |
| `ZORA_RPC_URL` | Zora-specific RPC endpoint | Optional override |

---

## Contract Deployment Variables

### Required for Deployment

| Variable | Description | Security |
|----------|-------------|----------|
| `PRIVATE_KEY` | Deployer wallet private key (with leading 0x) | **HIGHLY SENSITIVE** |
| `MAINNET_PRIVATE_KEY` | Production deployer key | **HIGHLY SENSITIVE** |
| `TESTNET_PRIVATE_KEY` | Testnet deployer key | **SENSITIVE** |

### RPC Endpoints

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_RPC_URL` | Base mainnet RPC URL | `https://mainnet.base.org` |
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia testnet RPC | `https://sepolia.base.org` |
| `BASE_GOERLI_RPC_URL` | (Deprecated) Base Goerli | `https://goerli.base.org` |

### Block Explorer API Keys

| Variable | Description | Source |
|----------|-------------|--------|
| `BASESCAN_API_KEY` | Basescan API key for verification | [Basescan](https://basescan.org/apis) |
| `COINMARKETCAP_API_KEY` | For gas price reporting | CoinMarketCap |

### Contract Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_CELL_SIZE` | Maximum members per cell | `5` |
| `FORMATION_COOLDOWN` | Seconds between cell formations | `3600` |
| `MAX_DAILY_GIFTS` | Max gift cards per day | `10` |
| `CLAIM_PERIOD` | Gift claim window in seconds | `604800` (7 days) |
| `ENTRY_FEE` | Battle entry fee in ETH | `0.001` |
| `BATTLE_COOLDOWN` | Seconds between battles | `300` |

---

## Monitoring Variables

### Sentry

| Variable | Description | Source |
|----------|-------------|--------|
| `SENTRY_DSN` | Error tracking DSN | Sentry Project Settings |
| `SENTRY_AUTH_TOKEN` | API auth token | Sentry Account Settings |
| `SENTRY_ORG` | Organization slug | Sentry URL |
| `SENTRY_PROJECT` | Project slug | Sentry Project |

### Vercel Analytics

| Variable | Description | Default |
|----------|-------------|---------|
| `VERCEL_WEB_ANALYTICS_ID` | Web Analytics ID | Auto-configured |
| `VERCEL_SPEED_INSIGHTS_ID` | Speed Insights ID | Auto-configured |

---

## CI/CD Secrets

### GitHub Actions Secrets

Configure these in your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets

| Secret | Description |
|--------|-------------|
| `TESTNET_PRIVATE_KEY` | Private key for testnet deployments |
| `MAINNET_PRIVATE_KEY` | Private key for mainnet deployments |
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia RPC endpoint |
| `BASE_RPC_URL` | Base mainnet RPC endpoint |
| `BASESCAN_API_KEY` | Basescan API key |

#### Vercel Integration

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

#### Supabase Integration

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token |
| `SUPABASE_PROJECT_REF` | Supabase project reference |

#### Sentry Integration

| Secret | Description |
|--------|-------------|
| `SENTRY_AUTH_TOKEN` | Sentry authentication token |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project slug |

#### Notifications (Optional)

| Secret | Description |
|--------|-------------|
| `SLACK_WEBHOOK_URL` | Slack webhook for deployment notifications |

---

## Environment File Templates

### `.env.example` (Development)

```bash
# Farcaster
NEXT_PUBLIC_FARCASTER_APP_ID=inversion-excursion-dev

# App URLs
NEXT_PUBLIC_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Base Network
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org

# Zora
ZORA_API_KEY=your-zora-api-key

# Contract addresses (from deployment)
NEXT_PUBLIC_CONTRACT_BATTLEGROUND=
NEXT_PUBLIC_CONTRACT_CELL_REGISTRY=
NEXT_PUBLIC_CONTRACT_FREQUENCY_CATALYST=
NEXT_PUBLIC_CONTRACT_INVERSION_CARD=
NEXT_PUBLIC_CONTRACT_RESONANCE_KEEPER=

# Monitoring (optional)
SENTRY_DSN=
```

### `.env.production` (Production)

```bash
# Farcaster
NEXT_PUBLIC_FARCASTER_APP_ID=inversion-excursion

# App URLs
NEXT_PUBLIC_URL=https://inversionexcursion.xyz

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key

# Base Network
BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Zora
ZORA_API_KEY=prod-zora-api-key

# Contract addresses
NEXT_PUBLIC_CONTRACT_BATTLEGROUND=0x...
NEXT_PUBLIC_CONTRACT_CELL_REGISTRY=0x...
NEXT_PUBLIC_CONTRACT_FREQUENCY_CATALYST=0x...
NEXT_PUBLIC_CONTRACT_INVERSION_CARD=0x...
NEXT_PUBLIC_CONTRACT_RESONANCE_KEEPER=0x...

# Monitoring
SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
SENTRY_ORG=your-org
SENTRY_PROJECT=inversion-excursion
```

---

## Security Best Practices

### 🔒 Critical Security Rules

1. **Never commit private keys** - Use environment variables or secret managers
2. **Use separate keys for testnet/mainnet** - Never reuse testnet keys for mainnet
3. **Rotate keys regularly** - Set calendar reminders for key rotation
4. **Use hardware wallets** for mainnet deployments (Ledger/Trezor)
5. **Enable 2FA** on all services (Vercel, Supabase, GitHub)
6. **Review GitHub Actions logs** - Ensure secrets aren't leaked in output

### Setting Up GitHub Secrets

```bash
# Use GitHub CLI to set secrets
gh secret set TESTNET_PRIVATE_KEY --body "0x..."
gh secret set MAINNET_PRIVATE_KEY --body "0x..."
gh secret set BASESCAN_API_KEY --body "your-api-key"
```

### Setting Up Vercel Environment Variables

```bash
# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_FARCASTER_APP_ID production
vercel env add BASE_RPC_URL production

# Pull environment for local development
vercel env pull .env.local
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Private key too short" | Ensure key has `0x` prefix and 64 hex characters |
| "Invalid RPC URL" | Check URL format and network connectivity |
| "Contract verification failed" | Wait 30-60 seconds after deployment before verifying |
| "Sentry DSN not working" | Check organization and project slugs match exactly |
| "Supabase connection refused" | Verify service role key, not anon key, for server operations |

### Validation Commands

```bash
# Validate private key format
node -e "console.log(/^0x[a-fA-F0-9]{64}$/.test(process.env.PRIVATE_KEY))"

# Check RPC connectivity
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $BASE_RPC_URL

# Test Supabase connection
npx supabase status
```
