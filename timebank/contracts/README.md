# TimeExchange Contract

## Overview

The `TimeExchange` contract is the core escrow system for the Timebank mutual aid platform. It enables secure time-based exchanges between service providers and requesters with multiple exchange types, dual-confirmation completion, and integrated dispute resolution.

## Features

### State Machine
```
Created → Funded → InProgress → Completed
             ↓           ↓
        Expired      Disputed → Refunded/Completed
                        ↓
                   Cancelled → Refunded
```

### Exchange Types

1. **One-Time**: Single service delivery with full payment on completion
2. **Milestone**: Multiple deliverables with partial payments per milestone
3. **Recurring**: Ongoing services with periodic payments

### Key Features

- **Dual-Confirmation Completion**: Both parties must confirm for payment release
- **Timeout Handling**: Automatic expiration with refund mechanism
- **Dispute Integration**: Callback pattern with DisputeResolution contract
- **Platform Fees**: Configurable fee (max 10%) to treasury
- **Multi-type Support**: One-time, milestone, and recurring exchanges
- **Access Control**: Role-based permissions (Admin, Pauser, Dispute Resolver)

## Contract Structure

### Core State Variables

```solidity
// Contract References
ITimeToken public timeToken;
IReputationRegistry public reputationRegistry;
IDisputeResolution public disputeResolution;
address public treasury;

// Exchange Data
mapping(uint256 => Exchange) public exchanges;
mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
mapping(address => uint256[]) public userExchanges;

// Configuration
uint256 public maxHoursPerExchange;
uint256 public platformFeeBasisPoints;
uint256 public fundingTimeout;
uint256 public startTimeout;
uint256 public completionTimeout;
```

### Exchange Struct

```solidity
struct Exchange {
    uint256 id;
    address requester;
    address provider;
    uint256 hoursAmount;
    uint256 hoursFunded;
    uint256 hoursReleased;
    uint256 skillId;
    string description;
    string deliverables;
    ExchangeType exchangeType;
    ExchangeStatus status;
    uint256 createdAt;
    uint256 fundedAt;
    uint256 startedAt;
    uint256 completedAt;
    uint256 expiresAt;
    uint256 disputeId;
    bool requesterConfirmed;
    bool providerConfirmed;
    uint256 milestoneCount;
    uint256 currentMilestone;
    uint256 recurringInterval;
    uint256 recurringCount;
    uint256 recurringCompleted;
    string metadataURI;
}
```

## Functions

### Core Exchange Flow

#### `createExchange()`
Creates a new exchange request.

```solidity
function createExchange(
    address provider,
    uint256 hoursAmount,
    uint256 skillId,
    string calldata description,
    string calldata deliverables,
    ExchangeType exchangeType,
    uint256 milestoneCount,
    uint256 recurringInterval,
    uint256 recurringCount,
    string calldata metadataURI
) external returns (uint256 exchangeId)
```

**Requirements:**
- Provider must be registered and not the requester
- Hours amount must be > 0 and ≤ maxHoursPerExchange
- Both parties must be registered in ReputationRegistry

#### `fundExchange()`
Funds a created exchange with TimeTokens.

```solidity
function fundExchange(uint256 exchangeId) external
```

**State Transition:** `Created → Funded`

#### `startExchange()`
Provider accepts and starts the exchange.

```solidity
function startExchange(uint256 exchangeId) external
```

**State Transition:** `Funded → InProgress`

#### `confirmCompletion()`
Either party submits confirmation of completion.

```solidity
function confirmCompletion(uint256 exchangeId) external
```

**State Transition:** `InProgress → Completed` (when both confirm)

### Milestone Management

#### `completeMilestone()`
Completes a milestone and releases payment.

```solidity
function completeMilestone(uint256 exchangeId, uint256 milestoneIndex) external
```

### Recurring Payments

#### `releaseRecurringPayment()`
Releases next recurring payment.

```solidity
function releaseRecurringPayment(uint256 exchangeId) external
```

### Cancellation & Refunds

#### `cancelExchange()`
Cancels an exchange before completion.

```solidity
function cancelExchange(uint256 exchangeId, string calldata reason) external
```

#### `claimExpiredRefund()`
Claims refund for expired exchange.

```solidity
function claimExpiredRefund(uint256 exchangeId) external
```

### Dispute Resolution

#### `raiseDispute()`
Raises a dispute for an exchange.

```solidity
function raiseDispute(uint256 exchangeId, string calldata reason) external
```

#### `resolveDispute()`
Callback from DisputeResolution contract.

```solidity
function resolveDispute(
    uint256 exchangeId,
    bool requesterWins,
    uint256 providerHours,
    uint256 requesterRefund
) external
```

## Events

```solidity
event ExchangeCreated(uint256 indexed id, address indexed requester, address indexed provider, ...);
event ExchangeFunded(uint256 indexed id, uint256 hoursFunded, uint256 fundedAt);
event ExchangeStarted(uint256 indexed id, address indexed provider, uint256 startedAt);
event ConfirmationSubmitted(uint256 indexed id, address indexed by, bool isRequester, uint256 timestamp);
event ExchangeCompleted(uint256 indexed id, uint256 completedAt, uint256 providerReceived, uint256 platformFee);
event ExchangeDisputed(uint256 indexed id, uint256 indexed disputeId, address indexed raisedBy, string reason);
event ExchangeCancelled(uint256 indexed id, address indexed by, string reason, uint256 refundAmount);
event ExchangeRefunded(uint256 indexed id, uint256 refundAmount, uint256 timestamp);
event ExchangeExpired(uint256 indexed id, uint256 expiredAt);
event MilestoneCompleted(uint256 indexed exchangeId, uint256 indexed milestoneIndex, uint256 hoursReleased);
event RecurringPaymentReleased(uint256 indexed exchangeId, uint256 indexed paymentIndex, uint256 hoursReleased);
```

## Access Control

| Role | Permissions |
|------|-------------|
| `DEFAULT_ADMIN_ROLE` | Grant/revoke roles, all admin functions |
| `ADMIN_ROLE` | Set fees, timeouts, update contracts, unpause |
| `PAUSER_ROLE` | Emergency pause |
| `DISPUTE_RESOLVER_ROLE` | Resolve disputes |

## Configuration

### Default Values

```solidity
maxHoursPerExchange = 1000 * 1e18;  // 1000 hours
platformFeeBasisPoints = 100;        // 1%
fundingTimeout = 7 days;
startTimeout = 3 days;
completionTimeout = 30 days;
```

### Platform Fee Calculation

```
platformFee = (hoursAmount * platformFeeBasisPoints) / 10000
providerAmount = hoursAmount - platformFee
```

## Security Considerations

1. **ReentrancyGuard**: All fund-transferring functions use nonReentrant
2. **Pausable**: Emergency pause mechanism for critical situations
3. **Access Control**: Role-based permissions for sensitive operations
4. **Checks-Effects-Interactions**: State updates before external calls
5. **Timeout Protection**: Automatic expiration prevents indefinite locks

## Integration

### Required Contracts

- `ITimeToken`: ERC-20 token for hours (soulbound)
- `IReputationRegistry`: User reputation and registration
- `IDisputeResolution`: Dispute arbitration system
- `treasury`: Fee collection address

### Reputation Integration

On successful completion:
```solidity
reputationRegistry.recordExchangeCompletion(provider, requester, hoursAmount);
```

On dispute resolution:
```solidity
reputationRegistry.recordDispute(user, won);
```

## Testing

Run tests with Foundry:

```bash
forge test
```

Run specific test:

```bash
forge test --match-test test_ConfirmCompletion_DualConfirmation
```

### Test Coverage

- Constructor validation
- Exchange creation (all types)
- Funding and state transitions
- Dual-confirmation completion
- Milestone management
- Recurring payments
- Cancellation and refunds
- Expired exchange handling
- Dispute raising and resolution
- Admin functions
- Access control
- Edge cases and error conditions

## Deployment

### Constructor Parameters

```solidity
constructor(
    address _timeToken,           // TimeToken contract address
    address _reputationRegistry,  // ReputationRegistry contract address
    address _disputeResolution,   // DisputeResolution contract address (can be address(0) initially)
    address _treasury,            // Treasury/fee collection address
    address admin                 // Initial admin address
)
```

### Post-Deployment Setup

1. Grant `DISPUTE_RESOLVER_ROLE` to DisputeResolution contract
2. Verify contract integrations
3. Set appropriate timeout values for network
4. Configure platform fee

## Gas Optimizations

- Packing struct fields to minimize storage slots
- Using `calldata` for external function parameters
- Efficient array operations with pagination
- Minimal storage writes in hot paths

## License

MIT License - See SPDX identifier in contract files.
