import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Post to Farcaster using Neynar API
 */
async function postToFarcaster() {
    console.log('📡 Preparing to share on Farcaster...\n');
    
    // Check for required environment variables
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    const signerUuid = process.env.NEYNAR_SIGNER_UUID;
    
    if (!neynarApiKey) {
        console.error('❌ NEYNAR_API_KEY environment variable not set');
        console.log('💡 Get your API key from: https://neynar.com');
        process.exit(1);
    }
    
    if (!signerUuid) {
        console.error('❌ NEYNAR_SIGNER_UUID environment variable not set');
        console.log('💡 Create a signer at: https://neynar.com');
        process.exit(1);
    }
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, 'deployment.json');
    let deploymentInfo = null;
    
    if (fs.existsSync(deploymentPath)) {
        deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    }
    
    // Craft the cast message
    const castText = `🛡️ Just dropped the first Goyim Guardian Coalition Tee on Zora

Limited edition of 100. 0.001 ETH.

The design holds secrets for those who look closely. 👁️

Part of something bigger. The coalition grows.

${deploymentInfo ? `Collect: https://zora.co/collect/base:${deploymentInfo.coinAddress}` : ''}

#NFT #DigitalArt #GuardianCoalition #Zora #Base`;

    console.log('📝 Cast text:');
    console.log('─'.repeat(50));
    console.log(castText);
    console.log('─'.repeat(50));
    console.log(`📊 Character count: ${castText.length}/320\n`);
    
    try {
        // Post to Farcaster via Neynar API
        console.log('⏳ Posting to Farcaster...');
        
        const response = await axios.post(
            'https://api.neynar.com/v2/farcaster/cast',
            {
                signer_uuid: signerUuid,
                text: castText,
                // Optional: Add embeds for the NFT
                embeds: deploymentInfo ? [
                    {
                        url: `https://zora.co/collect/base:${deploymentInfo.coinAddress}`
                    }
                ] : [],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': neynarApiKey,
                },
            }
        );
        
        const cast = response.data.cast;
        
        console.log('\n✅ Cast posted successfully!');
        console.log(`🔗 Cast hash: ${cast.hash}`);
        console.log(`👤 Author: @${cast.author.username}`);
        console.log(`⏰ Timestamp: ${cast.timestamp}`);
        console.log(`\n🌐 View on Warpcast: https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`);
        
        // Save cast info
        const castInfo = {
            hash: cast.hash,
            author: cast.author.username,
            authorFid: cast.author.fid,
            text: cast.text,
            timestamp: cast.timestamp,
            embeds: cast.embeds,
            warpcastUrl: `https://warpcast.com/${cast.author.username}/${cast.hash.slice(0, 10)}`,
        };
        
        const castInfoPath = path.join(__dirname, 'cast_info.json');
        fs.writeFileSync(castInfoPath, JSON.stringify(castInfo, null, 2));
        console.log(`📁 Cast info saved to: ${castInfoPath}`);
        
        return castInfo;
        
    } catch (error) {
        console.error('\n❌ Error posting to Farcaster:', error.message);
        
        if (error.response) {
            console.error('📄 Response data:', error.response.data);
            
            if (error.response.status === 401) {
                console.log('\n💡 Check your NEYNAR_API_KEY is valid');
            }
            
            if (error.response.status === 400) {
                console.log('\n💡 Check your signer_uuid is valid and approved');
            }
        }
        
        throw error;
    }
}

// Execute
postToFarcaster().catch(console.error);
