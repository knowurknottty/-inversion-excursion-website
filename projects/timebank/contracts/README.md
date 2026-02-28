# Timebank Smart Contract
## Soulbound TimeTokens on Solana

**Status:** Contract structure complete, ready for testing and deployment

---

## Architecture

### Core Programs

| Program | Purpose |
|---------|---------|
| `initialize_community` | Create a new timebank community |
| `register_provider` | Join as service provider |
| `request_service` | Request help from community |
| `accept_service` | Provider accepts request |
| `complete_service` | Finish and mint TimeTokens |
| `raise_dispute` | Escalate conflict |
| `resolve_dispute` | Community jurors decide |

### Data Structures

**Community:**
- Name, region, admin
- Treasury account
- Expiration policy
- Member count
- Hours exchanged

**Provider:**
- Owner (wallet)
- Skills (category + name)
- Reputation score (0-1000)
- Hours provided/received
- Active status

**ServiceRequest:**
- Requester + Provider
- Skill required
- Duration (15-min increments)
- Status (Open/Accepted/Completed)
- Timestamps

**Dispute:**
- Linked request
- Evidence
- Status
- Verdict

---

## Token Economics

### TimeToken (TT)
- **Minting:** 1 TT per 15 minutes of service
- **Soulbound:** Non-transferable
- **Expiration:** X months after earning
- **Burning:** Automatic on expiration

### Reputation Score
- **Range:** 0-1000
- **Start:** 500
- **Gain:** +10 to +50 per positive interaction
- **Loss:** -10 to -30 per negative interaction
- **Effects:** Higher score = more trust, lower collateral

---

## Dispute Resolution

### Process
1. Either party raises dispute
2. Stake dispute fee (loser pays)
3. Community jurors (high reputation) vote
4. Verdict applied automatically

### Verdicts
- **ProviderWins:** Escrow released to provider
- **RequesterWins:** Escrow returned to requester
- **Split:** Escrow divided

---

## Security Features

- ✅ Soulbound tokens (can't be sold)
- ✅ Expiration mechanism (prevents hoarding)
- ✅ Reputation system (builds trust)
- ✅ Dispute resolution (handles conflicts)
- ✅ Escrow (protects both parties)
- ✅ Multisig treasury (community control)

---

## Deployment Steps

1. **Install dependencies:**
   ```bash
   npm install
   cargo build
   ```

2. **Run tests:**
   ```bash
   anchor test
   ```

3. **Build:**
   ```bash
   anchor build
   ```

4. **Deploy to devnet:**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

5. **Deploy to mainnet:**
   ```bash
   anchor deploy --provider.cluster mainnet
   ```

---

## Integration with Sheckle

### Two-Token Economy
- **$SHECKLE:** Liquid, speculative, on-ramp
- **TimeToken:** Utility, soulbound, expires

### Staking Mechanism
- Stake $SHECKLE → Earn TimeTokens
- Use TimeTokens → Access services
- Redeem excess → Back to $SHECKLE (at discount)

---

## Next Steps

- [ ] Complete test suite
- [ ] Add frontend integration
- [ ] Deploy to devnet
- [ ] Security audit
- [ ] Mainnet deployment

---

*By the goyim, for the goyim. Built on Solana.*

