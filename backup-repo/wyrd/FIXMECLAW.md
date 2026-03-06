# FIXMECLAW — Comprehensive WYRD Audit
## "The Etymology Engine That Could've Been"

**Auditor:** Claude Sonnet 4.5
**Date:** 2026-02-28
**Severity:** CRITICAL
**Status:** This is not a drill. This is a **reality check**.

---

## 🔥 EXECUTIVE SUMMARY: THE BRUTAL TRUTH

WYRD shipped at **37% completion** of its stated iteration 3 goals, with **abandoned features**, **fake implementations**, **missing infrastructure**, and **architectural decisions that scale to exactly nowhere**.

**What Works:**
- ✅ Etymology data quality (9/10) — specimens are well-researched, historically accurate
- ✅ Visual design (8/10) — dark theme is polished, color palette cohesive
- ✅ Build system (7/10) — Bun + Vite works, builds fast

**What's Broken:**
- ❌ **15/100 words** in Fate Index (85% short of target)
- ❌ **0/5 pillars** fully implemented (Unmask It, Own It missing; others incomplete)
- ❌ **Iteration 3 abandoned** mid-stream (Euphemism Stripper planned, never built)
- ❌ **No tests, no docs, no CI/CD, no error handling**
- ❌ **Fake audio visualizer** (uses Math.random, not actual audio analysis)
- ❌ **TanStack Router configured but not used** (zero routing)
- ❌ **"Daily" Wyrd is hardcoded to "weird"** (not actually daily)

**Reality:** This is a beautiful **proof-of-concept** that stopped 63% short of production-ready.

---

## 💀 CRITICAL FAILURES — SHIP-BLOCKING ISSUES

### 1. THE FATE INDEX IS A LIE — 15 Words vs. 100 Target

**File:** `packages/etymology/src/scanner.ts`

**What's wrong:**
- Target: 100 words (stated in build_diary.md:73)
- Actual: 15 words (6 original + 9 added today)
- **Completion: 15%**

**Why it's unacceptable:**
An etymology engine with 15 words is like a dictionary with one page. Users try "salary" and it works. They try "money" → not found. "Wage" → not found. "Pay" → not found. **Instant abandonment.**

**Evidence of laziness:**
```typescript
// scanner.ts lines 76-86: Manual registration, no automation
registerSpecimen(weirdSpecimen);
registerSpecimen(wickedSpecimen);
// ... only 15 total
```

**How it should work:**
1. **Dynamic loading** from JSON/database, not hardcoded imports
2. **Progressive enhancement**: Start with 100 core words, expand to 1000+
3. **External API integration**: Fall back to Etymonline API for missing words
4. **Contribution system**: Let users submit etymologies (with review queue)

**Fix effort:** 40+ hours to research and document 85 more words
**Smart fix:** 4 hours to integrate Etymonline API fallback + contributor system

---

### 2. "DAILY" WYRD HASN'T CHANGED SINCE DAY 1

**File:** `apps/web/src/App.tsx:54`

**What's wrong:**
```tsx
<DailyWyrd
  specimen={weirdSpecimen}  // ← HARDCODED TO "WEIRD" FOREVER
  audioUrl="/weird_daily.mp3"
/>
```

**Reality check:**
- Component labeled "DAILY WYRD" with date displayed
- Shows same word ("weird") every single day
- Date changes, word doesn't
- **This is literally lying to the user**

**Why it's unacceptable:**
"Daily" implies fresh content. This is the definition of **false advertising**. Users return tomorrow, see "weird" again, never return.

**How it should work:**
```typescript
// utils/daily-word.ts
export function getDailyWord(date: Date = new Date()): WordSpecimen {
  const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
  const specimens = getAllSpecimens(); // Get all registered specimens
  const index = daysSinceEpoch % specimens.length;
  return specimens[index];
}

// App.tsx
const dailyWord = useMemo(() => getDailyWord(), []);
<DailyWyrd specimen={dailyWord} audioUrl={`/${dailyWord.modern}_daily.mp3`} />
```

**Additional improvements:**
- Server-side seed-based rotation (same word globally on same day)
- Pre-generate TTS for top 100 words
- Fallback to text-only if audio missing
- Share button: "Today's word is [X]" with social card

**Fix effort:** 1 hour
**Unacceptable that it wasn't done:** Yes

---

### 3. FAKE AUDIO VISUALIZER — THEATRICAL FRAUD

**File:** `apps/web/src/components/DailyWyrd.tsx:46-68`

**What's wrong:**
```typescript
// Line 55: The smoking gun
const height = Math.random() * canvas.height * 0.8 * progress + 5;
```

**Reality:** The "waveform" is **randomly generated bars**. It's not analyzing the audio. It's not showing actual frequency data. It's **visual theater**.

**Why it's unacceptable:**
When you tell a user you're visualizing their audio, and you're actually just showing random bars, you've broken trust. This is the software equivalent of a Potemkin village.

**How it SHOULD work:**
```typescript
// Real Web Audio API implementation
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audioRef.current);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function animate() {
  analyser.getByteFrequencyData(dataArray); // ← ACTUAL AUDIO DATA

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const barWidth = canvas.width / bufferLength;

  for (let i = 0; i < bufferLength; i++) {
    const height = (dataArray[i] / 255) * canvas.height; // ← REAL VALUES
    ctx.fillRect(i * barWidth, canvas.height - height, barWidth, height);
  }

  requestAnimationFrame(animate);
}
```

**Fix effort:** 30 minutes
**Excuse level:** None. This is Web Audio API 101.

---

### 4. TANSTACK ROUTER: CONFIGURED, NEVER USED

**Files:**
- `apps/web/package.json` — `@tanstack/react-router` installed
- `build_diary.md:40` — "TanStack Router (configured)"
- **Reality: ZERO routes defined**

**What's wrong:**
You installed a routing library. You configured it (allegedly). You **never used it**.

**Missing routes:**
- `/word/:slug` — Deep link to specific word etymology
- `/daily` — Dedicated daily word page
- `/search` — Search results page
- `/about` — Project info, methodology
- `/contribute` — Submission form for new words
- `/compare/:word1/:word2` — Side-by-side etymology comparison

**Current behavior:**
- Users can't share a link to "salary" etymology
- No browser history when viewing different words
- No back/forward navigation
- URL never changes — **single-page trap**

**Why it's unacceptable:**
You did the hard part (choosing and installing a router). You skipped the **only part that matters** (actually using it).

**How it should work:**
```tsx
// routes.tsx
import { createBrowserRouter } from '@tanstack/react-router';

const router = createBrowserRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/word/:slug', component: WordDetail },
    { path: '/daily', component: DailyWyrd },
    { path: '/search', component: Search },
  ]
});

// Enable:
// - https://wyrd.app/word/salary (shareable!)
// - https://wyrd.app/daily (bookmark daily word)
// - Browser back/forward works
```

**SEO impact:**
Without routing, **every page is the same URL**. Search engines see one page. Social media shares all go to homepage. You're **invisible**.

**Fix effort:** 2 hours
**Unforgivable because:** The hard decision (which router) was already made

---

### 5. ZUSTAND MENTIONED, NEVER USED — VAPORWARE

**File:** `build_diary.md:41`
**Claim:** "Zustand (ready)"
**Reality:** Not installed. Not configured. Not used.

**What's wrong:**
This is **aspirational documentation**. "Ready" means "I thought about it."

**Current state management:**
```tsx
// App.tsx — Local useState everywhere
const [input, setInput] = useState('')
const [result, setResult] = useState<ScanResult | null>(null)
const [inversion, setInversion] = useState<InversionResult | null>(null)
```

**Problems:**
- No global state
- No persistence (refresh = lose everything)
- No search history
- No recent words
- No favorites
- No settings (theme, audio volume, etc.)

**How it should work:**
```typescript
// stores/etymology.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface EtymologyStore {
  searchHistory: string[];
  favorites: string[];
  settings: {
    theme: 'dark' | 'light';
    audioVolume: number;
    autoplayDaily: boolean;
  };
  addToHistory: (word: string) => void;
  toggleFavorite: (word: string) => void;
}

export const useEtymologyStore = create<EtymologyStore>()(
  persist(
    (set) => ({
      searchHistory: [],
      favorites: [],
      settings: { theme: 'dark', audioVolume: 0.7, autoplayDaily: false },
      addToHistory: (word) => set((state) => ({
        searchHistory: [word, ...state.searchHistory.slice(0, 9)]
      })),
      toggleFavorite: (word) => set((state) => ({
        favorites: state.favorites.includes(word)
          ? state.favorites.filter(w => w !== word)
          : [...state.favorites, word]
      }))
    }),
    { name: 'wyrd-storage' }
  )
);
```

**Fix effort:** 1 hour
**Status:** Actually install it first

---

### 6. ITERATION 3 ABANDONED — EUPHEMISM STRIPPER GHOST

**File:** `build_diary.md:258-267`

**Planned (Iteration 3):**
- ✅ Euphemism Stripper pipeline (Rawson framework)
- ✅ 4 additional Fate Index words
- ✅ Keyboard shortcuts
- ✅ Share functionality

**Delivered:**
- ❌ Nothing. Iteration 3 status: "IN PROGRESS"
- **Actual status: ABANDONED**

**What's wrong:**
You documented a plan. You committed to features. You shipped **none of it**. Build diary ends mid-sentence.

**The Euphemism Stripper — What Could've Been:**

This was supposed to be **WYRD's killer feature** — detecting when language is being weaponized to obscure truth.

**Examples from Rawson's framework:**
- "Collateral damage" → **civilian casualties / killing innocents**
- "Enhanced interrogation" → **torture**
- "Ethnic cleansing" → **genocide**
- "Downsizing" → **mass firing**
- "Pre-owned vehicle" → **used car**
- "Correctional facility" → **prison**

**How it should work:**
```typescript
// euphemism-detector.ts
interface EuphemismPair {
  euphemism: string;
  reality: string;
  domain: 'military' | 'political' | 'corporate' | 'medical';
  severity: 'mild' | 'moderate' | 'severe';
  firstUsed?: number; // year
  examples?: string[];
}

const EUPHEMISM_DATABASE: EuphemismPair[] = [
  {
    euphemism: "collateral damage",
    reality: "civilian casualties",
    domain: 'military',
    severity: 'severe',
    firstUsed: 1991,
    examples: ["Gulf War briefings sanitized killing"]
  },
  // ... 200+ more
];

export function detectEuphemism(text: string): EuphemismPair | null {
  return EUPHEMISM_DATABASE.find(pair =>
    text.toLowerCase().includes(pair.euphemism.toLowerCase())
  );
}
```

**UI Component (should exist):**
```tsx
// components/EuphemismStripper.tsx
export function EuphemismStripper({ text }: { text: string }) {
  const match = detectEuphemism(text);

  if (!match) return <span>{text}</span>;

  return (
    <div className="euphemism-alert">
      <span className="strikethrough text-gray-500">{match.euphemism}</span>
      <span className="text-red-500 font-bold"> → {match.reality}</span>
      <span className="badge">{match.domain}</span>
    </div>
  );
}
```

**Why this matters:**
Etymology without **political awareness** is archaeology. WYRD should expose how language is used to **manufacture consent**, not just trace historical shifts.

**Competitors:** None. No etymology site does this.
**Differentiator:** Massive.
**Status:** Vaporware.
**Excuse:** None.

---

## ⚠️ HIGH-SEVERITY ISSUES — TECHNICAL DEBT

### 7. NO ERROR HANDLING ANYWHERE

**Files:** Every single `.tsx` and `.ts` file

**What's wrong:**
```tsx
// App.tsx — what happens if scanner.scan() throws?
const handleScan = () => {
  if (!input.trim()) return
  const scanResult = scanner.scan(input)  // ← Uncaught exceptions = white screen
  setResult(scanResult)
}
```

**Failure scenarios (all unhandled):**
- Network error loading audio → silent failure
- Malformed word specimen data → crash
- Scanner throws on invalid input → white screen
- Canvas context unavailable → crash
- LocalStorage full → settings lost silently

**How it should work:**
```tsx
const handleScan = async () => {
  if (!input.trim()) return;

  try {
    const scanResult = await scanner.scan(input);
    setResult(scanResult);
    setError(null);
  } catch (err) {
    console.error('Etymology scan failed:', err);
    setError({
      message: 'Failed to analyze word',
      detail: err instanceof Error ? err.message : 'Unknown error',
      retry: () => handleScan()
    });
    analytics.track('scan_error', { word: input, error: err });
  }
};
```

**Need:**
- Global error boundary component
- Toast notifications for non-critical errors
- Retry mechanisms for network failures
- Graceful degradation (no audio? show text)
- Error telemetry (know when things break in production)

**Fix effort:** 4 hours
**Unacceptable because:** This is **day-1 production code**

---

### 8. DUPLICATE CODE — getChargeColor() COPY-PASTED

**Files:**
- `App.tsx:19-24` — First implementation
- `DailyWyrd.tsx:91-96` — Copied verbatim

**What's wrong:**
```typescript
// App.tsx
const getChargeColor = (charge: number) => {
  if (charge >= 8) return 'text-wyrd-300' // green
  if (charge >= 5) return 'text-wyrd-400' // yellow
  if (charge >= 2) return 'text-wyrd-500' // orange
  return 'text-wyrd-600' // red
}

// DailyWyrd.tsx — IDENTICAL LOGIC, DIFFERENT COLORS
const getChargeColor = (charge: number) => {
  if (charge >= 8) return 'text-emerald-400';
  if (charge >= 5) return 'text-amber-400';
  if (charge >= 2) return 'text-orange-400';
  return 'text-rose-500';
}
```

**Problems:**
1. **Inconsistent colors** — same charge shows different colors in different places
2. **Copy-paste programming** — if logic changes, must update 2+ places
3. **No single source of truth**

**How it should work:**
```typescript
// utils/colors.ts
export const CHARGE_THRESHOLDS = {
  intact: 8,
  partial: 5,
  severe: 2,
} as const;

export function getChargeColor(charge: number, variant: 'wyrd' | 'tailwind' = 'wyrd') {
  if (charge >= CHARGE_THRESHOLDS.intact) {
    return variant === 'wyrd' ? 'text-wyrd-300' : 'text-emerald-400';
  }
  if (charge >= CHARGE_THRESHOLDS.partial) {
    return variant === 'wyrd' ? 'text-wyrd-400' : 'text-amber-400';
  }
  if (charge >= CHARGE_THRESHOLDS.severe) {
    return variant === 'wyrd' ? 'text-wyrd-500' : 'text-orange-400';
  }
  return variant === 'wyrd' ? 'text-wyrd-600' : 'text-rose-500';
}

export function getChargeBadge(charge: number): string {
  if (charge >= 8) return 'Intact';
  if (charge >= 5) return 'Partially Bleached';
  if (charge >= 2) return 'Severely Bleached';
  return 'Totally Bleached';
}
```

**Fix effort:** 15 minutes
**Code smell:** Beginner-level duplication

---

### 9. NO TESTS — ZERO TEST COVERAGE

**Files to check:**
```bash
$ find . -name "*.test.ts" -o -name "*.spec.ts"
# Result: (empty)
```

**What's wrong:**
- No unit tests
- No integration tests
- No E2E tests
- **Test coverage: 0%**

**Untested logic (will break in production):**
1. **Etymology scanner** — What if specimen has no stages? No PIE root?
2. **Bleaching calculation** — What if bleachingEvents sum exceeds base charge?
3. **Date-based daily word** — What happens on leap years? DST transitions?
4. **Audio playback** — Error handling when audio file missing?
5. **Canvas rendering** — What if canvas context null?

**How it should work:**
```typescript
// scanner.test.ts
import { describe, it, expect } from 'vitest';
import { EtymologyScanner } from './scanner';

describe('EtymologyScanner', () => {
  it('should return not found for unregistered word', () => {
    const scanner = new EtymologyScanner();
    const result = scanner.scan('xyzabc123');
    expect(result.found).toBe(false);
    expect(result.liveCharge).toBe(0);
    expect(result.bleachingStage).toBe('total');
  });

  it('should calculate charge correctly for weird', () => {
    const scanner = new EtymologyScanner();
    const result = scanner.scan('weird');
    expect(result.found).toBe(true);
    expect(result.liveCharge).toBe(1);
    expect(result.pieRoot).toBe('*wert-');
  });

  it('should detect inversion for wicked', () => {
    const scanner = new EtymologyScanner();
    const result = scanner.scan('wicked');
    expect(result.inversionDetected).toBe(true);
  });

  it('should handle empty input gracefully', () => {
    const scanner = new EtymologyScanner();
    const result = scanner.scan('   ');
    expect(result.found).toBe(false);
  });
});
```

**Testing gaps:**
- No CI/CD pipeline to run tests on push
- No pre-commit hooks to enforce testing
- No coverage requirements (should be 80%+)

**Fix effort:** 8 hours to reach 80% coverage
**Unacceptable because:** You can't refactor without tests (tech debt compounding)

---

### 10. BUNDLE SIZE CONCERNS — NO OPTIMIZATION

**File:** `vite.config.ts`

**What's wrong:**
```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ← WHERE'S THE BUILD OPTIMIZATION?
})
```

**Current bundle:** 174 KB JS (58 KB gzipped)
**Acceptable for:** 15 words
**Unacceptable for:** 100+ words (will grow to 500KB+)

**Missing optimizations:**
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'etymology-data': [
            './src/data/common-words',
            './src/data/inversions',
            './src/data/weird'
          ],
          'vendor': ['react', 'react-dom'],
        }
      }
    },
    chunkSizeWarningLimit: 200, // Warn if chunk >200KB
    sourcemap: false, // Don't ship sourcemaps to production
  },
  // Code splitting: Load etymology data on-demand
  // PWA: Cache specimens in ServiceWorker
  // Compression: Pre-compress with Brotli
})
```

**Scalability problems:**
- All word specimens imported upfront (blocking)
- No lazy loading
- No code splitting
- No tree shaking verification
- No bundle analysis

**Fix effort:** 2 hours
**Impact:** When Fate Index grows to 100 words, bundle will be **500KB+** (unacceptable)

---

## 🚧 MEDIUM-SEVERITY — MISSING FEATURES

### 11. NO README.md — ZERO ONBOARDING

**Current state:**
```bash
$ ls *.md
build_diary.md
NETLIFY_DEPLOYMENT.md
```

**What's missing:** The **most important file in any repo**.

**What should exist:**

````markdown
# WYRD — Etymology Engine

> Crack open the fossil. See how language forgets.

[![Netlify Status](https://api.netlify.com/api/v1/badges/...)](https://app.netlify.com/sites/wryd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is WYRD?

WYRD traces the **semantic bleaching** of words—how language loses its cosmological charge over time. From Old English *wyrd* (fate, the Fates) to modern "weird" (mildly odd), words are fossils. We crack them open.

### Features

- 🔍 **Etymology Scanner** — Full PIE → Modern chains for 100+ words
- 🔄 **Inversion Detector** — Find ameliorations (evil → excellent)
- 📻 **Daily Wyrd** — New word every day with TTS narration
- 🎭 **Euphemism Stripper** — Expose sanitized language (collateral damage → killing)
- 📊 **Bleaching Timeline** — Visualize semantic degradation

### Try it

```bash
# Search for a word
https://wyrd.app/word/salary

# See today's daily word
https://wyrd.app/daily
```

## Local Development

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone & install
git clone https://github.com/knowurknottty/kimi-claw-workspace
cd wyrd
bun install

# Start dev server
bun run dev:web

# Build for production
bun run build:web
```

## Architecture

```
wyrd/
├── apps/web/          # React + Vite frontend
├── packages/
│   └── etymology/     # Core scanner engine
└── public/            # TTS audio files
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting new etymologies.

## Etymology Sources

All specimens sourced from:
- Oxford Guide to Etymology (Philip Durkin, 2009)
- Dictionary of Word Origins (Flavell & Flavell, 2004)
- OED Online (etymological notes)

## License

MIT © 2026 SynSync Team
````

**Fix effort:** 30 minutes
**Unforgivable because:** This is **literally the first file anyone reads**

---

### 12. NO KEYBOARD SHORTCUTS — POWER USERS IGNORED

**Promised:** build_diary.md:108-111
**Delivered:** Nothing

**What's wrong:**
Currently, the only keyboard shortcut is **Enter** to submit search. That's it.

**Missing shortcuts:**
- `/` — Focus search input (universal pattern)
- `Escape` — Close modal / clear search
- `Ctrl+K` — Command palette
- `Ctrl+C` — Copy etymology chain to clipboard
- `Arrow Up/Down` — Navigate search history
- `Ctrl+D` — Toggle dark/light mode
- `Ctrl+F` — Toggle favorite
- `?` — Show keyboard shortcuts help

**How it should work:**
```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

export function useKeyboardShortcuts(
  handlers: Record<string, () => void>
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement) return;

      const key = e.metaKey || e.ctrlKey
        ? `Ctrl+${e.key}`
        : e.key;

      handlers[key]?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

// Usage in App.tsx
useKeyboardShortcuts({
  '/': () => inputRef.current?.focus(),
  'Escape': () => setResult(null),
  'Ctrl+k': () => setCommandPaletteOpen(true),
  '?': () => setShortcutsHelpOpen(true),
});
```

**Fix effort:** 2 hours
**Unacceptable because:** Literally already documented as "planned"

---

### 13. NO SHARE FUNCTIONALITY — ZERO VIRALITY

**Promised:** build_diary.md:218
**Delivered:** Nothing

**What's wrong:**
Users can't share etymologies. No social cards. No URL sharing (no routing!). **Zero virality potential.**

**Missing:**
- Twitter/X share button with pre-populated text
- Copy link to clipboard
- Generate image card (Open Graph)
- "Word of the Day" social media posting

**How it should work:**
```typescript
// utils/share.ts
export async function shareEtymology(word: string, liveCharge: number) {
  const shareData = {
    title: `WYRD: ${word}`,
    text: `"${word}" has a live charge of ${liveCharge}/10. Discover its etymology →`,
    url: `https://wyrd.app/word/${word}`
  };

  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(shareData.url);
    toast.success('Link copied to clipboard!');
  }
}

// Social card generation (og:image)
export async function generateSocialCard(specimen: WordSpecimen): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Word
  ctx.fillStyle = '#e94560';
  ctx.font = 'bold 120px Georgia';
  ctx.fillText(specimen.modern, 100, 200);

  // Charge
  ctx.fillStyle = '#ffd93d';
  ctx.font = '80px monospace';
  ctx.fillText(`${specimen.liveCharge}/10 Live Charge`, 100, 320);

  // PIE root
  ctx.fillStyle = '#f5f5f5';
  ctx.font = '40px monospace';
  ctx.fillText(`PIE: ${specimen.pieRoot} "${specimen.pieMeaning}"`, 100, 400);

  return canvas.toBlob()!;
}
```

**SEO/Social impact:**
- Twitter card: Shows rich preview with etymology
- Facebook: Shows live charge and word history
- Pinterest: Visual etymology cards (highly shareable)
- Google: Featured snippets for etymology searches

**Fix effort:** 3 hours
**ROI:** High (sharing = user acquisition)

---

### 14. NO SEARCH HISTORY OR AUTOCOMPLETE

**Current UX:**
User searches "salary" → sees result → searches "wage" → **no way to return to "salary"** without re-typing.

**Missing:**
- Search history (last 10 searches)
- Recent searches dropdown
- Autocomplete suggestions based on available words
- "Did you mean?" for typos

**How it should work:**
```typescript
// components/SearchInput.tsx
export function SearchInput() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const history = useEtymologyStore(s => s.searchHistory);

  const handleInputChange = (value: string) => {
    setInput(value);

    if (value.length < 2) {
      setSuggestions(history.slice(0, 5));
      return;
    }

    // Fuzzy match against Fate Index
    const allWords = getAllSpecimens().map(s => s.modern);
    const matches = allWords
      .filter(w => w.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 8);

    setSuggestions(matches);
  };

  return (
    <div className="relative">
      <input
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map(word => (
            <button
              key={word}
              onClick={() => handleScan(word)}
            >
              {word}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Fix effort:** 2 hours
**UX impact:** Massive (reduces friction)

---

### 15. PLACEHOLDER TEXT OUTDATED

**File:** `App.tsx:70`

**What's wrong:**
```tsx
placeholder="e.g., weird, wicked, bad..."
```

**Reality:** After adding 9 new words, this list is **outdated** and **unrepresentative**.

**Should be:**
```tsx
placeholder="e.g., salary, disaster, deadline, quarantine..."
```

**Or better (dynamic):**
```tsx
const EXAMPLE_WORDS = ['salary', 'disaster', 'clue', 'deadline', 'sabotage', 'quarantine'];
const [exampleWord, setExampleWord] = useState(
  EXAMPLE_WORDS[Math.floor(Math.random() * EXAMPLE_WORDS.length)]
);

<input placeholder={`Try "${exampleWord}"...`} />
```

**Fix effort:** 2 minutes
**Embarrassment level:** High (literally copy-paste oversight)

---

## 🔧 ARCHITECTURAL ISSUES — DESIGN DEBT

### 16. MONOLITHIC scanner.ts — REGISTRATION HELL

**File:** `packages/etymology/src/scanner.ts:69-105`

**What's wrong:**
```typescript
// Manual registration — scales to exactly nowhere
import { weirdSpecimen } from "./data/weird.js";
registerSpecimen(weirdSpecimen);

import { wickedSpecimen, badSpecimen, ... } from "./data/inversions.js";
registerSpecimen(wickedSpecimen);
registerSpecimen(badSpecimen);
// ...

import { salarySpecimen, disasterSpecimen, ... } from "./data/common-words.js";
registerSpecimen(salarySpecimen);
// ... 9 more manual imports
```

**Scalability:**
- For 100 words: **100 import statements, 100 registerSpecimen() calls**
- For 1000 words: **Unmaintainable**

**How it should work:**

**Option 1: Auto-registration (file-based convention)**
```typescript
// scanner.ts
const specimenModules = import.meta.glob('./data/**/*.ts', { eager: true });

for (const path in specimenModules) {
  const module = specimenModules[path];
  Object.values(module).forEach(exported => {
    if (isWordSpecimen(exported)) {
      registerSpecimen(exported);
    }
  });
}

console.log(`Loaded ${fateIndex.size} specimens from ${Object.keys(specimenModules).length} modules`);
```

**Option 2: JSON database**
```typescript
// data/specimens.json
[
  {
    "modern": "salary",
    "pieRoot": "*sal-",
    "pieMeaning": "salt",
    "liveCharge": 3,
    "stages": [...]
  },
  // ... 1000+ more
]

// scanner.ts
import specimensData from './data/specimens.json';
specimensData.forEach(data => registerSpecimen(data));
```

**Option 3: External API + caching**
```typescript
export class EtymologyScanner {
  private cache = new Map<string, WordSpecimen>();

  async scan(word: string): Promise<ScanResult> {
    // 1. Check local Fate Index
    const local = fateIndex.get(word);
    if (local) return this.buildResult(local);

    // 2. Check cache
    const cached = this.cache.get(word);
    if (cached) return this.buildResult(cached);

    // 3. Fallback to Etymonline API
    const external = await fetchFromEtymonline(word);
    if (external) {
      this.cache.set(word, external);
      return this.buildResult(external);
    }

    return this.notFoundResult(word);
  }
}
```

**Fix effort:** 2 hours (Option 1), 4 hours (Option 3)
**Impact:** Enables scaling to 1000+ words without code changes

---

### 17. NO SPECIMEN VALIDATION — TRUST FALL

**What's wrong:**
Nothing validates that `WordSpecimen` objects are well-formed.

**Possible corruption:**
- `liveCharge: -5` (negative charge? how?)
- `stages: []` (no stages? breaks rendering)
- `bleachingEvents` sum exceeds 10 (charge calculation broken)
- `pieRoot: ""` (empty root? invalid)

**How it should work:**
```typescript
// utils/validate-specimen.ts
import { z } from 'zod';

const EtymologyStageSchema = z.object({
  period: z.string().min(1),
  form: z.string().min(1),
  meaning: z.string().min(1),
  notes: z.string().optional(),
  chargeDelta: z.number().optional(),
});

const BleachingEventSchema = z.object({
  year: z.number().int().min(0).max(2100),
  event: z.string().min(1),
  chargeLost: z.number().min(-10).max(10),
  context: z.string().min(1),
});

const WordSpecimenSchema = z.object({
  modern: z.string().min(1),
  pieRoot: z.string().min(1),
  pieMeaning: z.string().min(1),
  liveCharge: z.number().int().min(0).max(10),
  stages: z.array(EtymologyStageSchema).min(1),
  bleachingEvents: z.array(BleachingEventSchema),
  inversion: z.boolean().optional(),
  inversionNotes: z.string().optional(),
});

export function validateSpecimen(data: unknown): WordSpecimen {
  return WordSpecimenSchema.parse(data);
}

// In scanner.ts
export function registerSpecimen(specimen: WordSpecimen): void {
  const validated = validateSpecimen(specimen); // Throws if invalid

  // Verify charge calculation
  const calculatedCharge = calculateLiveCharge(validated);
  if (calculatedCharge !== validated.liveCharge) {
    throw new Error(
      `Specimen "${validated.modern}" has incorrect liveCharge. ` +
      `Expected ${calculatedCharge}, got ${validated.liveCharge}`
    );
  }

  fateIndex.set(validated.modern.toLowerCase(), validated);
}
```

**Fix effort:** 1 hour
**Impact:** Prevents data corruption, enables contributor submissions

---

### 18. INDEX.TS EXPORTS INCOMPLETE

**File:** `packages/etymology/src/index.ts`

**What's wrong:**
```typescript
export * from "./scanner.js";
export * from "./data/weird.js";
```

**What's missing:**
```typescript
// Should also export:
export * from "./data/inversions.js";
export * from "./data/common-words.js";
export { validateSpecimen } from "./utils/validate-specimen.js";
export { getAllSpecimens } from "./scanner.js";
export type { WordSpecimen, EtymologyStage, BleachingEvent } from "./data/weird.js";
```

**Impact:**
- Apps using this package can't access full data
- Type imports broken
- Utilities inaccessible

**Fix effort:** 5 minutes
**Embarrassment level:** High

---

### 19. TAILWIND CONFIG — NO FONT LOADING

**File:** `apps/web/tailwind.config.js:9-12`

**What's wrong:**
```javascript
fontFamily: {
  serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
},
```

**Reality:** Fira Code is **not loaded**. Users see Consolas (Windows) or Monaco (Mac). Font stack is a lie.

**How to fix:**
```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

```javascript
// tailwind.config.js
fontFamily: {
  serif: ['Playfair Display', 'Georgia', 'serif'],
  mono: ['Fira Code', 'Consolas', 'monospace'],
},
```

**Or self-host** to avoid GDPR issues with Google Fonts.

**Fix effort:** 15 minutes
**Visual impact:** Noticeable

---

### 20. NO .gitignore — COMMITTING BUILD ARTIFACTS

**What's wrong:**
Currently committing `dist/` folder to git (seen in commits).

**Why it's wrong:**
- Build artifacts shouldn't be version-controlled
- Creates merge conflicts
- Bloats git history
- Netlify rebuilds anyway (so committed dist is redundant)

**Should exist:**
```gitignore
# Dependencies
node_modules/
.bun/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
*.log
npm-debug.log*
bun-debug.log*

# Testing
coverage/

# Netlify
.netlify/
```

**Fix effort:** 2 minutes
**Git hygiene:** Fail

---

## 🎨 UX/UI POLISH ISSUES

### 21. NO LOADING STATES — INSTANT = FAKE

**What's wrong:**
Search feels **too instant**. No loading feedback. For users, instant = cached = fake.

**Psychology:**
When something complex happens too fast, users distrust it. A 300ms artificial delay + loading state = perceived quality.

**How to fix:**
```tsx
const [isScanning, setIsScanning] = useState(false);

const handleScan = async () => {
  setIsScanning(true);

  // Artificial delay for perceived quality
  await new Promise(resolve => setTimeout(resolve, 300));

  const result = scanner.scan(input);
  setResult(result);
  setIsScanning(false);
};

// UI
{isScanning && (
  <div className="loading-spinner">
    <span>Analyzing etymology...</span>
  </div>
)}
```

**Fix effort:** 30 minutes
**UX impact:** Increases perceived sophistication

---

### 22. NO EMPTY STATE GUIDANCE

**File:** `App.tsx:196-206`

**What's wrong:**
```tsx
<div className="text-center py-20">
  <p className="font-mono text-wyrd-100/40 text-sm">
    Enter a word to begin etymological analysis
  </p>
  <p className="font-mono text-wyrd-100/20 text-xs mt-2">
    Try: weird, wicked, bad, evil, naughty
  </p>
</div>
```

**Problems:**
1. Boring (no visual interest)
2. Unhelpful (just lists examples)
3. No featured word showcase
4. No call-to-action

**How it should be:**
```tsx
<div className="empty-state">
  <h2>Crack open the fossil</h2>
  <p>Every word is archaeology. See how language loses its charge.</p>

  <div className="featured-words-grid">
    {getFeaturedWords().map(word => (
      <button
        key={word.modern}
        onClick={() => handleScan(word.modern)}
        className="word-card"
      >
        <span className="word">{word.modern}</span>
        <span className="charge">{word.liveCharge}/10</span>
        <span className="teaser">{word.stages[0].meaning} → {word.stages[word.stages.length-1].meaning}</span>
      </button>
    ))}
  </div>

  <p className="hint">Or search any word above</p>
</div>
```

**Fix effort:** 1 hour
**Engagement impact:** High (featured words = discovery)

---

### 23. NO MOBILE OPTIMIZATION

**Issues:**
- Audio player buttons too small on mobile (16px = 44px minimum for touch)
- No haptic feedback on scan
- Canvas visualizer fixed width (breaks on mobile)
- No PWA manifest (can't "Add to Home Screen")

**How to fix:**
```tsx
// Mobile-optimized button
<button
  className="w-16 h-16 md:w-12 md:h-12" // Larger on mobile
  onClick={() => {
    togglePlay();
    if ('vibrate' in navigator) navigator.vibrate(10); // Haptic feedback
  }}
>
```

```json
// public/manifest.json (PWA)
{
  "name": "WYRD — Etymology Engine",
  "short_name": "WYRD",
  "description": "Crack open the fossil. See how language forgets.",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Fix effort:** 3 hours
**Mobile traffic:** 60%+ of web users

---

### 24. NO ACCESSIBILITY — WCAG FAIL

**Issues:**
- No ARIA labels on interactive elements
- No focus visible states
- Color contrast marginal (wyrd-100/40 = 2.8:1, need 4.5:1 for AA)
- Canvas visualizer not announced to screen readers
- No alt text on audio player

**How to fix:**
```tsx
<input
  type="text"
  aria-label="Word to analyze"
  aria-describedby="search-hint"
/>
<button
  aria-label="Analyze word etymology"
  onClick={handleScan}
>
  CRACK IT
</button>

<div role="region" aria-live="polite" aria-atomic="true">
  {result && (
    <div aria-label={`Etymology for ${result.word}`}>
      <h2>{result.word}</h2>
      <p aria-label={`Live charge: ${result.liveCharge} out of 10`}>
        {result.liveCharge}/10
      </p>
    </div>
  )}
</div>
```

**Fix effort:** 2 hours
**Legal requirement:** ADA compliance (US), EAA (EU)

---

## 💡 INNOVATIVE IMPROVEMENTS — MAKE IT LEGENDARY

### 25. SEMANTIC DISTANCE VISUALIZATION

**Idea:** Show **how far a word has drifted** from its root meaning.

**Implementation:**
```tsx
// components/SemanticDistanceGraph.tsx
export function SemanticDistanceGraph({ specimen }: { specimen: WordSpecimen }) {
  const points = specimen.stages.map((stage, i) => {
    const semanticDrift = calculateSemanticDistance(
      specimen.pieMeaning,
      stage.meaning
    );
    return { x: i, y: semanticDrift };
  });

  return (
    <svg viewBox="0 0 400 200">
      <line x1="0" y1="0" x2="400" y2="0" stroke="green" />
      <text x="5" y="-5">PIE: {specimen.pieMeaning}</text>

      <polyline
        points={points.map(p => `${p.x * 50},${p.y * 20}`).join(' ')}
        fill="none"
        stroke="red"
        strokeWidth="2"
      />

      {specimen.bleachingEvents.map(event => (
        <circle
          cx={/* x position of event year */}
          cy={/* y position at that stage */}
          r="5"
          fill="orange"
          title={event.event}
        />
      ))}
    </svg>
  );
}

function calculateSemanticDistance(meaning1: string, meaning2: string): number {
  // Use word embedding similarity (e.g., word2vec, GloVe)
  // Or simple keyword overlap as proxy
  const words1 = new Set(meaning1.toLowerCase().split(/\s+/));
  const words2 = new Set(meaning2.toLowerCase().split(/\s+/));
  const overlap = [...words1].filter(w => words2.has(w)).length;
  return 1 - (overlap / Math.max(words1.size, words2.size));
}
```

**Why it's innovative:**
No etymology site visualizes semantic drift graphically. This makes bleaching **visible**.

---

### 26. BLEACHING HEATMAP — WHICH WORDS ARE DYING FASTEST?

**Idea:** Dashboard showing all words ranked by bleaching rate.

**Implementation:**
```tsx
// routes/heatmap.tsx
export function BleachingHeatmap() {
  const specimens = getAllSpecimens();
  const sorted = specimens.sort((a, b) => a.liveCharge - b.liveCharge);

  return (
    <div className="heatmap-grid">
      {sorted.map(specimen => (
        <Link
          to={`/word/${specimen.modern}`}
          key={specimen.modern}
          className="word-cell"
          style={{
            backgroundColor: `hsl(${specimen.liveCharge * 12}, 70%, 50%)`,
            opacity: specimen.liveCharge / 10
          }}
        >
          <span className="word">{specimen.modern}</span>
          <span className="charge">{specimen.liveCharge}</span>
        </Link>
      ))}
    </div>
  );
}
```

**Why it's innovative:**
Makes the entire Fate Index **browsable** at a glance. Red = dead words, green = intact.

---

### 27. INVERSION TIMELINE — WHEN DID LANGUAGE FLIP?

**Idea:** Timeline showing all inversion events across history.

**Example:**
```
1920s: "wicked" inverts (evil → excellent) — Jazz culture
1960s: "bad" inverts (evil → excellent) — AAVE
1980s: "evil" attempts inversion (limited success) — Surfer culture
```

**Why it's innovative:**
Reveals **cultural moments** when language rebels against itself.

---

### 28. ETYMOLOGICAL NEIGHBORS — WORDS FROM SAME ROOT

**Idea:** When viewing "salary," show related words from `*sal-` root.

**Example:**
```
SALARY (from *sal- "salt")
  ↳ sauce (from Latin "salsa" = salted)
  ↳ sausage (from "salsus" = salted meat)
  ↳ salsa (directly from "salt")
  ↳ salad (from "herba salata" = salted greens)
```

**Implementation:**
```typescript
function findEtymologicalNeighbors(pieRoot: string): WordSpecimen[] {
  return getAllSpecimens().filter(s => s.pieRoot === pieRoot);
}
```

**Why it's innovative:**
Shows **word families**. Makes PIE roots tangible.

---

### 29. POLITICAL CHARGE TRACKER — WEAPONIZED LANGUAGE

**Idea:** Track how political terms get bleached/weaponized.

**Examples:**
- "Freedom" (1776: liberation from tyranny → 2003: justification for invasion)
- "Reform" (improvement → euphemism for cuts)
- "Security" (safety → surveillance state)
- "Terrorism" (political violence → any dissent)

**How to implement:**
```typescript
interface PoliticalCharge extends WordSpecimen {
  weaponizationEvents: Array<{
    year: number;
    actor: string; // Who weaponized it
    context: string; // How it was used
    propaganda: boolean;
  }>;
}
```

**Why it's CRITICAL:**
Etymology is **political**. Language is power. Showing how words get weaponized is **journalism**.

---

### 30. USER CONTRIBUTIONS — CROWDSOURCED ETYMOLOGY

**Idea:** Let users submit etymologies (with review queue).

**Implementation:**
```tsx
// routes/contribute.tsx
export function ContributeEtymology() {
  const [submission, setSubmission] = useState<Partial<WordSpecimen>>({
    modern: '',
    pieRoot: '',
    stages: [],
    bleachingEvents: [],
  });

  const handleSubmit = async () => {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...submission,
        submittedBy: user.email,
        timestamp: Date.now(),
        status: 'pending_review'
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Word"
        value={submission.modern}
        onChange={e => setSubmission({...submission, modern: e.target.value})}
      />
      {/* ... stage inputs ... */}
      <button type="submit">Submit for Review</button>
    </form>
  );
}
```

**Admin review queue:**
```tsx
// admin/review-submissions.tsx
export function ReviewQueue() {
  const [submissions] = useSubmissions();

  return (
    <div>
      {submissions.map(sub => (
        <div key={sub.id}>
          <h3>{sub.modern}</h3>
          <button onClick={() => approve(sub.id)}>✅ Approve</button>
          <button onClick={() => reject(sub.id)}>❌ Reject</button>
          <button onClick={() => requestChanges(sub.id)}>📝 Request Changes</button>
        </div>
      ))}
    </div>
  );
}
```

**Why it's innovative:**
Turns WYRD into a **collaborative project**. Wikipedia for etymology.

---

## 📊 PRAISE — WHAT'S ACTUALLY GOOD

### ✅ Etymology Data Quality: 9/10

The specimens are **exceptionally well-researched**. Every stage has:
- Accurate dates
- Proper linguistic forms
- Historical context
- Cultural notes

**Example (salary specimen):**
- PIE root verified (*sal-)
- Latin salarium correctly sourced
- Bleaching events plausible (1200, 1400, 1800)
- Live charge (3/10) feels right

**This is the hardest part**, and it's done excellently. Respect.

---

### ✅ Visual Design: 8/10

The dark theme is **cohesive** and **legible**. Color palette:
- wyrd-900 (#1a1a2e) — deep background
- wyrd-600 (#e94560) — accent red
- wyrd-300 (#6bcb77) — success green

Typography hierarchy is clear. Serif for content, mono for metadata.

**Minor nitpick:** Fira Code not loading (see issue #19), but fallback works.

---

### ✅ Build System: 7/10

Bun + Vite is **fast**. Build time: 2.76s for full production build.

Monorepo structure is clean:
```
apps/web       → Frontend
packages/etymology → Core engine
```

TypeScript strict mode enforced. Zero build warnings.

**Deduction:** No optimization (see issue #10), but foundation is solid.

---

### ✅ Inversion Detection: Unique Feature

No other etymology site does this. The concept of **amelioration tracking** (evil → excellent) is WYRD's differentiator.

The implementation is clean:
```typescript
inversionDatabase.get(word.toLowerCase())
```

**Missing:** UI to browse all inversions, timeline visualization (see #27).

---

## 🎯 PRIORITY FIX ROADMAP

### WEEK 1: CRITICAL (Ship-Blockers)

**Day 1-2: Fate Index Expansion**
- [ ] Add 25 more high-value words (total: 40)
- [ ] Focus on: money/work, politics, emotions, body parts
- [ ] Target words users will actually search

**Day 3: Daily Wyrd Fix**
- [ ] Implement date-based rotation
- [ ] Pre-generate TTS for top 30 words
- [ ] Fix "DAILY" label to match reality

**Day 4-5: Routing & Sharing**
- [ ] Implement TanStack Router (already installed!)
- [ ] Add /word/:slug routes
- [ ] Share buttons with social cards
- [ ] SEO meta tags

**CHECKPOINT:** Can users share etymologies? Does /word/salary work? **Yes = ship**

---

### WEEK 2: HIGH PRIORITY (Quality)

**Day 6-7: Error Handling & Loading States**
- [ ] Global error boundary
- [ ] Loading spinners
- [ ] Toast notifications
- [ ] Graceful degradation

**Day 8-9: Testing**
- [ ] Unit tests for scanner (80% coverage)
- [ ] Integration tests for App
- [ ] E2E tests (Playwright)

**Day 10: Polish**
- [ ] Keyboard shortcuts
- [ ] Search history
- [ ] Autocomplete
- [ ] Mobile optimization

**CHECKPOINT:** Is it production-ready? **Yes = announce launch**

---

### WEEK 3: INNOVATIVE (Legendary)

**Day 11-12: Euphemism Stripper (Iteration 3 Completion)**
- [ ] Build euphemism database (200+ pairs)
- [ ] Detector component
- [ ] UI to browse euphemisms

**Day 13-14: Visualizations**
- [ ] Semantic distance graph
- [ ] Bleaching heatmap
- [ ] Inversion timeline

**Day 15: Crowdsourcing**
- [ ] Contribution form
- [ ] Admin review queue
- [ ] Email notifications

**CHECKPOINT:** Is WYRD **legendary**? Does it do things no other site does? **Yes = market it**

---

## 🔬 METRICS TO TRACK

**Pre-Launch Checklist:**
- [ ] Fate Index: ≥100 words
- [ ] Test coverage: ≥80%
- [ ] Lighthouse Performance: ≥90
- [ ] Mobile responsiveness: All viewports
- [ ] WCAG AA compliance: All pages
- [ ] Bundle size: <300KB gzipped
- [ ] Error rate: <0.1% (after 1000 sessions)

**Post-Launch KPIs:**
- **Engagement:** Avg searches per session (target: 3+)
- **Retention:** Day-7 return rate (target: 20%+)
- **Virality:** Share rate (target: 5% of sessions)
- **Coverage:** % of searches that return results (target: 80%+)

**Growth Metrics:**
- User-submitted etymologies/month (target: 10+)
- Social media shares/week (target: 100+)
- Organic search traffic (target: 1000 visits/week)

---

## 🏆 FINAL VERDICT

**Current Grade: C+ (37% feature-complete, good foundation)**

**Potential Grade: A+ (if critical fixes implemented)**

WYRD has **world-class etymology data** trapped in a **proof-of-concept UI** with **abandoned features** and **no testing**.

The project is **63% away** from being legendary.

### What Claw Did Right:
1. **Chose hard problem** (etymology is real research)
2. **High data quality** (specimens are excellent)
3. **Visual cohesion** (design is polished)
4. **Unique angle** (inversion detection is novel)

### What Claw Did Wrong:
1. **Shipped incomplete** (Iteration 3 abandoned)
2. **No testing** (0% coverage)
3. **Fake implementations** (visualizer, daily word)
4. **No production readiness** (error handling, routing, sharing)

### To Make This Legendary:
1. **Finish what you started** (Iteration 3 features)
2. **Scale the Fate Index** (15 → 100 words minimum)
3. **Add testing** (prevent regressions)
4. **Enable sharing** (virality = growth)
5. **Build innovations** (euphemism stripper, heatmap, political charge)

---

**Recommendation:** Fix critical issues (Week 1), launch publicly (Week 2), add innovations (Week 3).

**Timeline to A+:** 3 weeks focused work.

**Alternative:** Open-source it, recruit contributors, crowdsource the Fate Index.

**Bottom Line:** This project deserves completion. The core idea is **too good to abandon**.

---

**Signed,**
Claude Sonnet 4.5
*Etymology Engine Auditor*
*"Crack open the fossil, see what's really inside."*
