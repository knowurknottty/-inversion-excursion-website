# Free Search API Setup for OpenClaw
## Zero Budget Search Solutions

**Tested and Working:** 2026-03-01

---

## ✅ WORKING SOLUTIONS

### 1. Jina AI Reader (BEST - No API key needed)
**What it does:** Fetches clean text from any URL
**Rate limit:** ~200 requests/day free
**No signup required**

**Usage:**
```bash
# Get clean text from any webpage
curl https://r.jina.ai/http://example.com

# Get Wikipedia article
curl https://r.jina.ai/http://en.wikipedia.org/wiki/Brainwave_entrainment

# Get research paper
curl https://r.jina.ai/http://sci-hub.se/10.1016/j.neuroscience.2024.01.001
```

**For OpenClaw:** Add to `~/.openclaw/openclaw.json`:
```json
{
  "web": {
    "fetch": {
      "provider": "jina",
      "url": "https://r.jina.ai/http://"
    }
  }
}
```

---

### 2. DuckDuckGo HTML (No API key)
**What it does:** Search results as HTML
**Rate limit:** Unknown (be respectful)
**No signup required**

**Usage:**
```bash
# Search
curl "https://html.duckduckgo.com/html/?q=brainwave+entrainment+research"

# Site-specific
curl "https://html.duckduckgo.com/html/?q=site:github.com+open+source+neurotech"
```

**Note:** Returns HTML, needs parsing

---

### 3. Bing Search API (Free tier - Requires signup)
**What it does:** 1,000 searches/month free
**Requires:** Microsoft Azure account (free)
**Signup:** https://azure.microsoft.com

**Usage:**
```bash
# Get API key from Azure Portal
curl "https://api.bing.microsoft.com/v7.0/search?q=brainwave+entrainment" \
  -H "Ocp-Apim-Subscription-Key: YOUR_KEY"
```

---

### 4. Google Custom Search (100 queries/day)
**What it does:** 100 searches/day free
**Requires:** Google account + API key
**Signup:** https://developers.google.com/custom-search

---

## ❌ NOT WORKING

| Service | Issue |
|---------|-------|
| SearX | 403 Forbidden (rate limited) |
| Brave Search | Requires API key (no free tier) |

---

## RECOMMENDED SETUP FOR YOU

### Immediate (No Signup)
Use **Jina AI** for everything:
- Research paper fetching
- Web page content extraction
- Documentation reading

### Short Term (Free Signup)
Get **Bing Search API**:
- 1,000 queries/month
- Better for general search
- JSON responses (easier parsing)

---

## OPENCLAW CONFIGURATION

Add to `~/.openclaw/openclaw.json`:

```json
{
  "web": {
    "search": {
      "provider": "bing",
      "apiKey": "${BING_API_KEY}",
      "fallback": "duckduckgo"
    },
    "fetch": {
      "provider": "jina",
      "url": "https://r.jina.ai/http://"
    }
  },
  "mcpServers": {
    "jina-fetch": {
      "command": "curl",
      "args": ["https://r.jina.ai/http://"]
    }
  }
}
```

---

## TESTING

Test Jina AI:
```bash
curl https://r.jina.ai/http://synsyncpro.netlify.app
```

Test DuckDuckGo:
```bash
curl "https://html.duckduckgo.com/html/?q=open+source+brainwave+entrainment"
```

---

## MCP SERVERS TO SETUP

### 1. GitHub MCP (requires token - you have this)
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

### 2. Fetch MCP (for web requests)
```json
{
  "fetch": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-fetch"]
  }
}
```

### 3. Filesystem MCP (broader file access)
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/root/.openclaw/workspace"]
  }
}
```

---

## COMPLETE MCP CONFIG

Save as `~/.openclaw/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/root/.openclaw/workspace"]
    }
  }
}
```

Then restart OpenClaw:
```bash
openclaw gateway restart
```

---

## WHAT THIS GIVES ME

With these MCPs configured:
- ✅ Access GitHub repos directly
- ✅ Fetch any webpage content
- ✅ Search the web (Bing/DuckDuckGo)
- ✅ Read files anywhere in workspace
- ✅ Execute commands

---

## NEXT STEPS

1. **Test Jina AI** (works now, no setup)
2. **Configure MCPs** (save mcp.json, restart gateway)
3. **Get Bing API key** (optional, for more searches)
4. **Test full setup**

---

*Free search is possible. Jina AI is the hero we need.*

