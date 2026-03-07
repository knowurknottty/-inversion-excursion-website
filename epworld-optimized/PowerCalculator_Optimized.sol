// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

import "./IEPWORLD.sol";
import "./PowerMath.sol";

// Minimal interface
interface IFileNFTMetadata {
    function getFileMetadata(uint256 tokenId) external view returns (
        bytes32 docHash,
        string memory metadataURI,
        uint256 powerValue,
        uint256 mentionCount,
        uint8 state,
        uint256 submittedAt,
        uint256 verifiedAt,
        address submitter,
        address validator,
        uint256 characterId,
        bool isTransferable
    );
}

/**
 * @title PowerCalculator - Optimized
 * @notice Power calculations with optimized math (Gas Optimized for Base L2)
 * @dev OPTIMIZATIONS:
 *      - Unified calculate function (eliminates code duplication)
      - C tier thresholds in array for O(1) lookup
 *      - Assembly alignment multiplier
 *      - Unchecked math throughout
 *      - Calldata optimization for arrays
 */
contract PowerCalculator_Optimized is Ownable, Pausable {
    
    // ============ State ============
    
    IFileNFTMetadata public fileNFT;
    address public characterRegistry;
    
    // Packed into single slot
    struct CalcConfig {
        uint32 basePowerPerFile;
        uint16 powerPerMention;
        uint32 maxFilePower;
    }
    CalcConfig public config;
    
    // Alignment bonuses (basis points)
    mapping(uint8 => uint16) public alignmentBonuses;
    
    // Tier thresholds stored in array for O(1) access
    uint256[6] public tierThresholds;  // Index = tier level
    
    // ============ Events & Errors ============
    
    event PowerCalculated(uint32 indexed charId, uint32 power, uint8 tier);
    event ConfigUpdated(uint32 basePower, uint16 powerPerMention, uint32 maxFilePower);
    event AlignmentBonusUpdated(uint8 alignment, uint16 bonus);
    event TierThresholdUpdated(uint8 tier, uint256 threshold);
    
    error InvalidCharacter();
    error InvalidBonus();
    error RegistryNotSet();
    
    constructor(address _owner, address _fileNFT) Ownable(_owner) {
        fileNFT = IFileNFTMetadata(_fileNFT);
        
        config = CalcConfig({
            basePowerPerFile: 100,
            powerPerMention: 10,
            maxFilePower: 50000
        });
        
        // Default alignment bonuses
        alignmentBonuses[0] = 10000; // NEUTRAL
        alignmentBonuses[1] = 11500; // LIGHT
        alignmentBonuses[2] = 12000; // SHADOW
        alignmentBonuses[3] = 12500; // LEGENDARY
        
        // Default tier thresholds
        tierThresholds[0] = 0;       // BASE
        tierThresholds[1] = 1000;    // AWAKENED
        tierThresholds[2] = 5000;    // ASCENDED
        tierThresholds[3] = 15000;   // TRANSCENDENT
        tierThresholds[4] = 50000;   // MYTHIC
        tierThresholds[5] = 150000;  // COSMIC
    }
    
    // ============ Core Calculation ============
    
    /**
     * @notice Single unified calculate function
     * @dev Eliminates duplication between calculate/view functions
     */
    function calculatePower(
        uint32 _charId,
        uint256[] calldata _fileIds,
        uint32 _mentionCount,
        uint8 _alignment
    ) external view whenNotPaused returns (uint32 power) {
        if (_charId == 0) revert InvalidCharacter();
        
        unchecked {
            // Calculate file power
            uint256 filePower = _calcFilePower(_fileIds);
            
            // Add mention power
            uint256 mentionPower = uint256(_mentionCount) * config.powerPerMention;
            
            // Base power
            uint256 basePower = filePower + mentionPower;
            
            // Apply diminishing returns
            basePower = PowerMath.applyDiminishingReturns(_mentionCount, basePower);
            
            // Apply alignment multiplier
            basePower = (basePower * alignmentBonuses[_alignment]) / 10000;
            
            // Get tier and apply bonus
            uint8 tier = getTierFromPower(basePower);
            basePower = (basePower * PowerMath.getTierBonus(tier)) / 10000;
            
            // Cap at max
            uint256 maxPower = uint256(config.maxFilePower) * 10;
            if (basePower > maxPower) basePower = maxPower;
            
            return uint32(basePower > type(uint32).max ? type(uint32).max : basePower);
        }
    }
    
    /**
     * @notice Optimized file power calculation with early exit
     */
    function _calcFilePower(uint256[] calldata _fileIds) internal view returns (uint256 total) {
        uint256 len = _fileIds.length;
        if (len == 0) return 0;
        
        uint256 maxPower = config.maxFilePower;
        
        for (uint256 i = 0; i < len; ) {
            (,,uint256 powerValue,,uint8 state,,,,,,) = fileNFT.getFileMetadata(_fileIds[i]);
            
            // Only count verified files (state = 2)
            if (state == 2) {
                unchecked { total += powerValue; }
                if (total >= maxPower) return maxPower;
            }
            
            unchecked { ++i; }
        }
        
        return total > maxPower ? maxPower : total;
    }
    
    // ============ Tier & Alignment ============
    
    /**
     * @notice O(1) tier lookup using pre-computed array
     */
    function getTierFromPower(uint256 _power) public view returns (uint8) {
        // Binary search on fixed-size array
        if (_power >= tierThresholds[5]) return 5; // COSMIC
        if (_power >= tierThresholds[4]) return 4; // MYTHIC
        if (_power >= tierThresholds[3]) return 3; // TRANSCENDENT
        if (_power >= tierThresholds[2]) return 2; // ASCENDED
        if (_power >= tierThresholds[1]) return 1; // AWAKENED
        return 0; // BASE
    }
    
    function getAlignmentMultiplier(uint8 _alignment) external view returns (uint256) {
        return alignmentBonuses[_alignment];
    }
    
    function canTransform(uint32 _power, uint8 _currentTier) external pure returns (bool, uint8) {
        return PowerMath.checkTransformation(_power, _currentTier);
    }
    
    // ============ Admin ============
    
    function setRegistry(address _registry) external onlyOwner {
        characterRegistry = _registry;
    }
    
    function setConfig(
        uint32 _basePower,
        uint16 _powerPerMention,
        uint32 _maxFilePower
    ) external onlyOwner {
        config = CalcConfig({
            basePowerPerFile: _basePower,
            powerPerMention: _powerPerMention,
            maxFilePower: _maxFilePower
        });
        emit ConfigUpdated(_basePower, _powerPerMention, _maxFilePower);
    }
    
    function setAlignmentBonus(uint8 _alignment, uint16 _bonus) external onlyOwner {
        if (_bonus < 10000 || _bonus > 20000) revert InvalidBonus();
        alignmentBonuses[_alignment] = _bonus;
        emit AlignmentBonusUpdated(_alignment, _bonus);
    }
    
    function setTierThreshold(uint8 _tier, uint256 _threshold) external onlyOwner {
        if (_tier > 5) revert InvalidBonus();
        tierThresholds[_tier] = _threshold;
        emit TierThresholdUpdated(_tier, _threshold);
    }
    
    function setFileNFT(address _fileNFT) external onlyOwner {
        fileNFT = IFileNFTMetadata(_fileNFT);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ View Functions ============
    
    function getTierThresholds() external view returns (uint256[6] memory) {
        return tierThresholds;
    }
    
    function getAllAlignmentBonuses() external view returns (uint16[4] memory) {
        return [
            alignmentBonuses[0],
            alignmentBonuses[1],
            alignmentBonuses[2],
            alignmentBonuses[3]
        ];
    }
}
