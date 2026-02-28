#!/bin/bash
# SHECKLE Telegram Bot Commands
# Run this to set up all bot commands via Telegram API

BOT_TOKEN="8108423943:AAH8kA2aKmn9odpuaFebldTa06qtuKlTfGw"
CHAT_ID="-1003784705740"

# Set bot commands menu
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Start the bot"},
      {"command": "help", "description": "Show all commands"},
      {"command": "price", "description": "Current token price and stats"},
      {"command": "chart", "description": "Price chart link"},
      {"command": "ca", "description": "Contract address"},
      {"command": "dashboard", "description": "Whale watch dashboard"},
      {"command": "holders", "description": "Top holders distribution"},
      {"command": "buy", "description": "Buy SHECKLE on Pump.fun"},
      {"command": "stats", "description": "Full token statistics"}
    ]
  }'

echo "✅ Bot commands set"

# Set welcome message (when user starts bot)
curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setChatDescription" \
  -d "chat_id=$CHAT_ID" \
  -d "description=By the goyim, for the goyim. The only meme coin designed to not rug you."

echo "✅ Chat description set"

