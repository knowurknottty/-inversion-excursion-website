# ClawPost

A browser-session social media relay system for automated posting. Use your existing logged-in sessions—no API keys required for most platforms.

## Architecture

```
┌─────────────┐     HTTP/WebSocket      ┌──────────────┐     WebSocket      ┌──────────────┐
│ Your Agent  │ ──────────────────────▶ │ Relay Server │ ─────────────────▶ │   Browser    │
│   (Kimi)    │                         │ (Node.js)    │                    │  Extension   │
└─────────────┘                         └──────────────┘                    └──────────────┘
                                                                                   │
                        ┌──────────────────────────────────────────────────────────┘
                        │ DOM injection / Content scripts
                        ▼
              ┌─────────────────┬─────────────────┬──────────────┐
              ▼                 ▼                 ▼              ▼
         [Twitter/X]      [LinkedIn]       [Instagram]     [TikTok]
              │                 │                 │              │
         [Bluesky]         [Facebook]       [Substack]     [Gmail/Proton]
```

## Quick Start

### 1. Relay Server

```bash
cd relay
npm install

# Copy and edit environment
cp .env.example .env
# Edit .env with your settings

npm run dev     # Development
npm start       # Production
```

### 2. Browser Extension

1. Open Chrome → Extensions → Developer mode ON
2. Click "Load unpacked" → Select `extension/` folder
3. Click extension icon → Enter Relay URL → Pair
4. Log into your social platforms in browser

### 3. API Usage

```bash
# Text-only post
curl -X POST http://localhost:4747/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"platform":"twitter","text":"Hello World!"}'

# With media
curl -X POST http://localhost:4747/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "platform=instagram" \
  -F "text=Check this out!" \
  -F "storageType=local" \
  -F "media=@/path/to/image.jpg"

# With Google Drive storage
curl -X POST http://localhost:4747/api/jobs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "platform=tiktok" \
  -F "text=New video! #fyp" \
  -F "storageType=google-drive" \
  -F "media=@/path/to/video.mp4"
```

## Supported Platforms

| Platform | Method | Media | Notes |
|----------|--------|-------|-------|
| Twitter/X | Browser session | ✓ | Full thread support |
| LinkedIn | Browser session | ✓ | Professional posts |
| Instagram | Browser session | ✓ | Feed posts (Stories limited) |
| TikTok | Browser session | ✓ | Studio upload (mobile app preferred) |
| Bluesky | Browser session | ✓ | AT Protocol |
| Substack | API | ✓ | Newsletter drafts |
| Gmail | Browser/API | ✗ | OAuth2 or SMTP |
| ProtonMail | SMTP | ✗ | Bridge required |
| Google Drive | API | ✓ | File storage |

## Configuration

### Environment Variables

```bash
# Server
CLAWPOST_API_KEY=your-api-key-here
CLAWPOST_WS_SECRET=websocket-secret-here
PORT=4747

# Google Drive (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4747/auth/google/callback

# Substack (optional)
SUBSTACK_EMAIL=your@email.com
SUBSTACK_PASSWORD=your-password

# ProtonMail (optional)
PROTONMAIL_BRIDGE_HOST=127.0.0.1
PROTONMAIL_BRIDGE_PORT=1025
PROTONMAIL_USER=your@proton.me
PROTONMAIL_PASS=bridge-password
```

### Storage Adapters

- **Local**: Files stored on relay server, served via HTTP
- **Google Drive**: OAuth2, files uploaded to Drive with public links

## WebSocket Protocol

Clients authenticate with `?secret=YOUR_WS_SECRET`.

**Job message:**
```json
{
  "type": "job",
  "payload": {
    "id": "uuid",
    "platform": "twitter",
    "text": "Hello",
    "mediaAttachments": [
      {"originalName": "photo.jpg", "mimeType": "image/jpeg", "path": "http://...", "size": 12345}
    ]
  }
}
```

## Security Notes

- Keep `CLAWPOST_WS_SECRET` and `CLAWPOST_API_KEY` secret
- Relay should run on localhost or behind HTTPS in production
- Extension only runs on platform sites you authorize
- Google Drive uploads create publicly viewable links

## Troubleshooting

**Extension shows "Disconnected"**
- Verify relay is running: `curl http://localhost:4747/health`
- Check WebSocket secret matches `.env`
- Check browser console for errors

**Jobs failing**
- Ensure you're logged into the target platform
- Check platform content script loaded (F12 → Sources)
- Verify media file format is accepted by platform

**Google Drive auth fails**
- Verify redirect URI matches Google Cloud Console
- Check OAuth consent screen is configured

## License

MIT
