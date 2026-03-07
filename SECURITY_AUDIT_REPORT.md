# The Inversion Excursion — Final Security Audit Report
**Version:** 1.0  
**Date:** March 7, 2026  
**Auditor:** PHASE 3 SWARM Security Auditor  
**Classification:** Pre-Mainnet Deployment Review

---

## Executive Summary

This audit covers The Inversion Excursion mini app, a Farcaster-integrated blockchain game featuring SynSync brainwave entrainment mechanics, NFT minting via Zora protocol, and on-chain coordination mechanics. The codebase demonstrates **moderate security posture** with several critical findings requiring remediation before mainnet deployment.

### Overall Risk Rating: **HIGH** 🔴

| Component | Risk Level | Status |
|-----------|------------|--------|
| Smart Contracts | MEDIUM | ⚠️ Requires fixes |
| API Routes | HIGH | 🔴 Critical issues |
| SynSync Integration | MEDIUM | ⚠️ Server-side gap |
| Farcaster/Frame | LOW | ✅ Acceptable |
| Frontend | MEDIUM | ⚠️ XSS vectors |

---

## 1. Smart Contract Audit

### 1.1 ScrollCard.sol

**File:** `/contracts/ScrollCard.sol` (and `/zora-minting/contracts/ScrollCard.sol`)

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| SC-001 | 🔴 **CRITICAL** | Missing Screenshot Validation | `mintCard()` has NO on-chain verification that a valid SynSync screenshot was submitted. Anyone with `MINTER_ROLE` can mint unlimited cards without proof. |
| SC-002 | 🟡 **MEDIUM** | Reentrancy in `mintCardGasless` | Uses `this.mintCard()` delegate pattern which bypasses `nonReentrant` on external call. Low risk due to no ETH transfers but inconsistent pattern. |
| SC-003 | 🟡 **MEDIUM** | Paymaster Data Validation Weak | `_validatePaymasterData()` only checks `data.length > 0`. No cryptographic verification of paymaster authorization. |
| SC-004 | 🟢 **LOW** | Max Supply Race Condition | `totalSupply() < maxSupply` check is vulnerable to front-running in high-congestion scenarios. Consider ERC-721A pattern. |

#### Recommended Fixes:

```solidity
// Add screenshot proof verification to mintCard()
function mintCard(
    address to,
    string memory uri,
    CardAttributes memory attributes,
    bytes32 screenshotHash,      // ADD: Hash of verified screenshot
    bytes calldata signature     // ADD: Server signature validating proof
) external onlyAuthorized whenMintingEnabled nonReentrant returns (uint256) {
    // Verify server signature
    bytes32 messageHash = keccak256(abi.encodePacked(to, screenshotHash, block.timestamp / 1 hours));
    require(
        verifyServerSignature(messageHash, signature),
        "ScrollCard: Invalid proof signature"
    );
    
    // Prevent replay attacks
    require(!usedScreenshotHashes[screenshotHash], "ScrollCard: Screenshot already used");
    usedScreenshotHashes[screenshotHash] = true;
    
    // ... rest of minting logic
}
```

---

### 1.2 VictoryMinter.sol

**File:** `/contracts/VictoryMinter.sol`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| VM-001 | 🟡 **MEDIUM** | Score Manipulation | `mintVictory()` accepts arbitrary `score` parameter without verification. Game master can mint legendary victories with score=0. |
| VM-002 | 🟡 **MEDIUM** | Batch Minting Gas Limits | `batchMintVictories()` has no array size limit. Large arrays could exceed block gas limits. |
| VM-003 | 🟢 **LOW** | Soulbound Bypass via Self-Transfer | `_beforeTokenTransfer` allows `from == address(0)` or `to == address(0)`, but doesn't prevent burn-to-mint attacks if contract has mint capability. |

#### Recommended Fixes:

```solidity
// Add score verification
function mintVictory(
    address to,
    uint256 cellId,
    uint8 dungeon,
    uint256 score,
    bytes calldata battleProof  // ADD: Cryptographic proof of battle
) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
    require(score >= MIN_SCORE_THRESHOLD, "VictoryMinter: Score below minimum");
    require(battleProofs[battleProof] == false, "VictoryMinter: Battle already recorded");
    
    // Verify battle proof signature
    require(verifyBattleProof(cellId, dungeon, score, battleProof), "VictoryMinter: Invalid battle proof");
    
    battleProofs[battleProof] = true;
    // ... rest
}

// Add batch size limit
function batchMintVictories(
    address[] calldata recipients,
    uint256[] calldata cellIds,
    uint8[] calldata dungeons,
    uint256[] calldata scores
) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256[] memory) {
    require(recipients.length <= 50, "VictoryMinter: Batch too large");  // ADD
    // ... rest
}
```

---

### 1.3 CellRegistry.sol

**File:** `/contracts/CellRegistry.sol`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| CR-001 | 🟡 **MEDIUM** | Cell Formation Spam | `formationCooldown` can be bypassed by using different leader addresses. No IP/account-level rate limiting. |
| CR-002 | 🟡 **MEDIUM** | Array Manipulation | `removeMember()` uses swap-and-pop which can be griefed by repeatedly joining/leaving to manipulate array ordering. |
| CR-003 | 🟢 **LOW** | Leaderboard Sorting | `getLeaderboard()` uses bubble sort O(n²) which will become expensive with many cells. |

---

### 1.4 TradingPost.sol

**File:** `/contracts/TradingPost.sol`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| TP-001 | 🟡 **MEDIUM** | Gift Message Injection | `message` parameter in `sendBulletGift()` has no content sanitization. Malicious metadata could be stored on-chain. |
| TP-002 | 🟡 **MEDIUM** | Fee Accumulation | `totalFeesCollected` tracks fees but no automated distribution mechanism. Risk of stuck funds. |
| TP-003 | 🟢 **LOW** | Claim Period Extension | Admin can change `claimPeriod` retroactively affecting pending gifts. |

---

### 1.5 GamePaymaster.sol

**File:** `/contracts/GamePaymaster.sol`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| GP-001 | 🔴 **CRITICAL** | Missing validatePaymasterUserOp Implementation | Contract declares `validatePaymasterUserOp` and `postOp` functions but they are **NEVER CALLED** by EntryPoint due to missing `IPaymaster` interface inheritance. |
| GP-002 | 🟡 **MEDIUM** | Deposit Management | `depositToEntryPoint()` is a no-op (comment says "for simplicity"). Real implementation needed for actual paymaster functionality. |
| GP-003 | 🟢 **LOW** | Tier Bypass via Whitelist | `whitelisted` flag bypasses ALL limits including gas checks. Compromised SPONSOR_ROLE can drain unlimited funds. |

---

### 1.6 TheInversionExcursion.sol (Main Game Contract)

**File:** `/contracts/TheInversionExcursion.sol`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| TIE-001 | 🟡 **MEDIUM** | Battle Completion Authorization | `completeBattle()` relies solely on `GAME_MASTER_ROLE`. Single compromised key can mint unlimited victories. |
| TIE-002 | 🟡 **MEDIUM** | No Battle Result Verification | Battle outcome (`won`, `score`) is trusted input with no cryptographic verification from game clients. |
| TIE-003 | 🟢 **LOW** | Entry Fee Accumulation | `enterDungeon()` receives ETH but no withdrawal function. Funds accumulate with no escape mechanism. |

---

## 2. API Routes Audit

### 2.1 Mint Victory API (`/app/api/mint/victory/route.ts`)

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| API-001 | 🔴 **CRITICAL** | **No Authentication** | Route accepts any request with `{victory: true}` - NO signature verification, NO wallet authentication. |
| API-002 | 🔴 **CRITICAL** | **No Input Validation** | No Zod schema validation. `deck` array can contain arbitrary data, negative values, or massive payloads. |
| API-003 | 🔴 **CRITICAL** | **No Rate Limiting** | Can be spammed to generate unlimited metadata URIs. No IP-based or wallet-based rate limiting. |
| API-004 | 🟡 **MEDIUM** | **Private Key Exposure** | Route imports `privateKeyToAccount` but code shows private key handling (though not fully shown in snippet). |

#### Exploit Scenario:
```javascript
// Attacker can mint unlimited victories
fetch('/api/mint/victory', {
  method: 'POST',
  body: JSON.stringify({ victory: true, deck: [], timestamp: Date.now() })
});
```

#### Recommended Fixes:

```typescript
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

const MintSchema = z.object({
  victory: z.literal(true),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  deck: z.array(z.object({
    id: z.string(),
    attack: z.number().min(0).max(100),
    defense: z.number().min(0).max(100),
    frequency: z.number().min(0).max(1000),
    element: z.enum(['fire', 'water', 'earth', 'air', 'aether'])
  })).min(1).max(8),
  timestamp: z.number(),
  battleSignature: z.string().length(132) // 0x + 130 hex chars
});

// Rate limiter: 3 requests per 10 minutes per wallet
const limiter = rateLimit({ interval: 10 * 60 * 1000, uniqueTokenPerInterval: 500 });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1';
    await limiter.check(5, ip); // 5 requests per interval max
    
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
      return NextResponse.json({ error: 'No battle record found' }, { status: 400 });
    }
    
    // ... proceed with mint
  }
}
```

---

### 2.2 Cell API (`/app/api/cell/route.ts`)

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| API-005 | 🔴 **CRITICAL** | **In-Memory Storage** | `const cells: Map<string, Cell> = new Map()` - Data is lost on every server restart/deployment. |
| API-006 | 🟡 **MEDIUM** | **No Farcaster Verification** | `leaderFid` is accepted as plain number with no verification that request comes from actual Farcaster user. |
| API-007 | 🟡 **MEDIUM** | **Missing CSRF Protection** | No CSRF tokens on state-changing operations. |

---

### 2.3 Battle Action API (`/app/api/battle/action/route.ts`)

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| API-008 | 🟡 **MEDIUM** | **Client-Side Randomness** | Battle outcomes use `Math.random()` which is NOT cryptographically secure. Predictable outcomes. |
| API-009 | 🟢 **LOW** | **No AI Verification** | Dungeon narrative is generated without any proof of AI execution. Could be pre-computed. |

---

## 3. SynSync Integration Audit

### 3.1 SynSyncSecurity.ts

**File:** `/synsync-bridge/SynSyncSecurity.ts`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| SS-001 | 🟡 **MEDIUM** | **Client-Side Signatures** | `generateSignature()` is client-side only and uses simple hash, not HMAC. Trivial to spoof. |
| SS-002 | 🟡 **MEDIUM** | **Entropy Calculation Weak** | Shannon entropy check can be bypassed by bots adding controlled noise. |
| SS-003 | 🟢 **LOW** | **Timestamp Acceptance Window** | 5-minute freshness window may be too long for high-frequency attacks. |
| SS-004 | 🟢 **LOW** | **Challenge Hash Weak** | `verifyChallengeResponse()` uses non-cryptographic hash (multiplicative hash). |

#### Critical Gap:

The `SynSyncSecurity.ts` module has **NO SERVER-SIDE EQUIVALENT**. The proof verification must be replicated server-side, but the audit found no `/api/verify-entrainment` route implementing `fullServerVerification()`.

---

### 3.2 SynSyncEngine.ts

**File:** `/synsync-bridge/SynSyncEngine.ts`

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| SE-001 | 🟡 **MEDIUM** | **Audio Fingerprint Spoofable** | `audioFingerprint` uses public AudioContext properties that can be faked. |
| SE-002 | 🟢 **LOW** | **Frequency Sampling Unreliable** | `findDominantFrequency()` from FFT data may not accurately detect binaural beat frequency. |

---

## 4. Farcaster/Frame Audit

### 4.1 Frame SDK (`/farcaster/frame-sdk.ts`)

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| FC-001 | 🟢 **LOW** | **Context Trust** | `frameContext` is stored in module-level variable and never re-validated. Could be stale if user switches accounts. |
| FC-002 | 🟢 **LOW** | **No Frame Signature Verification** | No verification of `signedMessage` from Farcaster when receiving context. |

**Status:** ✅ Generally acceptable. Frame SDK handles most security concerns internally.

---

## 5. Frontend/Client Audit

### 5.1 XSS Vectors

#### Findings:

| ID | Severity | Title | Description |
|----|----------|-------|-------------|
| XSS-001 | 🟡 **MEDIUM** | **Unescaped Card Metadata** | `extractedQuote` from ScrollCard metadata is rendered without sanitization in several places. |
| XSS-002 | 🟡 **MEDIUM** | **Gift Message Rendering** | TradingPost gift messages rendered with `dangerouslySetInnerHTML` equivalent in some components. |

#### Recommended Fix:

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize before rendering
const safeQuote = DOMPurify.sanitize(cardAttributes.extractedQuote);
```

---

## 6. Vulnerability Risk Matrix

| Threat Scenario | Likelihood | Impact | Risk | Mitigation Status |
|-----------------|------------|--------|------|-------------------|
| Mint without valid screenshot | HIGH | HIGH | 🔴 **CRITICAL** | NOT IMPLEMENTED |
| Card duplication via replay | MEDIUM | HIGH | 🟡 **HIGH** | NOT IMPLEMENTED |
| Cell formation spam | HIGH | MEDIUM | 🟡 **MEDIUM** | PARTIAL |
| Battle result manipulation | HIGH | MEDIUM | 🟡 **MEDIUM** | NOT IMPLEMENTED |
| Fake entrainment proofs | MEDIUM | MEDIUM | 🟡 **MEDIUM** | PARTIAL |
| XSS via card metadata | MEDIUM | LOW | 🟢 **LOW** | NOT IMPLEMENTED |
| CSRF on API routes | LOW | MEDIUM | 🟢 **LOW** | NOT IMPLEMENTED |
| Frame context spoofing | LOW | LOW | 🟢 **LOW** | N/A (SDK handles) |

---

## 7. Recommended Fixes (Priority Order)

### 🔴 CRITICAL (Deploy Blockers)

1. **SC-001 / API-001:** Implement cryptographic proof verification for minting
   - Server must sign screenshot proofs with private key
   - Smart contract must verify signature before minting
   - Add `usedScreenshotHashes` mapping for replay protection

2. **API-001 / API-002:** Add authentication and validation to all API routes
   - Implement wallet signature verification
   - Add Zod schemas for all inputs
   - Add rate limiting middleware

3. **GP-001:** Fix GamePaymaster interface
   - Implement `IPaymaster` interface properly
   - Connect to actual EntryPoint

### 🟡 HIGH (Pre-Launch)

4. **VM-001 / TIE-001:** Add battle proof verification
   - Cryptographically sign battle results
   - Verify on-chain before minting victories

5. **SS-001:** Implement server-side proof verification endpoint
   - Create `/api/verify-entrainment` route
   - Use proper HMAC with server-side secret

6. **API-005:** Replace in-memory storage with persistent database
   - Use Supabase/PostgreSQL for cell data
   - Add proper indexing

### 🟢 MEDIUM (Post-Launch)

7. **CR-001:** Implement account-level rate limiting for cells
8. **XSS-001:** Add DOMPurify to all user-generated content
9. **TP-001:** Sanitize gift messages before storage
10. **CR-003:** Optimize leaderboard with sorted data structure

---

## 8. Monitoring Recommendations

### On-Chain Monitoring (Recommended Tools: Tenderly, OpenZeppelin Defender)

```yaml
Alerts:
  - name: "Unusual Mint Volume"
    condition: "ScrollCard.mintCard calls > 100/hour"
    severity: high
    
  - name: "Large Victory Score"
    condition: "VictoryMinter.mintVictory with score > 50000"
    severity: medium
    
  - name: "Cell Formation Spike"
    condition: "CellRegistry.createCell calls > 50/hour"
    severity: medium
    
  - name: "Paymaster Drain"
    condition: "GamePaymaster balance drops > 1 ETH/hour"
    severity: critical
```

### Off-Chain Monitoring

```yaml
API Monitoring:
  - endpoint: "/api/mint/victory"
    rate_threshold: "10 requests/minute per IP"
    
  - endpoint: "/api/cell"
    anomaly_detection: "Cell creations > 5 per FID/day"
    
SynSync Monitoring:
  - metric: "Proof verification failures"
    threshold: "> 10% failure rate"
    
  - metric: "Average entropy scores"
    threshold: "< 0.5 (bot indicator)"
```

---

## 9. Incident Response Plan

### Severity Levels

| Level | Definition | Response Time | Actions |
|-------|------------|---------------|---------|
| P0 | Funds at risk, contract exploit | Immediate | Pause contracts, revoke roles, emergency withdraw |
| P1 | Minting abuse, fake victories | < 1 hour | Disable minting, investigate logs |
| P2 | Rate limit violations, spam | < 4 hours | Adjust limits, IP blocks |
| P3 | Minor issues, monitoring alerts | < 24 hours | Review and document |

### Emergency Contacts

```yaml
Roles:
  ContractAdmin: "0x... (multisig)"
  GameMaster: "0x... (multisig)"
  Security: "security@inversionexcursion.xyz"
  
Procedures:
  Pause:
    - Call `setMintingEnabled(false)` on ScrollCard
    - Call `pause()` on TradingPost
    - Call `setGiftingEnabled(false)` on TradingPost
    
  Upgrade:
    - Use UUPS pattern for TheInversionExcursion
    - Timelock for critical changes (24h minimum)
```

---

## 10. Deployment Checklist

- [ ] Implement server-side proof signing for minting
- [ ] Add Zod validation to all API routes
- [ ] Implement wallet signature verification
- [ ] Add rate limiting (Redis-based)
- [ ] Fix GamePaymaster EntryPoint integration
- [ ] Deploy contracts to testnet
- [ ] Run full integration tests
- [ ] Set up monitoring dashboards
- [ ] Document emergency procedures
- [ ] Conduct external audit for critical contracts

---

## Conclusion

The Inversion Excursion demonstrates innovative game mechanics combining neurotech with blockchain gaming. However, **the current implementation has critical security gaps that must be addressed before mainnet deployment**.

### Key Blockers:
1. No cryptographic verification for minting
2. Unauthenticated API routes
3. In-memory data storage

### Timeline Recommendation:
- **2-3 weeks** for critical fixes
- **1 week** for testing on testnet
- **External audit** recommended before mainnet

---

*Report generated by OpenClaw Security Auditor*  
*Classification: Internal Use - Pre-Deployment Review*
