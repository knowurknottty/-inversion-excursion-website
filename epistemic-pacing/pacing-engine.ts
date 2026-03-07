/**
 * Epistemic Pacing Engine
 * 
 * Core logic for notification rhythm controls, deep work tracking,
 * and reward calculations.
 */

import {
  NotificationPreferences,
  NotificationRhythm,
  DeepWorkSession,
  DeepWorkState,
  DeepWorkUnlock,
  PatienceWallet,
  PatienceTransaction,
  PatienceSpendOption,
  RewardMultiplier,
  AccumulatedRewards,
  ReturnTier,
  QueuedNotification,
  NotificationDigest,
  PacingEngineState,
  PacingEvent,
  PACING_CONSTANTS,
  AccumulatedDocument,
  PatternDiscovery,
  NewLead,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT STATE
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  rhythm: 'daily-digest',
  digestTime: '09:00',
  minIntervalMinutes: 15,
  urgentCategories: ['critical-breakthrough', 'time-sensitive', 'security-alert'],
  confirmDeepWork: true,
  autoDeepWorkSchedule: null,
  updatedAt: Date.now(),
};

export const DEFAULT_DEEP_WORK_STATE: DeepWorkState = {
  activeSession: null,
  sessionHistory: [],
  totalDeepWorkHours: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
};

export const DEFAULT_PATIENCE_WALLET: PatienceWallet = {
  balance: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  transactions: [],
};

export const DEFAULT_STATE: PacingEngineState = {
  preferences: DEFAULT_PREFERENCES,
  deepWork: DEFAULT_DEEP_WORK_STATE,
  patience: DEFAULT_PATIENCE_WALLET,
  notificationQueue: [],
  pendingDigest: null,
  lastSessionTimestamp: Date.now(),
};

// ═══════════════════════════════════════════════════════════════════════════════
// RHYTHM CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

export class PacingEngine {
  private state: PacingEngineState;
  private eventListeners: ((event: PacingEvent) => void)[] = [];

  constructor(initialState: Partial<PacingEngineState> = {}) {
    this.state = {
      ...DEFAULT_STATE,
      ...initialState,
      preferences: { ...DEFAULT_PREFERENCES, ...initialState.preferences },
      deepWork: { ...DEFAULT_DEEP_WORK_STATE, ...initialState.deepWork },
      patience: { ...DEFAULT_PATIENCE_WALLET, ...initialState.patience },
    };
  }

  /**
   * Change notification rhythm mode
   */
  setRhythm(rhythm: NotificationRhythm): void {
    const from = this.state.preferences.rhythm;
    
    // If entering deep work, start a session
    if (rhythm === 'deep-work' && from !== 'deep-work') {
      this.startDeepWork();
    }
    
    // If leaving deep work, end the session
    if (from === 'deep-work' && rhythm !== 'deep-work') {
      this.endDeepWork();
    }

    this.state.preferences.rhythm = rhythm;
    this.state.preferences.updatedAt = Date.now();

    this.emit({ type: 'rhythm-changed', from, to: rhythm });
  }

  /**
   * Get current rhythm
   */
  getRhythm(): NotificationRhythm {
    return this.state.preferences.rhythm;
  }

  /**
   * Check if currently in deep work mode
   */
  isInDeepWork(): boolean {
    return this.state.deepWork.activeSession !== null;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // DEEP WORK SESSION MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Start a deep work session
   */
  startDeepWork(): DeepWorkSession {
    if (this.state.deepWork.activeSession) {
      throw new Error('Deep work session already active');
    }

    const session: DeepWorkSession = {
      id: generateId(),
      startedAt: Date.now(),
      endedAt: null,
      durationMs: 0,
      multiplierAchieved: 1.0,
      completed: false,
      patienceEarned: 0,
      unlocks: [],
    };

    this.state.deepWork.activeSession = session;
    
    this.emit({ type: 'deep-work-started', sessionId: session.id, startedAt: session.startedAt });
    
    return session;
  }

  /**
   * End the current deep work session
   */
  endDeepWork(completed: boolean = true): DeepWorkSession {
    const session = this.state.deepWork.activeSession;
    if (!session) {
      throw new Error('No active deep work session');
    }

    const endedAt = Date.now();
    const durationMs = endedAt - session.startedAt;
    const hours = durationMs / (1000 * 60 * 60);
    
    // Calculate multiplier based on duration
    const multiplier = calculateDeepWorkMultiplier(hours);
    
    // Determine unlocks achieved
    const unlocks = getUnlocksForDuration(hours);
    
    // Calculate patience earned
    const patienceEarned = Math.floor(hours * PACING_CONSTANTS.PATIENCE_PER_HOUR);

    const completedSession: DeepWorkSession = {
      ...session,
      endedAt,
      durationMs,
      multiplierAchieved: multiplier,
      completed,
      patienceEarned,
      unlocks,
    };

    // Update state
    this.state.deepWork.activeSession = null;
    this.state.deepWork.sessionHistory.push(completedSession);
    this.state.deepWork.totalDeepWorkHours += hours;
    
    // Update streak
    this.updateStreak();

    // Award patience
    this.awardPatience(patienceEarned, 'deep-work-completion');

    this.emit({
      type: 'deep-work-ended',
      sessionId: session.id,
      durationMs,
      multiplier,
    });

    return completedSession;
  }

  /**
   * Get current deep work session (if active)
   */
  getActiveDeepWorkSession(): DeepWorkSession | null {
    return this.state.deepWork.activeSession;
  }

  /**
   * Get current deep work duration (if active)
   */
  getCurrentDeepWorkDuration(): number {
    const session = this.state.deepWork.activeSession;
    if (!session) return 0;
    return Date.now() - session.startedAt;
  }

  /**
   * Get current projected multiplier (if in deep work)
   */
  getProjectedMultiplier(): number {
    const hours = this.getCurrentDeepWorkDuration() / (1000 * 60 * 60);
    return calculateDeepWorkMultiplier(hours);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // PATIENCE CURRENCY
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Get current patience balance
   */
  getPatienceBalance(): number {
    return this.state.patience.balance;
  }

  /**
   * Award patience currency
   */
  awardPatience(amount: number, source: string, description?: string): void {
    const transaction: PatienceTransaction = {
      id: generateId(),
      timestamp: Date.now(),
      amount,
      type: 'deep-work-completion',
      description: description || `Earned from ${source}`,
    };

    this.state.patience.balance += amount;
    this.state.patience.lifetimeEarned += amount;
    this.state.patience.transactions.push(transaction);

    this.emit({ type: 'patience-earned', amount, source });
  }

  /**
   * Spend patience currency
   */
  spendPatience(amount: number, optionId: string, description?: string): boolean {
    if (this.state.patience.balance < amount) {
      return false;
    }

    const transaction: PatienceTransaction = {
      id: generateId(),
      timestamp: Date.now(),
      amount: -amount,
      type: 'instant-validation',
      description: description || `Spent on ${optionId}`,
    };

    this.state.patience.balance -= amount;
    this.state.patience.lifetimeSpent += amount;
    this.state.patience.transactions.push(transaction);

    this.emit({ type: 'patience-spent', amount, optionId });
    return true;
  }

  /**
   * Get available patience spend options
   */
  getPatienceSpendOptions(): PatienceSpendOption[] {
    const options: PatienceSpendOption[] = [
      {
        id: 'instant-validation',
        name: 'Expedited Release',
        description: 'Bypass wait time on one pending FOIA request',
        cost: 50,
        cooldown: { type: 'weekly', usesAllowed: 1 },
        usesRemaining: 1, // TODO: Calculate from transaction history
        cooldownResetsAt: null,
        affordable: this.state.patience.balance >= 50,
        icon: 'bolt',
      },
      {
        id: 'cross-reference-priority',
        name: 'Priority Analysis',
        description: 'AI processes chosen connection first',
        cost: 30,
        cooldown: { type: 'daily', usesAllowed: 2 },
        usesRemaining: 2,
        cooldownResetsAt: null,
        affordable: this.state.patience.balance >= 30,
        icon: 'network',
      },
      {
        id: 'witness-priority',
        name: 'Witness Bypass',
        description: 'Skip queue for interview slot',
        cost: 40,
        cooldown: { type: 'session', usesAllowed: 1 },
        usesRemaining: 1,
        cooldownResetsAt: null,
        affordable: this.state.patience.balance >= 40,
        icon: 'user-check',
      },
      {
        id: 'bonus-unlock',
        name: 'Document Cache',
        description: 'Immediately unlock 3 bonus documents',
        cost: 75,
        cooldown: { type: 'weekly', usesAllowed: 1 },
        usesRemaining: 1,
        cooldownResetsAt: null,
        affordable: this.state.patience.balance >= 75,
        icon: 'folder-open',
      },
    ];

    return options;
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // REWARD CALCULATION
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Calculate reward multiplier for current state
   */
  calculateRewardMultiplier(isFirstLoginOfDay: boolean = false): RewardMultiplier {
    const rhythm = this.state.preferences.rhythm;
    const baseMultiplier = PACING_CONSTANTS.BASE_MULTIPLIERS[rhythm];
    
    let deepWorkMultiplier = 1.0;
    if (rhythm === 'deep-work' && this.state.deepWork.activeSession) {
      const hours = this.getCurrentDeepWorkDuration() / (1000 * 60 * 60);
      deepWorkMultiplier = calculateDeepWorkMultiplier(hours);
    }

    const dailyLoginMultiplier = isFirstLoginOfDay 
      ? PACING_CONSTANTS.DAILY_LOGIN_MULTIPLIER 
      : 1.0;

    const streakMultiplier = Math.min(
      1 + (this.state.deepWork.currentStreakDays * PACING_CONSTANTS.STREAK_MULTIPLIER_PER_DAY),
      PACING_CONSTANTS.MAX_STREAK_MULTIPLIER
    );

    const temporalMultiplier = isWeekend() ? 1.1 : 1.0;

    const totalMultiplier = baseMultiplier * deepWorkMultiplier * dailyLoginMultiplier * streakMultiplier * temporalMultiplier;

    return {
      baseMultiplier,
      deepWorkMultiplier,
      dailyLoginMultiplier,
      streakMultiplier,
      temporalMultiplier,
      totalMultiplier,
      breakdown: [
        { name: 'Rhythm Mode', value: baseMultiplier, description: `Base multiplier for ${rhythm}` },
        { name: 'Deep Work', value: deepWorkMultiplier, description: 'Focus duration bonus' },
        { name: 'Daily Login', value: dailyLoginMultiplier, description: 'First login of day bonus' },
        { name: 'Streak', value: streakMultiplier, description: `${this.state.deepWork.currentStreakDays} day streak` },
        { name: 'Temporal', value: temporalMultiplier, description: 'Weekend/holiday bonus' },
      ],
    };
  }

  /**
   * Calculate accumulated rewards for return ritual
   */
  calculateAccumulatedRewards(
    timeAwayMs: number,
    pendingDocuments: AccumulatedDocument[],
    discoveries: PatternDiscovery[],
    newLeads: NewLead[],
    isFirstLoginOfDay: boolean = false
  ): AccumulatedRewards {
    const hoursAway = timeAwayMs / (1000 * 60 * 60);
    const multiplier = this.calculateRewardMultiplier(isFirstLoginOfDay);
    
    // Calculate base insights from time away
    const baseInsights = Math.floor(hoursAway * 2); // 2 per hour
    const effectiveInsights = Math.floor(baseInsights * multiplier.totalMultiplier);

    // Determine return tier
    const returnTier = getReturnTier(hoursAway);

    return {
      documents: pendingDocuments,
      insights: baseInsights,
      effectiveInsights,
      discoveries,
      newLeads,
      multiplier,
      timeAwayMs,
      returnTier,
    };
  }

  /**
   * Get return tier based on hours away
   */
  getReturnTier(hoursAway: number): ReturnTier {
    return getReturnTier(hoursAway);
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // NOTIFICATION QUEUE
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Queue a notification
   */
  queueNotification(notification: Omit<QueuedNotification, 'id' | 'createdAt' | 'delivered' | 'deliveredAt' | 'digestBatchId'>): QueuedNotification {
    const queued: QueuedNotification = {
      ...notification,
      id: generateId(),
      createdAt: Date.now(),
      delivered: false,
      deliveredAt: null,
      digestBatchId: null,
    };

    // If in deep work and notification can't interrupt, queue it
    if (this.isInDeepWork() && !notification.interruptDeepWork) {
      this.state.notificationQueue.push(queued);
    }

    return queued;
  }

  /**
   * Get queued notifications (for digest)
   */
  getQueuedNotifications(): QueuedNotification[] {
    return this.state.notificationQueue.filter(n => !n.delivered);
  }

  /**
   * Clear delivered notifications from queue
   */
  clearDeliveredNotifications(): void {
    this.state.notificationQueue = this.state.notificationQueue.filter(n => !n.delivered);
  }

  /**
   * Process digest - mark notifications as delivered
   */
  processDigest(digestId: string): void {
    this.state.notificationQueue = this.state.notificationQueue.map(n => {
      if (n.digestBatchId === digestId) {
        return { ...n, delivered: true, deliveredAt: Date.now() };
      }
      return n;
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════════

  /**
   * Get full state (for persistence)
   */
  getState(): PacingEngineState {
    return { ...this.state };
  }

  /**
   * Set state (for hydration)
   */
  setState(state: PacingEngineState): void {
    this.state = state;
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.state.preferences = {
      ...this.state.preferences,
      ...preferences,
      updatedAt: Date.now(),
    };
  }

  /**
   * Get preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.state.preferences };
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // EVENT HANDLING
  // ═════════════════════════════════════════════════════════════════════════════

  onEvent(listener: (event: PacingEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  private emit(event: PacingEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in pacing event listener:', e);
      }
    });
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═════════════════════════════════════════════════════════════════════════════

  private updateStreak(): void {
    const today = new Date().toDateString();
    const lastSession = this.state.deepWork.sessionHistory[this.state.deepWork.sessionHistory.length - 1];
    
    if (lastSession) {
      const lastSessionDate = new Date(lastSession.endedAt || lastSession.startedAt).toDateString();
      
      if (lastSessionDate === today) {
        // Already counted today, do nothing
      } else if (isYesterday(new Date(lastSession.endedAt || lastSession.startedAt))) {
        // Consecutive day
        this.state.deepWork.currentStreakDays++;
      } else {
        // Streak broken
        this.state.deepWork.currentStreakDays = 1;
      }
    } else {
      this.state.deepWork.currentStreakDays = 1;
    }

    if (this.state.deepWork.currentStreakDays > this.state.deepWork.longestStreakDays) {
      this.state.deepWork.longestStreakDays = this.state.deepWork.currentStreakDays;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateDeepWorkMultiplier(hours: number): number {
  const tiers = PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS;
  
  if (hours >= 48) return tiers[48];
  if (hours >= 24) return tiers[24];
  if (hours >= 12) return tiers[12];
  if (hours >= 8) return tiers[8];
  if (hours >= 4) return tiers[4];
  
  // Linear interpolation between 0 and 4 hours
  return 1.0 + (hours / 4) * (tiers[4] - 1.0);
}

function getUnlocksForDuration(hours: number): DeepWorkUnlock[] {
  const unlocks: DeepWorkUnlock[] = [];
  
  if (hours >= 4) unlocks.push('focused-mind');
  if (hours >= 8) unlocks.push('subconscious-processing');
  if (hours >= 12) unlocks.push('pattern-recognition');
  if (hours >= 24) unlocks.push('major-revelation-chance');
  if (hours >= 48) unlocks.push('legendary-insight');
  
  return unlocks;
}

function getReturnTier(hoursAway: number): ReturnTier {
  if (hoursAway >= 48) return 'legendary';
  if (hoursAway >= 24) return 'deep';
  if (hoursAway >= 16) return 'extended';
  if (hoursAway >= 8) return 'standard';
  if (hoursAway >= 4) return 'brief';
  return 'quick';
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { calculateDeepWorkMultiplier, getUnlocksForDuration, getReturnTier };
export default PacingEngine;
