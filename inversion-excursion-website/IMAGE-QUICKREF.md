# Image Strategy Quick Reference

## Generate Images in This Order

### 🔴 CRITICAL - Week 1
| # | Image | Prompt Location | Dimensions | Platform |
|---|-------|-----------------|------------|----------|
| 1 | Homepage Hero | image-prompts.md > Hero Images > #1 | 1920×1080 | Midjourney/DALL-E |
| 2 | Chapter 1 Hero | image-prompts.md > Hero Images > #2 | 1920×1080 | Midjourney |
| 3 | The Pedant | image-prompts.md > Dungeon Illustrations > #1 | 1200×1600 | Midjourney |
| 4 | Chapter 2 Hero | image-prompts.md > Hero Images > #3 | 1920×1080 | Midjourney |
| 5 | Chapter 4 Hero | image-prompts.md > Hero Images > #5 | 1920×1080 | Midjourney |
| 6 | Chapter 7 Hero | image-prompts.md > Hero Images > #8 | 1920×1080 | Midjourney |

### 🟠 HIGH - Week 2
| # | Image | Prompt Location | Dimensions |
|---|-------|-----------------|------------|
| 7 | Corporate Golem | Dungeon Illustrations > #2 | 1200×1600 |
| 8 | Polyglot Puppeteer | Dungeon Illustrations > #3 | 1200×1600 |
| 9 | Grand Inquisitor | Dungeon Illustrations > #4 | 1200×1600 |
| 10 | Alchemist of Inertia | Dungeon Illustrations > #5 | 1200×1600 |
| 11 | Earth Scroll | Elemental Scrolls > #1 | 800×1200 |
| 12 | Water Scroll | Elemental Scrolls > #2 | 800×1200 |

### 🟡 MEDIUM - Week 3
| # | Image | Prompt Location | Dimensions |
|---|-------|-----------------|------------|
| 13-17 | Remaining Elemental Scrolls | Elemental Scrolls | 800×1200 |
| 18-27 | Mudrā Visualizations | Mudrā Visualizations | 800×800 |
| 28-33 | Chapter Heroes 3, 5, 6 | Hero Images | 1920×1080 |

### 🟢 LOW - Week 4
| # | Image | Prompt Location |
|---|-------|-----------------|
| 34-36 | Remaining Dungeon Bosses | Dungeon Illustrations |
| 37-40 | Concept Art | Concept Visualizations |

---

## Quick Commands

### Midjourney
```
# Hero image
[prompt] --ar 16:9 --v 6 --style raw --q 2

# Dungeon boss
[prompt] --ar 3:4 --v 6 --style raw --q 2

# Elemental scroll
[prompt] --ar 2:3 --v 6 --style raw --q 2

# Mudrā
[prompt] --ar 1:1 --v 6 --style raw --q 2
```

### Image Optimization
```bash
# Convert to WebP
cwebp -q 85 input.jpg -o output.webp

# Resize for responsive
convert input.jpg -resize 800x output-800.jpg
convert input.jpg -resize 1200x output-1200.jpg
convert input.jpg -resize 1920x output-1920.jpg
```

---

## Style Reminders

**Always Include:**
- Dark fantasy art style
- Deep shadows with golden/amber accent lighting
- Midnight blue and warm gold color palette
- Cinematic composition
- Rich textures

**Never Include:**
- Bright daylight
- Cartoon/anime style
- Modern mundane settings
- Stock photo aesthetic

---

## Alt Text Formula

```
[Subject]—[Context/Location], [Key visual details], [Symbolism/meaning if relevant]
```

Example:
```
The Pedant—boss of the Ivory Tower, a figure fused with bookshelves 
wearing spectacles reflecting infinite text, representing the endpoint 
of credential-chasing.
```

---

*One-page reference - see full documents for details*
