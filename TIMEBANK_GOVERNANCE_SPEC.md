# TIMEBANK DAO GOVERNANCE SPECIFICATION
## Version 1.0 | March 2026

---

## EXECUTIVE SUMMARY

The Timebank DAO implements a **dual-token governance model** that separates economic value (TimeTokens) from governance power (VotePower). This design prevents wealth concentration while ensuring long-term community stewardship.

**Core Philosophy:** *"Those who contribute time earn voice; those who steward well earn trust."*

---

## 1. GOVERNANCE TOKEN: VOTEPOWER (VP)

### 1.1 Token Design

| Property | TimeToken (TT) | VotePower (VP) |
|----------|----------------|----------------|
| **Purpose** | Medium of exchange | Governance rights |
| **Transferability** | Soulbound (non-transferable) | Soulbound (non-transferable) |
| **Expiration** | 6-24 months (configurable) | **Non-expiring** |
| **Minting** | Through service completion | Through participation + delegation |
| **Burning** | Upon expiration | Slashing for misconduct |
| **Supply Cap** | Inflationary (time-based) | Deflationary through slashing |

### 1.2 VotePower Acquisition

VotePower is earned through **participation vectors**, not purchased:

```
VP = Base_Earnings + Reputation_Bonus + Delegation_Bonus - Slashing_Penalties
```

**Earning Mechanisms:**

| Activity | VP Earned | Notes |
|----------|-----------|-------|
| Complete service (as provider) | 1 VP per hour served | Base earning |
| Complete service (as requester) | 0.5 VP per hour received | Encourages both sides |
| Successful dispute resolution | 5 VP per case | Juror reward |
| Proposal passed (as author) | 10 VP | Successful governance |
| Verified skill added | 2 VP per skill | Skill diversity bonus |
| Referral (new active member) | 5 VP | Growth incentive |
| Continuous participation (6mo+) | 1.5x multiplier | Loyalty bonus |

### 1.3 VotePower Tiers

| Tier | VP Required | Governance Rights |
|------|-------------|-------------------|
| **Member** | 1+ VP | Vote on standard proposals |
| **Contributor** | 50+ VP | Create standard proposals |
| **Steward** | 200+ VP | Create critical proposals, dispute juror |
| **Guardian** | 500+ VP | Emergency actions (with multisig) |

---

## 2. PROPOSAL SYSTEM

### 2.1 Proposal Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPOSAL HIERARCHY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PARAMETER     │  │    TREASURY     │  │    MEMBERSHIP   │ │
│  │    CHANGES      │  │    ALLOCATION   │  │     ACTIONS     │ │
│  │  (Standard)     │  │   (Critical)    │  │  (Standard)     │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│  • Fee rates            • Grants >1000 TT    • Member removal  │
│  • Expiration period    • Treasury split    • Skill verify    │
│  • Reputation weights   • Emergency fund    • Ban appeals     │
│  • Matching algo        • Protocol fees                        │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    CONTRACT     │  │    EMERGENCY    │  │    PROTOCOL     │ │
│  │    UPGRADES     │  │     ACTIONS     │  │    EVOLUTION    │ │
│  │  (Constitution) │  │   (Emergency)   │  │ (Constitution)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  • New features         • Pause contract       • Charter amend │
│  • Bug fixes            • Freeze accounts      • Fork decision │
│  • Security patches     • Emergency upgrade    • Tokenomics    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Proposal Requirements by Type

| Proposal Type | Min VP to Create | Seconding Required | Voting Period | Execution Delay |
|--------------|------------------|-------------------|---------------|-----------------|
| **Standard** | 50 VP | 3 members (10+ VP each) | 7 days | 2 days |
| **Critical** | 200 VP | 5 members (50+ VP each) | 14 days | 7 days |
| **Constitution** | 500 VP + 3 Guardians | 10 members (200+ VP each) | 21 days | 14 days |
| **Emergency** | 3 Guardians + multisig | Immediate | 48 hours | Immediate* |

*Emergency proposals execute immediately after passing but can be vetoed by 5 Guardians within 24h.

### 2.3 Proposal Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  DRAFT   │ -> │ PENDING  │ -> │  ACTIVE  │ -> │ EXECUTED │ or │ REJECTED │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
      │              │               │               │               │
      │         3-10 seconds    7-21 days       2-14 days           │
      │         (min VP req)    (voting)        (timelock)          │
      │                                                             │
      └──────────────────── Can be cancelled by proposer ───────────┘
                                   (before execution)
```

**Draft Phase:**
- Proposer creates proposal with executable calldata
- Proposal sits in draft for 48h "cooling period"
- Community can review and discuss
- Proposer can edit or withdraw

**Pending Phase:**
- Requires seconding (signatures from qualified members)
- Seconders stake 10 VP each (returned if proposal passes)
- Quorum check: minimum participation threshold

**Active Phase:**
- Voting open to all VP holders
- Vote can be changed until period ends
- Delegation honored in real-time

**Execution Phase:**
- Passed proposals enter timelock
- Cancelable by proposer during timelock
- Auto-executed after timelock expires

---

## 3. VOTING MECHANISM

### 3.1 Voting Options

All proposals use **quadratic voting** to prevent whale dominance:

```
Effective_Votes = √(VP_Delegated_to_Option)
```

| Option | Use Case |
|--------|----------|
| **For** | Support proposal |
| **Against** | Oppose proposal |
| **Abstain** | Participate in quorum without taking side |
| **Veto** | Constitutional proposals only - block with 25% |

### 3.2 Delegation System

```
┌─────────────────────────────────────────────────────────────────┐
│                     DELEGATION MODEL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Member A (100 VP) ──────┐                                    │
│                           │                                    │
│   Member B (50 VP) ───────┼───> Delegate to Steward X          │
│                           │      (200 VP base + 150 delegated) │
│   Member C (50 VP) ───────┘      = 350 VP voting power          │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ DELEGATION RULES:                                       │   │
│   │ • Delegation is revocable at any time                   │   │
│   │ • Max 1 delegate per member                             │   │
│   │ • Max 10 delegators per delegate (anti-concentration)   │   │
│   │ • Delegated VP earns 0.1x multiplier for delegate       │   │
│   │ • Undelegated VP earns 1.2x multiplier (active bonus)   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Reputation-Weighted Voting

Reputation Score (0-1000) provides voting multipliers:

| Reputation | Multiplier | Description |
|------------|------------|-------------|
| 0-300 | 0.8x | New/lower-trust members |
| 301-600 | 1.0x | Standard member |
| 601-800 | 1.2x | Established contributor |
| 801-950 | 1.5x | Highly trusted member |
| 951-1000 | 2.0x | Community elder (rare) |

**Reputation Decay:**
- -10 points per month of inactivity
- Cannot delegate VP with <300 reputation

---

## 4. QUORUM REQUIREMENTS

### 4.1 Dynamic Quorum Formula

```solidity
quorum = base_quorum + (total_vp / participation_factor) + recent_engagement_bonus
```

| Proposal Type | Base Quorum | Participation Factor | Max Quorum Cap |
|--------------|-------------|---------------------|----------------|
| Standard | 10% of total VP | 10 | 25% of total VP |
| Critical | 20% of total VP | 8 | 40% of total VP |
| Constitutional | 33% of total VP | 5 | 51% of total VP |
| Emergency | 40% of total VP | 3 | 60% of total VP |

### 4.2 Participation History Adjustment

```
If last_proposal_quorum < required_quorum:
    new_quorum = required_quorum * 0.9  // Lower by 10%
If last_proposal_quorum > required_quorum * 1.5:
    new_quorum = required_quorum * 1.05  // Raise by 5%
```

This prevents governance gridlock while maintaining legitimacy.

### 4.3 Minimum Approval Thresholds

| Proposal Type | Simple Majority | Supermajority | Veto Threshold |
|--------------|-----------------|---------------|----------------|
| Standard | 50% + 1 | - | - |
| Critical | - | 60% | - |
| Constitutional | - | 66% | 25% |
| Emergency | - | 70% | 33% (within 24h) |

---

## 5. EXECUTION DELAYS (TIMELOCKS)

### 5.1 Timelock Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIMELOCK LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Short Timelock (2 days)                               │
│  ├── Parameter changes (fees, expiration)                       │
│  ├── Member management (skill verification)                     │
│  └── Minor treasury allocations (< 1000 TT)                     │
│                                                                 │
│  Layer 2: Medium Timelock (7 days)                              │
│  ├── Treasury allocations (1000-10000 TT)                       │
│  ├── Reputation system changes                                  │
│  └── Protocol fee adjustments                                   │
│                                                                 │
│  Layer 3: Long Timelock (14 days)                               │
│  ├── Constitution amendments                                    │
│  ├── Major treasury allocations (> 10000 TT)                    │
│  ├── Contract upgrades                                          │
│  └── Governance parameter changes                               │
│                                                                 │
│  Emergency Override: 0 days (with Guardian multisig)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Timelock Cancellation

During the timelock period:
- **Proposer** can cancel with 0 penalty (buyer's remorse)
- **5 Stewards** can cancel if critical flaw discovered
- **Emergency Council** can expedite execution during crisis

### 5.3 Staged Execution

For high-risk proposals, execution occurs in stages:

```
Stage 1: Test deployment (1% of resources, 48h observation)
Stage 2: Limited deployment (10% of resources, 7 days observation)
Stage 3: Full deployment (100% of resources)
```

Any stage can be vetoed by 3 Guardians.

---

## 6. EMERGENCY POWERS

### 6.1 Emergency Council

**Composition:** 5 Guardians + 2 rotating Stewards

**Emergency Actions Available:**

| Action | Required Signatures | Duration | Override |
|--------|-------------------|----------|----------|
| Pause contract | 3 Guardians | 7 days max | DAO vote extends |
| Freeze account | 4 Guardians | 30 days max | Must justify to DAO |
| Emergency upgrade | 5 Guardians | Immediate | 48h veto window |
| Treasury release | All 5 Guardians | One-time | DAO ratification required |

### 6.2 Emergency Proposal Process

```
1. Guardian submits emergency proposal with evidence
2. 4 other Guardians must sign within 24 hours
3. If signed, executes immediately
4. 48-hour community veto window opens
5. If 25% of VP holders veto → proposal void, Guardians slashed 100 VP each
6. If no veto → proposal stands, DAO reviews at next meeting
```

### 6.3 Circuit Breakers

Automatic pauses triggered by on-chain metrics:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Unusual outflow | >10% treasury in 24h | Pause withdrawals |
| Failed proposal spam | >10 proposals/day | Increase min VP to 100 |
| Reputation manipulation | >50 accounts with identical scores | Freeze reputation updates |
| Contract interaction anomaly | >3 std devs from normal | Pause affected function |

---

## 7. UPGRADE MECHANISM

### 7.1 Proxy Pattern

Timebank uses **UUPS Proxy Pattern** for upgradeability:

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPGRADE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Users ---> Proxy Contract ---> Implementation V1              │
│                                         ↓                       │
│                              Upgrade Proposal (Constitutional)  │
│                                         ↓                       │
│                              Implementation V2                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ IMMUTABLE ELEMENTS (cannot be upgraded):                │   │
│   │ • VotePower token contract address                      │   │
│   │ • Treasury ownership structure                          │   │
│   │ • Emergency Council appointment (first 6 months)        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Upgrade Process

```
Phase 1: Proposal (21 days voting)
├── Security audit by 2 independent parties
├── Community review period (7 days)
└── Upgrade contract deployed to testnet

Phase 2: Timelock (14 days)
├── Bug bounty active on testnet
├── Guardian review and sign-off
└── Emergency rollback plan prepared

Phase 3: Execution
├── Upgrade transaction signed by multisig
├── 24-hour observation period
└── Community notification

Phase 4: Verification
├── 7-day monitoring period
└── DAO ratification vote (non-binding)
```

### 7.3 Version Registry

All upgrades are logged immutably:

```
struct Version {
    uint256 version_number;
    address implementation;
    bytes32 code_hash;
    uint256 upgrade_timestamp;
    address[] approvers;  // Guardians who signed
    string audit_report_ipfs;
    bool emergency;  // True if emergency upgrade
}
```

---

## 8. MULTI-SIG REQUIREMENTS

### 8.1 Multi-Sig Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-SIG STRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tier 1: Community Treasury (Gnosis Safe equivalent)            │
│  ├── 7 signers: 4 Stewards + 3 Guardians                       │
│  ├── Threshold: 4 of 7                                          │
│  └── Scope: All treasury operations > 1000 TT                   │
│                                                                 │
│  Tier 2: Protocol Operations                                    │
│  ├── 5 signers: 3 Stewards + 2 technical leads                  │
│  ├── Threshold: 3 of 5                                          │
│  └── Scope: Parameter updates, oracle feeds                     │
│                                                                 │
│  Tier 3: Emergency Council                                      │
│  ├── 5 Guardians only                                           │
│  ├── Threshold: 3 of 5 (emergency) / 5 of 5 (treasury)          │
│  └── Scope: Emergency actions, major upgrades                   │
│                                                                 │
│  Tier 4: Recovery Key (Social Recovery)                         │
│  ├── 9 signers: 5 community elders + 4 external advisors        │
│  ├── Threshold: 6 of 9                                          │
│  └── Scope: Recover lost governance, reset emergency council    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Signer Rotation

| Tier | Rotation Period | Election Method |
|------|-----------------|-----------------|
| Tier 1 | 6 months | DAO election |
| Tier 2 | 3 months | Stewards nominate, DAO confirms |
| Tier 3 | 12 months | Guardians co-opt, DAO ratifies |
| Tier 4 | Emergency only | External appointment |

### 8.3 Multi-Sig Safeguards

```solidity
// Time delays between signing and execution
mapping(uint256 => uint256) public executionDelay = {
    1: 2 days,    // Tier 1
    2: 1 days,    // Tier 2
    3: 0 days,    // Tier 3 (emergency)
    4: 14 days    // Tier 4 (recovery)
};

// Daily spending limits
tier1DailyLimit = 5000 TT;
tier2DailyLimit = 1000 TT;
```

---

## 9. GOVERNANCE ECONOMICS

### 9.1 Proposal Costs

| Action | Cost | Refund Condition |
|--------|------|------------------|
| Submit Standard Proposal | 10 VP | Refunded if passes |
| Submit Critical Proposal | 50 VP | Refunded if passes |
| Submit Constitutional Proposal | 100 VP | Refunded if passes |
| Second a Proposal | 10 VP | Refunded if passes |
| Challenge Execution | 25 VP | Refunded if successful |

### 9.2 Voting Incentives

To prevent low participation:

```
Voting_Reward = Base_Reward * Participation_Multiplier

Base_Reward: 0.1 VP per vote
Participation_Multiplier: 
  - If quorum < 50%: 3x
  - If quorum 50-75%: 1.5x
  - If quorum 75-100%: 1x
```

### 9.3 Slashing Conditions

| Violation | Slashing Amount | Additional Penalty |
|-----------|----------------|-------------------|
| Malicious proposal | 100% of VP | Ban from governance 6mo |
| Failed emergency claim | 100 VP per Guardian | Removal from council |
| Voting collusion (detected) | 50% of VP | Reputation reset to 300 |
| Ghost proposals (spam) | 100% of proposal cost | Temporary VP freeze |

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)
- [ ] Deploy VotePower token contract
- [ ] Implement basic proposal creation/voting
- [ ] Setup 3-of-5 Guardian multisig
- [ ] Launch with 50 founding members

### Phase 2: Maturation (Weeks 5-12)
- [ ] Activate delegation system
- [ ] Implement reputation-weighted voting
- [ ] Deploy timelock contracts
- [ ] Enable treasury management

### Phase 3: Decentralization (Months 4-6)
- [ ] Guardian elections (replace appointed with elected)
- [ ] Full upgradeability activation
- [ ] Emergency council rotation
- [ ] Constitution ratification vote

### Phase 4: Optimization (Months 6-12)
- [ ] Gas optimization review
- [ ] Cross-community governance (federation)
- [ ] AI-assisted proposal screening (optional)
- [ ] Governance analytics dashboard

---

## 11. SMART CONTRACT ARCHITECTURE

### 11.1 Core Contracts

```
TimebankGovernance.sol
├── VotePowerToken (ERC20-like, soulbound)
├── ProposalRegistry (CRUD for proposals)
├── VotingModule (quadratic + reputation weighted)
├── TimelockController (execution delays)
├── EmergencyCouncil (multisig + emergency powers)
├── TreasuryMultisig (Gnosis Safe pattern)
└── UpgradeController (UUPS proxy admin)
```

### 11.2 Key Functions

```solidity
// Proposal Management
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description,
    ProposalType proposalType
) external returns (uint256 proposalId);

function castVote(
    uint256 proposalId,
    uint8 support,  // 0=against, 1=for, 2=abstain
    uint256 vpAmount
) external;

function delegate(address delegatee) external;
function undelegate() external;

// Emergency Functions
function emergencyPause(string memory reason) external onlyGuardian;
function emergencyUpgrade(address newImplementation) external onlyGuardian;
function vetoEmergency(uint256 emergencyId) external;

// Execution
function queue(uint256 proposalId) external;
function execute(uint256 proposalId) external payable;
function cancel(uint256 proposalId) external;
```

---

## 12. RISK MITIGATION

### 12.1 Attack Vectors & Defenses

| Attack | Defense |
|--------|---------|
| **51% VP Attack** | Quadratic voting + reputation weighting |
| **Flash Loan Governance** | VotePower is soulbound, non-transferable |
| **Proposal Spam** | Escalating costs + VP staking |
| **Long-Range Attack** | VotePower non-expiring but reputation decays |
| **Bribery** | Secret ballot option (ZK proofs) |
| **Governance Gridlock** | Dynamic quorum adjustment |
| **Multisig Capture** | Tiered multisig + social recovery |

### 12.2 Circuit Breaker Conditions

```solidity
// Auto-pause triggers
if (dailyTreasuryOutflow > 10% of balance) PAUSE_WITHDRAWALS;
if (failedProposals > 10 in 24h) RAISE_PROPOSAL_COST;
if (newAccountsWithMaxVP > 5 in 1h) PAUSE_VP_MINTING;
if (emergencyProposals > 2 in 7d) REQUIRE_CONSTITUTIONAL_REVIEW;
```

---

## 13. SUCCESS METRICS

### 13.1 Governance Health KPIs

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Proposal participation rate | >30% of VP | <15% |
| Average time to execution | <30 days | >60 days |
| Emergency proposal frequency | <2/year | >6/year |
| Multisig execution time | <48 hours | >7 days |
| Governance VP concentration (Gini) | <0.4 | >0.6 |
| Proposal success rate | 40-60% | <20% or >80% |

### 13.2 Quarterly Review Process

Every 90 days, the DAO evaluates:
1. Participation trends and quorum effectiveness
2. Proposal quality and execution success
3. Multisig signer performance
4. Economic parameter adjustments needed
5. Constitution amendment proposals

---

## 14. LEGAL & COMPLIANCE

### 14.1 Jurisdiction Considerations

- **Legal Structure:** Swiss Verein or Cayman Foundation
- **Liability:** Limited liability for token holders
- **Compliance:** KYC for Guardian-level participants
- **Tax:** Non-profit status for treasury operations

### 14.2 Dispute Resolution

1. **On-chain:** DAO vote for protocol-level disputes
2. **Off-chain:** Arbitral tribunal for contractual disputes
3. **Emergency:** Guardian council for security incidents

---

## APPENDIX

### A. Governance Parameter Defaults

| Parameter | Initial Value | Adjustable Via |
|-----------|---------------|----------------|
| Voting period (standard) | 7 days | Critical proposal |
| Quorum (standard) | 10% | Constitution proposal |
| Execution delay (standard) | 2 days | Critical proposal |
| VP per hour served | 1 VP | Critical proposal |
| Reputation decay rate | 10/month | Critical proposal |
| Guardian count | 5 | Constitution proposal |
| Treasury daily limit | 5000 TT | Critical proposal |

### B. Sample Proposal Templates

Available at: `docs.timebank.org/governance/templates`

1. Parameter Change Template
2. Treasury Allocation Template
3. Member Action Template
4. Contract Upgrade Template
5. Constitution Amendment Template

### C. Emergency Contact Tree

```
Emergency Escalation:
1. Discord #emergency channel
2. On-chain emergency proposal
3. Guardian multisig direct message
4. Recovery key holders (last resort)
```

---

## DOCUMENT VERSION

- **Version:** 1.0
- **Created:** March 7, 2026
- **Last Updated:** March 7, 2026
- **Authors:** Timebank Governance Working Group
- **Review Status:** Draft for Community Comment

---

*"The best governance is the one that empowers the many while protecting the few."*
