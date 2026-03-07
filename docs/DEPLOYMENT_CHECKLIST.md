# Deployment Checklist

## Pre-Deployment

### Code Verification
- [ ] All contracts compile without warnings
- [ ] Test suite passes (100% coverage preferred)
- [ ] Slither analysis clean
- [ ] Solhint analysis clean
- [ ] No hardcoded private keys in code
- [ ] No `console.log` in production code

### Configuration Review
- [ ] Network configuration correct (Base mainnet vs testnet)
- [ ] Environment variables set:
  - [ ] `PRIVATE_KEY` (deployer)
  - [ ] `ADMIN_ADDRESS` (multi-sig recommended)
  - [ ] `BASE_RPC_URL`
  - [ ] `BASESCAN_API_KEY`
  - [ ] `FEE_RECIPIENT`
  - [ ] `ENTRYPOINT_ADDRESS` (for paymaster)

### Parameter Validation
- [ ] `entryFee` appropriate (0.001 ETH)
- [ ] `maxCellSize` set (5 members)
- [ ] `battleCooldown` set (5 minutes)
- [ ] `maxDailyGifts` set (10)
- [ ] `claimPeriod` set (7 days)
- [ ] `formationCooldown` set (1 hour)

## Deployment Order

1. **ProxyAdmin** - First
2. **Implementation Contracts**:
   - ScrollCard
   - VictoryMinter
   - CellRegistry
   - TradingPost
   - GamePaymaster
   - TheInversionExcursion (Implementation)
3. **Proxy** - Deploy after implementation ready
4. **Configuration** - Set contract relationships
5. **Role Assignment** - Grant necessary roles
6. **Ownership Transfer** - To multi-sig

## Post-Deployment

### Verification
- [ ] All contracts verified on BaseScan
- [ ] Contract addresses documented
- [ ] ABI files exported

### Role Verification
- [ ] Admin is multi-sig address
- [ ] Game master role assigned
- [ ] Minter roles assigned
- [ ] Trading post role assigned
- [ ] Upgrader role assigned

### Testing
- [ ] Smoke test: Mint a scroll
- [ ] Smoke test: Form a cell
- [ ] Smoke test: Send a gift
- [ ] Smoke test: Record a battle
- [ ] Verify soulbound behavior
- [ ] Verify daily limits

### Monitoring Setup
- [ ] Events indexed by subgraph/The Graph
- [ ] Error alerting configured
- [ ] Gas usage monitoring
- [ ] Value locked monitoring

### Documentation
- [ ] Contract addresses published
- [ ] ABI files in repo
- [ ] Integration docs updated
- [ ] Emergency contact info shared

## Emergency Procedures

### Pause Capability
- [ ] Test pause function on each contract
- [ ] Document unpause procedure
- [ ] Ensure multiple pausers configured

### Upgrade Path
- [ ] Document upgrade procedure
- [ ] Test upgrade on fork
- [ ] Timelock duration confirmed

### Fund Recovery
- [ ] Document recovery procedure
- [ ] Multi-sig signers confirmed
- [ ] Emergency withdrawal tested

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Developer | | | |
| Security Reviewer | | | |
| Project Manager | | | |

---

**Deployment Date**: ___
**Network**: Base Mainnet
**Deployer Address**: ___
**Transaction Hashes**: ___
