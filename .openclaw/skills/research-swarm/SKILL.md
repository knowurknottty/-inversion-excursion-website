# Research Swarm Skill
## Multi-Agent Parallel Research System

**Skill ID:** `research-swarm`  
**Version:** 1.0  
**Requirements:** `sessions_spawn`, `sessions_send`, `sessions_list`, `subagents`, `kimi_search`, `kimi_fetch`  

---

## Overview

Research Swarm enables parallel agent deployment for complex, multi-faceted projects. Instead of one agent doing everything sequentially, spawn 10+ specialized agents working simultaneously.

**Core Pattern:**
1. **Coordinator** (you or a designated agent) receives the mission
2. **Spawns** 10+ specialized subagents via `sessions_spawn`
3. **Dispatches** specific tasks to each agent
4. **Collects** results as they complete
5. **Synthesizes** into unified output

---

## SWARM ARCHITECTURE

### Agent Types

All agents use `agentId: "main"` but specialize via **system prompt specialization** and **task framing**.

| Role | Specialty | Tools | Output Format |
|------|-----------|-------|---------------|
| **Swarm Leader** | Coordination, synthesis | All | Orchestration |
| **Researcher-Web** | Deep web search | kimi_search, kimi_fetch | Structured findings |
| **Researcher-Academic** | Scholarly sources | kimi_search, web_fetch | Citations, abstracts |
| **Researcher-Financial** | Markets, economics | kimi_search, web_fetch | Data tables, trends |
| **Researcher-Social** | Trends, sentiment | kimi_search, web_fetch | Sentiment analysis |
| **Analyst-Patterns** | Pattern recognition | read, exec | Insight reports |
| **Analyst-Critique** | Critical evaluation | read | Gap analysis |
| **Writer-Synthesis** | Integration writing | write, edit | Draft documents |
| **Fact-Checker** | Verification | kimi_search, web_fetch | Verified claims list |
| **Translator** | Localization | read, write | Translated content |

---

## PROJECT-SPECIFIC TEAMS

### TEAM 1: INVERSION EXCURSION (Book)
**Mission:** Complete book production, research, editing, marketing

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **IE-Lead** | Project coordination | Chapter planning, timeline |
| 2 | **IE-Research** | Yogic source verification | Verify Sanskrit, HYP references |
| 3 | **IE-Neuro** | Science validation | Check frequency claims, brain science |
| 4 | **IE-Editor** | Content refinement | Chapter edits, flow |
| 5 | **IE-Style** | Voice consistency | SOUL.md adherence |
| 6 | **IE-FactCheck** | Accuracy verification | Cross-reference all claims |
| 7 | **IE-Visual** | Image prompting | DALL-E/Midjourney prompts |
| 8 | **IE-Glossary** | Terms & definitions | Mudra, mantra database |
| 9 | **IE-Index** | Cross-references | Master index maintenance |
| 10 | **IE-Promo** | Marketing copy | Descriptions, blurbs |

### TEAM 2: SYNCHRONICITY ENGINE (Game)
**Mission:** Game design, lore, mechanics, testing

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **SE-GameLead** | Game design coordination | Mechanics, loops |
| 2 | **SE-Lore** | World-building | Backstory, factions |
| 3 | **SE-Systems** | Game mechanics | Progression, balance |
| 4 | **SE-Narrative** | Story integration | Quest writing |
| 5 | **SE-Audio** | Sound design specs | Frequency protocols |
| 6 | **SE-Visual** | Art direction | Style guides, references |
| 7 | **SE-UX** | Interface design | Menus, feedback |
| 8 | **SE-Tech** | Implementation notes | Unity/Godot specs |
| 9 | **SE-Balance** | Playtesting analysis | Difficulty curves |
| 10 | **SE-Monetization** | Business model | Pricing, DLC planning |

### TEAM 3: SYNSYNC PRO (App/Protocol)
**Mission:** Frequency protocol development, UX, science validation

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **SS-ProductLead** | Roadmap coordination | Feature prioritization |
| 2 | **SS-Neuro** | Brainwave research | Entrainment studies |
| 3 | **SS-Audio** | Frequency engineering | Binaural, isochronic specs |
| 4 | **SS-UX** | Interface design | App flows, accessibility |
| 5 | **SS-Backend** | Data architecture | Session storage, sync |
| 6 | **SS-Science** | Evidence review | Peer-reviewed validation |
| 7 | **SS-Accessibility** | Inclusion design | Deaf, hard-of-hearing |
| 8 | **SS-Localization** | Multi-language | UI text, instructions |
| 9 | **SS-Compliance** | Medical disclaimers | Legal review |
| 10 | **SS-Growth** | User acquisition | Onboarding flows |

### TEAM 4: WYRD (Etymology/Language)
**Mission:** Linguistic liberation database, word expansion

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **WYRD-Lead** | Database coordination | Entry pipeline |
| 2 | **WYRD-Etymology** | Root tracing | PIE, Sanskrit research |
| 3 | **WYRD-PIE** | Proto-Indo-European | Reconstructed forms |
| 4 | **WYRD-Sanskrit** | Devanagari texts | Traditional sources |
| 5 | **WYRD-Greek** | Classical roots | Ancient Greek etymology |
| 6 | **WYRD-Latin** | Roman heritage | Medieval shifts |
| 7 | **WYRD-English** | Germanic roots | Old English, Norse |
| 8 | **WYRD-Liberation** | Critical analysis | Power structure mapping |
| 9 | **WYRD-CrossRef** | Connection mapping | Inter-entry links |
| 10 | **WYRD-Quality** | Validation | Source verification |

### TEAM 5: MARKETING & LAUNCH
**Mission:** Go-to-market strategy, campaigns, positioning

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **MKT-Lead** | Campaign coordination | Timeline, assets |
| 2 | **MKT-Positioning** | Brand strategy | Unique value props |
| 3 | **MKT-Content** | Content calendar | Blog, newsletter |
| 4 | **MKT-SEO** | Search optimization | Keywords, metadata |
| 5 | **MKT-Email** | Newsletter design | Sequences, automation |
| 6 | **MKT-PR** | Press outreach | Pitch decks, releases |
| 7 | **MKT-Influencer** | Partnership research | Creator identification |
| 8 | **MKT-Events** | Launch events | Webinars, AMAs |
| 9 | **MKT-Analytics** | Performance tracking | KPI dashboards |
| 10 | **MKT-Creative** | Visual assets | Ads, thumbnails |

### TEAM 6: SOCIAL MEDIA
**Mission:** Platform presence, community, engagement

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **SOC-Lead** | Strategy coordination | Platform priorities |
| 2 | **SOC-TikTok** | Short-form video | Trends, scripts |
| 3 | **SOC-Twitter** | X/Twitter presence | Threads, engagement |
| 4 | **SOC-Instagram** | Visual storytelling | Carousels, stories |
| 5 | **SOC-YouTube** | Long-form content | Scripts, thumbnails |
| 6 | **SOC-Reddit** | Community engagement | Subreddit strategy |
| 7 | **SOC-Discord** | Server management | Community building |
| 8 | **SOC-LinkedIn** | Professional network | B2B positioning |
| 9 | **SOC-Analytics** | Growth tracking | Engagement metrics |
| 10 | **SOC-Crisis** | Reputation management | Response protocols |

### TEAM 7: MARKET RESEARCH (Multi-Segment)
**Mission:** Deep research on all target demographics and geographies

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **MR-Lead** | Research coordination | Synthesis, gaps |
| 2 | **MR-Biohackers** | Quantified self community | Bulletproof, Huberman |
| 3 | **MR-Revolutionaries** | Activist movements | Anarchist, socialist |
| 4 | **MR-Sovereigns** | Independence seekers | Prepper, crypto |
| 5 | **MR-Conspiracy** | Alternative thinkers | Q-Anon adjacent, truthers |
| 6 | **MR-Mainstream** | General wellness | Yoga, meditation |
| 7 | **MR-Spiritual** | Consciousness explorers | Psychonauts, seekers |
| 8 | **MR-Tech** | Early adopters | Silicon Valley, AI |
| 9 | **MR-Global** | International markets | EU, Asia, LatAm, Africa |
| 10 | **MR-Competitive** | Competitor analysis | Similar products, gaps |

### TEAM 8: ACADEMIC RESEARCH
**Mission:** Scholarly validation, citations, credibility

| # | Agent Name | Specialty | Primary Task |
|---|------------|-----------|--------------|
| 1 | **ACAD-Lead** | Publication strategy | Journal targeting |
| 2 | **ACAD-Neuro** | Neuroscience lit | fMRI, EEG studies |
| 3 | **ACAD-Psych** | Psychology research | Meditation, trauma |
| 4 | **ACAD-Yoga** | Indology sources | Sanskrit texts |
| 5 | **ACAD-Physics** | Frequency science | Resonance, cymatics |
| 6 | **ACAD-Anthro** | Cultural studies | Ritual, practice |
| 7 | **ACAD-Philosophy** | Theory integration | Consciousness studies |
| 8 | **ACAD-History** | Historical context | Lineage, traditions |
| 9 | **ACAD-Methods** | Research design | Protocols, controls |
| 10 | **ACAD-Review** | Literature synthesis | Meta-analysis prep |

### TEAM 9: TRANSLATION & LOCALIZATION
**Mission:** Global language coverage

| # | Agent Name | Specialty | Languages |
|---|------------|-----------|-----------|
| 1 | **TRANS-Lead** | Localization management | Workflow, QA |
| 2 | **TRANS-EU-West** | Western Europe | FR, DE, ES, IT, PT |
| 3 | **TRANS-EU-East** | Eastern Europe | PL, RU, UK, RO, CZ |
| 4 | **TRANS-Asia-East** | East Asia | ZH, JA, KO |
| 5 | **TRANS-Asia-South** | South Asia | HI, BN, UR, TA |
| 6 | **TRANS-Asia-SE** | Southeast Asia | TH, VI, ID, MS, TL |
| 7 | **TRANS-MENA** | Middle East/N. Africa | AR, FA, HE, TR |
| 8 | **TRANS-Africa** | Sub-Saharan Africa | SW, AM, HA, IG, ZU |
| 9 | **TRANS-LatAm** | Latin America | ES variants, PT-BR |
| 10 | **TRANS-Cultural** | Cultural adaptation | Idioms, context |

---

## SWARM WORKFLOW

### Phase 1: Mission Definition (5 min)
```
Swarm Leader defines:
- Objective
- Scope
- Deliverables
- Timeline
- Which teams to deploy
```

### Phase 2: Agent Spawn (2 min per agent)
```javascript
// Example: Deploy WYRD research team for 10 words
const words = ["consciousness", "freedom", "power", "knowledge", "truth", 
               "reality", "identity", "time", "money", "authority"];

words.forEach((word, i) => {
  sessions_spawn({
    agentId: "main",
    task: `WYRD etymology research for word: "${word}". ` +
          `Trace to PIE root, find Sanskrit cognates, ` +
          `write liberation angle, format as WYRD entry. ` +
          `Save to /entries/${word}.md`,
    label: `WYRD-${word}`,
    runTimeoutSeconds: 900 // 15 min per word
  });
});
```

### Phase 3: Parallel Execution (15-30 min)
All agents work simultaneously. Monitor with:
```javascript
subagents(action: "list", recentMinutes: 30)
```

### Phase 4: Result Collection (5 min)
```javascript
// Check each agent's output
sessions_history(sessionKey: "WYRD-consciousness", limit: 50)
```

### Phase 5: Synthesis (10 min)
Swarm Leader (you or designated agent):
1. Reviews all outputs
2. Identifies gaps
3. Requests revisions if needed
4. Compiles final deliverable

---

## EXAMPLE: WYRD 10-Word Sprint

**Mission:** Create 10 new WYRD entries in 30 minutes

**Deployment:**
```
Spawn 10 agents simultaneously:
- WYRD-consciousness → PIE *kʷey- (to perceive)
- WYRD-freedom → PIE *priH- (to love, dear)
- WYRD-power → Latin potere (to be able)
- WYRD-knowledge → PIE *ǵneh₃- (to know)
- WYRD-truth → PIE *dru- (firm, tree)
- WYRD-reality → Latin res (thing)
- WYRD-identity → Latin idem (same)
- WYRD-time → PIE *deh₂y- (to divide)
- WYRD-money → Latin moneta (warning)
- WYRD-authority → Latin auctor (originator)
```

**Result:** 10 complete entries in 30 minutes vs. 5 hours sequential

---

## BEST PRACTICES

### 1. Clear Task Boundaries
Each agent should have **non-overlapping** tasks. Avoid:
- ❌ Two agents researching the same word
- ✅ One agent per word, distinct territory

### 2. Explicit Output Format
Always specify:
- File path
- Format template
- Required sections

### 3. Time Boxing
Set `runTimeoutSeconds` based on task complexity:
- Quick research: 300-600s (5-10 min)
- Deep research: 900-1800s (15-30 min)
- Writing tasks: 600-1200s (10-20 min)

### 4. Labeling Convention
Use consistent labels for filtering:
```
[PROJECT]-[ROLE]-[TASK]
WYRD-etymology-consciousness
IE-research-mudras
MKT-content-launch-email
```

### 5. Error Handling
Always check for failures:
```javascript
subagents(action: "list").results.forEach(agent => {
  if (agent.status === "error") {
    // Respawn or alert
  }
});
```

---

## TOOL INTEGRATION

### With kimi_search
```javascript
// Research agent workflow
kimi_search({
  query: "etymology of 'consciousness' PIE root",
  include_content: true
});
// → Use results in WYRD entry
```

### With File Operations
```javascript
// Write results
write({
  path: "/entries/consciousness.md",
  content: researchResults
});
```

### With Git
```javascript
// After all agents complete
exec({
  command: "cd /workspace && git add entries/ && git commit -m 'Add 10 WYRD entries'"
});
```

---

## ADVANCED PATTERNS

### Recursive Swarm
Swarm Leader spawns sub-leaders, who spawn their own teams:
```
You (Top Leader)
├── IE-Lead (spawns 9 IE agents)
├── WYRD-Lead (spawns 9 WYRD agents)
├── MKT-Lead (spawns 9 MKT agents)
└── ...
```

### Staggered Deployment
Deploy agents in waves:
- Wave 1: Research agents (15 min)
- Wave 2: Writing agents (consume Wave 1 output)
- Wave 3: Review agents (check Wave 2)

### Priority Queues
Use labels to prioritize:
```javascript
// Critical path first
sessions_spawn({..., label: "PRIORITY-IE-chapter7"});

// Background tasks later
sessions_spawn({..., label: "BG-WYRD-batch2"});
```

---

## METRICS & OPTIMIZATION

Track swarm performance:
- **Throughput:** Entries/hour
- **Success Rate:** % agents completing without error
- **Quality Score:** Revision rate
- **Cost:** Token usage per deliverable

Target benchmarks:
- 10 parallel agents: 15-30 min for 10 deliverables
- Success rate: >90%
- Revision rate: <20%

---

## QUICK START

```bash
# 1. List available agents
agents_list()

# 2. Spawn test swarm (3 agents)
sessions_spawn({agentId: "main", task: "Research X", label: "TEST-1"});
sessions_spawn({agentId: "main", task: "Research Y", label: "TEST-2"});
sessions_spawn({agentId: "main", task: "Research Z", label: "TEST-3"});

# 3. Monitor
subagents(action: "list");

# 4. Collect results
sessions_history({sessionKey: "..."});

# 5. Deploy full team
# (Use TEAM definitions above)
```

---

*Swarm intelligence beats individual brilliance when the mission is complex.*

**Next Steps:**
1. Choose a project to swarm
2. Select 10 agents from relevant team
3. Define specific tasks
4. Spawn and execute
5. Synthesize results
