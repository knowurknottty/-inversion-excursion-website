// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/TimeToken.sol";

/**
 * @title DeployTimeToken
 * @dev Deployment script for TimeToken contract
 * 
 * Usage:
 *   forge script script/DeployTimeToken.s.sol:DeployTimeToken \\
 *     --rpc-url $RPC_URL \\
 *     --private-key $PRIVATE_KEY \\
 *     --broadcast
 * 
 * Environment variables:
 *   - TIME_TOKEN_NAME: Token name (default: "TimeToken")
 *   - TIME_TOKEN_SYMBOL: Token symbol (default: "TIME")
 *   - TIME_TOKEN_ADMIN: Admin address (defaults to deployer)
 */
contract DeployTimeToken is Script {
    function run() external returns (TimeToken) {
        // Load configuration from environment
        string memory name = vm.envOr("TIME_TOKEN_NAME", string("TimeToken"));
        string memory symbol = vm.envOr("TIME_TOKEN_SYMBOL", string("TIME"));
        address admin = vm.envOr("TIME_TOKEN_ADMIN", address(0));
        
        // If admin not set, use deployer
        if (admin == address(0)) {
            admin = vm.addr(vm.envUint("PRIVATE_KEY"));
        }
        
        console.log("Deploying TimeToken...");
        console.log("  Name:", name);
        console.log("  Symbol:", symbol);
        console.log("  Admin:", admin);
        
        vm.startBroadcast();
        
        TimeToken timeToken = new TimeToken(name, symbol, admin);
        
        vm.stopBroadcast();
        
        console.log("TimeToken deployed at:", address(timeToken));
        console.log("  Default expiration:", timeToken.DEFAULT_EXPIRATION());
        console.log("  Grace period:", timeToken.GRACE_PERIOD());
        
        return timeToken;
    }
}

/**
 * @title DeployAndConfigureTimeToken
 * @dev Deployment + initial configuration script
 * 
 * Sets up initial oracles after deployment
 */
contract DeployAndConfigureTimeToken is Script {
    function run() external returns (TimeToken) {
        string memory name = vm.envOr("TIME_TOKEN_NAME", string("TimeToken"));
        string memory symbol = vm.envOr("TIME_TOKEN_SYMBOL", string("TIME"));
        address admin = vm.envOr("TIME_TOKEN_ADMIN", address(0));
        
        if (admin == address(0)) {
            admin = vm.addr(vm.envUint("PRIVATE_KEY"));
        }
        
        // Load oracle addresses from comma-separated env var
        string memory oracleList = vm.envOr("TIME_TOKEN_ORACLES", string(""));
        address[] memory oracles = _parseAddressList(oracleList);
        
        vm.startBroadcast();
        
        TimeToken timeToken = new TimeToken(name, symbol, admin);
        
        // Grant oracle roles
        for (uint256 i = 0; i < oracles.length; i++) {
            timeToken.grantOracleRole(oracles[i]);
            console.log("Granted oracle role to:", oracles[i]);
        }
        
        vm.stopBroadcast();
        
        console.log("TimeToken deployed and configured at:", address(timeToken));
        
        return timeToken;
    }
    
    function _parseAddressList(string memory list) internal pure returns (address[] memory) {
        if (bytes(list).length == 0) {
            return new address[](0);
        }
        
        // Simple parsing - assumes single address for now
        // In production, use a more robust parser
        address single = vm.parseAddress(list);
        address[] memory result = new address[](1);
        result[0] = single;
        return result;
    }
}
