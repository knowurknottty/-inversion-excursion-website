# Research Swarm - Quick Reference Card

## ONE-LINE COMMANDS

```bash
# List all active agents
subagents(action: "list")

# Spawn single agent
sessions_spawn({agentId: "main", task: "Research X", label: "TEST"});

# Check agent status
sessions_list(kinds: ["subagent"], activeMinutes: 30);

# Get agent output
sessions_history(sessionKey: "LABEL-HERE", limit: 50);
```

## TEAM ROSTER (10 Each)

| Team | Agents | Primary Output |
|------|--------|----------------|
| **IE-Book** | Lead, Research, Neuro, Editor, Style, FactCheck, Visual, Glossary, Index, Promo | Complete book |
| **SE-Game** | Lead, Lore, Systems, Narrative, Audio, Visual, UX, Tech, Balance, Monetization | Game design doc |
| **SS-Pro** | Lead, Neuro, Audio, UX, Backend, Science, Access, Local, Compliance, Growth | App specs |
| **WYRD** | Lead, Etymology, PIE, Sanskrit, Greek, Latin, English, Liberation, CrossRef, Quality | Entry database |
| **MKT** | Lead, Positioning, Content, SEO, Email, PR, Influencer, Events, Analytics, Creative | Campaigns |
| **SOC** | Lead, TikTok, Twitter, Instagram, YouTube, Reddit, Discord, LinkedIn, Analytics, Crisis | Social presence |
| **MR** | Lead, Biohackers, Revolutionaries, Sovereigns, Conspiracy, Mainstream, Spiritual, Tech, Global, Competitive | Market profiles |
| **ACAD** | Lead, Neuro, Psych, Yoga, Physics, Anthro, Philosophy, History, Methods, Review | Scholarly validation |
| **TRANS** | Lead, EU-West, EU-East, Asia-East, Asia-South, Asia-SE, MENA, Africa, LatAm, Cultural | Localized content |

## SPAWN PATTERNS

### Pattern A: Simultaneous (8 max)
```javascript
// Spawn 8 at once
for (let i = 1; i <= 8; i++) {
  sessions_spawn({agentId: "main", task: `Task ${i}`, label: `AGENT-${i}`});
}
```

### Pattern B: Staggered (10+)
```javascript
// Spawn 8, then 2 more as slots open
const wave1 = [1,2,3,4,5,6,7,8].map(i => 
  sessions_spawn({agentId: "main", task: `Task ${i}`, label: `W1-${i}`})
);
// Wait 10 min, check completions, spawn wave 2
const wave2 = [9,10].map(i => 
  sessions_spawn({agentId: "main", task: `Task ${i}`, label: `W2-${i}`})
);
```

### Pattern C: Pipeline
```javascript
// Research → Write → Review
sessions_spawn({task: "Research X", label: "R-X"});
// (After R-X completes)
sessions_spawn({task: "Write using research X", label: "W-X"});
// (After W-X completes)
sessions_spawn({task: "Review written X", label: "REV-X"});
```

## LABELING SYSTEM

```
[PROJECT]-[TYPE]-[IDENTIFIER]

Examples:
WYRD-entry-consciousness
IE-chapter8-opening
MR-segment-biohackers
MKT-campaign-launch
TRANS-zh-CN-chapter1
```

## TIMEOUT GUIDELINES

| Task Type | Timeout | Label Prefix |
|-----------|---------|--------------|
| Quick search | 300s (5m) | Q- |
| Deep research | 900s (15m) | R- |
| Writing | 1200s (20m) | W- |
| Editing | 600s (10m) | E- |
| Review | 300s (5m) | REV- |
| Translation | 900s (15m) | T- |

## COMMON ISSUES

**Issue: Agent stuck**
```javascript
subagents(action: "kill", target: "STUCK-LABEL");
// Respawn with adjusted task
```

**Issue: Need to steer**
```javascript
sessions_send(sessionKey: "AGENT-LABEL", message: "New direction: focus on X");
```

**Issue: Check all results**
```javascript
// Get list of recent subagents
const agents = subagents(action: "list", recentMinutes: 60);
// Loop through and get history
agents.forEach(a => sessions_history({sessionKey: a.sessionKey, limit: 100}));
```

## SUCCESS METRICS

- **10 agents × 15 min = 150 person-minutes of work**
- **Sequential would take 150 minutes (2.5 hours)**
- **Parallel takes 15 minutes**
- **10x speedup**

---

*Swarm mode: ON*
