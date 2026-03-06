/**
 * creativity-scaler.ts
 * Computes creativity tier and session budget from downtime duration.
 */

export type CreativityTier = 1 | 2 | 3 | 4 | 5;

export interface SessionBudget {
  tier: CreativityTier;
  label: string;
  totalMinutes: number;
  kbMinutes: number;
  researchMinutes: number;
  creativeMinutes: number;
  allowAutoStart: boolean;
  branchPreference: 'single' | 'competing' | 'unrelated' | 'all';
  ideaCount: number;
  challengeAssumptions: boolean;
}

const TIER_LABELS: Record<CreativityTier, string> = {
  1: 'Incremental',
  2: 'Iterative',
  3: 'Expansive',
  4: 'Inventive',
  5: 'Visionary'
};

function getTier(downtimeMinutes: number): CreativityTier {
  if (downtimeMinutes < 30) return 1;
  if (downtimeMinutes < 120) return 2;
  if (downtimeMinutes < 360) return 3;
  if (downtimeMinutes < 1440) return 4;
  return 5;
}

export function computeSessionBudget(
  downtimeMinutes: number,
  projectType: 'kb-heavy' | 'research' | 'standard'
): SessionBudget {
  const tier = getTier(downtimeMinutes);
  const label = TIER_LABELS[tier];

  // Budget allocation based on project type
  const allocations = {
    'kb-heavy': { kb: 0.4, research: 0.1, creative: 0.5 },
    'research': { kb: 0.1, research: 0.5, creative: 0.4 },
    'standard': { kb: 0.2, research: 0.2, creative: 0.6 }
  };

  const alloc = allocations[projectType];

  // Available work time (cap at 2 hours for practical sessions)
  const totalMinutes = Math.min(downtimeMinutes * 0.5, 120);

  return {
    tier,
    label,
    totalMinutes,
    kbMinutes: Math.floor(totalMinutes * alloc.kb),
    researchMinutes: Math.floor(totalMinutes * alloc.research),
    creativeMinutes: Math.floor(totalMinutes * alloc.creative),
    allowAutoStart: tier >= 4,
    branchPreference: tier <= 2 ? 'single' : tier <= 3 ? 'competing' : 'all',
    ideaCount: tier * 4, // 4, 8, 12, 16, 20 ideas
    challengeAssumptions: tier >= 4
  };
}

export function getInventionProtocol(tier: CreativityTier): string[] {
  if (tier < 4) return [];

  return [
    'Generate 5 "obvious" ideas — then discard them entirely',
    'Ask: "What would an expert from a completely unrelated field suggest?"',
    'Apply at least one cross-domain analogy',
    'For SynSync: consider neuroscience, physics of coupled oscillators, information theory, perceptual psychology simultaneously',
    'For Wyrd: consider narrative theory, emergence, chaos, information entropy as structural metaphors'
  ];
}

export function shouldGenerateIdeas(tier: CreativityTier): boolean {
  return tier >= 2;
}

export function getBranchName(
  tier: CreativityTier,
  slug: string,
  variant?: 'a' | 'b'
): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  if (tier >= 4 && variant) {
    return `experiment/${variant}-${slug}`;
  }

  if (tier >= 4) {
    return `wip/auto-${date}-${slug}`;
  }

  return `feature/auto-${date}-${slug}`;
}
