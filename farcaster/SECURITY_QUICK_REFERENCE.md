# Frame Validation Security - Quick Reference

## 🔒 Security Requirements (All Required for Validator Actions)

| Requirement | Value | Purpose |
|-------------|-------|---------|
| **Staking** | 1,000+ EPW | Economic security |
| **Account Age** | 30+ days | Prevents sybil attacks |
| **Followers** | 50+ | Ensures established accounts |
| **Signature** | Valid Ed25519 | Cryptographic authenticity |
| **Rate Limit** | 10/minute | Prevents spam |

---

## 🚀 Quick Start

### 1. Secure a Frame Route

```typescript
import { applyFrameSecurityMiddleware } from '@/lib/middleware/frame-validation';

export async function POST(request: NextRequest) {
  // Apply all security checks
  const { response, context } = await applyFrameSecurityMiddleware(request, {
    requireValidator: true,      // Must have stake
    requireSignature: true,      // Must sign actions
    requireIdentity: true,       // 30d + 50 followers
    rateLimit: true,             // 10 req/min limit
    allowedActions: ['validate', 'reject', 'dispute'],
  });
  
  // Security check failed
  if (response) return response;
  
  // All checks passed - context contains verified info
  const { fid, username, validatorAddress } = context!;
  
  // Process validated action...
}
```

### 2. Individual Security Checks

```typescript
import { 
  verifyFrameSignature,
  verifyFarcasterIdentity,
  checkValidatorEligibility,
  checkFrameRateLimit,
} from '@/farcaster/frame-sdk-secured';

// Check signature
const sigCheck = await verifyFrameSignature(payload);
if (!sigCheck.valid) throw new Error(sigCheck.error);

// Check Farcaster identity (30d + 50 followers)
const identity = await verifyFarcasterIdentity(fid, username);
if (!identity.valid) throw new Error(identity.error);

// Check validator status
const eligibility = await checkValidatorEligibility(fid, username);
if (!eligibility.eligible) throw new Error(eligibility.reason);

// Check rate limit
const rateLimit = checkFrameRateLimit(fid, 'validate');
if (!rateLimit.allowed) throw new Error('Rate limited');
```

### 3. Using in Route Handlers

```typescript
// app/api/frames/my-frame/route.ts
import { NextRequest } from 'next/server';
import { applyFrameSecurityMiddleware } from '@/lib/middleware/frame-validation';

export async function POST(request: NextRequest) {
  const security = await applyFrameSecurityMiddleware(request, {
    requireValidator: true,
    allowedActions: ['myAction'],
  });
  
  if (security.response) return security.response;
  
  // Your secure logic here
  const { fid, validatorAddress } = security.context!;
  
  return NextResponse.json({ success: true });
}
```

---

## 📋 Action Button Mapping

| Button | Index | Action | Security Required |
|--------|-------|--------|-------------------|
| View | 1 | `view` | None (redirect) |
| Validate | 2 | `validate` | Full validation |
| Reject | 3 | `reject` | Full validation |
| Dispute | 4 | `dispute` | Full validation |

---

## 🧪 Testing

### Generate Test Signatures

```typescript
import { generateFrameActionSignature } from '@/farcaster/frame-sdk-secured';

const payload = generateFrameActionSignature(
  1,              // FID (use 1 for eligible validator)
  'validator1',   // Username
  2,              // Button (2=validate)
  'test-secret',  // Secret
  { inputText: 'Test comment' }
);

// Send test request
fetch('/api/frames/validation/123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
```

### Run Security Tests

```bash
npm test src/__tests__/security/frame-validation.security.test.ts
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid signature` | Expired or malformed signature | Regenerate with fresh timestamp |
| `Account must be at least 30 days old` | New Farcaster account | Wait 30 days |
| `Account must have at least 50 followers` | Low follower count | Build reputation |
| `Not a registered validator` | No staking | Register and stake EPW |
| `Insufficient stake` | Stake < 1000 EPW | Add more stake |
| `Rate limit exceeded` | Too many requests | Wait 1 minute |
| `Validator is currently jailed` | Slashed/jailed validator | Wait for jail period |

---

## 🔧 Configuration

### Environment Variables

```bash
# Farcaster Hub (production)
FARCASTER_HUB_URL=https://api.warpcast.com
FARCASTER_HUB_API_KEY=your_key

# Redis (production rate limiting)
REDIS_URL=redis://localhost:6379
```

### Customizing Security

```typescript
// lib/config/frame-security.ts
export const SECURITY_CONFIG = {
  MIN_ACCOUNT_AGE_DAYS: 30,    // Increase for stricter requirements
  MIN_FOLLOWERS: 50,           // Increase for stricter requirements
  MIN_STAKE_AMOUNT: '1000',    // Increase for economic security
  RATE_LIMIT_MAX_ACTIONS: 10,  // Decrease to reduce spam
  SIGNATURE_VALIDITY_MS: 5 * 60 * 1000, // 5 minutes
};
```

---

## 🛡️ Security Checklist

Before deploying frame routes:

- [ ] Using `applyFrameSecurityMiddleware` or individual middleware
- [ ] `requireValidator: true` for validator actions
- [ ] `requireSignature: true` for authenticated actions
- [ ] `requireIdentity: true` for Farcaster verification
- [ ] `rateLimit: true` for all POST endpoints
- [ ] `allowedActions` specified if using action validation
- [ ] Input sanitization on all user-provided content
- [ ] Security tests passing
- [ ] Error responses don't leak sensitive info

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `farcaster/frame-sdk-secured.ts` | Core security SDK |
| `lib/middleware/frame-validation.ts` | Next.js middleware |
| `app/api/frames/validation/route.secure.ts` | Secured validation route |
| `__tests__/security/frame-validation.security.test.ts` | Security tests |
| `farcaster/index.ts` | All exports |
| `FRAME_SECURITY_AUDIT_REPORT.md` | Full audit report |

---

## 🆘 Support

For security issues or questions:
1. Check the [Audit Report](./FRAME_SECURITY_AUDIT_REPORT.md)
2. Review test cases for usage examples
3. Ensure all middleware is properly applied
