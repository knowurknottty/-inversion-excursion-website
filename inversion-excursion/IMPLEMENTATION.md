# Inversion Excursion API - Implementation Summary

## Deliverables

### API Routes (8 + 2 auth routes)

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/cards/[id]` | GET | No | Get card metadata by ID |
| `/api/mint` | POST | Yes | Mint new card from screenshot |
| `/api/cell/create` | POST | Yes | Create new Cell (clan) |
| `/api/cell/join` | POST | Yes | Join existing Cell |
| `/api/battle/start` | POST | Yes | Initialize battle |
| `/api/battle/action` | POST | Yes | Submit player action |
| `/api/synsync/verify` | POST | Yes | Verify entrainment proof |
| `/api/leaderboard` | GET | No | Get Cell rankings |
| `/api/auth/nonce` | GET | No | Get SIWE nonce |
| `/api/auth/verify` | POST | No | Verify SIWE and get token |

### Database Schema (Prisma)

**Tables:**
- `players` - User accounts (fid, address, reputation)
- `cards` - NFT cards (metadata, stats, rarity, owner)
- `cells` - Clans/guilds (name, stats, reputation)
- `cell_members` - Junction table for Cell membership
- `battles` - Battle instances (status, players, turns)
- `battle_cards` - Cards in active battles
- `battle_actions` - Turn-by-turn battle log
- `synsync_proofs` - Verified entrainment proofs

**Enums:**
- `Rarity`: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC
- `CellRole`: LEADER, OFFICER, MEMBER
- `BattleStatus`: PENDING, ACTIVE, PAUSED, COMPLETED, CANCELLED
- `ActionType`: ATTACK, DEFEND, SPECIAL, HEAL, SYNSYNC_BOOST, SKIP

### Type Definitions

Complete TypeScript types in `src/types/index.ts`:
- Player, Card, Cell types
- Battle state and action types
- Synsync proof types
- API response types
- Authentication types

### Error Handling

**Custom ApiError class** with:
- HTTP status codes
- Error codes (UNAUTHORIZED, NOT_FOUND, etc.)
- Optional details object

**Middleware:**
- `withErrorHandler` - Wraps all routes
- Zod validation error handling
- Request ID tracking
- Production-safe error messages

### Rate Limiting

**Rate limit categories:**
- `auth`: 5 req/min (strict for auth endpoints)
- `read`: 120 req/min (generous for GET requests)
- `write`: 30 req/min (standard for mutations)
- `mint`: 3 req/5min (strict for costly operations)

**Features:**
- Redis support for production
- In-memory fallback for development
- Rate limit headers (X-RateLimit-*)
- Retry-After header on 429 responses

### Authentication

**SIWE (Sign-In with Ethereum):**
- Nonce generation with 5-minute expiry
- Message signature verification via Viem
- Farcaster FID extraction from resources
- JWT token generation (7-day expiry)

**Farcaster Integration:**
- Wallet signature verification
- FID-based player identification
- Bearer token authentication

## File Structure

```
inversion-excursion/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── nonce/route.ts
│   │       │   └── verify/route.ts
│   │       ├── battle/
│   │       │   ├── action/route.ts
│   │       │   └── start/route.ts
│   │       ├── cards/
│   │       │   └── [id]/route.ts
│   │       ├── cell/
│   │       │   ├── create/route.ts
│   │       │   └── join/route.ts
│   │       ├── leaderboard/route.ts
│   │       ├── mint/route.ts
│   │       └── synsync/
│   │           └── verify/route.ts
│   ├── lib/
│   │   ├── auth.ts           # SIWE + Farcaster auth
│   │   ├── errors.ts         # Custom error classes
│   │   ├── error-handler.ts  # Global error handler
│   │   ├── index.ts          # Lib exports
│   │   ├── prisma.ts         # Database client
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── validation.ts     # Zod schemas
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── middleware.ts         # Next.js middleware
├── prisma/
│   └── schema.prisma         # Database schema
├── .env.example              # Environment template
├── .gitignore
├── next.config.js            # Next.js config
├── package.json              # Dependencies
├── README.md                 # Documentation
└── tsconfig.json             # TypeScript config
```

## Key Features

1. **Card Minting**: Rarity-based stat generation, metadata storage
2. **Cell System**: Create/join clans, leader/officer roles
3. **Battle Engine**: Turn-based combat, card HP tracking, action log
4. **Synsync Integration**: Protocol-based bonus calculation, 24-hour duration
5. **Leaderboard**: Multiple sort options, pagination, recent form tracking

## Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit: DATABASE_URL, JWT_SECRET, ETHEREUM_RPC_URL

# 3. Database setup
npx prisma migrate dev --name init
npx prisma generate

# 4. Run dev server
npm run dev
```

## API Usage Examples

### Authenticate
```bash
# Get nonce
curl http://localhost:3000/api/auth/nonce

# Verify and get token
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "fid": 12345,
    "address": "0x...",
    "signature": "0x...",
    "message": { ... }
  }'
```

### Mint Card
```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Neural Overlord",
    "imageUrl": "https://...",
    "rarity": "EPIC"
  }'
```

### Start Battle
```bash
curl -X POST http://localhost:3000/api/battle/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cellId": "...",
    "cardIds": ["...", "...", "..."]
  }'
```

### Submit Action
```bash
curl -X POST http://localhost:3000/api/battle/action \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "battleId": "...",
    "actionType": "ATTACK",
    "cardId": "...",
    "targetId": "..."
  }'
```

### Verify Synsync
```bash
curl -X POST http://localhost:3000/api/synsync/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "protocolId": "alpha-theta",
    "duration": 300,
    "frequency": 7.83,
    "proofHash": "abc123...",
    "signature": "0x..."
  }'
```

## Production Considerations

1. **Database**: Use connection pooling (PgBouncer)
2. **Redis**: Enable for distributed rate limiting
3. **JWT**: Use `jose` library instead of custom implementation
4. **Contracts**: Add on-chain minting/battle settlement
5. **Monitoring**: Add structured logging (Pino/Winston)
6. **Caching**: Add Redis caching for leaderboard
7. **Webhooks**: Add Farcaster webhook verification

## References

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma ORM](https://www.prisma.io/docs)
- [SIWE](https://docs.login.xyz/)
- [Farcaster Auth](https://docs.farcaster.xyz/auth-kit/)
- [Viem](https://viem.sh/)
- [Rate Limiter Flexible](https://github.com/animir/node-rate-limiter-flexible)
