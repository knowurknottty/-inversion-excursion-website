# Autonomous-Dev Context Guards Configuration
## Protecting Against Context Exhaustion

```json
{
  "agents": {
    "defaults": {
      "contextGuards": {
        "warnBelowTokens": 32000,
        "blockBelowTokens": 16000,
        "toolResultGuard": true,
        "turnBasedTrimming": true,
        "cacheAwarePruning": true
      }
    }
  }
}
```

## Guard Behaviors

| Guard | Threshold | Action |
|-------|-----------|--------|
| **warnBelowTokens** | 32,000 remaining | Warning: context running low |
| **blockBelowTokens** | 16,000 remaining | Block new tool calls |
| **toolResultGuard** | Always on | Synthetic error on isolated tool calls [web:85] |
| **turnBasedTrimming** | At boundaries | Trim only at user message boundaries |
| **cacheAwarePruning** | Post-cache expiry | Only prune after provider cache expires |

## Why These Matter for Autonomous Operation

### warnBelowTokens: 32K
Gives early warning before critical threshold. Time to:
- Flush state to memory
- Complete current chunk
- Prepare for compaction

### blockBelowTokens: 16K
Hard stop on new tool calls. Prevents:
- Mid-tool context exhaustion
- Partial tool results
- Corrupted state

### toolResultGuard: true
Synthetic error if tool call would be isolated. Protects:
- Tool-result pairing integrity
- Context coherence
- Recovery capability

### turnBasedTrimming: true
Clean cuts at user message boundaries. Avoids:
- Mid-sentence truncation
- Broken tool chains
- Partial context

### cacheAwarePruning: true
Respects provider caching. Ensures:
- Cache hits remain valid
- No premature pruning
- Efficient token reuse

---

## Combined with Other Safeguards

```
Context Guards (this file)
    ↓
Compaction Protocol (pre-flush at 4K)
    ↓
KimiChunker (200K target chunks)
    ↓
Post-Compaction Bootstrap (reload state)
```

**Complete resilience chain for long-running autonomous tasks.**

---

*Part of autonomous-dev skill system*
