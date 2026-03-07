/**
 * Contract Tests: TradingPost.sol
 * Tests one-way gifting system (Bullet Gifts)
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { TradingPost, ScrollCard } from '../../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('TradingPost Contract', () => {
  let tradingPost: TradingPost;
  let scrollCard: ScrollCard;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const maxDailyGifts = 10;
  const claimPeriod = 7 * 24 * 60 * 60; // 7 days
  const giftFee = ethers.parseEther('0.001');

  beforeEach(async () => {
    [owner, sender, recipient, feeRecipient] = await ethers.getSigners();

    // Deploy ScrollCard first
    const ScrollCardFactory = await ethers.getContractFactory('ScrollCard');
    scrollCard = await ScrollCardFactory.deploy('ScrollCards', 'SCROLL', 'https://api.example.com/');
    await scrollCard.waitForDeployment();

    // Deploy TradingPost
    const TradingPostFactory = await ethers.getContractFactory('TradingPost');
    tradingPost = await TradingPostFactory.deploy(
      owner.address,
      await scrollCard.getAddress(),
      maxDailyGifts,
      claimPeriod,
      feeRecipient.address
    );
    await tradingPost.waitForDeployment();

    // Grant trading post role to TradingPost contract
    await scrollCard.grantRole(await scrollCard.TRADING_POST_ROLE(), await tradingPost.getAddress());
    
    // Mint a card to sender
    await scrollCard.mint(sender.address, 1, 0, 0);
  });

  describe('Deployment', () => {
    it('should set correct parameters', async () => {
      expect(await tradingPost.scrollCard()).to.equal(await scrollCard.getAddress());
      expect(await tradingPost.maxDailyGifts()).to.equal(maxDailyGifts);
      expect(await tradingPost.claimPeriod()).to.equal(claimPeriod);
      expect(await tradingPost.feeRecipient()).to.equal(feeRecipient.address);
    });

    it('should have gifting enabled by default', async () => {
      expect(await tradingPost.giftingEnabled()).to.be.true;
    });

    it('should have refunds enabled by default', async () => {
      expect(await tradingPost.refundsEnabled()).to.be.true;
    });
  });

  describe('Sending Gifts', () => {
    it('should send a bullet gift', async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      
      await expect(
        tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Enjoy this card!', { value: giftFee })
      )
        .to.emit(tradingPost, 'GiftSent')
        .withArgs(1, 0, sender.address, recipient.address, 'Enjoy this card!');
    });

    it('should transfer token to escrow', async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      await tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: giftFee });
      
      expect(await scrollCard.ownerOf(0)).to.equal(await tradingPost.getAddress());
    });

    it('should update trading stats', async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      await tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: giftFee });
      
      const senderStats = await tradingPost.tradingStats(sender.address);
      expect(senderStats.totalGiftsSent).to.equal(1);
      expect(senderStats.dailyGiftsSent).to.equal(1);
      
      const recipientStats = await tradingPost.tradingStats(recipient.address);
      expect(recipientStats.totalGiftsReceived).to.equal(1);
    });

    it('should require gift fee', async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      
      await expect(
        tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: 0 })
      ).to.be.revertedWithCustomError(tradingPost, 'TransferFailed');
    });

    it('should enforce daily limit', async () => {
      await scrollCard.mint(sender.address, 1, 0, 0);
      await scrollCard.connect(sender).setApprovalForAll(await tradingPost.getAddress(), true);
      
      // Send max daily gifts
      for (let i = 0; i < maxDailyGifts; i++) {
        await scrollCard.mint(sender.address, 1, 0, 0);
        await tradingPost.connect(sender).sendBulletGift(recipient.address, i + 1, 'Gift!', { value: giftFee });
      }
      
      // Next gift should fail
      await scrollCard.mint(sender.address, 1, 0, 0);
      await expect(
        tradingPost.connect(sender).sendBulletGift(recipient.address, maxDailyGifts + 1, 'Gift!', { value: giftFee })
      ).to.be.revertedWithCustomError(tradingPost, 'DailyLimitReached');
    });

    it('should prevent self-gifting', async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      
      await expect(
        tradingPost.connect(sender).sendBulletGift(sender.address, 0, 'Gift!', { value: giftFee })
      ).to.be.revertedWithCustomError(tradingPost, 'CannotGiftToSelf');
    });

    it('should validate message length', async () => {
      const longMessage = 'a'.repeat(281);
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      
      await expect(
        tradingPost.connect(sender).sendBulletGift(recipient.address, 0, longMessage, { value: giftFee })
      ).to.be.revertedWithCustomError(tradingPost, 'MessageTooLong');
    });

    it('should require ownership of token', async () => {
      // Mint card to recipient, not sender
      await scrollCard.mint(recipient.address, 1, 0, 0);
      await scrollCard.connect(recipient).approve(await tradingPost.getAddress(), 1);
      
      await expect(
        tradingPost.connect(sender).sendBulletGift(recipient.address, 1, 'Gift!', { value: giftFee })
      ).to.be.revertedWithCustomError(tradingPost, 'NotTokenOwner');
    });
  });

  describe('Claiming Gifts', () => {
    beforeEach(async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      await tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: giftFee });
    });

    it('should allow recipient to claim gift', async () => {
      await expect(tradingPost.connect(recipient).claimGift(1))
        .to.emit(tradingPost, 'GiftClaimed')
        .withArgs(1, 0, recipient.address);
    });

    it('should transfer token to recipient', async () => {
      await tradingPost.connect(recipient).claimGift(1);
      
      expect(await scrollCard.ownerOf(0)).to.equal(recipient.address);
      expect(await scrollCard.isSoulbound(0)).to.be.true;
    });

    it('should mark gift as claimed', async () => {
      await tradingPost.connect(recipient).claimGift(1);
      
      const gift = await tradingPost.gifts(1);
      expect(gift.claimed).to.be.true;
    });

    it('should prevent double claiming', async () => {
      await tradingPost.connect(recipient).claimGift(1);
      
      await expect(
        tradingPost.connect(recipient).claimGift(1)
      ).to.be.revertedWithCustomError(tradingPost, 'GiftAlreadyClaimed');
    });

    it('should only allow recipient to claim', async () => {
      await expect(
        tradingPost.connect(sender).claimGift(1)
      ).to.be.revertedWithCustomError(tradingPost, 'NotGiftRecipient');
    });

    it('should enforce claim period', async () => {
      // Fast forward past claim period
      await ethers.provider.send('evm_increaseTime', [claimPeriod + 1]);
      await ethers.provider.send('evm_mine');
      
      await expect(
        tradingPost.connect(recipient).claimGift(1)
      ).to.be.revertedWithCustomError(tradingPost, 'ClaimPeriodExpired');
    });
  });

  describe('Refunding Gifts', () => {
    beforeEach(async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      await tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: giftFee });
    });

    it('should allow sender to refund after claim period', async () => {
      // Fast forward past claim period
      await ethers.provider.send('evm_increaseTime', [claimPeriod + 1]);
      await ethers.provider.send('evm_mine');
      
      await expect(tradingPost.connect(sender).refundGift(1))
        .to.emit(tradingPost, 'GiftRefunded')
        .withArgs(1, 0, sender.address);
    });

    it('should return token to sender', async () => {
      // Fast forward past claim period
      await ethers.provider.send('evm_increaseTime', [claimPeriod + 1]);
      await ethers.provider.send('evm_mine');
      
      await tradingPost.connect(sender).refundGift(1);
      
      expect(await scrollCard.ownerOf(0)).to.equal(sender.address);
    });

    it('should prevent refund before claim period', async () => {
      await expect(
        tradingPost.connect(sender).refundGift(1)
      ).to.be.revertedWithCustomError(tradingPost, 'ClaimPeriodNotExpired');
    });

    it('should prevent refund of claimed gift', async () => {
      await tradingPost.connect(recipient).claimGift(1);
      
      // Fast forward past claim period
      await ethers.provider.send('evm_increaseTime', [claimPeriod + 1]);
      await ethers.provider.send('evm_mine');
      
      await expect(
        tradingPost.connect(sender).refundGift(1)
      ).to.be.revertedWithCustomError(tradingPost, 'GiftAlreadyClaimed');
    });

    it('should only allow sender to refund', async () => {
      // Fast forward past claim period
      await ethers.provider.send('evm_increaseTime', [claimPeriod + 1]);
      await ethers.provider.send('evm_mine');
      
      await expect(
        tradingPost.connect(recipient).refundGift(1)
      ).to.be.revertedWithCustomError(tradingPost, 'NotGiftSender');
    });
  });

  describe('View Functions', () => {
    beforeEach(async () => {
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      await tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: giftFee });
    });

    it('should return outgoing gifts', async () => {
      const gifts = await tradingPost.getOutgoingGifts(sender.address);
      expect(gifts).to.include(1n);
    });

    it('should return incoming gifts', async () => {
      const gifts = await tradingPost.getIncomingGifts(recipient.address);
      expect(gifts).to.include(1n);
    });

    it('should return claimable gifts', async () => {
      const gifts = await tradingPost.getClaimableGifts(recipient.address);
      expect(gifts).to.include(1n);
    });

    it('should return refundable gifts after claim period', async () => {
      // Fast forward
      await ethers.provider.send('evm_increaseTime', [claimPeriod + 1]);
      await ethers.provider.send('evm_mine');
      
      const gifts = await tradingPost.getRefundableGifts(sender.address);
      expect(gifts).to.include(1n);
    });

    it('should return remaining daily gifts', async () => {
      const remaining = await tradingPost.getRemainingDailyGifts(sender.address);
      expect(remaining).to.equal(maxDailyGifts - 1);
    });

    it('should check if gift can be claimed', async () => {
      const [canClaim, timeRemaining] = await tradingPost.canClaim(1);
      expect(canClaim).to.be.true;
      expect(timeRemaining).to.be.greaterThan(0);
    });
  });

  describe('Admin Functions', () => {
    it('should update max daily gifts', async () => {
      await tradingPost.setMaxDailyGifts(20);
      expect(await tradingPost.maxDailyGifts()).to.equal(20);
    });

    it('should update claim period', async () => {
      await tradingPost.setClaimPeriod(86400); // 1 day
      expect(await tradingPost.claimPeriod()).to.equal(86400);
    });

    it('should update gift fee', async () => {
      const newFee = ethers.parseEther('0.005');
      await tradingPost.setGiftFee(newFee);
      expect(await tradingPost.giftFee()).to.equal(newFee);
    });

    it('should toggle gifting', async () => {
      await tradingPost.setGiftingEnabled(false);
      expect(await tradingPost.giftingEnabled()).to.be.false;
      
      await scrollCard.connect(sender).approve(await tradingPost.getAddress(), 0);
      await expect(
        tradingPost.connect(sender).sendBulletGift(recipient.address, 0, 'Gift!', { value: giftFee })
      ).to.be.revertedWithCustomError(tradingPost, 'GiftingDisabled');
    });

    it('should allow manager to gift bullet', async () => {
      await scrollCard.connect(sender).setApprovalForAll(await tradingPost.getAddress(), true);
      
      await expect(
        tradingPost.connect(owner).giftBullet(sender.address, recipient.address, 0, 'System gift!')
      )
        .to.emit(tradingPost, 'GiftSent')
        .withArgs(1, 0, sender.address, recipient.address, 'System gift!');
    });

    it('should withdraw fees', async () => {
      const balanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      
      await tradingPost.connect(owner).withdrawFees();
      
      const balanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });
});
