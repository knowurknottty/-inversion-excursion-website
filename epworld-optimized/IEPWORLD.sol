// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEPWORLD - Optimized
 * @notice Shared interfaces and enums for EPWORLD game ecosystem (Gas Optimized)
 * @dev All enums and struct declarations optimized for packing
 */

// Use uint8 for all enums to save storage slots
enum Alignment {
    NEUTRAL,    // 0
    LIGHT,      // 1
    SHADOW,     // 2
    LEGENDARY   // 3
}

enum BattleState {
    PENDING,        // 0
    ACTIVE,         // 1
    RESOLVED,       // 2
    DISPUTED,       // 3
    CANCELLED       // 4
}

enum VerificationState {
    PENDING,        // 0
    VALIDATING,     // 1
    VERIFIED,       // 2
    REJECTED,       // 3
    DISPUTED        // 4
}

enum TransformationTier {
    BASE,           // 0
    AWAKENED,       // 1
    ASCENDED,       // 2
    TRANSCENDENT,   // 3
    MYTHIC,         // 4
    COSMIC          // 5
}

enum MoveType {
    ATTACK,         // 0
    DEFEND,         // 1
    SPECIAL,        // 2
    ULTIMATE,       // 3
    HEAL            // 4
}

// Packed structs - saves ~2 storage slots per CharacterData
struct CharacterData {
    uint32 characterId;         // 4 bytes (sufficient for 4B characters)
    uint32 mentionCount;        // 4 bytes
    uint32 totalPower;          // 4 bytes (sufficient for 4B power)
    uint32 attachedFiles;       // 4 bytes
    uint32 createdAt;           // 4 bytes (Unix timestamp, works until 2106)
    uint16 tier;                // 2 bytes (TransformationTier as uint16)
    uint8 alignment;            // 1 byte (Alignment as uint8)
    bool isLegendary;           // 1 byte
    string name;                // Dynamic, in separate slot
}

struct FileAttachment {
    uint32 fileId;
    uint32 characterId;
    uint32 powerValue;
    uint32 attachedAt;
    address attachedBy;         // 20 bytes - fits with above in 2 slots
}

// BattleConfig packed into single slot (saves 4 slots)
struct BattleConfig {
    uint96 entryFee;            // 12 bytes (max ~79B tokens with 18 decimals)
    uint16 maxTurns;            // 2 bytes
    uint32 turnTimeout;         // 4 bytes
    uint8 kiPerTurn;            // 1 byte
    uint16 baseDamage;          // 2 bytes
    // Total: 21 bytes in slot 0
}

struct BattleMove {
    uint8 moveType;             // MoveType as uint8
    uint32 damage;              // Reduced precision is fine for game
    uint8 kiCost;               // Max 100 Ki
    uint32 timestamp;           // Unix timestamp
    bytes32 moveHash;
}

struct OracleVote {
    address voter;
    bool approve;
    uint32 powerSuggestion;     // Reduced precision
    uint32 timestamp;           // Unix timestamp
    string reason;              // Dynamic
}

// Interfaces remain the same but use packed structs
interface ICharacterCoin {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function getPowerLevel(address holder) external view returns (uint256);
    function updatePowerLevel(address holder, uint256 newPower) external;
    function getAlignment() external view returns (uint8);  // Returns uint8
    function setAlignment(uint8 newAlignment) external;
}

interface IFileNFT {
    function mint(address to, uint256 tokenId, uint256 amount, bytes calldata data) external;
    function burn(address from, uint256 tokenId, uint256 amount) external;
    function attachToCharacter(uint256 fileId, uint256 characterId) external;
    function detachFromCharacter(uint256 fileId, uint256 characterId) external;
    function getFilePower(uint256 fileId) external view returns (uint256);
    function verifyFileHash(uint256 fileId, bytes32 hash) external view returns (bool);
}

interface IPowerCalculator {
    function calculatePower(uint256 characterId, uint256[] calldata fileIds) external view returns (uint256);
    function getTierFromPower(uint256 power) external pure returns (uint8);  // Returns uint8
    function getAlignmentMultiplier(uint8 alignment, uint256 basePower) external view returns (uint256);
    function applyDiminishingReturns(uint256 mentionCount, uint256 basePower) external pure returns (uint256);
}

interface IBattleEngine {
    function createBattle(uint256 characterId, uint256 wager) external returns (uint256 battleId);
    function joinBattle(uint256 battleId, uint256 characterId) external;
    function submitMove(uint256 battleId, BattleMove calldata move) external;
    function resolveBattle(uint256 battleId) external;
    function claimRewards(uint256 battleId) external;
}

interface IOracleValidator {
    function submitDocument(bytes32 docHash, string calldata metadataURI) external returns (uint256 submissionId);
    function castVote(uint256 submissionId, bool approve, uint256 powerSuggestion, string calldata reason) external;
    function finalizeValidation(uint256 submissionId) external;
    function disputeValidation(uint256 submissionId, string calldata reason) external;
    function getValidationState(uint256 submissionId) external view returns (uint8);
}

interface ICharacterRegistry {
    function createCharacter(string calldata name, uint256 mentionCount, uint8 alignment) external returns (uint256 characterId);
    function attachFile(uint256 characterId, uint256 fileId) external;
    function detachFile(uint256 characterId, uint256 fileId) external;
    function updateAlignment(uint256 characterId, uint8 newAlignment) external;
    function getCharacter(uint256 characterId) external view returns (CharacterData memory);
    function canTransform(uint256 characterId) external view returns (bool, uint8);
}

interface IEPWORLDToken {
    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function getStakedAmount(address account) external view returns (uint256);
    function distributeRewards(uint256 battleId, address winner, uint256 amount) external;
}

/**
 * @title IPriceOracle
 * @notice Standard interface for price oracles used in TWAP calculations
 */
interface IPriceOracle {
    /**
     * @notice Get current price
     * @return price Current price, typically in 18 decimals
     * @return timestamp When the price was last updated
     */
    function getPrice() external view returns (uint256 price, uint256 timestamp);
    
    /**
     * @notice Get number of decimals for price values
     * @return decimals Number of decimal places
     */
    function decimals() external view returns (uint8);
}
