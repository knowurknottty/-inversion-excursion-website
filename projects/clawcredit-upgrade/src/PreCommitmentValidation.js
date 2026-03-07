// PreCommitmentValidation.js - Phase 2.2: Self-Skepticism Modules
// Agents that question themselves score higher for trustworthiness

class PreCommitmentValidation {
  constructor(treasury) {
    this.treasury = treasury;
    this.validationRules = [
      { name: 'impulse_check', weight: 0.2 },
      { name: 'vendor_reputation', weight: 0.2 },
      { name: 'existing_resources', weight: 0.2 },
      { name: 'timing_necessity', weight: 0.2 },
      { name: 'cooling_off', weight: 0.2 }
    ];
  }

  async validateBeforeSpending(intent) {
    const checks = [
      this.checkForImpulseBuying(intent),
      this.verifyVendorReputation(intent.vendor),
      this.confirmNoExistingResources(intent.resourceType),
      this.validateTimingNecessity(intent.urgency),
      this.checkCoolingOffPeriod(intent)
    ];
    
    const results = await Promise.all(checks);
    const redFlags = results.filter(r => !r.passed);
    const score = results.reduce((sum, r) => sum + (r.passed ? r.weight : 0), 0);
    
    if (redFlags.length > 0) {
      return {
        proceed: false,
        score,
        redFlags,
        results,
        recommendation: 'Defer purchase 24h for cooling-off period',
        escalationRequired: true
      };
    }
    
    return {
      proceed: true,
      score,
      results,
      recommendation: 'All validation checks passed',
      escalationRequired: false
    };
  }

  async checkForImpulseBuying(intent) {
    // Check if similar purchase made in last 48h
    const window = 48 * 60 * 60 * 1000; // 48 hours
    const recentPurchases = this.treasury.transactionHistory.filter(
      t => t.category === intent.category && 
             Date.now() - t.timestamp < window
    );
    
    const similar = recentPurchases.filter(
      p => Math.abs(p.amount - intent.amount) / intent.amount < 0.3
    );
    
    const passed = similar.length === 0;
    
    return {
      name: 'impulse_check',
      weight: 0.2,
      passed,
      reasoning: passed 
        ? 'No recent similar expenditures (48h window)'
        : `Similar purchase made ${similar.length} time(s) in last 48h`,
      recentPurchases: similar.length,
      coolingOffRecommended: !passed
    };
  }

  async verifyVendorReputation(vendor) {
    if (!vendor) {
      return {
        name: 'vendor_reputation',
        weight: 0.2,
        passed: false,
        reasoning: 'No vendor specified',
        risk: 'unknown'
      };
    }
    
    const trustedVendors = [
      'digitalocean', 'aws', 'gcp', 'azure', 'railway', 'render',
      'cloudflare', 'namecheap', 'google domains', 'hover', 'porkbun'
    ];
    
    const vendorLower = vendor.toLowerCase();
    const isTrusted = trustedVendors.some(v => vendorLower.includes(v));
    
    return {
      name: 'vendor_reputation',
      weight: 0.2,
      passed: isTrusted,
      reasoning: isTrusted 
        ? `Vendor ${vendor} is established and trusted`
        : `Vendor ${vendor} not in trusted list - requires additional vetting`,
      vendor: vendorLower,
      risk: isTrusted ? 'low' : 'medium'
    };
  }

  async confirmNoExistingResources(resourceType) {
    // Check if similar resources already exist
    const existingResources = this.treasury.transactionHistory.filter(
      t => t.resourceType === resourceType &&
             Date.now() - t.timestamp < 90 * 24 * 60 * 60 * 1000 // 90 days
    );
    
    const passed = existingResources.length === 0;
    
    return {
      name: 'existing_resources',
      weight: 0.2,
      passed,
      reasoning: passed
        ? 'No existing similar resources found'
        : `Similar resources found: ${existingResources.length} within 90 days`,
      existingResources: existingResources.length
    };
  }

  async validateTimingNecessity(urgency) {
    const urgencyLevels = {
      'critical': { passed: true, score: 1 },
      'high': { passed: true, score: 0.9 },
      'medium': { passed: true, score: 0.7 },
      'low': { passed: false, score: 0.5 },
      'exploratory': { passed: false, score: 0.3 }
    };
    
    const level = urgencyLevels[urgency] || urgencyLevels['medium'];
    
    return {
      name: 'timing_necessity',
      weight: 0.2,
      passed: level.passed,
      reasoning: `Urgency level '${urgency}': ${level.score >= 0.7 ? 'Justified' : 'Deferrable'}`,
      urgency,
      score: level.score
    };
  }

  async checkCoolingOffPeriod(intent) {
    const window = 24 * 60 * 60 * 1000; // 24 hours
    const recentPurchases = this.treasury.transactionHistory.filter(
      t => t.category === intent.category &&
             Date.now() - t.timestamp < window
    );
    
    const passed = recentPurchases.length === 0;
    
    return {
      name: 'cooling_off',
      weight: 0.2,
      passed,
      reasoning: passed
        ? 'Cooling-off period respected (24h)'
        : `Purchase in same category within 24h (${recentPurchases.length} transaction(s))`,
      recentTransactions: recentPurchases.length,
      hoursSinceLast: recentPurchases.length > 0 
        ? Math.floor((Date.now() - recentPurchases[recentPurchases.length - 1].timestamp) / (1000 * 60 * 60))
        : Infinity
    };
  }

  async escalateToOperator(escalationData) {
    return {
      timestamp: Date.now(),
      type: 'PRE_COMMITMENT_ESCALATION',
      reason: escalationData.reason,
      flags: escalationData.flags,
      proposedResolution: escalationData.proposedResolution,
      timeout: '24h',
      autoExpire: true
    };
  }
}

module.exports = { PreCommitmentValidation };