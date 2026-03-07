# Timebank Tokenomics Whitepaper
## Soulbound TimeToken ($TIMEBANK) Economic Model

**Version:** 1.0  
**Date:** March 2025  
**Status:** Architecture Phase

---

## Executive Summary

Timebank introduces a revolutionary mutual aid economy powered by Soulbound TimeTokens ($TIMEBANK)—non-transferable tokens representing verified hours of human contribution. Unlike speculative cryptocurrencies, TimeTokens are earned exclusively through verified service provision, creating a reputation-backed economy of trust and reciprocity.

This document outlines the complete tokenomic architecture, including supply mechanics, issuance rates, fee structures, reputation staking, and governance safeguards.

---

## 1. Token Supply Model

### 1.1 Token Classification

| Property | Specification |
|----------|---------------|
| Token Name | TimeToken |
| Symbol | $TIMEBANK |
| Type | Soulbound Token (SBT) |
| Transferability | **NON-TRANSFERABLE** |
| Divisibility | 2 decimal places (0.01 hour precision) |
| Total Supply | **Uncapped, dynamically issued** |
| Supply Model | Proof-of-Service (PoS) |

### 1.2 Core Principles

1. **No Speculation**: Tokens cannot be bought, sold, or traded
2. **Labor-Backed**: Every token represents verified human time
3. **Reputation-Coupled**: Token balance = social capital
4. **Inflation-Responsive**: Issuance adapts to network demand

### 1.3 Supply Dynamics

```
Total Supply = Σ (Verified Hours) × Exchange Rate Multiplier

Where:
- Verified Hours = Time audited and confirmed by both parties
- Exchange Rate Multiplier = Dynamic factor based on service category
```

---

## 2. Issuance Rate & Exchange Rates

### 2.1 Base Exchange Rate

**1 Hour of Verified Service = 1.00 $TIMEBANK**

This 1:1 ratio serves as the protocol's atomic unit, ensuring intuitive understanding and transparent valuation.

### 2.2 Category Multipliers

Services are categorized by skill level, demand, and verification complexity:

| Tier | Category Examples | Multiplier | Hourly $TIMEBANK |
|------|-------------------|------------|------------------|
| T1 | Basic assistance (errands, companionship) | 1.0× | 1.00 |
| T2 | Skilled trades (carpentry, plumbing) | 1.25× | 1.25 |
| T3 | Professional services (legal, medical) | 1.5× | 1.50 |
| T4 | Specialized expertise (engineering, surgery) | 2.0× | 2.00 |
| T5 | Emergency/on-call services | 2.5× | 2.50 |

### 2.3 Dynamic Demand Adjustment

To prevent oversupply in saturated categories:

```
Effective Multiplier = Base Multiplier × Demand Factor

Demand Factor = 1 + (Category Demand Index - 0.5)

Where Category Demand Index is calculated weekly based on:
- Request-to-provider ratio
- Average fulfillment time
- User satisfaction scores
```

**Bounds:** 0.5× ≤ Demand Factor ≤ 2.0×

### 2.4 Time-Decay Issuance (Anti-Hoarding)

To encourage circulation over accumulation:

| Holding Period | Issuance Modifier |
|----------------|-------------------|
| Active user (last 30 days) | 1.0× (full rate) |
| Moderate activity (31-90 days) | 0.9× |
| Low activity (91-180 days) | 0.75× |
| Dormant (181+ days) | 0.5× |

*Note: This applies only to new earnings, not existing balance.*

---

## 3. Initial Distribution Mechanism

### 3.1 Genesis Distribution (Launch Phase)

Since tokens cannot be purchased, initial distribution relies on verified pre-network contributions:

| Allocation | Percentage | Method |
|------------|------------|--------|
| Founding Contributors | 15% | Verified contributions during beta testing |
| Early Adopter Airdrop | 20% | On-chain verification of community participation |
| Ecosystem Reserve | 25% | Locked for protocol incentives (6-month vesting) |
| Development Fund | 20% | Team and infrastructure (12-month linear vesting) |
| Community Treasury | 20% | DAO-governed, released based on milestones |

### 3.2 Verification Requirements for Genesis

To claim initial tokens, participants must provide:

1. **Proof-of-Service Documentation**:
   - Service provider testimonials
   - Third-party verification (existing timebanks, NGOs)
   - On-chain attestations from verified validators

2. **Identity Verification**:
   - Sybil-resistant identity (WorldID, Gitcoin Passport, or equivalent)
   - Minimum reputation score threshold

3. **Time Lock**: Genesis tokens vest over 6 months to prevent dump-and-run

### 3.3 Post-Genesis Issuance

All post-launch tokens are minted exclusively through:
- **Verified service completion** (primary mechanism)
- **Bug bounties and protocol contributions** (secondary)
- **Governance participation rewards** (tertiary)

---

## 4. Fee Structure & Burn Mechanism

### 4.1 Transaction Fees

Every service exchange incurs protocol fees to sustain the network:

| Fee Type | Rate | Purpose |
|----------|------|---------|
| Matching Fee | 0.5% | Platform matching and verification |
| Insurance Fee | 1.0% | Dispute resolution and slashing pool |
| Treasury Fee | 0.5% | Protocol development and grants |
| **Total** | **2.0%** | |

**Fee Collection**: Deducted from recipient's earnings (not sender)

### 4.2 Burn Mechanism (Deflationary Pressure)

To create deflationary offset against continuous issuance:

```
Monthly Burn = 30% of Protocol Fees + Dispute Resolution Penalties

Additional Burn Triggers:
- Failed verification attempts: 100% of disputed amount burned
- Slashed stake: 50% burned, 50% to insurance pool
- Inactive accounts (2+ years): Gradual decay (1% per month)
```

### 4.3 Fee Redistribution

```
Fee Distribution:
├── 30% → Token Burn (deflationary)
├── 30% → Insurance/Staking Pool (security)
├── 25% → Treasury (development)
└── 15% → Validators/Oracles (verification incentives)
```

### 4.4 Dynamic Fee Adjustment

Fees adjust based on network congestion:

| Network Load | Fee Multiplier |
|--------------|----------------|
| Low (<40% capacity) | 0.8× |
| Normal (40-70% capacity) | 1.0× |
| High (70-90% capacity) | 1.3× |
| Critical (>90% capacity) | 1.5× |

---

## 5. Staking for Reputation

### 5.1 Reputation Staking Model

Users can stake $TIMEBANK to amplify their reputation score and unlock platform privileges:

| Stake Tier | Amount | Benefits |
|------------|--------|----------|
| Bronze | 10 $TIMEBANK | Priority matching, basic verification badge |
| Silver | 50 $TIMEBANK | Faster dispute resolution, enhanced profile visibility |
| Gold | 200 $TIMEBANK | Early access to high-value requests, validator eligibility |
| Platinum | 500 $TIMEBANK | Governance voting rights, arbitration panel eligibility |
| Diamond | 1,000+ $TIMEBANK | Protocol council membership, fee discounts |

### 5.2 Staking Mechanics

**Lock Periods:**
- **Flexible**: No lock, 50% rewards
- **1 Month**: 1.0× rewards
- **3 Months**: 1.25× rewards
- **6 Months**: 1.5× rewards
- **12 Months**: 2.0× rewards

**Unstaking:**
- Emergency unstake: 10% penalty (burned)
- Normal unstake: 7-day cooldown

### 5.3 Staking Rewards

Stakers earn rewards from the protocol fee pool:

```
Annual Staking Yield = (Protocol Revenue × 0.30 × User Stake) / Total Staked

Expected Base APY: 5-15% (varies with network activity)
```

**Reward Distribution:**
- 70% to stakers
- 20% compounded to stake
- 10% to insurance buffer

### 5.4 Reputation Multiplier

Staked tokens amplify reputation score:

```
Effective Reputation = Base Reputation × (1 + log₁₀(Staked Amount / 10))

Example:
- 10 $TIMEBANK staked: 1.0× multiplier
- 100 $TIMEBANK staked: 2.0× multiplier
- 1,000 $TIMEBANK staked: 3.0× multiplier
```

---

## 6. Slashing Conditions

### 6.1 Slashable Offenses

| Offense Severity | Examples | Slashing Penalty |
|------------------|----------|------------------|
| **Minor** | Late delivery, minor quality issues | 5% of staked amount |
| **Moderate** | No-show without notice, misrepresented skills | 25% of staked amount |
| **Major** | Fraudulent service claims, harassment | 100% of staked amount + reputation reset |
| **Critical** | Systemic fraud, Sybil attacks, protocol exploitation | Permanent ban + full balance burn |

### 6.2 Slashing Process

```
1. Dispute Filed
        ↓
2. Evidence Submission (both parties, 72-hour window)
        ↓
3. Validator Review (randomly selected jury of 5 stakers)
        ↓
4. Voting Period (48 hours, 2/3 majority required)
        ↓
5. Appeal Window (7 days for major+ offenses)
        ↓
6. Execution (if upheld)
```

### 6.3 Slashing Distribution

```
Slashed Funds Allocation:
├── 50% → Burned (permanent deflation)
├── 30% → Victim Compensation
├── 15% → Validator Reward
└── 5% → Treasury
```

### 6.4 False Accusation Penalty

To prevent griefing:

- Accuser stake required: 5 $TIMEBANK minimum
- If accusation ruled false: Accuser loses 50% of stake
- Repeated false accusations (3+): Permanent reputation damage

### 6.5 Graduated Response

| Strike Count | Consequence |
|--------------|-------------|
| 1st | Warning + 5% slash |
| 2nd | 25% slash + 30-day probation |
| 3rd | 50% slash + 90-day matching restriction |
| 4th | 100% slash + reputation reset |
| 5th+ | Permanent ban |

*Strikes decay after 12 months of good standing*

---

## 7. Economic Safeguards

### 7.1 Circuit Breakers

Emergency mechanisms to protect the network:

| Trigger | Action |
|---------|--------|
| >50% supply concentrated in <1% wallets | Pause large stakes, activate distribution incentives |
| >10% monthly inflation | Activate burn acceleration, reduce issuance multipliers |
| >5% active users slashed in 30 days | Pause new staking, review verification criteria |
| Protocol exploit detected | Emergency pause, DAO intervention required |

### 7.2 Governance Safeguards

- **Parameter Changes**: Require 2/3 majority + 7-day timelock
- **Supply Cap Exception**: Cannot implement hard cap (violates timebank philosophy)
- **Fee Changes**: Limited to ±50% of base rates per quarter

### 7.3 Oracle System

Decentralized verification through:
- **Human Oracles**: Staked validators manually verify high-value services
- **AI Oracles**: Automated verification for standardized services
- **Social Oracles**: Mutual attestation network (web-of-trust model)

---

## 8. Token Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TIME TOKEN ECONOMIC CYCLE                       │
└─────────────────────────────────────────────────────────────────────┘

   ┌─────────────┐
   │   Service   │
   │   Request   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐     ┌─────────────────┐
   │   Service   │────▶│  Verification   │
   │  Completion │     │   (Oracles)     │
   └─────────────┘     └────────┬────────┘
                                │
                                ▼
   ┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
   │   Staking   │◀────│   $TIMEBANK     │────▶│  Spending   │
   │  (Reputation)│     │    Minted       │     │  (Services) │
   └──────┬──────┘     └─────────────────┘     └─────────────┘
          │
          │           ┌─────────────────┐
          └──────────▶│   Fee Pool      │
                      │  (2% per txn)   │
                      └────────┬────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
      ┌─────────┐        ┌─────────┐        ┌─────────┐
      │  Burn   │        │Staking  │        │Treasury │
      │ (30%)   │        │Rewards  │        │ (25%)   │
      └─────────┘        │ (30%)   │        └─────────┘
                         └─────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   Slashing  │
                        │   (if bad   │
                        │    actor)   │
                        └─────────────┘
```

---

## 9. Key Metrics & Monitoring

### 9.1 Health Indicators

| Metric | Target Range | Alert Threshold |
|--------|--------------|-----------------|
| Monthly Inflation Rate | 2-8% | >15% or <0% |
| Active/User Ratio | >60% | <40% |
| Average Stake Time | >30 days | <7 days |
| Dispute Rate | <2% | >5% |
| Slash Events | <1% users/month | >3% users/month |

### 9.2 Success Metrics

1. **Velocity**: Average token circulation frequency
2. **Gini Coefficient**: Wealth distribution equality (target: <0.4)
3. **Retention**: 90-day user retention rate (target: >70%)
4. **Net Promoter Score**: User satisfaction (target: >50)

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] Smart contract development (Soulbound token standard)
- [ ] Oracle verification system
- [ ] Basic staking mechanism
- [ ] Testnet deployment

### Phase 2: Bootstrap (Months 4-6)
- [ ] Genesis distribution
- [ ] Validator recruitment
- [ ] Mainnet launch
- [ ] Initial service categories

### Phase 3: Scale (Months 7-12)
- [ ] Governance DAO activation
- [ ] Advanced reputation algorithms
- [ ] Cross-chain bridges (optional)
- [ ] Mobile app integration

### Phase 4: Maturity (Year 2+)
- [ ] Full decentralization
- [ ] Protocol fee minimization
- [ ] Global expansion
- [ ] Academic research partnerships

---

## 11. Conclusion

Timebank's tokenomics represent a fundamental reimagining of value exchange. By binding tokens to verified human time—and making them non-transferable—we create an economy that:

- **Rewards contribution over capital**
- **Builds reputation through action**
- **Resists speculation and extraction**
- **Self-regulates through aligned incentives**

The combination of dynamic issuance, deflationary burns, reputation staking, and graduated slashing creates a robust economic engine that prioritizes human flourishing over financial extraction.

**Time is the one resource we all share equally. Timebank ensures it's valued that way.**

---

## Appendices

### Appendix A: Mathematical Models

**Detailed formulas for economic simulations available in `models/timebank_simulation.py`**

### Appendix B: Smart Contract Specifications

**Technical implementation details in `contracts/` directory**

### Appendix C: Governance Framework

**DAO structure and proposal processes documented separately**

---

*Document Version: 1.0*  
*Last Updated: March 2025*  
*Next Review: April 2025*

**Contact:** timebank@syntropix.io  
**Community:** discord.gg/timebank  
**Repository:** github.com/syntropix/timebank-tokenomics
