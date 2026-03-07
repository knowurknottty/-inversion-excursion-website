/**
 * Contract Tests: GamePaymaster.sol
 * Tests ERC-4337 paymaster for gasless transactions
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { GamePaymaster } from '../../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('GamePaymaster Contract', () => {
  let paymaster: GamePaymaster;
  let owner: SignerWithAddress;
  let operator: SignerWithAddress;
  let player: SignerWithAddress;
  let sponsor: SignerWithAddress;
  let verifyingSigner: SignerWithAddress;
  let entryPoint: SignerWithAddress;

  // Mock UserOperation
  const createUserOp = (overrides: any = {}) => ({
    sender: player.address,
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGasLimit: 100000,
    verificationGasLimit: 100000,
    preVerificationGas: 50000,
    maxFeePerGas: 1000000000,
    maxPriorityFeePerGas: 1000000000,
    paymasterAndData: ethers.concat([
      await paymaster.getAddress(),
      ethers.getBytes(overrides.operationType || 1),
    ]),
    signature: '0x',
    ...overrides,
  });

  beforeEach(async () => {
    [owner, operator, player, sponsor, verifyingSigner, entryPoint] = await ethers.getSigners();

    const GamePaymasterFactory = await ethers.getContractFactory('GamePaymaster');
    paymaster = await GamePaymasterFactory.deploy(
      entryPoint.address,
      verifyingSigner.address
    );
    await paymaster.waitForDeployment();

    // Fund paymaster
    await owner.sendTransaction({
      to: await paymaster.getAddress(),
      value: ethers.parseEther('10'),
    });
  });

  describe('Deployment', () => {
    it('should set correct entry point', async () => {
      expect(await paymaster.entryPoint()).to.equal(entryPoint.address);
    });

    it('should set correct verifying signer', async () => {
      expect(await paymaster.verifyingSigner()).to.equal(verifyingSigner.address);
    });

    it('should grant roles to deployer', async () => {
      expect(await paymaster.hasRole(await paymaster.PAYMASTER_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await paymaster.hasRole(await paymaster.OPERATOR_ROLE(), owner.address)).to.be.true;
      expect(await paymaster.hasRole(await paymaster.SPONSOR_ROLE(), owner.address)).to.be.true;
    });

    it('should initialize default tiers', async () => {
      const tier0 = await paymaster.sponsorshipTiers(0);
      expect(tier0.dailyTransactions).to.equal(3);
      expect(tier0.maxGasPerTransaction).to.equal(100000);
      expect(tier0.active).to.be.true;

      const tier3 = await paymaster.sponsorshipTiers(3);
      expect(tier3.dailyTransactions).to.equal(ethers.MaxUint256);
    });

    it('should initialize sponsored operations', async () => {
      expect(await paymaster.sponsoredOperations(1)).to.be.true; // OP_ENTER_DUNGEON
      expect(await paymaster.sponsoredOperations(4)).to.be.false; // OP_BATTLE_COMPLETE
    });
  });

  describe('Player Whitelisting', () => {
    it('should whitelist a player', async () => {
      await expect(paymaster.connect(sponsor).whitelistPlayer(player.address, 1))
        .to.emit(paymaster, 'PlayerWhitelisted')
        .withArgs(player.address, 1);
    });

    it('should set player sponsorship data', async () => {
      await paymaster.connect(sponsor).whitelistPlayer(player.address, 2);
      
      const [sponsorship, tier] = await paymaster.getPlayerInfo(player.address);
      expect(sponsorship.tierId).to.equal(2);
      expect(sponsorship.whitelisted).to.be.true;
      expect(tier.dailyTransactions).to.equal(50);
    });

    it('should only allow sponsor role to whitelist', async () => {
      await expect(
        paymaster.connect(player).whitelistPlayer(player.address, 1)
      ).to.be.revertedWithCustomError(paymaster, 'AccessControlUnauthorizedAccount');
    });

    it('should reject invalid tier', async () => {
      await expect(
        paymaster.connect(sponsor).whitelistPlayer(player.address, 99)
      ).to.be.revertedWithCustomError(paymaster, 'InvalidTier');
    });

    it('should remove player from whitelist', async () => {
      await paymaster.connect(sponsor).whitelistPlayer(player.address, 1);
      
      await expect(paymaster.connect(sponsor).removePlayer(player.address))
        .to.emit(paymaster, 'PlayerRemoved')
        .withArgs(player.address);
      
      const [sponsorship] = await paymaster.getPlayerInfo(player.address);
      expect(sponsorship.whitelisted).to.be.false;
    });

    it('should update player tier', async () => {
      await paymaster.connect(sponsor).whitelistPlayer(player.address, 1);
      await paymaster.connect(sponsor).setPlayerTier(player.address, 2);
      
      const [sponsorship] = await paymaster.getPlayerInfo(player.address);
      expect(sponsorship.tierId).to.equal(2);
    });
  });

  describe('Sponsorship Tiers', () => {
    it('should set new tier', async () => {
      await expect(paymaster.setTier(5, 100, 500000, true))
        .to.emit(paymaster, 'TierUpdated')
        .withArgs(5, 100, 500000);
      
      const tier = await paymaster.sponsorshipTiers(5);
      expect(tier.dailyTransactions).to.equal(100);
      expect(tier.maxGasPerTransaction).to.equal(500000);
      expect(tier.active).to.be.true;
    });

    it('should only allow admin to set tier', async () => {
      await expect(
        paymaster.connect(player).setTier(5, 100, 500000, true)
      ).to.be.revertedWithCustomError(paymaster, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('Operation Management', () => {
    it('should set sponsored operation', async () => {
      await paymaster.setSponsoredOperation(10, true);
      expect(await paymaster.sponsoredOperations(10)).to.be.true;
    });

    it('should remove sponsored operation', async () => {
      await paymaster.setSponsoredOperation(1, false);
      expect(await paymaster.sponsoredOperations(1)).to.be.false;
    });

    it('should only allow admin to set operations', async () => {
      await expect(
        paymaster.connect(player).setSponsoredOperation(1, false)
      ).to.be.revertedWithCustomError(paymaster, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('Deposit Management', () => {
    it('should add deposit', async () => {
      const amount = ethers.parseEther('5');
      
      await expect(paymaster.addDeposit({ value: amount }))
        .to.emit(paymaster, 'DepositAdded')
        .withArgs(owner.address, amount);
      
      expect(await paymaster.depositBalance()).to.equal(ethers.parseEther('15'));
    });

    it('should only allow admin to add deposit', async () => {
      await expect(
        paymaster.connect(player).addDeposit({ value: ethers.parseEther('1') })
      ).to.be.revertedWithCustomError(paymaster, 'AccessControlUnauthorizedAccount');
    });

    it('should withdraw deposit', async () => {
      const withdrawAmount = ethers.parseEther('5');
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      
      await paymaster.withdrawDeposit(withdrawAmount);
      
      expect(await paymaster.depositBalance()).to.equal(ethers.parseEther('5'));
      
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it('should reject withdrawal exceeding balance', async () => {
      await expect(
        paymaster.withdrawDeposit(ethers.parseEther('100'))
      ).to.be.revertedWithCustomError(paymaster, 'InsufficientDeposit');
    });

    it('should allow emergency withdraw', async () => {
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      
      await paymaster.emergencyWithdraw();
      
      expect(await paymaster.depositBalance()).to.equal(0);
      
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
  });

  describe('Can Sponsor Check', () => {
    beforeEach(async () => {
      await paymaster.connect(sponsor).whitelistPlayer(player.address, 1);
    });

    it('should return true for whitelisted player', async () => {
      const [canSponsor, remainingDaily, maxGas] = await paymaster.canSponsor(player.address, 1);
      
      expect(canSponsor).to.be.true;
      expect(remainingDaily).to.equal(10);
      expect(maxGas).to.equal(200000);
    });

    it('should return false for non-sponsored operation', async () => {
      const [canSponsor] = await paymaster.canSponsor(player.address, 99);
      expect(canSponsor).to.be.false;
    });

    it('should return false for inactive tier', async () => {
      // Create inactive tier and assign player
      await paymaster.setTier(5, 10, 100000, false);
      await paymaster.connect(sponsor).setPlayerTier(player.address, 5);
      await paymaster.connect(sponsor).removePlayer(player.address); // Remove whitelist override
      
      const [canSponsor] = await paymaster.canSponsor(player.address, 1);
      expect(canSponsor).to.be.false;
    });
  });

  describe('Admin Functions', () => {
    it('should set game contract address', async () => {
      await paymaster.setGameContract(player.address);
      expect(await paymaster.gameContract()).to.equal(player.address);
    });

    it('should set verifying signer', async () => {
      await expect(paymaster.setVerifyingSigner(player.address))
        .to.emit(paymaster, 'VerifyingSignerUpdated')
        .withArgs(verifyingSigner.address, player.address);
      
      expect(await paymaster.verifyingSigner()).to.equal(player.address);
    });

    it('should pause contract', async () => {
      await paymaster.pause();
      expect(await paymaster.paused()).to.be.true;
    });

    it('should unpause contract', async () => {
      await paymaster.pause();
      await paymaster.unpause();
      expect(await paymaster.paused()).to.be.false;
    });

    it('should return remaining daily transactions', async () => {
      await paymaster.connect(sponsor).whitelistPlayer(player.address, 1);
      
      const remaining = await paymaster.getRemainingDailyTransactions(player.address);
      expect(remaining).to.equal(10);
    });

    it('should return total sponsored count', async () => {
      expect(await paymaster.getTotalSponsoredCount()).to.equal(0);
    });
  });
});
