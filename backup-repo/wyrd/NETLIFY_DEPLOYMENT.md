# WYRD - Netlify Deployment Guide

## ✅ Pre-Deployment Summary

**Project:** WYRD Etymology Engine
**Type:** React + Vite + TanStack Router + Tailwind CSS
**Package Manager:** Bun
**Build Tool:** Vite
**Monorepo:** Yes (apps/web + packages/etymology)

---

## 📦 What Was Done

### 1. **Repository Setup**
- ✅ Cloned from: `https://github.com/knowurknottty/kimi-claw-workspace`
- ✅ Located at: `C:\Users\larso\Downloads\Capt\kimi\kimi-claw-workspace\wyrd`

### 2. **Build Configuration**
- ✅ Added root-level build scripts to `package.json`:
  ```json
  {
    "scripts": {
      "build:web": "cd apps/web && bun run build",
      "dev:web": "cd apps/web && bun run dev",
      "preview:web": "cd apps/web && bun run preview"
    }
  }
  ```

- ✅ Created `apps/web/postcss.config.js` for Tailwind processing:
  ```js
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
  ```

- ✅ Enhanced `netlify.toml` with SPA routing and cache headers:
  ```toml
  [build]
    base    = ""
    command = "bun install && bun run build:web"
    publish = "apps/web/dist"

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200

  [[headers]]
    for = "/assets/*"
    [headers.values]
      Cache-Control = "public, max-age=31536000, immutable"
  ```

### 3. **Build Verification**
- ✅ **Bun 1.3.10** installed successfully
- ✅ Dependencies installed (6 packages)
- ✅ Production build completed in **20.08s**
- ✅ Bundle size: **161.14 kB** (54.02 kB gzipped)
- ✅ Output location: `apps/web/dist/`

### 4. **Build Output**
```
apps/web/dist/
├── index.html
├── weird_daily.mp3 (audio asset)
└── assets/
    ├── index-Cdb579nR.css (11.29 kB)
    └── index-DgfhM7th.js (161.14 kB)
```

---

## 🚀 Deployment Options

### **Option 1: Netlify CLI (Recommended)**

```bash
# Install Netlify CLI globally (if not installed)
npm install -g netlify-cli

# Navigate to wyrd directory
cd "C:\Users\larso\Downloads\Capt\kimi\kimi-claw-workspace\wyrd"

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod

# When prompted:
# - Publish directory: apps/web/dist
# - Deploy (yes)
```

### **Option 2: Git Integration (Auto-Deploy)**

1. **Connect Repository to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select GitHub
   - Choose repository: `knowurknottty/kimi-claw-workspace`

2. **Configure Build Settings:**
   - **Base directory:** `wyrd`
   - **Build command:** `bun install && bun run build:web`
   - **Publish directory:** `apps/web/dist`
   - (These auto-populate from netlify.toml)

3. **Environment Variables:**
   - Add to Netlify Dashboard → Site settings → Build & deploy → Environment
   - **Required for Bun:**
     ```
     BUN_VERSION=1.3.10
     ```

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will install Bun and build automatically
   - Subsequent pushes to `main` branch auto-deploy

### **Option 3: Manual Drag & Drop**

```bash
# Build locally (already done)
cd "C:\Users\larso\Downloads\Capt\kimi\kimi-claw-workspace\wyrd"
bun run build:web

# Go to Netlify Dashboard → Sites → "Deploy manually"
# Drag apps/web/dist folder to upload area
```

---

## 🔍 Post-Deployment Verification

### **Core Functionality**
- [ ] App loads at Netlify URL
- [ ] Etymology search works
- [ ] TanStack Router navigation works
- [ ] No console errors
- [ ] Audio file (`weird_daily.mp3`) plays if used
- [ ] Tailwind styles applied correctly
- [ ] Responsive design on mobile

### **Performance**
- [ ] Initial load <2 seconds
- [ ] Assets load from `/assets/*` with cache headers
- [ ] Service worker (if enabled) registers
- [ ] Lighthouse Performance score >90

### **SPA Routing**
- [ ] Direct URL navigation works (e.g., `/about`)
- [ ] Browser back/forward buttons work
- [ ] Page refresh on any route doesn't 404

### **Cache Headers**
- [ ] `/assets/*` cached for 1 year (immutable)
- [ ] `/index.html` not cached (no-store)
- [ ] Check via DevTools → Network → Response Headers

---

## 🐛 Troubleshooting

### **Issue: "Bun not found" during Netlify build**
**Fix:** Add environment variable in Netlify:
```
BUN_VERSION=1.3.10
```
Or add to `netlify.toml`:
```toml
[build.environment]
  BUN_VERSION = "1.3.10"
```

### **Issue: PostCSS errors during build**
**Fix:** Already resolved - `postcss.config.js` created in `apps/web/`

### **Issue: 404 on page refresh**
**Fix:** Already configured - SPA redirect in `netlify.toml`

### **Issue: Workspace dependencies not resolving**
**Fix:** Ensure build runs from monorepo root with `base = ""`

### **Issue: Build fails on Netlify but works locally**
**Fix:**
1. Check Netlify build log for specific errors
2. Verify `netlify.toml` in repo root
3. Ensure `BUN_VERSION` environment variable is set
4. Clear Netlify cache and retry: `netlify build --clear-cache`

---

## 📊 Build Statistics

| Metric | Value |
|--------|-------|
| **Package Manager** | Bun 1.3.10 |
| **Build Time** | 20.08s |
| **Bundle Size (JS)** | 161.14 kB (54.02 kB gzipped) |
| **Bundle Size (CSS)** | 11.29 kB (3.03 kB gzipped) |
| **Total Assets** | 4 files |
| **Modules Transformed** | 36 |
| **Dependencies** | 6 packages |

---

## 🔧 Local Development

```bash
# Install dependencies
cd C:\Users\larso\Downloads\Capt\kimi\kimi-claw-workspace\wyrd
bun install

# Start dev server
bun run dev:web
# Opens at http://localhost:5173

# Build for production
bun run build:web

# Preview production build
bun run preview:web
```

---

## 📝 Project Structure

```
wyrd/
├── apps/
│   └── web/              # Main React app
│       ├── src/
│       ├── dist/         # Build output (publish to Netlify)
│       ├── package.json
│       ├── postcss.config.js  ← Created for deployment
│       ├── tailwind.config.js
│       └── vite.config.ts
├── packages/
│   └── etymology/        # Shared etymology logic
│       └── src/
├── netlify.toml          # Netlify config (enhanced)
├── package.json          # Root config (enhanced with build scripts)
├── bun.lock
└── build_diary.md        # Development notes
```

---

## 🌐 Netlify Configuration

**Current `netlify.toml`:**
```toml
[build]
  base    = ""                      # Monorepo root
  command = "bun install && bun run build:web"
  publish = "apps/web/dist"

# SPA fallback for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Don't cache index.html
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

---

## ✅ Deployment Checklist

**Before Deploying:**
- [x] Bun installed and working
- [x] Dependencies installed (`bun install`)
- [x] Production build successful (`bun run build:web`)
- [x] Build output exists at `apps/web/dist/`
- [x] `netlify.toml` configured
- [x] PostCSS config created
- [x] No build errors

**After Deploying:**
- [ ] Site accessible at Netlify URL
- [ ] No console errors in browser
- [ ] All routes work (SPA routing)
- [ ] Styles load correctly
- [ ] Performance acceptable (<3s load)
- [ ] Mobile responsive

---

## 🆘 Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Bun Docs:** https://bun.sh/docs
- **Vite Docs:** https://vite.dev
- **TanStack Router:** https://tanstack.com/router
- **Project Repository:** https://github.com/knowurknottty/kimi-claw-workspace

---

## 🎯 Success Criteria

✅ **Deployment is successful when:**
1. App loads without errors at Netlify URL
2. Etymology search functionality works
3. All routes accessible via direct URL
4. No 404 errors on page refresh
5. Assets cached with proper headers
6. Lighthouse Performance score >90
7. Mobile responsive and functional

---

**Last Updated:** 2026-02-28
**Build Version:** Production-ready
**Location:** `C:\Users\larso\Downloads\Capt\kimi\kimi-claw-workspace\wyrd`
**Deployment Status:** ✅ Ready for Netlify
