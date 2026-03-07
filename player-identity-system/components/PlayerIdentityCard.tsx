import React, { useMemo } from 'react';
import { format } from 'date-fns';
import './PlayerIdentityCard.css';

// Types
export interface Specialization {
  type: string;
  level: 'novice' | 'practitioner' | 'specialist' | 'expert';
  percentageOfWork: number;
}

export interface EpistemicStats {
  overallAccuracy: number;
  totalSubmissions: number;
  correctionsMade: number;
  timesChangedMind: number;
  timesEvidenceDemandedChange: number;
}

export interface Contributions {
  totalDocumentsFound: number;
  bountiesCompleted: number;
  bountiesPublished: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  unlockedAt: Date;
  flavorText?: string;
}

export interface PlayerIdentityData {
  id: string;
  playerId: string;
  displayName: string;
  avatarUrl?: string;
  primarySpecialization: Specialization | null;
  secondarySpecializations: Specialization[];
  contributions: Contributions;
  epistemicStats: EpistemicStats;
  badges: Badge[];
  joinedAt: Date;
}

interface PlayerIdentityCardProps {
  player: PlayerIdentityData;
  variant?: 'compact' | 'full' | 'hero';
  showBadges?: boolean;
  showCorrections?: boolean;
}

// Helper functions
const formatSpecializationName = (type: string): string => {
  const names: Record<string, string> = {
    'FOIA_documents': 'FOIA Specialist',
    'financial_records': 'Financial Forensics',
    'legal_filings': 'Legal Investigator',
    'corporate_registries': 'Corporate Researcher',
    'property_records': 'Property Investigator',
    'academic_papers': 'Research Analyst',
    'news_archives': 'Archive Researcher',
    'social_media': 'Digital Investigator',
    'satellite_imagery': 'Geospatial Analyst',
    'shipping_logs': 'Maritime Tracker',
    'flight_records': 'Aviation Investigator',
    'cryptocurrency_transactions': 'Blockchain Forensics'
  };
  return names[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const generateIdentityStatement = (player: PlayerIdentityData): string => {
  const spec = player.primarySpecialization;
  if (!spec) {
    return "An emerging investigator, charting their path through the evidence.";
  }
  
  const specName = formatSpecializationName(spec.type);
  const docs = player.contributions.totalDocumentsFound;
  const bounties = player.contributions.bountiesCompleted;
  const accuracy = Math.round(player.epistemicStats.overallAccuracy);
  
  let statement = `A ${specName}`;
  
  if (spec.level === 'expert') {
    statement += ` with deep expertise`;
  } else if (spec.level === 'specialist') {
    statement += ` building recognized competency`;
  }
  
  statement += ` who has contributed ${docs} ${docs === 1 ? 'document' : 'documents'}`;
  
  if (bounties > 0) {
    statement += `, completed ${bounties} ${bounties === 1 ? 'bounty' : 'bounties'}`;
  }
  
  statement += `, and maintained ${accuracy}% validation accuracy.`;
  
  return statement;
};

const generateCorrectionNarrative = (stats: EpistemicStats): string | null => {
  if (stats.timesEvidenceDemandedChange < 3) return null;
  
  const rate = Math.round((stats.timesChangedMind / stats.timesEvidenceDemandedChange) * 100);
  
  let narrative = `Changed their mind ${stats.timesChangedMind} of ${stats.timesEvidenceDemandedChange} times when evidence demanded it.`;
  
  if (rate >= 80) {
    narrative += ` That's intellectual courage.`;
  } else if (rate >= 60) {
    narrative += ` That's healthy epistemic flexibility.`;
  } else if (rate >= 40) {
    narrative += ` That's measured consideration.`;
  }
  
  return narrative;
};

const getTierColor = (tier: Badge['tier']): string => {
  const colors = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
    legendary: '#ff6b35'
  };
  return colors[tier];
};

// Components
const BadgeIcon: React.FC<{ badge: Badge; size?: 'sm' | 'md' | 'lg' }> = ({ badge, size = 'md' }) => {
  const sizeClasses = {
    sm: 'badge-icon--sm',
    md: 'badge-icon--md',
    lg: 'badge-icon--lg'
  };
  
  return (
    <div 
      className={`badge-icon ${sizeClasses[size]}`}
      style={{ '--tier-color': getTierColor(badge.tier) } as React.CSSProperties}
      title={`${badge.name}: ${badge.description}`}
    >
      <span className="badge-icon__symbol">{badge.icon}</span>
      {badge.tier === 'legendary' && <div className="badge-icon--legendary-aura" />}
    </div>
  );
};

const CorrectionPride: React.FC<{ stats: EpistemicStats }> = ({ stats }) => {
  const narrative = generateCorrectionNarrative(stats);
  if (!narrative) return null;
  
  const rate = Math.round((stats.timesChangedMind / stats.timesEvidenceDemandedChange) * 100);
  
  return (
    <div className="correction-pride">
      <div className="correction-pride__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="correction-pride__content">
        <p className="correction-pride__text">{narrative}</p>
        <div className="correction-pride__stats">
          <span className="correction-pride__rate">{rate}% response rate</span>
          <span className="correction-pride__label">Epistemic Flexibility</span>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const PlayerIdentityCard: React.FC<PlayerIdentityCardProps> = ({
  player,
  variant = 'full',
  showBadges = true,
  showCorrections = true
}) => {
  const identityStatement = useMemo(() => generateIdentityStatement(player), [player]);
  const primaryBadge = player.badges.find(b => b.tier === 'legendary') || 
                       player.badges.find(b => b.tier === 'platinum') ||
                       player.badges.find(b => b.tier === 'gold') ||
                       player.badges[0];
  
  const tierBadge = player.primarySpecialization ? {
    novice: 'Novice',
    practitioner: 'Practitioner', 
    specialist: 'Specialist',
    expert: 'Expert'
  }[player.primarySpecialization.level] : 'Investigator';

  if (variant === 'compact') {
    return (
      <div className="identity-card identity-card--compact">
        <div className="identity-card__avatar">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.displayName} />
          ) : (
            <div className="identity-card__avatar-placeholder">
              {player.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="identity-card__tier-badge">{tierBadge}</span>
        </div>
        <div className="identity-card__info">
          <h3 className="identity-card__name">{player.displayName}</h3>
          <p className="identity-card__specialization">
            {player.primarySpecialization 
              ? formatSpecializationName(player.primarySpecialization.type)
              : 'Emerging Investigator'}
          </p>
          <div className="identity-card__stats-row">
            <span>{player.contributions.totalDocumentsFound} docs</span>
            <span>{player.epistemicStats.overallAccuracy}% accuracy</span>
          </div>
        </div>
        {primaryBadge && <BadgeIcon badge={primaryBadge} size="sm" />}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="identity-card identity-card--hero">
        <div className="identity-card__hero-bg">
          {player.primarySpecialization && (
            <div 
              className={`identity-card__specialization-glow identity-card__specialization-glow--${player.primarySpecialization.level}`}
            />
          )}
        </div>
        
        <div className="identity-card__hero-content">
          <div className="identity-card__avatar identity-card__avatar--large">
            {player.avatarUrl ? (
              <img src={player.avatarUrl} alt={player.displayName} />
            ) : (
              <div className="identity-card__avatar-placeholder">
                {player.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="identity-card__level-ring" />
          </div>
          
          <div className="identity-card__identity">
            <span className="identity-card__tier-badge identity-card__tier-badge--large">
              {tierBadge}
            </span>
            <h1 className="identity-card__name identity-card__name--large">
              {player.displayName}
            </h1>
            <blockquote className="identity-card__statement identity-card__statement--large">
              "{identityStatement}"
            </blockquote>
          </div>
          
          {showCorrections && (
            <CorrectionPride stats={player.epistemicStats} />
          )}
          
          {showBadges && player.badges.length > 0 && (
            <div className="identity-card__badge-showcase">
              <h4>Recognitions</h4>
              <div className="identity-card__badge-grid">
                {player.badges.slice(0, 6).map(badge => (
                  <div key={badge.id} className="badge-showcase-item">
                    <BadgeIcon badge={badge} size="lg" />
                    <span className="badge-showcase-item__name">{badge.name}</span>
                  </div>
                ))}
                {player.badges.length > 6 && (
                  <div className="badge-showcase-item badge-showcase-item--more">
                    +{player.badges.length - 6} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="identity-card__meta">
            <span>Member since {format(player.joinedAt, 'MMMM yyyy')}</span>
            <span>•</span>
            <span>{player.contributions.totalDocumentsFound} documents contributed</span>
          </div>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className="identity-card identity-card--full">
      <div className="identity-card__header">
        <div className="identity-card__avatar">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.displayName} />
          ) : (
            <div className="identity-card__avatar-placeholder">
              {player.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="identity-card__tier-badge">{tierBadge}</span>
        </div>
        
        <div className="identity-card__title">
          <h2 className="identity-card__name">{player.displayName}</h2>
          <p className="identity-card__specialization">
            {player.primarySpecialization 
              ? formatSpecializationName(player.primarySpecialization.type)
              : 'Emerging Investigator'}
          </p>
        </div>
        
        {primaryBadge && (
          <div className="identity-card__featured-badge">
            <BadgeIcon badge={primaryBadge} size="lg" />
          </div>
        )}
      </div>
      
      <blockquote className="identity-card__statement">
        "{identityStatement}"
      </blockquote>
      
      {showCorrections && (
        <CorrectionPride stats={player.epistemicStats} />
      )}
      
      <div className="identity-card__stats">
        <div className="stat-item">
          <span className="stat-item__value">{player.contributions.totalDocumentsFound}</span>
          <span className="stat-item__label">Documents</span>
        </div>
        <div className="stat-item">
          <span className="stat-item__value">{player.contributions.bountiesCompleted}</span>
          <span className="stat-item__label">Bounties</span>
        </div>
        <div className="stat-item">
          <span className="stat-item__value">{Math.round(player.epistemicStats.overallAccuracy)}%</span>
          <span className="stat-item__label">Accuracy</span>
        </div>
        <div className="stat-item">
          <span className="stat-item__value">{player.epistemicStats.correctionsMade}</span>
          <span className="stat-item__label">Corrections</span>
        </div>
      </div>
      
      {showBadges && player.badges.length > 0 && (
        <div className="identity-card__badges">
          {player.badges.slice(0, 5).map(badge => (
            <BadgeIcon key={badge.id} badge={badge} size="md" />
          ))}
          {player.badges.length > 5 && (
            <span className="badges-more">+{player.badges.length - 5}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerIdentityCard;
