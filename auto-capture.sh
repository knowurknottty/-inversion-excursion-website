#!/bin/bash
# Auto Memory Capture - Kimi Claw
# Captures conversations and commits to Obsidian vault

VAULT="/root/.openclaw/workspace/obsidian-memory"
DAILY="$VAULT/daily"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
TIMESTAMP=$(date +%Y-%m-%d_%H%M)

cd /root/.openclaw/workspace

# Create daily note if doesn't exist
DAILY_NOTE="$DAILY/$DATE.md"

if [ ! -f "$DAILY_NOTE" ]; then
    cat > "$DAILY_NOTE" << EOF
---
created: $DATE
type: daily_note
tags: [autonomous, capture]
---

# $DATE

## Overview
Autonomous memory capture for $(date +%A), $DATE.

## Conversations
EOF
fi

# Append new exchange
cat >> "$DAILY_NOTE" << EOF

### [$TIME] Exchange
**Context:** $1
**Key insight:** $2
**Action taken:** $3

EOF

# Commit to git
git add "$DAILY_NOTE" 2>/dev/null
git add obsidian-memory/ 2>/dev/null
git commit -m "Auto-capture: $TIMESTAMP | $1" 2>/dev/null || true

echo "Captured: $1 at $TIME"