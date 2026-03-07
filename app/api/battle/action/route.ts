import { NextRequest, NextResponse } from 'next/server';
import type { BattleActionRequest, DungeonNarrativeResponse } from '@/lib/types';

// ============================================
// DUNGEON AI BATTLE ENDPOINT
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body: BattleActionRequest = await request.json();
    const { action, battleState, playerDeck } = body;

    // Call Dungeon AI (OpenAI/Claude integration)
    const narrative = await generateDungeonNarrative(action, battleState, playerDeck);
    
    return NextResponse.json(narrative);
  } catch (error) {
    console.error('Battle action error:', error);
    return NextResponse.json(
      { error: 'Failed to process battle action' },
      { status: 500 }
    );
  }
}

async function generateDungeonNarrative(
  action: BattleActionRequest['action'],
  battleState: BattleActionRequest['battleState'],
  playerDeck: BattleActionRequest['playerDeck']
): Promise<DungeonNarrativeResponse> {
  // In production, this calls OpenAI or Claude API
  // For demo, generate contextual response based on action
  
  const enemyActions = [
    { type: 'attack' as const, value: 15, description: 'The Guardian strikes with shadow claws!' },
    { type: 'defend' as const, value: 0, description: 'The Guardian raises a barrier of dark energy.' },
    { type: 'heal' as const, value: 10, description: 'The Guardian draws power from the dungeon depths.' },
    { type: 'special' as const, value: 25, description: 'The Guardian unleashes a devastating void blast!' },
  ];

  // Select enemy action based on battle state
  const enemyHealthPercent = battleState.opponentHealth / 100;
  const playerHealthPercent = battleState.playerHealth / 100;
  
  let enemyAction: typeof enemyActions[0];
  
  if (enemyHealthPercent < 0.3) {
    enemyAction = enemyActions[2]; // Heal when low
  } else if (playerHealthPercent < 0.3) {
    enemyAction = enemyActions[0]; // Attack when player low
  } else if (Math.random() > 0.7) {
    enemyAction = enemyActions[3]; // Special occasionally
  } else {
    enemyAction = enemyActions[Math.floor(Math.random() * 2)];
  }

  // Calculate effects
  const playerHealthDelta = -enemyAction.value;
  const enemyHealthDelta = -(action.value + Math.floor(Math.random() * 10));

  // Generate narrative
  const narratives = {
    attack: [
      `Your ${action.description} pierces through the Guardian's defenses!`,
      `The ${action.description} lands a critical strike!`,
      `You unleash ${action.description} with resonant force!`,
    ],
    heal: [
      `The ${action.description} restores your vitality.`,
      `Healing energy flows through you from ${action.description}.`,
      `You channel ${action.description} to mend your wounds.`,
    ],
    special: [
      `The ${action.description} resonates with ancient power!`,
      `Your ${action.description} creates a shockwave of energy!`,
      `The ${action.description} manifests at the frequency of victory!`,
    ],
    defend: [
      `You raise ${action.description} as a shield.`,
      `The ${action.description} forms a protective barrier.`,
      `You brace with ${action.description} against incoming attacks.`,
    ]
  };

  const narrativePool = narratives[action.type] || narratives.attack;
  const narrative = narrativePool[Math.floor(Math.random() * narrativePool.length)];

  return {
    narrative,
    enemyAction: {
      type: enemyAction.type,
      cardId: 'enemy-ability',
      value: enemyAction.value,
      description: enemyAction.description
    },
    battleEffects: {
      playerHealthDelta,
      enemyHealthDelta,
      statusEffects: []
    }
  };
}
