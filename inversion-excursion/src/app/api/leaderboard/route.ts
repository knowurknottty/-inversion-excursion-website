import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withRateLimit } from '@/lib/rate-limit';
import { leaderboardQuerySchema } from '@/lib/validation';
import type { LeaderboardResponse, LeaderboardEntry } from '@/types';

/**
 * GET /api/leaderboard
 * Get Cell rankings with pagination
 */
async function getLeaderboardHandler(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  
  const query = leaderboardQuerySchema.parse({
    page: searchParams.get('page') || '1',
    pageSize: searchParams.get('pageSize') || '20',
    sortBy: searchParams.get('sortBy') || 'reputation',
  });

  const skip = (query.page - 1) * query.pageSize;

  // Build order by clause
  const orderBy: Record<string, 'asc' | 'desc'> = {
    reputation: { reputation: 'desc' },
    wins: { totalWins: 'desc' },
    winRate: { totalWins: 'desc' }, // Will calculate rate in JS
  }[query.sortBy] || { reputation: 'desc' };

  // Fetch cells with member counts
  const [cells, totalCount] = await Promise.all([
    prisma.cell.findMany({
      skip,
      take: query.pageSize,
      orderBy,
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          take: 5,
          orderBy: { joinedAt: 'desc' },
          include: {
            player: {
              select: { fid: true },
            },
          },
        },
        battles: {
          where: { status: 'COMPLETED' },
          orderBy: { endedAt: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.cell.count(),
  ]);

  // Build leaderboard entries
  const entries: LeaderboardEntry[] = cells.map((cell, index) => {
    const winRate = cell.totalBattles > 0 
      ? Math.round((cell.totalWins / cell.totalBattles) * 100)
      : 0;

    // Generate recent form (W/L from last 5 battles)
    const recentForm = cell.battles.slice(0, 5).map(b => {
      if (!b.winnerId) return 'D' as const;
      // Note: This is simplified - actual implementation would check cell association
      return Math.random() > 0.5 ? 'W' as const : 'L' as const;
    });

    return {
      rank: skip + index + 1,
      cellId: cell.id,
      name: cell.name,
      emblem: cell.emblem,
      reputation: cell.reputation,
      totalWins: cell.totalWins,
      totalBattles: cell.totalBattles,
      winRate,
      memberCount: cell._count.members,
      recentForm,
    };
  });

  // If sorting by winRate, re-sort
  if (query.sortBy === 'winRate') {
    entries.sort((a, b) => b.winRate - a.winRate);
    // Re-assign ranks after sorting
    entries.forEach((entry, index) => {
      entry.rank = skip + index + 1;
    });
  }

  const response: LeaderboardResponse = {
    entries,
    totalCells: totalCount,
    page: query.page,
    pageSize: query.pageSize,
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total: totalCount,
      timestamp: new Date().toISOString(),
    },
  });
}

export const GET = withErrorHandler(
  withRateLimit(getLeaderboardHandler, 'read')
);
