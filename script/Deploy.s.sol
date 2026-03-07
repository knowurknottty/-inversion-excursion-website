// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "forge-std/Script.sol";

import "../contracts/ScrollCard.sol";
import "../contracts/VictoryMinter.sol";
import "../contracts/CellRegistry.sol";
import "../contracts/TradingPost.sol";
import "../contracts/GamePaymaster.sol";
import "../contracts/TheInversionExcursion.sol";

/**
 * @title DeployScript
 * @notice Deployment script for The Inversion Excursion contracts
 * @dev Uses Foundry's forge-std for scripting
 */
contract DeployScript is Script {
    // Deployment configuration
    struct DeploymentConfig {
        address deployer;
        address admin;
        address entryPoint;
        uint256 maxCellSize;
        uint256 formationCooldown;
        uint256 maxDailyGifts;
        uint256 claimPeriod;
        address feeRecipient;
    }

    // Deployed contract addresses
    struct DeployedContracts {
        address scrollCard;
        address victoryMinter;
        address cellRegistry;
        address tradingPost;
        address gamePaymaster;
        address gameContract;
        address gameContractProxy;
        address proxyAdmin;
    }

    // ============ Deployment Functions ============

    function run() external returns (DeployedContracts memory) {
        // Load configuration from environment
        DeploymentConfig memory config = _loadConfig();

        vm.startBroadcast(config.deployer);

        DeployedContracts memory deployed = _deploy(config);

        vm.stopBroadcast();

        _logDeployment(deployed);

        return deployed;
    }

    function _loadConfig() internal view returns (DeploymentConfig memory) {
        return DeploymentConfig({
            deployer: vm.envAddress("DEPLOYER_ADDRESS"),
            admin: vm.envAddress("ADMIN_ADDRESS"),
            entryPoint: vm.envOr("ENTRYPOINT_ADDRESS", address(0)),
            maxCellSize: vm.envOr("MAX_CELL_SIZE", uint256(5)),
            formationCooldown: vm.envOr("FORMATION_COOLDOWN", uint256(1 hours)),
            maxDailyGifts: vm.envOr("MAX_DAILY_GIFTS", uint256(10)),
            claimPeriod: vm.envOr("CLAIM_PERIOD", uint256(7 days)),
            feeRecipient: vm.envOr("FEE_RECIPIENT", vm.envAddress("ADMIN_ADDRESS"))
        });
    }

    function _deploy(
        DeploymentConfig memory config
    ) internal returns (DeployedContracts memory) {
        DeployedContracts memory deployed;

        // ============ Deploy ProxyAdmin ============
        console.log("Deploying ProxyAdmin...");
        ProxyAdmin proxyAdmin = new ProxyAdmin();
        proxyAdmin.transferOwnership(config.admin);
        deployed.proxyAdmin = address(proxyAdmin);
        console.log("ProxyAdmin deployed at:", deployed.proxyAdmin);

        // ============ Deploy ScrollCard ============
        console.log("Deploying ScrollCard...");
        ScrollCard scrollCard = new ScrollCard(
            "Inversion Scrolls",
            "SCROLL",
            "https://api.inversionexcursion.xyz/metadata/scroll/"
        );
        scrollCard.transferOwnership(config.admin);
        deployed.scrollCard = address(scrollCard);
        console.log("ScrollCard deployed at:", deployed.scrollCard);

        // ============ Deploy VictoryMinter ============
        console.log("Deploying VictoryMinter...");
        VictoryMinter victoryMinter = new VictoryMinter(
            "Inversion Victories",
            "VICTORY",
            "https://api.inversionexcursion.xyz/metadata/victory/"
        );
        victoryMinter.transferOwnership(config.admin);
        deployed.victoryMinter = address(victoryMinter);
        console.log("VictoryMinter deployed at:", deployed.victoryMinter);

        // ============ Deploy CellRegistry ============
        console.log("Deploying CellRegistry...");
        CellRegistry cellRegistry = new CellRegistry(
            config.admin,
            config.maxCellSize,
            config.formationCooldown
        );
        deployed.cellRegistry = address(cellRegistry);
        console.log("CellRegistry deployed at:", deployed.cellRegistry);

        // ============ Deploy TradingPost ============
        console.log("Deploying TradingPost...");
        TradingPost tradingPost = new TradingPost(
            config.admin,
            address(scrollCard),
            config.maxDailyGifts,
            config.claimPeriod,
            config.feeRecipient
        );
        deployed.tradingPost = address(tradingPost);
        console.log("TradingPost deployed at:", deployed.tradingPost);

        // ============ Deploy GamePaymaster ============
        console.log("Deploying GamePaymaster...");
        address verifyingSigner = config.admin; // Can be changed later
        GamePaymaster gamePaymaster = new GamePaymaster(
            config.entryPoint,
            verifyingSigner
        );
        deployed.gamePaymaster = address(gamePaymaster);
        console.log("GamePaymaster deployed at:", deployed.gamePaymaster);

        // ============ Deploy Game Contract (Upgradeable) ============
        console.log("Deploying TheInversionExcursion implementation...");
        TheInversionExcursion gameImpl = new TheInversionExcursion();
        deployed.gameContract = address(gameImpl);
        console.log("Implementation deployed at:", deployed.gameContract);

        // Initialize data
        bytes memory initData = abi.encodeWithSelector(
            TheInversionExcursion.initialize.selector,
            config.admin,
            0.001 ether,    // entryFee
            config.maxCellSize,
            5 minutes       // battleCooldown
        );

        // Deploy proxy
        console.log("Deploying proxy...");
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(gameImpl),
            address(proxyAdmin),
            initData
        );
        deployed.gameContractProxy = address(proxy);
        console.log("Proxy deployed at:", deployed.gameContractProxy);

        // ============ Configure Contract Relationships ============
        console.log("Configuring contract relationships...");

        // Set contracts in main game
        TheInversionExcursion game = TheInversionExcursion(deployed.gameContractProxy);
        game.setContracts(
            deployed.scrollCard,
            deployed.victoryMinter,
            deployed.cellRegistry,
            deployed.tradingPost
        );
        console.log("Game contracts configured");

        // Grant roles
        // ScrollCard: grant MINTER_ROLE to game
        scrollCard.grantRole(scrollCard.MINTER_ROLE(), deployed.gameContractProxy);
        scrollCard.grantRole(scrollCard.TRADING_POST_ROLE(), deployed.tradingPost);
        console.log("ScrollCard roles granted");

        // VictoryMinter: grant MINTER_ROLE to game
        victoryMinter.grantRole(victoryMinter.MINTER_ROLE(), deployed.gameContractProxy);
        console.log("VictoryMinter roles granted");

        // CellRegistry: grant GAME_MASTER_ROLE to game
        cellRegistry.grantRole(cellRegistry.GAME_MASTER_ROLE(), deployed.gameContractProxy);
        console.log("CellRegistry roles granted");

        // TradingPost: grant TRADING_MANAGER_ROLE to game
        tradingPost.grantRole(tradingPost.TRADING_MANAGER_ROLE(), deployed.gameContractProxy);
        console.log("TradingPost roles granted");

        // GamePaymaster: set game contract
        gamePaymaster.setGameContract(deployed.gameContractProxy);
        console.log("GamePaymaster configured");

        return deployed;
    }

    function _logDeployment(DeployedContracts memory deployed) internal pure {
        console.log("\n========== DEPLOYMENT COMPLETE ==========");
        console.log("ProxyAdmin:", deployed.proxyAdmin);
        console.log("ScrollCard:", deployed.scrollCard);
        console.log("VictoryMinter:", deployed.victoryMinter);
        console.log("CellRegistry:", deployed.cellRegistry);
        console.log("TradingPost:", deployed.tradingPost);
        console.log("GamePaymaster:", deployed.gamePaymaster);
        console.log("Game Contract (Implementation):", deployed.gameContract);
        console.log("Game Contract (Proxy):", deployed.gameContractProxy);
        console.log("========================================\n");
    }
}
