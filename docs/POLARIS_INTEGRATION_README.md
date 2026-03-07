# Polaris Project Partnership Integration

## Overview

This package implements a **protocol-level charitable partnership** between EPWorld and Polaris Project, automatically donating **10% of all NFT mint proceeds** to Polaris Project's National Trafficking Hotline operations.

## Key Features

✅ **Immutable 10% Charity Rate** - Hardcoded in smart contract, cannot be changed  
✅ **Real-Time Transparency** - Every donation verifiable on-chain  
✅ **Player Impact Tracking** - Lifetime contribution counters  
✅ **Public Dashboard** - Complete donation history at `/transparency`  
✅ **Automatic Execution** - No manual intervention required  

## Quick Start

### 1. Install Dependencies

```bash
npm install wagmi viem @rainbow-me/rainbowkit
```

### 2. Configure Environment Variables

```bash
# .env.local
NEXT_PUBLIC_POLARIS_MINTER_ADDRESS=0x... # Your deployed contract
NEXT_PUBLIC_CHAIN_ID=8453                # Base mainnet
NEXT_PUBLIC_BLOCK_EXPLORER=https://basescan.org
```

### 3. Use the Components

```tsx
import { PolarisCharityMintCard } from '@/components/PolarisCharityMintCard';
import { PlayerImpactCounter } from '@/components/PlayerImpactCounter';

// In your mint page
<PolarisCharityMintCard
  contractAddress={CONTRACT_ADDRESS}
  metadataUri="ipfs://..."
  attributes={cardAttributes}
/>

// Show player's lifetime impact
<PlayerImpactCounter contractAddress={CONTRACT_ADDRESS} />
```

## Architecture

### Smart Contract (`PolarisCharityMinter.sol`)

```solidity
// Immutable configuration
address public immutable POLARIS_PROJECT_ADDRESS;
uint256 public constant CHARITY_BASIS_POINTS = 1000; // 10%
bytes32 public immutable PARTNERSHIP_COMMITMENT_HASH;

// Automatic donation on every mint
function mintWithCharity(string memory uri, CardAttributes memory attributes) 
    external 
    payable 
    returns (uint256) 
{
    uint256 donationAmount = (mintPrice * CHARITY_BASIS_POINTS) / MAX_BASIS_POINTS;
    
    // Automatic transfer to Polaris
    (bool success, ) = POLARIS_PROJECT_ADDRESS.call{value: donationAmount}("");
    require(success, "Donation failed");
    
    // Mint proceeds
    _safeMint(msg.sender, tokenId);
    
    emit DonationSent(POLARIS_PROJECT_ADDRESS, donationAmount, tokenId, "...");
}
```

### UI Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `PolarisCharityMintCard` | Real-time donation display in mint UI | `components/PolarisCharityMintCard.tsx` |
| `PlayerImpactCounter` | Lifetime player contribution tracker | `components/PlayerImpactCounter.tsx` |
| `PolarisTransparencyDashboard` | Public donation history dashboard | `components/PolarisTransparencyDashboard.tsx` |

## The 10% Commitment

### Immutable by Design

The charity rate is a `constant` in the smart contract:

```solidity
uint256 public constant CHARITY_BASIS_POINTS = 1000;
```

This means:
- Cannot be changed by contract owner
- Cannot be changed by anyone
- Verifiable by reading the contract
- Auditable by anyone

### Donation Calculation

```solidity
uint256 donationAmount = (mintPrice * 1000) / 10000;
// If mintPrice = 0.01 ETH
// donationAmount = 0.001 ETH (10%)
```

### Example Scenarios

| Mint Price | Donation (10%) | Protocol Receives |
|------------|----------------|-------------------|
| 0.01 ETH | 0.001 ETH | 0.009 ETH |
| 0.05 ETH | 0.005 ETH | 0.045 ETH |
| 0.1 ETH | 0.01 ETH | 0.09 ETH |

## User Experience

### Mint UI Display

The `PolarisCharityMintCard` component prominently displays:

```
┌─────────────────────────────────────┐
│  ❤️ This Mint Will Send             │
│     0.001 ETH                       │
│     to Polaris Project              │
│     National Trafficking Hotline    │
├─────────────────────────────────────┤
│  Your mints have sent 0.05 ETH      │
│  to survivor support                │
└─────────────────────────────────────┘
```

### Player Impact Message

The key messaging shown to users:

> "Your {N} mints have sent {X} ETH to survivor support"

### Impact Tiers

| Tier | ETH Contributed | Recognition |
|------|-----------------|-------------|
| New Supporter | 0+ | Welcome message |
| Rising Advocate | 0.1+ | Discord badge |
| Active Ally | 1+ | Priority access |
| Guardian Supporter | 5+ | Beta access |
| Champion Advocate | 10+ | Credits recognition |

## Deployment

### 1. Deploy Contract

```bash
# Set environment variables
export POLARIS_PROJECT_ADDRESS=0x...  # Get from Polaris Project
export PRIVATE_KEY=...
export BASE_RPC_URL=https://mainnet.base.org

# Deploy
npx hardhat run scripts/deploy-polaris-minter.ts --network base
```

### 2. Verify Partnership

```bash
# Verify the deployed contract
npx ts-node scripts/verify-partnership.ts --contract 0x...
```

### 3. Update Frontend

Update environment variables with deployed contract address.

## Verification

### On-Chain Verification

Anyone can verify the partnership:

```javascript
// Check Polaris address
const polarisAddress = await contract.POLARIS_PROJECT_ADDRESS();
// Expected: Polaris Project's verified donation address

// Check donation rate
const rate = await contract.CHARITY_BASIS_POINTS();
// Expected: 1000 (10%)

// Check commitment hash
const hash = await contract.PARTNERSHIP_COMMITMENT_HASH();
// Expected: SHA256 of partnership agreement
```

### Block Explorer Verification

1. View contract on [basescan.org](https://basescan.org)
2. Read `POLARIS_PROJECT_ADDRESS` - should match Polaris Project
3. Read `CHARITY_BASIS_POINTS` - should be 1000
4. View donation events in transaction logs

### Audit Trail

All donations are:
- Recorded on-chain via `DonationSent` events
- Indexed by the subgraph
- Exportable as CSV from dashboard
- Verifiable via block explorer

## Transparency Dashboard

The public dashboard at `/transparency` shows:

### Global Statistics
- Total ETH donated to date
- Number of charity mints
- Milestone achievements
- Current mint price

### Donation History
- Complete list of all donations
- Filterable by amount, time, address
- Exportable for accounting
- Links to block explorer for verification

### Partnership Verification
- Verified Polaris Project address
- Commitment hash
- Effective date
- Contract verification status

## Integration Examples

### Basic Mint Page

```tsx
// app/mint/page.tsx
export default function MintPage() {
  return (
    <div>
      <PlayerImpactCounter contractAddress={CONTRACT} />
      <PolarisCharityMintCard
        contractAddress={CONTRACT}
        metadataUri={metadata}
        attributes={attributes}
      />
    </div>
  );
}
```

### Custom Mint Button

```tsx
import { useWriteContract } from 'wagmi';

function CustomMintButton() {
  const { writeContract } = useWriteContract();
  
  const handleMint = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: POLARIS_MINTER_ABI,
      functionName: 'mintWithCharity',
      args: [uri, attributes],
      value: mintPrice,
    });
  };
  
  return <button onClick={handleMint}>Mint with Charity</button>;
}
```

### Display User Impact

```tsx
import { useReadContract } from 'wagmi';

function UserImpact() {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getPlayerImpact',
    args: [userAddress],
  });
  
  const [totalContribution, mintCount, impactLevel] = data || [];
  
  return (
    <div>
      <p>Your {mintCount} mints have sent {formatEther(totalContribution)} ETH</p>
      <badge>{impactLevel}</badge>
    </div>
  );
}
```

## Testing

### Local Testing

```bash
# Start local node
npx hardhat node

# Deploy to local
npx hardhat run scripts/deploy-polaris-minter.ts --network localhost

# Run verification
npx ts-node scripts/verify-partnership.ts --network localhost
```

### Test Donation Flow

```javascript
// Test that 10% goes to Polaris
const mintPrice = await contract.mintPrice();
const polarisBefore = await ethers.provider.getBalance(polarisAddress);

await contract.mintWithCharity(uri, attributes, { value: mintPrice });

const polarisAfter = await ethers.provider.getBalance(polarisAddress);
const donation = polarisAfter - polarisBefore;
const expected = (mintPrice * 1000n) / 10000n;

console.assert(donation === expected, 'Donation should be 10%');
```

## Security Considerations

### Smart Contract
- Immutable charity configuration (cannot be rug-pulled)
- ReentrancyGuard on all mint functions
- Pausable for emergency (does not affect donation logic)
- No admin ability to change Polaris address

### Financial
- Direct wallet-to-wallet transfers (no custody)
- Automatic execution (no manual intervention)
- Gas-optimized donation transfers

### Transparency
- All code open source
- Contract verified on block explorer
- Real-time donation tracking
- Community auditable

## Partnership Agreement

See: [`docs/POLARIS_PARTNERSHIP_AGREEMENT.md`](docs/POLARIS_PARTNERSHIP_AGREEMENT.md)

Key commitments:
- 10% of all mints to Polaris Project (immutable)
- Real-time transparency dashboard
- Player impact tracking
- Annual impact reports
- Public recognition

## Support

### Polaris Project
- Website: https://polarisproject.org
- Hotline: 1-888-373-7888
- Tax ID: 05-0545307

### EPWorld
- Transparency: https://epworld.io/transparency
- Documentation: This repo
- Community: [Discord link]

## License

MIT License - See LICENSE file for details.

## Acknowledgments

This partnership demonstrates how blockchain technology can create **trustless, transparent charitable giving**. Every donation is verifiable, immutable, and automatic.

Thank you to Polaris Project for their life-saving work supporting victims and survivors of human trafficking.

---

*"Even if the world forgets, the blockchain remembers."*
