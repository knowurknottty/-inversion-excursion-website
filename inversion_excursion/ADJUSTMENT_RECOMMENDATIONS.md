# Adjustment Recommendations
## The Inversion Excursion - Core Set Balance Review

---

## Summary

After comprehensive analysis of the 21-card core set, including power calculations, edge case testing, and cross-comparisons, the following recommendations are made:

| Priority | Count | Action Type |
|----------|-------|-------------|
| CRITICAL | 2 | Immediate adjustment required |
| HIGH | 3 | Adjust before playtesting |
| MEDIUM | 4 | Monitor during playtesting |
| LOW | 5 | Optional polish |
| NONE | 7 | No changes needed |

---

## CRITICAL PRIORITY

### 1. Feeding Frenzy (F-3) - Overpowered

**Current Stats:**
- Attack: 15 + 5 per card discarded (up to 35)
- Curse: Lose 10 HP
- Final Power: 42.7 (highest in set)
- Efficiency: 14.23 (highest in set)

**Problem:**
- Deals up to 35 damage for 3 energy
- Also mills 4 cards total (2 each)
- Self-damage of 10 is insufficient cost
- Outclasses all other Atomic cards

**Recommended Change:**
```
BEFORE:
- Both discard 2, 15 + 5 per card damage
- Curse: Lose 10 HP

AFTER:
- Both discard 2, 10 + 3 per card damage (max 22)
- Curse: Lose 15 HP and skip next draw
```

**New Power Calculation:**
- Base: 10 + 12 = 22
- Tier: 22 × 1.5 = 33.0
- Curse: 15 damage + skip draw = Severity 20
- Final: 33.0 - (20 × 0.7) = **19.0**

**Justification:**
- Brings power in line with other Atomic cards (19-35 range)
- Draw skip makes this a commitment, not a snap play
- Still viable as board clear + mill tool

---

### 2. Primordial Mud (A-1) - Underpowered

**Current Stats:**
- Shield: 10 (decays to 5)
- Curse: Shield decays 5
- Final Power: 4.4 (lowest in set)
- Efficiency: 4.4 (lowest among Physical)

**Problem:**
- Essentially provides 5 temporary HP for 1 energy
- Clay Fist provides 20 damage for same cost
- Shield decay happens before it can be useful

**Recommended Change:**
```
BEFORE:
- Convert 10 damage → 10 shield
- Curse: Shield decays 5 next turn

AFTER:
- Convert 10 damage → 15 shield
- Curse: Shield decays 5 next turn
```

**New Power Calculation:**
- Base: 15
- Tier: 15 × 1.0 = 15.0
- Curse: Decay 5 = Severity 8
- Final: 15.0 - (8 × 0.7) = **9.4**

**Justification:**
- Net 10 shield is competitive with Citation Required's 15 block
- Still temporary, preventing shield stacking
- Makes Alchemist defense viable

---

## HIGH PRIORITY

### 3. Label Gun (ID-1) - Underpowered

**Current Stats:**
- Effect: Next card +1 cost
- Curse: Reveal next draw
- Final Power: 4.4
- Efficiency: 4.4

**Problem:**
- +1 cost is minor tempo loss
- Revealing your draw is significant information cost
- String Attachment (PP-1) provides similar effect with less curse

**Recommended Change:**
```
BEFORE:
- Next opp card +1 cost
- Curse: Reveal next draw name

AFTER:
- Next opp card +1 cost
- Draw 1 card
- Curse: Reveal next draw name
```

**New Power Calculation:**
- Base: 10 (tempo) + 10 (draw) = 20
- Tier: 20 × 1.0 = 20.0
- Curse: Reveal = Severity 8
- Final: 20.0 - (8 × 0.7) = **14.4**

**Justification:**
- Card draw makes this a cantrip (replaces itself)
- Reveal curse is acceptable for cantrip efficiency
- Comparable to Citation Required (12.5 power)

---

### 4. String Attachment (PP-1) - Weak Curse

**Current Stats:**
- Effect: Force discard lowest cost
- Curse: Reveal hand
- Final Power: 6.4

**Problem:**
- Symmetric curse makes this unappealing
- Revealing hand is major downside for minor effect

**Recommended Change:**
```
BEFORE:
- Force discard lowest cost
- Curse: Reveal hand

AFTER:
- Force discard lowest cost
- Curse: Opponent sees your next draw (not full hand)
```

**New Power Calculation:**
- Base: 12
- Tier: 12 × 1.0 = 12.0
- Curse: Reveal 1 card = Severity 6
- Final: 12.0 - (6 × 0.7) = **7.8**

**Justification:**
- Reduces curse severity to match effect power
- Makes this a viable tempo play
- Differentiates from Label Gun (which reveals to opponent)

---

### 5. Mercurial Mood (A-2) - Low Impact

**Current Stats:**
- Effect: Change next frequency
- Curse: 5 damage per change
- Final Power: 8.1
- Efficiency: 4.05 (lowest in set)

**Problem:**
- Utility without immediate board impact
- Damage per change discourages the main use case
- Frequency synergy bonuses not defined in core set

**Recommended Change:**
```
BEFORE:
- Change next frequency to any other
- Curse: 5 damage per change

AFTER:
- Change next frequency to any other
- If resonance created, heal 5 HP
- Curse: 5 damage per change
```

**New Power Calculation:**
- Base: 12 (utility) + 7 (conditional heal) = 19
- Tier: 19 × 1.2 = 22.8
- Curse: 5 damage = Severity 7
- Final: 22.8 - (7 × 0.7) = **17.9**

**Justification:**
- Reward for creating resonance encourages skillful play
- Heal offsets damage if resonance achieved
- Makes this a combo enabler worth building around

---

## MEDIUM PRIORITY

### 6. The Final Footnote (P-3) - Scaling Concern

**Current Stats:**
- Attack: 25, +10 max HP permanent
- Curse: Skip next draw
- Final Power: 42.0

**Observation:**
- Permanent +10 max HP is powerful scaling
- Multiple copies could create excessive HP pools
- Skip draw is severe but only matters short-term

**Recommendation:**
```
OPTION A (Recommended):
- Attack: 25, +10 max HP permanent
- Curse: Skip next draw AND cannot play Atomic cards next turn

OPTION B:
- Attack: 25, +5 max HP permanent (cap at +20 total)
- Curse: Skip next draw
```

**Justification:**
- Option A creates a real deckbuilding constraint
- Option B caps scaling but keeps current play pattern
- Watch for 4x Final Footnote decks in playtesting

---

### 7. Bottomless Appetite (F-2) - Draw Skip Harsh

**Current Stats:**
- Heal: 8 per card discarded
- Curse: Cannot draw next turn
- Final Power: 16.2

**Observation:**
- Draw skip is extremely punishing
- Card is either amazing (heal 40) or terrible (heal 8)
- No middle ground

**Recommendation:**
```
SUGGESTED CHANGE:
- Heal: 6 per card discarded
- Curse: Draw 1 fewer card next turn (not zero)
```

**New Power Calculation:**
- Base: 6 × 3 = 18
- Tier: 18 × 1.2 = 21.6
- Curse: Reduced draw = Severity 12
- Final: 21.6 - (12 × 0.7) = **13.2**

**Justification:**
- More consistent healing (18-30 instead of 8-40)
- Reduced draw is punishing but not game-ending
- Better gameplay experience

---

### 8. Index of Forbidden Knowledge (P-2) - Variance

**Current Stats:**
- Effect: Reveal hand, lock 1 card
- Curse: Discard highest cost
- Final Power: 9.6

**Observation:**
- High variance: amazing vs combo, terrible vs aggro
- Discard curse can be worse than benefit
- Information advantage hard to quantify

**Recommendation:**
```
SUGGESTED CHANGE:
- Effect: Reveal hand, lock 1 card (their choice which to lock)
- Curse: Discard highest cost OR take 5 damage (your choice)
```

**Justification:**
- Gives opponent agency (reduces feel-bad)
- Gives you choice on curse (reduces variance)
- More interactive gameplay

---

### 9. Taxonomic Prison (ID-2) - Information Cost

**Current Stats:**
- Effect: Lock 1 frequency
- Curse: Reveal highest cost card
- Final Power: 11.7

**Observation:**
- Revealing best card is harsh for tempo-negative play
- Effect is already situational

**Recommendation:**
```
SUGGESTED CHANGE:
- Effect: Lock 1 frequency
- Curse: Reveal a random card (not highest cost)
```

**Justification:**
- Reduces curse severity from 9 to 6
- Still reveals information, just less targeted
- Makes this a viable sideboard card

---

## LOW PRIORITY

### 10. Clay Fist (G-1) - Slight Nerf

**Current Stats:**
- Attack: 20 (+5 combo)
- Curse: -1 speed next card
- Final Power: 19.2
- Efficiency: 19.2 (highest in set)

**Observation:**
- Slightly too efficient for a Common
- Sets power bar too high for other Physical cards

**Recommendation:**
```
SUGGESTED CHANGE:
- Attack: 18 (+4 combo)
- Curse: -1 speed next card
```

**New Power:**
- Base: 20
- Tier: 20 × 1.0 = 20.0
- Curse: Severity 4
- Final: 20.0 - 2.8 = **17.2**

**Justification:**
- Still best Physical attacker, but closer to others
- Small adjustment, big impact on relative balance

---

### 11. Animation Scroll (G-2) - Token HP

**Current Stats:**
- Summon: 10 HP, 5 ATK
- Curse: +5 damage taken

**Observation:**
- 10 HP dies too quickly to be meaningful
- Curse makes this risky for minimal benefit

**Recommendation:**
```
SUGGESTED CHANGE:
- Summon: 12 HP, 5 ATK
- Curse: +5 damage taken
```

**Justification:**
- Token survives one more hit
- Still vulnerable to Rebellion Protocol
- Minor buff to Golem strategy

---

### 12. Search Warrant (I-1) - Minor Buff

**Current Stats:**
- Reveal hand, 5 damage
- Curse: Reveal next draw
- Final Power: 10.8

**Observation:**
- 5 damage is minor for the cost
- Reveal curse is symmetric disadvantage

**Recommendation:**
```
SUGGESTED CHANGE:
- Reveal hand, 7 damage
- Curse: Reveal next draw
```

**New Power:**
- Base: 17
- Tier: 17 × 1.0 = 17.0
- Curse: Severity 6
- Final: 17.0 - 4.2 = **12.8**

**Justification:**
- More meaningful chip damage
- Still efficient but not overwhelming

---

### 13. Empty Bowl (F-1) - Heal Value

**Current Stats:**
- Mill 1, Heal 5
- Curse: Self-mill 1
- Final Power: 8.0

**Recommendation:**
```
SUGGESTED CHANGE:
- Mill 1, Heal 7
- Curse: Self-mill 1
```

**New Power:**
- Base: 17
- Tier: 17 × 1.0 = 17.0
- Curse: Severity 10
- Final: 17.0 - 7.0 = **10.0**

**Justification:**
- Heal 7 makes this a real sustain option
- Still symmetric mill (fair)

---

### 14. Confession Extracted (I-2) - Risk/Reward

**Current Stats:**
- Force discard or 15 damage
- Curse: Take 5 damage
- Final Power: 19.1

**Recommendation:**
No change. This card is well-balanced as a signature Inquisitor pressure tool.

---

## NO CHANGES NEEDED

The following cards are well-balanced and require no adjustments:

| Card | Final Power | Efficiency | Verdict |
|------|-------------|------------|---------|
| Citation Required | 12.5 | 12.5 | Balanced |
| Cross-Wire | 21.6 | 7.2 | Balanced |
| Rebellion Protocol | 35.2 | 11.73 | Balanced |
| The Invisible Hand | 11.0 | 5.5 | Balanced |
| Trial By Ordeal | 35.2 | 11.73 | Balanced |
| Philosopher's Stone | 24.8 | 8.27 | Balanced |
| True Name Theft | 19.5 | 6.5 | Balanced |

---

## IMPLEMENTATION ROADMAP

### Phase 1: Critical (Before Playtesting)
1. Adjust Feeding Frenzy (F-3) - reduce damage ceiling, add draw skip
2. Adjust Primordial Mud (A-1) - increase shield to 15

### Phase 2: High Priority (Week 1 of Playtesting)
3. Adjust Label Gun (ID-1) - add card draw
4. Adjust String Attachment (PP-1) - reduce curse
5. Adjust Mercurial Mood (A-2) - add resonance heal

### Phase 3: Medium Priority (Week 2-3)
6. Monitor The Final Footnote (P-3) for scaling abuse
7. Adjust Bottomless Appetite (F-2) - reduce draw skip severity
8. Adjust Index of Forbidden Knowledge (P-2) - reduce variance
9. Adjust Taxonomic Prison (ID-2) - reduce curse

### Phase 4: Polish (Week 4+)
10. Consider Clay Fist (G-1) nerf if Physical is too strong
11. Consider minor buffs to underperformers based on data

---

## BALANCE TARGETS

After all adjustments, target these metrics:

| Metric | Current | Target |
|--------|---------|--------|
| Average Final Power | 17.4 | 16.0-18.0 |
| Power Range | 4.4-42.7 | 8.0-35.0 |
| Average Efficiency | 9.1 | 8.0-10.0 |
| Efficiency Range | 4.05-19.2 | 6.0-17.0 |
| Cards Below 10 Power | 8 | 3-4 |
| Cards Above 30 Power | 4 | 2-3 |

---

## FINAL VERDICT

**The core 21-card set is fundamentally sound.** Only 2 cards require critical adjustment before playtesting. The remaining recommendations are polish and refinement based on edge case analysis.

**Confidence Level: HIGH**

The tier multipliers (1.0x → 1.2x → 1.5x) are working as intended. Curse severity is appropriately scaling with power. No infinite combos or strictly dominant strategies exist.

**Recommended Next Steps:**
1. Implement critical adjustments (F-3, A-1)
2. Begin playtesting with 30-card decks
3. Collect win rate data by dungeon
4. Revisit medium/low priority adjustments after 100+ games
