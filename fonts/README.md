# Self-Hosted Fonts Setup

This directory contains self-hosted fonts for the Inversion Excursion website, eliminating external CDN dependencies.

## Fonts Used

### Crimson Text (Serif)
- **Purpose**: Body text, headings
- **Weights**: 400, 400i, 600, 600i, 700, 700i
- **Source**: [Google Fonts](https://fonts.google.com/specimen/Crimson+Text)

### Inter (Sans-serif)
- **Purpose**: UI elements, navigation
- **Weights**: 300, 400, 500, 600
- **Source**: [Google Fonts](https://fonts.google.com/specimen/Inter)

## Download Instructions

### Option 1: Google Fonts Downloader

1. Visit [google-webfonts-helper.herokuapp.com](https://google-webfonts-helper.herokuapp.com/)
2. Search for "Crimson Text"
3. Select weights: 400, 600, 700 + italics
4. Download and extract to `fonts/crimson-text/`
5. Repeat for "Inter" (300, 400, 500, 600)

### Option 2: Manual Download

```bash
# Using wget (Linux/Mac)
cd fonts/crimson-text
wget https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Regular.ttf
wget https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Italic.ttf
wget https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-SemiBold.ttf
wget https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-SemiBoldItalic.ttf
wget https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Bold.ttf
wget https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-BoldItalic.ttf

cd ../inter
wget https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bslnt%2Cwght%5D.ttf
```

### Option 3: Use Fontsource (NPM)

```bash
npm install @fontsource/crimson-text @fontsource/inter
# Then copy files from node_modules to fonts/
```

## File Structure

```
fonts/
├── fonts.css              # Font-face declarations
├── README.md             # This file
├── crimson-text/
│   ├── CrimsonText-Regular.ttf
│   ├── CrimsonText-Italic.ttf
│   ├── CrimsonText-SemiBold.ttf
│   ├── CrimsonText-SemiBoldItalic.ttf
│   ├── CrimsonText-Bold.ttf
│   └── CrimsonText-BoldItalic.ttf
└── inter/
    ├── Inter-Light.ttf
    ├── Inter-Regular.ttf
    ├── Inter-Medium.ttf
    └── Inter-SemiBold.ttf
```

## Note on WOFF2

For production, convert TTF to WOFF2 for better compression:

```bash
# Using fonttools
pip install fonttools brotli
fonttools ttLib.woff2 compress -o CrimsonText-Regular.woff2 CrimsonText-Regular.ttf
```

Or use an online converter like [convertio.co](https://convertio.co/ttf-woff2/).

## Privacy Benefit

By self-hosting fonts:
- ✅ No requests to Google Fonts (privacy)
- ✅ Works offline
- ✅ Faster loading (HTTP/2 multiplexing)
- ✅ No font-display swap issues
