# Timebank Protocol Architecture
## Blockchain-Based Mutual Aid System

### Core Concept

A decentralized time banking system where:
- **1 TimeToken = 15 minutes of service**
- **Non-transferable** (soulbound to the earner)
- **Expiration mechanism** (encourages circulation, prevents hoarding)
- **Skill-tagged** (on-chain metadata for matching)
- **Community-governed** (dispute resolution, verification)

### Why Blockchain?

Traditional timebanks fail due to:
1. **Coordination overhead** — Matching supply/demand is manual
2. **Trust issues** — No reputation system, no recourse for no-shows
3. **Accounting complexity** — Tracking credits across a community
4. **Limited reach** — Local only, no network effects

Blockchain solves all four:
1. **Automated matching** — Smart contracts pair requests with providers
2. **Transparent reputation** — On-chain history, immutable ratings
3. **Automatic accounting** — Tokens minted/burned programmatically
4. **Global reach** — Anyone with internet can participate

---

## Technical Architecture

### Token Design: TimeToken (TT)

```rust
// Solana SPL Token with extensions
pub struct TimeToken {
    // Standard SPL fields
    pub mint: Pubkey,
    pub supply: u64,
    
    // TimeToken-specific
    pub earning_period: i64,      // When tokens were earned (unix timestamp)
    pub expiration_period: i64,   // When tokens expire (default: 1 year)
    pub skill_tags: Vec<String>,  // What services this represents
    pub earned_by: Pubkey,        // Soulbound to this address
    pub transferable: bool,       // Always false for earned tokens
}
```

**Key Properties:**
- **Soulbound**: Cannot be transferred to another wallet
- **Expiring**: 1-year default expiration (configurable by community)
- **Skill-tagged**: Metadata indicates what service was provided
- **Non-fungible within category**: 1 hour of plumbing ≠ 1 hour of legal advice

### Smart Contract: Timebank Core

```rust
#[program]
pub mod timebank {
    use super::*;
    
    // Initialize a new timebank community
    pub fn initialize_community(
        ctx: Context<InitializeCommunity>,
        name: String,
        region: String,
        expiration_months: u8,
    ) -> Result<()> {
        // Create community treasury
        // Set governance parameters
        // Initialize skill registry
    }
    
    // Register as a service provider
    pub fn register_provider(
        ctx: Context<RegisterProvider>,
        skills: Vec<Skill>,
        availability: Availability,
    ) -> Result<()> {
        // Verify identity (optional: KYC for high-stakes services)
        // Stake collateral (slashed for no-shows/fraud)
        // Add to provider registry
    }
    
    // Request a service
    pub fn request_service(
        ctx: Context<RequestService>,
        skill_required: String,
        duration_estimate: u16,  // in 15-min increments
        description: String,
    ) -> Result<()> {
        // Escrow TimeTokens from requester
        // Match with available providers
        // Create service agreement
    }
    
    // Accept a service request
    pub fn accept_request(
        ctx: Context<AcceptRequest>,
        request_id: Pubkey,
    ) -> Result<()> {
        // Provider commits to service
        // Lock request from other providers
        // Set deadline
    }
    
    // Complete service + mutual confirmation
    pub fn complete_service(
        ctx: Context<CompleteService>,
        request_id: Pubkey,
        actual_duration: u16,
        rating: u8,  // 1-5 stars
    ) -> Result<()> {
        // Both parties confirm completion
        // Mint TimeTokens to provider
        // Release escrow to provider (or partial refund)
        // Update reputation scores
    }
    
    // Dispute resolution
    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        request_id: Pubkey,
        evidence: String,
    ) -> Result<()> {
        // Escalate to community jurors
        // Stake dispute fee (loser pays)
    }
    
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        dispute_id: Pubkey,
        verdict: Verdict,
    ) -> Result<()> {
        // Jurors vote on outcome
        // Distribute slashed stakes
        // Update reputation (penalty for loser)
    }
}
```

### Skill Registry

```rust
pub struct Skill {
    pub category: SkillCategory,
    pub name: String,
    pub description: String,
    pub verification_required: bool,
    pub avg_duration: u16,  // typical service length in 15-min increments
}

pub enum SkillCategory {
    Technical,      // Plumbing, electrical, coding, repairs
    Professional,   // Legal, accounting, consulting
    Creative,       // Design, writing, music, art
    Physical,       // Moving, cleaning, gardening, massage
    Educational,    // Tutoring, language lessons, mentoring
    Caregiving,     // Childcare, eldercare, pet care
    Transportation, // Rides, delivery, errands
    Wellness,       // Yoga, meditation, therapy (licensed)
}
```

### Reputation System

```rust
pub struct Reputation {
    pub address: Pubkey,
    pub total_services_provided: u32,
    pub total_services_received: u32,
    pub avg_rating_received: f32,     // 1.0 - 5.0
    pub avg_rating_given: f32,        // 1.0 - 5.0 (are they fair raters?)
    pub completion_rate: f32,         // % of accepted requests completed
    pub dispute_losses: u16,          // Number of lost disputes
    pub timebank_tenure: i64,         // Days since registration
    pub trust_score: u16,             // 0-1000 composite score
}

// Trust score calculation
fn calculate_trust_score(rep: &Reputation) -> u16 {
    let rating_component = (rep.avg_rating_received / 5.0) * 300.0;
    let completion_component = rep.completion_rate * 300.0;
    let tenure_component = (rep.timebank_tenure.min(365) as f32 / 365.0) * 200.0;
    let dispute_component = (1.0 - (rep.dispute_losses as f32 / 10.0).min(1.0)) * 200.0;
    
    (rating_component + completion_component + tenure_component + dispute_component) as u16
}
```

---

## User Flow

### 1. Joining the Timebank

```
1. Connect Solana wallet
2. Register profile (name, location, bio)
3. Select skills you can offer
4. Stake 10 SOL collateral (refundable, slashed for fraud)
5. Complete verification (optional: KYC for professional services)
6. Receive starter TimeTokens (10 TT = 2.5 hours)
```

### 2. Offering a Service

```
1. Set availability (calendar integration)
2. Define services offered with time estimates
3. Set preferences (travel distance, remote OK, etc.)
4. Appear in provider directory
```

### 3. Requesting a Service

```
1. Search providers by skill + location
2. View reputation scores + reviews
3. Submit request with description + time estimate
4. Escrow TimeTokens (requester must have balance)
5. Wait for provider acceptance
```

### 4. Service Delivery

```
1. Provider accepts request
2. Both parties confirm start time
3. Service performed
4. Both parties confirm completion + duration
5. TimeTokens minted to provider
6. Ratings exchanged
```

### 5. Dispute Resolution

```
1. Either party raises dispute within 48 hours
2. Evidence submitted on-chain
3. 5 random jurors selected (high trust score required)
4. Jurors vote + stake on outcome
5. Majority verdict executed
6. Slashed collateral distributed to winning side + jurors
```

---

## Economic Design

### Token Issuance

**No fixed supply.** TimeTokens are minted on-demand when:
- Service is completed and confirmed
- Community grants bonus (outstanding contribution)
- Treasury distributes for public goods

**Demurrage (expiration):**
- Tokens expire 1 year after earning
- Encourages circulation, prevents hoarding
- Expired tokens burned, creating deflationary pressure

### Treasury

**Funding sources:**
- 1% fee on all transactions
- Dispute resolution fees
- Sponsorships/donations

**Treasury uses:**
- Onboarding grants (starter tokens for new members)
- Public goods funding (community projects)
- Emergency assistance (members in crisis)
- Development grants (improving the platform)

### Collateral & Slashing

**Provider stake:** 10 SOL (approx $1,000)
Slashed for:
- No-show to accepted request (25%)
- Fraudulent service completion (100%)
- Lost dispute (50%)

**Requester stake:** 1 SOL
Slashed for:
- Fraudulent dispute (100%)
- No-show to confirmed service (25%)

---

## Governance

### Community Parameters (DAO)

Token holders vote on:
- Expiration period (6 months? 1 year? 2 years?)
- Transaction fee rate (0.5%? 1%? 2%?)
- Collateral requirements
- New skill categories
- Treasury allocations

### Juror Selection

To be eligible for dispute jury:
- Trust score > 800
- 10+ completed services
- 0 disputes lost
- Stake 50 SOL during jury duty

Jurors rewarded with:
- Dispute fees (split among jurors)
- Reputation boost
- Treasury bonuses for high participation

---

## Integration with Sheckle

### The Vision

$SHECKLE becomes the **on-ramp**:
1. Buy $SHECKLE with fiat/crypto
2. Stake $SHECKLE to earn TimeTokens
3. Use TimeTokens in the timebank
4. Option to convert excess TimeTokens back to $SHECKLE (at discount)

This creates a **two-token economy**:
- **$SHECKLE**: Speculative, transferable, liquid
- **TimeToken**: Stable, soulbound, utility-focused

### Mechanics

```
$SHECKLE Staking:
- Stake 100 $SHECKLE → Earn 1 TimeToken per week
- Staking lock period: 30 days
- Early unstake: 10% penalty

TimeToken Conversion:
- 10 TimeTokens → 1 $SHECKLE (10% discount to staking rate)
- Creates buy pressure on $SHECKLE
- Prevents TimeToken dumping
```

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Solana |
| Smart Contracts | Rust + Anchor Framework |
| Token Standard | SPL Token with extensions |
| Frontend | React + TypeScript |
| Wallet Adapter | Solana Wallet Adapter |
| Indexing | Helius / QuickNode |
| Storage | Arweave (permanent) + IPFS (metadata) |
| Notifications | Push Protocol / EPNS |
| Calendar | ICS/CalDAV integration |

---

## Roadmap

### Phase 1: MVP (3 months)
- [ ] Smart contract development
- [ ] Basic provider/requester flow
- [ ] Simple reputation system
- [ ] Web interface

### Phase 2: Community (6 months)
- [ ] Multi-community support
- [ ] Dispute resolution system
- [ ] Mobile app
- [ ] Calendar integration

### Phase 3: Scale (12 months)
- [ ] $SHECKLE integration
- [ ] Cross-chain bridges
- [ ] AI-powered matching
- [ ] Insurance layer

### Phase 4: Ecosystem (24 months)
- [ ] API for third-party apps
- [ ] White-label timebanks
- [] Municipal partnerships
- [ ] UBI integration experiments

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Low participation | Onboarding grants, marketing, partnerships |
| Fraud/collusion | Collateral, reputation, dispute resolution |
| Regulatory scrutiny | Decentralized, no fiat on-ramp, community-owned |
| Token volatility | TimeToken is utility-only, not speculative |
| Sybil attacks | Collateral requirements, identity verification |
| Service quality variance | Ratings, skill verification, categories |

---

## The Bigger Picture

This isn't just a timebank. It's a **prototype for post-capitalist coordination**.

The current system:
- Extracts value from labor
- Centralizes power in corporations
- Treats humans as resources

The timebank system:
- Values all labor equally (1 hour = 1 hour)
- Distributes power to communities
- Treats humans as humans

**The $SHECKLE connection:**
If the timebank works, it proves that alternative economies are viable. $SHECKLE becomes the speculative layer that funds the development of post-capitalist infrastructure.

**The endgame:**
A world where:
- Basic needs are met through mutual aid
- Specialized skills are valued and exchanged
- No one is "unemployed" — everyone has something to offer
- The 99% actually act like the 99%

---

*By the goyim. For the goyim. Powered by Solana.*

