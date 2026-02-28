#!/bin/bash
# SHECKLE Twitter CLI - Easy commands

BOT_DIR="/root/.openclaw/workspace/projects/sheckle/automation"
BOT_SCRIPT="$BOT_DIR/twitter_bot.py"

# Check if tweepy is installed
if ! python3 -c "import tweepy" 2>/dev/null; then
    echo "📦 Installing tweepy..."
    pip3 install tweepy -q
fi

case "$1" in
    info)
        echo "🔍 Getting user info..."
        python3 "$BOT_SCRIPT" info
        ;;
    
    thread)
        shift
        echo "🧵 Posting thread..."
        python3 "$BOT_SCRIPT" thread "$@"
        ;;
    
    price)
        # Get price data and tweet
        CA="5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
        DATA=$(curl -s "https://api.dexscreener.com/latest/dex/tokens/$CA")
        PRICE=$(echo $DATA | python3 -c "import sys,json; print(json.load(sys.stdin)['pairs'][0]['priceUsd'])")
        MCAP=$(echo $DATA | python3 -c "import sys,json; print(json.load(sys.stdin)['pairs'][0]['marketCap'])")
        
        TWEET="📊 $SHECKLE Update

Price: $$PRICE
Market Cap: $$MCAP

Dev tokens: BURNED 🔥
Liquidity: LOCKED 🔒

By the goyim, for the goyim.

CA: $CA"
        
        echo "🐦 Posting price update..."
        python3 "$BOT_SCRIPT" "$TWEET"
        ;;
    
    milestone)
        MILESTONE="$2"
        TWEET="🚀 $SHECKLE just hit $MILESTONE market cap!

From $22 to $MILESTONE. Community power.

By the goyim, for the goyim.

CA: 5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
        
        echo "🐦 Posting milestone..."
        python3 "$BOT_SCRIPT" "$TWEET"
        ;;
    
    *)
        # Single tweet
        if [ -z "$1" ]; then
            echo "Usage:"
            echo "  ./twit.sh 'Tweet text'"
            echo "  ./twit.sh info"
            echo "  ./twit.sh thread 'Tweet 1' 'Tweet 2' ..."
            echo "  ./twit.sh price"
            echo "  ./twit.sh milestone 10000"
            exit 1
        fi
        
        echo "🐦 Posting tweet..."
        python3 "$BOT_SCRIPT" "$@"
        ;;
esac

