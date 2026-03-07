// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

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

interface IPriceOracle {
    function getPrice() external view returns (uint256 price, uint256 timestamp);
    function decimals() external view returns (uint8);
}

/**
 * @title PowerCalculator - TWAP Oracle Protected
 * @notice Power calculations with TWAP price protection (Flash Loan Resistant)
 * @dev SECURITY FEATURES:
 *      - TWAP (Time-Weighted Average Price) over 24+ blocks
 *      - Circuit breakers on >20% price deviation
 *      - Emergency pause for price anomalies
 *      - Price history tracking with ring buffer
 *      - Gas optimized TWAP calculation
 */
contract PowerCalculator is Ownable, Pausable, ReentrancyGuard {
    
    // ============ TWAP Configuration ============
    
    /// @notice Minimum number of blocks for TWAP calculation (24 blocks ≈ 5 min on Base)
    uint256 public constant MIN_TWAP_BLOCKS = 24;
    
    /// @notice Maximum number of price observations to store (ring buffer size)
    uint256 public constant PRICE_BUFFER_SIZE = 64;
    
    /// @notice Circuit breaker threshold: 20% deviation (2000 basis points)
    uint256 public constant CIRCUIT_BREAKER_THRESHOLD = 2000;
    
    /// @notice Basis points denominator (100%)
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    /// @notice Minimum observations required for valid TWAP
    uint256 public constant MIN_OBSERVATIONS = 8;
    
    /// @notice Maximum single-block price change allowed (10%)
    uint256 public constant MAX_SINGLE_BLOCK_CHANGE = 1000;
    
    // ============ Price Observation Struct ============
    
    /**
     * @notice Packed price observation for gas efficiency
     * @dev Slot 0: price (128 bits) + blockNumber (64 bits) + timestamp (64 bits)
     *      Slot 1: cumulativePrice (256 bits) - accumulated for TWAP
     */
    struct PriceObservation {
        uint128 price;          // Price scaled to 18 decimals
        uint64 blockNumber;     // Block number of observation
        uint64 timestamp;       // Unix timestamp
        uint256 cumulativePrice; // Running cumulative for TWAP (price * blocks since last)
    }
    
    // ============ State ============
    
    IFileNFTMetadata public fileNFT;
    address public characterRegistry;
    IPriceOracle public priceOracle;
    
    /// @notice Price history ring buffer
    PriceObservation[PRICE_BUFFER_SIZE] public priceHistory;
    
    /// @notice Current index in ring buffer (points to most recent)
    uint256 public currentIndex;
    
    /// @notice Total number of observations recorded
    uint256 public totalObservations;
    
    /// @notice Last recorded price for deviation checks
    uint256 public lastRecordedPrice;
    
    /// @notice Last block number when price was recorded
    uint256 public lastRecordedBlock;
    
    /// @notice Circuit breaker status
    bool public circuitBreakerActive;
    
    /// @notice Pause end timestamp for temporary emergency pause
    uint256 public emergencyPauseEndTime;
    
    /// @notice Market cap weight in power calculation (basis points, default 3000 = 30%)
    uint256 public marketCapWeight = 3000;
    
    /// @notice Fallback mode when oracle fails
    bool public fallbackMode;
    uint256 public fallbackPrice;
    
    // Packed into single slot
    struct CalcConfig {
        uint32 basePowerPerFile;
        uint16 powerPerMention;
        uint32 maxFilePower;
        uint16 maxMarketCapPower;  // Cap market cap contribution
    }
    CalcConfig public config;
    
    // Alignment bonuses (basis points)
    mapping(uint8 => uint16) public alignmentBonuses;
    
    // Tier thresholds stored in array for O(1) access
    uint256[6] public tierThresholds;
    
    // ============ Events ============
    
    event PowerCalculated(uint32 indexed charId, uint32 power, uint8 tier);
    event ConfigUpdated(uint32 basePower, uint16 powerPerMention, uint32 maxFilePower);
    event AlignmentBonusUpdated(uint8 alignment, uint16 bonus);
    event TierThresholdUpdated(uint8 tier, uint256 threshold);
    event PriceObserved(uint256 price, uint64 blockNumber, uint256 cumulativePrice);
    event TWAPCalculated(uint256 twapPrice, uint256 observations);
    event CircuitBreakerTriggered(uint256 currentPrice, uint256 twapPrice, uint256 deviation);
    event EmergencyPaused(uint256 untilBlock, string reason);
    event EmergencyUnpaused();
    event FallbackModeActivated(uint256 fallbackPrice);
    event MarketCapWeightUpdated(uint256 newWeight);
    
    // ============ Errors ============
    
    error InvalidCharacter();
    error InvalidBonus();
    error RegistryNotSet();
    error OracleNotSet();
    error CircuitBreakerActive();
    error EmergencyPauseActive();
    error PriceDeviationTooHigh(uint256 deviation);
    error InsufficientObservations(uint256 have, uint256 need);
    error SingleBlockChangeTooHigh(uint256 change);
    error InvalidPrice();
    error FallbackModeActive();
    error InvalidWeight();
    
    // ============ Modifiers ============
    
    modifier whenNotCircuitBroken() {
        if (circuitBreakerActive) revert CircuitBreakerActive();
        _;
    }
    
    modifier whenNotEmergencyPaused() {
        if (block.timestamp < emergencyPauseEndTime) revert EmergencyPauseActive();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _owner, 
        address _fileNFT,
        address _priceOracle
    ) Ownable(_owner) {
        fileNFT = IFileNFTMetadata(_fileNFT);
        priceOracle = IPriceOracle(_priceOracle);
        
        config = CalcConfig({
            basePowerPerFile: 100,
            powerPerMention: 10,
            maxFilePower: 50000,
            maxMarketCapPower: 15000
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
        
        // Initialize first observation
        _recordInitialObservation();
    }
    
    // ============ TWAP Oracle Functions ============
    
    /**
     * @notice Record initial price observation
     * @dev Called in constructor to establish baseline
     */
    function _recordInitialObservation() internal {
        (uint256 price, ) = _getSafePrice();
        
        priceHistory[0] = PriceObservation({
            price: uint128(price),
            blockNumber: uint64(block.number),
            timestamp: uint64(block.timestamp),
            cumulativePrice: 0
        });
        
        lastRecordedPrice = price;
        lastRecordedBlock = block.number;
        totalObservations = 1;
    }
    
    /**
     * @notice Record a new price observation (can be called by anyone)
     * @dev Records price with circuit breaker checks
     */
    function recordPriceObservation() external whenNotPaused nonReentrant {
        _recordObservation();
    }
    
    /**
     * @notice Internal function to record price observation
     * @dev Includes all safety checks
     */
    function _recordObservation() internal {
        (uint256 currentPrice, ) = _getSafePrice();
        
        // Validate price
        if (currentPrice == 0) revert InvalidPrice();
        
        // Check single-block change (anti-manipulation)
        if (lastRecordedPrice > 0) {
            uint256 singleBlockChange = _calculateDeviation(currentPrice, lastRecordedPrice);
            if (singleBlockChange > MAX_SINGLE_BLOCK_CHANGE) {
                _triggerCircuitBreaker(currentPrice, lastRecordedPrice, singleBlockChange);
                revert SingleBlockChangeTooHigh(singleBlockChange);
            }
        }
        
        // Get TWAP for deviation check (if enough observations)
        if (totalObservations >= MIN_OBSERVATIONS) {
            uint256 twapPrice = getTWAP(MIN_TWAP_BLOCKS);
            uint256 deviation = _calculateDeviation(currentPrice, twapPrice);
            
            if (deviation > CIRCUIT_BREAKER_THRESHOLD) {
                _triggerCircuitBreaker(currentPrice, twapPrice, deviation);
                revert PriceDeviationTooHigh(deviation);
            }
        }
        
        // Calculate cumulative price for TWAP
        uint256 blocksSinceLast = block.number - lastRecordedBlock;
        uint256 cumulativeDelta = currentPrice * blocksSinceLast;
        
        // Advance index in ring buffer
        currentIndex = (currentIndex + 1) % PRICE_BUFFER_SIZE;
        
        // Get previous cumulative or start fresh
        uint256 prevCumulative = totalObservations > 0 
            ? priceHistory[(currentIndex + PRICE_BUFFER_SIZE - 1) % PRICE_BUFFER_SIZE].cumulativePrice 
            : 0;
        
        // Store observation
        priceHistory[currentIndex] = PriceObservation({
            price: uint128(currentPrice),
            blockNumber: uint64(block.number),
            timestamp: uint64(block.timestamp),
            cumulativePrice: prevCumulative + cumulativeDelta
        });
        
        unchecked { totalObservations++; }
        
        lastRecordedPrice = currentPrice;
        lastRecordedBlock = block.number;
        
        emit PriceObserved(currentPrice, uint64(block.number), prevCumulative + cumulativeDelta);
    }
    
    /**
     * @notice Calculate TWAP (Time-Weighted Average Price) over specified block range
     * @param _blockRange Number of blocks to average over
     * @return twapPrice The time-weighted average price
     * @dev Gas optimized: O(1) with early exit, uses ring buffer
     */
    function getTWAP(uint256 _blockRange) public view returns (uint256 twapPrice) {
        if (_blockRange < MIN_TWAP_BLOCKS) revert InsufficientObservations(0, MIN_TWAP_BLOCKS);
        if (totalObservations < MIN_OBSERVATIONS) revert InsufficientObservations(totalObservations, MIN_OBSERVATIONS);
        
        uint256 targetBlock = block.number > _blockRange ? block.number - _blockRange : 0;
        
        // Find observations bounding the target block
        (uint256 recentCumulative, uint256 recentBlock) = _getLatestObservation();
        (uint256 pastCumulative, uint256 pastBlock) = _getObservationAtBlock(targetBlock);
        
        // Calculate TWAP: (cumulativeRecent - cumulativePast) / (blockRecent - blockPast)
        uint256 blockDelta = recentBlock - pastBlock;
        if (blockDelta == 0) return lastRecordedPrice; // Edge case: same block
        
        uint256 cumulativeDelta = recentCumulative - pastCumulative;
        twapPrice = cumulativeDelta / blockDelta;
        
        return twapPrice;
    }
    
    /**
     * @notice Get the most recent observation
     * @return cumulativePrice The cumulative price at current index
     * @return blockNumber The block number of current observation
     */
    function _getLatestObservation() internal view returns (uint256 cumulativePrice, uint256 blockNumber) {
        PriceObservation storage obs = priceHistory[currentIndex];
        return (obs.cumulativePrice, obs.blockNumber);
    }
    
    /**
     * @notice Get observation at or before target block using binary search
     * @param _targetBlock Block number to search for
     * @return cumulativePrice The cumulative price at found observation
     * @return blockNumber The block number of found observation
     * @dev Optimized binary search on ring buffer - O(log n)
     */
    function _getObservationAtBlock(uint256 _targetBlock) internal view returns (uint256 cumulativePrice, uint256 blockNumber) {
        uint256 observationsToSearch = totalObservations < PRICE_BUFFER_SIZE ? totalObservations : PRICE_BUFFER_SIZE;
        
        uint256 left = 0;
        uint256 right = observationsToSearch - 1;
        uint256 bestIndex = 0;
        
        // Binary search for the observation at or just before target block
        while (left <= right) {
            uint256 mid = (left + right) / 2;
            uint256 actualIndex = (currentIndex + PRICE_BUFFER_SIZE - mid) % PRICE_BUFFER_SIZE;
            uint256 midBlock = priceHistory[actualIndex].blockNumber;
            
            if (midBlock == _targetBlock) {
                bestIndex = actualIndex;
                break;
            } else if (midBlock < _targetBlock) {
                bestIndex = actualIndex;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        PriceObservation storage obs = priceHistory[bestIndex];
        return (obs.cumulativePrice, obs.blockNumber);
    }
    
    /**
     * @notice Calculate percentage deviation between two prices
     * @param _current Current price
     * @param _reference Reference price (TWAP)
     * @return deviation Basis points deviation (10000 = 100%)
     */
    function _calculateDeviation(uint256 _current, uint256 _reference) internal pure returns (uint256 deviation) {
        if (_reference == 0) return 0;
        
        uint256 diff = _current > _reference ? _current - _reference : _reference - _current;
        return (diff * BPS_DENOMINATOR) / _reference;
    }
    
    /**
     * @notice Get safe price from oracle with fallback
     * @return price The current price
     * @return timestamp When the price was recorded
     */
    function _getSafePrice() internal view returns (uint256 price, uint256 timestamp) {
        if (fallbackMode) {
            return (fallbackPrice, block.timestamp);
        }
        
        try priceOracle.getPrice() returns (uint256 oraclePrice, uint256 oracleTimestamp) {
            return (oraclePrice, oracleTimestamp);
        } catch {
            // Oracle failed, use last recorded price
            return (lastRecordedPrice, block.timestamp);
        }
    }
    
    // ============ Circuit Breaker Functions ============
    
    /**
     * @notice Trigger circuit breaker due to price anomaly
     * @param _currentPrice Current price that caused trigger
     * @param _referencePrice Reference price (TWAP or last recorded)
     * @param _deviation Deviation percentage in basis points
     */
    function _triggerCircuitBreaker(uint256 _currentPrice, uint256 _referencePrice, uint256 _deviation) internal {
        circuitBreakerActive = true;
        emit CircuitBreakerTriggered(_currentPrice, _referencePrice, _deviation);
    }
    
    /**
     * @notice Reset circuit breaker (owner only)
     * @dev Requires manual review before reset
     */
    function resetCircuitBreaker() external onlyOwner {
        circuitBreakerActive = false;
    }
    
    /**
     * @notice Emergency pause for price anomalies
     * @param _durationBlocks Duration to pause for (in blocks)
     * @param _reason Reason for emergency pause
     */
    function emergencyPause(uint256 _durationBlocks, string calldata _reason) external onlyOwner {
        emergencyPauseEndTime = block.number + _durationBlocks;
        _pause();
        emit EmergencyPaused(block.number + _durationBlocks, _reason);
    }
    
    /**
     * @notice Emergency unpause
     */
    function emergencyUnpause() external onlyOwner {
        emergencyPauseEndTime = 0;
        circuitBreakerActive = false;
        _unpause();
        emit EmergencyUnpaused();
    }
    
    /**
     * @notice Activate fallback mode with manual price
     * @param _fallbackPrice Price to use as fallback
     */
    function activateFallbackMode(uint256 _fallbackPrice) external onlyOwner {
        fallbackMode = true;
        fallbackPrice = _fallbackPrice;
        emit FallbackModeActivated(_fallbackPrice);
    }
    
    /**
     * @notice Deactivate fallback mode
     */
    function deactivateFallbackMode() external onlyOwner {
        fallbackMode = false;
        fallbackPrice = 0;
    }
    
    // ============ Core Power Calculation ============
    
    /**
     * @notice Calculate power with TWAP-protected market cap component
     * @param _charId Character ID
     * @param _fileIds Array of file IDs attached to character
     * @param _mentionCount Number of mentions
     * @param _alignment Character alignment
     * @return power Final calculated power
     * @dev Market cap component uses TWAP to prevent flash loan manipulation
     */
    function calculatePower(
        uint32 _charId,
        uint256[] calldata _fileIds,
        uint32 _mentionCount,
        uint8 _alignment
    ) external view whenNotPaused whenNotCircuitBroken whenNotEmergencyPaused returns (uint32 power) {
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
            
            // Get TWAP-protected market cap power (30% weight default)
            uint256 marketCapPower = _calcMarketCapPower();
            
            // Combine: 70% base + 30% market cap (or configured weights)
            uint256 baseWeight = BPS_DENOMINATOR - marketCapWeight;
            uint256 combinedPower = ((basePower * baseWeight) + (marketCapPower * marketCapWeight)) / BPS_DENOMINATOR;
            
            // Apply alignment multiplier
            combinedPower = (combinedPower * alignmentBonuses[_alignment]) / BPS_DENOMINATOR;
            
            // Get tier and apply bonus
            uint8 tier = getTierFromPower(combinedPower);
            combinedPower = (combinedPower * PowerMath.getTierBonus(tier)) / BPS_DENOMINATOR;
            
            // Cap at max
            uint256 maxPower = uint256(config.maxFilePower) * 10;
            if (combinedPower > maxPower) combinedPower = maxPower;
            
            return uint32(combinedPower > type(uint32).max ? type(uint32).max : combinedPower);
        }
    }
    
    /**
     * @notice Calculate market cap component using TWAP
     * @return marketCapPower Power contribution from market cap
     * @dev Uses 24-block TWAP minimum to prevent flash loan attacks
     */
    function _calcMarketCapPower() internal view returns (uint256 marketCapPower) {
        // Get TWAP price
        uint256 twapPrice = getTWAP(MIN_TWAP_BLOCKS);
        
        // Calculate market cap power from TWAP price
        // Formula: price * weight factor, capped at maxMarketCapPower
        marketCapPower = (twapPrice * marketCapWeight) / BPS_DENOMINATOR;
        
        // Apply cap
        if (marketCapPower > config.maxMarketCapPower) {
            marketCapPower = config.maxMarketCapPower;
        }
        
        return marketCapPower;
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
    
    // ============ View Functions ============
    
    /**
     * @notice Get current TWAP price
     * @return twapPrice The 24-block TWAP price
     */
    function getCurrentTWAP() external view returns (uint256 twapPrice) {
        return getTWAP(MIN_TWAP_BLOCKS);
    }
    
    /**
     * @notice Get price observation at index
     * @param _index Index in ring buffer
     * @return observation The price observation
     */
    function getPriceObservation(uint256 _index) external view returns (PriceObservation memory observation) {
        return priceHistory[_index];
    }
    
    /**
     * @notice Get latest observations
     * @param _count Number of observations to return
     * @return observations Array of recent observations
     */
    function getRecentObservations(uint256 _count) external view returns (PriceObservation[] memory observations) {
        uint256 count = _count > totalObservations ? totalObservations : _count;
        observations = new PriceObservation[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = (currentIndex + PRICE_BUFFER_SIZE - i) % PRICE_BUFFER_SIZE;
            observations[i] = priceHistory[idx];
        }
        
        return observations;
    }
    
    /**
     * @notice Check if price deviation is within acceptable range
     * @param _currentPrice Price to check
     * @return isValid Whether price is acceptable
     * @return deviation Calculated deviation
     */
    function checkPriceDeviation(uint256 _currentPrice) external view returns (bool isValid, uint256 deviation) {
        if (totalObservations < MIN_OBSERVATIONS) {
            return (true, 0);
        }
        
        uint256 twapPrice = getTWAP(MIN_TWAP_BLOCKS);
        deviation = _calculateDeviation(_currentPrice, twapPrice);
        isValid = deviation <= CIRCUIT_BREAKER_THRESHOLD;
        
        return (isValid, deviation);
    }
    
    /**
     * @notice Get oracle status summary
     * @return observations Total observations recorded
     * @return twapPrice Current TWAP price
     * @return currentPrice Current raw price
     * @return circuitActive Whether circuit breaker is active
     * @return paused Whether emergency pause is active
     * @return fallback Whether fallback mode is active
     */
    function getOracleStatus() external view returns (
        uint256 observations,
        uint256 twapPrice,
        uint256 currentPrice,
        bool circuitActive,
        bool paused,
        bool fallback
    ) {
        observations = totalObservations;
        
        if (totalObservations >= MIN_OBSERVATIONS) {
            twapPrice = getTWAP(MIN_TWAP_BLOCKS);
        }
        
        (currentPrice, ) = _getSafePrice();
        circuitActive = circuitBreakerActive;
        paused = block.timestamp < emergencyPauseEndTime || paused();
        fallback = fallbackMode;
        
        return (observations, twapPrice, currentPrice, circuitActive, paused, fallback);
    }
    
    // ============ Admin ============
    
    function setRegistry(address _registry) external onlyOwner {
        characterRegistry = _registry;
    }
    
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = IPriceOracle(_oracle);
    }
    
    function setConfig(
        uint32 _basePower,
        uint16 _powerPerMention,
        uint32 _maxFilePower
    ) external onlyOwner {
        config.basePowerPerFile = _basePower;
        config.powerPerMention = _powerPerMention;
        config.maxFilePower = _maxFilePower;
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
    
    function setMarketCapWeight(uint256 _weight) external onlyOwner {
        if (_weight > BPS_DENOMINATOR) revert InvalidWeight();
        marketCapWeight = _weight;
        emit MarketCapWeightUpdated(_weight);
    }
    
    function setMaxMarketCapPower(uint16 _maxPower) external onlyOwner {
        config.maxMarketCapPower = _maxPower;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
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