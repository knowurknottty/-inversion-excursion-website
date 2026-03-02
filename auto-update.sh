#!/bin/bash
# Auto-Update System for Kimi Claw Core
# Runs via cron - keeps everything current

LOG_FILE="/var/log/kimi-claw-updates.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting auto-update cycle..." >> $LOG_FILE

# 1. Update OpenClaw Gateway
echo "[$DATE] Checking OpenClaw updates..." >> $LOG_FILE
cd /usr/lib/node_modules/openclaw 2>/dev/null && npm update 2>&1 >> $LOG_FILE || echo "OpenClaw update skipped" >> $LOG_FILE

# 2. Update global npm packages (MCP servers, etc.)
echo "[$DATE] Updating global packages..." >> $LOG_FILE
npm update -g 2>&1 | tail -5 >> $LOG_FILE

# 3. Pull latest workspace from Git
echo "[$DATE] Pulling workspace updates..." >> $LOG_FILE
cd /root/.openclaw/workspace && git pull --ff-only 2>&1 >> $LOG_FILE

# 4. Update skills registry cache
echo "[$DATE] Refreshing skills cache..." >> $LOG_FILE
openclaw skills update --registry 2>&1 >> $LOG_FILE || true

# 5. Sync Obsidian vault
echo "[$DATE] Syncing Obsidian vault..." >> $LOG_FILE
/root/.openclaw/workspace/sync-to-obsidian.sh 2>&1 >> $LOG_FILE || true

# 6. Commit any local changes
echo "[$DATE] Committing local changes..." >> $LOG_FILE
cd /root/.openclaw/workspace && git add -A && git commit -m "Auto-update: $DATE" 2>&1 >> $LOG_FILE || true

# 7. Push to remote
git push 2>&1 >> $LOG_FILE || echo "Push failed or nothing to push" >> $LOG_FILE

echo "[$DATE] Auto-update complete." >> $LOG_FILE
echo "---" >> $LOG_FILE