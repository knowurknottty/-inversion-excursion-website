import { MintingService } from "../sdk/minting-service";
import { getZoraClient } from "../sdk/zora-client";
import { PaymasterClient, createCDPConfig } from "../sdk/paymaster-client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

/**
 * Demo script for testing ScrollCard minting
 * 
 * Usage:
 *   npm run dev
 * 
 * Or:
 *   ts-node examples/demo.ts
 */

async function main() {
  console.log("🎴 ScrollCard Minting Demo\n");

  // Configuration
  const config = {
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    apiKey: process.env.ZORA_API_KEY || "",
    cdpKey: process.env.CDP_API_KEY || "",
    cdpProject: process.env.CDP_PROJECT_ID || "",
    pinataJWT: process.env.PINATA_JWT || "",
    contractAddress: (process.env.SCROLLCARD_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    privateKey: (process.env.DEPLOYER_PRIVATE_KEY || "0x") as `0x${string}`,
  };

  // Validate config
  if (!config.apiKey) {
    console.error("❌ ZORA_API_KEY not set");
    process.exit(1);
  }

  console.log("1️⃣  Initializing Zora client...");
  const zoraClient = getZoraClient(config.rpcUrl, config.apiKey, true);

  // Create wallet client
  const account = privateKeyToAccount(config.privateKey);
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(config.rpcUrl),
  });

  zoraClient.setWalletClient(walletClient);
  console.log(`   ✓ Wallet: ${account.address}\n`);

  // Initialize paymaster (optional)
  let paymasterConfig;
  if (config.cdpKey && config.cdpProject) {
    console.log("2️⃣  Setting up gasless minting...");
    paymasterConfig = createCDPConfig(config.cdpKey, config.cdpProject, true);
    
    const paymasterClient = new PaymasterClient(
      config.rpcUrl,
      paymasterConfig.paymasterApiUrl,
      paymasterConfig,
      true
    );
    
    await paymasterClient.createSmartAccount(config.privateKey);
    console.log(`   ✓ Paymaster configured\n`);
  } else {
    console.log("2️⃣  Gasless minting skipped (no CDP credentials)\n");
  }

  // Initialize minting service
  console.log("3️⃣  Initializing minting service...");
  const mintingService = new MintingService(
    zoraClient,
    config.contractAddress,
    { pinataJWT: config.pinataJWT },
    paymasterConfig
  );
  console.log("   ✓ Ready to mint!\n");

  // Demo mint request
  console.log("4️⃣  Preparing demo mint...");
  const demoRequest = {
    name: "Scroll of Ancient Wisdom",
    recipient: account.address,
    quote: "In the depths of darkness, knowledge becomes the eternal flame that guides all seekers.",
    extractedText: "Chapter 7: The Crystal Caverns. In the depths of darkness...",
    attributes: {
      power: 87,
      rarity: 4, // Epic
      chapter: 7,
      dungeon: "Crystal Caverns",
      extractedQuote: "In the depths of darkness, knowledge becomes the eternal flame...",
      attack: 45,
      defense: 62,
      wisdom: 95,
      luck: 33,
      element: "Light",
    },
  };
  console.log("   Card:", demoRequest.name);
  console.log("   Rarity: Epic (Tier 4)");
  console.log("   Power:", demoRequest.attributes.power);
  console.log("   Dungeon:", demoRequest.attributes.dungeon);
  console.log();

  // Execute mint (uncomment to actually mint)
  /*
  console.log("5️⃣  Executing mint...");
  try {
    const result = await mintingService.mintCard(demoRequest);
    
    if (result.success) {
      console.log("   ✅ Mint successful!");
      console.log("   TX Hash:", result.txHash);
      console.log("   Metadata:", result.metadataUri);
      console.log("   Gas Sponsored:", result.gasSponsored);
    } else {
      console.log("   ❌ Mint failed:", result.error);
    }
  } catch (error) {
    console.error("   ❌ Error:", error);
  }
  */

  console.log("\n✨ Demo complete!");
  console.log("\nTo actually mint:");
  console.log("  1. Set all environment variables");
  console.log("  2. Uncomment the mint code above");
  console.log("  3. Run: npm run dev");
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
