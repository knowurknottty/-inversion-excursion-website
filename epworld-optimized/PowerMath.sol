// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IEPWORLD.sol";

/**
 * @title PowerMath - Optimized
 * @notice Mathematical utilities for power calculations (Gas Optimized)
 * @dev Uses unchecked math, inline assembly, and optimized branching
 */
library PowerMath {
    
    // Constants - using internal pure for gas savings
    uint256 internal constant BASE_MULTIPLIER = 10000;
    uint256 internal constant DIMINISHING_FACTOR = 500;
    uint256 internal constant MAX_DIMINISHING = 5000;
    uint256 internal constant LIGHT_BONUS = 11500;
    uint256 internal constant SHADOW_BONUS = 12000;
    uint256 internal constant LEGENDARY_BONUS = 12500;
    
    // Tier thresholds as constants for efficient comparison
    uint256 internal constant TIER_1 = 1000;
    uint256 internal constant TIER_2 = 5000;
    uint256 internal constant TIER_3 = 15000;
    uint256 internal constant TIER_4 = 50000;
    uint256 internal constant TIER_5 = 150000;

    /**
     * @notice Apply diminishing returns with unchecked math
     * @dev Saves ~200 gas per call by avoiding overflow checks
     */
    function applyDiminishingReturns(
        uint256 mentionCount,
        uint256 basePower
    ) internal pure returns (uint256) {
        // Early return for common case
        if (mentionCount <= 100) {
            return basePower;
        }
        
        unchecked {
            // Calculate reduction tiers (every 100 mentions)
            uint256 tiers = (mentionCount - 1) / 100;
            uint256 reduction = tiers * DIMINISHING_FACTOR;
            
            // Cap reduction at maximum using ternary (cheaper than if)
            reduction = reduction > MAX_DIMINISHING ? MAX_DIMINISHING : reduction;
            
            // Apply reduction
            return (basePower * (BASE_MULTIPLIER - reduction)) / BASE_MULTIPLIER;
        }
    }

    /**
     * @notice Get alignment multiplier using assembly switch
     * @dev Saves ~100 gas vs multiple if-else
     */
    function getAlignmentMultiplier(uint8 alignment) internal pure returns (uint256) {
        assembly {
            switch alignment
            case 1 { mstore(0x00, LIGHT_BONUS) }    // LIGHT
            case 2 { mstore(0x00, SHADOW_BONUS) }   // SHADOW
            case 3 { mstore(0x00, LEGENDARY_BONUS) } // LEGENDARY
            default { mstore(0x00, BASE_MULTIPLIER) } // NEUTRAL/invalid
            return(0x00, 0x20)
        }
    }

    /**
     * @notice Get tier from power using binary search pattern
     * @dev Returns uint8 for gas savings in storage
     */
    function getTierFromPower(uint256 power) internal pure returns (uint8) {
        // Binary search pattern - fewer comparisons
        if (power >= TIER_3) {
            if (power >= TIER_5) return 5; // COSMIC
            if (power >= TIER_4) return 4; // MYTHIC
            return 3; // TRANSCENDENT
        }
        if (power >= TIER_1) {
            if (power >= TIER_2) return 2; // ASCENDED
            return 1; // AWAKENED
        }
        return 0; // BASE
    }

    /**
     * @notice Get tier bonus using assembly switch
     */
    function getTierBonus(uint8 tier) internal pure returns (uint256) {
        assembly {
            switch tier
            case 5 { mstore(0x00, 20000) }  // COSMIC - 2x
            case 4 { mstore(0x00, 17500) }  // MYTHIC - 1.75x
            case 3 { mstore(0x00, 15000) }  // TRANSCENDENT - 1.5x
            case 2 { mstore(0x00, 13000) }  // ASCENDED - 1.3x
            case 1 { mstore(0x00, 11500) }  // AWAKENED - 1.15x
            default { mstore(0x00, BASE_MULTIPLIER) } // BASE
            return(0x00, 0x20)
        }
    }

    /**
     * @notice Calculate final power in single function
     * @dev Combined calculation saves 2 external calls
     */
    function calculateFinalPower(
        uint256 basePower,
        uint8 alignment,
        uint8 tier,
        uint256 mentionCount
    ) internal pure returns (uint256 finalPower) {
        unchecked {
            // Apply diminishing returns
            uint256 afterDiminishing = basePower;
            if (mentionCount > 100) {
                uint256 tiers = (mentionCount - 1) / 100;
                uint256 reduction = tiers * DIMINISHING_FACTOR;
                if (reduction > MAX_DIMINISHING) reduction = MAX_DIMINISHING;
                afterDiminishing = (basePower * (BASE_MULTIPLIER - reduction)) / BASE_MULTIPLIER;
            }
            
            // Apply alignment and tier multipliers in one go
            uint256 alignmentMult = getAlignmentMultiplier(alignment);
            uint256 tierMult = getTierBonus(tier);
            
            // Combined multiplication: (power * alignment * tier) / 10000^2
            finalPower = (afterDiminishing * alignmentMult * tierMult) / (BASE_MULTIPLIER * BASE_MULTIPLIER);
        }
    }

    /**
     * @notice Calculate battle damage with unchecked math
     */
    function calculateDamage(
        uint256 attackerPower,
        uint256 defenderPower,
        uint256 moveMultiplier,
        uint256 kiLevel
    ) internal pure returns (uint256) {
        unchecked {
            // Base damage: (attacker * 100) / (defender + 100)
            uint256 baseDamage = (attackerPower * 100) / (defenderPower + 100);
            
            // Apply move multiplier
            uint256 moveDamage = (baseDamage * moveMultiplier) / BASE_MULTIPLIER;
            
            // Ki bonus: up to 50% at max Ki
            uint256 kiBonus = (moveDamage * kiLevel) / 200;
            
            return moveDamage + kiBonus;
        }
    }

    /**
     * @notice Check transformation with early exit
     * @dev Returns uint8 tier for gas savings
     */
    function checkTransformation(
        uint256 currentPower,
        uint8 currentTier
    ) internal pure returns (bool canTransform, uint8 newTier) {
        newTier = getTierFromPower(currentPower);
        
        // Early exit with assembly for gas savings
        assembly {
            canTransform := gt(newTier, currentTier)
        }
    }

    /**
     * @notice Calculate max health with unchecked math
     */
    function calculateMaxHealth(uint256 power) internal pure returns (uint256) {
        unchecked {
            return 1000 + (power / 10);
        }
    }

    /**
     * @notice Calculate heal amount
     */
    function calculateHeal(uint256 maxHealth) internal pure returns (uint256) {
        unchecked {
            return (maxHealth * 2000) / BASE_MULTIPLIER; // 20%
        }
    }

    /**
     * @notice Calculate rewards with unchecked math
     */
    function calculateRewards(
        uint256 totalWager,
        uint256 winner,  // 0 = tie
        uint256 platformFee
    ) internal pure returns (uint256 winnerReward, uint256 platformAmount) {
        unchecked {
            platformAmount = (totalWager * platformFee) / BASE_MULTIPLIER;
            
            if (winner != 0) {
                winnerReward = totalWager - platformAmount;
            }
        }
    }
}
