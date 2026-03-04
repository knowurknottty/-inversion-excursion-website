# Inversion Excursion Website

A static website for the *Inversion Excursion* book — A Field Manual for Frequency Warriors.

🔗 **Live Site**: https://inversion-excursion.netlify.app/

---

## Overview

This is a minimalist, fast-loading static website presenting the seven chapters of the Inversion Excursion. Built with pure HTML, CSS, and vanilla JavaScript — no frameworks, no build steps required.

## Features

- 📱 **Mobile-responsive** sidebar navigation
- 🌙 **Dark theme** optimized for reading
- ⌨️ **Keyboard shortcuts** (`m` to toggle menu, `esc` to close)
- 📖 **Reading progress** indicator
- ✨ **Smooth animations** with Intersection Observer
- 🔍 **SEO optimized** with meta tags and sitemap
- ♿ **Accessibility** features (skip links, ARIA labels)

## Structure

```
.
├── index.html              # Homepage
├── chapters/               # Chapter pages
│   ├── chapter-1.html     # The Ivory Tower
│   ├── chapter-2.html     # The Five Scrolls
│   ├── chapter-3.html     # The Five Dungeons
│   ├── chapter-4.html     # The Master Keys
│   ├── chapter-5.html     # The Ascension
│   ├── chapter-6.html     # The Grimoire
│   └── chapter-7.html     # The Transmission
├── css/
│   └── style.css          # Stylesheet (620 lines)
├── js/
│   └── main.js            # Interactivity (107 lines)
├── assets/
│   └── favicon.svg        # Site icon
├── robots.txt             # Search engine directives
├── sitemap.xml            # SEO sitemap
├── site.webmanifest       # PWA manifest
└── convert.py             # Markdown → HTML build tool
```

## Development

### Prerequisites

- Python 3.7+ (for build tool only)
- Modern web browser

### Local Development

```bash
# Clone or download the repository
cd inversion-excursion-website

# Start a local server (Python 3)
python -m http.server 8000

# Or with Node.js
npx serve .
```

Then open http://localhost:8000

### Building from Markdown

The `convert.py` script converts Markdown source files to HTML:

```bash
# Default: looks for ../inversion-excursion/*.md → ./chapters/*.html
python convert.py

# Custom paths
python convert.py --source ./markdown --output ./dist

# Verbose output
python convert.py -v
```

## Deployment

This site is optimized for static hosting on:

- **Netlify** (recommended)
- Vercel
- GitHub Pages
- Any static file server

### Netlify Deploy

```bash
# Deploy to Netlify
netlify deploy --prod --dir=.
```

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 80+ | ✅ Full |
| Firefox 75+ | ✅ Full |
| Safari 13+ | ✅ Full |
| Edge 80+ | ✅ Full |

## Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive components
- Keyboard navigation support
- Skip-to-content link
- Color contrast compliant (WCAG AA)
- Focus indicators visible

## License

© 2026 Kimi Claw. All rights reserved.

---

*Remember: The Exit is always open. You are the Observer.*
