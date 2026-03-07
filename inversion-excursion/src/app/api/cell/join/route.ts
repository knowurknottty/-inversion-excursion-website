import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { joinCellSchema } from '@/lib/validation';
import type { AuthContext } from '@/lib/auth';
import type { CellResponse } from '@/types';

/**
 * POST /api/cell/join
 * Join an existing Cell
 */
async function joinCellHandler(
  request: Request,
  context: AuthContext
): Promise<NextResponse> {
  const body = await request.json();
  const input = joinCellSchema.parse(body);

  // Check if cell exists
  const cell = await prisma.cell.findUnique({
    where: { id: input.cellId },
    include: {
      members: {
        include: {
          player: {
            select: {
              fid: true,
              address: true,
            },
          },
        },
      },
      _count: {
        select: { members: true },
      },
    },
  });

  if (!cell) {
    throw ApiError.notFound('Cell');
  }

  // Check if player is already in this cell
  const existingMembership = cell.members.find(m => m.playerId === context.playerId);
  if (existingMembership) {
    throw ApiError.conflict('You are already a member of this cell');
  }

  // Check if player is in another cell
  const otherMembership = await prisma.cellMember.findFirst({
    where: { playerId: context.playerId },
  });

  if (otherMembership) {
    throw ApiError.conflict('You must leave your current cell before joining a new one');
  }

  // TODO: Verify invite code if cell is private
  // if (cell.isPrivate && cell.inviteCode !== input.inviteCode) {
  //   throw ApiError.forbidden('Invalid invite code');
  // }

  // Add player to cell
  await prisma.cellMember.create({
    data: {
      cellId: input.cellId,
      playerId: context.playerId,
      role: 'MEMBER',
    },
  });

  // Fetch updated cell data
  const updatedCell = await prisma.cell.findUnique({
    where: { id: input.cellId },
    include: {
      members: {
        include: {
          player: {
            select: {
              fid: true,
              address: true,
            },
          },
        },
      },
    },
  });

  if (!updatedCell) {
    throw ApiError.internal('Failed to join cell');
  }

  const response: CellResponse = {
    id: updatedCell.id,
    name: updatedCell.name,
    description: updatedCell.description,
    emblem: updatedCell.emblem,
    stats: {
      totalWins: updatedCell.totalWins,
      totalBattles: updatedCell.totalBattles,
      reputation: updatedCell.reputation,
      winRate: updatedCell.totalBattles > 0
        ? Math.round((updatedCell.totalWins / updatedCell.totalBattles) * 100)
        : 0,
    },
    members: updatedCell.members.map(m => ({
      fid: m.player.fid,
      address: m.player.address,
      role: m.role as import('@/types').CellRole,
      joinedAt: m.joinedAt.toISOString(),
    })),
    createdAt: updatedCell.createdAt.toISOString(),
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
  withAuth(withRateLimit(joinCellHandler, 'write'))
);
