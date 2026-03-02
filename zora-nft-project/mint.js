import { createCoin, getCoin } from '@zoralabs/coins-sdk';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    // NFT Details
    name: "Goyim Guardian Coalition Tee #001",
    symbol: "GGCT001",
    description: "Limited edition wearable statement. The truth is in the details. This design contains hidden messages for those who know where to look. Part of the Guardian Coalition collection.",
    price: "0.001", // ETH
    supply: 100,
    
    // Chain: Base for low gas fees
    chain: base,
    rpcUrl: "https://mainnet.base.org",
    
    // Metadata
    imageUrl: "ipfs://{CID}/tshirt_design.svg",
    animationUrl: null,
};

/**
 * Mint NFT on Zora using the Coins SDK
 */
async function mintNFT() {
    console.log('🚀 Starting Zora NFT minting process...\n');
    
    // Check for private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ PRIVATE_KEY environment variable not set');
        console.log('💡 Set it with: export PRIVATE_KEY="your_private_key"');
        process.exit(1);
    }
    
    try {
        // Create account from private key
        const account = privateKeyToAccount(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
        console.log(`👤 Wallet address: ${account.address}`);
        
        // Create clients
        const publicClient = createPublicClient({
            chain: CONFIG.chain,
            transport: http(CONFIG.rpcUrl),
        });
        
        const walletClient = createWalletClient({
            account,
            chain: CONFIG.chain,
            transport: http(CONFIG.rpcUrl),
        });
        
        // Check balance
        const balance = await publicClient.getBalance({ address: account.address });
        console.log(`💰 Balance: ${balance / BigInt(1e18)} ETH`);
        
        // Load metadata
        const metadataPath = path.join(__dirname, 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
            console.error('❌ metadata.json not found. Run create_design.js first.');
            process.exit(1);
        }
        
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        console.log(`📄 Loaded metadata: ${metadata.name}`);
        
        // Prepare coin creation parameters
        const coinParams = {
            name: CONFIG.name,
            symbol: CONFIG.symbol,
            uri: `ipfs://{CID}/metadata.json`, // Will be updated after IPFS upload
            // Platform referrer for rewards
            platformReferrer: account.address,
            // Trader referrer for rewards  
            traderReferrer: account.address,
        };
        
        console.log('\n📋 Coin Parameters:');
        console.log(`   Name: ${coinParams.name}`);
        console.log(`   Symbol: ${coinParams.symbol}`);
        console.log(`   URI: ${coinParams.uri}`);
        console.log(`   Price: ${CONFIG.price} ETH`);
        console.log(`   Supply: ${CONFIG.supply}`);
        
        // Note: In production, you would:
        // 1. Upload image to IPFS (Pinata/NFT.Storage)
        // 2. Update metadata with IPFS CID
        // 3. Upload metadata to IPFS
        // 4. Use the metadata URI for minting
        
        console.log('\n⏳ Creating coin on Zora...');
        
        // Simulate the transaction first
        const { request } = await publicClient.simulateContract({
            ...createCoin(coinParams),
            account: account.address,
        });
        
        console.log('✅ Simulation successful');
        
        // Execute the transaction
        const hash = await walletClient.writeContract(request);
        console.log(`📝 Transaction hash: ${hash}`);
        
        // Wait for receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Extract coin address from receipt
        const coinAddress = receipt.logs[0]?.address;
        console.log(`🎯 Coin contract address: ${coinAddress}`);
        
        // Save deployment info
        const deploymentInfo = {
            name: CONFIG.name,
            symbol: CONFIG.symbol,
            coinAddress,
            transactionHash: hash,
            blockNumber: receipt.blockNumber.toString(),
            chainId: CONFIG.chain.id,
            chainName: CONFIG.chain.name,
            creator: account.address,
            price: CONFIG.price,
            supply: CONFIG.supply,
            timestamp: new Date().toISOString(),
        };
        
        const deploymentPath = path.join(__dirname, 'deployment.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        
        console.log('\n✅ NFT minted successfully!');
        console.log(`📁 Deployment info saved to: ${deploymentPath}`);
        console.log(`\n🔗 View on Zora: https://zora.co/collect/${CONFIG.chain.name.toLowerCase()}:${coinAddress}`);
        
        return deploymentInfo;
        
    } catch (error) {
        console.error('\n❌ Error minting NFT:', error.message);
        
        if (error.message.includes('insufficient funds')) {
            console.log('\n💡 You need ETH on Base to pay for gas fees.');
            console.log('   Get Base ETH from: https://bridge.base.org');
        }
        
        if (error.message.includes('nonce')) {
            console.log('\n💡 Try resetting your nonce or waiting for pending transactions.');
        }
        
        throw error;
    }
}

// Execute
mintNFT().catch(console.error);
