# Epistemic Pacing System
## Anti-Compulsion Notification Architecture

**Status:** Implementation Complete  
**Version:** 1.0.0  
**Purpose:** Transform notification compulsion into player-controlled pacing with reward multipliers

---

## Core Philosophy

> *"You don't have to be always-on. You get more for being deliberate."*

Traditional notification systems create anxiety and compulsion loops. The Epistemic Pacing System inverts this by making **restraint a power mechanic** and **patience a multiplier**.

### The Design Inversion

| Traditional Design | Epistemic Pacing |
|-------------------|------------------|
| More notifications = More engagement | Less interruption = Deeper insight |
| FOMO-driven opens | Anticipation-driven returns |
| Always-on pressure | Deep work rewarded |
| Pavlovian response | Intentional choice |

---

## System Components

### 1. Notification Rhythm Controls
Three mutually exclusive modes giving players agency over their attention:

#### 🌊 Daily Digest (Default)
- **Frequency:** Once per day at player-chosen time
- **Content:** Accumulated discoveries, pending validations, connection suggestions
- **Interrupt Level:** Minimal - one focused moment of payoff
- **Multiplier:** 1.5x baseline

#### ⚡ Live Updates (Active Investigation)
- **Frequency:** Real-time for urgent discoveries only
- **Content:** Critical breakthroughs, time-sensitive opportunities
- **Interrupt Level:** High - only for meaningful moments
- **Multiplier:** 1.0x baseline (standard pace)

#### 🌑 Deep Work Mode (Suspended)
- **Frequency:** None while active
- **Content:** Notifications accumulate silently
- **Interrupt Level:** Zero - complete focus protection
- **Multiplier:** 2.0x - 5.0x based on duration

### 2. Patience Multiplier System

The longer a player maintains Deep Work Mode, the higher their rewards when they return:

```
Deep Work Duration    Multiplier    Unlock
─────────────────────────────────────────────────
4 hours               1.5x          Focused Mind badge
8 hours               2.0x          Subconscious Processing
12 hours              2.5x          Pattern Recognition Boost
24 hours              3.5x          Major Revelation Chance
48+ hours             5.0x          Legendary Insight (cap)
```

**Important:** Multipliers apply to accumulated rewards upon return, not real-time progress. This ensures players never feel penalized for staying in Deep Work.

### 3. Voluntary Focus Rewards

Players receive escalating bonuses for **choosing** to suspend notifications:

| Focus Period | Reward Type | Description |
|-------------|-------------|-------------|
| 4 hours | +25% insight | Focused analysis bonus |
| 8 hours | Connection hint | AI suggests one potential link |
| 12 hours | Document unlock | Bonus evidence file |
| 24 hours | Pattern fragment | Partial revelation |
| 48+ hours | Deep pattern | Major narrative thread |

### 4. The Patience Power Mechanic

**Patience becomes currency.** Players can "spend" accumulated focus time for:

- **Instant validation** (bypass wait time once per week)
- **Cross-reference priority** (AI processes chosen connection first)
- **Witness priority** (skip queue for interview slots)

**The catch:** Spending patience reduces your multiplier. Strategic choice emerges: save for big multiplier or spend for immediate progress?

---

## Implementation Files

```
epistemic-pacing/
├── README.md                          # This file
├── types.ts                           # Core TypeScript interfaces
├── notification-preferences.ts        # Player preference storage
├── pacing-engine.ts                   # Core pacing logic
├── reward-calculator.ts               # Multiplier calculations
├── deep-work-tracker.ts               # Focus period management
├── notification-queue.ts              # Buffered notification system
├── components/
│   ├── PacingSelector.tsx             # Rhythm mode selector
│   ├── DeepWorkTimer.tsx              # Active focus display
│   ├── NotificationDigest.tsx         # Daily summary view
│   ├── PatienceWallet.tsx             # Spendable patience UI
│   └── ReturnRitual.tsx               # Post-focus welcome screen
└── hooks/
    ├── usePacing.ts                   # React hook for pacing state
    ├── useDeepWork.ts                 # Focus period management
    └── useNotificationPermission.ts   # Browser notification API
```

---

## UI/UX Principles

### 1. The Pause Button
Every notification includes a visible "Enter Deep Work" option. Not hidden in settings - presented as a **feature, not a limitation**.

### 2. The Return Ritual
Coming back from Deep Work feels like opening a gift:
- Dramatic reveal of accumulated discoveries
- Visual celebration of multiplier achieved
- Clear display of what would have been missed vs. gained

### 3. No Penalty Feedback
Players never see "You missed X while away." Instead:  
**"Your patience revealed Y that hasty investigators miss."**

### 4. Progressive Disclosure
- New players: Simple On/Off toggle
- Engaged players: Full three-mode selector
- Advanced players: Patience spending, custom schedules

---

## Anti-Compulsion Safeguards

### 1. Check Loop Prevention
```
if (sessionCount < 2 hours since last) {
  show("Investigations still processing. Returns too frequent reduce insight quality.");
  disable(returnRewards);
}
```

### 2. Notification Cooldowns
Even in Live Updates mode, minimum 15-minute gaps between non-critical notifications.

### 3. The Gentle Nudge
After 3 rapid session opens:  
*"The patterns you're seeking require space to emerge. Consider Deep Work Mode?"*

---

## Success Metrics

| Metric | Target | Why |
|--------|--------|-----|
| Deep Work adoption | >40% enable at least once | Players discover the mechanic |
| Avg Deep Work duration | 8-16 hours | Meaningful focus periods |
| Return satisfaction | >4.2/5 rating | Positive reinforcement |
| Compulsive check rate | <20% of sessions | Anti-compulsion working |
| Notification opt-out | <5% disable all | System respected, not rejected |

---

## Integration Points

### With Between-Session Mechanics
- Deep Work Mode accelerates document decryption during wait times
- Patience multipliers stack with FOIA request tiers
- Accumulated discoveries enhanced by focus duration

### With Battle/Investigation Systems
- Deep Work provides "subconscious processing" hints
- Pattern recognition bonuses during focus periods
- Energy/attention mechanics respect pacing choices

---

## The Patience Manifesto (For Players)

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

**Next Steps:** See implementation files for code integration details.
