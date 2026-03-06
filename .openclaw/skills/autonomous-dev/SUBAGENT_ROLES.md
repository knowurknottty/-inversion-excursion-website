# Autonomous-Dev Subagent Roles Configuration
## Context-Isolated Specialized Agents

```json
{
  "subagents": {
    "roles": {
      "pm": {
        "model": "kimi-k2.5",
        "soul": "souls/pm.md",
        "contextScope": ["PROJECTS.md", "memory/requirements/"],
        "function": "product planning, requirements, tickets"
      },
      "dev": {
        "model": "kimi-k2.5",
        "soul": "souls/dev.md",
        "contextScope": ["src/", "package.json", "tsconfig.json"],
        "function": "implementation — full code context"
      },
      "qa": {
        "model": "kimi-k2.5",
        "soul": "souls/qa.md",
        "contextScope": ["src/", "tests/", "memory/known-bugs/"],
        "function": "tests only — doesn't need business logic"
      },
      "researcher": {
        "model": "search",
        "soul": "souls/researcher.md",
        "contextScope": ["memory/synsync_research_log.json"],
        "function": "Perplexity Sonar — live grounding"
      },
      "kb": {
        "model": "kimi-k2.5",
        "soul": "souls/kb-builder.md",
        "contextScope": ["projects/wyrd/kb/"],
        "function": "wyrd KB work only"
      }
    },
    "maxConcurrent": 8,
    "handoffStrategy": "direct",
    "provider": "openrouter-free"
  }
}
```

## Role Isolation Strategy

| Role | Context | Excludes | Why |
|------|---------|----------|-----|
| **pm** | PROJECTS.md, requirements/ | src/, tests/ | Focus on what, not how |
| **dev** | src/, configs | requirements/, bugs/ | Clean implementation context |
| **qa** | src/, tests/, known-bugs/ | requirements/ | Test coverage focus |
| **researcher** | research log only | Everything else | Fresh grounding, no bias |
| **kb** | wyrd/kb/ only | Other projects | Deep KB work, no distraction |

## Benefits

1. **Token efficiency** — No bloat from irrelevant context
2. **Clear ownership** — Each role has defined scope
3. **Parallel safety** — PM and dev can work simultaneously without collision
4. **Specialized personas** — Different SOUL.md for each role

## Handoff Strategy: Direct

No wrapper bounce between roles. When PM finishes → direct spawn dev with handoff context.

## Provider: openrouter-free
Bug #30988 workaround — never direct NVIDIA for subagents.

---

*Part of autonomous-dev skill system*
