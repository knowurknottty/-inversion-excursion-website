/**
 * PacingSelector Component
 * 
 * Allows players to select their notification rhythm mode.
 * Visual design emphasizes that Deep Work is a power mode, not a limitation.
 * 
 * Design Reference: Clean, purposeful UI reminiscent of:
 * - Bear (focus app) - elegant simplicity
 * - Stardew Valley - cozy, rewarding feedback
 * - Obra Dinn - diegetic, in-world UI elements
 */

'use client';

import React, { useState } from 'react';
import { NotificationRhythm, PACING_CONSTANTS } from '../types';

interface PacingSelectorProps {
  currentRhythm: NotificationRhythm;
  onChange: (rhythm: NotificationRhythm) => void;
  disabled?: boolean;
}

interface RhythmOption {
  id: NotificationRhythm;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  multiplier: string;
  color: string;
  benefits: string[];
}

const RHYTHM_OPTIONS: RhythmOption[] = [
  {
    id: 'daily-digest',
    icon: '📬',
    title: 'Daily Digest',
    subtitle: 'Once per day',
    description: 'All discoveries delivered in one focused moment',
    multiplier: '1.5×',
    color: '#6366f1', // Indigo
    benefits: [
      'Minimal interruptions',
      'Curated summary of progress',
      'Morning ritual potential',
    ],
  },
  {
    id: 'live-updates',
    icon: '⚡',
    title: 'Live Updates',
    subtitle: 'Real-time',
    description: 'Critical discoveries as they happen',
    multiplier: '1.0×',
    color: '#f59e0b', // Amber
    benefits: [
      'Never miss breakthroughs',
      'Time-sensitive opportunities',
      'Active investigation mode',
    ],
  },
  {
    id: 'deep-work',
    icon: '🌑',
    title: 'Deep Work',
    subtitle: 'Suspended',
    description: 'Complete focus. Rewards accumulate while away.',
    multiplier: '2-5×',
    color: '#10b981', // Emerald
    benefits: [
      'Maximum insight multiplier',
      'AI subconscious processing',
      'Pattern recognition boost',
      'Patience currency earned',
    ],
  },
];

export const PacingSelector: React.FC<PacingSelectorProps> = ({
  currentRhythm,
  onChange,
  disabled = false,
}) => {
  const [hoveredRhythm, setHoveredRhythm] = useState<NotificationRhythm | null>(null);
  const [showConfirm, setShowConfirm] = useState<NotificationRhythm | null>(null);

  const handleSelect = (rhythm: NotificationRhythm) => {
    if (rhythm === currentRhythm) return;
    
    // Show confirmation for Deep Work mode
    if (rhythm === 'deep-work') {
      setShowConfirm(rhythm);
      return;
    }
    
    // If currently in deep work, show confirmation for leaving
    if (currentRhythm === 'deep-work') {
      setShowConfirm(rhythm);
      return;
    }
    
    onChange(rhythm);
  };

  const confirmChange = () => {
    if (showConfirm) {
      onChange(showConfirm);
      setShowConfirm(null);
    }
  };

  return (
    <div className="pacing-selector" style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Notification Rhythm</h3>
        <p style={styles.subtitle}>
          Choose how discoveries reach you. Patience is rewarded.
        </p>
      </div>

      <div style={styles.optionsGrid}>
        {RHYTHM_OPTIONS.map((option) => {
          const isSelected = currentRhythm === option.id;
          const isHovered = hoveredRhythm === option.id;
          const isDeepWork = option.id === 'deep-work';

          return (
            <button
              key={option.id}
              onClick={() => !disabled && handleSelect(option.id)}
              onMouseEnter={() => setHoveredRhythm(option.id)}
              onMouseLeave={() => setHoveredRhythm(null)}
              disabled={disabled}
              style={{
                ...styles.option,
                borderColor: isSelected ? option.color : isHovered ? option.color : 'transparent',
                backgroundColor: isSelected ? `${option.color}15` : isHovered ? `${option.color}08` : '#1a1a2e',
                boxShadow: isSelected ? `0 0 20px ${option.color}30` : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div style={{
                  ...styles.selectedIndicator,
                  backgroundColor: option.color,
                }} />
              )}

              {/* Icon and header */}
              <div style={styles.optionHeader}>
                <span style={styles.icon}>{option.icon}</span>
                <div style={styles.optionTitleGroup}>
                  <span style={styles.optionTitle}>{option.title}</span>
                  <span style={{ ...styles.subtitle, fontSize: '0.75rem' }}>
                    {option.subtitle}
                  </span>
                </div>
                <span style={{
                  ...styles.multiplier,
                  color: option.color,
                  backgroundColor: `${option.color}20`,
                }}>
                  {option.multiplier}
                </span>
              </div>

              {/* Description */}
              <p style={styles.description}>{option.description}</p>

              {/* Benefits - only show for selected or hovered */}
              {(isSelected || isHovered) && (
                <ul style={styles.benefits}>
                  {option.benefits.map((benefit, idx) => (
                    <li key={idx} style={styles.benefit}>
                      <span style={{ color: option.color, marginRight: '0.5rem' }}>+</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}

              {/* Deep work special callout */}
              {isDeepWork && !isSelected && (
                <div style={{
                  ...styles.deepWorkCallout,
                  borderColor: option.color,
                }}>
                  <span style={{ fontSize: '0.8rem' }}>
                    💡 Most investigators find 8-16 hour sessions optimal
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirm(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalIcon}>
                {showConfirm === 'deep-work' ? '🌑' : '⚠️'}
              </span>
              <h4 style={styles.modalTitle}>
                {showConfirm === 'deep-work'
                  ? 'Enter Deep Work Mode?'
                  : 'Leave Deep Work Mode?'}
              </h4>
            </div>
            
            <p style={styles.modalText}>
              {showConfirm === 'deep-work' ? (
                <>
                  Notifications will be suspended. Your AI assistant will continue
                  working in the background. The longer you stay away, the greater
                  your rewards when you return.
                </>
              ) : (
                <>
                  Your deep work session will end. You&apos;ll receive accumulated
                  rewards based on your focus duration.
                </>
              )}
            </p>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowConfirm(null)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmChange}
                style={{
                  ...styles.confirmButton,
                  backgroundColor: showConfirm === 'deep-work' ? '#10b981' : '#6366f1',
                }}
              >
                {showConfirm === 'deep-work' ? 'Enter Deep Work' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
    marginBottom: '1.5rem',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#fafafa',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#a1a1aa',
    lineHeight: 1.5,
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  option: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '1rem',
    borderRadius: '12px',
    border: '2px solid transparent',
    backgroundColor: '#1a1a2e',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
  },
  selectedIndicator: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    width: '100%',
  },
  icon: {
    fontSize: '1.5rem',
  },
  optionTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  optionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fafafa',
  },
  multiplier: {
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  description: {
    margin: '0.25rem 0 0.5rem 0',
    fontSize: '0.875rem',
    color: '#a1a1aa',
    lineHeight: 1.4,
  },
  benefits: {
    margin: '0.5rem 0 0 0',
    padding: 0,
    listStyle: 'none',
    fontSize: '0.8rem',
    color: '#d4d4d8',
  },
  benefit: {
    padding: '0.25rem 0',
    display: 'flex',
    alignItems: 'center',
  },
  deepWorkCallout: {
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px dashed',
    color: '#a1a1aa',
    backgroundColor: '#10b98110',
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
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #27273a',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  modalIcon: {
    fontSize: '1.5rem',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#fafafa',
  },
  modalText: {
    margin: '0 0 1.5rem 0',
    fontSize: '0.875rem',
    color: '#a1a1aa',
    lineHeight: 1.6,
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmButton: {
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default PacingSelector;
