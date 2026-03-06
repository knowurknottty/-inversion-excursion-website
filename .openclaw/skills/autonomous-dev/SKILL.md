# Skill: autonomous-dev
# Version: 1.0
# Trigger: HEARTBEAT.md, manual invocation, cron

## Purpose
Autonomous development orchestrator that works during idle time. Scales creativity with downtime duration, manages multiple projects, delegates to specialized subagents, and maintains complete state across sessions.

## Architecture

```
┌─────────────────────────────────────────┐
│           HEARTBEAT / CRON              │
│        (Every 20 minutes)               │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        DOWNTIME CALCULATION             │
│    Time since last user message         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      CREATIVITY TIER DETECTION          │
│   Tier 1-5 based on idle duration       │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       PROJECT SELECTION                 │
│   Priority + recency from PROJECTS.md   │
└─────────────────┬───────────────────────┘
                  ↓
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
┌───────┐   ┌──────────┐  ┌──────────┐
│kb-    │   │research  │  │creative  │
│builder│   │crawler   │  │dev       │
└───┬───┘   └────┬─────┘  └────┬─────┘
    └─────────────┴─────────────┘
                  ↓
┌─────────────────────────────────────────┐
│       BMAD SUBAGENT DISPATCH            │
│   pm → dev → qa → researcher → kb      │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         GIT OPERATIONS                  │
│   Branch → Commit → Log (local only)   │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        STATE PERSISTENCE                │
│   autonomous_state.json                 │
│   overnight_work_log.json               │
└─────────────────────────────────────────┘
```

## Entry Points

### 1. HEARTBEAT Trigger (Primary)
```typescript
// Called every 20 minutes via cron
async function heartbeatHandler(): Promise<void> {
  const downtime = calculateDowntime();

  // Quick returns for active sessions
  if (downtime < 20) {
    return signal('HEARTBEAT_OK');
  }

  // Load state
  const projects = loadProjectsFromMarkdown(
    readFile('PROJECTS.md')
  );

  // Schedule work
  const scheduler = new ProjectScheduler(projects);
  const tasks = scheduler.schedule(downtime, 3);

  // Execute
  for (const task of tasks) {
    await executeTask(task);
    scheduler.markWorked(task.project.id);
  }

  // Log completion
  logToOvernightWorkLog(tasks);
}
```

### 2. Manual Invocation
```typescript
// User-triggered autonomous session
async function manualSession(
  projectId: string,
  taskType: 'kb' | 'research' | 'creative'
): Promise<void> {
  const project = scheduler.getProject(projectId);
  const budget = computeSessionBudget(120, getProjectType(project));

  const task: ScheduledTask = {
    project,
    budget,
    taskType,
    estimatedMinutes: budget.totalMinutes,
    branchName: generateBranchName(project, budget.tier)
  };

  await executeTask(task);
}
```

### 3. Morning Brief (6 AM Daily)
```typescript
async function morningBrief(): Promise<void> {
  // Qatar weather check
  // Project status summary
  // Overnight work report
  // Today's priority

  const brief = generateBrief();
  deliverToUser(brief);
}
```

## Task Execution Pipeline

```typescript
async function executeTask(task: ScheduledTask): Promise<void> {
  const git = new GitBranchManager(defaultGitConfig);

  // 1. Setup
  const branchName = task.branchName || generateBranchName(
    task.project,
    task.budget.tier
  );

  if (!git.branchExists(task.project.path, branchName)) {
    git.createBranch(task.project.path, branchName);
  }

  // 2. Dispatch to appropriate skill
  let result: TaskResult;

  switch (task.taskType) {
    case 'kb':
      result = await dispatchKBBuilder(task);
      break;
    case 'research':
      result = await dispatchResearchCrawler(task);
      break;
    case 'creative':
      result = await dispatchCreativeDev(task);
      break;
    default:
      result = await dispatchMaintenance(task);
  }

  // 3. Commit
  if (result.hasChanges) {
    const hash = git.commit(
      task.project.path,
      result.commitMessage,
      result.details
    );

    // 4. Log
    const stats = git.getDiffStats(task.project.path);
    git.logWork({
      timestamp: new Date().toISOString(),
      project: task.project.id,
      branch: branchName,
      commits: 1,
      filesChanged: stats.filesChanged,
      linesAdded: stats.linesAdded,
      linesDeleted: stats.linesDeleted,
      notes: result.summary
    });
  }

  // 5. Update state
  git.updateState({
    activeTasks: [{
      id: `${task.project.id}-${Date.now()}`,
      project: task.project.id,
      status: 'complete',
      progress: 100,
      deliverables: result.deliverables,
      checkpoint: result.checkpoint
    }],
    pendingReviews: [],
    blockedTasks: []
  });
}
```

## Subagent Dispatch

### KB Builder Dispatch
```typescript
async function dispatchKBBuilder(task: ScheduledTask): Promise<TaskResult> {
  return spawnSubagent('kb', {
    contextScope: [`projects/${task.project.id}/kb/`],
    instructions: `
      Audit gaps in KB:
      1. Find stub nodes (<200 words)
      2. Find orphan nodes (no links)
      3. Prioritize: stubs → orphans → shallow
      4. Add cross-links (≥3 per node)
      5. Inject cross-domain at Tier ${task.budget.tier}

      Creativity tier: ${task.budget.tier}
      Time budget: ${task.budget.kbMinutes} minutes
    `,
    model: 'kimi-k2.5'
  });
}
```

### Research Crawler Dispatch
```typescript
async function dispatchResearchCrawler(
  task: ScheduledTask
): Promise<TaskResult> {
  const minPapers = task.budget.tier <= 2 ? 3 :
                    task.budget.tier <= 4 ? 8 : 15;

  return spawnSubagent('researcher', {
    contextScope: ['memory/synsync_research_log.json'],
    instructions: `
      Search for papers on:
      - Neural oscillation synchrony
      - Auditory steady-state response
      - Binaural beat neurophysiology

      Minimum: ${minPapers} papers
      Deduplicate against existing log
      Format: JSON with relevanceScore, actionableIdea

      Tier ${task.budget.tier}: Include indirect domains if high tier
    `,
    model: 'search' // Perplexity Sonar
  });
}
```

### Creative Dev Dispatch
```typescript
async function dispatchCreativeDev(
  task: ScheduledTask
): Promise<TaskResult> {
  const protocols = getInventionProtocol(task.budget.tier);

  return spawnSubagent('dev', {
    contextScope: [
      `projects/${task.project.id}/src/`,
      `projects/${task.project.id}/package.json`
    ],
    instructions: `
      Generate ${task.budget.ideaCount} ideas for ${task.project.name}.

      ${protocols.length > 0 ? 'Invention Protocol:\n' + protocols.join('\n') : ''}

      Branch: ${task.branchName}
      Implement top-ranked idea.
      Write tests.
      Never push to main/master.
    `,
    model: 'kimi-k2.5'
  });
}
```

## Safety Guarantees

### 1. Git Safety
- ✅ Never push to protected branches (main, master, production)
- ✅ `allowPush: false` by default
- ✅ All commits local-only until explicit user confirmation
- ✅ Branch naming: `wip/auto-*`, `feature/auto-*`, `experiment/a-*`

### 2. Context Safety
- ✅ Context guards: warn at 32K, block at 16K
- ✅ KimiChunker: 200K target chunks
- ✅ Pre-compaction flush at 4K remaining
- ✅ Post-compaction bootstrap reload

### 3. Resource Safety
- ✅ Max 4 concurrent agents
- ✅ Max 8 concurrent subagents
- ✅ Model tiering: fast (Phi-4-mini) for plumbing, Kimi for real work
- ✅ Local embeddings (Ollama) — zero API cost

### 4. State Safety
- ✅ All state written to JSON files before completion
- ✅ Work logged to overnight_work_log.json
- ✅ Task state in autonomous_state.json
- ✅ Recovery possible after any interruption

## Configuration

```jsonc
// ~/.openclaw/openclaw.json additions
{
  "agents": {
    "defaults": {
      "compaction": {
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 4000
        }
      },
      "memorySearch": {
        "enabled": true,
        "provider": "ollama",
        "model": "nomic-embed-text"
      },
      "contextGuards": {
        "warnBelowTokens": 32000,
        "blockBelowTokens": 16000
      }
    }
  },
  "heartbeat": {
    "model": "ollama/phi4-mini"
  },
  "subagents": {
    "maxConcurrent": 8,
    "provider": "openrouter-free"
  }
}
```

## Dependencies

- `creativity-scaler.ts` — Tier computation
- `project-scheduler.ts` — Project selection
- `git-branch-manager.ts` — Git operations
- `kb-builder/SKILL.md` — KB enrichment
- `research-crawler/SKILL.md` — Academic research
- `souls/*.md` — Subagent personas

## Usage

### Automatic (Heartbeat)
```bash
# Cron triggers every 20 minutes
# Automatically detects idle time
# Scales work to creativity tier
# Logs all activity
```

### Manual
```bash
# Start autonomous session on specific project
openclaw skill run autonomous-dev --project wyrd --task kb

# Generate 20 ideas for SynSync
openclaw skill run autonomous-dev --project synsync --task creative --tier 5
```

### Query Status
```bash
# Check overnight work log
openclaw memory read overnight_work_log.json

# Check current state
openclaw memory read autonomous_state.json

# See what would run next
openclaw skill dry-run autonomous-dev --downtime 180
```

---

*Autonomous development without losing your mind or your tokens.*
