# Cost Estimation: Base Gas & Zora Protocol Fees

## Overview

This document provides detailed cost estimates for minting ScrollCard NFTs on Base network using Zora Coins protocol with gasless minting.

## Network: Base (Coinbase L2)

Base is an Ethereum L2 built on Optimism's OP Stack, offering:
- **Transaction Speed**: ~2 seconds
- **Finality**: ~1-2 minutes
- **EVM Compatibility**: 100%
- **Bridge**: Secure connection to Ethereum mainnet

## Cost Breakdown

### 1. Base Gas Fees

| Operation | Gas Units | Base Fee (gwei) | Total Gas Fee (ETH) | USD (~$2,500/ETH) |
|-----------|-----------|-----------------|---------------------|-------------------|
| Simple Transfer | 21,000 | 0.001 | 0.000000021 | $0.00005 |
| ERC-721 Mint | ~85,000 | 0.001 | 0.000000085 | $0.00021 |
| ERC-721 Mint (complex) | ~120,000 | 0.001 | 0.00000012 | $0.00030 |
| Metadata Storage (IPFS) | N/A | N/A | N/A | $0.0001 |

**Current Base Gas Metrics (March 2025):**
- Base Fee: ~0.001 gwei (consistently low)
- Priority Fee: 0.0001-0.001 gwei
- Average Mint Cost: **$0.001 - $0.01**

### 2. Zora Protocol Fees

Zora operates on a **creator-first, zero-protocol-fee** model:

| Fee Type | Standard | Notes |
|----------|----------|-------|
| Protocol Fee | **0%** | No platform fee on mints |
| Creator Fee | Configurable | Set by contract owner (0-10% typical) |
| Secondary Royalties | Configurable | Standard ERC-2981 support |

**Zora Coins SDK Fees:**
- Minting: **FREE** (no protocol fee)
- Trading: 0.5% platform fee (on secondary sales)
- Creation: FREE

### 3. Paymaster Service Costs

Option A: Coinbase Developer Platform (CDP)
```
Pricing: Free tier available
- 10,000 UserOperations/month: FREE
- Beyond 10,000: Contact sales
- Global limits: Configurable USD caps
```

Option B: Self-Hosted (Pimlico)
```
Pricing: Pay-per-use
- Per UserOp: ~$0.001-0.005
- Infrastructure: Self-managed
```

Option C: Third-Party (Biconomy/Gelato)
```
Biconomy:
- Starter: 1,000 tx/month free
- Growth: $99/month (10,000 tx)
- Enterprise: Custom

Gelato:
- Relay: ~$0.001/tx
- 1Balance: Prepaid credits
```

### 4. Storage Costs (IPFS)

| Service | Cost | Notes |
|---------|------|-------|
| Pinata | Free (1GB) / $20/mo | Reliable pinning |
| web3.storage | Free (5GB) / $10/mo | Protocol Labs |
| NFT.Storage | Free | Long-term preservation |
| Self-hosted | Server costs | Full control |

**Per-NFT Storage Cost:**
- Image (500KB): ~$0.0001
- Metadata (2KB): ~$0.000001
- **Total: ~$0.0001 per NFT**

## Total Cost Per Mint

### Scenario 1: Gasless (Paymaster)

| Component | Cost |
|-----------|------|
| Base Gas | $0.001 - $0.005 |
| Zora Protocol | $0 |
| Paymaster Service | $0 (if within limits) |
| IPFS Storage | $0.0001 |
| **Total** | **~$0.001 - $0.01** |

### Scenario 2: User Pays Gas

| Component | Cost |
|-----------|------|
| Base Gas | $0.001 - $0.005 |
| Zora Protocol | $0 |
| IPFS Storage | $0.0001 |
| **Total** | **~$0.001 - $0.005** |

## Scaling Estimates

### Monthly Projections

| Monthly Mints | Gas Costs | Storage | Paymaster | **Total** |
|---------------|-----------|---------|-----------|-----------|
| 1,000 | $1-5 | $0.10 | $0 | **$1.10 - $5.10** |
| 10,000 | $10-50 | $1 | $0 | **$11 - $51** |
| 100,000 | $100-500 | $10 | $50* | **$160 - $560** |
| 1,000,000 | $1,000-5,000 | $100 | $500* | **$1,600 - $5,600** |

*Paymaster costs apply beyond free tiers

### Annual Budget (100K mints/year)

| Category | Annual Cost |
|----------|-------------|
| Gas Fees | $1,200 - $6,000 |
| Storage | $120 |
| Paymaster/CDP | $0 - $600 |
| Infrastructure | $500 - $2,000 |
| **Total** | **~$2,000 - $9,000** |

## Optimization Strategies

### 1. Batch Minting
- Group multiple mints in single transaction
- Saves ~40% on gas per NFT
- Best for: Airdrops, rewards

### 2. Lazy Minting
- NFT created off-chain until first purchase
- Zero upfront cost
- Best for: Marketplaces, drops

### 3. L2 Efficiency
- Base consistently has lowest L2 fees
- Monitor Base gas: https://basescan.org/gastracker

### 4. Paymaster Limits
- Set per-user limits (e.g., $0.05/day)
- Set global limits (e.g., $100/month)
- Rotate between multiple paymasters

## Fee Comparison: Base vs Other Chains

| Chain | Mint Cost | Speed | Notes |
|-------|-----------|-------|-------|
| **Base** | $0.001-0.01 | 2s | ⭐ Recommended |
| Ethereum | $5-50 | 12s | Too expensive |
| Polygon | $0.001-0.01 | 2s | Good alternative |
| Arbitrum | $0.01-0.10 | 1s | Higher fees |
| Optimism | $0.01-0.10 | 2s | Higher fees |
| Solana | $0.0001 | 0.4s | Non-EVM |

## Implementation Tips

1. **Use ERC-721A** for batch minting (if applicable)
2. **Optimize contract** to minimize gas usage
3. **Monitor paymaster limits** to avoid interruptions
4. **Cache metadata** to reduce IPFS calls
5. **Use Base native USDC** for cost tracking

## References

- [Base Gas Tracker](https://basescan.org/gastracker)
- [Zora Protocol Docs](https://ourzora.github.io/zora-protocol/)
- [Coinbase CDP Pricing](https://www.coinbase.com/developer-platform/pricing)
- [Pimlico Paymaster](https://docs.pimlico.io/)
