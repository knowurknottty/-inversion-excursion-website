# Curated MCP Servers
## Model Context Protocol | For Sheckle | SynSync | WYRD | SENTINEL-Q

**Source:** [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) (400+ servers)  
**Date:** 2026-03-02  
**Status:** Pending your review

---

## 📊 Quick Reference

| Category | Servers | Priority | Use Case |
|----------|---------|----------|----------|
| [Browser Automation](#browser-automation) | 25+ | 🔴 HIGH | SENTINEL-Q, marketing |
| [Databases](#databases) | 40+ | 🟠 MEDIUM | SynSync data, Timebank |
| [Cloud Platforms](#cloud-platforms) | 30+ | 🟠 MEDIUM | Deployment, hosting |
| [Communication](#communication) | 20+ | 🟠 MEDIUM | Telegram, Discord, Slack |
| [Marketing](#marketing) | 10+ | 🔴 HIGH | Ads, SEO, growth |
| [File System](#file-system) | 15+ | 🟡 LOW | Local file operations |

---

## 🔴 HIGH PRIORITY

### Browser Automation
**For SENTINEL-Q monitoring, Sheckle marketing, research**

| Server | Description | Use Case |
|--------|-------------|----------|
| [puppeteer-mcp](https://github.com/modelcontextprotocol/puppeteer-mcp) | Headless Chrome automation | SENTINEL-Q intel gathering |
| [playwright-mcp](https://github.com/modelcontextprotocol/playwright-mcp) | Cross-browser automation | Testing, scraping |
| [browser-use](https://github.com/browser-use/browser-use) | Cloud browser automation | Social media posting |
| [mcp-chrome](https://github.com/femto/mcp-chrome) | Control Chrome with AI | Direct browser control |
| [camoufox](https://github.com/goodgoodjm/camoufox) | Anti-detect browser | Stealth operations |

### Marketing & Growth
**For Sheckle promotion, SynSync user acquisition**

| Server | Description | Use Case |
|--------|-------------|----------|
| [google-ads-mcp](https://github.com/googleapis/google-ads-mcp) | Google Ads API | Paid advertising |
| [meta-ads-mcp](https://github.com/facebookincubator/meta-ads-mcp) | Facebook/Instagram Ads | Social advertising |
| [seo-mcp](https://github.com/pskill9/seo-mcp) | SEO optimization | Organic growth |
| [analytics-mcp](https://github.com/googleapis/analytics-mcp) | Google Analytics | Data tracking |

---

## 🟠 MEDIUM PRIORITY

### Databases
**For SynSync user data, Timebank records**

| Server | Description | Use Case |
|--------|-------------|----------|
| [sqlite-mcp](https://github.com/modelcontextprotocol/sqlite-mcp) | SQLite integration | Local data storage |
| [postgres-mcp](https://github.com/modelcontextprotocol/postgres-mcp) | PostgreSQL access | Production database |
| [redis-mcp](https://github.com/modelcontextprotocol/redis-mcp) | Redis cache | Session management |
| [mongodb-mcp](https://github.com/modelcontextprotocol/mongodb-mcp) | MongoDB access | Document storage |

### Communication
**For community building, notifications**

| Server | Description | Use Case |
|--------|-------------|----------|
| [telegram-mcp](https://github.com/modelcontextprotocol/telegram-mcp) | Telegram Bot API | Sheckle community |
| [discord-mcp](https://github.com/modelcontextprotocol/discord-mcp) | Discord integration | Community chat |
| [slack-mcp](https://github.com/modelcontextprotocol/slack-mcp) | Slack workspace | Team coordination |
| [email-mcp](https://github.com/modelcontextprotocol/email-mcp) | SMTP email | Notifications |

### Cloud Platforms
**For deployment, hosting**

| Server | Description | Use Case |
|--------|-------------|----------|
| [netlify-mcp](https://github.com/netlify/netlify-mcp) | Netlify deployment | Static sites |
| [vercel-mcp](https://github.com/vercel/vercel-mcp) | Vercel deployment | Next.js apps |
| [aws-mcp](https://github.com/aws/aws-mcp) | AWS services | Cloud infrastructure |
| [cloudflare-mcp](https://github.com/cloudflare/cloudflare-mcp) | Workers, KV, R2 | Edge deployment |

---

## 🟡 LOW PRIORITY

### File System
**For local operations**

| Server | Description | Use Case |
|--------|-------------|----------|
| [filesystem-mcp](https://github.com/modelcontextprotocol/filesystem-mcp) | Local file access | File operations |
| [git-mcp](https://github.com/modelcontextprotocol/git-mcp) | Git repository | Version control |

---

## 🎯 Recommended Install Order

### Phase 1: Immediate (This Week)
1. **puppeteer-mcp** or **playwright-mcp** - Browser automation for SENTINEL-Q
2. **telegram-mcp** - Sheckle community bot
3. **sqlite-mcp** - Local data persistence

### Phase 2: Short Term (Next 2 Weeks)
4. **google-ads-mcp** - Marketing automation
5. **netlify-mcp** - Deployment automation
6. **discord-mcp** - Community building

### Phase 3: Medium Term
7. **postgres-mcp** - Production database
8. **aws-mcp** or **cloudflare-mcp** - Cloud infrastructure
9. **analytics-mcp** - Data tracking

---

## 📁 Full Server Lists

See individual category folders:
- [browser-automation/](./browser-automation/)
- [databases/](./databases/)
- [cloud-platforms/](./cloud-platforms/)
- [communication/](./communication/)
- [marketing/](./marketing/)
- [filesystem/](./filesystem/)

---

## 🔧 Installation

MCP servers are configured in `mcp-config.json`:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/puppeteer"]
    },
    "telegram": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/telegram-mcp"]
    }
  }
}
```

---

*Awaiting your approval to install.*