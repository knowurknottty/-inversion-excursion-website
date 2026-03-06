#!/bin/bash
# SHECKLE Twitter Poster via n8n
# Usage: ./tweet.sh "Your tweet text"

N8N_WEBHOOK="http://localhost:5678/webhook/tweet"

if [ -z "$1" ]; then
    echo "Usage: ./tweet.sh 'Your tweet text'"
    exit 1
fi

TWEET_TEXT="$1"

echo "🐦 Posting tweet: $TWEET_TEXT"

RESPONSE=$(curl -s -X POST "$N8N_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$TWEET_TEXT\"}")

if echo "$RESPONSE" | grep -q "success\|posted"; then
    echo "✅ Tweet posted successfully!"
else
    echo "❌ Failed to post tweet"
    echo "Response: $RESPONSE"
fi

