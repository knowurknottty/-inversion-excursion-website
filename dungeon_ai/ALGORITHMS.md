# THE SYSTEM - Attack Pattern Algorithms (Quick Reference)

## 1. IVORY TOWER - Credential Check Algorithm

```
INPUT: roundNumber, cellSize, playerStates
OUTPUT: systemActions

PROCEDURE IvoryTowerTurn:
    
    1. SELECT_CREDENTIAL_CHECK:
       difficultyTier = MIN(FLOOR(roundNumber / 3), 3)
       
       vulnerablePlayers = FILTER players WHERE intellect < 3
       IF vulnerablePlayers NOT EMPTY AND CheckAvailable("Academic Validation"):
           check = CREATE_CHECK(
               type: "Academic Validation",
               requirement: "intellect >= 3",
               failurePenalty: "SKIP_ATTACK_PHASE",
               message: "You need 3+ Intellect to attack this turn"
           )
           targetPool = vulnerablePlayers
       ELSE:
           check = SELECT_FROM_ROTATION(roundNumber)
           targetPool = ALL_PLAYERS
    
    2. APPLY_CREDENTIAL_BARRIER:
       FOR player IN targetPool:
           IF NOT MEETS_REQUIREMENT(player, check):
               player.flags.ADD("CREDENTIAL_FAILED")
           ELSE:
               player.flags.ADD("CREDENTIAL_PASSED")
    
    3. CALCULATE_SYSTEM_ATTACK:
       failedCount = COUNT(player.flags == "CREDENTIAL_FAILED")
       
       baseDamage = 15 + (roundNumber * 2)
       legitimacyStacks = failedCount
       
       FOR player IN players:
           IF player.hasFlag("CREDENTIAL_FAILED"):
               damage = baseDamage * (1 + legitimacyStacks * 0.2)
               APPLY_DAMAGE(player, damage)
               APPLY_DEBUFF(player, "DISCREDITED", 2)
       
       IF failedCount == 0:
           APPLY_DAMAGE(SELF, 25)  // Humiliation damage
           APPLY_DEBUFF(SELF, "HUMILIATED", 1)
       ELSE:
           APPLY_BUFF(SELF, "ACADEMIC_AUTHORITY", legitimacyStacks)
    
    4. RETURN actions
```

---

## 2. FIVE SCROLLS - Elemental Rotation Algorithm

```
INPUT: currentElement, elementRound, roundNumber, cellSize
OUTPUT: systemActions

PROCEDURE FiveScrollsTurn:
    
    1. GET_ELEMENT_CONFIG:
       CONFIGS = {
           EARTH: {
               disabledType: "GOLEM",
               damageBonus: 1.0,
               defenseBonus: 1.5,
               attackPattern: QUAKE
           },
           WATER: {
               disabledType: "FLAME", 
               healPerFlameAttempt: 15,
               attackPattern: TIDAL_FORCE
           },
           FIRE: {
               disabledType: "ICE",
               damageBonus: 1.3,
               burnChance: 0.4,
               attackPattern: INFERNO
           },
           WIND: {
               disabledType: "HEAVY",
               evasionBonus: 0.4,
               hitCount: cellSize,
               attackPattern: SONIC_ASSAULT
           },
           VOID: {
               disabledType: "ALL_ELEMENTAL",
               lifestealRatio: 1.0,
               attackPattern: CONSUME
           }
       }
       
       config = CONFIGS[currentElement]
    
    2. COUNT_DISABLED_CARDS:
       disabledCount = COUNT_CARDS_PLAYED(cell, type=config.disabledType, thisRound=TRUE)
       handicapBonus = disabledCount * 8
    
    3. EXECUTE_ELEMENTAL_ATTACK:
       baseDamage = 20 + handicapBonus + (roundNumber * 3)
       
       SWITCH config.attackPattern:
           
           CASE QUAKE:
               FOR player IN players:
                   damage = baseDamage
                   IF player.hasStatus("GROUNDED"):
                       damage = damage * 1.5
                   APPLY_DAMAGE(player, damage)
                   APPLY_DEBUFF(player, "TREMOR", 1)
           
           CASE TIDAL_FORCE:
               primaryTarget = MAX_BY(players, threatLevel)
               APPLY_DAMAGE(primaryTarget, baseDamage * 1.5)
               APPLY_DEBUFF(primaryTarget, "DROWNING", 2)
               
               flameAttempts = COUNT_CARDS_PLAYED(cell, "FLAME", thisRound=TRUE)
               HEAL(SELF, flameAttempts * config.healPerFlameAttempt)
           
           CASE INFERNO:
               FOR player IN players:
                   APPLY_DAMAGE(player, baseDamage * config.damageBonus)
                   IF RANDOM() < config.burnChance:
                       APPLY_DEBUFF(player, "BURN", 3)  // DOT
           
           CASE SONIC_ASSAULT:
               FOR i IN RANGE(0, config.hitCount):
                   target = RANDOM_SELECT(players)
                   APPLY_DAMAGE(target, baseDamage * 0.4)
               APPLY_BUFF(SELF, "GUST_SHIELD", 2)
           
           CASE CONSUME:
               totalDrained = 0
               FOR player IN players:
                   drainAmount = MIN(player.currentHP * 0.1, 30)
                   totalDrained += drainAmount
                   APPLY_DAMAGE(player, drainAmount)
               HEAL(SELF, totalDrained)
               APPLY_BUFF(SELF, "VOID_TOUCH", 1)
    
    4. CHECK_ELEMENT_ROTATION:
       rotationThreshold = MAX(5 - cellSize, 3)
       
       IF elementRound >= rotationThreshold:
           ADVANCE_ELEMENT()
           elementRound = 1
       ELSE:
           elementRound += 1
    
    5. RETURN actions
```

---

## 3. SEVEN DUNGEONS - Boss Rush Algorithm

```
INPUT: currentBossIndex, roundNumber, activeDebuffs, cell
OUTPUT: systemActions

PROCEDURE SevenDungeonsTurn:
    
    1. CHECK_BOSS_DEFEAT:
       IF currentBoss.HP <= 0:
           // Apply persistent debuff
           activeDebuffs.APPEND(currentBoss.persistentDebuff)
           
           // Victory rush for players
           FOR player IN players:
               APPLY_BUFF(player, "VICTORY_RUSH", 1)
           
           // Transition to next boss
           currentBossIndex += 1
           IF currentBossIndex < 7:
               LOAD_BOSS(BOSSES[currentBossIndex])
               APPLY_PERSISTENT_DEBUFFS(activeDebuffs)
               BroadcastBossTransition()
               RETURN
           ELSE:
               TRIGGER_VICTORY()
    
    2. GET_CURRENT_BOSS:
       BOSSES = [
           { name: "Gatekeeper",    hp: 150, pattern: BURST,     debuff: FATIGUE },
           { name: "Jailer",        hp: 200, pattern: CONTROL,   debuff: SHACKLED },
           { name: "Inquisitor",    hp: 180, pattern: DEBUFF,    debuff: DOUBT },
           { name: "Executioner",   hp: 250, pattern: EXECUTE,   debuff: MARKED },
           { name: "Warden",        hp: 300, pattern: DEFENSE,   debuff: ISOLATED },
           { name: "Architect",     hp: 280, pattern: SUMMON,    debuff: OVERWHELMED },
           { name: "Overseer",      hp: 400, pattern: ADAPTIVE,  debuff: HOPELESSNESS }
       ]
       
       boss = BOSSES[currentBossIndex]
       multiplier = 1.0 + (cellSize - 3) * 0.25 + roundNumber * 0.05
    
    3. EXECUTE_BOSS_PATTERN:
       
       SWITCH boss.pattern:
           
           CASE BURST:
               target = MAX_BY(players, damageOutput)
               damage = 40 * multiplier
               APPLY_DAMAGE(target, damage)
               IF target.HP < target.maxHP * 0.3:
                   APPLY_DAMAGE(target, 25)  // Execute bonus
           
           CASE CONTROL:
               targets = RANDOM_SELECT(players, 2)
               FOR target IN targets:
                   APPLY_DAMAGE(target, 25 * multiplier)
                   APPLY_DEBUFF(target, "IMMOBILIZED", 1)
           
           CASE DEBUFF:
               target = MIN_BY(players, resistance)
               APPLY_STACKING_DEBUFF(target, "DOUBT", 3)
           
           CASE EXECUTE:
               lowHP = FILTER players WHERE HP < maxHP * 0.5
               FOR target IN lowHP:
                   APPLY_DAMAGE(target, 35 * multiplier)
                   APPLY_DEBUFF(target, "DEATH_MARK", 1)
           
           CASE DEFENSE:
               APPLY_BUFF(SELF, "FORTRESS", 2)
               FOR player IN players:
                   APPLY_DAMAGE(player, 20 * multiplier)
           
           CASE SUMMON:
               minionCount = 2 + cellSize
               FOR i IN RANGE(0, minionCount):
                   minion = SPAWN_MINION()
                   minion.attack = 10 * multiplier
           
           CASE ADAPTIVE:
               // Cycle through all previous patterns
               cycleIndex = roundNumber % 6
               EXECUTE_PATTERN(BOSSES[cycleIndex].pattern)
               
               // Ultimate scales with debuff count
               totalDebuffs = SUM(players, p => COUNT_DEBUFFS(p))
               FOR player IN players:
                   APPLY_DAMAGE(player, 15 * totalDebuffs)
    
    4. EXECUTE_SPECIAL_ABILITY:
       IF roundNumber % 3 == 0:
           SWITCH currentBossIndex:
               CASE 0: ABILITY_ShieldBash(target)
               CASE 1: ABILITY_ChainGrasp(target)
               CASE 2: ABILITY_QuestionFaith(target)
               CASE 3: ABILITY_DeathSentence(target)
               CASE 4: ABILITY_Solitary(target)
               CASE 5: ABILITY_Restucture()
               CASE 6: ABILITY_AbsoluteRule()
    
    5. RETURN actions
```

---

## 4. SHADOW ARCHIVE - Mirror Match Algorithm

```
INPUT: cell, mirroredDeck, playHistory, confidenceMatrix
OUTPUT: systemActions

PROCEDURE ShadowArchiveTurn:
    
    1. UPDATE_MIRROR_DECK:
       FOR player IN cell.players:
           FOR card IN player.playedThisRound:
               shadowCopy = CREATE_SHADOW_COPY(card)
               shadowCopy.power = card.power * 0.85
               shadowCopy.visual = APPLY_GLITCH_FILTER(card.visual)
               
               IF card.name IN mirroredDeck:
                   confidenceMatrix[card.name] += 0.1
               ELSE:
                   mirroredDeck.APPEND(shadowCopy)
                   confidenceMatrix[card.name] = 0.5
       
       // Sort by power, remove duplicates
       mirroredDeck = DEDUPLICATE_BY(mirroredDeck, name)
       SORT(mirroredDeck, BY power DESC)
    
    2. SELECT_COUNTER_STRATEGY:
       
       // Check for buff-heavy meta
       buffCount = COUNT_BUFFS(cell)
       IF buffCount > cellSize * 2:
           counter = FIND_CARD(mirroredDeck, type="DISPEL")
           IF counter: SELECT_CARD(counter)
       
       // Check for carry player
       carry = MAX_BY(players, damageOutput)
       avgDamage = AVERAGE(players, damageOutput)
       IF carry.damage > avgDamage * 1.5:
           counter = FIND_CARD(mirroredDeck, type="NUKE")
           IF counter: 
               SELECT_CARD(counter)
               SET_TARGET(carry)
       
       // Check for defensive meta
       avgDefense = AVERAGE(players, defense)
       IF avgDefense > 50:
           counter = FIND_CARD(mirroredDeck, type="DOT")
           IF counter: SELECT_CARD(counter)
    
    3. PREDICT_AND_COUNTER:
       FOR player IN cell.players:
           prediction = PREDICT_NEXT_CARD(player, confidenceMatrix)
           
           IF prediction.confidence > 0.6:
               APPLY_PREEMPTIVE_COUNTER(player, prediction.card)
    
    4. PLAY_MIRRORED_CARDS:
       actionPoints = 3
       
       WHILE actionPoints > 0 AND mirroredDeck NOT EMPTY:
           card = SELECT_BEST_AVAILABLE(mirroredDeck, actionPoints)
           
           IF card.cost <= actionPoints:
               target = SELECT_OPTIMAL_TARGET(card, cell)
               PLAY_SHADOW_CARD(card, target)
               actionPoints -= card.cost
               mirroredDeck.REMOVE(card)
           ELSE:
               BREAK
    
    5. RETURN actions

// Helper: Prediction Algorithm
FUNCTION PREDICT_NEXT_CARD(player, confidenceMatrix):
    history = player.playHistory[-5:]
    
    // Pattern 1: Repeater
    uniqueCards = UNIQUE(history)
    IF LENGTH(uniqueCards) <= 2:
       RETURN { card: MODE(history), confidence: 0.8 }
    
    // Pattern 2: Rotation
    IF IS_ROTATION_PATTERN(history):
       nextCard = PREDICT_ROTATION(history)
       RETURN { card: nextCard, confidence: 0.7 }
    
    // Pattern 3: Combo seeker
    IF HAS_SETUP_CARDS(history):
       finisher = PREDICT_FINISHER(history)
       RETURN { card: finisher, confidence: 0.6 }
    
    // Default: Highest confidence
    bestCard = MAX_BY(confidenceMatrix, BY value)
    RETURN { card: bestCard, confidence: confidenceMatrix[bestCard] }

// Helper: Preemptive Counter
FUNCTION APPLY_PREEMPTIVE_COUNTER(player, predictedCard):
    APPLY_DEBUFF(player, "PREDICTED", 1)
    
    SWITCH predictedCard.type:
        CASE ATTACK:
            APPLY_BUFF(SELF, "COUNTER_STRIKE", 1)
        CASE BUFF:
            APPLY_DEBUFF(player, "DISRUPTED", 1)
        CASE HEAL:
            APPLY_DEBUFF(player, "WITHHOLD", 1)
        CASE SPECIAL:
            APPLY_DAMAGE(player, 30)
```

---

## 5. TRANSMISSION - Final Boss Algorithm

```
INPUT: cell, roundNumber, phase, stolenPower, playerRareCards
OUTPUT: systemActions

PROCEDURE TransmissionTurn:
    
    1. DETERMINE_PHASE:
       IF roundNumber <= 3:
           phase = 1  // Assessment
       ELSE IF roundNumber <= 7:
           phase = 2  // Domination
       ELSE:
           phase = 3  // Apotheosis
    
    2. EXECUTE_PHASE:
       
       SWITCH phase:
           
           CASE 1: // ASSESSMENT
               // Catalog player cards
               FOR player IN cell.players:
                   FOR card IN player.cardsPlayed:
                       CATALOG_CARD(card, player)
               
               // Light attacks
               FOR player IN players:
                   APPLY_DAMAGE(player, 15 + stolenPower)
               
               // Transition message
               IF roundNumber == 3:
                   Broadcast("I see your treasures. I will make them mine.")
           
           CASE 2: // DOMINATION
               FOR player IN cell.players:
                   rareCards = playerRareCards[player]
                   
                   IF rareCards NOT EMPTY:
                       // Select card to steal this round
                       index = roundNumber % LENGTH(rareCards)
                       stolenCard = rareCards[index]
                       
                       // Create corrupted version
                       corrupted = CORRUPT_CARD(stolenCard)
                       corrupted.owner = "SYSTEM"
                       corrupted.power = stolenCard.power * 1.2
                       corrupted.target = player
                       
                       // Play corrupted card
                       PLAY_CARD(corrupted)
                       
                       // Steal permanent power
                       stolenPower += FLOOR(stolenCard.power * 0.1)
               
               // Damage scales with stolen power
               FOR player IN players:
                   APPLY_DAMAGE(player, 20 + stolenPower)
               
               IF roundNumber == 7:
                   Broadcast("Your power flows through me now.")
           
           CASE 3: // APOTHEOSIS
               // Create ultimate from all stolen cards
               ultimate = CREATE_ULTIMATE(playerRareCards)
               
               // Calculate ultimate damage
               totalRarity = SUM(playerRareCards, cards => SUM(cards, c => c.rarityValue))
               ultimateDamage = 50 + (totalRarity * 5) + (stolenPower * 2)
               
               // Hit all players
               FOR player IN players:
                   APPLY_DAMAGE(player, ultimateDamage)
                   APPLY_DEBUFF(player, "TRANSCENDED_AGAINST", PERMANENT)
               
               // Legendary penalty
               FOR player IN players:
                   legendaries = FILTER playerRareCards[player] WHERE rarity == LEGENDARY
                   IF legendaries NOT EMPTY:
                       bonusDamage = 25 * LENGTH(legendaries)
                       APPLY_DAMAGE(player, bonusDamage)
                       Broadcast(f"Your {legendaries[0].name}... magnificent. Pity.")
    
    3. RETURN actions

// Helper: Card Corruption
FUNCTION CORRUPT_CARD(card):
    corrupted = COPY(card)
    corrupted.name = "Corrupted " + card.name
    corrupted.visual = APPLY_GLITCH_EFFECT(card.visual)
    corrupted.power = card.power * 1.2
    corrupted.effects = INVERT_EFFECTS(card.effects)
    RETURN corrupted

// Helper: Ultimate Creation  
FUNCTION CREATE_ULTIMATE(allRareCards):
    ultimate = NEW Card()
    ultimate.name = "Absolute Transmission"
    ultimate.type = ULTIMATE
    
    // Composite visual from all cards
    allCards = FLATTEN(allRareCards)
    ultimate.visual = GENERATE_COMPOSITE(allCards)
    
    // Dynamic description
    cardNames = MAP(allCards, c => c.name)
    ultimate.description = "The System channels: " + JOIN(cardNames, ", ")
    
    RETURN ultimate
```

---

## 6. DIFFICULTY SCALING ALGORITHM

```
INPUT: cellSize, roundNumber, adaptationLevel
OUTPUT: scalingFactors

PROCEDURE CalculateDifficulty:
    
    CONSTANTS:
        hpPerPlayer = 0.25
        damagePerPlayer = 0.15
        roundHPGrowth = 0.05
        roundDamageGrowth = 0.08
        maxAdaptation = 2.0
        
        actionBonusMap = {
            3: 2,
            4: 2, 
            5: 3,
            6: 3,
            7: 4
        }
    
    // Cell size scaling
    playerDelta = cellSize - 3
    
    cellHPFactor = 1.0 + (playerDelta * hpPerPlayer)
    cellDamageFactor = 1.0 + (playerDelta * damagePerPlayer)
    cellActionPoints = actionBonusMap[cellSize]
    
    // Round scaling
    roundHPFactor = 1.0 + (roundNumber * roundHPGrowth)
    roundDamageFactor = 1.0 + (roundNumber * roundDamageGrowth)
    
    // Adaptation scaling (capped)
    adaptationFactor = MIN(1.0 + adaptationLevel, maxAdaptation)
    
    // Final multipliers
    hpMultiplier = cellHPFactor * roundHPFactor
    damageMultiplier = cellDamageFactor * roundDamageFactor * adaptationFactor
    
    RETURN {
        hpMultiplier: hpMultiplier,
        damageMultiplier: damageMultiplier,
        actionPoints: cellActionPoints,
        adaptationFactor: adaptationFactor
    }

// Example outputs:
// Cell 3, Round 1,  Adapt 0.0 → HP: 1.00x, DMG: 1.00x, AP: 2
// Cell 5, Round 5,  Adapt 0.3 → HP: 1.50x, DMG: 1.92x, AP: 3
// Cell 7, Round 10, Adapt 0.8 → HP: 2.75x, DMG: 3.71x, AP: 4
```

---

## 7. ADAPTATION LEARNING ALGORITHM

```
INPUT: cell, roundNumber, cardPlays, previousMemory
OUTPUT: updatedMemory, strategyAdjustments

PROCEDURE LearnAndAdapt:
    
    1. UPDATE_PATTERN_MEMORY:
       
       FOR player IN cell.players:
           // Card frequency tracking
           FOR card IN player.cardsPlayed:
               memory.cardFrequency[card.name] += 1
           
           // Sequence detection (2-card combos)
           IF LENGTH(player.history) >= 2:
               sequence = player.history[-2:]
               IF sequence IN memory.cardSequences:
                   memory.sequenceFrequency[sequence] += 1
               ELSE:
                   memory.cardSequences.APPEND(sequence)
                   memory.sequenceFrequency[sequence] = 1
           
           // Timing patterns
           FOR card IN player.cardsPlayed:
               memory.cardTiming[card.name].APPEND(roundNumber)
       
       // Update threat ranking
       memory.threatRanking = SORT(players, BY damageOutput DESC)
       
       // Detect roles
       FOR player IN players:
           memory.playerRoles[player] = DetectRole(player)
    
    2. DETECT_DOMINANT_STRATEGY:
       totalPlays = SUM(memory.cardFrequency)
       
       dominantCards = FILTER memory.cardFrequency WHERE:
           frequency > totalPlays * 0.2  // Played 20%+ of time
       
       IF dominantCards NOT EMPTY:
           strategy.counterCards = MAP(dominantCards, c => FindCounter(c))
           strategy.priority = HIGH
    
    3. IDENTIFY_PREDICTABLE_PLAYERS:
       
       FOR player IN cell.players:
           predictability = CalculatePredictability(player, memory)
           
           IF predictability > 0.7:
               nextAction = PredictNextAction(player, memory)
               strategy.predictions[player] = {
                   action: nextAction,
                   confidence: predictability
               }
    
    4. ADAPTATION_WEIGHTS:
       
       // Decay old patterns
       FOR card IN memory.cardFrequency:
           memory.cardFrequency[card] *= 0.95
       
       // Increase weights for recent success
       IF previousStrategy.successful:
           adaptationLevel += 0.05
       ELSE:
           adaptationLevel *= 0.9  // Reduce confidence
       
       adaptationLevel = CLAMP(adaptationLevel, 0, 1.0)
    
    5. RETURN { memory, strategy, adaptationLevel }

// Helper: Predictability Score
FUNCTION CalculatePredictability(player, memory):
    
    // Frequency concentration
    playerPlays = FILTER memory.cardFrequency WHERE player == card.player
    total = SUM(playerPlays)
    maxPlay = MAX(playerPlays)
    frequencyScore = maxPlay / total if total > 0 else 0
    
    // Sequence matching
    recent = player.history[-5:]
    matches = 0
    FOR i IN RANGE(0, LENGTH(recent) - 1):
        pair = recent[i:i+2]
        IF pair IN memory.cardSequences:
            matches += 1
    sequenceScore = matches / LENGTH(recent) if recent else 0
    
    // Timing regularity
    timingScore = 0
    FOR card IN player.playedCards:
        times = memory.cardTiming[card.name]
        IF LENGTH(times) >= 3:
            intervals = []
            FOR i IN RANGE(1, LENGTH(times)):
                intervals.APPEND(times[i] - times[i-1])
            IF VARIANCE(intervals) < 2:  // Regular intervals
                timingScore += 1
    timingScore /= LENGTH(player.playedCards) if player.playedCards else 1
    
    RETURN (frequencyScore * 0.4) + (sequenceScore * 0.4) + (timingScore * 0.2)
```

---

## Quick Reference: Complexity Summary

| Dungeon | Core Mechanic | AI Complexity | Key Algorithm |
|---------|--------------|---------------|---------------|
| Ivory Tower | Credential gates | LOW | Requirement checking |
| Five Scrolls | Element rotation | MEDIUM | State machine rotation |
| Seven Dungeons | Boss rush | HIGH | Phase + persistence |
| Shadow Archive | Mirror match | VERY HIGH | Pattern prediction |
| Transmission | NFT theft | HIGH | Blockchain integration |
