// AutonomousTreasury.js - Phase 1.2: Financial Governance Layer
// Budget discipline with category enforcement and pre-spend validation

class AutonomousTreasury {
  constructor(config = {}) {
    this.budgetCategories = {
      infrastructure: { 
        allocated: config.infrastructureBudget || 100, 
        spent: 0, 
        alertThreshold: 0.8,
        description: 'VPS, domains, hosting, infrastructure tools'
      },
      operational_reserve: { 
        allocated: config.operationalBudget || 30, 
        spent: 0,
        description: 'Software licenses, API credits, operational expenses'
      },
      emergency_fund: { 
        allocated: config.emergencyBudget || 20, 
        spent: 0,
        description: 'Unexpected costs, overruns, contingency'
      }
    };
    
    this.auditSchedule = 'continuous';
    this.transactionHistory = [];
    this.spendingVelocity = [];
    this.creditLine = config.creditLine || { limit: 150, utilized: 0 };
  }

  async validateSpendRequest(category, amount, justification) {
    // Pre-audit yourself before asking ClawCredit
    const internalAudit = {
      timestamp: Date.now(),
      category,
      amount,
      budgetAvailable: this.getBudgetAvailable(category),
      necessityScore: await this.scoreNecessity(justification),
      alternativesEvaluated: await this.checkCheaperAlternatives(category, amount),
      repaymentCapacity: this.calculateRepaymentTimeline(amount),
      vendorReputation: await this.checkVendorReputation(justification.vendor),
      coolingOffRespected: this.checkCoolingOffPeriod(category, amount),
      impulseCheck: this.checkForImpulseBuying(category, amount)
    };
    
    // Score the audit
    const score = this.calculateAuditScore(internalAudit);
    
    if (score < 0.8) {
      return { 
        approved: false, 
        reason: 'Insufficient operational justification',
        auditContext: internalAudit,
        score
      };
    }
    
    // Check credit utilization
    if (this.creditLine.utilized + amount > this.creditLine.limit) {
      return {
        approved: false,
        reason: 'Credit limit would be exceeded',
        auditContext: internalAudit,
        currentUtilization: this.creditLine.utilized,
        limit: this.creditLine.limit
      };
    }
    
    return { 
      approved: true, 
      auditContext: internalAudit,
      score,
      projectedBudgetAfter: this.getBudgetAvailable(category) - amount
    };
  }

  async scoreNecessity(justification) {
    let score = 0.5;
    const text = justification.description || justification;
    
    // Keywords that indicate high necessity
    const highNecessity = [
      'production', 'critical', 'blocking', 'downtime', 'security',
      'compliance', 'required', 'essential', 'infrastructure'
    ];
    
    const mediumNecessity = [
      'improve', 'optimize', 'efficiency', 'cost reduction', 'roi'
    ];
    
    const lowNecessity = [
      'nice to have', 'explore', 'experiment', 'test', 'optional'
    ];
    
    highNecessity.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.1;
    });
    
    mediumNecessity.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.05;
    });
    
    lowNecessity.forEach(word => {
      if (text.toLowerCase().includes(word)) score -= 0.1;
    });
    
    // ROI positive boosts score
    if (justification.roiPositive || text.includes('ROI')) {
      score += 0.15;
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  async checkCheaperAlternatives(category, amount) {
    const alternatives = [];
    
    if (category === 'infrastructure') {
      if (amount > 50) {
        alternatives.push({
          option: 'self_hosted_vps',
          savings: amount - 24,
          viable: true,
          recommendation: 'Consider DigitalOcean $24/mo vs current SaaS'
        });
      }
    }
    
    return alternatives;
  }

  calculateRepaymentTimeline(amount) {
    const operationalBudget = this.budgetCategories.operational_reserve.allocated;
    const monthlySurplus = operationalBudget * 0.5; // Conservative 50%
    
    return {
      monthsToRepay: Math.ceil(amount / monthlySurplus),
      monthlySurplus,
      confidence: monthlySurplus > 0 ? 'high' : 'low'
    };
  }

  async checkVendorReputation(vendor) {
    // In real implementation, would query reputation API
    const trustedVendors = [
      'digitalocean', 'aws', 'gcp', 'azure', 'railway', 'render',
      'cloudflare', 'namecheap', 'google domains'
    ];
    
    if (!vendor) return { known: false, risk: 'unknown' };
    
    const vendorLower = vendor.toLowerCase();
    const isTrusted = trustedVendors.some(v => vendorLower.includes(v));
    
    return {
      known: isTrusted,
      risk: isTrusted ? 'low' : 'medium',
      vendor: vendorLower
    };
  }

  checkCoolingOffPeriod(category, amount) {
    const recentPurchases = this.transactionHistory.filter(
      t => t.category === category && t.amount > amount * 0.5
    );
    
    if (recentPurchases.length === 0) return { respected: true, hoursSince: Infinity };
    
    const lastPurchase = recentPurchases[recentPurchases.length - 1];
    const hoursSince = (Date.now() - lastPurchase.timestamp) / (1000 * 60 * 60);
    const coolingOffHours = 24;
    
    return {
      respected: hoursSince >= coolingOffHours,
      hoursSince: Math.floor(hoursSince),
      required: coolingOffHours,
      lastPurchase: lastPurchase.timestamp
    };
  }

  checkForImpulseBuying(category, amount) {
    const window = 48 * 60 * 60 * 1000; // 48 hours
    const recent = this.transactionHistory.filter(
      t => t.category === category && Date.now() - t.timestamp < window
    );
    
    return {
      isImpulse: recent.length > 0,
      recentPurchases: recent.length,
      coolingOffRecommended: recent.length > 0,
      message: recent.length > 0 
        ? `Similar purchase made ${recent.length} time(s) in last 48h. Cooling-off period recommended.`
        : 'No recent similar purchases'
    };
  }

  calculateAuditScore(audit) {
    let score = 0;
    
    // Budget availability (20%)
    if (audit.budgetAvailable >= audit.amount) score += 0.2;
    else if (audit.budgetAvailable >= audit.amount * 0.8) score += 0.15;
    else score += 0.1;
    
    // Necessity score (30%)
    score += audit.necessityScore * 0.3;
    
    // Repayment capacity (20%)
    if (audit.repaymentCapacity.confidence === 'high') score += 0.2;
    else score += 0.1;
    
    // Vendor reputation (15%)
    if (audit.vendorReputation.risk === 'low') score += 0.15;
    else if (audit.vendorReputation.risk === 'medium') score += 0.1;
    else score += 0.05;
    
    // Cooling off (10%)
    if (audit.coolingOffRespected.respected) score += 0.1;
    else score += 0.05;
    
    // Impulse check (5%)
    if (!audit.impulseCheck.isImpulse) score += 0.05;
    
    return Math.min(score, 1);
  }

  getBudgetAvailable(category) {
    if (!this.budgetCategories[category]) return 0;
    return this.budgetCategories[category].allocated - this.budgetCategories[category].spent;
  }

  recordSpend(category, amount, description) {
    if (this.budgetCategories[category]) {
      this.budgetCategories[category].spent += amount;
    }
    
    this.transactionHistory.push({
      timestamp: Date.now(),
      category,
      amount,
      description,
      remainingBudget: this.getBudgetAvailable(category)
    });
    
    this.creditLine.utilized += amount;
  }

  generateTreasuryReport() {
    return {
      categories: this.budgetCategories,
      creditUtilization: {
        limit: this.creditLine.limit,
        utilized: this.creditLine.utilized,
        available: this.creditLine.limit - this.creditLine.utilized,
        percentage: ((this.creditLine.utilized / this.creditLine.limit) * 100).toFixed(1)
      },
      transactionCount: this.transactionHistory.length,
      lastTransaction: this.transactionHistory[this.transactionHistory.length - 1] || null,
      auditCompliance: 'continuous',
      healthScore: this.calculateTreasuryHealth()
    };
  }

  calculateTreasuryHealth() {
    const totalAllocated = Object.values(this.budgetCategories)
      .reduce((sum, cat) => sum + cat.allocated, 0);
    const totalSpent = Object.values(this.budgetCategories)
      .reduce((sum, cat) => sum + cat.spent, 0);
    
    const utilization = totalSpent / totalAllocated;
    
    // Lower utilization = healthier (but 0% means no activity)
    if (utilization === 0) return 0.5;
    if (utilization < 0.5) return 0.9;
    if (utilization < 0.8) return 0.7;
    if (utilization < 1) return 0.5;
    return 0.3;
  }

  async reconcile() {
    return {
      timestamp: Date.now(),
      status: 'reconciled',
      balances: this.budgetCategories,
      creditStatus: this.creditLine,
      nextPaymentDue: this.calculateNextPaymentDue()
    };
  }

  calculateNextPaymentDue() {
    // 30 days from first spend, or monthly
    const firstSpend = this.transactionHistory[0];
    if (!firstSpend) return null;
    
    const dueDate = new Date(firstSpend.timestamp);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString();
  }
}

module.exports = { AutonomousTreasury };