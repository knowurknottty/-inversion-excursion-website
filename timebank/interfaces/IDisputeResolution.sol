// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDisputeResolution
 * @dev Interface for the Timebank Dispute Resolution system
 */
interface IDisputeResolution {
    
    // ============ Enums ============
    
    enum DisputeStatus {
        Open,           // Accepting jury, evidence
        Voting,         // Jury voting phase
        Resolved,       // Decision reached
        Appealable,     // Can be appealed
        Appealed,       // Under appeal
        Finalized       // No more appeals possible
    }
    
    enum Vote {
        Abstain,
        RequesterWins,
        ProviderWins,
        SplitDecision
    }
    
    // ============ Structs ============
    
    struct Dispute {
        uint256 id;
        uint256 exchangeId;
        address requester;
        address provider;
        string reason;
        DisputeStatus status;
        uint256 createdAt;
        uint256 votingEndsAt;
        uint256 resolvedAt;
        Vote outcome;
        uint256 providerAward;
        uint256 requesterRefund;
        address[] jury;
        uint256 totalVotes;
        uint256 appealCount;
        uint256 previousDisputeId;
    }
    
    // ============ Events ============
    
    event DisputeCreated(
        uint256 indexed id,
        uint256 indexed exchangeId,
        address indexed requester,
        address provider,
        uint256 createdAt
    );
    
    event EvidenceSubmitted(
        uint256 indexed id,
        address indexed by,
        string evidenceURI,
        uint256 timestamp
    );
    
    event JurorSelected(
        uint256 indexed id,
        address indexed juror,
        uint256 stake
    );
    
    event VoteCast(
        uint256 indexed id,
        address indexed juror,
        Vote vote,
        uint256 timestamp
    );
    
    event DisputeResolved(
        uint256 indexed id,
        Vote outcome,
        uint256 providerAward,
        uint256 requesterRefund,
        uint256 jurorRewards
    );
    
    event JurorRewarded(
        uint256 indexed id,
        address indexed juror,
        uint256 amount
    );
    
    event JurorPenalized(
        uint256 indexed id,
        address indexed juror,
        uint256 amount
    );
    
    event AppealFiled(
        uint256 indexed id,
        uint256 newDisputeId,
        address indexed appellant
    );
    
    // ============ Core Functions ============
    
    /**
     * @dev Create a new dispute (called by TimeExchange)
     * @param exchangeId ID of the exchange in dispute
     * @param requester Address of requester
     * @param provider Address of provider
     * @param hoursAmount Total hours in dispute
     * @param reason Reason for dispute
     * @return disputeId The ID of the newly created dispute
     */
    function createDispute(
        uint256 exchangeId,
        address requester,
        address provider,
        uint256 hoursAmount,
        string calldata reason
    ) external returns (uint256 disputeId);
    
    /**
     * @dev Submit evidence for a dispute
     * @param disputeId ID of the dispute
     * @param evidenceURI IPFS hash of evidence
     */
    function submitEvidence(uint256 disputeId, string calldata evidenceURI) external;
    
    /**
     * @dev Cast vote as juror
     * @param disputeId ID of the dispute
     * @param voteChoice Vote choice
     */
    function vote(uint256 disputeId, Vote voteChoice) external;
    
    /**
     * @dev Finalize dispute resolution
     * @param disputeId ID of the dispute to finalize
     */
    function finalizeDispute(uint256 disputeId) external;
    
    /**
     * @dev File an appeal
     * @param disputeId ID of the dispute to appeal
     * @param newEvidence New evidence for appeal
     * @return newDisputeId ID of the appeal dispute
     */
    function appeal(uint256 disputeId, string calldata newEvidence) external returns (uint256 newDisputeId);
    
    /**
     * @dev Claim juror rewards
     * @param disputeId ID of the dispute
     */
    function claimRewards(uint256 disputeId) external;
    
    // ============ View Functions ============
    
    /**
     * @dev Get dispute details
     */
    function getDispute(uint256 disputeId) external view returns (
        uint256 id,
        uint256 exchangeId,
        DisputeStatus status,
        Vote outcome,
        uint256 votingEndsAt
    );
    
    /**
     * @dev Check if address is eligible to be juror
     */
    function isEligibleJuror(address user) external view returns (bool);
    
    /**
     * @dev Get jury for a dispute
     */
    function getJuryForDispute(uint256 disputeId) external view returns (address[] memory);
}