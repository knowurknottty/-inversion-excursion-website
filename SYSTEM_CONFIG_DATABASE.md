# System Configuration Database
## KimiClaw Runtime Environment — Updated 2026-03-06

---

## OpenClaw Core

**Version:** 2026.2.15 (CLI shows 2026.3.2)  
**Config Path:** `~/.openclaw/openclaw.json`  
**Status:** ✅ Valid, operational

### Models Configured
| Provider | Models | Purpose |
|----------|--------|---------|
| **kimi-coding** | k2p5 (262K context) | Primary reasoning |
| **ollama** | phi4-mini (32K context) | Fast/cheap inference |
| **ollama** | nomic-embed-text | Local embeddings |

### Safety Settings
- **ContextWindow:** 262,144 tokens (bug #17404 workaround)
- **Compaction:** safeguard mode
- **MaxConcurrent:** 4 agents
- **SubagentMax:** 8 concurrent

---

## Local AI Infrastructure (NEW)

### Ollama Installation
**Status:** ✅ Running on systemd  
**Endpoint:** `http://127.0.0.1:11434`  
**Models:**
- `nomic-embed-text:latest` — Zero-cost embeddings
- `phi4-mini:latest` — Fast inference fallback

**Purpose:** Eliminate API costs for embeddings and lightweight tasks

---

## Autonomous-Dev Skill System (NEW)

### Architecture
```
HEARTBEAT (20min) → Downtime → Tier → Project → Skill → Subagent → Git
```

### Core Modules
| File | Function |
|------|----------|
| `creativity-scaler.ts` | Tier 1-5 computation, invention protocols |
| `project-scheduler.ts` | Project selection, task scheduling |
| `git-branch-manager.ts` | Branch ops, commits, logging |

### Subagent Roles (BMAD)
| Role | Soul | Scope |
|------|------|-------|
| **pm** | `souls/pm.md` | Requirements, tickets |
| **dev** | `souls/dev.md` | Implementation |
| **qa** | `souls/qa.md` | Testing |
| **researcher** | `souls/researcher.md` | Academic research |
| **kb** | `souls/kb-builder.md` | Knowledge base |

### Documentation
- `SKILL.md` — Main orchestrator
- `SUBAGENT_ROLES.md` — Role definitions
- `CONTEXT_GUARDS.md` — Safety limits

**Location:** `~/.openclaw/skills/autonomous-dev/`

---

## State Persistence (NEW)

### Memory Files
| File | Purpose |
|------|---------|
| `MEMORY.md` | Human-readable persistent state |
| `PROJECTS.md` | Project registry with priorities |
| `HEARTBEAT.md` | Idle detection protocol |
| `~/.openclaw/memory/autonomous_state.json` | Machine-readable task state |
| `~/.openclaw/memory/overnight_work_log.json` | Work logging |

### Compaction Resilience
- **Pre-flush:** At 4K tokens remaining
- **Post-bootstrap:** Reload from memory files
- **Announcement:** "♻️ Context compacted and reloaded"

---

## SynSage (COMPLETED)

**Repository:** https://github.com/knowurknottty/Synsage  
**Status:** ✅ Complete architecture committed

### Documents
| File | Purpose | Size |
|------|---------|------|
| `ONTOLOGY.md` | Universal schema, 8 modalities | 7.5KB |
| `KNOWLEDGE_GRAPH.md` | Interventions, correspondences | 9.7KB |
| `SIMULATION_ENGINE.md` | Time-evolution dynamics | 8.1KB |

**Total:** 25KB portable AI genome

---

## WYRD (COMPLETED)

**Status:** ✅ 280+ entries created  
**Tokens:** 3.5M+ processed  
**Location:** `~/wyrd-consolidated/`

---

## Active Projects (from PROJECTS.md)

| Project | Priority | Status | Type |
|---------|----------|--------|------|
| **synsage** | 0.95 | ✅ Complete | neurotechnology |
| **synsync** | 0.95 | active | neurotechnology |
| **inversion-excursion** | 0.9 | active | creative |
| **wyrd** | 0.8 | ✅ Complete | knowledge-base |
| **autonomous-dev** | 1.0 | ✅ Built | infrastructure |
| **matryoshka** | 0.7 | ✅ Complete | creative |

---

## Git Configuration

**Workspace:** `~/kimi-claw-workspace`  
**Remote:** https://github.com/knowurknottty/kimi-claw-workspace  
**Branch:** master  
**Commits ahead:** 3

### Safety Rules
- Never push to main/master/production
- Local commits only (allowPush: false)
- Branch naming: `feature/auto-*`, `wip/auto-*`, `experiment/a-*`

---

## Cost Optimization (NEW)

| Tier | Model | Cost |
|------|-------|------|
| Primary | Kimi K2.5 | Standard |
| Fast/Heartbeat | phi4-mini (local) | $0 |
| Embeddings | nomic-embed-text (local) | $0 |

**Estimated savings:** 60-90% on embeddings + lightweight tasks

---

## What's New Today (2026-03-06)

### 1. Ollama Local AI
- Self-hosted phi4-mini and nomic-embed-text
- Zero-cost embeddings and fast inference
- Fallback for rate limits

### 2. Autonomous-Dev Skill System
- Complete 3-module TypeScript architecture
- 5 specialized subagent roles with SOUL files
- Creativity tier scaling (1-5)
- Project scheduling and git automation

### 3. State Persistence
- MEMORY.md structured format
- autonomous_state.json machine-readable state
- overnight_work_log.json work tracking
- Compaction resilience protocol

### 4. SynSage Completed
- Full diagnostic engine architecture
- Knowledge graph with interventions
- Simulation engine for predictive health
- Committed to GitHub

### 5. Configuration Hardening
- Valid OpenClaw config with Ollama provider
- Context guards (warn 32K, block 16K)
- Workspace and project registry

---

## Next Capabilities (When Activated)

1. **Heartbeat autonomous work** — Triggered every 20 min during idle
2. **Creativity tier scaling** — More experimental work with longer idle
3. **Subagent dispatch** — PM → Dev → QA pipeline
4. **Morning briefs** — 6 AM daily status reports
5. **Automatic git commits** — Local branches with work logging

---

## System Status

| Component | Status |
|-----------|--------|
| OpenClaw Gateway | ✅ Running (port 18789) |
| Ollama Service | ✅ Running (port 11434) |
| Kimi API | ✅ Connected |
| Git Remote | ✅ Push enabled |
| Memory System | ✅ File-based active |
| Autonomous-Dev | ✅ Built, ready to activate |

---

*Last updated: 2026-03-06 12:20 GMT+8*
