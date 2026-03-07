# Investigator Identity Arc — Implementation Quick Reference

## The Problem Being Solved

**Generic RPG progression:** "Level 47 Researcher, 12,450 XP"  
**Identity Arc progression:** "Financial forensics specialist, 23 FOIA docs, 91% accuracy"

The player becomes someone specific through their actions, not abstract points.

---

## Three Arcs at a Glance

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ARC 1: AWAKENING        ARC 2: SPECIALIZATION     ARC 3: TRANSFORMATION│
│  (Sessions 1-10)         (Sessions 11-100)         (Sessions 100-365+)  │
├─────────────────────────────────────────────────────────────────────────┤
│  From: Curious browser   From: Capable investigator From: Expert        │
│  To: "I can do this"     To: "This is MY thing"     To: "I am the path"│
├─────────────────────────────────────────────────────────────────────────┤
│  KEY MOMENT:             KEY MOMENT:               KEY MOMENT:          │
│  The Epiphany            The Peer Review           The Ceremony         │
│  (Session 10)            (Session 100)             (Year 1)             │
├─────────────────────────────────────────────────────────────────────────┤
│  UNLOCKS:                UNLOCKS:                  UNLOCKS:             │
│  • Domain choice         • Expert archives         • Keeper status      │
│  • Deep Archives access  • NPC recognition         • Method codified    │
│  • Identity statement    • Mentorship ability      • Permanent impact   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Progression Milestones

### Session 1-10: The Awakening

| Session | Milestone | What Happens |
|---------|-----------|--------------|
| 3 | First FOIA | Unlocks "Document Hunter" recognition |
| 5 | First Pattern | NPCs start noticing your connections |
| 8 | First Dead End | System tracks persistence |
| **10** | **EPIPHANY** | **Ceremony: Choose domain, unlock Deep Archives** |

**By end of Arc 1:** Player has declared primary domain and written first identity statement.

---

### Session 11-100: The Specialization

| Sessions | Tier | Recognition | Identity Marker |
|----------|------|-------------|-----------------|
| 11-30 | Apprentice | "Learning [DOMAIN]" | Basic tool access |
| 31-60 | Practitioner | "Reliable researcher" | NPCs seek you out |
| 61-100 | Specialist | "Go-to expert" | Can mentor NPCs |
| **100** | **PEER REVIEW** | **Community epithet** | **Expert status confirmed** |

**Progress tracking:**
- Domain sessions (target: 20+ for practitioner, 50+ for specialist)
- Investigations completed (target: 3+ for peer review)
- Accuracy rate (calculated from verified hypotheses)
- NPC citations (others using your work)

**By end of Arc 2:** Player has earned epithet and established expertise reputation.

---

### Session 101-365+: The Transformation

| Prerequisite | How to Achieve |
|--------------|----------------|
| 100+ investigations | Complete full research cycles |
| 5+ successful mentees | Guide NPCs to completion |
| 1 original methodology | Document your unique approach |
| 3+ community recognitions | Cited by NPCs from different groups |

**Year 1 Ceremony unlocks:**
- Archive Keeper status
- Methodology preserved in world
- Permanent world change (your method teaches future players)

---

## Identity Statement Evolution

**Session 10 (First):**
> "I investigate [DOMAIN] because [REASON]."

Example: *"I investigate financial crimes because I hate hidden power."*

**Session 100 (Expert):**
> "I specialize in [NICHE] because [SPECIFIC EXPERIENCE]."

Example: *"I map offshore networks because 23 FOIA requests taught me that the paper trail always exists."*

**Year 1 (Keeper):**
> "I am a [DOMAIN] specialist, [METRICS], mentor to [N], creator of [METHOD]."

Example: *"I am a financial forensics specialist, 23 FOIA docs, 91% accuracy, mentor to 5, creator of the Delaware Shell Method."*

---

## Epithets (Earned Recognition)

| Epithet | How Earned | Game Effect |
|---------|-----------|-------------|
| **The Persistent** | 10+ dead ends later proved valuable | NPCs trust your hunches |
| **The Connector** | 5+ cross-domain discoveries | Unlock interdisciplinary archives |
| **The Careful** | 95%+ verification rate | Access to sensitive sources |
| **The Generous** | 10+ NPC guidance instances | NPCs share leads proactively |
| **The Fearless** | 3+ risky investigations | Whistleblower network access |
| **The Sharp-Eyed** | Fast pattern recognition | Faster detection bonuses |

---

## Key Metrics to Track

### Per Session
- [ ] Domain focus (primary activity)
- [ ] Documents reviewed
- [ ] FOIA requests filed/responses
- [ ] Cross-references made
- [ ] Patterns identified
- [ ] Hypotheses formed/verified
- [ ] Dead ends encountered
- [ ] NPC interactions (help given/received)

### Accumulated
- [ ] Total investigations completed
- [ ] Accuracy rate (verified/total hypotheses)
- [ ] Domain expertise distribution
- [ ] Mentees guided to success
- [ ] Citations from NPCs
- [ ] Community recognitions

---

## Domain Specializations

| Domain | Key Activities | Expert Title Example |
|--------|---------------|---------------------|
| **Financial Forensics** | FOIA requests, money tracing, SEC filings | "Offshore Pattern Hunter" |
| **Corporate Networks** | Shell mapping, board connections, mergers | "Proxy Web Cartographer" |
| **Environmental Crime** | Violation reports, satellite cross-refs | "Toxic Footprint Tracker" |
| **Political Influence** | Lobbying filings, revolving door tracking | "Influence Archaeologist" |
| **Digital Trails** | Metadata extraction, crypto tracing | "Digital Breadcrumb Reader" |
| **Legal Maze** | Precedent research, case timelines | "Procedural Navigator" |

---

## Ceremony Checklist

### Epiphany Ceremony (Session 10)
- [ ] Trigger: 10 sessions + 1 completed investigation
- [ ] Archive Whisperer invitation sent
- [ ] Session 1-10 timeline generated
- [ ] Player chooses domain
- [ ] First identity statement recorded
- [ ] Deep Archives unlocked
- [ ] Post-ceremony notification shown

### Peer Review Ceremony (Session 100)
- [ ] Trigger: 100 sessions + domain criteria met
- [ ] Multiple NPC invitations sent
- [ ] Top 5 investigations identified
- [ ] NPC testimonials prepared (from actual history)
- [ ] Skeptic challenge dialogue ready
- [ ] Epithet selected (based on behavior)
- [ ] Expert status unlocked
- [ ] Mentorship ability enabled

### Transformation Ceremony (Year 1)
- [ ] Prerequisites tracked throughout
- [ ] Whisperer invitation (player must choose to begin)
- [ ] Full timeline generated (all sessions)
- [ ] Methodology template prepared
- [ ] Apprentice NPCs selected (from mentees)
- [ ] Vow options presented
- [ ] Keeper status granted
- [ ] World changes implemented
- [ ] Legacy assets generated (PDF, timeline, etc.)

---

## Technical Implementation Priority

### Phase 1: Foundation (Weeks 1-2)
1. Session tracking system (activities, metrics)
2. Domain classification (keywords, documents)
3. Basic identity state storage
4. End-of-session summary generation

### Phase 2: Awakening (Weeks 3-4)
1. Milestone detection system
2. Epiphany ceremony framework
3. NPC dialogue integration
4. Deep Archives unlock system

### Phase 3: Specialization (Weeks 5-8)
1. Accumulated metrics dashboard
2. Epithet detection algorithms
3. Peer Review ceremony
4. Mentorship system

### Phase 4: Transformation (Weeks 9-12)
1. Long-term tracking (100+ sessions)
2. Timeline generation
3. Methodology codification
4. Transformation ceremony
5. Permanent world changes

---

## Sample NPC Dialogue Integration

### Recognition Dialogue (Dynamic)
```javascript
// NPC references player's actual history
const recognitionLines = {
  first_meeting: [
    "You're new here, right?",
    "I haven't seen you in the Archives before."
  ],
  seen_work: [
    "You're the one asking about [DOMAIN], right?",
    "I heard you've been digging into [TOPIC]."
  ],
  knows_reputation: [
    "You're [Player], the one who found [FINDING].",
    "Marcus told me about your work on [CASE]."
  ],
  respects_expertise: [
    "I have a [DOMAIN] question—would you take a look?",
    "If anyone knows about [TOPIC], it's you."
  ],
  cites_work: [
    "According to [Player]'s research...",
    "I used [Player]'s method and found..."
  ]
};

// Select based on relationship level
const line = recognitionLines[player.relationship_level][random];
```

---

## Identity Dashboard Mockup

```
┌─────────────────────────────────────────────────────────┐
│  WHO YOU ARE BECOMING                          [?]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Primary Focus:  Financial Forensics    ████████░░ 67%  │
│  Investigations: 47 completed                           │
│  Documents: 156 reviewed                                │
│  Accuracy: 87% (41 verified / 47 tested)               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  "I investigate offshore networks because       │   │
│  │   someone has to follow the buried money."      │   │
│  │                                        —You     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Known As: The Persistent, The Connector               │
│  Mentees: 2 apprentices learning from you              │
│  Citations: 5 researchers have cited your work         │
│                                                         │
│  Arc Progress:                                          │
│  ★ Awakening complete (Session 10)                     │
│  ◐ Specialization (47/100 sessions to expertise)       │
│  ○ Transformation (2/4 prerequisites)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Anti-Patterns to Avoid

### ❌ Don't Do This
- "You gained 50 XP!"
- "Level Up! You're now Level 12!"
- Generic badges for participation
- Same ceremony for every player
- Abstract points with no meaning
- Immediate gratification rewards

### ✅ Do This Instead
- "You found the missing 2019 filing."
- "NPCs are starting to ask YOU questions."
- Specific epithets based on behavior
- Ceremonies reference actual player history
- Metrics tied to real investigative actions
- Recognition delayed until earned

---

## Success Indicators

**Player should feel:**
- "I became someone through what I did"
- "The game remembers my specific choices"
- "NPCs recognize ME, not just a level number"
- "My failures matter as much as my successes"
- "I'm building a reputation, not grinding points"

**Player should NOT feel:**
- "I'm just collecting XP"
- "This ceremony is the same for everyone"
- "My actions don't matter to the world"
- "I need to grind to progress"
- "The recognition feels unearned"

---

## Summary Files Created

1. **`investigator-identity-arc.md`** — Full arc system design
2. **`investigator-session-tracking.md`** — Technical implementation guide
3. **`investigator-ceremony-design.md`** — Detailed ceremony scripts
4. **`investigator-quick-reference.md`** — This file (quick reference)

---

## Next Steps

1. **Review** all four documents
2. **Prioritize** Phase 1 implementation (tracking system)
3. **Prototype** session data collection
4. **Test** milestone detection with sample data
5. **Build** Epiphany ceremony first (it's the foundation)
6. **Iterate** based on player feedback

---

> *"You are not a level. You are a living archive of every question you dared to ask."*
