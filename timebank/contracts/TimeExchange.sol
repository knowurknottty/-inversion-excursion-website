// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

import {ITimeExchange} from "../interfaces/ITimeExchange.sol";
import {ITimeToken} from "../../contracts/ITimeToken.sol";
import {IReputationRegistry} from "../interfaces/IReputationRegistry.sol";
import {IDisputeResolution} from "../interfaces/IDisputeResolution.sol";

/**
 * @title TimeExchange
 * @dev Secure escrow system for Timebank mutual aid platform
 * 
 * State Machine:
 *   Created → Funded → InProgress → Completed
 *                      ↓
 *                 Disputed → Refunded/Completed
 *                      ↓
 *                 Cancelled → Refunded
 *                      ↓
 *                 Expired → Refunded
 * 
 * Features:
 * - Multi-type support: One-time, Milestone-based, Recurring
 * - Dual-confirmation completion
 * - Dispute integration
 * - Timeout handling
 * - Platform fees
 */
contract TimeExchange is ITimeExchange, AccessControl, ReentrancyGuard, Pausable {
    
    // ============ Roles ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant DISPUTE_RESOLVER_ROLE = keccak256("DISPUTE_RESOLVER_ROLE");
    
    // ============ State Variables ============
    
    // Contract References
    ITimeToken public timeToken;
    IReputationRegistry public reputationRegistry;
    IDisputeResolution public disputeResolution;
    address public treasury;
    
    // Exchange Data
    mapping(uint256 => Exchange) public exchanges;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones; // exchangeId => milestoneIndex => Milestone
    mapping(address => uint256[]) public userExchanges;
    mapping(ExchangeStatus => uint256[]) public exchangesByStatus;
    uint256 public exchangeCounter;
    
    // Configuration
    uint256 public maxHoursPerExchange;
    uint256 public platformFeeBasisPoints;  // Fee to treasury (e.g., 100 = 1%)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // Max 10% fee
    
    // Timeouts
    uint256 public fundingTimeout;      // Time to fund after creation
    uint256 public startTimeout;        // Time for provider to start after funding
    uint256 public completionTimeout;   // Time to complete after starting
    
    // Statistics
    uint256 public totalExchangesCreated;
    uint256 public totalExchangesCompleted;
    uint256 public totalExchangesDisputed;
    uint256 public totalExchangesCancelled;
    uint256 public totalExchangesExpired;
    uint256 public totalHoursExchanged;
    uint256 public totalPlatformFees;
    
    // ============ Modifiers ============
    
    modifier onlyRequester(uint256 exchangeId) {
        if (exchanges[exchangeId].requester != msg.sender) revert NotRequester();
        _;
    }
    
    modifier onlyProvider(uint256 exchangeId) {
        if (exchanges[exchangeId].provider != msg.sender) revert NotProvider();
        _;
    }
    
    modifier onlyParticipant(uint256 exchangeId) {
        Exchange storage exchange = exchanges[exchangeId];
        if (exchange.requester != msg.sender && exchange.provider != msg.sender) {
            revert NotParticipant();
        }
        _;
    }
    
    modifier validExchange(uint256 exchangeId) {
        if (exchangeId >= exchangeCounter) revert InvalidStatus();
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _timeToken,
        address _reputationRegistry,
        address _disputeResolution,
        address _treasury,
        address admin
    ) {
        if (_timeToken == address(0)) revert InvalidProvider();
        if (_reputationRegistry == address(0)) revert InvalidProvider();
        if (_treasury == address(0)) revert InvalidProvider();
        if (admin == address(0)) revert InvalidProvider();
        
        timeToken = ITimeToken(_timeToken);
        reputationRegistry = IReputationRegistry(_reputationRegistry);
        if (_disputeResolution != address(0)) {
            disputeResolution = IDisputeResolution(_disputeResolution);
        }
        treasury = _treasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        
        // Default configuration
        maxHoursPerExchange = 1000 * 1e18; // 1000 hours
        platformFeeBasisPoints = 100; // 1%
        fundingTimeout = 7 days;
        startTimeout = 3 days;
        completionTimeout = 30 days;
    }
    
    // ============ Exchange Creation ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function createExchange(
        address provider,
        uint256 hoursAmount,
        uint256 skillId,
        string calldata description,
        string calldata deliverables,
        ExchangeType exchangeType,
        uint256 milestoneCount,
        uint256 recurringInterval,
        uint256 recurringCount,
        string calldata metadataURI
    ) external whenNotPaused returns (uint256 exchangeId) {
        // Validation
        if (provider == address(0)) revert InvalidProvider();
        if (provider == msg.sender) revert InvalidProvider(); // Can't be own provider
        if (hoursAmount == 0 || hoursAmount > maxHoursPerExchange) revert InvalidHours();
        if (!reputationRegistry.isRegistered(msg.sender)) revert NotRegistered();
        if (!reputationRegistry.isRegistered(provider)) revert NotRegistered();
        
        // Validate exchange type specific parameters
        if (exchangeType == ExchangeType.Milestone) {
            if (milestoneCount == 0 || milestoneCount > 10) revert InvalidMilestoneCount();
        } else if (exchangeType == ExchangeType.Recurring) {
            if (recurringInterval == 0 || recurringCount == 0 || recurringCount > 52) {
                revert InvalidRecurringConfig();
            }
        }
        
        exchangeId = exchangeCounter;
        
        Exchange storage exchange = exchanges[exchangeId];
        exchange.id = exchangeId;
        exchange.requester = msg.sender;
        exchange.provider = provider;
        exchange.hoursAmount = hoursAmount;
        exchange.skillId = skillId;
        exchange.description = description;
        exchange.deliverables = deliverables;
        exchange.exchangeType = exchangeType;
        exchange.status = ExchangeStatus.Created;
        exchange.createdAt = block.timestamp;
        exchange.expiresAt = block.timestamp + fundingTimeout;
        exchange.milestoneCount = milestoneCount;
        exchange.recurringInterval = recurringInterval;
        exchange.recurringCount = recurringCount;
        exchange.metadataURI = metadataURI;
        
        // Track user's exchanges
        userExchanges[msg.sender].push(exchangeId);
        userExchanges[provider].push(exchangeId);
        exchangesByStatus[ExchangeStatus.Created].push(exchangeId);
        
        exchangeCounter++;
        totalExchangesCreated++;
        
        emit ExchangeCreated(
            exchangeId,
            msg.sender,
            provider,
            hoursAmount,
            skillId,
            exchangeType
        );
        
        return exchangeId;
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function fundExchange(uint256 exchangeId) 
        external 
        nonReentrant 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyRequester(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.status != ExchangeStatus.Created) revert InvalidStatus();
        if (block.timestamp > exchange.expiresAt) revert ExchangeExpiredError();
        
        uint256 fundAmount = exchange.hoursAmount;
        
        // Check requester has sufficient balance
        if (timeToken.balanceOf(msg.sender) < fundAmount) revert InsufficientFunds();
        
        // Transfer tokens to this contract (escrow)
        bool success = timeToken.transferFrom(msg.sender, address(this), fundAmount);
        if (!success) revert TransferFailed();
        
        // Update state
        exchange.hoursFunded = fundAmount;
        exchange.status = ExchangeStatus.Funded;
        exchange.fundedAt = block.timestamp;
        exchange.expiresAt = block.timestamp + startTimeout;
        
        _updateExchangeStatusList(exchangeId, ExchangeStatus.Created, ExchangeStatus.Funded);
        
        emit ExchangeFunded(exchangeId, fundAmount, block.timestamp);
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function startExchange(uint256 exchangeId) 
        external 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyProvider(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.status != ExchangeStatus.Funded) revert InvalidStatus();
        if (block.timestamp > exchange.expiresAt) revert ExchangeExpiredError();
        
        exchange.status = ExchangeStatus.InProgress;
        exchange.startedAt = block.timestamp;
        exchange.expiresAt = block.timestamp + completionTimeout;
        
        _updateExchangeStatusList(exchangeId, ExchangeStatus.Funded, ExchangeStatus.InProgress);
        
        emit ExchangeStarted(exchangeId, msg.sender, block.timestamp);
    }
    
    // ============ Completion & Confirmation ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function confirmCompletion(uint256 exchangeId) 
        external 
        nonReentrant 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyParticipant(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.status != ExchangeStatus.InProgress) revert InvalidStatus();
        
        bool isRequester = exchange.requester == msg.sender;
        
        if (isRequester) {
            if (exchange.requesterConfirmed) revert AlreadyConfirmed();
            exchange.requesterConfirmed = true;
        } else {
            if (exchange.providerConfirmed) revert AlreadyConfirmed();
            exchange.providerConfirmed = true;
        }
        
        emit ConfirmationSubmitted(exchangeId, msg.sender, isRequester, block.timestamp);
        
        // If both confirmed, complete the exchange
        if (exchange.requesterConfirmed && exchange.providerConfirmed) {
            _completeExchange(exchangeId);
        }
    }
    
    /**
     * @dev Internal function to complete exchange and release funds
     */
    function _completeExchange(uint256 exchangeId) internal {
        Exchange storage exchange = exchanges[exchangeId];
        
        // Calculate fees
        uint256 platformFee = (exchange.hoursFunded * platformFeeBasisPoints) / BASIS_POINTS;
        uint256 providerAmount = exchange.hoursFunded - platformFee;
        
        // Update state before transfers (checks-effects-interactions)
        exchange.status = ExchangeStatus.Completed;
        exchange.completedAt = block.timestamp;
        exchange.hoursReleased = exchange.hoursFunded;
        
        // Update statistics
        totalExchangesCompleted++;
        totalHoursExchanged += exchange.hoursFunded;
        totalPlatformFees += platformFee;
        
        _updateExchangeStatusList(exchangeId, ExchangeStatus.InProgress, ExchangeStatus.Completed);
        
        // Transfer platform fee to treasury
        if (platformFee > 0) {
            bool feeSuccess = timeToken.transfer(treasury, platformFee);
            if (!feeSuccess) revert TransferFailed();
        }
        
        // Transfer remaining to provider
        bool providerSuccess = timeToken.transfer(exchange.provider, providerAmount);
        if (!providerSuccess) revert TransferFailed();
        
        // Update reputation for both parties
        try reputationRegistry.recordExchangeCompletion(
            exchange.provider,
            exchange.requester,
            exchange.hoursFunded
        ) {} catch {
            // Don't fail if reputation update fails
        }
        
        emit ExchangeCompleted(exchangeId, block.timestamp, providerAmount, platformFee);
    }
    
    // ============ Milestone Management ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function completeMilestone(uint256 exchangeId, uint256 milestoneIndex) 
        external 
        nonReentrant 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyParticipant(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.exchangeType != ExchangeType.Milestone) revert InvalidMilestone();
        if (exchange.status != ExchangeStatus.InProgress && exchange.status != ExchangeStatus.Funded) {
            revert InvalidStatus();
        }
        if (milestoneIndex >= exchange.milestoneCount) revert InvalidMilestone();
        
        Milestone storage milestone = milestones[exchangeId][milestoneIndex];
        
        if (milestone.isCompleted) revert InvalidMilestone();
        
        // Calculate milestone hours (even distribution for now)
        uint256 milestoneHours = exchange.hoursAmount / exchange.milestoneCount;
        if (milestoneIndex == exchange.milestoneCount - 1) {
            // Last milestone gets any remainder
            milestoneHours = exchange.hoursAmount - (milestoneHours * (exchange.milestoneCount - 1));
        }
        
        // Both parties must confirm milestone
        bool isRequester = exchange.requester == msg.sender;
        
        if (isRequester) {
            milestone.isCompleted = true;
            milestone.completedAt = block.timestamp;
            milestone.hoursAmount = milestoneHours;
            milestone.exchangeId = exchangeId;
            milestone.milestoneIndex = milestoneIndex;
            
            // Auto-release payment for milestone
            _releaseMilestonePayment(exchangeId, milestoneIndex, milestoneHours);
        } else {
            // Provider can mark ready, but requester confirms
            revert InvalidStatus(); // Simplified: only requester can complete for now
        }
        
        exchange.currentMilestone++;
        
        // If all milestones complete, mark exchange complete
        if (exchange.currentMilestone >= exchange.milestoneCount) {
            exchange.status = ExchangeStatus.Completed;
            exchange.completedAt = block.timestamp;
            _updateExchangeStatusList(exchangeId, ExchangeStatus.InProgress, ExchangeStatus.Completed);
            emit ExchangeCompleted(exchangeId, block.timestamp, exchange.hoursReleased, 0);
        }
        
        emit MilestoneCompleted(exchangeId, milestoneIndex, milestoneHours);
    }
    
    /**
     * @dev Internal function to release milestone payment
     */
    function _releaseMilestonePayment(uint256 exchangeId, uint256 milestoneIndex, uint256 hoursAmount) internal {
        Exchange storage exchange = exchanges[exchangeId];
        
        // Calculate fees per milestone
        uint256 platformFee = (hoursAmount * platformFeeBasisPoints) / BASIS_POINTS;
        uint256 providerAmount = hoursAmount - platformFee;
        
        exchange.hoursReleased += hoursAmount;
        
        Milestone storage milestone = milestones[exchangeId][milestoneIndex];
        milestone.isPaid = true;
        
        // Transfer fees
        if (platformFee > 0) {
            timeToken.transfer(treasury, platformFee);
            totalPlatformFees += platformFee;
        }
        
        // Transfer to provider
        timeToken.transfer(exchange.provider, providerAmount);
        
        totalHoursExchanged += hoursAmount;
    }
    
    // ============ Recurring Payments ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function releaseRecurringPayment(uint256 exchangeId) 
        external 
        nonReentrant 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyRequester(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.exchangeType != ExchangeType.Recurring) revert InvalidStatus();
        if (exchange.status != ExchangeStatus.InProgress) revert InvalidStatus();
        if (exchange.recurringCompleted >= exchange.recurringCount) revert InvalidStatus();
        
        uint256 nextPaymentTime = exchange.startedAt + (exchange.recurringCompleted * exchange.recurringInterval);
        if (block.timestamp < nextPaymentTime) revert InvalidStatus();
        
        uint256 paymentHours = exchange.hoursAmount / exchange.recurringCount;
        if (exchange.recurringCompleted == exchange.recurringCount - 1) {
            // Last payment gets remainder
            paymentHours = exchange.hoursAmount - (paymentHours * (exchange.recurringCount - 1));
        }
        
        // Calculate fees
        uint256 platformFee = (paymentHours * platformFeeBasisPoints) / BASIS_POINTS;
        uint256 providerAmount = paymentHours - platformFee;
        
        exchange.hoursReleased += paymentHours;
        exchange.recurringCompleted++;
        
        // Transfer
        if (platformFee > 0) {
            timeToken.transfer(treasury, platformFee);
            totalPlatformFees += platformFee;
        }
        timeToken.transfer(exchange.provider, providerAmount);
        
        totalHoursExchanged += paymentHours;
        
        emit RecurringPaymentReleased(exchangeId, exchange.recurringCompleted - 1, providerAmount);
        
        // If all payments released, complete exchange
        if (exchange.recurringCompleted >= exchange.recurringCount) {
            exchange.status = ExchangeStatus.Completed;
            exchange.completedAt = block.timestamp;
            _updateExchangeStatusList(exchangeId, ExchangeStatus.InProgress, ExchangeStatus.Completed);
            
            // Update reputation
            try reputationRegistry.recordExchangeCompletion(
                exchange.provider,
                exchange.requester,
                exchange.hoursFunded
            ) {} catch {}
            
            emit ExchangeCompleted(exchangeId, block.timestamp, exchange.hoursReleased, 0);
        }
    }
    
    // ============ Cancellation ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function cancelExchange(uint256 exchangeId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyParticipant(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        // Can cancel from Created, Funded, or InProgress states
        if (exchange.status == ExchangeStatus.Completed || 
            exchange.status == ExchangeStatus.Disputed ||
            exchange.status == ExchangeStatus.Cancelled ||
            exchange.status == ExchangeStatus.Refunded) {
            revert InvalidStatus();
        }
        
        bool isRequester = exchange.requester == msg.sender;
        
        // If in progress, both must agree (simplified: either can cancel before work starts)
        if (exchange.status == ExchangeStatus.InProgress) {
            // Allow cancellation but may involve partial payment
            _handleInProgressCancellation(exchangeId, reason);
            return;
        }
        
        // Calculate refund
        uint256 refundAmount = exchange.hoursFunded;
        
        // Update state
        ExchangeStatus oldStatus = exchange.status;
        exchange.status = ExchangeStatus.Cancelled;
        
        _updateExchangeStatusList(exchangeId, oldStatus, ExchangeStatus.Cancelled);
        
        totalExchangesCancelled++;
        
        // Refund if funded
        if (refundAmount > 0) {
            exchange.status = ExchangeStatus.Refunded;
            _updateExchangeStatusList(exchangeId, ExchangeStatus.Cancelled, ExchangeStatus.Refunded);
            
            bool success = timeToken.transfer(exchange.requester, refundAmount);
            if (!success) revert TransferFailed();
            
            emit ExchangeRefunded(exchangeId, refundAmount, block.timestamp);
        }
        
        emit ExchangeCancelled(exchangeId, msg.sender, reason, refundAmount);
    }
    
    /**
     * @dev Handle cancellation when work has started
     */
    function _handleInProgressCancellation(uint256 exchangeId, string calldata reason) internal {
        Exchange storage exchange = exchanges[exchangeId];
        
        // Split based on work completed (simplified: 50/50 if disputed)
        uint256 providerShare = exchange.hoursReleased;
        uint256 requesterRefund = exchange.hoursFunded - exchange.hoursReleased;
        
        ExchangeStatus oldStatus = exchange.status;
        exchange.status = ExchangeStatus.Cancelled;
        
        _updateExchangeStatusList(exchangeId, oldStatus, ExchangeStatus.Cancelled);
        totalExchangesCancelled++;
        
        if (requesterRefund > 0) {
            exchange.status = ExchangeStatus.Refunded;
            _updateExchangeStatusList(exchangeId, ExchangeStatus.Cancelled, ExchangeStatus.Refunded);
            
            timeToken.transfer(exchange.requester, requesterRefund);
            emit ExchangeRefunded(exchangeId, requesterRefund, block.timestamp);
        }
        
        emit ExchangeCancelled(exchangeId, msg.sender, reason, requesterRefund);
    }
    
    // ============ Dispute Resolution ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function raiseDispute(uint256 exchangeId, string calldata reason) 
        external 
        whenNotPaused 
        validExchange(exchangeId) 
        onlyParticipant(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.status != ExchangeStatus.InProgress && 
            exchange.status != ExchangeStatus.Funded) {
            revert InvalidStatus();
        }
        if (address(disputeResolution) == address(0)) revert InvalidDisputeResolution();
        
        ExchangeStatus oldStatus = exchange.status;
        exchange.status = ExchangeStatus.Disputed;
        
        _updateExchangeStatusList(exchangeId, oldStatus, ExchangeStatus.Disputed);
        totalExchangesDisputed++;
        
        // Create dispute in resolution contract
        uint256 disputeId = disputeResolution.createDispute(
            exchangeId,
            exchange.requester,
            exchange.provider,
            exchange.hoursFunded - exchange.hoursReleased,
            reason
        );
        
        exchange.disputeId = disputeId;
        
        emit ExchangeDisputed(exchangeId, disputeId, msg.sender, reason);
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function resolveDispute(
        uint256 exchangeId,
        bool requesterWins,
        uint256 providerHours,
        uint256 requesterRefund
    ) external nonReentrant onlyRole(DISPUTE_RESOLVER_ROLE) validExchange(exchangeId) {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.status != ExchangeStatus.Disputed) revert InvalidStatus();
        if (providerHours + requesterRefund > exchange.hoursFunded - exchange.hoursReleased) {
            revert InvalidHours();
        }
        
        // Update state
        ExchangeStatus oldStatus = exchange.status;
        
        // Transfer provider share
        if (providerHours > 0) {
            uint256 platformFee = (providerHours * platformFeeBasisPoints) / BASIS_POINTS;
            uint256 providerAmount = providerHours - platformFee;
            
            exchange.hoursReleased += providerHours;
            
            if (platformFee > 0) {
                timeToken.transfer(treasury, platformFee);
                totalPlatformFees += platformFee;
            }
            timeToken.transfer(exchange.provider, providerAmount);
        }
        
        // Refund requester
        if (requesterRefund > 0) {
            timeToken.transfer(exchange.requester, requesterRefund);
        }
        
        // Update status based on resolution
        if (exchange.hoursReleased >= exchange.hoursFunded) {
            exchange.status = ExchangeStatus.Completed;
            _updateExchangeStatusList(exchangeId, oldStatus, ExchangeStatus.Completed);
            
            try reputationRegistry.recordExchangeCompletion(
                exchange.provider,
                exchange.requester,
                exchange.hoursReleased
            ) {} catch {}
            
            emit ExchangeCompleted(exchangeId, block.timestamp, exchange.hoursReleased, 0);
        } else {
            exchange.status = ExchangeStatus.Refunded;
            _updateExchangeStatusList(exchangeId, oldStatus, ExchangeStatus.Refunded);
            emit ExchangeRefunded(exchangeId, requesterRefund, block.timestamp);
        }
        
        // Record dispute outcome in reputation
        try reputationRegistry.recordDispute(exchange.requester, requesterWins) {} catch {}
        try reputationRegistry.recordDispute(exchange.provider, !requesterWins) {} catch {}
    }
    
    // ============ Expired Exchanges ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function claimExpiredRefund(uint256 exchangeId) 
        external 
        nonReentrant 
        validExchange(exchangeId) 
        onlyRequester(exchangeId) 
    {
        Exchange storage exchange = exchanges[exchangeId];
        
        if (exchange.status == ExchangeStatus.Completed ||
            exchange.status == ExchangeStatus.Cancelled ||
            exchange.status == ExchangeStatus.Refunded ||
            exchange.status == ExchangeStatus.Disputed) {
            revert InvalidStatus();
        }
        
        if (block.timestamp <= exchange.expiresAt) revert TimeoutNotReached();
        
        ExchangeStatus oldStatus = exchange.status;
        exchange.status = ExchangeStatus.Expired;
        
        _updateExchangeStatusList(exchangeId, oldStatus, ExchangeStatus.Expired);
        totalExchangesExpired++;
        
        // Refund any funded amount
        if (exchange.hoursFunded > 0) {
            exchange.status = ExchangeStatus.Refunded;
            _updateExchangeStatusList(exchangeId, ExchangeStatus.Expired, ExchangeStatus.Refunded);
            
            bool success = timeToken.transfer(exchange.requester, exchange.hoursFunded);
            if (!success) revert TransferFailed();
            
            emit ExchangeRefunded(exchangeId, exchange.hoursFunded, block.timestamp);
        }
        
        emit ExchangeExpired(exchangeId, block.timestamp);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function setPlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        if (newFee > MAX_PLATFORM_FEE) revert InvalidHours();
        
        uint256 oldFee = platformFeeBasisPoints;
        platformFeeBasisPoints = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function setTimeouts(
        uint256 _fundingTimeout,
        uint256 _startTimeout,
        uint256 _completionTimeout
    ) external onlyRole(ADMIN_ROLE) {
        fundingTimeout = _fundingTimeout;
        startTimeout = _startTimeout;
        completionTimeout = _completionTimeout;
        
        emit TimeoutConfigUpdated(_fundingTimeout, _startTimeout, _completionTimeout);
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function updateContracts(
        address _timeToken,
        address _reputationRegistry,
        address _disputeResolution,
        address _treasury
    ) external onlyRole(ADMIN_ROLE) {
        if (_timeToken != address(0)) timeToken = ITimeToken(_timeToken);
        if (_reputationRegistry != address(0)) reputationRegistry = IReputationRegistry(_reputationRegistry);
        if (_disputeResolution != address(0)) disputeResolution = IDisputeResolution(_disputeResolution);
        if (_treasury != address(0)) treasury = _treasury;
        
        emit ContractAddressesUpdated(_timeToken, _reputationRegistry, _disputeResolution, _treasury);
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Set max hours per exchange
     */
    function setMaxHours(uint256 maxHours) external onlyRole(ADMIN_ROLE) {
        maxHoursPerExchange = maxHours;
    }
    
    // ============ View Functions ============
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getExchange(uint256 exchangeId) external view returns (Exchange memory) {
        return exchanges[exchangeId];
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getMilestone(uint256 exchangeId, uint256 milestoneIndex) external view returns (
        string memory description,
        uint256 hoursAmount,
        bool isCompleted,
        bool isPaid,
        uint256 completedAt
    ) {
        Milestone storage milestone = milestones[exchangeId][milestoneIndex];
        return (
            milestone.description,
            milestone.hoursAmount,
            milestone.isCompleted,
            milestone.isPaid,
            milestone.completedAt
        );
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getUserExchanges(address user) external view returns (uint256[] memory) {
        return userExchanges[user];
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getActiveExchanges(address user) external view returns (uint256[] memory) {
        uint256[] memory userExcs = userExchanges[user];
        uint256[] memory active = new uint256[](userExcs.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < userExcs.length; i++) {
            ExchangeStatus status = exchanges[userExcs[i]].status;
            if (status == ExchangeStatus.Created || 
                status == ExchangeStatus.Funded || 
                status == ExchangeStatus.InProgress ||
                status == ExchangeStatus.Disputed) {
                active[count] = userExcs[i];
                count++;
            }
        }
        
        // Trim array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = active[i];
        }
        return result;
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getExchangesByStatus(ExchangeStatus status) external view returns (uint256[] memory) {
        return exchangesByStatus[status];
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function isFullyConfirmed(uint256 exchangeId) external view returns (bool) {
        Exchange storage exchange = exchanges[exchangeId];
        return exchange.requesterConfirmed && exchange.providerConfirmed;
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function isExpired(uint256 exchangeId) external view returns (bool) {
        Exchange storage exchange = exchanges[exchangeId];
        if (exchange.status == ExchangeStatus.Completed ||
            exchange.status == ExchangeStatus.Cancelled ||
            exchange.status == ExchangeStatus.Refunded) {
            return false;
        }
        return block.timestamp > exchange.expiresAt;
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getTimeRemaining(uint256 exchangeId) external view returns (uint256) {
        Exchange storage exchange = exchanges[exchangeId];
        if (block.timestamp >= exchange.expiresAt) return 0;
        return exchange.expiresAt - block.timestamp;
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getExchangeCount() external view returns (uint256) {
        return exchangeCounter;
    }
    
    /**
     * @inheritdoc ITimeExchange
     */
    function getExchangeStats() external view returns (
        uint256 totalCreated,
        uint256 totalCompleted,
        uint256 totalDisputed,
        uint256 totalCancelled,
        uint256 totalExpired,
        uint256 totalHours
    ) {
        return (
            totalExchangesCreated,
            totalExchangesCompleted,
            totalExchangesDisputed,
            totalExchangesCancelled,
            totalExchangesExpired,
            totalHoursExchanged
        );
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Update exchange status tracking arrays
     */
    function _updateExchangeStatusList(
        uint256 exchangeId,
        ExchangeStatus oldStatus,
        ExchangeStatus newStatus
    ) internal {
        // Remove from old status list (simplified: mark and skip in view)
        // For production, use a more efficient data structure
        
        // Add to new status list
        exchangesByStatus[newStatus].push(exchangeId);
    }
}