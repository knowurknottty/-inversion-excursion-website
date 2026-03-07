import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withAuth } from '@/lib/auth';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { verifySynsyncSchema } from '@/lib/validation';
import { verifyFarcasterSignature } from '@/lib/auth';
import type { AuthContext } from '@/lib/auth';
import type { SynsyncVerificationResult } from '@/types';

// Synsync protocol definitions
const SYNSYNC_PROTOCOLS: Record<string, { name: string; bonusMultiplier: number }> = {
  'alpha-theta': { name: 'Alpha-Theta Bridge', bonusMultiplier: 1.2 },
  'gamma-peak': { name: 'Gamma Peak Focus', bonusMultiplier: 1.5 },
  'delta-deep': { name: 'Delta Deep Sleep', bonusMultiplier: 1.3 },
  'beta-flow': { name: 'Beta Flow State', bonusMultiplier: 1.4 },
  'schumann': { name: 'Schumann Resonance', bonusMultiplier: 1.1 },
};

/**
 * Calculate bonus value based on entrainment duration and frequency
 */
function calculateBonus(duration: number, frequency: number, protocolId: string): number {
  const protocol = SYNSYNC_PROTOCOLS[protocolId];
  const multiplier = protocol?.bonusMultiplier || 1.0;
  
  // Base bonus: 1 point per minute of entrainment
  const baseBonus = Math.floor(duration / 60);
  
  // Frequency resonance bonus (closer to 7.83 Hz = Schumann = more bonus)
  const frequencyBonus = Math.max(0, 10 - Math.abs(frequency - 7.83));
  
  return Math.floor((baseBonus + frequencyBonus) * multiplier);
}

/**
 * POST /api/synsync/verify
 * Verify entrainment proof and grant battle bonus
 */
async function verifySynsyncHandler(
  request: Request,
  context: AuthContext
): Promise<NextResponse> {
  const body = await request.json();
  const input = verifySynsyncSchema.parse(body);

  // Validate protocol
  if (!SYNSYNC_PROTOCOLS[input.protocolId]) {
    throw ApiError.badRequest('Invalid protocol ID', {
      validProtocols: Object.keys(SYNSYNC_PROTOCOLS),
    });
  }

  // Verify proof hash format (SHA-256 hex)
  if (!/^[a-f0-9]{64}$/i.test(input.proofHash)) {
    throw ApiError.validation({ proofHash: 'Invalid SHA-256 hash format' });
  }

  // Get player for signature verification
  const player = await prisma.player.findUnique({
    where: { id: context.playerId },
  });

  if (!player) {
    throw ApiError.notFound('Player');
  }

  // Verify signature
  const messageToVerify = JSON.stringify({
    protocolId: input.protocolId,
    duration: input.duration,
    frequency: input.frequency,
    proofHash: input.proofHash,
    timestamp: Date.now(),
  });

  const isValidSignature = await verifyFarcasterSignature(
    messageToVerify,
    input.signature,
    player.address
  );

  if (!isValidSignature) {
    throw ApiError.unauthorized('Invalid signature');
  }

  // Check for duplicate proof
  const existingProof = await prisma.synsyncProof.findUnique({
    where: { proofHash: input.proofHash },
  });

  if (existingProof) {
    throw ApiError.conflict('Proof has already been used');
  }

  // In production: verify on-chain or via Synsync API
  // const onChainVerification = await verifyOnChain(input.proofHash);
  // if (!onChainVerification) throw ApiError.badRequest('Proof verification failed');

  // Calculate bonus
  const bonusValue = calculateBonus(
    input.duration,
    input.frequency,
    input.protocolId
  );

  // Store proof
  const proof = await prisma.synsyncProof.create({
    data: {
      playerId: context.playerId,
      protocolId: input.protocolId,
      duration: input.duration,
      frequency: input.frequency,
      verifiedAt: new Date(),
      proofHash: input.proofHash,
      bonusApplied: false,
      bonusValue,
    },
  });

  // Apply bonus to player's cards
  await prisma.card.updateMany({
    where: { ownerId: context.playerId },
    data: {
      synsyncBonus: {
        increment: bonusValue,
      },
    },
  });

  // Mark bonus as applied
  await prisma.synsyncProof.update({
    where: { id: proof.id },
    data: { bonusApplied: true },
  });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Bonus lasts 24 hours

  const response: SynsyncVerificationResult = {
    verified: true,
    bonusValue,
    expiresAt: expiresAt.toISOString(),
    message: `Synsync ${SYNSYNC_PROTOCOLS[input.protocolId].name} verified! ` +
             `+${bonusValue} bonus applied to all cards for 24 hours.`,
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
  withAuth(withRateLimit(verifySynsyncHandler, 'write'))
);
