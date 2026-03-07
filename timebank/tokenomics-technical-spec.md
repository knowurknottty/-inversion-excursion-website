# Timebank Tokenomics Technical Specification

## Implementation Details for Soulbound TimeToken Economics

---

## Table of Contents

1. [Smart Contract Architecture](#1-smart-contract-architecture)
2. [Issuance Algorithms](#2-issuance-algorithms)
3. [Fee Calculation Engine](#3-fee-calculation-engine)
4. [Reputation & Staking Mathematics](#4-reputation--staking-mathematics)
5. [Slashing Logic](#5-slashing-logic)
6. [Oracle Verification System](#6-oracle-verification-system)

---

## 1. Smart Contract Architecture

### 1.1 Core Contracts

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TimeToken
 * @notice Soulbound token representing verified hours of service
 * @dev Non-transferable ERC-20 variant with staking and slashing
 */
interface ITimeToken {
    // Soulbound: No transfer functions
    function mint(address to, uint256 amount, bytes32 serviceHash) external;
    function burn(uint256 amount) external;
    function stake(uint256 amount, uint256 lockDuration) external;
    function unstake(uint256 stakeId) external;
    function slash(address user, uint256 percentage, string calldata reason) external;
    
    // View functions
    function balanceOf(address account) external view returns (uint256);
    function getReputation(address account) external view returns (uint256);
    function getStakedAmount(address account) external view returns (uint256);
}
```

### 1.2 Contract Hierarchy

```
TimebankProtocol
├── TimeToken (ERC-20 Soulbound)
├── ServiceRegistry
│   ├── CategoryManager
│   └── MultiplierOracle
├── StakingManager
│   ├── StakeVault
│   └── RewardDistributor
├── DisputeResolution
│   ├── ValidatorPool
│   ├── EvidenceStorage
│   └── SlashingEngine
└── Treasury
    ├── FeeCollector
    └── BurnController
```

### 1.3 Soulbound Enforcement

```solidity
abstract contract Soulbound {
    error TransferNotAllowed();
    error ApprovalNotAllowed();
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal pure override {
        // Allow minting (from == 0) and burning (to == 0)
        // Block all transfers between addresses
        if (from != address(0) && to != address(0)) {
            revert TransferNotAllowed();
        }
    }
    
    function approve(address, uint256) public pure override returns (bool) {
        revert ApprovalNotAllowed();
    }
    
    function transfer(address, uint256) public pure override returns (bool) {
        revert TransferNotAllowed();
    }
    
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert TransferNotAllowed();
    }
}
```

---

## 2. Issuance Algorithms

### 2.1 Dynamic Exchange Rate Formula

```python
def calculate_issuance(
    base_hours: float,           # Hours verified
    category_tier: int,          # 1-5
    demand_index: float,         # 0.0 to 1.0
    user_activity_score: float,  # 0.0 to 1.0
    network_saturation: float    # 0.0 to 1.0
) -> float:
    """
    Calculate $TIMEBANK issuance for a service completion.
    """
    # Base multipliers by tier
    TIER_MULTIPLIERS = {1: 1.0, 2: 1.25, 3: 1.5, 4: 2.0, 5: 2.5}
    base_multiplier = TIER_MULTIPLIERS.get(category_tier, 1.0)
    
    # Demand adjustment (0.5x to 2.0x)
    demand_factor = 0.5 + (demand_index * 1.5)
    
    # Activity modifier (0.5x to 1.0x)
    activity_modifier = max(0.5, user_activity_score)
    
    # Network saturation dampener (reduces issuance at high saturation)
    saturation_dampener = 1.0 - (network_saturation * 0.3)
    
    # Calculate final issuance
    issuance = (
        base_hours * 
        base_multiplier * 
        demand_factor * 
        activity_modifier * 
        saturation_dampener
    )
    
    return round(issuance, 2)  # 2 decimal precision
```

### 2.2 Demand Index Calculation

```python
def calculate_demand_index(
    pending_requests: int,
    active_providers: int,
    avg_fulfillment_time: float,  # hours
    target_fulfillment_time: float = 48.0,
    satisfaction_score: float = 0.85
) -> float:
    """
    Calculate category demand index (0.0 to 1.0).
    """
    # Supply-demand ratio
    if active_providers == 0:
        supply_demand_ratio = 1.0
    else:
        supply_demand_ratio = min(pending_requests / active_providers, 2.0) / 2.0
    
    # Fulfillment efficiency (faster = lower demand pressure)
    fulfillment_efficiency = min(target_fulfillment_time / max(avg_fulfillment_time, 1), 1.0)
    
    # Satisfaction adjustment (high satisfaction = lower urgency)
    satisfaction_adjustment = 1.0 - (satisfaction_score * 0.2)
    
    # Weighted combination
    demand_index = (
        supply_demand_ratio * 0.5 +
        (1 - fulfillment_efficiency) * 0.3 +
        satisfaction_adjustment * 0.2
    )
    
    return min(max(demand_index, 0.0), 1.0)
```

### 2.3 Inflation Control Mechanism

```python
class InflationController:
    TARGET_MONTHLY_INFLATION = 0.05  # 5% target
    MAX_MONTHLY_INFLATION = 0.15     # 15% cap
    
    def __init__(self):
        self.monthly_issuance = []
        self.total_supply = 0
        
    def calculate_minting_allowance(self, current_supply: float) -> float:
        """
        Calculate maximum allowable minting for the period.
        """
        # Calculate current inflation rate
        if len(self.monthly_issuance) < 3:
            recent_issuance = sum(self.monthly_issuance) if self.monthly_issuance else current_supply * 0.05
        else:
            recent_issuance = sum(self.monthly_issuance[-3:])
        
        current_inflation_rate = recent_issuance / current_supply
        
        # Adjust based on deviation from target
        if current_inflation_rate > self.MAX_MONTHLY_INFLATION:
            # Emergency: halt non-essential issuance
            return current_supply * 0.01  # 1% emergency rate
        
        elif current_inflation_rate > self.TARGET_MONTHLY_INFLATION:
            # Reduce issuance
            reduction_factor = self.TARGET_MONTHLY_INFLATION / current_inflation_rate
            return (current_supply * self.TARGET_MONTHLY_INFLATION) * reduction_factor
        
        else:
            # Normal operation
            return current_supply * self.TARGET_MONTHLY_INFLATION
    
    def record_issuance(self, amount: float):
        self.monthly_issuance.append(amount)
        if len(self.monthly_issuance) > 12:
            self.monthly_issuance.pop(0)
```

---

## 3. Fee Calculation Engine

### 3.1 Dynamic Fee Structure

```solidity
contract FeeCalculator {
    struct FeeTiers {
        uint256 baseMatchingFee;      // 0.5%
        uint256 baseInsuranceFee;     // 1.0%
        uint256 baseTreasuryFee;      // 0.5%
    }
    
    struct CongestionParams {
        uint256 lowThreshold;         // 40% capacity
        uint256 normalThreshold;      // 70% capacity
        uint256 highThreshold;        // 90% capacity
    }
    
    FeeTiers public baseFees = FeeTiers(50, 100, 50);  // Basis points
    CongestionParams public congestion = CongestionParams(4000, 7000, 9000);
    
    function calculateFees(
        uint256 amount,
        uint256 networkCapacityUsed  // In basis points (0-10000)
    ) public view returns (
        uint256 matchingFee,
        uint256 insuranceFee,
        uint256 treasuryFee,
        uint256 totalFee
    ) {
        uint256 multiplier = getCongestionMultiplier(networkCapacityUsed);
        
        matchingFee = (amount * baseFees.baseMatchingFee * multiplier) / 10000;
        insuranceFee = (amount * baseFees.baseInsuranceFee * multiplier) / 10000;
        treasuryFee = (amount * baseFees.baseTreasuryFee * multiplier) / 10000;
        
        totalFee = matchingFee + insuranceFee + treasuryFee;
    }
    
    function getCongestionMultiplier(uint256 capacityUsed) internal view returns (uint256) {
        if (capacityUsed < congestion.lowThreshold) return 80;      // 0.8x
        if (capacityUsed < congestion.normalThreshold) return 100;  // 1.0x
        if (capacityUsed < congestion.highThreshold) return 130;    // 1.3x
        return 150;  // 1.5x critical
    }
}
```

### 3.2 Fee Distribution Logic

```python
def distribute_fees(
    total_fees: float,
    burn_rate: float = 0.30,
    staking_rate: float = 0.30,
    treasury_rate: float = 0.25,
    validator_rate: float = 0.15
) -> dict:
    """
    Distribute collected fees according to protocol rules.
    """
    distribution = {
        'burn': total_fees * burn_rate,
        'staking_pool': total_fees * staking_rate,
        'treasury': total_fees * treasury_rate,
        'validators': total_fees * validator_rate
    }
    
    return distribution
```

### 3.3 Burn Trigger Conditions

```solidity
contract BurnController {
    uint256 public constant MONTHLY_BURN_TARGET = 30;  // 30% of fees
    uint256 public totalBurned;
    
    event TokensBurned(uint256 amount, string reason);
    
    function executeBurn(uint256 feePoolBalance) external {
        uint256 burnAmount = (feePoolBalance * MONTHLY_BURN_TARGET) / 100;
        
        // Burn tokens
        timeToken.burn(burnAmount);
        totalBurned += burnAmount;
        
        emit TokensBurned(burnAmount, "Monthly protocol burn");
    }
    
    function burnDisputedAmount(uint256 amount) external {
        // Immediate burn for disputed/fraudulent amounts
        timeToken.burn(amount);
        totalBurned += amount;
        
        emit TokensBurned(amount, "Dispute resolution burn");
    }
    
    function decayInactiveBalance(address account) external {
        // Monthly 1% decay for inactive accounts (2+ years)
        uint256 balance = timeToken.balanceOf(account);
        uint256 decayAmount = balance / 100;  // 1%
        
        timeToken.burn(decayAmount);
        totalBurned += decayAmount;
        
        emit TokensBurned(decayAmount, "Inactive account decay");
    }
}
```

---

## 4. Reputation & Staking Mathematics

### 4.1 Reputation Score Algorithm

```python
import math

class ReputationEngine:
    def __init__(self):
        self.base_reputation = 100
        self.weights = {
            'completed_services': 0.30,
            'satisfaction_rating': 0.25,
            'stake_amount': 0.20,
            'account_age': 0.15,
            'community_contribution': 0.10
        }
    
    def calculate_reputation(
        self,
        completed_services: int,
        avg_satisfaction: float,  # 0.0 to 5.0
        staked_amount: float,
        account_age_days: int,
        community_contribution_score: float
    ) -> float:
        """
        Calculate composite reputation score (0-1000).
        """
        # Component scores (normalized)
        service_score = min(completed_services / 100, 1.0) * 1000
        satisfaction_score = (avg_satisfaction / 5.0) * 1000
        stake_score = min(math.log10(staked_amount / 10 + 1), 3.0) / 3.0 * 1000
        age_score = min(account_age_days / 365, 1.0) * 1000
        contribution_score = min(community_contribution_score, 100) * 10
        
        # Weighted combination
        reputation = (
            service_score * self.weights['completed_services'] +
            satisfaction_score * self.weights['satisfaction_rating'] +
            stake_score * self.weights['stake_amount'] +
            age_score * self.weights['account_age'] +
            contribution_score * self.weights['community_contribution']
        )
        
        return min(reputation, 1000)
    
    def get_staking_multiplier(self, staked_amount: float) -> float:
        """
        Calculate reputation multiplier from staking.
        """
        if staked_amount < 10:
            return 1.0
        
        # Logarithmic scaling
        multiplier = 1 + math.log10(staked_amount / 10)
        return min(multiplier, 5.0)  # Cap at 5x
```

### 4.2 Staking Reward Calculation

```solidity
contract StakingRewards {
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockDuration;
        uint256 lastClaimTime;
    }
    
    mapping(address => Stake[]) public stakes;
    
    // Lock period multipliers (in basis points)
    mapping(uint256 => uint256) public lockMultipliers;
    
    constructor() {
        lockMultipliers[0] = 50;        // Flexible: 0.5x
        lockMultipliers[30 days] = 100; // 1 month: 1.0x
        lockMultipliers[90 days] = 125; // 3 months: 1.25x
        lockMultipliers[180 days] = 150;// 6 months: 1.5x
        lockMultipliers[365 days] = 200;// 12 months: 2.0x
    }
    
    function calculateRewards(
        address staker,
        uint256 stakeIndex
    ) public view returns (uint256) {
        Stake memory stake = stakes[staker][stakeIndex];
        
        uint256 timeStaked = block.timestamp - stake.lastClaimTime;
        uint256 annualRewardRate = getAnnualRewardRate(); // Dynamic based on protocol revenue
        
        uint256 multiplier = lockMultipliers[stake.lockDuration];
        
        // Calculate pro-rata rewards
        uint256 rewards = (
            stake.amount *
            annualRewardRate *
            timeStaked *
            multiplier
        ) / (365 days * 10000);  // Normalize for time and basis points
        
        return rewards;
    }
    
    function getAnnualRewardRate() public view returns (uint256) {
        // Dynamic rate based on protocol revenue and total staked
        uint256 protocolRevenue = treasury.monthlyRevenue();
        uint256 totalStaked = stakingManager.totalStaked();
        
        if (totalStaked == 0) return 500; // 5% base rate
        
        // 30% of revenue distributed to stakers annually
        uint256 annualDistribution = (protocolRevenue * 30 * 12) / 100;
        uint256 rate = (annualDistribution * 10000) / totalStaked;
        
        return min(rate, 1500); // Cap at 15%
    }
}
```

### 4.3 Tier Eligibility

```python
STAKE_TIERS = {
    'bronze': {
        'min_stake': 10,
        'benefits': ['priority_matching', 'basic_badge']
    },
    'silver': {
        'min_stake': 50,
        'benefits': ['fast_dispute', 'enhanced_visibility', 'bronze_benefits']
    },
    'gold': {
        'min_stake': 200,
        'benefits': ['early_access', 'validator_eligibility', 'silver_benefits']
    },
    'platinum': {
        'min_stake': 500,
        'benefits': ['governance_voting', 'arbitration_eligibility', 'gold_benefits']
    },
    'diamond': {
        'min_stake': 1000,
        'benefits': ['protocol_council', 'fee_discounts', 'platinum_benefits']
    }
}

def get_user_tier(staked_amount: float) -> str:
    """Determine user tier based on staked amount."""
    for tier in ['diamond', 'platinum', 'gold', 'silver', 'bronze']:
        if staked_amount >= STAKE_TIERS[tier]['min_stake']:
            return tier
    return 'none'
```

---

## 5. Slashing Logic

### 5.1 Offense Classification

```solidity
contract SlashingRegistry {
    enum OffenseLevel {
        NONE,
        MINOR,      // 5% slash
        MODERATE,   // 25% slash
        MAJOR,      // 100% slash + reputation reset
        CRITICAL    // Permanent ban + full burn
    }
    
    struct Offense {
        OffenseLevel level;
        string description;
        uint256 strikeCount;
        uint256 timestamp;
        bytes32 evidenceHash;
    }
    
    mapping(address => Offense[]) public offenseHistory;
    mapping(address => uint256) public currentStrikes;
    
    function getSlashPercentage(OffenseLevel level) public pure returns (uint256) {
        if (level == OffenseLevel.MINOR) return 500;      // 5%
        if (level == OffenseLevel.MODERATE) return 2500;  // 25%
        if (level == OffenseLevel.MAJOR) return 10000;    // 100%
        if (level == OffenseLevel.CRITICAL) return 10000; // 100% + ban
        return 0;
    }
    
    function getConsequence(address user) public view returns (
        OffenseLevel level,
        uint256 slashPercent,
        bool shouldBan
    ) {
        uint256 strikes = currentStrikes[user];
        
        if (strikes >= 5) {
            return (OffenseLevel.CRITICAL, 10000, true);
        } else if (strikes == 4) {
            return (OffenseLevel.MAJOR, 10000, false);
        } else if (strikes == 3) {
            return (OffenseLevel.MODERATE, 5000, false);
        } else if (strikes == 2) {
            return (OffenseLevel.MODERATE, 2500, false);
        } else if (strikes == 1) {
            return (OffenseLevel.MINOR, 500, false);
        }
        
        return (OffenseLevel.NONE, 0, false);
    }
}
```

### 5.2 Slashing Execution

```solidity
contract SlashingEngine {
    SlashingRegistry public registry;
    TimeToken public token;
    InsurancePool public insurance;
    Treasury public treasury;
    
    event SlashExecuted(
        address indexed user,
        uint256 amount,
        uint256 burned,
        uint256 toVictim,
        uint256 toValidators,
        string reason
    );
    
    function executeSlash(
        address user,
        address victim,
        SlashingRegistry.OffenseLevel level,
        string calldata reason
    ) external onlyValidatorCourt {
        uint256 slashPercent = registry.getSlashPercentage(level);
        uint256 totalStake = stakingManager.getTotalStaked(user);
        uint256 slashAmount = (totalStake * slashPercent) / 10000;
        
        // Calculate distribution
        uint256 burnAmount = (slashAmount * 50) / 100;
        uint256 victimAmount = victim != address(0) ? (slashAmount * 30) / 100 : 0;
        uint256 validatorAmount = (slashAmount * 15) / 100;
        uint256 treasuryAmount = slashAmount - burnAmount - victimAmount - validatorAmount;
        
        // Execute transfers
        token.burn(burnAmount);
        
        if (victim != address(0)) {
            token.mint(victim, victimAmount, bytes32("compensation"));
        } else {
            treasuryAmount += victimAmount;
        }
        
        token.mint(address(insurance), validatorAmount, bytes32("validator_reward"));
        token.mint(address(treasury), treasuryAmount, bytes32("slash_treasury"));
        
        // Update reputation
        reputationEngine.handleSlash(user, level);
        
        // Handle ban if critical
        if (level == SlashingRegistry.OffenseLevel.CRITICAL) {
            _banUser(user);
        }
        
        emit SlashExecuted(user, slashAmount, burnAmount, victimAmount, validatorAmount, reason);
    }
    
    function _banUser(address user) internal {
        // Burn remaining balance
        uint256 balance = token.balanceOf(user);
        token.burn(balance);
        
        // Mark as banned
        registry.ban(user);
        
        // Emit event
        emit UserBanned(user, balance);
    }
}
```

### 5.3 Dispute Resolution Flow

```python
class DisputeResolution:
    DISPUTE_WINDOW = 72 * 3600  # 72 hours
    VOTING_PERIOD = 48 * 3600   # 48 hours
    APPEAL_PERIOD = 7 * 24 * 3600  # 7 days
    
    def __init__(self):
        self.disputes = {}
        self.validator_pool = []
    
    def file_dispute(
        self,
        accused: str,
        evidence: str,
        stake: float
    ) -> str:
        """File a dispute with required stake."""
        dispute_id = generate_id()
        
        self.disputes[dispute_id] = {
            'accuser': msg.sender,
            'accused': accused,
            'evidence': evidence,
            'stake': stake,
            'status': 'evidence_collection',
            'created_at': now(),
            'validator_jury': self._select_jury(),
            'votes': {},
            'outcome': None
        }
        
        return dispute_id
    
    def _select_jury(self, size: int = 5) -> list:
        """Randomly select validators for jury duty."""
        eligible = [v for v in self.validator_pool if v.is_active]
        return random.sample(eligible, min(size, len(eligible)))
    
    def submit_evidence(self, dispute_id: str, evidence: str, side: str):
        """Submit evidence for a dispute."""
        dispute = self.disputes[dispute_id]
        
        if now() > dispute['created_at'] + self.DISPUTE_WINDOW:
            raise Exception("Evidence window closed")
        
        dispute['evidence'][side] = evidence
    
    def vote(self, dispute_id: str, validator: str, verdict: bool):
        """Validator submits vote."""
        dispute = self.disputes[dispute_id]
        
        if validator not in dispute['validator_jury']:
            raise Exception("Not a jury member")
        
        dispute['votes'][validator] = verdict
        
        # Check if voting complete
        if len(dispute['votes']) >= len(dispute['validator_jury']) * 2 // 3:
            self._resolve_dispute(dispute_id)
    
    def _resolve_dispute(self, dispute_id: str):
        """Resolve dispute based on jury votes."""
        dispute = self.disputes[dispute_id]
        
        votes_for_accuser = sum(1 for v in dispute['votes'].values() if v)
        total_votes = len(dispute['votes'])
        
        # 2/3 majority required
        if votes_for_accuser >= total_votes * 2 // 3:
            dispute['outcome'] = 'guilty'
            self._execute_penalty(dispute)
        else:
            dispute['outcome'] = 'not_guilty'
            self._penalize_accuser(dispute)
    
    def _execute_penalty(self, dispute: dict):
        """Execute penalty on accused."""
        # Determine offense level based on evidence severity
        offense_level = self._classify_offense(dispute['evidence'])
        
        slashing_engine.execute_slash(
            user=dispute['accused'],
            victim=dispute['accuser'],
            level=offense_level,
            reason="Dispute resolution"
        )
    
    def _penalize_accuser(self, dispute: dict):
        """Penalize false accusation."""
        false_accusation_penalty = dispute['stake'] * 0.5
        token.burn(false_accusation_penalty)
        
        # Track false accusations
        self.false_accusation_count[dispute['accuser']] += 1
        
        if self.false_accusation_count[dispute['accuser']] >= 3:
            reputation_engine.penalize_reputation(dispute['accuser'], 100)
```

---

## 6. Oracle Verification System

### 6.1 Multi-Layer Verification

```solidity
contract VerificationOracle {
    enum VerificationMethod {
        HUMAN,      // Manual validator review
        AI,         // Automated verification
        SOCIAL,     // Web-of-trust attestation
        HYBRID      // Combination of above
    }
    
    struct VerificationRequest {
        bytes32 serviceHash;
        address provider;
        address recipient;
        uint256 claimedHours;
        uint256 categoryTier;
        VerificationMethod method;
        bool verified;
        uint256 confidenceScore;
    }
    
    function requestVerification(
        bytes32 serviceHash,
        uint256 claimedHours,
        uint256 categoryTier
    ) external returns (bytes32 requestId) {
        // Determine verification method based on value and tier
        VerificationMethod method = _selectMethod(claimedHours, categoryTier);
        
        requestId = keccak256(abi.encodePacked(
            serviceHash,
            msg.sender,
            block.timestamp
        ));
        
        pendingVerifications[requestId] = VerificationRequest({
            serviceHash: serviceHash,
            provider: msg.sender,
            recipient: recipient,
            claimedHours: claimedHours,
            categoryTier: categoryTier,
            method: method,
            verified: false,
            confidenceScore: 0
        });
        
        // Route to appropriate verification pipeline
        if (method == VerificationMethod.HUMAN) {
            humanVerifier.assignToValidators(requestId);
        } else if (method == VerificationMethod.AI) {
            aiVerifier.submitForAnalysis(requestId);
        } else if (method == VerificationMethod.SOCIAL) {
            socialOracle.requestAttestations(requestId);
        }
        
        return requestId;
    }
    
    function _selectMethod(uint256 hours_, uint256 tier) internal pure returns (VerificationMethod) {
        if (hours_ >= 40 || tier >= 4) {
            return VerificationMethod.HUMAN;  // High value = human review
        } else if (tier <= 2 && hours_ <= 8) {
            return VerificationMethod.AI;     // Low value = automated
        } else {
            return VerificationMethod.HYBRID; // Medium = hybrid
        }
    }
}
```

### 6.2 Confidence Scoring

```python
class ConfidenceScorer:
    def calculate_confidence(
        self,
        verification_method: str,
        attestations: list,
        ai_score: float,
        validator_scores: list
    ) -> float:
        """
        Calculate confidence score (0-100) for verification.
        """
        scores = []
        
        if verification_method == 'AI':
            scores.append(('ai', ai_score * 0.7))
            
        elif verification_method == 'HUMAN':
            avg_validator = sum(validator_scores) / len(validator_scores)
            scores.append(('validators', avg_validator * 0.9))
            
        elif verification_method == 'SOCIAL':
            # Web-of-trust scoring
            attestation_score = self._calculate_web_of_trust(attestations)
            scores.append(('social', attestation_score * 0.6))
            
        elif verification_method == 'HYBRID':
            scores.append(('ai', ai_score * 0.3))
            avg_validator = sum(validator_scores) / len(validator_scores)
            scores.append(('validators', avg_validator * 0.4))
            attestation_score = self._calculate_web_of_trust(attestations)
            scores.append(('social', attestation_score * 0.2))
        
        # Weighted combination
        total_weight = sum(w for _, w in scores)
        weighted_score = sum(s * w for s, w in scores) / total_weight
        
        return min(weighted_score * 100, 100)
    
    def _calculate_web_of_trust(self, attestations: list) -> float:
        """Calculate trust score based on attestation network."""
        if not attestations:
            return 0.0
        
        total_weight = 0
        for attestation in attestations:
            # Weight by attester reputation
            attester_rep = reputation_engine.get_reputation(attestation['attester'])
            weight = attester_rep / 1000
            total_weight += weight
        
        return min(total_weight / len(attestations), 1.0)
```

---

## 7. Economic Simulation Parameters

### 7.1 Initial Test Configuration

```yaml
# simulation_config.yaml
network:
  initial_users: 1000
  growth_rate: 0.10  # 10% monthly
  retention_rate: 0.75

token:
  base_issuance: 1.0  # 1 hour = 1 token
  target_inflation: 0.05  # 5% monthly
  max_inflation: 0.15  # 15% monthly cap

fees:
  matching: 0.005  # 0.5%
  insurance: 0.01  # 1.0%
  treasury: 0.005  # 0.5%
  burn_rate: 0.30  # 30% of fees

staking:
  min_stake: 10
  base_apy: 0.08  # 8%
  lock_multipliers:
    0: 0.5      # Flexible
    30: 1.0     # 1 month
    90: 1.25    # 3 months
    180: 1.5    # 6 months
    365: 2.0    # 12 months

slashing:
  minor: 0.05
  moderate: 0.25
  major: 1.0
  critical: 1.0
```

### 7.2 Simulation Scenarios

| Scenario | Description | Expected Outcome |
|----------|-------------|------------------|
| **Bull Run** | 3x user growth, high demand | Inflation 8-12%, fees increase, burn accelerates |
| **Bear Market** | 50% user drop, low activity | Inflation drops to 2%, fee reduction triggers |
| **Sybil Attack** | 20% fake accounts detected | Slashing activates, reputation system stress test |
| **Viral Growth** | 10x user growth in 1 month | Circuit breakers activate, issuance dampening |
| **Long Stagnation** | No growth for 6 months | Decay mechanisms activate, dormant accounts penalized |

---

*This technical specification accompanies the Timebank Tokenomics Whitepaper and provides implementation-level detail for developers and economists.*
