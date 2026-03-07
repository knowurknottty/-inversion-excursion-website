import { 
  createSmartAccountClient,
  type UserOperation
} from "permissionless";
import { 
  privateKeyToSimpleSmartAccount,
  type SimpleSmartAccount
} from "permissionless/accounts";
import { 
  createPimlicoPaymasterClient,
  type PimlicoPaymasterClient
} from "permissionless/clients/pimlico";
import { 
  http, 
  type Hex,
  type Address,
  type PublicClient,
  type WalletClient,
  createPublicClient
} from "viem";
import { base, baseSepolia } from "viem/chains";
import type { PaymasterConfig, GaslessMintResult } from "./types";

/**
 * Paymaster Client for Gasless Minting on Base
 * 
 * Implements EIP-4337 Account Abstraction with paymaster sponsorship
 * Supports Coinbase Developer Platform (CDP) and Pimlico paymasters
 */
export class PaymasterClient {
  private publicClient: PublicClient;
  private paymasterClient: PimlicoPaymasterClient | null = null;
  private smartAccountClient: ReturnType<typeof createSmartAccountClient> | null = null;
  private smartAccount: SimpleSmartAccount | null = null;
  private chain = base;
  private config: PaymasterConfig;

  constructor(
    rpcUrl: string,
    paymasterRpcUrl: string,
    config: PaymasterConfig,
    isTestnet = false
  ) {
    this.config = config;
    this.chain = isTestnet ? baseSepolia : base;
    
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl),
    }) as PublicClient;

    this.initializePaymaster(paymasterRpcUrl);
  }

  /**
   * Initialize paymaster client
   */
  private initializePaymaster(paymasterRpcUrl: string): void {
    this.paymasterClient = createPimlicoPaymasterClient({
      chain: this.chain,
      transport: http(paymasterRpcUrl),
      entryPoint: this.config.entryPoint,
    });
  }

  /**
   * Create smart account for gasless transactions
   */
  async createSmartAccount(privateKey: Hex): Promise<void> {
    this.smartAccount = await privateKeyToSimpleSmartAccount(
      this.publicClient,
      {
        privateKey,
        factoryAddress: this.config.factoryAddress,
        entryPoint: this.config.entryPoint,
      }
    );

    this.smartAccountClient = createSmartAccountClient({
      account: this.smartAccount,
      chain: this.chain,
      bundlerTransport: http(this.config.bundlerUrl || ""),
      middleware: {
        sponsorUserOperation: this.paymasterClient!.sponsorUserOperation,
      },
    });
  }

  /**
   * Check if paymaster policy allows sponsorship
   */
  async checkPolicyLimits(userAddress: Address): Promise<{
    allowed: boolean;
    reason?: string;
    perUserRemaining?: number;
    globalRemaining?: number;
  }> {
    try {
      // Call paymaster API to check limits
      const response = await fetch(`${this.config.paymasterApiUrl}/limits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress,
          policyId: this.config.policyId,
        }),
      });

      if (!response.ok) {
        return { allowed: false, reason: "Policy check failed" };
      }

      const data = await response.json();
      
      return {
        allowed: data.allowed,
        perUserRemaining: data.perUserRemaining,
        globalRemaining: data.globalRemaining,
        reason: data.reason,
      };
    } catch (error) {
      console.error("Policy check error:", error);
      return { allowed: false, reason: "Error checking policy" };
    }
  }

  /**
   * Execute gasless mint transaction
   */
  async executeGaslessMint(params: {
    contractAddress: Address;
    functionName: string;
    args: unknown[];
    abi: unknown[];
  }): Promise<GaslessMintResult> {
    if (!this.smartAccountClient) {
      throw new Error("Smart account not initialized");
    }

    try {
      // Encode function data
      const { encodeFunctionData } = await import("viem");
      const callData = encodeFunctionData({
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
      });

      // Send sponsored transaction
      const txHash = await this.smartAccountClient.sendTransaction({
        account: this.smartAccountClient.account,
        to: params.contractAddress,
        data: callData,
        value: BigInt(0),
      });

      // Wait for receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      return {
        success: receipt.status === "success",
        txHash,
        receipt,
        gasSponsored: true,
        sponsoredAmount: receipt.gasUsed * receipt.effectiveGasPrice,
      };
    } catch (error) {
      console.error("Gasless mint failed:", error);
      
      // Check if it's a policy limit error
      if (error instanceof Error) {
        if (error.message.includes("maximum per address")) {
          return {
            success: false,
            error: "Per-user limit reached",
            gasSponsored: false,
          };
        }
        if (error.message.includes("max global")) {
          return {
            success: false,
            error: "Global paymaster limit reached",
            gasSponsored: false,
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        gasSponsored: false,
      };
    }
  }

  /**
   * Build UserOperation for manual submission
   */
  async buildUserOperation(params: {
    target: Address;
    data: Hex;
    value?: bigint;
  }): Promise<UserOperation> {
    if (!this.smartAccount) {
      throw new Error("Smart account not initialized");
    }

    // Build UserOp structure
    const userOp: UserOperation = {
      sender: this.smartAccount.address,
      nonce: await this.getNonce(),
      initCode: "0x" as Hex,
      callData: params.data,
      callGasLimit: BigInt(100000),
      verificationGasLimit: BigInt(100000),
      preVerificationGas: BigInt(50000),
      maxFeePerGas: BigInt(1000000000),
      maxPriorityFeePerGas: BigInt(100000000),
      paymasterAndData: "0x" as Hex,
      signature: "0x" as Hex,
    };

    return userOp;
  }

  /**
   * Get smart account nonce
   */
  private async getNonce(): Promise<bigint> {
    if (!this.smartAccount) return BigInt(0);
    
    // Get nonce from entry point
    const entryPointContract = {
      address: this.config.entryPoint,
      abi: [
        {
          inputs: [{ name: "sender", type: "address" }],
          name: "getNonce",
          outputs: [{ name: "nonce", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
    };

    const { readContract } = await import("viem");
    const nonce = await readContract(this.publicClient, {
      address: entryPointContract.address,
      abi: entryPointContract.abi,
      functionName: "getNonce",
      args: [this.smartAccount.address],
    });

    return nonce;
  }

  /**
   * Get smart account address
   */
  getSmartAccountAddress(): Address | null {
    return this.smartAccount?.address || null;
  }

  /**
   * Calculate gas sponsorship amount
   */
  async estimateSponsorship(gasUnits: bigint): Promise<{
    estimatedGas: bigint;
    gasPrice: bigint;
    total: bigint;
    usdEstimate: number;
  }> {
    const gasPrice = await this.publicClient.getGasPrice();
    const total = gasUnits * gasPrice;

    // USD estimate (ETH ~$2500)
    const usdEstimate = Number(total) / 1e18 * 2500;

    return {
      estimatedGas: gasUnits,
      gasPrice,
      total,
      usdEstimate,
    };
  }
}

/**
 * Create CDP (Coinbase Developer Platform) paymaster config
 */
export function createCDPConfig(
  cdpApiKey: string,
  cdpProjectId: string,
  isTestnet = false
): PaymasterConfig {
  const baseUrl = isTestnet 
    ? "https://api.developer.coinbase.com/rpc/v1/base-sepolia"
    : "https://api.developer.coinbase.com/rpc/v1/base";

  return {
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factoryAddress: "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232",
    paymasterApiUrl: baseUrl,
    policyId: cdpProjectId,
    bundlerUrl: `${baseUrl}/${cdpProjectId}`,
    apiKey: cdpApiKey,
  };
}

/**
 * Create Pimlico paymaster config
 */
export function createPimlicoConfig(
  pimlicoApiKey: string,
  isTestnet = false
): PaymasterConfig {
  const chainName = isTestnet ? "base-sepolia" : "base";
  
  return {
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    factoryAddress: "0x15Ba39375ee2Ab563E8873C8390be6f2E2F50232",
    paymasterApiUrl: `https://api.pimlico.io/v2/${chainName}/rpc`,
    policyId: pimlicoApiKey,
    bundlerUrl: `https://api.pimlico.io/v1/${chainName}/rpc?apikey=${pimlicoApiKey}`,
    apiKey: pimlicoApiKey,
  };
}
