// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DisputeResolution
 * @notice Decentralized dispute arbitration for Timebank with rotating jury,
 *         stake-weighted quadratic voting, and appeal mechanism
 * @author Timebank Protocol
 */
contract DisputeResolution is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Enums ============
    
    enum DisputeStatus {
        None,
        Open,           // Accepting evidence
        JurySelection,  // Selecting jury members
        Voting,         // Jury voting phase
        Resolved,       // Decision reached
        Appealed,       // Under appeal
        Finalized       // No more appeals possible
    }

    enum Vote {
        Abstain,
        RequesterWins,
        ProviderWins,
        SplitDecision
    }

    enum Resolution {
        None,
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
        string requesterEvidence;
        string providerEvidence;
        DisputeStatus status;
        Resolution resolution;
        uint256 createdAt;
        uint256 evidenceEndsAt;
        uint256 votingEndsAt;
        uint256 resolvedAt;
        uint256 finalizedAt;
        address[] jury;
        uint256 totalStakeForRequester;
        uint256 totalStakeForProvider;
        uint256 totalStakeForSplit;
        uint256 totalQuadraticVotes;
        uint256 appealCount;
        uint256 appealedDisputeId;  // 0 if not an appeal
        uint256 previousDisputeId;  // For tracking appeal chain
        uint256 jurorRewardPool;
        bool rewardsDistributed;
    }

    struct JurorProfile {
        bool isActive;
        uint256 casesServed;
        uint256 casesWon;           // Voted with majority
        uint256 totalEarned;
        uint256 totalPenalized;
        uint256 reputationAtJoin;
        uint256 joinedAt;
        uint256 lastCaseAt;
    }

    struct VoteInfo {
        Vote vote;
        uint256 stake;              // Amount staked on this vote
        uint256 quadraticWeight;    // sqrt(stake) used for voting power
        bool claimed;
    }

    // ============ State Variables ============
    
    // Token and registry references
    IERC20 public stakingToken;
    address public reputationRegistry;
    address public timeExchange;
    address public treasury;
    
    // Dispute data
    mapping(uint256 => Dispute) public disputes;
    uint256 public disputeCounter;
    
    // Voting data: disputeId => juror => vote info
    mapping(uint256 => mapping(address => VoteInfo)) public votes;
    
    // Juror registry
    mapping(address => JurorProfile) public jurors;
    address[] public jurorPool;
    mapping(address => uint256) public jurorIndex;
    
    // Juror stakes: separate from vote stakes
    mapping(address => uint256) public jurorStakes;
    uint256 public totalJurorStakes;
    
    // Juror rotation: round-robin tracking
    uint256 public lastJurorSelectionIndex;
    mapping(uint256 => mapping(address => bool)) public wasJurorInDispute;
    
    // Configuration
    uint256 public minReputationToBeJuror;
    uint256 public minStakeToBeJuror;
    uint256 public jurySize;
    uint256 public evidencePeriod;
    uint256 public votingPeriod;
    uint256 public appealWindow;
    uint256 public maxAppeals;
    uint256 public maxJurorStake;
    
    // Economic parameters
    uint256 public disputeFee;
    uint256 public jurorRewardRate;
    uint256 public slashingRate;
    
    // Constants
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_JURY_SIZE = 51;
    uint256 public constant MIN_JURY_SIZE = 3;
    uint256 public constant QUADRATIC_PRECISION = 1e18;
    
    // Appeal escalation
    mapping(uint256 => uint256) public appealChain;
    
    // ============ Events ============
    
    event DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed exchangeId,
        address indexed requester,
        address provider,
        string reason,
        uint256 fee
    );
    
    event EvidenceSubmitted(
        uint256 indexed disputeId,
        address indexed submitter,
        string evidenceURI,
        bool isRequester
    );
    
    event JurorRegistered(
        address indexed juror,
        uint256 stake,
        uint256 reputation
    );
    
    event JurorUnregistered(
        address indexed juror,
        uint256 stakeReturned
    );
    
    event StakeIncreased(
        address indexed juror,
        uint256 newTotalStake
    );
    
    event StakeDecreased(
        address indexed juror,
        uint256 newTotalStake
    );
    
    event JurySelected(
        uint256 indexed disputeId,
        address[] jury,
        uint256 selectionSeed
    );
    
    event VoteCast(
        uint256 indexed disputeId,
        address indexed juror,
        Vote vote,
        uint256 stake,
        uint256 quadraticWeight
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        Resolution resolution,
        uint256 requesterAmount,
        uint256 providerAmount,
        uint256 totalJurorRewards
    );
    
    event JurorRewarded(
        uint256 indexed disputeId,
        address indexed juror,
        uint256 reward,
        bool votedWithMajority
    );
    
    event JurorPenalized(
        uint256 indexed disputeId,
        address indexed juror,
        uint256 penalty
    );
    
    event AppealFiled(
        uint256 indexed originalDisputeId,
        uint256 indexed newDisputeId,
        address indexed appellant,
        string reason
    );
    
    event RewardsClaimed(
        uint256 indexed disputeId,
        address indexed juror,
        uint256 amount
    );
    
    event ParametersUpdated(
        uint256 minReputation,
        uint256 minStake,
        uint256 jurySize,
        uint256 evidencePeriod,
        uint256 votingPeriod
    );
    
    event DisputeFeeUpdated(uint256 oldFee, uint256 newFee);
    event JurorRewardRateUpdated(uint256 oldRate, uint256 newRate);
    
    // ============ Modifiers ============
    
    modifier onlyExchange() {
        require(msg.sender == timeExchange, "DisputeResolution: caller is not TimeExchange");
        _;
    }
    
    modifier onlyActiveJuror() {
        require(jurors[msg.sender].isActive, "DisputeResolution: not an active juror");
        _;
    }
    
    modifier validDispute(uint256 disputeId) {
        require(disputeId > 0 && disputeId <= disputeCounter, "DisputeResolution: invalid dispute");
        _;
    }
    
    modifier duringEvidencePeriod(uint256 disputeId) {
        require(
            disputes[disputeId].status == DisputeStatus.Open,
            "DisputeResolution: not in evidence period"
        );
        require(
            block.timestamp <= disputes[disputeId].evidenceEndsAt,
            "DisputeResolution: evidence period ended"
        );
        _;
    }
    
    modifier duringVotingPeriod(uint256 disputeId) {
        require(
            disputes[disputeId].status == DisputeStatus.Voting,
            "DisputeResolution: not in voting period"
        );
        require(
            block.timestamp <= disputes[disputeId].votingEndsAt,
            "DisputeResolution: voting period ended"
        );
        _;
    }
    
    modifier canAppeal(uint256 disputeId) {
        require(
            disputes[disputeId].status == DisputeStatus.Resolved,
            "DisputeResolution: dispute not resolved"
        );
        require(
            block.timestamp <= disputes[disputeId].resolvedAt + appealWindow,
            "DisputeResolution: appeal window closed"
        );
        require(
            disputes[disputeId].appealCount < maxAppeals,
            "DisputeResolution: max appeals reached"
        );
        _;
    }

    // ============ Constructor ============
    
    constructor(
        address _stakingToken,
        address _reputationRegistry,
        address _timeExchange,
        address _treasury,
        uint256 _minReputation,
        uint256 _minStake,
        uint256 _jurySize,
        uint256 _evidencePeriod,
        uint256 _votingPeriod,
        uint256 _appealWindow,
        uint256 _maxAppeals,
        uint256 _disputeFee,
        uint256 _jurorRewardRate
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "DisputeResolution: invalid token");
        require(_reputationRegistry != address(0), "DisputeResolution: invalid registry");
        require(_timeExchange != address(0), "DisputeResolution: invalid exchange");
        require(_jurySize >= MIN_JURY_SIZE && _jurySize <= MAX_JURY_SIZE, "DisputeResolution: invalid jury size");
        
        stakingToken = IERC20(_stakingToken);
        reputationRegistry = _reputationRegistry;
        timeExchange = _timeExchange;
        treasury = _treasury;
        
        minReputationToBeJuror = _minReputation;
        minStakeToBeJuror = _minStake;
        jurySize = _jurySize;
        evidencePeriod = _evidencePeriod;
        votingPeriod = _votingPeriod;
        appealWindow = _appealWindow;
        maxAppeals = _maxAppeals;
        disputeFee = _disputeFee;
        jurorRewardRate = _jurorRewardRate;
        maxJurorStake = 10000 ether;
    }

    // ============ External Functions ============
    
    function fileDispute(
        uint256 exchangeId,
        string calldata reason
    ) external payable whenNotPaused nonReentrant returns (uint256 disputeId) {
        require(bytes(reason).length > 0, "DisputeResolution: reason required");
        require(msg.value >= disputeFee, "DisputeResolution: insufficient fee");
        
        disputeId = _createDispute(exchangeId, msg.sender, address(0), reason);
        
        emit DisputeFiled(disputeId, exchangeId, msg.sender, address(0), reason, msg.value);
        
        return disputeId;
    }
    
    function fileDisputeWithParties(
        uint256 exchangeId,
        address requester,
        address provider,
        string calldata reason
    ) external onlyExchange whenNotPaused nonReentrant returns (uint256 disputeId) {
        disputeId = _createDispute(exchangeId, requester, provider, reason);
        emit DisputeFiled(disputeId, exchangeId, requester, provider, reason, 0);
        return disputeId;
    }
    
    function submitEvidence(
        uint256 disputeId,
        string calldata evidenceURI
    ) external validDispute(disputeId) duringEvidencePeriod(disputeId) {
        Dispute storage dispute = disputes[disputeId];
        bool isRequester = msg.sender == dispute.requester;
        bool isProvider = msg.sender == dispute.provider;
        
        require(isRequester || isProvider, "DisputeResolution: not a party");
        require(bytes(evidenceURI).length > 0, "DisputeResolution: evidence required");
        
        if (isRequester) {
            dispute.requesterEvidence = evidenceURI;
        } else {
            dispute.providerEvidence = evidenceURI;
        }
        
        emit EvidenceSubmitted(disputeId, msg.sender, evidenceURI, isRequester);
    }
    
    function registerAsJuror(uint256 stakeAmount) external whenNotPaused nonReentrant {
        require(!jurors[msg.sender].isActive, "DisputeResolution: already registered");
        require(stakeAmount >= minStakeToBeJuror, "DisputeResolution: insufficient stake");
        require(stakeAmount <= maxJurorStake, "DisputeResolution: stake exceeds maximum");
        
        stakingToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        jurors[msg.sender] = JurorProfile({
            isActive: true,
            casesServed: 0,
            casesWon: 0,
            totalEarned: 0,
            totalPenalized: 0,
            reputationAtJoin: minReputationToBeJuror,
            joinedAt: block.timestamp,
            lastCaseAt: 0
        });
        
        jurorStakes[msg.sender] = stakeAmount;
        totalJurorStakes += stakeAmount;
        
        jurorPool.push(msg.sender);
        jurorIndex[msg.sender] = jurorPool.length;
        
        emit JurorRegistered(msg.sender, stakeAmount, minReputationToBeJuror);
    }
    
    function unregisterAsJuror() external nonReentrant {
        require(jurors[msg.sender].isActive, "DisputeResolution: not registered");
        
        uint256 stake = jurorStakes[msg.sender];
        require(stake > 0, "DisputeResolution: no stake to withdraw");
        
        jurors[msg.sender].isActive = false;
        
        uint256 index = jurorIndex[msg.sender];
        if (index > 0 && index <= jurorPool.length) {
            address lastJuror = jurorPool[jurorPool.length - 1];
            jurorPool[index - 1] = lastJuror;
            jurorIndex[lastJuror] = index;
            jurorPool.pop();
            jurorIndex[msg.sender] = 0;
        }
        
        jurorStakes[msg.sender] = 0;
        totalJurorStakes -= stake;
        stakingToken.safeTransfer(msg.sender, stake);
        
        emit JurorUnregistered(msg.sender, stake);
    }
    
    function increaseStake(uint256 amount) external whenNotPaused onlyActiveJuror nonReentrant {
        require(amount > 0, "DisputeResolution: amount must be positive");
        
        uint256 newStake = jurorStakes[msg.sender] + amount;
        require(newStake <= maxJurorStake, "DisputeResolution: exceeds max stake");
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        jurorStakes[msg.sender] = newStake;
        totalJurorStakes += amount;
        
        emit StakeIncreased(msg.sender, newStake);
    }
    
    function decreaseStake(uint256 amount) external onlyActiveJuror nonReentrant {
        require(amount > 0, "DisputeResolution: amount must be positive");
        require(
            jurorStakes[msg.sender] - amount >= minStakeToBeJuror,
            "DisputeResolution: below minimum stake"
        );
        
        jurorStakes[msg.sender] -= amount;
        totalJurorStakes -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit StakeDecreased(msg.sender, jurorStakes[msg.sender]);
    }
    
    function selectJury(uint256 disputeId) external validDispute(disputeId) whenNotPaused {
        Dispute storage dispute = disputes[disputeId];
        
        require(
            dispute.status == DisputeStatus.Open,
            "DisputeResolution: invalid status"
        );
        require(
            block.timestamp > dispute.evidenceEndsAt || 
            (bytes(dispute.requesterEvidence).length > 0 && bytes(dispute.providerEvidence).length > 0),
            "DisputeResolution: evidence period active"
        );
        require(jurorPool.length >= jurySize, "DisputeResolution: insufficient jurors");
        
        address[] memory selectedJury = _selectJuryRandom(disputeId);
        dispute.jury = selectedJury;
        
        dispute.status = DisputeStatus.Voting;
        dispute.votingEndsAt = block.timestamp + votingPeriod;
        
        for (uint256 i = 0; i < selectedJury.length; i++) {
            jurors[selectedJury[i]].casesServed++;
            jurors[selectedJury[i]].lastCaseAt = block.timestamp;
            wasJurorInDispute[disputeId][selectedJury[i]] = true;
        }
        
        emit JurySelected(disputeId, selectedJury, uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, disputeId))));
    }
    
    function vote(
        uint256 disputeId,
        Vote voteChoice,
        uint256 stakeAmount
    ) external validDispute(disputeId) duringVotingPeriod(disputeId) nonReentrant {
        Dispute storage dispute = disputes[disputeId];
        
        require(wasJurorInDispute[disputeId][msg.sender], "DisputeResolution: not a juror");
        require(votes[disputeId][msg.sender].vote == Vote.Abstain, "DisputeResolution: already voted");
        require(voteChoice != Vote.Abstain, "DisputeResolution: cannot abstain explicitly");
        require(stakeAmount > 0, "DisputeResolution: must stake to vote");
        require(stakeAmount <= jurorStakes[msg.sender], "DisputeResolution: insufficient juror stake");
        
        uint256 quadraticWeight = _sqrt(stakeAmount * QUADRATIC_PRECISION);
        
        votes[disputeId][msg.sender] = VoteInfo({
            vote: voteChoice,
            stake: stakeAmount,
            quadraticWeight: quadraticWeight,
            claimed: false
        });
        
        if (voteChoice == Vote.RequesterWins) {
            dispute.totalStakeForRequester += stakeAmount;
        } else if (voteChoice == Vote.ProviderWins) {
            dispute.totalStakeForProvider += stakeAmount;
        } else {
            dispute.totalStakeForSplit += stakeAmount;
        }
        dispute.totalQuadraticVotes += quadraticWeight;
        
        emit VoteCast(disputeId, msg.sender, voteChoice, stakeAmount, quadraticWeight);
    }
    
    function resolveDispute(uint256 disputeId) external validDispute(disputeId) whenNotPaused {
        Dispute storage dispute = disputes[disputeId];
        
        require(
            dispute.status == DisputeStatus.Voting,
            "DisputeResolution: not in voting"
        );
        require(
            block.timestamp > dispute.votingEndsAt || 
            dispute.totalQuadraticVotes >= _calculateQuorum(disputeId),
            "DisputeResolution: voting ongoing"
        );
        
        Resolution resolution = _calculateResolution(disputeId);
        
        dispute.resolution = resolution;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;
        
        (uint256 requesterAmount, uint256 providerAmount) = _calculateSplit(disputeId, resolution);
        
        uint256 jurorRewards = 0;
        
        emit DisputeResolved(disputeId, resolution, requesterAmount, providerAmount, jurorRewards);
    }
    
    function finalizeDispute(uint256 disputeId) external validDispute(disputeId) {
        Dispute storage dispute = disputes[disputeId];
        
        require(
            dispute.status == DisputeStatus.Resolved,
            "DisputeResolution: not resolved"
        );
        require(
            block.timestamp > dispute.resolvedAt + appealWindow,
            "DisputeResolution: appeal window open"
        );
        
        dispute.status = DisputeStatus.Finalized;
        dispute.finalizedAt = block.timestamp;
        
        if (!dispute.rewardsDistributed) {
            _distributeRewards(disputeId);
        }
    }
    
    function appeal(
        uint256 disputeId,
        string calldata newReason
    ) external payable validDispute(disputeId) canAppeal(disputeId) whenNotPaused nonReentrant returns (uint256 newDisputeId) {
        Dispute storage originalDispute = disputes[disputeId];
        
        require(
            msg.sender == originalDispute.requester || msg.sender == originalDispute.provider,
            "DisputeResolution: only parties can appeal"
        );
        require(msg.value >= disputeFee * 2, "DisputeResolution: insufficient appeal fee");
        require(bytes(newReason).length > 0, "DisputeResolution: reason required");
        
        originalDispute.status = DisputeStatus.Appealed;
        
        newDisputeId = _createAppealDispute(disputeId, newReason);
        
        appealChain[disputeId] = newDisputeId;
        disputes[newDisputeId].previousDisputeId = disputeId;
        
        emit AppealFiled(disputeId, newDisputeId, msg.sender, newReason);
    }
    
    function claimRewards(uint256 disputeId) external validDispute(disputeId) nonReentrant {
        Dispute storage dispute = disputes[disputeId];
        VoteInfo storage voteInfo = votes[disputeId][msg.sender];
        
        require(
            dispute.status == DisputeStatus.Resolved || dispute.status == DisputeStatus.Finalized,
            "DisputeResolution: dispute not resolved"
        );
        require(voteInfo.vote != Vote.Abstain, "DisputeResolution: did not vote");
        require(!voteInfo.claimed, "DisputeResolution: already claimed");
        
        voteInfo.claimed = true;
        
        bool votedWithMajority = _votedWithMajority(disputeId, msg.sender);
        
        if (votedWithMajority) {
            uint256 reward = _calculateReward(disputeId, msg.sender);
            
            if (reward > 0) {
                jurors[msg.sender].totalEarned += reward;
                stakingToken.safeTransfer(msg.sender, reward);
                emit JurorRewarded(disputeId, msg.sender, reward, true);
            }
        } else {
            uint256 penalty = (voteInfo.stake * slashingRate) / BASIS_POINTS;
            if (penalty > 0) {
                jurors[msg.sender].totalPenalized += penalty;
                emit JurorPenalized(disputeId, msg.sender, penalty);
            }
        }
        
        emit RewardsClaimed(disputeId, msg.sender, votedWithMajority ? _calculateReward(disputeId, msg.sender) : 0);
    }
    
    // ============ Admin Functions ============
    
    function setParameters(
        uint256 _minReputation,
        uint256 _minStake,
        uint256 _jurySize,
        uint256 _evidencePeriod,
        uint256 _votingPeriod
    ) external onlyOwner {
        require(_jurySize >= MIN_JURY_SIZE && _jurySize <= MAX_JURY_SIZE, "DisputeResolution: invalid jury size");
        
        minReputationToBeJuror = _minReputation;
        minStakeToBeJuror = _minStake;
        jurySize = _jurySize;
        evidencePeriod = _evidencePeriod;
        votingPeriod = _votingPeriod;
        
        emit ParametersUpdated(_minReputation, _minStake, _jurySize, _evidencePeriod, _votingPeriod);
    }
    
    function setDisputeFee(uint256 _disputeFee) external onlyOwner {
        uint256 oldFee = disputeFee;
        disputeFee = _disputeFee;
        emit DisputeFeeUpdated(oldFee, _disputeFee);
    }
    
    function setJurorRewardRate(uint256 _rate) external onlyOwner {
        require(_rate <= BASIS_POINTS, "DisputeResolution: rate exceeds 100%");
        uint256 oldRate = jurorRewardRate;
        jurorRewardRate = _rate;
        emit JurorRewardRateUpdated(oldRate, _rate);
    }
    
    function setMaxJurorStake(uint256 _maxStake) external onlyOwner {
        maxJurorStake = _maxStake;
    }
    
    function setSlashingRate(uint256 _rate) external onlyOwner {
        require(_rate <= BASIS_POINTS, "DisputeResolution: rate exceeds 100%");
        slashingRate = _rate;
    }
    
    function setTimeExchange(address _timeExchange) external onlyOwner {
        require(_timeExchange != address(0), "DisputeResolution: invalid address");
        timeExchange = _timeExchange;
    }
    
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "DisputeResolution: invalid address");
        treasury = _treasury;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "DisputeResolution: invalid recipient");
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "DisputeResolution: ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    // ============ View Functions ============
    
    function getDispute(uint256 disputeId) external view returns (
        uint256 id,
        uint256 exchangeId,
        address requester,
        address provider,
        DisputeStatus status,
        Resolution resolution,
        uint256 createdAt,
        uint256 votingEndsAt,
        uint256 appealCount
    ) {
        Dispute storage d = disputes[disputeId];
        return (
            d.id,
            d.exchangeId,
            d.requester,
            d.provider,
            d.status,
            d.resolution,
            d.createdAt,
            d.votingEndsAt,
            d.appealCount
        );
    }
    
    function getJury(uint256 disputeId) external view returns (address[] memory) {
        return disputes[disputeId].jury;
    }
    
    function getVote(uint256 disputeId, address juror) external view returns (
        Vote vote,
        uint256 stake,
        uint256 quadraticWeight,
        bool claimed
    ) {
        VoteInfo storage v = votes[disputeId][juror];
        return (v.vote, v.stake, v.quadraticWeight, v.claimed);
    }
    
    function getJurorProfile(address juror) external view returns (JurorProfile memory) {
        return jurors[juror];
    }
    
    function getJurorCount() external view returns (uint256) {
        return jurorPool.length;
    }
    
    function isJurorForDispute(uint256 disputeId, address account) external view returns (bool) {
        return wasJurorInDispute[disputeId][account];
    }
    
    function canBeJuror(address account) external view returns (bool) {
        return jurors[account].isActive && jurorStakes[account] >= minStakeToBeJuror;
    }
    
    function getAppealChain(uint256 disputeId) external view returns (uint256[] memory) {
        uint256[] memory chain = new uint256[](maxAppeals + 1);
        uint256 current = disputeId;
        uint256 i = 0;
        
        while (current != 0 && i <= maxAppeals) {
            chain[i] = current;
            current = appealChain[current];
            i++;
        }
        
        uint256[] memory result = new uint256[](i);
        for (uint256 j = 0; j < i; j++) {
            result[j] = chain[j];
        }
        return result;
    }
    
    function getWinningResolution(uint256 disputeId) external view returns (Resolution) {
        return disputes[disputeId].resolution;
    }
    
    function getVoteTotals(uint256 disputeId) external view returns (
        uint256 forRequester,
        uint256 forProvider,
        uint256 forSplit,
        uint256 totalQuadratic
    ) {
        Dispute storage d = disputes[disputeId];
        return (
            d.totalStakeForRequester,
            d.totalStakeForProvider,
            d.totalStakeForSplit,
            d.totalQuadraticVotes
        );
    }

    // ============ Internal Functions ============
    
    function _createDispute(
        uint256 exchangeId,
        address requester,
        address provider,
        string calldata reason
    ) internal returns (uint256 disputeId) {
        disputeCounter++;
        disputeId = disputeCounter;
        
        Dispute storage dispute = disputes[disputeId];
        dispute.id = disputeId;
        dispute.exchangeId = exchangeId;
        dispute.requester = requester;
        dispute.provider = provider;
        dispute.reason = reason;
        dispute.status = DisputeStatus.Open;
        dispute.createdAt = block.timestamp;
        dispute.evidenceEndsAt = block.timestamp + evidencePeriod;
        dispute.appealCount = 0;
        dispute.appealedDisputeId = 0;
        dispute.previousDisputeId = 0;
        
        return disputeId;
    }
    
    function _createAppealDispute(
        uint256 originalDisputeId,
        string calldata reason
    ) internal returns (uint256 newDisputeId) {
        Dispute storage original = disputes[originalDisputeId];
        
        disputeCounter++;
        newDisputeId = disputeCounter;
        
        uint256 appealJurySize = jurySize + (original.appealCount + 1) * 2;
        if (appealJurySize > MAX_JURY_SIZE) {
            appealJurySize = MAX_JURY_SIZE;
        }
        
        Dispute storage newDispute = disputes[newDisputeId];
        newDispute.id = newDisputeId;
        newDispute.exchangeId = original.exchangeId;
        newDispute.requester = original.requester;
        newDispute.provider = original.provider;
        newDispute.reason = reason;
        newDispute.status = DisputeStatus.Open;
        newDispute.createdAt = block.timestamp;
        newDispute.evidenceEndsAt = block.timestamp + evidencePeriod;
        newDispute.appealCount = original.appealCount + 1;
        newDispute.previousDisputeId = originalDisputeId;
        
        return newDisputeId;
    }
    
    function _selectJuryRandom(uint256 disputeId) internal returns (address[] memory) {
        require(jurorPool.length >= jurySize, "DisputeResolution: not enough jurors");
        
        address[] memory selected = new address[](jurySize);
        bool[] memory used = new bool[](jurorPool.length);
        
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            disputeId,
            lastJurorSelectionIndex
        )));
        
        uint256 selectedCount = 0;
        uint256 attempts = 0;
        uint256 poolLength = jurorPool.length;
        
        while (selectedCount < jurySize && attempts < poolLength * 2) {
            uint256 index = (seed + lastJurorSelectionIndex + attempts) % poolLength;
            
            if (!used[index] && jurors[jurorPool[index]].isActive) {
                selected[selectedCount] = jurorPool[index];
                used[index] = true;
                selectedCount++;
            }
            
            attempts++;
            seed = uint256(keccak256(abi.encodePacked(seed, attempts)));
        }
        
        require(selectedCount == jurySize, "DisputeResolution: could not select full jury");
        
        lastJurorSelectionIndex = (lastJurorSelectionIndex + attempts) % poolLength;
        
        return selected;
    }
    
    function _calculateResolution(uint256 disputeId) internal view returns (Resolution) {
        Dispute storage dispute = disputes[disputeId];
        
        // Use quadratic weights for vote calculation
        uint256 requesterWeight = dispute.totalStakeForRequester > 0 
            ? _sqrt(dispute.totalStakeForRequester * QUADRATIC_PRECISION) 
            : 0;
        uint256 providerWeight = dispute.totalStakeForProvider > 0 
            ? _sqrt(dispute.totalStakeForProvider * QUADRATIC_PRECISION) 
            : 0;
        uint256 splitWeight = dispute.totalStakeForSplit > 0 
            ? _sqrt(dispute.totalStakeForSplit * QUADRATIC_PRECISION) 
            : 0;
        
        if (requesterWeight >= providerWeight && requesterWeight >= splitWeight) {
            return Resolution.RequesterWins;
        } else if (providerWeight >= requesterWeight && providerWeight >= splitWeight) {
            return Resolution.ProviderWins;
        } else {
            return Resolution.SplitDecision;
        }
    }
    
    function _calculateSplit(uint256 disputeId, Resolution resolution) internal view returns (uint256 requesterAmount, uint256 providerAmount) {
        // Simplified - in production, would get exchange value from TimeExchange
        if (resolution == Resolution.RequesterWins) {
            return (100, 0); // 100% to requester
        } else if (resolution == Resolution.ProviderWins) {
            return (0, 100); // 100% to provider
        } else {
            return (50, 50); // 50/50 split
        }
    }
    
    function _calculateQuorum(uint256 disputeId) internal view returns (uint256) {
        // Quorum is 2/3 of jury must vote
        return (jurySize * 2 * QUADRATIC_PRECISION) / 3;
    }
    
    function _votedWithMajority(uint256 disputeId, address juror) internal view returns (bool) {
        Dispute storage dispute = disputes[disputeId];
        VoteInfo storage voteInfo = votes[disputeId][juror];
        
        if (dispute.resolution == Resolution.RequesterWins) {
            return voteInfo.vote == Vote.RequesterWins;
        } else if (dispute.resolution == Resolution.ProviderWins) {
            return voteInfo.vote == Vote.ProviderWins;
        } else {
            return voteInfo.vote == Vote.SplitDecision;
        }
    }
    
    function _calculateReward(uint256 disputeId, address juror) internal view returns (uint256) {
        Dispute storage dispute = disputes[disputeId];
        VoteInfo storage voteInfo = votes[disputeId][juror];
        
        // Calculate proportional reward based on quadratic weight
        if (dispute.totalQuadraticVotes == 0) return 0;
        
        // Simplified reward calculation
        uint256 baseReward = (voteInfo.quadraticWeight * dispute.jurorRewardPool) / dispute.totalQuadraticVotes;
        
        // Bonus for higher stake
        uint256 stakeBonus = (voteInfo.stake * jurorRewardRate) / BASIS_POINTS / 10;
        
        return baseReward + stakeBonus;
    }
    
    function _distributeRewards(uint256 disputeId) internal {
        Dispute storage dispute = disputes[disputeId];
        dispute.rewardsDistributed = true;
        
        // Rewards are claimed individually via claimRewards()
        // This function marks distribution as complete
    }
    
    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        
        uint256 z = x;
        y = (x + 1) / 2;
        while (y < z) {
            z = y;
            y = (x / y + y) / 2;
        }
    }
    
    receive() external payable {}
}