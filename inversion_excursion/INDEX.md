# THE INVERSION EXCURSION
## Complete Game Design Document Index

---

## 📚 DOCUMENTATION SUITE

This directory contains the complete game design for **The Inversion Excursion**, a card game based on the Seven Dungeons mythology.

### Core Documents

| Document | Description | Size |
|----------|-------------|------|
| `CARD_COMPENDIUM.md` | Complete card database (41 cards with stats, powers, curses) | 24KB |
| `BALANCE_SPREADSHEET.md` | Cost-benefit analysis, power curves, meta predictions | 15KB |
| `FREQUENCY_SYNERGY.md` | Resonance/discord matrix, frequency archetypes | 15KB |
| `DUNGEON_ATTACK_PATTERNS.md` | AI behavior, boss phases, encounter design | 17KB |
| `QUICK_REFERENCE.md` | Quick lookup, starter decks, combos | 10KB |

### Alignment System (NEW)

| Document | Description | Size |
|----------|-------------|------|
| `ALIGNMENT_MORAL_ONTOLOGY.md` | Complete moral framework specification — territories, civic weight, drift | 25KB |
| `ALIGNMENT_IMPLEMENTATION_GUIDE.md` | Technical implementation — code structures, battle integration | 40KB |
| `ALIGNMENT_QUICK_REFERENCE.md` | Quick lookup tables for territories, drift thresholds, spirals | 6KB |

---

## 🎴 CARD OVERVIEW

### Distribution by Tier
```
Physical  (Common):     7 cards ███████
Emotional (Uncommon):   7 cards ███████
Atomic    (Rare):       7 cards ███████
Galactic  (Epic):       7 cards ███████
Cosmic    (Legendary):  7 cards ███████
Hybrid    (Special):    6 cards ██████
                        ─────────────
                        41 total cards
```

### Distribution by Dungeon
```
⚫ Pedant:      5 cards + 1 hybrid
🗿 Golem:       5 cards + 1 hybrid
🎭 Puppeteer:   5 cards + 2 hybrids
🔥 Inquisitor:  5 cards + 2 hybrids
⚗️ Alchemist:   5 cards + 2 hybrids
🌑 Feed:        5 cards + 1 hybrid
👁️ Identifier:  5 cards + 1 hybrid
```

### Distribution by Frequency
```
Delta:     6 cards ██████
Theta:     9 cards █████████
Alpha:     5 cards █████
Beta:      6 cards ██████
Gamma:     8 cards ████████
Schumann:  5 cards █████
432Hz:     6 cards ██████
```

---

## 🎮 GAME MECHANICS

### Core Systems
1. **Inversion Mechanic** — Every card has a Power and a Curse
2. **Frequency Alignment** — 7 brainwave states with synergies/conflicts
3. **Tier Progression** — Physical → Emotional → Atomic → Galactic → Cosmic
4. **Resonance/Discord** — Frequency compatibility system
5. **Hybrid Fusions** — Cross-dungeon combination cards

### Alignment System (NEW)
6. **Moral Ontology** — Documented↔Hidden × Accountable↔Protected
7. **Territory System** — Citizen, Official, Ghost, Archon
8. **Civic Weight** — Moral impact of alignment shifts
9. **Territory Crossing** — "[Name] has fallen from grace"
10. **Player Mirror** — Choices shape alignment, alignment shapes options

### The Seven Dungeons
| Dungeon | Theme | Frequency | Playstyle |
|---------|-------|-----------|-----------|
| Pedant | Order, Prison | Beta | Control |
| Golem | Creation, Service | Delta | Tokens |
| Puppeteer | Manipulation | Theta | Disruption |
| Inquisitor | Truth, Aggression | Gamma | Burn |
| Alchemist | Transformation | Schumann | Conversion |
| Feed | Consumption | 432Hz | Mill |
| Identifier | Identity, Nullification | Alpha | Tech |

---

## 👹 BOSS ENCOUNTER

### The System — 4-Phase Boss

| Phase | Name | HP | Fusion | Key Mechanic |
|-------|------|-----|--------|--------------|
| 1 | The Warden | 150 | Pedant+Golem | Immutable Law |
| 2 | The Interrogator | 200 | Inquisitor+Puppeteer | Truth Serum |
| 3 | The Consumer | 250 | Feed+Alchemist | Metabolic Fire |
| 4 | The Eraser | 300 | Identifier+All | Anonymity Protocol |

---

## 📊 BALANCE METRICS

### Class Power Rankings
1. **Alchemist** — Highest skill ceiling, late-game scaling
2. **Inquisitor** — Aggressive, high burst damage
3. **Feed** — Resource denial, mill strategy
4. **Golem** — Token value, sustained pressure
5. **Puppeteer** — Control, disruption
6. **Identifier** — Tech, nullification
7. **Pedant** — Prison, restriction

### Tier Power Curve
```
Physical:  ▓▓▓░░░░░░░  Early game dominance
Emotional: ▓▓▓▓░░░░░░  Mid-early value
Atomic:    ▓▓▓▓▓░░░░░  Mid-game pivotal
Galactic:  ▓▓▓▓▓▓░░░░  Late-game board control
Cosmic:    ▓▓▓▓▓▓▓▓▓░  Game-ending potential
Hybrid:    ▓▓▓▓▓▓░░░░  Situational power
```

---

## 🎯 DESIGN PHILOSOPHY

### The Inversion Principle
> *"Every blessing has a shadow. Every victory has a cost."*

Every card in the game follows this principle:
- **Power** creates advantage
- **Curse** creates consequence
- **Skill** is balancing the two

### Frequency as Playstyle
Your frequency choice defines your approach:
- **Low (Delta/Theta):** Defensive, patient, controlling
- **Mid (Alpha/Beta):** Balanced, adaptive, tactical  
- **High (Gamma/432Hz):** Aggressive, transformative, risky
- **Earth (Schumann):** Grounded, stable, resource-focused

### The Seven Layers Connection
Each dungeon maps to a layer of perception:
1. **Pedant** → Concept (naming, structure)
2. **Golem** → Form (creation, automation)
3. **Puppeteer** → Influence (hidden forces)
4. **Inquisitor** → Truth (painful clarity)
5. **Alchemist** → Transformation (change, synthesis)
6. **Feed** → Consumption (desire, hunger)
7. **Identifier** → Self (identity, ego)

---

## 🏆 ACHIEVEMENTS

### Combat
- First Victory
- Dungeon Master (all 7 cleared)
- System Defeated
- Speed Demon (<20 min)
- Untouched (no damage)

### Frequency
- Deep Diver (50%+ Delta)
- Flow State (3-chain resonance)
- Peak Performer (100+ Gamma dmg)
- Frequency Master (all 7 in one game)

### Collection
- Full Set (all Physical)
- Epic Hoarder (all Galactic)
- Cosmic Completion (all Legendary)
- The Inverted (all Hybrids)

---

## 🔧 TECHNICAL NOTES

### File Structure
```
inversion_excursion/
├── INDEX.md                           ← You are here
├── CARD_COMPENDIUM.md                 ← Full card database
├── BALANCE_SPREADSHEET.md             ← Power analysis
├── FREQUENCY_SYNERGY.md               ← Frequency mechanics
├── DUNGEON_ATTACK_PATTERNS.md         ← AI behavior
├── QUICK_REFERENCE.md                 ← Quick lookup
├── ALIGNMENT_MORAL_ONTOLOGY.md        ← Moral framework spec
├── ALIGNMENT_IMPLEMENTATION_GUIDE.md  ← Technical implementation
└── ALIGNMENT_QUICK_REFERENCE.md       ← Alignment quick ref
```

### Recommended Reading Order
1. **QUICK_REFERENCE.md** — Get the overview (10 min)
2. **CARD_COMPENDIUM.md** — Understand the cards (30 min)
3. **FREQUENCY_SYNERGY.md** — Master frequency play (20 min)
4. **ALIGNMENT_QUICK_REFERENCE.md** — Learn the moral framework (10 min)
5. **ALIGNMENT_MORAL_ONTOLOGY.md** — Deep dive into alignment (45 min)
6. **BALANCE_SPREADSHEET.md** — Strategic analysis (25 min)
7. **DUNGEON_ATTACK_PATTERNS.md** — Boss preparation (30 min)
8. **ALIGNMENT_IMPLEMENTATION_GUIDE.md** — Technical reference (as needed)

---

## 📝 CHANGE LOG

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-07 | 1.1.0 | **PHASE 2: Alignment Moral Ontology** — Four territories, civic weight, drift consequences, player mirror, boss adaptation |
| 2026-03-07 | 1.0.0 | Initial release — 41 cards, 7 dungeons, 4-phase boss |

---

## 🎴 SAMPLE CARD

```
┌─────────────────────────────────────────┐
│  AXION OF CHOICE                        │
│  ★★★★★ Cosmic — Pedant Dungeon          │
│                                         │
│  Frequency: 432Hz ♪                     │
│                                         │
│  POWER:                                 │
│  TRANSCEND — Remove all curses from     │
│  your field. For each curse removed,    │
│  deal 20 damage.                        │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  CURSE:                                 │
│  PARADOX — After playing, shuffle this  │
│  card into opponent's deck.             │
│                                         │
│  "Every proof contains the seed of      │
│   its own undoing."                     │
│                                         │
│  [Pedant] [432Hz] [Cosmic] [Curse]      │
└─────────────────────────────────────────┘
```

---

## 🌟 KEY TAKEAWAYS

1. **41 Unique Cards** across 7 dungeons, 7 frequencies, 6 tiers
2. **Inversion Mechanic** — Every power has a curse
3. **Frequency Synergy** — Resonant pairs create bonuses, discord creates penalties
4. **Alignment System** — Four moral territories (Citizen, Official, Ghost, Archon) with real gameplay consequences
5. **Civic Weight** — Moral shifts carry weight; 500+ triggers narrative events
6. **Player Mirror** — Your choices determine your alignment; your alignment determines your options
7. **4-Phase Boss** — The System adapts based on your moral territory
8. **High Replayability** — 16 alignment endings + true ending at (0,0)

---

*"The System welcomes you. The System tests you. The System remembers."*

**Design Complete. Ready for Implementation.**
