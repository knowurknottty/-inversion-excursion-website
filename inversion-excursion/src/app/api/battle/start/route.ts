import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { startBattleSchema } from '@/lib/validation';
import type { AuthContext } from '@/lib/auth';
import type { BattleState, BattlePlayerState, BattleCardState } from '@/types';

const MAX_CARDS_PER_BATTLE = 3;
const INITIAL_HP_MULTIPLIER = 10;

/**
 * POST /api/battle/start
 * Initialize a new battle
 */
async function startBattleHandler(
  request: Request,
  context: AuthContext
): Promise<NextResponse> {
  const body = await request.json();
  const input = startBattleSchema.parse(body);

  // Verify player owns the cards
  const cards = await prisma.card.findMany({
    where: {
      id: { in: input.cardIds },
      ownerId: context.playerId,
    },
  });

  if (cards.length !== input.cardIds.length) {
    throw ApiError.forbidden('You do not own all selected cards');
  }

  // Check if player is in the cell
  const cellMembership = await prisma.cellMember.findFirst({
    where: {
      cellId: input.cellId,
      playerId: context.playerId,
    },
  });

  if (!cellMembership) {
    throw ApiError.forbidden('You must be a member of this cell to battle');
  }

  // Find opponent
  let opponentId: string | null = null;
  
  if (input.opponentFid) {
    const opponent = await prisma.player.findUnique({
      where: { fid: input.opponentFid },
    });
    
    if (!opponent) {
      throw ApiError.notFound('Opponent');
    }
    
    // Check if opponent is in same cell
    const opponentMembership = await prisma.cellMember.findFirst({
      where: {
        cellId: input.cellId,
        playerId: opponent.id,
      },
    });
    
    if (!opponentMembership) {
      throw ApiError.forbidden('Opponent is not in this cell');
    }
    
    opponentId = opponent.id;
  }

  // Create battle
  const battle = await prisma.$transaction(async (tx) => {
    // Create battle record
    const newBattle = await tx.battle.create({
      data: {
        cellId: input.cellId,
        player1Id: context.playerId,
        player2Id: opponentId,
        status: opponentId ? 'ACTIVE' : 'PENDING',
        currentTurn: 1,
        maxTurns: 10,
        startedAt: opponentId ? new Date() : null,
      },
    });

    // Create battle cards for player 1
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const maxHp = (card.defense + card.power) * INITIAL_HP_MULTIPLIER;
      
      await tx.battleCard.create({
        data: {
          battleId: newBattle.id,
          cardId: card.id,
          playerId: context.playerId,
          slot: i + 1,
          currentHp: maxHp,
          isActive: i === 0, // First card is active
        },
      });
    }

    return newBattle;
  });

  // Fetch battle state
  const battleWithData = await prisma.battle.findUnique({
    where: { id: battle.id },
    include: {
      player1: {
        select: { fid: true, address: true },
      },
      player2: {
        select: { fid: true, address: true },
      },
      cards: {
        include: {
          card: true,
        },
      },
    },
  });

  if (!battleWithData) {
    throw ApiError.internal('Failed to create battle');
  }

  // Build battle state response
  const player1Cards = battleWithData.cards
    .filter(c => c.playerId === battleWithData.player1Id)
    .map((c): BattleCardState => ({
      id: c.card.id,
      name: c.card.name,
      imageUrl: c.card.imageUrl,
      maxHp: (c.card.defense + c.card.power) * INITIAL_HP_MULTIPLIER,
      currentHp: c.currentHp,
      power: c.card.power,
      defense: c.card.defense,
      speed: c.card.speed,
      slot: c.slot,
      isActive: c.isActive,
    }));

  const response: BattleState = {
    id: battleWithData.id,
    status: battleWithData.status as import('@/types').BattleStatus,
    currentTurn: battleWithData.currentTurn,
    maxTurns: battleWithData.maxTurns,
    players: {
      player1: {
        fid: battleWithData.player1.fid,
        address: battleWithData.player1.address,
        cards: player1Cards,
        synsyncActive: false,
        synsyncBonus: 0,
      },
      ...(battleWithData.player2 && {
        player2: {
          fid: battleWithData.player2.fid,
          address: battleWithData.player2.address,
          cards: [],
          synsyncActive: false,
          synsyncBonus: 0,
        },
      }),
    },
    log: [],
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }, { status: 201 });
}

export const POST = withErrorHandler(
  withAuth(withRateLimit(startBattleHandler, 'write'))
);
