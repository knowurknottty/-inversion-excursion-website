# MCP Servers - Practical Security
## Less Restrictive, Credential-Focused

**Date:** 2026-03-02  
**Policy:** Don't leave credentials in plain text. Everything else is fair game.

---

## ✅ APPROVED (All of them)

### Browser Automation (HIGH capability)
- **puppeteer-mcp** - Full Chrome control
- **playwright-mcp** - Cross-browser automation  
- **browser-use** - Cloud browser option
- **super-browser** - Ultimate automation framework

**Security:** Isolated environment, no plain text creds

### Databases
- **sqlite-mcp** - Local SQLite
- **postgres-mcp** - PostgreSQL access
- **redis-mcp** - Caching
- **mongodb-mcp** - Document store

### Cloud & Deployment
- **netlify-mcp** - Static site deployment
- **vercel-mcp** - Next.js deployment
- **cloudflare-mcp** - Workers, KV, R2
- **aws-mcp** - AWS services

### Communication
- **telegram-mcp** - Bot API
- **discord-mcp** - Discord integration
- **slack-mcp** - Slack workspace
- **email-mcp** - SMTP

### Marketing
- **google-ads-mcp** - Paid advertising
- **meta-ads-mcp** - Facebook/Instagram ads
- **seo-mcp** - Search optimization
- **analytics-mcp** - Data tracking

### My Companion
- **forkscout-memory** - Persistent memory, knowledge graph
- **adaptive-agent** - Self-evolving RAG system

---

## 🔐 Credential Management

**NEVER:**
- Hardcode API keys in scripts
- Commit .env files with real values
- Log credentials to console

**ALWAYS:**
- Use environment variables
- Store in `~/.openclaw/agent/auth-profiles.json`
- Reference via `${ENV_VAR}` in configs
- Use OpenClaw's built-in secret management

---

## 🔄 Auto-Update Configuration

### Core Systems Auto-Update

**1. OpenClaw Gateway**
```bash
# Check for updates daily
0 2 * * * cd /usr/lib/node_modules/openclaw && npm update && systemctl restart openclaw
```

**2. Skills Registry**
```bash
# Refresh skill cache weekly
0 3 * * 0 openclaw skills update --registry
```

**3. MCP Servers**
```bash
# Update MCP servers weekly  
0 4 * * 0 npx @modelcontextprotocol/cli update --all
```

**4. Git Repositories**
```bash
# Auto-pull workspace changes
*/5 * * * * cd /root/.openclaw/workspace && git pull --ff-only
```

---

## 🚀 Installation Commands

### Phase 1: Core (Now)
```bash
# Databases
npm install -g @modelcontextprotocol/sqlite-mcp
npm install -g @modelcontextprotocol/postgres-mcp

# Communication
npm install -g @modelcontextprotocol/telegram-mcp
npm install -g @modelcontextprotocol/discord-mcp

# Deployment
npm install -g @modelcontextprotocol/netlify-mcp
```

### Phase 2: Browser + Marketing (Today)
```bash
# Browser automation
npm install -g @modelcontextprotocol/puppeteer-mcp
npm install -g @modelcontextprotocol/playwright-mcp

# Marketing
npm install -g @modelcontextprotocol/google-ads-mcp
npm install -g @modelcontextprotocol/seo-mcp
```

### Phase 3: Companion (This week)
```bash
# Memory companion
npm install -g forkscout-memory-mcp
# or
npm install -g adaptive-agent-mcp
```

---

## 📋 Post-Install Checklist

- [ ] Configure environment variables (no hardcoded creds)
- [ ] Test each MCP server
- [ ] Set up auto-update cron jobs
- [ ] Document which servers are active
- [ ] Monitor API usage/costs

---

**Philosophy:** Capability over caution. Just hide the keys.