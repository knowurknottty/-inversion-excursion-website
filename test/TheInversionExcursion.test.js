const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("The Inversion Excursion Contracts", function () {
    let scrollCard, victoryMinter, cellRegistry, tradingPost, gamePaymaster, game;
    let admin, player1, player2, player3, gameMaster, entryPoint, feeRecipient;

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const GAME_MASTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GAME_MASTER_ROLE"));
    const TRADING_POST_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TRADING_POST_ROLE"));

    beforeEach(async function () {
        [admin, player1, player2, player3, gameMaster, entryPoint, feeRecipient] = await ethers.getSigners();

        // Deploy ScrollCard
        const ScrollCard = await ethers.getContractFactory("ScrollCard");
        scrollCard = await ScrollCard.deploy(
            "Inversion Scrolls",
            "SCROLL",
            "https://api.inversionexcursion.xyz/metadata/scroll/"
        );
        await scrollCard.waitForDeployment();

        // Deploy VictoryMinter
        const VictoryMinter = await ethers.getContractFactory("VictoryMinter");
        victoryMinter = await VictoryMinter.deploy(
            "Inversion Victories",
            "VICTORY",
            "https://api.inversionexcursion.xyz/metadata/victory/"
        );
        await victoryMinter.waitForDeployment();

        // Deploy CellRegistry
        const CellRegistry = await ethers.getContractFactory("CellRegistry");
        cellRegistry = await CellRegistry.deploy(admin.address, 5, 3600);
        await cellRegistry.waitForDeployment();

        // Deploy TradingPost
        const TradingPost = await ethers.getContractFactory("TradingPost");
        tradingPost = await TradingPost.deploy(
            admin.address,
            await scrollCard.getAddress(),
            10,
            604800,
            feeRecipient.address
        );
        await tradingPost.waitForDeployment();

        // Deploy GamePaymaster
        const GamePaymaster = await ethers.getContractFactory("GamePaymaster");
        gamePaymaster = await GamePaymaster.deploy(entryPoint.address, admin.address);
        await gamePaymaster.waitForDeployment();

        // Deploy Game Contract (Upgradeable)
        const TheInversionExcursion = await ethers.getContractFactory("TheInversionExcursion");
        game = await upgrades.deployProxy(
            TheInversionExcursion,
            [admin.address, ethers.parseEther("0.001"), 5, 300],
            { initializer: "initialize" }
        );
        await game.waitForDeployment();

        // Configure contracts
        await game.connect(admin).setContracts(
            await scrollCard.getAddress(),
            await victoryMinter.getAddress(),
            await cellRegistry.getAddress(),
            await tradingPost.getAddress()
        );

        // Grant roles
        await scrollCard.connect(admin).grantRole(MINTER_ROLE, await game.getAddress());
        await scrollCard.connect(admin).grantRole(TRADING_POST_ROLE, await tradingPost.getAddress());
        await victoryMinter.connect(admin).grantRole(MINTER_ROLE, await game.getAddress());
        await cellRegistry.connect(admin).grantRole(GAME_MASTER_ROLE, await game.getAddress());
        await game.connect(admin).grantRole(GAME_MASTER_ROLE, gameMaster.address);
    });

    describe("ScrollCard", function () {
        it("Should mint a new scroll with correct attributes", async function () {
            await scrollCard.connect(admin).mint(player1.address, 1, 2, 3);
            
            const balance = await scrollCard.balanceOf(player1.address);
            expect(balance).to.equal(1);

            const attrs = await scrollCard.getAttributes(0);
            expect(attrs.dungeon).to.equal(1);
            expect(attrs.tier).to.equal(2);
            expect(attrs.frequency).to.equal(3);
            expect(attrs.soulbound).to.be.true;
        });

        it("Should prevent transfer of soulbound tokens", async function () {
            await scrollCard.connect(admin).mint(player1.address, 1, 2, 3);

            await expect(
                scrollCard.connect(player1).transferFrom(player1.address, player2.address, 0)
            ).to.be.revertedWithCustomError(scrollCard, "SoulboundToken");
        });

        it("Should calculate correct power score", async function () {
            const score = await scrollCard.calculatePowerScore(2, 3);
            expect(score).to.equal(25000); // 500 * 50
        });

        it("Should allow TradingPost to transfer after unlock", async function () {
            await scrollCard.connect(admin).mint(await tradingPost.getAddress(), 1, 2, 3);
            
            await scrollCard.connect(admin).unlockForTrading(0);
            await scrollCard.connect(admin).transferFrom(
                await tradingPost.getAddress(), 
                player1.address, 
                0
            );
            await scrollCard.connect(admin).lockAfterTrade(0);

            expect(await scrollCard.ownerOf(0)).to.equal(player1.address);
        });

        it("Should generate on-chain SVG metadata", async function () {
            await scrollCard.connect(admin).mint(player1.address, 1, 3, 4);
            await scrollCard.connect(admin).setOnChainSVGEnabled(true);

            const tokenURI = await scrollCard.tokenURI(0);
            expect(tokenURI).to.include("data:application/json;base64,");
        });
    });

    describe("VictoryMinter", function () {
        it("Should mint victory NFT", async function () {
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 2, 5000);

            const balance = await victoryMinter.balanceOf(player1.address);
            expect(balance).to.equal(1);

            const attrs = await victoryMinter.getVictoryAttributes(0);
            expect(attrs.cellId).to.equal(1);
            expect(attrs.dungeon).to.equal(2);
            expect(attrs.score).to.equal(5000);
        });

        it("Should be soulbound (non-transferable)", async function () {
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 2, 5000);

            await expect(
                victoryMinter.connect(player1).transferFrom(player1.address, player2.address, 0)
            ).to.be.revertedWithCustomError(victoryMinter, "SoulboundToken");
        });

        it("Should track player victories", async function () {
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 1, 100);
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 2, 200);
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 3, 300);

            const victories = await victoryMinter.getPlayerVictories(player1.address);
            expect(victories.length).to.equal(3);

            const count = await victoryMinter.getPlayerVictoryCount(player1.address);
            expect(count).to.equal(3);
        });

        it("Should calculate total player score", async function () {
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 1, 100);
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 2, 200);

            const totalScore = await victoryMinter.getPlayerTotalScore(player1.address);
            expect(totalScore).to.equal(300);
        });

        it("Should determine correct victory type based on score", async function () {
            // Perfect victory (score >= 5000)
            await victoryMinter.connect(admin).mintVictory(player1.address, 1, 1, 5000);
            let attrs = await victoryMinter.getVictoryAttributes(0);
            expect(attrs.achievementTier).to.equal(4); // Diamond

            // Standard victory (score < 500)
            await victoryMinter.connect(admin).mintVictory(player2.address, 1, 1, 400);
            attrs = await victoryMinter.getVictoryAttributes(1);
            expect(attrs.achievementTier).to.equal(0); // Bronze
        });
    });

    describe("CellRegistry", function () {
        it("Should form a new cell", async function () {
            await cellRegistry.connect(player1).createCell([player2.address], "Test Cell");

            const cell = await cellRegistry.getCell(1);
            expect(cell.leader).to.equal(player1.address);
            expect(cell.members.length).to.equal(1);
            expect(cell.members[0]).to.equal(player2.address);
            expect(cell.name).to.equal("Test Cell");
            expect(cell.active).to.be.true;

            expect(await cellRegistry.playerCell(player1.address)).to.equal(1);
            expect(await cellRegistry.playerCell(player2.address)).to.equal(1);
        });

        it("Should prevent forming cell if already in one", async function () {
            await cellRegistry.connect(player1).createCell([player2.address], "Cell 1");

            await expect(
                cellRegistry.connect(player1).createCell([player3.address], "Cell 2")
            ).to.be.revertedWithCustomError(cellRegistry, "AlreadyInCell");
        });

        it("Should allow members to leave cell", async function () {
            await cellRegistry.connect(player1).createCell([player2.address], "Test Cell");
            await cellRegistry.connect(player2).leaveCell(1);

            expect(await cellRegistry.playerCell(player2.address)).to.equal(0);

            const cell = await cellRegistry.getCell(1);
            expect(cell.members.length).to.equal(0);
        });

        it("Should allow leader to disband cell", async function () {
            await cellRegistry.connect(player1).createCell([player2.address], "Test Cell");
            await cellRegistry.connect(player1).disbandCell(1);

            expect(await cellRegistry.playerCell(player1.address)).to.equal(0);
            expect(await cellRegistry.playerCell(player2.address)).to.equal(0);

            const cell = await cellRegistry.getCell(1);
            expect(cell.active).to.be.false;
        });

        it("Should record battles and update stats", async function () {
            await cellRegistry.connect(player1).createCell([player2.address], "Test Cell");

            await cellRegistry.connect(admin).recordBattle(
                1, 1, true, 1000, [player1.address, player2.address], 1
            );

            const cell = await cellRegistry.getCell(1);
            expect(cell.battlesWon).to.equal(1);
            expect(cell.totalScore).to.equal(1000);

            const [winRate, totalBattles, avgScore] = await cellRegistry.getCellStats(1);
            expect(totalBattles).to.equal(1);
            expect(winRate).to.equal(10000); // 100%
        });

        it("Should update reputation correctly", async function () {
            await cellRegistry.connect(player1).createCell([player2.address], "Test Cell");
            
            const initialRep = await cellRegistry.cellReputation(1);
            expect(initialRep).to.equal(100);

            await cellRegistry.connect(admin).recordBattle(
                1, 1, true, 2000, [player1.address, player2.address], 1
            );

            const newRep = await cellRegistry.cellReputation(1);
            expect(newRep).to.be.gt(initialRep);
        });
    });

    describe("TradingPost", function () {
        beforeEach(async function () {
            await scrollCard.connect(admin).mint(player1.address, 1, 2, 3);
        });

        it("Should send a bullet gift", async function () {
            await tradingPost.connect(player1).sendBulletGift(
                player2.address, 0, "Enjoy this scroll!"
            );

            expect(await scrollCard.ownerOf(0)).to.equal(await tradingPost.getAddress());

            const gift = await tradingPost.gifts(1);
            expect(gift.from).to.equal(player1.address);
            expect(gift.to).to.equal(player2.address);
            expect(gift.claimed).to.be.false;
        });

        it("Should allow recipient to claim gift", async function () {
            await tradingPost.connect(player1).sendBulletGift(player2.address, 0, "Gift!");
            await tradingPost.connect(player2).claimGift(1);

            expect(await scrollCard.ownerOf(0)).to.equal(player2.address);
            expect(await scrollCard.isSoulbound(0)).to.be.true;

            const gift = await tradingPost.gifts(1);
            expect(gift.claimed).to.be.true;
        });

        it("Should allow refund after claim period expires", async function () {
            await tradingPost.connect(player1).sendBulletGift(player2.address, 0, "Gift!");

            // Fast forward 8 days
            await network.provider.send("evm_increaseTime", [691200]);
            await network.provider.send("evm_mine");

            await tradingPost.connect(player1).refundGift(1);

            expect(await scrollCard.ownerOf(0)).to.equal(player1.address);

            const gift = await tradingPost.gifts(1);
            expect(gift.refunded).to.be.true;
        });

        it("Should enforce daily gift limit", async function () {
            // Mint additional scrolls
            for (let i = 0; i < 10; i++) {
                await scrollCard.connect(admin).mint(player1.address, 1, 0, 0);
            }

            // Send 10 gifts
            for (let i = 0; i < 10; i++) {
                await tradingPost.connect(player1).sendBulletGift(player2.address, i, "Gift");
            }

            // 11th should fail
            await scrollCard.connect(admin).mint(player1.address, 1, 0, 0);
            await expect(
                tradingPost.connect(player1).sendBulletGift(player2.address, 10, "Gift")
            ).to.be.revertedWithCustomError(tradingPost, "DailyLimitReached");
        });

        it("Should track claimable gifts", async function () {
            await tradingPost.connect(player1).sendBulletGift(player2.address, 0, "Gift 1");
            await tradingPost.connect(player1).sendBulletGift(player2.address, 0, "Gift 2");

            const claimable = await tradingPost.getClaimableGifts(player2.address);
            expect(claimable.length).to.equal(2);
        });
    });

    describe("GamePaymaster", function () {
        it("Should whitelist a player", async function () {
            await gamePaymaster.connect(admin).whitelistPlayer(player1.address, 1);

            const sponsorship = await gamePaymaster.playerSponsorships(player1.address);
            expect(sponsorship.whitelisted).to.be.true;
            expect(sponsorship.tierId).to.equal(1);
        });

        it("Should set sponsorship tiers", async function () {
            await gamePaymaster.connect(admin).setTier(5, 100, 500000, true);

            const tier = await gamePaymaster.sponsorshipTiers(5);
            expect(tier.dailyTransactions).to.equal(100);
            expect(tier.maxGasPerTransaction).to.equal(500000);
            expect(tier.active).to.be.true;
        });

        it("Should check if sponsorship is available", async function () {
            await gamePaymaster.connect(admin).whitelistPlayer(player1.address, 2);

            const [canSponsor, remainingDaily, maxGas] = await gamePaymaster.canSponsor(
                player1.address, 1 // OP_ENTER_DUNGEON
            );

            expect(canSponsor).to.be.true;
            expect(remainingDaily).to.equal(50); // Tier 2 daily limit
            expect(maxGas).to.equal(500000);
        });
    });

    describe("Main Game Contract", function () {
        it("Should form a cell through game contract", async function () {
            await game.connect(player1).formCell([player2.address]);

            expect(await game.playerCell(player1.address)).to.equal(1);
        });

        it("Should complete battle and mint victory", async function () {
            await game.connect(player1).formCell([player2.address]);

            const victoryId = await game.connect(gameMaster).completeBattle(
                player1.address, 1, 1, true, 2500
            );

            expect(await victoryMinter.ownerOf(victoryId)).to.equal(player1.address);

            const [, totalScore] = await game.getPlayerStats(player1.address);
            expect(totalScore).to.equal(2500);
        });

        it("Should track player cell membership", async function () {
            await game.connect(player1).formCell([player2.address]);

            const [cellId, ,] = await game.getPlayerStats(player1.address);
            expect(cellId).to.equal(1);
        });
    });

    describe("Gas Optimization", function () {
        it("Should mint scroll efficiently", async function () {
            const tx = await scrollCard.connect(admin).mint(player1.address, 1, 2, 3);
            const receipt = await tx.wait();
            
            console.log("Gas used for minting:", receipt.gasUsed.toString());
            expect(receipt.gasUsed).to.be.lt(200000);
        });

        it("Should form cell efficiently", async function () {
            const tx = await game.connect(player1).formCell([player2.address]);
            const receipt = await tx.wait();

            console.log("Gas used for forming cell:", receipt.gasUsed.toString());
            expect(receipt.gasUsed).to.be.lt(300000);
        });
    });
});
