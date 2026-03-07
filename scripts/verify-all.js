/**
 * Batch contract verification script
 * Verifies all contracts from the latest deployment
 */

const { run } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const networkName = hre.network.name;
  const deploymentFile = path.join(__dirname, '..', 'deployments', networkName, 'latest.json');
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`No deployment found for ${networkName}`);
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const contracts = deployment.contracts;
  
  console.log(`Verifying contracts on ${networkName}...\n`);
  
  const verificationConfigs = [
    {
      name: 'CellRegistry',
      address: contracts.CellRegistry,
      args: [
        deployment.config.maxCellSize,
        deployment.config.formationCooldown,
       .deployment.config.maxDailyGifts,
        deployment.config.claimPeriod,
      ],
    },
    {
      name: 'FrequencyCatalyst',
      address: contracts.FrequencyCatalyst,
      args: [
        deployment.deployer,
        hre.ethers.parseEther('1000000').toString(),
      ],
    },
    {
      name: 'InversionCard',
      address: contracts.InversionCard,
      args: [deployment.deployer, deployment.deployer, deployment.deployer],
    },
    {
      name: 'Battleground',
      address: contracts.Battleground,
      args: [
        contracts.CellRegistry,
        contracts.FrequencyCatalyst,
        deployment.config.entryFee,
        deployment.config.battleCooldown,
      ],
    },
    {
      name: 'ResonanceKeeper',
      address: contracts.ResonanceKeeper,
      args: [
        contracts.EntryPoint,
        contracts.FrequencyCatalyst,
        deployment.config.resonanceDecayRate,
      ],
    },
    {
      name: 'Achievements',
      address: contracts.Achievements,
      args: [deployment.deployer, contracts.Battleground],
    },
  ];
  
  const results = [];
  
  for (const config of verificationConfigs) {
    if (!config.address) {
      console.log(`⚠️  Skipping ${config.name} - no address`);
      continue;
    }
    
    try {
      console.log(`🔍 Verifying ${config.name} at ${config.address}...`);
      await run('verify:verify', {
        address: config.address,
        constructorArguments: config.args,
      });
      console.log(`✅ ${config.name} verified`);
      results.push({ name: config.name, status: 'success' });
    } catch (error) {
      console.log(`❌ ${config.name} failed: ${error.message}`);
      results.push({ name: config.name, status: 'failed', error: error.message });
    }
    
    // Small delay between verifications
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Verification Summary');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));
  
  if (failed > 0) {
    console.log('\nFailed verifications:');
    results
      .filter(r => r.status === 'failed')
      .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
