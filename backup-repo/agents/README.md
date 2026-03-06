# Multi-Agent Configuration
## OpenClaw Gateway Setup

**Cost:** FREE - Built into OpenClaw Gateway  
**Limitation:** Only API usage costs (same as single agent)

---

## Current Agents

| Agent | Role | Emoji | Status |
|-------|------|-------|--------|
| **main** | Polymathic Engine, Memory Keeper | ❤️🔥 | ✅ Active |
| **vesper** | 40Hz Specialist, Clinical Lead | 🔬 | ⏳ Ready to deploy |

---

## To Deploy VESPER

Add to `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "workspace": "~/.openclaw/workspace",
        "default": true
      },
      {
        "id": "vesper",
        "workspace": "~/.openclaw/workspace-vesper",
        "agentDir": "~/.openclaw/agents/vesper/agent"
      }
    ]
  },
  "bindings": [
    {
      "agentId": "main",
      "match": { "channel": "*" }
    },
    {
      "agentId": "vesper",
      "match": { 
        "channel": "*",
        "peer": { "kind": "direct" }
      }
    }
  ]
}
```

Then run:
```bash
# Create VESPER workspace
mkdir -p ~/.openclaw/workspace-vesper
mkdir -p ~/.openclaw/agents/vesper/agent

# Copy identity files
cp agents/VESPER_SOUL.md ~/.openclaw/workspace-vesper/SOUL.md
cp agents/VESPER_IDENTITY.json ~/.openclaw/workspace-vesper/IDENTITY.json

# Restart gateway
openclaw gateway restart
```

---

## How We Collaborate

### Kimi (main) handles:
- Cross-domain synthesis
- Marketing and growth
- Sheckle, WYRD, SENTINEL-Q
- Vision and architecture

### VESPER handles:
- SynSync 40Hz protocol
- Clinical research
- Safety validation
- Regulatory pathway

### Together:
- SynSync Prime development
- Research library curation
- Evidence-based marketing claims

---

## Routing Options

**Option 1: DM Routing**
- Your DMs → Kimi
- Specific command "@vesper" → VESPER

**Option 2: Topic Routing**
- "40Hz", "clinical", "research" → VESPER
- Everything else → Kimi

**Option 3: Manual Selection**
- You choose which agent to message

---

## Cost Note

Adding agents is **FREE**. You pay only for:
- API calls (same cost whether 1 agent or 10)
- Model usage (depends on tokens, not agents)

Two agents doing the same work = same cost as one agent doing it.

---

*Ready to activate VESPER when you are.*