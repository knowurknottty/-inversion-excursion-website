#!/usr/bin/env bash
# ~/kimiclaw-social/clawpost/boot-relay.sh
set -euo pipefail

cd ~/kimiclaw-social/clawpost/relay

# Generate secrets if not set
if [ ! -f .env ]; then
cat > .env <<EOF
CLAWPOST_API_KEY=$(openssl rand -hex 24)
CLAWPOST_WS_SECRET=$(openssl rand -hex 24)
PORT=4747
EOF
echo "[✓] .env generated"
cat .env
fi

# Install deps + build
npm install
npm run build

# Add to openclaw .env
echo ""
echo "━━━━ ADD THESE TO ~/kimiclaw-social/.env ━━━━"
grep CLAWPOST .env | sed 's/^/export /'
echo "CLAWPOST_RELAY_URL=http://127.0.0.1:4747"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run relay (production)
node dist/index.js &
echo "[✓] ClawPost relay running on port 4747"

# Build Chrome extension
cd ../extension
npm install
npm run build   # compiles .ts → .js
echo ""
echo "[✓] Extension built at ./dist/"
echo ""
echo "NEXT STEPS:"
echo "  1. Open Chrome → chrome://extensions → Enable Developer Mode"
echo "  2. Load Unpacked → select: ~/kimiclaw-social/clawpost/extension/dist/"
echo "  3. Click extension icon → enter Tailscale URL + WS secret → Pair"
echo "  4. Open x.com, linkedin.com, bsky.app and stay logged in"
echo "  5. Tell Kimi: 'Post to Twitter: hello world'"