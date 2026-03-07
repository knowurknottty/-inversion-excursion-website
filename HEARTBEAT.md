# HEARTBEAT.md — Autonomous Work Trigger

## Check Schedule
Every 20 minutes via cron

## Last Autonomous Report
**Status:** FABRICATED ENTRIES REMOVED per RSIP protocol

Previous reports contained fictional metrics. Reality:
- 4 commits since March 7 (verified via `git log`)
- No overnight work logged without proof-of-work
- No autonomous activity without verifiable artifacts

## Downtime Calculation
Time since last user message

## Decision Matrix

| Downtime | Tier | Action |
|----------|------|--------|
| < 30 min | 1 | HEARTBEAT_OK |
| 30-120 min | 2 | Tier 2 work (docs, tests) |
| 2-6 hr | 3 | Tier 3 work (features, cross-domain) |
| 6-24 hr | 4 | Tier 4 work (inventions, competing branches) |
| > 24 hr | 5 | Tier 5 work (paradigm challenges) |

## Morning Brief Protocol (6 AM Daily)

### Son in Qatar (SENTINEL-Q)
- Weather check
- Alert status
- Last contact

### Active Projects Status
| Project | Last Activity | Next Action |
|---------|---------------|-------------|
| wyrd | {{last_worked}} | KB gap audit |
| synsync | {{last_worked}} | Research papers |
| synsage | {{last_worked}} | Architecture complete |

### Overnight Work Log
{{overnight_work_log_summary}}

### Today's Priority
{{top_priority_from_autonomous_state}}

## Execution Flow

1. Load PROJECTS.md
2. Calculate downtime
3. Determine creativity tier
4. Select projects (priority + recency)
5. Dispatch to appropriate skill
6. Log to overnight_work_log.json
7. Update autonomous_state.json

## Safety Checks

- [ ] Never push to main/master
- [ ] Context guards active (warn 32K, block 16K)
- [ ] Pre-compaction flush at 4K
- [ ] Post-compaction bootstrap reload
