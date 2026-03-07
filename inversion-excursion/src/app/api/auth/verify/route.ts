import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withErrorHandler } from '@/lib/error-handler';
import { withRateLimit } from '@/lib/rate-limit';
import { ApiError } from '@/lib/errors';
import { authPayloadSchema } from '@/lib/validation';
import { verifySIWE, validateNonce, createAuthToken } from '@/lib/auth';

/**
 * POST /api/auth/verify
 * Verify SIWE message and create session
 */
async function verifyAuthHandler(request: Request): Promise<NextResponse> {
  const body = await request.json();
  const payload = authPayloadSchema.parse(body);

  // Validate nonce
  if (!validateNonce(payload.message.nonce)) {
    throw ApiError.badRequest('Invalid or expired nonce');
  }

  // Verify SIWE signature
  const siweResult = await verifySIWE(
    JSON.stringify(payload.message),
    payload.signature
  );

  if (!siweResult.valid) {
    throw ApiError.unauthorized(siweResult.error || 'Signature verification failed');
  }

  // Verify FID matches
  if (siweResult.fid && siweResult.fid !== payload.fid) {
    throw ApiError.unauthorized('FID mismatch');
  }

  // Find or create player
  let player = await prisma.player.findUnique({
    where: { fid: payload.fid },
  });

  if (!player) {
    // Create new player
    player = await prisma.player.create({
      data: {
        fid: payload.fid,
        address: payload.address.toLowerCase(),
        reputation: 100,
      },
    });
  } else if (player.address.toLowerCase() !== payload.address.toLowerCase()) {
    // Address mismatch - update if needed or reject
    throw ApiError.unauthorized('Address does not match registered FID');
  }

  // Generate auth token
  const token = await createAuthToken(player);

  return NextResponse.json({
    success: true,
    data: {
      player: {
        id: player.id,
        fid: player.fid,
        address: player.address,
        reputation: player.reputation,
      },
      token,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

export const POST = withErrorHandler(
  withRateLimit(verifyAuthHandler, 'auth')
);
