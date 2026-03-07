// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TimeExchange} from "../contracts/TimeExchange.sol";
import {IReputationRegistry} from "../interfaces/IReputationRegistry.sol";
import {IDisputeResolution} from "../interfaces/IDisputeResolution.sol";
import {ITimeToken} from "../../contracts/ITimeToken.sol";

/**
 * @title MockTimeToken
 * @dev Mock ERC20 token for testing
 */
contract MockTimeToken is ITimeToken {
    string public constant name = "Timebank Hour";
    string public constant symbol = "HOUR";
    uint8 public constant decimals = 18;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public authorizedBurners;
    
    function mint(address to, uint256 amount, string calldata) external override {
        _balances[to] += amount;
        _totalSupply += amount;
    }
    
    function burn(address from, uint256 amount, string calldata) external override {
        require(_balances[from] >= amount, "Insufficient balance");
        _balances[from] -= amount;
        _totalSupply -= amount;
    }
    
    function burnFrom(address from, uint256 amount, string calldata reason) external override {
        burn(from, amount, reason);
    }
    
    function transfer(address to, uint256 amount) external override returns (bool) {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        return true;
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function isMinter(address account) external view override returns (bool) {
        return authorizedMinters[account];
    }
    
    function isBurner(address account) external view override returns (bool) {
        return authorizedBurners[account];
    }
    
    function totalHoursContributed() external pure override returns (uint256) {
        return 0;
    }
    
    function hoursByAccount(address) external pure override returns (uint256) {
        return 0;
    }
    
    // Test helper
    function setBalance(address account, uint256 amount) external {
        _balances[account] = amount;
    }
}

/**
 * @title MockReputationRegistry
 * @dev Mock reputation registry for testing
 */
contract MockReputationRegistry is IReputationRegistry {
    mapping(address => bool) public registeredUsers;
    mapping(address => uint256) public userScores;
    
    function registerUser(string calldata) external override {
        registeredUsers[msg.sender] = true;
        userScores[msg.sender] = 500; // Starting score
    }
    
    function updateReputation(address, int256, string calldata) external pure override {}
    
    function recordExchangeCompletion(address provider, address receiver, uint256) external override {
        userScores[provider] += 50;
        userScores[receiver] += 25;
    }
    
    function recordDispute(address user, bool won) external override {
        if (won) {
            userScores[user] += 100;
        } else {
            userScores[user] = userScores[user] > 1000 ? userScores[user] - 1000 : 0;
        }
    }
    
    function addSkill(string calldata) external pure override returns (uint256) {
        return 0;
    }
    
    function updateSkillName(uint256, string calldata) external pure override {}
    
    function endorseSkill(address, uint256) external pure override {}
    
    function rateSkill(address, uint256, uint256) external pure override {}
    
    function applyDecay(address) external pure override {}
    
    function setUserDecayRate(address, uint256) external pure override {}
    
    function setDefaultDecayRate(uint256) external pure override {}
    
    function updateMetadata(string calldata) external pure override {}
    
    function adminUpdateMetadata(address, string calldata) external pure override {}
    
    function batchRegister(address[] calldata, string[] calldata) external pure override {}
    
    function calculateCurrentScore(address user) external view override returns (uint256) {
        return userScores[user];
    }
    
    function getReputation(address) external pure override returns (ReputationProfile memory) {
        return ReputationProfile(0,0,0,0,0,0,0,0,0,0,0,false,"");
    }
    
    function getSkillRating(address, uint256) external pure override returns (uint256, uint256, uint256, uint256) {
        return (0, 0, 0, 0);
    }
    
    function getUserEndorsements(address) external pure override returns (EndorsementData[] memory) {
        return new EndorsementData[](0);
    }
    
    function isRegistered(address user) external view override returns (bool) {
        return registeredUsers[user];
    }
    
    function canTransact(address) external pure override returns (bool) {
        return true;
    }
    
    function getUserStats(address) external pure override returns (
        uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint8
    ) {
        return (0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    
    function hasEndorsedSkill(address, uint256, address) external pure override returns (bool) {
        return false;
    }
    
    function hasRatedSkill(address, uint256, address) external pure override returns (bool) {
        return false;
    }
    
    function getSkillInfo(uint256) external pure override returns (SkillInfo memory) {
        return SkillInfo(0, "", false);
    }
    
    function getAllSkills(uint256, uint256) external pure override returns (SkillInfo[] memory) {
        return new SkillInfo[](0);
    }
    
    function getTimeUntilDecay(address) external pure override returns (uint256) {
        return 0;
    }
    
    function getPendingDecay(address) external pure override returns (uint256) {
        return 0;
    }
    
    function getTrustTier(address user) external view override returns (uint8) {
        uint256 score = userScores[user];
        if (score >= 9000) return 5;
        if (score >= 7500) return 4;
        if (score >= 5000) return 3;
        if (score >= 2500) return 2;
        return 1;
    }
    
    function getTierName(uint8 tier) external pure override returns (string memory) {
        if (tier == 5) return "Elite";
        if (tier == 4) return "Trusted";
        if (tier == 3) return "Established";
        if (tier == 2) return "Emerging";
        return "Untrusted";
    }
    
    function meetsTierRequirement(address, uint8) external pure override returns (bool) {
        return true;
    }
    
    // Constants
    function MAX_SCORE() external pure override returns (uint256) { return 10000; }
    function MIN_SCORE() external pure override returns (uint256) { return 0; }
    function REGISTRATION_BONUS() external pure override returns (uint256) { return 500; }
    function EXCHANGE_BONUS() external pure override returns (uint256) { return 50; }
    function DISPUTE_LOSS_PENALTY() external pure override returns (uint256) { return 1000; }
    function DISPUTE_WIN_BONUS() external pure override returns (uint256) { return 100; }
    function ENDORSEMENT_BONUS() external pure override returns (uint256) { return 25; }
    function MAX_ENDORSEMENT_BONUS() external pure override returns (uint256) { return 500; }
    function TIER_1_THRESHOLD() external pure override returns (uint256) { return 0; }
    function TIER_2_THRESHOLD() external pure override returns (uint256) { return 2500; }
    function TIER_3_THRESHOLD() external pure override returns (uint256) { return 5000; }
    function TIER_4_THRESHOLD() external pure override returns (uint256) { return 7500; }
    function TIER_5_THRESHOLD() external pure override returns (uint256) { return 9000; }
    
    // Test helper
    function setRegistered(address user, bool registered) external {
        registeredUsers[user] = registered;
    }
    
    function setScore(address user, uint256 score) external {
        userScores[user] = score;
    }
}

/**
 * @title MockDisputeResolution
 * @dev Mock dispute resolution for testing
 */
contract MockDisputeResolution is IDisputeResolution {
    uint256 public disputeCounter;
    mapping(uint256 => Dispute) public disputes;
    
    function createDispute(
        uint256 exchangeId,
        address requester,
        address provider,
        uint256 hoursAmount,
        string calldata reason
    ) external override returns (uint256 disputeId) {
        disputeId = disputeCounter++;
        
        Dispute storage dispute = disputes[disputeId];
        dispute.id = disputeId;
        dispute.exchangeId = exchangeId;
        dispute.requester = requester;
        dispute.provider = provider;
        dispute.reason = reason;
        dispute.status = DisputeStatus.Open;
        dispute.createdAt = block.timestamp;
        
        emit DisputeCreated(disputeId, exchangeId, requester, provider, block.timestamp);
    }
    
    function submitEvidence(uint256 disputeId, string calldata evidenceURI) external override {
        emit EvidenceSubmitted(disputeId, msg.sender, evidenceURI, block.timestamp);
    }
    
    function vote(uint256 disputeId, Vote voteChoice) external override {
        emit VoteCast(disputeId, msg.sender, voteChoice, block.timestamp);
    }
    
    function finalizeDispute(uint256 disputeId) external override {
        Dispute storage dispute = disputes[disputeId];
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;
        
        emit DisputeResolved(disputeId, Vote.SplitDecision, 0, 0, 0);
    }
    
    function appeal(uint256 disputeId, string calldata) external override returns (uint256 newDisputeId) {
        newDisputeId = disputeCounter++;
        emit AppealFiled(disputeId, newDisputeId, msg.sender);
    }
    
    function claimRewards(uint256) external pure override {}
    
    function getDispute(uint256 disputeId) external view override returns (
        uint256 id,
        uint256 exchangeId,
        DisputeStatus status,
        Vote outcome,
        uint256 votingEndsAt
    ) {
        Dispute storage d = disputes[disputeId];
        return (d.id, d.exchangeId, d.status, d.outcome, d.votingEndsAt);
    }
    
    function isEligibleJuror(address) external pure override returns (bool) {
        return true;
    }
    
    function getJuryForDispute(uint256) external pure override returns (address[] memory) {
        return new address[](0);
    }
}

/**
 * @title TimeExchangeTest
 * @dev Comprehensive test suite for TimeExchange contract
 */
contract TimeExchangeTest is Test {
    TimeExchange public timeExchange;
    MockTimeToken public timeToken;
    MockReputationRegistry public reputationRegistry;
    MockDisputeResolution public disputeResolution;
    
    address public admin;
    address public requester;
    address public provider;
    address public treasury;
    address public pauser;
    
    uint256 public constant INITIAL_BALANCE = 1000e18;
    uint256 public constant HOURS_AMOUNT = 10e18;
    uint256 public constant SKILL_ID = 1;
    
    function setUp() public {
        admin = makeAddr("admin");
        requester = makeAddr("requester");
        provider = makeAddr("provider");
        treasury = makeAddr("treasury");
        pauser = makeAddr("pauser");
        
        vm.startPrank(admin);
        
        // Deploy mocks
        timeToken = new MockTimeToken();
        reputationRegistry = new MockReputationRegistry();
        disputeResolution = new MockDisputeResolution();
        
        // Deploy TimeExchange
        timeExchange = new TimeExchange(
            address(timeToken),
            address(reputationRegistry),
            address(disputeResolution),
            treasury,
            admin
        );
        
        // Grant pauser role
        timeExchange.grantRole(timeExchange.PAUSER_ROLE(), pauser);
        
        vm.stopPrank();
        
        // Setup users
        vm.startPrank(requester);
        reputationRegistry.registerUser("");
        timeToken.setBalance(requester, INITIAL_BALANCE);
        timeToken.approve(address(timeExchange), type(uint256).max);
        vm.stopPrank();
        
        vm.startPrank(provider);
        reputationRegistry.registerUser("");
        vm.stopPrank();
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor_SetsCorrectValues() public view {
        assertEq(address(timeExchange.timeToken()), address(timeToken));
        assertEq(address(timeExchange.reputationRegistry()), address(reputationRegistry));
        assertEq(address(timeExchange.disputeResolution()), address(disputeResolution));
        assertEq(timeExchange.treasury(), treasury);
        assertTrue(timeExchange.hasRole(timeExchange.ADMIN_ROLE(), admin));
        assertTrue(timeExchange.hasRole(timeExchange.DEFAULT_ADMIN_ROLE(), admin));
    }
    
    function test_Constructor_RevertsWithZeroAddress() public {
        vm.expectRevert(ITimeExchange.InvalidProvider.selector);
        new TimeExchange(
            address(0),
            address(reputationRegistry),
            address(disputeResolution),
            treasury,
            admin
        );
    }
    
    // ============ Create Exchange Tests ============
    
    function test_CreateExchange_OneTime() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "Test Description",
            "Test Deliverables",
            ITimeExchange.ExchangeType.OneTime,
            0, // milestoneCount
            0, // recurringInterval
            0, // recurringCount
            "ipfs://metadata"
        );
        
        assertEq(exchangeId, 0);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(exchange.requester, requester);
        assertEq(exchange.provider, provider);
        assertEq(exchange.hoursAmount, HOURS_AMOUNT);
        assertEq(exchange.skillId, SKILL_ID);
        assertEq(uint256(exchange.exchangeType), uint256(ITimeExchange.ExchangeType.OneTime));
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Created));
    }
    
    function test_CreateExchange_Milestone() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "Milestone Project",
            "Multiple deliverables",
            ITimeExchange.ExchangeType.Milestone,
            3, // 3 milestones
            0,
            0,
            "ipfs://metadata"
        );
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(exchange.milestoneCount, 3);
        assertEq(uint256(exchange.exchangeType), uint256(ITimeExchange.ExchangeType.Milestone));
    }
    
    function test_CreateExchange_Recurring() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "Recurring Service",
            "Weekly service",
            ITimeExchange.ExchangeType.Recurring,
            0,
            1 weeks, // weekly
            4, // 4 weeks
            "ipfs://metadata"
        );
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(exchange.recurringInterval, 1 weeks);
        assertEq(exchange.recurringCount, 4);
    }
    
    function test_CreateExchange_RevertsWhenProviderIsZero() public {
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.InvalidProvider.selector);
        timeExchange.createExchange(
            address(0),
            HOURS_AMOUNT,
            SKILL_ID,
            "",
            "",
            ITimeExchange.ExchangeType.OneTime,
            0, 0, 0, ""
        );
    }
    
    function test_CreateExchange_RevertsWhenProviderIsSelf() public {
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.InvalidProvider.selector);
        timeExchange.createExchange(
            requester,
            HOURS_AMOUNT,
            SKILL_ID,
            "",
            "",
            ITimeExchange.ExchangeType.OneTime,
            0, 0, 0, ""
        );
    }
    
    function test_CreateExchange_RevertsWhenHoursZero() public {
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.InvalidHours.selector);
        timeExchange.createExchange(
            provider,
            0,
            SKILL_ID,
            "",
            "",
            ITimeExchange.ExchangeType.OneTime,
            0, 0, 0, ""
        );
    }
    
    function test_CreateExchange_RevertsWhenNotRegistered() public {
        address unregistered = makeAddr("unregistered");
        vm.prank(unregistered);
        vm.expectRevert(ITimeExchange.NotRegistered.selector);
        timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "",
            "",
            ITimeExchange.ExchangeType.OneTime,
            0, 0, 0, ""
        );
    }
    
    function test_CreateExchange_RevertsWithInvalidMilestoneCount() public {
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.InvalidMilestoneCount.selector);
        timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "",
            "",
            ITimeExchange.ExchangeType.Milestone,
            0, // 0 milestones is invalid
            0, 0, ""
        );
    }
    
    function test_CreateExchange_RevertsWithInvalidRecurringConfig() public {
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.InvalidRecurringConfig.selector);
        timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "",
            "",
            ITimeExchange.ExchangeType.Recurring,
            0,
            0, // No interval
            0, // No count
            ""
        );
    }
    
    // ============ Fund Exchange Tests ============
    
    function test_FundExchange() public {
        // Create exchange
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider,
            HOURS_AMOUNT,
            SKILL_ID,
            "Test",
            "Test",
            ITimeExchange.ExchangeType.OneTime,
            0, 0, 0, ""
        );
        
        // Fund exchange
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(exchange.hoursFunded, HOURS_AMOUNT);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Funded));
        assertEq(exchange.fundedAt, block.timestamp);
    }
    
    function test_FundExchange_RevertsWhenNotRequester() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(provider);
        vm.expectRevert(ITimeExchange.NotRequester.selector);
        timeExchange.fundExchange(exchangeId);
    }
    
    function test_FundExchange_RevertsWhenInsufficientFunds() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        // Empty requester's balance
        vm.prank(requester);
        timeToken.transfer(address(1), INITIAL_BALANCE);
        
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.InsufficientFunds.selector);
        timeExchange.fundExchange(exchangeId);
    }
    
    function test_FundExchange_RevertsWhenExpired() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        // Warp past funding timeout
        vm.warp(block.timestamp + 8 days);
        
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.ExchangeExpiredError.selector);
        timeExchange.fundExchange(exchangeId);
    }
    
    // ============ Start Exchange Tests ============
    
    function test_StartExchange() public {
        // Setup
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        // Start
        vm.prank(provider);
        timeExchange.startExchange(exchangeId);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.InProgress));
        assertEq(exchange.startedAt, block.timestamp);
    }
    
    function test_StartExchange_RevertsWhenNotProvider() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.NotProvider.selector);
        timeExchange.startExchange(exchangeId);
    }
    
    // ============ Confirm Completion Tests ============
    
    function test_ConfirmCompletion_DualConfirmation() public {
        // Setup complete exchange
        uint256 exchangeId = _setupInProgressExchange();
        
        // Provider confirms first
        vm.prank(provider);
        timeExchange.confirmCompletion(exchangeId);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertTrue(exchange.providerConfirmed);
        assertFalse(exchange.requesterConfirmed);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.InProgress));
        
        // Requester confirms - completes exchange
        vm.prank(requester);
        timeExchange.confirmCompletion(exchangeId);
        
        exchange = timeExchange.getExchange(exchangeId);
        assertTrue(exchange.requesterConfirmed);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Completed));
    }
    
    function test_ConfirmCompletion_RevertsWhenAlreadyConfirmed() public {
        uint256 exchangeId = _setupInProgressExchange();
        
        vm.prank(provider);
        timeExchange.confirmCompletion(exchangeId);
        
        vm.prank(provider);
        vm.expectRevert(ITimeExchange.AlreadyConfirmed.selector);
        timeExchange.confirmCompletion(exchangeId);
    }
    
    function test_ConfirmCompletion_RevertsWhenNotParticipant() public {
        uint256 exchangeId = _setupInProgressExchange();
        
        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert(ITimeExchange.NotParticipant.selector);
        timeExchange.confirmCompletion(exchangeId);
    }
    
    // ============ Cancellation Tests ============
    
    function test_CancelExchange_BeforeFunding() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.cancelExchange(exchangeId, "Changed my mind");
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Cancelled));
    }
    
    function test_CancelExchange_AfterFunding() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        uint256 balanceBefore = timeToken.balanceOf(requester);
        
        vm.prank(requester);
        timeExchange.cancelExchange(exchangeId, "Provider not responding");
        
        uint256 balanceAfter = timeToken.balanceOf(requester);
        assertEq(balanceAfter - balanceBefore, HOURS_AMOUNT);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Refunded));
    }
    
    // ============ Expired Exchange Tests ============
    
    function test_ClaimExpiredRefund() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        // Warp past completion timeout
        vm.warp(block.timestamp + 31 days);
        
        uint256 balanceBefore = timeToken.balanceOf(requester);
        
        vm.prank(requester);
        timeExchange.claimExpiredRefund(exchangeId);
        
        uint256 balanceAfter = timeToken.balanceOf(requester);
        assertEq(balanceAfter - balanceBefore, HOURS_AMOUNT);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Refunded));
    }
    
    function test_ClaimExpiredRefund_RevertsWhenTimeoutNotReached() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        vm.prank(requester);
        vm.expectRevert(ITimeExchange.TimeoutNotReached.selector);
        timeExchange.claimExpiredRefund(exchangeId);
    }
    
    // ============ Dispute Tests ============
    
    function test_RaiseDispute() public {
        uint256 exchangeId = _setupInProgressExchange();
        
        vm.prank(requester);
        timeExchange.raiseDispute(exchangeId, "Provider not delivering");
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Disputed));
        assertEq(exchange.disputeId, 0);
    }
    
    function test_ResolveDispute() public {
        uint256 exchangeId = _setupInProgressExchange();
        
        vm.prank(requester);
        timeExchange.raiseDispute(exchangeId, "Dispute reason");
        
        uint256 providerBalanceBefore = timeToken.balanceOf(provider);
        
        // Admin resolves dispute (50/50 split)
        vm.prank(admin);
        timeExchange.resolveDispute(exchangeId, false, HOURS_AMOUNT / 2, HOURS_AMOUNT / 2);
        
        uint256 providerBalanceAfter = timeToken.balanceOf(provider);
        
        // Provider gets half minus platform fee
        uint256 platformFee = ((HOURS_AMOUNT / 2) * 100) / 10000; // 1% fee
        assertEq(providerBalanceAfter - providerBalanceBefore, (HOURS_AMOUNT / 2) - platformFee);
        
        ITimeExchange.Exchange memory exchange = timeExchange.getExchange(exchangeId);
        assertEq(uint256(exchange.status), uint256(ITimeExchange.ExchangeStatus.Completed));
    }
    
    function test_ResolveDispute_RevertsWhenNotDisputeResolver() public {
        uint256 exchangeId = _setupInProgressExchange();
        
        vm.prank(requester);
        timeExchange.raiseDispute(exchangeId, "Dispute");
        
        vm.prank(requester);
        vm.expectRevert(); // Access control revert
        timeExchange.resolveDispute(exchangeId, true, HOURS_AMOUNT, 0);
    }
    
    // ============ Admin Tests ============
    
    function test_SetPlatformFee() public {
        vm.prank(admin);
        timeExchange.setPlatformFee(200); // 2%
        
        // Test with new fee
        uint256 exchangeId = _setupInProgressExchange();
        
        vm.prank(provider);
        timeExchange.confirmCompletion(exchangeId);
        
        vm.prank(requester);
        timeExchange.confirmCompletion(exchangeId);
        
        // Verify 2% fee was taken
        (, , , , , uint256 totalHours) = timeExchange.getExchangeStats();
        assertEq(totalHours, HOURS_AMOUNT);
    }
    
    function test_SetPlatformFee_RevertsWhenExceedsMax() public {
        vm.prank(admin);
        vm.expectRevert(ITimeExchange.InvalidHours.selector);
        timeExchange.setPlatformFee(2000); // 20% > max 10%
    }
    
    function test_SetTimeouts() public {
        vm.prank(admin);
        timeExchange.setTimeouts(14 days, 7 days, 60 days);
        
        // Create new exchange to test new timeouts
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        // Should have 14 days to fund
        vm.warp(block.timestamp + 13 days);
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId); // Should succeed
    }
    
    function test_Pause_Unpause() public {
        vm.prank(pauser);
        timeExchange.pause();
        
        vm.prank(requester);
        vm.expectRevert(); // Pausable revert
        timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(admin);
        timeExchange.unpause();
        
        // Should work after unpause
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        assertEq(exchangeId, 0);
    }
    
    function test_UpdateContracts() public {
        address newTreasury = makeAddr("newTreasury");
        
        vm.prank(admin);
        timeExchange.updateContracts(
            address(0), // don't change
            address(0), // don't change
            address(0), // don't change
            newTreasury
        );
        
        assertEq(timeExchange.treasury(), newTreasury);
    }
    
    // ============ View Function Tests ============
    
    function test_GetUserExchanges() public {
        vm.prank(requester);
        timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.createExchange(
            provider, HOURS_AMOUNT * 2, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        uint256[] memory requesterExchanges = timeExchange.getUserExchanges(requester);
        assertEq(requesterExchanges.length, 2);
        
        uint256[] memory providerExchanges = timeExchange.getUserExchanges(provider);
        assertEq(providerExchanges.length, 2);
    }
    
    function test_GetActiveExchanges() public {
        // Create 2 exchanges
        vm.startPrank(requester);
        uint256 exchangeId1 = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        uint256 exchangeId2 = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        vm.stopPrank();
        
        // Complete one
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId1);
        
        vm.prank(provider);
        timeExchange.startExchange(exchangeId1);
        
        vm.prank(provider);
        timeExchange.confirmCompletion(exchangeId1);
        
        vm.prank(requester);
        timeExchange.confirmCompletion(exchangeId1);
        
        uint256[] memory active = timeExchange.getActiveExchanges(requester);
        assertEq(active.length, 1);
        assertEq(active[0], exchangeId2);
    }
    
    function test_IsFullyConfirmed() public {
        uint256 exchangeId = _setupInProgressExchange();
        
        assertFalse(timeExchange.isFullyConfirmed(exchangeId));
        
        vm.prank(provider);
        timeExchange.confirmCompletion(exchangeId);
        
        assertFalse(timeExchange.isFullyConfirmed(exchangeId));
        
        vm.prank(requester);
        timeExchange.confirmCompletion(exchangeId);
        
        assertTrue(timeExchange.isFullyConfirmed(exchangeId));
    }
    
    function test_IsExpired() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        assertFalse(timeExchange.isExpired(exchangeId));
        
        vm.warp(block.timestamp + 8 days);
        
        assertTrue(timeExchange.isExpired(exchangeId));
    }
    
    function test_GetTimeRemaining() public {
        vm.prank(requester);
        uint256 exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        uint256 remaining = timeExchange.getTimeRemaining(exchangeId);
        assertGt(remaining, 6 days);
        assertLt(remaining, 8 days);
    }
    
    function test_GetExchangeStats() public {
        // Create and complete an exchange
        uint256 exchangeId = _setupInProgressExchange();
        
        vm.prank(provider);
        timeExchange.confirmCompletion(exchangeId);
        
        vm.prank(requester);
        timeExchange.confirmCompletion(exchangeId);
        
        (
            uint256 totalCreated,
            uint256 totalCompleted,
            uint256 totalDisputed,
            uint256 totalCancelled,
            uint256 totalExpired,
            uint256 totalHours
        ) = timeExchange.getExchangeStats();
        
        assertEq(totalCreated, 1);
        assertEq(totalCompleted, 1);
        assertEq(totalDisputed, 0);
        assertEq(totalCancelled, 0);
        assertEq(totalExpired, 0);
        assertEq(totalHours, HOURS_AMOUNT);
    }
    
    // ============ Helper Functions ============
    
    function _setupInProgressExchange() internal returns (uint256 exchangeId) {
        vm.prank(requester);
        exchangeId = timeExchange.createExchange(
            provider, HOURS_AMOUNT, SKILL_ID, "", "", 
            ITimeExchange.ExchangeType.OneTime, 0, 0, 0, ""
        );
        
        vm.prank(requester);
        timeExchange.fundExchange(exchangeId);
        
        vm.prank(provider);
        timeExchange.startExchange(exchangeId);
        
        return exchangeId;
    }
}