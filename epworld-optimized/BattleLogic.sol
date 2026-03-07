// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IEPWORLD.sol";
import "./PowerMath.sol";

/**
 * @title BattleLogic - Optimized
 * @notice Core battle mechanics (Gas Optimized)
 * @dev Uses constants, unchecked math, and optimized branching
 */
library BattleLogic {
    
    // Constants packed for efficiency
    uint8 internal constant MAX_KI = 100;
    uint8 internal constant BASE_KI_GEN = 10;
    
    // Move multipliers
    uint256 internal constant ATTACK_MULT = 10000;
    uint256 internal constant SPECIAL_MULT = 15000;
    uint256 internal constant ULTIMATE_MULT = 25000;
    uint256 internal constant DEFENSE_REDUCTION = 5000;
    uint256 internal constant HEAL_PERCENT = 2000;

    /**
     * @notice Generate Ki with unchecked math
     */
    function generateKi(uint256 currentKi, uint256 powerLevel) internal pure returns (uint256) {
        unchecked {
            uint256 kiGen = BASE_KI_GEN + (powerLevel / 1000);
            uint256 newKi = currentKi + kiGen;
            return newKi > MAX_KI ? MAX_KI : newKi;
        }
    }

    /**
     * @notice Get move multiplier using assembly switch
     */
    function getMoveMultiplier(uint8 moveType) internal pure returns (uint256) {
        assembly {
            switch moveType
            case 0 { mstore(0x00, ATTACK_MULT) }      // ATTACK
            case 2 { mstore(0x00, SPECIAL_MULT) }     // SPECIAL
            case 3 { mstore(0x00, ULTIMATE_MULT) }    // ULTIMATE
            default { mstore(0x00, 0) }               // DEFEND/HEAL
            return(0x00, 0x20)
        }
    }

    /**
     * @notice Get Ki cost - optimized with assembly
     */
    function getKiCost(uint8 moveType) internal pure returns (uint256) {
        assembly {
            switch moveType
            case 2 { mstore(0x00, 30) }      // SPECIAL
            case 3 { mstore(0x00, 100) }     // ULTIMATE (MAX_KI)
            case 4 { mstore(0x00, 20) }      // HEAL
            default { mstore(0x00, 0) }      // ATTACK/DEFEND
            return(0x00, 0x20)
        }
    }

    /**
     * @notice Check if can afford move with short-circuit
     */
    function canAffordMove(uint8 moveType, uint256 currentKi) internal pure returns (bool) {
        // Early return for free moves
        if (moveType == 0 || moveType == 1) return true; // ATTACK, DEFEND
        return currentKi >= getKiCost(moveType);
    }

    /**
     * @notice Resolve move with optimized damage calculation
     */
    function resolveMove(
        BattleMove calldata move,
        uint256 attackerPower,
        uint256 defenderPower,
        bool defenderDefending
    ) internal pure returns (uint256 damage, uint256 kiConsumed) {
        uint8 moveType = move.moveType;
        kiConsumed = getKiCost(moveType);
        
        // Skip damage calc for non-damaging moves
        if (moveType == 1 || moveType == 4) { // DEFEND, HEAL
            return (0, kiConsumed);
        }
        
        unchecked {
            uint256 multiplier = getMoveMultiplier(moveType);
            damage = PowerMath.calculateDamage(attackerPower, defenderPower, multiplier, MAX_KI);
            
            // Apply defense reduction if defending
            if (defenderDefending) {
                damage = (damage * (PowerMath.BASE_MULTIPLIER - DEFENSE_REDUCTION)) / PowerMath.BASE_MULTIPLIER;
            }
        }
    }

    /**
     * @notice Determine winner with assembly-optimized comparisons
     */
    function determineWinner(
        uint256 p1Health,
        uint256 p2Health,
        uint256 p1Power,
        uint256 p2Power
    ) internal pure returns (uint8 winner) {
        assembly {
            // Check if both have health
            let bothAlive := and(gt(p1Health, 0), gt(p2Health, 0))
            
            if bothAlive {
                // Higher health wins
                if gt(p1Health, p2Health) {
                    winner := 1
                    leave
                }
                if gt(p2Health, p1Health) {
                    winner := 2
                    leave
                }
                // Tie-breaker: higher power
                if gt(p1Power, p2Power) {
                    winner := 1
                    leave
                }
                if gt(p2Power, p1Power) {
                    winner := 2
                    leave
                }
                winner := 0  // True tie
                leave
            }
            
            // Only one has health
            if gt(p1Health, 0) {
                winner := 1
                leave
            }
            if gt(p2Health, 0) {
                winner := 2
                leave
            }
            winner := 0  // Both dead
        }
    }

    /**
     * @notice Check timeout with unchecked math
     */
    function isTimedOut(uint256 lastMoveTime, uint32 timeoutSeconds) internal view returns (bool) {
        unchecked {
            return block.timestamp > lastMoveTime + timeoutSeconds;
        }
    }

    /**
     * @notice Batch check if all moves submitted
     * @dev Gas efficient for validation
     */
    function allMovesSubmitted(
        mapping(uint256 => BattleMove) storage moves,
        uint256 turn,
        uint8 expectedCount
    ) internal view returns (bool) {
        unchecked {
            for (uint8 i = 0; i < expectedCount; i++) {
                if (moves[turn + i].timestamp == 0) {
                    return false;
                }
            }
            return true;
        }
    }
}
