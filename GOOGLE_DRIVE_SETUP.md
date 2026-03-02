# GOOGLE DRIVE INTEGRATION
## MCP Server Setup

---

## 🔧 INSTALLATION OPTIONS

### Option 1: Official Google MCP Server (Go)
**Repo:** https://github.com/ngs/google-mcp-server
**Status:** Cloned, needs Go build

**Build:**
```bash
cd /tmp/google-mcp-server
go build -o google-mcp-server .
```

### Option 2: Python Google Drive MCP
**Status:** Requires Python dependencies

### Option 3: Direct API + rclone (Recommended)
**Simplest approach:** Use rclone for sync, wrap with MCP

---

## 📋 SETUP INSTRUCTIONS

### Step 1: Get Google Drive API Credentials
**URL:** https://console.cloud.google.com/apis/credentials

**Steps:**
1. Go to Google Cloud Console
2. Create new project (or select existing)
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Download `client_secret.json`

### Step 2: Configure rclone
```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure
rclone config
# Select: n) New remote
# Name: gdrive
# Type: 18) Google Drive
# Client ID: (from credentials)
# Client Secret: (from credentials)
# Scope: 1) Full access
# Root folder: (leave blank for root)
```

### Step 3: Test Sync
```bash
# List files
rclone ls gdrive:

# Sync to local
rclone sync gdrive: ~/google-drive-backup
```

### Step 4: MCP Integration
Add to `~/.openclaw/mcp-servers/config.json`:
```json
{
  "mcpServers": {
    "gdrive": {
      "command": "rclone",
      "args": ["lsf", "gdrive:"],
      "description": "Google Drive file listing"
    }
  }
}
```

---

## 📁 WHAT TO SYNC

### Priority Folders
1. **SynSync/** - All product files
2. **Sheckle/** - Token documents
3. **Inversion Excursion/** - Book manuscript
4. **Research/** - Papers, studies
5. **Marketing/** - Assets, copy
6. **Legal/** - Contracts, IP

### Sync Strategy
- **Daily:** Active project folders
- **Weekly:** Archive folders
- **Monthly:** Full backup

---

## 🤖 AUTOMATION

### Auto-Sync Script
```bash
#!/bin/bash
# gdrive-auto-sync.sh

FOLDERS=(
  "SynSync"
  "Sheckle"
  "Inversion Excursion"
  "Research"
  "Marketing"
)

for folder in "${FOLDERS[@]}"; do
  echo "Syncing $folder..."
  rclone sync "gdrive:$folder" "/root/google-drive/$folder" \
    --exclude "*.tmp" \
    --exclude ".DS_Store" \
    --log-file /var/log/gdrive-sync.log
done

# After sync, ingest new files to NotebookLM
python3 /root/.openclaw/ingest-gdrive-to-notebooklm.py
```

### Cron Schedule
```bash
# Daily at 2 AM
0 2 * * * /root/.openclaw/gdrive-auto-sync.sh
```

---

## 🔐 SECURITY

### OAuth Scopes Needed
- `https://www.googleapis.com/auth/drive.readonly` (minimum)
- `https://www.googleapis.com/auth/drive` (full access)

### Best Practices
- Use service account (not personal OAuth)
- Restrict to specific folders
- Regular token rotation
- Audit access logs

---

## 📊 INTEGRATION WITH NOTEBOOKLM

### Flow
1. Google Drive files sync to local
2. New/modified files detected
3. Auto-ingest to NotebookLM
4. Knowledge base updated
5. Ready for queries

### Supported File Types
- Google Docs → Convert to text
- Google Sheets → CSV/JSON
- PDFs → Text extraction
- Images → OCR (if needed)
- Markdown → Direct ingest

---

## 🎯 USE CASES

### 1. Research Aggregation
- Auto-sync research papers folder
- Ingest to SynSync KB
- Query across all sources

### 2. Content Management
- Sync marketing assets
- Track versions
- Generate reports

### 3. Collaboration
- Team uploads to Drive
- Auto-sync to my knowledge base
- Instant access to updates

### 4. Backup & Archive
- Full Drive backup
- Version history
- Disaster recovery

---

## ⚡ IMMEDIATE NEXT STEPS

### You Need To:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 credentials
3. Enable Google Drive API
4. Download client_secret.json
5. Send me the file (or key details)

### Then I:
1. Configure rclone
2. Set up auto-sync
3. Connect to NotebookLM
4. Start ingesting your Drive

---

**Ready when you have the credentials.**