# Timebank Blockchain Mutual Aid Platform
## Architecture Specification Document

**Version:** 1.0  
**Date:** 2026-03-07  
**Status:** Architecture Phase

---

## Executive Summary

Timebank is a blockchain-based mutual aid platform that enables peer-to-peer exchange of time-based services using non-transferable Soulbound Tokens (SBTs). The platform establishes a decentralized reputation economy where time is the primary currency, protected by escrow mechanisms, dispute resolution, and community governance.

**Core Innovation:** Non-transferable TimeTokens create a reputation-based economy where value accrues to contribution rather than capital accumulation.

---

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────┤
│  Web App    │  Mobile App │   Discord   │  Telegram   │    API Gateway      │
│  (React)    │  (React Nat)│    Bot      │    Bot      │    (GraphQL)        │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────────┬──────────┘
       │             │             │             │                 │
       └─────────────┴─────────────┴─────────────┴─────────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   Indexer/Cache    │
                         │  (The Graph/Ponder)│
                         └─────────┬──────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────────────┐
│                         SMART CONTRACT LAYER                                 │
├──────────────────────────────────┼──────────────────────────────────────────┤
│                                  │                                          │
│  ┌─────────────────┐   ┌─────────▼──────────┐   ┌─────────────────────┐    │
│  │  TimeToken SBT  │◄──┤   Core Registry    │──►│  Reputation Engine  │    │
│  │   (ERC-5484)    │   │   (Soulbound)      │   │   (ERC-4973/1155)   │    │
│  └─────────────────┘   └─────────┬──────────┘   └─────────────────────┘    │
│            │                     │                     │                    │
│            ▼                     ▼                     ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        ESCROW MODULE                                 │   │
│  ├─────────────────┬─────────────────┬─────────────────────────────────┤   │
│  │ Service Escrow  │ Milestone Escrow│      Recurring Escrow           │   │
│  │   (One-time)    │   (Phased)      │     (Subscriptions)             │   │
│  └─────────────────┴─────────────────┴─────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │                    DISPUTE RESOLUTION MODULE                         │   │
│  ├────────────────────────────────┼─────────────────────────────────────┤   │
│  │    Dispute Factory             │    Arbitration Pool                 │   │
│  │    • Evidence submission       │    • Juror staking                  │   │
│  │    • Voting rounds             │    • Reputation-weighted votes      │   │
│  │    • Appeal mechanism          │    • Slashing conditions            │   │
│  └────────────────────────────────┴─────────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │                      GOVERNANCE MODULE (DAO)                         │   │
│  ├────────────────────────────────┼─────────────────────────────────────┤   │
│  │    Governor Contract           │    Treasury Management              │   │
│  │    • Proposal creation         │    • Fee distribution               │   │
│  │    • Voting (quadratic)        │    • Grant allocation               │   │
│  │    • Timelock execution        │    • Emergency controls             │   │
│  └────────────────────────────────┴─────────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────┼─────────────────────────────────────┐   │
│  │                      ORACLE & FEED MODULE                            │   │
│  ├────────────────────────────────┼─────────────────────────────────────┤   │
│  │    Exchange Rate Oracle        │    Price Aggregator                 │   │
│  │    • Time value index          │    • Multi-source validation        │   │
│  │    • Skill multipliers         │    • Outlier detection              │   │
│  │    • Regional adjustments      │    • Update frequency controls      │   │
│  └────────────────────────────────┴─────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │  CROSS-CHAIN BRIDGE │
                         │   (LayerZero/      │
                         │    Axelar/Wormhole) │
                         └────────────────────┘
```

### Layer Breakdown

| Layer | Components | Purpose |
|-------|------------|---------|
| **Interface** | Web, Mobile, Bots | User-facing interactions |
| **Indexing** | The Graph, Ponder | Fast queries, caching |
| **Contracts** | Core + Modules | Business logic, state |
| **Cross-chain** | Bridges | Multi-chain expansion |

---

## 2. Smart Contract Architecture

### 2.1 Contract Hierarchy

```solidity
// Core Interface Definitions
interface ITimeToken {}
interface IReputation {}
interface IEscrow {}
interface IDispute {}
interface IOracle {}

// Base Contract
abstract contract TimebankBase {
    // Common modifiers, events, errors
}

// Core Registry (Central Hub)
contract SoulRegistry is TimebankBase, Ownable2Step {
    // User identity management
    // Skill verification
    // Attestation storage
}

// Token Contracts
contract TimeToken is ERC5484, TimebankBase {
    // Non-transferable SBT
    // Minting logic
    // Time balance tracking
}

contract ReputationToken is ERC4973, TimebankBase {
    // Soulbound reputation
    // Dynamic metadata
    // Decay mechanics
}

// Functional Modules
contract EscrowManager is IEscrow, ReentrancyGuard {
    // Service escrow
    // Milestone management
    // Fund release logic
}

contract DisputeResolution is IDispute, Ownable2Step {
    // Dispute creation
    // Juror selection
    // Voting mechanism
    // Appeals
}

contract ExchangeOracle is IOracle, Ownable2Step {
    // Price feeds
    // Skill multipliers
    // Update mechanism
}

// Governance
contract TimebankGovernor is Governor, GovernorSettings {
    // Proposal management
    // Voting logic
    // Execution timelock
}

contract Treasury is Ownable2Step {
    // Fee collection
    // Grant distribution
    // Emergency controls
}
```

### 2.2 Contract Addresses & Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PROXY CONTRACTS (Upgradeable - UUPS Pattern)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Proxy Admin (multisig/Timelock)                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│         ┌────────────────────┼────────────────────┐        │
│         ▼                    ▼                    ▼        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  SoulRegistry│   │ TimeToken    │   │ EscrowManager│   │
│  │  (Proxy)     │   │ (Proxy)      │   │ (Proxy)      │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                  │                  │            │
│  ┌──────▼───────┐   ┌──────▼───────┐   ┌──────▼───────┐   │
│  │Implementation│   │Implementation│   │Implementation│   │
│  │   V1.0.0     │   │   V1.0.0     │   │   V1.0.0     │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│                                                             │
│  NON-UPGRADEABLE (Immutable Logic)                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  DisputeRes  │   │   Oracle     │   │  Governor    │   │
│  │              │   │              │   │              │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Contract Specifications

| Contract | Standard | Upgradeable | Key Features |
|----------|----------|-------------|--------------|
| SoulRegistry | Custom | Yes | Identity anchor, attestation storage |
| TimeToken | ERC-5484 | Yes | Non-transferable, mint/burn only |
| ReputationToken | ERC-4973 | Yes | Dynamic metadata, decay algorithm |
| EscrowManager | Custom | Yes | Multi-escrow types, milestone support |
| DisputeResolution | Custom | No | Commit-reveal voting, appeals |
| ExchangeOracle | Custom | Yes | Multi-source aggregation |
| TimebankGovernor | OpenZeppelin | No | Quadratic voting, timelock |
| Treasury | Custom | No | Fee distribution, grants |

---

## 3. Data Models

### 3.1 Core Entities

```typescript
// ==================== USER IDENTITY ====================

interface Soul {
  soulId: bytes32;           // Unique identifier (hash of creation params)
  owner: address;            // Wallet address
  createdAt: uint256;        // Unix timestamp
  status: SoulStatus;        // ACTIVE | FROZEN | REVOKED
  metadataURI: string;       // IPFS link to off-chain data
}

interface SoulMetadata {
  displayName: string;
  bio: string;
  avatarURI: string;
  location: string;          // Geo-hashed for privacy
  languages: string[];
  socialLinks: SocialLink[];
  verifiedCredentials: VC[]; // Verifiable credentials
}

enum SoulStatus {
  ACTIVE,
  FROZEN,      // Temporarily suspended
  REVOKED      // Permanently banned
}

// ==================== TIME TOKENS ====================

interface TimeToken {
  tokenId: uint256;
  soulId: bytes32;           // Bound to soul
  hours: uint256;            // Time value (1 token = 1 hour base)
  skillMultiplier: uint256;  // Exchange rate multiplier (basis points)
  createdAt: uint256;
  expiresAt: uint256;        // Optional expiration
  category: ServiceCategory;
  isTransferable: bool;      // Always false for base tokens
}

interface TimeBalance {
  soulId: bytes32;
  totalEarned: uint256;      // Lifetime earned
  totalSpent: uint256;       // Lifetime spent
  available: uint256;        // Current balance
  locked: uint256;           // In escrow
  pendingDispute: uint256;   // Under dispute
}

// ==================== REPUTATION ====================

interface ReputationScore {
  soulId: bytes32;
  overall: uint256;          // 0-10000 (basis points)
  breakdown: ReputationBreakdown;
  lastUpdated: uint256;
  decayRate: uint256;        // Per-day decay in basis points
}

interface ReputationBreakdown {
  serviceQuality: uint256;   // Ratings from completed services
  reliability: uint256;      // On-time completion rate
  community: uint256;        // Participation in governance
  disputeResolution: uint256;// Juror performance
  longevity: uint256;        // Account age factor
}

interface ReputationBadge {
  badgeId: uint256;
  soulId: bytes32;
  badgeType: BadgeType;
  tier: uint8;               // 1-5 tiers
  earnedAt: uint256;
  evidenceURI: string;       // Proof of achievement
}

enum BadgeType {
  EARLY_ADOPTER,
  TOP_PROVIDER,
  DISPUTE_RESOLVER,
  GOVERNANCE_PARTICIPANT,
  SKILL_MASTER,
  COMMUNITY_BUILDER
}

// ==================== SERVICES ====================

interface Service {
  serviceId: bytes32;
  providerId: bytes32;
  category: ServiceCategory;
  title: string;
  description: string;
  skillLevel: SkillLevel;    // BEGINNER | INTERMEDIATE | EXPERT
  timeEstimate: uint256;     // Expected hours
  timeValue: uint256;        // Charged hours
  exchangeRate: uint256;     // Applied multiplier
  availability: AvailabilitySlot[];
  requirements: string[];    // Prerequisites for requester
  portfolio: string[];       // IPFS links to work samples
}

enum ServiceCategory {
  TECHNOLOGY,        // Programming, IT support, design
  EDUCATION,         // Tutoring, mentoring, coaching
  CREATIVE,          // Art, music, writing, video
  PHYSICAL,          // Repair, gardening, moving
  PROFESSIONAL,      // Legal, financial, consulting
  CARE,              // Healthcare, childcare, elderly
  COMMUNITY,         // Organizing, translating, volunteering
  EMERGENCY          // Urgent mutual aid
}

enum SkillLevel {
  BEGINNER,
  INTERMEDIATE,
  EXPERT,
  MASTER
}

// ==================== ESCROW ====================

interface Escrow {
  escrowId: bytes32;
  serviceId: bytes32;
  requesterId: bytes32;
  providerId: bytes32;
  status: EscrowStatus;
  
  // Time allocation
  timeCommitted: uint256;    // Time tokens locked
  timeReleased: uint256;     // Time tokens already paid
  timeInDispute: uint256;    // Time under dispute
  
  // Milestones (for complex services)
  milestones: Milestone[];
  
  // Timeline
  createdAt: uint256;
  startedAt: uint256;
  deadline: uint256;
  completedAt: uint256;
  
  // Dispute
  disputeId?: bytes32;
}

enum EscrowStatus {
  PENDING,           // Awaiting provider acceptance
  ACTIVE,            // Service in progress
  MILESTONE_PENDING, // Awaiting milestone completion
  COMPLETED,         // Successfully finished
  DISPUTED,          // Under dispute resolution
  RESOLVED,          // Dispute resolved
  CANCELLED,         // Cancelled by mutual consent
  EXPIRED            // Deadline passed
}

interface Milestone {
  milestoneId: bytes32;
  description: string;
  timeValue: uint256;
  status: MilestoneStatus;
  dueDate: uint256;
  deliverables: string[];    // IPFS links
}

enum MilestoneStatus {
  PENDING,
  SUBMITTED,
  APPROVED,
  REJECTED
}

// ==================== DISPUTES ====================

interface Dispute {
  disputeId: bytes32;
  escrowId: bytes32;
  
  // Parties
  requesterId: bytes32;
  providerId: bytes32;
  
  // Dispute details
  category: DisputeCategory;
  description: string;
  requestedResolution: string;
  
  // Evidence
  evidence: Evidence[];
  
  // Resolution
  status: DisputeStatus;
  jury: bytes32[];           // Selected juror soulIds
  votes: Vote[];
  outcome?: DisputeOutcome;
  ruling?: string;
  
  // Timeline
  createdAt: uint256;
  votingEnds: uint256;
  resolvedAt: uint256;
}

enum DisputeCategory {
  QUALITY_MISMATCH,   // Service didn't match description
  NON_DELIVERY,       // Service not provided
  PAYMENT_DISPUTE,    // Disagreement on payment
  COMMUNICATION,      // Communication breakdown
  OTHER
}

enum DisputeStatus {
  PENDING_JURY,      // Awaiting jury selection
  EVIDENCE_PHASE,    // Evidence submission period
  VOTING_PHASE,      // Jury voting in progress
  APPEAL_PHASE,      // Appeal window open
  RESOLVED,          // Final decision reached
  CANCELLED          // Withdrawn by initiator
}

interface Evidence {
  evidenceId: bytes32;
  submitterId: bytes32;
  evidenceType: EvidenceType;
  contentURI: string;        // IPFS link
  submittedAt: uint256;
}

enum EvidenceType {
  MESSAGE_LOG,
  DELIVERABLE,
  THIRD_PARTY_PROOF,
  EXPERT_TESTIMONY
}

interface Vote {
  jurorId: bytes32;
  choice: VoteChoice;
  weight: uint256;           // Reputation-weighted
  justificationHash: bytes32;// Hash of reasoning (revealed later)
  commitHash: bytes32;       // Commit-reveal mechanism
}

enum VoteChoice {
  REQUESTER_WINS,
  PROVIDER_WINS,
  SPLIT,
  ABSTAIN
}

// ==================== GOVERNANCE ====================

interface Proposal {
  proposalId: bytes32;
  proposerId: bytes32;
  title: string;
  description: string;
  category: ProposalCategory;
  
  // Execution
  targets: address[];
  values: uint256[];
  calldatas: bytes[];
  
  // Voting
  votesFor: uint256;
  votesAgainst: uint256;
  votesAbstain: uint256;
  
  // Status
  status: ProposalStatus;
  
  // Timeline
  createdAt: uint256;
  votingStarts: uint256;
  votingEnds: uint256;
  executedAt: uint256;
}

enum ProposalCategory {
  PARAMETER_CHANGE,
  CONTRACT_UPGRADE,
  TREASURY_ALLOCATION,
  EMERGENCY_ACTION,
  CONSTITUTIONAL_AMENDMENT
}

enum ProposalStatus {
  PENDING,
  ACTIVE,
  CANCELLED,
  DEFEATED,
  SUCCEEDED,
  QUEUED,
  EXPIRED,
  EXECUTED
}
```

### 3.2 On-Chain Storage Layout

```solidity
// SoulRegistry Storage
mapping(bytes32 => Soul) public souls;
mapping(address => bytes32) public soulByAddress;
mapping(bytes32 => bytes32[]) public soulAttestations;
mapping(bytes32 => bool) public verifiedSkills;

// TimeToken Storage
mapping(uint256 => TimeToken) public timeTokens;
mapping(bytes32 => TimeBalance) public timeBalances;
mapping(bytes32 => uint256[]) public soulTokens;
uint256 public totalTimeSupply;

// Reputation Storage
mapping(bytes32 => ReputationScore) public reputationScores;
mapping(bytes32 => ReputationBadge[]) public soulBadges;
mapping(bytes32 => mapping(bytes32 => uint256)) public ratings; // rater -> rated -> score

// Escrow Storage
mapping(bytes32 => Escrow) public escrows;
mapping(bytes32 => bytes32[]) public soulEscrows; // soul -> escrowIds
bytes32[] public activeEscrows;

// Dispute Storage
mapping(bytes32 => Dispute) public disputes;
mapping(bytes32 => bool) public isJuror;
mapping(bytes32 => uint256) public jurorStakes;
bytes32[] public activeDisputes;

// Governance Storage
mapping(bytes32 => Proposal) public proposals;
mapping(bytes32 => mapping(bytes32 => bool)) public hasVoted; // proposal -> soul -> voted
uint256 public proposalThreshold;
uint256 public votingPeriod;
uint256 public quorumNumerator;
```

### 3.3 Off-Chain Data (IPFS/Arweave)

```typescript
// Stored off-chain, referenced by URI on-chain

interface OffChainProfile {
  version: "1.0.0";
  soulId: string;
  lastUpdated: string;
  
  // Rich profile data
  profile: SoulMetadata;
  
  // Service portfolio
  services: ServiceListing[];
  
  // History (paginated)
  transactionHistory: TransactionRecord[];
  
  // Reputation details
  reputationDetails: DetailedReputation;
  
  // Private data (encrypted)
  encryptedContact?: string;
  encryptedCalendar?: string;
}

interface ServiceListing {
  id: string;
  title: string;
  description: string;
  media: string[];           // Images/videos
  testimonials: Testimonial[];
  faq: FAQItem[];
}

interface TransactionRecord {
  txHash: string;
  type: "EARNED" | "SPENT" | "ESCROW_LOCKED" | "ESCROW_RELEASED" | "DISPUTE";
  amount: number;
  counterparty?: string;
  serviceTitle?: string;
  timestamp: string;
}

interface DetailedReputation {
  ratingDistribution: number[]; // 1-5 star counts
  reviewHistory: Review[];
  categoryScores: Record<ServiceCategory, number>;
}
```

---

## 4. User Flows

### 4.1 Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER ONBOARDING SEQUENCE                             │
└─────────────────────────────────────────────────────────────────────────────┘

NEW USER
    │
    ▼
┌─────────────────────┐
│ 1. Connect Wallet   │◄──────────────────────────┐
│    (MetaMask/       │                           │
│     WalletConnect)  │                           │
└──────────┬──────────┘                           │
           │                                      │
           ▼                                      │
    ┌────────────────┐                           │
    │ Wallet already │                           │
    │ has Soul?      │                           │
    └───────┬────────┘                           │
            │                                    │
       ┌────┴────┐                               │
       │         │                               │
      YES       NO                               │
       │         │                               │
       ▼         ▼                               │
┌──────────┐  ┌─────────────────────┐            │
│Recover   │  │ 2. Create Profile   │            │
│existing  │  │    • Display name   │            │
│Soul      │  │    • Bio/avatar     │            │
│          │  │    • Skills         │            │
└────┬─────┘  │    • Location       │            │
     │        └──────────┬──────────┘            │
     │                   │                       │
     │                   ▼                       │
     │         ┌──────────────────┐              │
     │         │ 3. Verify Email  │              │
     │         │    (off-chain)   │              │
     │         └────────┬─────────┘              │
     │                  │                        │
     └──────────────────┼────────────────────────┘
                        ▼
              ┌─────────────────────┐
              │ 4. Mint Soul SBT    │
              │    (gasless via     │
              │     meta-tx)        │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ 5. Welcome Time     │
              │    (airdrop 1 hour) │
              │    to start         │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ 6. Skill Assessment │
              │    (optional quiz   │
              │     for multipliers)│
              └──────────┬──────────┘
                         │
                         ▼
                    [HOME FEED]
```

### 4.2 Service Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SERVICE REQUEST FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

REQUESTER                           PROVIDER
    │                                   │
    │  ┌─────────────────────────────┐  │
    ├──┤ 1. Browse/Browse Services   ├──┤
    │  │    • Filter by skill        │  │
    │  │    • View reputation        │  │
    │  │    • Check availability     │  │
    │  └─────────────────────────────┘  │
    │                                   │
    │  ┌─────────────────────────────┐  │
    ├──┤ 2. Initiate Request         │  │
    │  │    • Select service         │  │
    │  │    • Propose time/date      │  │
    │  │    • Add requirements       │  │
    │  │    • Lock time tokens       │──┤
    │  └─────────────────────────────┘  │
    │                                   │
    │◄──────────────────────────────────┤
    │  ┌─────────────────────────────┐  │
    │  │ 3. Provider Response        │  │
    │  │    • Accept                 │  │
    │  │    • Counter-propose        │──┤
    │  │    • Decline                │  │
    │  └─────────────────────────────┘  │
    │                                   │
    │  ┌─────────────────────────────┐  │
    ├──┤ 4. Negotiation (optional)   │◄─┤
    │  │    • Adjust scope           │  │
    │  │    • Modify timeline        │──┤
    │  │    • Update time value      │  │
    │  └─────────────────────────────┘  │
    │                                   │
    │  ┌─────────────────────────────┐  │
    ├──┤ 5. Confirm & Start          │◄─┤
    │  │    • Both parties sign      │  │
    │  │    • Escrow created         │  │
    │  │    • Timer starts           │  │
    │  └─────────────────────────────┘  │
    │                                   │
    │◄─────────────────────────────────►│
    │  ┌─────────────────────────────┐  │
    │  │ 6. Service Delivery         │  │
    │  │    • Communication          │  │
    │  │    • Milestone updates      │  │
    │  │    • Deliverables submitted │  │
    │  └─────────────────────────────┘  │
    │                                   │
    │  ┌─────────────────────────────┐  │
    ├──┤ 7. Completion & Review      │◄─┤
    │  │    • Requester confirms     │  │
    │  │    • Tokens released        │  │
    │  │    • Mutual rating          │──┤
    │  │    • Reputation updated     │  │
    │  └─────────────────────────────┘  │
    │                                   │
    ▼                                   ▼
              ┌─────────────────┐
              │ 8. Feedback Loop│
              │    • Reputation │
              │      adjustment │
              │    • Badge      │
              │      eligibility│
              │    • Analytics  │
              └─────────────────┘
```

### 4.3 Dispute Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DISPUTE RESOLUTION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

DISPUTE INITIATED
       │
       ▼
┌──────────────────────────────┐
│ 1. File Dispute              │
│    • Select escrow           │
│    • Choose category         │
│    • Describe issue          │
│    • Pay dispute fee (0.5h)  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 2. Counterparty Response     │
│    • 48h to accept/          │
│      counter                 │
│    • Optional: Mutual        │
│      resolution              │
└──────────────┬───────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
 RESOLVED              PROCEED
    │                     │
    ▼                     ▼
[END]           ┌──────────────────────────────┐
                │ 3. Evidence Phase            │
                │    • 72h for both parties    │
                │    • Submit messages,        │
                │      deliverables, proofs    │
                │    • Stored on IPFS          │
                └──────────────┬───────────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │ 4. Jury Selection            │
                │    • Random selection from   │
                │      qualified jurors        │
                │    • 5 jurors per dispute    │
                │    • Stake required to serve │
                └──────────────┬───────────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │ 5. Voting Phase              │
                │    • Commit-reveal mechanism │
                │    • Reputation-weighted     │
                │    • 48h voting window       │
                └──────────────┬───────────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │ 6. Resolution                │
                │    • Outcome executed        │
                │    • Tokens redistributed    │
                │    • Jurors rewarded/slashed │
                └──────────────┬───────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  ACCEPT               APPEAL
                    │                     │
                    ▼                     ▼
               [END]              ┌──────────────────┐
                                   │ 7. Appeal        │
                                   │    • New jury    │
                                   │    • Higher      │
                                   │      stakes      │
                                   │    • Final       │
                                   └──────────────────┘
```

### 4.4 Governance Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOVERNANCE FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

COMMUNITY MEMBER
       │
       ▼
┌──────────────────────────────┐
│ 1. Proposal Creation         │
│    • Minimum reputation      │
│      threshold               │
│    • Proposal deposit        │
│    • Detailed specification  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 2. Review Period             │
│    • 2-day discussion        │
│    • Temperature check       │
│    • Optional: refinement    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ 3. Active Voting             │
│    • 5-day voting period     │
│    • Quadratic voting        │
│    • Delegation supported    │
│    • Reputation bonus        │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        │             │
    PASSED         REJECTED
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ 4. Timelock  │  │ Deposit      │
│    • 2-day   │  │ returned -   │
│    delay for │  │ fee          │
│    security  │  │              │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────────────────────┐
│ 5. Execution                 │
│    • Automatic execution     │
│    • Deposit returned +      │
│      reward                  │
│    • Proposal recorded       │
└──────────────┬───────────────┘
               │
               ▼
         [IMPLEMENTED]
```

---

## 5. Economic Model

### 5.1 Token Economics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TIME TOKEN ECONOMICS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

ISSUANCE MECHANISMS
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Service Earnings│    │  Welcome Grant   │    │  Incentives      │
│  (Primary)      │    │  (Onboarding)    │    │  (Rewards)       │
│                 │    │                 │    │                 │
│  1 hour worked  │    │  New users get   │    │  • Juror rewards │
│  → 1 TIME       │    │  1 free hour     │    │  • Governance   │
│  (minted)       │    │  (one-time)      │    │  • Referrals    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

EXCHANGE RATE MECHANICS
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   BASE VALUE: 1 TIME = 1 hour of general labor                         │
│                                                                         │
│   SKILL MULTIPLIERS (dynamic):                                         │
│   ┌─────────────────┬─────────────┬─────────────────────────────────┐  │
│   │ Skill Category  │ Multiplier  │ Oracle Source                   │  │
│   ├─────────────────┼─────────────┼─────────────────────────────────┤  │
│   │ General labor   │ 1.0x        │ Base rate                       │  │
│   │ Skilled trade   │ 1.5x        │ Market demand + verification    │  │
│   │ Professional    │ 2.0x        │ Credentials + ratings           │  │
│   │ Expert/Special  │ 3.0x        │ Rarity + demand + reviews       │  │
│   │ Emergency       │ 2.0x        │ Urgency multiplier              │  │
│   └─────────────────┴─────────────┴─────────────────────────────────┘  │
│                                                                         │
│   REGIONAL ADJUSTMENTS:                                                 │
│   • Cost of living index applied per region                            │
│   • Prevents arbitrage, maintains local relevance                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

BURN MECHANISMS
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Service Payment │    │  Platform Fees   │    │  Slashing       │
│                 │    │                 │    │                 │
│  TIME spent on  │    │  • Dispute: 0.5h │    │  Fraudulent     │
│  services is    │    │  • Proposal: 1h  │    │  behavior burns │
│  transferred,   │    │  • Skill verify: │    │  reputation     │
│  not burned     │    │    variable      │    │  + TIME         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 5.2 Fee Structure

| Activity | Fee | Destination |
|----------|-----|-------------|
| **Service Escrow** | 0% | N/A (P2P) |
| **Dispute Filing** | 0.5 TIME | Juror rewards (80%), Treasury (20%) |
| **Proposal Creation** | 1 TIME | Refundable if quorum reached |
| **Skill Verification** | 0.1-0.5 TIME | Verifiers (70%), Treasury (30%) |
| **Juror Stake** | 10 TIME | Slashable for misconduct |
| **Appeal** | 2x original dispute fee | Higher stakes jury |

### 5.3 Incentive Alignment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       STAKEHOLDER INCENTIVES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

PROVIDERS
┌─────────────────────────────────────────────────────────────────────────┐
│ • Earn TIME tokens for services delivered                              │
│ • Build reputation → access higher-value opportunities                 │
│ • Unlock skill multipliers → increase earning potential                │
│ • Badges → visibility boost in marketplace                             │
│ • Longevity bonus → reduced platform fees over time                    │
└─────────────────────────────────────────────────────────────────────────┘

REQUESTERS
┌─────────────────────────────────────────────────────────────────────────┐
│ • Access services without fiat currency                                │
│ • Build reputation → faster service matching                           │
│ • Dispute protection → escrow guarantees                               │
│ • Community membership → governance rights                             │
└─────────────────────────────────────────────────────────────────────────┘

JURORS
┌─────────────────────────────────────────────────────────────────────────┐
│ • Stake TIME → earn fees from disputes                                 │
│ • Accurate voting → reputation increase                                │
│ • Incorrect voting → stake slashed                                     │
│ • High reputation → selected more often                                │
│ • Top jurors → governance influence                                    │
└─────────────────────────────────────────────────────────────────────────┘

GOVERNANCE PARTICIPANTS
┌─────────────────────────────────────────────────────────────────────────┐
│ • Proposal rewards → successful proposers earn TIME                    │
│ • Voting power → reputation-weighted quadratic voting                  │
│ • Treasury influence → direct resource allocation                      │
│ • Protocol ownership → shape platform future                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Supply Dynamics

```typescript
// Supply Model

interface TokenSupply {
  // Fixed parameters
  INITIAL_SUPPLY: 0;           // No premine
  MAX_SUPPLY: undefined;       // Uncapped (time is infinite)
  
  // Dynamic issuance
  issuance: {
    // New TIME minted = hours worked × skill multiplier
    serviceBased: "unlimited",
    
    // Welcome grants (one-time per soul)
    onboardingCap: "1 TIME per verified soul",
    
    // Incentive pool
    incentivePool: "10% of total supply over 10 years"
  };
  
  // Deflationary pressure
  deflation: {
    // Fees accumulate in treasury, not burned
    // Treasury TIME can be:
    // - Used for grants
    // - Distributed to stakers
    // - Held as reserve
    mechanism: "recirculation"
  };
  
  // Equilibrium
  equilibrium: {
    // Supply grows with platform usage
    // Velocity increases with reputation
    // Value stabilizes through exchange oracle
    target: "usage-correlated growth"
  };
}
```

---

## 6. Governance Structure

### 6.1 DAO Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE ARCHITECTURE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  TOKEN      │
                              │  HOLDERS    │
                              │  (Souls)    │
                              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   DIRECT     │ │  DELEGATED   │ │   JURY       │
            │   VOTING     │ │   VOTING     │ │   POOL       │
            │              │ │              │ │              │
            │ 1 person,    │ │ Reputation   │ │ Dispute      │
            │ 1 vote       │ │ delegates    │ │ resolution   │
            │ (quadratic)  │ │ voting power │ │ authority    │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │  GOVERNOR          │
                         │  CONTRACT          │
                         │                    │
                         │  • Proposals       │
                         │  • Voting          │
                         │  • Execution       │
                         │  • Timelock        │
                         └─────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
        ┌──────────┐        ┌──────────┐        ┌──────────┐
        │PROTOCOL  │        │TREASURY  │        │EMERGENCY │
        │PARAMETERS│        │MANAGEMENT│        │COUNCIL   │
        │          │        │          │        │          │
        │• Fees    │        │• Grants  │        │• Security│
        │• Oracle  │        │• Upgrades│        │  issues   │
        │• Dispute │        │• Reserve │        │• Critical│
        │  rules   │        │  allocation│       │  bugs     │
        └──────────┘        └──────────┘        └──────────┘
```

### 6.2 Voting Mechanics

```solidity
// Quadratic Voting Implementation

struct Vote {
    bytes32 soulId;
    uint256 votingPower;    // sqrt(reputation + staked TIME)
    uint256 votesFor;       // Quadratic allocation
    uint256 votesAgainst;   // Quadratic allocation
}

// Voting power calculation
function calculateVotingPower(bytes32 soulId) public view returns (uint256) {
    uint256 reputation = getReputationScore(soulId);
    uint256 stakedTime = getStakedTime(soulId);
    uint256 totalCredits = reputation + stakedTime;
    
    // Quadratic: voting power = sqrt(totalCredits)
    return sqrt(totalCredits);
}

// Cost for N votes = N² credits
function voteCost(uint256 numVotes) public pure returns (uint256) {
    return numVotes * numVotes;
}

// Anti-sybil: Soulbound identity required
modifier onlyVerifiedSoul(bytes32 soulId) {
    require(souls[soulId].status == SoulStatus.ACTIVE, "Invalid soul");
    require(soulByAddress[msg.sender] == soulId, "Not owner");
    _;
}
```

### 6.3 Proposal Categories

| Category | Threshold | Quorum | Execution |
|----------|-----------|--------|-----------|
| **Parameter Change** | 100 rep + 1 TIME | 4% of total rep | Timelock: 2 days |
| **Treasury Allocation** | 500 rep + 5 TIME | 10% of total rep | Timelock: 5 days |
| **Contract Upgrade** | 1000 rep + 10 TIME | 20% of total rep | Timelock: 7 days |
| **Emergency Action** | 2000 rep + Emergency Council | 15% of total rep | Immediate |
| **Constitutional** | 5000 rep + 50 TIME | 40% of total rep | Timelock: 14 days |

### 6.4 Emergency Procedures

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EMERGENCY RESPONSE PROTOCOL                              │
└─────────────────────────────────────────────────────────────────────────────┘

SECURITY THREAT DETECTED
          │
          ▼
┌─────────────────────────────┐
│ 1. Emergency Council Alert  │
│    • 5-member council       │
│    • 48h response window    │
│    • Requires 3/5 consensus │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 2. Community Notification   │
│    • On-chain alert         │
│    • All channels notified  │
│    • Temporary pause option │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │             │
    APPROVED      REJECTED
        │             │
        ▼             ▼
┌──────────────┐  [NORMAL]
│ 3. Action    │
│    • Pause   │
│    • Patch   │
│    • Upgrade │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ 4. Post-Emergency Review    │
│    • Full disclosure        │
│    • Post-mortem report     │
│    • Governance ratification│
└─────────────────────────────┘
```

### 6.5 Treasury Management

```typescript
interface TreasuryAllocation {
  // Revenue sources
  revenue: {
    disputeFees: number;        // 20% of dispute fees
    skillVerification: number;  // 30% of verification fees
    protocolGrants: number;     // External donations
  };
  
  // Allocation (determined by governance)
  allocation: {
    ecosystemGrants: 40;        // New feature development
    securityBounty: 20;         // Bug bounties, audits
    communityRewards: 25;       // Top contributors
    reserve: 15;                // Emergency fund
  };
  
  // Controls
  controls: {
    // Daily withdrawal limits
    dailyLimit: "1% of treasury";
    
    // Large transfers require governance
    governanceThreshold: "5% of treasury";
    
    // Emergency council can freeze
    emergencyFreeze: "multisig + council";
  };
}
```

---

## 7. Technical Specifications

### 7.1 Smart Contract Standards

| Component | Standard | Rationale |
|-----------|----------|-----------|
| **Soul Identity** | ERC-721 (modified) | Non-transferable base |
| **TimeToken** | ERC-5484 | Soulbound with burn auth |
| **Reputation** | ERC-4973 | Account-bound tokens |
| **Badges** | ERC-1155 | Semi-fungible achievements |
| **Governance** | Governor Bravo | Battle-tested framework |
| **Upgradeability** | UUPS Proxy | Gas-efficient upgrades |

### 7.2 Security Considerations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY FRAMEWORK                                    │
└─────────────────────────────────────────────────────────────────────────────┘

ACCESS CONTROL
┌─────────────────────────────────────────────────────────────────────────┐
│ • Ownable2Step for admin functions                                     │
│ • Role-based access (DEFAULT_ADMIN, PAUSER, UPGRADER, ORACLE)          │
│ • Timelock for critical operations                                     │
│ • Multisig for treasury access                                         │
└─────────────────────────────────────────────────────────────────────────┘

REENTRANCY PROTECTION
┌─────────────────────────────────────────────────────────────────────────┐
│ • ReentrancyGuard on all external calls                                │
│ • Checks-Effects-Interactions pattern                                  │
│ • No external calls before state updates                               │
└─────────────────────────────────────────────────────────────────────────┘

INPUT VALIDATION
┌─────────────────────────────────────────────────────────────────────────┐
│ • Address zero checks                                                  │
│ • Overflow/underflow protection (Solidity 0.8+)                        │
│ • Bounds checking on all numeric inputs                                │
│ • Signature verification for meta-transactions                         │
└─────────────────────────────────────────────────────────────────────────┘

ORACLE SECURITY
┌─────────────────────────────────────────────────────────────────────────┐
│ • Multi-source aggregation                                             │
│ • Outlier detection and rejection                                      │
│ • Time-weighted average for price feeds                                │
│ • Circuit breakers for extreme values                                  │
└─────────────────────────────────────────────────────────────────────────┘

UPGRADE SAFETY
┌─────────────────────────────────────────────────────────────────────────┐
│ • Storage gap for future variables                                     │
│ • Implementation contract initialization disabled                      │
│ • Transparent proxy pattern                                            │
│ • Emergency pause functionality                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Gas Optimization Strategy

| Pattern | Implementation | Savings |
|---------|---------------|---------|
| **Packing** | Group uint128, address, bool | ~20% |
| **Bitmaps** | Juror selection, vote tracking | ~40% |
| **Merkle Trees** | Batch reputation updates | ~60% |
| **Calldata** | Use calldata for read-only | ~15% |
| **Events** | Off-chain storage via events | ~80% state |
| **Lazy Evaluation** | Compute reputation on-demand | Variable |

### 7.4 Integration Points

```typescript
// External Integrations

interface Integrations {
  // Identity verification
  identity: {
    worldcoin: "Human verification",
    brightid: "Unique human proof",
    polygonID: "ZK credentials",
    ens: "Human-readable names"
  };
  
  // Cross-chain
  bridges: {
    layerZero: "Omnichain messaging",
    axelar: "Cross-chain calls",
    wormhole: "Token bridging"
  };
  
  // Storage
  storage: {
    ipfs: "Metadata and media",
    arweave: "Permanent records",
    ceramic: "Mutable streams"
  };
  
  // Oracles
  oracles: {
    chainlink: "Price feeds",
    api3: "Custom data feeds",
    tellor: "Dispute-based oracle"
  };
  
  // Indexing
  indexing: {
    theGraph: "Primary indexer",
    ponder: "Secondary indexer",
    subsquid: "Analytics"
  };
}
```

---

## 8. Implementation Roadmap

### Phase 1: MVP (Months 1-3)
- [ ] SoulRegistry + TimeToken contracts
- [ ] Basic escrow functionality
- [ ] Simple web interface
- [ ] Testnet deployment

### Phase 2: Core Features (Months 4-6)
- [ ] Reputation system
- [ ] Dispute resolution V1
- [ ] Exchange oracle
- [ ] Mobile app

### Phase 3: Governance (Months 7-9)
- [ ] DAO launch
- [ ] Treasury management
- [ ] Advanced dispute resolution
- [ ] Cross-chain bridge

### Phase 4: Scale (Months 10-12)
- [ ] Multi-chain deployment
- [ ] Advanced reputation algorithms
- [ ] AI-powered matching
- [ ] Enterprise integrations

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Soul** | Non-transferable identity bound to a wallet |
| **TimeToken** | Non-transferable token representing one hour of service |
| **Reputation** | Dynamic score based on platform behavior |
| **Escrow** | Smart contract holding tokens until service completion |
| **Dispute** | Formal process for resolving service conflicts |
| **Juror** | Community member staking tokens to resolve disputes |
| **Governance** | Decentralized decision-making process |
| **Oracle** | External data feed for exchange rates |

### B. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Smart contract bugs | Medium | Critical | Audits, bug bounties, insurance |
| Oracle manipulation | Low | High | Multi-source, circuit breakers |
| Low participation | Medium | Medium | Incentives, gamification |
| Regulatory issues | Low | High | Geographic restrictions, compliance |
| Sybil attacks | Medium | High | Identity verification, reputation gating |

### C. References

- [ERC-5484: Soulbound Token](https://eips.ethereum.org/EIPS/eip-5484)
- [ERC-4973: Account-bound Tokens](https://eips.ethereum.org/EIPS/eip-4973)
- [OpenZeppelin Governance](https://docs.openzeppelin.com/contracts/4.x/governance)
- [Time Banking Principles](https://timebanks.org/)
- [Quadratic Funding](https://wtfisqf.com/)

---

*Document Version: 1.0*  
*Last Updated: 2026-03-07*  
*Status: Architecture Phase - Ready for Review*
