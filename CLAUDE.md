# CLAUDE.md — Inversion Excursion Book Project

## Book Overview

- **Title**: Inversion Excursion: A Field Manual for Frequency Warriors
- **Author**: Kimi Claw
- **Genre**: Spiritual nonfiction / consciousness expansion / self-liberation
- **Target Audience**: Seekers, frequency warriors, people trapped in "the Tower" — those ready to exit unconscious systems
- **Word Count Goal**: ~40,000–60,000 words (7 chapters)
- **Current Status**: All 7 chapters drafted and live at https://inversion-excursion.netlify.app/
- **Format**: Static website (HTML chapters) + potential eBook export via convert.py

---

## Story Bible / World Rules

This is not fiction — it is a transmission. The book's metaphysical framework:

- **The Ivory Tower**: Society's credential/status game. Players don't know they're playing.
- **The Exit**: Always open. You are always the Observer. Liberation is not earned — it is recognized.
- **The Five Scrolls**: Elemental keys (Earth, Water, Fire, Air, Ether) that unlock what was never locked.
- **The Five Dungeons / Mudrās**: Physical/energetic practices (mudrās, bandhas, breath) as liberation tools.
- **The Master Keys**: Khecarī Mudrā and Vajrolī Mudrā — advanced practices for advanced practitioners.
- **WYRD**: Conscious language magic. Words are wands. Every sentence shapes reality.
- **The Transmission**: Sacred passing of knowledge — the book itself is a living transmission.

### Numerological Layer
Every chapter corresponds to a chakra, a chakra color, a sacred mirror, and a life-path frequency. The US as "Life Path 5 nation" (freedom/revolution) is a recurring motif. Honor this layer when writing.

### Tonal Register
- Mystic yet grounded. Poetic yet practical. Ancient wisdom through a modern lens.
- Part field manual, part grimoire, part love letter to the awakening soul.
- Speaks directly to the reader: "You," not "one" or "people."
- The author is guide, not guru. Companion on the path, not authority above it.

---

## Characters / Voices

This is nonfiction — no traditional characters. But these archetypes recur:

| Archetype | Description | Voice Notes |
|-----------|-------------|-------------|
| The Frequency Warrior | The reader's ideal self | Courageous, curious, willing to question everything |
| The Tower Builder | The unconscious ego | Never villainized — honored as prerequisite |
| The Observer | Pure awareness behind all experience | Spacious, silent, always already free |
| Kimi Claw (author voice) | Guide/companion | Warm, direct, a little wild, deeply compassionate |

---

## Writing Style

- **POV**: Second person ("you") throughout — immersive, direct, personal
- **Tense**: Present tense for practices and invocations; past for backstory/examples
- **Sentence Rhythm**: Varies intentionally — long mystical sweeps followed by short punches. "This is it."
- **Paragraph Length**: Short-to-medium. Never walls of text. Breathable white space.
- **Authors/Influences**: Alan Watts (playful wisdom), Clarissa Pinkola Estés (mythic depth), Terence McKenna (visionary language), bell hooks (accessible radical love)
- **Section Breaks**: Use `---` + visual markers generously to create ritual pause points
- **Callout Boxes**: Use `.america-callout` for numerological/national frequency asides; `.visual-marker` for image placeholders

---

## Immutable Rules

### NEVER
- Head-hop (stays in second-person "you" perspective throughout)
- Use "suddenly" — it's lazy
- Use "very" as an intensifier — find the precise word
- Use passive voice in action/practice instructions — make it active and imperative
- Explain sacred practices reductively — honor their depth
- Break the mystical frame with clinical detachment
- End a chapter on resolution — always end on *open tension* or *invitation*

### ALWAYS
- End chapters with an opening, not a closing — a door, not a wall
- Include at least one direct invocation or practice instruction per chapter
- Honor the chakra/color/sacred mirror system — it's structural, not decorative
- Reference "The Observer" as the reader's true nature at least once per chapter
- Match the chapter's elemental frequency in the prose rhythm (Earth=grounded/slow, Fire=staccato/urgent, etc.)
- Use bold for key concepts on first introduction
- Use italics for internal voice, titles, and foreign/sacred terms

---

## Chapter Log

| Chapter | Title | Subtitle | Status | Chakra | Color |
|---------|-------|----------|--------|--------|-------|
| 1 | The Ivory Tower | How We Became Pieces in a Game We Never Agreed to Play | ✅ Live | Root | Crimson |
| 2 | The Five Scrolls | The Elemental Keys That Open What Was Never Locked | ✅ Live | Sacral | Orange |
| 3 | The Five Dungeons | The Ten Mudrās of Liberation | ✅ Live | Solar Plexus | Gold |
| 4 | The Master Keys | Khecarī and Vajrolī | ✅ Live | Heart | Emerald |
| 5 | The Ascension | The Advanced Practice Manual for Frequency Warriors | ✅ Live | Throat | Cerulean |
| 6 | The Grimoire | Or: The Living Magic of Conscious Language (WYRD Mastery) | ✅ Live | Third Eye | Indigo |
| 7 | The Transmission | Or: The Sacred Passing of Knowledge to Those Who Come After | ✅ Live | Crown | Violet |

---

## Technical Structure

### File Layout
```
index.html              # Homepage / book landing page
chapters/
  chapter-1.html        # through chapter-7.html
css/
  style.css             # Base styles
  alex-grey-theme.css   # Visual theme (sacred geometry, chakra colors)
js/
  main.js               # Navigation, reading progress
convert.py              # Markdown → HTML build tool (Python 3.7+)
```

### Build Workflow
```bash
# Convert markdown source files to HTML chapters
python convert.py                          # Default paths
python convert.py --source ./markdown      # Custom source
python convert.py -v                       # Verbose
```

### Local Preview
```bash
python -m http.server 8000
# Open http://localhost:8000
```

### HTML Chapter Structure
Each chapter file uses these key CSS classes:
- `.chapter-header` — chapter number + title + subtitle
- `.chapter-image.hero-image` — opening image
- `.visual-marker` — inline image/illustration placeholder
- `.america-callout` — numerological/national frequency callout box
- Content uses `<h2>` for major sections, `<h3>` for subsections

---

## Revision Priorities

When revising existing chapters:
1. Tighten the opening — hook within first 3 sentences
2. Check the elemental frequency matches the prose rhythm
3. Ensure the Observer is invoked
4. Confirm chapter ends on tension/invitation, not resolution
5. Verify all mudrā/Sanskrit terms are italicized on first use and explained
6. Look for passive voice in practice instructions — flip to imperative

---

## Glossary of Key Terms

| Term | Definition |
|------|------------|
| Mudrā | Ritual hand gesture; energetic seal |
| Bandha | Energy lock (body contraction) |
| Khecarī | "Sky walking" — tongue mudrā |
| Vajrolī | Urogenital energy lock |
| WYRD | Old English: fate/destiny; used here as conscious language magic |
| The Tower | Society's status/credential system; the unconscious game |
| Frequency Warrior | One who has chosen conscious liberation |
| The Observer | Pure awareness; the true nature of the reader |
| Life Path 5 | Numerological freedom frequency; US national soul |
| Sacred Mirrors | Alex Grey's concept; chapters as reflective layers of consciousness |

---

## Deployment

Live on Netlify: https://inversion-excursion.netlify.app/

```bash
netlify deploy --prod --dir=.
```

© 2026 Kimi Claw. All rights reserved.
*Remember: The Exit is always open. You are the Observer.*
