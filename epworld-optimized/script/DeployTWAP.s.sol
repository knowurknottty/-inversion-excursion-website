// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../PowerCalculator.sol";
import "../PriceOracles.sol";

/**
 * @title DeployTWAPOracle
 * @notice Deployment script for TWAP-protected PowerCalculator
 * @dev Run with: forge script DeployTWAPOracle --rpc-url $RPC_URL --broadcast
 */
contract DeployTWAPOracle is Script {
    
    // Configuration
    address public owner;
    address public fileNFT;
    
    // Base Mainnet addresses (replace for other networks)
    address public constant CHAINLINK_ETH_USD = 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70;
    address public constant CHAINLINK_BASE_USD = 0xecB9BF8FD41C4c79B2B56A866d5E73C87B6E6f81;
    
    function setUp() public {
        owner = vm.envAddress("OWNER_ADDRESS");
        fileNFT = vm.envAddress("FILE_NFT_ADDRESS");
    }
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy Price Oracle
        console.log("Deploying ChainlinkPriceOracle...");
        ChainlinkPriceOracle oracle = new ChainlinkPriceOracle(CHAINLINK_BASE_USD);
        console.log("ChainlinkPriceOracle deployed at:", address(oracle));
        
        // Step 2: Deploy PowerCalculator
        console.log("Deploying PowerCalculator...");
        PowerCalculator calculator = new PowerCalculator(
            owner,
            fileNFT,
            address(oracle)
        );
        console.log("PowerCalculator deployed at:", address(calculator));
        
        // Step 3: Transfer oracle ownership to PowerCalculator owner
        oracle.transferOwnership(owner);
        console.log("Oracle ownership transferred to:", owner);
        
        // Step 4: Initialize price history
        console.log("Initializing price history...");
        for (uint256 i = 0; i < 25; i++) {
            vm.roll(block.number + 1);
            calculator.recordPriceObservation();
        }
        console.log("Price history initialized with 25 observations");
        
        // Step 5: Verify TWAP is working
        uint256 twap = calculator.getCurrentTWAP();
        console.log("Current TWAP:", twap);
        
        vm.stopBroadcast();
        
        // Summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network: Base Mainnet");
        console.log("Owner:", owner);
        console.log("Price Oracle:", address(oracle));
        console.log("PowerCalculator:", address(calculator));
        console.log("FileNFT:", fileNFT);
        console.log("Initial TWAP:", twap);
        console.log("===========================\n");
    }
}

/**
 * @title InitializePriceHistory
 * @notice Script to initialize price observations for TWAP
 * @dev Can be run by anyone to build up observation history
 */
contract InitializePriceHistory is Script {
    function run(address calculator) public {
        vm.startBroadcast();
        
        PowerCalculator calc = PowerCalculator(calculator);
        
        uint256 currentObservations = calc.totalObservations();
        console.log("Current observations:", currentObservations);
        
        // Add observations until we have enough for TWAP
        uint256 target = 30;
        while (currentObservations < target) {
            vm.roll(block.number + 1);
            calc.recordPriceObservation();
            currentObservations++;
            
            if (currentObservations % 5 == 0) {
                console.log("Recorded observation:", currentObservations);
            }
        }
        
        // Verify TWAP works
        uint256 twap = calc.getCurrentTWAP();
        console.log("TWAP initialized:", twap);
        
        vm.stopBroadcast();
    }
}

/**
 * @title EmergencyProcedures
 * @notice Script for emergency operations
 */
contract EmergencyProcedures is Script {
    
    function pause(address calculator, uint256 duration, string memory reason) public {
        uint256 ownerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        vm.startBroadcast(ownerPrivateKey);
        
        PowerCalculator(calc).emergencyPause(duration, reason);
        
        vm.stopBroadcast();
        console.log("Emergency pause activated for", duration, "blocks");
    }
    
    function unpause(address calculator) public {
        uint256 ownerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        vm.startBroadcast(ownerPrivateKey);
        
        PowerCalculator(calc).emergencyUnpause();
        
        vm.stopBroadcast();
        console.log("Emergency pause deactivated");
    }
    
    function resetCircuitBreaker(address calculator) public {
        uint256 ownerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        vm.startBroadcast(ownerPrivateKey);
        
        PowerCalculator(calc).resetCircuitBreaker();
        
        vm.stopBroadcast();
        console.log("Circuit breaker reset");
    }
    
    function activateFallback(address calculator, uint256 fallbackPrice) public {
        uint256 ownerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        vm.startBroadcast(ownerPrivateKey);
        
        PowerCalculator(calc).activateFallbackMode(fallbackPrice);
        
        vm.stopBroadcast();
        console.log("Fallback mode activated with price:", fallbackPrice);
    }
}