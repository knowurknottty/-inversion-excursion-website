import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

/**
 * Health check endpoint for monitoring
 * Returns status of all critical services
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const checks = await Promise.all([
    checkDatabase(),
    checkContracts(),
    checkRpc(),
    checkEnvironment(),
  ]);

  const allHealthy = checks.every(c => c.healthy);
  const degraded = checks.some(c => !c.healthy);

  const status = allHealthy ? 'healthy' : degraded ? 'degraded' : 'unhealthy';
  const httpStatus = allHealthy ? 200 : degraded ? 503 : 503;

  return NextResponse.json(
    {
      status,
      timestamp,
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
      checks: checks.reduce((acc, check) => ({
        ...acc,
        [check.name]: {
          status: check.healthy ? 'healthy' : 'unhealthy',
          latency: check.latency,
          ...(check.error && { error: check.error }),
        },
      }), {}),
    },
    { status: httpStatus }
  );
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from('players')
      .select('count')
      .limit(1);

    if (error) throw error;

    return {
      name: 'database',
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name: 'database',
      healthy: false,
      latency: Date.now() - start,
      error: error.message,
    };
  }
}

async function checkContracts(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const battlegroundAddress = process.env.NEXT_PUBLIC_CONTRACT_BATTLEGROUND;
    if (!battlegroundAddress) {
      throw new Error('Battleground contract address not configured');
    }

    // Basic check - just verify the address format
    if (!ethers.isAddress(battlegroundAddress)) {
      throw new Error('Invalid contract address format');
    }

    return {
      name: 'contracts',
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name: 'contracts',
      healthy: false,
      latency: Date.now() - start,
      error: error.message,
    };
  }
}

async function checkRpc(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.BASE_RPC_URL;
    if (!rpcUrl) {
      throw new Error('RPC URL not configured');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();

    // Check if we're not too far behind
    const block = await provider.getBlock(blockNumber);
    const blockAge = Date.now() / 1000 - Number(block?.timestamp);
    
    if (blockAge > 300) { // 5 minutes
      throw new Error(`RPC is behind by ${Math.round(blockAge)} seconds`);
    }

    return {
      name: 'rpc',
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name: 'rpc',
      healthy: false,
      latency: Date.now() - start,
      error: error.message,
    };
  }
}

async function checkEnvironment(): Promise<HealthCheck> {
  const start = Date.now();
  const required = [
    'NEXT_PUBLIC_FARCASTER_APP_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_BASE_RPC_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      name: 'environment',
      healthy: false,
      latency: Date.now() - start,
      error: `Missing env vars: ${missing.join(', ')}`,
    };
  }

  return {
    name: 'environment',
    healthy: true,
    latency: Date.now() - start,
  };
}

interface HealthCheck {
  name: string;
  healthy: boolean;
  latency: number;
  error?: string;
}
