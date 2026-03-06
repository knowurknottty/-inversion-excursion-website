#!/bin/bash
# Episodic Capture - Bonfires Framework
# Runs every 20 minutes, extracts entities and relationships

VAULT="/root/.openclaw/workspace/obsidian-memory"
EPISODES="$VAULT/episodes"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)

cd /root/.openclaw/workspace

# Get last 20 minutes of transcript (if available)
# This is a template - actual transcript capture depends on session logging

cat > "$EPISODES/${DATE}_${TIME}.md" << EOF
---
timestamp: $DATE $TIME
duration: 20min
type: episode
tags: []
---

# Episode: $TIME

## Entities
- 

## Relationships
- 

## Key Concepts
- 

## Vibe

---
*Auto-generated: $(date)*
EOF

git add "$EPISODES/" 2>/dev/null
git commit -m "Episodic capture: $DATE $TIME" 2>/dev/null || true