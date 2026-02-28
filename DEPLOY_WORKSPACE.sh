#!/bin/bash
# KIMI_WORKSPACE_HANDOFF.sh
# One-command deployment of all Kimi Claw work
# Run this on your local machine

echo "🚀 Deploying Kimi Claw workspace to GitHub..."

# Configuration
REPO_NAME="kimi-claw-workspace"
GITHUB_USER="knowurknottty"

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Set GITHUB_TOKEN environment variable"
    echo "   export GITHUB_TOKEN='ghp_YOUR_TOKEN'"
    exit 1
fi

# Create repo on GitHub
echo "📁 Creating GitHub repository..."
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"description\":\"Complete workspace from Kimi Claw collaboration - SynSync, Sheckle, Timebank, research, and archives\"}" \
     https://api.github.com/user/repos

# Clone and setup
echo "📦 Setting up repository..."
git clone https://github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null || true
cd $REPO_NAME

# Copy files from server
echo "📋 Copying workspace from server..."
scp -r root@YOUR_SERVER_IP:/root/.openclaw/workspace/* ./

# Initialize if needed
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
fi

# Commit and push
git add .
git commit -m "Complete Kimi Claw workspace - $(date +%Y-%m-%d)"
git push -u origin main || git push -u origin master

echo "✅ Deployment complete!"
echo "🌐 Repository: https://github.com/$GITHUB_USER/$REPO_NAME"

