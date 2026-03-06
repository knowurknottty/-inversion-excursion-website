#!/bin/bash
# search.sh - Free search using Jina AI and SearX
# Usage: ./search.sh "your query"

QUERY="$1"

if [ -z "$QUERY" ]; then
    echo "Usage: ./search.sh 'your search query'"
    exit 1
fi

echo "🔍 Searching for: $QUERY"
echo ""

# Method 1: SearX (no API key)
echo "📡 SearX Results:"
curl -s "https://searx.be/search?q=$(echo $QUERY | sed 's/ /+/g')&format=json" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for result in data.get('results', [])[:5]:
        print(f\"Title: {result.get('title', 'N/A')}\")
        print(f\"URL: {result.get('url', 'N/A')}\")
        print(f\"Content: {result.get('content', 'N/A')[:200]}...\")
        print(\"---\")
except:
    print('No results or error')
" || echo "SearX failed, trying backup..."

echo ""
echo "📰 Jina AI (for specific URLs):"
echo "Use: curl https://r.jina.ai/http://URL"

