# ReputationRegistry

A comprehensive on-chain reputation system for the Timebank mutual aid platform, implementing dynamic scoring, skill endorsements, time-based decay, and tiered trust levels.

## Features

### Dynamic 0-10000 Score System
- Scores range from 0 to 10000 (basis points for precision)
- Registration bonus of 500 (5%) for new users
- Score modifications through exchanges, disputes, endorsements, and ratings

### Skill Endorsements
- Users can endorse others for specific skills
- Each endorsement grants +25 reputation points (capped at +500 per skill)
- Prevents duplicate endorsements from the same address
- Tracks endorsement count per skill

### Decay Mechanism
- Time-based decay for inactive users
- Default decay: 5% per year of inactivity
- Decay resets on any activity (exchange, rating, endorsement)
- Configurable per-user decay rates (0-20%)
- Compound decay calculation for multiple years

### Tiered Trust Levels

| Tier | Name | Score Range | Description |
|------|------|-------------|-------------|
| 1 | Untrusted | 0-2499 | New users |
| 2 | Emerging | 2500-4999 | Building reputation |
| 3 | Established | 5000-7499 | Active contributors |
| 4 | Trusted | 7500-8999 | Highly reliable |
| 5 | Elite | 9000-10000 | Top-tier members |

## Reputation Modifications

| Action | Score Change | Notes |
|--------|--------------|-------|
| Registration | +500 | One-time bonus |
| Exchange (provider) | +50 | Per completed exchange |
| Exchange (receiver) | +25 | Per completed exchange |
| Win dispute | +100 | - |
| Lose dispute | -1000 | Significant penalty |
| Skill endorsement | +25 | Capped at +500 per skill |
| 4-5 star rating | +10-20 | Based on rating value |

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ReputationRegistry                       │
├─────────────────────────────────────────────────────────────┤
│  Access Control: ADMIN_ROLE, EXCHANGE_ROLE, DISPUTE_ROLE   │
├─────────────────────────────────────────────────────────────┤
│  Core Functions:                                            │
│    • registerUser()                                         │
│    • updateReputation()    [EXCHANGE_ROLE only]            │
│    • recordExchangeCompletion() [EXCHANGE_ROLE only]       │
│    • recordDispute()       [DISPUTE_ROLE only]             │
├─────────────────────────────────────────────────────────────┤
│  Skill System:                                              │
│    • addSkill()            [ADMIN_ROLE only]               │
│    • endorseSkill()                                         │
│    • rateSkill()                                            │
├─────────────────────────────────────────────────────────────┤
│  Decay System:                                              │
│    • applyDecay()                                           │
│    • calculateCurrentScore()                                │
│    • setDecayRate()        [ADMIN_ROLE only]               │
├─────────────────────────────────────────────────────────────┤
│  Query Functions:                                           │
│    • getTrustTier()                                         │
│    • getUserStats()                                         │
│    • canTransact()                                          │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Registration

```solidity
registry.registerUser("ipfs://Qm...");
```

### Endorsing a Skill

```solidity
// First, ensure both users are registered
// Then endorse for a skill
registry.endorseSkill(userAddress, skillId);
```

### Rating a Provider

```solidity
// Rate after service completion (1-5 stars)
registry.rateSkill(providerAddress, skillId, 5);
```

### Checking Reputation

```solidity
// Get current score with decay applied
uint256 score = registry.calculateCurrentScore(user);

// Get trust tier (1-5)
uint8 tier = registry.getTrustTier(user);

// Get comprehensive stats
(
    uint256 overallScore,
    uint256 baseScore,
    uint256 completedExchanges,
    uint256 disputedExchanges,
    uint256 wonDisputes,
    uint256 lostDisputes,
    uint256 totalHoursContributed,
    uint256 totalHoursReceived,
    uint256 lastActivityTimestamp,
    uint8 trustTier
) = registry.getUserStats(user);
```

### Admin Functions

```solidity
// Add a new skill
uint256 skillId = registry.addSkill("Programming");

// Set custom decay rate for a user (in basis points)
registry.setUserDecayRate(userAddress, 1000); // 10% per year

// Update global default decay rate
registry.setDefaultDecayRate(500); // 5% per year
```

## Deployment

### Standard Deployment

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export RPC_URL=https://your-rpc-endpoint
export ADMIN_ADDRESS=0x... # Optional, defaults to deployer

# Deploy
forge script script/DeployReputationRegistry.s.sol:DeployReputationRegistry \
    --rpc-url $RPC_URL \
    --broadcast \
    --verify
```

### With Custom Decay Rates

```bash
export DEFAULT_DECAY_RATE=1000  # 10% per year
export MAX_DECAY_RATE=3000      # 30% per year  
export MIN_DECAY_RATE=100       # 1% per year

forge script script/DeployReputationRegistry.s.sol:DeployReputationRegistry \
    --rpc-url $RPC_URL \
    --broadcast
```

## Testing

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test
forge test --match-test test_GetTrustTier

# Run fuzz tests
forge test --fuzz-runs 1000
```

## Decay Calculation

The decay formula compounds annually:

```
current_score = base_score * (1 - decay_rate) ^ years_inactive
```

Example with 5% decay rate:
- Year 0: 5000 score
- Year 1: 5000 * 0.95 = 4750
- Year 2: 5000 * 0.95² = 4512
- Year 3: 5000 * 0.95³ = 4286

Partial years are calculated linearly within the year.

## Security Considerations

1. **Access Control**: Only authorized contracts (TimeExchange, DisputeResolution) can modify scores
2. **Reentrancy Protection**: Skill endorsements use ReentrancyGuard
3. **Score Caps**: Scores cannot exceed 10000 or go below 0
4. **Decay Limits**: Decay rates are capped between 0% and 20%
5. **Self-Interaction Prevention**: Users cannot endorse or rate themselves
6. **Duplicate Prevention**: Endorsements and ratings are tracked per address

## Integration

### As Exchange Contract

```solidity
contract TimeExchange {
    IReputationRegistry public reputationRegistry;
    
    function completeExchange(address provider, address receiver, uint256 hours) external {
        // ... transfer logic ...
        
        // Update reputations
        reputationRegistry.recordExchangeCompletion(provider, receiver, hours);
    }
}
```

### As Dispute Resolution Contract

```solidity
contract DisputeResolution {
    IReputationRegistry public reputationRegistry;
    
    function resolveDispute(address user, bool userWon) external {
        // ... resolution logic ...
        
        // Record outcome
        reputationRegistry.recordDispute(user, userWon);
    }
}
```

## Events

All significant actions emit events for off-chain indexing:

- `UserRegistered` - New user registration
- `ReputationUpdated` - Score changes
- `ScoreDecayApplied` - Decay calculation
- `SkillEndorsed` - New endorsement
- `SkillRated` - New rating
- `ExchangeCompleted` - Exchange completion
- `DisputeRecorded` - Dispute outcome
- `SkillAdded` - New skill added
- `DecayRateUpdated` - Decay rate changes

## License

MIT