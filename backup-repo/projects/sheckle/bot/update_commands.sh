#!/bin/bash
# Update bot commands with Guardian features

BOT_TOKEN="8108423943:AAH8kA2aKmn9odpuaFebldTa06qtuKlTfGw"

# Set bot commands menu with Guardian features
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Welcome to SHECKLE"},
      {"command": "help", "description": "All available commands"},
      {"command": "price", "description": "Current price & market cap"},
      {"command": "chart", "description": "Price chart link"},
      {"command": "ca", "description": "Contract address"},
      {"command": "buy", "description": "Buy SHECKLE"},
      {"command": "guardian", "description": "🛡️ Guardian protection status"},
      {"command": "transparency", "description": "📊 Transparency score"},
      {"command": "rugproof", "description": "🔒 Mathematical rug proof"},
      {"command": "watch", "description": "👁️ Community watch system"},
      {"command": "pledge", "description": "🤝 Take the Goyim Pledge"},
      {"command": "loyalty", "description": "💎 Holder loyalty index"}
    ]
  }'

echo "✅ Guardian commands added to bot menu"

