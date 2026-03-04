#!/usr/bin/env python3
"""
Inversion Excursion - Art Asset Generator
Creates placeholder art assets for the intro sequence
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def create_snes_boot():
    """SNES-style boot screen"""
    img = Image.new('RGB', (1920, 1080), color=(0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # SNES purple color
    snes_purple = (120, 80, 160)
    
    # Try to use a pixel-style font, fallback to default
    try:
        font_large = ImageFont.truetype("arial.ttf", 72)
        font_small = ImageFont.truetype("arial.ttf", 36)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw SNES text
    text1 = "SUPER NINTENDO"
    text2 = "ENTERTAINMENT SYSTEM"
    
    # Center text
    bbox1 = draw.textbbox((0, 0), text1, font=font_large)
    bbox2 = draw.textbbox((0, 0), text2, font=font_large)
    
    x1 = (1920 - (bbox1[2] - bbox1[0])) // 2
    x2 = (1920 - (bbox2[2] - bbox2[0])) // 2
    
    y1 = 420
    y2 = 520
    
    draw.text((x1, y1), text1, fill=snes_purple, font=font_large)
    draw.text((x2, y2), text2, fill=snes_purple, font=font_large)
    
    # TM symbol
    draw.text((x2 + (bbox2[2] - bbox2[0]) + 10, y2 - 20), "™", fill=snes_purple, font=font_small)
    
    return img

def create_void_background():
    """Deep cosmic void background"""
    img = Image.new('RGB', (1920, 1080), color=(15, 10, 30))
    draw = ImageDraw.Draw(img)
    
    # Create radial gradient
    for y in range(1080):
        for x in range(1920):
            # Distance from center
            dx = x - 960
            dy = y - 540
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Normalize distance
            t = min(dist / 800, 1.0)
            
            # Gradient from dark center to slightly lighter edges
            r = int(15 + t * 20)
            g = int(10 + t * 15)
            b = int(30 + t * 40)
            
            img.putpixel((x, y), (r, g, b))
    
    # Add some stars
    import random
    random.seed(42)
    for _ in range(200):
        x = random.randint(0, 1919)
        y = random.randint(0, 1079)
        brightness = random.randint(100, 255)
        size = random.choice([1, 1, 1, 2, 2, 3])
        
        if size == 1:
            img.putpixel((x, y), (brightness, brightness, brightness))
        else:
            draw.ellipse([x-size, y-size, x+size, y+size], 
                        fill=(brightness, brightness, brightness))
    
    return img

def create_title_background():
    """Ethereal title screen background with mandala pattern"""
    img = Image.new('RGB', (1920, 1080), color=(20, 15, 10))
    draw = ImageDraw.Draw(img)
    
    # Create gradient background
    for y in range(1080):
        t = y / 1080
        r = int(20 + t * 100)
        g = int(15 + t * 70)
        b = int(10 + t * 30)
        draw.line([(0, y), (1919, y)], fill=(r, g, b))
    
    # Draw flower of life pattern (simplified)
    center_x, center_y = 960, 540
    
    # Draw overlapping circles
    gold = (253, 224, 71)
    for radius in [100, 150, 200, 250, 300]:
        for i in range(6):
            angle = (i / 6) * 2 * math.pi
            x = center_x + math.cos(angle) * radius * 0.5
            y = center_y + math.sin(angle) * radius * 0.5
            
            # Draw circle outline
            draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                        outline=(*gold, 30), width=1)
    
    # Central glow
    for r in range(400, 0, -10):
        alpha = int(255 * (1 - r/400) * 0.1)
        color = (253, 224, 71)
        draw.ellipse([center_x-r, center_y-r, center_x+r, center_y+r], 
                    fill=(*color, alpha))
    
    return img

def create_character_silhouette():
    """Abstract character silhouette"""
    img = Image.new('RGBA', (512, 512), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw abstract humanoid shape
    center_x, center_y = 256, 256
    
    # Body gradient - from dark to glowing edges
    for y in range(512):
        for x in range(512):
            dx = x - center_x
            dy = y - center_y
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Create silhouette shape (oval with noise)
            if dist < 200:
                # Purple glow at edges
                edge_dist = dist / 200
                if edge_dist > 0.8:
                    glow = (edge_dist - 0.8) / 0.2
                    r = int(196 * glow)
                    g = int(181 * glow)
                    b = int(253 * glow)
                    alpha = int(255 * glow * 0.5)
                    img.putpixel((x, y), (r, g, b, alpha))
                else:
                    # Dark interior
                    darkness = 1 - edge_dist
                    val = int(30 * darkness)
                    img.putpixel((x, y), (val, val, val, int(200 * darkness)))
    
    return img

def create_dialogue_box():
    """Semi-transparent dialogue box"""
    img = Image.new('RGBA', (800, 200), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Main box
    box_color = (10, 10, 15, 180)
    border_color = (139, 92, 246, 255)  # Purple
    
    # Draw rounded rectangle (simplified as regular rect with corners)
    draw.rectangle([10, 10, 790, 190], fill=box_color, outline=border_color, width=3)
    
    # Corner accents
    accent_size = 20
    draw.line([(5, 5), (5, 5+accent_size)], fill=border_color, width=3)
    draw.line([(5, 5), (5+accent_size, 5)], fill=border_color, width=3)
    
    draw.line([(795, 5), (795, 5+accent_size)], fill=border_color, width=3)
    draw.line([(795, 5), (795-accent_size, 5)], fill=border_color, width=3)
    
    draw.line([(5, 195), (5, 195-accent_size)], fill=border_color, width=3)
    draw.line([(5, 195), (5+accent_size, 195)], fill=border_color, width=3)
    
    draw.line([(795, 195), (795, 195-accent_size)], fill=border_color, width=3)
    draw.line([(795, 195), (795-accent_size, 195)], fill=border_color, width=3)
    
    return img

def create_press_start():
    """PRESS START text"""
    img = Image.new('RGBA', (400, 100), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 48)
    except:
        font = ImageFont.load_default()
    
    # Gold color with glow effect
    gold = (253, 224, 71)
    
    text = "PRESS START"
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (400 - (bbox[2] - bbox[0])) // 2
    y = (100 - (bbox[3] - bbox[1])) // 2
    
    # Draw glow
    for offset in range(5, 0, -1):
        alpha = int(50 / offset)
        glow_color = (*gold, alpha)
        draw.text((x-offset, y), text, fill=glow_color, font=font)
        draw.text((x+offset, y), text, fill=glow_color, font=font)
        draw.text((x, y-offset), text, fill=glow_color, font=font)
        draw.text((x, y+offset), text, fill=glow_color, font=font)
    
    # Main text
    draw.text((x, y), text, fill=(*gold, 255), font=font)
    
    return img

def main():
    """Generate all art assets"""
    print("Inversion Excursion - Art Asset Generator")
    print("=" * 50)
    
    assets_dir = "assets/textures"
    
    # Create SNES boot
    print("Creating SNES boot screen...")
    snes_boot = create_snes_boot()
    ensure_dir(f"{assets_dir}/snes_boot.png")
    snes_boot.save(f"{assets_dir}/snes_boot.png")
    print("  [OK] assets/textures/snes_boot.png")
    
    # Create void background
    print("Creating void background...")
    void_bg = create_void_background()
    void_bg.save(f"{assets_dir}/void_bg.png")
    print("  [OK] assets/textures/void_bg.png")
    
    # Create title background
    print("Creating title background...")
    title_bg = create_title_background()
    title_bg.save(f"{assets_dir}/title_bg.png")
    print("  [OK] assets/textures/title_bg.png")
    
    # Create character silhouette
    print("Creating character silhouette...")
    character = create_character_silhouette()
    character.save(f"{assets_dir}/character_silhouette.png")
    print("  [OK] assets/textures/character_silhouette.png")
    
    # Create dialogue box
    print("Creating dialogue box...")
    dialogue = create_dialogue_box()
    dialogue.save(f"{assets_dir}/dialogue_box.png")
    print("  [OK] assets/textures/dialogue_box.png")
    
    # Create press start
    print("Creating press start...")
    press_start = create_press_start()
    press_start.save(f"{assets_dir}/press_start.png")
    print("  [OK] assets/textures/press_start.png")
    
    print("=" * 50)
    print("All art assets generated successfully!")
    print(f"Assets saved to: {assets_dir}/")

if __name__ == "__main__":
    main()
