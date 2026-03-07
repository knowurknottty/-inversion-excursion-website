import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { mintCardSchema } from '@/lib/validation';
import { Rarity } from '@prisma/client';
import type { AuthContext } from '@/lib/auth';
import type { CardResponse } from '@/types';

/**
 * Determine card rarity based on stats and randomness
 */
function determineRarity(power?: number, defense?: number, speed?: number): Rarity {
  // If stats provided, calculate based on total
  if (power !== undefined && defense !== undefined && speed !== undefined) {
    const total = power + defense + speed;
    
    if (total >= 250) return Rarity.MYTHIC;
    if (total >= 220) return Rarity.LEGENDARY;
    if (total >= 180) return Rarity.EPIC;
    if (total >= 140) return Rarity.RARE;
    if (total >= 100) return Rarity.UNCOMMON;
    return Rarity.COMMON;
  }
  
  // Random distribution for new cards
  const roll = Math.random();
  if (roll > 0.999) return Rarity.MYTHIC;
  if (roll > 0.995) return Rarity.LEGENDARY;
  if (roll > 0.97) return Rarity.EPIC;
  if (roll > 0.90) return Rarity.RARE;
  if (roll > 0.70) return Rarity.UNCOMMON;
  return Rarity.COMMON;
}

/**
 * Generate card stats based on rarity
 */
function generateStats(rarity: Rarity): { power: number; defense: number; speed: number } {
  const baseStats: Record<Rarity, { min: number; max: number }> = {
    [Rarity.COMMON]: { min: 5, max: 30 },
    [Rarity.UNCOMMON]: { min: 20, max: 45 },
    [Rarity.RARE]: { min: 35, max: 60 },
    [Rarity.EPIC]: { min: 50, max: 80 },
    [Rarity.LEGENDARY]: { min: 70, max: 95 },
    [Rarity.MYTHIC]: { min: 85, max: 100 },
  };
  
  const range = baseStats[rarity];
  
  return {
    power: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
    defense: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
    speed: Math.floor(Math.random() * (range.max - range.min + 1)) + range.min,
  };
}

/**
 * POST /api/mint
 * Mint a new card from screenshot data
 */
async function mintHandler(
  request: Request,
  context: AuthContext
): Promise<NextResponse> {
  const body = await request.json();
  const input = mintCardSchema.parse(body);

  // Determine rarity and stats
  const rarity = input.rarity || determineRarity(input.power, input.defense, input.speed);
  const stats = input.power !== undefined 
    ? { 
        power: input.power, 
        defense: input.defense || 10, 
        speed: input.speed || 10 
      }
    : generateStats(rarity);

  // Build metadata
  const metadata = {
    name: input.name,
    description: input.description || `A ${rarity.toLowerCase()} card minted in The Inversion Excursion`,
    image: input.imageUrl,
    attributes: [
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Power', value: stats.power, display_type: 'number' },
      { trait_type: 'Defense', value: stats.defense, display_type: 'number' },
      { trait_type: 'Speed', value: stats.speed, display_type: 'number' },
      { trait_type: 'Total Stats', value: stats.power + stats.defense + stats.speed, display_type: 'number' },
    ],
    ...(input.metadata || {}),
  };

  // Create card in database
  const card = await prisma.card.create({
    data: {
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      screenshotUrl: input.screenshotUrl,
      metadata: metadata as Record<string, unknown>,
      rarity,
      power: stats.power,
      defense: stats.defense,
      speed: stats.speed,
      ownerId: context.playerId,
    },
    include: {
      owner: {
        select: {
          fid: true,
          address: true,
        },
      },
    },
  });

  // In production, mint on-chain here
  // const txHash = await mintOnChain(card);
  // await prisma.card.update({ where: { id: card.id }, data: { txHash } });

  const response: CardResponse = {
    id: card.id,
    tokenId: card.tokenId,
    name: card.name,
    description: card.description,
    imageUrl: card.imageUrl,
    rarity: card.rarity as import('@/types').Rarity,
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
  }, { status: 201 });
}

export const POST = withErrorHandler(
  withAuth(withRateLimit(mintHandler, 'mint'))
);
