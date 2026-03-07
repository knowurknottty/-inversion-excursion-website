# TimeToken

Soulbound token (ERC-5484) representing verified service hours in the Timebank mutual aid system.

## Overview

TimeToken is a non-transferable NFT that represents verified hours of service contribution. Tokens expire after a set period to encourage active participation in the mutual aid economy.

### Key Features

- **ERC-5484 Soulbound**: Non-transferable, tied to the service provider
- **Oracle-Minted**: Only authorized oracles can verify and mint tokens
- **Expiration Mechanism**: 180-day default expiration (configurable)
- **Grace Period**: 7-day grace period after expiration
- **Redemption**: Token holders burn tokens to redeem services

## Architecture

### Roles

| Role | Description |
|------|-------------|
| `ADMIN_ROLE` | Contract administration, can grant/revoke oracle roles |
| `ORACLE_ROLE` | Authorized to mint tokens for verified services |

### Token Data

```solidity
struct TokenData {
    uint256 hoursEarned;        // Hours of service
    uint256 mintedAt;           // Mint timestamp
    uint256 expiresAt;          // Expiration timestamp
    string serviceCategory;     // Service type
    address serviceProvider;    // Token holder
    address serviceRecipient;   // Service beneficiary
    string metadataURI;         // Additional data
    bool redeemed;              // Whether used
}
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_EXPIRATION` | 180 days | Default token lifetime |
| `MAX_EXPIRATION_EXTENSION` | 365 days | Max extension from original |
| `GRACE_PERIOD` | 7 days | Post-expiration grace |

## Quick Start

### Install Dependencies

```bash
forge install
```

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Deploy

```bash
# Local testing
forge script script/DeployTimeToken.s.sol:DeployTimeToken --fork-url http://localhost:8545 --broadcast

# Testnet
export TIME_TOKEN_NAME="TimeToken"
export TIME_TOKEN_SYMBOL="TIME"
export TIME_TOKEN_ADMIN="0x..."
export PRIVATE_KEY="0x..."

forge script script/DeployTimeToken.s.sol:DeployTimeToken \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

## Usage

### Minting (Oracle only)

```solidity
// Mint with default expiration (180 days)
timeToken.mint(
    serviceProvider,    // Address to receive token
    serviceRecipient,   // Who received the service
    5,                  // Hours earned
    "teaching",         // Service category
    "ipfs://..."        // Metadata URI
);

// Mint with custom expiration
timeToken.mint(
    serviceProvider,
    serviceRecipient,
    5,
    "teaching",
    "ipfs://...",
    90 days             // Custom expiration
);
```

### Redeeming (Token owner)

```solidity
// Redeem single token
timeToken.redeem(tokenId, "Garden help session");

// Batch redeem
uint256[] memory tokens = [tokenId1, tokenId2];
timeToken.redeemBatch(tokens, "Redemption purpose");
```

### Checking Balances

```solidity
// Get effective balance (non-expired only)
(uint256 hours, uint256 count) = timeToken.balanceOfEffective(account);

// Get detailed breakdown
(uint256 active, uint256 expiringSoon, uint256 expired) = 
    timeToken.balanceOfDetailed(account);

// Get all token IDs owned by address
uint256[] memory tokens = timeToken.getTokensByOwner(account);

// Check if specific token is expired
bool expired = timeToken.isExpired(tokenId);
```

### Extending Expiration (Oracle only)

```solidity
timeToken.extendExpiration(tokenId, 30 days);
```

## Events

```solidity
event TimeTokenMinted(
    uint256 indexed tokenId,
    address indexed serviceProvider,
    address indexed serviceRecipient,
    uint256 hoursEarned,
    uint256 expiresAt,
    string serviceCategory
);

event TimeTokenRedeemed(
    uint256 indexed tokenId,
    address indexed redeemer,
    uint256 hoursRedeemed,
    string redemptionPurpose
);

event ExpirationExtended(
    uint256 indexed tokenId,
    uint256 oldExpiration,
    uint256 newExpiration
);

event OracleStatusChanged(address indexed oracle, bool granted);
```

## Security

### Soulbound Enforcement

All transfers are blocked except minting (from 0) and burning (to 0):

```solidity
function _beforeTokenTransfer(address from, address to, ...)
    internal
    override
{
    if (from != address(0) && to != address(0)) {
        revert TransferNotAllowed();
    }
}
```

### Access Control

- Uses OpenZeppelin's `AccessControl` for role management
- Separate `ADMIN_ROLE` and `ORACLE_ROLE`
- Admin can grant/revoke oracle roles

### Input Validation

- Hours must be 1-168 (prevents abuse)
- Zero addresses rejected
- Expiration extensions capped

## Testing

Run the full test suite:

```bash
forge test -vvv
```

Coverage report:

```bash
forge coverage --report lcov
genhtml lcov.info -o coverage-report
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions welcome! Please ensure:
- Tests pass (`forge test`)
- Code is formatted (`forge fmt`)
- Gas optimization considered
- Security implications reviewed
