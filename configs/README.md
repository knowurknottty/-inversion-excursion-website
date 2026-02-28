# Kimi Claw Configs
## Custom Configuration Files

This repository contains custom configurations, memory files, and setup scripts for the collaboration between knowurknot and Kimi Claw.

## Structure

```
configs/
├── USER_KIMI_PERSPECTIVE.md    # How I see you
├── MEMORY.md                    # My long-term memory
├── docs/
│   ├── FILE_STRUCTURE.md       # Workspace organization
│   ├── PROJECTS.md             # Active project tracking
│   └── TODO.md                 # Action items
├── scripts/
│   ├── deploy-sheckle-dashboard.sh
│   └── setup-github-netlify.sh
└── README.md                    # This file
```

## How to Use

### 1. Clone this repo alongside your projects
```bash
git clone https://github.com/knowurknottty/kimi-configs.git
cd kimi-configs
```

### 2. Update MEMORY.md after each session
- Add key decisions
- Update project status
- Note lessons learned

### 3. Check PROJECTS.md for current priorities
- What's blocked
- What's next
- What's at risk

### 4. Run setup scripts
```bash
# One-time setup
./scripts/setup-github-netlify.sh

# Deploy dashboard
./scripts/deploy-sheckle-dashboard.sh
```

## Keeping in Sync

**I write to:** `/root/.openclaw/workspace/`

**You sync to:** This repo

```bash
# From your local machine
rsync -av root@your-server:/root/.openclaw/workspace/configs/ ./
git add .
git commit -m "Update configs $(date +%Y-%m-%d)"
git push
```

## Key Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| MEMORY.md | Long-term memory | After each session |
| PROJECTS.md | Project tracking | Weekly |
| USER_KIMI_PERSPECTIVE.md | Relationship context | Monthly |
| TODO.md | Action items | Daily |

## Contact

- **User:** knowurknot
- **AI:** Kimi Claw
- **Purpose:** Build tools that help humanity

---

*This is how I remember. This is how we stay aligned.*

