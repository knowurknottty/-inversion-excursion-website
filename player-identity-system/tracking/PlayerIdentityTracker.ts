import { EventEmitter } from 'events';

// Types
export type DocumentType =
  | 'FOIA_documents'
  | 'financial_records'
  | 'legal_filings'
  | 'corporate_registries'
  | 'property_records'
  | 'academic_papers'
  | 'news_archives'
  | 'social_media'
  | 'satellite_imagery'
  | 'shipping_logs'
  | 'flight_records'
  | 'cryptocurrency_transactions';

export type Methodology =
  | 'pattern_recognition'
  | 'network_analysis'
  | 'temporal_mapping'
  | 'financial_forensics'
  | 'document_authentication'
  | 'cross_reference_validation'
  | 'source_triangulation'
  | 'anomaly_detection'
  | 'timeline_reconstruction'
  | 'entity_resolution';

export interface PlayerIdentity {
  playerId: string;
  primarySpecialization: Specialization | null;
  secondarySpecializations: Specialization[];
  contributions: {
    totalDocumentsFound: number;
    documentsByType: Record<DocumentType, number>;
    bountiesCompleted: number;
    bountiesPublished: number;
  };
  epistemicStats: {
    overallAccuracy: number;
    totalSubmissions: number;
    correctionsMade: number;
    timesChangedMind: number;
    timesEvidenceDemandedChange: number;
    avgTimeToCorrection: number;
    selfInitiatedCorrections: number;
  };
  identityStatement: string;
  updatedAt: Date;
}

export interface Specialization {
  type: DocumentType;
  level: 'novice' | 'practitioner' | 'specialist' | 'expert';
  percentageOfWork: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  unlockedAt: Date;
  criteria: BadgeCriteria;
}

type BadgeCriteria =
  | { type: 'document_count'; documentType: DocumentType; count: number }
  | { type: 'accuracy_threshold'; accuracy: number; minimumSubmissions: number }
  | { type: 'corrections_celebrated'; count: number }
  | { type: 'methodology_mastery'; methodology: Methodology; level: 'apprentice' | 'journeyman' | 'master' };

// Events
export interface IdentityEvents {
  'identity:updated': (identity: PlayerIdentity) => void;
  'badge:earned': (badge: Badge, identity: PlayerIdentity) => void;
  'specialization:changed': (from: Specialization | null, to: Specialization) => void;
  'correction:celebrated': (correction: CorrectionEvent) => void;
  'milestone:reached': (milestone: MilestoneEvent) => void;
}

export interface CorrectionEvent {
  id: string;
  playerId: string;
  originalClaim: {
    text: string;
    confidence: number;
    submittedAt: Date;
  };
  correctedClaim: {
    text: string;
  };
  timeToCorrection: number;
  selfInitiated: boolean;
  createdAt: Date;
}

export interface MilestoneEvent {
  playerId: string;
  type: string;
  description: string;
  timestamp: Date;
}

// Badge Definitions
const BADGE_DEFINITIONS: Array<{
  id: string;
  name: string;
  description: string;
  tier: Badge['tier'];
  icon: string;
  criteria: BadgeCriteria;
  flavorText?: string;
}> = [
  // Document Type Badges
  {
    id: 'foia_novice',
    name: 'FOIA Seeker',
    description: 'Discovered your first FOIA document',
    tier: 'bronze',
    criteria: { type: 'document_count', documentType: 'FOIA_documents', count: 1 },
    icon: '📄'
  },
  {
    id: 'foia_specialist',
    name: 'FOIA Specialist',
    description: 'Discovered 25+ FOIA documents',
    tier: 'silver',
    criteria: { type: 'document_count', documentType: 'FOIA_documents', count: 25 },
    icon: '📑'
  },
  {
    id: 'foia_expert',
    name: 'FOIA Master',
    description: 'Discovered 100+ FOIA documents',
    tier: 'gold',
    criteria: { type: 'document_count', documentType: 'FOIA_documents', count: 100 },
    icon: '👑'
  },
  {
    id: 'financial_sleuth',
    name: 'Financial Sleuth',
    description: 'Traced your first financial paper trail',
    tier: 'bronze',
    criteria: { type: 'document_count', documentType: 'financial_records', count: 1 },
    icon: '💰'
  },
  {
    id: 'financial_forensics_expert',
    name: 'Forensic Accountant',
    description: '100+ financial records documented',
    tier: 'gold',
    criteria: { type: 'document_count', documentType: 'financial_records', count: 100 },
    icon: '🧮'
  },
  
  // Epistemic Badges
  {
    id: 'first_correction',
    name: 'Course Corrector',
    description: 'Made your first correction. Growth begins here.',
    tier: 'bronze',
    criteria: { type: 'corrections_celebrated', count: 1 },
    icon: '🧭',
    flavorText: 'The first step toward truth.'
  },
  {
    id: 'humble_investigator',
    name: 'Humble Investigator',
    description: 'Changed your mind 5 times when evidence demanded it',
    tier: 'silver',
    criteria: { type: 'corrections_celebrated', count: 5 },
    icon: '⚖️',
    flavorText: 'The mark of a true seeker of truth.'
  },
  {
    id: 'epistemic_warrior',
    name: 'Epistemic Warrior',
    description: 'Changed your mind 10+ times. Evidence is your compass.',
    tier: 'gold',
    criteria: { type: 'corrections_celebrated', count: 10 },
    icon: '⚔️',
    flavorText: 'You follow the evidence, not your ego.'
  },
  {
    id: 'truth_seeker',
    name: 'Truth Seeker',
    description: '20+ corrections celebrated',
    tier: 'platinum',
    criteria: { type: 'corrections_celebrated', count: 20 },
    icon: '🔮',
    flavorText: 'Truth matters more than being right.'
  },
  
  // Accuracy Badges
  {
    id: 'sharp_shooter',
    name: 'Sharp Shooter',
    description: '90%+ accuracy over 20+ submissions',
    tier: 'silver',
    criteria: { type: 'accuracy_threshold', accuracy: 90, minimumSubmissions: 20 },
    icon: '🎯'
  },
  {
    id: 'calibrated_mind',
    name: 'Calibrated Mind',
    description: '95%+ accuracy over 50 submissions',
    tier: 'gold',
    criteria: { type: 'accuracy_threshold', accuracy: 95, minimumSubmissions: 50 },
    icon: '⚡'
  }
];

// Identity Statement Generator
function generateIdentityStatement(identity: PlayerIdentity): string {
  const spec = identity.primarySpecialization;
  if (!spec) {
    return "You are an emerging investigator, charting your path through the evidence.";
  }
  
  const specNames: Record<DocumentType, string> = {
    'FOIA_documents': 'FOIA specialist',
    'financial_records': 'financial forensics specialist',
    'legal_filings': 'legal investigator',
    'corporate_registries': 'corporate researcher',
    'property_records': 'property investigator',
    'academic_papers': 'research analyst',
    'news_archives': 'archive researcher',
    'social_media': 'digital investigator',
    'satellite_imagery': 'geospatial analyst',
    'shipping_logs': 'maritime tracker',
    'flight_records': 'aviation investigator',
    'cryptocurrency_transactions': 'blockchain forensics specialist'
  };
  
  const specName = specNames[spec.type] || 'investigator';
  const docs = identity.contributions.totalDocumentsFound;
  const bounties = identity.contributions.bountiesCompleted;
  const accuracy = Math.round(identity.epistemicStats.overallAccuracy);
  
  let statement = `You are a ${specName} who has contributed ${docs} ${docs === 1 ? 'document' : 'documents'}`;
  
  if (bounties > 0) {
    statement += `, published ${bounties} ${bounties === 1 ? 'bounty completion' : 'bounty completions'}`;
  }
  
  statement += `, and maintained ${accuracy}% validation accuracy.`;
  
  // Add the "changed mind" framing if applicable
  if (identity.epistemicStats.timesEvidenceDemandedChange >= 3) {
    statement += ` You changed your mind ${identity.epistemicStats.timesChangedMind} of ${identity.epistemicStats.timesEvidenceDemandedChange} times when evidence demanded it.`;
    
    const rate = identity.epistemicStats.timesChangedMind / identity.epistemicStats.timesEvidenceDemandedChange;
    if (rate >= 0.8) {
      statement += ` That's intellectual courage.`;
    } else if (rate >= 0.6) {
      statement += ` That's healthy epistemic flexibility.`;
    } else if (rate >= 0.4) {
      statement += ` That's measured consideration.`;
    }
  }
  
  return statement;
}

// Player Identity Tracker Class
export class PlayerIdentityTracker extends EventEmitter {
  private identities: Map<string, PlayerIdentity> = new Map();
  private badges: Map<string, Badge[]> = new Map();
  private documentHistory: Map<string, Map<DocumentType, number>> = new Map();
  private accuracyRecords: Map<string, Array<{ correct: boolean; timestamp: Date }>> = new Map();

  // Initialize or get player identity
  getIdentity(playerId: string): PlayerIdentity {
    if (!this.identities.has(playerId)) {
      this.identities.set(playerId, this.createDefaultIdentity(playerId));
    }
    return this.identities.get(playerId)!;
  }

  private createDefaultIdentity(playerId: string): PlayerIdentity {
    return {
      playerId,
      primarySpecialization: null,
      secondarySpecializations: [],
      contributions: {
        totalDocumentsFound: 0,
        documentsByType: {} as Record<DocumentType, number>,
        bountiesCompleted: 0,
        bountiesPublished: 0
      },
      epistemicStats: {
        overallAccuracy: 0,
        totalSubmissions: 0,
        correctionsMade: 0,
        timesChangedMind: 0,
        timesEvidenceDemandedChange: 0,
        avgTimeToCorrection: 0,
        selfInitiatedCorrections: 0
      },
      identityStatement: "You are an emerging investigator, charting your path through the evidence.",
      updatedAt: new Date()
    };
  }

  // Record document discovery
  recordDocument(playerId: string, documentType: DocumentType): Badge[] {
    const identity = this.getIdentity(playerId);
    
    // Update document counts
    identity.contributions.totalDocumentsFound++;
    identity.contributions.documentsByType[documentType] = 
      (identity.contributions.documentsByType[documentType] || 0) + 1;
    
    // Update specializations
    this.updateSpecializations(playerId);
    
    // Check for new badges
    const newBadges = this.checkBadges(playerId);
    
    // Update identity statement
    identity.identityStatement = generateIdentityStatement(identity);
    identity.updatedAt = new Date();
    
    this.emit('identity:updated', identity);
    
    return newBadges;
  }

  // Record accuracy
  recordSubmission(playerId: string, correct: boolean): void {
    const identity = this.getIdentity(playerId);
    
    identity.epistemicStats.totalSubmissions++;
    
    if (!this.accuracyRecords.has(playerId)) {
      this.accuracyRecords.set(playerId, []);
    }
    
    this.accuracyRecords.get(playerId)!.push({
      correct,
      timestamp: new Date()
    });
    
    // Recalculate overall accuracy
    const records = this.accuracyRecords.get(playerId)!;
    const correctCount = records.filter(r => r.correct).length;
    identity.epistemicStats.overallAccuracy = (correctCount / records.length) * 100;
    
    // Check for accuracy badges
    const newBadges = this.checkBadges(playerId);
    newBadges.forEach(badge => {
      this.emit('badge:earned', badge, identity);
    });
    
    identity.updatedAt = new Date();
    this.emit('identity:updated', identity);
  }

  // Record correction (the key feature!)
  recordCorrection(
    playerId: string,
    originalClaim: { text: string; confidence: number; submittedAt: Date },
    correctedClaim: { text: string },
    selfInitiated: boolean = false
  ): { event: CorrectionEvent; newBadges: Badge[] } {
    const identity = this.getIdentity(playerId);
    
    // Calculate time to correction
    const timeToCorrection = (Date.now() - originalClaim.submittedAt.getTime()) / (1000 * 60 * 60);
    
    // Update stats
    identity.epistemicStats.correctionsMade++;
    identity.epistemicStats.timesChangedMind++;
    identity.epistemicStats.timesEvidenceDemandedChange++;
    
    if (selfInitiated) {
      identity.epistemicStats.selfInitiatedCorrections++;
    }
    
    // Update average time to correction
    const prevAvg = identity.epistemicStats.avgTimeToCorrection;
    const count = identity.epistemicStats.correctionsMade;
    identity.epistemicStats.avgTimeToCorrection = 
      ((prevAvg * (count - 1)) + timeToCorrection) / count;
    
    // Create event
    const event: CorrectionEvent = {
      id: `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      originalClaim,
      correctedClaim,
      timeToCorrection,
      selfInitiated,
      createdAt: new Date()
    };
    
    // Check for correction badges
    const newBadges = this.checkBadges(playerId);
    
    // Update identity statement
    identity.identityStatement = generateIdentityStatement(identity);
    identity.updatedAt = new Date();
    
    // Emit events
    this.emit('correction:celebrated', event);
    this.emit('identity:updated', identity);
    
    newBadges.forEach(badge => {
      this.emit('badge:earned', badge, identity);
    });
    
    return { event, newBadges };
  }

  // Update specializations based on document distribution
  private updateSpecializations(playerId: string): void {
    const identity = this.getIdentity(playerId);
    const docs = identity.contributions.documentsByType;
    const total = identity.contributions.totalDocumentsFound;
    
    if (total === 0) return;
    
    // Calculate percentages and determine specializations
    const specializations: Specialization[] = Object.entries(docs).map(([type, count]) => {
      const percentage = (count / total) * 100;
      let level: Specialization['level'] = 'novice';
      
      if (count >= 100 && percentage >= 40) level = 'expert';
      else if (count >= 50 && percentage >= 30) level = 'specialist';
      else if (count >= 25 && percentage >= 20) level = 'practitioner';
      
      return {
        type: type as DocumentType,
        level,
        percentageOfWork: Math.round(percentage)
      };
    }).filter(s => s.percentageOfWork >= 10); // Only include if >= 10% of work
    
    // Sort by percentage
    specializations.sort((a, b) => b.percentageOfWork - a.percentageOfWork);
    
    // Determine primary and secondary
    const oldPrimary = identity.primarySpecialization;
    identity.primarySpecialization = specializations[0] || null;
    identity.secondarySpecializations = specializations.slice(1, 4);
    
    // Emit specialization change if primary changed
    if (oldPrimary?.type !== identity.primarySpecialization?.type) {
      this.emit('specialization:changed', oldPrimary, identity.primarySpecialization);
    }
  }

  // Check and award badges
  private checkBadges(playerId: string): Badge[] {
    const identity = this.getIdentity(playerId);
    const currentBadges = this.badges.get(playerId) || [];
    const currentBadgeIds = new Set(currentBadges.map(b => b.id));
    const newBadges: Badge[] = [];
    
    for (const def of BADGE_DEFINITIONS) {
      if (currentBadgeIds.has(def.id)) continue;
      
      let earned = false;
      
      switch (def.criteria.type) {
        case 'document_count':
          const docCount = identity.contributions.documentsByType[def.criteria.documentType] || 0;
          earned = docCount >= def.criteria.count;
          break;
          
        case 'accuracy_threshold':
          earned = identity.epistemicStats.totalSubmissions >= def.criteria.minimumSubmissions &&
                   identity.epistemicStats.overallAccuracy >= def.criteria.accuracy;
          break;
          
        case 'corrections_celebrated':
          earned = identity.epistemicStats.correctionsMade >= def.criteria.count;
          break;
      }
      
      if (earned) {
        const badge: Badge = {
          ...def,
          unlockedAt: new Date()
        };
        newBadges.push(badge);
        currentBadges.push(badge);
      }
    }
    
    this.badges.set(playerId, currentBadges);
    return newBadges;
  }

  // Get player badges
  getBadges(playerId: string): Badge[] {
    return this.badges.get(playerId) || [];
  }

  // Get correction stats for framing
  getCorrectionStats(playerId: string) {
    const identity = this.getIdentity(playerId);
    const stats = identity.epistemicStats;
    
    const responseRate = stats.timesEvidenceDemandedChange > 0
      ? (stats.timesChangedMind / stats.timesEvidenceDemandedChange) * 100
      : 0;
    
    const selfInitiatedRate = stats.correctionsMade > 0
      ? (stats.selfInitiatedCorrections / stats.correctionsMade) * 100
      : 0;
    
    // Calculate percentile (simplified - would need all players in real impl)
    const percentile = this.calculatePercentile(responseRate);
    
    return {
      totalCorrections: stats.correctionsMade,
      responseRate,
      selfInitiatedRate,
      avgTimeToCorrection: stats.avgTimeToCorrection,
      percentile,
      framing: this.getCorrectionFraming(responseRate)
    };
  }

  private calculatePercentile(responseRate: number): number {
    // Simplified percentile calculation
    // In real implementation, compare against all players
    if (responseRate >= 80) return 95;
    if (responseRate >= 60) return 75;
    if (responseRate >= 40) return 50;
    if (responseRate >= 20) return 25;
    return 10;
  }

  private getCorrectionFraming(responseRate: number): {
    title: string;
    description: string;
    strength: 'exceptional' | 'strong' | 'developing' | 'emerging';
  } {
    if (responseRate >= 80) {
      return {
        title: 'Epistemic Warrior',
        description: 'You follow the evidence, not your ego. Exceptional intellectual courage.',
        strength: 'exceptional'
      };
    }
    if (responseRate >= 60) {
      return {
        title: 'Evidence-Based Thinker',
        description: 'You respond to evidence with healthy flexibility.',
        strength: 'strong'
      };
    }
    if (responseRate >= 40) {
      return {
        title: 'Developing Flexibility',
        description: 'Building the habit of intellectual growth.',
        strength: 'developing'
      };
    }
    return {
      title: 'Building Awareness',
      description: 'Each correction is a step toward stronger epistemic habits.',
      strength: 'emerging'
    };
  }
}

// Singleton instance
let trackerInstance: PlayerIdentityTracker | null = null;

export function getPlayerIdentityTracker(): PlayerIdentityTracker {
  if (!trackerInstance) {
    trackerInstance = new PlayerIdentityTracker();
  }
  return trackerInstance;
}

export default PlayerIdentityTracker;
