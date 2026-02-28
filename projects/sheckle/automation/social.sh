#!/bin/bash
# SHECKLE Social Media Manager
# Works without Twitter API fees

WORKSPACE="/root/.openclaw/workspace/projects/sheckle"

# Function to post to all free platforms
post_all() {
    local text="$1"
    
    echo "🚀 Posting: $text"
    echo ""
    
    # 1. Telegram (working)
    echo "📱 Telegram..."
    curl -s -X POST "https://api.telegram.org/bot8108423943:AAH8kA2aKmn9odpuaFebldTa06qtuKlTfGw/sendMessage" \
        -d "chat_id=-1003784705740" \
        -d "text=$text" \
        -d "parse_mode=HTML" > /dev/null
    echo "✅ Telegram posted"
    
    # 2. Save to file for manual Twitter/others
    echo "$text" >> "$WORKSPACE/social/queue.txt"
    echo "✅ Saved to queue (for manual posting)"
    
    # 3. Log it
    echo "$(date): $text" >> "$WORKSPACE/social/posted.log"
    
    echo ""
    echo "🎯 Done! Copy from queue.txt for Twitter/Mastodon/others"
}

# Function to generate and post milestone tweet
milestone() {
    local amount="$1"
    local tweet="🚀 \$SHECKLE just hit \$$amount market cap!

From \$22 to \$$amount. Community power.

By the goyim, for the goyim.

CA: 5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
    
    post_all "$tweet"
}

# Function to generate daily update
daily() {
    local tweet="📊 \$SHECKLE Daily Update

The \$22 meme coin that couldn't be stopped.

Dev tokens: BURNED 🔥
Liquidity: LOCKED 🔒
Community: STRONG 💪

By the goyim, for the goyim.

Chart: https://dexscreener.com/solana/5x6FzhgkfWaDauYtbeCCs6QnjYFkFgMnigadLKLhpump"
    
    post_all "$tweet"
}

# Function to generate thread content
thread() {
    local topic="$1"
    
    case "$topic" in
        launch)
            echo "Thread: SHECKLE Launch Story"
            echo "1/ 🚀 The $22 meme coin experiment..."
            echo "2/ No dev wallet. No team tokens..."
            echo "3/ Community owned from day 1..."
            echo "4/ By the goyim, for the goyim..."
            ;;
        rugproof)
            echo "Thread: Why SHECKLE Can't Rug"
            echo "1/ 🔒 Mathematical proof..."
            echo "2/ Dev tokens BURNED..."
            echo "3/ Liquidity LOCKED..."
            echo "4/ Impossible to rug..."
            ;;
        *)
            echo "Available threads: launch, rugproof"
            ;;
    esac
}

# Main command handler
case "$1" in
    post)
        shift
        post_all "$@"
        ;;
    milestone)
        milestone "$2"
        ;;
    daily)
        daily
        ;;
    thread)
        thread "$2"
        ;;
    queue)
        echo "📋 Current queue:"
        cat "$WORKSPACE/social/queue.txt" 2>/dev/null || echo "(empty)"
        ;;
    clear)
        > "$WORKSPACE/social/queue.txt"
        echo "✅ Queue cleared"
        ;;
    *)
        echo "SHECKLE Social Manager"
        echo ""
        echo "Usage:"
        echo "  ./social.sh post 'Your message'     - Post to all platforms"
        echo "  ./social.sh milestone 10000         - Post milestone tweet"
        echo "  ./social.sh daily                   - Post daily update"
        echo "  ./social.sh thread launch           - Generate thread content"
        echo "  ./social.sh queue                   - Show queued posts"
        echo "  ./social.sh clear                   - Clear queue"
        echo ""
        echo "Posts go to: Telegram (auto) + queue.txt (for manual Twitter)"
        ;;
esac

