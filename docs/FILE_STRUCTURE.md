# File Structure Guide
## How to Organize Your Workspace

```
/root/.openclaw/workspace/
│
├── projects/
│   ├── sheckle/
│   │   ├── marketing/          # Twitter threads, TikTok scripts
│   │   ├── dashboard/          # HTML/JS/CSS for whale watch
│   │   ├── contracts/          # Solana program code (future)
│   │   └── docs/               # Whitepaper, tokenomics
│   │
│   ├── synsync/
│   │   ├── marketing/          # Landing page copy, content calendar
│   │   ├── research/           # Papers, citations, protocols
│   │   ├── landing-page/       # HTML/CSS improvements
│   │   └── docs/               # User guides, API docs
│   │
│   └── timebank/
│       ├── architecture/       # Technical specifications
│       ├── contracts/          # Solana program design
│       └── docs/               # Whitepaper, governance
│
├── research/
│   ├── brainwave-entrainment/  # Binaural beats, isochronic
│   ├── dsp/                    # Digital signal processing
│   ├── neurophysiology/        # EEG, brainwaves
│   └── citations.bib           # Bibliography file
│
├── marketing/
│   ├── sheckle/                # Sheckle-specific campaigns
│   ├── synsync/                # SynSync-specific campaigns
│   └── cross-promotion/        # Combined strategies
│
├── configs/
│   ├── openclaw/               # OpenClaw configuration
│   ├── git/                    # Git templates, hooks
│   └── deploy/                 # Deployment scripts
│
├── scripts/
│   ├── deploy.sh               # Deploy to Netlify
│   ├── sync-research.sh        # Sync papers to Drive
│   └── monitor.sh              # Cron job scripts
│
├── memory/
│   ├── 2026-02-28.md           # Today's session
│   ├── 2026-02-27.md           # Yesterday
│   └── archive/                # Old sessions
│
└── docs/
    ├── PROJECTS.md             # Active project status
    ├── TODO.md                 # Action items
    ├── DECISIONS.md            # Key decisions log
    └── RESOURCES.md            # Links, tools, references
```

## How to Use This Structure

### When I Create Content
- Marketing copy → `projects/{name}/marketing/`
- Research notes → `research/` or `projects/{name}/research/`
- Code → `projects/{name}/[appropriate subdir]/`
- Daily logs → `memory/YYYY-MM-DD.md`

### When You Deploy
```bash
# Sheckle dashboard
cd /root/.openclaw/workspace/projects/sheckle/dashboard
# [deploy commands with YOUR credentials]

# SynSync landing page
cd /root/.openclaw/workspace/projects/synsync/landing-page
# [deploy commands with YOUR credentials]
```

### Backing Up
```bash
# Sync to Google Drive (you configure rclone)
rclone sync /root/.openclaw/workspace/research gdrive:SynSync/Research

# Or push to GitHub (you provide token locally)
cd /root/.openclaw/workspace
git add .
git commit -m "Backup $(date +%Y-%m-%d)"
git push
```

## File Naming Conventions

- **Dates:** `YYYY-MM-DD.md` (ISO 8601)
- **Versions:** `filename-v1.md`, `filename-v2.md`
- **Drafts:** `DRAFT-filename.md`
- **Final:** `FINAL-filename.md`
- **Archive:** Move to `archive/` subdirectory

## What Goes Where

| Content Type | Location | Example |
|--------------|----------|---------|
| Daily session notes | `memory/YYYY-MM-DD.md` | `memory/2026-02-28.md` |
| Project status | `docs/PROJECTS.md` | Active tasks, blockers |
| Research papers | `research/[topic]/` | `research/brainwave-entrainment/` |
| Marketing copy | `projects/[name]/marketing/` | Twitter threads |
| Code | `projects/[name]/[type]/` | Dashboard HTML |
| Configs | `configs/[service]/` | Git templates |
| Scripts | `scripts/` | Deploy automation |

