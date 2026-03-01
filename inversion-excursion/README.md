# Inversion Excursion - Intro Sequence

A cinematic intro sequence for the spiritual awakening action-adventure RPG "Inversion Excursion".

## Overview

This intro captures the essence of the game: the journey from the mundane (represented by the SNES boot) to the existential question of identity, followed by a psychedelic awakening spiral into the game world.

## Sequence Breakdown

### Phase 1: SNES Boot (0-3s)
- Classic Super Nintendo startup screen
- "SUPER NINTENDO ENTERTAINMENT SYSTEM" with trademark
- Authentic purple/grey color scheme
- Sets the "modded SNES" aesthetic

### Phase 2: Cartridge Insert (3-5s)
- Glitch/flash transition effect
- Electrical contact sound
- Brief static burst
- Symbolizes the game "coming to life"

### Phase 3: Title Reveal (5-7s)
- "INVERSION EXCURSION" dramatic appearance
- "A Spiritual Awakening" subtitle
- Chromatic aberration for "modded" feel
- Epic musical cue

### Phase 4: The Question (7-12s)
- Dark void background with cosmic elements
- Abstract character silhouette
- Ethereal voice asks: "Who are you?"
- Sets up the game's central theme

### Phase 5: The Pondering (12-16s)
- Character internally responds: "Hmmm... who or even what is I?"
- Subtle zoom on character
- Rising tension in music
- Shows the shift from assumed identity to questioning

### Phase 6: The Spiral (16-22s)
- Psychedelic tunnel shader effect
- Gold, purple, and white colors (Source World aesthetic)
- Pulls the viewer toward the center
- Builds to white flash crescendo

### Phase 7: Title Screen (22s+)
- Ethereal golden background with mandala pattern
- Title logo
- Blinking "PRESS START"
- Main theme music plays
- Awaits player input

## Technical Specifications

- **Engine:** Godot 4.x
- **Resolution:** 1920x1080
- **Art Style:** Pixel art aesthetic on modern resolution ("HD-2D")
- **Audio:** 48kHz/24-bit WAV, OGG for music

## Controls

- **START / ENTER / SPACE:** Begin the journey (on title screen)
- **ESCAPE:** Skip intro (any time)

## Project Structure

```
intro_sequence/
├── project.godot           # Godot project configuration
├── default_bus_layout.tres # Audio bus configuration
├── README.md               # This file
├── scenes/
│   └── intro.tscn         # Main intro scene
├── scripts/
│   ├── intro_controller.gd    # Sequence controller
│   └── video_recorder.gd      # Recording utility
├── shaders/
│   ├── spiral_tunnel.gdshader # Psychedelic tunnel effect
│   └── chromatic_aberration.gdshader # Color separation effect
├── assets/
│   ├── textures/          # Generated art assets
│   └── sprites/           # Character sprites
├── audio/
│   ├── music/            # Music tracks (to be added)
│   ├── sfx/              # Sound effects (to be added)
│   └── voice/            # Voice lines (to be added)
└── create_art_assets.py  # Art generation script

```

## Running the Project

1. Open `project.godot` in Godot 4.2 or later
2. Press F5 to run the intro
3. The sequence will play automatically

## Generating Art Assets

```bash
python create_art_assets.py
```

This will generate placeholder textures in `assets/textures/`.

## Recording Video

The project includes a video recording utility. Enable recording by:

1. Adding the `video_recorder.gd` script to a node
2. Setting `recording = true` in the inspector
3. Running the project
4. Frames will be saved to `user://recording/`

Convert to video using FFmpeg:
```bash
ffmpeg -framerate 60 -i frame_%06d.png -c:v libx264 -pix_fmt yuv420p intro.mp4
```

## Customization

### Spiral Shader Parameters

The spiral tunnel effect can be customized via shader parameters:

- `progress` (0-1): Animation progress
- `speed`: Rotation speed
- `spiral_arms` (3-12): Number of spiral arms
- `spiral_tightness`: How tightly wound the spiral is
- `color_primary`: Main color (default: gold)
- `color_secondary`: Secondary color (default: purple)
- `color_tertiary`: Accent color (default: white)
- `intensity`: Overall brightness
- `tunnel_depth`: Perceived depth

### Timing

Edit `intro_controller.gd` to adjust phase durations:

```gdscript
await get_tree().create_timer(3.0).timeout  # Change duration
```

## Credits

Created for Inversion Excursion
A game about spiritual awakening and the journey from deception to truth

## Thematic Alignment

This intro embodies the game's core philosophy:

> "The question is more important than the answer. The seeking IS the finding."

The sequence mirrors the player's journey:
1. **Comfortable familiarity** (SNES boot)
2. **Disruption** (cartridge insert)
3. **Identity questioned** ("Who are you?")
4. **Awakening begins** (the spiral)
5. **New reality** (title screen)

---

*"Everything wanted to know itself, so it exploded into everything we experience..."*
