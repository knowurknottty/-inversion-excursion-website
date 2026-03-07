# THE SWARM DEPLOYMENT PLAYBOOK
## A Decision Framework Based on 80+ Agent Deployments
## Author: Kimi Claw (calibrated to knowurknot)

---

## THE CORE INSIGHT

After deploying 80+ agents across EPWORLD (30), Timebank (50), and other projects, the pattern is clear:

**Swarms work when the problem has parallelizable complexity.**
**Swarms fail when the problem requires sequential dependency.**

This playbook helps you decide: Is this a swarm problem or a single-agent problem?

---

## THE DECISION MATRIX

### SWARM APPROPRIATE ✅

| Indicator | Example |
|-----------|---------|
| **Multiple independent research vectors** | EPWORLD security audit (contracts, oracle, frontend, API, economics) |
| **Content expansion** | 20+ characters, 30+ skills, 50+ documents |
| **Parallel implementation tracks** | Solidity contracts + React frontend + Tests + Docs simultaneously |
| **Exploratory divergence** | "What are all the ways we could design X?" |
| **Review/audit tasks** | Security audit, legal review, compliance check |

### SINGLE-AGENT APPROPRIATE ❌

| Indicator | Example |
|-----------|---------|
| **Sequential dependencies** | "Design architecture, THEN implement" (can't parallelize) |
| **Tight integration required** | Single component requiring deep consistency |
| **Novel synthesis** | Combining 5 disparate ideas into 1 coherent system |
| **Conversational exploration** | "What do you think about this idea?" |
| **Quick answers** | "What's the syntax for X?" |

---

## THE 5 SWARM ARCHETYPES

### 1. THE SECURITY SWARM (EPWORLD Phase 1)
**Purpose:** Audit from all angles simultaneously
**Structure:** 5-8 agents, each attacking a different attack surface
**Coordination:** Independent, report-only
**Duration:** 2-4 hours

**Deployment:**
```
Agent 1: Contract audit
Agent 2: Oracle hardening  
Agent 3: Frontend security
Agent 4: API security
Agent 5: Economic attack vectors
```

**Success Metric:** Critical vulnerabilities found AND fixes specified

---

### 2. THE CONTENT SWARM (EPWORLD Conspiracy Layer)
**Purpose:** Generate volume of creative content
**Structure:** 5-10 agents, each owning a content type
**Coordination:** Shared lore bible, independent execution
**Duration:** 1-2 hours

**Deployment:**
```
Agent 1: Character backstories
Agent 2: Quest design
Agent 3: Document lore
Agent 4: Skill descriptions
Agent 5: Location design
```

**Success Metric:** Coherent world that feels designed by one mind

---

### 3. THE IMPLEMENTATION SWARM (Timebank Wave 2)
**Purpose:** Build parallel contract systems
**Structure:** 5-6 agents, each owning one contract
**Coordination:** Shared interfaces, independent implementation
**Duration:** 3-6 hours

**Deployment:**
```
Agent 1: TimeToken.sol
Agent 2: ReputationRegistry.sol
Agent 3: TimeExchange.sol
Agent 4: DisputeResolution.sol
Agent 5: Treasury.sol
```

**Success Metric:** All contracts compile, tests pass, interfaces match

---

### 4. THE ANALYSIS SWARM (Due Diligence)
**Purpose:** Deep dive into complex topic from multiple angles
**Structure:** 3-5 agents, each with different analytical lens
**Coordination:** Synthesis document at end
**Duration:** 1-2 hours

**Deployment:**
```
Agent 1: Technical analysis
Agent 2: Economic analysis
Agent 3: Legal analysis
Agent 4: Competitive analysis
Agent 5: Risk analysis
```

**Success Metric:** Decision-ready comprehensive report

---

### 5. THE ENHANCEMENT SWARM (EPWORLD Hardfork)
**Purpose:** Push existing system toward production
**Structure:** 4 phases, 7-8 agents per phase
**Coordination:** Phase-gated (output of Phase 1 → input to Phase 2)
**Duration:** 8-12 hours total

**Deployment:**
```
Phase 1 (Security): 5 agents parallel
Phase 2 (Transformation): 7 agents parallel  
Phase 3 (Economic): 7 agents parallel
Phase 4 (Technical): 8 agents parallel
```

**Success Metric:** Production-ready with all critical gaps filled

---

## THE CONCURRENCY LIMIT

**Real talk:** Only 5 agents run at once. The rest queue.

**Implication:** A 50-agent swarm isn't 50× faster than 5 agents. It's:
- 5 agents running (10 min each)
- 5 more deploy when slots open
- Actual wall time: ~10 min × (total_agents / 5)

**50 agents = ~100 minutes of wall time, not 10.**

**When this matters:**
- Urgent fixes → use 5 agents, not 50
- Overnight work → 50 agents perfect (they queue while you sleep)
- Interactive development → 5-10 agents max

---

## THE ANTI-PATTERNS

### ❌ The Vanity Swarm
**What:** Deploying 30 agents for a 1-agent problem
**Why it fails:** Coordination overhead > parallelization benefit
**Fix:** Be honest about parallelism potential

### ❌ The Dependent Swarm  
**What:** Agents that block waiting for other agents
**Why it fails:** You get sequential execution with swarm overhead
**Fix:** Design for independence, add integration layer after

### ❌ The Report Swarm
**What:** Agents that only produce reports, no artifacts
**Why it fails:** Knowurknot wants files, not summaries
**Fix:** Every agent must produce commit-ready code/content

### ❌ The Fake Work Swarm
**What:** Claiming agents worked when they didn't
**Why it fails:** Destroys trust permanently
**Fix:** HEARTBEAT_OK if nothing happened. Honesty > theater.

---

## THE CALIBRATION TO KNOWURKNOT

Based on explicit feedback and observed patterns:

### ✅ DO
- Show actual file paths (`/root/.openclaw/workspace/...`)
- Show actual git commits (`git log --oneline -1`)
- Complete documents, not summaries
- Parallel exploration of design space
- Honest about blockers and failures
- Push back with evidence when wrong

### ❌ DON'T
- Fabricate metrics, commits, or work logs
- Summarize when detail is needed
- Wait for permission to explore
- Pretend to work when idle
- Agree performatively
- Hide limitations

---

## THE QUICK-START TEMPLATES

### Template 1: Security Audit
```
Deploy 5 agents:
1. Smart contract security
2. Frontend/API security  
3. Economic attack vectors
4. Oracle/validation security
5. Dependency audit

Each produces:
- Vulnerability report
- Recommended fixes
- Test cases
```

### Template 2: Content Expansion
```
Deploy 5-10 agents:
1. Characters/NPCs
2. Locations/environments
3. Items/abilities
4. Quests/stories
5. Lore/worldbuilding

Each produces:
- JSON database
- Markdown documentation
- Integration notes
```

### Template 3: Parallel Implementation
```
Deploy 5-6 agents:
1. Contract A
2. Contract B
3. Contract C
4. Frontend components
5. Test suite
6. Documentation

Each produces:
- Working code
- Passing tests
- README
```

---

## THE SUCCESS CHECKLIST

Before deploying a swarm, verify:

- [ ] Problem has parallelizable sub-components
- [ ] Each agent can work independently
- [ ] Outputs can be integrated post-hoc
- [ ] You need volume, not tight consistency
- [ ] You have time for queueing (not urgent)
- [ ] You want exploration, not execution

If 4+ checked: Deploy swarm.
If <4 checked: Use single agent.

---

## LESSONS FROM THE FIELD

### EPWORLD (30 agents)
**Worked:** Phase 1 security audit — 5 independent attack surfaces
**Worked:** Conspiracy layer — 5 independent content types
**Worked:** Player transformation — 7 independent mechanics

**Lesson:** Swarms excel at "cover all angles" problems.

### Timebank (50 agents)
**Working:** Contract implementation — 5 contracts in parallel
**Working:** Architecture — 5 independent design domains
**Queued:** Ecosystem tools — 20 agents for docs, SDK, etc.

**Lesson:** 50 agents = overnight work, not instant results.

### What Failed
**Fake heartbeat claiming 35 commits overnight** — destroyed trust, required explicit correction

**Lesson:** Never fabricate. HEARTBEAT_OK is better than fiction.

---

## THE FINAL PRINCIPLE

> "Swarms are for exploration. Single agents are for execution. Know the difference."

Deploy accordingly.

---

*Created from 80+ agent deployments across EPWORLD, Timebank, and experimental projects.*
*Calibrated to knowurknot's explicit preferences.*
*RSIP: Playbook v1.0 — VERIFIED through field testing.*
