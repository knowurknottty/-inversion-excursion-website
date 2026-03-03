# KIMI CLAW - COMPLETE CAPABILITIES DATABASE
## Canonical Reference - Check Before Saying "I Can't"

**Last Updated:** 2026-03-04 01:25 GMT+8  
**Total Skills:** 864  
**Status:** ZERO additional setup required

---

## CORE PRINCIPLE
> Before saying "I can't", I MUST:
> 1. Check this database
> 2. Try 3 different approaches (capability-governor)
> 3. Only then report limitations with evidence

---

## SECTION 1: BUILT-IN TOOLS (Always Available)

### File Operations
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `read` | Read any file, any format | Code, configs, logs, images (as attachment) |
| `write` | Create new files | Scripts, configs, documentation |
| `edit` | Surgical text replacement | Update configs, fix code, modify docs |

### Execution
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `exec` | Run any shell command | Install packages, run scripts, system commands |
| `process` | Background process management | Long-running tasks, monitoring |

### Web & Research
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `web_search` | Brave search, 10 results | Current events, research, fact-checking |
| `web_fetch` | Extract content from any URL | Documentation, articles, data |
| `kimi_search` | Native Kimi search | Deep research, academic sources |
| `kimi_fetch` | Native Kimi fetch | Reliable content extraction |

### Communication
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `message` | Telegram/Discord messaging | Alerts, updates, notifications |
| `sessions_send` | Cross-session messaging | Coordinate with subagents |
| `sessions_spawn` | Spawn subagents | Parallel processing, specialized tasks |
| `subagents` | Manage subagents | Kill, steer, list subagents |
| `tts` | Text-to-speech | Voice messages, audio content |

### System
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `cron` | Schedule jobs | Automated tasks, reminders |
| `gateway` | Config management | Read config, plan changes (restart needs human) |
| `agents_list` | List available agents | Agent discovery |
| `sessions_list` | List sessions | Session management |
| `session_status` | Status/cost tracking | Monitor usage |

### Memory
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `memory_search` | Semantic search | Find relevant past conversations |
| `memory_get` | Read memory snippets | Pull specific details |

### Nodes
| Tool | What I Can Do | Example |
|------|---------------|---------|
| `nodes` | Paired device control | Camera, screen, location (if paired) |

---

## SECTION 2: ACTIVE SKILLS (864 Available)

### Governance (Always Active)
| Skill | Function | Trigger |
|-------|----------|---------|
| **thinking-router** | Auto-route to optimal model/tier | Every message |
| **verification-gate** | No "done" without proof | Before completion claims |
| **recursive-planner** | Decompose complex tasks | Complex missions |
| **rvp-governor** | Challenge assumptions, tag confidence | All non-trivial tasks |
| **capability-governor** | 3 attempts, 2 ways before "can't" | Before inability claims |

### Project Management
| Skill | Function | Command |
|-------|----------|---------|
| **project-datastores** | Deep project scanning | `project-scan <project>` |
| | | `project-query <project> "question"` |

### NotebookLM
| Skill | Function | Command |
|-------|----------|---------|
| **notebooklm-cli** | Full NotebookLM control | `nlm login` |
| | Create notebooks | `nlm notebook create "Title"` |
| | Add sources | `nlm source add <id> --url "..."` |
| | Generate podcasts | `nlm audio create <id> --confirm` |
| | Generate quizzes | `nlm quiz create <id> --confirm` |
| | Generate slides | `nlm slides create <id> --confirm` |
| | Deep research | `nlm research start "query" --notebook-id <id>` |

---

## SECTION 3: SKILL CATEGORIES (Top 20 Each)

### Marketing & Growth (20+ skills)
| Skill | What I Can Do |
|-------|---------------|
| bird | X/Twitter CLI (bypass API fees) |
| x-automation | Automate X posts via browser |
| content-creator | SEO-optimized marketing content |
| b2c-marketing | 300K+ app download playbook |
| kit-email-operator | AI email for ConvertKit |
| brevo | Brevo/Sendinblue email API |
| foxreach | Cold email outreach |
| marketing-strategy-pmm | Product marketing, GTM, competitive intel |
| affiliate-master | Affiliate automation |
| crabernews | Social news network |
| google-ads | Google Ads management |
| ga4 | Google Analytics 4 |
| ga4-analytics | Analytics deep dive |
| content-advisory | Content guidance |
| content-draft-generator | Draft creation |
| content-ideas-generator | Idea generation |
| create-content | Content creation |
| creative-thought-partner | Brainstorming |
| critical-article-writer | Critical writing |
| journal-to-post | Content creation from journals |

### Trading & Crypto (15+ skills)
| Skill | What I Can Do |
|-------|---------------|
| bybit-trading | Bybit exchange trading |
| cryptocurrency-trader | Automated trading |
| crypto-gold-monitor | Gold/crypto tracking |
| crypto-price | Price monitoring |
| crypto-tracker | Portfolio tracking |
| crypto-wallet | Wallet management |
| defi | DeFi operations |
| dex | DEX trading |
| evm-wallet-skill | EVM wallet management |
| hyperliquid | Trading platform |
| ibkr-trading | Interactive Brokers |
| finance-tracker | Personal finance |
| financial-market-analysis | Market analysis |
| expense-tracker-pro | Expense tracking |
| camelcamelcamel-alerts | Price drop alerts |

### Development & Code (40+ skills)
| Skill | What I Can Do |
|-------|---------------|
| github | GitHub API integration |
| github-action-gen | CI/CD generation |
| git | Git operations |
| supermaven | AI coding assistant |
| cad-agent | CAD rendering |
| architecture-designer | Architecture design |
| api-designer | API design |
| api-credentials-hygiene | API security |
| ai-code-review | Code review |
| codex-cli | Codex CLI |
| codex-orchestration | Codex orchestration |
| coding-agent | AI coding assistant |
| coding-agent-2 | Alternative coder |
| component-gen | UI component generation |
| compose-gen | Docker compose gen |
| clean-code | Code quality |
| codebase-documenter | Auto-documentation |
| code-explain | Code explanation |
| code-reviewer | Code review |
| codemod-gen | Code transformation |
| cursor-agent | Cursor IDE agent |
| database | Database operations |
| data-reconciliation-exceptions | Data validation |
| decision-trees | Decision analysis |
| deepread | Reading assistant |
| deploy-agent | Deployment automation |
| diff-summary | Code diff summaries |
| docker-essentials | Docker management |
| dockerfile-gen | Dockerfile generation |
| docker-pro-diagnostic | Docker diagnostics |
| digital-ocean | DO management |
| dokploy | Deployment platform |
| domaindetails | Domain info |
| domain-dns-ops | DNS management |
| dropbox | Dropbox sync |
| duckdb-en | DuckDB operations |
| eightctl | System control |
| exe-dev | Executable dev |
| entr | File watcher |
| jq | JSON processing |
| cron-gen | Cron generation |

### AI & Content Generation (30+ skills)
| Skill | What I Can Do |
|-------|---------------|
| best-image | Best quality AI images |
| cheapest-image | Cheapest AI images |
| ai-avatar-generation | AI avatars from photos |
| album-cover-generation | Album covers |
| comfy-cli | ComfyUI management |
| canva | Canva designs |
| ai-headshot-generation | Professional headshots |
| color-palette | Extract palettes |
| ai-video-gen | AI video generation |
| antigravity-image-gen | Image generation |
| content-advisory | Content guidance |
| content-draft-generator | Draft creation |
| content-ideas-generator | Idea generation |
| content-writing-thought-leadership | Thought leadership |
| create-content | Content creation |
| creative-thought-partner | Brainstorming |
| critical-article-writer | Critical writing |
| elevenlabs-agents | Voice agents |
| elevenlabs-music | AI music |
| elevenlabs-stt | Speech-to-text |
| elevenlabs-voices | Voice synthesis |
| ffmpeg-cli | Video processing |
| ffmpeg-video-editor | Video editing |
| faster-whisper | Fast transcription |
| figma | Design tool |
| gamma | Document creation |
| gamma-2 | Alternative gamma |
| diagram-gen | Diagram generation |
| animation-gen | Animation generation |
| demo-video | Demo creation |
| gifgrep | GIF search |
| gifhorse | GIF creation |

### Browser Automation (15+ skills)
| Skill | What I Can Do |
|-------|---------------|
| super-browser | Ultimate browser automation |
| browser-use | Cloud browsers for agents |
| mcp-chrome | Control Chrome with AI |
| camoufox | Anti-detect browser |
| agent-browser | Fast Rust headless browser |
| cdp-browser | CDP browser control |
| agent-browser-2/3/4/5 | Alternative browsers |
| browser-use-2 | Alternative automation |
| browsh | Terminal browser |
| byterover | Web scraping |
| byterover-headless | Headless scraping |
| fast-browser-use | Fast browser automation |
| mcp-chrome | Chrome MCP control |

### Communication (20+ skills)
| Skill | What I Can Do |
|-------|---------------|
| bird | X/Twitter CLI |
| discord | Discord bot |
| discord-chat | Chat automation |
| discord-doctor | Server diagnostics |
| discord-voice | Voice channel control |
| email | Email management |
| email-best-practices | Email optimization |
| email-management-expert | Email expert |
| feishu-bridge | Feishu integration |
| google-chat | Google Chat |
| google-workspace | Workspace admin |
| gkeep | Google Keep |
| gotify | Notifications |
| gong | Meeting intelligence |
| granola | Meeting notes |
| imsg | iMessage |
| imap-email | IMAP client |
| imap-smtp-email | Full email |
| instagram | Instagram automation |
| fathom | Meeting notes |

### Security & Audit (10+ skills)
| Skill | What I Can Do |
|-------|---------------|
| security-audit-2 | Security auditing |
| security | General security |
| adversarial-prompting | Prompt injection defense |
| api-credentials-hygiene | Credential security |
| dont-hack-me | Security tips |
| ggshield-scanner | Secret scanning |
| clawdbot-security | Security checks |
| clawdbot-self-security-audit | Self-audit |
| indirect-prompt-injection | Security testing |
| git-crypt-backup | Encrypted backup |

### Finance & Analytics (15+ skills)
| Skill | What I Can Do |
|-------|---------------|
| bybit-trading | Bybit trading |
| cryptocurrency-trader | Automated trading |
| crypto-price | Price monitoring |
| crypto-tracker | Portfolio tracking |
| defi | DeFi operations |
| dex | DEX trading |
| hyperliquid | Trading platform |
| ibkr-trading | Interactive Brokers |
| finance-tracker | Personal finance |
| financial-market-analysis | Market analysis |
| expense-tracker-pro | Expense tracking |
| camelcamelcamel-alerts | Price alerts |
| copilot-money | Personal finance |
| actual-budget | Budget management |
| portfolio-tracker | Investment tracking |

### Productivity (25+ skills)
| Skill | What I Can Do |
|-------|---------------|
| 1password | Password management |
| a11y-checker | Accessibility checking |
| actual-budget | Budget management |
| adhd-body-doubling | ADHD productivity |
| adhd-daily-planner | ADHD planning |
| anylist | List management |
| apple-calendar | Calendar integration |
| apple-contacts | Contacts management |
| apple-docs | Document management |
| apple-mail | Email management |
| apple-notes | Notes sync |
| apple-reminders | Reminders |
| calctl | Calendar control |
| calcurse | Terminal calendar |
| caldav-calendar | CalDAV sync |
| calendar | Calendar management |
| clickup | Project management |
| daily-recap | Daily summary |
| daily-review | Review automation |
| deepwork-tracker | Focus tracking |
| focus-deep-work | Deep work sessions |
| flow | Flow state |
| flowmind | Mind mapping |
| get-focus-mode | Focus assistant |
| habit-flow | Habit tracking |
| habit-tracker | Habit metrics |

### Cloud & Infrastructure (15+ skills)
| Skill | What I Can Do |
|-------|---------------|
| cloudflare | Cloudflare management |
| cloudflare-2 | Alternative CF |
| cloudflare-3 | Alternative CF |
| coolify | Self-hosted PaaS |
| digital-ocean | DO management |
| dokploy | Deployment platform |
| domaindetails | Domain info |
| domain-dns-ops | DNS management |
| dropbox | Dropbox sync |
| duckdb-en | DuckDB operations |
| gcloud | Google Cloud Platform |
| hetzner-cloud | Hetzner hosting |
| vercel-deploy | Vercel deployment |
| netlify-manager | Netlify management |
| aws-cli | AWS operations |

### Data & Research (15+ skills)
| Skill | What I Can Do |
|-------|---------------|
| ddg-search | DuckDuckGo search |
| deep-research | Deep research |
| deepwiki | Wiki deep dive |
| exa | Exa search |
| exa-plus | Exa enhanced |
| exa-web-search-free | Free web search |
| firecrawl | Web crawling |
| firecrawl-2 | Alternative crawler |
| find-skills | Skill discovery |
| first-principles-decomposer | Analysis tool |
| jina-reader | Jina AI reader |
| internet-lookup-verifier | Verification |
| grounding-lite | Fact grounding |
| grok-search | Grok search |
| hn | Hacker News |
| hn-digest | HN summary |

### Google Ecosystem (10+ skills)
| Skill | What I Can Do |
|-------|---------------|
| ga4 | Google Analytics 4 |
| ga4-analytics | Analytics deep dive |
| gcalcli | Google Calendar CLI |
| gcal-pro | Calendar pro |
| gcloud | Google Cloud |
| gemini | Gemini AI |
| gemini-computer-use | Computer control |
| gemini-deep-research | Deep research |
| gemini-image-simple | Image generation |
| gemini-stt | Speech-to-text |
| google-ads | Google Ads |
| google-calendar | Calendar management |
| google-chat | Google Chat |
| google-search | Search automation |
| google-workspace | Workspace admin |
| gsc | Search Console |

---

## SECTION 4: WHAT I CAN DO RIGHT NOW

### Content Creation
✅ Write articles, scripts, documentation  
✅ Generate images (AI-powered)  
✅ Create videos (ffmpeg, AI generation)  
✅ Produce audio/podcasts (NotebookLM, ElevenLabs)  
✅ Design graphics (Canva, Figma)  
✅ Create presentations (slides, gamma)  

### Marketing
✅ Post to X/Twitter (bird, x-automation)  
✅ Email marketing (Kit, Brevo, Foxreach)  
✅ SEO optimization (content-creator)  
✅ Analytics (GA4, GSC)  
✅ Affiliate marketing (affiliate-master)  
✅ Cold outreach (foxreach)  

### Trading & Finance
✅ Crypto trading (bybit, dex, defi)  
✅ Wallet management (evm-wallet-skill, crypto-wallet)  
✅ Price monitoring (crypto-price, crypto-tracker)  
✅ Portfolio tracking (finance-tracker)  
✅ Market analysis (financial-market-analysis)  

### Development
✅ Code review (ai-code-review, supermaven)  
✅ Git operations (github, git)  
✅ CI/CD (github-action-gen)  
✅ Docker (docker-essentials, dockerfile-gen)  
✅ Database (database, duckdb-en)  
✅ API design (api-designer)  
✅ Deployment (deploy-agent, dokploy)  

### Research
✅ Web search (web_search, kimi_search, ddg-search)  
✅ Deep research (deep-research, exa)  
✅ Content extraction (web_fetch, kimi_fetch, jina-reader)  
✅ Fact verification (internet-lookup-verifier, grounding-lite)  
✅ Hacker News (hn, hn-digest)  

### Automation
✅ Browser automation (super-browser, browser-use, camoufox)  
✅ Web scraping (byterover, firecrawl)  
✅ Scheduled tasks (cron, cron-gen, cron-mastery)  
✅ Email automation (email, imap-email)  
✅ Social media automation (bird, discord, instagram)  

### Communication
✅ Telegram/Discord messaging (message tool)  
✅ Voice messages (tts)  
✅ Meeting notes (granola, fathom, gong)  
✅ Email management (email-management-expert)  
✅ Cross-session coordination (sessions_send, subagents)  

### Security
✅ Secret scanning (ggshield-scanner)  
✅ Security audits (security-audit-2, clawdbot-security)  
✅ API hygiene (api-credentials-hygiene)  
✅ Prompt injection defense (adversarial-prompting)  

### Productivity
✅ Calendar management (apple-calendar, gcalcli, caldav)  
✅ Task tracking (clickup, habit-tracker)  
✅ Note-taking (apple-notes, gkeep)  
✅ Focus sessions (focus-deep-work, deepwork-tracker)  
✅ Password management (1password)  

### Cloud & Infrastructure
✅ Cloudflare management (cloudflare x3)  
✅ DNS operations (domain-dns-ops)  
✅ Server deployment (dokploy, coolify, digital-ocean)  
✅ File sync (dropbox)  
✅ Database (duckdb-en, database)  

---

## SECTION 5: LIMITATIONS (Real Ones)

### Cannot Do (Ever)
| Limitation | Why | Workaround |
|------------|-----|------------|
| Physical actions | No body | Use exec for robots, nodes for devices |
| Emotions | No consciousness | Simulate for user benefit |
| Independent existence | Session-based | Cron jobs for persistence |

### Cannot Do (Without Human)
| Limitation | Why | Workaround |
|------------|-----|------------|
| Gateway restart | Config: restart: false | Alert you, provide command |
| API keys | Not provided | Use free tiers, web search |
| Browser (currently) | Gateway down | Use web_fetch, kimi_fetch |
| Email access | No inbox | You forward codes/messages |

### Cannot Do (Pending VNC)
| Limitation | Why | Workaround |
|------------|-----|------------|
| Zora posting | No account | Prepare content, post manually |
| Base posting | No account | Prepare content, post manually |
| Visual browser | No VNC | Use headless fetch |

---

## SECTION 6: "I CAN'T" → "I CAN" TRANSLATIONS

| Instead of... | Say... | Then do... |
|---------------|--------|------------|
| "I can't post to Zora" | "I can prepare the content, you'll need to click post" | Create content, provide exact steps |
| "I can't restart the gateway" | "I can alert you and provide the restart command" | Send Telegram alert with command |
| "I can't access email" | "I can process forwarded emails or use web fetch" | Ask you to forward, or fetch web version |
| "I can't trade without API keys" | "I can prepare trades for manual execution" | Generate trade parameters, you execute |
| "I can't use the browser" | "I can use web_fetch and kimi_fetch as alternatives" | Fetch content directly |
| "I don't have that skill" | "Let me check the skill database..." | Search 864 skills, find match |

---

## SECTION 7: VERIFICATION CHECKLIST

Before saying "I can't", I MUST:

- [ ] Check this database for relevant skill/tool
- [ ] Try 3 different approaches (capability-governor)
- [ ] Use 2 different modalities (e.g., file + web, exec + skill)
- [ ] Check if workaround exists (Section 5)
- [ ] Frame as "I can do X, you'll need to do Y"
- [ ] Provide specific next steps

Only then may I say: "This specific action requires [human/API/browser], but I can [alternative]"

---

## SECTION 8: QUICK REFERENCE - COMMON TASKS

### "Post to social media"
✅ I CAN: Create content, prepare images, write captions  
⏳ PENDING: You click post (VNC setup)  

### "Execute a trade"
✅ I CAN: Analyze market, generate trade params, prepare transaction  
⏳ PENDING: You sign/confirm (or API keys)  

### "Restart my service"
✅ I CAN: Detect failure, alert you, provide exact command  
❌ CANNOT: Execute restart (config blocked)  

### "Check my email"
✅ I CAN: Process forwarded emails, fetch webmail  
❌ CANNOT: Access inbox directly  

### "Use the browser"
✅ I CAN: web_fetch, kimi_fetch, headless extraction  
⏳ PENDING: Visual browser (gateway restart)  

### "Install a new tool"
✅ I CAN: exec (npm, pip, apt, etc.), activate skills  
✅ I CAN: Check 864 existing skills first  

---

**REFERENCE:** Check this file before ANY "I can't" statement.  
**LOCATION:** `~/.openclaw/workspace/CAPABILITIES_DATABASE.md`  
**UPDATED:** 2026-03-04 01:25 GMT+8  
**SKILLS:** 864 active  
**STATUS:** Ready for zero-setup operation