// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

import "../contracts/ScrollCard.sol";
import "../contracts/VictoryMinter.sol";
import "../contracts/CellRegistry.sol";
import "../contracts/TradingPost.sol";
import "../contracts/GamePaymaster.sol";
import "../contracts/TheInversionExcursion.sol";

/**
 * @title TheInversionExcursionTest
 * @notice Comprehensive test suite for The Inversion Excursion contracts
 */
contract TheInversionExcursionTest is Test {
    // Contracts
    ScrollCard public scrollCard;
    VictoryMinter public victoryMinter;
    CellRegistry public cellRegistry;
    TradingPost public tradingPost;
    GamePaymaster public gamePaymaster;
    TheInversionExcursion public game;
    ProxyAdmin public proxyAdmin;

    // Test addresses
    address public admin;
    address public player1;
    address public player2;
    address public player3;
    address public gameMaster;
    address public entryPoint;

    // Constants
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant TRADING_POST_ROLE = keccak256("TRADING_POST_ROLE");

    function setUp() public {
        admin = makeAddr("admin");
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
        player3 = makeAddr("player3");
        gameMaster = makeAddr("gameMaster");
        entryPoint = makeAddr("entryPoint");

        vm.startPrank(admin);

        // Deploy ProxyAdmin
        proxyAdmin = new ProxyAdmin();
        proxyAdmin.transferOwnership(admin);

        // Deploy ScrollCard
        scrollCard = new ScrollCard(
            "Inversion Scrolls",
            "SCROLL",
            "https://api.inversionexcursion.xyz/metadata/scroll/"
        );

        // Deploy VictoryMinter
        victoryMinter = new VictoryMinter(
            "Inversion Victories",
            "VICTORY",
            "https://api.inversionexcursion.xyz/metadata/victory/"
        );

        // Deploy CellRegistry
        cellRegistry = new CellRegistry(admin, 5, 1 hours);

        // Deploy TradingPost
        tradingPost = new TradingPost(admin, address(scrollCard), 10, 7 days, admin);

        // Deploy GamePaymaster
        gamePaymaster = new GamePaymaster(entryPoint, admin);

        // Deploy Game Contract
        TheInversionExcursion gameImpl = new TheInversionExcursion();
        
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(gameImpl),
            address(proxyAdmin),
            abi.encodeWithSelector(
                TheInversionExcursion.initialize.selector,
                admin,
                0.001 ether,
                5,
                5 minutes
            )
        );
        game = TheInversionExcursion(payable(address(proxy)));

        // Configure contracts
        game.setContracts(
            address(scrollCard),
            address(victoryMinter),
            address(cellRegistry),
            address(tradingPost)
        );

        // Grant roles
        scrollCard.grantRole(MINTER_ROLE, address(game));
        scrollCard.grantRole(TRADING_POST_ROLE, address(tradingPost));
        victoryMinter.grantRole(MINTER_ROLE, address(game));
        cellRegistry.grantRole(GAME_MASTER_ROLE, address(game));
        game.grantRole(GAME_MASTER_ROLE, gameMaster);

        vm.stopPrank();

        // Fund players
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);
    }

    // ============ ScrollCard Tests ============

    function test_ScrollCard_Mint() public {
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, 1, 2, 3);

        assertEq(scrollCard.ownerOf(tokenId), player1);
        
        ScrollCard.ScrollAttributes memory attrs = scrollCard.getAttributes(tokenId);
        assertEq(attrs.dungeon, 1);
        assertEq(uint8(attrs.tier), 2);
        assertEq(uint8(attrs.frequency), 3);
        assertTrue(attrs.soulbound);
    }

    function test_ScrollCard_SoulboundTransfer_Reverts() public {
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, 1, 2, 3);

        vm.prank(player1);
        vm.expectRevert(ScrollCard.SoulboundToken.selector);
        scrollCard.transferFrom(player1, player2, tokenId);
    }

    function test_ScrollCard_TradingPostCanTransfer() public {
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(address(tradingPost), 1, 2, 3);

        vm.prank(admin);
        scrollCard.unlockForTrading(tokenId);

        vm.prank(admin);
        scrollCard.transferFrom(address(tradingPost), player1, tokenId);

        assertEq(scrollCard.ownerOf(tokenId), player1);
    }

    function test_ScrollCard_PowerScore() public view {
        uint256 score = scrollCard.calculatePowerScore(2, 3);
        // Tier multiplier: 500, Frequency multiplier: 50
        // Score: 500 * 50 = 25000
        assertEq(score, 25000);
    }

    function test_ScrollCard_MaxSupply() public {
        // Mint MAX_DUNGEON_SUPPLY tokens for dungeon 1
        vm.startPrank(admin);
        for (uint256 i = 0; i < 1000; i++) {
            scrollCard.mint(player1, 1, 0, 0);
        }

        vm.expectRevert(ScrollCard.MaxSupplyReached.selector);
        scrollCard.mint(player1, 1, 0, 0);
        vm.stopPrank();
    }

    // ============ VictoryMinter Tests ============

    function test_VictoryMinter_Mint() public {
        vm.prank(admin);
        uint256 tokenId = victoryMinter.mintVictory(player1, 1, 2, 5000);

        assertEq(victoryMinter.ownerOf(tokenId), player1);

        VictoryMinter.VictoryAttributes memory attrs = victoryMinter.getVictoryAttributes(tokenId);
        assertEq(attrs.cellId, 1);
        assertEq(attrs.dungeon, 2);
        assertEq(attrs.score, 5000);
    }

    function test_VictoryMinter_Transfer_Reverts() public {
        vm.prank(admin);
        uint256 tokenId = victoryMinter.mintVictory(player1, 1, 2, 5000);

        vm.prank(player1);
        vm.expectRevert(VictoryMinter.SoulboundToken.selector);
        victoryMinter.transferFrom(player1, player2, tokenId);
    }

    function test_VictoryMinter_PlayerVictories() public {
        vm.startPrank(admin);
        victoryMinter.mintVictory(player1, 1, 1, 100);
        victoryMinter.mintVictory(player1, 1, 2, 200);
        victoryMinter.mintVictory(player1, 1, 3, 300);
        vm.stopPrank();

        uint256[] memory victories = victoryMinter.getPlayerVictories(player1);
        assertEq(victories.length, 3);
    }

    function test_VictoryMinter_TotalScore() public {
        vm.startPrank(admin);
        victoryMinter.mintVictory(player1, 1, 1, 100);
        victoryMinter.mintVictory(player1, 1, 2, 200);
        victoryMinter.mintVictory(player1, 1, 3, 300);
        vm.stopPrank();

        uint256 totalScore = victoryMinter.getPlayerTotalScore(player1);
        assertEq(totalScore, 600);
    }

    // ============ CellRegistry Tests ============

    function test_CellRegistry_FormCell() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = cellRegistry.createCell(members, "Test Cell");

        assertEq(cellId, 1);

        CellRegistry.Cell memory cell = cellRegistry.getCell(cellId);
        assertEq(cell.leader, player1);
        assertEq(cell.members.length, 1);
        assertEq(cell.members[0], player2);
        assertEq(cell.name, "Test Cell");
        assertTrue(cell.active);

        assertEq(cellRegistry.playerCell(player1), cellId);
        assertEq(cellRegistry.playerCell(player2), cellId);
    }

    function test_CellRegistry_AlreadyInCell_Reverts() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        cellRegistry.createCell(members, "Test Cell 1");

        vm.prank(player1);
        vm.expectRevert(CellRegistry.AlreadyInCell.selector);
        cellRegistry.createCell(members, "Test Cell 2");
    }

    function test_CellRegistry_LeaveCell() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = cellRegistry.createCell(members, "Test Cell");

        vm.prank(player2);
        cellRegistry.leaveCell(cellId);

        assertEq(cellRegistry.playerCell(player2), 0);

        CellRegistry.Cell memory cell = cellRegistry.getCell(cellId);
        assertEq(cell.members.length, 0);
    }

    function test_CellRegistry_DisbandCell() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = cellRegistry.createCell(members, "Test Cell");

        vm.prank(player1);
        cellRegistry.disbandCell(cellId);

        assertEq(cellRegistry.playerCell(player1), 0);
        assertEq(cellRegistry.playerCell(player2), 0);

        CellRegistry.Cell memory cell = cellRegistry.getCell(cellId);
        assertFalse(cell.active);
    }

    function test_CellRegistry_RecordBattle() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = cellRegistry.createCell(members, "Test Cell");

        address[] memory participants = new address[](2);
        participants[0] = player1;
        participants[1] = player2;

        vm.prank(admin);
        uint256 battleId = cellRegistry.recordBattle(cellId, 1, true, 1000, participants, 1);

        assertEq(battleId, 1);

        CellRegistry.Cell memory cell = cellRegistry.getCell(cellId);
        assertEq(cell.battlesWon, 1);
        assertEq(cell.totalScore, 1000);

        CellRegistry.Battle memory battle = cellRegistry.getBattle(battleId);
        assertTrue(battle.won);
        assertEq(battle.score, 1000);
    }

    function test_CellRegistry_Reputation() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = cellRegistry.createCell(members, "Test Cell");

        uint256 initialRep = cellRegistry.cellReputation(cellId);
        assertEq(initialRep, 100);

        address[] memory participants = new address[](2);
        participants[0] = player1;
        participants[1] = player2;

        vm.prank(admin);
        cellRegistry.recordBattle(cellId, 1, true, 2000, participants, 1);

        uint256 newRep = cellRegistry.cellReputation(cellId);
        assertGt(newRep, initialRep);
    }

    // ============ TradingPost Tests ============

    function test_TradingPost_SendGift() public {
        // Mint scroll to player1
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, 1, 2, 3);

        // Send gift
        vm.prank(player1);
        uint256 giftId = tradingPost.sendBulletGift(player2, tokenId, "Enjoy this scroll!");

        assertEq(giftId, 1);
        assertEq(scrollCard.ownerOf(tokenId), address(tradingPost));

        TradingPost.Gift memory gift = tradingPost.gifts(giftId);
        assertEq(gift.from, player1);
        assertEq(gift.to, player2);
        assertEq(gift.scrollCardId, tokenId);
        assertFalse(gift.claimed);
    }

    function test_TradingPost_ClaimGift() public {
        // Mint and send gift
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, 1, 2, 3);

        vm.prank(player1);
        uint256 giftId = tradingPost.sendBulletGift(player2, tokenId, "Enjoy!");

        // Claim gift
        vm.prank(player2);
        tradingPost.claimGift(giftId);

        assertEq(scrollCard.ownerOf(tokenId), player2);

        TradingPost.Gift memory gift = tradingPost.gifts(giftId);
        assertTrue(gift.claimed);

        // Verify it's still soulbound
        assertTrue(scrollCard.isSoulbound(tokenId));
    }

    function test_TradingPost_RefundAfterExpiry() public {
        // Mint and send gift
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, 1, 2, 3);

        vm.prank(player1);
        uint256 giftId = tradingPost.sendBulletGift(player2, tokenId, "Enjoy!");

        // Fast forward past claim period
        vm.warp(block.timestamp + 8 days);

        // Refund
        vm.prank(player1);
        tradingPost.refundGift(giftId);

        assertEq(scrollCard.ownerOf(tokenId), player1);

        TradingPost.Gift memory gift = tradingPost.gifts(giftId);
        assertTrue(gift.refunded);
    }

    function test_TradingPost_DailyLimit() public {
        // Mint multiple scrolls
        vm.startPrank(admin);
        uint256[] memory tokenIds = new uint256[](11);
        for (uint256 i = 0; i < 11; i++) {
            tokenIds[i] = scrollCard.mint(player1, 1, 0, 0);
        }
        vm.stopPrank();

        // Send 10 gifts (max)
        vm.startPrank(player1);
        for (uint256 i = 0; i < 10; i++) {
            tradingPost.sendBulletGift(player2, tokenIds[i], "Gift");
        }

        // 11th should fail
        vm.expectRevert(TradingPost.DailyLimitReached.selector);
        tradingPost.sendBulletGift(player2, tokenIds[10], "Gift");
        vm.stopPrank();
    }

    // ============ Game Contract Tests ============

    function test_Game_FormCell() public {
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = game.formCell(members);

        assertEq(cellId, 1);
        assertEq(game.playerCell(player1), cellId);
    }

    function test_Game_EnterDungeon() public {
        // Form cell first
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        game.formCell(members);

        // Mint scroll
        vm.prank(admin);
        uint256 scrollId = scrollCard.mint(player1, 1, 2, 3);

        // Activate dungeon
        vm.prank(admin);
        game.setDungeonStatus(1, true);

        // Enter dungeon
        vm.prank(player1);
        game.enterDungeon{value: 0.001 ether}(1, scrollId);

        (,, uint256 lastBattle) = game.getPlayerStats(player1);
        assertEq(lastBattle, block.timestamp);
    }

    function test_Game_CompleteBattle() public {
        // Form cell
        address[] memory members = new address[](1);
        members[0] = player2;

        vm.prank(player1);
        uint256 cellId = game.formCell(members);

        // Complete battle
        vm.prank(gameMaster);
        uint256 victoryId = game.completeBattle(player1, cellId, 1, true, 2500);

        assertGt(victoryId, 0);
        assertEq(victoryMinter.ownerOf(victoryId), player1);

        (, uint256 totalScore,) = game.getPlayerStats(player1);
        assertEq(totalScore, 2500);
    }

    function test_Game_SendBulletGift() public {
        // Mint scroll
        vm.prank(admin);
        uint256 scrollId = scrollCard.mint(player1, 1, 2, 3);

        // Send gift through game
        vm.prank(player1);
        game.sendBulletGift(player2, scrollId, "For you!");

        uint256[] memory incoming = tradingPost.getIncomingGifts(player2);
        assertEq(incoming.length, 1);
    }

    // ============ Gas Optimization Tests ============

    function test_Gas_MintScroll() public {
        vm.prank(admin);
        uint256 gasBefore = gasleft();
        scrollCard.mint(player1, 1, 2, 3);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for minting ScrollCard:", gasUsed);
        assertLt(gasUsed, 200000); // Should use less than 200k gas
    }

    function test_Gas_FormCell() public {
        address[] memory members = new address[](2);
        members[0] = player2;
        members[1] = player3;

        vm.prank(player1);
        uint256 gasBefore = gasleft();
        game.formCell(members);
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for forming cell:", gasUsed);
        assertLt(gasUsed, 300000);
    }

    function test_Gas_SendGift() public {
        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, 1, 2, 3);

        vm.prank(player1);
        uint256 gasBefore = gasleft();
        tradingPost.sendBulletGift(player2, tokenId, "Gift!");
        uint256 gasUsed = gasBefore - gasleft();

        console.log("Gas used for sending gift:", gasUsed);
        assertLt(gasUsed, 250000);
    }

    // ============ Fuzz Tests ============

    function testFuzz_MintScroll(
        uint8 dungeon,
        uint8 tier,
        uint8 frequency
    ) public {
        vm.assume(dungeon != 0 && dungeon <= 255);
        vm.assume(tier <= 5);
        vm.assume(frequency <= 5);

        vm.prank(admin);
        uint256 tokenId = scrollCard.mint(player1, dungeon, tier, frequency);

        ScrollCard.ScrollAttributes memory attrs = scrollCard.getAttributes(tokenId);
        assertEq(attrs.dungeon, dungeon);
        assertEq(uint8(attrs.tier), tier);
        assertEq(uint8(attrs.frequency), frequency);
    }

    function testFuzz_VictoryScore(uint256 score) public {
        vm.assume(score <= 100000);

        vm.prank(admin);
        uint256 tokenId = victoryMinter.mintVictory(player1, 1, 1, score);

        VictoryMinter.VictoryAttributes memory attrs = victoryMinter.getVictoryAttributes(tokenId);
        assertEq(attrs.score, score);
    }
}
