import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { ApiError } from '@/lib/errors';
import { cardIdSchema } from '@/lib/validation';
import { withRateLimit } from '@/lib/rate-limit';
import type { CardResponse } from '@/types';

/**
 * GET /api/cards/[id]
 * Get card metadata by ID
 */
async function getCardHandler(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = cardIdSchema.parse({ id: params.id });

  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          fid: true,
          address: true,
        },
      },
    },
  });

  if (!card) {
    throw ApiError.notFound('Card');
  }

  const response: CardResponse = {
    id: card.id,
    tokenId: card.tokenId,
    name: card.name,
    description: card.description,
    imageUrl: card.imageUrl,
    rarity: card.rarity,
    stats: {
      power: card.power,
      defense: card.defense,
      speed: card.speed,
      synsyncBonus: card.synsyncBonus,
      total: card.power + card.defense + card.speed + card.synsyncBonus,
    },
    owner: {
      fid: card.owner.fid,
      address: card.owner.address,
    },
    mintedAt: card.mintedAt.toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: response,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

export const GET = withErrorHandler(
  withRateLimit(getCardHandler, 'read')
);
