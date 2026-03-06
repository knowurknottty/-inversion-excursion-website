#!/bin/bash
# SHECKLE Bot - Command Handlers
# This script handles all bot commands

BOT_TOKEN="8108423943:AAH8kA2aKmn9odpuaFebldTa06qtuKlTfGw"
CHAT_ID="-1003784705740"

# Function to send message
send_msg() {
  local text="$1"
  curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -d "chat_id=$CHAT_ID" \
    -d "text=$text" \
    -d "parse_mode=HTML" \
    -d "disable_web_page_preview=false"
}

# /start command
start_cmd() {
  send_msg "🚀 <b>Welcome to SHECKLE</b>

By the goyim, for the goyim.

The only meme coin designed to not rug you.

📊 <b>Quick Stats:</b>
• CA: <code>5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump</code>
• Price: Check /price
• Chart: Check /chart

Type /help for all commands."
}

# /help command
help_cmd() {
  send_msg "📋 <b>SHECKLE Bot Commands</b>

/price - Current price & market cap
/chart - Price chart (DexScreener)
/ca - Contract address (copy-paste)
/dashboard - Whale watch dashboard
/holders - Top holder distribution
/buy - Buy on Pump.fun
/stats - Full token statistics

By the goyim, for the goyim."
}

# /price command
price_cmd() {
  # Fetch from DexScreener API
  DATA=$(curl -s "https://api.dexscreener.com/latest/dex/tokens/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump")
  
  PRICE=$(echo $DATA | grep -o '"priceUsd":"[^"]*"' | head -1 | cut -d'"' -f4)
  MCAP=$(echo $DATA | grep -o '"marketCap":[^,}]*' | head -1 | cut -d':' -f2)
  VOL=$(echo $DATA | grep -o '"h24":[^,}]*' | head -1 | cut -d':' -f2)
  CHANGE=$(echo $DATA | grep -o '"h24":[^,}]*' | grep priceChange | head -1 | cut -d':' -f2)
  
  send_msg "💰 <b>SHECKLE Price</b>

Price: <b>$$PRICE</b>
Market Cap: <b>$$MCAP</b>
24h Volume: <b>$$VOL</b>
24h Change: <b>$$CHANGE%</b>

📊 <a href='https://dexscreener.com/solana/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump'>View Chart</a>

By the goyim, for the goyim."
}

# /chart command
chart_cmd() {
  send_msg "📊 <b>SHECKLE Chart</b>

<a href='https://dexscreener.com/solana/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump'>DexScreener Chart</a>

Track price, volume, and trades in real-time.

By the goyim, for the goyim."
}

# /ca command
ca_cmd() {
  send_msg "📋 <b>Contract Address</b>

<code>5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump</code>

Tap to copy. Verify on <a href='https://solscan.io/token/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump'>Solscan</a>.

By the goyim, for the goyim."
}

# /dashboard command
dashboard_cmd() {
  send_msg "🐋 <b>SHECKLE Whale Watch Dashboard</b>

Track holders, transactions, and transparency metrics.

<a href='https://knowurknottty.github.io/kimi-claw-workspace/projects/sheckle/dashboard/'>View Dashboard</a>

By the goyim, for the goyim."
}

# /holders command
holders_cmd() {
  send_msg "🐋 <b>Top Holders</b>

1. Liquidity Pool: 50% 🔒
2. Community Treasury: 30% 🏛️
3. Airdrop Distribution: 10% 🎁
4. Burn Address: 5% 🔥
5. Marketing: 5% 📢

Dev tokens: <b>BURNED</b>
Liquidity: <b>LOCKED</b>

By the goyim, for the goyim."
}

# /buy command
buy_cmd() {
  send_msg "🛒 <b>Buy SHECKLE</b>

<a href='https://pump.fun/coin/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump'>Buy on Pump.fun</a>

⚠️ <b>Remember:</b>
• This is a community coin
• Only invest what you can afford to lose
• Dev tokens are burned (can't rug)
• Liquidity is locked

By the goyim, for the goyim."
}

# /stats command
stats_cmd() {
  send_msg "📊 <b>SHECKLE Statistics</b>

🪙 <b>Tokenomics:</b>
• Total Supply: 1,000,000,000
• Liquidity: 50% (locked)
• Treasury: 30% (multisig)
• Airdrop: 10% (distributed)
• Burned: 5%
• Marketing: 5%

🔒 <b>Safety:</b>
• Dev tokens: BURNED
• Liquidity: LOCKED
• Ownership: Renounced

By the goyim, for the goyim."
}

# Welcome message for new members
welcome_msg() {
  local name="$1"
  send_msg "👋 Welcome to SHECKLE, $name!

By the goyim, for the goyim.

🪙 <b>Quick Links:</b>
• Chart: /chart
• Contract: /ca
• Buy: /buy
• Help: /help

This is a community coin. We rise together.

By the goyim, for the goyim."
}

# Run command based on argument
case "$1" in
  start) start_cmd ;;
  help) help_cmd ;;
  price) price_cmd ;;
  chart) chart_cmd ;;
  ca) ca_cmd ;;
  dashboard) dashboard_cmd ;;
  holders) holders_cmd ;;
  buy) buy_cmd ;;
  stats) stats_cmd ;;
  welcome) welcome_msg "$2" ;;
  *) echo "Unknown command: $1" ;;
esac

