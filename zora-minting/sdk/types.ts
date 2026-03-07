/**
 * Type definitions for Zora Minting SDK
 */

import type { Address, Hex, TransactionReceipt } from "viem";

// Card Attributes
export interface CardAttributes {
  power: number;
  rarity: number; // 1-5
  chapter: number;
  dungeon: string;
  extractedQuote: string;
  attack?: number;
  defense?: number;
  wisdom?: number;
  luck?: number;
  element?: string;
  mintTimestamp?: number;
  minter?: Address;
}

// Mint Request
export interface MintRequest {
  name: string;
  description?: string;
  recipient: Address;
  image?: Buffer;
  quote: string;
  extractedText: string;
  attributes: CardAttributes;
  tokenId?: string;
}

// Mint Result
export interface MintResult {
  success: boolean;
  txHash?: Hex;
  receipt?: TransactionReceipt;
  gasUsed?: bigint;
  gasSponsored: boolean;
  recipient: Address;
  metadataUri: string;
  error?: string;
}

// Metadata JSON
export interface MetadataResult {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  attributes: MetadataAttribute[];
  properties?: {
    extracted_text?: string;
    chapter_number?: number;
    dungeon_name?: string;
    quote?: string;
    rarity_tier?: number;
    power_level?: number;
    card_type?: string;
    element?: string;
  };
}

export interface MetadataAttribute {
  trait_type: string;
  value: string | number;
  display_type?: "number" | "boost_number" | "boost_percentage" | "date";
  max_value?: number;
}

// Paymaster Config
export interface PaymasterConfig {
  entryPoint: Address;
  factoryAddress: Address;
  paymasterApiUrl: string;
  policyId?: string;
  bundlerUrl?: string;
  apiKey?: string;
}

// Gasless Mint Result
export interface GaslessMintResult {
  success: boolean;
  txHash?: Hex;
  receipt?: TransactionReceipt;
  gasSponsored: boolean;
  sponsoredAmount?: bigint;
  error?: string;
}

// Mint Config
export interface MintConfig {
  contractAddress: Address;
  chainId: number;
  rpcUrl: string;
  apiKey?: string;
  usePaymaster?: boolean;
  paymasterConfig?: PaymasterConfig;
}

// Zora SDK Types
export interface Create1155Config {
  tokenMetadataURI: string;
  createReferral?: Address;
  maxSupply?: bigint;
  mintStart?: bigint;
  mintDuration?: bigint;
  price?: bigint;
}

// IPFS Config
export interface IPFSConfig {
  pinataJWT: string;
  pinataGateway?: string;
  nftStorageKey?: string;
  web3StorageToken?: string;
}

// Extraction Result
export interface ExtractionResult {
  chapter: number;
  dungeon: string;
  quote: string;
  confidence: number;
}

// Rarity Calculation
export interface RarityResult {
  tier: number;
  name: string;
  powerRange: [number, number];
  probability: number;
}

// Policy Check
export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  perUserRemaining?: number;
  globalRemaining?: number;
}

// API Response Types
export interface MintAPIResponse {
  success: boolean;
  data?: {
    tokenId: string;
    txHash: string;
    metadataUri: string;
    cardImage: string;
    attributes: CardAttributes;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ExtractionAPIResponse {
  success: boolean;
  data?: {
    chapter: number;
    dungeon: string;
    quote: string;
    suggestedRarity: number;
    suggestedPower: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
