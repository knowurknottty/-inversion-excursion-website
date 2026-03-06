# MCP (Model Context Protocol) Configuration
## Future OpenClaw Feature — Server-Based Tool Integration

**Status:** Stored for future OpenClaw version (current: 2026.3.2)  
**Source:** [web:154], [web:157]

---

## Overview

MCP (Model Context Protocol) servers extend OpenClaw capabilities by providing specialized tools via stdio-based servers. Each server runs as a separate process and communicates via JSON-RPC.

---

## Configuration

```jsonc
{
  "mcp": {
    "lazyLoad": true,           // Only inject tool defs when task needs them
    "servers": {

      // ── GitHub — autonomous dev branches, PRs, issue tracking ──
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}" },
        "loadOn": ["git", "branch", "commit", "pull_request", "autonomous-dev"]
      },

      // ── Obsidian — wyrd knowledge base (any markdown folder) ──
      "obsidian": {
        "command": "npx",
        "args": ["-y", "mcp-obsidian", "/root/.openclaw/workspace/wyrd-consolidated/kb"],
        "env": {},
        "loadOn": ["wyrd", "knowledge_base", "kb-builder"]
      },

      // ── Playwright — browser automation (free, no API key) ──
      // Replaces Perplexity for most research tasks
      "playwright": {
        "command": "npx",
        "args": ["-y", "@playwright/mcp@latest"],
        "env": {},
        "loadOn": ["research", "web_search", "scrape", "synsync"]
      },

      // ── SQLite — local DB for autonomous dev state ──
      "sqlite": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-sqlite",
                 "--db-path", "/root/.openclaw/memory/autonomous_state.db"],
        "env": {},
        "loadOn": ["autonomous_state", "project_queue", "idea_backlog"]
      },

      // ── Codebase graph — semantic code queries ──
      // 10x better context vs file-by-file reads
      "codebase-graph": {
        "command": "npx",
        "args": ["-y", "mcp-code-graph", "--workspace", "/root/.openclaw/workspace"],
        "env": {},
        "loadOn": ["code_review", "refactor", "architecture", "autonomous-dev"]
      },

      // ── Filesystem — scoped to project roots only ──
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem",
                 "/root/.openclaw/workspace", "/root/.openclaw"],
        "env": {},
        "loadOn": ["file", "read", "write", "edit"]
      }
    }
  }
}
```

---

## Server Capabilities

| Server | Purpose | Replaces |
|--------|---------|----------|
| **GitHub** | Branch/PR/issue management | Manual git operations |
| **Obsidian** | Markdown KB queries | File-based KB search |
| **Playwright** | Browser automation | Perplexity API (free) |
| **SQLite** | Structured state storage | JSON files |
| **Codebase-graph** | Semantic code queries | grep/file reads |
| **Filesystem** | Scoped file access | Direct file tools |

---

## Requirements

1. **Node.js/npm** — For `npx` command
2. **Environment variables:**
   - `GITHUB_PAT` — GitHub Personal Access Token
   - `GIT_WORKSPACE` — Path to git workspace

---

## Installation

```bash
# When OpenClaw supports MCP:
# 1. Add config to openclaw.json
# 2. Set environment variables
# 3. Restart gateway

export GITHUB_PAT="ghp_xxxxxxxxxxxx"
export GIT_WORKSPACE="/root/.openclaw/workspace"
```

---

## Lazy Loading

With `lazyLoad: true`, MCP servers only start when:
1. Task keywords match `loadOn` array
2. Tools are explicitly requested

**Benefits:**
- Faster startup
- Lower resource usage
- On-demand capability injection

---

## Migration from Current Setup

| Current | MCP Replacement |
|---------|-----------------|
| File-based KB | Obsidian server |
| Perplexity search | Playwright browser |
| JSON state files | SQLite database |
| Manual git ops | GitHub server |
| grep/file reads | Codebase-graph |

---

## Activation

**When OpenClaw MCP support arrives:**

1. Merge this config into `openclaw.json`
2. Set `GITHUB_PAT` environment variable
3. Restart gateway: `openclaw gateway restart`
4. Verify: `openclaw mcp list`

---

*Stored for future use — current OpenClaw version does not support MCP*
