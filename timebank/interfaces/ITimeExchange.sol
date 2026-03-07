// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ITimeToken} from "../../contracts/ITimeToken.sol";

/**
 * @title ITimeExchange
 * @dev Interface for the Timebank Time Exchange escrow system
 */
interface ITimeExchange {
    
    // ============ Enums ============
    
    enum ExchangeStatus {
        Created,        // Exchange created, awaiting funding
        Funded,         // Requester funded the exchange
        InProgress,     // Provider accepted, service being delivered
        Completed,      // Both parties confirmed, payment released
        Disputed,       // Under dispute resolution
        Cancelled,      // Cancelled before completion
        Refunded,       // Refunded due to cancellation/dispute
        Expired         // Timed out without action
    }
    
    enum ExchangeType {
        OneTime,        // Single delivery, single payment
        Milestone,      // Multiple deliverables with partial payments
        Recurring       // Ongoing service with periodic payments
    }
    
    // ============ Structs ============
    
    struct Exchange {
        uint256 id;
        address requester;
        address provider;
        uint256 hoursAmount;
        uint256 hoursFunded;            // Hours actually funded by requester
        uint256 hoursReleased;          // Hours already released to provider
        uint256 skillId;
        string description;
        string deliverables;
        ExchangeType exchangeType;
        ExchangeStatus status;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 startedAt;
        uint256 completedAt;
        uint256 expiresAt;              // Deadline for completion
        uint256 disputeId;
        bool requesterConfirmed;
        bool providerConfirmed;
        uint256 milestoneCount;         // For milestone type
        uint256 currentMilestone;       // Current milestone index
        uint256 recurringInterval;      // For recurring type (seconds)
        uint256 recurringCount;         // Number of payments for recurring
        uint256 recurringCompleted;     // Completed recurring payments
        string metadataURI;
    }
    
    struct Milestone {
        uint256 exchangeId;
        uint256 milestoneIndex;
        string description;
        uint256 hoursAmount;
        bool isCompleted;
        bool isPaid;
        uint256 completedAt;
    }
    
    // ============ Events ============
    
    event ExchangeCreated(
        uint256 indexed id,
        address indexed requester,
        address indexed provider,
        uint256 hoursAmount,
        uint256 skillId,
        ExchangeType exchangeType
    );
    
    event ExchangeFunded(
        uint256 indexed id,
        uint256 hoursFunded,
        uint256 fundedAt
    );
    
    event ExchangeStarted(
        uint256 indexed id,
        address indexed provider,
        uint256 startedAt
    );
    
    event ConfirmationSubmitted(
        uint256 indexed id,
        address indexed by,
        bool isRequester,
        uint256 timestamp
    );
    
    event ExchangeCompleted(
        uint256 indexed id,
        uint256 completedAt,
        uint256 providerReceived,
        uint256 platformFee
    );
    
    event ExchangeDisputed(
        uint256 indexed id,
        uint256 indexed disputeId,
        address indexed raisedBy,
        string reason
    );
    
    event ExchangeCancelled(
        uint256 indexed id,
        address indexed by,
        string reason,
        uint256 refundAmount
    );
    
    event ExchangeRefunded(
        uint256 indexed id,
        uint256 refundAmount,
        uint256 timestamp
    );
    
    event ExchangeExpired(
        uint256 indexed id,
        uint256 expiredAt
    );
    
    event MilestoneCompleted(
        uint256 indexed exchangeId,
        uint256 indexed milestoneIndex,
        uint256 hoursReleased
    );
    
    event RecurringPaymentReleased(
        uint256 indexed exchangeId,
        uint256 indexed paymentIndex,
        uint256 hoursReleased
    );
    
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    event TimeoutConfigUpdated(
        uint256 fundingTimeout,
        uint256 startTimeout,
        uint256 completionTimeout
    );
    
    event ContractAddressesUpdated(
        address timeToken,
        address reputationRegistry,
        address disputeResolution,
        address treasury
    );
    
    // ============ Errors ============
    
    error InvalidHours();
    error InvalidProvider();
    error InvalidExchangeType();
    error InvalidMilestoneCount();
    error InvalidRecurringConfig();
    error NotRequester();
    error NotProvider();
    error NotParticipant();
    error InvalidStatus();
    error InvalidStatusTransition();
    error AlreadyConfirmed();
    error DeadlinePassed();
    error InsufficientReputation();
    error NotRegistered();
    error DisputeActive();
    error ExchangeNotFunded();
    error ExchangeExpiredError();
    error TimeoutNotReached();
    error InsufficientFunds();
    error TransferFailed();
    error InvalidMilestone();
    error MilestoneNotCompleted();
    error InvalidDisputeResolution();
    error ReentrancyGuard();
    
    // ============ Core Functions ============
    
    /**
     * @dev Create a new time exchange
     * @param provider Address of service provider
     * @param hoursAmount Total hours for the exchange
     * @param skillId ID of the skill being exchanged
     * @param description Description of the service needed
     * @param deliverables Expected deliverables
     * @param exchangeType Type of exchange (OneTime, Milestone, Recurring)
     * @param milestoneCount Number of milestones (for Milestone type)
     * @param recurringInterval Interval between payments in seconds (for Recurring type)
     * @param recurringCount Number of recurring payments (for Recurring type)
     * @param metadataURI IPFS hash for extended data
     * @return exchangeId The ID of the newly created exchange
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
    ) external returns (uint256 exchangeId);
    
    /**
     * @dev Fund a created exchange with TimeTokens
     * @param exchangeId ID of the exchange to fund
     */
    function fundExchange(uint256 exchangeId) external;
    
    /**
     * @dev Provider accepts and starts the exchange
     * @param exchangeId ID of the exchange to start
     */
    function startExchange(uint256 exchangeId) external;
    
    /**
     * @dev Submit completion confirmation
     * @param exchangeId ID of the exchange
     */
    function confirmCompletion(uint256 exchangeId) external;
    
    /**
     * @dev Cancel an exchange (before completion)
     * @param exchangeId ID of the exchange to cancel
     * @param reason Reason for cancellation
     */
    function cancelExchange(uint256 exchangeId, string calldata reason) external;
    
    /**
     * @dev Raise a dispute for an exchange
     * @param exchangeId ID of the exchange in dispute
     * @param reason Reason for dispute
     */
    function raiseDispute(uint256 exchangeId, string calldata reason) external;
    
    /**
     * @dev Complete a milestone and release payment
     * @param exchangeId ID of the milestone exchange
     * @param milestoneIndex Index of the milestone to complete
     */
    function completeMilestone(uint256 exchangeId, uint256 milestoneIndex) external;
    
    /**
     * @dev Release next recurring payment
     * @param exchangeId ID of the recurring exchange
     */
    function releaseRecurringPayment(uint256 exchangeId) external;
    
    /**
     * @dev Claim refund for expired exchange
     * @param exchangeId ID of the expired exchange
     */
    function claimExpiredRefund(uint256 exchangeId) external;
    
    // ============ Dispute Resolution Callback ============
    
    /**
     * @dev Resolve a disputed exchange (called by DisputeResolution contract)
     * @param exchangeId ID of the disputed exchange
     * @param requesterWins Whether requester wins the dispute
     * @param providerHours Hours to release to provider
     * @param requesterRefund Hours to refund to requester
     */
    function resolveDispute(
        uint256 exchangeId,
        bool requesterWins,
        uint256 providerHours,
        uint256 requesterRefund
    ) external;
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set platform fee percentage
     * @param newFee New fee in basis points (100 = 1%)
     */
    function setPlatformFee(uint256 newFee) external;
    
    /**
     * @dev Set timeout configurations
     */
    function setTimeouts(
        uint256 fundingTimeout,
        uint256 startTimeout,
        uint256 completionTimeout
    ) external;
    
    /**
     * @dev Update contract addresses
     */
    function updateContracts(
        address _timeToken,
        address _reputationRegistry,
        address _disputeResolution,
        address _treasury
    ) external;
    
    /**
     * @dev Emergency pause
     */
    function pause() external;
    
    /**
     * @dev Unpause
     */
    function unpause() external;
    
    // ============ View Functions ============
    
    /**
     * @dev Get full exchange details
     */
    function getExchange(uint256 exchangeId) external view returns (Exchange memory);
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 exchangeId, uint256 milestoneIndex) external view returns (
        string memory description,
        uint256 hoursAmount,
        bool isCompleted,
        bool isPaid,
        uint256 completedAt
    );
    
    /**
     * @dev Get all exchanges for a user
     */
    function getUserExchanges(address user) external view returns (uint256[] memory);
    
    /**
     * @dev Get active exchanges for a user
     */
    function getActiveExchanges(address user) external view returns (uint256[] memory);
    
    /**
     * @dev Get exchanges by status
     */
    function getExchangesByStatus(ExchangeStatus status) external view returns (uint256[] memory);
    
    /**
     * @dev Check if exchange is fully confirmed
     */
    function isFullyConfirmed(uint256 exchangeId) external view returns (bool);
    
    /**
     * @dev Check if exchange has expired
     */
    function isExpired(uint256 exchangeId) external view returns (bool);
    
    /**
     * @dev Get time remaining until timeout
     */
    function getTimeRemaining(uint256 exchangeId) external view returns (uint256);
    
    /**
     * @dev Get total exchanges count
     */
    function getExchangeCount() external view returns (uint256);
    
    /**
     * @dev Get exchange stats
     */
    function getExchangeStats() external view returns (
        uint256 totalCreated,
        uint256 totalCompleted,
        uint256 totalDisputed,
        uint256 totalCancelled,
        uint256 totalExpired,
        uint256 totalHoursExchanged
    );
}