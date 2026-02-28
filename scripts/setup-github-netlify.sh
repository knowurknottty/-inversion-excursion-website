#!/bin/bash
# setup-github-netlify.sh
# One-time setup for GitHub and Netlify integration
# Run this on your local machine

echo "🔧 Setting up GitHub and Netlify integration..."
echo ""

# ========== GITHUB SETUP ==========
echo "📋 GitHub Setup:"
echo ""
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Select scopes:"
echo "   ✅ repo (full control)"
echo "   ✅ workflow (if using GitHub Actions)"
echo "4. Generate and COPY the token immediately"
echo ""
echo "5. Set it as environment variable:"
echo "   export GITHUB_TOKEN='ghp_xxxxxxxxxxxxxxxxxxxx'"
echo ""

# ========== NETLIFY SETUP ==========
echo "📋 Netlify Setup:"
echo ""
echo "1. Go to: https://app.netlify.com/user/applications/personal"
echo "2. Click 'New access token'"
echo "3. Name it: 'sheckle-deploy'"
echo "4. Generate and COPY the token immediately"
echo ""
echo "5. Set it as environment variable:"
echo "   export NETLIFY_AUTH_TOKEN='nfp_xxxxxxxxxxxxxxxxxxxx'"
echo ""

# ========== VERIFY SETUP ==========
echo "📋 Verify Setup:"
echo ""
echo "Test GitHub:"
echo "   curl -H 'Authorization: token \$GITHUB_TOKEN' https://api.github.com/user"
echo ""
echo "Test Netlify:"
echo "   npx netlify-cli login --auth \$NETLIFY_AUTH_TOKEN"
echo ""

# ========== MAKE SCRIPTS EXECUTABLE ==========
echo "📋 Prepare Scripts:"
echo ""
echo "On your local machine, run:"
echo "   chmod +x /root/.openclaw/workspace/scripts/*.sh"
echo ""

# ========== DEPLOYMENT WORKFLOW ==========
echo "📋 Deployment Workflow:"
echo ""
echo "1. Kimi writes files to workspace"
echo "2. You copy to local machine:"
echo "   scp -r root@your-server:/root/.openclaw/workspace/projects/sheckle/dashboard ./"
echo ""
echo "3. You run deployment:"
echo "   cd dashboard"
echo "   ../deploy-sheckle-dashboard.sh"
echo ""

echo "✅ Setup guide complete!"

