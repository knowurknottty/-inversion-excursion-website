#!/bin/bash
# Auto-tweet SHECKLE milestones and updates

N8N_WEBHOOK="http://localhost:5678/webhook/tweet"
CA="5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"

# Function to post tweet
post_tweet() {
    local text="$1"
    curl -s -X POST "$N8N_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$text\"}"
}

# Get current price data
get_price_data() {
    curl -s "https://api.dexscreener.com/latest/dex/tokens/$CA" | \
        python3 -c "
import sys, json
data = json.load(sys.stdin)
pair = data.get('pairs', [{}])[0]
print(f\"{pair.get('priceUsd', 'N/A')}|{pair.get('marketCap', 'N/A')}|{pair.get('priceChange', {}).get('h24', 'N/A')}\")
"
}

# Price milestone tweets
check_milestones() {
    DATA=$(get_price_data)
    PRICE=$(echo $DATA | cut -d'|' -f1)
    MCAP=$(echo $DATA | cut -d'|' -f2)
    
    # Check milestones
    if (( $(echo "$MCAP > 5000" | bc -l) )); then
        post_tweet "🚀 $SHECKLE just hit $5K market cap!

From $22 to $5K. Community power.

By the goyim, for the goyim.

CA: $CA"
    fi
    
    if (( $(echo "$MCAP > 10000" | bc -l) )); then
        post_tweet "🚀🚀 $SHECKLE hits $10K market cap!

The $22 experiment is working.

Dev tokens burned. Liquidity locked. Community rising.

By the goyim, for the goyim.

CA: $CA"
    fi
}

# Daily update
daily_update() {
    DATA=$(get_price_data)
    PRICE=$(echo $DATA | cut -d'|' -f1)
    MCAP=$(echo $DATA | cut -d'|' -f2)
    CHANGE=$(echo $DATA | cut -d'|' -f3)
    
    post_tweet "📊 $SHECKLE Daily Update

Price: $$PRICE
Market Cap: $$MCAP
24h Change: $CHANGE%

Dev tokens: BURNED 🔥
Liquidity: LOCKED 🔒
Community: STRONG 💪

By the goyim, for the goyim.

Chart: https://dexscreener.com/solana/$CA"
}

# Run based on argument
case "$1" in
    milestones) check_milestones ;;
    daily) daily_update ;;
    *) echo "Usage: $0 {milestones|daily}" ;;
esac

