/**
 * inject-tool-links.js
 * Replaces SynSync and WYRD in HTML text nodes only.
 * Skips: heading tags (h1-h4), existing anchors, meta/title/script/style.
 * Only processes text inside <article> or <main> to avoid touching navigation.
 * Run from repo root: node scripts/inject-tool-links.js
 */

const fs = require('fs');
const path = require('path');

const TOOLS = [
  {
    word: 'SynSync',
    url: 'https://synsynckb.netlify.app',
  },
  {
    word: 'WYRD',
    url: 'https://wryd.netlify.app',
  },
];

// Tags whose text content we never touch (when inside article/main)
const SKIP_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'title', 'a', 'meta',
                            'link', 'script', 'style', 'noscript', 'code', 'pre']);

// Tags that define "content" scope — we only replace inside these
const CONTENT_TAGS = new Set(['article', 'main']);

/**
 * Split HTML into alternating [text, tag, text, tag, ...] segments.
 * Even indices = text nodes. Odd indices = raw tags.
 */
function splitHtml(html) {
  const segments = [];
  let pos = 0;
  const re = /(<[^>]+>)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m.index > pos) segments.push({ type: 'text', value: html.slice(pos, m.index) });
    segments.push({ type: 'tag',  value: m[0] });
    pos = m.index + m[0].length;
  }
  if (pos < html.length) segments.push({ type: 'text', value: html.slice(pos) });
  return segments;
}

/**
 * Given an array of HTML segments, replace `word` with a tool-link
 * only in text segments that are:
 *   - inside a <article> or <main> element
 *   - NOT inside a skip tag (h1-h4, a, script, etc.)
 */
function injectLink(segments, word, url) {
  let contentDepth = 0; // depth inside article/main
  let skipDepth = 0;    // depth inside skip tags (only tracked when inContent)
  const re = new RegExp(`\\b${word}\\b`, 'g');
  const link = `<a href="${url}" class="tool-link" target="_blank" rel="noopener noreferrer">${word}</a>`;

  return segments.map(seg => {
    if (seg.type === 'tag') {
      const tagName = (seg.value.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/) || [])[1];
      if (!tagName) return seg;
      const lower = tagName.toLowerCase();
      const isClose = seg.value.startsWith('</');
      const isSelfClose = seg.value.endsWith('/>');

      if (CONTENT_TAGS.has(lower)) {
        if (!isClose && !isSelfClose) contentDepth++;
        else if (isClose && contentDepth > 0) contentDepth--;
        // Reset skipDepth when leaving content scope
        if (isClose && contentDepth === 0) skipDepth = 0;
      } else if (contentDepth > 0 && SKIP_TAGS.has(lower)) {
        if (!isClose && !isSelfClose) skipDepth++;
        else if (isClose && skipDepth > 0) skipDepth--;
      }
      return seg;
    }
    // text node: only replace if inside content AND not inside a skip tag
    if (contentDepth === 0 || skipDepth > 0) return seg;
    return { type: 'text', value: seg.value.replace(re, link) };
  });
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  let segments = splitHtml(html);

  for (const { word, url } of TOOLS) {
    segments = injectLink(segments, word, url);
  }

  const result = segments.map(s => s.value).join('');

  // Count replacements for reporting
  const synCount  = (result.match(/synsynckb\.netlify\.app/g) || []).length;
  const wyrdCount = (result.match(/wryd\.netlify\.app/g) || []).length;

  fs.writeFileSync(filePath, result, 'utf8');
  console.log(`  ${path.basename(filePath)}: ${synCount} SynSync links, ${wyrdCount} WYRD links`);
}

// Process all chapter html files + index
const root = path.resolve(__dirname, '..');
const targets = [
  ...fs.readdirSync(path.join(root, 'chapters'))
       .filter(f => f.endsWith('.html'))
       .map(f => path.join(root, 'chapters', f)),
  path.join(root, 'index.html'),
];

console.log('Injecting tool links...');
targets.forEach(processFile);
console.log('Done.');
