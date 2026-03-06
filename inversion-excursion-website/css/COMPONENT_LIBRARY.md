# Component Pattern Library

A modular CSS component library for the Inversion Excursion design system.

## Organization

```
css/
├── style.css          # Main compiled stylesheet
├── components/        # Modular component files
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   ├── navigation.css
│   └── utilities.css
└── themes/
    ├── dark.css
    └── light.css
```

## Quick Reference

### Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">Action</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Cancel</button>

<!-- Button with Icon -->
<button class="btn btn-primary">
  <svg>...</svg>
  Action
</button>
```

### Cards

```html
<!-- Chapter Card -->
<a href="chapter.html" class="chapter-card">
  <span class="chapter-number">01</span>
  <h3>Chapter Title</h3>
  <p>Description text...</p>
</a>

<!-- Practice Box -->
<aside class="practice-box">
  <h4>Note Title</h4>
  <p>Content...</p>
</aside>
```

### Navigation

```html
<!-- Sidebar Navigation -->
<nav class="sidebar">
  <div class="sidebar-header">
    <a href="/" class="book-title">Title</a>
    <p class="book-subtitle">Subtitle</p>
  </div>
  <div class="nav-section">
    <h2 class="nav-section-title">Section</h2>
    <ul class="nav-list">
      <li><a href="#" class="nav-link">Link</a></li>
    </ul>
  </div>
</nav>
```

## Component Details

### Buttons

**Base Structure:**
- Min height: 44px (WCAG 2.1 AA)
- Font: Inter, 0.875rem, medium weight
- Border radius: 6px
- Transition: all 200ms with spring easing

**States:**
| State | Visual |
|-------|--------|
| Default | Solid background |
| Hover | Lift (-2px) + glow shadow |
| Active | Press down (scale 0.98) |
| Focus | 3px outline |
| Disabled | Opacity 0.5, no pointer-events |

**Variants:**
- `.btn-primary` - Gold accent, filled
- `.btn-secondary` - Transparent with border
- `.btn-ghost` - Transparent, text only

### Cards

**Chapter Card:**
- Background: Secondary color
- Border: 1px subtle
- Border radius: 8px
- Hover: Border color change, lift effect
- Top accent line animates on hover

**Practice Box:**
- Background: Tertiary color
- Left border accent
- Used for callouts and notes

### Forms

**Input Field:**
```css
.input {
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-tertiary);
  transition: all 200ms;
}

.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
```

**States:**
- Default: Subtle border
- Hover: Lighter border
- Focus: Accent border + ring
- Error: Red border + message
- Disabled: Reduced opacity

### Navigation

**Nav Link:**
- Min height: 44px
- Left border indicator
- Slide animation on hover
- Active state with accent color

**Mobile Menu:**
- Hamburger transforms to X
- Sidebar slides from left
- Backdrop overlay

## Utility Classes

### Text

```css
.text-center     /* Center alignment */
.text-xs         /* 0.75rem */
.text-sm         /* 0.875rem */
.font-sans       /* Inter */
.font-serif      /* Crimson Text */
.font-bold       /* 700 weight */
.text-accent     /* Gold color */
.text-muted      /* Muted color */
```

### Spacing

```css
.m-0             /* Margin 0 */
.mb-sm           /* Margin bottom small */
.p-md            /* Padding medium */
```

### Animation

```css
.animate-fade-in    /* Fade in from bottom */
.animate-pulse      /* Pulsing glow effect */
.hover-lift         /* Lift on hover */
.focus-animate      /* Animated focus ring */
```

## Animation Tokens

```css
/* Durations */
--duration-fast: 100ms;      /* Micro-interactions */
--duration-normal: 200ms;    /* Hover states */
--duration-slow: 300ms;      /* Transitions */

/* Easings */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## Responsive Patterns

### Mobile First Approach

```css
/* Base styles (mobile) */
.component {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 769px) {
  .component {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .component {
    padding: 2rem;
  }
}
```

### Container Queries

```css
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  @container (min-width: 400px) {
    .card {
      /* Styles for larger container */
    }
  }
}
```

## Theming

### CSS Variables

All components use CSS custom properties for theming:

```css
:root {
  --color-bg: #0a0a0f;
  --color-accent: #c9a227;
  /* ... etc */
}
```

### Dark/Light Mode

Toggle via data attribute:

```html
<html data-theme="light">
```

Or use system preference:

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* Light theme */
  }
}
```

## Accessibility

### Required Attributes

**Buttons:**
```html
<button aria-label="Description" disabled>Text</button>
```

**Links:**
```html
<a href="..." aria-current="page">Current Page</a>
```

**Navigation:**
```html
<nav aria-label="Main">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="...">Link</a>
    </li>
  </ul>
</nav>
```

### Focus States

All interactive elements must have visible focus indicators:
- Outline: 3px solid accent color
- Offset: 2-3px
- High contrast on dark backgrounds

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Best Practices

1. **Use semantic HTML** - `button` for actions, `a` for navigation
2. **Maintain touch targets** - Minimum 44×44px
3. **Provide focus states** - Visible, high contrast
4. **Support reduced motion** - Respect user preferences
5. **Test color contrast** - WCAG 2.1 AA minimum
6. **Use CSS variables** - Consistent theming
7. **Mobile-first** - Base styles for mobile
8. **Progressive enhancement** - Feature detection

## Examples

### Hero Section

```html
<section class="hero">
  <h1 class="hero-title">Title</h1>
  <p class="hero-subtitle">Subtitle</p>
  <p class="hero-tagline">Tagline</p>
  <div class="hero-visual">
    <div class="tower-visual"></div>
  </div>
  <div class="cta-buttons">
    <a href="#" class="btn btn-primary">Primary</a>
    <a href="#" class="btn btn-secondary">Secondary</a>
  </div>
</section>
```

### Content Section

```html
<section class="section">
  <h2>Section Title</h2>
  <p>Content paragraph...</p>
  <h3>Subsection</h3>
  <ul>
    <li>List item</li>
  </ul>
</section>
```

### Chapter Navigation

```html
<nav class="chapter-nav">
  <a href="prev.html" class="chapter-nav-link prev">Previous Chapter</a>
  <a href="next.html" class="chapter-nav-link next">Next Chapter</a>
</nav>
```

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: 14+
- Chrome Android: Last 2 versions

### Fallbacks

- CSS Grid → Flexbox
- Custom properties → Static values
- backdrop-filter → Solid backgrounds
- :focus-visible → :focus fallback
