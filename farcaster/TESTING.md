# Farcaster Frame Testing Guide

## Warpcast Developer Mode

### Enable Developer Mode

1. Open Warpcast mobile app
2. Go to **Settings** → **Advanced** → **Developer Mode** → Toggle ON
3. Or use web: https://warpcast.com/~/developers

### Testing Your Frame

#### Method 1: Direct URL Testing

1. In Warpcast, compose a cast with your frame URL:
   ```
   https://cell-game.xyz
   ```
2. The frame embed should appear automatically
3. Tap to interact

#### Method 2: Developer Dashboard

1. Visit https://warpcast.com/~/developers/frames
2. Click **"Add Frame"**
3. Enter your domain: `cell-game.xyz`
4. Test interactions in the preview

#### Method 3: Frame Validator

Use the official validator to check your manifest:
```bash
curl -X POST https://api.warpcast.com/v2/frame-validate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://cell-game.xyz"}'
```

### Local Testing with Tunnel

#### Using ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# Expose via ngrok
ngrok http 3000

# Use the https URL in Warpcast
# Example: https://abc123.ngrok.io
```

#### Using cloudflared

```bash
# Install cloudflared
npm install -g cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3000

# Use the https URL in Warpcast
```

### Testing Checklist

#### Frame Manifest
- [ ] `farcaster.json` is accessible at `/.well-known/farcaster.json`
- [ ] `accountAssociation` is properly signed
- [ ] All image URLs are valid and publicly accessible
- [ ] `homeUrl` loads correctly

#### SDK Integration
- [ ] `sdk.actions.ready()` is called on mount
- [ ] User context (fid, username) is received
- [ ] `isInFrame()` correctly detects Warpcast environment
- [ ] `openUrl()` works for external links
- [ ] `viewProfile()` works for fid lookup

#### Share Flow
- [ ] Victory cast generates correctly
- [ ] Defeat cast generates correctly
- [ ] Character count stays under 320
- [ ] Embeds render with preview image
- [ ] Deep links with invite codes work

#### Deep Links
- [ ] `?invite=CODE` parses correctly
- [ ] `?inviter=NAME` displays inviter
- [ ] Invite banner appears for valid codes
- [ ] Accept/dismiss buttons work
- [ ] URL params cleared after accept

### Common Issues

#### Frame Not Loading
```
Problem: Frame appears as plain link
Solution: 
- Check farcaster.json is valid JSON
- Verify domain matches frame.url in manifest
- Ensure SSL certificate is valid
```

#### SDK Not Initializing
```
Problem: isInFrame() returns false in Warpcast
Solution:
- Check sdk.actions.ready() is being called
- Verify no errors in console
- Test in Warpcast mobile app (not just web)
```

#### Images Not Showing
```
Problem: OG image not appearing in cast
Solution:
- Image must be < 1MB
- Must be publicly accessible (no auth)
- Use absolute URLs (not relative)
- Recommended: 1200x630px for OG images
```

#### Share URL Too Long
```
Problem: Warpcast compose URL exceeds limits
Solution:
- Keep text under 280 characters (leaves room for URL)
- Use URL shortener for complex embeds
- Remove unnecessary URL params
```

### Debug Tools

#### Console Logging
```typescript
// Add to frame-sdk.ts for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Frame Debug] Context:', context);
  console.log('[Frame Debug] User:', context?.user);
  console.log('[Frame Debug] Client:', context?.client);
}
```

#### Frame Inspector Bookmarklet
```javascript
javascript:(function(){
  const script = document.createElement('script');
  script.src = 'https://warpcast.com/~/developers/frame-inspector.js';
  document.head.appendChild(script);
})();
```

### Testing on Mobile

1. **iOS Simulator**:
   ```bash
   # With ngrok URL, test in Safari on iOS Simulator
   # Then share to Warpcast app
   ```

2. **Physical Device**:
   - Use ngrok/cloudflared URL
   - Send yourself the link via DM
   - Test all interactions

3. **Warpcast Beta**:
   - Join TestFlight for iOS beta
   - Often has newer Frame features
   - Better for testing edge cases

### Production Checklist

Before going live:

- [ ] `farcaster.json` is valid and accessible
- [ ] Domain verification complete (add DNS TXT record if needed)
- [ ] SSL certificate is valid and not self-signed
- [ ] All images served via HTTPS
- [ ] OG images are optimized (< 500KB)
- [ ] Frame loads in < 2 seconds
- [ ] Tested on both iOS and Android
- [ ] Tested on Warpcast web and mobile
- [ ] Error handling for SDK failures
- [ ] Fallback for non-Frame environments

### Resources

- [Farcaster Frame Spec](https://docs.farcaster.xyz/developers/frames/spec)
- [Mini App SDK Docs](https://docs.farcaster.xyz/developers/frames/v2)
- [Warpcast Developer Forum](https://warpcast.com/~/developers)
- [Frame Examples](https://github.com/farcasterxyz/frames-v2-demo)

### Quick Test Commands

```bash
# Validate farcaster.json
curl -s https://cell-game.xyz/.well-known/farcaster.json | jq .

# Check frame meta tags
curl -s https://cell-game.xyz | grep -i "fc:"

# Test image accessibility
curl -I https://cell-game.xyz/og-image.png

# Test SSL
openssl s_client -connect cell-game.xyz:443 -servername cell-game.xyz
```
