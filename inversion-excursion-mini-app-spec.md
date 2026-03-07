# THE INVERSION EXCURSION: MINI APP SPEC
## A Farcaster Card Game Against The System

---

## CORE CONCEPT

**Pokémon meets The Inversion Excursion.** Players collect "Scroll Cards" (minted screenshots from the book), build Frequency Warrior decks, and battle The System's dungeons together — not each other.

**The Twist:** Every card is a *cursed blessing*. The Pedant card gives you knowledge but costs you flexibility. The Golem card makes you strong but slow. The game IS the Inversion — you win by understanding how your own deck limits you.

---

## GAME MECHANICS

### Card Types (The Seven Dungeons)

Each card represents a boss from the book, but inverted — you WIELD the dungeon's power:

| Card | Power | Curse | Frequency |
|------|-------|-------|-----------|
| **The Pedant** | +3 Intellect (see enemy moves) | -1 Speed (analysis paralysis) | Beta (14-30 Hz) |
| **The Golem** | +5 Defense (shield all) | -2 Mobility (can't retreat) | Delta (0.5-4 Hz) |
| **The Puppeteer** | Control enemy for 1 turn | Lose 2 cards (strings cut) | Gamma (30-100 Hz) |
| **The Inquisitor** | Purge all debuffs | Must reveal hand (confession) | Alpha (8-14 Hz) |
| **The Alchemist** | Heal 50% HP | Discard 3 cards (transmutation cost) | Theta (4-8 Hz) |
| **The Feed** | Draw 4 cards | Opponent heals 20% (symbiosis) | Schumann (7.83 Hz) |
| **The Identifier** | Copy enemy's best card | Lose your identity (random discard) | 432 Hz base |

### The System (PvE Enemy)

Not a player — a **dungeon that fights back**:

- **The Ivory Tower** — Each turn, adds credential requirements ("You need 3 Pedant cards to attack")
- **The Five Scrolls** — Rotates elemental resistances (Earth round: Golem cards useless)
- **The Seven Dungeons** — Boss rush mode, each dungeon adds a persistent debuff
- **The Shadow Archive** — Randomly mirrors your own deck against you
- **Transmission** — Final boss that uses YOUR minted cards against you

### Frequency Alignment

Cards have **frequencies** (from SynSync protocols). Matching frequencies in your hand creates **Resonance** (combo bonuses). Mismatched frequencies create **Dissonance** (penalties).

**The Loop:**
1. Draw cards (pull from your minted collection)
2. Tune frequencies (align your hand)
3. Enter dungeon (fight The System)
4. Win → Mint victory screenshot
5. Lose → Analyze frequency mismatch, adjust deck

---

## MINTED SCREENSHOTS AS CARDS

### How It Works

1. **You mint a screenshot** from the book (via Zora Coins on Base)
2. **The mini app reads the metadata** — which chapter, which dungeon, which quote
3. **Card stats generated** based on content:
   - Ch1 (Ivory Tower) cards → Intellect-focused
   - Ch3.5 (Shadow Archive) cards → Shadow/curse mechanics
   - Ch6 (Grimoire) cards → Etymology/word-based powers
4. **Rarity tiers** based on semantic rarity of the quoted text

### Card Tiers

| Tier | Source | Power Level |
|------|--------|-------------|
| **Physical** | Common screenshots | Base stats |
| **Emotional** | Chapter opening quotes | +1 frequency alignment |
| **Atomic** | Win condition markers | Special abilities |
| **Galactic** | Shadow Archive revelations | Transformative curses |
| **Cosmic** | Full chapter completions | Ultimate resonance |

---

## CO-OP MECHANICS (The Frequency Warrior Cell)

### Cell Battles (3-7 Players)

- Players pool cards into a **shared resonance field**
- Each player controls 1-2 cards per turn
- The System attacks the CELL, not individuals
- **Victory condition:** Survive 10 rounds + defeat the dungeon boss
- **Failure condition:** Cell's collective HP hits zero

### Synergies (Why Co-op Matters)

| Combo | Effect |
|-------|--------|
| Pedant + Golem | "The Fortress" — Impenetrable defense but can't attack |
| Inquisitor + Alchemist | "The Purge" — Heal all + remove all curses |
| Puppeteer + Feed | "The Loop" — Control enemy, draw their cards |
| All 7 frequencies aligned | "The Inversion" — Instantly win, but all cards burned |

### The Shadow Mechanic

If a player has minted Shadow Archive cards, they can **trigger shadow events**:
- Reveal an enemy's hidden weakness
- Sacrifice a card to save the Cell
- Activate "The Eighth Dungeon" — the Cell fights itself for one round

---

## FARcaster INTEGRATION

### Frame Flow

1. **Cast the mini app** → Shows your current deck + Cell invitation
2. **Friend joins** → Their cards merge into resonance field
3. **Battle starts** → Real-time turn-based against The System
4. **Victory/Defeat** → Auto-mint victory screenshot as new card
5. **Share result** → Cast shows: "We defeated The Ivory Tower with 3 Hz Theta resonance"

### Social Mechanics

- **Card gifting** — One-way transfer (no take-backs, like the book's Bullet Gifts)
- **Deck inspection** — See friends' collections, request trades
- **Cell formation** — Persistent groups with shared victory history
- **Leaderboards** — But co-op: "Cells with most dungeon clears this week"

---

## SYNsync INTEGRATION

### Frequency Battles

Before dungeon entry, players can **run a SynSync protocol** (60 seconds):
- 10 Hz Alpha → Card draw speed increased
- 4 Hz Theta → Curse effects reduced
- 40 Hz Gamma + 963 Hz → Ultimate resonance chance

**The catch:** You must actually entrain. The mini app detects genuine brainwave shift via audio feedback (not invasive—just "hold this frequency for 60s" challenge).

### The Grimoire Connection

WYRD etymology appears in card descriptions:
- "MORTGAGE: Death Pledge — This card binds you. Pay 2 HP to activate."
- "COMPANY: Bread Together — All Cell members heal when played."

---

## AGENT SWARM ARCHITECTURE

### Tier 1: Orchestrator
- **The Architect** — Defines game loop, card economy, win conditions

### Tier 2: Domain Leads
- **Game Design Lead** — Card mechanics, balance, dungeon AI
- **Frontend Lead** — Frame UI, card animations, battle interface
- **Onchain Lead** — Zora minting, card ownership, trading logic
- **SynSync Lead** — Frequency integration, protocol validation
- **Lore Lead** — Card text, WYRD descriptions, dungeon narratives

### Tier 3: Specialist Workers (20+)

| Agent | Role |
|-------|------|
| Card Balance | Stats, curses, frequency math |
| Dungeon AI | The System's attack patterns |
| Frame UI | Cast embed, deck builder |
| Battle Interface | Turn-based combat UI |
| Mint Flow | Screenshot → card generation |
| Trading Engine | Card transfers, market logic |
| SynSync Bridge | Audio DSP integration |
| Frequency Validator | Detect genuine entrainment |
| WYRD Parser | Etymology → card descriptions |
| Cell Formation | Group management |
| Victory Minter | Screenshot capture + mint |
| Social Feed | Cast generation, sharing |
| Analytics | Player behavior, card usage |
| Security | Anti-cheat, validation |
| Testing | Unit + E2E |

---

## WHY THIS WORKS

1. **The book becomes playable** — Readers who've done the inner work get better cards (Shadow Archive mints = rarest tier)
2. **Co-op not PvP** — Aligns with book's message: we're fighting The System together
3. **WYRD integration** — Etymology as game mechanic, not just lore
4. **SynSync required** — Can't just buy wins; must actually entrain
5. **The Inversion as mechanic** — Cards help and harm simultaneously

**The Meta:** The best players aren't those with the most expensive cards. They're the ones who've actually read the book, done the shadow work, and understand that **the deck that defeats you is your own**.

---

*Saved to workspace for swarm deployment.*
