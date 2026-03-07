# Monitoring Setup Guide

Complete monitoring configuration for The Inversion Excursion mini app.

---

## Overview

We use a multi-layer monitoring approach:

| Layer | Tool | Purpose |
|-------|------|---------|
| Frontend Analytics | Vercel Analytics | User behavior, performance |
| Error Tracking | Sentry | Exception monitoring |
| Contract Monitoring | Custom Event Listener | On-chain activity |
| Database Monitoring | Supabase | Query performance, RLS |
| Uptime Monitoring | Vercel Status | Availability |

---

## 1. Vercel Analytics

### Setup

Vercel Analytics is automatically enabled for Pro/Enterprise plans.

```bash
# Enable in project settings
vercel analytics enable
```

### Web Vitals Tracking

Create `lib/analytics.ts`:

```typescript
import { useReportWebVitals } from 'next/web-vitals';

export function useAnalytics() {
  useReportWebVitals((metric) => {
    // Send to your analytics endpoint
    const body = JSON.stringify(metric);
    
    // Use `navigator.sendBeacon()` if available
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/vitals', body);
    } else {
      fetch('/api/vitals', { body, method: 'POST', keepalive: true });
    }
  });
}
```

### Custom Events

Track game-specific events:

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';

export const Analytics = {
  // Battle events
  battleStarted: (mode: string) => track('battle_started', { mode }),
  battleCompleted: (result: string) => track('battle_completed', { result }),
  
  // Cell events
  cellFormed: (size: number) => track('cell_formed', { size }),
  cellJoined: () => track('cell_joined'),
  
  // Minting events
  cardMinted: (rarity: string) => track('card_minted', { rarity }),
  achievementUnlocked: (id: number) => track('achievement_unlocked', { id }),
  
  // Resonance events
  resonanceBoosted: (amount: number) => track('resonance_boosted', { amount }),
  entrainmentCompleted: (protocol: string) => track('entrainment_completed', { protocol }),
};
```

### API Route for Vitals

```typescript
// app/api/vitals/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const metric = await request.json();
  
  // Log to your analytics service
  // Example: Datadog, LogRocket, etc.
  console.log('Web Vital:', metric);
  
  return NextResponse.json({ success: true });
}
```

---

## 2. Sentry Error Tracking

### Installation

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configuration

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Replay settings
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Before sending, sanitize sensitive data
  beforeSend(event) {
    // Remove wallet addresses from error messages
    if (event.message) {
      event.message = event.message.replace(/0x[a-fA-F0-9]{40}/g, '[ADDRESS]');
    }
    return event;
  },
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.VERCEL_ENV || 'development',
});
```

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Custom Error Tracking

```typescript
// lib/errors.ts
import * as Sentry from '@sentry/nextjs';

export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export function captureGameError(error: GameError) {
  Sentry.captureException(error, {
    tags: { error_code: error.code },
    extra: error.context,
  });
}

// Usage
import { GameError, captureGameError } from '@/lib/errors';

try {
  await battle.start();
} catch (err) {
  const gameError = new GameError(
    'Battle initialization failed',
    'BATTLE_INIT_ERROR',
    { battleId, playerId, opponentId }
  );
  captureGameError(gameError);
}
```

---

## 3. Contract Event Monitoring

### Event Listener Service

Create `services/contract-monitor.ts`:

```typescript
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

const CONTRACT_ABI = [
  // Battle events
  'event BattleInitiated(bytes32 indexed battleId, address indexed player1, address indexed player2)',
  'event BattleCompleted(bytes32 indexed battleId, address indexed winner, uint256 prize)',
  
  // Cell events
  'event CellFormed(uint256 indexed cellId, address indexed leader, uint256 formationNumber)',
  'event MemberJoined(uint256 indexed cellId, address indexed member)',
  
  // Token events
  'event CardMinted(uint256 indexed tokenId, address indexed to, uint256 frequency)',
  'event ResonanceUpdated(address indexed player, uint256 newScore)',
  
  // Achievement events
  'event AchievementUnlocked(address indexed player, uint256 indexed achievementId)',
];

export class ContractMonitor {
  private provider: ethers.Provider;
  private contracts: Map<string, ethers.Contract>;
  private supabase: ReturnType<typeof createClient>;
  
  constructor(
    rpcUrl: string,
    contractAddresses: Record<string, string>,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contracts = new Map();
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize contract instances
    for (const [name, address] of Object.entries(contractAddresses)) {
      this.contracts.set(name, new ethers.Contract(address, CONTRACT_ABI, this.provider));
    }
  }
  
  async start() {
    console.log('Starting contract event monitor...');
    
    // Set up battle event listeners
    const battleground = this.contracts.get('Battleground');
    if (battleground) {
      battleground.on('BattleInitiated', this.handleBattleInitiated.bind(this));
      battleground.on('BattleCompleted', this.handleBattleCompleted.bind(this));
    }
    
    // Set up cell event listeners
    const cellRegistry = this.contracts.get('CellRegistry');
    if (cellRegistry) {
      cellRegistry.on('CellFormed', this.handleCellFormed.bind(this));
      cellRegistry.on('MemberJoined', this.handleMemberJoined.bind(this));
    }
    
    // Set up token event listeners
    const cards = this.contracts.get('InversionCard');
    if (cards) {
      cards.on('CardMinted', this.handleCardMinted.bind(this));
    }
    
    // Resonance events
    const catalyst = this.contracts.get('FrequencyCatalyst');
    if (catalyst) {
      catalyst.on('ResonanceUpdated', this.handleResonanceUpdated.bind(this));
    }
    
    console.log('Contract monitor started');
  }
  
  private async handleBattleInitiated(battleId: string, player1: string, player2: string) {
    await this.supabase.from('battles').insert({
      tx_hash: battleId,
      initiator_address: player1,
      opponent_address: player2,
      status: 'pending',
    });
    
    console.log(`Battle initiated: ${battleId}`);
  }
  
  private async handleBattleCompleted(battleId: string, winner: string, prize: bigint) {
    await this.supabase
      .from('battles')
      .update({
        winner_address: winner,
        reward_tokens: prize.toString(),
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('tx_hash', battleId);
    
    console.log(`Battle completed: ${battleId}, winner: ${winner}`);
  }
  
  private async handleCellFormed(cellId: bigint, leader: string, formationNumber: bigint) {
    await this.supabase.from('cells').insert({
      on_chain_id: Number(cellId),
      leader_address: leader,
      formation_number: Number(formationNumber),
    });
    
    console.log(`Cell formed: ${cellId}, leader: ${leader}`);
  }
  
  private async handleCardMinted(tokenId: bigint, to: string, frequency: bigint) {
    await this.supabase.from('minted_cards').insert({
      token_id: Number(tokenId),
      owner_address: to,
      frequency: Number(frequency),
    });
    
    console.log(`Card minted: ${tokenId} to ${to}`);
  }
  
  private async handleResonanceUpdated(player: string, newScore: bigint) {
    await this.supabase
      .from('players')
      .update({ resonance_score: Number(newScore) })
      .eq('wallet_address', player);
    
    console.log(`Resonance updated: ${player} = ${newScore}`);
  }
}
```

### Deploy as Vercel Cron Job

```typescript
// app/api/cron/monitor-events/route.ts
import { NextResponse } from 'next/server';
import { ContractMonitor } from '@/services/contract-monitor';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const monitor = new ContractMonitor(
    process.env.BASE_RPC_URL!,
    {
      Battleground: process.env.NEXT_PUBLIC_CONTRACT_BATTLEGROUND!,
      CellRegistry: process.env.NEXT_PUBLIC_CONTRACT_CELL_REGISTRY!,
      InversionCard: process.env.NEXT_PUBLIC_CONTRACT_INVERSION_CARD!,
      FrequencyCatalyst: process.env.NEXT_PUBLIC_CONTRACT_FREQUENCY_CATALYST!,
    },
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Process recent events (last 5 minutes)
  const fromBlock = await getBlockNumber(5);
  await monitor.processEvents(fromBlock);
  
  return NextResponse.json({ success: true, processed: true });
}

async function getBlockNumber(minutesAgo: number): Promise<number> {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const currentBlock = await provider.getBlockNumber();
  const blocksPerMinute = 2; // Base ~2 blocks per 10 seconds
  return currentBlock - (minutesAgo * blocksPerMinute);
}
```

---

## 4. Supabase Monitoring

### Database Insights

Enable in Supabase Dashboard → Database → Insights

Key metrics to watch:
- Query performance
- Connection pool usage
- RLS policy execution
- Storage usage

### Real-time Subscriptions

Monitor table changes:

```typescript
// hooks/useRealtimeMonitor.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeMonitor() {
  useEffect(() => {
    const channel = supabase
      .channel('db-monitor')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'battles' },
        (payload) => {
          console.log('Battle update:', payload);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

---

## 5. Alerting Configuration

### Sentry Alerts

Create alerts for:
- Error rate > 1% over 5 minutes
- New issues in production
- Performance degradation (p95 latency > 2s)

```yaml
# .sentry/alert-rules.yml
rules:
  - name: High Error Rate
    condition: event_frequency
    interval: 5m
    value: 10
    filters:
      - environment: production
  
  - name: New Issue in Production
    condition: first_seen
    filters:
      - environment: production
```

### Uptime Monitoring

Using Vercel or external service:

```javascript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const checks = await Promise.all([
    checkDatabase(),
    checkContracts(),
    checkRpc(),
  ]);
  
  const allHealthy = checks.every(c => c.healthy);
  
  return NextResponse.json(
    { 
      status: allHealthy ? 'healthy' : 'degraded',
      checks: checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}

async function checkDatabase() {
  try {
    const { error } = await supabase.from('players').select('count');
    return { name: 'database', healthy: !error };
  } catch {
    return { name: 'database', healthy: false };
  }
}

async function checkContracts() {
  // Check contract deployment
  return { name: 'contracts', healthy: true };
}

async function checkRpc() {
  // Check RPC connectivity
  return { name: 'rpc', healthy: true };
}
```

---

## 6. Logging Best Practices

### Structured Logging

```typescript
// lib/logger.ts
interface LogContext {
  playerId?: string;
  battleId?: string;
  cellId?: string;
  [key: string]: any;
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }));
  },
  
  error: (message: string, error: Error, context?: LogContext) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    }));
  },
  
  gameEvent: (event: string, data: Record<string, any>) => {
    console.log(JSON.stringify({
      level: 'event',
      event,
      data,
      timestamp: new Date().toISOString(),
    }));
  },
};
```

---

## Checklist

- [ ] Vercel Analytics enabled
- [ ] Sentry DSN configured
- [ ] Contract event monitoring deployed
- [ ] Health check endpoint created
- [ ] Alert rules configured
- [ ] Error boundaries implemented
- [ ] Custom error tracking added
- [ ] Structured logging implemented
