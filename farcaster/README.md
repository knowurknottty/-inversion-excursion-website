# Farcaster Frame Integration

Complete Farcaster Frame integration for the Cell mini app.

## Files Overview

| File | Purpose |
|------|---------|
| `farcaster.json` | Frame manifest (place in `/public/.well-known/`) |
| `frame-sdk.ts` | SDK initialization and context handling |
| `cast-templates.ts` | Victory/defeat/invite cast generators |
| `share-flow.tsx` | React components for sharing UX |
| `deep-links.ts` | Invite codes and referral tracking |
| `TESTING.md` | Warpcast dev mode testing guide |

## Quick Start

### 1. Install Dependencies

```bash
npm install @farcaster/miniapp-sdk
```

### 2. Add Manifest

Copy `farcaster.json` to your public folder:
```
public/.well-known/farcaster.json
```

Update with your actual:
- Domain
- FID (Farcaster ID)
- Signed account association

### 3. Initialize SDK

```typescript
import { initFrame, useFrame } from './farcaster/frame-sdk';

// In your app root:
useEffect(() => {
  initFrame();
}, []);

// In components:
const { user, isInFrame } = useFrame();
```

### 4. Add Share Button

```tsx
import { ShareFlow } from './farcaster/share-flow';

// On game over:
<ShareFlow 
  gameResult="victory" 
  score={1500}
  metadata={{ rank: 5 }}
/>
```

### 5. Handle Invites

```tsx
import { useDeepLink, InviteBanner } from './farcaster/deep-links';

function App() {
  const { isInviteValid, inviteData, acceptInvite, dismissInvite } = useDeepLink();
  
  return (
    <>
      {isInviteValid && (
        <InviteBanner 
          inviterName={inviteData?.inviterName}
          onAccept={acceptInvite}
          onDismiss={dismissInvite}
        />
      )}
    </>
  );
}
```

## Integration Points

### React Hook Usage

```tsx
import { useFrame } from './farcaster/frame-sdk';

function GameComponent() {
  const { user, isInFrame, openUrl, viewProfile } = useFrame();
  
  if (!isInFrame) {
    return <div>Open in Warpcast for full experience</div>;
  }
  
  return (
    <div>
      <p>Playing as: {user?.username}</p>
      <button onClick={() => viewProfile(user!.fid)}>
        View Profile
      </button>
    </div>
  );
}
```

### Cast Generation

```tsx
import { 
  generateVictoryCast, 
  generateDefeatCast,
  shareToCast 
} from './farcaster/cast-templates';

// Victory
const victoryCast = generateVictoryCast('player', 1000, 5);
await shareToCast(victoryCast);

// Defeat
const defeatCast = generateDefeatCast('player', 500, 'trap', 3);
await shareToCast(defeatCast);
```

### Invite Friends

```tsx
import { 
  generateInviteCode, 
  generateInviteUrl,
  openWarpcastInvite 
} from './farcaster/deep-links';

const code = generateInviteCode(user?.fid);
openWarpcastInvite(code, "Join my Cell");
```

## Testing

See `TESTING.md` for complete testing instructions including:
- Warpcast developer mode
- Local tunnel setup (ngrok/cloudflared)
- Debug tools
- Common issues

## Manifest Signing

To generate valid `accountAssociation` in `farcaster.json`:

```bash
# Using Farcaster CLI
npm install -g @farcaster/hub-web

# Sign your domain
farcaster-sign --domain cell-game.xyz --fid YOUR_FID
```

Or manually via Warpcast app:
1. Settings → Developer → Sign Domain
2. Enter your domain
3. Copy the signed association to farcaster.json

## Environment Detection

```tsx
import { isInFrame } from './farcaster/frame-sdk';

if (isInFrame()) {
  // Running in Warpcast
  // Enable Frame-specific features
} else {
  // Running in browser
  // Show "Open in Warpcast" button
}
```

## Security Notes

- Never trust client-side FID alone for authentication
- Verify signatures server-side for sensitive operations
- Use invite codes with server-side validation
- Rate limit cast sharing to prevent spam

## Resources

- [Farcaster Frame Docs](https://docs.farcaster.xyz/developers/frames/)
- [Mini App SDK](https://docs.farcaster.xyz/developers/frames/v2)
- [Warpcast Developers](https://warpcast.com/~/developers)
