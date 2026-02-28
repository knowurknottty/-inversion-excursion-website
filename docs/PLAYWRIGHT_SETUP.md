# Playwright Browser Setup
## Installed 2026-03-01

## Components

### 1. Playwright Core
- Location: `/usr/lib/node_modules/playwright`
- Version: 1.58.2
- Browsers path: `/root/.cache/ms-playwright`

### 2. Chromium Binary
- Location: `/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`
- Version: Chrome 145.0.7632.6 (Headless Shell)
- Size: ~110MB

### 3. Playwright CLI
- Location: `/usr/bin/playwright-cli`
- Version: 1.59.0-alpha

## Environment Variables
```bash
export PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
export PATH="/usr/lib/node_modules/.bin:$PATH"
```

## Usage

### Direct Node.js
```javascript
const { chromium } = require('playwright');
const browser = await chromium.launch();
```

### CLI
```bash
playwright-cli screenshot --browser=chromium https://example.com output.png
```

### Python
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
```

## Notes
- LobeHub skills require credentials (skipped)
- Browser works standalone without skills
- Chromium headless shell optimized for automation

