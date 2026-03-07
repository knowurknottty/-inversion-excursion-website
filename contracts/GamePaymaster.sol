// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

// ============ ERC-4337 Interfaces ============

/**
 * @notice UserOperation struct as defined in ERC-4337
 */
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

/**
 * @notice Minimal EntryPoint interface for ERC-4337
 */
interface IEntryPoint {
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external;
    function getUserOpHash(UserOperation calldata userOp) external view returns (bytes32);
}

/**
 * @notice Minimal Account interface for ERC-4337
 */
interface IAccount {
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData);
}

// ============ Game Paymaster ============

/**
 * @title GamePaymaster
 * @author Inversion Collective
 * @notice ERC-4337 Paymaster for gasless game transactions
 * @dev Sponsors gas fees for approved game operations
 * @custom:security-contact security@inversionexcursion.xyz
 */
contract GamePaymaster is AccessControl, Pausable, EIP712 {
    using ECDSA for bytes32;

    // ============ Roles ============
    bytes32 public constant PAYMASTER_ADMIN_ROLE = keccak256("PAYMASTER_ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");

    // ============ Structs ============
    
    /**
     * @notice Sponsorship tier configuration
     * @param dailyTransactions Max transactions per day
     * @param maxGasPerTransaction Max gas per sponsored tx
     * @param active Whether tier is active
     */
    struct SponsorshipTier {
        uint256 dailyTransactions;
        uint256 maxGasPerTransaction;
        bool active;
    }
    
    /**
     * @notice Player sponsorship data
     * @param tierId Current tier
     * @param dailyTxCount Today's transaction count
     * @param lastReset Last daily reset timestamp
     * @param totalSponsored Total transactions sponsored
     * @param whitelisted Whether player has special access
     */
    struct PlayerSponsorship {
        uint8 tierId;
        uint256 dailyTxCount;
        uint256 lastReset;
        uint256 totalSponsored;
        bool whitelisted;
    }
    
    /**
     * @notice Sponsored transaction record
     * @param player Player address
     * @param userOpHash Hash of the user operation
     * @param gasUsed Gas consumed
     * @param timestamp When sponsored
     * @param operationType Type of game operation
     */
    struct SponsoredTx {
        address player;
        bytes32 userOpHash;
        uint256 gasUsed;
        uint256 timestamp;
        uint8 operationType;
    }

    // ============ State Variables ============
    
    /// @notice EntryPoint contract address
    IEntryPoint public immutable entryPoint;
    
    /// @notice Game contract address (TheInversionExcursion)
    address public gameContract;
    
    /// @notice Verifying signer address
    address public verifyingSigner;
    
    /// @notice Mapping from tier ID to configuration
    mapping(uint8 => SponsorshipTier) public sponsorshipTiers;
    
    /// @notice Mapping from player to sponsorship data
    mapping(address => PlayerSponsorship) public playerSponsorships;
    
    /// @notice Mapping from userOpHash to sponsored transaction
    mapping(bytes32 => SponsoredTx) public sponsoredTransactions;
    
    /// @notice Mapping from operation type to whether it's sponsored
    mapping(uint8 => bool) public sponsoredOperations;
    
    /// @notice Array of sponsored operation types
    uint8[] public operationTypes;
    
    /// @notice Total gas sponsored (in wei)
    uint256 public totalGasSponsored;
    
    /// @notice Total transactions sponsored
    uint256 public totalTransactionsSponsored;
    
    /// @notice Deposit balance for EntryPoint
    uint256 public depositBalance;
    
    /// @notice EIP-712 typehash for sponsorship
    bytes32 public constant SPONSORSHIP_TYPEHASH = 
        keccak256("Sponsorship(address player,uint8 operationType,uint256 nonce,uint256 deadline)");
    
    /// @notice Operation type constants
    uint8 public constant OP_ENTER_DUNGEON = 1;
    uint8 public constant OP_FORM_CELL = 2;
    uint8 public constant OP_JOIN_CELL = 3;
    uint8 public constant OP_BATTLE_COMPLETE = 4;
    uint8 public constant OP_SEND_GIFT = 5;
    uint8 public constant OP_CLAIM_GIFT = 6;

    // ============ Events ============
    
    /**
     * @notice Emitted when a user operation is sponsored
     * @param userOpHash Hash of the user operation
     * @param player Player address
     * @param gasUsed Gas consumed
     * @param operationType Type of operation
     */
    event UserOperationSponsored(
        bytes32 indexed userOpHash,
        address indexed player,
        uint256 gasUsed,
        uint8 operationType
    );
    
    /**
     * @notice Emitted when a player is whitelisted
     * @param player Player address
     * @param tierId Assigned tier
     */
    event PlayerWhitelisted(address indexed player, uint8 tierId);
    
    /**
     * @notice Emitted when a player is removed from whitelist
     * @param player Player address
     */
    event PlayerRemoved(address indexed player);
    
    /**
     * @notice Emitted when sponsorship tier is updated
     * @param tierId Tier ID
     * @param dailyTransactions Max daily transactions
     * @param maxGasPerTransaction Max gas per tx
     */
    event TierUpdated(
        uint8 indexed tierId,
        uint256 dailyTransactions,
        uint256 maxGasPerTransaction
    );
    
    /**
     * @notice Emitted when deposit is added
     * @param sender Address that deposited
     * @param amount Amount deposited
     */
    event DepositAdded(address indexed sender, uint256 amount);
    
    /**
     * @notice Emitted when deposit is withdrawn
     * @param recipient Address that received withdrawal
     * @param amount Amount withdrawn
     */
    event DepositWithdrawn(address indexed recipient, uint256 amount);
    
    /**
     * @notice Emitted when verifying signer is updated
     * @param previousSigner Previous signer
     * @param newSigner New signer
     */
    event VerifyingSignerUpdated(
        address indexed previousSigner,
        address indexed newSigner
    );

    // ============ Errors ============
    error InvalidEntryPoint();
    error InvalidGameContract();
    error InvalidSigner();
    error InvalidTier();
    error TierNotActive(uint8 tierId);
    error OperationNotSponsored(uint8 operationType);
    error DailyLimitReached(address player, uint256 limit);
    error GasLimitExceeded(uint256 requested, uint256 max);
    error InvalidSignature();
    error SponsorshipExpired();
    error InsufficientDeposit(uint256 required, uint256 available);
    error NotEntryPoint();
    error InvalidAddress();
    error WithdrawFailed();

    // ============ Modifiers ============
    modifier onlyEntryPoint() {
        if (msg.sender != address(entryPoint)) {
            revert NotEntryPoint();
        }
        _;
    }

    // ============ Constructor ============
    
    /**
     * @notice Initialize GamePaymaster
     * @param _entryPoint EntryPoint contract address
     * @param _verifyingSigner Initial verifying signer
     */
    constructor(
        address _entryPoint,
        address _verifyingSigner
    ) EIP712("GamePaymaster", "1") {
        if (_entryPoint == address(0)) revert InvalidEntryPoint();
        if (_verifyingSigner == address(0)) revert InvalidSigner();
        
        entryPoint = IEntryPoint(_entryPoint);
        verifyingSigner = _verifyingSigner;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAYMASTER_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(SPONSOR_ROLE, msg.sender);
        
        // Initialize default tiers
        _initializeTiers();
        
        // Initialize sponsored operations
        _initializeOperations();
    }

    // ============ ERC-4337 Paymaster Functions ============
    
    /**
     * @notice Validate a user operation and determine if paymaster will sponsor
     * @param userOp The user operation
     * @param userOpHash Hash of the user operation
     * @param maxCost Maximum cost of the operation
     * @return context Context to pass to postOp
     * @return validationData Validation data (0 = valid)
     * @dev Only callable by EntryPoint
     */
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external onlyEntryPoint whenNotPaused returns (bytes memory context, uint256 validationData) {
        // Decode paymasterAndData: [paymaster_address(20) + operation_type(1) + signature(?)]
        require(userOp.paymasterAndData.length >= 21, "Invalid paymaster data");
        
        uint8 operationType = uint8(userOp.paymasterAndData[20]);
        
        if (!sponsoredOperations[operationType]) {
            revert OperationNotSponsored(operationType);
        }
        
        // Get player from sender (smart account)
        address player = userOp.sender;
        
        // Check sponsorship tier and limits
        PlayerSponsorship storage sponsorship = playerSponsorships[player];
        SponsorshipTier storage tier = sponsorshipTiers[sponsorship.tierId];
        
        if (!tier.active && !sponsorship.whitelisted) {
            revert TierNotActive(sponsorship.tierId);
        }
        
        // Check and reset daily limits
        _checkAndResetDailyLimit(player);
        
        if (sponsorship.dailyTxCount >= tier.dailyTransactions && !sponsorship.whitelisted) {
            revert DailyLimitReached(player, tier.dailyTransactions);
        }
        
        // Check gas limits
        if (userOp.callGasLimit > tier.maxGasPerTransaction) {
            revert GasLimitExceeded(userOp.callGasLimit, tier.maxGasPerTransaction);
        }
        
        // Check deposit balance
        if (address(this).balance < maxCost) {
            revert InsufficientDeposit(maxCost, address(this).balance);
        }
        
        // Increment counters
        sponsorship.dailyTxCount++;
        sponsorship.totalSponsored++;
        totalTransactionsSponsored++;
        
        // Create context for postOp
        context = abi.encode(player, userOpHash, operationType, maxCost);
        
        return (context, 0);
    }
    
    /**
     * @notice Post-operation handler
     * @param mode PostOp mode (0=op succeeded, 1=op reverted, 2=postOp reverted)
     * @param context Context from validatePaymasterUserOp
     * @param actualGasCost Actual gas cost of the operation
     * @dev Only callable by EntryPoint
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external onlyEntryPoint {
        (address player, bytes32 userOpHash, uint8 operationType, uint256 maxCost) = 
            abi.decode(context, (address, bytes32, uint8, uint256));
        
        // Update total gas sponsored
        totalGasSponsored += actualGasCost;
        
        // Record sponsored transaction
        sponsoredTransactions[userOpHash] = SponsoredTx({
            player: player,
            userOpHash: userOpHash,
            gasUsed: actualGasCost,
            timestamp: block.timestamp,
            operationType: operationType
        });
        
        emit UserOperationSponsored(userOpHash, player, actualGasCost, operationType);
        
        // Handle any refunds if gas was overestimated
        if (maxCost > actualGasCost && mode == PostOpMode.opSucceeded) {
            uint256 refund = maxCost - actualGasCost;
            // Refund is handled by EntryPoint, no action needed here
        }
    }
    
    /**
     * @notice PostOpMode enum as defined in ERC-4337
     */
    enum PostOpMode {
        opSucceeded,
        opReverted,
        postOpReverted
    }

    // ============ Player Management ============
    
    /**
     * @notice Whitelist a player for sponsorship
     * @param player Player address
     * @param tierId Tier to assign
     */
    function whitelistPlayer(address player, uint8 tierId) 
        external 
        onlyRole(SPONSOR_ROLE) 
    {
        if (player == address(0)) revert InvalidAddress();
        if (sponsorshipTiers[tierId].dailyTransactions == 0) revert InvalidTier();
        
        playerSponsorships[player] = PlayerSponsorship({
            tierId: tierId,
            dailyTxCount: 0,
            lastReset: block.timestamp,
            totalSponsored: 0,
            whitelisted: true
        });
        
        emit PlayerWhitelisted(player, tierId);
    }
    
    /**
     * @notice Remove player from whitelist
     * @param player Player address
     */
    function removePlayer(address player) external onlyRole(SPONSOR_ROLE) {
        playerSponsorships[player].whitelisted = false;
        emit PlayerRemoved(player);
    }
    
    /**
     * @notice Set player tier
     * @param player Player address
     * @param tierId Tier ID
     */
    function setPlayerTier(address player, uint8 tierId) 
        external 
        onlyRole(SPONSOR_ROLE) 
    {
        if (sponsorshipTiers[tierId].dailyTransactions == 0) revert InvalidTier();
        playerSponsorships[player].tierId = tierId;
    }

    // ============ Tier Management ============
    
    /**
     * @notice Set or update a sponsorship tier
     * @param tierId Tier ID
     * @param dailyTransactions Max daily transactions
     * @param maxGasPerTransaction Max gas per transaction
     * @param active Whether tier is active
     */
    function setTier(
        uint8 tierId,
        uint256 dailyTransactions,
        uint256 maxGasPerTransaction,
        bool active
    ) external onlyRole(PAYMASTER_ADMIN_ROLE) {
        sponsorshipTiers[tierId] = SponsorshipTier({
            dailyTransactions: dailyTransactions,
            maxGasPerTransaction: maxGasPerTransaction,
            active: active
        });
        
        emit TierUpdated(tierId, dailyTransactions, maxGasPerTransaction);
    }

    // ============ Operation Management ============
    
    /**
     * @notice Set whether an operation type is sponsored
     * @param operationType Operation type
     * @param sponsored Whether to sponsor
     */
    function setSponsoredOperation(uint8 operationType, bool sponsored) 
        external 
        onlyRole(PAYMASTER_ADMIN_ROLE) 
    {
        sponsoredOperations[operationType] = sponsored;
    }

    // ============ Deposit Management ============
    
    /**
     * @notice Add deposit for EntryPoint
     */
    function addDeposit() external payable onlyRole(PAYMASTER_ADMIN_ROLE) {
        depositBalance += msg.value;
        emit DepositAdded(msg.sender, msg.value);
    }
    
    /**
     * @notice Withdraw deposit
     * @param amount Amount to withdraw
     */
    function withdrawDeposit(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (amount > depositBalance) {
            revert InsufficientDeposit(amount, depositBalance);
        }
        
        depositBalance -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert WithdrawFailed();
        
        emit DepositWithdrawn(msg.sender, amount);
    }
    
    /**
     * @notice Deposit to EntryPoint for this paymaster
     */
    function depositToEntryPoint() external payable onlyRole(PAYMASTER_ADMIN_ROLE) {
        // In a real implementation, this would call EntryPoint.depositTo()
        // For simplicity, we just track the balance
        depositBalance += msg.value;
    }

    // ============ View Functions ============
    
    /**
     * @notice Check if a player can have their transaction sponsored
     * @param player Player address
     * @param operationType Operation type
     * @return canSponsor Whether sponsorship is available
     * @return remainingDaily Remaining daily transactions
     * @return maxGas Max gas allowed
     */
    function canSponsor(
        address player,
        uint8 operationType
    ) external view returns (
        bool canSponsor,
        uint256 remainingDaily,
        uint256 maxGas
    ) {
        if (!sponsoredOperations[operationType]) {
            return (false, 0, 0);
        }
        
        PlayerSponsorship storage sponsorship = playerSponsorships[player];
        SponsorshipTier storage tier = sponsorshipTiers[sponsorship.tierId];
        
        if (!tier.active && !sponsorship.whitelisted) {
            return (false, 0, 0);
        }
        
        // Check if day has reset
        uint256 dailyCount = sponsorship.dailyTxCount;
        if (block.timestamp >= sponsorship.lastReset + 1 days) {
            dailyCount = 0;
        }
        
        remainingDaily = tier.dailyTransactions > dailyCount 
            ? tier.dailyTransactions - dailyCount 
            : 0;
        
        return (remainingDaily > 0 || sponsorship.whitelisted, remainingDaily, tier.maxGasPerTransaction);
    }
    
    /**
     * @notice Get player sponsorship info
     * @param player Player address
     * @return sponsorship Player sponsorship data
     * @return tier Tier configuration
     */
    function getPlayerInfo(address player) 
        external 
        view 
        returns (PlayerSponsorship memory sponsorship, SponsorshipTier memory tier) 
    {
        sponsorship = playerSponsorships[player];
        tier = sponsorshipTiers[sponsorship.tierId];
    }
    
    /**
     * @notice Get sponsored transaction info
     * @param userOpHash User operation hash
     * @return Sponsored transaction data
     */
    function getSponsoredTransaction(bytes32 userOpHash) 
        external 
        view 
        returns (SponsoredTx memory) 
    {
        return sponsoredTransactions[userOpHash];
    }
    
    /**
     * @notice Get total sponsored transactions count
     * @return Total count
     */
    function getTotalSponsoredCount() external view returns (uint256) {
        return totalTransactionsSponsored;
    }
    
    /**
     * @notice Get remaining daily transactions for player
     * @param player Player address
     * @return Remaining count
     */
    function getRemainingDailyTransactions(address player) 
        external 
        view 
        returns (uint256) 
    {
        PlayerSponsorship storage sponsorship = playerSponsorships[player];
        SponsorshipTier storage tier = sponsorshipTiers[sponsorship.tierId];
        
        uint256 dailyCount = sponsorship.dailyTxCount;
        if (block.timestamp >= sponsorship.lastReset + 1 days) {
            dailyCount = 0;
        }
        
        return tier.dailyTransactions > dailyCount 
            ? tier.dailyTransactions - dailyCount 
            : 0;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Set game contract address
     * @param _gameContract Game contract address
     */
    function setGameContract(address _gameContract) 
        external 
        onlyRole(PAYMASTER_ADMIN_ROLE) 
    {
        if (_gameContract == address(0)) revert InvalidGameContract();
        gameContract = _gameContract;
    }
    
    /**
     * @notice Set verifying signer address
     * @param _verifyingSigner New signer address
     */
    function setVerifyingSigner(address _verifyingSigner) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (_verifyingSigner == address(0)) revert InvalidSigner();
        
        address previousSigner = verifyingSigner;
        verifyingSigner = _verifyingSigner;
        
        emit VerifyingSignerUpdated(previousSigner, _verifyingSigner);
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(PAYMASTER_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(PAYMASTER_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Emergency withdraw all funds
     */
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        if (!success) revert WithdrawFailed();
        
        emit DepositWithdrawn(msg.sender, balance);
    }

    // ============ Internal Functions ============
    
    function _checkAndResetDailyLimit(address player) internal {
        PlayerSponsorship storage sponsorship = playerSponsorships[player];
        
        if (block.timestamp >= sponsorship.lastReset + 1 days) {
            sponsorship.dailyTxCount = 0;
            sponsorship.lastReset = block.timestamp;
        }
    }
    
    function _initializeTiers() internal {
        // Free tier - minimal sponsorship
        sponsorshipTiers[0] = SponsorshipTier({
            dailyTransactions: 3,
            maxGasPerTransaction: 100000,
            active: true
        });
        
        // Basic tier
        sponsorshipTiers[1] = SponsorshipTier({
            dailyTransactions: 10,
            maxGasPerTransaction: 200000,
            active: true
        });
        
        // Premium tier
        sponsorshipTiers[2] = SponsorshipTier({
            dailyTransactions: 50,
            maxGasPerTransaction: 500000,
            active: true
        });
        
        // Unlimited tier
        sponsorshipTiers[3] = SponsorshipTier({
            dailyTransactions: type(uint256).max,
            maxGasPerTransaction: 1000000,
            active: true
        });
    }
    
    function _initializeOperations() internal {
        sponsoredOperations[OP_ENTER_DUNGEON] = true;
        sponsoredOperations[OP_FORM_CELL] = true;
        sponsoredOperations[OP_JOIN_CELL] = true;
        sponsoredOperations[OP_BATTLE_COMPLETE] = false; // Not sponsored (rewards)
        sponsoredOperations[OP_SEND_GIFT] = true;
        sponsoredOperations[OP_CLAIM_GIFT] = true;
        
        operationTypes = [
            OP_ENTER_DUNGEON,
            OP_FORM_CELL,
            OP_JOIN_CELL,
            OP_BATTLE_COMPLETE,
            OP_SEND_GIFT,
            OP_CLAIM_GIFT
        ];
    }

    // ============ Receive ============
    
    receive() external payable {
        depositBalance += msg.value;
        emit DepositAdded(msg.sender, msg.value);
    }
}
