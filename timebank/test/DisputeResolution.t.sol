// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/DisputeResolution.sol";

// Mock ERC20 token for testing
contract MockToken is IERC20 {
    string public name = "Mock Token";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract DisputeResolutionTest is Test {
    DisputeResolution public disputeResolution;
    MockToken public stakingToken;
    
    address public owner;
    address public timeExchange;
    address public reputationRegistry;
    address public treasury;
    address public requester;
    address public provider;
    
    // Juror addresses
    address[] public jurors;
    
    // Constants
    uint256 public constant MIN_STAKE = 100 ether;
    uint256 public constant JURY_SIZE = 5;
    uint256 public constant EVIDENCE_PERIOD = 3 days;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant APPEAL_WINDOW = 2 days;
    uint256 public constant MAX_APPEALS = 2;
    uint256 public constant DISPUTE_FEE = 0.1 ether;
    uint256 public constant JUROR_REWARD_RATE = 500; // 5%

    function setUp() public {
        owner = address(this);
        timeExchange = makeAddr("timeExchange");
        reputationRegistry = makeAddr("reputationRegistry");
        treasury = makeAddr("treasury");
        requester = makeAddr("requester");
        provider = makeAddr("provider");
        
        // Deploy mock token
        stakingToken = new MockToken();
        
        // Deploy DisputeResolution
        disputeResolution = new DisputeResolution(
            address(stakingToken),
            reputationRegistry,
            timeExchange,
            treasury,
            1000, // minReputation
            MIN_STAKE,
            JURY_SIZE,
            EVIDENCE_PERIOD,
            VOTING_PERIOD,
            APPEAL_WINDOW,
            MAX_APPEALS,
            DISPUTE_FEE,
            JUROR_REWARD_RATE
        );
        
        // Create jurors
        for (uint256 i = 0; i < 10; i++) {
            address juror = makeAddr(string(abi.encodePacked("juror", i)));
            jurors.push(juror);
            
            // Mint tokens to juror
            stakingToken.mint(juror, 1000 ether);
            
            // Approve and register
            vm.startPrank(juror);
            stakingToken.approve(address(disputeResolution), type(uint256).max);
            disputeResolution.registerAsJuror(MIN_STAKE + (i * 10 ether));
            vm.stopPrank();
        }
        
        // Fund requester and provider
        vm.deal(requester, 10 ether);
        vm.deal(provider, 10 ether);
    }

    // ============ Dispute Filing Tests ============
    
    function test_FileDispute() public {
        vm.prank(requester);
        uint256 disputeId = disputeResolution.fileDispute{value: DISPUTE_FEE}(1, "Service not delivered");
        
        assertEq(disputeId, 1);
        
        (
            uint256 id,
            uint256 exchangeId,
            address dispRequester,
            address dispProvider,
            DisputeResolution.DisputeStatus status,
            DisputeResolution.Resolution resolution,
            uint256 createdAt,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        assertEq(id, 1);
        assertEq(exchangeId, 1);
        assertEq(dispRequester, requester);
        assertEq(dispProvider, address(0));
        assertEq(uint256(status), uint256(DisputeResolution.DisputeStatus.Open));
        assertEq(uint256(resolution), uint256(DisputeResolution.Resolution.None));
        assertGt(createdAt, 0);
    }
    
    function test_FileDisputeWithParties() public {
        vm.prank(timeExchange);
        
        // Set timeExchange in contract
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        (
            ,
            ,
            address dispRequester,
            address dispProvider,
            ,
            ,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        assertEq(dispRequester, requester);
        assertEq(dispProvider, provider);
    }
    
    function test_Revert_FileDispute_InsufficientFee() public {
        vm.prank(requester);
        vm.expectRevert("DisputeResolution: insufficient fee");
        disputeResolution.fileDispute{value: DISPUTE_FEE - 1}(1, "Service not delivered");
    }
    
    function test_Revert_FileDispute_EmptyReason() public {
        vm.prank(requester);
        vm.expectRevert("DisputeResolution: reason required");
        disputeResolution.fileDispute{value: DISPUTE_FEE}(1, "");
    }

    // ============ Evidence Submission Tests ============
    
    function test_SubmitEvidence() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://requester-evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://provider-evidence");
    }
    
    function test_Revert_SubmitEvidence_NotParty() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        address randomUser = makeAddr("random");
        vm.prank(randomUser);
        vm.expectRevert("DisputeResolution: not a party");
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
    }

    // ============ Juror Registration Tests ============
    
    function test_RegisterAsJuror() public {
        address newJuror = makeAddr("newJuror");
        stakingToken.mint(newJuror, 1000 ether);
        
        vm.startPrank(newJuror);
        stakingToken.approve(address(disputeResolution), MIN_STAKE);
        disputeResolution.registerAsJuror(MIN_STAKE);
        vm.stopPrank();
        
        DisputeResolution.JurorProfile memory profile = disputeResolution.getJurorProfile(newJuror);
        assertTrue(profile.isActive);
        assertEq(profile.casesServed, 0);
        assertEq(profile.reputationAtJoin, 1000);
        
        assertEq(disputeResolution.jurorStakes(newJuror), MIN_STAKE);
        assertEq(disputeResolution.getJurorCount(), 11); // 10 from setup + 1 new
    }
    
    function test_Revert_RegisterAsJuror_InsufficientStake() public {
        address newJuror = makeAddr("newJuror");
        stakingToken.mint(newJuror, 1000 ether);
        
        vm.startPrank(newJuror);
        stakingToken.approve(address(disputeResolution), MIN_STAKE);
        vm.expectRevert("DisputeResolution: insufficient stake");
        disputeResolution.registerAsJuror(MIN_STAKE - 1);
        vm.stopPrank();
    }
    
    function test_Revert_RegisterAsJuror_AlreadyRegistered() public {
        vm.startPrank(jurors[0]);
        vm.expectRevert("DisputeResolution: already registered");
        disputeResolution.registerAsJuror(MIN_STAKE);
        vm.stopPrank();
    }
    
    function test_UnregisterAsJuror() public {
        uint256 initialStake = disputeResolution.jurorStakes(jurors[0]);
        uint256 initialBalance = stakingToken.balanceOf(jurors[0]);
        
        vm.prank(jurors[0]);
        disputeResolution.unregisterAsJuror();
        
        DisputeResolution.JurorProfile memory profile = disputeResolution.getJurorProfile(jurors[0]);
        assertFalse(profile.isActive);
        assertEq(disputeResolution.jurorStakes(jurors[0]), 0);
        assertEq(stakingToken.balanceOf(jurors[0]), initialBalance + initialStake);
    }
    
    function test_IncreaseStake() public {
        uint256 increaseAmount = 50 ether;
        uint256 initialStake = disputeResolution.jurorStakes(jurors[0]);
        
        vm.startPrank(jurors[0]);
        stakingToken.approve(address(disputeResolution), increaseAmount);
        disputeResolution.increaseStake(increaseAmount);
        vm.stopPrank();
        
        assertEq(disputeResolution.jurorStakes(jurors[0]), initialStake + increaseAmount);
    }
    
    function test_DecreaseStake() public {
        uint256 decreaseAmount = 10 ether;
        uint256 initialStake = disputeResolution.jurorStakes(jurors[0]);
        
        vm.prank(jurors[0]);
        disputeResolution.decreaseStake(decreaseAmount);
        
        assertEq(disputeResolution.jurorStakes(jurors[0]), initialStake - decreaseAmount);
    }
    
    function test_Revert_DecreaseStake_BelowMinimum() public {
        uint256 currentStake = disputeResolution.jurorStakes(jurors[0]);
        
        vm.prank(jurors[0]);
        vm.expectRevert("DisputeResolution: below minimum stake");
        disputeResolution.decreaseStake(currentStake - MIN_STAKE + 1);
    }

    // ============ Jury Selection Tests ============
    
    function test_SelectJury() public {
        // Setup dispute with both parties
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        // Submit evidence
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://requester-evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://provider-evidence");
        
        // Select jury
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        assertEq(jury.length, JURY_SIZE);
        
        // Verify all jurors are unique
        for (uint256 i = 0; i < jury.length; i++) {
            for (uint256 j = i + 1; j < jury.length; j++) {
                assertTrue(jury[i] != jury[j], "Jury members should be unique");
            }
        }
        
        // Verify dispute status updated
        (
            ,
            ,
            ,
            ,
            DisputeResolution.DisputeStatus status,
            ,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        assertEq(uint256(status), uint256(DisputeResolution.DisputeStatus.Voting));
    }
    
    function test_Revert_SelectJury_InsufficientJurors() public {
        // Unregister all but 2 jurors
        for (uint256 i = 2; i < jurors.length; i++) {
            vm.prank(jurors[i]);
            disputeResolution.unregisterAsJuror();
        }
        
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        // Wait for evidence period
        vm.warp(block.timestamp + EVIDENCE_PERIOD + 1);
        
        vm.expectRevert("DisputeResolution: insufficient jurors");
        disputeResolution.selectJury(disputeId);
    }

    // ============ Voting Tests ============
    
    function test_Vote() public {
        // Setup and select jury
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://requester-evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://provider-evidence");
        
        disputeResolution.selectJury(disputeId);
        
        // Get jury and have them vote
        address[] memory jury = disputeResolution.getJury(disputeId);
        uint256 voteStake = 50 ether;
        
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(
                disputeId,
                i % 2 == 0 ? DisputeResolution.Vote.RequesterWins : DisputeResolution.Vote.ProviderWins,
                voteStake
            );
        }
        
        // Verify votes recorded
        (
            uint256 forRequester,
            uint256 forProvider,
            uint256 forSplit,
            uint256 totalQuadratic
        ) = disputeResolution.getVoteTotals(disputeId);
        
        assertGt(forRequester, 0);
        assertGt(forProvider, 0);
        assertEq(forSplit, 0);
        assertGt(totalQuadratic, 0);
    }
    
    function test_Revert_Vote_AlreadyVoted() public {
        // Setup and select jury
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        vm.prank(jury[0]);
        disputeResolution.vote(disputeId, DisputeResolution.Vote.RequesterWins, 50 ether);
        
        vm.prank(jury[0]);
        vm.expectRevert("DisputeResolution: already voted");
        disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
    }
    
    function test_Revert_Vote_NotJuror() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address nonJuror = makeAddr("nonJuror");
        vm.prank(nonJuror);
        vm.expectRevert("DisputeResolution: not a juror");
        disputeResolution.vote(disputeId, DisputeResolution.Vote.RequesterWins, 50 ether);
    }

    // ============ Resolution Tests ============
    
    function test_ResolveDispute_RequesterWins() public {
        // Setup dispute with voting
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        // Majority votes for requester
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            if (i < 4) {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.RequesterWins, 50 ether);
            } else {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 30 ether);
            }
        }
        
        // Wait for voting period to end
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        
        disputeResolution.resolveDispute(disputeId);
        
        (
            ,
            ,
            ,
            ,
            DisputeResolution.DisputeStatus status,
            DisputeResolution.Resolution resolution,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        assertEq(uint256(status), uint256(DisputeResolution.DisputeStatus.Resolved));
        assertEq(uint256(resolution), uint256(DisputeResolution.Resolution.RequesterWins));
    }
    
    function test_ResolveDispute_SplitDecision() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        // Mixed votes leading to split
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            if (i == 0 || i == 1) {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.RequesterWins, 40 ether);
            } else if (i == 2 || i == 3) {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 40 ether);
            } else {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.SplitDecision, 100 ether);
            }
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        
        disputeResolution.resolveDispute(disputeId);
        
        (
            ,
            ,
            ,
            ,
            ,
            DisputeResolution.Resolution resolution,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        // Should be split due to high quadratic weight on split votes
        assertEq(uint256(resolution), uint256(DisputeResolution.Resolution.SplitDecision));
    }

    // ============ Appeal Tests ============
    
    function test_Appeal() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        // Appeal
        uint256 appealFee = DISPUTE_FEE * 2;
        vm.prank(requester);
        uint256 newDisputeId = disputeResolution.appeal{value: appealFee}(disputeId, "New evidence available");
        
        assertEq(newDisputeId, 2);
        
        (
            ,
            ,
            ,
            ,
            DisputeResolution.DisputeStatus originalStatus,
            ,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        assertEq(uint256(originalStatus), uint256(DisputeResolution.DisputeStatus.Appealed));
        
        // Check appeal chain
        uint256[] memory chain = disputeResolution.getAppealChain(disputeId);
        assertEq(chain.length, 2);
        assertEq(chain[0], disputeId);
        assertEq(chain[1], newDisputeId);
    }
    
    function test_Revert_Appeal_OnlyParties() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        address randomUser = makeAddr("random");
        vm.deal(randomUser, 1 ether);
        
        vm.prank(randomUser);
        vm.expectRevert("DisputeResolution: only parties can appeal");
        disputeResolution.appeal{value: DISPUTE_FEE * 2}(disputeId, "New evidence");
    }
    
    function test_Revert_Appeal_WindowClosed() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        // Wait for appeal window to close
        vm.warp(block.timestamp + APPEAL_WINDOW + 1);
        
        vm.prank(requester);
        vm.expectRevert("DisputeResolution: appeal window closed");
        disputeResolution.appeal{value: DISPUTE_FEE * 2}(disputeId, "New evidence");
    }

    // ============ Finalization Tests ============
    
    function test_FinalizeDispute() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        // Wait for appeal window
        vm.warp(block.timestamp + APPEAL_WINDOW + 1);
        
        disputeResolution.finalizeDispute(disputeId);
        
        (
            ,
            ,
            ,
            ,
            DisputeResolution.DisputeStatus status,
            ,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        assertEq(uint256(status), uint256(DisputeResolution.DisputeStatus.Finalized));
    }
    
    function test_Revert_Finalize_AppealWindowOpen() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        // Don't wait for appeal window
        vm.expectRevert("DisputeResolution: appeal window open");
        disputeResolution.finalizeDispute(disputeId);
    }

    // ============ Reward Claiming Tests ============
    
    function test_ClaimRewards_Majority() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        // All vote for provider (unanimous)
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        vm.warp(block.timestamp + APPEAL_WINDOW + 1);
        disputeResolution.finalizeDispute(disputeId);
        
        // All jurors claim rewards
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.claimRewards(disputeId);
            
            DisputeResolution.JurorProfile memory profile = disputeResolution.getJurorProfile(jury[i]);
            // Jurors who voted with majority should have casesWon incremented
            assertEq(profile.casesWon, 1);
        }
    }
    
    function test_ClaimRewards_Minority() public {
        // Set slashing rate for this test
        disputeResolution.setSlashingRate(1000); // 10%
        
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        // Majority for provider, minority for requester
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            if (i < 4) {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
            } else {
                disputeResolution.vote(disputeId, DisputeResolution.Vote.RequesterWins, 50 ether);
            }
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        vm.warp(block.timestamp + APPEAL_WINDOW + 1);
        disputeResolution.finalizeDispute(disputeId);
        
        // Minority juror claims and gets penalized
        vm.prank(jury[4]);
        disputeResolution.claimRewards(disputeId);
        
        DisputeResolution.JurorProfile memory profile = disputeResolution.getJurorProfile(jury[4]);
        assertGt(profile.totalPenalized, 0);
    }
    
    function test_Revert_ClaimRewards_AlreadyClaimed() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        vm.warp(block.timestamp + APPEAL_WINDOW + 1);
        disputeResolution.finalizeDispute(disputeId);
        
        vm.prank(jury[0]);
        disputeResolution.claimRewards(disputeId);
        
        vm.prank(jury[0]);
        vm.expectRevert("DisputeResolution: already claimed");
        disputeResolution.claimRewards(disputeId);
    }

    // ============ Admin Function Tests ============
    
    function test_SetParameters() public {
        disputeResolution.setParameters(
            2000, // minReputation
            200 ether, // minStake
            7, // jurySize
            5 days, // evidencePeriod
            10 days // votingPeriod
        );
        
        assertEq(disputeResolution.minReputationToBeJuror(), 2000);
        assertEq(disputeResolution.minStakeToBeJuror(), 200 ether);
        assertEq(disputeResolution.jurySize(), 7);
    }
    
    function test_Revert_SetParameters_InvalidJurySize() public {
        vm.expectRevert("DisputeResolution: invalid jury size");
        disputeResolution.setParameters(1000, 100 ether, 2, 3 days, 7 days);
    }
    
    function test_SetDisputeFee() public {
        uint256 newFee = 0.2 ether;
        disputeResolution.setDisputeFee(newFee);
        assertEq(disputeResolution.disputeFee(), newFee);
    }
    
    function test_SetSlashingRate() public {
        uint256 newRate = 2000; // 20%
        disputeResolution.setSlashingRate(newRate);
        assertEq(disputeResolution.slashingRate(), newRate);
    }
    
    function test_Revert_SetSlashingRate_TooHigh() public {
        vm.expectRevert("DisputeResolution: rate exceeds 100%");
        disputeResolution.setSlashingRate(10001);
    }
    
    function test_PauseAndUnpause() public {
        disputeResolution.pause();
        
        vm.prank(requester);
        vm.expectRevert("Pausable: paused");
        disputeResolution.fileDispute{value: DISPUTE_FEE}(1, "test");
        
        disputeResolution.unpause();
        
        vm.prank(requester);
        disputeResolution.fileDispute{value: DISPUTE_FEE}(1, "test");
    }
    
    function test_EmergencyWithdraw() public {
        // Send ETH to contract
        vm.deal(address(disputeResolution), 1 ether);
        
        uint256 balanceBefore = address(owner).balance;
        disputeResolution.emergencyWithdraw(address(0), 0.5 ether, owner);
        
        assertEq(address(owner).balance, balanceBefore + 0.5 ether);
    }

    // ============ Quadratic Voting Tests ============
    
    function test_QuadraticVoting_Calculation() public {
        // A juror with 4x stake should have 2x voting power
        uint256 stake1 = 100 ether;
        uint256 stake2 = 400 ether;
        
        // sqrt(100) = 10, sqrt(400) = 20
        // So juror 2 has 2x the voting power with 4x the stake
        
        // This test verifies the quadratic formula through vote outcomes
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        // Juror 0 votes with 400 ether (should have sqrt(400) = 20 weight)
        vm.prank(jury[0]);
        disputeResolution.vote(disputeId, DisputeResolution.Vote.RequesterWins, 400 ether);
        
        // Jurors 1-4 vote with 100 ether each (should have sqrt(100) = 10 weight each, total 40)
        for (uint256 i = 1; i <= 4; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 100 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        (
            ,
            ,
            ,
            ,
            ,
            DisputeResolution.Resolution resolution,
            ,
            ,

        ) = disputeResolution.getDispute(disputeId);
        
        // Provider should win: 40 > 20
        assertEq(uint256(resolution), uint256(DisputeResolution.Resolution.ProviderWins));
    }

    // ============ Rotating Jury Tests ============
    
    function test_JuryRotation_MultipleDisputes() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        uint256[] memory disputeIds = new uint256[](3);
        
        for (uint256 d = 0; d < 3; d++) {
            vm.prank(timeExchange);
            disputeIds[d] = disputeResolution.fileDisputeWithParties(d + 1, requester, provider, "dispute");
            
            vm.prank(requester);
            disputeResolution.submitEvidence(disputeIds[d], "ipfs://evidence");
            
            vm.prank(provider);
            disputeResolution.submitEvidence(disputeIds[d], "ipfs://evidence");
            
            disputeResolution.selectJury(disputeIds[d]);
        }
        
        // Verify each dispute has a different jury composition
        for (uint256 i = 0; i < disputeIds.length; i++) {
            for (uint256 j = i + 1; j < disputeIds.length; j++) {
                address[] memory jury1 = disputeResolution.getJury(disputeIds[i]);
                address[] memory jury2 = disputeResolution.getJury(disputeIds[j]);
                
                // Check that juries are not identical (with high probability)
                bool sameJury = true;
                for (uint256 k = 0; k < JURY_SIZE; k++) {
                    if (jury1[k] != jury2[k]) {
                        sameJury = false;
                        break;
                    }
                }
                
                // Note: There's a small chance juries could be the same by random chance
                // In practice, with 10 jurors and jury size 5, probability is very low
                assertFalse(sameJury, "Juries should be different");
            }
        }
    }

    // ============ Appeal Escalation Tests ============
    
    function test_AppealEscalation_IncreasedJurySize() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        for (uint256 i = 0; i < jury.length; i++) {
            vm.prank(jury[i]);
            disputeResolution.vote(disputeId, DisputeResolution.Vote.ProviderWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(disputeId);
        
        // First appeal
        vm.prank(requester);
        uint256 appeal1Id = disputeResolution.appeal{value: DISPUTE_FEE * 2}(disputeId, "First appeal");
        
        // Wait for evidence period
        vm.warp(block.timestamp + EVIDENCE_PERIOD + 1);
        
        disputeResolution.selectJury(appeal1Id);
        
        address[] memory appeal1Jury = disputeResolution.getJury(appeal1Id);
        // Jury size should be JURY_SIZE + 2 = 7
        assertEq(appeal1Jury.length, JURY_SIZE + 2);
        
        // Vote and resolve first appeal
        for (uint256 i = 0; i < appeal1Jury.length; i++) {
            vm.prank(appeal1Jury[i]);
            disputeResolution.vote(appeal1Id, DisputeResolution.Vote.RequesterWins, 50 ether);
        }
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        disputeResolution.resolveDispute(appeal1Id);
        
        // Second appeal
        vm.prank(provider);
        uint256 appeal2Id = disputeResolution.appeal{value: DISPUTE_FEE * 2}(appeal1Id, "Second appeal");
        
        vm.warp(block.timestamp + EVIDENCE_PERIOD + 1);
        disputeResolution.selectJury(appeal2Id);
        
        address[] memory appeal2Jury = disputeResolution.getJury(appeal2Id);
        // Jury size should be JURY_SIZE + 4 = 9
        assertEq(appeal2Jury.length, JURY_SIZE + 4);
    }

    // ============ View Function Tests ============
    
    function test_CanBeJuror() public {
        assertTrue(disputeResolution.canBeJuror(jurors[0]));
        
        // Unregister
        vm.prank(jurors[0]);
        disputeResolution.unregisterAsJuror();
        
        assertFalse(disputeResolution.canBeJuror(jurors[0]));
    }
    
    function test_IsJurorForDispute() public {
        vm.prank(timeExchange);
        disputeResolution.setTimeExchange(timeExchange);
        
        vm.prank(timeExchange);
        uint256 disputeId = disputeResolution.fileDisputeWithParties(1, requester, provider, "Quality dispute");
        
        vm.prank(requester);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        vm.prank(provider);
        disputeResolution.submitEvidence(disputeId, "ipfs://evidence");
        
        disputeResolution.selectJury(disputeId);
        
        address[] memory jury = disputeResolution.getJury(disputeId);
        
        for (uint256 i = 0; i < jury.length; i++) {
            assertTrue(disputeResolution.isJurorForDispute(disputeId, jury[i]));
        }
        
        assertFalse(disputeResolution.isJurorForDispute(disputeId, requester));
        assertFalse(disputeResolution.isJurorForDispute(disputeId, provider));
    }
}