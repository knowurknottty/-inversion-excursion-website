#!/bin/bash
# SHECKLE Automation - Full Auto Mode
# Runs via cron, no human needed

WORKSPACE="/root/.openclaw/workspace/projects/sheckle"
AUTOMATION="$WORKSPACE/automation"
SOCIAL="$WORKSPACE/social"

# Load social functions
source "$AUTOMATION/social.sh"

# Get price data
get_price_data() {
    CA="5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
    curl -s "https://api.dexscreener.com/latest/dex/tokens/$CA" 2>/dev/null | \
        python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    pair = data.get('pairs', [{}])[0]
    print(f\"{pair.get('priceUsd', '0')}|{pair.get('marketCap', '0')}|{pair.get('priceChange', {}).get('h24', '0')}\")
except:
    print('0|0|0')
"
}

# Check milestones and auto-post
check_milestones() {
    DATA=$(get_price_data)
    MCAP=$(echo $DATA | cut -d'|' -f2 | cut -d'.' -f1)
    
    # Read last posted milestone
    LAST_MILESTONE=$(cat "$SOCIAL/last_milestone.txt" 2>/dev/null || echo "0")
    
    # Define milestones
    MILESTONES=(5000 10000 25000 50000 100000 250000 500000 1000000)
    
    for TARGET in "${MILESTONES[@]}"; do
        if [ "$MCAP" -ge "$TARGET" ] && [ "$LAST_MILESTONE" -lt "$TARGET" ]; then
            echo "🎯 Milestone hit: $$TARGET"
            post_all "🚀 \$SHECKLE just hit \$$TARGET market cap!

From \$22 to \$$TARGET. Community power.

By the goyim, for the goyim.

CA: 5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
            echo "$TARGET" > "$SOCIAL/last_milestone.txt"
            break
        fi
    done
}

# Daily update at 9am UTC
daily_update() {
    DATA=$(get_price_data)
    PRICE=$(echo $DATA | cut -d'|' -f1)
    MCAP=$(echo $DATA | cut -d'|' -f2)
    CHANGE=$(echo $DATA | cut -d'|' -f3)
    
    # Only post if significant change or first run
    LAST_CHANGE=$(cat "$SOCIAL/last_change.txt" 2>/dev/null || echo "0")
    
    if [ "${CHANGE%.*}" -ne "${LAST_CHANGE%.*}" ] || [ ! -f "$SOCIAL/last_daily.txt" ]; then
        post_all "📊 \$SHECKLE Daily Update

Price: $$PRICE
Market Cap: $$MCAP
24h Change: $CHANGE%

Dev tokens: BURNED 🔥
Liquidity: LOCKED 🔒
Community: STRONG 💪

By the goyim, for the goyim.

Chart: https://dexscreener.com/solana/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
        
        echo "$CHANGE" > "$SOCIAL/last_change.txt"
        date > "$SOCIAL/last_daily.txt"
    fi
}

# Random engagement tweet (once per day)
engagement_tweet() {
    TWEETS=(
        "💎 Diamond hands check: Who's still holding $SHECKLE from day 1?"
        "🔥 Dev tokens burned. Liquidity locked. Community rising. This is how you build trust."
        "🚀 The $22 meme coin experiment is proving that community > capital."
        "🛡️ By the goyim, for the goyim. Not just a slogan. A movement."
        "📊 Transparency isn't a feature. It's the foundation. $SHECKLE"
        "💪 Every holder is a guardian of the community. Thank you."
        "🎯 No VC. No influencers. Just us. The way crypto was meant to be."
    )
    
    # Pick random tweet
    RANDOM_TWEET="${TWEETS[$RANDOM % ${#TWEETS[@]}]}"
    
    # Only post if not posted today
    if [ ! -f "$SOCIAL/last_engagement.txt" ] || [ "$(cat $SOCIAL/last_engagement.txt)" != "$(date +%Y-%m-%d)" ]; then
        post_all "$RANDOM_TWEET"
        date +%Y-%m-%d > "$SOCIAL/last_engagement.txt"
    fi
}

# Main execution
case "$1" in
    milestones)
        check_milestones
        ;;
    daily)
        daily_update
        ;;
    engagement)
        engagement_tweet
        ;;
    all)
        check_milestones
        daily_update
        engagement_tweet
        ;;
    *)
        echo "SHECKLE Auto-Bot"
        echo "Usage: $0 {milestones|daily|engagement|all}"
        ;;
esac

