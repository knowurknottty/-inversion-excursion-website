// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ReputationRegistry} from "../ReputationRegistry.sol";

contract ReputationRegistryTest is Test {
    ReputationRegistry public registry;
    
    address public admin;
    address public exchange;
    address public dispute;
    address public user1;
    address public user2;
    address public user3;
    
    // Constants from contract
    uint256 constant MAX_SCORE = 10000;
    uint256 constant REGISTRATION_BONUS = 500;
    uint256 constant EXCHANGE_BONUS = 50;
    uint256 constant DISPUTE_LOSS_PENALTY = 1000;
    uint256 constant DISPUTE_WIN_BONUS = 100;
    uint256 constant ENDORSEMENT_BONUS = 25;
    uint256 constant MAX_ENDORSEMENT_BONUS = 500;
    
    uint256 constant TIER_1_THRESHOLD = 0;
    uint256 constant TIER_2_THRESHOLD = 2500;
    uint256 constant TIER_3_THRESHOLD = 5000;
    uint256 constant TIER_4_THRESHOLD = 7500;
    uint256 constant TIER_5_THRESHOLD = 9000;
    
    function setUp() public {
        admin = makeAddr("admin");
        exchange = makeAddr("exchange");
        dispute = makeAddr("dispute");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy with 5% default decay, max 20%, min 0%
        vm.prank(admin);
        registry = new ReputationRegistry(admin, 500, 2000, 0);
        
        // Grant roles
        vm.startPrank(admin);
        registry.grantRole(registry.EXCHANGE_ROLE(), exchange);
        registry.grantRole(registry.DISPUTE_ROLE(), dispute);
        registry.grantRole(registry.REGISTRAR_ROLE(), admin);
        vm.stopPrank();
        
        // Fund users
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
    }
    
    // ============ Registration Tests ============
    
    function test_RegisterUser() public {
        vm.prank(user1);
        registry.registerUser("ipfs://metadata1");
        
        assertTrue(registry.isRegistered(user1));
        
        (
            uint256 overallScore,
            uint256 baseScore,
            uint256 completedExchanges,
            uint256 disputedExchanges,
            uint256 wonDisputes,
            uint256 lostDisputes,
            uint256 totalHoursContributed,
            uint256 totalHoursReceived,
            uint256 lastActivityTimestamp,
            uint8 trustTier
        ) = registry.getUserStats(user1);
        
        assertEq(overallScore, REGISTRATION_BONUS);
        assertEq(baseScore, REGISTRATION_BONUS);
        assertEq(completedExchanges, 0);
        assertEq(disputedExchanges, 0);
        assertEq(trustTier, 1); // Untrusted tier initially
    }
    
    function test_RegisterUser_AlreadyRegistered() public {
        vm.prank(user1);
        registry.registerUser("ipfs://metadata1");
        
        vm.expectRevert(ReputationRegistry.AlreadyRegistered.selector);
        vm.prank(user1);
        registry.registerUser("ipfs://metadata2");
    }
    
    function test_BatchRegister() public {
        address[] memory users = new address[](2);
        users[0] = user1;
        users[1] = user2;
        
        string[] memory uris = new string[](2);
        uris[0] = "ipfs://user1";
        uris[1] = "ipfs://user2";
        
        vm.prank(admin);
        registry.batchRegister(users, uris);
        
        assertTrue(registry.isRegistered(user1));
        assertTrue(registry.isRegistered(user2));
    }
    
    // ============ Reputation Score Tests ============
    
    function test_UpdateReputation_Positive() public {
        _registerUser(user1);
        
        uint256 oldScore = registry.calculateCurrentScore(user1);
        int256 delta = 1000;
        
        vm.prank(exchange);
        registry.updateReputation(user1, delta, "Test bonus");
        
        uint256 newScore = registry.calculateCurrentScore(user1);
        assertEq(newScore, oldScore + uint256(delta));
    }
    
    function test_UpdateReputation_Negative() public {
        _registerUser(user1);
        
        // First add some score
        vm.prank(exchange);
        registry.updateReputation(user1, 1000, "Bonus");
        
        uint256 beforePenalty = registry.calculateCurrentScore(user1);
        
        // Apply penalty
        vm.prank(exchange);
        registry.updateReputation(user1, -500, "Penalty");
        
        uint256 afterPenalty = registry.calculateCurrentScore(user1);
        assertEq(afterPenalty, beforePenalty - 500);
    }
    
    function test_UpdateReputation_NotRegistered() public {
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        vm.prank(exchange);
        registry.updateReputation(user1, 1000, "Test");
    }
    
    function test_UpdateReputation_MaxCap() public {
        _registerUser(user1);
        
        // Try to exceed max score
        vm.prank(exchange);
        registry.updateReputation(user1, int256(MAX_SCORE * 2), "Huge bonus");
        
        assertEq(registry.calculateCurrentScore(user1), MAX_SCORE);
    }
    
    function test_UpdateReputation_MinFloor() public {
        _registerUser(user1);
        
        // Apply large penalty
        vm.prank(exchange);
        registry.updateReputation(user1, -int256(MAX_SCORE), "Huge penalty");
        
        assertEq(registry.calculateCurrentScore(user1), 0);
    }
    
    // ============ Exchange Completion Tests ============
    
    function test_RecordExchangeCompletion() public {
        _registerUser(user1);
        _registerUser(user2);
        
        uint256 hoursAmount = 5;
        
        uint256 providerScoreBefore = registry.calculateCurrentScore(user1);
        uint256 receiverScoreBefore = registry.calculateCurrentScore(user2);
        
        vm.prank(exchange);
        registry.recordExchangeCompletion(user1, user2, hoursAmount);
        
        (
            uint256 providerScore,
            ,
            uint256 completedExchanges,
            ,
            ,
            ,
            uint256 totalHoursContributed,
            ,
            ,
            
        ) = registry.getUserStats(user1);
        
        assertEq(completedExchanges, 1);
        assertEq(totalHoursContributed, hoursAmount);
        assertEq(providerScore, providerScoreBefore + EXCHANGE_BONUS);
        
        // Receiver gets half bonus
        uint256 receiverScore = registry.calculateCurrentScore(user2);
        assertEq(receiverScore, receiverScoreBefore + EXCHANGE_BONUS / 2);
    }
    
    function test_RecordExchangeCompletion_ProviderNotRegistered() public {
        _registerUser(user2);
        
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        vm.prank(exchange);
        registry.recordExchangeCompletion(user1, user2, 5);
    }
    
    function test_RecordExchangeCompletion_ReceiverNotRegistered() public {
        _registerUser(user1);
        
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        vm.prank(exchange);
        registry.recordExchangeCompletion(user1, user2, 5);
    }
    
    // ============ Dispute Tests ============
    
    function test_RecordDispute_Won() public {
        _registerUser(user1);
        
        uint256 scoreBefore = registry.calculateCurrentScore(user1);
        
        vm.prank(dispute);
        registry.recordDispute(user1, true);
        
        uint256 scoreAfter = registry.calculateCurrentScore(user1);
        assertEq(scoreAfter, scoreBefore + DISPUTE_WIN_BONUS);
        
        (
            ,
            ,
            ,
            uint256 disputedExchanges,
            uint256 wonDisputes,
            uint256 lostDisputes,
            ,
            ,
            ,
            
        ) = registry.getUserStats(user1);
        
        assertEq(disputedExchanges, 1);
        assertEq(wonDisputes, 1);
        assertEq(lostDisputes, 0);
    }
    
    function test_RecordDispute_Lost() public {
        _registerUser(user1);
        
        // Add some score first
        vm.prank(exchange);
        registry.updateReputation(user1, 2000, "Initial score");
        
        uint256 scoreBefore = registry.calculateCurrentScore(user1);
        
        vm.prank(dispute);
        registry.recordDispute(user1, false);
        
        uint256 scoreAfter = registry.calculateCurrentScore(user1);
        assertEq(scoreAfter, scoreBefore - DISPUTE_LOSS_PENALTY);
        
        (
            ,
            ,
            ,
            uint256 disputedExchanges,
            uint256 wonDisputes,
            uint256 lostDisputes,
            ,
            ,
            ,
            
        ) = registry.getUserStats(user1);
        
        assertEq(disputedExchanges, 1);
        assertEq(wonDisputes, 0);
        assertEq(lostDisputes, 1);
    }
    
    // ============ Skill Tests ============
    
    function test_AddSkill() public {
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        assertEq(skillId, 0);
        
        ReputationRegistry.SkillInfo memory info = registry.getSkillInfo(skillId);
        assertEq(info.name, "Programming");
        assertTrue(info.exists);
    }
    
    function test_AddSkill_EmptyName() public {
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.InvalidSkill.selector);
        registry.addSkill("");
    }
    
    function test_UpdateSkillName() public {
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.prank(admin);
        registry.updateSkillName(skillId, "Software Development");
        
        ReputationRegistry.SkillInfo memory info = registry.getSkillInfo(skillId);
        assertEq(info.name, "Software Development");
    }
    
    function test_UpdateSkillName_InvalidSkill() public {
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.InvalidSkill.selector);
        registry.updateSkillName(999, "Invalid");
    }
    
    // ============ Skill Endorsement Tests ============
    
    function test_EndorseSkill() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        uint256 scoreBefore = registry.calculateCurrentScore(user2);
        
        vm.prank(user1);
        registry.endorseSkill(user2, skillId);
        
        assertTrue(registry.hasEndorsedSkill(user2, skillId, user1));
        
        uint256 scoreAfter = registry.calculateCurrentScore(user2);
        assertEq(scoreAfter, scoreBefore + ENDORSEMENT_BONUS);
        
        (,, uint256 endorsementCount,) = registry.getSkillRating(user2, skillId);
        assertEq(endorsementCount, 1);
    }
    
    function test_EndorseSkill_SelfEndorsement() public {
        _registerUser(user1);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.expectRevert(ReputationRegistry.SelfEndorsementNotAllowed.selector);
        vm.prank(user1);
        registry.endorseSkill(user1, skillId);
    }
    
    function test_EndorseSkill_AlreadyEndorsed() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.prank(user1);
        registry.endorseSkill(user2, skillId);
        
        vm.expectRevert(ReputationRegistry.AlreadyEndorsed.selector);
        vm.prank(user1);
        registry.endorseSkill(user2, skillId);
    }
    
    function test_EndorseSkill_NotRegistered() public {
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        vm.prank(user1);
        registry.endorseSkill(user2, skillId);
    }
    
    function test_EndorseSkill_EndorserNotRegistered() public {
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        vm.prank(user1);
        registry.endorseSkill(user2, skillId);
    }
    
    function test_EndorseSkill_MaxBonusCap() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        // Add many endorsers
        for (uint256 i = 0; i < 30; i++) {
            address endorser = makeAddr(string.concat("endorser", vm.toString(i)));
            vm.deal(endorser, 1 ether);
            
            vm.prank(endorser);
            registry.registerUser("ipfs://test");
            
            vm.prank(endorser);
            registry.endorseSkill(user2, skillId);
        }
        
        // Check that bonus is capped at MAX_ENDORSEMENT_BONUS (500)
        (,, uint256 endorsementCount,) = registry.getSkillRating(user2, skillId);
        assertEq(endorsementCount, 30);
        
        // Score should only increase by MAX_ENDORSEMENT_BONUS from endorsements
        // Starting from REGISTRATION_BONUS (500)
        uint256 expectedMaxScore = REGISTRATION_BONUS + MAX_ENDORSEMENT_BONUS;
        uint256 actualScore = registry.calculateCurrentScore(user2);
        assertLe(actualScore, expectedMaxScore + 100); // Allow small variance for decay
    }
    
    // ============ Skill Rating Tests ============
    
    function test_RateSkill() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        uint256 rating = 5;
        
        vm.prank(user1);
        registry.rateSkill(user2, skillId, rating);
        
        assertTrue(registry.hasRatedSkill(user2, skillId, user1));
        
        (uint256 scaledRating, uint256 reviewCount, , uint256 averageRating) = registry.getSkillRating(user2, skillId);
        
        assertEq(reviewCount, 1);
        assertEq(averageRating, rating);
        assertEq(scaledRating, rating * 100); // Scaled to 100-500
        
        // High rating should give bonus
        uint256 expectedScore = REGISTRATION_BONUS + ((rating - 3) * 10);
        assertEq(registry.calculateCurrentScore(user2), expectedScore);
    }
    
    function test_RateSkill_LowRating_NoBonus() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        uint256 rating = 3; // Not high enough for bonus
        
        vm.prank(user1);
        registry.rateSkill(user2, skillId, rating);
        
        // No bonus for 3-star rating
        assertEq(registry.calculateCurrentScore(user2), REGISTRATION_BONUS);
    }
    
    function test_RateSkill_SelfRating() public {
        _registerUser(user1);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.expectRevert(ReputationRegistry.SelfRatingNotAllowed.selector);
        vm.prank(user1);
        registry.rateSkill(user1, skillId, 5);
    }
    
    function test_RateSkill_InvalidRating() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.expectRevert(ReputationRegistry.InvalidRating.selector);
        vm.prank(user1);
        registry.rateSkill(user2, skillId, 6);
        
        vm.expectRevert(ReputationRegistry.InvalidRating.selector);
        vm.prank(user1);
        registry.rateSkill(user2, skillId, 0);
    }
    
    function test_RateSkill_AlreadyRated() public {
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.prank(user1);
        registry.rateSkill(user2, skillId, 5);
        
        vm.expectRevert(ReputationRegistry.AlreadyRated.selector);
        vm.prank(user1);
        registry.rateSkill(user2, skillId, 4);
    }
    
    // ============ Decay Tests ============
    
    function test_Decay_NoActivity() public {
        _registerUser(user1);
        
        // Warp time forward by 1 year
        vm.warp(block.timestamp + 365 days);
        
        uint256 decayedScore = registry.calculateCurrentScore(user1);
        
        // With 5% decay, score should be ~95% of original
        // 500 * 0.95 = 475
        assertApproxEqRel(decayedScore, REGISTRATION_BONUS * 95 / 100, 0.01e18);
    }
    
    function test_Decay_MultipleYears() public {
        _registerUser(user1);
        
        // Warp time forward by 2 years
        vm.warp(block.timestamp + 2 * 365 days);
        
        uint256 decayedScore = registry.calculateCurrentScore(user1);
        
        // With 5% decay per year, score should be ~90.25% of original (0.95^2)
        // 500 * 0.9025 = ~451
        assertApproxEqRel(decayedScore, REGISTRATION_BONUS * 9025 / 10000, 0.02e18);
    }
    
    function test_ApplyDecay() public {
        _registerUser(user1);
        
        // Warp time forward
        vm.warp(block.timestamp + 365 days);
        
        uint256 scoreBefore = registry.calculateCurrentScore(user1);
        
        registry.applyDecay(user1);
        
        uint256 scoreAfter = registry.calculateCurrentScore(user1);
        
        // After applying decay, the base score should be updated
        assertLe(scoreAfter, scoreBefore);
    }
    
    function test_ApplyDecay_NotRegistered() public {
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        registry.applyDecay(user1);
    }
    
    function test_Decay_ResetsOnActivity() public {
        _registerUser(user1);
        
        // Warp time forward by 6 months
        vm.warp(block.timestamp + 180 days);
        
        uint256 scoreBeforeActivity = registry.calculateCurrentScore(user1);
        
        // Activity occurs (exchange)
        _registerUser(user2);
        vm.prank(exchange);
        registry.recordExchangeCompletion(user1, user2, 5);
        
        uint256 scoreAfterActivity = registry.calculateCurrentScore(user1);
        
        // Score should be higher due to activity bonus and decay reset
        assertGt(scoreAfterActivity, scoreBeforeActivity);
    }
    
    function test_SetUserDecayRate() public {
        _registerUser(user1);
        
        uint256 newRate = 1000; // 10%
        
        vm.prank(admin);
        registry.setUserDecayRate(user1, newRate);
        
        // Warp forward and check decay
        vm.warp(block.timestamp + 365 days);
        
        uint256 decayedScore = registry.calculateCurrentScore(user1);
        
        // With 10% decay, score should be ~90% of original
        // 500 * 0.90 = 450
        assertApproxEqRel(decayedScore, REGISTRATION_BONUS * 90 / 100, 0.02e18);
    }
    
    function test_SetUserDecayRate_InvalidRate() public {
        _registerUser(user1);
        
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.InvalidDecayRate.selector);
        registry.setUserDecayRate(user1, 3000); // Above max of 20%
    }
    
    function test_SetDefaultDecayRate() public {
        vm.prank(admin);
        registry.setDefaultDecayRate(1000); // 10%
        
        _registerUser(user1);
        
        vm.warp(block.timestamp + 365 days);
        
        uint256 decayedScore = registry.calculateCurrentScore(user1);
        
        // New user should have new default decay rate
        assertApproxEqRel(decayedScore, REGISTRATION_BONUS * 90 / 100, 0.02e18);
    }
    
    function test_SetDefaultDecayRate_InvalidRate() public {
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.InvalidDecayRate.selector);
        registry.setDefaultDecayRate(3000); // Above max
    }
    
    function test_GetPendingDecay() public {
        _registerUser(user1);
        
        assertEq(registry.getPendingDecay(user1), 0);
        
        vm.warp(block.timestamp + 180 days);
        
        uint256 pendingDecay = registry.getPendingDecay(user1);
        assertGt(pendingDecay, 0);
    }
    
    function test_GetTimeUntilDecay() public {
        _registerUser(user1);
        
        uint256 timeUntil = registry.getTimeUntilDecay(user1);
        assertEq(timeUntil, 365 days);
        
        vm.warp(block.timestamp + 180 days);
        
        timeUntil = registry.getTimeUntilDecay(user1);
        assertEq(timeUntil, 185 days);
        
        vm.warp(block.timestamp + 200 days);
        
        timeUntil = registry.getTimeUntilDecay(user1);
        assertEq(timeUntil, 0);
    }
    
    // ============ Trust Tier Tests ============
    
    function test_GetTrustTier() public {
        _registerUser(user1);
        
        // Start at Tier 1 (Untrusted)
        assertEq(registry.getTrustTier(user1), 1);
        
        // Add score to reach Tier 2
        vm.prank(exchange);
        registry.updateReputation(user1, int256(TIER_2_THRESHOLD), "Tier up");
        assertEq(registry.getTrustTier(user1), 2);
        
        // Add score to reach Tier 3
        vm.prank(exchange);
        registry.updateReputation(user1, int256(TIER_3_THRESHOLD - TIER_2_THRESHOLD), "Tier up");
        assertEq(registry.getTrustTier(user1), 3);
        
        // Add score to reach Tier 4
        vm.prank(exchange);
        registry.updateReputation(user1, int256(TIER_4_THRESHOLD - TIER_3_THRESHOLD), "Tier up");
        assertEq(registry.getTrustTier(user1), 4);
        
        // Add score to reach Tier 5
        vm.prank(exchange);
        registry.updateReputation(user1, int256(TIER_5_THRESHOLD - TIER_4_THRESHOLD), "Tier up");
        assertEq(registry.getTrustTier(user1), 5);
    }
    
    function test_GetTrustTier_NotRegistered() public {
        assertEq(registry.getTrustTier(user1), 0);
    }
    
    function test_GetTierName() public {
        assertEq(registry.getTierName(1), "Untrusted");
        assertEq(registry.getTierName(2), "Emerging");
        assertEq(registry.getTierName(3), "Established");
        assertEq(registry.getTierName(4), "Trusted");
        assertEq(registry.getTierName(5), "Elite");
        assertEq(registry.getTierName(0), "Unknown");
        assertEq(registry.getTierName(6), "Unknown");
    }
    
    function test_MeetsTierRequirement() public {
        _registerUser(user1);
        
        assertTrue(registry.meetsTierRequirement(user1, 1));
        assertFalse(registry.meetsTierRequirement(user1, 2));
        
        // Add score to reach Tier 2
        vm.prank(exchange);
        registry.updateReputation(user1, int256(TIER_2_THRESHOLD), "Tier up");
        
        assertTrue(registry.meetsTierRequirement(user1, 2));
        assertFalse(registry.meetsTierRequirement(user1, 3));
    }
    
    // ============ Query Function Tests ============
    
    function test_CanTransact() public {
        assertFalse(registry.canTransact(user1));
        
        _registerUser(user1);
        
        assertTrue(registry.canTransact(user1));
    }
    
    function test_GetAllSkills() public {
        vm.startPrank(admin);
        registry.addSkill("Programming");
        registry.addSkill("Design");
        registry.addSkill("Writing");
        registry.addSkill("Marketing");
        registry.addSkill("Consulting");
        vm.stopPrank();
        
        ReputationRegistry.SkillInfo[] memory allSkills = registry.getAllSkills(0, 10);
        
        assertEq(allSkills.length, 5);
        assertEq(allSkills[0].name, "Programming");
        assertEq(allSkills[4].name, "Consulting");
    }
    
    function test_GetAllSkills_Pagination() public {
        vm.startPrank(admin);
        registry.addSkill("Programming");
        registry.addSkill("Design");
        registry.addSkill("Writing");
        vm.stopPrank();
        
        ReputationRegistry.SkillInfo[] skills = registry.getAllSkills(1, 2);
        
        assertEq(skills.length, 2);
        assertEq(skills[0].name, "Design");
        assertEq(skills[1].name, "Writing");
    }
    
    function test_GetUserEndorsements() public {
        _registerUser(user1);
        _registerUser(user2);
        _registerUser(user3);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Programming");
        
        vm.prank(user1);
        registry.endorseSkill(user2, skillId);
        
        vm.prank(user3);
        registry.endorseSkill(user2, skillId);
        
        ReputationRegistry.EndorsementData[] memory endorsements = registry.getUserEndorsements(user2);
        
        assertEq(endorsements.length, 2);
        assertEq(endorsements[0].endorser, user1);
        assertEq(endorsements[1].endorser, user3);
    }
    
    // ============ Admin Tests ============
    
    function test_UpdateMetadata() public {
        _registerUser(user1);
        
        vm.prank(user1);
        registry.updateMetadata("ipfs://new-metadata");
        
        ReputationRegistry.ReputationProfile memory profile = registry.getReputation(user1);
        assertEq(profile.metadataURI, "ipfs://new-metadata");
    }
    
    function test_AdminUpdateMetadata() public {
        _registerUser(user1);
        
        vm.prank(admin);
        registry.adminUpdateMetadata(user1, "ipfs://admin-metadata");
        
        ReputationRegistry.ReputationProfile memory profile = registry.getReputation(user1);
        assertEq(profile.metadataURI, "ipfs://admin-metadata");
    }
    
    function test_AdminUpdateMetadata_NotRegistered() public {
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.NotRegistered.selector);
        registry.adminUpdateMetadata(user1, "ipfs://test");
    }
    
    // ============ Edge Cases ============
    
    function test_ZeroAddress_Revert() public {
        vm.prank(admin);
        vm.expectRevert(ReputationRegistry.ZeroAddress.selector);
        registry = new ReputationRegistry(address(0), 500, 2000, 0);
    }
    
    function test_MultipleExchanges_Accumulate() public {
        _registerUser(user1);
        _registerUser(user2);
        
        uint256 expectedScore = REGISTRATION_BONUS;
        
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(exchange);
            registry.recordExchangeCompletion(user1, user2, 1);
            expectedScore += EXCHANGE_BONUS;
        }
        
        assertEq(registry.calculateCurrentScore(user1), expectedScore);
        
        (
            ,
            ,
            uint256 completedExchanges,
            ,
            ,
            ,
            uint256 totalHoursContributed,
            ,
            ,
            
        ) = registry.getUserStats(user1);
        
        assertEq(completedExchanges, 5);
        assertEq(totalHoursContributed, 5);
    }
    
    function test_ReputationDecayThenRecovery() public {
        _registerUser(user1);
        
        // Let decay happen
        vm.warp(block.timestamp + 365 days);
        
        uint256 decayedScore = registry.calculateCurrentScore(user1);
        assertLt(decayedScore, REGISTRATION_BONUS);
        
        // Apply activity
        _registerUser(user2);
        vm.prank(exchange);
        registry.recordExchangeCompletion(user1, user2, 10);
        
        uint256 recoveredScore = registry.calculateCurrentScore(user1);
        assertGt(recoveredScore, decayedScore);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_UpdateReputation_Positive(int256 delta) public {
        vm.assume(delta > 0 && delta <= int256(MAX_SCORE));
        
        _registerUser(user1);
        
        uint256 scoreBefore = registry.calculateCurrentScore(user1);
        
        vm.prank(exchange);
        registry.updateReputation(user1, delta, "Fuzz test");
        
        uint256 scoreAfter = registry.calculateCurrentScore(user1);
        
        // Score should increase (or cap at MAX_SCORE)
        assertGe(scoreAfter, scoreBefore);
        assertLe(scoreAfter, MAX_SCORE);
    }
    
    function testFuzz_RateSkill(uint256 rating) public {
        vm.assume(rating >= 1 && rating <= 5);
        
        _registerUser(user1);
        _registerUser(user2);
        
        vm.prank(admin);
        uint256 skillId = registry.addSkill("Test");
        
        vm.prank(user1);
        registry.rateSkill(user2, skillId, rating);
        
        (,,, uint256 averageRating) = registry.getSkillRating(user2, skillId);
        assertEq(averageRating, rating);
    }
    
    // ============ Helper Functions ============
    
    function _registerUser(address user) internal {
        vm.prank(user);
        registry.registerUser(string.concat("ipfs://", vm.toString(user)));
    }
}