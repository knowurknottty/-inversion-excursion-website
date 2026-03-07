/**
 * DeepWorkTimer Component
 * 
 * Displays active deep work session with live multiplier preview.
 * Creates a sense of accumulating power through focus.
 * 
 * Design Reference:
 * - Bear app's focus timer - minimal, elegant
 * - Stardew Valley clock - cozy, time-as-resource
 * - Meditation apps - calming, purposeful
 */

'use client';

import React, { useEffect, useState } from 'react';
import { DeepWorkSession, DeepWorkUnlock, PACING_CONSTANTS } from '../types';

interface DeepWorkTimerProps {
  session: DeepWorkSession | null;
  onEndSession?: () => void;
  compact?: boolean;
}

interface Milestone {
  hours: number;
  unlock: DeepWorkUnlock;
  label: string;
  icon: string;
  achieved: boolean;
}

export const DeepWorkTimer: React.FC<DeepWorkTimerProps> = ({
  session,
  onEndSession,
  compact = false,
}) => {
  const [now, setNow] = useState(Date.now());
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Update timer every second
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <div style={styles.inactive}>
        <div style={styles.inactiveIcon}>🌙</div>
        <p style={styles.inactiveText}>Deep Work Mode inactive</p>
        <p style={styles.inactiveSubtext}>
          Enable in notification settings to earn patience multipliers
        </p>
      </div>
    );
  }

  const durationMs = now - session.startedAt;
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // Calculate current multiplier (preview)
  const currentMultiplier = calculateMultiplier(durationHours);
  const nextMultiplier = getNextMultiplier(durationHours);
  const progressToNext = getProgressToNext(durationHours);

  // Format time display
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  // Milestones for visualization
  const milestones: Milestone[] = [
    { hours: 4, unlock: 'focused-mind', label: 'Focused Mind', icon: '🎯', achieved: durationHours >= 4 },
    { hours: 8, unlock: 'subconscious-processing', label: 'Subconscious', icon: '🧠', achieved: durationHours >= 8 },
    { hours: 12, unlock: 'pattern-recognition', label: 'Pattern Boost', icon: '🔮', achieved: durationHours >= 12 },
    { hours: 24, unlock: 'major-revelation-chance', label: 'Revelation', icon: '✨', achieved: durationHours >= 24 },
    { hours: 48, unlock: 'legendary-insight', label: 'Legendary', icon: '👁️', achieved: durationHours >= 48 },
  ];

  const achievedMilestones = milestones.filter(m => m.achieved);
  const nextMilestone = milestones.find(m => !m.achieved);

  if (compact) {
    return (
      <div style={styles.compact}>
        <div style={styles.compactIcon}>🌑</div>
        <div style={styles.compactInfo}>
          <span style={styles.compactTitle}>Deep Work Active</span>
          <span style={styles.compactTime}>
            {hours.toString().padStart(2, '0')}:
            {minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <span style={{
          ...styles.compactMultiplier,
          color: getMultiplierColor(currentMultiplier),
        }}>
          {currentMultiplier.toFixed(1)}×
        </span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.statusBadge}>
          <span style={styles.pulse}>🌑</span>
          <span>Deep Work Mode</span>
        </div>
        <button
          onClick={() => setShowEndConfirm(true)}
          style={styles.endButton}
        >
          End Session
        </button>
      </div>

      {/* Timer Display */}
      <div style={styles.timerSection}>
        <div style={styles.timer}>
          <span style={styles.timerValue}>{hours.toString().padStart(2, '0')}</span>
          <span style={styles.timerSeparator}>:</span>
          <span style={styles.timerValue}>{minutes.toString().padStart(2, '0')}</span>
          <span style={styles.timerSeparator}>:</span>
          <span style={styles.timerValue}>{seconds.toString().padStart(2, '0')}</span>
        </div>
        <p style={styles.timerLabel}>Time in focus</p>
      </div>

      {/* Multiplier Display */}
      <div style={styles.multiplierSection}>
        <div style={styles.currentMultiplier}>
          <span style={{
            ...styles.multiplierValue,
            color: getMultiplierColor(currentMultiplier),
            textShadow: `0 0 30px ${getMultiplierColor(currentMultiplier)}50`,
          }}>
            {currentMultiplier.toFixed(1)}×
          </span>
          <span style={styles.multiplierLabel}>Insight Multiplier</span>
        </div>

        {nextMilestone && (
          <div style={styles.nextMilestone}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${progressToNext * 100}%`,
                  backgroundColor: getMultiplierColor(currentMultiplier),
                }}
              />
            </div>
            <p style={styles.nextMilestoneText}>
              {nextMultiplier.toFixed(1)}× at {nextMilestone.label}
              {' '}
              <span style={styles.nextMilestoneTime}>
                (in ~{Math.ceil(nextMilestone.hours - durationHours)}h)
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div style={styles.milestonesSection}>
        <p style={styles.milestonesTitle}>Focus Milestones</p>
        <div style={styles.milestones}>
          {milestones.map((milestone) => (
            <div
              key={milestone.hours}
              style={{
                ...styles.milestone,
                opacity: milestone.achieved ? 1 : 0.4,
              }}
            >
              <span style={{
                ...styles.milestoneIcon,
                filter: milestone.achieved ? 'grayscale(0)' : 'grayscale(1)',
              }}>
                {milestone.icon}
              </span>
              <span style={styles.milestoneLabel}>{milestone.label}</span>
              <span style={styles.milestoneHours}>{milestone.hours}h</span>
              {milestone.achieved && (
                <span style={styles.achievedCheck}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accumulating Notice */}
      <div style={styles.accumulatingNotice}>
        <span style={styles.accumulatingIcon}>📦</span>
        <div>
          <p style={styles.accumulatingTitle}>Discoveries accumulating</p>
          <p style={styles.accumulatingText}>
            {achievedMilestones.length > 0 
              ? `${achievedMilestones.length} bonus${achievedMilestones.length > 1 ? 'es' : ''} will be applied when you return`
              : 'Continue focusing to unlock bonuses'
            }
          </p>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div 
          style={styles.modalOverlay}
          onClick={() => setShowEndConfirm(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h4 style={styles.modalTitle}>End Deep Work Session?</h4>
            
            <div style={styles.modalStats}>
              <div style={styles.modalStat}>
                <span style={styles.modalStatValue}>
                  {hours}h {minutes}m
                </span>
                <span style={styles.modalStatLabel}>Duration</span>
              </div>
              <div style={styles.modalStat}>
                <span style={{
                  ...styles.modalStatValue,
                  color: getMultiplierColor(currentMultiplier),
                }}>
                  {currentMultiplier.toFixed(1)}×
                </span>
                <span style={styles.modalStatLabel}>Multiplier</span>
              </div>
              <div style={styles.modalStat}>
                <span style={styles.modalStatValue}>
                  {Math.floor(durationHours * 10)}
                </span>
                <span style={styles.modalStatLabel}>Patience</span>
              </div>
            </div>

            <p style={styles.modalText}>
              Your rewards will be calculated and applied when you return.
              {durationHours < 4 && ' Sessions under 4 hours receive reduced bonuses.'}
            </p>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={styles.modalCancel}
              >
                Continue Focusing
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndSession?.();
                }}
                style={styles.modalConfirm}
              >
                Collect Rewards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateMultiplier(hours: number): number {
  const tiers = PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS;
  if (hours >= 48) return tiers[48];
  if (hours >= 24) return tiers[24];
  if (hours >= 12) return tiers[12];
  if (hours >= 8) return tiers[8];
  if (hours >= 4) return tiers[4];
  return 1 + (hours / 4) * (tiers[4] - 1);
}

function getNextMultiplier(hours: number): number {
  if (hours < 4) return PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS[4];
  if (hours < 8) return PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS[8];
  if (hours < 12) return PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS[12];
  if (hours < 24) return PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS[24];
  return PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS[48];
}

function getProgressToNext(hours: number): number {
  if (hours < 4) return hours / 4;
  if (hours < 8) return (hours - 4) / 4;
  if (hours < 12) return (hours - 8) / 4;
  if (hours < 24) return (hours - 12) / 12;
  if (hours < 48) return (hours - 24) / 24;
  return 1;
}

function getMultiplierColor(multiplier: number): string {
  if (multiplier >= 5) return '#f59e0b'; // Amber - legendary
  if (multiplier >= 3.5) return '#8b5cf6'; // Violet - deep
  if (multiplier >= 2.5) return '#ec4899'; // Pink - pattern
  if (multiplier >= 2) return '#10b981'; // Emerald - subconscious
  if (multiplier >= 1.5) return '#3b82f6'; // Blue - focused
  return '#6b7280'; // Gray - baseline
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#0f0f1a',
    borderRadius: '16px',
    padding: '1.5rem',
    color: '#e4e4e7',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#10b98120',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#10b981',
  },
  pulse: {
    animation: 'pulse 2s infinite',
  },
  endButton: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  timerSection: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
  },
  timer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: '0.25rem',
    fontFamily: 'monospace',
    fontVariantNumeric: 'tabular-nums',
  },
  timerValue: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#fafafa',
  },
  timerSeparator: {
    fontSize: '2rem',
    color: '#52525b',
    padding: '0 0.25rem',
  },
  timerLabel: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: '#71717a',
  },
  multiplierSection: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  currentMultiplier: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  multiplierValue: {
    fontSize: '4rem',
    fontWeight: 800,
    lineHeight: 1,
    transition: 'all 0.5s ease',
  },
  multiplierLabel: {
    fontSize: '0.875rem',
    color: '#71717a',
    marginTop: '0.25rem',
  },
  nextMilestone: {
    maxWidth: '300px',
    margin: '0 auto',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#27273a',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 1s ease',
  },
  nextMilestoneText: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#a1a1aa',
  },
  nextMilestoneTime: {
    color: '#71717a',
  },
  milestonesSection: {
    marginBottom: '1.5rem',
  },
  milestonesTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  milestones: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  milestone: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '8px',
    backgroundColor: '#1a1a2e',
    transition: 'opacity 0.3s',
  },
  milestoneIcon: {
    fontSize: '1.25rem',
    width: '24px',
    textAlign: 'center',
  },
  milestoneLabel: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#d4d4d8',
  },
  milestoneHours: {
    fontSize: '0.75rem',
    color: '#71717a',
    fontFamily: 'monospace',
  },
  achievedCheck: {
    color: '#10b981',
    fontSize: '1rem',
  },
  accumulatingNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f59e0b15',
    borderRadius: '12px',
    border: '1px solid #f59e0b30',
  },
  accumulatingIcon: {
    fontSize: '1.5rem',
  },
  accumulatingTitle: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#f59e0b',
  },
  accumulatingText: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#a1a1aa',
  },
  inactive: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    color: '#71717a',
  },
  inactiveIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    opacity: 0.5,
  },
  inactiveText: {
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
    fontWeight: 500,
  },
  inactiveSubtext: {
    margin: 0,
    fontSize: '0.875rem',
    opacity: 0.7,
  },
  compact: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#10b98115',
    borderRadius: '12px',
    border: '1px solid #10b98130',
  },
  compactIcon: {
    fontSize: '1.25rem',
  },
  compactInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  compactTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  compactTime: {
    fontSize: '1rem',
    fontFamily: 'monospace',
    fontWeight: 600,
    color: '#fafafa',
  },
  compactMultiplier: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#00000080',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: '16px',
    padding: '1.5rem',
    maxWidth: '360px',
    width: '90%',
    border: '1px solid #27273a',
  },
  modalTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#fafafa',
  },
  modalStats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#0f0f1a',
    borderRadius: '12px',
  },
  modalStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  modalStatValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fafafa',
    fontFamily: 'monospace',
  },
  modalStatLabel: {
    fontSize: '0.75rem',
    color: '#71717a',
  },
  modalText: {
    margin: '0 0 1.5rem 0',
    fontSize: '0.875rem',
    color: '#a1a1aa',
    lineHeight: 1.5,
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  modalCancel: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  modalConfirm: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default DeepWorkTimer;
