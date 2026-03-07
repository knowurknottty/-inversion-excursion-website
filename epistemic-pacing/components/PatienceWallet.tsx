/**
 * PatienceWallet Component
 * 
 * Displays and manages spendable patience currency.
 * Visualizes patience as a resource that rewards restraint.
 * 
 * Design Reference:
 * - Hades' bounties - tangible, spendable power
 * - Slay the Spire gold - accumulated resource with weight
 * - Genshin Impact primogems - valuable, thoughtfully spent
 */

'use client';

import React, { useState } from 'react';
import { PatienceWallet, PatienceSpendOption } from '../types';

interface PatienceWalletProps {
  wallet: PatienceWallet;
  options: PatienceSpendOption[];
  onSpend: (optionId: string) => void;
  compact?: boolean;
}

export const PatienceWallet: React.FC<PatienceWalletProps> = ({
  wallet,
  options,
  onSpend,
  compact = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<PatienceSpendOption | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const recentTransactions = wallet.transactions.slice(-5).reverse();

  if (compact) {
    return (
      <div style={styles.compact}>
        <span style={styles.compactIcon}>⏳</span>
        <span style={styles.compactBalance}>{wallet.balance}</span>
        <span style={styles.compactLabel}>Patience</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with balance */}
      <div style={styles.header}>
        <div style={styles.balanceSection}>
          <div style={styles.balanceDisplay}>
            <span style={styles.balanceIcon}>⏳</span>
            <span style={styles.balanceAmount}>{wallet.balance}</span>
          </div>
          <span style={styles.balanceLabel}>Available Patience</span>
        </div>

        <div style={styles.statsSection}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{wallet.lifetimeEarned}</span>
            <span style={styles.statLabel}>Earned</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{wallet.lifetimeSpent}</span>
            <span style={styles.statLabel}>Spent</span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={styles.historyButton}
003e
            {showHistory ? 'Hide' : 'History'}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      {showHistory && (
        <div style={styles.historySection}>
          <h4 style={styles.historyTitle}>Recent Transactions</h4>
          {recentTransactions.length === 0 ? (
            <p style={styles.emptyHistory}>No transactions yet</p>
          ) : (
            <ul style={styles.historyList}>
              {recentTransactions.map((tx) => (
                <li key={tx.id} style={styles.historyItem}>
                  <span style={{
                    ...styles.historyAmount,
                    color: tx.amount > 0 ? '#10b981' : '#ef4444',
                  }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                  <span style={styles.historyDescription}>{tx.description}</span>
                  <span style={styles.historyDate}>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Spend options */}
      <div style={styles.spendSection}>
        <h4 style={styles.spendTitle}>Spend Patience</h4>
        <p style={styles.spendSubtitle}>
          Patience spent reduces your multiplier. Choose wisely.
        </p>

        <div style={styles.optionsGrid}>
          {options.map((option) => {
            const canAfford = wallet.balance >= option.cost;
            const hasUses = option.usesRemaining > 0;
            const isAvailable = canAfford && hasUses;

            return (
              <button
                key={option.id}
                onClick={() => isAvailable && setSelectedOption(option)}
                disabled={!isAvailable}
                style={{
                  ...styles.optionCard,
                  opacity: isAvailable ? 1 : 0.5,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  borderColor: selectedOption?.id === option.id ? '#f59e0b' : 'transparent',
                }}
003e
                <div style={styles.optionHeader}>
                  <span style={styles.optionIcon}>{getIcon(option.icon)}</span>
                  <div style={styles.optionInfo}>
                    <span style={styles.optionName}>{option.name}</span>
                    <span style={styles.optionDescription}>{option.description}</span>
                  </div>
                </div>

                <div style={styles.optionFooter}>
                  <span style={{
                    ...styles.optionCost,
                    color: canAfford ? '#f59e0b' : '#ef4444',
                  }}>
                    {option.cost} ⏳
                  </span>
                  
                  {!hasUses && (
                    <span style={styles.cooldownBadge}>On Cooldown</span>
                  )}
                  
                  {option.cooldownResetsAt && (
                    <span style={styles.cooldownTime}>
                      Resets {new Date(option.cooldownResetsAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation modal */}
      {selectedOption && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedOption(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalIcon}>{getIcon(selectedOption.icon)}</span>
              <h4 style={styles.modalTitle}>{selectedOption.name}</h4>
            </div>

            <p style={styles.modalDescription}>{selectedOption.description}</p>

            <div style={styles.modalCost}>
              <span>Cost: </span>
              <span style={styles.modalCostAmount}>{selectedOption.cost} Patience</span>
            </div>

            <div style={styles.modalWarning}>
              <span>⚠️</span>
              <p>
                Spending patience reduces your available multiplier.
                This cannot be undone.
              </p>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setSelectedOption(null)}
                style={styles.cancelButton}
003e
                Keep Patience
              </button>
              <button
                onClick={() => {
                  onSpend(selectedOption.id);
                  setSelectedOption(null);
                }}
                style={styles.spendButton}
003e
                Spend {selectedOption.cost} Patience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to convert icon names to emojis
function getIcon(iconName: string): string {
  const icons: Record<string, string> = {
    bolt: '⚡',
    network: '🕸️',
    'user-check': '👤',
    'folder-open': '📂',
  };
  return icons[iconName] || '💎';
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
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #1e1e2e',
  },
  balanceSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  balanceDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  balanceIcon: {
    fontSize: '2rem',
  },
  balanceAmount: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#f59e0b',
    fontFamily: 'monospace',
    textShadow: '0 0 20px #f59e0b30',
  },
  balanceLabel: {
    fontSize: '0.875rem',
    color: '#a1a1aa',
    marginTop: '0.25rem',
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fafafa',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#71717a',
  },
  historyButton: {
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #3f3f46',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  historySection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
  },
  historyTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#a1a1aa',
  },
  emptyHistory: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#71717a',
    fontStyle: 'italic',
  },
  historyList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    backgroundColor: '#0f0f1a',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  historyAmount: {
    fontFamily: 'monospace',
    fontWeight: 600,
    minWidth: '50px',
  },
  historyDescription: {
    flex: 1,
    color: '#e4e4e7',
  },
  historyDate: {
    fontSize: '0.75rem',
    color: '#71717a',
  },
  spendSection: {
    marginTop: '1rem',
  },
  spendTitle: {
    margin: '0 0 0.25rem 0',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fafafa',
  },
  spendSubtitle: {
    margin: '0 0 1rem 0',
    fontSize: '0.875rem',
    color: '#71717a',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '0.75rem',
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    border: '2px solid transparent',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  optionIcon: {
    fontSize: '1.5rem',
  },
  optionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  optionName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#fafafa',
  },
  optionDescription: {
    fontSize: '0.8rem',
    color: '#a1a1aa',
    lineHeight: 1.4,
  },
  optionFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '0.75rem',
    borderTop: '1px solid #27273a',
  },
  optionCost: {
    fontSize: '0.9rem',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  cooldownBadge: {
    padding: '0.125rem 0.375rem',
    backgroundColor: '#ef444420',
    color: '#ef4444',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  cooldownTime: {
    fontSize: '0.7rem',
    color: '#71717a',
  },
  compact: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f59e0b15',
    borderRadius: '8px',
    border: '1px solid #f59e0b30',
  },
  compactIcon: {
    fontSize: '1rem',
  },
  compactBalance: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#f59e0b',
    fontFamily: 'monospace',
  },
  compactLabel: {
    fontSize: '0.7rem',
    color: '#a1a1aa',
    textTransform: 'uppercase',
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
  modalDescription: {
    margin: '0 0 1rem 0',
    fontSize: '0.875rem',
    color: '#a1a1aa',
    lineHeight: 1.5,
  },
  modalCost: {
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#0f0f1a',
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
  modalCostAmount: {
    color: '#f59e0b',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  modalWarning: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#ef444415',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #3f3f46',
    backgroundColor: 'transparent',
    color: '#a1a1aa',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  spendButton: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#f59e0b',
    color: '#0f0f1a',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default PatienceWallet;
