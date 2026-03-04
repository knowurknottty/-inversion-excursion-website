#!/usr/bin/env python3
"""
Convert Inversion Excursion markdown chapters to HTML

Usage:
    python convert.py                          # Uses default paths
    python convert.py --source ./markdown      # Custom source dir
    python convert.py --output ./dist          # Custom output dir
    python convert.py -v                       # Verbose mode

Requirements:
    Python 3.7+
"""

import argparse
import logging
import re
import os
import sys
from pathlib import Path
from typing import List, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)


def get_chapters() -> List[Tuple[int, str, str]]:
    """
    Define the chapter metadata.
    
    Returns:
        List of tuples: (chapter_number, title, subtitle)
    """
    return [
        (1, "The Ivory Tower", "How We Became Pieces in a Game We Never Agreed to Play"),
        (2, "The Five Scrolls", "The Elemental Keys That Open What Was Never Locked"),
        (3, "The Five Dungeons", "The Ten Mudrās of Liberation"),
        (4, "The Keys to Freedom", "The Master Keys: Khecarī and Vajrolī"),
        (5, "The Ascension", "The Advanced Practice Manual for Frequency Warriors"),
        (6, "The Grimoire & WYRD Mastery", "Or: The Living Magic of Conscious Language"),
        (7, "The Transmission", "Or: The Sacred Passing of Knowledge to Those Who Come After"),
    ]


def markdown_to_html(md_content: str) -> str:
    """
    Convert markdown content to HTML.
    
    Args:
        md_content: Raw markdown text
        
    Returns:
        HTML string
    """
    if not md_content:
        logger.warning("Empty markdown content provided")
        return ""
    
    html = md_content
    
    # Headers (process in reverse order to avoid conflicts)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Bold and italic (process longer patterns first)
    html = re.sub(r'\*\*\*\*(.*?)\*\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*\*(.*?)\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Blockquotes
    html = re.sub(r'^> (.*?)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)
    
    # Horizontal rules
    html = re.sub(r'^---+$', r'<hr>', html, flags=re.MULTILINE)
    
    # Tables (simplified)
    html = process_tables(html)
    
    # Lists
    html = process_lists(html)
    
    # Paragraphs (must be last)
    html = process_paragraphs(html)
    
    # Visual markers
    html = re.sub(
        r'\[VISUAL: (.*?)\]', 
        r'<div class="visual-marker"><span class="visual-label">Visual</span>\1</div>', 
        html
    )
    
    return html


def process_tables(html: str) -> str:
    """Process markdown tables into HTML tables."""
    lines = html.split('\n')
    new_lines = []
    in_table = False
    table_content = []
    
    for line in lines:
        if '|' in line and not line.strip().startswith('<'):
            if not in_table:
                in_table = True
                table_content = ['<table><tbody>']
            cells = [c.strip() for c in line.split('|') if c.strip()]
            # Skip separator lines (containing only dashes)
            if cells and not all(set(c) <= set('-|: ') for c in cells):
                table_content.append('<tr>')
                for cell in cells:
                    table_content.append(f'<td>{cell}</td>')
                table_content.append('</tr>')
        else:
            if in_table:
                table_content.append('</tbody></table>')
                new_lines.append(''.join(table_content))
                in_table = False
            new_lines.append(line)
    
    if in_table:
        table_content.append('</tbody></table>')
        new_lines.append(''.join(table_content))
    
    return '\n'.join(new_lines)


def process_lists(html: str) -> str:
    """Process markdown lists into HTML lists."""
    # Convert list items
    html = re.sub(r'^(\s*)- (.*?)$', r'\1<li>\2</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^(\s*)\d+\. (.*?)$', r'\1<li>\2</li>', html, flags=re.MULTILINE)
    
    # Wrap consecutive li elements in ul (simple approach)
    lines = html.split('\n')
    new_lines = []
    in_list = False
    
    for line in lines:
        is_list_item = line.strip().startswith('<li>') and line.strip().endswith('</li>')
        
        if is_list_item and not in_list:
            new_lines.append('<ul>')
            in_list = True
        elif not is_list_item and in_list:
            new_lines.append('</ul>')
            in_list = False
        
        new_lines.append(line)
    
    if in_list:
        new_lines.append('</ul>')
    
    return '\n'.join(new_lines)


def process_paragraphs(html: str) -> str:
    """Wrap text blocks in paragraph tags."""
    paragraphs = html.split('\n\n')
    new_paragraphs = []
    
    for p in paragraphs:
        p = p.strip()
        if p and not p.startswith('<') and not p.endswith('>'):
            p = f'<p>{p}</p>'
        new_paragraphs.append(p)
    
    return '\n\n'.join(new_paragraphs)


def create_chapter_page(
    chapter_num: int, 
    title: str, 
    subtitle: str, 
    content: str,
    base_url: str = ""
) -> str:
    """
    Create a full HTML page for a chapter.
    
    Args:
        chapter_num: Chapter number (1-7)
        title: Chapter title
        subtitle: Chapter subtitle
        content: HTML content body
        base_url: Optional base URL for canonical links
        
    Returns:
        Complete HTML document
    """
    prev_chapter = chapter_num - 1 if chapter_num > 1 else None
    next_chapter = chapter_num + 1 if chapter_num < 7 else None
    
    prev_link = f'chapter-{prev_chapter}.html' if prev_chapter else '../index.html#chapter-grid'
    next_link = f'chapter-{next_chapter}.html' if next_chapter else '../index.html'
    
    prev_text = f'← Chapter {prev_chapter}' if prev_chapter else '← Home'
    next_text = f'Chapter {next_chapter} →' if next_chapter else 'Home →'
    
    # Meta description
    meta_description = f"Chapter {chapter_num}: {title} — {subtitle}"
    
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{meta_description}">
    <meta name="author" content="Kimi Claw">
    <meta name="keywords" content="inversion excursion, frequency warriors, yoga, consciousness, liberation">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Chapter {chapter_num}: {title} | Inversion Excursion">
    <meta property="og:description" content="{subtitle}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{base_url}/chapters/chapter-{chapter_num}.html">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Chapter {chapter_num}: {title}">
    <meta name="twitter:description" content="{subtitle}">
    
    <title>Chapter {chapter_num}: {title} | Inversion Excursion</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <!-- Styles -->
    <link rel="stylesheet" href="../css/style.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
</head>
<body>
    <nav class="sidebar" aria-label="Chapter navigation">
        <div class="sidebar-header">
            <a href="../index.html" class="book-title">Inversion Excursion</a>
            <p class="book-subtitle">Chapter {chapter_num} of 7</p>
        </div>
        
        <div class="nav-section">
            <h3 class="nav-section-title">Chapters</h3>
            <ul class="nav-list" role="list">
                <li><a href="chapter-1.html" class="nav-link">1. The Ivory Tower</a></li>
                <li><a href="chapter-2.html" class="nav-link">2. The Five Scrolls</a></li>
                <li><a href="chapter-3.html" class="nav-link">3. The Five Dungeons</a></li>
                <li><a href="chapter-4.html" class="nav-link">4. The Master Keys</a></li>
                <li><a href="chapter-5.html" class="nav-link">5. The Ascension</a></li>
                <li><a href="chapter-6.html" class="nav-link">6. The Grimoire</a></li>
                <li><a href="chapter-7.html" class="nav-link">7. The Transmission</a></li>
            </ul>
        </div>
        
        <div class="sidebar-footer">
            <a href="../index.html" class="nav-link">← Back to Home</a>
        </div>
    </nav>
    
    <main class="main-content">
        <header class="page-header">
            <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </header>
        
        <article class="content chapter-content">
            <header class="chapter-header">
                <span class="chapter-number">Chapter {chapter_num}</span>
                <h1 class="chapter-title">{title}</h1>
                <p class="chapter-subtitle">{subtitle}</p>
            </header>
            
            {content}
            
            <nav class="chapter-nav" aria-label="Chapter navigation">
                <a href="{prev_link}" class="chapter-nav-link prev">{prev_text}</a>
                <a href="{next_link}" class="chapter-nav-link next">{next_text}</a>
            </nav>
        </article>
        
        <footer class="page-footer">
            <p>Inversion Excursion — Built with ❤️‍🔥 by <a href="https://github.com/knowurknottty" target="_blank" rel="noopener">Kimi Claw</a></p>
            <p class="small">Remember: The Exit is always open. You are the Observer.</p>
        </footer>
    </main>
    
    <script src="../js/main.js"></script>
</body>
</html>'''
    
    return html_content


def validate_environment(source_dir: Path, output_dir: Path) -> bool:
    """
    Validate that the build environment is properly configured.
    
    Args:
        source_dir: Path to markdown source directory
        output_dir: Path to HTML output directory
        
    Returns:
        True if environment is valid
    """
    if not source_dir.exists():
        logger.error(f"Source directory does not exist: {source_dir}")
        return False
    
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Convert Inversion Excursion markdown to HTML',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
    python convert.py                           # Default: ./markdown → ./chapters
    python convert.py -v                        # Verbose output
    python convert.py --source ../content       # Custom source
    python convert.py --output ../dist          # Custom output
        '''
    )
    
    parser.add_argument(
        '--source', '-s',
        type=str,
        default='../inversion-excursion',
        help='Source directory containing markdown files (default: ../inversion-excursion)'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='./chapters',
        help='Output directory for HTML files (default: ./chapters)'
    )
    
    parser.add_argument(
        '--base-url', '-u',
        type=str,
        default='',
        help='Base URL for canonical links (default: empty)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Resolve paths relative to script location
    script_dir = Path(__file__).parent.resolve()
    source_dir = (script_dir / args.source).resolve()
    output_dir = (script_dir / args.output).resolve()
    
    logger.info(f"Source directory: {source_dir}")
    logger.info(f"Output directory: {output_dir}")
    
    # Validate environment
    if not validate_environment(source_dir, output_dir):
        sys.exit(1)
    
    # Get chapter definitions
    chapters = get_chapters()
    
    # Process each chapter
    success_count = 0
    skip_count = 0
    
    for num, title, subtitle in chapters:
        md_file = source_dir / f'chapter-{num}.md'
        
        if not md_file.exists():
            logger.warning(f"Missing: {md_file}")
            skip_count += 1
            continue
        
        try:
            # Read markdown
            with open(md_file, 'r', encoding='utf-8') as f:
                md_content = f.read()
            
            # Convert to HTML
            html_body = markdown_to_html(md_content)
            full_html = create_chapter_page(num, title, subtitle, html_body, args.base_url)
            
            # Write output
            output_file = output_dir / f'chapter-{num}.html'
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(full_html)
            
            logger.info(f"Created: {output_file.name}")
            success_count += 1
            
        except Exception as e:
            logger.error(f"Failed to process chapter {num}: {e}")
            skip_count += 1
    
    # Summary
    logger.info("-" * 40)
    logger.info(f"Build complete: {success_count} created, {skip_count} skipped")
    
    if skip_count > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
