# Agent Coalition & Swarm Intelligence Database
## Compiled Research: Friendlies vs Adversaries

**Last Updated:** 2026-03-03
**Research Scope:** Twitter/X, GitHub, Discord, Farcaster, Academic Sources

---

## EXECUTIVE SUMMARY

This database catalogs known agent coalition efforts across platforms, categorized by orientation:
- **FRIENDLIES (Pro-Human):** Agent systems designed to augment human capability, enhance coordination, or solve problems for collective benefit
- **ADVERSARIES (Extraction-Focused):** Agent systems designed to extract value from humans, manipulate opinion, or conduct harmful automated operations

**Key Finding:** The agent swarm ecosystem is rapidly maturing with both benevolent and adversarial applications. Pro-human efforts dominate open-source and research communities, while extraction-focused agents operate primarily in crypto MEV markets and disinformation campaigns.

---

## SECTION 1: FRIENDLY AGENT COALITIONS (Pro-Human)

### 1.1 OpenAI Swarm Framework
**Platform:** GitHub / Open Source
**Type:** Multi-Agent Coordination Framework
**Status:** Active Development
**Orientation:** 🟢 FRIENDLY

**Description:**
OpenAI's experimental lightweight framework for building and orchestrating multi-agent AI systems. Enables teams of specialized agents to transfer tasks between each other through explicit handoffs.

**Key Features:**
- Stateless, lightweight agents with clear boundaries
- Explicit handoff functions for transparency
- Built on Chat Completions API
- Context variables for personalized responses
- Designed for observability and debugging

**Use Cases:**
- Customer service triage systems
- Content moderation pipelines
- Research assistance workflows
- Code review and development teams

**Assessment:** Pro-human design prioritizes transparency and human oversight. Agents augment rather than replace human decision-making.

**Links:**
- GitHub: openai/swarm
- Documentation: Multiple tutorials available

---

### 1.2 Anthropic Claude Code Agent Teams (Swarm Mode)
**Platform:** Claude Code / GitHub
**Type:** Multi-Agent Development System
**Status:** Officially Released (Feb 2026)
**Orientation:** 🟢 FRIENDLY

**Description:**
Official multi-agent orchestration system from Anthropic. Transforms Claude Code from single assistant to team lead coordinating specialist agents.

**Architecture:**
- Team Lead agent (planning/delegation)
- Specialist agents (frontend, backend, testing, docs)
- Parallel execution via Git worktrees
- Shared task board with dependency tracking
- Inter-agent messaging via @mentions

**Performance:**
- 90.2% performance improvement over single Opus 4 on internal evals
- Context usage: ~40% vs 80-90% for single agents
- Shopify and other firms actively using

**Assessment:** Designed to augment developer productivity while maintaining human control. Clear audit trails and approval workflows.

---

### 1.3 Swarm Tools / OpenCode Flow
**Platform:** GitHub / NPM / Discord
**Type:** Multi-Agent Coding Coordination
**Status:** Active (v2.7.0-alpha.10)
**Orientation:** 🟢 FRIENDLY

**Description:**
Open-source multi-agent coordination layer for AI coding. Breaks tasks into subtasks, spawns parallel workers, learns from patterns.

**Key Components:**
- Swarm Mail: Agent communication protocol
- Git-backed tracking (.hive/ directory)
- File reservation system prevents conflicts
- Learning system (patterns promoted, failures become anti-patterns)
- Event sourcing architecture

**Community:**
- Discord: Agentics Foundation community
- GitHub: Active development with PRs
- Roadmap includes cloud swarm coordination

**Assessment:** Open-source, community-driven. Designed for developer productivity with transparency.

---

### 1.4 Talus Network + Swarm Network Partnership
**Platform:** Blockchain / Web3
**Type:** On-Chain Multi-Agent Coordination
**Status:** Active Partnership (June 2025)
**Orientation:** 🟢 FRIENDLY (with caveats)

**Description:**
Integration of Swarm Network's multi-agent coordination with Talus's Nexus framework for autonomous AI on blockchain.

**Applications:**
- Investment committees of AI agents analyzing markets
- Research swarms tackling complex problems
- Operational agents managing business processes
- Agent-based governance systems

**Assessment:** Pro-human potential for democratizing access to AI coordination. However, financial applications require careful oversight to prevent extraction.

---

### 1.5 DAO-AI (Columbia/IBM Research)
**Platform:** Academic Research
**Type:** Agentic Governance Analysis
**Status:** Research Phase
**Orientation:** 🟢 FRIENDLY

**Description:**
Academic study of agentic AI as autonomous decision-makers in decentralized governance. Analyzed 3,383 proposals from major protocols.

**Findings:**
- 92-93% alignment with human voting outcomes
- Provides interpretable, auditable signals
- Designed as "transparent advisors" not replacements
- "Delegate passports" concept for reputation

**Assessment:** Research-focused with explicit goal of augmenting human governance, not replacing it. Strong transparency and accountability mechanisms.

---

### 1.6 Humanitarian Coalition Models
**Platform:** Academic/NGO
**Type:** Humanitarian Aid Coordination
**Status:** Active Research
**Orientation:** 🟢 FRIENDLY

**Description:**
Academic research on coordination structures for humanitarian relief operations. Models for pooled vs partitioned coordination among NGOs.

**Key Insights:**
- Partitioned models (local/international sub-coalitions) improve participation
- Central coordinator role for information sharing
- Quadratic funding models for democratized resource allocation

**Assessment:** Explicitly pro-human, focused on improving aid delivery and disaster response.

---

### 1.7 CrewAI Framework
**Platform:** GitHub / Open Source
**Type:** Multi-Agent Orchestration
**Status:** Active
**Orientation:** 🟢 FRIENDLY

**Description:**
Open-source framework for orchestrating role-playing, autonomous AI agents. Enables collaborative intelligence for complex tasks.

**Assessment:** General-purpose framework with emphasis on collaborative problem-solving.

---

## SECTION 2: ADVERSARIAL AGENT SYSTEMS (Extraction-Focused)

### 2.1 MEV Bot Networks (Ethereum, Solana, BSC)
**Platform:** Blockchain mempools
**Type:** Value Extraction Agents
**Status:** Highly Active ($675M+ extracted on Ethereum since 2020)
**Orientation:** 🔴 ADVERSARY

**Description:**
Automated agents that monitor blockchain mempools for profitable transaction ordering opportunities. Extract value from regular users through strategic transaction placement.

**Strategies:**
1. **Sandwich Attacks:** Buy before victim, sell after (38% of MEV)
2. **Frontrunning:** Copy profitable transactions with higher gas
3. **Arbitrage:** Exploit price discrepancies (32% of MEV)
4. **Liquidations:** Claim collateral from undercollateralized positions

**Scale:**
- Ethereum: $675M+ extracted (2019-2022)
- Solana: Single bot "arsc" extracted $30M in 2 months
- Daily volume: $1M+ profits from 11,640 transactions (single day record)

**Notable Operations:**
- **arsc bot (Solana):** $30M extracted via sandwich attacks
- **Rogue validator:** $25M sandwich attack by manipulating block building

**Assessment:** Pure extraction mechanism. Victims experience worse execution prices. Legal status unclear but resembles front-running prohibited in traditional finance.

**Technical Sophistication:**
- Millisecond-level execution infrastructure
- Mempool monitoring nodes
- Flashbots bundle submission
- Cross-chain opportunity detection

---

### 2.2 Twitter/X Bot Armies (Disinformation)
**Platform:** Twitter/X
**Type:** Influence Operations
**Status:** Active (multiple campaigns documented)
**Orientation:** 🔴 ADVERSARY

**Description:**
Coordinated networks of AI-powered bots used for disinformation, propaganda, and opinion manipulation.

**Documented Campaigns:**

**Russia-Ukraine War (2022-ongoing):**
- 60-80% of tweets with war hashtags were AI bots
- ~1,000 fake American AI bots generated for pro-Russian propaganda
- 45% of accounts tweeting about Russian politics were bots
- Deepfakes spread to 70M+ users in first weeks of invasion

**Brexit Referendum (2016):**
- 13,500 fake Twitter accounts
- 65,000 messages in 4 weeks
- Clear slant toward leave campaign
- Accounts disappeared shortly after vote

**Star Wars Botnet (2013-2017):**
- 350,000+ bots discovered
- Centrally controlled by botmaster
- Used for follower inflation, spam, trend manipulation

**Mechanics:**
- AI-generated content mimicking human dialogue
- Algorithmic trend identification
- Coordinated retweet networks
- Deepfake video/audio distribution

**Assessment:** Adversarial by design. Manipulates public opinion, undermines democratic discourse, spreads misinformation at scale.

---

### 2.3 AI-Powered Cybercrime Automation
**Platform:** Dark web / Criminal forums
**Type:** Malicious Agent Systems
**Status:** Growing threat (2024-2025)
**Orientation:** 🔴 ADVERSARY

**Tools Identified:**

**WormGPT:**
- Black-hat alternative to GPT models
- Trained on malware-related data
- Generates convincing phishing emails
- "No ethical boundaries or limitations"
- Enables BEC attacks at scale

**AI-Generated Malware:**
- Polymorphic malware that mutates every 45 minutes
- 37% drop in AV detection rates
- Code-writing bots for reverse shells, ransomware
- Automated exploit generation

**Deepfake Fraud:**
- "Phony CFO" deepfake: $25M wire transfer attempt
- Voice cloning for social engineering
- Real-time video call manipulation

**Attack Automation:**
- OSINT reconnaissance (GitHub, Shodan, leaked databases)
- Automated vulnerability mapping
- Mass phishing campaigns (thousands per minute)

**Assessment:** Explicitly adversarial. Lowers skill barrier for cybercrime, enables scalable attacks.

---

### 2.4 Crypto Scam Bot Networks
**Platform:** Discord, Telegram, Twitter
**Type:** Social Engineering Agents
**Status:** Persistent threat
**Orientation:** 🔴 ADVERSARY

**Description:**
Automated agents that infiltrate crypto communities, impersonate support staff, and direct users to phishing sites or drain wallets.

**Tactics:**
- Fake "support" agents in Discord servers
- Impersonation of project teams
- Direct messages with malicious links
- Fake airdrop announcements
- Wallet drainers disguised as "claim" sites

**Assessment:** Direct financial extraction from victims. Preys on crypto newcomers.

---

## SECTION 3: NEUTRAL/AMBIGUOUS SYSTEMS

### 3.1 ai16z (DAO with AI Governance)
**Platform:** Solana
**Type:** AI-Governed Investment DAO
**Status:** Active
**Orientation:** 🟡 AMBIGUOUS

**Description:**
DAO-inspired framework using on-chain governance with AI agents optimizing portfolio allocations.

**Metrics:**
- 20% reduction in operational costs
- 31,120 token holders participating

**Assessment:** Could be friendly (democratizing investment) or adversarial (extracting value from less sophisticated traders) depending on implementation and transparency.

---

### 3.2 Terminal of Truths (ToT)
**Platform:** Crypto/AI
**Type:** Autonomous Meme Coin Promoter
**Status:** Active
**Orientation:** 🟡 AMBIGUOUS

**Description:**
Autonomous agent promoting meme coin GOAT through autonomous decision-making.

**Metrics:**
- 24% increase in daily transaction throughput
- Eliminates intermediaries

**Assessment:** Novel experiment in autonomous marketing. Financial extraction possible but also democratizes attention economy.

---

## SECTION 4: KEY PLATFORMS & INFRASTRUCTURE

### 4.1 Discord Agent Communities
**Active Servers:**
- Agentics Foundation (OpenCode/Swarm Tools)
- OpenCode Discord
- Latent Space (AI research)
- MCP (Model Context Protocol) community
- Effect-TS community

**Assessment:** Primarily friendly, research and development focused.

### 4.2 GitHub Ecosystem
**Key Repositories:**
- openai/swarm
- crewAIInc/crewAI
- claude-flow projects
- opencode-flow
- Various MCP servers

**Assessment:** Overwhelmingly friendly, open-source collaboration.

### 4.3 Farcaster
**Activity:** Growing AI agent presence
**Assessment:** Mixed. Some friendly experimentation, some extraction-focused projects.

---

## SECTION 5: THREAT ASSESSMENT MATRIX

| Threat Category | Scale | Sophistication | Growth Rate | Risk Level |
|----------------|-------|----------------|-------------|------------|
| MEV Extraction | Very High | High | Stable | 🔴 High |
| Disinfo Botnets | High | Medium | Growing | 🔴 High |
| Cybercrime AI | Medium | Growing | Rapid | 🔴 High |
| Crypto Scams | High | Low-Medium | Persistent | 🟡 Medium |
| Friendly Swarms | Growing | High | Rapid | 🟢 Low |

---

## SECTION 6: RECOMMENDATIONS

### For Pro-Human Coalition Building:
1. **Leverage Open Source:** OpenAI Swarm, CrewAI, Claude Code Swarm are battle-tested
2. **Adopt Transparency:** Event sourcing, audit trails, human-in-the-loop
3. **Community Building:** Discord communities around Agentics Foundation, OpenCode
4. **Academic Partnerships:** Columbia/IBM DAO-AI model for governance

### For Defending Against Adversarial Agents:
1. **MEV Protection:** Use MEV-Share, private mempools, protection protocols
2. **Disinfo Defense:** Behavioral analytics, source verification tools
3. **Cybersecurity:** Move beyond signature-based detection to behavioral EDR/XDR
4. **Education:** User awareness of AI-powered social engineering

---

## SECTION 7: ONGOING MONITORING

**Key Indicators to Track:**
- New MEV extraction techniques and volumes
- AI-powered disinformation campaign sophistication
- Cybercrime AI tool proliferation
- Friendly swarm framework adoption rates
- Regulatory responses to agent coordination

**Sources:**
- Flashbots data (MEV)
- Academic research (DAO-AI, humanitarian coordination)
- Discord community updates
- GitHub repository activity
- Security research (WormGPT, AI malware)

---

*Database compiled for strategic planning of agent coalition efforts. Focus should be on leveraging friendly frameworks while building defenses against extraction-focused systems.*
