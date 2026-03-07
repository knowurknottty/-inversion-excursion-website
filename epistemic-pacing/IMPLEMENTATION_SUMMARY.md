# Epistemic Pacing System - Implementation Summary

## Overview

The Epistemic Pacing System transforms notification compulsion into player-controlled pacing with reward multipliers. It embodies the principle: **"You don't have to be always-on. You get more for being deliberate."**

---

## Deliverables

### Core Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | System documentation and philosophy | 207 |
| `types.ts` | TypeScript interfaces and constants | 433 |
| `pacing-engine.ts` | Core state management and logic | 542 |
| `index.ts` | Module exports | 22 |
| `components/PacingSelector.tsx` | Rhythm mode selector UI | 334 |
| `components/DeepWorkTimer.tsx` | Active focus session display | 514 |
| `components/ReturnRitual.tsx` | Welcome back reward ceremony | 545 |
| `components/PatienceWallet.tsx` | Spendable patience currency UI | 425 |
| `hooks/usePacing.ts` | Main React hook | 141 |
| `hooks/useDeepWork.ts` | Deep work session hook | 214 |
| **TOTAL** | | **3377** |

---

## Feature Implementation

### ✅ 1. Player-Controlled Notification Rhythm

**Three Mutually Exclusive Modes:**

| Mode | Frequency | Multiplier | Use Case |
|------|-----------|------------|----------|
| **Daily Digest** | Once/day | 1.5× | Minimal interruption, morning ritual |
| **Live Updates** | Real-time (urgent only) | 1.0× | Active investigation mode |
| **Deep Work** | Suspended | 2-5× | Complete focus protection |

**Implementation:**
- `PacingSelector.tsx` - Visual mode selection with clear benefit communication
- `pacing-engine.ts` - `setRhythm()` handles mode transitions and session management
- `types.ts` - Full type definitions for all modes and preferences

### ✅ 2. Reward Bonus for Voluntary Focus Periods

**Deep Work Multiplier Scale:**

| Duration | Multiplier | Unlock |
|----------|------------|--------|
| 4 hours | 1.5× | Focused Mind |
| 8 hours | 2.0× | Subconscious Processing |
| 12 hours | 2.5× | Pattern Recognition Boost |
| 24 hours | 3.5× | Major Revelation Chance |
| 48+ hours | 5.0× | Legendary Insight (cap) |

**Implementation:**
- `DeepWorkTimer.tsx` - Live multiplier preview with progress visualization
- `ReturnRitual.tsx` - Celebratory reveal of accumulated rewards
- `pacing-engine.ts` - `calculateRewardMultiplier()` with full breakdown

### ✅ 3. Patience as Power Mechanic

**Patience Currency System:**
- Earned at 10 patience/hour during Deep Work
- Spendable for expedited actions (bypass wait times)
- Strategic choice: save for multiplier vs. spend for immediate progress

**Spend Options:**

| Option | Cost | Effect | Cooldown |
|--------|------|--------|----------|
| Expedited Release | 50 | Skip FOIA wait once | Weekly |
| Priority Analysis | 30 | AI processes chosen connection first | Daily (2x) |
| Witness Bypass | 40 | Skip interview queue | Per session |
| Document Cache | 75 | Unlock 3 bonus documents | Weekly |

**Implementation:**
- `PatienceWallet.tsx` - Full UI for viewing balance and spending
- `pacing-engine.ts` - `awardPatience()`, `spendPatience()`, transaction history

### ✅ 4. Anti-Compulsion Safeguards

**Built-in Protection:**

1. **Check Loop Prevention**
   - Diminishing returns for sessions < 2 hours apart
   - Gentle warning: "Investigations still processing"

2. **Cooldown System**
   - Minimum 15-minute gaps between live notifications
   - Heat system for rapid requests (affects credibility)

3. **The Pause Button**
   - Deep Work prominently featured, not hidden
   - Framed as power mode, not limitation

4. **Return Ritual**
   - Validates patience with dramatic reveal
   - Never shows "You missed X" - only "Your patience revealed Y"

**Implementation:**
- `pacing-engine.ts` - Session validation and heat tracking
- `ReturnRitual.tsx` - Psychology-informed welcome back experience

---

## UI Component Reference

### PacingSelector
```tsx
<PacingSelector
  currentRhythm="deep-work"
  onChange={(rhythm) => setRhythm(rhythm)}
  disabled={false}
/>
```

### DeepWorkTimer
```tsx
<DeepWorkTimer
  session={activeSession}
  onEndSession={() => endDeepWork()}
  compact={false}
/>
```

### ReturnRitual
```tsx
<ReturnRitual
  rewards={accumulatedRewards}
  onComplete={() => dismissRitual()}
  playerName="Investigator"
/>
```

### PatienceWallet
```tsx
<PatienceWallet
  wallet={patienceWallet}
  options={spendOptions}
  onSpend={(optionId) => spendPatience(optionId)}
  compact={false}
/>
```

---

## React Hooks Reference

### usePacing
```tsx
const {
  rhythm,
  setRhythm,
  isInDeepWork,
  startDeepWork,
  endDeepWork,
  projectedMultiplier,
  patience,
  updatePreferences,
} = usePacing({
  persistKey: 'epistemic-pacing-state',
  onEvent: (event) => console.log(event),
});
```

### useDeepWork
```tsx
const {
  isActive,
  durationText,
  currentMultiplier,
  nextMultiplier,
  progressToNext,
  achievedUnlocks,
  start,
  end,
} = useDeepWork({
  onStart: (session) => analytics.track('deep_work_start'),
  onEnd: (session) => analytics.track('deep_work_end'),
});
```

---

## Integration Example

```tsx
import { usePacing, PacingSelector, DeepWorkTimer, ReturnRitual } from './epistemic-pacing';

function App() {
  const { rhythm, setRhythm, deepWork, patience, isInDeepWork } = usePacing({
    persistKey: 'game-pacing',
  });

  return (
    <div>
      <PacingSelector
        currentRhythm={rhythm}
        onChange={setRhythm}
      />

      {isInDeepWork && (
        <DeepWorkTimer
          session={deepWork.activeSession}
          onEndSession={() => setRhythm('daily-digest')}
        />
      )}

      <PatienceWallet
        wallet={patience}
        options={engine.getPatienceSpendOptions()}
        onSpend={(id) => engine.spendPatience(cost, id)}
        compact
      />
    </div>
  );
}
```

---

## Design Philosophy Applied

### From Research on Addiction Mechanics

The implementation inverts standard F2P addiction patterns:

| Addiction Pattern | Epistemic Pacing Inversion |
|-------------------|---------------------------|
| Variable reward schedules | Predictable, earned rewards |
| Fear of missing out | Joy of returning |
| Compulsion loops | Intentional pacing |
| Continuous engagement | Respected absence |
| Pavlovian notifications | Player-controlled rhythm |

### From Psychological Safety Research

- **Autonomy:** Player chooses when to be interrupted
- **Competence:** Clear feedback on multiplier progression
- **Relatedness:** "AI Assistant" narrative frame for discoveries

### From Flow State Research

- Deep Work Mode creates conditions for flow
- No interruptions during focus periods
- Return rewards validate the focused effort

---

## Success Metrics to Track

| Metric | Target | Implementation |
|--------|--------|----------------|
| Deep Work adoption | >40% try at least once | `deepWork.sessionHistory.length > 0` |
| Avg Deep Work duration | 8-16 hours | Average of completed sessions |
| Return satisfaction | >4.2/5 | Post-ritual survey |
| Compulsive check rate | <20% | Sessions < 3 min within 2hr window |
| Patience spending rate | 30-50% earned | `lifetimeSpent / lifetimeEarned` |

---

## Next Phase Suggestions

1. **Social Pacing** - Sync deep work with investigation partners
2. **Seasonal Events** - Special multipliers during lore events
3. **Advanced Scheduling** - Auto-enter deep work during calendar conflicts
4. **Analytics Dashboard** - Player insights into their own patterns

---

## The Patience Manifesto (In-Game)

> *"This notification system was designed for humans, not engagement metrics.*
> 
> *We will not interrupt your sleep.*  
> *We will not buzz your pocket every 15 minutes.*  
> *We will not create artificial urgency.*
> 
> *Instead, we trust you to choose when you're ready.*  
> *And when you return—deliberate, focused, patient—*  
> *we will reward you with discoveries that rushed investigators never see.*
> 
> *The conspiracy has waited decades. It can wait for you."*

---

**Implementation Status:** ✅ Complete  
**Ready for Integration:** Yes  
**Tests Recommended:** Unit tests for engine, integration tests for UI
