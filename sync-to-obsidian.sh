#!/bin/bash
# Sync memory to Obsidian vault

SOURCE="/root/.openclaw/workspace/obsidian-memory"
DEST="$HOME/ObsidianVault/SENTINEL-Q"

echo "Syncing memory to Obsidian vault..."
rsync -av "$SOURCE/" "$DEST/" --exclude='.git'
echo "Sync complete: $(date)"
