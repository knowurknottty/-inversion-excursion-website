/**
 * Contract Tests: CellRegistry.sol
 * Tests cell formation, membership, and battle recording
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CellRegistry } from '../../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('CellRegistry Contract', () => {
  let cellRegistry: CellRegistry;
  let owner: SignerWithAddress;
  let leader: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;
  let gameMaster: SignerWithAddress;

  const maxCellSize = 5;
  const formationCooldown = 86400; // 1 day

  beforeEach(async () => {
    [owner, leader, member1, member2, member3, gameMaster] = await ethers.getSigners();

    const CellRegistryFactory = await ethers.getContractFactory('CellRegistry');
    cellRegistry = await CellRegistryFactory.deploy(
      owner.address,
      maxCellSize,
      formationCooldown
    );
    await cellRegistry.waitForDeployment();

    // Grant game master role
    await cellRegistry.grantRole(await cellRegistry.GAME_MASTER_ROLE(), gameMaster.address);
  });

  describe('Deployment', () => {
    it('should set correct initial parameters', async () => {
      expect(await cellRegistry.maxCellSize()).to.equal(maxCellSize);
      expect(await cellRegistry.formationCooldown()).to.equal(formationCooldown);
    });

    it('should grant roles to admin', async () => {
      expect(await cellRegistry.hasRole(await cellRegistry.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await cellRegistry.hasRole(await cellRegistry.CELL_MANAGER_ROLE(), owner.address)).to.be.true;
      expect(await cellRegistry.hasRole(await cellRegistry.GAME_MASTER_ROLE(), owner.address)).to.be.true;
    });

    it('should start counters at 1', async () => {
      expect(await cellRegistry.getTotalCells()).to.equal(0);
    });
  });

  describe('Cell Creation', () => {
    it('should create a new cell', async () => {
      await expect(cellRegistry.connect(leader).createCell([], 'Test Cell'))
        .to.emit(cellRegistry, 'CellFormed')
        .withArgs(1, leader.address, [], 'Test Cell');
    });

    it('should store cell data correctly', async () => {
      await cellRegistry.connect(leader).createCell([], 'My Cell');
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.id).to.equal(1);
      expect(cell.leader).to.equal(leader.address);
      expect(cell.name).to.equal('My Cell');
      expect(cell.active).to.be.true;
      expect(cell.members).to.be.an('array').that.is.empty;
    });

    it('should create cell with initial members', async () => {
      await cellRegistry.connect(leader).createCell(
        [member1.address, member2.address],
        'Cell With Members'
      );
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.members.length).to.equal(2);
      expect(cell.members[0]).to.equal(member1.address);
    });

    it('should assign leader to cell', async () => {
      await cellRegistry.connect(leader).createCell([], 'My Cell');
      
      expect(await cellRegistry.playerCell(leader.address)).to.equal(1);
    });

    it('should assign members to cell', async () => {
      await cellRegistry.connect(leader).createCell([member1.address], 'My Cell');
      
      expect(await cellRegistry.playerCell(member1.address)).to.equal(1);
    });

    it('should enforce formation cooldown', async () => {
      await cellRegistry.connect(leader).createCell([], 'First Cell');
      
      await expect(
        cellRegistry.connect(leader).createCell([], 'Second Cell')
      ).to.be.revertedWithCustomError(cellRegistry, 'CooldownActive');
    });

    it('should prevent creating cell when already in one', async () => {
      await cellRegistry.connect(leader).createCell([], 'First Cell');
      
      await expect(
        cellRegistry.connect(member1).createCell([leader.address], 'Invalid Cell')
      ).to.be.revertedWithCustomError(cellRegistry, 'AlreadyInCell');
    });

    it('should enforce max cell size', async () => {
      const members = [member1.address, member2.address, member3.address, owner.address];
      
      await expect(
        cellRegistry.connect(leader).createCell(members, 'Too Big')
      ).to.be.revertedWithCustomError(cellRegistry, 'CellFull');
    });

    it('should prevent members from being in multiple cells', async () => {
      await cellRegistry.connect(leader).createCell([member1.address], 'First Cell');
      
      await expect(
        cellRegistry.connect(member2).createCell([member1.address], 'Second Cell')
      ).to.be.revertedWithCustomError(cellRegistry, 'AlreadyMemberOfCell');
    });
  });

  describe('Adding Members', () => {
    beforeEach(async () => {
      await cellRegistry.connect(leader).createCell([], 'Test Cell');
    });

    it('should allow leader to add member', async () => {
      await expect(cellRegistry.connect(leader).addMember(1, member1.address))
        .to.emit(cellRegistry, 'MemberJoined')
        .withArgs(1, member1.address);
    });

    it('should update player cell mapping', async () => {
      await cellRegistry.connect(leader).addMember(1, member1.address);
      
      expect(await cellRegistry.playerCell(member1.address)).to.equal(1);
    });

    it('should enforce max member limit', async () => {
      // Fill up the cell
      await cellRegistry.connect(leader).addMember(1, member1.address);
      await cellRegistry.connect(leader).addMember(1, member2.address);
      await cellRegistry.connect(leader).addMember(1, member3.address);
      await cellRegistry.connect(leader).addMember(1, owner.address);
      
      await expect(
        cellRegistry.connect(leader).addMember(1, gameMaster.address)
      ).to.be.revertedWithCustomError(cellRegistry, 'CellFull');
    });

    it('should prevent non-leader from adding members', async () => {
      await expect(
        cellRegistry.connect(member1).addMember(1, member2.address)
      ).to.be.revertedWithCustomError(cellRegistry, 'NotCellLeader');
    });

    it('should prevent adding member already in a cell', async () => {
      await cellRegistry.connect(leader).addMember(1, member1.address);
      
      await expect(
        cellRegistry.connect(leader).addMember(1, member1.address)
      ).to.be.revertedWithCustomError(cellRegistry, 'AlreadyMemberOfCell');
    });
  });

  describe('Removing Members', () => {
    beforeEach(async () => {
      await cellRegistry.connect(leader).createCell([member1.address], 'Test Cell');
    });

    it('should allow leader to remove member', async () => {
      await expect(cellRegistry.connect(leader).removeMember(1, member1.address))
        .to.emit(cellRegistry, 'MemberLeft')
        .withArgs(1, member1.address, 1); // reason 1 = kicked
    });

    it('should clear player cell mapping', async () => {
      await cellRegistry.connect(leader).removeMember(1, member1.address);
      
      expect(await cellRegistry.playerCell(member1.address)).to.equal(0);
    });

    it('should prevent removing leader', async () => {
      await expect(
        cellRegistry.connect(leader).removeMember(1, leader.address)
      ).to.be.revertedWithCustomError(cellRegistry, 'CannotRemoveLeader');
    });

    it('should allow member to leave', async () => {
      await expect(cellRegistry.connect(member1).leaveCell(1))
        .to.emit(cellRegistry, 'MemberLeft')
        .withArgs(1, member1.address, 0); // reason 0 = left
    });

    it('should prevent non-member from leaving', async () => {
      await expect(
        cellRegistry.connect(member2).leaveCell(1)
      ).to.be.revertedWithCustomError(cellRegistry, 'NotCellMember');
    });
  });

  describe('Leadership Transfer', () => {
    beforeEach(async () => {
      await cellRegistry.connect(leader).createCell([member1.address], 'Test Cell');
    });

    it('should allow leader to transfer leadership', async () => {
      await expect(cellRegistry.connect(leader).transferLeadership(1, member1.address))
        .to.emit(cellRegistry, 'LeaderChanged')
        .withArgs(1, leader.address, member1.address);
    });

    it('should update leader in cell data', async () => {
      await cellRegistry.connect(leader).transferLeadership(1, member1.address);
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.leader).to.equal(member1.address);
    });

    it('should swap leader with new leader in members array', async () => {
      await cellRegistry.connect(leader).transferLeadership(1, member1.address);
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.members).to.include(leader.address);
      expect(cell.members).to.not.include(member1.address);
    });

    it('should prevent transferring to non-member', async () => {
      await expect(
        cellRegistry.connect(leader).transferLeadership(1, member2.address)
      ).to.be.revertedWithCustomError(cellRegistry, 'NotCellMember');
    });
  });

  describe('Cell Disbanding', () => {
    beforeEach(async () => {
      await cellRegistry.connect(leader).createCell([member1.address, member2.address], 'Test Cell');
    });

    it('should allow leader to disband cell', async () => {
      await expect(cellRegistry.connect(leader).disbandCell(1))
        .to.emit(cellRegistry, 'CellDisbanded')
        .withArgs(1, leader.address);
    });

    it('should mark cell as inactive', async () => {
      await cellRegistry.connect(leader).disbandCell(1);
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.active).to.be.false;
    });

    it('should clear all member cell mappings', async () => {
      await cellRegistry.connect(leader).disbandCell(1);
      
      expect(await cellRegistry.playerCell(leader.address)).to.equal(0);
      expect(await cellRegistry.playerCell(member1.address)).to.equal(0);
      expect(await cellRegistry.playerCell(member2.address)).to.equal(0);
    });

    it('should emit MemberLeft events for all members', async () => {
      await expect(cellRegistry.connect(leader).disbandCell(1))
        .to.emit(cellRegistry, 'MemberLeft')
        .withArgs(1, member1.address, 2); // reason 2 = disbanded
    });
  });

  describe('Battle Recording', () => {
    beforeEach(async () => {
      await cellRegistry.connect(leader).createCell([member1.address], 'Test Cell');
    });

    it('should record battle', async () => {
      await expect(
        cellRegistry.connect(gameMaster).recordBattle(1, 1, true, 1000, [leader.address, member1.address], 1)
      )
        .to.emit(cellRegistry, 'BattleRecorded')
        .withArgs(1, 1, 1, true, 1000);
    });

    it('should update cell battle stats on win', async () => {
      await cellRegistry.connect(gameMaster).recordBattle(1, 1, true, 1000, [leader.address], 1);
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.battlesWon).to.equal(1);
      expect(cell.battlesLost).to.equal(0);
      expect(cell.totalScore).to.equal(1000);
    });

    it('should update cell battle stats on loss', async () => {
      await cellRegistry.connect(gameMaster).recordBattle(1, 1, false, 500, [leader.address], 0);
      
      const cell = await cellRegistry.getCell(1);
      expect(cell.battlesWon).to.equal(0);
      expect(cell.battlesLost).to.equal(1);
      expect(cell.totalScore).to.equal(500);
    });

    it('should only allow game master to record battles', async () => {
      await expect(
        cellRegistry.connect(leader).recordBattle(1, 1, true, 1000, [leader.address], 1)
      ).to.be.revertedWithCustomError(cellRegistry, 'AccessControlUnauthorizedAccount');
    });

    it('should update last active timestamp', async () => {
      const before = (await cellRegistry.getCell(1)).lastActive;
      
      await cellRegistry.connect(gameMaster).recordBattle(1, 1, true, 1000, [leader.address], 1);
      
      const after = (await cellRegistry.getCell(1)).lastActive;
      expect(after).to.be.greaterThan(before);
    });
  });

  describe('View Functions', () => {
    beforeEach(async () => {
      await cellRegistry.connect(leader).createCell([member1.address], 'Test Cell');
      await cellRegistry.connect(gameMaster).recordBattle(1, 1, true, 1000, [leader.address], 1);
    });

    it('should return all members including leader', async () => {
      const members = await cellRegistry.getAllMembers(1);
      
      expect(members).to.include(leader.address);
      expect(members).to.include(member1.address);
      expect(members.length).to.equal(2);
    });

    it('should return cell battle history', async () => {
      const battles = await cellRegistry.getCellBattles(1);
      
      expect(battles.length).to.equal(1);
      expect(battles[0]).to.equal(1);
    });

    it('should return cell stats', async () => {
      const [winRate, totalBattles, avgScore] = await cellRegistry.getCellStats(1);
      
      expect(totalBattles).to.equal(1);
      expect(winRate).to.equal(10000); // 100% in basis points
      expect(avgScore).to.equal(1000);
    });

    it('should check membership', async () => {
      expect(await cellRegistry.isMember(1, leader.address)).to.be.true;
      expect(await cellRegistry.isMember(1, member1.address)).to.be.true;
      expect(await cellRegistry.isMember(1, member2.address)).to.be.false;
    });

    it('should return active cells', async () => {
      const activeCells = await cellRegistry.getActiveCells();
      
      expect(activeCells).to.include(1n);
    });

    it('should return leaderboard', async () => {
      const [cellIds, reputations] = await cellRegistry.getLeaderboard(10);
      
      expect(cellIds.length).to.be.greaterThan(0);
      expect(reputations.length).to.equal(cellIds.length);
    });
  });
});
