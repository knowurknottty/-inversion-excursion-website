# Player Identity System

## Overview

The Player Identity System transforms how players view their own growth and learning in investigative environments. It recognizes that **changing your mind when evidence demands it is a strength, not defeat**.

This system provides:
- **Epistemic History Tracking** - Document discovery, accuracy rates, methodology usage
- **Dynamic Identity Formation** - Player profiles that evolve with their expertise
- **Specialization Badges** - Recognition for expertise areas
- **Learning Trajectory Visualization** - Visual representation of growth over time
- **Correction Celebration** - Reframing corrections as intellectual courage

## Core Philosophy

> *"The goal is not to be right. The goal is to become right."*

This system reframes:
- **Corrections** → Course corrections (navigation, not failure)
- **Wrong hypotheses** → Explored paths (necessary for mapping)
- **Changing expertise** → Intellectual growth (evolution, not inconsistency)

## Quick Start

### Installation

```bash
# Copy components to your project
cp -r player-identity-system/components/* src/components/identity/
cp -r player-identity-system/tracking/* src/lib/identity/
```

### Dependencies

```bash
npm install recharts date-fns
```

### Basic Usage

```tsx
import { PlayerIdentityCard } from './components/identity/PlayerIdentityCard';
import { getPlayerIdentityTracker } from './lib/identity/PlayerIdentityTracker';

// Initialize tracker
const tracker = getPlayerIdentityTracker();

// Record player activity
tracker.recordDocument(playerId, 'FOIA_documents');
tracker.recordSubmission(playerId, true); // correct submission

// Record a correction (celebrated!)
const { event, newBadges } = tracker.recordCorrection(
  playerId,
  {
    text: "The company was founded in 2010",
    confidence: 85,
    submittedAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    text: "The company was founded in 2008"
  },
  true // self-initiated
);

// Render identity card
function ProfilePage({ playerId }) {
  const identity = tracker.getIdentity(playerId);
  const badges = tracker.getBadges(playerId);
  
  return (
    <PlayerIdentityCard
      player={{
        ...identity,
        displayName: "Investigator_42",
        badges,
        joinedAt: new Date('2024-01-15')
      }}
      variant="hero"
    />
  );
}
```

## Components

### PlayerIdentityCard

Displays player identity with three variants:

```tsx
// Compact - for lists, small spaces
<PlayerIdentityCard player={player} variant="compact" />

// Full - standard profile view
<PlayerIdentityCard player={player} variant="full" />

// Hero - featured profile header
<PlayerIdentityCard 
  player={player} 
  variant="hero"
  showBadges={true}
  showCorrections={true}
/>
```

### CorrectionCelebration

Modal celebration when corrections are made:

```tsx
import { CorrectionCelebration } from './components/identity/CorrectionCelebration';

function App() {
  const [celebration, setCelebration] = useState(null);
  
  useEffect(() => {
    tracker.on('correction:celebrated', (event) => {
      const stats = tracker.getCorrectionStats(playerId);
      setCelebration({
        event,
        newBadges: [], // populated by badge check
        totalCorrections: stats.totalCorrections,
        rankPercentile: stats.percentile
      });
    });
  }, []);
  
  return (
    <>
      {celebration && (
        <CorrectionCelebration
          {...celebration}
          autoClose={true}
          autoCloseDelay={8000}
          onComplete={() => setCelebration(null)}
        />
      )}
    </>
  );
}
```

### LearningTrajectory

Visualizes player growth over time:

```tsx
import { LearningTrajectoryChart } from './components/identity/LearningTrajectory';

<LearningTrajectoryChart
  data={trajectoryData}
  milestones={milestones}
  methodologyBalance={methodologyData}
  playerName="Investigator_42"
/>
```

### CorrectionChronicle

Timeline of corrections with framing:

```tsx
import { CorrectionChronicle } from './components/identity/CorrectionCelebration';

<CorrectionChronicle
  corrections={corrections}
  framing="celebratory" // 'celebratory' | 'neutral' | 'analytical'
  maxItems={10}
/>
```

### EpistemicStrengthCard

Highlights epistemic flexibility as strength:

```tsx
import { EpistemicStrengthCard } from './components/identity/CorrectionCelebration';

const stats = tracker.getCorrectionStats(playerId);

<EpistemicStrengthCard
  timesChangedMind={stats.timesChangedMind}
  timesEvidenceDemandedChange={stats.timesEvidenceDemandedChange}
  avgTimeToCorrection={stats.avgTimeToCorrection}
  selfInitiatedRate={stats.selfInitiatedRate}
/>
```

## Tracking API

### PlayerIdentityTracker

The core tracking system:

```typescript
const tracker = getPlayerIdentityTracker();

// Events
tracker.on('identity:updated', (identity) => {
  console.log('Identity updated:', identity.identityStatement);
});

tracker.on('badge:earned', (badge, identity) => {
  console.log(`Badge earned: ${badge.name}`);
});

tracker.on('correction:celebrated', (event) => {
  console.log('Correction celebrated!');
});

tracker.on('specialization:changed', (from, to) => {
  console.log(`Specialization changed from ${from?.type} to ${to.type}`);
});

// Methods
tracker.recordDocument(playerId, documentType);
tracker.recordSubmission(playerId, isCorrect);
tracker.recordCorrection(playerId, originalClaim, correctedClaim, selfInitiated);

// Queries
const identity = tracker.getIdentity(playerId);
const badges = tracker.getBadges(playerId);
const correctionStats = tracker.getCorrectionStats(playerId);
```

## Identity Statement Examples

The system generates dynamic identity statements:

**New Player:**
> "You are an emerging investigator, charting your path through the evidence."

**FOIA Specialist:**
> "You are a FOIA specialist who has contributed 23 documents, published 4 bounty completions, and maintained 91% validation accuracy. You changed your mind 9 of 11 times when evidence demanded it. That's intellectual courage."

**Financial Forensics Expert:**
> "You are a financial forensics specialist with deep expertise who has contributed 156 documents, completed 12 bounties, and maintained 94% validation accuracy. You changed your mind 15 of 18 times when evidence demanded it. That's healthy epistemic flexibility."

## Badge System

### Document Type Badges
- **FOIA Seeker** (Bronze) - First FOIA document
- **FOIA Specialist** (Silver) - 25+ FOIA documents
- **FOIA Master** (Gold) - 100+ FOIA documents
- **Financial Sleuth** (Bronze) - First financial record
- **Forensic Accountant** (Gold) - 100+ financial records

### Epistemic Badges (The "Changing Mind" Framing)
- **Course Corrector** (Bronze) - First correction
- **Humble Investigator** (Silver) - 5 corrections
- **Epistemic Warrior** (Gold) - 10 corrections
- **Truth Seeker** (Platinum) - 20 corrections

### Accuracy Badges
- **Sharp Shooter** (Silver) - 90%+ accuracy over 20 submissions
- **Calibrated Mind** (Gold) - 95%+ accuracy over 50 submissions

## Specialization Levels

| Level | Requirements | 
|-------|-------------|
| Novice | 1+ documents, 10%+ of work |
| Practitioner | 25+ documents, 20%+ of work |
| Specialist | 50+ documents, 30%+ of work |
| Expert | 100+ documents, 40%+ of work |

## The "Changed Your Mind" Framing

The key innovation is reframing corrections as strength:

### Before (Traditional)
- "You've made 9 mistakes"
- "Accuracy: 85%"
- "9 errors corrected"

### After (This System)
- "You changed your mind 9 of 11 times when evidence demanded it"
- "Validation accuracy: 91%"
- "9 corrections celebrated"

### Response Rate Framing
- **80%+**: "Epistemic Warrior - You follow the evidence, not your ego"
- **60-79%**: "Evidence-Based Thinker - Healthy epistemic flexibility"
- **40-59%**: "Developing Flexibility - Building intellectual growth habits"
- **20-39%**: "Building Awareness - Each correction is growth"

## Styling

Components use CSS custom properties for theming:

```css
:root {
  --identity-bronze: #cd7f32;
  --identity-silver: #c0c0c0;
  --identity-gold: #ffd700;
  --identity-platinum: #e5e4e2;
  --identity-legendary: #ff6b35;
  
  --identity-bg: #0a0a0f;
  --identity-surface: #12121a;
  --identity-border: #2a2a3a;
  --identity-text: #e8e8f0;
  --identity-text-muted: #8888a0;
  --identity-accent: #6366f1;
}
```

## Database Schema

See `SYSTEM_SPEC.md` for full database schema.

Key tables:
- `player_identities` - Core identity data
- `player_document_expertise` - Document type expertise
- `accuracy_records` - Submission history
- `methodology_usage` - Methodology tracking
- `player_badges` - Earned badges
- `correction_events` - Correction history

## Events

The tracker emits events for reactive updates:

```typescript
tracker.on('identity:updated', (identity: PlayerIdentity) => void);
tracker.on('badge:earned', (badge: Badge, identity: PlayerIdentity) => void);
tracker.on('specialization:changed', (from: Specialization | null, to: Specialization) => void);
tracker.on('correction:celebrated', (event: CorrectionEvent) => void);
tracker.on('milestone:reached', (milestone: MilestoneEvent) => void);
```

## Examples

See `examples/` directory for:
- `DemoProfile.tsx` - Complete profile page example
- `DemoDashboard.tsx` - Dashboard with trajectory visualization
- `DemoCorrectionFlow.tsx` - Correction celebration flow

## Contributing

This system is designed to be extended:

1. **New Badge Types**: Add to `BADGE_DEFINITIONS` in `PlayerIdentityTracker.ts`
2. **New Document Types**: Extend the `DocumentType` union type
3. **Custom Identity Statements**: Modify `generateIdentityStatement()` function
4. **Additional Visualizations**: Extend the trajectory chart components

## License

MIT
