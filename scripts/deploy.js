/**
 * Deployment Script for The Inversion Excursion
 * Deploys all contracts to the specified network
 */

const { ethers, network, run } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Contract deployment configuration
const CONFIG = {
  maxCellSize: 5,
  formationCooldown: 3600, // 1 hour
  maxDailyGifts: 10,
  claimPeriod: 604800, // 7 days
  entryFee: ethers.parseEther('0.001'),
  battleCooldown: 300, // 5 minutes
  resonanceDecayRate: 86400, // 1 day
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;
  const chainId = network.config.chainId;

  console.log(`Deploying to ${networkName} (chainId: ${chainId})...`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  console.log('---');

  // Track deployed contracts
  const deployedContracts = {};
  const deploymentTimestamp = new Date().toISOString();

  try {
    // ========================================
    // 1. Deploy EntryPoint (for ERC-4337) - use existing on mainnets
    // ========================================
    let entryPointAddress;
    if (networkName === 'base') {
      entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'; // Base Mainnet
    } else if (networkName === 'baseSepolia') {
      entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'; // Base Sepolia
    } else {
      // Deploy mock EntryPoint for local testing
      const EntryPoint = await ethers.getContractFactory('EntryPoint');
      const entryPoint = await EntryPoint.deploy();
      await entryPoint.waitForDeployment();
      entryPointAddress = await entryPoint.getAddress();
      console.log(`✓ EntryPoint deployed: ${entryPointAddress}`);
    }
    deployedContracts.EntryPoint = entryPointAddress;

    // ========================================
    // 2. Deploy CellRegistry (ERC-6551 Registry)
    // ========================================
    console.log('\n📦 Deploying CellRegistry...');
    const CellRegistry = await ethers.getContractFactory('CellRegistry');
    const cellRegistry = await CellRegistry.deploy(
      CONFIG.maxCellSize,
      CONFIG.formationCooldown,
      CONFIG.maxDailyGifts,
      CONFIG.claimPeriod
    );
    await cellRegistry.waitForDeployment();
    const cellRegistryAddress = await cellRegistry.getAddress();
    deployedContracts.CellRegistry = cellRegistryAddress;
    console.log(`✓ CellRegistry deployed: ${cellRegistryAddress}`);

    // ========================================
    // 3. Deploy FrequencyCatalyst (ERC-20)
    // ========================================
    console.log('\n📦 Deploying FrequencyCatalyst...');
    const FrequencyCatalyst = await ethers.getContractFactory('FrequencyCatalyst');
    const frequencyCatalyst = await FrequencyCatalyst.deploy(
      deployer.address, // initialOwner
      ethers.parseEther('1000000'), // initialSupply: 1M tokens
    );
    await frequencyCatalyst.waitForDeployment();
    const frequencyCatalystAddress = await frequencyCatalyst.getAddress();
    deployedContracts.FrequencyCatalyst = frequencyCatalystAddress;
    console.log(`✓ FrequencyCatalyst deployed: ${frequencyCatalystAddress}`);

    // ========================================
    // 4. Deploy InversionCard (ERC-721)
    // ========================================
    console.log('\n📦 Deploying InversionCard...');
    const InversionCard = await ethers.getContractFactory('InversionCard');
    const inversionCard = await InversionCard.deploy(
      deployer.address, // defaultAdmin
      deployer.address, // minter
      deployer.address, // upgrader
    );
    await inversionCard.waitForDeployment();
    const inversionCardAddress = await inversionCard.getAddress();
    deployedContracts.InversionCard = inversionCardAddress;
    console.log(`✓ InversionCard deployed: ${inversionCardAddress}`);

    // ========================================
    // 5. Deploy Battleground (Main Game Contract)
    // ========================================
    console.log('\n📦 Deploying Battleground...');
    const Battleground = await ethers.getContractFactory('Battleground');
    const battleground = await Battleground.deploy(
      cellRegistryAddress,
      frequencyCatalystAddress,
      CONFIG.entryFee,
      CONFIG.battleCooldown
    );
    await battleground.waitForDeployment();
    const battlegroundAddress = await battleground.getAddress();
    deployedContracts.Battleground = battlegroundAddress;
    console.log(`✓ Battleground deployed: ${battlegroundAddress}`);

    // ========================================
    // 6. Deploy ResonanceKeeper (ERC-4337 Paymaster)
    // ========================================
    console.log('\n📦 Deploying ResonanceKeeper...');
    const ResonanceKeeper = await ethers.getContractFactory('ResonanceKeeper');
    const resonanceKeeper = await ResonanceKeeper.deploy(
      entryPointAddress,
      frequencyCatalystAddress,
      CONFIG.resonanceDecayRate
    );
    await resonanceKeeper.waitForDeployment();
    const resonanceKeeperAddress = await resonanceKeeper.getAddress();
    deployedContracts.ResonanceKeeper = resonanceKeeperAddress;
    console.log(`✓ ResonanceKeeper deployed: ${resonanceKeeperAddress}`);

    // ========================================
    // 7. Deploy Achievements (Soulbound Tokens)
    // ========================================
    console.log('\n📦 Deploying Achievements...');
    const Achievements = await ethers.getContractFactory('Achievements');
    const achievements = await Achievements.deploy(
      deployer.address,
      battlegroundAddress
    );
    await achievements.waitForDeployment();
    const achievementsAddress = await achievements.getAddress();
    deployedContracts.Achievements = achievementsAddress;
    console.log(`✓ Achievements deployed: ${achievementsAddress}`);

    // ========================================
    // 8. Configure Contract Relationships
    // ========================================
    console.log('\n⚙️  Configuring contracts...');

    // Grant minter role to Battleground for cards
    await (await inversionCard.grantRole(
      await inversionCard.MINTER_ROLE(),
      battlegroundAddress
    )).wait();
    console.log('  ✓ Granted MINTER_ROLE to Battleground');

    // Grant minter role to Battleground for tokens
    await (await frequencyCatalyst.grantRole(
      await frequencyCatalyst.MINTER_ROLE(),
      battlegroundAddress
    )).wait();
    console.log('  ✓ Granted MINTER_ROLE to Battleground for tokens');

    // Set Battleground as game contract in CellRegistry
    await (await cellRegistry.setGameContract(battlegroundAddress)).wait();
    console.log('  ✓ Set Battleground as game contract');

    // Fund ResonanceKeeper with initial tokens for gas sponsorship
    await (await frequencyCatalyst.transfer(
      resonanceKeeperAddress,
      ethers.parseEther('100000') // 100k tokens for gas sponsorship
    )).wait();
    console.log('  ✓ Funded ResonanceKeeper with 100k tokens');

    // Set up achievements contract
    await (await battleground.setAchievementsContract(achievementsAddress)).wait();
    console.log('  ✓ Set achievements contract');

    // ========================================
    // 9. Save Deployment Info
    // ========================================
    console.log('\n💾 Saving deployment info...');
    
    const deploymentInfo = {
      network: networkName,
      chainId: chainId,
      timestamp: deploymentTimestamp,
      deployer: deployer.address,
      contracts: deployedContracts,
      config: CONFIG,
    };

    // Create deployments directory
    const deploymentsDir = path.join(__dirname, '..', 'deployments', networkName);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save latest deployment
    fs.writeFileSync(
      path.join(deploymentsDir, 'latest.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    // Save timestamped deployment
    fs.writeFileSync(
      path.join(deploymentsDir, `${Date.now()}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`  ✓ Deployment info saved to ${deploymentsDir}`);

    // ========================================
    // 10. Verify Contracts (if on public network)
    // ========================================
    if (networkName !== 'hardhat' && networkName !== 'localhost') {
      console.log('\n🔍 Waiting for block confirmations before verification...');
      await new Promise(r => setTimeout(r, 30000)); // Wait 30s

      console.log('🔍 Verifying contracts on Basescan...');

      const contractsToVerify = [
        { name: 'CellRegistry', address: cellRegistryAddress, args: [CONFIG.maxCellSize, CONFIG.formationCooldown, CONFIG.maxDailyGifts, CONFIG.claimPeriod] },
        { name: 'FrequencyCatalyst', address: frequencyCatalystAddress, args: [deployer.address, ethers.parseEther('1000000')] },
        { name: 'InversionCard', address: inversionCardAddress, args: [deployer.address, deployer.address, deployer.address] },
        { name: 'Battleground', address: battlegroundAddress, args: [cellRegistryAddress, frequencyCatalystAddress, CONFIG.entryFee, CONFIG.battleCooldown] },
        { name: 'ResonanceKeeper', address: resonanceKeeperAddress, args: [entryPointAddress, frequencyCatalystAddress, CONFIG.resonanceDecayRate] },
        { name: 'Achievements', address: achievementsAddress, args: [deployer.address, battlegroundAddress] },
      ];

      for (const contract of contractsToVerify) {
        try {
          await run('verify:verify', {
            address: contract.address,
            constructorArguments: contract.args,
          });
          console.log(`  ✓ ${contract.name} verified`);
        } catch (err) {
          console.log(`  ⚠️  ${contract.name} verification failed: ${err.message}`);
        }
      }
    }

    // ========================================
    // Summary
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Deployment Complete!');
    console.log('='.repeat(60));
    console.log(`Network: ${networkName}`);
    console.log(`Chain ID: ${chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log('\nDeployed Contracts:');
    for (const [name, address] of Object.entries(deployedContracts)) {
      console.log(`  ${name}: ${address}`);
    }
    console.log('='.repeat(60));

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    throw error;
  }
}

// Execute deployment
main()
  .then((info) => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
