# RESEARCH VECTOR 7-A: WYRD Context Report
## The Current State of the WYRD Project

**Date:** 2026-03-07  
**Analyst:** Subagent 77c338bd  
**Status:** COMPLETE

---

## 1. WHAT WYRD IS

### Core Definition
WYRD is a **linguistic liberation system** — a web application and methodology for tracing etymologies to reveal how words lose their original meaning over time ("semantic bleaching") and how this bleaching can be used as a doorway to spiritual/conscious awakening.

### The Name
- **Old English** *wyrd* — fate, destiny, that which comes to pass
- **Related:** Old Norse *urðr* (fate) and *verða* (to become)
- **PIE Root:** *wert-* (to turn, to become)
- **Liberation Angle:** Understanding the turning/becoming of language allows one to turn/become their own destiny

### Project Components
1. **WYRD Web App** — React/TypeScript etymology scanner with dark theme
2. **WYRD Methodology** — Four-step system for etymological analysis
3. **Fate Index** — Curated database of word specimens with full PIE→Modern chains
4. **Inversion Detection** — System for identifying words that have flipped meaning (evil→good)
5. **Integration Protocol** — Connection to "Inversion Excursion" spiritual practice

---

## 2. CURRENT MECHANICS AND FEATURES

### The "CRACK IT" Button (The "Gun" Metaphor)
The core interaction is the **"CRACK IT"** button — the user types a word and clicks to "crack it open" like a fossil, revealing its inner etymological structure.

**Current Implementation:**
- Input field for word entry
- "CRACK IT" button triggers etymology scan
- Returns: Live Charge (0-10), Bleaching Stage, Etymology Chain, Inversion Status

### The Four Pillars (Partially Implemented)
Per `FIXMECLAW.md`, five pillars were planned, three are functional:

| Pillar | Status | Description |
|--------|--------|-------------|
| **Crack It** | ✅ Functional | Main scanner — input word, get etymology |
| **Flip It** | ✅ Functional | Inversion detection for ameliorated words |
| **Live It** | ✅ Functional | Daily word with TTS audio |
| **Unmask It** | ❌ Missing | Euphemism stripper (planned Iteration 3, abandoned) |
| **Own It** | ❌ Missing | User contributions/crowdsourcing |

### Fate Index (The Word Database)
**Current State:** ~40 words (target was 100+ per build_diary.md)

**Categories:**
- Common words (salary, disaster, clue, deadline, quarantine...)
- Economic words (money, wage, profit, debt, trade, market...)
- Political words (democracy, republic...)
- Inversions (weird, wicked, bad, evil, naughty...)

### The Live Charge System
Each word has a "Live Charge" from 0-10:
- **10** — Fully alive (original meaning intact)
- **8-9** — Mostly intact
- **5-7** — Partially bleached
- **2-4** — Severely bleached
- **0-1** — Totally bleached (modern usage bears no resemblance to origin)

### Bleaching Stages
1. **Intact** — Original cosmological charge preserved
2. **Partially Bleached** — Some meaning drift
3. **Severely Bleached** — Core meaning lost
4. **Totally Bleached** — Word is empty signifier

---

## 3. THE "GUN" / CRACK MECHANIC

### Primary Interaction Pattern
The "CRACK IT" button is WYRD's central **action mechanic** — it's the trigger that fires the etymology analysis. Like pulling a trigger:

1. **Aim** — User selects a word (types it in)
2. **Charge** — The word has a "Live Charge" (ammo/power level)
3. **Fire/CRACK** — Button press triggers the reveal
4. **Impact** — Etymology chain explodes into view

### Audio Element (Daily Wyrd)
The "Live It" pillar includes TTS audio with a **visualizer** (currently fake — uses Math.random, not actual audio analysis per FIXMECLAW.md). The audio is meant to be a "60-second etymology experience."

---

## 4. EXISTING ENGAGEMENT PATTERNS

### Current User Flow
1. User arrives at site
2. Sees "Daily Wyrd" card (currently hardcoded to "weird", not actually rotating)
3. Types a word into the scanner
4. Clicks "CRACK IT"
5. Views etymology chain, live charge, bleaching status
6. (If applicable) sees inversion analysis

### Planned Engagement (Not Implemented)
From `WYRD_INVERSION_INTEGRATION_PROTOCOL.md`:

**Daily Etymological Scan:**
- Evening practice (10-15 min)
- Recall day's conversations
- Identify 3-5 charged/bleached words used
- WYRD analysis on each
- Conscious redefinition/reclamation

**Spell-Breaking Session (Weekly):**
- Deep-dive on one word
- Full Four Steps of WYRD methodology
- Group practice (3-7 people)
- Create "liberated usage" for reclaimed words

---

## 5. DESIGN GOALS AND CONSTRAINTS

### Design Philosophy
> "WYRD is not about knowing fancy word origins to impress others. It is about **seeing through language**—recognizing how the structure of words shapes the structure of thought, and ultimately, the structure of reality."

### Core Constraints
1. **Privacy-First** — No tracking (per USER.md philosophy)
2. **No API Keys Required** — Runs entirely local/self-hosted
3. **Open Source** — All code and etymologies in commons
4. **Anti-Extraction** — Not for monetization, for liberation

### Target Audience
- Inversion Excursion practitioners
- "Frequency Warriors" (spiritual seekers)
- Language enthusiasts
- People seeking pattern interrupts for reactivity

### Visual Design
- **Dark theme** with custom "wyrd" color palette
- **Typography:** Serif for content (etymologies), Mono for metadata
- **Colors:** 
  - wyrd-900: #1a1a2e (deep background)
  - wyrd-600: #e94560 (accent red)
  - wyrd-300: #6bcb77 (success green)

---

## 6. CURRENT IMPLEMENTATION STATUS

### What Works
✅ Core scanner with ~40 words  
✅ Inversion detection for known flipped words  
✅ Daily Wyrd UI (though word doesn't actually rotate)  
✅ PIE root tracing  
✅ Bleaching stage calculation  
✅ Clean monorepo architecture (Bun + Vite + React)  
✅ Dark theme UI  

### What's Broken/Missing
❌ **"Daily" word is hardcoded** — always shows "weird"  
❌ **Audio visualizer is fake** — uses Math.random, not Web Audio API  
❌ **No routing** — TanStack Router installed but unused  
❌ **Euphemism Stripper** — killer feature abandoned (Iteration 3)  
❌ **No sharing** — can't share etymology results  
❌ **No search history** — can't revisit past scans  
❌ **No tests** — 0% test coverage  
❌ **No keyboard shortcuts** — promised but not delivered  

### Critical Issues (From FIXMECLAW.md)
- **Grade: C+** (37% feature-complete per auditor)
- Fate Index at 40% of target
- No error handling
- No production readiness (CI/CD, SEO, etc.)

---

## 7. INTEGRATION WITH INVERSION EXCURSION

WYRD is designed to integrate with the **Inversion Excursion** book/project:

| Book Component | WYRD Feature |
|----------------|--------------|
| Chapter 2 (Elemental Etymologies) | Sanskrit/PIE root database |
| Chapter 3 (Boss Language) | Euphemism detection (planned) |
| Chapter 6 (WYRD Canon) | Complete methodology |
| Dungeon 3 (Tower of Babel) | Primary WYRD application |
| Protocol #8 | WYRD Stack: 741 Hz + 10 Hz Alpha for linguistic work |

**The Observer State:**
The core spiritual mechanic is that spotting bleached words triggers the "Observer" perspective — stepping back from automatic reactivity into conscious awareness.

---

## 8. KEY METAPHORS AND LANGUAGE

### Primary Metaphors
- **Fossil/Archaeology** — "Crack open the fossil, see what's inside"
- **Bleaching** — Words losing their color/charge over time
- **Inversion** — Words that have flipped meaning (evil→good)
- **Live Charge** — Energy/current meaning of a word
- **Fate** — Old English wyrd = destiny; you choose your linguistic fate

### Taglines
- "Crack open the fossil. See how language forgets."
- "The spell is broken when you see the spell."
- "Language itself has been weaponized against you."

---

## 9. RELEVANCE TO ADDICTION/INVERSION RESEARCH

WYRD provides the **target application** for addiction research:

### How Addiction Mechanics Apply
1. **The CRACK IT button** — Variable reward system (what will this word reveal?)
2. **Live Charge discovery** — Progression/unlocking mechanic
3. **Daily Wyrd** — Habit formation through daily check-in
4. **Fate Index expansion** — Collection/completion drive
5. **Inversion detection** — Novelty/surprise mechanism

### Inversion Opportunities
The project itself could benefit from inverted addiction mechanics:
- **Instead of:** Endless scrolling (extraction)
- **WYRD offers:** Deep single-word contemplation (liberation)
- **Instead of:** Notification spam
- **WYRD offers:** Intentional daily practice
- **Instead of:** Social validation
- **WYRD offers:** Private Observer awakening

---

## 10. SUMMARY FOR ADDICTION RESEARCH CONTEXT

**WYRD is:**
- A web-based etymology scanner ("Crack It" mechanic)
- ~40 words in database (target: 100+)
- Dark-themed, minimalist, focused UX
- Designed for spiritual/conscious awakening through language awareness
- Integrates with Inversion Excursion spiritual practice
- Built on privacy-first, anti-extraction principles

**The "Gun" is:**
The "CRACK IT" button — the trigger that fires the etymology analysis and reveals the word's hidden history. It's the core action that makes the tool engaging.

**Engagement Pattern Target:**
Daily, intentional use (10-15 min) for linguistic self-awareness, not endless scrolling or extraction.

---

*Report Complete — This provides the foundation for contextualizing all addiction/inversion research to the specific WYRD project.*
