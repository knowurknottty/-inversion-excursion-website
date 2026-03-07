# Polaris Project Partnership Agreement
## EPWorld x Polaris Project Charitable Partnership

**Document Version:** 1.0  
**Effective Date:** March 7, 2026  
**Partnership Type:** Protocol-Level Charitable Integration  
**Commitment Hash:** `0x...` (SHA256 of this document)

---

## 1. PARTIES

### 1.1 EPWorld ("The Protocol")
- A blockchain-based gaming and NFT platform
- Contract Address: [To be deployed]
- Representative: knowurknot

### 1.2 Polaris Project ("The Beneficiary")
- A nonprofit organization operating the U.S. National Human Trafficking Hotline
- EIN: 05-0545307
- Website: https://polarisproject.org
- ETH Donation Address: `0x...` (To be provided by Polaris Project)

---

## 2. PURPOSE

This agreement establishes a permanent, immutable charitable partnership where EPWorld commits to donating **10% of all NFT mint proceeds** to Polaris Project's National Trafficking Hotline operations.

### 2.1 Mission Alignment
Both parties recognize:
- Human trafficking affects 40+ million people globally
- The National Trafficking Hotline provides critical 24/7 support
- Blockchain transparency can revolutionize charitable giving accountability
- Gaming communities can drive meaningful social impact

---

## 3. FINANCIAL COMMITMENTS

### 3.1 Donation Structure
| Parameter | Value |
|-----------|-------|
| Donation Percentage | 10% of all mint proceeds |
| Basis Points | 1000 bps (immutable) |
| Recipient | Polaris Project verified ETH address |
| Distribution | Automatic on every mint transaction |

### 3.2 Example Calculations
| Mint Price | Donation (10%) | Protocol Keeps |
|------------|----------------|----------------|
| 0.01 ETH | 0.001 ETH | 0.009 ETH |
| 0.05 ETH | 0.005 ETH | 0.045 ETH |
| 0.1 ETH | 0.01 ETH | 0.09 ETH |

### 3.3 Immutable Commitment
The 10% donation rate is **hardcoded in the smart contract** and **cannot be modified** after deployment. This ensures:
- No ability to reduce donations
- No ability to redirect funds
- Complete transparency to users

---

## 4. SMART CONTRACT IMPLEMENTATION

### 4.1 Contract Requirements
```solidity
// Immutable charity configuration
address public immutable POLARIS_PROJECT_ADDRESS;
uint256 public constant CHARITY_BASIS_POINTS = 1000; // 10%
bytes32 public immutable PARTNERSHIP_COMMITMENT_HASH;
```

### 4.2 Automatic Donation Flow
1. User initiates mint transaction
2. Contract calculates 10% donation amount
3. Donation is automatically transferred to Polaris address
4. Remaining 90% goes to protocol treasury
5. Both transfers occur in single atomic transaction
6. Events are emitted for transparency

### 4.3 Transparency Features
- All donations recorded on-chain
- Public getter functions for audit
- Real-time dashboard at /transparency
- Exportable CSV for accounting

---

## 5. VERIFICATION & AUDIT

### 5.1 On-Chain Verification
Anyone can verify:
```solidity
// Check Polaris address
address polaris = contract.POLARIS_PROJECT_ADDRESS();

// Check donation rate (should be 1000 = 10%)
uint256 rate = contract.CHARITY_BASIS_POINTS();

// Check total donated
(uint256 total,,,,) = contract.getGlobalCharityStats();
```

### 5.2 Block Explorer Verification
- Contract source code verified on Etherscan
- Polaris address labeled on major explorers
- Donation events indexed and searchable

### 5.3 Third-Party Audits
- Smart contract audited by [Auditor TBD]
- Donation flow verified independently
- Annual financial review published

---

## 6. USER FACING TRANSPARENCY

### 6.1 Mint UI Disclosure
Every mint interface must display:
> "This mint will send [X] ETH to Polaris Project National Trafficking Hotline"

### 6.2 Player Impact Tracking
- Lifetime contribution counter per wallet
- Global statistics dashboard
- Tier-based recognition system
- Shareable impact certificates

### 6.3 Public Dashboard
Available at: https://epworld.io/transparency
- Real-time donation totals
- Complete transaction history
- Verifiable on-chain data
- Export for auditors/accountants

---

## 7. LEGAL STRUCTURE

### 7.1 Tax Treatment
- Donations are automatic and irrevocable
- Users may be eligible for tax deductions (consult tax advisor)
- EPWorld does not take possession of donated funds
- Direct wallet-to-wallet transfers to Polaris

### 7.2 Regulatory Compliance
- Compliant with charitable giving regulations
- No securities implications (genuine donations)
- AML/KYC handled by minting infrastructure
- Full audit trail maintained on-chain

### 7.3 Disclaimers
- Polaris Project is an independent 501(c)(3) organization
- EPWorld has no control over how donations are used
- Users mint NFTs for their utility; donations are incidental
- No investment expectation or return promised

---

## 8. PARTNERSHIP TERMS

### 8.1 Duration
This partnership is **permanent** and encoded in immutable smart contract code. The commitment cannot be revoked, modified, or terminated.

### 8.2 Modifications
No modifications to the donation percentage or recipient address are possible. This is a feature, not a limitation—ensuring trustless execution.

### 8.3 Emergency Provisions
In the unlikely event of Polaris Project ceasing operations:
1. Contract continues donating to the original address
2. Community governance could deploy new contract
3. Original contract remains immutable (users can verify history)

---

## 9. TRANSPARENCY COMMITMENTS

### 9.1 EPWorld Commits To:
- [x] Immutable 10% donation hardcoded in contract
- [x] Real-time transparency dashboard
- [x] Clear disclosure in all mint UIs
- [x] Player lifetime impact tracking
- [x] Exportable donation records
- [x] Third-party contract audits
- [x] Open source contract code

### 9.2 Polaris Project Acknowledges:
- Receipt of automatic ETH donations
- Use of funds per their mission statement
- Public reporting of blockchain donations in annual reports

---

## 10. TECHNICAL SPECIFICATIONS

### 10.1 Network Support
| Network | Status | Contract Address |
|---------|--------|------------------|
| Ethereum Mainnet | Planned | TBD |
| Base | Primary | TBD |
| Optimism | Planned | TBD |

### 10.2 Polaris Project ETH Address
```
[To be provided by Polaris Project]
```
**Verification:** This address will be verified through official Polaris Project channels.

### 10.3 Contract Deployment
- Deployer: EPWorld multi-sig
- Proxy: None (immutable contract)
- Verification: Full source on Etherscan

---

## 11. RECOGNITION

### 11.1 Public Acknowledgment
- Polaris Project listed as official partner
- Partnership badge on all marketing materials
- Annual impact report highlighting contributions
- Social media coordination for major milestones

### 11.2 Community Recognition
- Special "Polaris Supporter" NFT badges
- Leaderboards for top contributors
- Discord roles for impact tiers
- Exclusive events for Champion Advocates

---

## 12. SIGNATURES

### EPWorld Representative
```
Name: knowurknot
Role: Founder
Date: March 7, 2026
Signature: [Digital signature or on-chain commit]
```

### Polaris Project Representative
```
Name: [Representative Name]
Role: [Title]
Date: [To be filled upon formal acceptance]
Signature: [Pending]
```

---

## 13. APPENDICES

### Appendix A: Smart Contract Source Code
See: `/contracts/PolarisCharityMinter.sol`

### Appendix B: UI Components
See: `/components/PolarisCharityMintCard.tsx`
See: `/components/PlayerImpactCounter.tsx`
See: `/components/PolarisTransparencyDashboard.tsx`

### Appendix C: Deployment Scripts
See: `/scripts/deploy-polaris-minter.ts`

### Appendix D: Verification Scripts
See: `/scripts/verify-partnership.ts`

---

## 14. DOCUMENT CERTIFICATION

**SHA256 Hash of this document:**
```
[To be computed upon finalization]
```

This hash is stored immutably in the smart contract as `PARTNERSHIP_COMMITMENT_HASH`, providing cryptographic proof of this agreement.

---

## 15. CONTACT INFORMATION

### EPWorld
- Website: https://epworld.io
- Email: [contact email]
- Twitter: @epworld

### Polaris Project
- Website: https://polarisproject.org
- Hotline: 1-888-373-7888
- Email: [partnership contact]

---

*This document represents a binding commitment encoded in immutable smart contract code. The blockchain doesn't forget—neither do we.*

**End of Agreement**
