import { 
  createCreatorClient, 
  createCollectorClient,
  type Create1155Config,
  type MintParams 
} from "@zoralabs/protocol-sdk";
import { 
  createCoin,
  tradeCoin,
  updateCoinURI,
  getOnchainCoinDetails,
  getApiKeyMeta
} from "@zoralabs/coins-sdk";
import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  type Address,
  type Hex,
  type PublicClient,
  type WalletClient
} from "viem";
import { base, baseSepolia } from "viem/chains";
import type { CardAttributes, MintConfig, MintResult } from "./types";

/**
 * Zora Protocol SDK Wrapper for ScrollCard Minting
 * 
 * Handles interaction with Zora Protocol on Base network
 * Supports both 721 and 1155 minting patterns
 */
export class ZoraClient {
  private publicClient: PublicClient;
  private walletClient: WalletClient | null = null;
  private creatorClient: ReturnType<typeof createCreatorClient> | null = null;
  private collectorClient: ReturnType<typeof createCollectorClient> | null = null;
  private chain = base;
  private apiKey: string;

  constructor(
    rpcUrl: string,
    apiKey: string,
    isTestnet = false
  ) {
    this.apiKey = apiKey;
    this.chain = isTestnet ? baseSepolia : base;
    
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl),
    }) as PublicClient;

    this.initializeClients();
  }

  /**
   * Initialize Zora Protocol SDK clients
   */
  private initializeClients(): void {
    this.creatorClient = createCreatorClient({
      chainId: this.chain.id,
      publicClient: this.publicClient,
    });

    this.collectorClient = createCollectorClient({
      chainId: this.chain.id,
      publicClient: this.publicClient,
    });
  }

  /**
   * Set wallet client for transactions
   */
  setWalletClient(walletClient: WalletClient): void {
    this.walletClient = walletClient;
  }

  /**
   * Create a new Zora Coin for the ScrollCard collection
   */
  async createScrollCoin(params: {
    name: string;
    symbol: string;
    uri: string;
    payoutRecipient: Address;
    platformReferrer?: Address;
  }) {
    if (!this.walletClient) {
      throw new Error("Wallet client not set");
    }

    const result = await createCoin({
      name: params.name,
      symbol: params.symbol,
      uri: params.uri,
      payoutRecipient: params.payoutRecipient,
      platformReferrer: params.platformReferrer,
    }, this.walletClient, this.publicClient);

    return result;
  }

  /**
   * Mint a ScrollCard NFT using Zora Protocol
   */
  async mintScrollCard(params: {
    contractAddress: Address;
    tokenId?: bigint;
    to: Address;
    quantity?: number;
    mintReferral?: Address;
  }): Promise<MintResult> {
    if (!this.collectorClient || !this.walletClient) {
      throw new Error("Clients not initialized");
    }

    const { parameters, price } = await this.collectorClient.mint({
      tokenContract: params.contractAddress,
      tokenId: params.tokenId,
      minterAccount: params.to,
      quantityToMint: params.quantity || 1,
      mintReferral: params.mintReferral,
    });

    // Execute the mint transaction
    const txHash = await this.walletClient.sendTransaction({
      ...parameters,
      account: this.walletClient.account!,
    });

    // Wait for receipt
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return {
      txHash,
      receipt,
      price,
      tokenId: params.tokenId,
    };
  }

  /**
   * Mint a new 1155 token on Zora
   */
  async create1155Token(params: {
    contractAddress?: Address;
    token: Create1155Config;
    payoutRecipient: Address;
  }) {
    if (!this.creatorClient || !this.walletClient) {
      throw new Error("Clients not initialized");
    }

    const result = await this.creatorClient.create1155({
      contract: params.contractAddress,
      token: params.token,
      payoutRecipient: params.payoutRecipient,
      account: this.walletClient.account!,
    });

    return result;
  }

  /**
   * Get on-chain coin details
   */
  async getCoinDetails(coinAddress: Address) {
    const details = await getOnchainCoinDetails(
      this.publicClient,
      coinAddress
    );
    return details;
  }

  /**
   * Verify API key and get metadata
   */
  async verifyApiKey() {
    const meta = await getApiKeyMeta({
      query: {},
    });
    return meta;
  }

  /**
   * Update coin metadata URI
   */
  async updateCoinMetadata(
    coinAddress: Address,
    newUri: string
  ) {
    if (!this.walletClient) {
      throw new Error("Wallet client not set");
    }

    const result = await updateCoinURI({
      coin: coinAddress,
      newUri,
    }, this.walletClient);

    return result;
  }

  /**
   * Trade/buy coins on Zora
   */
  async tradeCoin(params: {
    coinAddress: Address;
    direction: "buy" | "sell";
    amount: bigint;
    recipient: Address;
    slippage?: number;
  }) {
    if (!this.walletClient) {
      throw new Error("Wallet client not set");
    }

    const result = await tradeCoin({
      coin: params.coinAddress,
      direction: params.direction,
      amount: params.amount,
      recipient: params.recipient,
      slippage: params.slippage || 0.02, // 2% default slippage
    }, this.walletClient, this.publicClient);

    return result;
  }

  /**
   * Build mint transaction parameters (for gasless/paymaster use)
   */
  async buildMintTransaction(params: {
    contractAddress: Address;
    tokenId?: bigint;
    to: Address;
    quantity?: number;
  }) {
    if (!this.collectorClient) {
      throw new Error("Collector client not initialized");
    }

    const { parameters, price } = await this.collectorClient.mint({
      tokenContract: params.contractAddress,
      tokenId: params.tokenId,
      minterAccount: params.to,
      quantityToMint: params.quantity || 1,
    });

    return { parameters, price };
  }

  /**
   * Get mint costs estimation
   */
  async estimateMintCost(contractAddress: Address, quantity = 1): Promise<{
    gasCost: bigint;
    mintFee: bigint;
    total: bigint;
    usdEstimate: number;
  }> {
    // Base gas estimate for ERC-721 mint
    const gasUnits = BigInt(85000 + (quantity - 1) * 20000);
    
    // Get current gas price
    const gasPrice = await this.publicClient.getGasPrice();
    const gasCost = gasUnits * gasPrice;

    // Zora protocol has no mint fee, just gas
    const mintFee = BigInt(0);
    const total = gasCost + mintFee;

    // Rough USD estimate (assuming ETH ~$2500)
    const ethPrice = 2500;
    const usdEstimate = Number(total) / 1e18 * ethPrice;

    return {
      gasCost,
      mintFee,
      total,
      usdEstimate,
    };
  }
}

// Singleton instance
let zoraClientInstance: ZoraClient | null = null;

export function getZoraClient(
  rpcUrl?: string,
  apiKey?: string,
  isTestnet = false
): ZoraClient {
  if (!zoraClientInstance && rpcUrl && apiKey) {
    zoraClientInstance = new ZoraClient(rpcUrl, apiKey, isTestnet);
  }
  
  if (!zoraClientInstance) {
    throw new Error("Zora client not initialized");
  }
  
  return zoraClientInstance;
}

export function resetZoraClient(): void {
  zoraClientInstance = null;
}
