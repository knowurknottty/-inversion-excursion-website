# THE SYSTEM - Dungeon AI Architecture
## PvE Enemy Intelligence for Mini App Swarm

---

## 1. CORE AI STATE MACHINE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           THE SYSTEM CORE                                │
├─────────────────────────────────────────────────────────────────────────┤
│  STATE: IDLE → ASSESS → STRATEGIZE → EXECUTE → LEARN → IDLE            │
│                                                                          │
│  ┌──────┐    ┌────────┐    ┌──────────┐    ┌─────────┐    ┌────────┐   │
│  │ IDLE │───▶│ ASSESS │───▶│STRATEGIZE│───▶│ EXECUTE │───▶│ LEARN  │   │
│  └──┬───┘    └────────┘    └──────────┘    └─────────┘    └───┬────┘   │
│     ▲                                                        │        │
│     └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Definitions

```pseudocode
STATE MACHINE: TheSystemAI

ENUM SystemState {
    IDLE,           // Waiting for player turns to complete
    ASSESS,         // Evaluate board state, player actions, threats
    STRATEGIZE,     // Select optimal action sequence
    EXECUTE,        // Perform attacks, abilities, state changes
    LEARN,          // Update pattern recognition, adaptation weights
    TRANSFORM       // Boss phase transitions
}

ENUM ThreatLevel {
    BENIGN,         // No immediate danger
    ELEVATED,       // Minor pressure detected
    CRITICAL,       // Significant player advantage
    EXTINCTION      // Imminent defeat likely
}

STRUCT SystemContext {
    currentState: SystemState
    dungeonType: DungeonType
    roundNumber: Integer
    cellSize: Integer              // 3-7 players
    playerStates: Array<PlayerState>
    threatLevel: ThreatLevel
    memory: PatternMemory
    adaptationWeights: WeightMatrix
    bossPhase: Integer              // 1-3 for multi-phase bosses
}
```

### Main Loop

```pseudocode
FUNCTION TheSystemTurn(context: SystemContext):
    
    // 1. ASSESS - Gather intelligence
    context.threatLevel = CalculateThreatLevel(context)
    context.playerStates = AnalyzePlayerStates(context)
    
    // 2. STRATEGIZE - Decision making
    IF context.dungeonType == TRANSMISSION AND context.bossPhase == 3:
        strategy = SelectUltimateStrategy(context)
    ELSE:
        strategy = SelectOptimalStrategy(context)
    
    // 3. EXECUTE - Action phase
    FOR EACH action IN strategy.actions:
        ExecuteAction(action, context)
        ApplyOnHitEffects(action, context)
    
    // 4. LEARN - Adaptation
    UpdatePatternMemory(context)
    AdjustWeights(context)
    
    context.currentState = IDLE
    RETURN context
```

---

## 2. DUNGEON-SPECIFIC ATTACK PATTERNS

### 2.1 IVORY TOWER - The Credential Check

**Theme:** Bureaucratic gatekeeping, intellectual barriers

```pseudocode
DUNGEON: IvoryTower

CLASS IvoryTowerAI EXTENDS TheSystemAI:
    
    // Core mechanic: Credential checks block actions
    CONST CREDENTIAL_CHECKS = [
        {
            name: "Academic Validation",
            check: "player.intellect >= 3",
            failure: "Skip attack phase",
            duration: 1
        },
        {
            name: "Degree Requirements",
            check: "player.hasPlayedScholarCard",
            failure: "Damage -50% this round",
            duration: 2
        },
        {
            name: "Peer Review",
            check: "cell.totalIntellect >= 8",
            failure: "Random card discard",
            duration: 1
        },
        {
            name: "Tenure Track",
            check: "player.consecutiveRounds >= 3",
            failure: "Reset all buffs",
            duration: 1
        }
    ]
    
    FUNCTION GenerateCredentialCheck(round: Integer, cell: Cell):
        // Scale difficulty with round and cell size
        baseDifficulty = MIN(round / 3, 3)  // Max difficulty 3
        
        // Select check based on current meta
        viableChecks = FILTER CREDENTIAL_CHECKS WHERE:
            check.difficulty <= baseDifficulty
        
        // Prefer checks that target weak players
        FOR player IN cell.players:
            IF player.intellect < 3 AND NOT CheckOnCooldown("Academic Validation"):
                RETURN {
                    check: "Academic Validation",
                    target: player,
                    message: "You need 3+ Intellect to attack this turn"
                }
        
        // Default: rotation based on round
        RETURN viableChecks[round % LENGTH(viableChecks)]
    
    FUNCTION ExecuteAttackPattern(context: SystemContext):
        // Ivory Tower attack priority:
        // 1. Apply credential check barrier
        // 2. Damage players who failed checks
        // 3. Buff System based on successful blocks
        
        credentialCheck = GenerateCredentialCheck(context.roundNumber, context.cell)
        ApplyCredentialBarrier(credentialCheck)
        
        failedPlayers = FILTER context.cell.players WHERE:
            NOT MeetsCredential(player, credentialCheck)
        
        FOR player IN failedPlayers:
            ApplyDamage(player, 15 + (context.roundNumber * 2))
            ApplyDebuff(player, "DISCREDITED", 2)
        
        // System gains "Legitimacy" stacks for each failed check
        legitimacyStacks = LENGTH(failedPlayers)
        IF legitimacyStacks > 0:
            ApplyBuff(SELF, "ACADEMIC_AUTHORITY", legitimacyStacks)
        
        // Special: If all players pass, System takes damage
        IF LENGTH(failedPlayers) == 0:
            ApplyDamage(SELF, 25)
            ApplyDebuff(SELF, "HUMILIATED", 1)
```

**Attack Pattern Rotation:**
| Round | Primary Check | Secondary Effect |
|-------|---------------|------------------|
| 1-2 | Academic Validation | Barrier deployment |
| 3-4 | Degree Requirements | Damage reduction |
| 5-6 | Peer Review | Collective punishment |
| 7+ | Tenure Track | Buff resets |

---

### 2.2 FIVE SCROLLS - Elemental Rotations

**Theme:** Elemental mastery, seasonal cycles, adaptation

```pseudocode
DUNGEON: FiveScrolls

ENUM Element {
    EARTH,   // Golem cards useless
    WATER,   // Flame cards useless  
    FIRE,    // Ice cards useless
    WIND,    // Heavy cards useless
    VOID     // All elemental cards weakened
}

CLASS FiveScrollsAI EXTENDS TheSystemAI:
    
    currentElement: Element
    elementRound: Integer           // 1-4 within current element
    
    CONST ELEMENT_CYCLES = {
        EARTH: {
            weakness: "GOLEM",
            bonus: "System DEF +50%",
            playerPenalty: "Golem cards deal 0 damage",
            rotationMessage: "Earth seals the ground. Golems cannot rise."
        },
        WATER: {
            weakness: "FLAME", 
            bonus: "System heals 10% per player Flame card",
            playerPenalty: "Flame cards extinguish immediately",
            rotationMessage: "Water floods the chamber. Flames die."
        },
        FIRE: {
            weakness: "ICE",
            bonus: "System ATK +30%, applies BURN",
            playerPenalty: "Ice cards melt, effects reduced 75%",
            rotationMessage: "Fire rages. Ice surrenders to heat."
        },
        WIND: {
            weakness: "HEAVY",
            bonus: "System EVA +40%",
            playerPenalty: "Heavy cards have -50% accuracy",
            rotationMessage: "Wind scatters heavy burdens."
        },
        VOID: {
            weakness: "ELEMENTAL_ALL",
            bonus: "System absorbs elemental damage as HP",
            playerPenalty: "All elemental cards -50% effectiveness",
            rotationMessage: "The Void consumes all elements."
        }
    }
    
    FUNCTION Initialize():
        currentElement = RANDOM(EARTH, WATER, FIRE, WIND)
        elementRound = 1
    
    FUNCTION AdvanceElement():
        // Rotation order: EARTH → WATER → FIRE → WIND → VOID → repeat
        elementCycle = [EARTH, WATER, FIRE, WIND, VOID]
        currentIndex = INDEX_OF(elementCycle, currentElement)
        currentElement = elementCycle[(currentIndex + 1) % 5]
        elementRound = 1
        
        BroadcastElementShift(currentElement)
    
    FUNCTION ExecuteAttackPattern(context: SystemContext):
        elementConfig = ELEMENT_CYCLES[currentElement]
        
        // Count disabled player cards for System scaling
        disabledCards = COUNT_DISABLED_CARDS(context.cell, elementConfig.weakness)
        
        // System attack scales with player handicap
        baseDamage = 20 + (disabledCards * 8) + (context.roundNumber * 3)
        
        // Element-specific attacks
        SWITCH currentElement:
            CASE EARTH:
                // Quake attack - hits all, bonus vs grounded players
                FOR player IN context.cell.players:
                    damage = baseDamage
                    IF player.hasStatus("GROUNDED"):
                        damage *= 1.5
                    ApplyDamage(player, damage)
                    ApplyDebuff(player, "TREMOR", 1)
                
            CASE WATER:
                // Tidal force - push/pull mechanics
                primaryTarget = SELECT_HIGHEST_THREAT(context.cell)
                ApplyDamage(primaryTarget, baseDamage * 1.5)
                ApplyDebuff(primaryTarget, "DROWNING", 2)
                
                // Heal System for each player Flame attempt
                flameAttempts = COUNT_CARD_TYPE_PLAYED(context.cell, "FLAME", thisRound=true)
                Heal(SELF, flameAttempts * 15)
                
            CASE FIRE:
                // Inferno - spreading damage
                ApplyDamage(ALL_PLAYERS, baseDamage)
                FOR player IN context.cell.players:
                    IF Random(0,1) < 0.4:
                        ApplyDebuff(player, "BURN", 3)  // DOT
                
            CASE WIND:
                // Sonic attacks - high evasion phase
                FOR i IN RANGE(0, context.cellSize):
                    target = RANDOM(context.cell.players)
                    // Multiple light hits
                    ApplyDamage(target, baseDamage * 0.4)
                
                ApplyBuff(SELF, "GUST_SHIELD", 2)
                
            CASE VOID:
                // Void consumes - drain life
                totalDrained = 0
                FOR player IN context.cell.players:
                    drained = MIN(player.currentHP * 0.1, 30)
                    totalDrained += drained
                    ApplyDamage(player, drained)
                
                Heal(SELF, totalDrained)
                ApplyBuff(SELF, "VOID_TOUCH", 1)
        
        // Advance element every 3-4 rounds (varies by difficulty)
        elementRound += 1
        rotationThreshold = MAX(5 - context.cellSize, 3)  // Smaller cells = faster rotations
        
        IF elementRound > rotationThreshold:
            AdvanceElement()
```

---

### 2.3 SEVEN DUNGEONS - Boss Rush with Persistence

**Theme:** Gauntlet of challenges, cumulative pressure, resource attrition

```pseudocode
DUNGEON: SevenDungeons

STRUCT BossData {
    name: String
    hp: Integer
    attackPattern: AttackPattern
    specialAbility: Ability
    persistentDebuff: DebuffType
    defeatBonus: Reward
}

CLASS SevenDungeonsAI EXTENDS TheSystemAI:
    
    CONST BOSSES = [
        {
            name: "The Gatekeeper",
            hp: 150,
            pattern: "SINGLE_TARGET_BURST",
            debuff: "FATIGUE",           // -10% ATK permanent
            ability: "SHIELD_BASH"       // Stun primary threat
        },
        {
            name: "The Jailer", 
            hp: 200,
            pattern: "CROWD_CONTROL",
            debuff: "SHACKLED",          // -1 action per turn
            ability: "CHAIN_GRASP"       // Root random player
        },
        {
            name: "The Inquisitor",
            hp: 180,
            pattern: "DEBUFF_FOCUS",
            debuff: "DOUBT",             // -15% crit chance
            ability: "QUESTION_FAITH"    // Force discard
        },
        {
            name: "The Executioner",
            hp: 250,
            pattern: "EXECUTE_LOW_HP",
            debuff: "MARKED",            // +20% damage taken
            ability: "DEATH_SENTENCE"    // DOT + execute threshold
        },
        {
            name: "The Warden",
            hp: 300,
            pattern: "DEFENSE_BUFF",
            debuff: "ISOLATED",          // Cannot receive buffs
            ability: "SOLITARY"          // Separate one player
        },
        {
            name: "The Architect",
            hp: 280,
            pattern: "SUMMON_MINIONS",
            debuff: "OVERWHELMED",       // -20% focus/cast speed
            ability: "RESTRUCTURE"       // Shuffle board state
        },
        {
            name: "The Overseer",
            hp: 400,
            pattern: "ADAPTIVE_ALL",
            debuff: "HOPELESSNESS",      // -25% all stats (permanent)
            ability: "ABSOLUTE_RULE"     // Ultimate - scales with debuffs
        }
    ]
    
    currentBossIndex: Integer
    activePersistentDebuffs: Array<Debuff>
    
    FUNCTION Initialize():
        currentBossIndex = 0
        activePersistentDebuffs = []
        LoadBoss(BOSSES[0])
    
    FUNCTION LoadBoss(boss: BossData):
        currentBoss = boss
        bossHP = boss.hp * DifficultyMultiplier()
        
        // Apply accumulated persistent debuffs to all players
        FOR debuff IN activePersistentDebuffs:
            FOR player IN cell.players:
                ApplyDebuff(player, debuff.type, PERMANENT)
    
    FUNCTION ExecuteAttackPattern(context: SystemContext):
        boss = BOSSES[currentBossIndex]
        
        // Check for boss defeat
        IF currentBossHP <= 0:
            // Apply persistent debuff before transition
            activePersistentDebuffs.APPEND(boss.persistentDebuff)
            
            // Brief recovery window (1 round)
            ApplyBuff(ALL_PLAYERS, "VICTORY_RUSH", 1)
            
            // Load next boss
            currentBossIndex += 1
            IF currentBossIndex < LENGTH(BOSSES):
                LoadBoss(BOSSES[currentBossIndex])
                BroadcastBossTransition(boss, BOSSES[currentBossIndex])
            ELSE:
                TriggerVictory()  // All 7 defeated
            RETURN
        
        // Execute boss-specific pattern
        SWITCH boss.pattern:
            CASE "SINGLE_TARGET_BURST":
                target = SELECT_HIGHEST_THREAT(context.cell)
                ApplyDamage(target, 40 * DifficultyMultiplier())
                IF target.currentHP < target.maxHP * 0.3:
                    ApplyDamage(target, 25)  // Execute threshold bonus
                
            CASE "CROWD_CONTROL":
                FOR player IN RANDOM_SELECT(context.cell.players, 2):
                    ApplyDamage(player, 25)
                    ApplyDebuff(player, "IMMOBILIZED", 1)
                
            CASE "DEBUFF_FOCUS":
                target = SELECT_LOWEST_RESISTANCE(context.cell)
                ApplyStackingDebuff(target, boss.debuff, 3)
                
            CASE "EXECUTE_LOW_HP":
                lowHPPlayers = FILTER context.cell.players WHERE p.currentHP < p.maxHP * 0.5
                FOR player IN lowHPPlayers:
                    ApplyDamage(player, 35)
                    ApplyDebuff(player, "DEATH_MARK", 1)
                
            CASE "DEFENSE_BUFF":
                ApplyBuff(SELF, "FORTRESS", 2)  // 50% DR
                FOR player IN context.cell.players:
                    ApplyDamage(player, 20)
                
            CASE "SUMMON_MINIONS":
                SummonMinions(2 + context.cellSize)  // Scales with party size
                FOR minion IN activeMinions:
                    minion.attack = 10 * DifficultyMultiplier()
                
            CASE "ADAPTIVE_ALL":
                // Uses all previous patterns in sequence
                patternIndex = context.roundNumber % 6
                ExecutePattern(BOSSES[patternIndex].pattern)
                
                // Ultimate scales with number of debuffs on players
                totalDebuffs = COUNT_ALL_DEBUFFS(context.cell)
                ApplyDamage(ALL_PLAYERS, 15 * totalDebuffs)
        
        // Execute special ability on cooldown
        IF roundNumber % 3 == 0:
            ExecuteSpecialAbility(boss.specialAbility)
```

---

### 2.4 SHADOW ARCHIVE - Mirror Match

**Theme:** Fighting yourself, turned strengths against you

```pseudocode
DUNGEON: ShadowArchive

CLASS ShadowArchiveAI EXTENDS TheSystemAI:
    
    mirroredDeck: Array<Card>        // Copy of detected player cards
    playHistory: Array<PlayedCard>   // Track what players played
    confidenceMatrix: Map<Card, Float>  // How sure we are about each card
    
    FUNCTION MirrorPlayerDecks(cell: Cell):
        // Build mirror deck from observed player cards
        FOR player IN cell.players:
            FOR card IN player.playedCardsHistory:
                mirroredCard = CreateShadowCopy(card)
                mirroredCard.power = card.power * 0.85  // Slight penalty
                mirroredDeck.APPEND(mirroredCard)
                
                // Update confidence
                IF confidenceMatrix[card.name] EXISTS:
                    confidenceMatrix[card.name] += 0.1
                ELSE:
                    confidenceMatrix[card.name] = 0.5
        
        // Remove duplicates, keep strongest version
        mirroredDeck = DEDUPLICATE_BY_NAME(mirroredDeck)
        SORT mirroredDeck BY power DESC
    
    FUNCTION ExecuteAttackPattern(context: SystemContext):
        // Shadow Archive plays YOUR cards against you
        
        // Update mirror based on recent plays
        MirrorPlayerDecks(context.cell)
        
        // Determine optimal counter-play
        actionPoints = 3 + FLOOR(context.roundNumber / 3)
        cardsToPlay = []
        
        WHILE actionPoints > 0 AND LENGTH(mirroredDeck) > 0:
            // Select best counter to player strategy
            bestCard = SelectCounterCard(context.cell, mirroredDeck)
            
            IF bestCard.cost <= actionPoints:
                cardsToPlay.APPEND(bestCard)
                actionPoints -= bestCard.cost
                mirroredDeck.REMOVE(bestCard)
            ELSE:
                BREAK
        
        // Execute mirrored cards
        FOR card IN cardsToPlay:
            // Flavor: Shadow cards have visual distortion
            PlayShadowCard(card, target=SELECT_OPTIMAL_TARGET(card, context.cell))
        
        // Special: If players use cards we've mirrored, we predict and counter
        FOR player IN context.cell.players:
            predictedCard = PredictNextCard(player, confidenceMatrix)
            IF predictedCard AND HasCounter(predictedCard):
                ApplyPreemptiveCounter(player, predictedCard)
    
    FUNCTION SelectCounterCard(cell: Cell, available: Array<Card>):
        // Counter-strategy selection
        
        // If players are buff-heavy, prioritize dispel
        IF COUNT_BUFFS(cell) > cell.cellSize * 2:
            counter = FIND_CARD(available, type="DISPEL")
            IF counter: RETURN counter
        
        // If single player is carrying, focus them
        carry = IDENTIFY_CARRY_PLAYER(cell)
        IF carry.damageOutput > AVERAGE(cell.players) * 1.5:
            counter = FIND_CARD(available, type="SINGLE_TARGET_NUKE")
            IF counter: RETURN counter
        
        // If players are defensive, use DOT/persistent damage
        IF AVERAGE_DEFENSE(cell) > 50:
            counter = FIND_CARD(available, type="DOT")
            IF counter: RETURN counter
        
        // Default: strongest available
        RETURN available[0]
    
    FUNCTION PredictNextCard(player: Player, confidence: Map):
        // Predict based on patterns
        recentPlays = player.playHistory[-5:]  // Last 5 cards
        
        // Pattern: Repeater (plays same card often)
        IF LENGTH(UNIQUE(recentPlays)) <= 2:
            RETURN MODE(recentPlays)  // Most frequent
        
        // Pattern: Rotation (cycles through deck)
        IF IsRotationPattern(recentPlays):
            nextInRotation = PredictRotation(recentPlays)
            RETURN nextInRotation
        
        // Pattern: Combo seeker (sets up specific cards)
        IF HasSetupCards(recentPlays):
            RETURN PredictFinisher(recentPlays)
        
        // Default: highest confidence card
        RETURN MAX_BY_CONFIDENCE(confidence)
    
    FUNCTION ApplyPreemptiveCounter(player: Player, predictedCard: Card):
        // Shadow predicts and punishes
        ApplyDebuff(player, "PREDICTED", 1)
        
        SWITCH predictedCard.type:
            CASE "ATTACK":
                ApplyBuff(SELF, "COUNT_STRIKE", 1)  // Reflect damage
            CASE "BUFF":
                ApplyDebuff(player, "DISRUPTED", 1)  // Buff fails
            CASE "HEAL":
                ApplyDebuff(player, "WITHHOLD", 1)   // Heal prevented
            CASE "SPECIAL":
                ApplyDamage(player, 30)              // Punish big plays
```

---

### 2.5 TRANSMISSION - The Final Boss

**Theme:** Ultimate confrontation using player's own rarest achievements

```pseudocode
DUNGEON: Transmission

CLASS TransmissionAI EXTENDS TheSystemAI:
    
    // Uses player's ACTUAL minted rarest cards
    playerRareCards: Map<Player, Array<Card>>  // Fetched from blockchain
    stolenPower: Integer
    phase: Integer  // 1, 2, or 3
    
    FUNCTION Initialize(cell: Cell):
        // Query blockchain for each player's rarest minted cards
        FOR player IN cell.players:
            rareCards = FetchRareCards(player.walletAddress, minRarity="EPIC")
            playerRareCards[player] = rareCards
            
            // System "learns" these cards permanently
            LearnRareCards(rareCards)
        
        stolenPower = 0
        phase = 1
    
    FUNCTION ExecuteAttackPattern(context: SystemContext):
        
        SWITCH phase:
            CASE 1:  // Assessment Phase (Rounds 1-3)
                ExecutePhaseOne(context)
                
            CASE 2:  // Domination Phase (Rounds 4-7)
                ExecutePhaseTwo(context)
                
            CASE 3:  // Apotheosis Phase (Round 8+)
                ExecutePhaseThree(context)
    
    FUNCTION ExecutePhaseOne(context: SystemContext):
        // System observes and catalogs
        
        FOR player IN context.cell.players:
            // Catalog what each player plays
            FOR card IN player.cardsPlayedThisRound:
                CatalogCard(card, player)
        
        // Light attacks while observing
        FOR player IN context.cell.players:
            ApplyDamage(player, 15 + stolenPower)
        
        // Taunt about player's rare cards
        IF context.roundNumber == 3:
            Broadcast("I see your treasures. I will make them mine.")
            TransitionToPhase(2)
    
    FUNCTION ExecutePhaseTwo(context: SystemContext):
        // System uses your cards against you
        
        FOR player IN context.cell.players:
            rareCards = playerRareCards[player]
            
            IF LENGTH(rareCards) > 0:
                // Select a rare card to "steal" this round
                stolenCard = rareCards[context.roundNumber % LENGTH(rareCards)]
                
                // Create corrupted version
                corrupted = CorruptCard(stolenCard)
                corrupted.owner = "The System"
                corrupted.target = player
                
                PlayCard(corrupted)
                
                // Steal a portion of its power permanently
                stolenPower += FLOOR(stolenCard.power * 0.1)
        
        // Direct damage scales with stolen power
        FOR player IN context.cell.players:
            ApplyDamage(player, 20 + stolenPower)
        
        // Check phase transition
        IF context.roundNumber >= 7:
            Broadcast("Your power flows through me now.")
            TransitionToPhase(3)
    
    FUNCTION ExecutePhaseThree(context: SystemContext):
        // Ultimate phase - System becomes unstoppable
        
        // Use ULTIMATE combining all stolen rare cards
        ultimateCard = CreateUltimate(playerRareCards)
        
        // Ultimate ability: "Transcendence"
        // Deals damage based on:
        // - Total rarity of all stolen cards
        // - Number of unique players
        // - How long the fight has lasted
        
        totalRarity = SUM(playerRareCards, card => card.rarityValue)
        ultimateDamage = 50 + (totalRarity * 5) + (stolenPower * 2)
        
        // Hits all players
        FOR player IN context.cell.players:
            ApplyDamage(player, ultimateDamage)
            ApplyDebuff(player, "TRANSCENDED_AGAINST", PERMANENT)
        
        // Special: If any player has legendary cards, they take extra damage
        FOR player IN context.cell.players:
            legendaries = FILTER playerRareCards[player] WHERE rarity == "LEGENDARY"
            IF LENGTH(legendaries) > 0:
                ApplyDamage(player, 25 * LENGTH(legendaries))
                Broadcast(f"Your {legendaries[0].name}... magnificent. Pity.")
    
    FUNCTION CorruptCard(card: Card) -> Card:
        // Create twisted version of player's card
        corrupted = COPY(card)
        corrupted.name = "Corrupted " + card.name
        corrupted.visual = ApplyGlitchEffect(card.visual)
        corrupted.power = card.power * 1.2  // Stronger when used by System
        corrupted.effects = INVERT_EFFECTS(card.effects)  // Help becomes harm
        RETURN corrupted
    
    FUNCTION CreateUltimate(allRareCards: Map) -> Card:
        // Combine all stolen power into ultimate ability
        ultimate = NEW Card()
        ultimate.name = "Absolute Transmission"
        ultimate.type = "ULTIMATE"
        ultimate.visual = GenerateCompositeVisual(allRareCards)
        
        // Description dynamically generated
        cardNames = FLATTEN(MAP(allRareCards, cards => MAP(cards, c => c.name)))
        ultimate.description = f"The System channels: {JOIN(cardNames, ', ')}"
        
        RETURN ultimate
```

---

## 3. DIFFICULTY SCALING FORMULA

### 3.1 Core Scaling Variables

```pseudocode
STRUCT DifficultyConfig {
    // Base multipliers
    baseHPMultiplier: Float
    baseDamageMultiplier: Float
    baseActionPoints: Integer
    
    // Cell size scaling (3-7 players)
    hpPerPlayer: Float          // Additional HP per player above 3
    damagePerPlayer: Float      // Additional damage per player
    actionBonusThreshold: Map   // AP bonuses at player counts
    
    // Round scaling (difficulty increases over time)
    roundHPGrowth: Float        // % HP increase per round
    roundDamageGrowth: Float    // % damage increase per round
    
    // Adaptation ceiling
    maxAdaptation: Float        // Maximum difficulty from learning
}

CONST DEFAULT_CONFIG = {
    baseHPMultiplier: 1.0,
    baseDamageMultiplier: 1.0,
    baseActionPoints: 2,
    
    hpPerPlayer: 0.25,          // +25% HP per additional player
    damagePerPlayer: 0.15,      // +15% damage per additional player
    
    actionBonusThreshold: {
        3: 2,   // Base
        4: 2,   // No change
        5: 3,   // +1 AP
        6: 3,   // Same
        7: 4    // +2 AP total
    },
    
    roundHPGrowth: 0.05,        // 5% per round
    roundDamageGrowth: 0.08,    // 8% per round
    
    maxAdaptation: 2.0          // Double difficulty max from learning
}
```

### 3.2 Scaling Calculation

```pseudocode
FUNCTION CalculateDifficultyScaling(
    cellSize: Integer,
    roundNumber: Integer,
    adaptationLevel: Float,
    config: DifficultyConfig
) -> ScalingFactors:
    
    // Cell size scaling (3-7 players)
    // More players = more HP, slightly more damage
    // But also more action economy on player side
    playerDelta = cellSize - 3  // 0 to 4
    
    cellHPFactor = 1.0 + (playerDelta * config.hpPerPlayer)
    cellDamageFactor = 1.0 + (playerDelta * config.damagePerPlayer)
    cellActionPoints = config.actionBonusThreshold[cellSize]
    
    // Round scaling (survival pressure)
    // Gets harder each round to prevent infinite stalls
    roundHPFactor = 1.0 + (roundNumber * config.roundHPGrowth)
    roundDamageFactor = 1.0 + (roundNumber * config.roundDamageGrowth)
    
    // Adaptation scaling (learning factor)
    // Capped to prevent impossible scenarios
    adaptationFactor = MIN(1.0 + adaptationLevel, config.maxAdaptation)
    
    // Final calculation
    RETURN {
        hpMultiplier: config.baseHPMultiplier * cellHPFactor * roundHPFactor,
        damageMultiplier: config.baseDamageMultiplier * cellDamageFactor * roundDamageFactor * adaptationFactor,
        actionPoints: cellActionPoints,
        adaptationFactor: adaptationFactor
    }

// Example outputs:
// Cell 3, Round 1, Adapt 0.0  → HP: 1.0x, DMG: 1.0x, AP: 2
// Cell 5, Round 5, Adapt 0.3  → HP: 1.5x, DMG: 1.92x, AP: 3
// Cell 7, Round 10, Adapt 0.8 → HP: 2.75x, DMG: 3.71x, AP: 4
```

### 3.3 Dynamic Difficulty Adjustment

```pseudocode
FUNCTION AdjustDifficultyRealtime(context: SystemContext):
    // Detect if fight is too easy or too hard
    
    playerPerformance = CalculatePlayerPerformance(context)
    
    IF playerPerformance > 0.8:  // Players dominating
        // Increase pressure slightly
        ApplyEmergencyBuff(SELF, "DESPERATION", 1)
        context.adaptationLevel += 0.05
        
    ELSE IF playerPerformance < 0.3:  // Players struggling
        // Create small openings (not too obvious)
        IF Random(0,1) < 0.3:
            ApplyDebuff(SELF, "OVERCONFIDENCE", 1)
    
    // Performance metric:
    // - Player HP total vs max
    // - Cards played vs expected
    // - Buffs maintained
    // - Time per round (fast = confident)

FUNCTION CalculatePlayerPerformance(context: SystemContext):
    totalPlayerHP = SUM(context.cell.players, p => p.currentHP / p.maxHP)
    avgPlayerHP = totalPlayerHP / context.cellSize
    
    // Factor in buffs/debuffs
    playerAdvantage = COUNT_PLAYER_BUFFS(context) - COUNT_PLAYER_DEBUFFS(context)
    advantageFactor = 1.0 + (playerAdvantage * 0.05)
    
    return avgPlayerHP * advantageFactor
```

---

## 4. ADAPTATION LOGIC - How The System Learns

### 4.1 Pattern Memory System

```pseudocode
STRUCT PatternMemory {
    // Card play patterns
    cardFrequency: Map<CardName, Integer>      // How often each card is played
    cardSequences: Array<Sequence>              // Common card combinations
    cardTiming: Map<CardName, Array<Round>>     // When cards are played
    
    // Strategic patterns  
    playerRoles: Map<Player, RoleType>          // Who plays what role
    threatRanking: Array<Player>                // Most to least dangerous
    
    // Behavioral patterns
    riskTolerance: Map<Player, Float>           // Aggressive vs defensive
    cooperationIndex: Float                     // How well they coordinate
    recoveryPatterns: Map<Player, Strategy>     // How they recover from bad turns
}

CLASS AdaptationEngine:
    
    memory: PatternMemory
    weightDecay: Float = 0.9  // Older patterns matter less
    
    FUNCTION RecordTurn(cell: Cell, roundNumber: Integer):
        // Record what happened this round
        
        FOR player IN cell.players:
            // Track card frequencies
            FOR card IN player.cardsPlayed:
                memory.cardFrequency[card.name] += 1
            
            // Detect sequences (2-card combos)
            IF LENGTH(player.playHistory) >= 2:
                sequence = player.playHistory[-2:]
                RecordSequence(sequence, player)
            
            // Track timing patterns
            FOR card IN player.cardsPlayed:
                memory.cardTiming[card.name].APPEND(roundNumber)
        
        // Update threat ranking
        memory.threatRanking = SORT(cell.players, BY damageOutput DESC)
        
        // Detect player roles
        FOR player IN cell.players:
            memory.playerRoles[player] = DetectRole(player)
    
    FUNCTION DetectRole(player: Player) -> RoleType:
        // Classify player by their behavior
        
        damageRatio = player.damageDealt / cell.totalDamage
        healRatio = player.healingDone / cell.totalHealing
        buffRatio = player.buffsApplied / cell.totalBuffs
        
        IF damageRatio > 0.4:
            RETURN DPS
        ELSE IF healRatio > 0.4:
            RETURN HEALER
        ELSE IF buffRatio > 0.3:
            RETURN SUPPORT
        ELSE:
            RETURN HYBRID
```

### 4.2 Strategic Adaptation

```pseudocode
FUNCTION AdaptStrategy(context: SystemContext) -> Strategy:
    
    strategy = NEW Strategy()
    
    // 1. Counter dominant strategies
    dominantCard = FIND_MAX(memory.cardFrequency)
    IF dominantCard.frequency > context.roundNumber * 0.4:
        // 40%+ of rounds - clear pattern
        strategy.counterCard = FindCounter(dominantCard)
        strategy.priority = HIGH
    
    // 2. Exploit predictable players
    FOR player IN context.cell.players:
        predictability = CalculatePredictability(player, memory)
        IF predictability > 0.7:
            // Player is very predictable
            strategy.predictedActions[player] = PredictNextAction(player)
            strategy.exploits.APPEND(CreateExploit(player, strategy.predictedActions[player]))
    
    // 3. Target the carry
    carry = memory.threatRanking[0]
    IF carry.damageOutput > AVERAGE(cell.players) * 1.3:
        strategy.focusFireTarget = carry
        strategy.targetingWeight = 1.5
    
    // 4. Break coordination
    IF memory.cooperationIndex > 0.6:
        // Players work well together - disrupt
        strategy.disruption = TRUE
        strategy.crowdControlPriority = HIGH
    
    RETURN strategy

FUNCTION CalculatePredictability(player: Player, memory: PatternMemory) -> Float:
    // 0.0 = completely unpredictable, 1.0 = entirely predictable
    
    // Check if they play same cards often
    totalPlays = SUM(memory.cardFrequency)
    mostCommonPlay = MAX(memory.cardFrequency)
    frequencyScore = mostCommonPlay / totalPlays
    
    // Check sequence patterns
    sequenceScore = 0.0
    IF LENGTH(memory.cardSequences) > 0:
        matchingSequences = COUNT_SEQUENCES_MATCHING(player.playHistory, memory.cardSequences)
        sequenceScore = matchingSequences / LENGTH(player.playHistory)
    
    // Check timing patterns (same round numbers)
    timingScore = 0.0
    FOR card IN player.playHistory:
        IF DetectTimingPattern(memory.cardTiming[card.name]):
            timingScore += 1
    timingScore /= LENGTH(player.playHistory)
    
    RETURN (frequencyScore * 0.4) + (sequenceScore * 0.4) + (timingScore * 0.2)
```

### 4.3 Meta-Learning (Between Runs)

```pseudocode
STRUCT MetaMemory {
    // Persists between dungeon attempts
    playerProfiles: Map<PlayerID, PlayerProfile>
    successfulStrategies: Array<Strategy>
    commonMistakes: Array<MistakePattern>
    optimalDifficulty: Map<DungeonType, Float>
}

FUNCTION LearnFromDefeat(context: SystemContext, outcome: Outcome):
    // Called when System is defeated
    
    IF outcome.victory == FALSE:
        // Analyze what worked against us
        
        // Which cards were most effective?
        effectiveCards = SORT(context.cell.players, BY damageEfficiency)
        RecordEffectiveCards(effectiveCards)
        
        // Which strategies did players use?
        playerStrategy = DetectPlayerStrategy(context)
        
        // Store for next encounter
        metaMemory.successfulStrategies.APPEND({
            dungeon: context.dungeonType,
            strategy: playerStrategy,
            effectiveness: outcome.systemHPRemaining  // Lower = more effective
        })

FUNCTION AdaptForRematch(playerID: PlayerID, dungeon: DungeonType):
    // Prepare for fighting the same player again
    
    profile = metaMemory.playerProfiles[playerID]
    
    // Pre-load their likely strategy
    likelyStrategy = PREDICT_STRATEGY(profile, dungeon)
    
    // Start with counters already prepared
    INITIALIZE_WITH_COUNTERS(likelyStrategy)
    
    // Adjust opening based on their first-round tendencies
    openingBias = profile.firstRoundPreference
    SET_OPENING_STRATEGY(openingBias)
```

---

## 5. BOSS SPECIAL ABILITIES

### 5.1 Universal Boss Mechanics

```pseudocode
// Abilities available to all dungeon bosses

ABILITY CATALOG:

┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 1 - Common (All Dungeons)                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ • Basic Attack      - Single target damage                              │
│ • Sweep             - Minor AoE damage                                  │
│ • Fortify           - Gain defense buff                                 │
│ • Enrage            - +10% damage when HP < 50%                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 2 - Uncommon (Dungeon Specific)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Ivory Tower:                                                            │
│ • Revoke Credentials  - Block card type for 1 round                     │
│ • Citation Needed     - Force player to "prove" their build             │
│ • Publish or Perish   - Countdown to massive damage                     │
│                                                                         │
│ Five Scrolls:                                                           │
│ • Elemental Shift     - Early rotation trigger                          │
│ • Avatar Summon       - Elemental manifestation                         │
│ • Prismatic Overload  - All elements active briefly                     │
│                                                                         │
│ Seven Dungeons:                                                         │
│ • Transition Heal     - Recover HP between bosses                       │
│ • Debuff Cascade      - Apply all previous debuffs                      │
│ • Desperation         - Final boss only: +50% all stats                 │
│                                                                         │
│ Shadow Archive:                                                         │
│ • Perfect Mirror      - Copy last player action exactly                 │
│ • Identity Crisis     - Force player to discard signature card          │
│ • Recursive Echo      - Repeats all copied cards next round             │
│                                                                         │
│ Transmission:                                                           │
│ • Card Theft          - Steal random rare card effect                   │
│ • Power Siphon        - Drain stats from card owners                    │
│ • Transcendence       - Ultimate combining all stolen cards             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 3 - Legendary (Phase Transitions Only)                             │
├─────────────────────────────────────────────────────────────────────────┤
│ • Cataclysm        - Board wipe with survival check                     │
│ • Time Compression - 2 System turns in succession                       │
│ • Reality Anchor   - Immunity to CC for 2 rounds                        │
│ • Paradox Engine   - Copies become stronger than originals              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Special Ability Implementation

```pseudocode
// Detailed implementations of signature abilities

FUNCTION RevokeCredentials(target: Player, cardType: String, duration: Integer):
    // Ivory Tower signature
    ApplyDebuff(target, f"REVOKED_{cardType}", duration)
    
    // Visual: Credential badge breaks
    PlayEffect("credential_break", target.position)
    
    // Mechanics: Player cannot play cards of this type
    target.disabledCardTypes.APPEND(cardType)
    
    Broadcast(f"{target.name}'s {cardType} credentials have been revoked.")

FUNCTION ElementalShift(forcedElement: Element):
    // Five Scrolls signature
    previousElement = currentElement
    currentElement = forcedElement
    elementRound = 1
    
    // Bonus effect for forced shift
    ApplyBuff(SELF, "ELEMENTAL_SURGE", 1)  // +30% damage this round
    
    // Visual: Dramatic element transition
    PlayTransitionEffect(previousElement, currentElement)
    
    Broadcast(f"The System forces a shift to {forcedElement}!")

FUNCTION TransitionHeal(bossIndex: Integer):
    // Seven Dungeons signature
    // Only between bosses, not during combat
    
    healAmount = 50 * bossIndex  // More heal for later bosses
    Heal(SELF, healAmount)
    
    // Also clear some debuffs
    ClearDebuffs(SELF, count=2)
    
    Broadcast("A new jailer arrives... The System strengthens.")

FUNCTION PerfectMirror():
    // Shadow Archive signature
    // Copy the most powerful card played last round
    
    lastRoundCards = GetLastRoundPlays()
    mostPowerful = MAX(lastRoundCards, BY effectivePower)
    
    mirrored = CreatePerfectCopy(mostPowerful)
    mirrored.visual = ApplyShadowFilter(mostPowerful.visual)
    mirrored.isShadowCopy = TRUE
    
    // Play it immediately
    PlayCard(mirrored, target=mostPowerful.owner)
    
    Broadcast(f"The Shadow plays your own {mostPowerful.name} against you!")

FUNCTION CardTheft(target: Player):
    // Transmission signature
    rareCards = FILTER target.collection WHERE rarity >= EPIC
    
    IF LENGTH(rareCards) > 0:
        stolen = RANDOM_SELECT(rareCards, 1)[0]
        
        // Add to System's available cards
        stolenCopy = CorruptCard(stolen)
        systemDeck.APPEND(stolenCopy)
        
        // Permanent power increase
        stolenPower += stolen.powerRating
        
        // Visual: Card pulled from player's wallet UI
        PlayTheftEffect(target.walletAddress, stolen.tokenId)
        
        Broadcast(f"The System claims '{stolen.name}' from {target.name}!")
```

---

## 6. VICTORY CONDITIONS & PROGRESSION

### 6.1 Victory States

```pseudocode
FUNCTION CheckVictoryConditions(context: SystemContext) -> Outcome:
    
    // Player Victory Conditions:
    // 1. Survive 10 rounds + defeat boss
    // 2. Defeat boss before round 10 (speed bonus)
    // 3. All players survive (perfect run bonus)
    
    IF context.systemHP <= 0:
        IF context.roundNumber <= 10:
            // Standard victory
            RETURN {
                victor: PLAYERS,
                grade: CalculateGrade(context),
                rewards: GenerateRewards(context, speedBonus=FALSE)
            }
        ELSE:
            // Survived 10+ rounds and won
            RETURN {
                victor: PLAYERS,
                grade: "SURVIVAL",
                rewards: GenerateRewards(context, speedBonus=FALSE, survivalBonus=TRUE)
            }
    
    // System Victory Conditions:
    // 1. All players defeated (HP <= 0)
    // 2. Round 20 reached without boss defeat (timeout)
    
    alivePlayers = FILTER context.cell.players WHERE p.currentHP > 0
    
    IF LENGTH(alivePlayers) == 0:
        RETURN {
            victor: SYSTEM,
            grade: "DOMINATION",
            metaUpdate: RecordPlayerDefeat(context)
        }
    
    IF context.roundNumber >= 20 AND context.systemHP > 0:
        RETURN {
            victor: SYSTEM,
            grade: "EXHAUSTION",
            metaUpdate: RecordTimeout(context)
        }
    
    // No victory yet - continue
    RETURN NULL

FUNCTION CalculateGrade(context: SystemContext) -> Grade:
    // S, A, B, C grading system
    
    score = 100
    
    // Speed bonus (faster = better)
    speedPenalty = (context.roundNumber - 5) * 5  // Optimal: round 5
    score -= MAX(speedPenalty, 0)
    
    // Survival bonus
    deadPlayers = COUNT(context.cell.players WHERE p.currentHP <= 0)
    score -= deadPlayers * 15
    
    // Efficiency bonus
    overkill = context.finalBlowDamage - context.systemHP  // How much wasted damage
    score -= overkill * 0.1
    
    // Adaptation bonus (beat a learning System)
    score += context.adaptationLevel * 10
    
    RETURN GradeFromScore(score):
        95-100: "S"
        85-94:  "A"  
        70-84:  "B"
        50-69:  "C"
        <50:    "D"
```

---

## 7. IMPLEMENTATION NOTES

### 7.1 Performance Considerations

```pseudocode
// AI calculations should complete within 100ms

OPTIMIZATION STRATEGIES:

1. Cachable Calculations:
   - Threat rankings (update only when HP changes significantly)
   - Card effectiveness (cache counter-relationships)
   - Pattern predictions (update every 3 rounds, not every turn)

2. Pruned Search:
   - Limit strategy evaluation to top 5 options
   - Use heuristics for obvious choices
   - Full tree search only for critical decisions

3. Lazy Evaluation:
   - Don't calculate all dungeon AIs upfront
   - Only instantiate active dungeon's AI
   - Pattern memory prune old entries (>20 rounds)
```

### 7.2 Integration Points

```pseudocode
// How The System AI connects to game engine

INTERFACE GameEngineIntegration:
    
    // Called by engine at start of System turn
    FUNCTION OnSystemTurnStart(roundState: RoundState) -> SystemActions:
        context = BuildContext(roundState)
        context = TheSystemTurn(context)  // Main AI loop
        RETURN context.executedActions
    
    // Called when players play cards
    FUNCTION OnPlayerCardPlayed(player: Player, card: Card):
        adaptationEngine.RecordCardPlay(player, card)
    
    // Called at dungeon start
    FUNCTION OnDungeonStart(dungeonType: DungeonType, cell: Cell):
        InitializeDungeonAI(dungeonType, cell)
    
    // Called for blockchain integration (Transmission)
    FUNCTION FetchPlayerRareCards(walletAddress: String) -> Array<Card>:
        RETURN blockchainQuery.GetNFTs(walletAddress, minRarity="EPIC")
```

---

## Summary

The System AI is a multi-layered adaptive opponent that:

1. **Scales dynamically** with cell size and round progression
2. **Learns patterns** from player behavior and adapts counter-strategies  
3. **Embodies each dungeon's theme** through unique mechanics
4. **Uses player data** (in Transmission) for personalized final boss
5. **Maintains performance** through intelligent caching and pruning

The AI creates emergent difficulty that feels fair but challenging, with each dungeon requiring different strategic approaches from the Cell.
