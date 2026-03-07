import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handler';
import { withRateLimit } from '@/lib/rate-limit';
import { generateNonce } from '@/lib/auth';

/**
 * GET /api/auth/nonce
 * Generate a nonce for SIWE authentication
 */
async function getNonceHandler(): Promise<NextResponse> {
  const nonce = generateNonce();
  
  return NextResponse.json({
    success: true,
    data: { nonce },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

export const GET = withErrorHandler(
  withRateLimit(getNonceHandler, 'auth')
);
