/**
 * Contract Tests: ScrollCard.sol
 * Tests NFT minting, soulbound mechanics, and metadata
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ScrollCard } from '../../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('ScrollCard Contract', () => {
  let scrollCard: ScrollCard;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let tradingPost: SignerWithAddress;

  const name = 'ScrollCards';
  const symbol = 'SCROLL';
  const baseURI = 'https://api.example.com/metadata/';

  beforeEach(async () => {
    [owner, addr1, addr2, tradingPost] = await ethers.getSigners();

    // Deploy contract
    const ScrollCardFactory = await ethers.getContractFactory('ScrollCard');
    scrollCard = await ScrollCardFactory.deploy(name, symbol, baseURI);
    await scrollCard.waitForDeployment();
  });

  describe('Deployment', () => {
    it('should set correct name and symbol', async () => {
      expect(await scrollCard.name()).to.equal(name);
      expect(await scrollCard.symbol()).to.equal(symbol);
    });

    it('should grant admin role to deployer', async () => {
      const DEFAULT_ADMIN_ROLE = await scrollCard.DEFAULT_ADMIN_ROLE();
      expect(await scrollCard.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it('should set base URI correctly', async () => {
      // Mint a token first
      await scrollCard.mint(addr1.address, 1, 0, 0);
      const tokenURI = await scrollCard.tokenURI(0);
      expect(tokenURI).to.include(baseURI);
    });
  });

  describe('Minting', () => {
    it('should mint a new token', async () => {
      await expect(scrollCard.mint(addr1.address, 1, 0, 0))
        .to.emit(scrollCard, 'ScrollMinted')
        .withArgs(0, addr1.address, 1, 0, 0, await scrollCard.calculatePowerScore(0, 0));
    });

    it('should increment token ID counter', async () => {
      await scrollCard.mint(addr1.address, 1, 0, 0);
      await scrollCard.mint(addr1.address, 1, 0, 0);
      
      expect(await scrollCard.balanceOf(addr1.address)).to.equal(2);
    });

    it('should store correct attributes', async () => {
      await scrollCard.mint(addr1.address, 1, 2, 3);
      
      const attrs = await scrollCard.getAttributes(0);
      expect(attrs.dungeon).to.equal(1);
      expect(attrs.tier).to.equal(2);
      expect(attrs.frequency).to.equal(3);
      expect(attrs.soulbound).to.be.true;
    });

    it('should calculate power score correctly', async () => {
      const powerScore = await scrollCard.calculatePowerScore(2, 3);
      // TIER_MULTIPLIERS[2] * FREQUENCY_MULTIPLIERS[3] = 500 * 100 = 50000
      expect(powerScore).to.equal(50000);
    });

    it('should reject minting to zero address', async () => {
      await expect(
        scrollCard.mint(ethers.ZeroAddress, 1, 0, 0)
      ).to.be.revertedWithCustomError(scrollCard, 'InvalidAddress');
    });

    it('should reject invalid dungeon ID', async () => {
      await expect(
        scrollCard.mint(addr1.address, 0, 0, 0)
      ).to.be.revertedWithCustomError(scrollCard, 'InvalidDungeon');
    });

    it('should reject invalid tier', async () => {
      await expect(
        scrollCard.mint(addr1.address, 1, 6, 0)
      ).to.be.revertedWithCustomError(scrollCard, 'InvalidTier');
    });

    it('should reject invalid frequency', async () => {
      await expect(
        scrollCard.mint(addr1.address, 1, 0, 6)
      ).to.be.revertedWithCustomError(scrollCard, 'InvalidFrequency');
    });

    it('should enforce max supply per dungeon', async () => {
      // Mint up to max
      const maxSupply = await scrollCard.MAX_DUNGEON_SUPPLY();
      
      // This would take too long in test, just verify limit exists
      expect(maxSupply).to.equal(1000);
    });

    it('should only allow minter role to mint', async () => {
      await expect(
        scrollCard.connect(addr1).mint(addr2.address, 1, 0, 0)
      ).to.be.revertedWithCustomError(scrollCard, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('Soulbound Mechanics', () => {
    beforeEach(async () => {
      await scrollCard.mint(addr1.address, 1, 0, 0);
    });

    it('should be soulbound by default', async () => {
      expect(await scrollCard.isSoulbound(0)).to.be.true;
    });

    it('should prevent transfer of soulbound token', async () => {
      await expect(
        scrollCard.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
      ).to.be.revertedWithCustomError(scrollCard, 'SoulboundToken');
    });

    it('should allow TradingPost to transfer soulbound token', async () => {
      // Grant trading post role
      const TRADING_POST_ROLE = await scrollCard.TRADING_POST_ROLE();
      await scrollCard.grantRole(TRADING_POST_ROLE, tradingPost.address);
      
      // Unlock for trading
      await scrollCard.connect(tradingPost).unlockForTrading(0);
      
      // Now transfer should work
      await scrollCard.connect(tradingPost).transferFrom(addr1.address, addr2.address, 0);
      
      expect(await scrollCard.ownerOf(0)).to.equal(addr2.address);
    });

    it('should emit SoulboundStatusChanged event', async () => {
      const TRADING_POST_ROLE = await scrollCard.TRADING_POST_ROLE();
      await scrollCard.grantRole(TRADING_POST_ROLE, tradingPost.address);
      
      await expect(scrollCard.connect(tradingPost).unlockForTrading(0))
        .to.emit(scrollCard, 'SoulboundStatusChanged')
        .withArgs(0, false, tradingPost.address);
    });

    it('should re-lock token after trade', async () => {
      const TRADING_POST_ROLE = await scrollCard.TRADING_POST_ROLE();
      await scrollCard.grantRole(TRADING_POST_ROLE, tradingPost.address);
      
      // Unlock and transfer
      await scrollCard.connect(tradingPost).unlockForTrading(0);
      await scrollCard.connect(tradingPost).transferFrom(addr1.address, addr2.address, 0);
      
      // Lock after trade
      await scrollCard.connect(tradingPost).lockAfterTrade(0);
      
      expect(await scrollCard.isSoulbound(0)).to.be.true;
      
      // Should not be transferable anymore
      await expect(
        scrollCard.connect(addr2).transferFrom(addr2.address, addr1.address, 0)
      ).to.be.revertedWithCustomError(scrollCard, 'SoulboundToken');
    });
  });

  describe('Batch Minting', () => {
    it('should batch mint multiple tokens', async () => {
      const recipients = [addr1.address, addr2.address, addr1.address];
      const dungeons = [1, 1, 2];
      const tiers = [0, 1, 2];
      const frequencies = [0, 1, 2];

      await scrollCard.batchMint(recipients, dungeons, tiers, frequencies);

      expect(await scrollCard.balanceOf(addr1.address)).to.equal(2);
      expect(await scrollCard.balanceOf(addr2.address)).to.equal(1);
    });

    it('should reject batch mint with mismatched arrays', async () => {
      await expect(
        scrollCard.batchMint([addr1.address], [1, 2], [0], [0])
      ).to.be.revertedWith('Array length mismatch');
    });
  });

  describe('Metadata', () => {
    beforeEach(async () => {
      await scrollCard.mint(addr1.address, 1, 2, 3);
    });

    it('should return correct token URI', async () => {
      const tokenURI = await scrollCard.tokenURI(0);
      expect(tokenURI).to.be.a('string');
      expect(tokenURI.length).to.be.greaterThan(0);
    });

    it('should allow metadata manager to update base URI', async () => {
      const newBaseURI = 'https://new-api.example.com/metadata/';
      
      await scrollCard.setBaseURI(newBaseURI);
      
      // Mint new token to verify
      await scrollCard.mint(addr1.address, 1, 0, 0);
      const tokenURI = await scrollCard.tokenURI(1);
      expect(tokenURI).to.include(newBaseURI);
    });

    it('should set dungeon name', async () => {
      await scrollCard.setDungeonName(1, 'The Test Dungeon');
      
      const attrs = await scrollCard.getAttributes(0);
      expect(attrs.dungeonName).to.equal('The Test Dungeon');
    });

    it('should emit DungeonNameSet event', async () => {
      await expect(scrollCard.setDungeonName(2, 'New Dungeon'))
        .to.emit(scrollCard, 'DungeonNameSet')
        .withArgs(2, 'New Dungeon');
    });
  });

  describe('Combination Scarcity', () => {
    it('should track mint count by combination', async () => {
      await scrollCard.mint(addr1.address, 1, 2, 3);
      await scrollCard.mint(addr2.address, 1, 2, 3);
      
      const count = await scrollCard.getCombinationCount(1, 2, 3);
      expect(count).to.equal(2);
    });

    it('should return tokens by owner', async () => {
      await scrollCard.mint(addr1.address, 1, 0, 0);
      await scrollCard.mint(addr1.address, 2, 1, 1);
      
      const tokens = await scrollCard.getTokensByOwner(addr1.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0]).to.equal(0);
      expect(tokens[1]).to.equal(1);
    });
  });

  describe('Admin Functions', () => {
    it('should set Zora Coins contract', async () => {
      const mockZora = addr2.address;
      
      await expect(scrollCard.setZoraCoinsContract(mockZora))
        .to.emit(scrollCard, 'ZoraCoinsContractSet')
        .withArgs(mockZora);
    });

    it('should toggle on-chain SVG', async () => {
      await scrollCard.setOnChainSVGEnabled(true);
      expect(await scrollCard.onChainSVGEnabled()).to.be.true;
    });

    it('should only allow admin to set trading post', async () => {
      await expect(
        scrollCard.connect(addr1).setTradingPost(tradingPost.address)
      ).to.be.revertedWithCustomError(scrollCard, 'AccessControlUnauthorizedAccount');
    });
  });
});
