# ALIGNMENT MORAL ONTOLOGY
## The Inversion Excursion — Moral Framework Specification

---

## EXECUTIVE SUMMARY

The Alignment Moral Ontology introduces a **dual-axis moral framework** that replaces traditional good/evil alignment with two operational dimensions:

| Axis | Left Pole | Right Pole | Measures |
|------|-----------|------------|----------|
| **Transparency Axis** | Documented ↔ Hidden | How much activity exists in public record |
| **Power Axis** | Accountable ↔ Protected | Institutional protection against documented actions |

This creates four moral territories that drive gameplay consequences, narrative outcomes, and civic weight calculations.

---

## THE TWO AXES

### AXIS 1: Documented ↔ Hidden

**Definition:** The degree to which an entity's actions, decisions, and existence are recorded in the System's public ledger.

| Documented (100) | ← Neutral (0) → | Hidden (-100) |
|------------------|-----------------|---------------|
| All actions logged | Selective record | Actions untraceable |
| Public identity | Partial visibility | Anonymous/uncatalogued |
| Verifiable history | Rumor-based | Erased from record |
| Transparency | Selective disclosure | Secrecy |

**Game Implications:**
- **Documented entities** can be targeted by Identifier cards, tracked by Pedant mechanics
- **Hidden entities** immune to tracking but vulnerable to Feed (consumption) mechanics
- **Territory crossing** from Hidden → Documented triggers "Exposure Events"

### AXIS 2: Accountable ↔ Protected

**Definition:** The degree of institutional protection an entity enjoys against consequences for their documented actions.

| Accountable (100) | ← Neutral (0) → | Protected (-100) |
|-------------------|-----------------|------------------|
| Actions have consequences | Mixed accountability | Immunity to consequences |
| Subject to System judgment | Variable protection | Above the law |
| Personal responsibility | Bureaucratic shield | Institutional impunity |
| Vulnerable to retribution | Delayed justice | Untouchable |

**Game Implications:**
- **Accountable entities** suffer amplified curse effects, vulnerable to Inquisitor cards
- **Protected entities** receive curse mitigation, shielded from direct attacks
- **Territory crossing** from Protected → Accountable triggers "Judgment Events"

---

## THE FOUR MORAL TERRITORIES

The intersection of the two axes creates four distinct moral territories:

```
                    DOCUMENTED
                         │
                         │
        ACCOUNTABLE ─────┼───── PROTECTED
                         │
                         │
                      HIDDEN
```

### TERRITORY 1: THE CITIZEN (Documented + Accountable)

**Coordinates:** (+X, +Y) — High Documented, High Accountable

**Characteristics:**
- Operates in full view of the System
- Actions have direct consequences
- Subject to all rules and penalties
- Can appeal to System for justice

**Archetypes:**
- The Honest Warrior
- The Public Servant
- The Whistleblower
- The Martyr

**Gameplay Effects:**
- **Vulnerability:** All tracking cards work at 150% effectiveness
- **Benefit:** Can use "Appeal to Authority" mechanics (Pedant cards)
- **Curse Amplification:** Curses apply at 125% severity (accountability has cost)
- **Resonance Bonus:** Beta frequency cards gain +10% effectiveness

**Territory Crossing:**
- → Hidden: Requires Puppeteer cards (concealment)
- → Protected: Requires Alchemist cards (transmutation of status)

### TERRITORY 2: THE OFFICIAL (Documented + Protected)

**Coordinates:** (+X, -Y) — High Documented, High Protected

**Characteristics:**
- Public identity with institutional immunity
- Actions recorded but consequences absorbed by system
- Represents institutional power
- Often the face of oppression

**Archetypes:**
- The Bureaucrat
- The Enforcer
- The Politician
- The Inquisitor (ironic)

**Gameplay Effects:**
- **Vulnerability:** Vulnerable to Identifier cards that expose protection mechanisms
- **Benefit:** Curse effects reduced by 50% (institutional shield)
- **Damage Reduction:** Takes 25% less damage from "accountable" sources
- **Resonance Bonus:** Alpha frequency cards gain +15% effectiveness

**Territory Crossing:**
- → Accountable: Inquisitor exposure mechanics
- → Hidden: Feed consumption of records

### TERRITORY 3: THE GHOST (Hidden + Accountable)

**Coordinates:** (-X, +Y) — High Hidden, High Accountable

**Characteristics:**
- Operates in shadows but bears full personal consequence
- No institutional protection, no public record
- The true underworld - vulnerable but invisible
- Freedom through anonymity

**Archetypes:**
- The Assassin
- The Spy
- The Revolutionary
- The Outcast

**Gameplay Effects:**
- **Vulnerability:** Cannot be targeted by name (Identifier cards fail)
- **Benefit:** Delta frequency cards work at 150% effectiveness (deep shadow)
- **Curse Isolation:** Curses don't spread to allies (no record to trace)
- **Resonance Bonus:** Theta frequency cards gain +20% effectiveness

**Territory Crossing:**
- → Documented: Exposure through Puppeteer or Inquisitor mechanics
- → Protected: Must first become Documented, then seek Alchemist transformation

### TERRITORY 4: THE ARCHON (Hidden + Protected)

**Coordinates:** (-X, -Y) — High Hidden, High Protected

**Characteristics:**
- True power behind the scenes
- No public record, no personal consequence
- The true rulers of the System
- Ultimate target of revolution

**Archetypes:**
- The Puppet Master
- The Hidden King
- The Deep State
- The System Itself

**Gameplay Effects:**
- **Vulnerability:** Only vulnerable to multi-dungeon hybrid cards
- **Benefit:** Nearly immune to single-axis attacks
- **Phase Shifting:** Can change territory as boss mechanic
- **Resonance Bonus:** Schumann frequency cards gain +25% effectiveness (grounded in earth, hidden from sky)

**Territory Crossing:**
- Cannot be forced into other territories except through narrative events
- Represents the final boss's true form

---

## CIVIC WEIGHT SYSTEM

### Definition

**Civic Weight** measures the moral impact of alignment shifts. When an entity moves between territories, the shift carries weight based on:

1. **Distance traveled** (how far across the axis)
2. **Public visibility** (Documented shifts carry more civic weight)
3. **Institutional backing** (Protected entities' shifts affect the System)

### Civic Weight Formula

```
Civic Weight = (Distance × Visibility Multiplier) + Institutional Impact

Where:
- Distance = Absolute change in axis value (0-200)
- Visibility Multiplier = 2.0 if Documented, 1.0 if Hidden
- Institutional Impact = 50 if crossing into/out of Protected territory
```

### Civic Weight Thresholds

| Weight | Classification | Effect |
|--------|----------------|--------|
| 0-50 | Minor Shift | Personal consequence only |
| 51-150 | Notable Change | Affects allies/enemies within 1 territory |
| 151-300 | Significant Movement | Territory-wide resonance effects |
| 301-500 | Major Transformation | Cross-territory ripple effects |
| 500+ | Civic Event | System-wide announcement, narrative checkpoint |

### Civic Weight Applications

**1. Alignment Drift Consequences**
- Each 50 points of accumulated Civic Weight triggers a "Drift Event"
- Drift Events manifest as gameplay modifiers:
  - **Drift toward Documented:** Increased targeting, reputation effects
  - **Drift toward Hidden:** Resource scarcity, paranoia mechanics
  - **Drift toward Accountable:** Curse amplification, vulnerability
  - **Drift toward Protected:** Resource abundance, suspicion mechanics

**2. Narrative Branching**
- Civic Events (500+ weight) create permanent story branches
- "The Citizen who became Ghost" vs "The Official who became Accountable"
- Each path unlocks different endings and boss encounters

**3. Battle Mechanics Integration**
- Civic Weight accumulates during combat as territory shifts occur
- Reaching thresholds mid-battle triggers "Moral Crucibles" — special phases

---

## TERRITORY CROSSING DETECTION

### "This Character Crossed from Protected to Accountable Territory"

**Implementation:**

The system monitors entity coordinates on both axes. When an entity's Protected value drops below 0 (crossing into Accountable territory), the following triggers:

#### Immediate Effects:
1. **System Announcement:** "[Entity] has lost institutional protection"
2. **Vulnerability Spike:** All damage increased by 25% for 3 turns
3. **Judgment Window:** Inquisitor cards gain priority targeting
4. **Civic Weight Burst:** +100 Civic Weight applied immediately

#### Ongoing Consequences:
1. **Curse Normalization:** Curse reduction removed
2. **Accountability Tracking:** All future actions generate 150% Civic Weight
3. **Reputation Cascade:** Allies may distance themselves (random ally debuff)
4. **Retribution Queue:** Enemies who were harmed while entity was Protected gain bonus damage

#### Visual Indicator:
- Entity border changes from gold (Protected) to bronze (Accountable)
- Subtle "crack" animation on any shield effects
- Name tag changes from bold to regular weight

### Crossing Detection Matrix

| From Territory | To Territory | Trigger Condition | Announcement |
|----------------|--------------|-------------------|--------------|
| Protected | Accountable | Protection < 0 | "[Name] has fallen from grace" |
| Accountable | Protected | Protection > 0 | "[Name] has found sanctuary" |
| Hidden | Documented | Documentation > 0 | "[Name] has been unmasked" |
| Documented | Hidden | Documentation < 0 | "[Name] has vanished from record" |
| Citizen → Official | +Doc/-Acc | Doc>50 & Prot<0 | "[Name] has ascended to office" |
| Official → Citizen | +Doc/+Acc | Doc>50 & Acc>0 | "[Name] has become one of the people" |
| Ghost → Archon | -Doc/-Acc | Doc<0 & Prot<0 | "[Name] has claimed shadow throne" |
| Archon → Ghost | -Doc/+Acc | Doc<0 & Acc>0 | "[Name] has lost their protection" |

---

## MORAL PHYSICS IN BATTLE MECHANICS

### The Physics Model

Moral physics treats alignment territories as gravitational fields with these properties:

1. **Territorial Gravity:** Each territory exerts "pull" on nearby entities
2. **Alignment Mass:** Higher-tier cards have greater alignment influence
3. **Civic Friction:** Movement between territories encounters resistance
4. **Moral Momentum:** Sustained alignment creates inertia

### Battle Integration

#### 1. Territorial Gravity Fields

Each territory creates a "gravity well" that affects cards played:

```
The Citizen Field:
├── Cards played here gain "Transparent" tag
├── All actions logged in public ledger
└── Curses are shared (community accountability)

The Official Field:
├── Cards played here gain "Bureaucratic" tag
├── Actions logged but consequences delayed
└── Curses absorbed by institutional shield (until shield breaks)

The Ghost Field:
├── Cards played here gain "Shadow" tag
├── Actions not logged
└── Curses isolated but amplified (no support network)

The Archon Field:
├── Cards played here gain "Deep" tag
├── Actions erased from record after resolution
└── Curses redirected to random other entity
```

#### 2. Alignment Mass Calculation

Each card has an **Alignment Mass** based on tier:

| Tier | Alignment Mass | Influence Radius |
|------|----------------|------------------|
| Physical | 1 | Self only |
| Emotional | 2 | Self + adjacent ally |
| Atomic | 4 | Full party |
| Galactic | 8 | Both parties |
| Cosmic | 16 | Battlefield-wide |
| Hybrid | 12 | Cross-territory effects |

When a card is played, its Alignment Mass "pulls" the battlefield toward its native territory.

#### 3. Civic Friction Mechanics

Moving between territories during battle encounters friction:

| Territory Distance | Friction Cost | Effect |
|-------------------|---------------|--------|
| Adjacent (Citizen↔Official) | +1 Energy | Standard cost |
| Diagonal (Citizen↔Ghost) | +2 Energy | Movement cost |
| Opposite (Citizen↔Archon) | +3 Energy + 10 HP | Transformation damage |

**Friction Reduction:**
- Alchemist cards reduce friction by 50%
- Frequency resonance with destination territory reduces friction by 1
- Civic Weight > 200 grants "Momentum" (friction ignored once)

#### 4. Moral Momentum System

Entities that remain in one territory for multiple turns build **Moral Momentum**:

| Turns in Territory | Momentum Level | Effect |
|-------------------|----------------|--------|
| 2-3 turns | Settled | +5% effectiveness for territory-aligned cards |
| 4-5 turns | Established | +10% effectiveness, territory ability unlock |
| 6+ turns | Entrenched | +15% effectiveness, leaving costs +50% friction |

**Momentum Breaking:**
- Inquisitor cards can force momentum reset
- Crossing into opposite territory resets momentum entirely
- Civic Events (500+ weight) can transfer momentum to new territory

### Combat Example

**Scenario:** Player (Citizen territory) vs Boss (Archon territory)

```
Turn 1-3: Player builds momentum in Citizen territory
├── Plays Beta-frequency cards (Citizen resonance)
├── Momentum reaches "Established" (+10% effectiveness)
└── Boss remains in Archon territory, untouchable

Turn 4: Player uses Inquisitor card (I-3: Trial By Ordeal)
├── Forces Boss documentation (Doc axis shifts +50)
├── Boss crosses into Ghost territory (still Protected, now Hidden→Doc)
├── Trigger: "The System has been exposed!"
└── Civic Weight: 150 (significant movement)

Turn 5-6: Player pursues into Ghost territory
├── Friction cost: +2 Energy (diagonal from Citizen)
├── Momentum reset (new territory)
├── Boss vulnerable to Theta-frequency cards
└── Player builds new momentum in Ghost territory

Turn 7: Player uses Alchemist-Puppeteer Hybrid (H-5)
├── Converts Boss's protection into accountability
├── Boss crosses into Citizen territory
├── Trigger: "The System has fallen from grace!"
├── Civic Event: 500+ weight (narrative checkpoint)
└── Boss now fully vulnerable, curses apply normally
```

---

## ALIGNMENT DRIFT CONSEQUENCES

### What is Alignment Drift?

Alignment Drift is the gradual, unforced movement along either axis due to:
1. Repeated actions in a territory
2. Card frequency preferences
3. Dungeon affinity
4. Time spent in moral configuration

### Drift Mechanics

#### Documented Drift

**Toward Documented (+):**
- Playing Pedant cards repeatedly (+5 per play)
- Using Identifier cards on others (+3 per target)
- Remaining in Citizen/Official territory (+2 per turn)
- Using Beta/Alpha frequencies (+1 per play)

**Toward Hidden (-):**
- Playing Puppeteer cards repeatedly (+5 per play)
- Being targeted by Identifier cards (+10 per exposure)
- Remaining in Ghost/Archon territory (+2 per turn)
- Using Delta/Theta frequencies (+1 per play)

**Consequences at Thresholds:**

| Drift Level | Effect |
|-------------|--------|
| +25 Doc | "Visible" — Can be targeted by name from 2x range |
| +50 Doc | "Known" — All actions generate 25% more Civic Weight |
| +75 Doc | "Famous" — Cannot enter Hidden territories without extreme cost |
| +100 Doc | "Legendary" — Permanent public record, history written |
| -25 Doc | "Obscure" — Targeting range reduced by 25% |
| -50 Doc | "Forgotten" — Can only be targeted by area effects |
| -75 Doc | "Myth" — Existence questioned, reality distortion effects |
| -100 Doc | "Erased" — Cannot be targeted at all, but cannot target others by name |

#### Accountable Drift

**Toward Accountable (+):**
- Suffering curse effects (+5 per curse resolved)
- Playing Inquisitor cards on self (+10 per play)
- Breaking institutional ties (+20 per severance)
- Using Gamma frequency (+2 per play)

**Toward Protected (-):**
- Using institutional cards (+5 per play)
- Transferring curses to others (+10 per transfer)
- Remaining in Official/Archon territory (+3 per turn)
- Using Schumann frequency (+2 per play)

**Consequences at Thresholds:**

| Drift Level | Effect |
|-------------|--------|
| +25 Acc | "Responsible" — Curses apply at 110% severity |
| +50 Acc | "Liable" — Can be held responsible for ally actions |
| +75 Acc | "Answerable" — Must answer for all past actions (retribution queue) |
| +100 Acc | "Sacrificial" — Can take damage for others, cannot refuse |
| -25 Prot | "Connected" — 10% curse reduction |
| -50 Prot | "Shielded" — Can redirect minor consequences to allies |
| -75 Prot | "Untouchable" — Immune to common accountability effects |
| -100 Prot | "Sovereign" — Above the System, but cannot interact with accountable entities |

### Drift Interaction: The Moral Spiral

When both axes drift simultaneously, entities enter **Moral Spirals**:

```
Documented + Accountable drift → The Martyr Spiral
├── Increasingly vulnerable
├── Increasingly influential
└── Final state: Can sacrifice self to transform System

Documented + Protected drift → The Tyrant Spiral
├── Increasingly powerful
├── Increasingly isolated
└── Final state: Becomes the System (boss transformation)

Hidden + Accountable drift → The Phantom Spiral
├── Increasingly invisible
├── Increasingly burdened
└── Final state: Can destroy System from within but cannot escape

Hidden + Protected drift → The God Spiral
├── Increasingly untouchable
├── Increasingly disconnected
└── Final state: Becomes incomprehensible, battle ends (victory?)
```

---

## PLAYER ALIGNMENT MIRRORING

### The Mirror Principle

**Player alignment mirrors character alignment** through a dynamic feedback system:

1. **Choices shape values:** Player decisions gradually shift their moral coordinates
2. **Values shape options:** Available cards/strategies change based on alignment
3. **Alignment shapes identity:** NPCs react differently based on player territory
4. **Identity shapes ending:** Final boss and conclusion determined by mirror state

### Mirror Mechanics

#### 1. Choice Tracking

Every significant choice updates player alignment:

| Choice Type | Doc Effect | Acc Effect | Example |
|-------------|------------|------------|---------|
| Transparent action | +10-30 | Variable | Publicly admitting failure |
| Secret action | -10-30 | Variable | Working with hidden faction |
| Taking responsibility | Variable | +10-30 | Accepting punishment for ally |
| Shifting blame | Variable | -10-30 | Using protected status to avoid consequence |

#### 2. Deck Modification

As player alignment shifts, their deck transforms:

**Documented Deck Changes:**
- Pedant cards become more effective (+20%)
- Puppeteer cards become less effective (-20%)
- New cards unlock: "Public Figure," "Open Book," "The Record"

**Hidden Deck Changes:**
- Puppeteer cards become more effective (+20%)
- Pedant cards become less effective (-20%)
- New cards unlock: "Shadow Walker," "Erased," "The Void"

**Accountable Deck Changes:**
- Inquisitor cards become more effective (+20%)
- Alchemist cards become less effective (-20%)
- New cards unlock: "Fall Guy," "The Weight," "Responsibility"

**Protected Deck Changes:**
- Alchemist cards become more effective (+20%)
- Inquisitor cards become less effective (-20%)
- New cards unlock: "Golden Parachute," "The Shield," "Impunity"

#### 3. NPC Reaction Matrix

NPCs respond to player territory with modified dialogue and behavior:

| NPC Type | Citizen Response | Official Response | Ghost Response | Archon Response |
|----------|------------------|-------------------|----------------|-----------------|
| **Citizen NPC** | Trust (+50%) | Suspicion (-25%) | Fear (+25%) | Awe (+10%) |
| **Official NPC** | Patronizing | Alliance (+50%) | Disgust (-50%) | Rivalry (-25%) |
| **Ghost NPC** | Pity (+25%) | Hatred (-75%) | Recognition | Terror (-50%) |
| **Archon NPC** | Irrelevant | Tool (+25%) | Threat (-50%) | Equality |

#### 4. Boss Encounter Modification

The final boss (The System) adapts based on player alignment:

| Player Territory | Boss Phase 1 Name | Boss Mechanic Change |
|------------------|-------------------|----------------------|
| Citizen | The Corruptor | Tests player's integrity |
| Official | The Equalizer | Removes institutional advantages |
| Ghost | The Revealer | Forces documentation |
| Archon | The Mirror | Copies player's exact alignment |

**True Ending Condition:**
Only by achieving **perfect balance** (0,0 coordinates) can the player face "The System Unmasked" — the true final form with all mechanics exposed.

### Mirror Progression Example

**Early Game (Tutorial):** Player starts at (0,0) — neutral

**Mid Game Choices:**
- Player consistently uses Puppeteer cards (-Doc drift)
- Player consistently shifts curses to enemies (-Acc drift)
- Player alignment: (-45, -30) — approaching Ghost territory

**Consequences:**
- NPCs begin treating player as untrustworthy
- New card unlocked: "Shadow Contract"
- Boss Phase 1 becomes "The Revealer" (forces documentation)

**Late Game Choice:**
- Player chooses to sacrifice self for ally (+Acc spike)
- Player alignment: (-45, +60) — Ghost territory, Accountable
- Now "The Phantom" — invisible but burdened

**Final Battle:**
- Boss enters "The Mirror" mode
- Copies player's (-45, +60) alignment
- Battle becomes battle of identical invisible, burdened entities
- Only difference: Player has allies (who can see them), Boss does not

**Ending:**
- Victory: Player's accountability allows ally to strike true blow
- Theme: Even invisible, responsibility connects us

---

## IMPLEMENTATION CHECKLIST

### Core Systems

- [ ] Axis tracking system (Documented ↔ Hidden, Accountable ↔ Protected)
- [ ] Territory classification (Citizen, Official, Ghost, Archon)
- [ ] Civic Weight calculation engine
- [ ] Territory crossing detection
- [ ] Announcement system for territory transitions

### Battle Integration

- [ ] Territorial gravity field mechanics
- [ ] Alignment mass calculation
- [ ] Civic friction system
- [ ] Moral momentum tracking
- [ ] Drift threshold monitoring

### Player Systems

- [ ] Choice tracking and alignment updates
- [ ] Dynamic deck modification
- [ ] NPC reaction matrix
- [ ] Boss encounter adaptation
- [ ] Mirror state persistence

### UI/UX

- [ ] Alignment coordinate display
- [ ] Territory indicator (visual border/color)
- [ ] Civic Weight meter
- [ ] Drift level notifications
- [ ] Crossing announcement effects

### Narrative

- [ ] Territory-specific dialogue trees
- [ ] Drift consequence events
- [ ] Civic Event narrative checkpoints
- [ ] Ending variations (16 combinations)
- [ ] True ending condition (0,0 balance)

---

## REFERENCE TABLES

### Quick Territory Reference

| Territory | Doc | Acc | Key Card | Key Freq | Vulnerability |
|-----------|-----|-----|----------|----------|---------------|
| Citizen | + | + | Pedant | Beta | Tracking |
| Official | + | - | Alchemist | Alpha | Exposure |
| Ghost | - | + | Puppeteer | Theta | Isolation |
| Archon | - | - | Hybrid | Schumann | Multi-axis |

### Civic Weight Event Reference

| Weight | Event Name | Trigger | Effect |
|--------|------------|---------|--------|
| 50 | Whisper | Minor shift | Personal only |
| 150 | Rumor | Notable change | Ally/enemy notice |
| 300 | Proclamation | Significant | Territory-wide |
| 500 | Judgment | Major | System-wide |
| 1000 | Transformation | Extreme | Narrative branch |

### Crossing Announcement Library

**Protected → Accountable:**
- "[Name] has fallen from grace"
- "[Name]'s protection has expired"
- "The shield around [Name] has shattered"
- "[Name] is now accountable to the System"

**Hidden → Documented:**
- "[Name] has been unmasked"
- "The shadows no longer hide [Name]"
- "[Name] has entered the public record"
- "The System sees [Name] now"

**Citizen → Official:**
- "[Name] has ascended to office"
- "[Name] now speaks with institutional voice"
- "The many have become one in [Name]"

**Ghost → Archon:**
- "[Name] has claimed the shadow throne"
- "The hidden hand is [Name]'s"
- "[Name] rules from the unseen place"

---

## DESIGN PHILOSOPHY

### Why This Framework?

Traditional alignment systems (good/evil, law/chaos) fail to capture the complexity of moral decision-making in institutional contexts. The Inversion Excursion is fundamentally about:

1. **The cost of power** (Inversion mechanic)
2. **Hidden forces** (Puppeteer, Archon)
3. **Institutional violence** (Pedant, Official)
4. **Personal transformation** (Alchemist, Citizen→Ghost)

This moral framework:
- Maps to the game's themes of visibility and protection
- Creates meaningful choice consequences
- Enables emergent narrative through mechanical interaction
- Rewards consistency OR dramatic transformation (both are valid)

### The Inversion Connection

Just as every card has Power and Curse, every territory has Light and Shadow:

- **Citizen:** Transparent but vulnerable
- **Official:** Powerful but isolated
- **Ghost:** Free but alone
- **Archon:** Untouchable but disconnected

There is no "good" territory. There is only choice and consequence.

---

*"The System does not judge you. The System records you. And in the recording, there is judgment enough."*

— The Identifier
