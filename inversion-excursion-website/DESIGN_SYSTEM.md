# Inversion Excursion Design System

A comprehensive design system for the Inversion Excursion website, focused on consciousness expansion and reality manipulation themes.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout](#layout)
6. [Components](#components)
7. [Animations & Micro-interactions](#animations--micro-interactions)
8. [Accessibility](#accessibility)
9. [Dark/Light Mode](#darklight-mode)
10. [Browser Support](#browser-support)

---

## Design Philosophy

The Inversion Excursion design system embodies the themes of consciousness expansion and reality manipulation through:

- **Ethereal Elegance**: Deep, cosmic backgrounds with golden accents suggest transcendence
- **Intentional Contrast**: High contrast for readability while maintaining visual comfort
- **Subtle Animations**: Gentle pulse effects and smooth transitions evoke meditation states
- **Structure Within Freedom**: Clear navigation and hierarchy supporting open exploration

### Core Principles

1. **Clarity First**: Content must be readable and accessible
2. **Atmosphere**: Visual elements support the consciousness-expansion theme
3. **Responsiveness**: Seamless experience across all devices
4. **Accessibility**: WCAG 2.1 AA compliance minimum
5. **Performance**: Lightweight, fast-loading styles

---

## Color System

### CSS Custom Properties (Design Tokens)

```css
:root {
  /* Primary Backgrounds */
  --color-bg: #0a0a0f;              /* Deep cosmic black */
  --color-bg-secondary: #12121a;     /* Elevated surfaces */
  --color-bg-tertiary: #1a1a24;      /* Interactive elements */
  --color-bg-elevated: #222230;      /* Cards, modals */
  
  /* Text Colors */
  --color-text: #e8e8ec;             /* Primary text - 14.8:1 contrast */
  --color-text-secondary: #a0a0ac;   /* Secondary text - 7.8:1 contrast */
  --color-text-muted: #808090;       /* Tertiary text - 4.6:1 contrast */
  --color-text-inverse: #0a0a0f;     /* Text on light backgrounds */
  
  /* Accent Colors */
  --color-accent: #c9a227;           /* Gold - wisdom, enlightenment */
  --color-accent-hover: #d4aa2e;     /* Brighter gold for hover */
  --color-accent-secondary: #8b6914; /* Darker gold for depth */
  --color-accent-glow: rgba(201, 162, 39, 0.3);
  
  /* Semantic Colors */
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --color-info: #60a5fa;
  
  /* UI Colors */
  --color-border: #3a3a50;           /* Subtle borders */
  --color-border-hover: #5a5a70;     /* Interactive borders */
  --color-focus: #ffffff;            /* High-contrast focus */
  --color-focus-ring: rgba(201, 162, 39, 0.5);
}
```

### Color Usage Guidelines

| Element | Color Token | Usage |
|---------|-------------|-------|
| Body background | `--color-bg` | Main page background |
| Cards, sidebars | `--color-bg-secondary` | Elevated surfaces |
| Buttons, inputs | `--color-bg-tertiary` | Interactive surfaces |
| Headings | `--color-text` | Primary content |
| Body text | `--color-text-secondary` | Paragraphs, descriptions |
| Captions, metadata | `--color-text-muted` | Less important info |
| Primary actions | `--color-accent` | CTAs, links, highlights |
| Borders | `--color-border` | Subtle separations |

### Contrast Compliance

All color combinations meet WCAG 2.1 AA standards:
- Primary text on bg: 14.8:1 ✓
- Secondary text on bg: 7.8:1 ✓
- Muted text on secondary bg: 4.6:1 ✓
- Accent on bg: 8.2:1 ✓

---

## Typography

### Font Stack

```css
:root {
  /* Font Families */
  --font-serif: 'Crimson Text', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | 1.5 | Captions, labels |
| `--text-sm` | 0.875rem (14px) | 1.6 | Secondary text |
| `--text-base` | 1rem (17px) | 1.7 | Body text |
| `--text-lg` | 1.125rem (19px) | 1.6 | Lead paragraphs |
| `--text-xl` | 1.25rem (21px) | 1.5 | Subheadings |
| `--text-2xl` | 1.5rem (26px) | 1.3 | H4 headings |
| `--text-3xl` | 1.875rem (32px) | 1.2 | H3 headings |
| `--text-4xl` | 2.25rem (38px) | 1.1 | H2 headings |
| `--text-5xl` | 3rem (51px) | 1.1 | Hero headings |
| `--text-6xl` | 3.75rem (64px) | 1.0 | Display text |

### Fluid Typography

```css
/* Responsive type scale using clamp() */
--text-fluid-sm: clamp(0.875rem, 0.9rem + 0.2vw, 1rem);
--text-fluid-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--text-fluid-lg: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);
--text-fluid-xl: clamp(1.25rem, 1rem + 1vw, 1.5rem);
--text-fluid-2xl: clamp(1.5rem, 1rem + 2vw, 2.25rem);
--text-fluid-3xl: clamp(2rem, 1rem + 3vw, 3rem);
--text-fluid-hero: clamp(2rem, 5vw + 1rem, 4rem);
```

### Typography Patterns

**Hero Title**
```css
.hero-title {
  font-family: var(--font-serif);
  font-size: var(--text-fluid-hero);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
  line-height: 1.1;
  text-shadow: 0 0 40px var(--color-accent-glow);
}
```

**Section Heading**
```css
.section h2 {
  font-family: var(--font-serif);
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}
```

**Body Text**
```css
body {
  font-family: var(--font-serif);
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--color-text-secondary);
}
```

---

## Spacing System

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-0` | 0 | None |
| `--spacing-px` | 1px | Hairlines |
| `--spacing-xs` | 0.25rem (4px) | Tight spacing |
| `--spacing-sm` | 0.5rem (8px) | Default component padding |
| `--spacing-md` | 1rem (17px) | Standard spacing |
| `--spacing-lg` | 1.5rem (26px) | Section padding |
| `--spacing-xl` | 2rem (34px) | Large gaps |
| `--spacing-2xl` | 3rem (51px) | Section margins |
| `--spacing-3xl` | 4rem (68px) | Major sections |
| `--spacing-4xl` | 6rem (102px) | Hero spacing |
| `--spacing-5xl` | 8rem (136px) | Page sections |

### Layout Dimensions

```css
:root {
  /* Layout */
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 72px;
  --content-max-width: 800px;
  --content-wide-max-width: 1200px;
  
  /* Container */
  --container-padding: var(--spacing-md);
  --container-max-width: 1400px;
  
  /* Touch Targets */
  --touch-target-min: 44px;  /* WCAG 2.1 AA */
  --touch-target-comfortable: 48px;
}
```

### Spacing Patterns

**Component Spacing**
```css
.component {
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}
```

**Section Spacing**
```css
.section {
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-2xl) 0;
}
```

---

## Layout

### Grid System

```css
:root {
  /* Grid */
  --grid-columns: 12;
  --grid-gap: var(--spacing-md);
  --grid-gap-lg: var(--spacing-lg);
}
```

### Layout Patterns

**Main Layout**
```css
.page {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .page {
    grid-template-columns: 1fr;
  }
}
```

**Content Container**
```css
.content {
  width: min(100% - var(--spacing-xl), var(--content-max-width));
  margin-inline: auto;
  padding: var(--spacing-3xl) var(--spacing-xl);
}
```

**Card Grid**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}
```

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## Components

### Buttons

**Primary Button**
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-accent);
  color: var(--color-bg);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: var(--transition-all);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.btn-primary:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.btn-primary:active {
  transform: translateY(0);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-bg-tertiary);
}
```

### Cards

**Chapter Card**
```css
.chapter-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: var(--transition-all);
}

.chapter-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

**Practice Box**
```css
.practice-box {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}
```

### Navigation

**Nav Link**
```css
.nav-link {
  display: flex;
  align-items: center;
  min-height: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-secondary);
  border-left: 2px solid transparent;
  transition: var(--transition-colors);
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-accent);
  border-left-color: var(--color-accent);
  background: linear-gradient(90deg, var(--color-bg-tertiary), transparent);
}
```

### Forms

**Input Field**
```css
.input {
  width: 100%;
  min-height: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-family: var(--font-sans);
  transition: var(--transition-all);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
```

---

## Animations & Micro-interactions

### Timing Functions

```css
:root {
  /* Easing Functions */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 0ms | Immediate |
| `--duration-fast` | 100ms | Micro-interactions |
| `--duration-normal` | 200ms | Hover states |
| `--duration-slow` | 300ms | Transitions |
| `--duration-slower` | 500ms | Complex animations |
| `--duration-slowest` | 1000ms | Page transitions |

### Transitions

```css
:root {
  /* Common Transitions */
  --transition-all: all var(--duration-normal) var(--ease-default);
  --transition-colors: color var(--duration-fast) var(--ease-default),
                       background-color var(--duration-fast) var(--ease-default),
                       border-color var(--duration-fast) var(--ease-default);
  --transition-transform: transform var(--duration-normal) var(--ease-spring);
  --transition-opacity: opacity var(--duration-normal) var(--ease-default);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-default);
}
```

### Keyframe Animations

**Pulse Glow**
```css
@keyframes pulse-glow {
  0%, 100% { 
    opacity: 0.2; 
    transform: scale(1);
    filter: drop-shadow(0 0 20px var(--color-accent-glow));
  }
  50% { 
    opacity: 0.4; 
    transform: scale(1.05);
    filter: drop-shadow(0 0 40px var(--color-accent-glow));
  }
}
```

**Fade In Up**
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Shimmer Loading**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Focus Ring Pulse**
```css
@keyframes focus-pulse {
  0%, 100% { box-shadow: 0 0 0 3px var(--color-focus-ring); }
  50% { box-shadow: 0 0 0 6px var(--color-focus-ring); }
}
```

### Micro-interactions Reference

| Element | Trigger | Effect | Duration |
|---------|---------|--------|----------|
| Buttons | Hover | Lift + glow | 200ms |
| Buttons | Active | Press down | 100ms |
| Cards | Hover | Lift + border color | 300ms |
| Nav links | Hover | Slide indicator + bg | 200ms |
| Inputs | Focus | Ring + border | 200ms |
| Links | Hover | Underline + color | 150ms |
| Skip link | Focus | Slide into view | 300ms |

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: Minimum 44×44px
- **Focus Indicators**: Visible, high-contrast outlines
- **Motion**: Respect `prefers-reduced-motion`

### Focus Management

```css
/* Visible focus for keyboard navigation */
*:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

/* High contrast for dark buttons */
.btn-primary:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-accent);
  color: var(--color-bg);
  padding: 12px 20px;
  z-index: 10000;
  transition: top var(--duration-normal) var(--ease-default);
}

.skip-link:focus {
  top: 0;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Screen Reader Support

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Dark/Light Mode

### Implementation Strategy

The design system supports both dark and light themes via CSS custom properties.

### Color Scheme Toggle

```css
/* Default to dark theme */
:root {
  color-scheme: dark;
}

/* Respect system preference for light mode */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* Light theme variables */
  }
}

/* Manual toggle support */
:root[data-theme="light"] {
  /* Light theme variables */
}

:root[data-theme="dark"] {
  /* Dark theme variables (default) */
}
```

### Light Theme Colors

```css
:root[data-theme="light"] {
  --color-bg: #fafafa;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #f5f5f5;
  --color-bg-elevated: #ffffff;
  
  --color-text: #1a1a1a;
  --color-text-secondary: #4a4a4a;
  --color-text-muted: #6a6a6a;
  --color-text-inverse: #fafafa;
  
  --color-accent: #b8941d;
  --color-accent-hover: #a08010;
  --color-accent-secondary: #8b6914;
  --color-accent-glow: rgba(201, 162, 39, 0.2);
  
  --color-border: #e0e0e0;
  --color-border-hover: #c0c0c0;
  --color-focus: #000000;
  --color-focus-ring: rgba(201, 162, 39, 0.4);
}
```

---

## Browser Support

### Target Browsers

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions  
- Safari: Last 2 versions
- Mobile Safari: iOS 14+
- Chrome Android: Last 2 versions

### Feature Detection

```css
/* Container queries support */
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
}

/* :has() support for theme toggle */
@supports selector(:has(body)) {
  :root:has(#theme-toggle:checked) {
    /* Theme styles */
  }
}

/* light-dark() function support */
@supports (color: light-dark(black, white)) {
  .element {
    color: light-dark(var(--color-text), var(--color-text-inverse));
  }
}
```

### Progressive Enhancement

Features degrade gracefully:
- Custom properties → Static fallback values
- Grid/Flexbox → Float-based fallbacks (not needed for target browsers)
- Animations → Static states
- backdrop-filter → Solid backgrounds

---

## Component Pattern Library

### Usage Examples

See `css/components/` directory for modular component files.

**Import Order:**
1. `variables.css` - Design tokens
2. `reset.css` - Normalize/reset
3. `base.css` - Element defaults
4. `utilities.css` - Helper classes
5. `components/*.css` - Component styles
6. `themes/*.css` - Theme overrides

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-03-06 | Initial design system release |

---

*Built with intention for the Inversion Excursion project.*
