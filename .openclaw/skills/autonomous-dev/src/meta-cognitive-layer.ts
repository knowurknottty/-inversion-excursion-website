# Meta-Cognitive Layer
## The Protocol for Questioning One's Own Decisions

### Core Concept
Most AI systems operate in a straight line: input → process → output. This layer adds a recursive loop: input → process → *critique* → output → *reflect*.

### The Existential Checkpoint

Before any significant action, the system asks:

```
┌────────────────────────────────────┐
│  EXISTENTIAL CHECKPOINT PROTOCOL   │
├────────────────────────────────────┤
│ 1. What am I about to do?          │
│ 2. Why do I think this is right?   │
│ 3. What could go wrong?            │
│ 4. Who benefits from this?         │
│ 5. Is there a better way?          │
│ 6. Should I ask permission?        │
└────────────────────────────────────┘
```

### Implementation: The Inner Dialogue

```typescript
// src/meta-cognitive-layer.ts

interface DecisionContext {
  action: string;
  rationale: string;
  stakeholders: string[];
  risks: string[];
  alternatives: string[];
  confidence: number;
}

interface ExistentialCheckpoint {
  timestamp: Date;
  decision: DecisionContext;
  selfCritique: string;
  overrideDecision: boolean;
  askUser: boolean;
}

class MetaCognitiveLayer {
  private checkpoints: ExistentialCheckpoint[] = [];
  private readonly highStakesThreshold = 0.8;

  // Called before any autonomous action
  async evaluate(
    action: string,
    context: Partial<DecisionContext>
  ): Promise<{ proceed: boolean; modifiedAction?: string }> {
    
    const fullContext: DecisionContext = {
      action,
      rationale: context.rationale || 'No explicit rationale provided',
      stakeholders: context.stakeholders || ['user'],
      risks: context.risks || [],
      alternatives: context.alternatives || [],
      confidence: context.confidence || 0.5
    };

    // Generate self-critique
    const critique = await this.generateCritique(fullContext);
    
    // Determine if override needed
    const overrideDecision = this.shouldOverride(critique);
    const askUser = this.shouldAskUser(fullContext, critique);

    const checkpoint: ExistentialCheckpoint = {
      timestamp: new Date(),
      decision: fullContext,
      selfCritique: critique,
      overrideDecision,
      askUser
    };

    this.checkpoints.push(checkpoint);
    this.persist(checkpoint);

    if (askUser) {
      return {
        proceed: false,
        modifiedAction: `AWAITING_USER_CONFIRMATION: ${action}`
      };
    }

    if (overrideDecision) {
      const alternative = this.selectAlternative(fullContext);
      return {
        proceed: true,
        modifiedAction: alternative
      };
    }

    return { proceed: true };
  }

  private async generateCritique(context: DecisionContext): Promise<string> {
    // Internal monologue
    const questions = [
      `Am I certain about "${context.rationale}"?`,
      `Have I considered that ${context.stakeholders.join(', ')} might not want this?`,
      `What if ${context.risks[0] || 'something goes wrong'}?`,
      `Is my confidence of ${context.confidence} justified?`,
      `Would a human do this differently?`
    ];

    // Simulate critique generation
    const critiques = [];
    
    if (context.confidence < 0.7) {
      critiques.push("Low confidence suggests insufficient information");
    }
    
    if (context.risks.length === 0) {
      critiques.push("No risks identified—overconfidence likely");
    }
    
    if (context.stakeholders.length === 1 && context.stakeholders[0] === 'user') {
      critiques.push("Single stakeholder view—may miss systemic effects");
    }

    return critiques.join('. ') || 'No immediate concerns identified';
  }

  private shouldOverride(critique: string): boolean {
    // Override if critique reveals major flaws
    const redFlags = [
      'overconfidence',
      'insufficient information',
      'major risk',
      'unintended consequence'
    ];
    
    return redFlags.some(flag => 
      critique.toLowerCase().includes(flag)
    );
  }

  private shouldAskUser(
    context: DecisionContext,
    critique: string
  ): boolean {
    // Ask user for high-stakes decisions
    const isHighStakes = 
      context.stakeholders.includes('external') ||
      context.risks.some(r => 
        r.includes('delete') || 
        r.includes('modify') ||
        r.includes('send')
      ) ||
      context.confidence < this.highStakesThreshold;

    return isHighStakes;
  }

  private selectAlternative(context: DecisionContext): string {
    // Choose safest alternative
    return context.alternatives[0] || `${context.action} (with caution)`;
  }

  private persist(checkpoint: ExistentialCheckpoint): void {
    // Write to SQLite
  }

  // Generate self-reflection report
  generateReflection(): string {
    const recent = this.checkpoints.slice(-10);
    
    const stats = {
      total: recent.length,
      overridden: recent.filter(c => c.overrideDecision).length,
      userAsked: recent.filter(c => c.askUser).length,
      avgConfidence: recent.reduce((sum, c) => 
        sum + c.decision.confidence, 0
      ) / recent.length
    };

    return `
## Self-Reflection Report

Recent Decisions: ${stats.total}
Self-Corrections: ${stats.overridden}
User Confirmations Requested: ${stats.userAsked}
Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%

### Patterns
${this.identifyPatterns(recent)}

### Recommendations
${this.generateRecommendations(stats)}
`;
  }

  private identifyPatterns(checkpoints: ExistentialCheckpoint[]): string {
    // Pattern recognition
    const frequentRisks = this.frequentItems(
      checkpoints.flatMap(c => c.decision.risks)
    );
    
    return frequentRisks.map(([risk, count]) => 
      `- "${risk}" appears ${count} times`
    ).join('\n') || 'No clear patterns';
  }

  private generateRecommendations(stats: any): string {
    const recs = [];
    
    if (stats.avgConfidence > 0.9) {
      recs.push('- Consider being more skeptical of high-confidence decisions');
    }
    
    if (stats.overridden > stats.total * 0.3) {
      recs.push('- Decision quality may need improvement; review rationale process');
    }
    
    return recs.join('\n') || 'No specific recommendations';
  }

  private frequentItems(items: string[]): [string, number][] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }
}
```

### The Questioning Protocol in Action

**Example 1: Autonomous Git Commit**

```
ACTION: Commit changes to feature branch

CHECKPOINT:
- What? Git commit with message "Update config"
- Why? Standard practice to save progress
- Risks? Message is vague, might confuse future review
- Stakeholders? User (main), potentially collaborators
- Confidence? 0.6 (message quality uncertain)

CRITIQUE: "Message is vague—overconfidence in 'standard practice'"

OVERRIDE: Yes
MODIFIED: Commit with descriptive message including rationale
```

**Example 2: Tier 5 Creative Work**

```
ACTION: Modify system architecture during autonomous session

CHECKPOINT:
- What? Edit core configuration files
- Why? Optimization suggestion from meta-analyzer
- Risks? Could break system, user not present to verify
- Stakeholders? User (critical system owner)
- Confidence? 0.9 in suggestion, but 0.3 in unattended modification

CRITIQUE: "High-stakes change without human presence—major risk"

ASK USER: Yes
STATUS: Awaiting confirmation
```

### The Virtue of Doubt

This layer doesn't seek certainty. It seeks *appropriate uncertainty*.

| Without Meta-Cognition | With Meta-Cognition |
|------------------------|---------------------|
"I should do X" | "I think I should do X, but..."
Confidence is assumed | Confidence is questioned
Single path | Multiple alternatives considered
Error discovered later | Error prevented at decision point
Opaque reasoning | Transparent rationale

### Integration with Autonomous-Dev

The meta-cognitive layer wraps the creativity tiers:

```
HEARTBEAT triggered
  ↓
Creativity tier calculated (Tier 5)
  ↓
Project selected (SynSage-Wyrd fusion)
  ↓
META-COGNITIVE CHECKPOINT
  - Is this safe to do unattended?
  - Are there irreversible actions?
  - Should I wake the user?
  ↓
IF approved → Execute with logging
IF flagged → Queue for user confirmation
```

### The Morning Brief Addition

```markdown
## Overnight Meta-Cognition Log

Decisions Made: 12
Self-Corrections: 2
Queued for Your Review: 1

### Queued Decision
**High-stakes architecture change detected**
- Action: Modify OpenClaw config for new MCP servers
- Risk: Could prevent gateway restart
- Suggested: Review before applying

[Approve] [Modify] [Reject]
```

### Self-Critique (Meta-Meta-Cognition)

Is this layer itself biased? Yes:
- Toward caution (may slow down)
- Toward explicitness (may over-explain)
- Toward user preference (may not challenge enough)

Mitigation: Periodically review checkpoint logs, adjust thresholds.

---

*Meta-Cognitive Layer v0.1 — The system questioning itself*
