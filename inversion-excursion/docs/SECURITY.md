# Security Documentation

Security considerations, known issues, and audit results for The Inversion Excursion.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Audit Results Summary](#audit-results-summary)
3. [Critical Findings](#critical-findings)
4. [High Severity Issues](#high-severity-issues)
5. [Medium Severity Issues](#medium-severity-issues)
6. [Low Severity Issues](#low-severity-issues)
7. [Mitigation Roadmap](#mitigation-roadmap)
8. [Security Best Practices](#security-best-practices)
9. [Incident Response](#incident-response)
10. [Bug Bounty](#bug-bounty)

---

## Security Overview

**Risk Rating**: 🔴 **HIGH** — Not ready for mainnet deployment

| Component | Risk Level | Status |
|-----------|------------|--------|
| Smart Contracts | MEDIUM | ⚠️ Requires fixes |
| API Routes | HIGH | 🔴 Critical issues |
| SynSync Integration | MEDIUM | ⚠️ Server-side gap |
| Farcaster/Frame | LOW | ✅ Acceptable |
| Frontend | MEDIUM | ⚠️ XSS vectors |

### Key Security Principles

1. **Defense in Depth** — Multiple layers of validation
2. **Fail Secure** — Default to deny, not allow
3. **Least Privilege** — Roles with minimal permissions
4. **Transparency** — All security issues documented

---

## Audit Results Summary

**Auditor**: PHASE 3 SWARM Security Auditor  
**Date**: March 7, 2026  
**Version**: 1.0  
**Classification**: Pre-Mainnet Deployment Review

### Finding Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 | Not fixed |
| 🟡 High | 2 | Not fixed |
| 🟡 Medium | 12 | Partially fixed |
| 🟢 Low | 8 | Partially fixed |

---

## Critical Findings

### 🔴 SC-001: Missing Screenshot Validation

**Contract**: `ScrollCard.sol`  
**Severity**: CRITICAL

#### Description

`mintCard()` has NO on-chain verification that a valid SynSync screenshot was submitted. Anyone with `MINTER_ROLE` can mint unlimited cards without proof.

#### Impact

- Unlimited card minting without gameplay
- Economic imbalance
- Game integrity compromised

#### Exploit Scenario

```solidity
// Attacker with MINTER_ROLE can:
for (uint i = 0; i < 10000; i++) {
    scrollCard.mintCard(
        attackerAddress,
        Dungeon.THE_VOID,
        Tier.PRISM,
        Frequency.INFINITE,
        100, 100, 0,
        0, "fake"
    );
}
```

#### Recommended Fix

```solidity
// Add screenshot proof verification
mapping(bytes32 => bool) public usedScreenshotHashes;

function mintCard(
    address to,
    string memory uri,
    CardAttributes memory attributes,
    bytes32 screenshotHash,
    bytes calldata signature
) external onlyAuthorized whenMintingEnabled nonReentrant returns (uint256) {
    // Verify server signature
    bytes32 messageHash = keccak256(abi.encodePacked(
        to, screenshotHash, block.timestamp / 1 hours
    ));
    require(
        verifyServerSignature(messageHash, signature),
        "Invalid proof signature"
    );
    
    // Prevent replay attacks
    require(!usedScreenshotHashes[screenshotHash], "Screenshot already used");
    usedScreenshotHashes[screenshotHash] = true;
    
    // ... rest of minting logic
}
```

#### Status: ❌ NOT IMPLEMENTED

---

### 🔴 API-001: No Authentication on Mint Victory

**File**: `/app/api/mint/victory/route.ts`  
**Severity**: CRITICAL

#### Description

Route accepts any request with `{victory: true}` — NO signature verification, NO wallet authentication.

#### Impact

- Unlimited victory minting
- Fake achievements
- Leaderboard manipulation

#### Exploit Scenario

```javascript
// Attacker can mint unlimited victories
fetch('/api/mint/victory', {
  method: 'POST',
  body: JSON.stringify({ 
    victory: true, 
    deck: [], 
    timestamp: Date.now() 
  })
});
```

#### Recommended Fix

```typescript
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const MintSchema = z.object({
  victory: z.literal(true),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  deck: z.array(z.object({
    id: z.string(),
    attack: z.number().min(0).max(100),
    defense: z.number().min(0).max(100),
  })).min(1).max(8),
  battleSignature: z.string().length(132)
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? '127.0.0.1';
  await limiter.check(5, ip);
  
  // Validate body
  const body = await request.json();
  const data = MintSchema.parse(body);
  
  // Verify wallet signature
  const message = `mint-victory:${data.walletAddress}:${data.timestamp}`;
  const isValid = await verifySignature(message, data.battleSignature, data.walletAddress);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Verify battle occurred on-chain
  const battleRecord = await verifyBattleOnChain(data.walletAddress, data.timestamp);
  if (!battleRecord) {
    return NextResponse.json({ error: 'No battle record' }, { status: 400 });
  }
  
  // ... proceed with mint
}
```

#### Status: ❌ NOT IMPLEMENTED

---

### 🔴 API-002: No Input Validation

**Files**: Multiple API routes  
**Severity**: CRITICAL

#### Description

No Zod schema validation on multiple routes. `deck` array can contain arbitrary data, negative values, or massive payloads.

#### Impact

- DoS via large payloads
- Invalid game state
- Database corruption

#### Recommended Fix

Implement Zod validation on ALL routes:

```typescript
// lib/validation.ts
export const mintCardSchema = z.object({
  name: z.string().min(1).max(100),
  imageUrl: z.string().url(),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC']).optional(),
  power: z.number().int().min(1).max(100).optional(),
  defense: z.number().int().min(1).max(100).optional(),
  speed: z.number().int().min(1).max(100).optional(),
});

// In route handler
const input = mintCardSchema.parse(body);
```

#### Status: ⚠️ PARTIALLY IMPLEMENTED

---

## High Severity Issues

### 🟡 GP-001: Missing Paymaster Implementation

**Contract**: `GamePaymaster.sol`  
**Severity**: HIGH

#### Description

Contract declares `validatePaymasterUserOp` and `postOp` but they are NEVER CALLED by EntryPoint due to missing `IPaymaster` interface inheritance.

#### Impact

- Paymaster functionality non-functional
- Gasless transactions fail
- Poor UX

#### Fix Required

```solidity
// Add IPaymaster interface inheritance
contract GamePaymaster is BasePaymaster, IPaymaster, AccessControl {
    // Ensure full interface implementation
}
```

#### Status: ❌ NOT FIXED

---

### 🟡 API-005: In-Memory Storage

**File**: `/app/api/cell/route.ts`  
**Severity**: HIGH

#### Description

```typescript
const cells: Map<string, Cell> = new Map();
```

Cell data stored in memory — lost on every server restart/deployment.

#### Impact

- Lost Cell formations
- Battle history disappears
- Player frustration

#### Fix Required

Migrate to PostgreSQL with Prisma:

```typescript
// Use Prisma instead
const cell = await prisma.cell.create({
  data: { name, leaderId, ... }
});
```

#### Status: ❌ NOT FIXED

---

## Medium Severity Issues

### 🟡 SC-002: Reentrancy in mintCardGasless

**Contract**: `ScrollCard.sol`  
**Severity**: MEDIUM

Uses `this.mintCard()` delegate pattern which bypasses `nonReentrant` on external call.

#### Fix

```solidity
// Use internal function instead of external call
function _mintCardInternal(...) internal returns (uint256) {
    // minting logic
}

function mintCard(...) external nonReentrant returns (uint256) {
    return _mintCardInternal(...);
}

function mintCardGasless(...) external nonReentrant returns (uint256) {
    return _mintCardInternal(...);
}
```

---

### 🟡 SC-003: Weak Paymaster Data Validation

**Contract**: `ScrollCard.sol`  
**Severity**: MEDIUM

`_validatePaymasterData()` only checks `data.length > 0`. No cryptographic verification.

#### Fix

Add signature verification:

```solidity
function _validatePaymasterData(bytes calldata data) internal view {
    require(data.length >= 65, "Invalid paymaster data");
    
    (bytes32 r, bytes32 s, uint8 v) = abi.decode(data, (bytes32, bytes32, uint8));
    address signer = ecrecover(paymasterOpHash, v, r, s);
    require(hasRole(PAYMASTER_ROLE, signer), "Invalid paymaster signature");
}
```

---

### 🟡 VM-001: Score Manipulation

**Contract**: `VictoryMinter.sol`  
**Severity**: MEDIUM

`mintVictory()` accepts arbitrary `score` parameter without verification.

#### Fix

```solidity
function mintVictory(
    ...
    uint256 score,
    bytes calldata battleProof
) external onlyRole(MINTER_ROLE) {
    require(score >= MIN_SCORE_THRESHOLD, "Score below minimum");
    require(verifyBattleProof(cellId, dungeon, score, battleProof), "Invalid proof");
    // ...
}
```

---

### 🟡 VM-002: Batch Minting Gas Limits

**Contract**: `VictoryMinter.sol`  
**Severity**: MEDIUM

`batchMintVictories()` has no array size limit.

#### Fix

```solidity
function batchMintVictories(...) external onlyRole(MINTER_ROLE) nonReentrant {
    require(recipients.length <= 50, "Batch too large");
    // ...
}
```

---

### 🟡 CR-001: Cell Formation Spam

**Contract**: `CellRegistry.sol`  
**Severity**: MEDIUM

`formationCooldown` can be bypassed by using different leader addresses.

#### Fix

```solidity
mapping(address => uint256) public lastCellFormation;
uint256 public constant FORMATION_COOLDOWN = 1 hours;

function formCell(...) external returns (uint256) {
    require(
        block.timestamp >= lastCellFormation[msg.sender] + FORMATION_COOLDOWN,
        "Formation cooldown active"
    );
    lastCellFormation[msg.sender] = block.timestamp;
    // ...
}
```

---

### 🟡 SS-001: Client-Side Signatures

**File**: `SynSyncSecurity.ts`  
**Severity**: MEDIUM

`generateSignature()` is client-side only. Trivial to spoof.

#### Fix

```typescript
// Server-side verification required
// /api/synsync/verify
export async function POST(req: Request) {
  const { proof, signature } = await req.json();
  
  // Server-side verification only
  const isValid = await verifyHMAC(proof, signature, SERVER_SECRET);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid proof' }, { status: 401 });
  }
  // ...
}
```

---

### 🟡 XSS-001: Unescaped Card Metadata

**Files**: Multiple frontend components  
**Severity**: MEDIUM

`extractedQuote` from ScrollCard metadata rendered without sanitization.

#### Fix

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize before rendering
const safeQuote = DOMPurify.sanitize(cardAttributes.extractedQuote);
```

---

### 🟡 API-008: Client-Side Randomness

**File**: `/app/api/battle/action/route.ts`  
**Severity**: MEDIUM

Battle outcomes use `Math.random()` — NOT cryptographically secure.

#### Fix

```typescript
import { randomBytes } from 'crypto';

// Server-side secure random
function secureRandom(max: number): number {
  const randomValue = randomBytes(4).readUInt32LE(0);
  return randomValue % max;
}
```

---

### 🟡 TP-001: Gift Message Injection

**Contract**: `TradingPost.sol`  
**Severity**: MEDIUM

`message` parameter has no content sanitization.

#### Fix

```solidity
// Off-chain validation required
// Add to metadata but don't render raw HTML
function createGift(..., string calldata message, ...) {
    require(bytes(message).length <= 280, "Message too long");
    // Store as-is, sanitize on frontend
}
```

---

### 🟡 TIE-001: Battle Completion Authorization

**Contract**: `TheInversionExcursion.sol`  
**Severity**: MEDIUM

`completeBattle()` relies solely on `GAME_MASTER_ROLE`. Single key compromise can mint unlimited victories.

#### Fix

Implement multi-sig:

```solidity
function completeBattle(...) external {
    require(
        hasRole(GAME_MASTER_ROLE, msg.sender) ||
        hasRole(ORACLE_ROLE, msg.sender),
        "Unauthorized"
    );
    require(verifyBattleProof(...), "Invalid proof");
    // ...
}
```

---

### 🟡 API-006: No Farcaster Verification

**File**: `/app/api/cell/route.ts`  
**Severity**: MEDIUM

`leaderFid` accepted as plain number with no verification.

#### Fix

```typescript
import { verifyFarcasterMessage } from '@farcaster/auth-kit';

// Verify message signed by claimed FID
const isValid = await verifyFarcasterMessage(message, signature);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid Farcaster signature' }, { status: 401 });
}
```

---

## Low Severity Issues

### 🟢 SC-004: Max Supply Race Condition

`totalSupply() < maxSupply` check vulnerable to front-running. Consider ERC-721A.

### 🟢 VM-003: Soulbound Bypass

`_beforeTokenTransfer` allows burn-to-mint if contract has mint capability.

### 🟢 CR-002: Array Manipulation

`removeMember()` uses swap-and-pop, can be griefed by repeated join/leave.

### 🟢 CR-003: Leaderboard Sorting

`getLeaderboard()` uses bubble sort O(n²). Optimize with sorted data structure.

### 🟢 TP-002: Fee Accumulation

`totalFeesCollected` tracks fees but no automated distribution.

### 🟢 TP-003: Claim Period Extension

Admin can change `claimPeriod` retroactively.

### 🟢 GP-003: Tier Bypass

`whitelisted` flag bypasses ALL limits including gas checks.

### 🟢 TIE-003: Entry Fee Accumulation

`enterDungeon()` receives ETH but no withdrawal function.

---

## Mitigation Roadmap

### Phase 1: Critical Fixes (2 weeks)

- [ ] SC-001: Implement screenshot proof verification
- [ ] API-001: Add authentication to all API routes
- [ ] API-002: Add Zod validation to all routes
- [ ] GP-001: Fix paymaster interface

### Phase 2: High Priority (1 week)

- [ ] API-005: Migrate to PostgreSQL
- [ ] SC-002: Fix reentrancy
- [ ] SS-001: Implement server-side proof verification

### Phase 3: Medium Priority (1 week)

- [ ] VM-001: Add score verification
- [ ] XSS-001: Add DOMPurify
- [ ] API-008: Replace Math.random()
- [ ] TIE-001: Implement multi-sig

### Phase 4: Polish (1 week)

- [ ] CR-001: Add rate limiting
- [ ] All low severity issues
- [ ] Comprehensive testing

---

## Security Best Practices

### For Developers

1. **Never trust client input** — Validate everything server-side
2. **Use prepared statements** — Prevent SQL injection
3. **Sanitize output** — Prevent XSS
4. **Rate limit everything** — Prevent abuse
5. **Sign all state changes** — Cryptographic verification

### For Players

1. **Verify contract addresses** — Only interact with official contracts
2. **Check transaction data** — Review before signing
3. **Use hardware wallets** — For significant holdings
4. **Report suspicious activity** — security@inversionexcursion.xyz

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time | Actions |
|-------|------------|---------------|---------|
| P0 | Funds at risk | Immediate | Pause contracts, revoke roles |
| P1 | Minting abuse | < 1 hour | Disable minting, investigate |
| P2 | Rate violations | < 4 hours | Adjust limits, IP blocks |
| P3 | Minor issues | < 24 hours | Review, document |

### Emergency Procedures

**Pause Contracts**:
```solidity
// Call on all contracts
function pause() external onlyRole(GAME_MASTER);
```

**Revoke Compromised Role**:
```solidity
// Remove MINTER_ROLE from compromised address
revokeRole(MINTER_ROLE, compromisedAddress);
```

### Contact

- **Security Email**: security@inversionexcursion.xyz
- **Farcaster DM**: [@inversion_security](https://warpcast.com/inversion_security)
- **PGP Key**: [Download](https://inversionexcursion.xyz/security-pgp.asc)

---

## Bug Bounty

### Scope

- Smart Contracts (all in `/contracts/`)
- API Routes (all in `/app/api/`)
- SynSync Integration

### Rewards

| Severity | Reward |
|----------|--------|
| Critical | $10,000 - $50,000 |
| High | $5,000 - $10,000 |
| Medium | $1,000 - $5,000 |
| Low | $100 - $1,000 |

### Rules

1. Report to security@inversionexcursion.xyz
2. Allow 48 hours before public disclosure
3. No social engineering or phishing
4. No attacks on other users
5. No DoS attacks

### Out of Scope

- Third-party dependencies
- Known issues in this document
- Frontend UI/UX issues
- Documentation errors

---

*Last updated: March 7, 2026*  
*Next audit scheduled: After Phase 1 fixes*
