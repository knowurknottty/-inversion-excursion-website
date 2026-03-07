# API Reference

Complete API documentation for The Inversion Excursion backend.

**Base URL**: `https://api.inversionexcursion.xyz`  
**Version**: `v1`  
**Protocol**: HTTPS only

---

## Table of Contents

1. [Authentication](#authentication)
2. [Cards](#cards)
3. [Minting](#minting)
4. [Cells](#cells)
5. [Battles](#battles)
6. [SynSync](#synsync)
7. [Leaderboard](#leaderboard)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Webhooks](#webhooks)

---

## Authentication

The API uses JWT Bearer tokens for authentication. Obtain a token via SIWE (Sign-In with Ethereum).

### Get Nonce

Retrieve a nonce for SIWE message signing.

```http
GET /api/auth/nonce
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nonce": "a1b2c3d4e5f6...",
    "expiresAt": "2026-03-07T12:30:00Z"
  }
}
```

### Verify SIWE

Verify signature and receive JWT token.

```http
POST /api/auth/verify
Content-Type: application/json
```

**Request Body**:
```json
{
  "fid": 12345,
  "address": "0x1234...",
  "signature": "0xabcd...",
  "message": {
    "domain": "api.inversionexcursion.xyz",
    "address": "0x1234...",
    "statement": "Sign in to The Inversion Excursion",
    "uri": "https://api.inversionexcursion.xyz",
    "version": "1",
    "chainId": 8453,
    "nonce": "a1b2c3d4...",
    "issuedAt": "2026-03-07T12:00:00Z",
    "expirationTime": "2026-03-07T13:00:00Z",
    "resources": ["farcaster://fid/12345"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-03-14T12:00:00Z",
    "player": {
      "id": "uuid",
      "fid": 12345,
      "address": "0x1234...",
      "reputation": 100
    }
  }
}
```

### Using Authentication

Include the token in all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Cards

### Get Card by ID

Retrieve a card's details.

```http
GET /api/cards/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "card-uuid",
    "tokenId": "123",
    "name": "The Pedant",
    "description": "Knowledge at the cost of flexibility",
    "imageUrl": "https://...",
    "rarity": "EPIC",
    "stats": {
      "power": 65,
      "defense": 40,
      "speed": 30,
      "synsyncBonus": 5,
      "total": 140
    },
    "frequency": 20,
    "curse": "-1 Speed (analysis paralysis)",
    "owner": {
      "fid": 12345,
      "address": "0x..."
    },
    "mintedAt": "2026-03-01T10:00:00Z",
    "metadata": {
      "attributes": [
        { "trait_type": "Rarity", "value": "EPIC" },
        { "trait_type": "Power", "value": 65, "display_type": "number" }
      ]
    }
  }
}
```

### List Player Cards

```http
GET /api/cards?playerId=:playerId&rarity=:rarity&page=:page
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `playerId` | string | Filter by owner |
| `rarity` | string | Filter by rarity (COMMON, UNCOMMON, etc.) |
| `page` | number | Pagination (default: 1) |
| `pageSize` | number | Items per page (default: 20, max: 100) |

---

## Minting

### Mint Card

Create a new Scroll Card from screenshot data.

```http
POST /api/mint
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Neural Overlord",
  "description": "A card minted from deep theta entrainment",
  "imageUrl": "https://...",
  "screenshotUrl": "https://...",
  "rarity": "EPIC",
  "power": 70,
  "defense": 50,
  "speed": 40,
  "metadata": {
    "protocolId": "theta-deep",
    "duration": 300,
    "frequency": 4.5
  }
}
```

**Validation Rules**:
- `name`: 1-100 characters
- `description`: Max 1000 characters
- `imageUrl`: Valid URL
- `rarity`: Optional (auto-determined from stats if not provided)
- `power/defense/speed`: 1-100 (optional, auto-generated if not provided)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "new-card-uuid",
    "tokenId": null,
    "name": "Neural Overlord",
    "rarity": "EPIC",
    "stats": {
      "power": 70,
      "defense": 50,
      "speed": 40,
      "total": 160
    },
    "owner": {
      "fid": 12345,
      "address": "0x..."
    },
    "mintedAt": "2026-03-07T12:26:00Z",
    "txHash": null
  },
  "meta": {
    "timestamp": "2026-03-07T12:26:00Z"
  }
}
```

**Rate Limit**: 3 requests per 5 minutes per wallet

---

## Cells

### Create Cell

Form a new Frequency Warrior Cell.

```http
POST /api/cell/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Void Walkers",
  "description": "We walk the path between frequencies",
  "emblem": "https://..."
}
```

**Validation**:
- `name`: 3-50 characters, alphanumeric + hyphens/underscores
- `description`: Max 500 characters
- `emblem`: Valid URL (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cell-uuid",
    "name": "Void Walkers",
    "description": "We walk the path between frequencies",
    "emblem": "https://...",
    "leaderId": "player-uuid",
    "members": [
      {
        "id": "player-uuid",
        "fid": 12345,
        "displayName": "Player Name",
        "role": "LEADER",
        "joinedAt": "2026-03-07T12:26:00Z"
      }
    ],
    "maxMembers": 7,
    "stats": {
      "totalWins": 0,
      "totalBattles": 0,
      "reputation": 0
    },
    "createdAt": "2026-03-07T12:26:00Z"
  }
}
```

### Join Cell

Join an existing Cell.

```http
POST /api/cell/join
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "cellId": "cell-uuid",
  "inviteCode": "optional-invite-code"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cellId": "cell-uuid",
    "member": {
      "id": "player-uuid",
      "fid": 12345,
      "role": "MEMBER",
      "joinedAt": "2026-03-07T12:26:00Z"
    },
    "cell": {
      "memberCount": 4,
      "members": [...]
    }
  }
}
```

### Leave Cell

```http
POST /api/cell/leave
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "cellId": "cell-uuid"
}
```

### Get Cell Details

```http
GET /api/cell/:id
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cell-uuid",
    "name": "Void Walkers",
    "members": [...],
    "activeBattles": [...],
    "battleHistory": [...],
    "sharedResonanceField": {
      "combinedFrequency": 15.5,
      "fieldStrength": 78,
      "activeEffects": [...]
    }
  }
}
```

---

## Battles

### Start Battle

Initialize a new battle instance.

```http
POST /api/battle/start
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "cellId": "cell-uuid",
  "opponentFid": 67890,
  "cardIds": ["card-1", "card-2", "card-3"]
}
```

**Constraints**:
- Min 1 card, max 3 cards
- All cards must be owned by player
- Cell must have 2+ members for PvP

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "battle-uuid",
    "status": "PENDING",
    "cellId": "cell-uuid",
    "players": {
      "player1": {
        "fid": 12345,
        "address": "0x...",
        "cards": [...],
        "synsyncActive": false,
        "synsyncBonus": 0
      }
    },
    "currentTurn": 1,
    "maxTurns": 10,
    "enemy": {
      "id": "enemy-uuid",
      "name": "The Dean",
      "maxHealth": 1000,
      "currentHealth": 1000,
      "intention": {
        "type": "attack",
        "power": 50,
        "warning": true,
        "description": "Preparing Peer Review..."
      }
    },
    "log": []
  }
}
```

### Submit Action

Play a card or take an action in battle.

```http
POST /api/battle/action
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "battleId": "battle-uuid",
  "actionType": "ATTACK",
  "cardId": "card-uuid",
  "targetId": "enemy-uuid"
}
```

**Action Types**:
| Type | Description |
|------|-------------|
| `ATTACK` | Deal damage to target |
| `DEFEND` | Reduce incoming damage |
| `SPECIAL` | Use card's special ability |
| `HEAL` | Restore HP |
| `SYNSYNC_BOOST` | Activate entrainment bonus |
| `SKIP` | Pass turn |

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "battle-uuid",
    "status": "ACTIVE",
    "currentTurn": 2,
    "players": {
      "player1": {
        "fid": 12345,
        "cards": [
          {
            "id": "card-uuid",
            "name": "The Pedant",
            "currentHp": 450,
            "maxHp": 500,
            "isActive": true
          }
        ]
      }
    },
    "enemy": {
      "currentHealth": 875,
      "intention": { ... }
    },
    "log": [
      {
        "turn": 1,
        "playerFid": 12345,
        "actionType": "ATTACK",
        "description": "The Pedant attacks for 125 damage!",
        "timestamp": "2026-03-07T12:26:00Z"
      }
    ]
  }
}
```

### Get Battle State

```http
GET /api/battle/:id
Authorization: Bearer <token>
```

**Response**: Current battle state (same format as start battle response)

---

## SynSync

### Verify Entrainment

Submit proof of brainwave entrainment for battle bonuses.

```http
POST /api/synsync/verify
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "protocolId": "alpha-theta",
  "duration": 300,
  "frequency": 7.83,
  "proofHash": "sha256-hash-of-proof-data",
  "signature": "0x..."
}
```

**Validation**:
- `protocolId`: Must be valid protocol
- `duration`: 60-3600 seconds
- `frequency`: 0.5-100 Hz
- `proofHash`: Minimum 32 characters
- `signature`: Valid wallet signature

**Response**:
```json
{
  "success": true,
  "data": {
    "verified": true,
    "quality": 0.85,
    "avgDeviation": 0.5,
    "timeInSync": 285,
    "bonusMultiplier": 1.15,
    "bonusApplied": true,
    "bonusValue": 15,
    "expiresAt": "2026-03-08T12:26:00Z"
  }
}
```

### Get Active Protocols

```http
GET /api/synsync/protocols
```

**Response**:
```json
{
  "success": true,
  "data": {
    "protocols": [
      {
        "id": "gamma-focus",
        "name": "Gamma Focus",
        "frequency": 40,
        "description": "High-frequency focus state",
        "duration": 60,
        "color": "#FF006E",
        "category": "focus"
      },
      {
        "id": "alpha-relax",
        "name": "Alpha Relax",
        "frequency": 10,
        "description": "Relaxed alertness",
        "duration": 60,
        "color": "#FFBE0B",
        "category": "relax"
      }
    ]
  }
}
```

---

## Leaderboard

### Get Rankings

```http
GET /api/leaderboard?page=:page&sortBy=:sortBy
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20, max: 100) |
| `sortBy` | string | `reputation`, `wins`, or `winRate` |

**Response**:
```json
{
  "success": true,
  "data": {
    "cells": [
      {
        "rank": 1,
        "id": "cell-uuid",
        "name": "Frequency Masters",
        "emblem": "https://...",
        "stats": {
          "reputation": 15420,
          "totalWins": 87,
          "totalBattles": 102,
          "winRate": 0.853
        },
        "memberCount": 5
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### Get Player Stats

```http
GET /api/leaderboard/player/:fid
```

**Response**:
```json
{
  "success": true,
  "data": {
    "player": {
      "fid": 12345,
      "rank": 42,
      "reputation": 8750,
      "stats": {
        "totalWins": 34,
        "totalBattles": 56,
        "winRate": 0.607,
        "cardsMinted": 12,
        "cellsJoined": 3
      },
      "recentForm": ["W", "W", "L", "W", "D"]
    }
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {},
    "requestId": "req-uuid-for-debugging"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Valid token, insufficient permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `BAD_REQUEST` | 400 | Invalid request data |
| `VALIDATION_ERROR` | 422 | Schema validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |

### Validation Errors

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "name": "Name is required",
      "power": "Power must be between 1 and 100"
    }
  }
}
```

---

## Rate Limiting

Rate limits are enforced per endpoint category:

| Category | Limit | Window | Endpoints |
|----------|-------|--------|-----------|
| `auth` | 5 | 1 minute | `/api/auth/*` |
| `mint` | 3 | 5 minutes | `/api/mint` |
| `read` | 120 | 1 minute | `GET /*` (except auth) |
| `write` | 30 | 1 minute | `POST/PUT/DELETE /*` |

### Rate Limit Headers

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 27
X-RateLimit-Reset: 1709827800
Retry-After: 60
```

When rate limited:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

---

## Webhooks

Webhooks notify your server of game events.

### Configure Webhooks

Contact admin to register webhook URL.

### Event Types

| Event | Description |
|-------|-------------|
| `battle.completed` | Battle finished |
| `cell.member_joined` | New member joined |
| `card.minted` | New card created |
| `victory.achieved` | Victory NFT minted |

### Webhook Payload

```json
{
  "event": "battle.completed",
  "timestamp": "2026-03-07T12:26:00Z",
  "data": {
    "battleId": "battle-uuid",
    "cellId": "cell-uuid",
    "winnerId": "player-uuid",
    "victoryScore": 8750,
    "participants": [...]
  },
  "signature": "sha256=hmac..."
}
```

### Verification

Verify webhook signature:

```typescript
const signature = req.headers['x-webhook-signature']
const payload = JSON.stringify(req.body)
const expected = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex')

if (signature !== `sha256=${expected}`) {
  throw new Error('Invalid signature')
}
```

---

## Schemas

### Card Schema

```typescript
interface Card {
  id: string
  tokenId: string | null
  name: string
  description: string | null
  imageUrl: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'
  power: number
  defense: number
  speed: number
  synsyncBonus: number
  frequency: number
  curse: string | null
  metadata: Record<string, unknown>
  owner: PlayerSummary
  mintedAt: string
  txHash: string | null
}
```

### Battle Schema

```typescript
interface Battle {
  id: string
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  cellId: string
  players: {
    player1: BattlePlayer
    player2?: BattlePlayer
  }
  currentTurn: number
  maxTurns: number
  enemy: Enemy
  log: BattleActionLog[]
  winnerId?: string
  startedAt?: string
  endedAt?: string
}

interface BattlePlayer {
  fid: number
  address: string
  cards: BattleCard[]
  synsyncActive: boolean
  synsyncBonus: number
}
```

### Cell Schema

```typescript
interface Cell {
  id: string
  name: string
  description: string | null
  emblem: string | null
  leaderId: string
  members: CellMember[]
  maxMembers: number
  stats: {
    totalWins: number
    totalBattles: number
    reputation: number
  }
  createdAt: string
}
```

---

*Last updated: March 2026*
