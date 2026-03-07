// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReputationRegistry
 * @dev Interface for the Timebank Reputation Registry
 */
interface IReputationRegistry {
    
    // ============ Structs ============
    
    struct ReputationProfile {
        uint256 overallScore;
        uint256 baseScore;
        uint256 completedExchanges;
        uint256 disputedExchanges;
        uint256 wonDisputes;
        uint256 lostDisputes;
        uint256 totalHoursContributed;
        uint256 totalHoursReceived;
        uint256 lastActivityTimestamp;
        uint256 registrationTimestamp;
        uint256 decayRatePerYear;
        bool isRegistered;
        string metadataURI;
    }
    
    struct SkillRatingView {
        uint256 skillId;
        uint256 rating;
        uint256 reviewCount;
        uint256 endorsementCount;
        uint256 averageRating;
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
    
    // ============ Core Functions ============
    
    /**
     * @dev Register a new user with initial reputation score
     * @param metadataURI IPFS hash or URL for extended profile data
     */
    function registerUser(string calldata metadataURI) external;
    
    /**
     * @dev Update reputation score by authorized exchange contract
     * @param user Address of user to update
     * @param scoreDelta Change in score (can be positive or negative)
     * @param reason Description of why score changed
     */
    function updateReputation(address user, int256 scoreDelta, string calldata reason) external;
    
    /**
     * @dev Record exchange completion and update both parties' reputation
     */
    function recordExchangeCompletion(address provider, address receiver, uint256 hoursAmount) external;
    
    /**
     * @dev Record dispute outcome
     * @param user Address of user in dispute
     * @param won Whether the user won the dispute
     */
    function recordDispute(address user, bool won) external;
    
    // ============ Skill Functions ============
    
    /**
     * @dev Add a new skill to the registry
     * @param name Skill name
     * @return skillId The ID of the newly added skill
     */
    function addSkill(string calldata name) external returns (uint256 skillId);
    
    /**
     * @dev Update skill name
     */
    function updateSkillName(uint256 skillId, string calldata newName) external;
    
    /**
     * @dev Endorse a user for a specific skill
     * @param user Address of user being endorsed
     * @param skillId ID of the skill being endorsed
     */
    function endorseSkill(address user, uint256 skillId) external;
    
    /**
     * @dev Rate a provider's skill after service
     * @param provider Address of service provider
     * @param skillId ID of skill being rated
     * @param rating Rating from 1-5
     */
    function rateSkill(address provider, uint256 skillId, uint256 rating) external;
    
    /**
     * @dev Apply decay to a user's score based on inactivity
     * @param user Address of user to apply decay to
     */
    function applyDecay(address user) external;
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set custom decay rate for a specific user
     */
    function setUserDecayRate(address user, uint256 newRate) external;
    
    /**
     * @dev Set global default decay rate
     */
    function setDefaultDecayRate(uint256 newRate) external;
    
    /**
     * @dev Update user metadata URI
     */
    function updateMetadata(string calldata newMetadataURI) external;
    
    /**
     * @dev Admin can update metadata for any user (for moderation)
     */
    function adminUpdateMetadata(address user, string calldata newMetadataURI) external;
    
    /**
     * @dev Batch register users
     */
    function batchRegister(address[] calldata users, string[] calldata metadataURIs) external;
    
    // ============ View Functions ============
    
    /**
     * @dev Calculate current score with decay applied
     */
    function calculateCurrentScore(address user) external view returns (uint256);
    
    /**
     * @dev Get full reputation profile for a user
     */
    function getReputation(address user) external view returns (ReputationProfile memory);
    
    /**
     * @dev Get skill rating for a specific user and skill
     */
    function getSkillRating(address user, uint256 skillId) external view returns (
        uint256 rating,
        uint256 reviewCount,
        uint256 endorsementCount,
        uint256 averageRating
    );
    
    /**
     * @dev Get all endorsements received by a user
     */
    function getUserEndorsements(address user) external view returns (EndorsementData[] memory);
    
    /**
     * @dev Check if user is registered
     */
    function isRegistered(address user) external view returns (bool);
    
    /**
     * @dev Check if user can transact (meets minimum requirements)
     */
    function canTransact(address user) external view returns (bool);
    
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
    );
    
    /**
     * @dev Check if an address has endorsed a user for a skill
     */
    function hasEndorsedSkill(address user, uint256 skillId, address endorser) external view returns (bool);
    
    /**
     * @dev Check if an address has rated a provider for a skill
     */
    function hasRatedSkill(address provider, uint256 skillId, address rater) external view returns (bool);
    
    /**
     * @dev Get skill info
     */
    function getSkillInfo(uint256 skillId) external view returns (SkillInfo memory);
    
    /**
     * @dev Get all skills (pagination recommended for large sets)
     */
    function getAllSkills(uint256 offset, uint256 limit) external view returns (SkillInfo[] memory);
    
    /**
     * @dev Get time until next decay for a user
     */
    function getTimeUntilDecay(address user) external view returns (uint256);
    
    /**
     * @dev Get decay amount that would be applied if decay were applied now
     */
    function getPendingDecay(address user) external view returns (uint256);
    
    /**
     * @dev Get trust tier for a user (1-5)
     */
    function getTrustTier(address user) external view returns (uint8 tier);
    
    /**
     * @dev Get tier name as string
     */
    function getTierName(uint8 tier) external pure returns (string memory);
    
    /**
     * @dev Check if user meets minimum tier requirement
     */
    function meetsTierRequirement(address user, uint8 minTier) external view returns (bool);
    
    // ============ Constants ============
    
    function MAX_SCORE() external pure returns (uint256);
    function MIN_SCORE() external pure returns (uint256);
    function REGISTRATION_BONUS() external pure returns (uint256);
    function EXCHANGE_BONUS() external pure returns (uint256);
    function DISPUTE_LOSS_PENALTY() external pure returns (uint256);
    function DISPUTE_WIN_BONUS() external pure returns (uint256);
    function ENDORSEMENT_BONUS() external pure returns (uint256);
    function MAX_ENDORSEMENT_BONUS() external pure returns (uint256);
    
    function TIER_1_THRESHOLD() external pure returns (uint256);
    function TIER_2_THRESHOLD() external pure returns (uint256);
    function TIER_3_THRESHOLD() external pure returns (uint256);
    function TIER_4_THRESHOLD() external pure returns (uint256);
    function TIER_5_THRESHOLD() external pure returns (uint256);
}