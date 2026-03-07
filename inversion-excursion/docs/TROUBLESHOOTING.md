# Troubleshooting Guide

Common issues and their solutions for The Inversion Excursion.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [Authentication Issues](#authentication-issues)
4. [Blockchain Issues](#blockchain-issues)
5. [SynSync Issues](#synsync-issues)
6. [Battle Issues](#battle-issues)
7. [Minting Issues](#minting-issues)
8. [Performance Issues](#performance-issues)
9. [Farcaster Frame Issues](#farcaster-frame-issues)
10. [Getting Help](#getting-help)

---

## Installation Issues

### `npm install` fails with peer dependency errors

**Problem**: Package conflicts during installation.

**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

---

### `next dev` fails with "Cannot find module"

**Problem**: TypeScript paths not resolved.

**Solution**:
```bash
# Regenerate TypeScript configuration
npx tsc --build --force

# Check tsconfig.json paths
"paths": {
  "@/*": ["./src/*"]
}
```

---

### Environment variables not loading

**Problem**: `.env.local` not being read.

**Solution**:
```bash
# Verify file location
ls -la .env.local

# Check variable names (must start with NEXT_PUBLIC_ for client)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://..."

# Restart dev server after changes
```

---

## Database Issues

### "Prisma Client could not locate the Query Engine"

**Problem**: Prisma client not generated.

**Solution**:
```bash
# Regenerate client
npm run db:generate

# Or manually
npx prisma generate

# Clear cache if needed
rm -rf node_modules/.prisma
npm run db:generate
```

---

### "Database connection failed"

**Problem**: PostgreSQL not accessible.

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready
# or
sudo systemctl status postgresql

# Verify connection string format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

---

### Migration fails with "Database is locked"

**Problem**: Concurrent migration attempts.

**Solution**:
```bash
# Reset migration state
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Or for development only
npx prisma migrate reset --force
```

---

### "Field does not exist on model"

**Problem**: Schema out of sync with database.

**Solution**:
```bash
# Pull current schema from database
npx prisma db pull

# Or push local schema
npx prisma db push

# Then regenerate client
npm run db:generate
```

---

## Authentication Issues

### "Invalid SIWE message"

**Problem**: Message format or signature mismatch.

**Solution**:
```typescript
// Verify message format
const message = createSiweMessage({
  domain: window.location.host,
  address: address,
  statement: 'Sign in to The Inversion Excursion',
  uri: window.location.origin,
  version: '1',
  chainId: 8453, // Base
  nonce: nonce,
  issuedAt: new Date().toISOString(),
});

// Ensure nonce matches
// Check clock sync (issuedAt must be recent)
```

---

### "JWT expired" or "Invalid token"

**Problem**: Token expired or malformed.

**Solution**:
```bash
# Re-authenticate
# Token lifetime is 7 days

# Check JWT_SECRET is set and consistent
JWT_SECRET="your-32-char-secret-key"
```

---

### Farcaster signature verification fails

**Problem**: FID mismatch or invalid signer.

**Solution**:
```typescript
// Verify FID in message resources
resources: [`farcaster://fid/${fid}`]

// Check Farcaster hub connection
FARCASTER_HUB_URL="https://hub.pinata.cloud"

// Verify with hub API
const response = await fetch(`${FARCASTER_HUB_URL}/v1/verifications?fid=${fid}`);
```

---

## Blockchain Issues

### "Insufficient funds for gas"

**Problem**: Wallet has no ETH on Base.

**Solution**:
```bash
# Get Base ETH from faucet (testnet)
# https://basefaucet.org

# Or bridge from Ethereum mainnet
# https://bridge.base.org

# Check balance
const balance = await publicClient.getBalance({ address });
```

---

### "Contract call reverted"

**Problem**: Smart contract error.

**Solution**:
```typescript
// Enable debug logging
const result = await publicClient.simulateContract({
  ...config,
  account: address,
});

// Check contract address is correct
// Verify ABI matches deployed contract
// Check function parameters
```

---

### "User operation failed"

**Problem**: ERC-4337 paymaster issue.

**Solution**:
```bash
# Check paymaster has funds
# Verify EntryPoint address
ENTRYPOINT_ADDRESS="0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

# Check sponsorship config
# Verify daily limits not exceeded
```

---

## SynSync Issues

### "Audio context not supported"

**Problem**: Browser doesn't support Web Audio API.

**Solution**:
```typescript
// Check support before initializing
if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
  // Fallback or error message
}

// Ensure HTTPS (required for AudioContext)
// Check autoplay policy
```

---

### "Entrainment verification failed"

**Problem**: Proof signature invalid.

**Solution**:
```typescript
// Verify frequency deviation is within tolerance
const avgDeviation = calculateDeviation(actualFrequencies, targetFrequency);
if (avgDeviation > 2.0) {
  // Too much deviation, proof invalid
}

// Check timestamp is recent (within 5 minutes)
if (Date.now() - proofTimestamp > 5 * 60 * 1000) {
  // Proof expired
}
```

---

### No audio output

**Problem**: Audio routing or permissions.

**Solution**:
```bash
# Check browser audio permissions
# Verify headphones/speakers connected
# Check system volume

# Test audio context
const oscillator = audioContext.createOscillator();
oscillator.connect(audioContext.destination);
oscillator.start();
// Should hear tone
```

---

## Battle Issues

### "Battle not found"

**Problem**: Invalid battle ID or battle expired.

**Solution**:
```typescript
// Check battle ID format (UUID)
// Verify battle hasn't ended
// Check player is participant

const battle = await prisma.battle.findFirst({
  where: {
    id: battleId,
    OR: [
      { player1Id: playerId },
      { player2Id: playerId }
    ],
    status: { in: ['PENDING', 'ACTIVE'] }
  }
});
```

---

### "Not your turn"

**Problem**: Turn validation failing.

**Solution**:
```typescript
// Check current turn calculation
const isPlayer1Turn = battle.currentTurn % 2 === 1;
const isPlayer1 = battle.player1Id === playerId;

if (isPlayer1 !== isPlayer1Turn) {
  throw new Error('Not your turn');
}
```

---

### Actions not processing

**Problem**: WebSocket or polling issue.

**Solution**:
```typescript
// Implement retry logic
const submitWithRetry = async (action, retries = 3) => {
  try {
    return await submitAction(action);
  } catch (error) {
    if (retries > 0) {
      await sleep(1000);
      return submitWithRetry(action, retries - 1);
    }
    throw error;
  }
};

// Check network connection
// Verify server is responding
```

---

## Minting Issues

### "Rate limit exceeded"

**Problem**: Too many mint requests.

**Solution**:
```bash
# Wait for rate limit reset (5 minutes)
# Check X-RateLimit-Reset header

# Implement exponential backoff
const delay = Math.pow(2, retryCount) * 1000;
await sleep(delay);
```

---

### "Invalid rarity"

**Problem**: Rarity calculation mismatch.

**Solution**:
```typescript
// Ensure rarity is valid enum value
const validRarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];

// Or let server determine
const rarity = determineRarity(power, defense, speed);
```

---

### IPFS upload fails

**Problem**: IPFS node or gateway issue.

**Solution**:
```bash
# Try alternative gateway
IPFS_GATEWAY="https://gateway.pinata.cloud/ipfs/"
# or
IPFS_GATEWAY="https://ipfs.io/ipfs/"

# Check file size limits
# Verify content type
```

---

## Performance Issues

### Slow page load

**Problem**: Large bundle or slow API.

**Solution**:
```typescript
// Implement code splitting
const BattleInterface = dynamic(() => import('./BattleInterface'), {
  loading: () => <Skeleton />
});

// Add caching headers
// Use React.memo for expensive components
// Implement virtualization for long lists
```

---

### High memory usage

**Problem**: Memory leaks or large state.

**Solution**:
```typescript
// Clean up subscriptions
useEffect(() => {
  const subscription = subscribeToBattle(battleId);
  return () => subscription.unsubscribe();
}, [battleId]);

// Limit battle log size
const trimmedLog = battleLog.slice(-100);

// Use WeakMap for caches
const cache = new WeakMap();
```

---

### Database slow queries

**Problem**: Missing indexes or N+1 queries.

**Solution**:
```sql
-- Add indexes
CREATE INDEX CONCURRENTLY idx_battles_status ON battles(status);
CREATE INDEX CONCURRENTLY idx_actions_battle_time ON battle_actions(battle_id, created_at);

-- Use Prisma include properly
await prisma.battle.findUnique({
  where: { id },
  include: {
    actions: { take: 50 }, // Limit included data
  }
});
```

---

## Farcaster Frame Issues

### Frame not loading

**Problem**: Invalid frame metadata.

**Solution**:
```typescript
// Verify meta tags
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://..." />
<meta property="fc:frame:button:1" content="Play" />
<meta property="fc:frame:post_url" content="https://.../api/frame" />

// Image must be 1200x630
// All URLs must be HTTPS
```

---

### Frame action fails

**Problem**: Frame validation or signature issue.

**Solution**:
```typescript
// Verify frame message
import { validateFrameMessage } from '@farcaster/auth-kit';

const { isValid } = await validateFrameMessage(body, {
  hubHttpUrl: FARCASTER_HUB_URL,
});

if (!isValid) {
  return NextResponse.json({ error: 'Invalid frame' }, { status: 400 });
}
```

---

### Cast not showing frame

**Problem**: OG tags or caching.

**Solution**:
```bash
# Clear Warpcast cache
# https://warpcast.com/~/developers/frames

# Verify with debugger
# https://warpcast.com/~/developers/frames

# Check all required meta tags present
```

---

## Getting Help

### Discord

Join our community: [discord.gg/inversion](https://discord.gg/inversion)

Channels:
- `#help` — General questions
- `#dev` — Technical issues
- `#bugs` — Bug reports

### Farcaster

- [@inversion](https://warpcast.com/inversion) — Official account
- [#inversion-help](https://warpcast.com/~/channel/inversion-help) — Help channel

### GitHub

- [Issues](https://github.com/your-org/inversion-excursion/issues)
- [Discussions](https://github.com/your-org/inversion-excursion/discussions)

### Email

- General: hello@inversionexcursion.xyz
- Security: security@inversionexcursion.xyz
- Bugs: bugs@inversionexcursion.xyz

### Debug Mode

Enable detailed logging:

```bash
# .env.local
LOG_LEVEL=debug
DEBUG=ie:*
NEXT_PUBLIC_DEBUG=true
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Invalid/missing JWT | Re-authenticate |
| "Forbidden" | Wrong permissions | Check user roles |
| "Not found" | Resource doesn't exist | Verify ID |
| "Bad request" | Invalid parameters | Check validation |
| "Rate limited" | Too many requests | Wait and retry |
| "Conflict" | Duplicate resource | Use unique values |
| "Internal error" | Server error | Contact support |

---

*Last updated: March 2026*
