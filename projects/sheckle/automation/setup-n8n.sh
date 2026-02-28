#!/bin/bash
# n8n Setup for SHECKLE Twitter Automation
# Self-hosted, free, powerful

# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access at: http://localhost:5678
# Default credentials: admin / [set on first run]

echo "n8n is starting..."
echo "Access at: http://localhost:5678"
echo ""
echo "Next steps:"
echo "1. Open browser to http://localhost:5678"
echo "2. Set up admin account"
echo "3. Create workflow (see n8n-workflow.json)"
echo "4. Add Twitter credentials"
echo "5. Connect to Kimi via webhook"

