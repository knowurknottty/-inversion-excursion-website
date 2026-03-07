import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import './CorrectionCelebration.css';

export interface CorrectionEvent {
  id: string;
  originalClaim: {
    text: string;
    confidence: number;
    submittedAt: Date;
  };
  correctedClaim: {
    text: string;
    evidence: string[];
  };
  timeToCorrection: number; // hours
  selfInitiated: boolean;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  flavorText?: string;
}

export interface CorrectionCelebrationProps {
  event: CorrectionEvent;
  newBadges: Badge[];
  totalCorrections: number;
  rankPercentile: number;
  onComplete?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const CELEBRATION_MESSAGES = [
  {
    title: "Course Corrected",
    body: "You followed the evidence. That's what investigators do."
  },
  {
    title: "Evidence > Ego",
    body: "You changed your mind when the facts changed. That's integrity."
  },
  {
    title: "Navigation Update",
    body: "The map just got more accurate. Well done."
  },
  {
    title: "Intellectual Courage",
    body: "The best investigators revise. You just proved that."
  },
  {
    title: "Step Toward Clarity",
    body: "That's how knowledge advances. One correction at a time."
  },
  {
    title: "Evidence Followed",
    body: "You didn't double down. You leveled up."
  }
];

const getTierGlow = (tier: Badge['tier']): string => {
  const glows = {
    bronze: '0 0 30px rgba(205, 127, 50, 0.5)',
    silver: '0 0 40px rgba(192, 192, 192, 0.5)',
    gold: '0 0 50px rgba(255, 215, 0, 0.6)',
    platinum: '0 0 60px rgba(229, 228, 226, 0.6)',
    legendary: '0 0 80px rgba(255, 107, 53, 0.8)'
  };
  return glows[tier];
};

export const CorrectionCelebration: React.FC<CorrectionCelebrationProps> = ({
  event,
  newBadges,
  totalCorrections,
  rankPercentile,
  onComplete,
  autoClose = false,
  autoCloseDelay = 8000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const message = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
  
  useEffect(() => {
    // Trigger entrance animation
    const entranceTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Trigger confetti
    const confettiTimer = setTimeout(() => setShowConfetti(true), 300);
    
    // Auto close
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      return () => {
        clearTimeout(entranceTimer);
        clearTimeout(confettiTimer);
        clearTimeout(closeTimer);
      };
    }
    
    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(confettiTimer);
    };
  }, [autoClose, autoCloseDelay]);
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 500);
  };

  return (
    <div className={`correction-celebration ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}>
      {showConfetti && <ConfettiBurst />}
      
      <div className="correction-celebration__backdrop" onClick={handleClose} />
      
      <div className="correction-celebration__content">
        <div className="correction-celebration__header">
          <div className="correction-celebration__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="correction-celebration__label">Course Correction Recorded</span>
        </div>
        
        <div className="correction-celebration__main">
          <h2 className="correction-celebration__title">{message.title}</h2>
          <p className="correction-celebration__body">{message.body}</p>
          
          <div className="correction-celebration__details">
            <div className="correction-detail">
              <span className="correction-detail__label">Time to correction</span>
              <span className="correction-detail__value">
                {event.timeToCorrection < 1 
                  ? `${Math.round(event.timeToCorrection * 60)} minutes`
                  : `${Math.round(event.timeToCorrection)} hours`}
              </span>
            </div>
            
            {event.selfInitiated && (
              <div className="correction-detail correction-detail--highlight"
              >
                <span className="correction-detail__label">Self-initiated</span>
                <span className="correction-detail__value">⭐ Self-caught</span>
              </div>
            )}
          </div>
        </div>
        
        {newBadges.length > 0 && (
          <div className="correction-celebration__badges"
          >
            <h4 className="correction-celebration__badges-title">
              🏆 Badge{newBadges.length > 1 ? 's' : ''} Earned
            </h4>
            
            {newBadges.map((badge, idx) => (
              <div 
                key={badge.id}
                className={`correction-badge correction-badge--${badge.tier}`}
                style={{ 
                  animationDelay: `${idx * 200}ms`,
                  boxShadow: getTierGlow(badge.tier)
                }}
              >
                <div className="correction-badge__icon">{badge.icon}</div>
                <div className="correction-badge__info"
                >
                  <span className="correction-badge__name">{badge.name}</span>
                  <span className="correction-badge__tier">{badge.tier}</span>
                </div>
                {badge.flavorText && (
                  <p className="correction-badge__flavor">"{badge.flavorText}"</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="correction-celebration__stats"
        >
          <div className="celebration-stat"
          >
            <span className="celebration-stat__value"
            >{totalCorrections}</span>
            <span className="celebration-stat__label"
            >Total Corrections</span>
          </div>
          
          <div className="celebration-stat"
          >
            <span className="celebration-stat__value"
            >Top {100 - rankPercentile}%</span>
            <span className="celebration-stat__label"
            >Epistemic Flexibility</span>
          </div>
        </div>
        
        <button 
          className="correction-celebration__close"
          onClick={handleClose}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// Confetti Component
const ConfettiBurst: React.FC = () => {
  const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ff6b35'];
  
  return (
    <div className="confetti-container"
    >
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1 + Math.random();
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`
            }}
          />
        );
      })}
    </div>
  );
};

// Correction Chronicle Component
export interface CorrectionChronicleProps {
  corrections: CorrectionEvent[];
  framing?: 'celebratory' | 'neutral' | 'analytical';
  maxItems?: number;
}

export const CorrectionChronicle: React.FC<CorrectionChronicleProps> = ({
  corrections,
  framing = 'celebratory',
  maxItems = 10
}) => {
  const displayedCorrections = corrections.slice(0, maxItems);
  
  const getFramedText = (correction: CorrectionEvent) => {
    switch (framing) {
      case 'celebratory':
        return {
          action: correction.selfInitiated ? 'Self-caught and corrected' : 'Updated understanding',
          tone: 'positive'
        };
      case 'analytical':
        return {
          action: 'Hypothesis revised',
          tone: 'neutral'
        };
      default:
        return {
          action: 'Corrected',
          tone: 'neutral'
        };
    }
  };
  
  return (
    <div className="correction-chronicle"
    >
      <div className="correction-chronicle__header"
      >
        <h4 className="correction-chronicle__title"
        >
          {framing === 'celebratory' ? '🧭 Correction Chronicle' : 'Correction History'}
        </h4>
        <span className="correction-chronicle__count"
        >{corrections.length} total</span>
      </div>
      
      <div className="correction-chronicle__timeline"
      >
        {displayedCorrections.map((correction, idx) => {
          const framed = getFramedText(correction);
          
          return (
            <div 
              key={correction.id}
              className={`chronicle-item chronicle-item--${framed.tone}`}
            >
              <div className="chronicle-item__marker"
              >
                {correction.selfInitiated && <span className="chronicle-item__star"
                >⭐</span>}
              </div>
              
              <div className="chronicle-item__content"
              >
                <div className="chronicle-item__header"
                >
                  <span className="chronicle-item__action"
                  >{framed.action}</span>
                  <span className="chronicle-item__time"
                  >
                    {formatDistanceToNow(correction.createdAt, { addSuffix: true })}
                  </span>
                </div>
                
                <div className="chronicle-item__meta"
                >
                  <span className="chronicle-item__response-time"
                  >
                    Response time: {correction.timeToCorrection < 1 
                      ? `${Math.round(correction.timeToCorrection * 60)}m`
                      : `${Math.round(correction.timeToCorrection)}h`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {corrections.length > maxItems && (
        <button className="correction-chronicle__more"
        >
          View all {corrections.length} corrections
        </button>
      )}
    </div>
  );
};

// Epistemic Strength Card
export interface EpistemicStrengthCardProps {
  timesChangedMind: number;
  timesEvidenceDemandedChange: number;
  avgTimeToCorrection: number;
  selfInitiatedRate: number;
}

export const EpistemicStrengthCard: React.FC<EpistemicStrengthCardProps> = ({
  timesChangedMind,
  timesEvidenceDemandedChange,
  avgTimeToCorrection,
  selfInitiatedRate
}) => {
  if (timesEvidenceDemandedChange === 0) {
    return (
      <div className="epistemic-strength epistemic-strength--emerging"
      >
        <div className="epistemic-strength__icon"
        >🌱</div>
        <h4 className="epistemic-strength__title"
        >Emerging Flexibility</h4>
        <p className="epistemic-strength__text"
        >
          Your epistemic journey is just beginning. When evidence challenges 
          your assumptions, you'll have the opportunity to show your commitment 
          to truth over ego.
        </p>
      </div>
    );
  }
  
  const responseRate = Math.round((timesChangedMind / timesEvidenceDemandedChange) * 100);
  
  let title, icon, description;
  
  if (responseRate >= 80) {
    title = 'Epistemic Warrior';
    icon = '⚔️';
    description = `You changed your mind ${timesChangedMind} of ${timesEvidenceDemandedChange} times when evidence demanded it. You follow the facts, not your ego.`;
  } else if (responseRate >= 60) {
    title = 'Evidence-Based Thinker';
    icon = '🔬';
    description = `You respond to evidence ${responseRate}% of the time. You're building the habit of intellectual flexibility.`;
  } else if (responseRate >= 40) {
    title = 'Developing Flexibility';
    icon = '🌿';
    description = `You've shown willingness to change ${timesChangedMind} times. Growth comes from embracing correction.`;
  } else {
    title = 'Building Awareness';
    icon = '🧱';
    description = `You've corrected ${timesChangedMind} times. Each one is a step toward stronger epistemic habits.`;
  }
  
  return (
    <div className="epistemic-strength"
    >
      <div className="epistemic-strength__icon"
    >{icon}</div>
      
      <div className="epistemic-strength__content"
    >
        <h4 className="epistemic-strength__title"
    >{title}</h4>
        <p className="epistemic-strength__text"
    >{description}</p>
        
        <div className="epistemic-strength__stats"
    >
          <div className="epistemic-stat"
    >
            <span className="epistemic-stat__value"
    >{responseRate}%</span>
            <span className="epistemic-stat__label"
    >Response Rate</span>
          </div>
          
          <div className="epistemic-stat"
    >
            <span className="epistemic-stat__value"
    >{Math.round(selfInitiatedRate)}%</span>
            <span className="epistemic-stat__label"
    >Self-Caught</span>
          </div>
          
          <div className="epistemic-stat"
    >
            <span className="epistemic-stat__value"
    >
              {avgTimeToCorrection < 1 
                ? `${Math.round(avgTimeToCorrection * 60)}m`
                : `${Math.round(avgTimeToCorrection)}h`}
            </span>
            <span className="epistemic-stat__label"
    >Avg Response</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectionCelebration;
