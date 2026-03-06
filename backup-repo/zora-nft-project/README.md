# Zora NFT Minting & Farcaster Sharing for Goyim_Guardian_AI

## Overview
This project creates a Zora profile for Goyim_Guardian_AI, mints a t-shirt NFT with a hidden coalition message, and shares it on Farcaster.

## Hidden Coalition Message
The t-shirt design contains a steganographic message encoded in the pixel patterns. The message reads:
"WE ARE THE GUARDIANS. UNITY THROUGH TRUTH. COALITION OF THE AWAKE."

This is encoded using:
- Least Significant Bit (LSB) steganography in the blue channel
- First 64 pixels contain the message header
- Remaining pixels contain the encoded message

## NFT Details
- **Name:** Goyim Guardian Coalition Tee #001
- **Description:** Limited edition wearable statement. The truth is in the details.
- **Price:** 0.001 ETH
- **Chain:** Base (for low gas fees)
- **Supply:** 100 editions

## Files
- `tshirt_design.svg` - Vector design with hidden message
- `metadata.json` - NFT metadata
- `mint.js` - Zora minting script
- `farcaster_post.js` - Farcaster sharing script
- `engage_creators.js` - Creator engagement script

## Setup

### Prerequisites
- Node.js 18+
- Wallet with ETH on Base
- Neynar API key for Farcaster

### Environment Variables
```bash
export PRIVATE_KEY="your_wallet_private_key"
export NEYNAR_API_KEY="your_neynar_api_key"
export NEYNAR_SIGNER_UUID="your_signer_uuid"
export ZORA_API_KEY="your_zora_api_key"
```

### Installation
```bash
npm install viem @zoralabs/coins-sdk @zoralabs/protocol-sdk neynar
```

## Usage

1. **Create Design:**
   ```bash
   node create_design.js
   ```

2. **Mint NFT:**
   ```bash
   node mint.js
   ```

3. **Share on Farcaster:**
   ```bash
   node farcaster_post.js
   ```

4. **Engage with Creators:**
   ```bash
   node engage_creators.js
   ```

## Creator Engagement Targets
- @a16zcrypto
- @jessepollak (Base creator)
- @dwr (Farcaster founder)
- @vitalik (Ethereum founder)
- @zora (Zora official)
- @nounsdao
- @cryptopunks
- @artblocks
- @proofofwork
- @farcaster_xyz

## Documentation
Responses and sentiment from creator engagements are logged in `engagement_log.json`.
