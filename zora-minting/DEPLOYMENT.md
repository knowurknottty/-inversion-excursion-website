# Deployment Guide

## Prerequisites

- Node.js 18+
- Base Sepolia ETH (for testnet)
- Base ETH (for mainnet)
- Coinbase Developer Platform account (for paymaster)
- Zora API key

## 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Fill in your values
```

### Required Environment Variables

```env
# Network
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CHAIN_ID=8453  # 84532 for Sepolia

# Zora
ZORA_API_KEY=your_zora_api_key

# Coinbase Developer Platform (for gasless minting)
CDP_API_KEY=your_cdp_api_key
CDP_PROJECT_ID=your_cdp_project_id

# IPFS
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=https://gateway.pinata.cloud

# Wallet (deployer)
DEPLOYER_PRIVATE_KEY=0x...  # Never commit this!

# Contract
SCROLLCARD_CONTRACT_ADDRESS=0x...  # After deployment
```

## 2. Contract Deployment

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install Dependencies

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### Deploy to Base Sepolia (Testnet)

```bash
# Source environment
source .env

# Deploy
forge create \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  contracts/ScrollCard.sol:ScrollCard \
  --constructor-args \
    "ScrollCards" \
    "SCROLL" \
    "0x0000000000000000000000000000000000000000"
```

### Deploy to Base Mainnet

```bash
forge create \
  --rpc-url $BASE_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  contracts/ScrollCard.sol:ScrollCard \
  --constructor-args \
    "ScrollCards" \
    "SCROLL" \
    "0x0000000000000000000000000000000000000000"
```

### Verify Contract

```bash
forge verify-contract \
  --chain-id 8453 \
  --num-of-optimizations 200 \
  --watch \
  --compiler-version v0.8.20 \
  YOUR_CONTRACT_ADDRESS \
  contracts/ScrollCard.sol:ScrollCard
```

## 3. Paymaster Setup (Coinbase CDP)

### 3.1 Create Project

1. Go to [Coinbase Developer Platform](https://www.coinbase.com/developer-platform)
2. Create a new project
3. Navigate to **Paymaster**

### 3.2 Configure Paymaster

1. Enable Paymaster
2. Add your ScrollCard contract to allowlist
3. Add `mintCard` function to allowlist
4. Set spending limits:
   - Per-user: $0.05 USD / 1 operation daily
   - Global: $100 USD / 2000 operations monthly

### 3.3 Get RPC URL

Copy the Paymaster RPC URL from the Configuration tab.

## 4. SDK Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## 5. Minting Flow Test

### Test Gasless Mint

```typescript
import { MintingService } from './sdk/minting-service';
import { getZoraClient } from './sdk/zora-client';
import { PaymasterClient, createCDPConfig } from './sdk/paymaster-client';

// Initialize
const zoraClient = getZoraClient(
  process.env.BASE_RPC_URL,
  process.env.ZORA_API_KEY
);

const paymasterConfig = createCDPConfig(
  process.env.CDP_API_KEY,
  process.env.CDP_PROJECT_ID
);

const mintingService = new MintingService(
  zoraClient,
  process.env.SCROLLCARD_CONTRACT_ADDRESS,
  { pinataJWT: process.env.PINATA_JWT },
  paymasterConfig
);

// Mint!
const result = await mintingService.mintCard({
  name: "Scroll of Ancient Wisdom",
  recipient: "0x...",
  quote: "In darkness, knowledge becomes flame...",
  extractedText: "Chapter 7: Crystal Caverns...",
  attributes: {
    power: 87,
    rarity: 4, // Epic
    chapter: 7,
    dungeon: "Crystal Caverns",
    extractedQuote: "In darkness, knowledge becomes flame..."
  }
});

console.log("Mint result:", result);
```

## 6. Production Checklist

- [ ] Contract deployed and verified on Base
- [ ] Paymaster configured with appropriate limits
- [ ] IPFS pinning service configured
- [ ] API keys secured (not in code)
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Monitoring/logging configured
- [ ] Backup RPC endpoints configured
- [ ] Emergency pause functionality tested

## 7. Cost Monitoring

### Track Paymaster Usage

```bash
# Check CDP dashboard regularly
# Set up alerts for:
# - 80% of global limit reached
# - Unusual per-user activity
# - Failed sponsorship rate > 5%
```

### Estimate Monthly Costs

| Mints/Month | Gas Cost | Paymaster | Storage | Total |
|-------------|----------|-----------|---------|-------|
| 1,000 | $1 | $0 | $0.10 | ~$1 |
| 10,000 | $10 | $0 | $1 | ~$11 |
| 100,000 | $100 | $50* | $10 | ~$160 |

*After free tier

## 8. Troubleshooting

### "Paymaster limit reached"
- Check CDP dashboard
- Increase limits or wait for reset

### "Contract not allowlisted"
- Verify contract address in CDP
- Re-add function signatures

### "IPFS upload failed"
- Check Pinata JWT validity
- Verify storage quota

### "Mint transaction reverted"
- Check contract state (paused?)
- Verify max supply not reached
- Confirm wallet has sufficient funds

## Support

- [Zora Docs](https://ourzora.github.io/zora-protocol/)
- [Base Docs](https://docs.base.org/)
- [CDP Support](https://www.coinbase.com/developer-platform/support)
