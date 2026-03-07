# Player Identity System

## Overview

The Player Identity System transforms the player's journey from a black box into a visible, celebrated narrative. It recognizes that **changing your mind when evidence demands it is a strength, not defeat**.

## Core Philosophy

> *"The goal is not to be right. The goal is to become right."*

This system reframes:
- **Corrections** → Course corrections (navigation, not failure)
- **Wrong hypotheses** → Explored paths (necessary for mapping)
- **Changing expertise** → Intellectual growth (evolution, not inconsistency)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYER IDENTITY SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Epistemic  │  │   Identity   │  │   Visualization  │  │
│  │   History    │  │   Profile    │  │   Engine         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                   │             │
│         ▼                 ▼                   ▼             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Player State Store (DB)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Player Epistemic History Tracker

### 1.1 Document Type Discovery Log

```typescript
interface DocumentTypeDiscovery {
  id: string;
  playerId: string;
  documentType: DocumentType;
  firstDiscoveredAt: Date;
  expertiseLevel: 'novice' | 'practitioner' | 'specialist' | 'expert';
  documentsFound: number;
  accuracyRate: number;
  methodologiesUsed: Methodology[];
}

type DocumentType =
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
```

### 1.2 Accuracy Tracking System

```typescript
interface AccuracyRecord {
  id: string;
  playerId: string;
  timestamp: Date;
  claim: string;
  evidence: Evidence[];
  initialConfidence: number; // 0-100
  finalVerdict: 'confirmed' | 'partially_correct' | 'incorrect' | 'disproven';
  correctionMade: boolean;
  timeToCorrection?: number; // hours
  correctionCelebrated: boolean;
}

interface PlayerAccuracyStats {
  totalSubmissions: number;
  confirmedCorrect: number;
  partiallyCorrect: number;
  incorrect: number;
  disproven: number;
  overallAccuracy: number; // percentage
  correctionsMade: number;
  avgTimeToCorrection: number; // hours
  correctionRate: number; // corrections / opportunities
}
```

### 1.3 Methodology Registry

```typescript
type Methodology =
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

interface MethodologyUsage {
  methodology: Methodology;
  timesUsed: number;
  successRate: number;
  firstUsed: Date;
  lastUsed: Date;
  masteryLevel: 'apprentice' | 'journeyman' | 'master';
}
```

---

## 2. Player Identity Profile

### 2.1 Core Identity Model

```typescript
interface PlayerIdentity {
  id: string;
  playerId: string;
  
  // Dynamic title based on expertise
  primarySpecialization: Specialization | null;
  secondarySpecializations: Specialization[];
  
  // Contribution metrics
  contributions: {
    totalDocumentsFound: number;
    documentsByType: Record<DocumentType, number>;
    bountiesCompleted: number;
    bountiesPublished: number;
    investigationsLed: number;
    collaborationsJoined: number;
  };
  
  // Epistemic metrics
  epistemicStats: {
    overallAccuracy: number;
    totalSubmissions: number;
    correctionsMade: number;
    correctionOpportunities: number;
    timesChangedMind: number;
    timesEvidenceDemandedChange: number;
    avgConfidenceCalibration: number; // how well confidence matches reality
  };
  
  // Identity evolution
  identityHistory: IdentityEvolutionEvent[];
  
  // Badges and achievements
  badges: Badge[];
  
  // Learning trajectory
  learningTrajectory: TrajectoryPoint[];
  
  // Generated description
  identityStatement: string; // e.g., "You are a financial forensics specialist..."
}

interface Specialization {
  type: DocumentType;
  level: 'novice' | 'practitioner' | 'specialist' | 'expert';
  percentageOfWork: number; // % of documents contributed
}

interface IdentityEvolutionEvent {
  timestamp: Date;
  fromSpecialization?: Specialization;
  toSpecialization?: Specialization;
  eventType: 'new_expertise' | 'deepened_specialization' | 'shifted_focus' | 'milestone_reached';
  description: string;
}

interface TrajectoryPoint {
  date: Date;
  expertiseScore: number;
  accuracyRate: number;
  documentsContributed: number;
  primaryMethodology: Methodology;
}
```

### 2.2 Identity Statement Generator

```typescript
function generateIdentityStatement(identity: PlayerIdentity): string {
  const spec = identity.primarySpecialization;
  if (!spec) {
    return "You are an emerging investigator, charting your path through the evidence.";
  }
  
  const specName = formatSpecializationName(spec.type);
  const docs = identity.contributions.totalDocumentsFound;
  const bounties = identity.contributions.bountiesCompleted;
  const accuracy = Math.round(identity.epistemicStats.overallAccuracy);
  const corrections = identity.epistemicStats.correctionsMade;
  const changeRate = identity.epistemicStats.timesEvidenceDemandedChange > 0
    ? Math.round((identity.epistemicStats.timesChangedMind / identity.epistemicStats.timesEvidenceDemandedChange) * 100)
    : 0;
  
  let statement = `You are a ${specName}`;
  
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
  
  // Add the "changed mind" framing if applicable
  if (identity.epistemicStats.timesEvidenceDemandedChange >= 3) {
    statement += ` You changed your mind ${identity.epistemicStats.timesChangedMind} of ${identity.epistemicStats.timesEvidenceDemandedChange} times when evidence demanded it.`;
    
    if (changeRate >= 70) {
      statement += ` That's intellectual courage.`;
    } else if (changeRate >= 50) {
      statement += ` That's healthy epistemic flexibility.`;
    }
  }
  
  return statement;
}
```

---

## 3. Specialization Badge System

### 3.1 Badge Types

```typescript
interface Badge {
  id: string;
  type: 'specialization' | 'methodology' | 'epistemic' | 'milestone' | 'rare';
  name: string;
  description: string;
  icon: string; // SVG or icon name
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  unlockedAt: Date;
  criteria: BadgeCriteria;
  rarity: number; // 0-100, for display purposes
}

type BadgeCriteria =
  | { type: 'document_count'; documentType: DocumentType; count: number }
  | { type: 'accuracy_threshold'; accuracy: number; minimumSubmissions: number }
  | { type: 'corrections_celebrated'; count: number }
  | { type: 'methodology_mastery'; methodology: Methodology; level: 'apprentice' | 'journeyman' | 'master' }
  | { type: 'bounty_completion'; count: number }
  | { type: 'collaboration'; count: number }
  | { type: 'streak'; consecutiveCorrect: number }
  | { type: 'versatility'; documentTypes: number };
```

### 3.2 Badge Catalog

```typescript
const BADGE_CATALOG: BadgeDefinition[] = [
  // Specialization Badges
  {
    id: 'foia_novice',
    name: 'FOIA Seeker',
    description: 'Discovered your first FOIA document',
    type: 'specialization',
    tier: 'bronze',
    criteria: { type: 'document_count', documentType: 'FOIA_documents', count: 1 },
    icon: 'document-search'
  },
  {
    id: 'foia_specialist',
    name: 'FOIA Specialist',
    description: 'Discovered 25+ FOIA documents',
    type: 'specialization',
    tier: 'silver',
    criteria: { type: 'document_count', documentType: 'FOIA_documents', count: 25 },
    icon: 'document-stack'
  },
  {
    id: 'foia_expert',
    name: 'FOIA Master',
    description: 'Discovered 100+ FOIA documents with 90%+ accuracy',
    type: 'specialization',
    tier: 'gold',
    criteria: { type: 'document_count', documentType: 'FOIA_documents', count: 100 },
    icon: 'document-crown'
  },
  
  // Financial Forensics
  {
    id: 'financial_sleuth',
    name: 'Financial Sleuth',
    description: 'Traced your first financial paper trail',
    type: 'specialization',
    tier: 'bronze',
    criteria: { type: 'document_count', documentType: 'financial_records', count: 1 },
    icon: 'chart-line'
  },
  {
    id: 'financial_forensics_expert',
    name: 'Forensic Accountant',
    description: '100+ financial records with expert-level accuracy',
    type: 'specialization',
    tier: 'gold',
    criteria: { type: 'document_count', documentType: 'financial_records', count: 100 },
    icon: 'calculator-shield'
  },
  
  // Methodology Badges
  {
    id: 'network_mapper',
    name: 'Network Weaver',
    description: 'Successfully used network analysis 10 times',
    type: 'methodology',
    tier: 'silver',
    criteria: { type: 'methodology_mastery', methodology: 'network_analysis', level: 'journeyman' },
    icon: 'network-nodes'
  },
  {
    id: 'pattern_sage',
    name: 'Pattern Sage',
    description: 'Mastered pattern recognition across 50+ investigations',
    type: 'methodology',
    tier: 'gold',
    criteria: { type: 'methodology_mastery', methodology: 'pattern_recognition', level: 'master' },
    icon: 'eye-scan'
  },
  
  // Epistemic Badges (The "Changing Mind" Framing)
  {
    id: 'first_correction',
    name: 'Course Corrector',
    description: 'Made your first correction. Growth begins here.',
    type: 'epistemic',
    tier: 'bronze',
    criteria: { type: 'corrections_celebrated', count: 1 },
    icon: 'compass-rotate',
    specialFrame: 'celebratory'
  },
  {
    id: 'humble_investigator',
    name: 'Humble Investigator',
    description: 'Changed your mind 5 times when evidence demanded it',
    type: 'epistemic',
    tier: 'silver',
    criteria: { type: 'corrections_celebrated', count: 5 },
    icon: 'scale-balanced',
    flavorText: 'The mark of a true seeker of truth.'
  },
  {
    id: 'epistemic_warrior',
    name: 'Epistemic Warrior',
    description: 'Changed your mind 10+ times. Evidence is your compass.',
    type: 'epistemic',
    tier: 'gold',
    criteria: { type: 'corrections_celebrated', count: 10 },
    icon: 'sword-shield',
    flavorText: 'You follow the evidence, not your ego.'
  },
  {
    id: 'truth_seeker',
    name: 'Truth Seeker',
    description: '80%+ correction rate when evidence demands it',
    type: 'epistemic',
    tier: 'platinum',
    criteria: { type: 'corrections_celebrated', count: 20 },
    icon: 'crystal-ball',
    flavorText: 'Truth matters more than being right.'
  },
  
  // Accuracy Badges
  {
    id: 'sharp_shooter',
    name: 'Sharp Shooter',
    description: '90%+ accuracy over 20+ submissions',
    type: 'milestone',
    tier: 'silver',
    criteria: { type: 'accuracy_threshold', accuracy: 90, minimumSubmissions: 20 },
    icon: 'target-bullseye'
  },
  {
    id: 'calibrated_mind',
    name: 'Calibrated Mind',
    description: 'Perfect confidence calibration over 50 submissions',
    type: 'milestone',
    tier: 'gold',
    criteria: { type: 'accuracy_threshold', accuracy: 95, minimumSubmissions: 50 },
    icon: 'gauge-perfect'
  },
  
  // Rare/Easter Egg Badges
  {
    id: 'phoenix',
    name: 'Phoenix',
    description: 'Corrected a major error that led to breakthrough',
    type: 'rare',
    tier: 'legendary',
    criteria: { type: 'rare_event', event: 'major_correction_breakthrough' },
    icon: 'phoenix-rise',
    flavorText: 'From the ashes of error, truth emerges.'
  },
  {
    id: 'paradigm_shifter',
    name: 'Paradigm Shifter',
    description: 'Changed your mind on a long-held theory',
    type: 'rare',
    tier: 'legendary',
    criteria: { type: 'rare_event', event: 'major_theory_change' },
    icon: 'paradigm-shift',
    flavorText: 'The courage to rebuild your understanding.'
  }
];
```

---

## 4. Learning Trajectory Visualization

### 4.1 Trajectory Data Model

```typescript
interface TrajectoryConfig {
  playerId: string;
  timeRange: 'week' | 'month' | 'quarter' | 'year' | 'all';
  metrics: TrajectoryMetric[];
}

type TrajectoryMetric = 
  | 'expertise_score'
  | 'accuracy_rate'
  | 'document_volume'
  | 'methodology_diversity'
  | 'correction_rate'
  | 'confidence_calibration';

interface TrajectoryDataset {
  metric: TrajectoryMetric;
  data: { date: Date; value: number }[];
  trend: 'improving' | 'stable' | 'fluctuating' | 'declining';
  milestones: TrajectoryMilestone[];
}

interface TrajectoryMilestone {
  date: Date;
  type: 'specialization_unlocked' | 'badge_earned' | 'accuracy_threshold' | 'correction_made' | 'methodology_mastered';
  description: string;
  value: number;
}
```

### 4.2 Visualization Components

```typescript
// Radar chart showing methodology balance
interface MethodologyRadarData {
  methodology: Methodology;
  currentScore: number;
  previousScore: number; // for growth animation
  maxScore: number;
}

// Sankey diagram for expertise flow
interface ExpertiseFlow {
  from: DocumentType | 'start';
  to: DocumentType | 'current';
  volume: number; // number of investigations
  timeSpan: number; // days
}

// Heatmap for activity patterns
interface ActivityHeatmap {
  weekNumber: number;
  dayOfWeek: number;
  intensity: number; // 0-10
  primaryActivity: DocumentType | Methodology;
}
```

---

## 5. Correction Celebration System

### 5.1 Correction Flow

```typescript
interface CorrectionEvent {
  id: string;
  playerId: string;
  timestamp: Date;
  originalClaim: {
    text: string;
    confidence: number;
    submittedAt: Date;
  };
  correctedClaim: {
    text: string;
    evidence: Evidence[];
  };
  timeToCorrection: number; // hours
  selfInitiated: boolean; // vs external correction
  celebrationDelivered: boolean;
}

async function celebrateCorrection(event: CorrectionEvent): Promise<void> {
  // 1. Update stats
  await updatePlayerStats(event.playerId, {
    correctionsMade: { increment: 1 },
    correctionStreak: { increment: 1 }
  });
  
  // 2. Check for badges
  const newBadges = await checkCorrectionBadges(event.playerId);
  
  // 3. Generate celebration message
  const message = generateCorrectionCelebration(event, newBadges);
  
  // 4. Deliver to player
  await deliverCelebration(event.playerId, {
    type: 'correction_celebrated',
    message,
    badges: newBadges,
    stats: {
      totalCorrections: await getTotalCorrections(event.playerId),
      rankPercentile: await getCorrectionPercentile(event.playerId)
    }
  });
}

function generateCorrectionCelebration(event: CorrectionEvent, newBadges: Badge[]): string {
  const templates = [
    "You followed the evidence. That's what investigators do.",
    "Course corrected. The map just got more accurate.",
    "You changed your mind when the facts changed. That's integrity.",
    "Another step toward clarity. Well done.",
    "The best investigators revise. You just proved that.",
    "Evidence > Ego. You get it.",
    "That's how knowledge advances. One correction at a time."
  ];
  
  const baseMessage = templates[Math.floor(Math.random() * templates.length)];
  
  if (newBadges.length > 0) {
    const badgeNames = newBadges.map(b => b.name).join(', ');
    return `${baseMessage}\n\n🏆 Badge Earned: ${badgeNames}`;
  }
  
  return baseMessage;
}
```

### 5.2 Correction Statistics Dashboard

```typescript
interface CorrectionStats {
  totalCorrections: number;
  correctionsThisMonth: number;
  avgTimeToCorrection: number; // hours
  selfInitiatedRate: number; // percentage
  rankPercentile: number; // how they compare to others
  
  // The key metric - reframed as strength
  epistemicFlexibility: {
    score: number; // 0-100
    label: 'Resistant' | 'Cautious' | 'Balanced' | 'Flexible' | 'Agile';
    description: string;
  };
  
  // Framing
  strengthNarrative: string;
}

function generateStrengthNarrative(stats: CorrectionStats): string {
  if (stats.totalCorrections === 0) {
    return "You haven't needed to make corrections yet. Or maybe you haven't found the right moment. Both are okay.";
  }
  
  if (stats.selfInitiatedRate > 70) {
    return `You changed your mind ${stats.totalCorrections} times, and ${Math.round(stats.selfInitiatedRate)}% of those were self-initiated. You catch yourself. You course-correct. That's the mark of intellectual integrity.`;
  }
  
  if (stats.avgTimeToCorrection < 24) {
    return `You correct within ${Math.round(stats.avgTimeToCorrection)} hours on average. When the evidence shifts, you don't hesitate. That's agility.`;
  }
  
  return `You've made ${stats.totalCorrections} corrections. Each one made your understanding more accurate. That's growth.`;
}
```

---

## 6. UI Component Specifications

### 6.1 Profile Header Component

```typescript
interface ProfileHeaderProps {
  player: PlayerIdentity;
  viewMode: 'public' | 'private';
}

// Visual design notes:
// - Large avatar with specialization-based frame
// - Identity statement as pull quote
// - Primary badge displayed prominently
// - "Member since" with journey length
```

### 6.2 Expertise Visualization Component

```typescript
interface ExpertiseVizProps {
  specializations: Specialization[];
  documentBreakdown: Record<DocumentType, number>;
  animate?: boolean;
}

// Visual: Treemap or pie chart showing document type distribution
// Hover: Show count + accuracy for each type
// Click: Drill down to methodology used for that type
```

### 6.3 Trajectory Graph Component

```typescript
interface TrajectoryGraphProps {
  datasets: TrajectoryDataset[];
  milestones: TrajectoryMilestone[];
  comparisonRange?: 'previous_period' | 'player_average' | 'global_average';
}

// Visual: Multi-line chart with milestone markers
// Features:
// - Toggle metrics on/off
// - Zoom to time range
// - Click milestone for details
// - Comparison ghost line
```

### 6.4 Badge Showcase Component

```typescript
interface BadgeShowcaseProps {
  badges: Badge[];
  displayMode: 'grid' | 'timeline' | 'rarity_sorted';
  highlightNew?: boolean;
}

// Visual: Card grid with rarity-based glow effects
// Bronze: subtle
// Silver: soft glow
// Gold: golden shimmer
// Platinum: pulsing aura
// Legendary: animated, unique effects
```

### 6.5 Correction Chronicle Component

```typescript
interface CorrectionChronicleProps {
  corrections: CorrectionEvent[];
  framing: 'celebratory' | 'neutral' | 'analytical';
}

// Visual: Timeline of corrections
// Each entry shows:
// - What changed
// - Time to correction (badge if fast)
// - Impact on understanding
// - Self-initiated indicator (star if self-caught)
```

---

## 7. API Endpoints

```typescript
// Player Identity
GET    /api/player/:id/identity
PUT    /api/player/:id/identity/recalculate

// Epistemic History
GET    /api/player/:id/epistemic/accuracy
GET    /api/player/:id/epistemic/methodologies
GET    /api/player/:id/epistemic/document-types

// Corrections
POST   /api/player/:id/corrections/celebrate
GET    /api/player/:id/corrections/history
GET    /api/player/:id/corrections/stats

// Trajectory
GET    /api/player/:id/trajectory?metrics=&range=
GET    /api/player/:id/trajectory/comparison

// Badges
GET    /api/player/:id/badges
GET    /api/badges/catalog
POST   /api/player/:id/badges/check  // Trigger badge evaluation
```

---

## 8. Database Schema

```sql
-- Player Identity Core
CREATE TABLE player_identities (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  primary_specialization JSONB,
  identity_statement TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Document Type Expertise
CREATE TABLE player_document_expertise (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  document_type VARCHAR(50),
  expertise_level VARCHAR(20),
  documents_found INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2),
  first_discovered_at TIMESTAMP,
  last_contributed_at TIMESTAMP
);

-- Accuracy Records
CREATE TABLE accuracy_records (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  claim_text TEXT,
  initial_confidence INTEGER,
  final_verdict VARCHAR(20),
  correction_made BOOLEAN DEFAULT FALSE,
  time_to_correction_hours INTEGER,
  correction_celebrated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  corrected_at TIMESTAMP
);

-- Methodology Usage
CREATE TABLE methodology_usage (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  methodology VARCHAR(50),
  times_used INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  first_used_at TIMESTAMP,
  last_used_at TIMESTAMP,
  mastery_level VARCHAR(20)
);

-- Badges
CREATE TABLE player_badges (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  badge_id VARCHAR(50),
  badge_type VARCHAR(20),
  tier VARCHAR(20),
  unlocked_at TIMESTAMP,
  metadata JSONB
);

-- Trajectory Snapshots
CREATE TABLE trajectory_snapshots (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  snapshot_date DATE,
  expertise_score INTEGER,
  accuracy_rate DECIMAL(5,2),
  documents_contributed INTEGER,
  primary_methodology VARCHAR(50),
  metadata JSONB
);

-- Correction Events
CREATE TABLE correction_events (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  original_claim JSONB,
  corrected_claim JSONB,
  time_to_correction_hours INTEGER,
  self_initiated BOOLEAN,
  celebration_delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

-- Identity Evolution Log
CREATE TABLE identity_evolution (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  event_type VARCHAR(50),
  from_specialization JSONB,
  to_specialization JSONB,
  description TEXT,
  occurred_at TIMESTAMP
);
```

---

## 9. Implementation Phases

### Phase 1: Foundation
- [ ] Create database schema
- [ ] Implement basic identity model
- [ ] Build accuracy tracking
- [ ] Create profile API endpoints

### Phase 2: Visualization
- [ ] Build trajectory calculation engine
- [ ] Create chart components
- [ ] Implement expertise visualization
- [ ] Design badge display

### Phase 3: Celebration
- [ ] Build correction detection system
- [ ] Create celebration messages
- [ ] Implement badge awarding
- [ ] Design correction chronicle UI

### Phase 4: Polish
- [ ] Animation and transitions
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 10. Key Metrics & Success Criteria

### Engagement
- Profile views per player per week
- Time spent on trajectory visualization
- Badge sharing rate

### Epistemic Health
- Correction rate (target: normalize as positive)
- Time to correction (shorter = better)
- Self-initiated correction rate

### Identity Formation
- % of players with primary specialization
- Specialization diversity over time
- Identity statement shares

---

*This system transforms every correction from a hidden shame into a visible strength. The investigators who grow are the ones who follow the evidence—even when it leads away from where they started.*
