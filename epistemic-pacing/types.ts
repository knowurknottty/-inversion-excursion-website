/**
 * Epistemic Pacing System - Core Types
 * 
 * Type definitions for notification rhythm controls, deep work tracking,
 * and patience-based reward mechanics.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION RHYTHM MODES
// ═══════════════════════════════════════════════════════════════════════════════

export type NotificationRhythm = 'daily-digest' | 'live-updates' | 'deep-work';

export interface NotificationPreferences {
  /** Player's chosen notification rhythm */
  rhythm: NotificationRhythm;
  
  /** For daily-digest: preferred time (HH:MM in player's timezone) */
  digestTime: string;
  
  /** For live-updates: minimum minutes between non-urgent notifications */
  minIntervalMinutes: number;
  
  /** Categories allowed to interrupt deep work (empty = none) */
  urgentCategories: UrgentCategory[];
  
  /** Whether to show pre-emptive "entering deep work" confirmation */
  confirmDeepWork: boolean;
  
  /** Auto-enable deep work during specific hours */
  autoDeepWorkSchedule: AutoSchedule | null;
  
  /** Last updated timestamp */
  updatedAt: number;
}

export type UrgentCategory = 
  | 'critical-breakthrough'   // Major narrative advancement
  | 'time-sensitive'          // Windows that expire
  | 'collaborative-mention'   // Other players need you
  | 'security-alert';         // Account/investigation at risk

export interface AutoSchedule {
  /** 0-23 hour to automatically enable deep work */
  startHour: number;
  /** 0-23 hour to automatically resume normal rhythm */
  endHour: number;
  /** Days of week (0 = Sunday) */
  days: number[];
  /** Rhythm to return to after auto period */
  resumeRhythm: NotificationRhythm;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEEP WORK MODE
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeepWorkSession {
  /** Unique session identifier */
  id: string;
  
  /** When deep work began */
  startedAt: number;
  
  /** When deep work ended (null if active) */
  endedAt: number | null;
  
  /** Duration in milliseconds (calculated on end) */
  durationMs: number;
  
  /** Multiplier achieved based on duration */
  multiplierAchieved: number;
  
  /** Whether the session earned full rewards (not cancelled early) */
  completed: boolean;
  
  /** Accumulated patience currency from this session */
  patienceEarned: number;
  
  /** Any bonus unlocks achieved */
  unlocks: DeepWorkUnlock[];
}

export type DeepWorkUnlock =
  | 'focused-mind'           // 4 hours
  | 'subconscious-processing' // 8 hours
  | 'pattern-recognition'     // 12 hours
  | 'major-revelation-chance' // 24 hours
  | 'legendary-insight';      // 48 hours

export interface DeepWorkState {
  /** Currently active session (null if not in deep work) */
  activeSession: DeepWorkSession | null;
  
  /** Historical sessions for stats/achievements */
  sessionHistory: DeepWorkSession[];
  
  /** Total lifetime deep work hours */
  totalDeepWorkHours: number;
  
  /** Current streak (consecutive days with deep work) */
  currentStreakDays: number;
  
  /** Longest streak achieved */
  longestStreakDays: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATIENCE CURRENCY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface PatienceWallet {
  /** Current spendable patience balance */
  balance: number;
  
  /** Total patience ever earned (for achievements) */
  lifetimeEarned: number;
  
  /** Total patience spent */
  lifetimeSpent: number;
  
  /** Spending history for analytics */
  transactions: PatienceTransaction[];
}

export interface PatienceTransaction {
  id: string;
  timestamp: number;
  amount: number;  // Positive = earned, Negative = spent
  type: PatienceTransactionType;
  description: string;
}

export type PatienceTransactionType =
  | 'deep-work-completion'
  | 'daily-login-bonus'
  | 'achievement-unlock'
  | 'instant-validation'
  | 'cross-reference-priority'
  | 'witness-priority'
  | 'bonus-unlock';

export interface PatienceSpendOption {
  /** Unique identifier for this spend type */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Description of what it does */
  description: string;
  
  /** Patience cost */
  cost: number;
  
  /** Maximum uses per period */
  cooldown: {
    type: 'daily' | 'weekly' | 'session';
    usesAllowed: number;
  };
  
  /** Current uses remaining */
  usesRemaining: number;
  
  /** When cooldown resets */
  cooldownResetsAt: number | null;
  
  /** Whether player can afford it */
  affordable: boolean;
  
  /** Icon identifier */
  icon: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REWARD MULTIPLIERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface RewardMultiplier {
  /** Base multiplier from current rhythm mode */
  baseMultiplier: number;
  
  /** Additional multiplier from deep work duration */
  deepWorkMultiplier: number;
  
  /** First login of day bonus */
  dailyLoginMultiplier: number;
  
  /** Consecutive deep work sessions bonus */
  streakMultiplier: number;
  
  /** Weekend/holiday bonus if applicable */
  temporalMultiplier: number;
  
  /** Final calculated multiplier (product of all) */
  totalMultiplier: number;
  
  /** Breakdown for UI display */
  breakdown: MultiplierBreakdownItem[];
}

export interface MultiplierBreakdownItem {
  name: string;
  value: number;
  description: string;
}

export interface AccumulatedRewards {
  /** Documents decrypted while away */
  documents: AccumulatedDocument[];
  
  /** Insights generated during absence */
  insights: number;
  
  /** Effective insights after multiplier */
  effectiveInsights: number;
  
  /** Pattern discoveries made by "AI assistant" */
  discoveries: PatternDiscovery[];
  
  /** New leads generated */
  newLeads: NewLead[];
  
  /** Multiplier applied to these rewards */
  multiplier: RewardMultiplier;
  
  /** Time away in milliseconds */
  timeAwayMs: number;
  
  /** Return tier achieved */
  returnTier: ReturnTier;
}

export type ReturnTier =
  | 'quick'        // < 4 hours
  | 'brief'        // 4-8 hours
  | 'standard'     // 8-16 hours
  | 'extended'     // 16-24 hours
  | 'deep'         // 24-48 hours
  | 'legendary';   // 48+ hours

export interface AccumulatedDocument {
  id: string;
  title: string;
  type: DocumentType;
  decryptionProgress: number;  // 0-100
  bonusAnnotations: boolean;
  unlocksConnection: string | null;
}

export type DocumentType =
  | 'public-record'
  | 'foia-response'
  | 'classified'
  | 'deep-archive'
  | 'intercepted'
  | 'witness-statement';

export interface PatternDiscovery {
  id: string;
  type: 'minor' | 'medium' | 'major' | 'deep';
  description: string;
  connectedEvidenceIds: string[];
  significance: number;  // 0-100
}

export interface NewLead {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  investigationType: InvestigationType;
}

export type InvestigationType =
  | 'data-mining'
  | 'social-engineering'
  | 'technical-infiltration'
  | 'field-surveillance'
  | 'forensic-analysis'
  | 'network-mapping';

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

export interface QueuedNotification {
  id: string;
  
  /** When the notification was generated */
  createdAt: number;
  
  /** When it should be delivered (null = immediate) */
  scheduledFor: number | null;
  
  /** Notification content */
  content: NotificationContent;
  
  /** Category for filtering */
  category: NotificationCategory;
  
  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  /** Whether this can interrupt deep work */
  interruptDeepWork: boolean;
  
  /** Whether this has been delivered */
  delivered: boolean;
  
  /** When delivered (null if pending) */
  deliveredAt: number | null;
  
  /** If in digest: included in which digest batch */
  digestBatchId: string | null;
}

export interface NotificationContent {
  title: string;
  body: string;
  actionUrl: string | null;
  actionLabel: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown>;
}

export type NotificationCategory =
  | 'investigation-complete'
  | 'document-ready'
  | 'pattern-discovered'
  | 'lead-generated'
  | 'achievement-unlocked'
  | 'social-mention'
  | 'system-message'
  | 'event-reminder';

export interface NotificationDigest {
  id: string;
  /** When this digest was/will be sent */
  scheduledTime: number;
  /** Notifications included in this digest */
  notifications: QueuedNotification[];
  /** Whether sent */
  sent: boolean;
  /** Summary statistics */
  summary: DigestSummary;
}

export interface DigestSummary {
  totalNotifications: number;
  investigationCompletions: number;
  newDocuments: number;
  patternDiscoveries: number;
  newLeads: number;
  highestPriority: 'low' | 'normal' | 'high' | 'urgent';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PACING ENGINE STATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface PacingEngineState {
  preferences: NotificationPreferences;
  deepWork: DeepWorkState;
  patience: PatienceWallet;
  notificationQueue: QueuedNotification[];
  pendingDigest: NotificationDigest | null;
  lastSessionTimestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export type PacingEvent =
  | { type: 'rhythm-changed'; from: NotificationRhythm; to: NotificationRhythm }
  | { type: 'deep-work-started'; sessionId: string; startedAt: number }
  | { type: 'deep-work-ended'; sessionId: string; durationMs: number; multiplier: number }
  | { type: 'patience-earned'; amount: number; source: string }
  | { type: 'patience-spent'; amount: number; optionId: string }
  | { type: 'digest-sent'; digestId: string; notificationCount: number }
  | { type: 'return-ritual-triggered'; tier: ReturnTier; timeAwayMs: number };

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const PACING_CONSTANTS = {
  // Deep Work thresholds (hours)
  DEEP_WORK_TIERS: {
    FOCUSED_MIND: 4,
    SUBCONSCIOUS_PROCESSING: 8,
    PATTERN_RECOGNITION: 12,
    MAJOR_REVELATION: 24,
    LEGENDARY_INSIGHT: 48,
  },
  
  // Multipliers
  BASE_MULTIPLIERS: {
    'daily-digest': 1.5,
    'live-updates': 1.0,
    'deep-work': 1.0,  // Base, actual calculated from duration
  },
  
  DEEP_WORK_MULTIPLIERS: {
    4: 1.5,
    8: 2.0,
    12: 2.5,
    24: 3.5,
    48: 5.0,
  },
  
  // Patience earnings (per hour of deep work)
  PATIENCE_PER_HOUR: 10,
  
  // Minimum intervals
  MIN_CHECK_INTERVAL_MS: 2 * 60 * 60 * 1000,  // 2 hours
  MIN_LIVE_NOTIFICATION_INTERVAL_MS: 15 * 60 * 1000,  // 15 minutes
  
  // Daily login bonus
  DAILY_LOGIN_MULTIPLIER: 1.3,
  
  // Streak bonus
  STREAK_MULTIPLIER_PER_DAY: 0.2,
  MAX_STREAK_MULTIPLIER: 2.0,
} as const;
