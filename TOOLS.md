# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## PDF Processing Capabilities

### Installed Tools

| Tool | Command | Purpose |
|------|---------|---------|
| **pdftotext** | `pdftotext file.pdf -` | Extract text to stdout |
| **pdftotext** | `pdftotext file.pdf output.txt` | Extract text to file |
| **pdftk** | `pdftk input.pdf output output.pdf` | PDF manipulation (merge, split, etc.) |
| **pdfinfo** | `pdfinfo file.pdf` | Extract metadata |
| **pdfplumber** (Python) | `python3 -c "import pdfplumber; ..."` | Advanced text/table extraction |
| **PyPDF2** (Python) | `python3 -c "import PyPDF2; ..."` | PDF reading/writing |
| **pdfminer.six** (Python) | `python3 -c "from pdfminer.high_level import extract_text; ..."` | Low-level PDF parsing |

### Quick Reference

```bash
# Extract text from PDF
echo "Extracting text from PDF..."
pdftotext input.pdf output.txt

# Extract to stdout (for piping)
pdftotext input.pdf -

# Get PDF metadata
pdfinfo input.pdf

# Python one-liner for text extraction
python3 -c "from pdfminer.high_level import extract_text; print(extract_text('input.pdf'))"

# Python with pdfplumber (preserves layout better)
python3 -c "import pdfplumber; pdf = pdfplumber.open('input.pdf'); print('\n\n'.join([p.extract_text() for p in pdf.pages]))"
```

### Usage Examples

```bash
# Extract and search PDF content
pdftotext report.pdf - | grep -i "error"

# Extract specific page range
pdftotext -f 5 -l 10 report.pdf output.txt

# Get PDF page count
pdfinfo report.pdf | grep Pages
```

---

## System Capabilities Summary

| Capability | Tool | Status |
|------------|------|--------|
| PDF Text Extraction | pdftotext | ✅ Installed |
| PDF Metadata | pdfinfo | ✅ Installed |
| PDF Manipulation | pdftk | ✅ Installed |
| Python PDF Parsing | pdfplumber | ✅ Installed |
| Python PDF Reading | PyPDF2 | ✅ Installed |
| Python PDF Mining | pdfminer.six | ✅ Installed |
