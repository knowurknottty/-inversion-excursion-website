// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ReputationRegistry} from "../ReputationRegistry.sol";

/**
 * @title DeployReputationRegistry
 * @dev Deployment script for ReputationRegistry contract
 * 
 * Usage:
 *   forge script script/DeployReputationRegistry.s.sol:DeployReputationRegistry --rpc-url $RPC_URL --broadcast --verify
 * 
 * Environment Variables:
 *   - PRIVATE_KEY: Deployer private key
 *   - ADMIN_ADDRESS: Address to set as admin (defaults to deployer)
 *   - DEFAULT_DECAY_RATE: Default decay rate in basis points (default: 500 = 5%)
 *   - MAX_DECAY_RATE: Maximum decay rate (default: 2000 = 20%)
 *   - MIN_DECAY_RATE: Minimum decay rate (default: 0 = 0%)
 */
contract DeployReputationRegistry is Script {
    
    uint256 constant DEFAULT_DECAY_RATE = 500;  // 5% per year
    uint256 constant MAX_DECAY_RATE = 2000;     // 20% per year
    uint256 constant MIN_DECAY_RATE = 0;        // 0% per year
    
    function setUp() public {}
    
    function run() public returns (ReputationRegistry) {
        // Get configuration from environment or use defaults
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        address admin = vm.envOr("ADMIN_ADDRESS", vm.addr(deployerPrivateKey));
        uint256 defaultDecayRate = uint256(vm.envOr("DEFAULT_DECAY_RATE", bytes32(uint256(DEFAULT_DECAY_RATE))));
        uint256 maxDecayRate = uint256(vm.envOr("MAX_DECAY_RATE", bytes32(uint256(MAX_DECAY_RATE))));
        uint256 minDecayRate = uint256(vm.envOr("MIN_DECAY_RATE", bytes32(uint256(MIN_DECAY_RATE))));
        
        console.log("Deploying ReputationRegistry with:");
        console.log("  Admin:", admin);
        console.log("  Default Decay Rate:", defaultDecayRate, "basis points");
        console.log("  Max Decay Rate:", maxDecayRate, "basis points");
        console.log("  Min Decay Rate:", minDecayRate, "basis points");
        
        vm.startBroadcast(deployerPrivateKey);
        
        ReputationRegistry registry = new ReputationRegistry(
            admin,
            defaultDecayRate,
            maxDecayRate,
            minDecayRate
        );
        
        vm.stopBroadcast();
        
        console.log("ReputationRegistry deployed at:", address(registry));
        
        // Log initial configuration
        console.log("\nInitial Configuration:");
        console.log("  MAX_SCORE:", registry.MAX_SCORE());
        console.log("  REGISTRATION_BONUS:", registry.REGISTRATION_BONUS());
        console.log("  EXCHANGE_BONUS:", registry.EXCHANGE_BONUS());
        console.log("  DISPUTE_WIN_BONUS:", registry.DISPUTE_WIN_BONUS());
        console.log("  DISPUTE_LOSS_PENALTY:", registry.DISPUTE_LOSS_PENALTY());
        console.log("  ENDORSEMENT_BONUS:", registry.ENDORSEMENT_BONUS());
        
        return registry;
    }
}

/**
 * @title DeployWithMockData
 * @dev Deploy and populate with test data for development
 */
contract DeployWithMockData is Script {
    
    uint256 constant DEFAULT_DECAY_RATE = 500;
    uint256 constant MAX_DECAY_RATE = 2000;
    uint256 constant MIN_DECAY_RATE = 0;
    
    function setUp() public {}
    
    function run() public returns (ReputationRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.envOr("ADMIN_ADDRESS", vm.addr(deployerPrivateKey));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contract
        ReputationRegistry registry = new ReputationRegistry(
            admin,
            DEFAULT_DECAY_RATE,
            MAX_DECAY_RATE,
            MIN_DECAY_RATE
        );
        
        // Add some initial skills
        uint256 programming = registry.addSkill("Programming");
        uint256 design = registry.addSkill("Design");
        uint256 writing = registry.addSkill("Writing");
        uint256 consulting = registry.addSkill("Consulting");
        uint256 teaching = registry.addSkill("Teaching");
        
        console.log("Added skills:");
        console.log("  Programming:", programming);
        console.log("  Design:", design);
        console.log("  Writing:", writing);
        console.log("  Consulting:", consulting);
        console.log("  Teaching:", teaching);
        
        vm.stopBroadcast();
        
        console.log("\nReputationRegistry deployed at:", address(registry));
        
        return registry;
    }
}