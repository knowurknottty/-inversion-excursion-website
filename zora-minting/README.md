# Zora Coins Integration - ScrollCard Minting System

Complete integration package for minting ScrollCard NFTs on Base network using Zora Coins protocol with gasless minting via paymaster.

## 📁 Structure

```
zora-minting/
├── contracts/
│   └── ScrollCard.sol          # ERC-721 smart contract
├── sdk/
│   ├── minting-service.ts      # Core minting service
│   ├── paymaster-client.ts     # Gasless minting integration
│   └── zora-client.ts          # Zora Protocol SDK wrapper
├── metadata/
│   └── schema.json             # NFT metadata JSON schema
├── docs/
│   ├── flow-diagram.md         # Visual minting flow
│   └── cost-estimation.md      # Gas and protocol fees
└── README.md                   # This file
```

## 🔄 Minting Flow

1. **Upload** → Player uploads screenshot from book
2. **Extract** → OCR + AI extracts chapter, dungeon, quote
3. **Generate** → Card stats computed from content rarity
4. **Mint** → Zora Coins SDK mints NFT on Base
5. **Deliver** → NFT arrives in player's wallet

## 💰 Cost Structure

| Component | Cost (USD) | Notes |
|-----------|------------|-------|
| Base Gas (mint) | $0.001 - $0.01 | L2 rollup efficiency |
| Zora Protocol Fee | 0% | Creator-first model |
| Paymaster Service | Variable | CDP or self-hosted |
| IPFS Storage | ~$0.0001 | Via Pinata/web3.storage |

## 🚀 Quick Start

```bash
# Install dependencies
npm install @zoralabs/protocol-sdk @zoralabs/coins-sdk viem@2.x

# Set environment variables
export ZORA_API_KEY=your_api_key
export PAYMASTER_RPC_URL=your_paymaster_url
export PRIVATE_KEY=your_deployer_key
```

## 📚 Documentation

- [Minting Flow Diagram](./docs/flow-diagram.md)
- [Cost Estimation](./docs/cost-estimation.md)
- [Zora Protocol Docs](https://ourzora.github.io/zora-protocol/)
- [Base Paymaster Guide](https://docs.base.org/cookbook/go-gasless)
