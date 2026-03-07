// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PowerCalculator.sol";

/**
 * @title ChainlinkPriceOracle
 * @notice Chainlink-compatible price oracle adapter for TWAP integration
 * @dev Implements IPriceOracle interface for PowerCalculator
 */
contract ChainlinkPriceOracle is IPriceOracle {
    
    address public immutable chainlinkFeed;
    address public owner;
    
    uint256 public manualPrice;
    bool public useManualPrice;
    
    uint8 public constant DECIMALS = 18;
    uint256 public lastPrice;
    uint256 public lastTimestamp;
    
    event PriceUpdated(uint256 price, uint256 timestamp);
    event ManualPriceSet(uint256 price);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _chainlinkFeed) {
        chainlinkFeed = _chainlinkFeed;
        owner = msg.sender;
    }
    
    /**
     * @notice Get current price from Chainlink or manual override
     * @return price Current price in 18 decimals
     * @return timestamp When price was last updated
     */
    function getPrice() external view override returns (uint256 price, uint256 timestamp) {
        if (useManualPrice) {
            return (manualPrice, block.timestamp);
        }
        
        // Read from Chainlink feed
        (, int256 answer, , uint256 updatedAt, ) = AggregatorV3Interface(chainlinkFeed).latestRoundData();
        require(answer > 0, "Invalid price");
        
        price = uint256(answer);
        
        // Convert to 18 decimals if needed
        uint8 feedDecimals = AggregatorV3Interface(chainlinkFeed).decimals();
        if (feedDecimals < 18) {
            price = price * (10 ** (18 - feedDecimals));
        } else if (feedDecimals > 18) {
            price = price / (10 ** (feedDecimals - 18));
        }
        
        return (price, updatedAt);
    }
    
    function decimals() external pure override returns (uint8) {
        return DECIMALS;
    }
    
    function setManualPrice(uint256 _price) external onlyOwner {
        manualPrice = _price;
        useManualPrice = true;
        emit ManualPriceSet(_price);
    }
    
    function clearManualPrice() external onlyOwner {
        useManualPrice = false;
        manualPrice = 0;
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }
}

/**
 * @title UniswapV3PriceOracle
 * @notice Uniswap V3 TWAP oracle adapter
 * @dev Can be used as primary or secondary price source
 */
contract UniswapV3PriceOracle is IPriceOracle {
    
    address public immutable pool;
    uint32 public constant TWAP_PERIOD = 1800; // 30 minutes
    uint8 public constant DECIMALS = 18;
    
    constructor(address _pool) {
        pool = _pool;
    }
    
    function getPrice() external view override returns (uint256 price, uint256 timestamp) {
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = TWAP_PERIOD;
        secondsAgos[1] = 0;
        
        (int56[] memory tickCumulatives, ) = IUniswapV3Pool(pool).observe(secondsAgos);
        
        int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];
        int24 arithmeticMeanTick = int24(tickCumulativesDelta / int56(uint56(TWAP_PERIOD)));
        
        // Convert tick to price
        price = _getSqrtRatioAtTick(arithmeticMeanTick);
        price = (price * price) >> 96;
        
        return (price, block.timestamp);
    }
    
    function decimals() external pure override returns (uint8) {
        return DECIMALS;
    }
    
    // From Uniswap V3 TickMath
    function _getSqrtRatioAtTick(int24 tick) internal pure returns (uint256 sqrtPriceX96) {
        // Simplified implementation - in production use actual TickMath
        uint256 absTick = tick < 0 ? uint256(-int256(tick)) : uint256(int256(tick));
        sqrtPriceX96 = 1 << 96;
        
        // Approximation for demonstration
        if (absTick > 0) {
            sqrtPriceX96 = sqrtPriceX96 * (1.0001 ** absTick);
        }
        
        if (tick < 0) {
            sqrtPriceX96 = (1 << 192) / sqrtPriceX96;
        }
        
        return sqrtPriceX96;
    }
}

// Minimal Chainlink interface
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

// Minimal Uniswap V3 interface
interface IUniswapV3Pool {
    function observe(uint32[] calldata secondsAgos) external view returns (
        int56[] memory tickCumulatives,
        uint160[] memory secondsPerLiquidityCumulativeX128s
    );
}