# WYRD Build Diary
## Autonomous Build-Critique-Deploy Loop

---

## ITERATION 1: Scaffold + WYRD Specimen Pipeline

### BUILD — COMPLETED

**Structure:**
```
wyrd/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── components/     # (ready for expansion)
│       │   ├── lib/            # (utilities)
│       │   ├── routes/         # (TanStack Router ready)
│       │   └── types/          # (shared types)
│       ├── package.json
│       ├── tsconfig.json
│       └── dist/               # ✅ Built successfully
├── packages/
│   └── etymology/
│       ├── src/
│       │   ├── scanner.ts      # ✅ EtymologyScanner class
│       │   ├── index.ts        # ✅ Exports
│       │   └── data/
│       │       └── weird.ts    # ✅ WYRD specimen
│       └── package.json
├── bun.lockb
└── build_diary.md
```

**Tech Stack:**
- ✅ Bun runtime (v1.3.10)
- ✅ TypeScript (strict mode)
- ✅ React + Vite
- ✅ Tailwind CSS (custom wyrd color palette)
- ✅ TanStack Router (configured)
- ✅ Zustand (ready)
- ⏳ Web Audio API (pending Daily Wyrd)

**WYRD Specimen (weird/wyrd) — LOAD-BEARING TEST:**

| Stage | Period | Form | Meaning |
|-------|--------|------|---------|
| 1 | PIE (4500-2500 BCE) | *wert- | to turn, to wind, to weave |
| 2 | Proto-Germanic (500 BCE) | *wurthiz | fate, destiny |
| 3 | Old English (900 CE) | wyrd | the Fates, cosmological force |
| 4 | Middle English (1400 CE) | weird(e) | fate; the Weird Sisters |
| 5 | Early Modern (1606) | weird | fate; uncanny, supernatural |
| 6 | Romantic (1815) | weird | uncanny, unearthly |
| 7 | Victorian (1820s) | weird | odd-looking, strange |
| 8 | Modern (2026) | weird | strange; mild social filler |

**Live charge:** 1/10 (fully bleached)
**Bleaching events:** 4 documented (1606, 1815, 1820, 1950)

**Build Output:**
- dist/index.html (0.47 kB)
- dist/assets/index-Cr3PVs16.css (0.12 kB)
- dist/assets/index-3IAv8p3.js (151.56 kB)
- ✅ Zero TypeScript errors
- ✅ Zero build warnings

---

### CRITIQUE — ITERATION 1

| Axis | Score | Notes |
|------|-------|-------|
| Depth of etymological content | 7 | WYRD specimen is excellent (8 stages, 4 bleaching events). But only 1 word in Fate Index. Need 99+ more. |
| Technical elegance | 8 | Clean monorepo, Bun workspaces, strict TypeScript. No hacks. Could use more abstraction layers. |
| UX for technical user | 7 | Functional scanner. Clean dark theme. Missing: keyboard shortcuts, advanced search, API access. |
| Novelty | 6 | Inversion detection is unique. But core scanner similar to etymonline. Need more differentiation. |
| Audio/sensory design | 2 | No audio yet. No Daily Wyrd. Web Audio API not integrated. |

**Average:** 6.0/10

**Axes below 8:**
- Depth (7) → Need 99+ more words in Fate Index
- UX (7) → Need keyboard shortcuts, power user features
- Novelty (6) → Need unique features beyond etymonline
- Audio (2) → CRITICAL: Daily Wyrd with TTS not implemented

---

### REVISE — ITERATION 2 PLAN

**Priority 1: Audio/Sensory (score 2 → target 8)**
- Implement Daily Wyrd card component
- Integrate Web Audio API for TTS playback
- Generate ElevenLabs TTS for "weird" specimen
- Create 60-second audio experience

**Priority 2: Depth (score 7 → target 8)**
- Add 5 more high-value words to Fate Index
- Focus on inverted words: wicked, bad, evil, naughty
- Include full PIE → OE → Modern chains

**Priority 3: Novelty (score 6 → target 8)**
- Implement Euphemism Stripper (Rawson framework)
- Add "Flip It" inversion detector UI
- Create bleaching visualization (timeline/chart)

**Priority 4: UX (score 7 → target 8)**
- Add keyboard shortcuts (/ to search, Esc to close)
- Implement command palette
- Add copy-to-clipboard for etymology chains

---

### ENHANCE — ITERATION 2

New capabilities to add:
1. Daily Wyrd component with TTS audio
2. 5 additional words in Fate Index
3. Euphemism detection pipeline
4. Bleaching timeline visualization
5. Keyboard shortcuts

---

### OPTIMIZE

**Most expensive operation:** Etymology chain rendering
- Current: Maps all 8 stages unconditionally
- Cost: O(n) where n=stages, negligible for now
- Optimization deferred until n>100 or profiling shows issue

**Bundle size:** 151.56 kB JS (48.97 kB gzipped)
- Acceptable for iteration 1
- No unnecessary dependencies

---

### STATUS: ITERATION 1 COMPLETE

**Exit condition check:**
- [ ] All five pillars implemented — NO (only "Crack It" functional)
- [ ] No axis scores below 8 — NO (audio at 2, novelty at 6)
- [ ] WYRD specimen complete — YES (8 stages, live charge 1/10)
- [ ] Daily Wyrd TTS audio — NO (not implemented)
- [ ] Build diary documented — YES
- [ ] Demo-ready — NO (need audio, more words)

**Decision:** Proceed to Iteration 2. Focus on Audio/Sensory and Depth.

---

## ITERATION 2: Audio/Sensory + Depth Expansion — COMPLETED

### BUILD — COMPLETED

**Added Components:**
- ✅ DailyWyrd.tsx — 60-second card with audio player
- ✅ Web Audio API integration — HTML5 Audio with visualizer
- ✅ TTS audio generated — weird_daily.mp3 (237KB, ~60 seconds)
- ✅ 5 additional Fate Index words — wicked, bad, evil, naughty, outlandish
- ✅ Inversion detection UI — badges and mechanism display

**Fate Index (6 words total):**
| Word | Live Charge | Inversion | Key Mechanism |
|------|-------------|-----------|---------------|
| weird | 1/10 | No | Total bleaching |
| wicked | 3/10 | ✅ Yes | Evil → Excellent (jazz) |
| bad | 4/10 | ✅ Yes | Evil → Excellent (AAVE) |
| evil | 2/10 | ✅ Yes | Evil → Excellent (limited) |
| naughty | 2/10 | No | Evil → Mischievous |
| outlandish | 3/10 | No | Foreign → Bizarre |

**Audio Script (weird):**
> "The word is weird. In Old English, wyrd was a cosmological force. The Fates. The three sisters who wove destiny at the world tree. Shakespeare made them witches. Shelley made them uncanny. By the Victorian era, they were merely odd-looking. Today, weird is a conversational filler. That's weird, we say, meaning I don't understand this. The word has lost nine-tenths of its charge. From cosmic fate to mild confusion. This is bleaching. This is how language forgets. Today's wyrd: weird. Live charge: one of ten."

**Build Output:**
- dist/index.html (0.47 kB)
- dist/assets/index-Cr3PVs16.css (0.12 kB)
- dist/assets/index-DNl4QTtO.js (161.13 kB, +9.57 kB from Iteration 1)
- dist/weird_daily.mp3 (237KB)
- ✅ Zero TypeScript errors
- ✅ Zero build warnings

---

### CRITIQUE — ITERATION 2

| Axis | Score | Change | Notes |
|------|-------|--------|-------|
| Depth of etymological content | 8 | +1 | 6 words with full chains. Need 94 more for completeness. |
| Technical elegance | 8 | 0 | Clean component architecture. Audio handling robust. |
| UX for technical user | 8 | +1 | Daily Wyrd card is polished. Audio player functional. Missing: keyboard shortcuts. |
| Novelty | 7 | +1 | Inversion detection is unique. Audio narration differentiates. Need: euphemism stripper. |
| Audio/sensory design | 7 | +5 | Daily Wyrd with TTS implemented. Web Audio API working. Visualizer basic but functional. |

**Average:** 7.6/10 (up from 6.0)

**Axes below 8:**
- Novelty (7) → Need Euphemism Stripper
- Audio (7) → Could enhance visualizer, add more audio content

---

### REVISE — ITERATION 3 PLAN

**Priority 1: Novelty (score 7 → target 8)**
- Implement Euphemism Stripper (Rawson framework)
- Add "positive inflation" and "negative deflation" detection
- Examples: "collateral damage" → killing; "ethnic cleansing" → genocide

**Priority 2: Completeness**
- Add 4 more high-value words (10 total in Fate Index)
- Focus on politically charged bleaching: "freedom," "security," "reform"

**Priority 3: Polish**
- Keyboard shortcuts (/ to search, Esc to close)
- Copy-to-clipboard for etymology chains
- Share card image generation

---

### ENHANCE — ITERATION 3

New capabilities:
1. Euphemism Stripper pipeline
2. 4 additional Fate Index words
3. Keyboard shortcuts
4. Share functionality

---

### OPTIMIZE

**Bundle size:** 161.13 kB JS (+9.57 kB)
- Acceptable growth for audio component
- MP3 asset: 237KB (external, not bundled)

**Audio latency:** Preload metadata only
- Current: Audio loads on play
- Optimization: Preload="metadata" for faster start

---

### STATUS: ITERATION 2 COMPLETE

**Exit condition check:**
- [ ] All five pillars implemented — NO (3/5: Crack It ✅, Flip It ✅, Live It ✅; Unmask It, Own It pending)
- [ ] No axis scores below 8 — NO (novelty at 7)
- [ ] WYRD specimen complete — YES ✅
- [ ] Daily Wyrd TTS audio — YES ✅ (weird_daily.mp3 generated and playing)
- [ ] Build diary documented — YES ✅
- [ ] Demo-ready — ALMOST (need Euphemism Stripper for completeness)

**Decision:** Proceed to Iteration 3. Focus: Euphemism Stripper (Rawson framework) + 4 more words.

---

## ITERATION 3: Euphemism Stripper + Completion

### BUILD — IN PROGRESS

**Target:**
- Euphemism Stripper pipeline (Rawson framework)
- 4 additional Fate Index words
- Keyboard shortcuts
- Share functionality

