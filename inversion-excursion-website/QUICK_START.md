# QUICK_START.md
## Inversion Excursion Website - Developer Quick Start Guide

**Version:** 2.0.0  
**Last Updated:** March 6, 2026  
**Read Time:** 10 minutes

---

## 🚀 Getting Started (5 Minutes)

### Prerequisites

- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Optional: Local web server (Live Server extension)

### Quick Setup

```bash
# 1. Navigate to project
cd /root/.openclaw/workspace/inversion-excursion-website/

# 2. Start local server (Python 3)
python -m http.server 8000

# 3. Or use Node.js npx
npx serve .

# 4. Open browser
open http://localhost:8000
```

That's it! The site will be running locally.

---

## 📁 Project Structure

```
inversion-excursion-website/
├── index.html                    # Homepage - START HERE
├── chapters/                     # Chapter content
│   ├── chapter-1.html           # The Ivory Tower
│   ├── chapter-2.html           # The Five Scrolls
│   ├── chapter-3.html           # The Seven Dungeons
│   ├── chapter-4.html           # The Master Keys
│   ├── chapter-5.html           # The Ascension
│   ├── chapter-6.html           # The Grimoire
│   ├── chapter-7.html           # The Transmission
│   ├── dungeon-2.html           # Financial Liberation
│   ├── dungeon-3.html           # Linguistic Liberation
│   ├── dungeon-4.html           # Spiritual Liberation
│   ├── dungeon-5.html           # Body Liberation
│   ├── dungeon-6.html           # Trauma Liberation
│   └── dungeon-7.html           # Pattern Wisdom
├── css/
│   ├── style.css                # Source (development)
│   ├── style.min.css            # Production (USE THIS)
│   ├── critical.css             # Inline-ready critical styles
│   └── COMPONENT_LIBRARY.md     # Component docs
├── js/
│   ├── main.js                  # Source (development)
│   ├── main.min.js              # Production (USE THIS)
│   └── theme-toggle.js          # Dark/light mode
├── images/
│   └── placeholders/            # SVG placeholders
├── robots.txt                   # Crawler directives
├── sitemap.xml                  # Search engine map
└── [documentation files].md
```

---

## 🎨 Development Workflow

### 1. Development Mode

Use uncompressed files for debugging:

```html
<!-- In your HTML head -->
<link rel="stylesheet" href="css/style.css">

<!-- Before closing body -->
<script src="js/main.js"></script>
```

### 2. Production Build

Switch to minified files for deployment:

```html
<!-- In your HTML head -->
<link rel="stylesheet" href="css/style.min.css">

<!-- Before closing body -->
<script src="js/main.min.js" defer></script>
```

### 3. Minification Commands

```bash
# CSS minification
cssnano css/style.css css/style.min.css

# Or with PostCSS
postcss css/style.css -o css/style.min.css --use cssnano

# JS minification
terser js/main.js -o js/main.min.js

# Or with uglify
uglifyjs js/main.js -o js/main.min.js -c -m
```

---

## 🧩 Common Tasks

### Adding a New Page

1. **Create HTML file:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta -->
    <meta name="description" content="150-160 character description">
    <meta name="keywords" content="relevant, keywords">
    <meta name="author" content="Kimi Claw">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Page Title | Inversion Excursion">
    <meta property="og:description" content="Description">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://inversionexcursion.com/chapters/page.html">
    <meta property="og:image" content="https://inversionexcursion.com/images/og/page.jpg">
    
    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Page Title">
    <meta name="twitter:description" content="Description">
    
    <!-- Canonical -->
    <link rel="canonical" href="https://inversionexcursion.com/chapters/page.html">
    
    <!-- Navigation -->
    <link rel="prev" href="previous-page.html">
    <link rel="next" href="next-page.html">
    
    <title>Page Title | Inversion Excursion</title>
    
    <!-- Styles -->
    <link rel="stylesheet" href="../css/style.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <!-- Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Page Title",
        "author": {"@type": "Organization", "name": "Kimi Claw"},
        "isPartOf": {"@type": "Book", "name": "Inversion Excursion"}
    }
    </script>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <nav class="sidebar" aria-label="Chapter navigation">
        <!-- Navigation content -->
    </nav>
    
    <main class="main-content" id="main-content" tabindex="-1">
        <article class="content chapter-content">
            <header class="chapter-header">
                <span class="chapter-number">Chapter X</span>
                <h1 class="chapter-title">Page Title</h1>
            </header>
            
            <section id="section-id" aria-labelledby="section-heading">
                <h2 id="section-heading">Section Title</h2>
                <p>Content...</p>
            </section>
        </article>
    </main>
    
    <script src="../js/main.min.js" defer></script>
</body>
</html>
```

2. **Add to sitemap.xml:**
```xml
<url>
    <loc>https://inversionexcursion.com/chapters/page.html</loc>
    <lastmod>2025-03-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
</url>
```

3. **Add cross-links from related pages**

### Adding a New CSS Component

1. **Check DESIGN_SYSTEM.md for patterns**

2. **Add to `css/style.css`:**
```css
/* Component Name */
.component-name {
    /* Use design tokens */
    background: var(--color-bg-secondary);
    color: var(--color-text);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    
    /* Focus state */
    &:focus-visible {
        outline: 3px solid var(--color-focus);
    }
}
```

3. **Document in COMPONENT_LIBRARY.md:**
```markdown
### Component Name

**Purpose:** Brief description

**Example:**
<div class="component-name">...</div>

**Variants:**
- `.component-name--large` - Large version
- `.component-name--small` - Small version
```

4. **Minify for production:**
```bash
cssnano css/style.css css/style.min.css
```

### Adding Images

1. **Place in appropriate directory:**
```
images/
├── og/              # Open Graph images (1200x630)
├── content/         # Content images
└── icons/           # Icons and UI elements
```

2. **Add alt text to inventory:**
```markdown
<!-- File: alt-text-inventory.md -->
## page.html

```html
<img src="images/content/photo.jpg" 
     alt="Descriptive text conveying meaning">
```
```

3. **Use responsive images:**
```html
<picture>
    <source srcset="images/photo.avif" type="image/avif">
    <source srcset="images/photo.webp" type="image/webp">
    <img src="images/photo.jpg" 
         alt="Descriptive text"
         loading="lazy"
         width="800" height="600">
</picture>
```

---

## 🔧 Configuration

### Dark/Light Mode

The theme toggle is automatically included. To set default theme:

```javascript
// In js/theme-toggle.js
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const defaultTheme = prefersDark ? 'dark' : 'light';
```

To force a theme:
```html
<!-- Force dark mode -->
<html data-theme="dark">

<!-- Force light mode -->
<html data-theme="light">
```

### Fonts

Fonts are loaded from Google Fonts with `preconnect`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

To use:
```css
font-family: var(--font-serif);  /* Crimson Text */
font-family: var(--font-sans);   /* Inter */
```

### Colors

All colors use CSS custom properties:

```css
/* Backgrounds */
var(--color-bg);              /* Deep cosmic black #0a0a0f */
var(--color-bg-secondary);    /* Elevated surfaces #12121a */

/* Text */
var(--color-text);            /* Primary text #e8e8ec */
var(--color-text-secondary);  /* Secondary text #a0a0ac */
var(--color-text-muted);      /* Muted text #808090 */

/* Accent */
var(--color-accent);          /* Gold #c9a227 */
var(--color-accent-hover);    /* Brighter gold #d4aa2e */

/* Utility */
var(--color-success);         /* Green #4ade80 */
var(--color-warning);         /* Yellow #fbbf24 */
var(--color-error);           /* Red #f87171 */
var(--color-info);            /* Blue #60a5fa */
```

---

## 🧪 Testing

### Validation

```bash
# HTML validation
npx html-validate chapters/*.html

# CSS validation
npx stylelint css/*.css

# Link checking
npx broken-link-checker http://localhost:8000
```

### Accessibility Testing

1. **Browser DevTools:**
   - Chrome: DevTools → Lighthouse → Accessibility
   - Firefox: DevTools → Accessibility tab

2. **Screen Reader:**
   - NVDA (Windows) - Free
   - VoiceOver (macOS) - Built-in
   - JAWS (Windows) - Paid

3. **Keyboard Navigation:**
   - Tab through entire page
   - Verify skip link works
   - Check focus indicators visible

### Performance Testing

```bash
# Lighthouse CI
npx lighthouse http://localhost:8000 --view

# WebPageTest
# Upload to https://webpagetest.org
```

Target metrics:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: > 90

---

## 🚢 Deployment

### Basic Deployment

Upload these files to your web server:

```
index.html
chapters/*.html
css/style.min.css
js/main.min.js
js/theme-toggle.js
images/placeholders/*.svg
robots.txt
sitemap.xml
```

### Server Configuration

See `SERVER_CONFIG.md` for detailed configs.

**Nginx quick setup:**
```nginx
server {
    listen 80;
    server_name inversionexcursion.com;
    root /var/www/inversion-excursion;
    index index.html;
    
    # Enable compression
    gzip on;
    gzip_types text/css application/javascript;
    
    # Cache static assets
    location ~* \.(css|js|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Post-Deployment

1. **Submit to Google:**
   - Google Search Console: Submit sitemap
   - Test robots.txt

2. **Test Social Sharing:**
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector

3. **Monitor:**
   - Core Web Vitals
   - Search rankings
   - Broken links

---

## 📚 Key Documentation

| Document | When to Read |
|----------|--------------|
| `DESIGN_SYSTEM.md` | Working with CSS/styling |
| `SEO_AUDIT_REPORT.md` | SEO questions |
| `ACCESSIBILITY_IMPROVEMENTS_SUMMARY.md` | A11y implementation |
| `PERFORMANCE_AUDIT.md` | Performance optimization |
| `SERVER_CONFIG.md` | Deployment setup |
| `alt-text-inventory.md` | Adding images |
| `COMPONENT_LIBRARY.md` | Using components |

---

## ❓ Troubleshooting

### Fonts not loading
- Check `preconnect` links are present
- Verify Google Fonts URL is correct
- Check network tab for blocked requests

### Dark mode not working
- Ensure `theme-toggle.js` is loaded
- Check `data-theme` attribute on HTML
- Verify CSS variables are defined

### Links not working
- Check relative paths (../ vs ./)
- Verify file exists
- Check server root configuration

### Styles not applying
- Check CSS file path
- Verify class names match
- Check browser console for errors

### Accessibility issues
- Run Lighthouse audit
- Check ARIA labels are present
- Verify color contrast (4.5:1 minimum)
- Test keyboard navigation

---

## 💡 Tips

1. **Use the design tokens** - Don't hard-code colors/sizes
2. **Test accessibility early** - Easier to fix from the start
3. **Minify before deploying** - Use `.min.css` and `.min.js`
4. **Keep alt text descriptive** - See alt-text-inventory.md
5. **Maintain heading hierarchy** - Single H1, logical progression
6. **Add to sitemap** - Don't forget new pages
7. **Test on real devices** - Not just browser resizing

---

## 📞 Support

- **Design questions:** See DESIGN_SYSTEM.md
- **SEO questions:** See SEO_AUDIT_REPORT.md
- **A11y questions:** See ACCESSIBILITY_IMPROVEMENTS_SUMMARY.md
- **Performance:** See PERFORMANCE_AUDIT.md
- **Integration:** See MASTER_INTEGRATION.md

---

**Happy coding! 🚀**

*For the complete project overview, see MASTER_INTEGRATION.md*
