// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title EPWORLDToken - Consumptive Utility Implementation
 * @notice Functional utility token for EPWORLD gaming ecosystem
 * @dev ERC-20 designed for immediate consumptive use, not investment
 *      
 *      CONSUMPTIVE UTILITY PATHWAYS:
 *      1. Oracle Validation Staking (1,000-100,000 EPW) - Document verification
 *      2. Battle Entry Fees - Competitive gameplay access  
 *      3. Research Bounty Funding - Research task commissioning
 *      4. Document Submission Fees - Document processing service
 *      5. Deep Work Mode - Focused gameplay rewards
 *      
 *      SECURITY NOTICE: This token is designed for consumptive use within
 *      the EPWORLD gaming platform. It is NOT an investment product.
 */
contract EPWORLDToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Permit, 
    Ownable, 
    ReentrancyGuard,
    Pausable 
{
    // ============================================================================
    // CONSTANTS - Consumptive Utility Configuration
    // ============================================================================
    
    /// @notice Maximum token supply (100 million) - fixed, no deflationary mechanics
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    /// @notice Oracle validation stake ranges (consumptive, not investment)
    uint256 public constant MIN_VALIDATOR_STAKE = 1_000 * 10**18;   // 1,000 EPW
    uint256 public constant MAX_VALIDATOR_STAKE = 100_000 * 10**18; // 100,000 EPW
    
    /// @notice Battle entry fee ranges (consumptive access fee)
    uint256 public constant MIN_BATTLE_FEE = 10 * 10**18;    // 10 EPW
    uint256 public constant MAX_BATTLE_FEE = 1_000 * 10**18; // 1,000 EPW
    
    /// @notice Research bounty ranges (consumptive task funding)
    uint256 public constant MIN_BOUNTY = 100 * 10**18;      // 100 EPW
    uint256 public constant MAX_BOUNTY = 50_000 * 10**18;   // 50,000 EPW
    
    /// @notice Document submission fee (consumptive processing fee)
    uint256 public constant DOCUMENT_SUBMISSION_FEE = 50 * 10**18; // 50 EPW
    
    /// @notice Deep Work Mode stake (consumptive commitment device)
    uint256 public constant DEEP_WORK_STAKE = 1_000 * 10**18; // 1,000 EPW
    
    /// @notice Platform fee percentage (2.5% - operational cost, not profit distribution)
    uint256 public constant PLATFORM_FEE = 250;
    uint256 public constant FEE_BASE = 10000;
    
    // ============================================================================
    // STATE VARIABLES - Consumptive Tracking
    // ============================================================================
    
    /// @notice Oracle validator stakes (security deposit for service, not investment)
    mapping(address => uint256) public validatorStakes;
    mapping(address => uint256) public validatorStakeTime;
    address[] public validators;
    
    /// @notice Deep Work Mode commitments (consumptive time locks)
    mapping(address => uint256) public deepWorkStake;
    mapping(address => uint256) public deepWorkStart;
    mapping(address => uint256) public deepWorkSessionsCompleted;
    
    /// @notice Research bounties (consumptive task funding)
    struct Bounty {
        address creator;
        uint256 amount;
        string criteria;
        bool active;
        address claimedBy;
        uint256 createdAt;
    }
    mapping(uint256 => Bounty) public bounties;
    uint256 public bountyCounter;
    
    /// @notice Document submissions (consumptive processing)
    struct DocumentSubmission {
        address submitter;
        bytes32 docHash;
        uint256 feePaid;
        uint256 submittedAt;
        bool validated;
    }
    mapping(uint256 => DocumentSubmission) public submissions;
    uint256 public submissionCounter;
    
    /// @notice Battle entry fees (consumptive access fees)
    mapping(uint256 => uint256) public battleEntryFees; // battleId => fee amount
    mapping(address => uint256) public playerBattleCount;
    
    /// @notice Consumptive utility tracking (transparency, not investment returns)
    uint256 public totalValidatorStaked;
    uint256 public totalDeepWorkStaked;
    uint256 public totalBountiesPosted;
    uint256 public totalDocumentFees;
    uint256 public totalBattleFees;
    
    /// @notice Authorized battle engine contracts
    mapping(address => bool) public authorizedBattlers;
    
    /// @notice Skill-based reward pool (performance-based, not yield)
    uint256 public skillRewardPool;
    
    // ============================================================================
    // EVENTS - Consumptive Actions (NOT investment returns)
    // ============================================================================
    
    /// @notice Emitted when validator stakes for document verification service
    event ValidatorStaked(address indexed validator, uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when validator unstakes (service termination)
    event ValidatorUnstaked(address indexed validator, uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when user enters battle (consumptive access)
    event BattleEntered(address indexed player, uint256 indexed battleId, uint256 fee, uint256 timestamp);
    
    /// @notice Emitted when research bounty is posted (consumptive task funding)
    event BountyPosted(uint256 indexed bountyId, address indexed creator, uint256 amount, string criteria, uint256 timestamp);
    
    /// @notice Emitted when bounty is claimed (research work completed)
    event BountyClaimed(uint256 indexed bountyId, address indexed researcher, uint256 amount, uint256 timestamp);
    
    /// @notice Emitted when document is submitted (processing service used)
    event DocumentSubmitted(uint256 indexed submissionId, address indexed submitter, bytes32 docHash, uint256 fee, uint256 timestamp);
    
    /// @notice Emitted when document is validated (service completed)
    event DocumentValidated(uint256 indexed submissionId, bool approved, uint256 timestamp);
    
    /// @notice Emitted when Deep Work Mode activated (consumptive commitment)
    event DeepWorkActivated(address indexed player, uint256 stakeAmount, uint256 timestamp);
    
    /// @notice Emitted when Deep Work session completed (skill-based reward earned)
    event DeepWorkCompleted(address indexed player, uint256 sessionDuration, uint256 reward, uint256 timestamp);
    
    /// @notice Emitted when skill-based reward distributed (NOT investment yield)
    event SkillRewardDistributed(address indexed recipient, uint256 amount, string reason, uint256 timestamp);
    
    /// @notice Emitted when battle rewards distributed (skill-based)
    event BattleRewardsDistributed(uint256 indexed battleId, address indexed winner, uint256 amount, uint256 timestamp);
    
    // ============================================================================
    // ERRORS
    // ============================================================================
    
    error InvalidAmount();
    error InsufficientBalance();
    error StakeOutOfRange();
    error NotValidator();
    error DeepWorkActive();
    error DeepWorkNotActive();
    error BountyNotActive();
    error BountyAlreadyClaimed();
    error UnauthorizedBattler();
    error MaxSupplyReached();
    error TransferFailed();
    error SessionTooShort();
    error AlreadyValidator();
    
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    
    /**
     * @notice Contract constructor
     * @param initialOwner Address of initial owner
     * @dev Initial supply minted to owner for distribution through gameplay, NOT sale
     */
    constructor(address initialOwner) 
        ERC20("EPWORLD", "EPW") 
        ERC20Permit("EPWORLD")
        Ownable(initialOwner)
    {
        // Mint initial supply to owner for ecosystem distribution
        // Tokens are distributed through gameplay rewards, NOT sold as investment
        uint256 initialSupply = MAX_SUPPLY / 2; // 50M tokens
        _mint(initialOwner, initialSupply);
    }
    
    // ============================================================================
    // MODIFIERS
    // ============================================================================
    
    modifier onlyBattler() {
        if (!authorizedBattlers[msg.sender]) revert UnauthorizedBattler();
        _;
    }
    
    modifier onlyValidator() {
        if (validatorStakes[msg.sender] < MIN_VALIDATOR_STAKE) revert NotValidator();
        _;
    }
    
    // ============================================================================
    // 1. ORACLE VALIDATION STAKING (1,000-100,000 EPW)
    // ============================================================================
    
    /**
     * @notice Stake EPW to become an Oracle validator
     * @param amount Amount to stake (1,000-100,000 EPW)
     * @dev This is a CONSUMPTIVE stake - it provides access to validation services
     *      The stake is a security deposit for honest validation, NOT an investment
     */
    function stakeForValidation(uint256 amount) external nonReentrant whenNotPaused {
        if (amount < MIN_VALIDATOR_STAKE || amount > MAX_VALIDATOR_STAKE) {
            revert StakeOutOfRange();
        }
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();
        
        // Transfer tokens to contract (security deposit for validation service)
        _transfer(msg.sender, address(this), amount);
        
        // Update validator state
        bool isNewValidator = validatorStakes[msg.sender] == 0;
        validatorStakes[msg.sender] += amount;
        validatorStakeTime[msg.sender] = block.timestamp;
        
        if (isNewValidator) {
            validators.push(msg.sender);
        }
        
        totalValidatorStaked += amount;
        
        emit ValidatorStaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @notice Unstake validation tokens (exit validation service)
     * @param amount Amount to unstake (0 for all)
     * @dev Unstaking ends validation service eligibility
     */
    function unstakeFromValidation(uint256 amount) external nonReentrant {
        uint256 currentStake = validatorStakes[msg.sender];
        if (currentStake == 0) revert NotValidator();
        
        uint256 unstakeAmount = amount == 0 ? currentStake : amount;
        if (unstakeAmount > currentStake) revert InvalidAmount();
        
        // Ensure minimum stake maintained unless fully exiting
        if (currentStake - unstakeAmount > 0 && currentStake - unstakeAmount < MIN_VALIDATOR_STAKE) {
            revert StakeOutOfRange();
        }
        
        validatorStakes[msg.sender] -= unstakeAmount;
        totalValidatorStaked -= unstakeAmount;
        
        // Return staked tokens
        _transfer(address(this), msg.sender, unstakeAmount);
        
        emit ValidatorUnstaked(msg.sender, unstakeAmount, block.timestamp);
    }
    
    /**
     * @notice Distribute skill-based validation reward (NOT investment yield)
     * @param validator Validator address
     * @param amount Reward amount based on accuracy
     * @param accuracyScore Validator's accuracy score (0-10000)
     */
    function distributeValidationReward(
        address validator, 
        uint256 amount,
        uint256 accuracyScore
    ) external onlyOwner nonReentrant {
        if (validatorStakes[validator] < MIN_VALIDATOR_STAKE) revert NotValidator();
        if (accuracyScore == 0) return; // No reward for 0% accuracy
        
        // Skill-based reward calculation
        uint256 skillAdjustedAmount = (amount * accuracyScore) / 10000;
        
        if (skillAdjustedAmount > 0 && totalSupply() + skillAdjustedAmount <= MAX_SUPPLY) {
            _mint(validator, skillAdjustedAmount);
            emit SkillRewardDistributed(validator, skillAdjustedAmount, "validation accuracy", block.timestamp);
        }
    }
    
    /**
     * @notice Slash validator for incorrect validation (consumptive risk)
     * @param validator Validator to slash
     * @param amount Amount to slash
     * @dev Slashing is a CONSUMPTIVE risk of validation service, NOT investment loss
     */
    function slashValidator(address validator, uint256 amount) external onlyOwner nonReentrant {
        if (validatorStakes[validator] == 0) revert NotValidator();
        if (amount > validatorStakes[validator]) amount = validatorStakes[validator];
        
        validatorStakes[validator] -= amount;
        totalValidatorStaked -= amount;
        
        // Slashed tokens go to skill reward pool (redistributed to accurate validators)
        skillRewardPool += amount;
        
        if (validatorStakes[validator] < MIN_VALIDATOR_STAKE) {
            // Validator removed from service
        }
    }
    
    // ============================================================================
    // 2. BATTLE ENTRY FEES (Consumptive Access)
    // ============================================================================
    
    /**
     * @notice Pay battle entry fee (consumptive access to gameplay)
     * @param battleId Battle identifier
     * @param feeAmount Entry fee amount
     * @dev This is a CONSUMPTIVE fee - it provides access to gameplay
     *      The fee funds prize pools and platform operations
     */
    function payBattleEntry(uint256 battleId, uint256 feeAmount) external nonReentrant whenNotPaused {
        if (feeAmount < MIN_BATTLE_FEE || feeAmount > MAX_BATTLE_FEE) {
            revert InvalidAmount();
        }
        if (balanceOf(msg.sender) < feeAmount) revert InsufficientBalance();
        
        // Transfer fee to contract (funds prize pool and operations)
        _transfer(msg.sender, address(this), feeAmount);
        
        battleEntryFees[battleId] += feeAmount;
        playerBattleCount[msg.sender]++;
        totalBattleFees += feeAmount;
        
        emit BattleEntered(msg.sender, battleId, feeAmount, block.timestamp);
    }
    
    /**
     * @notice Distribute battle rewards (skill-based, NOT investment returns)
     * @param battleId Battle identifier
     * @param winner Winner address
     * @param totalPrize Total prize pool
     * @dev Rewards are distributed based on SKILL (winning), not investment
     */
    function distributeBattleRewards(
        uint256 battleId,
        address winner,
        uint256 totalPrize
    ) external onlyBattler nonReentrant {
        if (winner == address(0)) revert InvalidAmount();
        
        uint256 platformAmount = (totalPrize * PLATFORM_FEE) / FEE_BASE;
        uint256 winnerAmount = totalPrize - platformAmount;
        
        // Transfer prize to winner (skill-based reward)
        _transfer(address(this), winner, winnerAmount);
        
        emit BattleRewardsDistributed(battleId, winner, winnerAmount, block.timestamp);
    }
    
    // ============================================================================
    // 3. RESEARCH BOUNTY FUNDING (Consumptive Task Commissioning)
    // ============================================================================
    
    /**
     * @notice Post a research bounty (consumptive task funding)
     * @param criteria Description of research task
     * @param amount Bounty amount (100-50,000 EPW)
     * @return bountyId Unique bounty identifier
     * @dev This is a CONSUMPTIVE service - commissioning research work
     */
    function postResearchBounty(string calldata criteria, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256) 
    {
        if (amount < MIN_BOUNTY || amount > MAX_BOUNTY) revert InvalidAmount();
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();
        
        bountyCounter++;
        uint256 bountyId = bountyCounter;
        
        // Transfer bounty amount to contract (held for researcher)
        _transfer(msg.sender, address(this), amount);
        
        bounties[bountyId] = Bounty({
            creator: msg.sender,
            amount: amount,
            criteria: criteria,
            active: true,
            claimedBy: address(0),
            createdAt: block.timestamp
        });
        
        totalBountiesPosted += amount;
        
        emit BountyPosted(bountyId, msg.sender, amount, criteria, block.timestamp);
        
        return bountyId;
    }
    
    /**
     * @notice Claim a research bounty (work completed)
     * @param bountyId Bounty identifier
     * @param researcher Address of researcher who completed work
     * @dev Only callable by owner (verifies research completion)
     */
    function claimBounty(uint256 bountyId, address researcher) external onlyOwner nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        
        if (!bounty.active) revert BountyNotActive();
        if (bounty.claimedBy != address(0)) revert BountyAlreadyClaimed();
        if (researcher == address(0)) revert InvalidAmount();
        
        bounty.active = false;
        bounty.claimedBy = researcher;
        
        // Transfer bounty to researcher (payment for work completed)
        _transfer(address(this), researcher, bounty.amount);
        
        emit BountyClaimed(bountyId, researcher, bounty.amount, block.timestamp);
    }
    
    /**
     * @notice Cancel a bounty and return funds to creator
     * @param bountyId Bounty identifier
     */
    function cancelBounty(uint256 bountyId) external nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        
        if (msg.sender != bounty.creator && msg.sender != owner()) revert UnauthorizedBattler();
        if (!bounty.active) revert BountyNotActive();
        
        bounty.active = false;
        totalBountiesPosted -= bounty.amount;
        
        // Return funds to creator
        _transfer(address(this), bounty.creator, bounty.amount);
    }
    
    // ============================================================================
    // 4. DOCUMENT SUBMISSION FEES (Consumptive Processing Service)
    // ============================================================================
    
    /**
     * @notice Submit a document for validation (processing service fee)
     * @param docHash Document hash
     * @return submissionId Unique submission identifier
     * @dev This is a CONSUMPTIVE fee - pays for document processing and validation
     */
    function submitDocument(bytes32 docHash) external nonReentrant whenNotPaused returns (uint256) {
        if (docHash == bytes32(0)) revert InvalidAmount();
        if (balanceOf(msg.sender) < DOCUMENT_SUBMISSION_FEE) revert InsufficientBalance();
        
        submissionCounter++;
        uint256 submissionId = submissionCounter;
        
        // Transfer submission fee (pays for validation network)
        _transfer(msg.sender, address(this), DOCUMENT_SUBMISSION_FEE);
        
        submissions[submissionId] = DocumentSubmission({
            submitter: msg.sender,
            docHash: docHash,
            feePaid: DOCUMENT_SUBMISSION_FEE,
            submittedAt: block.timestamp,
            validated: false
        });
        
        totalDocumentFees += DOCUMENT_SUBMISSION_FEE;
        
        emit DocumentSubmitted(submissionId, msg.sender, docHash, DOCUMENT_SUBMISSION_FEE, block.timestamp);
        
        return submissionId;
    }
    
    /**
     * @notice Mark document as validated (processing complete)
     * @param submissionId Submission identifier
     * @param approved Whether document was approved
     * @param reward Reward for submitter (skill-based, for valid documents)
     */
    function validateDocument(
        uint256 submissionId, 
        bool approved,
        uint256 reward
    ) external onlyOwner nonReentrant {
        DocumentSubmission storage submission = submissions[submissionId];
        
        if (submission.submitter == address(0)) revert InvalidAmount();
        if (submission.validated) revert InvalidAmount();
        
        submission.validated = true;
        
        // Skill-based reward for valid document submissions
        if (approved && reward > 0 && totalSupply() + reward <= MAX_SUPPLY) {
            _mint(submission.submitter, reward);
            emit SkillRewardDistributed(submission.submitter, reward, "document submission", block.timestamp);
        }
        
        emit DocumentValidated(submissionId, approved, block.timestamp);
    }
    
    // ============================================================================
    // 5. DEEP WORK MODE (Consumptive Commitment Device)
    // ============================================================================
    
    /**
     * @notice Activate Deep Work Mode (consumptive commitment device)
     * @dev This is a CONSUMPTIVE feature - tokens are locked during focused gameplay
     *      Rewards are based on TIME and PERFORMANCE, not token amount
     */
    function activateDeepWork() external nonReentrant whenNotPaused {
        if (deepWorkStart[msg.sender] != 0) revert DeepWorkActive();
        if (balanceOf(msg.sender) < DEEP_WORK_STAKE) revert InsufficientBalance();
        
        // Lock tokens during Deep Work session (commitment device, not investment)
        _transfer(msg.sender, address(this), DEEP_WORK_STAKE);
        
        deepWorkStake[msg.sender] = DEEP_WORK_STAKE;
        deepWorkStart[msg.sender] = block.timestamp;
        
        emit DeepWorkActivated(msg.sender, DEEP_WORK_STAKE, block.timestamp);
    }
    
    /**
     * @notice Complete Deep Work session and claim reward (skill-based)
     * @param sessionDuration Actual session duration in seconds
     * @param performanceScore Performance score (0-10000, skill-based)
     * @dev Rewards are based on TIME and PERFORMANCE, not token staking
     */
    function completeDeepWork(uint256 sessionDuration, uint256 performanceScore) 
        external 
        nonReentrant 
    {
        if (deepWorkStart[msg.sender] == 0) revert DeepWorkNotActive();
        if (sessionDuration < 30 minutes) revert SessionTooShort();
        if (performanceScore > 10000) revert InvalidAmount();
        
        uint256 startTime = deepWorkStart[msg.sender];
        uint256 actualDuration = block.timestamp - startTime;
        
        // Verify claimed duration is reasonable
        if (sessionDuration > actualDuration) sessionDuration = actualDuration;
        
        // Calculate skill-based reward (time × performance, NOT token amount)
        uint256 baseReward = (sessionDuration / 1 hours) * (10 * 10**18); // 10 EPW per hour
        uint256 skillAdjustedReward = (baseReward * performanceScore) / 10000;
        
        // Cap reward at reasonable amount (anti-grind)
        uint256 maxReward = 100 * 10**18; // Max 100 EPW per session
        if (skillAdjustedReward > maxReward) skillAdjustedReward = maxReward;
        
        // Return staked tokens (they were a commitment device, not an investment)
        uint256 stakeAmount = deepWorkStake[msg.sender];
        _transfer(address(this), msg.sender, stakeAmount);
        
        // Mint skill-based reward
        if (skillAdjustedReward > 0 && totalSupply() + skillAdjustedReward <= MAX_SUPPLY) {
            _mint(msg.sender, skillAdjustedReward);
        }
        
        deepWorkSessionsCompleted[msg.sender]++;
        
        // Reset Deep Work state
        deepWorkStake[msg.sender] = 0;
        deepWorkStart[msg.sender] = 0;
        
        emit DeepWorkCompleted(msg.sender, sessionDuration, skillAdjustedReward, block.timestamp);
    }
    
    /**
     * @notice Emergency exit from Deep Work (no reward)
     * @dev Allows users to exit without reward if needed
     */
    function emergencyExitDeepWork() external nonReentrant {
        if (deepWorkStart[msg.sender] == 0) revert DeepWorkNotActive();
        
        uint256 stakeAmount = deepWorkStake[msg.sender];
        _transfer(address(this), msg.sender, stakeAmount);
        
        deepWorkStake[msg.sender] = 0;
        deepWorkStart[msg.sender] = 0;
    }
    
    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================
    
    /**
     * @notice Authorize/unauthorize battle contract
     */
    function setBattlerAuthorization(address battler, bool authorized) external onlyOwner {
        authorizedBattlers[battler] = authorized;
    }
    
    /**
     * @notice Distribute skill rewards from pool (for tournaments, events)
     */
    function distributeSkillReward(address recipient, uint256 amount, string calldata reason) 
        external 
        onlyOwner 
        nonReentrant 
    {
        if (amount > skillRewardPool) amount = skillRewardPool;
        if (amount > 0) {
            skillRewardPool -= amount;
            _transfer(address(this), recipient, amount);
            emit SkillRewardDistributed(recipient, amount, reason, block.timestamp);
        }
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Withdraw accumulated platform fees (operational use only)
     */
    function withdrawPlatformFees(address to, uint256 amount) external onlyOwner {
        if (amount > balanceOf(address(this))) revert InvalidAmount();
        _transfer(address(this), to, amount);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS - Consumptive Transparency
    // ============================================================================
    
    function isValidator(address account) external view returns (bool) {
        return validatorStakes[account] >= MIN_VALIDATOR_STAKE;
    }
    
    function getValidatorStake(address account) external view returns (uint256) {
        return validatorStakes[account];
    }
    
    function isDeepWorkActive(address account) external view returns (bool) {
        return deepWorkStart[account] != 0;
    }
    
    function getDeepWorkProgress(address account) external view returns (uint256 elapsed) {
        if (deepWorkStart[account] == 0) return 0;
        return block.timestamp - deepWorkStart[account];
    }
    
    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }
    
    function getDocumentSubmission(uint256 submissionId) external view returns (DocumentSubmission memory) {
        return submissions[submissionId];
    }
    
    function getConsumptiveStats() external view returns (
        uint256 validatorsStaked,
        uint256 deepWorkStaked,
        uint256 bountiesTotal,
        uint256 documentFeesTotal,
        uint256 battleFeesTotal,
        uint256 skillPool
    ) {
        return (
            totalValidatorStaked,
            totalDeepWorkStaked,
            totalBountiesPosted,
            totalDocumentFees,
            totalBattleFees,
            skillRewardPool
        );
    }
}
