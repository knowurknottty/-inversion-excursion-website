/**
 * Core type definitions for The Inversion Excursion API
 */

// ==================== PLAYER TYPES ====================

export interface Player {
  id: string;
  fid: number;
  address: string;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlayerInput {
  fid: number;
  address: string;
}

// ==================== CARD TYPES ====================

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface Card {
  id: string;
  tokenId: string | null;
  name: string;
  description: string | null;
  imageUrl: string;
  metadata: CardMetadata;
  rarity: Rarity;
  power: number;
  defense: number;
  speed: number;
  synsyncBonus: number;
  ownerId: string;
  mintedAt: Date;
  txHash: string | null;
  screenshotUrl: string | null;
}

export interface CardMetadata {
  name: string;
  description?: string;
  image: string;
  attributes: CardAttribute[];
  external_url?: string;
  animation_url?: string;
}

export interface CardAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
}

export interface MintCardInput {
  name: string;
  description?: string;
  imageUrl: string;
  screenshotUrl?: string;
  rarity?: Rarity;
  power?: number;
  defense?: number;
  speed?: number;
  metadata?: Partial<CardMetadata>;
}

export interface CardResponse {
  id: string;
  tokenId: string | null;
  name: string;
  description: string | null;
  imageUrl: string;
  rarity: Rarity;
  stats: {
    power: number;
    defense: number;
    speed: number;
    synsyncBonus: number;
    total: number;
  };
  owner: {
    fid: number;
    address: string;
  };
  mintedAt: string;
}

// ==================== CELL TYPES ====================

export type CellRole = 'LEADER' | 'OFFICER' | 'MEMBER';

export interface Cell {
  id: string;
  name: string;
  description: string | null;
  emblem: string | null;
  totalWins: number;
  totalBattles: number;
  reputation: number;
  createdAt: Date;
  createdBy: string;
}

export interface CellMember {
  id: string;
  cellId: string;
  playerId: string;
  role: CellRole;
  joinedAt: Date;
  player?: Player;
}

export interface CellWithMembers extends Cell {
  members: (CellMember & { player: Player })[];
  memberCount: number;
}

export interface CreateCellInput {
  name: string;
  description?: string;
  emblem?: string;
}

export interface JoinCellInput {
  cellId: string;
  inviteCode?: string;
}

export interface CellResponse {
  id: string;
  name: string;
  description: string | null;
  emblem: string | null;
  stats: {
    totalWins: number;
    totalBattles: number;
    reputation: number;
    winRate: number;
  };
  members: {
    fid: number;
    address: string;
    role: CellRole;
    joinedAt: string;
  }[];
  createdAt: string;
  rank?: number;
}

// ==================== BATTLE TYPES ====================

export type BattleStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type ActionType = 'ATTACK' | 'DEFEND' | 'SPECIAL' | 'HEAL' | 'SYNSYNC_BOOST' | 'SKIP';

export interface Battle {
  id: string;
  cellId: string;
  player1Id: string;
  player2Id: string | null;
  status: BattleStatus;
  winnerId: string | null;
  currentTurn: number;
  maxTurns: number;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
}

export interface BattleCard {
  id: string;
  battleId: string;
  cardId: string;
  playerId: string;
  slot: number;
  currentHp: number;
  isActive: boolean;
  card?: Card;
}

export interface BattleAction {
  id: string;
  battleId: string;
  playerId: string;
  turn: number;
  actionType: ActionType;
  targetId: string | null;
  value: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface StartBattleInput {
  cellId: string;
  opponentFid?: number; // Optional: if not provided, matchmaking
  cardIds: string[]; // 1-3 cards to use in battle
}

export interface BattleActionInput {
  battleId: string;
  actionType: ActionType;
  targetId?: string;
  cardId: string; // Which card is performing the action
}

export interface BattleState {
  id: string;
  status: BattleStatus;
  currentTurn: number;
  maxTurns: number;
  players: {
    player1: BattlePlayerState;
    player2?: BattlePlayerState;
  };
  log: BattleActionLog[];
  timeRemaining?: number;
}

export interface BattlePlayerState {
  fid: number;
  address: string;
  cards: BattleCardState[];
  synsyncActive: boolean;
  synsyncBonus: number;
}

export interface BattleCardState {
  id: string;
  name: string;
  imageUrl: string;
  maxHp: number;
  currentHp: number;
  power: number;
  defense: number;
  speed: number;
  slot: number;
  isActive: boolean;
}

export interface BattleActionLog {
  turn: number;
  playerFid: number;
  actionType: ActionType;
  description: string;
  timestamp: string;
}

// ==================== SYNSYNC TYPES ====================

export interface SynsyncProof {
  id: string;
  playerId: string;
  protocolId: string;
  duration: number;
  frequency: number;
  verifiedAt: Date;
  proofHash: string;
  bonusApplied: boolean;
  bonusValue: number;
  createdAt: Date;
}

export interface VerifySynsyncInput {
  protocolId: string;
  duration: number;
  frequency: number;
  proofHash: string;
  signature: string; // Wallet signature of proof data
}

export interface SynsyncVerificationResult {
  verified: boolean;
  bonusValue: number;
  expiresAt: string;
  message: string;
}

// ==================== LEADERBOARD TYPES ====================

export interface LeaderboardEntry {
  rank: number;
  cellId: string;
  name: string;
  emblem: string | null;
  reputation: number;
  totalWins: number;
  totalBattles: number;
  winRate: number;
  memberCount: number;
  recentForm: ('W' | 'L' | 'D')[]; // Last 5 battles
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalCells: number;
  page: number;
  pageSize: number;
  playerCellRank?: number;
}

// ==================== AUTH TYPES ====================

export interface SIWEMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

export interface AuthPayload {
  fid: number;
  address: string;
  signature: string;
  message: SIWEMessage;
}

export interface AuthenticatedRequest {
  player: Player;
  token: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== ERROR CODES ====================

export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  EXPIRED_SESSION: 'EXPIRED_SESSION',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Business logic errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_STATE: 'INVALID_STATE',
  RATE_LIMITED: 'RATE_LIMITED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
