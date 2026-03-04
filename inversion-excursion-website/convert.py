#!/usr/bin/env python3
"""Convert Inversion Excursion markdown chapters to HTML"""

import re
import os

def markdown_to_html(md_content):
    """Basic markdown to HTML conversion"""
    html = md_content
    
    # Headers
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Bold and italic
    html = re.sub(r'\*\*\*\*(.*?)\*\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*\*(.*?)\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Blockquotes
    html = re.sub(r'^\u003e (.*?)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)
    
    # Horizontal rules
    html = re.sub(r'^---+$', r'<hr>', html, flags=re.MULTILINE)
    
    # Tables (simplified)
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
            if cells and not all('-' in c for c in cells):
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
    
    html = '\n'.join(new_lines)
    
    # Lists
    html = re.sub(r'^(\s*)- (.*?)$', r'\1<li>\2</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^(\s*)\d+\. (.*?)$', r'\1<li>\2</li>', html, flags=re.MULTILINE)
    
    # Wrap consecutive li elements in ul
    html = re.sub(r'(<li>.*?</li>\n)+', lambda m: f'<ul>\n{m.group(0)}</ul>\n', html, flags=re.DOTALL)
    
    # Paragraphs
    paragraphs = html.split('\n\n')
    new_paragraphs = []
    for p in paragraphs:
        p = p.strip()
        if p and not p.startswith('<'):
            p = f'<p>{p}</p>'
        new_paragraphs.append(p)
    html = '\n\n'.join(new_paragraphs)
    
    # Visual markers
    html = re.sub(r'\[VISUAL: (.*?)\]', r'<div class="visual-marker"><span class="visual-label">Visual</span>\1</div>', html)
    
    return html

def create_chapter_page(chapter_num, title, subtitle, content):
    """Create a full HTML page for a chapter"""
    
    prev_chapter = chapter_num - 1 if chapter_num > 1 else None
    next_chapter = chapter_num + 1 if chapter_num < 7 else None
    
    prev_link = f'chapter-{prev_chapter}.html' if prev_chapter else '../index.html#chapter-grid'
    next_link = f'chapter-{next_chapter}.html' if next_chapter else '../index.html'
    
    prev_text = f'← Chapter {prev_chapter}' if prev_chapter else '← Home'
    next_text = f'Chapter {next_chapter} →' if next_chapter else 'Home →'
    
    html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter {chapter_num}: {title} | Inversion Excursion</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="sidebar">
        <div class="sidebar-header">
            <a href="../index.html" class="book-title">Inversion Excursion</a>
            <p class="book-subtitle">Chapter {chapter_num} of 7</p>
        </div>
        
        <div class="nav-section">
            <h3 class="nav-section-title">Chapters</h3>
            <ul class="nav-list">
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
            <button class="menu-toggle" aria-label="Toggle navigation">
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
            
            <nav class="chapter-nav">
                <a href="{prev_link}" class="chapter-nav-link prev">{prev_text}</a>
                <a href="{next_link}" class="chapter-nav-link next">{next_text}</a>
            </nav>
        </article>
        
        <footer class="page-footer">
            <p>Inversion Excursion — Built with ❤️‍🔥 by Kimi Claw</p>
        </footer>
    </main>
    
    <script src="../js/main.js"></script>
</body>
</html>'''
    
    return html_content

def main():
    chapters_dir = '/root/.openclaw/workspace/inversion-excursion'
    output_dir = '/root/.openclaw/workspace/inversion-excursion-website/chapters'
    
    chapters = [
        (1, "The Ivory Tower", "How We Became Pieces in a Game We Never Agreed to Play"),
        (2, "The Five Scrolls", "The Elemental Keys That Open What Was Never Locked"),
        (3, "The Five Dungeons", "The Ten Mudrās of Liberation"),
        (4, "The Keys to Freedom", "The Master Keys: Khecarī and Vajrolī"),
        (5, "The Ascension", "The Advanced Practice Manual for Frequency Warriors"),
        (6, "The Grimoire & WYRD Mastery", "Or: The Living Magic of Conscious Language"),
        (7, "The Transmission", "Or: The Sacred Passing of Knowledge to Those Who Come After"),
    ]
    
    for num, title, subtitle in chapters:
        md_file = f'{chapters_dir}/chapter-{num}.md'
        if os.path.exists(md_file):
            with open(md_file, 'r') as f:
                md_content = f.read()
            
            html_body = markdown_to_html(md_content)
            full_html = create_chapter_page(num, title, subtitle, html_body)
            
            output_file = f'{output_dir}/chapter-{num}.html'
            with open(output_file, 'w') as f:
                f.write(full_html)
            
            print(f'Created: chapter-{num}.html')
        else:
            print(f'Missing: chapter-{num}.md')

if __name__ == '__main__':
    main()
