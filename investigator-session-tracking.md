# Session Tracking System
## Implementation Guide for Investigator Identity Arc

---

## Data Model

### Core Session Record
```json
{
  "session_id": "uuid",
  "timestamp": "ISO-8601",
  "sequence_number": 47,
  "domain_focus": "financial_forensics",
  "activities": [
    {
      "type": "foia_request",
      "target": "Delaware Corp Division",
      "status": "pending",
      "documents_expected": 3
    },
    {
      "type": "pattern_analysis",
      "input_documents": ["doc_001", "doc_042"],
      "pattern_detected": "shell_company_chain",
      "confidence": 0.87
    }
  ],
  "milestones_triggered": [],
  "epithets_considered": ["persistent"],
  "identity_markers": {
    "questions_asked": 12,
    "documents_reviewed": 8,
    "connections_made": 2,
    "dead_ends_hit": 1,
    "npc_interactions": 3
  }
}
```

### Accumulated Identity State
```json
{
  "player_uuid": "uuid",
  "identity_summary": {
    "primary_domain": "financial_forensics",
    "secondary_domain": "corporate_networks",
    "investigation_count": 47,
    "total_documents": 156,
    "accuracy_rate": 0.87,
    "patterns_identified": 12,
    "foia_requests_filed": 23,
    "foia_responses_received": 8,
    "dead_ends_explored": 23,
    "mentees_guided": 2
  },
  "epithets_earned": [
    {
      "name": "The Persistent",
      "earned_at_session": 34,
      "criteria_met": "10_dead_ends_proved_valuable"
    }
  ],
  "arc_progress": {
    "awakening_complete": true,
    "epiphany_session": 10,
    "specialization_emerging": true,
    "expertise_established": false,
    "transformation_ready": false
  },
  "identity_statement": "I investigate offshore networks because someone has to follow the buried money.",
  "mentor_methodology": null
}
```

---

## Tracking Categories

### 1. Activity Types (Auto-Detected)

| Activity | Detection Trigger | Identity Relevance |
|----------|------------------|-------------------|
| `document_review` | Open document > 30s | +1 to domain expertise |
| `foia_request` | Submit FOIA form | Filed/Response ratio tracked |
| `pattern_analysis` | Cross-reference 2+ docs | Pattern type logged |
| `connection_made` | Link entities | Network depth grows |
| `dead_end_explored` | Abandoned lead after 10+ min | Persistence marker |
| `hypothesis_tested` | Formulate and verify | Accuracy calculation |
| `npc_consultation` | Ask NPC for info | Collaboration metric |
| `guidance_given` | Help NPC with investigation | Mentor progression |

### 2. Session Metrics (Computed Post-Session)

```javascript
sessionMetrics = {
  // Curiosity indicators
  questionsAsked: countUserQuestions(),
  documentsExplored: uniqueDocumentsAccessed.length,
  timeInDeepFocus: totalTime - idleTime,
  
  // Persistence indicators  
  deadEndsEncountered: abandonedLeads.length,
  followThroughRate: completedActions / startedActions,
  
  // Pattern recognition
  crossReferencesMade: connectionEvents.length,
  hypothesesFormed: userHypotheses.length,
  verificationRate: verifiedHypotheses / testedHypotheses,
  
  // Community engagement
  npcHelpRequested: helpReceived.length,
  npcHelpOffered: helpGiven.length,
  informationShared: sharedFindings.length
}
```

### 3. Domain Classification

```javascript
const domains = {
  financial_forensics: {
    keywords: ['offshore', 'shell', 'bank', 'transaction', 'filings', 'SEC'],
    documents: ['10-K', '10-Q', 'FOIA-financial', 'bank-records'],
    activities: ['money_tracing', 'ownership_mapping']
  },
  corporate_networks: {
    keywords: ['board', 'director', 'subsidiary', 'parent', 'merger'],
    documents: ['incorporation', 'proxy', 'board-minutes'],
    activities: ['org_chart_building', 'relationship_mapping']
  },
  environmental_crime: {
    keywords: ['violation', 'EPA', 'spill', 'emission', 'permit'],
    documents: ['inspection', 'violation', 'permit'],
    activities: ['compliance_tracking', 'satellite_analysis']
  },
  political_influence: {
    keywords: ['lobby', 'donation', 'PAC', 'revolving-door', 'regulator'],
    documents: ['lobby-disclosure', 'campaign-finance', 'ethics'],
    activities: ['influence_mapping', 'timeline_building']
  }
}

// Domain scoring per session
domainAffinity = {
  financial_forensics: 0.7,  // 70% of activity
  corporate_networks: 0.2,   // 20% of activity
  political_influence: 0.1   // 10% of activity
}
```

---

## Milestone Detection

### Automatic Triggers

```javascript
const milestones = {
  // Awakening Arc
  first_foia: {
    condition: (state) => state.foia_requests_filed >= 1,
    triggered_at: null,
    notification: "First FOIA request filed. You're now a document hunter."
  },
  first_pattern: {
    condition: (state) => state.patterns_identified >= 1,
    triggered_at: null,
    notification: "First pattern recognized. You're seeing connections."
  },
  epiphany_ready: {
    condition: (state) => 
      state.session_count >= 10 && 
      state.investigations_completed >= 1,
    triggered_at: null,
    action: "trigger_epiphany_ceremony"
  },
  
  // Specialization Arc
  domain_practitioner: {
    condition: (state) => {
      const domain = state.primary_domain;
      return state.domain_sessions[domain] >= 20;
    },
    triggered_at: null,
    notification: "NPCs are starting to recognize your expertise..."
  },
  
  // Epithets
  the_persistent: {
    condition: (state) => {
      const valuableDeadEnds = state.dead_ends.filter(d => d.later_proved_valuable);
      return valuableDeadEnds.length >= 10;
    },
    triggered_at: null,
    epithet: "The Persistent",
    effect: "npc_trust_bonus"
  }
}
```

---

## Identity Dashboard API

### Player Profile Endpoint
```javascript
GET /api/player/{uuid}/identity

Response: {
  "who_you_are_becoming": {
    "primary_domain": "financial_forensics",
    "investigations_completed": 47,
    "investigation_breakdown": {
      "financial_forensics": 32,
      "corporate_networks": 12,
      "other": 3
    }
  },
  "your_fingerprint": {
    "most_active_time": "22:00-24:00",
    "average_session_depth": "high", // calculated from actions/session
    "preferred_starting_point": "FOIA requests",
    "verification_habits": "double_sources"
  },
  "community_recognition": {
    "epithets": ["The Persistent", "The Connector"],
    "npc_testimonials": [
      {
        "from": "Marcus Chen",
        "text": "They found the Delaware filing I missed for three years."
      }
    ],
    "citations_received": 5
  },
  "arc_status": {
    "awakening": {
      "complete": true,
      "epiphany_session": 10,
      "identity_statement": "I investigate because hidden power must be exposed."
    },
    "specialization": {
      "domain": "financial_forensics",
      "progress_percent": 67,
      "estimated_expertise_session": 100
    },
    "transformation": {
      "eligible": false,
      "prerequisites_completed": 2,
      "prerequisites_total": 4
    }
  }
}
```

---

## Session Summary Generation

### End-of-Session Report
```
╔══════════════════════════════════════════════════════════╗
║  SESSION 47 SUMMARY                                      ║
╠══════════════════════════════════════════════════════════╣
║  Tonight you:                                            ║
║  • Filed 2 FOIA requests (Delaware, SEC)                ║
║  • Cross-referenced 3 documents                         ║
║  • Found: Shell company chain (87% confidence)          ║
║  • Dead end: Bahamas registration (saved for later)     ║
║                                                          ║
║  Your growing expertise:                                 ║
║  Financial Forensics ████████████████░░░░ 67%           ║
║                                                          ║
║  Identity snapshot:                                      ║
║  "47 investigations. 23 FOIA requests. 87% accuracy.    ║
║   You're becoming known as someone who follows          ║
║   the buried money."                                     ║
╚══════════════════════════════════════════════════════════╝
```

### Weekly Identity Review
```
WEEK 7 REFLECTION

This week you:
• Spent 8.5 hours investigating
• Primary focus: Offshore financial patterns
• Breakthrough: Connected X Corp to Y Holdings
• New skill unlocked: Recognizing shell company signatures

Your identity is solidifying:
"I investigate financial forensics because I can't stand
hidden power. 23 FOIA requests have taught me that the
paper trail always exists—if you're patient enough to
wait for it."

NPCs are noticing:
• Marcus Chen mentioned your work to another researcher
• You received an unsolicited lead about a Cayman filing

Next milestone: Expertise recognition (Session 100)
Progress: 47/100 sessions
Estimated: 13 more sessions at current pace
```

---

## Export Format (For Transformation Ceremony)

### Investigation Timeline PDF
```
══════════════════════════════════════════════════════════
THE INVESTIGATION JOURNEY OF [PLAYER]
Year One: From Curiosity to Expertise
══════════════════════════════════════════════════════════

JANUARY: The Spark
  Session 3: First FOIA request (Delaware)
  Session 7: First dead end (later proved valuable)
  Session 10: EPIPHANY — "I can see what others miss"

MARCH: The Deepening  
  Session 23: First pattern recognized
  Session 28: NPC asked YOU for help
  Session 31: Domain declared: Financial Forensics

JUNE: The Recognition
  Session 52: First citation in NPC research
  Session 61: Epithet earned: "The Persistent"
  Session 67: Mentored first apprentice

... [generated from actual session data]

══════════════════════════════════════════════════════════
FINAL IDENTITY STATEMENT:
"Financial forensics specialist, 23 FOIA docs, 91% accuracy,
 mentor to 5, creator of the Delaware Shell Method."
══════════════════════════════════════════════════════════
```

---

## Privacy & Persistence

### Data Retention
- Full session logs: 2 years
- Aggregated identity state: Permanent
- Anonymous research patterns: For methodology improvement

### Export Options
- Player can download their full investigation history
- JSON format for personal archiving
- PDF "dossier" for sharing (sanitized)

---

## Technical Implementation Notes

### Database Schema (Simplified)
```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  sequence_number INT,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  domain_focus VARCHAR,
  metrics JSONB
);

-- Identity state (always current)
CREATE TABLE player_identity (
  player_id UUID PRIMARY KEY,
  current_arc VARCHAR, -- awakening | specialization | transformation
  primary_domain VARCHAR,
  accumulated_metrics JSONB,
  epithets TEXT[],
  identity_statement TEXT,
  updated_at TIMESTAMP
);

-- Milestone log (append-only)
CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  player_id UUID,
  milestone_type VARCHAR,
  triggered_at_session INT,
  triggered_at TIMESTAMP,
  context JSONB
);
```

### Real-Time Tracking
```javascript
// Activity stream processing
activityStream.subscribe(event => {
  if (event.type === 'document_opened') {
    identityTracker.recordDocumentReview(event);
  }
  if (event.type === 'connection_created') {
    identityTracker.recordPatternDetection(event);
  }
  if (event.type === 'session_end') {
    identityTracker.finalizeSession(event);
    milestoneChecker.evaluate(event.playerId);
  }
});
```

---

## Next Steps for Implementation

1. **Baseline Collection** (Week 1-2)
   - Track all activities without showing to player
   - Establish baseline patterns
   - Validate detection algorithms

2. **Soft Launch** (Week 3-4)
   - Show session summaries only
   - Gather feedback on metrics
   - Adjust weighting

3. **Full Identity System** (Month 2)
   - Enable milestone notifications
   - Activate NPC recognition
   - Launch epithet system

4. **Ceremony Design** (Month 3)
   - Build transformation event framework
   - Create personalized timeline generation
   - Design peer review ritual
