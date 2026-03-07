// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReputationRegistry
 * @dev On-chain reputation system for Timebank mutual aid platform
 * - Dynamic 0-10000 score with time-based decay
 * - Skill endorsements and ratings
 * - Tiered trust levels
 * - Non-transferable reputation tracking
 */
contract ReputationRegistry is AccessControl, ReentrancyGuard {
    
    // ============ Roles ============
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant EXCHANGE_ROLE = keccak256("EXCHANGE_ROLE");
    bytes32 public constant DISPUTE_ROLE = keccak256("DISPUTE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // ============ Constants ============
    uint256 public constant MAX_SCORE = 10000;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant REGISTRATION_BONUS = 500;      // +5% starting reputation
    uint256 public constant EXCHANGE_BONUS = 50;           // +0.5% per successful exchange
    uint256 public constant DISPUTE_LOSS_PENALTY = 1000;   // -10% for losing dispute
    uint256 public constant DISPUTE_WIN_BONUS = 100;       // +1% for winning dispute
    uint256 public constant ENDORSEMENT_BONUS = 25;        // +0.25% per endorsement
    uint256 public constant MAX_ENDORSEMENT_BONUS = 500;   // Cap at +5% from endorsements
    uint256 public constant SKILL_RATING_MULTIPLIER = 10;  // Each star = 0.1% per review
    
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Trust Tier Thresholds
    uint256 public constant TIER_1_THRESHOLD = 0;      // New user - Untrusted
    uint256 public constant TIER_2_THRESHOLD = 2500;   // Bronze - Emerging
    uint256 public constant TIER_3_THRESHOLD = 5000;   // Silver - Established
    uint256 public constant TIER_4_THRESHOLD = 7500;   // Gold - Trusted
    uint256 public constant TIER_5_THRESHOLD = 9000;   // Platinum - Elite
    
    // ============ Structs ============
    struct ReputationProfile {
        uint256 overallScore;           // 0-10000 (basis points)
        uint256 baseScore;              // Score before decay calculation
        uint256 completedExchanges;     // Successfully completed
        uint256 disputedExchanges;      // Went to dispute
        uint256 wonDisputes;            // Disputes won
        uint256 lostDisputes;           // Disputes lost
        uint256 totalHoursContributed;
        uint256 totalHoursReceived;
        uint256 lastActivityTimestamp;  // For decay calculation
        uint256 registrationTimestamp;
        uint256 decayRatePerYear;       // User-specific decay rate (basis points)
        bool isRegistered;
        string metadataURI;             // IPFS hash for extended profile
    }
    
    struct SkillRating {
        uint256 skillId;
        uint256 rating;                 // 1-5 stars scaled to 100-500
        uint256 reviewCount;
        uint256 totalRatingSum;         // Sum of all ratings for average calc
        uint256 endorsementCount;       // Number of endorsements
        mapping(address => bool) hasEndorsed;
        mapping(address => bool) hasRated;
    }
    
    struct SkillInfo {
        uint256 skillId;
        string name;
        bool exists;
    }
    
    struct EndorsementData {
        uint256 skillId;
        address endorser;
        uint256 timestamp;
    }
    
    // ============ State Variables ============
    mapping(address => ReputationProfile) public reputations;
    mapping(address => mapping(uint256 => SkillRating)) public skillRatings;
    mapping(address => mapping(uint256 => uint256)) public endorsementBonusEarned; // Track endorsement bonus per skill
    mapping(address => EndorsementData[]) public userEndorsements; // Endorsements received
    
    // Skill Registry
    mapping(uint256 => SkillInfo) public skills;
    uint256 public skillCount;
    
    // Decay Configuration
    uint256 public defaultDecayRatePerYear;  // Global default decay (basis points)
    uint256 public maxDecayRatePerYear;      // Maximum decay rate cap
    uint256 public minDecayRatePerYear;      // Minimum decay rate floor
    
    // User Endorsement Tracking (prevent duplicate endorsements)
    mapping(address => mapping(uint256 => mapping(address => bool))) public hasEndorsed;
    mapping(address => mapping(uint256 => mapping(address => bool))) public hasRated;
    
    // Reputation Stats
    uint256 public totalRegisteredUsers;
    uint256 public totalEndorsements;
    uint256 public totalReviews;
    
    // ============ Events ============
    event UserRegistered(address indexed user, uint256 timestamp, uint256 initialScore);
    event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, string reason);
    event ScoreDecayApplied(address indexed user, uint256 baseScore, uint256 decayedScore, uint256 decayAmount);
    event SkillEndorsed(address indexed user, uint256 indexed skillId, address indexed endorser, uint256 newEndorsementCount);
    event SkillRated(address indexed provider, uint256 indexed skillId, address indexed rater, uint256 rating, uint256 newAverage);
    event ExchangeCompleted(address indexed provider, address indexed receiver, uint256 hoursAmount, uint256 providerScore, uint256 receiverScore);
    event DisputeRecorded(address indexed user, bool won, uint256 newScore);
    event SkillAdded(uint256 indexed skillId, string name);
    event SkillNameUpdated(uint256 indexed skillId, string oldName, string newName);
    event DecayRateUpdated(address indexed user, uint256 oldRate, uint256 newRate);
    event GlobalDecayRateSet(uint256 oldRate, uint256 newRate);
    event MetadataUpdated(address indexed user, string newMetadataURI);
    
    // ============ Errors ============
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidScore();
    error UnauthorizedUpdater();
    error InvalidSkill();
    error SkillAlreadyExists();
    error AlreadyEndorsed();
    error AlreadyRated();
    error SelfEndorsementNotAllowed();
    error SelfRatingNotAllowed();
    error InvalidRating();
    error InvalidDecayRate();
    error ZeroAddress();
    
    // ============ Constructor ============
    constructor(
        address admin,
        uint256 _defaultDecayRatePerYear,
        uint256 _maxDecayRatePerYear,
        uint256 _minDecayRatePerYear
    ) {
        if (admin == address(0)) revert ZeroAddress();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
        
        defaultDecayRatePerYear = _defaultDecayRatePerYear;
        maxDecayRatePerYear = _maxDecayRatePerYear;
        minDecayRatePerYear = _minDecayRatePerYear;
    }
    
    // ============ Registration ============
    
    /**
     * @dev Register a new user with initial reputation score
     * @param metadataURI IPFS hash or URL for extended profile data
     */
    function registerUser(string calldata metadataURI) external {
        if (reputations[msg.sender].isRegistered) revert AlreadyRegistered();
        
        ReputationProfile storage profile = reputations[msg.sender];
        profile.isRegistered = true;
        profile.registrationTimestamp = block.timestamp;
        profile.lastActivityTimestamp = block.timestamp;
        profile.baseScore = REGISTRATION_BONUS;
        profile.overallScore = REGISTRATION_BONUS;
        profile.decayRatePerYear = defaultDecayRatePerYear;
        profile.metadataURI = metadataURI;
        
        totalRegisteredUsers++;
        
        emit UserRegistered(msg.sender, block.timestamp, REGISTRATION_BONUS);
    }
    
    /**
     * @dev Batch register users (admin only)
     */
    function batchRegister(
        address[] calldata users,
        string[] calldata metadataURIs
    ) external onlyRole(REGISTRAR_ROLE) {
        require(users.length == metadataURIs.length, "Length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (user == address(0)) continue;
            if (reputations[user].isRegistered) continue;
            
            ReputationProfile storage profile = reputations[user];
            profile.isRegistered = true;
            profile.registrationTimestamp = block.timestamp;
            profile.lastActivityTimestamp = block.timestamp;
            profile.baseScore = REGISTRATION_BONUS;
            profile.overallScore = REGISTRATION_BONUS;
            profile.decayRatePerYear = defaultDecayRatePerYear;
            profile.metadataURI = metadataURIs[i];
            
            totalRegisteredUsers++;
            
            emit UserRegistered(user, block.timestamp, REGISTRATION_BONUS);
        }
    }
    
    // ============ Reputation Updates (Authorized Contracts) ============
    
    /**
     * @dev Update reputation score by authorized exchange contract
     * @param user Address of user to update
     * @param scoreDelta Change in score (can be positive or negative)
     * @param reason Description of why score changed
     */
    function updateReputation(
        address user,
        int256 scoreDelta,
        string calldata reason
    ) external onlyRole(EXCHANGE_ROLE) {
        if (!reputations[user].isRegistered) revert NotRegistered();
        
        _applyActivityUpdate(user);
        
        ReputationProfile storage profile = reputations[user];
        uint256 oldScore = profile.overallScore;
        
        if (scoreDelta > 0) {
            profile.baseScore = _min(profile.baseScore + uint256(scoreDelta), MAX_SCORE);
        } else if (scoreDelta < 0) {
            uint256 penalty = uint256(-scoreDelta);
            profile.baseScore = profile.baseScore > penalty ? profile.baseScore - penalty : 0;
        }
        
        // Recalculate with decay
        profile.overallScore = _calculateDecayedScore(user);
        
        emit ReputationUpdated(user, oldScore, profile.overallScore, reason);
    }
    
    /**
     * @dev Record exchange completion and update both parties' reputation
     */
    function recordExchangeCompletion(
        address provider,
        address receiver,
        uint256 hoursAmount
    ) external onlyRole(EXCHANGE_ROLE) {
        if (!reputations[provider].isRegistered) revert NotRegistered();
        if (!reputations[receiver].isRegistered) revert NotRegistered();
        
        // Update provider
        _applyActivityUpdate(provider);
        ReputationProfile storage providerProfile = reputations[provider];
        uint256 providerOldScore = providerProfile.overallScore;
        providerProfile.completedExchanges++;
        providerProfile.totalHoursContributed += hoursAmount;
        providerProfile.baseScore = _min(providerProfile.baseScore + EXCHANGE_BONUS, MAX_SCORE);
        providerProfile.overallScore = _calculateDecayedScore(provider);
        
        // Update receiver (smaller bonus for receiving)
        _applyActivityUpdate(receiver);
        ReputationProfile storage receiverProfile = reputations[receiver];
        uint256 receiverOldScore = receiverProfile.overallScore;
        receiverProfile.totalHoursReceived += hoursAmount;
        uint256 receiverBonus = EXCHANGE_BONUS / 2; // Half bonus for receiver
        receiverProfile.baseScore = _min(receiverProfile.baseScore + receiverBonus, MAX_SCORE);
        receiverProfile.overallScore = _calculateDecayedScore(receiver);
        
        emit ExchangeCompleted(
            provider,
            receiver,
            hoursAmount,
            providerProfile.overallScore,
            receiverProfile.overallScore
        );
        
        emit ReputationUpdated(provider, providerOldScore, providerProfile.overallScore, "Exchange completed as provider");
        emit ReputationUpdated(receiver, receiverOldScore, receiverProfile.overallScore, "Exchange completed as receiver");
    }
    
    /**
     * @dev Record dispute outcome
     * @param user Address of user in dispute
     * @param won Whether the user won the dispute
     */
    function recordDispute(
        address user,
        bool won
    ) external onlyRole(DISPUTE_ROLE) {
        if (!reputations[user].isRegistered) revert NotRegistered();
        
        _applyActivityUpdate(user);
        
        ReputationProfile storage profile = reputations[user];
        uint256 oldScore = profile.overallScore;
        profile.disputedExchanges++;
        
        if (won) {
            profile.wonDisputes++;
            profile.baseScore = _min(profile.baseScore + DISPUTE_WIN_BONUS, MAX_SCORE);
        } else {
            profile.lostDisputes++;
            profile.baseScore = profile.baseScore > DISPUTE_LOSS_PENALTY 
                ? profile.baseScore - DISPUTE_LOSS_PENALTY 
                : 0;
        }
        
        profile.overallScore = _calculateDecayedScore(user);
        
        emit DisputeRecorded(user, won, profile.overallScore);
        emit ReputationUpdated(user, oldScore, profile.overallScore, won ? "Dispute won" : "Dispute lost");
    }
    
    // ============ Skill Management (Admin) ============
    
    /**
     * @dev Add a new skill to the registry
     * @param name Skill name
     * @return skillId The ID of the newly added skill
     */
    function addSkill(string calldata name) external onlyRole(ADMIN_ROLE) returns (uint256 skillId) {
        if (bytes(name).length == 0) revert InvalidSkill();
        
        skillId = skillCount;
        skills[skillId] = SkillInfo({
            skillId: skillId,
            name: name,
            exists: true
        });
        skillCount++;
        
        emit SkillAdded(skillId, name);
    }
    
    /**
     * @dev Update skill name
     */
    function updateSkillName(
        uint256 skillId,
        string calldata newName
    ) external onlyRole(ADMIN_ROLE) {
        if (!skills[skillId].exists) revert InvalidSkill();
        if (bytes(newName).length == 0) revert InvalidSkill();
        
        string memory oldName = skills[skillId].name;
        skills[skillId].name = newName;
        
        emit SkillNameUpdated(skillId, oldName, newName);
    }
    
    // ============ Skill Endorsements (Public) ============
    
    /**
     * @dev Endorse a user for a specific skill
     * @param user Address of user being endorsed
     * @param skillId ID of the skill being endorsed
     */
    function endorseSkill(address user, uint256 skillId) external nonReentrant {
        if (user == address(0)) revert ZeroAddress();
        if (user == msg.sender) revert SelfEndorsementNotAllowed();
        if (!reputations[user].isRegistered) revert NotRegistered();
        if (!skills[skillId].exists) revert InvalidSkill();
        if (hasEndorsed[user][skillId][msg.sender]) revert AlreadyEndorsed();
        if (!reputations[msg.sender].isRegistered) revert NotRegistered(); // Must be registered to endorse
        
        // Record endorsement
        hasEndorsed[user][skillId][msg.sender] = true;
        SkillRating storage rating = skillRatings[user][skillId];
        rating.skillId = skillId;
        rating.endorsementCount++;
        rating.hasEndorsed[msg.sender] = true;
        
        // Store endorsement data
        userEndorsements[user].push(EndorsementData({
            skillId: skillId,
            endorser: msg.sender,
            timestamp: block.timestamp
        }));
        
        totalEndorsements++;
        
        // Apply endorsement bonus to user's reputation (with cap)
        _applyActivityUpdate(user);
        ReputationProfile storage profile = reputations[user];
        uint256 currentEndorsementBonus = endorsementBonusEarned[user][skillId];
        
        if (currentEndorsementBonus < MAX_ENDORSEMENT_BONUS) {
            uint256 remainingBonus = MAX_ENDORSEMENT_BONUS - currentEndorsementBonus;
            uint256 bonusToApply = ENDORSEMENT_BONUS < remainingBonus ? ENDORSEMENT_BONUS : remainingBonus;
            
            uint256 oldScore = profile.overallScore;
            profile.baseScore = _min(profile.baseScore + bonusToApply, MAX_SCORE);
            endorsementBonusEarned[user][skillId] += bonusToApply;
            profile.overallScore = _calculateDecayedScore(user);
            
            emit ReputationUpdated(user, oldScore, profile.overallScore, "Skill endorsed");
        }
        
        emit SkillEndorsed(user, skillId, msg.sender, rating.endorsementCount);
    }
    
    /**
     * @dev Rate a provider's skill after service
     * @param provider Address of service provider
     * @param skillId ID of skill being rated
     * @param rating Rating from 1-5
     */
    function rateSkill(
        address provider,
        uint256 skillId,
        uint256 rating
    ) external {
        if (provider == address(0)) revert ZeroAddress();
        if (provider == msg.sender) revert SelfRatingNotAllowed();
        if (!reputations[provider].isRegistered) revert NotRegistered();
        if (!skills[skillId].exists) revert InvalidSkill();
        if (rating < 1 || rating > 5) revert InvalidRating();
        if (hasRated[provider][skillId][msg.sender]) revert AlreadyRated();
        if (!reputations[msg.sender].isRegistered) revert NotRegistered(); // Must be registered to rate
        
        // Record rating
        hasRated[provider][skillId][msg.sender] = true;
        SkillRating storage skillRating = skillRatings[provider][skillId];
        skillRating.skillId = skillId;
        skillRating.reviewCount++;
        skillRating.totalRatingSum += rating;
        skillRating.hasRated[msg.sender] = true;
        
        // Calculate new average (scale to 100-500 for precision)
        skillRating.rating = (skillRating.totalRatingSum * 100) / skillRating.reviewCount;
        
        totalReviews++;
        
        // Apply rating bonus (small bonus for good ratings)
        if (rating >= 4) {
            _applyActivityUpdate(provider);
            ReputationProfile storage profile = reputations[provider];
            uint256 oldScore = profile.overallScore;
            uint256 ratingBonus = (rating - 3) * SKILL_RATING_MULTIPLIER; // 1-2 * 10 = 10-20 bonus
            profile.baseScore = _min(profile.baseScore + ratingBonus, MAX_SCORE);
            profile.overallScore = _calculateDecayedScore(provider);
            
            emit ReputationUpdated(provider, oldScore, profile.overallScore, "High skill rating received");
        }
        
        emit SkillRated(provider, skillId, msg.sender, rating, skillRating.rating);
    }
    
    // ============ Decay Mechanism ============
    
    /**
     * @dev Apply decay to a user's score based on inactivity
     * Can be called by anyone to update a user's decayed score
     * @param user Address of user to apply decay to
     */
    function applyDecay(address user) external {
        if (!reputations[user].isRegistered) revert NotRegistered();
        
        uint256 oldScore = reputations[user].overallScore;
        _applyActivityUpdate(user);
        uint256 newScore = reputations[user].overallScore;
        
        if (newScore != oldScore) {
            emit ReputationUpdated(user, oldScore, newScore, "Decay applied");
        }
    }
    
    /**
     * @dev Internal function to update last activity and recalculate decayed score
     */
    function _applyActivityUpdate(address user) internal {
        ReputationProfile storage profile = reputations[user];
        uint256 oldScore = profile.overallScore;
        
        // Calculate and apply decay
        uint256 decayedScore = _calculateDecayedScore(user);
        
        // Update timestamps
        profile.lastActivityTimestamp = block.timestamp;
        profile.overallScore = decayedScore;
        profile.baseScore = decayedScore; // Reset base to decayed for next calculation
        
        if (oldScore != decayedScore) {
            uint256 decayAmount = oldScore > decayedScore ? oldScore - decayedScore : 0;
            emit ScoreDecayApplied(user, oldScore, decayedScore, decayAmount);
        }
    }
    
    /**
     * @dev Calculate current decayed score for a user
     * Formula: current_score = base_score * (1 - decay_rate)^years_inactive
     */
    function _calculateDecayedScore(address user) internal view returns (uint256) {
        ReputationProfile storage profile = reputations[user];
        
        if (profile.baseScore == 0) return 0;
        
        uint256 timeInactive = block.timestamp - profile.lastActivityTimestamp;
        if (timeInactive == 0) return profile.baseScore;
        
        uint256 decayRate = profile.decayRatePerYear;
        if (decayRate == 0) return profile.baseScore;
        
        // Calculate years as a fraction with precision
        // decay_factor = (10000 - decayRate) ^ years
        // Using compound interest formula approximation
        
        uint256 decayBasis = MAX_SCORE - decayRate; // e.g., 9500 for 5% decay
        uint256 yearsInactive = timeInactive / SECONDS_PER_YEAR;
        uint256 remainderSeconds = timeInactive % SECONDS_PER_YEAR;
        
        // Calculate compound decay for full years
        uint256 decayMultiplier = MAX_SCORE;
        for (uint256 i = 0; i < yearsInactive && i < 10; i++) { // Cap at 10 iterations
            decayMultiplier = (decayMultiplier * decayBasis) / MAX_SCORE;
        }
        
        // Apply partial year decay for remainder
        if (remainderSeconds > 0 && decayMultiplier > 0) {
            // Linear approximation for partial year: decay_rate * (remainder / seconds_per_year)
            uint256 partialDecay = (decayRate * remainderSeconds) / SECONDS_PER_YEAR;
            uint256 partialDecayBasis = MAX_SCORE - partialDecay;
            decayMultiplier = (decayMultiplier * partialDecayBasis) / MAX_SCORE;
        }
        
        uint256 decayedScore = (profile.baseScore * decayMultiplier) / MAX_SCORE;
        
        return decayedScore < MIN_SCORE ? MIN_SCORE : decayedScore;
    }
    
    /**
     * @dev Set custom decay rate for a specific user
     */
    function setUserDecayRate(
        address user,
        uint256 newRate
    ) external onlyRole(ADMIN_ROLE) {
        if (!reputations[user].isRegistered) revert NotRegistered();
        if (newRate > maxDecayRatePerYear || newRate < minDecayRatePerYear) revert InvalidDecayRate();
        
        _applyActivityUpdate(user);
        
        uint256 oldRate = reputations[user].decayRatePerYear;
        reputations[user].decayRatePerYear = newRate;
        
        emit DecayRateUpdated(user, oldRate, newRate);
    }
    
    /**
     * @dev Set global default decay rate
     */
    function setDefaultDecayRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        if (newRate > maxDecayRatePerYear || newRate < minDecayRatePerYear) revert InvalidDecayRate();
        
        uint256 oldRate = defaultDecayRatePerYear;
        defaultDecayRatePerYear = newRate;
        
        emit GlobalDecayRateSet(oldRate, newRate);
    }
    
    // ============ Trust Tier System ============
    
    /**
     * @dev Get trust tier for a user (1-5)
     * Tier 1: Untrusted (0-2499)
     * Tier 2: Emerging (2500-4999)
     * Tier 3: Established (5000-7499)
     * Tier 4: Trusted (7500-8999)
     * Tier 5: Elite (9000-10000)
     */
    function getTrustTier(address user) external view returns (uint8 tier) {
        if (!reputations[user].isRegistered) return 0;
        
        uint256 score = calculateCurrentScore(user);
        
        if (score >= TIER_5_THRESHOLD) return 5;
        if (score >= TIER_4_THRESHOLD) return 4;
        if (score >= TIER_3_THRESHOLD) return 3;
        if (score >= TIER_2_THRESHOLD) return 2;
        return 1;
    }
    
    /**
     * @dev Get tier name as string
     */
    function getTierName(uint8 tier) external pure returns (string memory) {
        if (tier == 5) return "Elite";
        if (tier == 4) return "Trusted";
        if (tier == 3) return "Established";
        if (tier == 2) return "Emerging";
        if (tier == 1) return "Untrusted";
        return "Unknown";
    }
    
    /**
     * @dev Check if user meets minimum tier requirement
     */
    function meetsTierRequirement(address user, uint8 minTier) external view returns (bool) {
        return this.getTrustTier(user) >= minTier;
    }
    
    // ============ Query Functions ============
    
    /**
     * @dev Calculate current score with decay applied
     */
    function calculateCurrentScore(address user) public view returns (uint256) {
        if (!reputations[user].isRegistered) return 0;
        return _calculateDecayedScore(user);
    }
    
    /**
     * @dev Get full reputation profile for a user
     */
    function getReputation(address user) external view returns (ReputationProfile memory) {
        return reputations[user];
    }
    
    /**
     * @dev Get skill rating for a specific user and skill
     */
    function getSkillRating(
        address user,
        uint256 skillId
    ) external view returns (
        uint256 rating,
        uint256 reviewCount,
        uint256 endorsementCount,
        uint256 averageRating
    ) {
        SkillRating storage skill = skillRatings[user][skillId];
        return (
            skill.rating,
            skill.reviewCount,
            skill.endorsementCount,
            skill.reviewCount > 0 ? skill.totalRatingSum / skill.reviewCount : 0
        );
    }
    
    /**
     * @dev Get all endorsements received by a user
     */
    function getUserEndorsements(address user) external view returns (EndorsementData[] memory) {
        return userEndorsements[user];
    }
    
    /**
     * @dev Check if user is registered
     */
    function isRegistered(address user) external view returns (bool) {
        return reputations[user].isRegistered;
    }
    
    /**
     * @dev Check if user can transact (meets minimum requirements)
     */
    function canTransact(address user) external view returns (bool) {
        if (!reputations[user].isRegistered) return false;
        
        // Check if score hasn't decayed too much
        uint256 currentScore = calculateCurrentScore(user);
        return currentScore >= 0; // Everyone can transact, but might have restrictions
    }
    
    /**
     * @dev Get user stats in a convenient format
     */
    function getUserStats(address user) external view returns (
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
    ) {
        ReputationProfile storage profile = reputations[user];
        return (
            calculateCurrentScore(user),
            profile.baseScore,
            profile.completedExchanges,
            profile.disputedExchanges,
            profile.wonDisputes,
            profile.lostDisputes,
            profile.totalHoursContributed,
            profile.totalHoursReceived,
            profile.lastActivityTimestamp,
            this.getTrustTier(user)
        );
    }
    
    /**
     * @dev Check if an address has endorsed a user for a skill
     */
    function hasEndorsedSkill(
        address user,
        uint256 skillId,
        address endorser
    ) external view returns (bool) {
        return hasEndorsed[user][skillId][endorser];
    }
    
    /**
     * @dev Check if an address has rated a provider for a skill
     */
    function hasRatedSkill(
        address provider,
        uint256 skillId,
        address rater
    ) external view returns (bool) {
        return hasRated[provider][skillId][rater];
    }
    
    /**
     * @dev Get skill info
     */
    function getSkillInfo(uint256 skillId) external view returns (SkillInfo memory) {
        return skills[skillId];
    }
    
    /**
     * @dev Get all skills (pagination recommended for large sets)
     */
    function getAllSkills(uint256 offset, uint256 limit) external view returns (SkillInfo[] memory) {
        uint256 end = offset + limit;
        if (end > skillCount) end = skillCount;
        
        SkillInfo[] memory result = new SkillInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = skills[i];
        }
        return result;
    }
    
    /**
     * @dev Get time until next decay for a user
     */
    function getTimeUntilDecay(address user) external view returns (uint256) {
        if (!reputations[user].isRegistered) return 0;
        
        uint256 timeSinceActivity = block.timestamp - reputations[user].lastActivityTimestamp;
        if (timeSinceActivity >= SECONDS_PER_YEAR) return 0;
        
        return SECONDS_PER_YEAR - timeSinceActivity;
    }
    
    /**
     * @dev Get decay amount that would be applied if decay were applied now
     */
    function getPendingDecay(address user) external view returns (uint256) {
        if (!reputations[user].isRegistered) return 0;
        
        uint256 baseScore = reputations[user].baseScore;
        uint256 decayedScore = _calculateDecayedScore(user);
        
        return baseScore > decayedScore ? baseScore - decayedScore : 0;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update user metadata URI
     */
    function updateMetadata(string calldata newMetadataURI) external {
        if (!reputations[msg.sender].isRegistered) revert NotRegistered();
        reputations[msg.sender].metadataURI = newMetadataURI;
        emit MetadataUpdated(msg.sender, newMetadataURI);
    }
    
    /**
     * @dev Admin can update metadata for any user (for moderation)
     */
    function adminUpdateMetadata(
        address user,
        string calldata newMetadataURI
    ) external onlyRole(ADMIN_ROLE) {
        if (!reputations[user].isRegistered) revert NotRegistered();
        reputations[user].metadataURI = newMetadataURI;
        emit MetadataUpdated(user, newMetadataURI);
    }
    
    // ============ Utility Functions ============
    
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}