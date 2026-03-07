import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

/**
 * Polaris Partnership Verification Script
 * 
 * Verifies that the deployed contract correctly implements the Polaris Project
 * partnership agreement with immutable 10% charity donations.
 * 
 * Usage:
 *   npx ts-node scripts/verify-partnership.ts --contract 0x... --rpc https://...
 * 
 * This script can be run by:
 * - Polaris Project to verify their address is correct
 * - Third-party auditors
 * - Community members
 * - Regulatory compliance officers
 */

const POLARIS_MINTER_ABI = [
  {
    inputs: [],
    name: "POLARIS_PROJECT_ADDRESS",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CHARITY_BASIS_POINTS",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PARTNERSHIP_COMMITMENT_HASH",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PARTNERSHIP_EFFECTIVE_DATE",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGlobalCharityStats",
    outputs: [
      { name: "_totalDonatedWei", type: "uint256" },
      { name: "_totalCharityMints", type: "uint256" },
      { name: "_totalSurvivorSupport", type: "uint256" },
      { name: "_currentMintPrice", type: "uint256" },
      { name: "_milestoneCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPartnershipInfo",
    outputs: [
      { name: "polarisAddress", type: "address" },
      { name: "charityPercent", type: "uint256" },
      { name: "commitmentHash", type: "bytes32" },
      { name: "effectiveDate", type: "uint256" },
      { name: "agreementUri", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentDonationAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mintPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "minter", type: "address" },
      { indexed: false, name: "donationAmount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "message", type: "string" },
    ],
    name: "CharityMint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "recipient", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "purpose", type: "string" },
    ],
    name: "DonationSent",
    type: "event",
  },
];

interface VerificationResult {
  passed: boolean;
  checks: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    details: string;
  }[];
}

async function verifyPartnership(
  contractAddress: string,
  provider: ethers.JsonRpcProvider,
  expectedPolarisAddress?: string
): Promise<VerificationResult> {
  console.log('🔍 Polaris Partnership Verification');
  console.log('='.repeat(60));
  console.log('Contract:', contractAddress);
  console.log('Provider:', provider._getAddress);
  console.log('='.repeat(60) + '\n');

  const checks: VerificationResult['checks'] = [];
  const contract = new ethers.Contract(contractAddress, POLARIS_MINTER_ABI, provider);

  // Check 1: Polaris Address
  try {
    const polarisAddress = await contract.POLARIS_PROJECT_ADDRESS();
    const isZero = polarisAddress === ethers.ZeroAddress;
    
    if (isZero) {
      checks.push({
        name: 'Polaris Project Address',
        status: 'FAIL',
        details: 'Address is zero! This is a critical configuration error.',
      });
    } else if (expectedPolarisAddress && 
               polarisAddress.toLowerCase() !== expectedPolarisAddress.toLowerCase()) {
      checks.push({
        name: 'Polaris Project Address',
        status: 'FAIL',
        details: `Address mismatch!\n   Expected: ${expectedPolarisAddress}\n   Got: ${polarisAddress}`,
      });
    } else {
      checks.push({
        name: 'Polaris Project Address',
        status: 'PASS',
        details: `Verified: ${polarisAddress}`,
      });
    }
  } catch (error) {
    checks.push({
      name: 'Polaris Project Address',
      status: 'FAIL',
      details: `Error reading address: ${error}`,
    });
  }

  // Check 2: Charity Rate
  try {
    const charityRate = await contract.CHARITY_BASIS_POINTS();
    const expectedRate = 1000n; // 10%
    
    if (charityRate === expectedRate) {
      checks.push({
        name: 'Charity Rate',
        status: 'PASS',
        details: `Correct: ${charityRate} basis points (10%)`,
      });
    } else {
      checks.push({
        name: 'Charity Rate',
        status: 'FAIL',
        details: `Incorrect! Expected 1000 (10%), got ${charityRate} (${Number(charityRate) / 100}%)`,
      });
    }
  } catch (error) {
    checks.push({
      name: 'Charity Rate',
      status: 'FAIL',
      details: `Error reading rate: ${error}`,
    });
  }

  // Check 3: Current Donation Amount
  try {
    const donationAmount = await contract.getCurrentDonationAmount();
    const mintPrice = await contract.mintPrice();
    const expectedDonation = (mintPrice * 1000n) / 10000n;
    
    if (donationAmount === expectedDonation) {
      checks.push({
        name: 'Donation Calculation',
        status: 'PASS',
        details: `Correct: ${ethers.formatEther(donationAmount)} ETH per mint`,
      });
    } else {
      checks.push({
        name: 'Donation Calculation',
        status: 'FAIL',
        details: `Calculation error! Expected ${ethers.formatEther(expectedDonation)}, got ${ethers.formatEther(donationAmount)}`,
      });
    }
  } catch (error) {
    checks.push({
      name: 'Donation Calculation',
      status: 'FAIL',
      details: `Error: ${error}`,
    });
  }

  // Check 4: Partnership Info
  try {
    const info = await contract.getPartnershipInfo();
    checks.push({
      name: 'Partnership Metadata',
      status: 'PASS',
      details: `Commitment Hash: ${info[2]}\n   Effective Date: ${new Date(Number(info[3]) * 1000).toISOString()}`,
    });
  } catch (error) {
    checks.push({
      name: 'Partnership Metadata',
      status: 'WARN',
      details: `Could not read: ${error}`,
    });
  }

  // Check 5: Global Statistics
  try {
    const stats = await contract.getGlobalCharityStats();
    checks.push({
      name: 'Global Statistics',
      status: 'PASS',
      details: `Total Donated: ${ethers.formatEther(stats[0])} ETH\n   Total Charity Mints: ${stats[1]}\n   Milestones: ${stats[4]} ETH`,
    });
  } catch (error) {
    checks.push({
      name: 'Global Statistics',
      status: 'WARN',
      details: `Could not read: ${error}`,
    });
  }

  // Check 6: Recent Donation Events
  try {
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10000 blocks
    
    const donationEvents = await contract.queryFilter(
      contract.filters.DonationSent(),
      fromBlock,
      currentBlock
    );
    
    if (donationEvents.length > 0) {
      const totalFromEvents = donationEvents.reduce((sum: bigint, event: any) => {
        return sum + (event.args?.amount || 0n);
      }, 0n);
      
      checks.push({
        name: 'Donation Events',
        status: 'PASS',
        details: `${donationEvents.length} donations found in recent blocks\n   Total from events: ${ethers.formatEther(totalFromEvents)} ETH`,
      });
    } else {
      checks.push({
        name: 'Donation Events',
        status: 'WARN',
        details: 'No donation events found in recent blocks (contract may be new)',
      });
    }
  } catch (error) {
    checks.push({
      name: 'Donation Events',
      status: 'WARN',
      details: `Could not query events: ${error}`,
    });
  }

  // Check 7: Polaris Address Balance
  try {
    const polarisAddress = await contract.POLARIS_PROJECT_ADDRESS();
    if (polarisAddress !== ethers.ZeroAddress) {
      const balance = await provider.getBalance(polarisAddress);
      checks.push({
        name: 'Polaris Address Balance',
        status: 'PASS',
        details: `Current balance: ${ethers.formatEther(balance)} ETH`,
      });
    }
  } catch (error) {
    checks.push({
      name: 'Polaris Address Balance',
      status: 'WARN',
      details: `Could not check: ${error}`,
    });
  }

  // Print results
  console.log('\n📋 Verification Results:\n');
  
  checks.forEach((check, index) => {
    const icon = check.status === 'PASS' ? '✅' : check.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}`);
    console.log(`   ${check.details.replace(/\n/g, '\n   ')}`);
    console.log();
  });

  const allPassed = checks.every(c => c.status !== 'FAIL');
  const hasWarnings = checks.some(c => c.status === 'WARN');

  console.log('='.repeat(60));
  if (allPassed && !hasWarnings) {
    console.log('🎉 ALL CHECKS PASSED - Partnership is correctly configured!');
  } else if (allPassed) {
    console.log('✅ CORE CHECKS PASSED with minor warnings');
  } else {
    console.log('❌ VERIFICATION FAILED - Critical issues found!');
  }
  console.log('='.repeat(60));

  return {
    passed: allPassed,
    checks,
  };
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let contractAddress: string | undefined;
  let rpcUrl: string | undefined;
  let expectedPolarisAddress: string | undefined;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--contract':
      case '-c':
        contractAddress = args[++i];
        break;
      case '--rpc':
      case '-r':
        rpcUrl = args[++i];
        break;
      case '--polaris':
      case '-p':
        expectedPolarisAddress = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  // Load from deployment file if available
  if (!contractAddress) {
    const deploymentFiles = [
      'deployments/polaris-minter-base.json',
      'deployments/polaris-minter-mainnet.json',
    ];
    
    for (const file of deploymentFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const deployment = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        contractAddress = deployment.contractAddress;
        expectedPolarisAddress = deployment.polarisProjectAddress;
        console.log(`📄 Loaded deployment from ${file}\n`);
        break;
      }
    }
  }

  if (!contractAddress) {
    console.error('❌ Contract address required!');
    console.error('   Use --contract 0x... or ensure deployment file exists\n');
    printHelp();
    process.exit(1);
  }

  // Default RPC URLs
  if (!rpcUrl) {
    rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  }

  // Validate addresses
  if (!ethers.isAddress(contractAddress)) {
    console.error('❌ Invalid contract address:', contractAddress);
    process.exit(1);
  }

  if (expectedPolarisAddress && !ethers.isAddress(expectedPolarisAddress)) {
    console.error('❌ Invalid Polaris address:', expectedPolarisAddress);
    process.exit(1);
  }

  // Run verification
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const result = await verifyPartnership(contractAddress, provider, expectedPolarisAddress);

  process.exit(result.passed ? 0 : 1);
}

function printHelp() {
  console.log(`
Polaris Partnership Verification Tool

Usage:
  npx ts-node scripts/verify-partnership.ts [options]

Options:
  -c, --contract <address>    Contract address to verify
  -r, --rpc <url>             RPC endpoint URL
  -p, --polaris <address>    Expected Polaris Project address
  -h, --help                  Show this help

Examples:
  # Verify deployed contract
  npx ts-node scripts/verify-partnership.ts

  # Verify specific contract
  npx ts-node scripts/verify-partnership.ts -c 0x123... -r https://mainnet.base.org

  # Verify with expected Polaris address
  npx ts-node scripts/verify-partnership.ts -c 0x123... -p 0x456...

Environment Variables:
  BASE_RPC_URL    - Default RPC endpoint
`);
}

main().catch(console.error);
