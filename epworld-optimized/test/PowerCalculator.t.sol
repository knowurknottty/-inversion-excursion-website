// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PowerCalculator.sol";
import "../IEPWORLD.sol";

// Mock Price Oracle for testing
contract MockPriceOracle is IPriceOracle {
    uint256 public price = 1000 * 10**18; // $1000 with 18 decimals
    uint8 public constant DECIMALS = 18;
    
    function setPrice(uint256 _price) external {
        price = _price;
    }
    
    function getPrice() external view override returns (uint256, uint256) {
        return (price, block.timestamp);
    }
    
    function decimals() external pure override returns (uint8) {
        return DECIMALS;
    }
}

// Mock FileNFT for testing
contract MockFileNFT is IFileNFTMetadata {
    struct Metadata {
        bytes32 docHash;
        string metadataURI;
        uint256 powerValue;
        uint256 mentionCount;
        uint8 state;
        uint256 submittedAt;
        uint256 verifiedAt;
        address submitter;
        address validator;
        uint256 characterId;
        bool isTransferable;
    }
    
    mapping(uint256 => Metadata) public metadata;
    
    function setFileMetadata(
        uint256 tokenId,
        bytes32 _docHash,
        string memory _metadataURI,
        uint256 _powerValue,
        uint256 _mentionCount,
        uint8 _state,
        uint256 _submittedAt,
        uint256 _verifiedAt,
        address _submitter,
        address _validator,
        uint256 _characterId,
        bool _isTransferable
    ) external {
        metadata[tokenId] = Metadata({
            docHash: _docHash,
            metadataURI: _metadataURI,
            powerValue: _powerValue,
            mentionCount: _mentionCount,
            state: _state,
            submittedAt: _submittedAt,
            verifiedAt: _verifiedAt,
            submitter: _submitter,
            validator: _validator,
            characterId: _characterId,
            isTransferable: _isTransferable
        });
    }
    
    function getFileMetadata(uint256 tokenId) external view override returns (
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
    ) {
        Metadata storage m = metadata[tokenId];
        return (
            m.docHash,
            m.metadataURI,
            m.powerValue,
            m.mentionCount,
            m.state,
            m.submittedAt,
            m.verifiedAt,
            m.submitter,
            m.validator,
            m.characterId,
            m.isTransferable
        );
    }
}

contract PowerCalculatorTest is Test {
    PowerCalculator public calculator;
    MockPriceOracle public oracle;
    MockFileNFT public fileNFT;
    
    address public owner = address(1);
    address public user = address(2);
    address public attacker = address(3);
    
    uint256 public constant INITIAL_PRICE = 1000 * 10**18; // $1000
    uint256 public constant BLOCK_TIME = 12; // ~12 second blocks on Base
    
    event PriceObserved(uint256 price, uint64 blockNumber, uint256 cumulativePrice);
    event CircuitBreakerTriggered(uint256 currentPrice, uint256 twapPrice, uint256 deviation);
    event EmergencyPaused(uint256 untilBlock, string reason);
    event PowerCalculated(uint32 indexed charId, uint32 power, uint8 tier);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy mocks
        oracle = new MockPriceOracle();
        fileNFT = new MockFileNFT();
        
        // Deploy PowerCalculator
        calculator = new PowerCalculator(
            owner,
            address(fileNFT),
            address(oracle)
        );
        
        vm.stopPrank();
        
        // Fund test users
        vm.deal(user, 100 ether);
        vm.deal(attacker, 1000 ether);
    }
    
    // ============ TWAP Tests ============
    
    function test_InitialState() public view {
        assertEq(calculator.MIN_TWAP_BLOCKS(), 24);
        assertEq(calculator.CIRCUIT_BREAKER_THRESHOLD(), 2000); // 20%
        assertEq(calculator.PRICE_BUFFER_SIZE(), 64);
        assertEq(calculator.totalObservations(), 1);
        assertFalse(calculator.circuitBreakerActive());
    }
    
    function test_RecordPriceObservation() public {
        // Advance blocks to simulate time passing
        vm.roll(block.number + 1);
        
        vm.expectEmit(true, true, true, true);
        emit PriceObserved(INITIAL_PRICE, uint64(block.number), 0);
        
        calculator.recordPriceObservation();
        
        assertEq(calculator.totalObservations(), 2);
        assertEq(calculator.lastRecordedPrice(), INITIAL_PRICE);
        assertEq(calculator.lastRecordedBlock(), block.number);
    }
    
    function test_RecordMultipleObservations() public {
        uint256 initialBlock = block.number;
        
        // Record 30 observations (need at least 8 for TWAP)
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        assertEq(calculator.totalObservations(), 31);
        
        // Should be able to get TWAP now
        uint256 twap = calculator.getCurrentTWAP();
        assertGt(twap, 0);
    }
    
    function test_TWAPCalculation() public {
        uint256 initialBlock = block.number;
        
        // Record observations with varying prices
        uint256[] memory prices = new uint256[](30);
        for (uint256 i = 0; i < 30; i++) {
            prices[i] = INITIAL_PRICE + (i * 10**18); // Gradually increasing prices
            vm.roll(initialBlock + i + 1);
            oracle.setPrice(prices[i]);
            calculator.recordPriceObservation();
        }
        
        uint256 twap = calculator.getCurrentTWAP();
        
        // TWAP should be between min and max prices
        assertGe(twap, INITIAL_PRICE);
        assertLe(twap, prices[29]);
    }
    
    function test_RevertGetTwapInsufficientObservations() public {
        // Only 1 observation exists (constructor), need 8 minimum
        vm.expectRevert(abi.encodeWithSelector(
            PowerCalculator.InsufficientObservations.selector,
            1,
            8
        ));
        calculator.getTWAP(24);
    }
    
    function test_RevertGetTwapInsufficientBlocks() public {
        // Add enough observations
        uint256 initialBlock = block.number;
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        // Try to get TWAP with less than minimum blocks
        vm.expectRevert(abi.encodeWithSelector(
            PowerCalculator.InsufficientObservations.selector,
            0,
            24
        ));
        calculator.getTWAP(10);
    }
    
    // ============ Circuit Breaker Tests ============
    
    function test_CircuitBreakerTriggersOnLargeDeviation() public {
        uint256 initialBlock = block.number;
        
        // Record stable price observations
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        // Now simulate flash loan manipulation - 50% price spike
        uint256 manipulatedPrice = (INITIAL_PRICE * 150) / 100;
        oracle.setPrice(manipulatedPrice);
        
        vm.roll(initialBlock + 31);
        
        // Should trigger circuit breaker
        vm.expectRevert(abi.encodeWithSelector(
            PowerCalculator.PriceDeviationTooHigh.selector,
            5000 // 50% deviation
        ));
        calculator.recordPriceObservation();
        
        assertTrue(calculator.circuitBreakerActive());
    }
    
    function test_CircuitBreakerTriggersOnSingleBlockChange() public {
        uint256 initialBlock = block.number;
        
        // Record some observations
        for (uint256 i = 0; i < 10; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        // Simulate 15% single block change (above 10% threshold)
        uint256 manipulatedPrice = (INITIAL_PRICE * 115) / 100;
        oracle.setPrice(manipulatedPrice);
        
        vm.roll(initialBlock + 11);
        
        // Should trigger circuit breaker due to single block change
        vm.expectRevert(abi.encodeWithSelector(
            PowerCalculator.SingleBlockChangeTooHigh.selector,
            1500 // 15% change
        ));
        calculator.recordPriceObservation();
        
        assertTrue(calculator.circuitBreakerActive());
    }
    
    function test_ResetCircuitBreaker() public {
        // First trigger circuit breaker
        test_CircuitBreakerTriggersOnLargeDeviation();
        
        // Only owner can reset
        vm.prank(owner);
        calculator.resetCircuitBreaker();
        
        assertFalse(calculator.circuitBreakerActive());
    }
    
    function test_RevertResetCircuitBreakerNotOwner() public {
        test_CircuitBreakerTriggersOnLargeDeviation();
        
        vm.prank(user);
        vm.expectRevert();
        calculator.resetCircuitBreaker();
    }
    
    // ============ Emergency Pause Tests ============
    
    function test_EmergencyPause() public {
        uint256 pauseDuration = 100;
        
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit EmergencyPaused(block.number + pauseDuration, "Price anomaly detected");
        calculator.emergencyPause(pauseDuration, "Price anomaly detected");
        
        assertTrue(calculator.paused());
    }
    
    function test_EmergencyUnpause() public {
        vm.prank(owner);
        calculator.emergencyPause(100, "Test");
        
        vm.prank(owner);
        calculator.emergencyUnpause();
        
        assertFalse(calculator.paused());
        assertFalse(calculator.circuitBreakerActive());
    }
    
    function test_RevertEmergencyPauseNotOwner() public {
        vm.prank(user);
        vm.expectRevert();
        calculator.emergencyPause(100, "Test");
    }
    
    function test_RevertRecordDuringEmergencyPause() public {
        vm.prank(owner);
        calculator.emergencyPause(1000, "Test");
        
        vm.roll(block.number + 1);
        vm.expectRevert(PowerCalculator.EmergencyPauseActive.selector);
        calculator.recordPriceObservation();
    }
    
    // ============ Power Calculation Tests ============
    
    function test_CalculatePower() public {
        // Setup observations
        uint256 initialBlock = block.number;
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        // Setup file metadata
        fileNFT.setFileMetadata(
            1,
            bytes32(uint256(1)),
            "uri",
            500,
            0,
            2, // verified state
            block.timestamp,
            block.timestamp,
            user,
            address(0),
            1,
            true
        );
        
        uint256[] memory fileIds = new uint256[](1);
        fileIds[0] = 1;
        
        vm.roll(initialBlock + 31);
        
        uint32 power = calculator.calculatePower(1, fileIds, 10, 0);
        
        // Power should be non-zero and include market cap component
        assertGt(power, 500);
    }
    
    function test_RevertCalculatePowerDuringCircuitBreaker() public {
        // Trigger circuit breaker
        test_CircuitBreakerTriggersOnLargeDeviation();
        
        uint256[] memory fileIds = new uint256[](0);
        
        vm.expectRevert(PowerCalculator.CircuitBreakerActive.selector);
        calculator.calculatePower(1, fileIds, 10, 0);
    }
    
    function test_RevertCalculatePowerZeroCharacter() public {
        uint256[] memory fileIds = new uint256[](0);
        
        vm.expectRevert(PowerCalculator.InvalidCharacter.selector);
        calculator.calculatePower(0, fileIds, 10, 0);
    }
    
    // ============ Fallback Mode Tests ============
    
    function test_ActivateFallbackMode() public {
        uint256 fallbackPrice = 500 * 10**18;
        
        vm.prank(owner);
        calculator.activateFallbackMode(fallbackPrice);
        
        (,,,,, bool fallback) = calculator.getOracleStatus();
        assertTrue(fallback);
    }
    
    function test_DeactivateFallbackMode() public {
        vm.prank(owner);
        calculator.activateFallbackMode(500 * 10**18);
        
        vm.prank(owner);
        calculator.deactivateFallbackMode();
        
        (,,,,, bool fallback) = calculator.getOracleStatus();
        assertFalse(fallback);
    }
    
    // ============ Admin Function Tests ============
    
    function test_SetMarketCapWeight() public {
        vm.prank(owner);
        calculator.setMarketCapWeight(2000); // 20%
        
        assertEq(calculator.marketCapWeight(), 2000);
    }
    
    function test_RevertSetMarketCapWeightTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(PowerCalculator.InvalidWeight.selector);
        calculator.setMarketCapWeight(10001); // Over 100%
    }
    
    function test_SetConfig() public {
        vm.prank(owner);
        calculator.setConfig(200, 20, 100000);
        
        (uint32 basePower, uint16 powerPerMention, uint32 maxFilePower,) = calculator.config();
        
        assertEq(basePower, 200);
        assertEq(powerPerMention, 20);
        assertEq(maxFilePower, 100000);
    }
    
    function test_SetTierThreshold() public {
        vm.prank(owner);
        calculator.setTierThreshold(3, 20000);
        
        uint256[6] memory thresholds = calculator.getTierThresholds();
        assertEq(thresholds[3], 20000);
    }
    
    function test_SetAlignmentBonus() public {
        vm.prank(owner);
        calculator.setAlignmentBonus(1, 12000); // 20% bonus
        
        assertEq(calculator.alignmentBonuses(1), 12000);
    }
    
    function test_RevertSetAlignmentBonusOutOfRange() public {
        vm.prank(owner);
        vm.expectRevert(PowerCalculator.InvalidBonus.selector);
        calculator.setAlignmentBonus(1, 5000); // Below 10000
    }
    
    // ============ View Function Tests ============
    
    function test_GetRecentObservations() public {
        uint256 initialBlock = block.number;
        
        // Record observations
        for (uint256 i = 0; i < 20; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        PowerCalculator.PriceObservation[] memory obs = calculator.getRecentObservations(10);
        
        assertEq(obs.length, 10);
    }
    
    function test_CheckPriceDeviation() public {
        uint256 initialBlock = block.number;
        
        // Record observations
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        // Check with valid price
        (bool isValid, uint256 deviation) = calculator.checkPriceDeviation(INITIAL_PRICE);
        assertTrue(isValid);
        assertLt(deviation, 2000);
        
        // Check with invalid price
        uint256 badPrice = (INITIAL_PRICE * 130) / 100; // 30% higher
        (isValid, deviation) = calculator.checkPriceDeviation(badPrice);
        assertFalse(isValid);
        assertGt(deviation, 2000);
    }
    
    function test_GetOracleStatus() public {
        uint256 initialBlock = block.number;
        
        // Record observations
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        (
            uint256 observations,
            uint256 twapPrice,
            uint256 currentPrice,
            bool circuitActive,
            bool paused,
            bool fallback
        ) = calculator.getOracleStatus();
        
        assertEq(observations, 31);
        assertGt(twapPrice, 0);
        assertEq(currentPrice, INITIAL_PRICE);
        assertFalse(circuitActive);
        assertFalse(paused);
        assertFalse(fallback);
    }
    
    // ============ Gas Optimization Tests ============
    
    function test_Gas_RecordObservation() public {
        vm.roll(block.number + 1);
        
        uint256 gasStart = gasleft();
        calculator.recordPriceObservation();
        uint256 gasUsed = gasStart - gasleft();
        
        // Should be under 100k gas
        assertLt(gasUsed, 100000);
    }
    
    function test_Gas_GetTWAP() public {
        uint256 initialBlock = block.number;
        
        // Record observations
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        uint256 gasStart = gasleft();
        calculator.getCurrentTWAP();
        uint256 gasUsed = gasStart - gasleft();
        
        // TWAP calculation should be under 50k gas
        assertLt(gasUsed, 50000);
    }
    
    // ============ Flash Loan Protection Tests ============
    
    function test_FlashLoanAttackFails() public {
        uint256 initialBlock = block.number;
        
        // Establish normal price history
        for (uint256 i = 0; i < 30; i++) {
            vm.roll(initialBlock + i + 1);
            calculator.recordPriceObservation();
        }
        
        // Record current TWAP for reference
        uint256 twapBefore = calculator.getCurrentTWAP();
        
        // Setup file
        fileNFT.setFileMetadata(
            1,
            bytes32(uint256(1)),
            "uri",
            1000,
            0,
            2,
            block.timestamp,
            block.timestamp,
            user,
            address(0),
            1,
            true
        );
        
        uint256[] memory fileIds = new uint256[](1);
        fileIds[0] = 1;
        
        // Calculate power before manipulation
        vm.roll(initialBlock + 31);
        uint32 powerBefore = calculator.calculatePower(1, fileIds, 10, 0);
        
        // Attempt flash loan manipulation (simulated by large single tx price change)
        // This would normally happen in same block but we simulate with roll
        uint256 flashPrice = (INITIAL_PRICE * 200) / 100; // Double the price
        oracle.setPrice(flashPrice);
        
        vm.roll(initialBlock + 32);
        
        // Circuit breaker should prevent recording this price
        vm.expectRevert();
        calculator.recordPriceObservation();
        
        // TWAP should remain stable
        uint256 twapAfter = calculator.getCurrentTWAP();
        uint256 twapDeviation = twapAfter > twapBefore ? 
            ((twapAfter - twapBefore) * 10000) / twapBefore : 
            ((twapBefore - twapAfter) * 10000) / twapBefore;
        
        // TWAP should not have changed significantly
        assertLt(twapDeviation, 500); // Less than 5% change
        
        // Calculate power during attack attempt
        // Circuit breaker should be active, causing revert
        vm.expectRevert(PowerCalculator.CircuitBreakerActive.selector);
        calculator.calculatePower(1, fileIds, 10, 0);
        
        // Reset circuit breaker
        vm.prank(owner);
        calculator.resetCircuitBreaker();
        
        // Power calculation should return to normal
        uint32 powerAfter = calculator.calculatePower(1, fileIds, 10, 0);
        
        // Powers should be similar (within 10%)
        uint256 powerDiff = powerAfter > powerBefore ? 
            ((powerAfter - powerBefore) * 10000) / powerBefore : 
            ((powerBefore - powerAfter) * 10000) / powerBefore;
        assertLt(powerDiff, 1000);
    }
    
    // ============ Edge Case Tests ============
    
    function test_RingBufferWrapAround() public {
        uint256 initialBlock = block.number;
        
        // Fill ring buffer beyond capacity
        for (uint256 i = 0; i < 100; i++) {
            vm.roll(initialBlock + i + 1);
            oracle.setPrice(INITIAL_PRICE + i * 10**17);
            calculator.recordPriceObservation();
        }
        
        // Should still work after wrap around
        uint256 twap = calculator.getCurrentTWAP();
        assertGt(twap, 0);
        assertEq(calculator.totalObservations(), 101);
    }
    
    function test_ZeroPriceReverts() public {
        oracle.setPrice(0);
        vm.roll(block.number + 1);
        
        vm.expectRevert(PowerCalculator.InvalidPrice.selector);
        calculator.recordPriceObservation();
    }
    
    function test_TierLookup() public {
        assertEq(calculator.getTierFromPower(500), 0);   // BASE
        assertEq(calculator.getTierFromPower(1500), 1);  // AWAKENED
        assertEq(calculator.getTierFromPower(7000), 2);  // ASCENDED
        assertEq(calculator.getTierFromPower(20000), 3); // TRANSCENDENT
        assertEq(calculator.getTierFromPower(75000), 4); // MYTHIC
        assertEq(calculator.getTierFromPower(200000), 5); // COSMIC
    }
    
    function test_CanTransform() public {
        (bool canTransform, uint8 newTier) = calculator.canTransform(2000, 0);
        assertTrue(canTransform);
        assertEq(newTier, 1);
        
        (canTransform, newTier) = calculator.canTransform(500, 0);
        assertFalse(canTransform);
        assertEq(newTier, 0);
    }
}