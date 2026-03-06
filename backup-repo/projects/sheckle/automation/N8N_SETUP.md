# n8n Setup Guide for SHECKLE Twitter Automation

## What is n8n?
Self-hosted workflow automation (like Zapier, but free and on your server)

## Step 1: Install n8n

```bash
# Install Node.js if not present
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install n8n
npm install -g n8n

# Start n8n
n8n start
```

Access at: `http://YOUR_SERVER_IP:5678`

## Step 2: First Run Setup

1. Open browser to `http://YOUR_SERVER_IP:5678`
2. Create admin account
3. Set up basic settings

## Step 3: Add Twitter Credentials

1. In n8n, go to Settings → Credentials
2. Click "Add Credential"
3. Select "Twitter OAuth1 API"
4. Enter:
   - Consumer Key (API Key)
   - Consumer Secret (API Secret)
   - Access Token
   - Access Token Secret
5. Save

## Step 4: Import Workflow

1. Download `n8n-workflow.json` from this repo
2. In n8n: Workflows → Import from File
3. Select `n8n-workflow.json`
4. Activate workflow

## Step 5: Get Webhook URL

1. Open the workflow
2. Click on "Webhook" node
3. Copy the webhook URL (looks like: `http://localhost:5678/webhook/sheckle-tweet`)
4. This is what Kimi will use to trigger tweets

## Step 6: Test

```bash
# Test the webhook
curl -X POST http://localhost:5678/webhook/sheckle-tweet \
  -H "Content-Type: application/json" \
  -d '{"text": "Test tweet from n8n!"}'
```

## How Kimi Uses It

Once n8n is running, I can POST tweets to the webhook:

```bash
curl -X POST http://YOUR_SERVER_IP:5678/webhook/sheckle-tweet \
  -d '{"text": "$SHECKLE is pumping! 🚀"}'
```

## Automation Ideas

1. **Price Alerts** → Auto-tweet at milestones
2. **Daily Updates** → Scheduled price posts
3. **Community Highlights** → Auto-retweet holders
4. **News Aggregation** → Post from multiple sources

## Security

- n8n runs on your server (localhost:5678)
- Use firewall to restrict access: `ufw allow from YOUR_IP to any port 5678`
- Or use SSH tunnel for remote access

## Running 24/7

```bash
# Using pm2
npm install -g pm2
pm2 start n8n
pm2 save
pm2 startup

# Or systemd
sudo systemctl enable n8n
sudo systemctl start n8n
```

