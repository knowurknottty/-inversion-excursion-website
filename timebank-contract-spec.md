# Timebank Smart Contract Architecture

## Overview
A decentralized mutual aid platform enabling time-based exchange with soulbound tokens, reputation systems, and on-chain governance.

---

## 1. TimeToken (ERC-20, Soulbound)

### Purpose
Non-transferable ERC-20 token representing hours of service contributed. Soulbound to prevent speculation while enabling protocol-level transfers (earn/burn).

### Interface: ITimeToken

```solidity
interface ITimeToken is IERC20 {
    // Errors
    error SoulboundTransfer();
    error UnauthorizedMinter();
    error UnauthorizedBurner();
    error InvalidAmount();
    error MaxSupplyReached();
    
    // Events
    event Minted(address indexed account, uint256 amount, string reason);
    event Burned(address indexed account, uint256 amount, string reason);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event BurnerAdded(address indexed burner);
    event BurnerRemoved(address indexed burner);
    
    // Core Functions
    function mint(address to, uint256 amount, string calldata reason) external;
    function burn(address from, uint256 amount, string calldata reason) external;
    function burnFrom(address from, uint256 amount, string calldata reason) external;
    
    // View Functions
    function isMinter(address account) external view returns (bool);
    function isBurner(address account) external view returns (bool);
    function totalHoursContributed() external view returns (uint256);
    function hoursByAccount(address account) external view returns (uint256);
}
```

### State Variables

```solidity
// Access Control
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

// Token Metadata
string public constant name = "Timebank Hour";
string public constant symbol = "HOUR";
uint8 public constant decimals = 18;

// Supply Management
uint256 public maxSupply;              // Optional cap (0 = unlimited)
uint256 public totalMinted;
uint256 public totalBurned;

// Accounting
mapping(address => uint256) private _balances;
mapping(address => mapping(address => uint256)) private _allowances; // Always 0 for soulbound
uint256 private _totalSupply;

// Authorized contracts that can mint/burn
mapping(address => bool) public authorizedMinters;
mapping(address => bool) public authorizedBurners;

// Historical tracking
mapping(address => uint256) public lifetimeEarned;
mapping(address => uint256) public lifetimeBurned;
```

### Function Signatures

```solidity
// Constructor
constructor(uint256 _maxSupply, address admin)

// Minting (only authorized minters)
function mint(address to, uint256 amount, string calldata reason) external onlyRole(MINTER_ROLE)

// Burning (only authorized burners or self)
function burn(address from, uint256 amount, string calldata reason) external onlyRole(BURNER_ROLE)
function burnFrom(address from, uint256 amount, string calldata reason) external onlyRole(BURNER_ROLE)

// Soulbound enforcement
function transfer(address to, uint256 amount) public pure override returns (bool)
function transferFrom(address from, address to, uint256 amount) public pure override returns (bool)
function approve(address spender, uint256 amount) public pure override returns (bool)

// Admin functions
function addMinter(address minter) external onlyRole(ADMIN_ROLE)
function removeMinter(address minter) external onlyRole(ADMIN_ROLE)
function addBurner(address burner) external onlyRole(ADMIN_ROLE)
function removeBurner(address burner) external onlyRole(ADMIN_ROLE)

// View functions
function balanceOf(address account) external view returns (uint256)
function totalSupply() external view returns (uint256)
function allowance(address owner, address spender) external pure returns (uint256)
```

### Events

```solidity
event Minted(address indexed account, uint256 amount, string reason);
event Burned(address indexed account, uint256 amount, string reason);
event MinterAdded(address indexed minter);
event MinterRemoved(address indexed minter);
event BurnerAdded(address indexed burner);
event BurnerRemoved(address indexed burner);
```

### Access Control
- `ADMIN_ROLE`: Contract deployment, role management
- `MINTER_ROLE`: TimeExchange (earned hours), Treasury (rewards), Governance (incentives)
- `BURNER_ROLE`: TimeExchange (spent hours), Treasury (redemptions)

---

## 2. ReputationRegistry

### Purpose
On-chain reputation system tracking user trustworthiness, skills, and contribution history. Non-transferable scores with decay mechanisms.

### Interface: IReputationRegistry

```solidity
interface IReputationRegistry {
    // Structs
    struct ReputationProfile {
        uint256 overallScore;           // 0-10000 (basis points)
        uint256 completedExchanges;     // Successfully completed
        uint256 disputedExchanges;      // Went to dispute
        uint256 wonDisputes;            // Disputes won
        uint256 lostDisputes;           // Disputes lost
        uint256 totalHoursContributed;
        uint256 totalHoursReceived;
        uint256 lastActivityTimestamp;
        uint256 registrationTimestamp;
        bool isRegistered;
        string metadataURI;             // IPFS hash for extended profile
    }
    
    struct SkillRating {
        uint256 skillId;
        uint256 rating;                 // 1-5 stars scaled
        uint256 reviewCount;
        uint256 totalRatingSum;
    }
    
    // Errors
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidScore();
    error UnauthorizedUpdater();
    error InvalidSkill();
    
    // Events
    event UserRegistered(address indexed user, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, string reason);
    event SkillEndorsed(address indexed user, uint256 indexed skillId, address indexed endorser);
    event SkillRated(address indexed provider, uint256 indexed skillId, address indexed rater, uint256 rating);
    event ExchangeCompleted(address indexed provider, address indexed receiver, uint256 hoursAmount);
    event DisputeRecorded(address indexed user, bool won);
    
    // Core Functions
    function registerUser(string calldata metadataURI) external;
    function updateReputation(address user, int256 scoreDelta, string calldata reason) external;
    function recordExchangeCompletion(address provider, address receiver, uint256 hoursAmount) external;
    function recordDispute(address user, bool won) external;
    function endorseSkill(address user, uint256 skillId) external;
    function rateSkill(address provider, uint256 skillId, uint256 rating) external;
    
    // View Functions
    function getReputation(address user) external view returns (ReputationProfile memory);
    function getSkillRating(address user, uint256 skillId) external view returns (SkillRating memory);
    function isRegistered(address user) external view returns (bool);
    function canTransact(address user) external view returns (bool);
    function getTrustTier(address user) external view returns (uint8 tier);
}
```

### State Variables

```solidity
// Access Control
bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
bytes32 public constant EXCHANGE_ROLE = keccak256("EXCHANGE_ROLE");
bytes32 public constant DISPUTE_ROLE = keccak256("DISPUTE_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

// Reputation Data
mapping(address => ReputationProfile) public reputations;
mapping(address => mapping(uint256 => SkillRating)) public skillRatings;
mapping(address => mapping(uint256 => mapping(address => bool))) public hasEndorsed;
mapping(address => mapping(uint256 => mapping(address => bool))) public hasRated;

// Configuration
uint256 public constant MAX_SCORE = 10000;
uint256 public constant MIN_SCORE = 0;
uint256 public constant REGISTRATION_BONUS = 500;      // +5% starting reputation
uint256 public constant EXCHANGE_BONUS = 50;           // +0.5% per successful exchange
uint256 public constant DISPUTE_LOSS_PENALTY = 1000;   // -10% for losing dispute
uint256 public constant DISPUTE_WIN_BONUS = 100;       // +1% for winning dispute
uint256 public decayRatePerYear;                       // Basis points per year

// Skill Registry
mapping(uint256 => string) public skillNames;
uint256 public skillCount;

// Trust Tiers (thresholds)
uint256 public constant TIER_1_THRESHOLD = 0;      // New user
uint256 public constant TIER_2_THRESHOLD = 2500;   // Bronze
uint256 public constant TIER_3_THRESHOLD = 5000;   // Silver
uint256 public constant TIER_4_THRESHOLD = 7500;   // Gold
uint256 public constant TIER_5_THRESHOLD = 9000;   // Platinum

// Restrictions
uint256 public constant MIN_REPUTATION_TO_PROVIDE = 0;
uint256 public constant MIN_REPUTATION_TO_RECEIVE = 0;
```

### Function Signatures

```solidity
// Constructor
constructor(address admin, uint256 _decayRatePerYear)

// Registration
function registerUser(string calldata metadataURI) external

// Reputation Updates (authorized contracts only)
function updateReputation(address user, int256 scoreDelta, string calldata reason) external onlyRole(EXCHANGE_ROLE)
function recordExchangeCompletion(address provider, address receiver, uint256 hoursAmount) external onlyRole(EXCHANGE_ROLE)
function recordDispute(address user, bool won) external onlyRole(DISPUTE_ROLE)

// Social Features
function endorseSkill(address user, uint256 skillId) external
function rateSkill(address provider, uint256 skillId, uint256 rating) external

// Admin Functions
function addSkill(string calldata name) external onlyRole(ADMIN_ROLE) returns (uint256 skillId)
function setDecayRate(uint256 newRate) external onlyRole(ADMIN_ROLE)
function updateSkillName(uint256 skillId, string calldata name) external onlyRole(ADMIN_ROLE)

// View Functions
function getReputation(address user) external view returns (ReputationProfile memory)
function getSkillRating(address user, uint256 skillId) external view returns (SkillRating memory)
function isRegistered(address user) external view returns (bool)
function canTransact(address user) external view returns (bool)
function getTrustTier(address user) external view returns (uint8 tier)
function calculateCurrentScore(address user) external view returns (uint256)
function getUserStats(address user) external view returns (
    uint256 overallScore,
    uint256 completedExchanges,
    uint256 disputedExchanges,
    uint256 totalHoursContributed
)
```

### Events

```solidity
event UserRegistered(address indexed user, uint256 timestamp);
event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, string reason);
event SkillEndorsed(address indexed user, uint256 indexed skillId, address indexed endorser);
event SkillRated(address indexed provider, uint256 indexed skillId, address indexed rater, uint256 rating);
event ExchangeCompleted(address indexed provider, address indexed receiver, uint256 hoursAmount);
event DisputeRecorded(address indexed user, bool won);
event SkillAdded(uint256 indexed skillId, string name);
```

### Access Control
- `ADMIN_ROLE`: Skill management, parameter updates
- `REGISTRAR_ROLE`: Batch registration (optional)
- `EXCHANGE_ROLE`: TimeExchange contract updates reputation on transactions
- `DISPUTE_ROLE`: DisputeResolution contract records dispute outcomes
- Public: Self-registration, skill endorsement, rating

---

## 3. TimeExchange (Escrow)

### Purpose
Secure escrow for time banking transactions. Holds commitments, manages state transitions, and coordinates with ReputationRegistry and TimeToken.

### Interface: ITimeExchange

```solidity
interface ITimeExchange {
    // Enums
    enum ExchangeStatus {
        Pending,        // Awaiting provider acceptance
        Accepted,       // Provider accepted, service pending
        InProgress,     // Service being delivered
        Completed,      // Service delivered, payment released
        Disputed,       // Under dispute resolution
        Cancelled,      // Cancelled before completion
        Refunded        // Refunded due to dispute/cancellation
    }
    
    // Structs
    struct Exchange {
        uint256 id;
        address requester;
        address provider;
        uint256 hoursAmount;
        uint256 skillId;
        string description;
        string deliverables;
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 completedAt;
        ExchangeStatus status;
        uint256 disputeId;
        bool requesterConfirmed;
        bool providerConfirmed;
        string metadataURI;
    }
    
    // Errors
    error InvalidHours();
    error InvalidProvider();
    error NotRequester();
    error NotProvider();
    error InvalidStatus();
    error AlreadyConfirmed();
    error DeadlinePassed();
    error InsufficientReputation();
    error NotRegistered();
    error DisputeActive();
    
    // Events
    exchange Created(uint256 indexed id, address indexed requester, address indexed provider, uint256 hours);
    exchange Accepted(uint256 indexed id, address indexed provider);
    exchange Started(uint256 indexed id);
    exchange Completed(uint256 indexed id);
    exchange Disputed(uint256 indexed id, uint256 indexed disputeId);
    exchange Cancelled(uint256 indexed id, address indexed by);
    exchange Refunded(uint256 indexed id);
    ConfirmationSubmitted(uint256 indexed id, address indexed by);
    
    // Core Functions
    function createExchange(
        address provider,
        uint256 hoursAmount,
        uint256 skillId,
        string calldata description,
        string calldata deliverables,
        string calldata metadataURI
    ) external returns (uint256 exchangeId);
    
    function acceptExchange(uint256 exchangeId) external;
    function startExchange(uint256 exchangeId) external;
    function confirmCompletion(uint256 exchangeId) external;
    function cancelExchange(uint256 exchangeId) external;
    function raiseDispute(uint256 exchangeId, string calldata reason) external;
    
    // Dispute Resolution Callback
    function resolveDispute(
        uint256 exchangeId,
        bool requesterWins,
        uint256 providerHours,
        uint256 requesterRefund
    ) external;
    
    // View Functions
    function getExchange(uint256 exchangeId) external view returns (Exchange memory);
    function getUserExchanges(address user) external view returns (uint256[] memory);
    function getActiveExchanges(address user) external view returns (uint256[] memory);
}
```

### State Variables

```solidity
// Access Control
bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

// Contract References
ITimeToken public timeToken;
IReputationRegistry public reputationRegistry;
IDisputeResolution public disputeResolution;
ITreasury public treasury;

// Exchange Data
mapping(uint256 => Exchange) public exchanges;
mapping(address => uint256[]) public userExchanges;
uint256 public exchangeCounter;

// Configuration
uint256 public maxHoursPerExchange;
uint256 public acceptanceDeadline;      // Seconds to accept
uint256 public completionDeadline;      // Seconds to complete after acceptance
uint256 public platformFeeBasisPoints;  // Fee to treasury (e.g., 100 = 1%)

// Exchange counts for analytics
uint256 public totalExchangesCreated;
uint256 public totalExchangesCompleted;
uint256 public totalExchangesDisputed;
uint256 public totalExchangesCancelled;
uint256 public totalHoursExchanged;

// Pause mechanism
bool public paused;
```

### Function Signatures

```solidity
// Constructor
constructor(
    address _timeToken,
    address _reputationRegistry,
    address _disputeResolution,
    address _treasury,
    address admin
)

// Core Exchange Flow
function createExchange(
    address provider,
    uint256 hoursAmount,
    uint256 skillId,
    string calldata description,
    string calldata deliverables,
    string calldata metadataURI
) external whenNotPaused returns (uint256 exchangeId)

function acceptExchange(uint256 exchangeId) external onlyProvider(exchangeId) whenNotPaused
function startExchange(uint256 exchangeId) external onlyProvider(exchangeId) whenNotPaused
function confirmCompletion(uint256 exchangeId) external whenNotPaused
function cancelExchange(uint256 exchangeId) external whenNotPaused

// Dispute Integration
function raiseDispute(uint256 exchangeId, string calldata reason) external whenNotPaused
function resolveDispute(
    uint256 exchangeId,
    bool requesterWins,
    uint256 providerHours,
    uint256 requesterRefund
) external onlyRole(DISPUTE_RESOLVER_ROLE)

// View Functions
function getExchange(uint256 exchangeId) external view returns (Exchange memory)
function getUserExchanges(address user) external view returns (uint256[] memory)
function getActiveExchanges(address user) external view returns (uint256[] memory)
function getExchangeCount() external view returns (uint256)

// Admin Functions
function setPlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE)
function setDeadlines(uint256 acceptance, uint256 completion) external onlyRole(ADMIN_ROLE)
function setMaxHours(uint256 maxHours) external onlyRole(ADMIN_ROLE)
function pause() external onlyRole(PAUSER_ROLE)
function unpause() external onlyRole(ADMIN_ROLE)
function updateContracts(
    address _timeToken,
    address _reputationRegistry,
    address _disputeResolution,
    address _treasury
) external onlyRole(ADMIN_ROLE)
```

### Events

```solidity
event ExchangeCreated(
    uint256 indexed id,
    address indexed requester,
    address indexed provider,
    uint256 hoursAmount,
    uint256 skillId
);
event ExchangeAccepted(uint256 indexed id, address indexed provider, uint256 acceptedAt);
event ExchangeStarted(uint256 indexed id, uint256 startedAt);
event ExchangeCompleted(
    uint256 indexed id,
    uint256 completedAt,
    uint256 providerReceived,
    uint256 platformFee
);
event ExchangeDisputed(uint256 indexed id, uint256 indexed disputeId, address indexed raisedBy);
event ExchangeCancelled(uint256 indexed id, address indexed by, string reason);
event ExchangeRefunded(uint256 indexed id, uint256 refundAmount);
event ConfirmationSubmitted(uint256 indexed id, address indexed by, bool isRequester);
event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
```

### Access Control
- `ADMIN_ROLE`: Configuration, contract upgrades, emergency pause
- `PAUSER_ROLE`: Emergency pause
- `DISPUTE_RESOLVER_ROLE`: DisputeResolution contract calls resolveDispute
- Public: All exchange operations (with registration/reputation checks)

---

## 4. DisputeResolution

### Purpose
Decentralized dispute arbitration system. Uses a rotating jury of high-reputation users with stake-weighted voting.

### Interface: IDisputeResolution

```solidity
interface IDisputeResolution {
    // Enums
    enum DisputeStatus {
        Open,           // Accepting jury, evidence
        Voting,         // Jury voting phase
        Resolved,       // Decision reached
        Appealed,       // Under appeal
        Finalized       // No more appeals possible
    }
    
    enum Vote {
        Abstain,
        RequesterWins,
        ProviderWins,
        SplitDecision
    }
    
    // Structs
    struct Dispute {
        uint256 id;
        uint256 exchangeId;
        address requester;
        address provider;
        string reason;
        string requesterEvidence;
        string providerEvidence;
        DisputeStatus status;
        uint256 createdAt;
        uint256 votingEndsAt;
        uint256 resolvedAt;
        Vote outcome;
        uint256 winningVoteCount;
        uint256 totalVotes;
        address[] jury;
        mapping(address => Vote) votes;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) stakes;
        uint256 totalStaked;
        uint256 appealCount;
        uint256 previousDisputeId;  // For appeals
    }
    
    struct JurorProfile {
        bool isActive;
        uint256 casesServed;
        uint256 casesWon;       // Voted with majority
        uint256 reputationAtJoin;
        uint256 joinedAt;
    }
    
    // Errors
    error NotAuthorized();
    error InvalidDispute();
    error AlreadyVoted();
    error NotJuror();
    error VotingClosed();
    error VotingOpen();
    error InvalidStake();
    error AppealWindowClosed();
    error MaxAppealsReached();
    error EvidencePeriodClosed();
    
    // Events
    event DisputeCreated(uint256 indexed id, uint256 indexed exchangeId, address indexed requester);
    event EvidenceSubmitted(uint256 indexed id, address indexed by, string evidenceURI);
    event JurorSelected(uint256 indexed id, address indexed juror);
    event VoteCast(uint256 indexed id, address indexed juror, Vote vote);
    event DisputeResolved(uint256 indexed id, Vote outcome, uint256 requesterAmount, uint256 providerAmount);
    event JurorRewarded(uint256 indexed id, address indexed juror, uint256 amount);
    event JurorPenalized(uint256 indexed id, address indexed juror, uint256 amount);
    event AppealFiled(uint256 indexed id, uint256 newDisputeId);
    event JurorRegistered(address indexed juror);
    event JurorRemoved(address indexed juror);
    
    // Core Functions
    function createDispute(uint256 exchangeId, string calldata reason) external returns (uint256 disputeId);
    function submitEvidence(uint256 disputeId, string calldata evidenceURI) external;
    function registerAsJuror() external;
    function vote(uint256 disputeId, Vote voteChoice) external;
    function finalizeDispute(uint256 disputeId) external;
    function appeal(uint256 disputeId, string calldata newEvidence) external returns (uint256 newDisputeId);
    function claimRewards(uint256 disputeId) external;
    
    // View Functions
    function getDispute(uint256 disputeId) external view returns (
        uint256 id,
        uint256 exchangeId,
        DisputeStatus status,
        Vote outcome,
        uint256 votingEndsAt
    );
    function getJurorStake(address juror) external view returns (uint256);
    function isEligibleJuror(address user) external view returns (bool);
    function getJuryForDispute(uint256 disputeId) external view returns (address[] memory);
}
```

### State Variables

```solidity
// Access Control
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
bytes32 public constant EXCHANGE_ROLE = keccak256("EXCHANGE_ROLE");

// Contract References
ITimeToken public timeToken;
IReputationRegistry public reputationRegistry;
ITimeExchange public timeExchange;
ITreasury public treasury;

// Dispute Data
mapping(uint256 => Dispute) public disputes;
uint256 public disputeCounter;

// Juror Registry
mapping(address => JurorProfile) public jurors;
address[] public activeJurorList;
mapping(address => uint256) public jurorStakes;
uint256 public totalJurorStake;

// Configuration
uint256 public minReputationToBeJuror;
uint256 public minStakeToBeJuror;
uint256 public jurySize;
uint256 public votingPeriod;
uint256 public evidencePeriod;
uint256 public appealWindow;
uint256 public maxAppeals;
uint256 public jurorRewardPoolBasisPoints;  // % of disputed amount for jurors

// Dispute Parameters
uint256 public constant BASIS_POINTS = 10000;
uint256 public constant MIN_JURY_SIZE = 3;
uint256 public constant MAX_JURY_SIZE = 21;

// Appeal escalation
mapping(uint256 => uint256) public appealChain;  // disputeId => appealDisputeId
```

### Function Signatures

```solidity
// Constructor
constructor(
    address _timeToken,
    address _reputationRegistry,
    address _timeExchange,
    address _treasury,
    address admin
)

// Dispute Creation
function createDispute(uint256 exchangeId, string calldata reason) 
    external 
    onlyRole(EXCHANGE_ROLE) 
    returns (uint256 disputeId)

// Evidence Submission
function submitEvidence(uint256 disputeId, string calldata evidenceURI) external

// Juror Management
function registerAsJuror() external
function unregisterAsJuror() external
function increaseStake(uint256 amount) external
function decreaseStake(uint256 amount) external
function selectJury(uint256 disputeId) external  // Callable by anyone after evidence period

// Voting
function vote(uint256 disputeId, Vote voteChoice) external

// Resolution
function finalizeDispute(uint256 disputeId) external
function resolveDisputeInternal(uint256 disputeId) internal

// Appeals
function appeal(uint256 disputeId, string calldata newEvidence) external returns (uint256 newDisputeId)

// Rewards
function claimRewards(uint256 disputeId) external
function distributeRewards(uint256 disputeId) internal

// View Functions
function getDispute(uint256 disputeId) external view returns (...)
function getJurorProfile(address juror) external view returns (JurorProfile memory)
function isEligibleJuror(address user) external view returns (bool)
function getJuryForDispute(uint256 disputeId) external view returns (address[] memory)
function getJurorVote(uint256 disputeId, address juror) external view returns (Vote)

// Admin Functions
function setJuryParameters(
    uint256 _minReputation,
    uint256 _minStake,
    uint256 _jurySize,
    uint256 _votingPeriod,
    uint256 _evidencePeriod
) external onlyRole(ADMIN_ROLE)

function emergencyResolve(uint256 disputeId, Vote outcome) external onlyRole(MODERATOR_ROLE)
```

### Events

```solidity
event DisputeCreated(
    uint256 indexed id,
    uint256 indexed exchangeId,
    address indexed requester,
    address provider,
    uint256 createdAt
);
event EvidenceSubmitted(uint256 indexed id, address indexed by, string evidenceURI, uint256 timestamp);
event JurorSelected(uint256 indexed id, address indexed juror, uint256 stake);
event VoteCast(uint256 indexed id, address indexed juror, Vote vote, uint256 timestamp);
event DisputeResolved(
    uint256 indexed id,
    Vote outcome,
    uint256 requesterAmount,
    uint256 providerAmount,
    uint256 jurorRewards
);
event JurorRewarded(uint256 indexed id, address indexed juror, uint256 amount);
event JurorPenalized(uint256 indexed id, address indexed juror, uint256 amount);
event AppealFiled(uint256 indexed id, uint256 indexed newDisputeId, address indexed appellant);
event JurorRegistered(address indexed juror, uint256 stake, uint256 reputation);
event JurorRemoved(address indexed juror);
event StakeIncreased(address indexed juror, uint256 newStake);
event StakeDecreased(address indexed juror, uint256 newStake);
```

### Access Control
- `ADMIN_ROLE`: Parameter configuration, emergency functions
- `MODERATOR_ROLE`: Emergency dispute resolution (last resort)
- `EXCHANGE_ROLE`: Only TimeExchange can create disputes
- Public: Evidence submission, jury registration, voting, appeals

---

## 5. Governance (DAO)

### Purpose
Decentralized governance for protocol parameters, treasury spending, and contract upgrades. Token-weighted voting with reputation multipliers.

### Interface: ITimebankGovernance

```solidity
interface ITimebankGovernance {
    // Enums
    enum ProposalState {
        Pending,        // Created, waiting for voting delay
        Active,         // Voting open
        Canceled,       // Canceled by proposer
        Defeated,       // Voting ended, failed
        Succeeded,      // Voting ended, passed
        Queued,         // In timelock queue
        Expired,        // Timelock expired
        Executed        // Successfully executed
    }
    
    enum ProposalType {
        ParameterChange,
        TreasurySpend,
        ContractUpgrade,
        RoleAssignment,
        EmergencyAction
    }
    
    // Structs
    struct Proposal {
        uint256 id;
        ProposalType proposalType;
        address proposer;
        string title;
        string description;
        address[] targets;
        uint256[] values;
        bytes[] calldatas;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startBlock;
        uint256 endBlock;
        uint256 eta;            // Execution time (timelock)
        ProposalState state;
        bool executed;
        bool canceled;
        mapping(address => Receipt) receipts;
    }
    
    struct Receipt {
        bool hasVoted;
        uint8 support;      // 0=against, 1=for, 2=abstain
        uint256 votes;
    }
    
    struct ProposalParams {
        uint256 votingDelay;        // Blocks before voting starts
        uint256 votingPeriod;       // Blocks voting is open
        uint256 proposalThreshold;  // Min votes to create proposal
        uint256 quorumVotes;        // Min votes for valid proposal
        uint256 timelockDelay;      // Seconds before execution
    }
    
    // Errors
    error InvalidProposal();
    error VotingClosed();
    error AlreadyVoted();
    error QuorumNotReached();
    error ProposalNotSucceeded();
    error TimelockNotExpired();
    error Unauthorized();
    error InvalidTarget();
    
    // Events
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        address[] targets,
        uint256[] values,
        bytes[] calldatas,
        uint256 startBlock,
        uint256 endBlock,
        string description
    );
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 support,
        uint256 votes
    );
    event ProposalCanceled(uint256 indexed id);
    event ProposalQueued(uint256 indexed id, uint256 eta);
    event ProposalExecuted(uint256 indexed id);
    event ProposalThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event VotingDelayUpdated(uint256 oldDelay, uint256 newDelay);
    event VotingPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    
    // Core Functions
    function propose(
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas,
        string calldata title,
        string calldata description,
        ProposalType proposalType
    ) external returns (uint256 proposalId);
    
    function queue(uint256 proposalId) external;
    function execute(uint256 proposalId) external payable;
    function cancel(uint256 proposalId) external;
    function castVote(uint256 proposalId, uint8 support) external;
    function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external;
    
    // View Functions
    function state(uint256 proposalId) external view returns (ProposalState);
    function getVotes(address account, uint256 blockNumber) external view returns (uint256);
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        ProposalState state,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startBlock,
        uint256 endBlock
    );
    function getReceipt(uint256 proposalId, address voter) external view returns (Receipt memory);
    function quorum(uint256 blockNumber) external view returns (uint256);
}
```

### State Variables

```solidity
// Access Control
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");

// Contract References
ITimeToken public timeToken;
IReputationRegistry public reputationRegistry;
ITreasury public treasury;
ITimelock public timelock;

// Proposal Data
mapping(uint256 => Proposal) public proposals;
uint256 public proposalCount;

// Governance Parameters
ProposalParams public params;

// Vote delegation
mapping(address => address) public delegates;
mapping(address => uint256) public delegatedVotes;

// Constants
uint256 public constant PROPOSAL_MAX_OPERATIONS = 10;
uint256 public constant MIN_VOTING_DELAY = 1;
uint256 public constant MAX_VOTING_DELAY = 40320;      // ~1 week
uint256 public constant MIN_VOTING_PERIOD = 5760;      // ~1 day
uint256 public constant MAX_VOTING_PERIOD = 80640;     // ~2 weeks

// Quorum calculation
uint256 public quorumBasisPoints;  // % of total supply

// Whitelist for proposal targets
mapping(address => bool) public whitelistedTargets;
```

### Function Signatures

```solidity
// Constructor
constructor(
    address _timeToken,
    address _reputationRegistry,
    address _treasury,
    address _timelock,
    ProposalParams memory _params,
    address admin
)

// Proposal Creation
function propose(
    address[] calldata targets,
    uint256[] calldata values,
    bytes[] calldata calldatas,
    string calldata title,
    string calldata description,
    ProposalType proposalType
) external returns (uint256 proposalId)

// Voting
function castVote(uint256 proposalId, uint8 support) external
function castVoteWithReason(uint256 proposalId, uint8 support, string calldata reason) external
function delegate(address delegatee) external
function undelegate() external

// Proposal Lifecycle
function queue(uint256 proposalId) external
function execute(uint256 proposalId) external payable
function cancel(uint256 proposalId) external

// View Functions
function state(uint256 proposalId) external view returns (ProposalState)
function getVotes(address account, uint256 blockNumber) external view returns (uint256)
function getVotesWithReputation(address account) external view returns (uint256)
function getProposal(uint256 proposalId) external view returns (...)
function getReceipt(uint256 proposalId, address voter) external view returns (Receipt memory)
function quorum(uint256 blockNumber) external view returns (uint256)
function proposalThreshold() external view returns (uint256)

// Admin Functions
function setVotingDelay(uint256 newDelay) external onlyRole(ADMIN_ROLE)
function setVotingPeriod(uint256 newPeriod) external onlyRole(ADMIN_ROLE)
function setProposalThreshold(uint256 newThreshold) external onlyRole(ADMIN_ROLE)
function setQuorumBasisPoints(uint256 newQuorum) external onlyRole(ADMIN_ROLE)
function whitelistTarget(address target, bool whitelisted) external onlyRole(ADMIN_ROLE)
function emergencyPause() external onlyRole(GUARDIAN_ROLE)
function emergencyUnpause() external onlyRole(ADMIN_ROLE)

// Internal Functions
function _getVotingPower(address account) internal view returns (uint256)
function _applyReputationMultiplier(uint256 votes, uint256 reputation) internal pure returns (uint256)
function _queueOrRevert(uint256 proposalId) internal
function _executeTransaction(address target, uint256 value, bytes memory data) internal
```

### Events

```solidity
event ProposalCreated(
    uint256 indexed id,
    address indexed proposer,
    ProposalType proposalType,
    address[] targets,
    uint256[] values,
    bytes[] calldatas,
    uint256 startBlock,
    uint256 endBlock,
    string title
);
event VoteCast(
    address indexed voter,
    uint256 indexed proposalId,
    uint8 support,
    uint256 votes,
    string reason
);
event ProposalCanceled(uint256 indexed id, address indexed by);
event ProposalQueued(uint256 indexed id, uint256 eta);
event ProposalExecuted(uint256 indexed id, address indexed executor);
event DelegationChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate);
event VotingDelayUpdated(uint256 oldDelay, uint256 newDelay);
event VotingPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
event ProposalThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
event QuorumBasisPointsUpdated(uint256 oldQuorum, uint256 newQuorum);
event TargetWhitelisted(address indexed target);
event TargetRemovedFromWhitelist(address indexed target);
```

### Access Control
- `ADMIN_ROLE`: Parameter updates, whitelist management, unpause
- `GUARDIAN_ROLE`: Emergency pause (multisig or security council)
- `PROPOSER_ROLE`: Can create proposals (optional gating)
- Public: Voting, delegation

---

## 6. Treasury

### Purpose
Protocol treasury managing fees, juror rewards, and ecosystem incentives. Controlled by Governance DAO.

### Interface: ITreasury

```solidity
interface ITreasury {
    // Structs
    struct Allocation {
        uint256 id;
        string name;
        address recipient;
        uint256 basisPoints;    // Percentage in basis points
        bool isActive;
    }
    
    struct StreamingPayment {
        uint256 id;
        address recipient;
        address token;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 endTime;
        bool cancellable;
        bool canceled;
    }
    
    // Errors
    error InvalidAllocation();
    error InsufficientBalance();
    error InvalidRecipient();
    error StreamingNotStarted();
    error StreamingEnded();
    error AlreadyCanceled();
    error Unauthorized();
    
    // Events
    event Deposited(address indexed token, address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);
    event AllocationCreated(uint256 indexed id, string name, address recipient, uint256 basisPoints);
    event AllocationUpdated(uint256 indexed id, uint256 newBasisPoints);
    event AllocationDeactivated(uint256 indexed id);
    event StreamingPaymentCreated(uint256 indexed id, address recipient, uint256 amount);
    event StreamingPaymentReleased(uint256 indexed id, uint256 amount);
    event StreamingPaymentCanceled(uint256 indexed id);
    event RewardsDistributed(address indexed token, uint256 amount);
    
    // Core Functions
    function deposit(address token, uint256 amount) external payable;
    function withdraw(address token, uint256 amount, address recipient) external;
    function distributeRewards(address token, address[] calldata recipients, uint256[] calldata amounts) external;
    
    // Allocation Management
    function createAllocation(string calldata name, address recipient, uint256 basisPoints) external returns (uint256 id);
    function updateAllocation(uint256 id, uint256 newBasisPoints) external;
    function deactivateAllocation(uint256 id) external;
    function executeAllocations(address token) external;
    
    // Streaming Payments
    function createStreamingPayment(
        address recipient,
        address token,
        uint256 totalAmount,
        uint256 duration,
        bool cancellable
    ) external returns (uint256 id);
    
    function releaseStream(uint256 streamId) external;
    function cancelStream(uint256 streamId) external;
    
    // View Functions
    function getBalance(address token) external view returns (uint256);
    function getAllocation(uint256 id) external view returns (Allocation memory);
    function getStreamingPayment(uint256 id) external view returns (StreamingPayment memory);
    function releasableAmount(uint256 streamId) external view returns (uint256);
    function getTotalAllocatedBasisPoints() external view returns (uint256);
}
```

### State Variables

```solidity
// Access Control
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
bytes32 public constant EXCHANGE_ROLE = keccak256("EXCHANGE_ROLE");
bytes32 public constant DISPUTE_ROLE = keccak256("DISPUTE_ROLE");

// Token Support
mapping(address => bool) public supportedTokens;
address[] public tokenList;

// Balance Tracking
mapping(address => uint256) public balances;  // token => amount

// Allocations
mapping(uint256 => Allocation) public allocations;
uint256 public allocationCounter;
uint256 public totalAllocatedBasisPoints;

// Streaming Payments
mapping(uint256 => StreamingPayment) public streamingPayments;
uint256 public streamingCounter;

// Emergency Controls
bool public paused;
uint256 public withdrawalLimit;      // Max withdrawal per transaction (0 = unlimited)
uint256 public withdrawalCooldown;   // Blocks between large withdrawals
mapping(address => uint256) public lastWithdrawalBlock;

// Constants
uint256 public constant BASIS_POINTS = 10000;
uint256 public constant MAX_ALLOCATION = 5000;  // Max 50% to any single recipient
```

### Function Signatures

```solidity
// Constructor
constructor(address admin, address governance)

// Deposits
function deposit(address token, uint256 amount) external payable
function depositETH() external payable

// Governance-controlled withdrawals
function withdraw(address token, uint256 amount, address recipient) 
    external 
    onlyRole(GOVERNANCE_ROLE)

function withdrawETH(uint256 amount, address recipient) 
    external 
    onlyRole(GOVERNANCE_ROLE)

// Reward Distribution
function distributeRewards(
    address token, 
    address[] calldata recipients, 
    uint256[] calldata amounts
) external onlyRole(DISPUTE_ROLE)

function distributeFee(address token, uint256 amount) external onlyRole(EXCHANGE_ROLE)

// Allocation Management
function createAllocation(string calldata name, address recipient, uint256 basisPoints) 
    external 
    onlyRole(GOVERNANCE_ROLE) 
    returns (uint256 id)

function updateAllocation(uint256 id, uint256 newBasisPoints) external onlyRole(GOVERNANCE_ROLE)
function deactivateAllocation(uint256 id) external onlyRole(GOVERNANCE_ROLE)
function executeAllocations(address token) external

// Streaming Payments
function createStreamingPayment(
    address recipient,
    address token,
    uint256 totalAmount,
    uint256 duration,
    bool cancellable
) external onlyRole(GOVERNANCE_ROLE) returns (uint256 id)

function releaseStream(uint256 streamId) external
function cancelStream(uint256 streamId) external onlyRole(GOVERNANCE_ROLE)

// Token Management
function addSupportedToken(address token) external onlyRole(ADMIN_ROLE)
function removeSupportedToken(address token) external onlyRole(ADMIN_ROLE)

// Emergency
function emergencyWithdraw(address token, address recipient) external onlyRole(ADMIN_ROLE)
function pause() external onlyRole(ADMIN_ROLE)
function unpause() external onlyRole(GOVERNANCE_ROLE)

// View Functions
function getBalance(address token) external view returns (uint256)
function getETHBalance() external view returns (uint256)
function getAllocation(uint256 id) external view returns (Allocation memory)
function getStreamingPayment(uint256 id) external view returns (StreamingPayment memory)
function releasableAmount(uint256 streamId) external view returns (uint256)
function getTotalAllocatedBasisPoints() external view returns (uint256)
function getSupportedTokens() external view returns (address[] memory)
```

### Events

```solidity
event Deposited(address indexed token, address indexed from, uint256 amount, uint256 timestamp);
event Withdrawn(address indexed token, address indexed to, uint256 amount, uint256 timestamp);
event AllocationCreated(
    uint256 indexed id,
    string name,
    address indexed recipient,
    uint256 basisPoints
);
event AllocationUpdated(uint256 indexed id, uint256 oldBasisPoints, uint256 newBasisPoints);
event AllocationDeactivated(uint256 indexed id);
event AllocationsExecuted(address indexed token, uint256 totalDistributed);
event StreamingPaymentCreated(
    uint256 indexed id,
    address indexed recipient,
    address token,
    uint256 totalAmount,
    uint256 startTime,
    uint256 endTime
);
event StreamingPaymentReleased(uint256 indexed id, uint256 amount);
event StreamingPaymentCanceled(uint256 indexed id, uint256 unreleasedAmount);
event RewardsDistributed(address indexed token, uint256 totalAmount, uint256 recipientCount);
event FeeReceived(address indexed token, uint256 amount, address indexed from);
event TokenAdded(address indexed token);
event TokenRemoved(address indexed token);
event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);
```

### Access Control
- `ADMIN_ROLE`: Token management, emergency functions, pause
- `GOVERNANCE_ROLE`: Withdrawals, allocations, streaming payments, unpause
- `EXCHANGE_ROLE`: Fee deposits
- `DISPUTE_ROLE`: Juror reward distributions
- Public: Deposits, stream releases

---

## Contract Interaction Map

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   TimeToken     │◄────┤   TimeExchange   │────►│     Treasury    │
│  (ERC-20 Soul)  │     │     (Escrow)     │     │   (Protocol $)  │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         │                       │                        │
         │              ┌────────▼─────────┐              │
         │              │ ReputationRegistry│             │
         │              │   (Trust Score)   │             │
         │              └────────┬─────────┘             │
         │                       │                        │
         │              ┌────────▼─────────┐              │
         └─────────────►│ DisputeResolution│◄─────────────┘
                        │   (Arbitration)  │
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │    Governance    │
                        │      (DAO)       │
                        └──────────────────┘
```

## Key Design Decisions

### 1. Soulbound TimeToken
- Non-transferable ERC-20 prevents speculation
- Only minted by authorized contracts (Exchange, Treasury, Governance)
- Burned when hours are "spent" on services
- Tracks lifetime earned/burned for reputation

### 2. Reputation Integration
- All major actions check reputation
- Higher reputation = higher voting power in governance
- Dispute resolution uses reputation-weighted jury selection
- Decay mechanism prevents dormant high-reputation accounts

### 3. Modular Escrow
- TimeExchange is state machine for service delivery
- Separate from dispute logic (clean separation)
- Callback pattern for dispute resolution
- Platform fees configurable by governance

### 4. Decentralized Justice
- Rotating jury selected from staked, high-reputation users
- Stake-weighted voting aligns incentives
- Appeal mechanism for controversial decisions
- Rewards for voting with majority, penalties for minority

### 5. Progressive Decentralization
- Admin roles for initial deployment
- Governance can revoke admin powers over time
- Emergency pause for security incidents
- Guardian role for critical interventions

### 6. Treasury Flexibility
- Supports multiple tokens
- Streaming payments for contributor salaries
- Allocation system for automated distributions
- Governance-controlled with emergency overrides

## Upgrade Path

1. **Phase 1**: Deploy with admin multisig control
2. **Phase 2**: Transfer parameter control to Governance
3. **Phase 3**: Transfer contract upgrade rights to Governance
4. **Phase 4**: Revoke admin emergency powers (full decentralization)

## Security Considerations

- Reentrancy guards on all external calls
- Checks-Effects-Interactions pattern
- Maximum limits on exchange hours (prevent spam)
- Timelock on governance execution
- Emergency pause on critical functions
- Formal verification recommended for TimeToken mint/burn logic
