import { ZoraClient } from "./zora-client";
import { PaymasterClient, createCDPConfig } from "./paymaster-client";
import { 
  createWalletClient, 
  http,
  type Hex,
  type Address 
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import type { 
  MintRequest, 
  MintResult, 
  MetadataResult,
  CardAttributes 
} from "./types";

/**
 * ScrollCard Minting Service
 * 
 * Orchestrates the complete minting flow:
 * 1. Metadata extraction and validation
 * 2. IPFS upload
 * 3. Zora SDK minting (with optional paymaster)
 * 4. Record keeping
 */
export class MintingService {
  private zoraClient: ZoraClient;
  private paymasterClient: PaymasterClient | null = null;
  private contractAddress: Address;
  private ipfsService: IPFSService;

  constructor(
    zoraClient: ZoraClient,
    contractAddress: Address,
    ipfsConfig: IPFSConfig,
    paymasterConfig?: PaymasterConfig
  ) {
    this.zoraClient = zoraClient;
    this.contractAddress = contractAddress;
    this.ipfsService = new IPFSService(ipfsConfig);

    if (paymasterConfig) {
      this.paymasterClient = new PaymasterClient(
        paymasterConfig.rpcUrl,
        paymasterConfig.paymasterUrl,
        paymasterConfig
      );
    }
  }

  /**
   * Main minting flow
   */
  async mintCard(request: MintRequest): Promise<MintResult> {
    try {
      // Step 1: Generate card image and upload to IPFS
      const imageUri = await this.generateAndUploadImage(request);
      
      // Step 2: Build metadata JSON
      const metadata = this.buildMetadata(request, imageUri);
      
      // Step 3: Upload metadata to IPFS
      const metadataUri = await this.ipfsService.uploadJSON(metadata);
      
      // Step 4: Determine gasless eligibility
      const useGasless = await this.shouldUseGasless(request.recipient);
      
      // Step 5: Execute mint
      let result: MintResult;
      
      if (useGasless && this.paymasterClient) {
        result = await this.mintGasless(request.recipient, metadataUri, request.attributes);
      } else {
        result = await this.mintStandard(request.recipient, metadataUri, request.attributes);
      }

      // Step 6: Record mint in database
      await this.recordMint(result, request);

      return result;
    } catch (error) {
      console.error("Minting failed:", error);
      throw new MintingError(
        error instanceof Error ? error.message : "Unknown minting error",
        request
      );
    }
  }

  /**
   * Generate card image and upload to IPFS
   */
  private async generateAndUploadImage(request: MintRequest): Promise<string> {
    // Generate card art based on attributes
    const imageBuffer = await this.generateCardArt(request);
    
    // Upload to IPFS
    const cid = await this.ipfsService.uploadFile(
      imageBuffer,
      `scrollcard-${Date.now()}.png`
    );
    
    return `ipfs://${cid}`;
  }

  /**
   * Generate card artwork (placeholder - implement with your art generator)
   */
  private async generateCardArt(request: MintRequest): Promise<Buffer> {
    // This is where you'd integrate with your card art generator
    // Could be Canvas, Sharp, or external service
    
    // Placeholder: Return a buffer (replace with actual implementation)
    const { createCanvas } = await import("canvas");
    const canvas = createCanvas(512, 768);
    const ctx = canvas.getContext("2d");

    // Background based on rarity
    const rarityColors = [
      "#808080", // Common - gray
      "#228B22", // Uncommon - green
      "#4169E1", // Rare - blue
      "#9400D3", // Epic - purple
      "#FFD700", // Legendary - gold
    ];
    
    const color = rarityColors[request.attributes.rarity - 1] || rarityColors[0];
    
    // Draw card background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 768);
    
    // Draw card border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, 480, 736);
    
    // Draw card name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px serif";
    ctx.textAlign = "center";
    ctx.fillText(request.name, 256, 80);
    
    // Draw power
    ctx.font = "bold 48px serif";
    ctx.fillText(`PWR: ${request.attributes.power}`, 256, 400);
    
    // Draw rarity
    ctx.font = "24px serif";
    const rarityNames = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
    ctx.fillText(rarityNames[request.attributes.rarity - 1], 256, 500);
    
    // Draw quote (truncated)
    ctx.font = "italic 18px serif";
    const quote = request.quote.length > 100 
      ? request.quote.substring(0, 100) + "..."
      : request.quote;
    ctx.fillText(quote, 256, 600);

    return canvas.toBuffer("image/png");
  }

  /**
   * Build NFT metadata
   */
  private buildMetadata(
    request: MintRequest, 
    imageUri: string
  ): MetadataResult {
    const rarityNames = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
    const rarityName = rarityNames[request.attributes.rarity - 1];

    return {
      name: request.name,
      description: `A mystical ${rarityName} scroll card from Chapter ${request.attributes.chapter}. Found in the ${request.attributes.dungeon}.`,
      image: imageUri,
      external_url: `https://scrollcards.io/card/${request.tokenId || "new"}`,
      attributes: [
        {
          trait_type: "Power",
          value: request.attributes.power,
          display_type: "number",
          max_value: 100,
        },
        {
          trait_type: "Rarity",
          value: rarityName,
        },
        {
          trait_type: "Chapter",
          value: request.attributes.chapter,
          display_type: "number",
        },
        {
          trait_type: "Dungeon",
          value: request.attributes.dungeon,
        },
        {
          trait_type: "Attack",
          value: request.attributes.attack || Math.floor(request.attributes.power * 0.5),
          display_type: "number",
          max_value: 100,
        },
        {
          trait_type: "Defense",
          value: request.attributes.defense || Math.floor(request.attributes.power * 0.6),
          display_type: "number",
          max_value: 100,
        },
        {
          trait_type: "Wisdom",
          value: request.attributes.wisdom || Math.floor(request.attributes.power * 0.8),
          display_type: "number",
          max_value: 100,
        },
        {
          trait_type: "Luck",
          value: request.attributes.luck || Math.floor(request.attributes.power * 0.3),
          display_type: "number",
          max_value: 100,
        },
        {
          trait_type: "Element",
          value: request.attributes.element || "Neutral",
        },
        {
          trait_type: "Quote",
          value: request.quote.substring(0, 100),
        },
      ],
      properties: {
        extracted_text: request.extractedText,
        chapter_number: request.attributes.chapter,
        dungeon_name: request.attributes.dungeon,
        quote: request.quote,
        rarity_tier: request.attributes.rarity,
        power_level: request.attributes.power,
        card_type: "Scroll",
        element: request.attributes.element || "Neutral",
      },
    };
  }

  /**
   * Check if gasless minting should be used
   */
  private async shouldUseGasless(recipient: Address): Promise<boolean> {
    if (!this.paymasterClient) return false;

    const policy = await this.paymasterClient.checkPolicyLimits(recipient);
    return policy.allowed;
  }

  /**
   * Execute gasless mint
   */
  private async mintGasless(
    recipient: Address,
    metadataUri: string,
    attributes: CardAttributes
  ): Promise<MintResult> {
    if (!this.paymasterClient) {
      throw new Error("Paymaster not configured");
    }

    const result = await this.paymasterClient.executeGaslessMint({
      contractAddress: this.contractAddress,
      functionName: "mintCard",
      args: [
        recipient,
        metadataUri,
        {
          power: attributes.power,
          rarity: attributes.rarity,
          chapter: attributes.chapter,
          dungeon: attributes.dungeon,
          extractedQuote: attributes.extractedQuote,
          mintTimestamp: 0, // Set by contract
          minter: "0x0000000000000000000000000000000000000000", // Set by contract
        },
      ],
      abi: SCROLLCARD_ABI,
    });

    return {
      success: result.success,
      txHash: result.txHash,
      receipt: result.receipt,
      gasUsed: result.receipt?.gasUsed,
      gasSponsored: true,
      recipient,
      metadataUri,
    };
  }

  /**
   * Execute standard (user-paid) mint
   */
  private async mintStandard(
    recipient: Address,
    metadataUri: string,
    attributes: CardAttributes
  ): Promise<MintResult> {
    const result = await this.zoraClient.mintScrollCard({
      contractAddress: this.contractAddress,
      to: recipient,
    });

    return {
      success: result.receipt.status === "success",
      txHash: result.txHash,
      receipt: result.receipt,
      gasUsed: result.receipt.gasUsed,
      gasSponsored: false,
      recipient,
      metadataUri,
    };
  }

  /**
   * Record mint in database
   */
  private async recordMint(result: MintResult, request: MintRequest): Promise<void> {
    // Implement database recording
    // Could be Prisma, Mongoose, or raw SQL
    console.log("Recording mint:", {
      txHash: result.txHash,
      recipient: result.recipient,
      metadataUri: result.metadataUri,
      timestamp: new Date(),
      gasSponsored: result.gasSponsored,
    });
  }
}

/**
 * IPFS Service for uploading metadata and images
 */
class IPFSService {
  private config: IPFSConfig;

  constructor(config: IPFSConfig) {
    this.config = config;
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    // Implement with Pinata, NFT.Storage, or web3.storage
    const formData = new FormData();
    const blob = new Blob([buffer]);
    formData.append("file", blob, filename);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.pinataJWT}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.IpfsHash;
  }

  async uploadJSON(json: unknown): Promise<string> {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.pinataJWT}`,
      },
      body: JSON.stringify(json),
    });

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  }
}

/**
 * ScrollCard Contract ABI (partial - mint function)
 */
const SCROLLCARD_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "uri", type: "string" },
      {
        components: [
          { name: "power", type: "uint256" },
          { name: "rarity", type: "uint256" },
          { name: "chapter", type: "uint256" },
          { name: "dungeon", type: "string" },
          { name: "extractedQuote", type: "string" },
          { name: "mintTimestamp", type: "uint256" },
          { name: "minter", type: "address" },
        ],
        name: "attributes",
        type: "tuple",
      },
    ],
    name: "mintCard",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Types
interface IPFSConfig {
  pinataJWT: string;
  pinataGateway?: string;
}

interface PaymasterConfig {
  rpcUrl: string;
  paymasterUrl: string;
  entryPoint: Address;
  factoryAddress: Address;
  bundlerUrl?: string;
  policyId?: string;
  apiKey?: string;
}

class MintingError extends Error {
  constructor(message: string, public request: MintRequest) {
    super(message);
    this.name = "MintingError";
  }
}
