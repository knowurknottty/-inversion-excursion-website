import { ethers } from 'hardhat';
import { verify } from './verify';
import fs from 'fs';
import path from 'path';

/**
 * PolarisCharityMinter Deployment Script
 * 
 * Deploys the Polaris Project partnership contract with immutable charity commitment.
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-polaris-minter.ts --network base
 * 
 * Environment Variables Required:
 *   - POLARIS_PROJECT_ADDRESS: Verified Polaris Project ETH address
 *   - PRIVATE_KEY: Deployer private key
 *   - BASE_RPC_URL: Base network RPC endpoint
 */

// Configuration
const CONFIG = {
  // Polaris Project verified donation address
  // THIS MUST BE VERIFIED BEFORE DEPLOYMENT
  POLARIS_PROJECT_ADDRESS: process.env.POLARIS_PROJECT_ADDRESS || '',
  
  // NFT Configuration
  NFT_NAME: 'EPWorld Charity Cards',
  NFT_SYMBOL: 'EWC',
  
  // Partnership Agreement IPFS hash (upload document first)
  PARTNERSHIP_AGREEMENT_URI: process.env.PARTNERSHIP_URI || 'ipfs://placeholder',
  
  // Initial mint price
  INITIAL_MINT_PRICE: ethers.parseEther('0.01'),
  
  // Max supply
  MAX_SUPPLY: 100000,
};

async function main() {
  console.log('🚀 Deploying PolarisCharityMinter...\n');

  // Validate Polaris address
  if (!CONFIG.POLARIS_PROJECT_ADDRESS) {
    throw new Error(
      '❌ POLARIS_PROJECT_ADDRESS not set!\n' +
      'This is the verified Polaris Project donation address.\n' +
      'Obtain from: https://polarisproject.org/donate'
    );
  }

  if (!ethers.isAddress(CONFIG.POLARIS_PROJECT_ADDRESS)) {
    throw new Error('❌ Invalid POLARIS_PROJECT_ADDRESS format');
  }

  console.log('✅ Polaris Project Address:', CONFIG.POLARIS_PROJECT_ADDRESS);

  // Compute partnership commitment hash
  const agreementPath = path.join(__dirname, '../docs/POLARIS_PARTNERSHIP_AGREEMENT.md');
  let commitmentHash: string;
  
  if (fs.existsSync(agreementPath)) {
    const agreementContent = fs.readFileSync(agreementPath, 'utf8');
    commitmentHash = ethers.sha256(ethers.toUtf8Bytes(agreementContent));
    console.log('✅ Partnership Agreement Hash:', commitmentHash);
  } else {
    console.warn('⚠️  Partnership agreement not found, using placeholder hash');
    commitmentHash = ethers.sha256(ethers.toUtf8Bytes('EPWorld x Polaris Project'));
  }

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');

  // Deploy contract
  console.log('\n📄 Deploying PolarisCharityMinter...');
  
  const PolarisCharityMinter = await ethers.getContractFactory('PolarisCharityMinter');
  
  const contract = await PolarisCharityMinter.deploy(
    CONFIG.NFT_NAME,
    CONFIG.NFT_SYMBOL,
    CONFIG.POLARIS_PROJECT_ADDRESS,
    commitmentHash,
    CONFIG.PARTNERSHIP_AGREEMENT_URI
  );

  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log('✅ Contract deployed to:', contractAddress);

  // Verify deployment
  console.log('\n🔍 Verifying deployment...');
  
  const deployedPolarisAddress = await contract.POLARIS_PROJECT_ADDRESS();
  const deployedCommitmentHash = await contract.PARTNERSHIP_COMMITMENT_HASH();
  const charityRate = await contract.CHARITY_BASIS_POINTS();
  
  console.log('   Polaris Address:', deployedPolarisAddress);
  console.log('   Commitment Hash:', deployedCommitmentHash);
  console.log('   Charity Rate:', charityRate.toString(), 'basis points (10%)');

  // Verify values match
  if (deployedPolarisAddress.toLowerCase() !== CONFIG.POLARIS_PROJECT_ADDRESS.toLowerCase()) {
    throw new Error('❌ Polaris address mismatch!');
  }
  
  if (deployedCommitmentHash !== commitmentHash) {
    throw new Error('❌ Commitment hash mismatch!');
  }
  
  if (charityRate !== 1000n) {
    throw new Error('❌ Charity rate is not 10%!');
  }

  console.log('✅ All values verified correctly!\n');

  // Set initial parameters
  console.log('⚙️  Setting initial parameters...');
  
  const tx1 = await contract.setMintPrice(CONFIG.INITIAL_MINT_PRICE);
  await tx1.wait();
  console.log('   Mint price set to:', ethers.formatEther(CONFIG.INITIAL_MINT_PRICE), 'ETH');

  const tx2 = await contract.setMaxSupply(CONFIG.MAX_SUPPLY);
  await tx2.wait();
  console.log('   Max supply set to:', CONFIG.MAX_SUPPLY);

  // Enable minting
  const tx3 = await contract.unpause();
  await tx3.wait();
  console.log('   Minting enabled');

  // Verify on block explorer
  console.log('\n🔎 Verifying on block explorer...');
  try {
    await verify(contractAddress, [
      CONFIG.NFT_NAME,
      CONFIG.NFT_SYMBOL,
      CONFIG.POLARIS_PROJECT_ADDRESS,
      commitmentHash,
      CONFIG.PARTNERSHIP_AGREEMENT_URI,
    ]);
    console.log('✅ Contract verified on block explorer');
  } catch (error) {
    console.warn('⚠️  Block explorer verification failed:', error);
    console.log('   You may need to verify manually');
  }

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contractAddress,
    polarisProjectAddress: CONFIG.POLARIS_PROJECT_ADDRESS,
    commitmentHash,
    charityRate: '10%',
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contractName: CONFIG.NFT_NAME,
    contractSymbol: CONFIG.NFT_SYMBOL,
    initialMintPrice: CONFIG.INITIAL_MINT_PRICE.toString(),
    maxSupply: CONFIG.MAX_SUPPLY,
  };

  const deploymentPath = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentPath, `polaris-minter-${deploymentInfo.network}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n💾 Deployment info saved to:', 
    `deployments/polaris-minter-${deploymentInfo.network}.json`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEPLOYMENT COMPLETE');
  console.log('='.repeat(60));
  console.log('Contract Address:', contractAddress);
  console.log('Polaris Address:', CONFIG.POLARIS_PROJECT_ADDRESS);
  console.log('Charity Rate: 10% (IMMUTABLE)');
  console.log('Block Explorer:', getExplorerUrl(contractAddress));
  console.log('='.repeat(60));

  // Test donation flow
  console.log('\n🧪 Testing donation flow...');
  await testDonationFlow(contract, deployer);
}

async function testDonationFlow(contract: any, deployer: any) {
  console.log('   Sending test mint...');
  
  // Get Polaris balance before
  const polarisAddress = await contract.POLARIS_PROJECT_ADDRESS();
  const polarisBalanceBefore = await ethers.provider.getBalance(polarisAddress);
  
  // Mint with charity
  const mintTx = await contract.mintWithCharity(
    'ipfs://test-metadata',
    {
      power: 100n,
      rarity: 1n,
      chapter: 1n,
      dungeon: 'Test Dungeon',
      extractedQuote: 'Test quote',
      mintTimestamp: 0n,
      minter: ethers.ZeroAddress,
    },
    { value: ethers.parseEther('0.01') }
  );
  
  const receipt = await mintTx.wait();
  console.log('   Mint successful! Gas used:', receipt.gasUsed.toString());

  // Check Polaris balance after
  const polarisBalanceAfter = await ethers.provider.getBalance(polarisAddress);
  const donationAmount = polarisBalanceAfter - polarisBalanceBefore;
  
  console.log('   Donation sent:', ethers.formatEther(donationAmount), 'ETH');
  console.log('   Expected (10%):', ethers.formatEther(ethers.parseEther('0.01') / 10n), 'ETH');
  
  // Verify donation amount
  const expectedDonation = ethers.parseEther('0.01') * 1000n / 10000n;
  if (donationAmount === expectedDonation) {
    console.log('   ✅ Donation amount verified!');
  } else {
    console.error('   ❌ Donation amount mismatch!');
  }

  // Check global stats
  const stats = await contract.getGlobalCharityStats();
  console.log('   Total donated:', ethers.formatEther(stats[0]), 'ETH');
  console.log('   Total charity mints:', stats[1].toString());
}

function getExplorerUrl(address: string): string {
  const network = process.env.HARDHAT_NETWORK || 'base';
  const explorers: Record<string, string> = {
    mainnet: `https://etherscan.io/address/${address}`,
    base: `https://basescan.org/address/${address}`,
    optimism: `https://optimistic.etherscan.io/address/${address}`,
    sepolia: `https://sepolia.etherscan.io/address/${address}`,
    baseSepolia: `https://sepolia.basescan.org/address/${address}`,
  };
  return explorers[network] || address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
