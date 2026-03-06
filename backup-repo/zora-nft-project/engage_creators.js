import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target creators to engage with
const TARGET_CREATORS = [
    { username: 'a16zcrypto', fid: null, reason: 'Major crypto VC, potential partnership' },
    { username: 'jessepollak', fid: null, reason: 'Base creator, aligned with Zora ecosystem' },
    { username: 'dwr', fid: null, reason: 'Farcaster founder, protocol alignment' },
    { username: 'vitalik', fid: null, reason: 'Ethereum founder, philosophical alignment' },
    { username: 'zora', fid: null, reason: 'Zora official, platform creator' },
    { username: 'nounsdao', fid: null, reason: 'NFT community leaders' },
    { username: 'artblocks', fid: null, reason: 'Generative art platform, artistic alignment' },
    { username: 'proofofwork', fid: null, reason: 'Crypto culture, meme alignment' },
    { username: 'farcaster_xyz', fid: null, reason: 'Farcaster official' },
    { username: 'degen', fid: null, reason: 'Active Farcaster community' },
];

// Engagement messages (varied to avoid spam patterns)
const ENGAGEMENT_MESSAGES = [
    "Love what you're building. The guardian coalition respects builders who protect the culture. 🛡️",
    "Your work aligns with what we're protecting. Would love to explore collaboration possibilities.",
    "Big fan of your approach. The coalition is always looking for aligned creators.",
    "This is the kind of innovation the space needs. Let's connect.",
    "Respect the vision. We're building something similar in our corner of the ecosystem.",
];

/**
 * Search for users by username on Farcaster
 */
async function searchUser(neynarApiKey, username) {
    try {
        const response = await axios.get(
            `https://api.neynar.com/v2/farcaster/user/search?q=${username}`,
            {
                headers: {
                    'x-api-key': neynarApiKey,
                },
            }
        );
        
        const users = response.data.result?.users || [];
        const exactMatch = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        return exactMatch || users[0] || null;
    } catch (error) {
        console.error(`   ❌ Error searching for ${username}:`, error.message);
        return null;
    }
}

/**
 * Get recent casts from a user
 */
async function getUserCasts(neynarApiKey, fid) {
    try {
        const response = await axios.get(
            `https://api.neynar.com/v2/farcaster/feed/user/${fid}`,
            {
                headers: {
                    'x-api-key': neynarApiKey,
                },
                params: {
                    limit: 5,
                },
            }
        );
        
        return response.data.casts || [];
    } catch (error) {
        console.error(`   ❌ Error fetching casts for FID ${fid}:`, error.message);
        return [];
    }
}

/**
 * Reply to a cast
 */
async function replyToCast(neynarApiKey, signerUuid, parentHash, text) {
    try {
        const response = await axios.post(
            'https://api.neynar.com/v2/farcaster/cast',
            {
                signer_uuid: signerUuid,
                text: text,
                parent: parentHash,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': neynarApiKey,
                },
            }
        );
        
        return response.data.cast;
    } catch (error) {
        console.error(`   ❌ Error replying:`, error.message);
        return null;
    }
}

/**
 * Like a cast
 */
async function likeCast(neynarApiKey, signerUuid, castHash) {
    try {
        await axios.post(
            'https://api.neynar.com/v2/farcaster/reaction',
            {
                signer_uuid: signerUuid,
                reaction_type: 'like',
                target: castHash,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': neynarApiKey,
                },
            }
        );
        
        return true;
    } catch (error) {
        console.error(`   ❌ Error liking cast:`, error.message);
        return false;
    }
}

/**
 * Follow a user
 */
async function followUser(neynarApiKey, signerUuid, targetFid) {
    try {
        await axios.post(
            'https://api.neynar.com/v2/farcaster/user/follow',
            {
                signer_uuid: signerUuid,
                target_fids: [targetFid],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': neynarApiKey,
                },
            }
        );
        
        return true;
    } catch (error) {
        console.error(`   ❌ Error following user:`, error.message);
        return false;
    }
}

/**
 * Main engagement function
 */
async function engageWithCreators() {
    console.log('🤝 Starting creator engagement campaign...\n');
    
    // Check for required environment variables
    const neynarApiKey = process.env.NEYNAR_API_KEY;
    const signerUuid = process.env.NEYNAR_SIGNER_UUID;
    
    if (!neynarApiKey || !signerUuid) {
        console.error('❌ Missing required environment variables');
        console.log('💡 Set NEYNAR_API_KEY and NEYNAR_SIGNER_UUID');
        process.exit(1);
    }
    
    const engagementLog = {
        timestamp: new Date().toISOString(),
        engagements: [],
        summary: {
            total: 0,
            successful: 0,
            failed: 0,
        },
    };
    
    // Process each target creator
    for (let i = 0; i < TARGET_CREATORS.length; i++) {
        const creator = TARGET_CREATORS[i];
        console.log(`\n[${i + 1}/${TARGET_CREATORS.length}] 👤 @${creator.username}`);
        console.log(`   Reason: ${creator.reason}`);
        
        const engagement = {
            username: creator.username,
            reason: creator.reason,
            actions: [],
            status: 'pending',
            timestamp: new Date().toISOString(),
        };
        
        // Search for user
        console.log(`   🔍 Searching for user...`);
        const user = await searchUser(neynarApiKey, creator.username);
        
        if (!user) {
            console.log(`   ⚠️ User not found, skipping...`);
            engagement.status = 'user_not_found';
            engagementLog.engagements.push(engagement);
            engagementLog.summary.failed++;
            continue;
        }
        
        console.log(`   ✅ Found: @${user.username} (FID: ${user.fid})`);
        engagement.fid = user.fid;
        engagement.displayName = user.display_name;
        
        // Follow the user
        console.log(`   ➕ Following...`);
        const followed = await followUser(neynarApiKey, signerUuid, user.fid);
        if (followed) {
            console.log(`   ✅ Followed successfully`);
            engagement.actions.push({ type: 'follow', status: 'success' });
        } else {
            engagement.actions.push({ type: 'follow', status: 'failed' });
        }
        
        // Get recent casts
        console.log(`   📜 Fetching recent casts...`);
        const casts = await getUserCasts(neynarApiKey, user.fid);
        
        if (casts.length === 0) {
            console.log(`   ⚠️ No recent casts found`);
            engagement.status = 'no_casts';
            engagementLog.engagements.push(engagement);
            engagementLog.summary.total++;
            continue;
        }
        
        console.log(`   📊 Found ${casts.length} recent casts`);
        
        // Like their most recent cast
        const latestCast = casts[0];
        console.log(`   ❤️ Liking latest cast...`);
        const liked = await likeCast(neynarApiKey, signerUuid, latestCast.hash);
        if (liked) {
            console.log(`   ✅ Liked successfully`);
            engagement.actions.push({ type: 'like', castHash: latestCast.hash, status: 'success' });
        } else {
            engagement.actions.push({ type: 'like', castHash: latestCast.hash, status: 'failed' });
        }
        
        // Reply with engagement message
        const messageIndex = i % ENGAGEMENT_MESSAGES.length;
        const replyText = ENGAGEMENT_MESSAGES[messageIndex];
        
        console.log(`   💬 Replying: "${replyText.substring(0, 50)}..."`);
        const reply = await replyToCast(neynarApiKey, signerUuid, latestCast.hash, replyText);
        
        if (reply) {
            console.log(`   ✅ Reply posted: ${reply.hash.slice(0, 20)}...`);
            engagement.actions.push({ 
                type: 'reply', 
                castHash: reply.hash, 
                text: replyText,
                status: 'success' 
            });
            engagement.status = 'success';
            engagementLog.summary.successful++;
        } else {
            engagement.actions.push({ type: 'reply', status: 'failed' });
            engagement.status = 'partial';
        }
        
        engagementLog.engagements.push(engagement);
        engagementLog.summary.total++;
        
        // Rate limiting - wait between engagements
        if (i < TARGET_CREATORS.length - 1) {
            console.log(`   ⏳ Waiting 3 seconds before next engagement...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // Save engagement log
    const logPath = path.join(__dirname, 'engagement_log.json');
    fs.writeFileSync(logPath, JSON.stringify(engagementLog, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 ENGAGEMENT CAMPAIGN SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total creators targeted: ${TARGET_CREATORS.length}`);
    console.log(`Successful engagements: ${engagementLog.summary.successful}`);
    console.log(`Failed engagements: ${engagementLog.summary.failed}`);
    console.log(`Success rate: ${Math.round((engagementLog.summary.successful / TARGET_CREATORS.length) * 100)}%`);
    console.log(`\n📁 Full log saved to: ${logPath}`);
    
    return engagementLog;
}

// Execute
engageWithCreators().catch(console.error);
