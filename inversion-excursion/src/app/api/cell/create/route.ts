import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { createCellSchema } from '@/lib/validation';
import type { AuthContext } from '@/lib/auth';
import type { CellResponse } from '@/types';

/**
 * POST /api/cell/create
 * Create a new Cell (clan/guild)
 */
async function createCellHandler(
  request: Request,
  context: AuthContext
): Promise<NextResponse> {
  const body = await request.json();
  const input = createCellSchema.parse(body);

  // Check if cell name already exists
  const existingCell = await prisma.cell.findUnique({
    where: { name: input.name },
  });

  if (existingCell) {
    throw ApiError.conflict(`Cell "${input.name}" already exists`);
  }

  // Check if player is already in a cell
  const existingMembership = await prisma.cellMember.findFirst({
    where: { playerId: context.playerId },
  });

  if (existingMembership) {
    throw ApiError.conflict('You are already a member of a cell. Leave your current cell first.');
  }

  // Create cell with founder as leader
  const cell = await prisma.$transaction(async (tx) => {
    // Create the cell
    const newCell = await tx.cell.create({
      data: {
        name: input.name,
        description: input.description,
        emblem: input.emblem,
        createdBy: context.playerId,
      },
    });

    // Add founder as leader
    await tx.cellMember.create({
      data: {
        cellId: newCell.id,
        playerId: context.playerId,
        role: 'LEADER',
      },
    });

    return newCell;
  });

  // Fetch complete cell data
  const cellWithMembers = await prisma.cell.findUnique({
    where: { id: cell.id },
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

  if (!cellWithMembers) {
    throw ApiError.internal('Failed to create cell');
  }

  const response: CellResponse = {
    id: cellWithMembers.id,
    name: cellWithMembers.name,
    description: cellWithMembers.description,
    emblem: cellWithMembers.emblem,
    stats: {
      totalWins: cellWithMembers.totalWins,
      totalBattles: cellWithMembers.totalBattles,
      reputation: cellWithMembers.reputation,
      winRate: cellWithMembers.totalBattles > 0 
        ? Math.round((cellWithMembers.totalWins / cellWithMembers.totalBattles) * 100)
        : 0,
    },
    members: cellWithMembers.members.map(m => ({
      fid: m.player.fid,
      address: m.player.address,
      role: m.role as import('@/types').CellRole,
      joinedAt: m.joinedAt.toISOString(),
    })),
    createdAt: cellWithMembers.createdAt.toISOString(),
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
  withAuth(withRateLimit(createCellHandler, 'write'))
);
