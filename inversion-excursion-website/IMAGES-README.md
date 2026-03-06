# Inversion Excursion - Visual Assets Strategy

## 📁 Deliverables Overview

This directory contains a complete visual asset strategy for the Inversion Excursion website, including AI-ready prompts, accessibility guidelines, and technical specifications.

### 📄 Files Included

| File | Purpose | Size |
|------|---------|------|
| `image-prompts.md` | Complete AI prompt library (60+ prompts) | ~37KB |
| `alt-text-inventory.md` | SEO-optimized alt text for all images | ~15KB |
| `css/images.css` | Responsive image handling styles | ~9KB |
| `images/placeholders/*.svg` | Placeholder graphics | 6 files |

---

## 🎨 Visual Identity

### Core Aesthetic: "Ancient-Futurist Dark Fantasy"

**Artistic References:**
- **Zdzisław Beksiński** - Organic horror, dreamlike textures
- **H.R. Giger** - Biomechanical fusion, dark elegance  
- **Roger Dean** - Surreal landscapes, otherworldly architecture
- **Kay Nielsen** - Art Nouveau fantasy, intricate linework
- **Moebius** - Clean lines, cosmic scope

### Color Palette

```css
--color-bg: #0a0a0f;           /* Deep Void - Primary background */
--color-bg-secondary: #12121a;  /* Midnight Blue - Secondary */
--color-accent: #c9a227;        /* Aged Parchment - Gold accent */
--color-accent-secondary: #8b6914; /* Ember Glow */
--color-text: #e8e8ec;          /* Spirit White */
```

---

## 📸 Image Categories

### 1. Hero Images (8 total)
- Homepage hero
- 7 Chapter headers
- **Aspect:** 16:9 (1920×1080px)
- **Priority:** CRITICAL

### 2. Dungeon Illustrations (7 bosses)
- The Pedant (Ivory Tower)
- The Corporate Golem (Mint of Chains)
- The Polyglot Puppeteer (Tower of Babel)
- The Grand Inquisitor (Pharisee Temple)
- The Alchemist of Inertia (Bio-Laboratory)
- The Cryonic Warden (ICE Fortress)
- The Pattern-Maker (Q-Anon Labyrinth)
- **Aspect:** 3:4 portrait (1200×1600px)

### 3. Elemental Scrolls (5 elements)
- Earth (Prithivi)
- Water (Ap)
- Fire (Tejas)
- Air (Vayu)
- Ether (Akasha)
- **Aspect:** 2:3 portrait (800×1200px)

### 4. Mudrā Visualizations (10 techniques)
- Gyan Mudrā
- Dhyāna Mudrā
- Prāṇa Mudrā
- Mahā Mudrā
- Mahā Bandha
- Uḍḍīyana Bandha
- Jālandhara Bandha
- Viparīta Karaṇī
- Khecarī Mudrā
- Vajrolī Mudrā
- **Aspect:** 1:1 square (800×800px)

### 5. Concept Visualizations
- The Nectar Drop (Amṛta)
- The Trivenī (Three Rivers)
- The Biofield
- The SynSync Circle
- **Aspect:** Variable

---

## 🤖 AI Generation Guide

### Platform-Specific Tips

#### Midjourney v6
```bash
# Add to every prompt:
--ar 16:9 --v 6 --style raw --q 2

# For portraits:
--ar 3:4 --v 6 --style raw

# Key flags:
--style raw        # More literal interpretation
--q 2              # Maximum quality
--no [item]        # Negative prompt
```

#### DALL-E 3
- Be explicit about composition ("wide shot", "close-up", "profile")
- Specify lighting ("volumetric", "rim light", "internal glow")
- Include mood descriptors ("mysterious", "transcendent", "oppressive")

#### Stable Diffusion XL
```
# Quality tags (add to start):
masterpiece, best quality, 8k uhd

# Recommended settings:
CFG: 7-8
Sampler: DPM++ 2M Karras
Steps: 40
Hi-res fix: 0.5 denoise
```

---

## 📐 Technical Specifications

| Usage | Dimensions | Format | Max Size |
|-------|------------|--------|----------|
| Hero Images | 1920×1080px | WebP/JPEG | 300KB |
| Dungeon Bosses | 1200×1600px | WebP/JPEG | 250KB |
| Elemental Scrolls | 800×1200px | WebP/JPEG | 150KB |
| Mudrā Images | 800×800px | WebP/PNG | 100KB |
| Thumbnails | 400×400px | WebP/JPEG | 50KB |
| Favicon | 32×32px | ICO/PNG | 5KB |

### Responsive Implementation

```html
<picture>
  <source media="(min-width: 1200px)" srcset="image-1920.webp 1920w">
  <source media="(min-width: 768px)" srcset="image-1200.webp 1200w">
  <img src="image-800.webp" 
       alt="Descriptive alt text"
       width="800" height="600"
       loading="lazy"
       decoding="async">
</picture>
```

---

## ♿ Accessibility Guidelines

### Alt Text Best Practices

✅ **Do:**
- Front-load important words
- Be specific ("golden dollar sign eyes" not "scary eyes")
- Include emotional context
- Keep under 150 characters for simple images

❌ **Don't:**
- Start with "Image of..." or "Picture of..."
- Keyword stuff
- Leave informative images without alt

### Examples

```html
<!-- Good -->
<img src="pedant.webp" alt="The Pedant boss—a figure fused with bookshelves wearing spectacles reflecting infinite text">

<!-- Decorative (empty alt) -->
<img src="pattern.svg" alt="">
```

---

## 📅 Implementation Timeline

### Phase 1: Critical (Week 1)
- [ ] Homepage hero
- [ ] All 7 chapter heroes
- [ ] 5 Dungeon boss images
- [ ] Favicon/logo

### Phase 2: Content (Week 2)
- [ ] 5 Elemental scrolls
- [ ] 10 Mudrā visualizations
- [ ] Concept art

### Phase 3: Polish (Week 3)
- [ ] Alt text added
- [ ] Responsive srcset
- [ ] Lazy loading
- [ ] WebP conversion

### Phase 4: Accessibility (Week 4)
- [ ] Screen reader testing
- [ ] Color contrast verification
- [ ] Final audit

---

## 🎯 Priority Order

**Generate These First:**
1. Homepage hero (Inverted Tower)
2. Chapter 1 hero (Ivory Tower)
3. The Pedant boss
4. Chapter 2 hero (Five Scrolls)
5. Chapter 4 hero (Master Keys)
6. Chapter 7 hero (Transmission)

**Generate Next:**
7-11. Remaining dungeon bosses
12-16. Elemental scrolls
17-26. Mudrā visualizations

**Generate Last:**
27+. Concept art, UI elements

---

## 📚 Additional Resources

- [Full Prompt Library](./image-prompts.md)
- [Alt Text Inventory](./alt-text-inventory.md)
- [CSS Styles](./css/images.css)
- [Placeholder SVGs](./images/placeholders/)

---

*Last Updated: 2025-03-06*
*Total Prompts: 60+*
*Platforms: Midjourney v6, DALL-E 3, Stable Diffusion XL*
