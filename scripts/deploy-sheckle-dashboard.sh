#!/bin/bash
# deploy-sheckle-dashboard.sh
# Deploy Sheckle whale watch dashboard to Netlify
# Run this on your local machine with your credentials

set -e

echo "🚀 Deploying Sheckle Dashboard..."

# Configuration
REPO_NAME="sheckle-dashboard"
NETLIFY_SITE_NAME="sheckle-dashboard"

# Check for required tools
if ! command -v git &> /dev/null; then
    echo "❌ git is required but not installed"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx is required but not installed (install Node.js)"
    exit 1
fi

# Get GitHub token (from environment or prompt)
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Enter your GitHub Personal Access Token:"
    read -s GITHUB_TOKEN
fi

# Get Netlify token (from environment or prompt)
if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "Enter your Netlify Personal Access Token:"
    read -s NETLIFY_AUTH_TOKEN
fi

# Create repo on GitHub
echo "📁 Creating GitHub repository..."
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     -d '{"name":"'$REPO_NAME'","private":false}' \
     https://api.github.com/user/repos

# Clone and setup
echo "📦 Setting up repository..."
git clone https://github.com/knowurknottty/$REPO_NAME.git 2>/dev/null || true
cd $REPO_NAME

# Copy dashboard files from workspace
echo "📋 Copying dashboard files..."
cp -r /root/.openclaw/workspace/projects/sheckle/dashboard/* . 2>/dev/null || echo "⚠️  No dashboard files found in workspace yet"

# Initialize if needed
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/knowurknottty/$REPO_NAME.git
fi

# Commit and push
git add .
git commit -m "Initial dashboard deployment $(date +%Y-%m-%d)" || echo "No changes to commit"
git push -u origin main || git push -u origin master

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
npx netlify-cli deploy --prod --auth $NETLIFY_AUTH_TOKEN --site $NETLIFY_SITE_NAME

echo "✅ Deployment complete!"
echo "🌐 Your dashboard is live at: https://$NETLIFY_SITE_NAME.netlify.app"

