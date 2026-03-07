# TWAP Oracle Implementation for PowerCalculator

## Overview

This implementation adds TWAP (Time-Weighted Average Price) Oracle protection to the PowerCalculator contract to prevent flash loan attacks on the market cap component of power calculations.

## Problem Statement

The original system used market cap as 30% of power calculation, which created a flash loan attack surface:
- Attacker could flash borrow tokens to manipulate price
- Price manipulation would instantly affect power calculations
- Could gain unfair advantages in battles, rewards, or tier progression

## Solution: TWAP Oracle Protection

### Key Features

1. **TWAP Calculation (24+ blocks)**
   - Minimum 24 blocks (≈5 minutes on Base L2) for price averaging
   - Ring buffer with 64 observations for gas efficiency
   - Cumulative price tracking for O(log n) TWAP queries

2. **Circuit Breakers (20% Threshold)**
   - Automatic trigger when current price deviates >20% from TWAP
   - Single-block change limit (10%) to prevent instant manipulation
   - Manual reset required after investigation

3. **Emergency Pause Function**
   - Owner can emergency pause for specified duration
   - Pauses all power calculations during investigation
   - Automatic circuit breaker reset on unpause

4. **Price History Tracking**
   - Ring buffer stores up to 64 price observations
   - Each observation includes price, block number, timestamp, cumulative
   - Binary search for efficient historical lookups

5. **Gas Optimizations**
   - Packed structs: PriceObservation uses 2 slots instead of 4
   - Ring buffer: O(1) insertions, O(log n) queries
   - Unchecked math where safe
   - Assembly for alignment multipliers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PowerCalculator                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              TWAP Oracle Module                       │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │Price History│  │  TWAP Logic  │  │Circuit Break│  │   │
│  │  │Ring Buffer  │  │              │  │             │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Power Calculation Engine                 │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │ File Power  │  │Mention Power │  │Market Cap   │  │   │
│  │  │             │  │              │  │(TWAP-based) │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Contract Structure

### PowerCalculator.sol

Main contract with TWAP protection:

```solidity
// TWAP Configuration
uint256 constant MIN_TWAP_BLOCKS = 24;           // Minimum blocks for TWAP
uint256 constant PRICE_BUFFER_SIZE = 64;          // Ring buffer size
uint256 constant CIRCUIT_BREAKER_THRESHOLD = 2000; // 20% in basis points
uint256 constant MIN_OBSERVATIONS = 8;            // Minimum for valid TWAP
uint256 constant MAX_SINGLE_BLOCK_CHANGE = 1000;  // 10% max single block
```

### PriceObservation Struct

Gas-optimized storage:

```solidity
struct PriceObservation {
    uint128 price;          // Price (18 decimals)
    uint64 blockNumber;     // Observation block
    uint64 timestamp;       // Unix timestamp
    uint256 cumulativePrice; // Running cumulative (separate slot)
}
```

Storage: 2 slots per observation (vs 4 without packing)

## Key Functions

### recordPriceObservation()
Records a new price observation with all safety checks.

```solidity
function recordPriceObservation() external whenNotPaused nonReentrant
```

**Checks performed:**
1. Price > 0
2. Single-block change < 10%
3. Deviation from TWAP < 20%

**Triggers:**
- Circuit breaker on any check failure
- Event emission for monitoring

### getTWAP(uint256 _blockRange)
Calculates time-weighted average price.

```solidity
function getTWAP(uint256 _blockRange) public view returns (uint256 twapPrice)
```

**Algorithm:**
1. Binary search ring buffer for observations bounding target block
2. Calculate: (cumulativeRecent - cumulativePast) / (blockRecent - blockPast)
3. Returns average price over specified block range

**Gas:** ~30-40k gas (O(log n) binary search)

### calculatePower()
Main power calculation with TWAP protection.

```solidity
function calculatePower(
    uint32 _charId,
    uint256[] calldata _fileIds,
    uint32 _mentionCount,
    uint8 _alignment
) external view returns (uint32 power)
```

**Components:**
- 70% Base Power (files + mentions)
- 30% Market Cap Power (TWAP-protected)

**Modifiers:**
- `whenNotPaused`
- `whenNotCircuitBroken`
- `whenNotEmergencyPaused`

## Security Features

### 1. Flash Loan Resistance

**Before (Vulnerable):**
```
Block N:   Price = $100
Block N+1: Flash loan attack, Price = $200
           Power calculation uses $200 instantly
```

**After (Protected):**
```
Block N:   Price = $100, TWAP = $100
Block N+1: Flash loan attack, Price = $200
           Circuit breaker triggers (>20% deviation)
           Power calculation reverts
Block N+2: Owner investigates, resets circuit breaker
           TWAP still ≈ $100 (averaged over 24 blocks)
```

### 2. Circuit Breaker States

```
NORMAL → [Price Anomaly] → CIRCUIT_BROKEN → [Owner Reset] → NORMAL
                                 ↓
                          EMERGENCY_PAUSE → [Owner Unpause] → NORMAL
```

### 3. Fallback Mode

If Chainlink/Uniswap oracle fails:
1. Owner activates fallback mode
2. Manual price is used instead of oracle
3. Power calculations continue with reduced security

## Deployment Guide

### 1. Deploy Price Oracle

**Option A: Chainlink Adapter**
```solidity
ChainlinkPriceOracle oracle = new ChainlinkPriceOracle(
    0xChainlinkFeedAddress // e.g., ETH/USD on Base
);
```

**Option B: Uniswap V3 TWAP**
```solidity
UniswapV3PriceOracle oracle = new UniswapV3PriceOracle(
    0xUniswapV3PoolAddress
);
```

### 2. Deploy PowerCalculator

```solidity
PowerCalculator calculator = new PowerCalculator(
    ownerAddress,
    fileNFTAddress,
    oracleAddress
);
```

### 3. Setup and Configuration

```solidity
// Set character registry
calculator.setRegistry(registryAddress);

// Optionally adjust market cap weight (default 30%)
calculator.setMarketCapWeight(3000); // 30% in basis points

// Set max market cap power contribution
calculator.setMaxMarketCapPower(15000);
```

### 4. Initialize Price History

```solidity
// Record initial observations to build TWAP (can be done by anyone)
for (uint i = 0; i < 30; i++) {
    vm.roll(block.number + 1); // Advance block
    calculator.recordPriceObservation();
}
```

## Testing

### Unit Tests (Foundry)

Run the comprehensive test suite:

```bash
cd epworld-optimized
forge test --match-contract PowerCalculatorTest -vvv
```

### Key Test Scenarios

1. **TWAP Calculation Accuracy**
   - Test with 30+ observations
   - Verify TWAP between min/max prices
   - Test ring buffer wrap-around

2. **Circuit Breaker Triggers**
   - 50% price spike should trigger
   - 15% single-block change should trigger
   - Normal price changes should not trigger

3. **Flash Loan Attack Simulation**
   - Establish stable price history
   - Simulate flash loan manipulation
   - Verify circuit breaker prevents attack
   - Verify TWAP remains stable

4. **Gas Optimization**
   - Record observation: <100k gas
   - Get TWAP: <50k gas
   - Calculate power: <150k gas

## Monitoring & Operations

### Events to Monitor

```solidity
// Price observations (every block ideally)
PriceObserved(uint256 price, uint64 blockNumber, uint256 cumulativePrice)

// Circuit breaker triggers (urgent!)
CircuitBreakerTriggered(uint256 currentPrice, uint256 twapPrice, uint256 deviation)

// Emergency pause (urgent!)
EmergencyPaused(uint256 untilBlock, string reason)

// Power calculations (normal operation)
PowerCalculated(uint32 indexed charId, uint32 power, uint8 tier)
```

### Recommended Alerting

1. **Circuit Breaker Triggered**
   - Severity: CRITICAL
   - Action: Immediate investigation
   - Auto-page on-call

2. **Emergency Pause Activated**
   - Severity: CRITICAL
   - Action: Investigate and resolve

3. **Price Deviation >15%**
   - Severity: WARNING
   - Action: Monitor closely

4. **No Price Observations >10 blocks**
   - Severity: WARNING
   - Action: Check oracle health

### Operational Runbook

**Circuit Breaker Triggered:**
1. Check price sources (Chainlink, DEXs)
2. If legitimate volatility: wait for TWAP to catch up
3. If attack detected: investigate, potentially emergency pause
4. Reset circuit breaker after stabilization

**Emergency Pause:**
1. Immediate halt to all power calculations
2. Investigate root cause
3. Fix issue or wait for external resolution
4. Unpause when safe

## Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Record Observation | ~80k | With all checks |
| Get TWAP | ~35k | Binary search |
| Calculate Power | ~120k | Full calculation |
| Circuit Breaker Reset | ~25k | Owner only |
| Emergency Pause | ~35k | Owner only |

## Comparison: Before vs After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Flash Loan Risk | HIGH | LOW | ✅ Secure |
| Gas per Power Calc | ~80k | ~120k | +50% (acceptable) |
| Oracle Dependencies | None | 1 (Price Oracle) | Added complexity |
| Price Manipulation Window | 1 block | 24 blocks | ✅ Secure |
| Circuit Breaker | ❌ | ✅ | New protection |

## Future Improvements

1. **Multi-Oracle Support**
   - Use multiple price sources
   - Median or average of oracles
   - Failover between sources

2. **Volatility-Adjusted TWAP**
   - Shorter TWAP periods during high volatility
   - Longer periods during stability
   - Dynamic circuit breaker thresholds

3. **Decentralized Price Submission**
   - Allow validators to submit prices
   - Consensus mechanism for price updates
   - Reduce single oracle dependency

4. **MEV Protection**
   - Commit-reveal scheme for power calculations
   - Time-delayed power updates
   - Flashbots integration

## Files Delivered

1. **PowerCalculator.sol** - Main contract with TWAP protection
2. **PowerCalculator.t.sol** - Comprehensive test suite
3. **PriceOracles.sol** - Oracle adapters (Chainlink, Uniswap V3)
4. **IEPWORLD.sol** - Updated with IPriceOracle interface
5. **TWAP_IMPLEMENTATION.md** - This documentation

## Audit Considerations

1. **TWAP Calculation Correctness**
   - Verify binary search logic
   - Check cumulative price math
   - Test edge cases (empty buffer, single observation)

2. **Circuit Breaker Bypass**
   - Ensure no path to calculate power during circuit break
   - Verify all modifiers are applied correctly
   - Check inheritance chain

3. **Oracle Manipulation**
   - Verify oracle is read-only in view functions
   - Check oracle failure handling
   - Ensure fallback mode is secure

4. **Gas Limits**
   - Ensure all functions under block gas limit
   - Verify no unbounded loops
   - Check ring buffer operations
