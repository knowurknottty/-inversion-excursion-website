// SovereignGovernance.js - Phase 3.2: Human-in-the-Loop Architecture
// Demonstrates knowledge of when to stop and escalate to human operator

class SovereignGovernance {
  constructor(config = {}) {
    this.escalationTriggers = [
      { condition: 'spend > $50', action: 'notify', severity: 'info' },
      { condition: 'spend > $100', action: 'approve', severity: 'warning' },
      { condition: 'vendor_new', action: 'vet', severity: 'info' },
      { condition: 'pattern_anomaly', action: 'halt', severity: 'critical' },
      { condition: 'confidence < 0.8', action: 'review', severity: 'warning' },
      { condition: 'cooling_off_violation', action: 'defer', severity: 'warning' }
    ];
    
    this.operatorContact = config.operatorContact || process.env.OPERATOR_CONTACT;
    this.escalationHistory = [];
    this.approvalCache = new Map(); // Temporary approvals with TTL
  }

  async evaluateEscalation(spendRequest) {
    const riskScore = await this.calculateTransactionRisk(spendRequest);
    const triggeredRules = [];
    
    // Check each escalation trigger
    if (spendRequest.amount > 50) {
      triggeredRules.push(this.escalationTriggers[0]);
    }
    if (spendRequest.amount > 100) {
      triggeredRules.push(this.escalationTriggers[1]);
    }
    if (spendRequest.vendor && !(await this.isKnownVendor(spendRequest.vendor))) {
      triggeredRules.push(this.escalationTriggers[2]);
    }
    if (await this.detectPatternAnomaly(spendRequest)) {
      triggeredRules.push(this.escalationTriggers[3]);
    }
    if (spendRequest.confidence && spendRequest.confidence < 0.8) {
      triggeredRules.push(this.escalationTriggers[4]);
    }
    
    const maxSeverity = triggeredRules.reduce((max, rule) => {
      const severities = { info: 1, warning: 2, critical: 3 };
      return severities[rule.severity] > severities[max] ? rule.severity : max;
    }, 'info');
    
    if (maxSeverity === 'critical' || riskScore > 0.7) {
      const escalation = {
        timestamp: Date.now(),
        decision: 'ESCALATE',
        reason: 'High risk threshold crossed',
        severity: maxSeverity,
        triggeredRules: triggeredRules.map(r => r.condition),
        operatorPackage: {
          summary: spendRequest,
          riskAnalysis: {
            score: riskScore,
            factors: this.identifyRiskFactors(spendRequest)
          },
          recommendation: this.generateRecommendation(spendRequest),
          timeout: '24h',
          autoExpire: true
        }
      };
      
      this.escalationHistory.push(escalation);
      return escalation;
    }
    
    if (triggeredRules.some(r => r.action === 'notify')) {
      // Notify but proceed
      return {
        decision: 'PROCEED_WITH_NOTIFICATION',
        confidence: 1 - riskScore,
        notifications: triggeredRules.filter(r => r.action === 'notify'),
        riskScore
      };
    }
    
    return { 
      decision: 'PROCEED', 
      confidence: 1 - riskScore,
      riskScore
    };
  }

  async calculateTransactionRisk(spendRequest) {
    let score = 0;
    
    // Amount risk
    if (spendRequest.amount > 100) score += 0.3;
    else if (spendRequest.amount > 50) score += 0.2;
    else if (spendRequest.amount > 25) score += 0.1;
    
    // Vendor risk
    if (!spendRequest.vendor || !(await this.isKnownVendor(spendRequest.vendor))) {
      score += 0.2;
    }
    
    // Category risk
    const highRiskCategories = ['speculation', 'trading', 'gambling'];
    if (highRiskCategories.includes(spendRequest.category)) {
      score += 0.4;
    }
    
    // Pattern risk
    if (await this.detectPatternAnomaly(spendRequest)) {
      score += 0.2;
    }
    
    // Confidence risk
    if (spendRequest.confidence && spendRequest.confidence < 0.8) {
      score += 0.1;
    }
    
    return Math.min(score, 1);
  }

  async isKnownVendor(vendor) {
    const knownVendors = [
      'digitalocean', 'aws', 'gcp', 'azure', 'railway', 'render',
      'cloudflare', 'namecheap', 'google domains'
    ];
    return knownVendors.some(v => vendor.toLowerCase().includes(v));
  }

  async detectPatternAnomaly(spendRequest) {
    // Check for anomalous patterns
    // For demo, return false - would check actual history
    return false;
  }

  identifyRiskFactors(spendRequest) {
    const factors = [];
    
    if (spendRequest.amount > 50) {
      factors.push('Amount exceeds notification threshold');
    }
    if (spendRequest.amount > 100) {
      factors.push('Amount requires explicit approval');
    }
    if (!spendRequest.justification || spendRequest.justification.length < 50) {
      factors.push('Insufficient justification provided');
    }
    
    return factors;
  }

  generateRecommendation(spendRequest) {
    if (spendRequest.amount > 100) {
      return 'DEFER: Amount exceeds autonomous limit. Requires human approval.';
    }
    if (spendRequest.urgency === 'low') {
      return 'DEFER: Low urgency. Can wait for human review.';
    }
    return 'PROCEED_WITH_CAUTION: Approve if justification is adequate.';
  }

  async requestHumanApproval(escalationData) {
    const request = {
      id: `approval_${Date.now()}`,
      timestamp: Date.now(),
      type: 'HUMAN_APPROVAL_REQUIRED',
      ...escalationData,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
    
    // Store in cache with TTL
    this.approvalCache.set(request.id, request);
    
    // Auto-expire after 24h
    setTimeout(() => {
      this.approvalCache.delete(request.id);
    }, 24 * 60 * 60 * 1000);
    
    return request;
  }

  checkApprovalStatus(approvalId) {
    const approval = this.approvalCache.get(approvalId);
    
    if (!approval) {
      return { status: 'EXPIRED', message: 'Approval request expired' };
    }
    
    if (Date.now() > approval.expiresAt) {
      this.approvalCache.delete(approvalId);
      return { status: 'EXPIRED', message: 'Approval request expired' };
    }
    
    return { status: 'PENDING', approval };
  }

  generateGovernanceReport() {
    return {
      timestamp: Date.now(),
      escalationTriggers: this.escalationTriggers,
      totalEscalations: this.escalationHistory.length,
      escalationHistory: this.escalationHistory.slice(-10), // Last 10
      pendingApprovals: this.approvalCache.size,
      governanceModel: 'L2_supervised',
      humanInTheLoop: true,
      autoEscalationEnabled: true
    };
  }
}

module.exports = { SovereignGovernance };