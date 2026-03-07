import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { battleActionSchema } from '@/lib/validation';
import type { AuthContext } from '@/lib/auth';
import type { BattleState, BattleActionLog, ActionType } from '@/types';

const ACTION_DAMAGE: Record<ActionType, number> = {
  ATTACK: 25,
  DEFEND: 0,
  SPECIAL: 40,
  HEAL: 30,
  SYNSYNC_BOOST: 15,
  SKIP: 0,
};

/**
 * POST /api/battle/action
 * Submit player action in battle
 */
async function battleActionHandler(
  request: Request,
  context: AuthContext
): Promise<NextResponse> {
  const body = await request.json();
  const input = battleActionSchema.parse(body);

  // Fetch battle with all data
  const battle = await prisma.battle.findUnique({
    where: { id: input.battleId },
    include: {
      player1: {
        select: { id: true, fid: true, address: true },
      },
      player2: {
        select: { id: true, fid: true, address: true },
      },
      cards: {
        include: { card: true },
      },
      actions: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!battle) {
    throw ApiError.notFound('Battle');
  }

  // Verify player is in battle
  const isPlayer1 = battle.player1Id === context.playerId;
  const isPlayer2 = battle.player2Id === context.playerId;
  
  if (!isPlayer1 && !isPlayer2) {
    throw ApiError.forbidden('You are not a participant in this battle');
  }

  // Check battle status
  if (battle.status !== 'ACTIVE') {
    throw ApiError.badRequest(`Battle is ${battle.status.toLowerCase()}`);
  }

  // Get player's active card
  const playerCards = battle.cards.filter(c => c.playerId === context.playerId);
  const activeCard = playerCards.find(c => c.isActive);
  
  if (!activeCard) {
    throw ApiError.badRequest('No active card found');
  }

  // Verify action card belongs to player
  if (input.cardId !== activeCard.cardId) {
    throw ApiError.forbidden('Invalid card for action');
  }

  // Determine target
  const opponentId = isPlayer1 ? battle.player2Id : battle.player1Id;
  let targetCardId: string | null = null;
  let damage = 0;
  let description = '';

  if (input.targetId) {
    const targetCard = battle.cards.find(c => c.cardId === input.targetId && c.playerId !== context.playerId);
    if (!targetCard) {
      throw ApiError.badRequest('Invalid target');
    }
    targetCardId = targetCard.id;
  }

  // Calculate action effects
  const actionType = input.actionType as ActionType;
  const baseDamage = ACTION_DAMAGE[actionType];
  
  // Apply stats modifiers
  const powerBonus = activeCard.card.power * 0.1;
  const speedBonus = activeCard.card.speed * 0.05;
  const synsyncBonus = activeCard.card.synsyncBonus;
  
  damage = Math.floor(baseDamage + powerBonus + speedBonus + synsyncBonus);

  // Build action description
  switch (actionType) {
    case 'ATTACK':
      description = `${activeCard.card.name} attacks for ${damage} damage!`;
      break;
    case 'DEFEND':
      description = `${activeCard.card.name} takes a defensive stance.`;
      break;
    case 'SPECIAL':
      description = `${activeCard.card.name} unleashes a special attack for ${damage} damage!`;
      break;
    case 'HEAL':
      description = `${activeCard.card.name} recovers ${damage} HP.`;
      break;
    case 'SYNSYNC_BOOST':
      description = `${activeCard.card.name} channels Synsync energy for a ${damage} damage boost!`;
      break;
    case 'SKIP':
      description = `${activeCard.card.name} skips their turn.`;
      break;
  }

  // Execute action in transaction
  const updatedBattle = await prisma.$transaction(async (tx) => {
    // Record action
    await tx.battleAction.create({
      data: {
        battleId: battle.id,
        playerId: context.playerId,
        turn: battle.currentTurn,
        actionType,
        targetId: targetCardId,
        value: damage,
        metadata: {
          cardName: activeCard.card.name,
          description,
        },
      },
    });

    // Apply damage/healing
    if (actionType === 'ATTACK' || actionType === 'SPECIAL') {
      if (targetCardId) {
        const target = await tx.battleCard.findUnique({
          where: { id: targetCardId },
        });
        if (target) {
          const newHp = Math.max(0, target.currentHp - damage);
          await tx.battleCard.update({
            where: { id: targetCardId },
            data: { currentHp: newHp },
          });
          
          // If card is defeated, deactivate it
          if (newHp === 0) {
            await tx.battleCard.update({
              where: { id: targetCardId },
              data: { isActive: false },
            });
          }
        }
      }
    } else if (actionType === 'HEAL') {
      const maxHp = (activeCard.card.defense + activeCard.card.power) * 10;
      const newHp = Math.min(maxHp, activeCard.currentHp + damage);
      await tx.battleCard.update({
        where: { id: activeCard.id },
        data: { currentHp: newHp },
      });
    }

    // Update turn
    const isPlayer1Turn = battle.currentTurn % 2 === 1;
    const shouldAdvanceTurn = (isPlayer1 && !isPlayer1Turn) || (!isPlayer1 && isPlayer1Turn);
    
    let newStatus = battle.status;
    let winnerId: string | null = null;
    
    // Check for battle end conditions
    const opponentCards = battle.cards.filter(c => c.playerId === opponentId);
    const opponentActiveCards = opponentCards.filter(c => c.isActive);
    const playerActiveCards = playerCards.filter(c => c.isActive);
    
    if (opponentActiveCards.length === 0) {
      newStatus = 'COMPLETED';
      winnerId = context.playerId;
    } else if (playerActiveCards.length === 0) {
      newStatus = 'COMPLETED';
      winnerId = opponentId;
    } else if (battle.currentTurn >= battle.maxTurns) {
      newStatus = 'COMPLETED';
      // Winner has more total HP
      const playerTotalHp = playerCards.reduce((sum, c) => sum + c.currentHp, 0);
      const opponentTotalHp = opponentCards.reduce((sum, c) => sum + c.currentHp, 0);
      winnerId = playerTotalHp >= opponentTotalHp ? context.playerId : opponentId;
    }

    return tx.battle.update({
      where: { id: battle.id },
      data: {
        currentTurn: shouldAdvanceTurn ? battle.currentTurn + 1 : battle.currentTurn,
        status: newStatus,
        winnerId,
        endedAt: newStatus === 'COMPLETED' ? new Date() : null,
      },
      include: {
        player1: { select: { fid: true, address: true } },
        player2: { select: { fid: true, address: true } },
        cards: { include: { card: true } },
        actions: { orderBy: { createdAt: 'asc' } },
      },
    });
  });

  // Build response
  const player1Cards = updatedBattle.cards
    .filter(c => c.playerId === updatedBattle.player1Id)
    .map(c => ({
      id: c.card.id,
      name: c.card.name,
      imageUrl: c.card.imageUrl,
      maxHp: (c.card.defense + c.card.power) * 10,
      currentHp: c.currentHp,
      power: c.card.power,
      defense: c.card.defense,
      speed: c.card.speed,
      slot: c.slot,
      isActive: c.isActive,
    }));

  const player2Cards = updatedBattle.player2Id 
    ? updatedBattle.cards
        .filter(c => c.playerId === updatedBattle.player2Id)
        .map(c => ({
          id: c.card.id,
          name: c.card.name,
          imageUrl: c.card.imageUrl,
          maxHp: (c.card.defense + c.card.power) * 10,
          currentHp: c.currentHp,
          power: c.card.power,
          defense: c.card.defense,
          speed: c.card.speed,
          slot: c.slot,
          isActive: c.isActive,
        }))
    : [];

  const battleLog: BattleActionLog[] = updatedBattle.actions.map(a => ({
    turn: a.turn,
    playerFid: a.playerId === updatedBattle.player1Id 
      ? updatedBattle.player1.fid 
      : updatedBattle.player2!.fid,
    actionType: a.actionType as ActionType,
    description: (a.metadata as { description?: string })?.description || `${a.actionType} action`,
    timestamp: a.createdAt.toISOString(),
  }));

  const response: BattleState = {
    id: updatedBattle.id,
    status: updatedBattle.status as import('@/types').BattleStatus,
    currentTurn: updatedBattle.currentTurn,
    maxTurns: updatedBattle.maxTurns,
    players: {
      player1: {
        fid: updatedBattle.player1.fid,
        address: updatedBattle.player1.address,
        cards: player1Cards,
        synsyncActive: false,
        synsyncBonus: 0,
      },
      ...(updatedBattle.player2 && {
        player2: {
          fid: updatedBattle.player2.fid,
          address: updatedBattle.player2.address,
          cards: player2Cards,
          synsyncActive: false,
          synsyncBonus: 0,
        },
      }),
    },
    log: battleLog,
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

export const POST = withErrorHandler(
  withAuth(withRateLimit(battleActionHandler, 'write'))
);
