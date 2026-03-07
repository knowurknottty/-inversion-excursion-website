// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/TimeToken.sol";

/**
 * @title TimeTokenTest
 * @dev Comprehensive test suite for TimeToken contract
 */
contract TimeTokenTest is Test {
    TimeToken public timeToken;
    
    address public admin;
    address public oracle;
    address public oracle2;
    address public serviceProvider;
    address public serviceRecipient;
    address public thirdParty;
    
    // Test data
    string constant NAME = "TimeToken";
    string constant SYMBOL = "TIME";
    string constant CATEGORY = "teaching";
    string constant METADATA = "ipfs://QmTest";
    string constant REDEMPTION_PURPOSE = "Garden help session";
    
    event TimeTokenMinted(
        uint256 indexed tokenId,
        address indexed serviceProvider,
        address indexed serviceRecipient,
        uint256 hoursEarned,
        uint256 expiresAt,
        string serviceCategory
    );
    
    event TimeTokenRedeemed(
        uint256 indexed tokenId,
        address indexed redeemer,
        uint256 hoursRedeemed,
        string redemptionPurpose
    );
    
    event TimeTokenExpired(
        uint256 indexed tokenId,
        uint256 expiredAt
    );
    
    event ExpirationExtended(
        uint256 indexed tokenId,
        uint256 oldExpiration,
        uint256 newExpiration
    );
    
    event OracleStatusChanged(
        address indexed oracle,
        bool granted
    );

    function setUp() public {
        // Setup accounts
        admin = makeAddr("admin");
        oracle = makeAddr("oracle");
        oracle2 = makeAddr("oracle2");
        serviceProvider = makeAddr("serviceProvider");
        serviceRecipient = makeAddr("serviceRecipient");
        thirdParty = makeAddr("thirdParty");
        
        // Deploy contract
        vm.prank(admin);
        timeToken = new TimeToken(NAME, SYMBOL, admin);
        
        // Grant oracle role
        vm.prank(admin);
        timeToken.grantOracleRole(oracle);
    }

    // ============ Deployment Tests ============
    
    function test_Deployment() public view {
        assertEq(timeToken.name(), NAME);
        assertEq(timeToken.symbol(), SYMBOL);
        assertTrue(timeToken.hasRole(timeToken.ADMIN_ROLE(), admin));
        assertTrue(timeToken.hasRole(timeToken.DEFAULT_ADMIN_ROLE(), admin));
    }
    
    function test_Deployment_RevertZeroAddress() public {
        vm.expectRevert(TimeToken.InvalidAddress.selector);
        new TimeToken(NAME, SYMBOL, address(0));
    }

    // ============ Role Management Tests ============
    
    function test_GrantOracleRole() public {
        vm.expectEmit(true, false, false, true);
        emit OracleStatusChanged(oracle2, true);
        
        vm.prank(admin);
        timeToken.grantOracleRole(oracle2);
        
        assertTrue(timeToken.hasRole(timeToken.ORACLE_ROLE(), oracle2));
    }
    
    function test_GrantOracleRole_RevertNotAdmin() public {
        vm.prank(thirdParty);
        vm.expectRevert();
        timeToken.grantOracleRole(oracle2);
    }
    
    function test_GrantOracleRole_RevertZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(TimeToken.InvalidAddress.selector);
        timeToken.grantOracleRole(address(0));
    }
    
    function test_RevokeOracleRole() public {
        vm.prank(admin);
        timeToken.grantOracleRole(oracle2);
        
        vm.expectEmit(true, false, false, true);
        emit OracleStatusChanged(oracle2, false);
        
        vm.prank(admin);
        timeToken.revokeOracleRole(oracle2);
        
        assertFalse(timeToken.hasRole(timeToken.ORACLE_ROLE(), oracle2));
    }

    // ============ Minting Tests ============
    
    function test_Mint() public {
        uint256 hoursEarned = 5;
        
        vm.expectEmit(true, true, true, false);
        emit TimeTokenMinted(
            0,
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            block.timestamp + timeToken.DEFAULT_EXPIRATION(),
            CATEGORY
        );
        
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            CATEGORY,
            METADATA
        );
        
        assertEq(tokenId, 0);
        assertEq(timeToken.ownerOf(tokenId), serviceProvider);
        assertEq(timeToken.totalHoursMinted(), hoursEarned);
        assertEq(timeToken.totalActiveHours(), hoursEarned);
        
        TimeToken.TokenData memory data = timeToken.getTokenData(tokenId);
        assertEq(data.hoursEarned, hoursEarned);
        assertEq(data.serviceProvider, serviceProvider);
        assertEq(data.serviceRecipient, serviceRecipient);
        assertEq(data.serviceCategory, CATEGORY);
        assertEq(data.metadataURI, METADATA);
        assertFalse(data.redeemed);
        assertEq(data.mintedAt, block.timestamp);
        assertEq(data.expiresAt, block.timestamp + timeToken.DEFAULT_EXPIRATION());
    }
    
    function test_Mint_WithCustomExpiration() public {
        uint256 hoursEarned = 3;
        uint256 customExpiration = 90 days;
        
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            CATEGORY,
            METADATA,
            customExpiration
        );
        
        TimeToken.TokenData memory data = timeToken.getTokenData(tokenId);
        assertEq(data.expiresAt, block.timestamp + customExpiration);
    }
    
    function test_Mint_RevertNotOracle() public {
        vm.prank(thirdParty);
        vm.expectRevert();
        timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
    }
    
    function test_Mint_RevertZeroAddress() public {
        vm.prank(oracle);
        vm.expectRevert(TimeToken.InvalidAddress.selector);
        timeToken.mint(
            address(0),
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
    }
    
    function test_Mint_RevertZeroHours() public {
        vm.prank(oracle);
        vm.expectRevert(abi.encodeWithSelector(TimeToken.InvalidHours.selector, 0));
        timeToken.mint(
            serviceProvider,
            serviceRecipient,
            0,
            CATEGORY,
            METADATA
        );
    }
    
    function test_Mint_RevertTooManyHours() public {
        vm.prank(oracle);
        vm.expectRevert(abi.encodeWithSelector(TimeToken.InvalidHours.selector, 169));
        timeToken.mint(
            serviceProvider,
            serviceRecipient,
            169, // More than 168 hours (1 week)
            CATEGORY,
            METADATA
        );
    }
    
    function test_Mint_MultipleTokens() public {
        vm.startPrank(oracle);
        
        uint256 tokenId1 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        uint256 tokenId2 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            3,
            "gardening",
            METADATA
        );
        
        vm.stopPrank();
        
        assertEq(tokenId1, 0);
        assertEq(tokenId2, 1);
        assertEq(timeToken.balanceOf(serviceProvider), 2);
        assertEq(timeToken.totalHoursMinted(), 8);
        assertEq(timeToken.totalActiveHours(), 8);
    }

    // ============ Soulbound Tests ============
    
    function test_Transfer_RevertSoulbound() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        vm.prank(serviceProvider);
        vm.expectRevert(TimeToken.TransferNotAllowed.selector);
        timeToken.transferFrom(serviceProvider, thirdParty, tokenId);
    }
    
    function test_SafeTransfer_RevertSoulbound() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        vm.prank(serviceProvider);
        vm.expectRevert(TimeToken.TransferNotAllowed.selector);
        timeToken.safeTransferFrom(serviceProvider, thirdParty, tokenId);
    }
    
    function test_Approve_RevertSoulbound() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        vm.prank(serviceProvider);
        vm.expectRevert(TimeToken.TransferNotAllowed.selector);
        timeToken.approve(thirdParty, tokenId);
    }
    
    function test_SetApprovalForAll_RevertSoulbound() public {
        vm.prank(serviceProvider);
        vm.expectRevert(TimeToken.TransferNotAllowed.selector);
        timeToken.setApprovalForAll(thirdParty, true);
    }
    
    function test_BurnAuth() public view {
        assertEq(timeToken.burnAuth(0), 2); // OwnerOnly
    }

    // ============ Redemption Tests ============
    
    function test_Redeem() public {
        uint256 hoursEarned = 5;
        
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            CATEGORY,
            METADATA
        );
        
        vm.expectEmit(true, true, false, false);
        emit TimeTokenRedeemed(
            tokenId,
            serviceProvider,
            hoursEarned,
            REDEMPTION_PURPOSE
        );
        
        vm.prank(serviceProvider);
        timeToken.redeem(tokenId, REDEMPTION_PURPOSE);
        
        assertEq(timeToken.balanceOf(serviceProvider), 0);
        assertEq(timeToken.totalHoursRedeemed(), hoursEarned);
        assertEq(timeToken.totalActiveHours(), 0);
        
        vm.expectRevert(); // Token no longer exists
        timeToken.ownerOf(tokenId);
    }
    
    function test_Redeem_RevertNotOwner() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        vm.prank(thirdParty);
        vm.expectRevert(abi.encodeWithSelector(
            TimeToken.UnauthorizedRedemption.selector,
            thirdParty,
            tokenId
        ));
        timeToken.redeem(tokenId, REDEMPTION_PURPOSE);
    }
    
    function test_Redeem_RevertAlreadyRedeemed() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        vm.prank(serviceProvider);
        timeToken.redeem(tokenId, REDEMPTION_PURPOSE);
        
        // Token is burned, so ownerOf will revert
        vm.expectRevert();
        timeToken.redeem(tokenId, REDEMPTION_PURPOSE);
    }
    
    function test_Redeem_RevertExpired() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        // Warp past expiration
        vm.warp(block.timestamp + timeToken.DEFAULT_EXPIRATION() + 1);
        
        vm.prank(serviceProvider);
        vm.expectRevert(abi.encodeWithSelector(
            TimeToken.TokenExpired.selector,
            tokenId,
            block.timestamp - 1
        ));
        timeToken.redeem(tokenId, REDEMPTION_PURPOSE);
    }
    
    function test_RedeemBatch() public {
        vm.startPrank(oracle);
        uint256 tokenId1 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        uint256 tokenId2 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            3,
            "gardening",
            METADATA
        );
        vm.stopPrank();
        
        uint256[] memory tokenIds = new uint256[](2);
        tokenIds[0] = tokenId1;
        tokenIds[1] = tokenId2;
        
        vm.prank(serviceProvider);
        timeToken.redeemBatch(tokenIds, REDEMPTION_PURPOSE);
        
        assertEq(timeToken.balanceOf(serviceProvider), 0);
        assertEq(timeToken.totalHoursRedeemed(), 8);
    }

    // ============ Expiration Tests ============
    
    function test_IsExpired() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        assertFalse(timeToken.isExpired(tokenId));
        
        vm.warp(block.timestamp + timeToken.DEFAULT_EXPIRATION() + 1);
        
        assertTrue(timeToken.isExpired(tokenId));
    }
    
    function test_TimeUntilExpiration() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        uint256 remaining = timeToken.timeUntilExpiration(tokenId);
        assertEq(remaining, timeToken.DEFAULT_EXPIRATION());
        
        vm.warp(block.timestamp + 30 days);
        remaining = timeToken.timeUntilExpiration(tokenId);
        assertEq(remaining, timeToken.DEFAULT_EXPIRATION() - 30 days);
        
        vm.warp(block.timestamp + timeToken.DEFAULT_EXPIRATION());
        remaining = timeToken.timeUntilExpiration(tokenId);
        assertEq(remaining, 0);
    }
    
    function test_IsInGracePeriod() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        assertFalse(timeToken.isInGracePeriod(tokenId));
        
        // Warp to just after expiration
        vm.warp(block.timestamp + timeToken.DEFAULT_EXPIRATION() + 1);
        assertTrue(timeToken.isInGracePeriod(tokenId));
        
        // Warp past grace period
        vm.warp(block.timestamp + timeToken.GRACE_PERIOD());
        assertFalse(timeToken.isInGracePeriod(tokenId));
    }
    
    function test_ExtendExpiration() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        uint256 oldExpiration = timeToken.getTokenData(tokenId).expiresAt;
        uint256 extension = 30 days;
        
        vm.expectEmit(true, false, false, false);
        emit ExpirationExtended(tokenId, oldExpiration, oldExpiration + extension);
        
        vm.prank(oracle);
        timeToken.extendExpiration(tokenId, extension);
        
        uint256 newExpiration = timeToken.getTokenData(tokenId).expiresAt;
        assertEq(newExpiration, oldExpiration + extension);
    }
    
    function test_ExtendExpiration_MaxLimit() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        uint256 mintedAt = timeToken.getTokenData(tokenId).mintedAt;
        uint256 maxExpiration = mintedAt + timeToken.DEFAULT_EXPIRATION() + timeToken.MAX_EXPIRATION_EXTENSION();
        
        // Try to extend way beyond limit
        vm.prank(oracle);
        timeToken.extendExpiration(tokenId, 1000 days);
        
        uint256 actualExpiration = timeToken.getTokenData(tokenId).expiresAt;
        assertEq(actualExpiration, maxExpiration);
    }
    
    function test_ExtendExpiration_RevertNotOracle() public {
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        vm.prank(thirdParty);
        vm.expectRevert();
        timeToken.extendExpiration(tokenId, 30 days);
    }

    // ============ Balance Tests ============
    
    function test_BalanceOfEffective() public {
        // Mint 3 tokens
        vm.startPrank(oracle);
        timeToken.mint(serviceProvider, serviceRecipient, 5, CATEGORY, METADATA);
        timeToken.mint(serviceProvider, serviceRecipient, 3, "gardening", METADATA);
        timeToken.mint(serviceProvider, serviceRecipient, 2, "cooking", METADATA);
        vm.stopPrank();
        
        (uint256 totalHours, uint256 tokenCount) = timeToken.balanceOfEffective(serviceProvider);
        assertEq(totalHours, 10);
        assertEq(tokenCount, 3);
        
        // Warp past expiration for first token
        vm.warp(block.timestamp + timeToken.DEFAULT_EXPIRATION() + 1);
        
        (totalHours, tokenCount) = timeToken.balanceOfEffective(serviceProvider);
        assertEq(totalHours, 5); // Only last 2 tokens (3 + 2)
        assertEq(tokenCount, 2);
    }
    
    function test_BalanceOfDetailed() public {
        vm.startPrank(oracle);
        
        // Mint token that will expire soon (within 30 days)
        uint256 tokenId1 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA,
            20 days // Expires in 20 days
        );
        
        // Mint normal token
        timeToken.mint(serviceProvider, serviceRecipient, 3, "gardening", METADATA);
        
        // Mint token we'll let expire
        timeToken.mint(serviceProvider, serviceRecipient, 2, "cooking", METADATA);
        
        vm.stopPrank();
        
        (uint256 active, uint256 expiringSoon, uint256 expired) = 
            timeToken.balanceOfDetailed(serviceProvider);
        
        assertEq(active, 10); // All 3 tokens
        assertEq(expiringSoon, 5); // First token expires in 20 days
        assertEq(expired, 0);
        
        // Let the 2-hour token expire
        vm.warp(block.timestamp + timeToken.DEFAULT_EXPIRATION() + 1);
        
        (active, expiringSoon, expired) = timeToken.balanceOfDetailed(serviceProvider);
        
        assertEq(active, 5); // 2 + 3 (the 20-day token is still active)
        assertEq(expiringSoon, 0); // The 20-day token is past its expiry now
        assertEq(expired, 2);
    }
    
    function test_GetTokensByOwner() public {
        vm.startPrank(oracle);
        timeToken.mint(serviceProvider, serviceRecipient, 5, CATEGORY, METADATA);
        timeToken.mint(serviceProvider, serviceRecipient, 3, "gardening", METADATA);
        vm.stopPrank();
        
        uint256[] memory tokens = timeToken.getTokensByOwner(serviceProvider);
        assertEq(tokens.length, 2);
        assertEq(tokens[0], 0);
        assertEq(tokens[1], 1);
    }
    
    function test_GetTokensByOwner_Empty() public view {
        uint256[] memory tokens = timeToken.getTokensByOwner(thirdParty);
        assertEq(tokens.length, 0);
    }

    // ============ Fuzz Tests ============
    
    function testFuzz_MintValidHours(uint256 hoursEarned) public {
        // Bound hours between 1 and 168
        hoursEarned = bound(hoursEarned, 1, 168);
        
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            CATEGORY,
            METADATA
        );
        
        assertEq(timeToken.getTokenData(tokenId).hoursEarned, hoursEarned);
    }
    
    function testFuzz_MintInvalidHours(uint256 hoursEarned) public {
        // Either 0 or > 168
        vm.assume(hoursEarned == 0 || hoursEarned > 168);
        
        vm.prank(oracle);
        vm.expectRevert();
        timeToken.mint(
            serviceProvider,
            serviceRecipient,
            hoursEarned,
            CATEGORY,
            METADATA
        );
    }

    // ============ Edge Cases ============
    
    function test_MintToContract() public {
        // Deploy a contract that can receive ERC721
        address recipient = address(new ERC721Holder());
        
        vm.prank(oracle);
        uint256 tokenId = timeToken.mint(
            recipient,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        
        assertEq(timeToken.ownerOf(tokenId), recipient);
    }
    
    function test_MultipleOracles() public {
        vm.prank(admin);
        timeToken.grantOracleRole(oracle2);
        
        vm.prank(oracle);
        timeToken.mint(serviceProvider, serviceRecipient, 5, CATEGORY, METADATA);
        
        vm.prank(oracle2);
        timeToken.mint(serviceProvider, serviceRecipient, 3, "gardening", METADATA);
        
        assertEq(timeToken.balanceOf(serviceProvider), 2);
    }
    
    function test_RedeemAndMintCycle() public {
        // Full cycle: mint, redeem, mint again
        vm.startPrank(oracle);
        uint256 tokenId1 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            5,
            CATEGORY,
            METADATA
        );
        vm.stopPrank();
        
        vm.prank(serviceProvider);
        timeToken.redeem(tokenId1, REDEMPTION_PURPOSE);
        
        vm.prank(oracle);
        uint256 tokenId2 = timeToken.mint(
            serviceProvider,
            serviceRecipient,
            3,
            CATEGORY,
            METADATA
        );
        
        assertEq(tokenId2, 1); // Next token ID
        assertEq(timeToken.balanceOf(serviceProvider), 1);
        assertEq(timeToken.totalHoursMinted(), 8);
        assertEq(timeToken.totalHoursRedeemed(), 5);
        assertEq(timeToken.totalActiveHours(), 3);
    }
}

/**
 * @dev Helper contract that can receive ERC721 tokens
 */
contract ERC721Holder is IERC721Receiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
