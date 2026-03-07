/**
 * ReturnRitual Component
 * 
 * The "Welcome Back" experience that makes patience feel rewarding.
 * Celebrates the player's deliberate absence with dramatic reveals.
 * 
 * Design Reference:
 * - Slay the Spire victory screens - satisfying accumulation
 * - Death Stranding's delivery completion - emotional payoff
 * - Gacha game reveals - anticipation and surprise
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AccumulatedRewards, ReturnTier, PatternDiscovery } from '../types';

interface ReturnRitualProps {
  rewards: AccumulatedRewards | null;
  onComplete: () => void;
  playerName?: string;
}

interface RevealStep {
  id: string;
  type: 'documents' | 'discoveries' | 'insights' | 'multiplier' | 'final';
  title: string;
  content: React.ReactNode;
}

const TIER_MESSAGES: Record<ReturnTier, { title: string; subtitle: string; color: string }> = {
  quick: {
    title: 'Quick Return',
    subtitle: 'Investigations are still processing. Consider longer sessions for deeper insights.',
    color: '#6b7280',
  },
  brief: {
    title: 'Brief Absence',
    subtitle: 'Your patience is building. The patterns are beginning to emerge.',
    color: '#3b82f6',
  },
  standard: {
    title: 'Standard Interval',
    subtitle: 'Good timing. Your subconscious has been connecting dots.',
    color: '#10b981',
  },
  extended: {
    title: 'Extended Break',
    subtitle: 'The wait has been worthwhile. Significant discoveries await.',
    color: '#8b5cf6',
  },
  deep: {
    title: 'Deep Dive',
    subtitle: 'Your dedication to focus has unlocked rare insights.',
    color: '#ec4899',
  },
  legendary: {
    title: 'Legendary Patience',
    subtitle: 'Few investigators demonstrate such restraint. The reward matches the virtue.',
    color: '#f59e0b',
  },
};

export const ReturnRitual: React.FC<ReturnRitualProps> = ({
  rewards,
  onComplete,
  playerName = 'Investigator',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [revealedSteps, setRevealedSteps] = useState<Set<number>>(new Set());

  if (!rewards) {
    return null;
  }

  const tier = rewards.returnTier;
  const tierInfo = TIER_MESSAGES[tier];

  // Format time away
  const hoursAway = Math.floor(rewards.timeAwayMs / (1000 * 60 * 60));
  const minutesAway = Math.floor((rewards.timeAwayMs % (1000 * 60 * 60)) / (1000 * 60));

  // Build reveal steps
  const steps: RevealStep[] = [
    {
      id: 'welcome',
      type: 'final',
      title: 'Welcome Back',
      content: (
        <div style={styles.welcomeStep}>
          <div style={{
            ...styles.tierBadge,
            borderColor: tierInfo.color,
            color: tierInfo.color,
            backgroundColor: `${tierInfo.color}15`,
          }}>
            {tierInfo.title}
          </div>
          <p style={styles.timeAway}>
            Away for {hoursAway > 0 && <>{hoursAway}h </>}
            {minutesAway}m
          </p>
          <p style={styles.tierSubtitle}>{tierInfo.subtitle}</p>
        </div>
      ),
    },
  ];

  // Add documents step if there are documents
  if (rewards.documents.length > 0) {
    steps.push({
      id: 'documents',
      type: 'documents',
      title: `${rewards.documents.length} Document${rewards.documents.length > 1 ? 's' : ''} Decrypted`,
      content: (
        <div style={styles.documentsStep}>
          {rewards.documents.map((doc, idx) => (
            <div
              key={doc.id}
              style={{
                ...styles.documentCard,
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <div style={styles.documentIcon}>📄</div>
              <div style={styles.documentInfo}>
                <span style={styles.documentTitle}>{doc.title}</span>
                <div style={styles.documentProgress}>
                  <div
                    style={{
                      ...styles.documentProgressFill,
                      width: `${doc.decryptionProgress}%`,
                    }}
                  />
                </div>
                <span style={styles.documentProgressText}>
                  {doc.decryptionProgress}% decrypted
                </span>
              </div>
              {doc.bonusAnnotations && (
                <span style={styles.bonusTag}>Bonus Notes</span>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  // Add discoveries step if there are discoveries
  if (rewards.discoveries.length > 0) {
    steps.push({
      id: 'discoveries',
      type: 'discoveries',
      title: `${rewards.discoveries.length} Pattern${rewards.discoveries.length > 1 ? 's' : ''} Discovered`,
      content: (
        <div style={styles.discoveriesStep}>
          {rewards.discoveries.map((discovery, idx) => (
            <DiscoveryCard key={discovery.id} discovery={discovery} delay={idx * 0.15} />
          ))}
        </div>
      ),
    });
  }

  // Add insights step
  steps.push({
    id: 'insights',
    type: 'insights',
    title: 'Insights Generated',
    content: (
      <div style={styles.insightsStep}>
        <div style={styles.insightComparison}>
          <div style={styles.insightBase}>
            <span style={styles.insightNumber}>{rewards.insights}</span>
            <span style={styles.insightLabel}>Base</span>
          </div>
          
          <span style={styles.insightOperator}>×</span>
          
          <div style={styles.insightMultiplier}>
            <span style={{
              ...styles.insightNumber,
              color: tierInfo.color,
              textShadow: `0 0 20px ${tierInfo.color}40`,
            }}>
              {rewards.multiplier.totalMultiplier.toFixed(1)}
            </span>
            <span style={styles.insightLabel}>Multiplier</span>
          </div>
          
          <span style={styles.insightOperator}>=</span>
          
          <div style={styles.insightFinal}>
            <span style={{
              ...styles.insightNumber,
              color: tierInfo.color,
              fontSize: '3rem',
            }}>
              {rewards.effectiveInsights}
            </span>
            <span style={styles.insightLabel}>Effective</span>
          </div>
        </div>

        <div style={styles.multiplierBreakdown}>
          {rewards.multiplier.breakdown.map((item) => (
            <div key={item.name} style={styles.breakdownItem}>
              <span style={styles.breakdownName}>{item.name}</span>
              <span style={styles.breakdownValue}>{item.value.toFixed(1)}×</span>
            </div>
          ))}
        </div>
      </div>
    ),
  });

  // Add final step
  steps.push({
    id: 'final',
    type: 'final',
    title: 'Your Patience Rewarded',
    content: (
      <div style={styles.finalStep}>
        <div style={styles.quoteBlock}>
          <p style={styles.quote}>
            "The patterns you missed while rushing are the ones that emerge
            only to those who wait. Your restraint has become your power."
          </p>
          <span style={styles.quoteAttribution}>— AI Assistant</span>
        </div>

        {rewards.newLeads.length > 0 && (
          <div style={styles.newLeads}>
            <p style={styles.newLeadsTitle}>New Leads Generated</p>
            <div style={styles.leadsList}>
              {rewards.newLeads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    ...styles.leadCard,
                    borderColor: lead.priority === 'high' ? '#ef4444' : '#3b82f6',
                  }}
                >
                  <span style={{
                    ...styles.leadPriority,
                    color: lead.priority === 'high' ? '#ef4444' : '#3b82f6',
                  }}
003e
                    {lead.priority.toUpperCase()}
                  </span>
                  <span style={styles.leadTitle}>{lead.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setRevealedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Progress indicator */}
        <div style={styles.progressIndicator}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                ...styles.progressDot,
                backgroundColor: idx <= currentStep ? tierInfo.color : '#27273a',
                transform: idx === currentStep ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div style={styles.content}>
          <div style={styles.stepHeader}>
            <h2 style={{
              ...styles.stepTitle,
              color: tierInfo.color,
            }}>
              {currentStepData.title}
            </h2>
          </div>

          <div style={styles.stepContent}>
            {currentStepData.content}
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navigation}>
          <span style={styles.stepCounter}>
            {currentStep + 1} / {steps.length}
          </span>
          
          <button
            onClick={handleNext}
            style={{
              ...styles.nextButton,
              backgroundColor: tierInfo.color,
            }}
          >
            {isLastStep ? 'Begin Investigation' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Discovery Card Component
const DiscoveryCard: React.FC<{ discovery: PatternDiscovery; delay: number }> = ({
  discovery,
  delay,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const typeColors = {
    minor: '#6b7280',
    medium: '#3b82f6',
    major: '#8b5cf6',
    deep: '#f59e0b',
  };

  const typeIcons = {
    minor: '💡',
    medium: '🔗',
    major: '✨',
    deep: '👁️',
  };

  return (
    <div
      style={{
        ...styles.discoveryCard,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        borderColor: typeColors[discovery.type],
      }}
    >
      <div style={styles.discoveryHeader}>
        <span style={styles.discoveryIcon}>{typeIcons[discovery.type]}</span>
        <span
          style={{
            ...styles.discoveryType,
            color: typeColors[discovery.type],
          }}
003e
          {discovery.type.toUpperCase()}
        </span>
      </div>
      
      <p style={styles.discoveryDescription}>{discovery.description}</p>
      
      <div style={styles.discoveryMeta}>
        <span>{discovery.connectedEvidenceIds.length} connections</span>
        <span style={styles.discoverySignificance}>
          Significance: {discovery.significance}%
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '2rem',
  },
  container: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#0f0f1a',
    borderRadius: '24px',
    padding: '2rem',
    border: '1px solid #1e1e2e',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
  },
  progressIndicator: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  progressDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    marginBottom: '1.5rem',
  },
  stepHeader: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  stepTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  stepContent: {
    animation: 'fadeIn 0.5s ease',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #1e1e2e',
  },
  stepCounter: {
    fontSize: '0.875rem',
    color: '#71717a',
    fontFamily: 'monospace',
  },
  nextButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  // Welcome step
  welcomeStep: {
    textAlign: 'center',
    padding: '1rem 0',
  },
  tierBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '2px solid',
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
  },
  timeAway: {
    fontSize: '1.25rem',
    color: '#fafafa',
    margin: '0 0 0.5rem 0',
  },
  tierSubtitle: {
    fontSize: '1rem',
    color: '#a1a1aa',
    lineHeight: 1.6,
    maxWidth: '400px',
    margin: '0 auto',
  },
  // Documents step
  documentsStep: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  documentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    animation: 'slideIn 0.3s ease forwards',
    opacity: 0,
    transform: 'translateX(-20px)',
  },
  documentIcon: {
    fontSize: '1.5rem',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#fafafa',
    marginBottom: '0.5rem',
  },
  documentProgress: {
    height: '4px',
    backgroundColor: '#27273a',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  documentProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '2px',
    transition: 'width 1s ease',
  },
  documentProgressText: {
    fontSize: '0.75rem',
    color: '#71717a',
  },
  bonusTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f59e0b30',
    color: '#f59e0b',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  // Discoveries step
  discoveriesStep: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  discoveryCard: {
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    border: '1px solid',
    transition: 'all 0.5s ease',
  },
  discoveryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  discoveryIcon: {
    fontSize: '1.25rem',
  },
  discoveryType: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  discoveryDescription: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.9rem',
    color: '#e4e4e7',
    lineHeight: 1.5,
  },
  discoveryMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#71717a',
  },
  discoverySignificance: {
    fontFamily: 'monospace',
  },
  // Insights step
  insightsStep: {
    textAlign: 'center',
  },
  insightComparison: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  insightBase: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  insightMultiplier: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  insightFinal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  insightNumber: {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: 'monospace',
    lineHeight: 1,
  },
  insightLabel: {
    fontSize: '0.75rem',
    color: '#71717a',
    marginTop: '0.25rem',
  },
  insightOperator: {
    fontSize: '1.5rem',
    color: '#52525b',
    fontWeight: 300,
  },
  multiplierBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    maxWidth: '300px',
    margin: '0 auto',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '6px',
    fontSize: '0.8rem',
  },
  breakdownName: {
    color: '#a1a1aa',
  },
  breakdownValue: {
    color: '#fafafa',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  // Final step
  finalStep: {
    textAlign: 'center',
  },
  quoteBlock: {
    padding: '1.5rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    borderLeft: '3px solid #8b5cf6',
    marginBottom: '1.5rem',
    textAlign: 'left',
  },
  quote: {
    margin: '0 0 0.75rem 0',
    fontSize: '1rem',
    color: '#e4e4e7',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  quoteAttribution: {
    fontSize: '0.875rem',
    color: '#8b5cf6',
  },
  newLeads: {
    marginTop: '1.5rem',
  },
  newLeadsTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  leadsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  leadCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    border: '1px solid',
  },
  leadPriority: {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
  },
  leadTitle: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
};

// Keyframes would need to be added to global CSS or styled-components
const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

export default ReturnRitual;
