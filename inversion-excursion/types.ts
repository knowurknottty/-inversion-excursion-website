// The Inversion Excursion — TypeScript Component Interfaces
// Auto-generated from UI Contract v1.0.0

// ═══════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════

export type CardTier = 'physical' | 'emotional' | 'atomic' | 'galactic' | 'cosmic';
export type BrainwaveState = 'gamma' | 'beta' | 'alpha' | 'theta' | 'delta';
export type BattlePhase = 'setup' | 'player_turn' | 'enemy_turn' | 'resolution' | 'ended';
export type MemberStatus = 'online' | 'offline' | 'in_battle';
export type EnemyIntentionType = 'attack' | 'defend' | 'special' | 'charge';

// ═══════════════════════════════════════════════════════════════
// CARD SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface Etymology {
  origin: string;
  evolution: string[];
  meaning: string;
  quote: string;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
  iconUrl?: string;
}

export interface Card {
  id: string;
  name: string;
  tier: CardTier;
  artUrl: string;
  frequency: number;           // Base frequency in Hz
  resonance: number;           // 0-100
  harmonic: number;
  entropy: number;
  synergy: number;
  wyrdEtymology: Etymology;
  abilities: Ability[];
  flavorText?: string;
}

export interface CardStats {
  battlesUsed: number;
  winRate: number;
  avgResonance: number;
  timesSynthesized: number;
}

// ═══════════════════════════════════════════════════════════════
// RESONANCE SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface ResonanceField {
  combinedFrequency: number;
  fieldStrength: number;       // 0-100
  activeEffects: FieldEffect[];
  stability: number;           // 0-1
}

export interface FieldEffect {
  id: string;
  name: string;
  description: string;
  source: string;
  duration: number;
  modifier: number;
}

// ═══════════════════════════════════════════════════════════════
// CELL SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface CellMember {
  id: string;
  displayName: string;
  avatarUrl: string;
  deckResonance: number;
  status: MemberStatus;
  lastActive: Date;
  currentDeck?: Card[];
}

export interface Cell {
  id: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  members: CellMember[];
  maxMembers: number;
  sharedField: ResonanceField;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// BATTLE SYSTEM
// ═══════════════════════════════════════════════════════════════

export interface EnemyIntention {
  type: EnemyIntentionType;
  target?: string;
  power: number;
  warning: boolean;
  description: string;
}

export interface Enemy {
  id: string;
  name: string;
  maxHealth: number;
  currentHealth: number;
  intention: EnemyIntention;
  phase: number;
  avatarUrl: string;
  resistances: Record<string, number>;
  weaknesses: Record<string, number>;
}

export interface FieldCard {
  card: Card;
  ownerId: string;
  position: number;
  isExhausted: boolean;
  activeEffects: string[];
}

export interface CombatLogEntry {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  target?: string;
  value?: number;
  type: 'attack' | 'defend' | 'heal' | 'buff' | 'debuff' | 'resonance' | 'system';
  message: string;
}

export interface BattleState {
  id: string;
  phase: BattlePhase;
  currentPlayerIndex: number;
  turnNumber: number;
  resonanceMeter: number;
  isResonanceReady: boolean;
  enemy: Enemy;
  players: BattlePlayer[];
  field: FieldCard[];
}

export interface BattlePlayer {
  id: string;
  displayName: string;
  avatarUrl: string;
  hand: Card[];
  maxHandSize: number;
  isActive: boolean;
  statusEffects: string[];
}

// ═══════════════════════════════════════════════════════════════
// SYNSYNC INTEGRATION
// ═══════════════════════════════════════════════════════════════

export interface BrainwaveProtocol {
  id: string;
  name: string;
  frequency: number;
  description: string;
  color: string;
  duration: number;
  category: 'focus' | 'relax' | 'sleep' | 'creative' | 'meditation';
  icon: string;
}

export interface EntrainmentResult {
  success: boolean;
  quality: number;
  avgDeviation: number;
  timeInSync: number;
  bonusMultiplier: number;
  startTime: Date;
  endTime: Date;
}

export interface SynSyncSession {
  protocol: BrainwaveProtocol;
  isActive: boolean;
  progress: number;
  result?: EntrainmentResult;
}

// ═══════════════════════════════════════════════════════════════
// REWARD SYSTEM
// ═══════════════════════════════════════════════════════════════

export type RewardType = 'card' | 'essence' | 'rare_drop' | 'synthesis' | 'title';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'cosmic';

export interface Reward {
  id: string;
  type: RewardType;
  item?: Card;
  amount?: number;
  rarity: Rarity;
  name: string;
  description: string;
  iconUrl?: string;
}

export interface BattleSnapshot {
  id: string;
  imageUrl: string;
  cellMembers: string[];
  enemyName: string;
  enemyTier: CardTier;
  duration: number;
  turns: number;
  resonancePeak: number;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

// ───── Core Components ─────

export interface CardFrameProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHighlighted?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  showFrequency?: boolean;
  showTier?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export interface CardFrequencyProps {
  frequency: number;
  isActive?: boolean;
  showWaveform?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export interface FrequencyWaveProps {
  frequency: number;
  amplitude?: number;
  color?: string;
  isActive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export interface ResonanceMeterProps {
  value: number;              // 0-100
  maxValue?: number;
  label?: string;
  showPulse?: boolean;
  isCharged?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ProtocolSelectorProps {
  protocols: BrainwaveProtocol[];
  selectedProtocolId?: string;
  onSelect: (protocol: BrainwaveProtocol) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

export interface EntrainmentTimerProps {
  protocol: BrainwaveProtocol;
  duration?: number;
  onStart?: () => void;
  onComplete: (result: EntrainmentResult) => void;
  onCancel?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

// ───── Screen Components ─────

export interface DeckBuilderProps {
  collection: Card[];
  currentDeck: Card[];
  maxDeckSize?: number;
  sharedResonance: number;
  isLoading?: boolean;
  onAddCard: (card: Card) => void;
  onRemoveCard: (index: number) => void;
  onReorderDeck: (fromIndex: number, toIndex: number) => void;
  onFrequencyTune: (frequency: number) => void;
  onViewCardDetail: (card: Card) => void;
  onSaveDeck?: () => void;
  className?: string;
}

export interface CellFormationProps {
  cell: Cell;
  currentUserId: string;
  isLeader: boolean;
  onInvite: () => void;
  onViewMember: (member: CellMember) => void;
  onLeaveCell: () => void;
  onDisbandCell?: () => void;
  onTransferLeadership?: (memberId: string) => void;
  className?: string;
}

export interface BattleInterfaceProps {
  battle: BattleState;
  currentUserId: string;
  cell: Cell;
  isPlayerTurn: boolean;
  onPlayCard: (cardId: string, targetId?: string) => void;
  onSynchronize: () => void;
  onResonanceBurst: () => void;
  onDefend: () => void;
  onPass: () => void;
  onConcede?: () => void;
  className?: string;
}

export interface VictoryDefeatProps {
  result: 'victory' | 'defeat';
  snapshot: BattleSnapshot;
  rewards: Reward[];
  quote: string;
  playerStats?: {
    totalDamage: number;
    resonanceContributed: number;
    cardsPlayed: number;
  };
  onMint: () => Promise<void>;
  onShare: () => void;
  onPlayAgain: () => void;
  onReturn: () => void;
  className?: string;
}

export interface CardDetailProps {
  card: Card;
  isOwned: boolean;
  isInDeck: boolean;
  similarCards?: Card[];
  usageStats?: CardStats;
  onAddToDeck: () => void;
  onRemoveFromDeck: () => void;
  onViewFullEtymology: () => void;
  onClose: () => void;
  className?: string;
}

// ───── Animation Components ─────

export interface CardDrawAnimationProps {
  card: Card;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  onComplete?: () => void;
  delay?: number;
}

export interface AttackAnimationProps {
  attacker: { x: number; y: number };
  target: { x: number; y: number };
  card: Card;
  damage: number;
  type: 'physical' | 'resonance' | 'synchronised';
  onComplete?: () => void;
}

export interface ResonanceBurstAnimationProps {
  cellMembers: Array<{ x: number; y: number; tier: CardTier }>;
  resonanceLevel: number;
  onComplete?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// STYLE TOKENS (Tailwind-ready)
// ═══════════════════════════════════════════════════════════════

export const tierColors: Record<CardTier, { bg: string; border: string; glow: string; text: string }> = {
  physical: {
    bg: 'bg-amber-900/30',
    border: 'border-amber-700',
    glow: 'shadow-amber-500/50',
    text: 'text-amber-400',
  },
  emotional: {
    bg: 'bg-slate-700/30',
    border: 'border-slate-400',
    glow: 'shadow-slate-300/50',
    text: 'text-slate-300',
  },
  atomic: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-400/50',
    text: 'text-yellow-300',
  },
  galactic: {
    bg: 'bg-gradient-to-br from-cyan-900/30 via-pink-900/30 to-teal-900/30',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-400/50',
    text: 'text-cyan-300',
  },
  cosmic: {
    bg: 'bg-gradient-to-br from-black via-purple-950 to-slate-900',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-300',
  },
};

export const brainwaveColors: Record<BrainwaveState, string> = {
  gamma: '#FF006E',
  beta: '#FB5607',
  alpha: '#FFBE0B',
  theta: '#8338EC',
  delta: '#3A86FF',
};

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };
export type AnimationVariant = 'initial' | 'animate' | 'exit';

export interface WithChildren {
  children?: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface AsyncAction {
  isLoading: boolean;
  error?: Error;
}

// ═══════════════════════════════════════════════════════════════
// FRAME SDK TYPES (Farcaster)
// ═══════════════════════════════════════════════════════════════

export interface FrameContext {
  user: {
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  client: {
    clientFid: number;
    added: boolean;
    notificationDetails?: {
      url: string;
      token: string;
    };
  };
}

export interface FrameActionPayload {
  buttonIndex: number;
  inputText?: string;
  state?: string;
  transactionId?: string;
  address?: string;
}

// Default exports for convenience
export default {
  tierColors,
  brainwaveColors,
};
