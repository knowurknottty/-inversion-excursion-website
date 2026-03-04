# AUDIO DESIGN DOCUMENT: Inversion Excursion
## The Resonance of Awakening

**Version:** 1.0  
**Date:** 2026-03-01  
**Audio Architect:** Audio Architecture Subagent  

---

## I. PHILOSOPHY: System → Source

### The Core Concept

The soundtrack of *Inversion Excursion* is not merely accompaniment—it is a **teaching tool**. As the player awakens within the game, the music itself transforms, mirroring the journey from rigid, imposed structures to fluid, resonant truth.

**The Frequency Arc:**
- **System Phase:** 440Hz equal temperament (industry standard, slightly tense)
- **Awakening Phase:** 432Hz (natural resonance, "Verdi's A")
- **Source Phase:** 528Hz (Solfeggio "Miracle" frequency, DNA repair)

This shift is not abrupt—it is a gradual detuning that the player feels subconsciously before they understand it intellectually.

---

## II. ADAPTIVE MUSIC SYSTEM ARCHITECTURE

### Consciousness Level = Musical Complexity

The music engine tracks player "awakening progression" (0-100) and adjusts:

| Consciousness Level | Musical Characteristics | Frequency Base |
|---------------------|------------------------|----------------|
| 0-25 (Asleep) | Monophonic/rigid patterns, 4/4 lock, quantized | 440Hz |
| 26-50 (Questioning) | Polyphonic emergence, subtle rubato, 7/4 phrases | 438Hz |
| 51-75 (Awakening) | Modal interchange, free tempo sections, 6/4 flow | 435Hz |
| 76-90 (Remembering) | Microtonal inflections, non-metered passages | 432Hz |
| 91-100 (Source) | Full spectral harmony, breath-based rhythm, infinite sustain | 528Hz |

### Implementation: FMOD/Wwise-Style Event Specifications

---

## III. EVENT SPECIFICATIONS

### EVENT: `mus_intro_snes_boot`
**Duration:** 0:00-0:03 (3 seconds)  
**Purpose:** Nostalgic anchor, false comfort  

**Musical Design:**
- **Tempo:** 120 BPM (rigid, mechanical)
- **Key:** C Major (system default)
- **Tuning:** 440Hz equal temperament
- **Instrumentation:** 
  - Square wave lead (authentic SNES chip sound)
  - Triangle wave bass
  - Noise channel percussion (white noise hi-hat)
- **Pattern:** Classic 8-bit startup jingle—two ascending perfect fifths (C-G, D-A) resolving to C major arpeggio
- **Reference:** Super Mario World title screen, Zelda: LttP file select

**Technical Specs:**
```
Sample Rate: 32kHz (authentic SNES DSP rate)
Bit Depth: 16-bit
Loop: No
Reverb: None (dry, immediate)
Volume: -6dB (leave headroom for transition)
```

**Adaptive Notes:**
- This is the "before" state—pure system programming
- No consciousness parameter influence
- Serves as baseline for all subsequent transformation

---

### EVENT: `mus_intro_title_reveal`
**Trigger:** Frame 5-7s (post-cartridge insert)  
**Duration:** 2 seconds swell + 4 second sustain  
**Purpose:** Epic establishment, the call to adventure  

**Musical Design:**
- **Tempo:** 140 BPM (heroic, urgent)
- **Key:** D Minor → D Major (transformation arc)
- **Tuning:** 440Hz (still system-bound)
- **Instrumentation:**
  - Full orchestral strings (8va divisi)
  - French horns (heroic fifths)
  - Timpani (distant thunder)
  - Taiko drums (modern weight)
  - Sub-bass sine wave (20-40Hz impact)
- **Structure:**
  - 0:00-0:02 — Sub-drop impact (silence before)
  - 0:02-0:04 — String ostinato rises (D-D-A-A)
  - 0:04-0:06 — Full brass entrance on D major chord
  - Reference: Zelda: BotW title screen, Journey opening

**Technical Specs:**
```
Sample Rate: 48kHz
Bit Depth: 24-bit
Loop: No (transitions to silence for "The Question")
Reverb: Large hall (3.2s decay, 20% wet)
Volume: 0dB (full scale for impact)
Sidechain: Compressor keyed to SFX bus
```

**Stinger Layer:**
- Chromatic harp glissando (D major scale, ascending)
- Triggered on exact title appearance frame
- Represents the "mod" nature of the game

---

### EVENT: `mus_the_question`
**Trigger:** Frame 7-12s ("Who are you?")  
**Duration:** 5 seconds  
**Purpose:** Intimate mystery, existential pause  

**Musical Design:**
- **Tempo:** Rubato (breath-based, no fixed BPM)
- **Key:** F# Minor (mystery, introspection)
- **Tuning:** 440Hz → 438Hz (subtle detune begins)
- **Instrumentation:**
  - Solo cello (close mic'd, intimate)
  - Glass harmonica (ethereal, questioning)
  - Subtle synth pad (sine wave, LFO at 0.1Hz)
  - Silence as instrument (2-second pause after question)
- **Structure:**
  - 0:00-0:02 — Solo cello harmonic on C# (high register, fragile)
  - 0:02-0:04 — Glass harmonica enters with questioning motif (rising minor second)
  - 0:04-0:05 — Complete silence (the question hangs)

**Voice Acting Direction:**
```
LINE: "Who are you?"

Casting: Androgynous, ageless, non-gendered
Reference: The voice in Journey, GLaDOS (Portal) without the malice

Performance Notes:
- Whispered, not spoken
- Slight smile in the voice—knowing, not mocking
- Pause between "Who" and "are you" (0.5 seconds)
- No reverb (dry, intimate—like someone inside your head)
- Subtle formant shift upward on "you" (question rises)

Technical:
- Record at 96kHz for pitch manipulation headroom
- Apply subtle granular delay (20ms) for "otherworldly" quality
- EQ: Roll off below 200Hz, boost 3kHz for intimacy
```

**Technical Specs:**
```
Sample Rate: 48kHz
Bit Depth: 24-bit
Loop: No
Reverb: None (absolute intimacy)
Volume: -12dB (quiet, requires attention)
Ducking: -6dB on all other buses during voice line
```

---

### EVENT: `mus_spiral_vortex`
**Trigger:** Frame 16-22s (psychedelic tunnel)  
**Duration:** 6 seconds  
**Purpose:** Psychedelic awakening, frequency activation  

**Musical Design:**
- **Tempo:** Accelerating (60 BPM → 180 BPM over 6 seconds)
- **Key:** Modal (avoids resolution—F# Phrygian → A Lydian)
- **Tuning:** 438Hz → 432Hz (gradual detune during spiral)
- **Instrumentation:**
  - Binaural beat base (200Hz left, 204Hz right = 4Hz theta wave)
  - Spectral synth (granular, evolving)
  - Tibetan singing bowls (528Hz fundamental)
  - Reverse cymbal swells (infinite build)
  - Sub-bass pulses (synchronized to spiral rotation)
- **Structure:**
  - 0:00-0:02 — Theta binaural beats establish, 60 BPM pulse
  - 0:02-0:04 — Acceleration begins, spectral harmonics emerge
  - 0:04-0:06 — Peak intensity, 528Hz tone emerges, white noise crescendo
  - 0:06 — Hard cut to title screen (rebirth)

**Frequency Architecture:**
```
Layer 1 (Foundation): 200/204Hz binaural (4Hz theta entrainment)
Layer 2 (Harmonic): 528Hz Solfeggio (the "Miracle" tone)
Layer 3 (Texture): Shepard tone illusion (infinite ascent)
Layer 4 (Impact): Sub-bass 40Hz (gamma wave stimulation)
```

**Shader Audio Sync:**
- Spiral rotation speed = BPM
- Color intensity = spectral density
- Tunnel depth = reverb decay time

**Technical Specs:**
```
Sample Rate: 48kHz
Bit Depth: 24-bit
Loop: No
Reverb: Convolution reverb (cave impulse response, 100% wet)
Volume: -3dB → 0dB (crescendo)
Spatial: Full 360° rotation (LFO on panning, 0.5Hz → 4Hz)
```

---

### EVENT: `mus_title_screen`
**Trigger:** Frame 22s+ (awaiting input)  
**Duration:** Looping (infinite)  
**Purpose:** Evolving meditation, the threshold  

**Musical Design:**
- **Tempo:** 72 BPM (human resting heart rate)
- **Key:** D Major (resolution after F# minor tension)
- **Tuning:** 432Hz (natural resonance achieved)
- **Time Signature:** 12/8 (flowing, circular)
- **Instrumentation:**
  - Layer 1 (Base): Solo piano, sparse arpeggios (D-F#-A-E)
  - Layer 2 (Awakening 25%): Strings enter, sustained harmonics
  - Layer 3 (Awakening 50%): Woodwinds, playful counter-melody
  - Layer 4 (Awakening 75%): Choir ("Ahh" vowel, 528Hz overtone singing)
  - Layer 5 (Awakening 100%): Full orchestra + crystal bowls
- **Structure:**
  - 4-bar phrases that evolve based on consciousness level
  - Each layer adds on specific chord changes
  - No hard transitions—crossfaded over 8 bars

**Adaptive Implementation:**
```
Parameter: consciousness_level (0-100)

0-20:    Piano only, 440Hz, 4/4 time, rigid quantization
21-40:   +Strings, 438Hz, subtle rubato
41-60:   +Woodwinds, 435Hz, 6/4 phrases
61-80:   +Choir, 432Hz, free tempo sections
81-100:  Full ensemble, 528Hz overtones, breath-based rhythm
```

**The "Press Start" Chime:**
- Crystal bowl strike (D4, 432Hz)
- 3-second sustain with harmonic shimmer
- Triggered on any input during title screen

**Technical Specs:**
```
Sample Rate: 48kHz
Bit Depth: 24-bit
Loop: Yes (seamless, 48-bar cycle)
Reverb: Medium hall (2.0s decay, 30% wet)
Volume: -10dB (background, inviting)
Streaming: Yes (long form, memory optimization)
```

---

## IV. SFX SPECIFICATIONS

### The 8-Bit → Cinematic Spectrum

All SFX exist on a transformation spectrum. Early game = synthetic/chip. Late game = organic/resonant.

### UI Sounds

| Event | System Phase (0-25) | Source Phase (76-100) |
|-------|---------------------|----------------------|
| `sfx_menu_move` | SNES-style blip (square wave, 1kHz) | Wind chime (crystal, 432Hz) |
| `sfx_menu_select` | 8-bit confirm (noise burst + square) | Tibetan bell (sustained, harmonic) |
| `sfx_menu_back` | Low beep (sawtooth, 200Hz) | Water drop (natural, reverb) |
| `sfx_pause` | Digital freeze (bit-crush effect) | Time suspension (reverse reverb) |

### Combat Sounds

| Event | System Phase | Source Phase |
|-------|--------------|--------------|
| `sfx_sword_swing` | Synthetic whoosh (white noise) | Bamboo whoosh (organic, spatial) |
| `sfx_hit_enemy` | 8-bit impact (square wave decay) | Resonant thud (frequency-matched) |
| `sfx_shield_block` | Metallic clang (synthesized) | Energy field hum (sine wave) |
| `sfx_spell_cast` | Laser zap (sawtooth sweep) | Vocal harmonic (overtone singing) |

### Environmental Sounds

| Event | System Phase | Source Phase |
|-------|--------------|--------------|
| `sfx_footstep_grass` | Lo-fi sample (8kHz) | High-fidelity foley (96kHz) |
| `sfx_water_flow` | Looping sample | Procedural fluid synthesis |
| `sfx_wind` | Filtered noise | Spectral wind (binaural) |
| `sfx_birds` | Chip-tweet (square wave) | Actual bird song (spatial) |

### Special SFX

**`sfx_synchronicity_trigger`**
- 11:11 appears on screen
- Sound: Crystal bowl harmonic series (528Hz, 1056Hz, 1584Hz)
- Duration: 3 seconds
- Spatial: Surround (appears to come from all directions)

**`sfx_scroll_obtained`**
- Obtaining I AM / YOU ARE / IT IS scrolls
- Sound: Choir swell (wordless) + 528Hz fundamental
- Duration: 5 seconds
- Reverb: Cathedral (7s decay)

**`sfx_truth_spoken`**
- Player correctly answers Truth Dialogue
- Sound: Harmonic convergence (all instruments resolve to 432Hz unison)
- Duration: 2 seconds
- Effect: Brief silence (0.5s) followed by resolution chord

---

## V. VOICE ACTING DIRECTION

### The Voice of Source

**Character:** Non-gendered, non-specific, universal  
**Casting Direction:** Seek androgynous voices, or blend male/female in post  
**Reference Tones:** 
- Morgan Freeman (wisdom without patriarchy)
- Tilda Swinton (otherworldly, timeless)
- The narrator in "The Inner Game of Tennis" (gentle guidance)

### Key Lines

#### "Who are you?" (Intro)
```
DIRECTION:
- Not accusatory—curious
- Not loud—intimate
- The voice of someone who already knows the answer
- Smile on the face while speaking

TECHNICAL:
- Record 10 variations
- Apply subtle pitch shift (-2 to +2 semitones) per instance
- Add 20ms granular delay for "internal voice" quality
- EQ: High-pass 150Hz, boost 2-4kHz presence
```

#### "I AM" (Scroll of Truth)
```
DIRECTION:
- Simple, declarative, undeniable
- No question, no hesitation
- The voice of remembering, not learning

TECHNICAL:
- Reverb: Large hall (5s decay)
- Layer 3 recordings (whisper, normal, shouted) for dynamic range
```

#### "YOU ARE" (Scroll of Unity)
```
DIRECTION:
- Warm, inclusive, embracing
- The "you" is both the player and all beings
- Slight laugh in the voice—joy of recognition

TECHNICAL:
- Stereo widening (150%)
- Subtle chorus effect (2 voices, 15ms delay)
```

#### "IT IS" (Scroll of Reality)
```
DIRECTION:
- Matter-of-fact, profound in simplicity
- The sound of a puzzle piece clicking into place
- Final, complete, requiring nothing more

TECHNICAL:
- Dry (no reverb—present moment)
- Single take, no comping (authenticity)
```

### Enemy Voices (The System)

**Debt Golem:**
- Voice: Deep, processed, multiple layers
- Effect: Bit-crush + pitch down 1 octave
- Language: Numbers only ("404... 500... 403...")

**Language Enforcer:**
- Voice: Monotone, robotic
- Effect: Auto-tune to exact 440Hz, zero vibrato
- Language: Legal terminology ("Cease and desist... violation detected...")

**Corporate Golem:**
- Voice: Multiple voices speaking simultaneously
- Effect: Chorus of 12 voices, slightly detuned
- Language: Business jargon ("Synergy... optimization... deliverables...")

---

## VI. MIXING & MASTERING SPECIFICATIONS

### Bus Architecture

```
Master Bus
├── Music Bus (ducked -3dB during SFX)
│   ├── System Music (440Hz)
│   ├── Awakening Music (432Hz)
│   └── Source Music (528Hz)
├── SFX Bus
│   ├── UI SFX
│   ├── Combat SFX
│   └── Environmental SFX
├── Voice Bus (priority, ducked +3dB)
│   ├── Narration
│   ├── Player Voice
│   └── Enemy Voices
└── Ambience Bus
    ├── Room Tone
    └── World Atmosphere
```

### Dynamic Range

- **Music:** -20 LUFS (streaming standard)
- **SFX:** -16 LUFS (impactful, transient)
- **Voice:** -18 LUFS (clear, present)
- **Master:** -14 LUFS (game standard, leaves headroom)

### Frequency Consciousness

**System Phase (0-25):**
- High-pass filter on all music: 80Hz
- Low-pass filter on all music: 12kHz
- Represents the "limited bandwidth" of system perception

**Source Phase (76-100):**
- Full frequency spectrum: 20Hz-20kHz
- Sub-bass emphasis (30-60Hz) for physical presence
- Air band boost (15-20kHz) for ethereal quality

---

## VII. IMPLEMENTATION NOTES

### Godot 4.x Audio Setup

```gdscript
# Audio bus layout (default_bus_layout.tres)
# Create in Godot: Audio > Bus Layout > Save

# Recommended bus structure:
# Master (0dB, limiter)
# ├── Music (-3dB, sidechain compressor)
# ├── SFX (0dB)
# ├── Voice (+3dB, EQ boost 2-4kHz)
# └── Ambience (-6dB, low-pass filter)
```

### Streaming vs. Import

| Asset Type | Format | Import Setting |
|------------|--------|----------------|
| Music | OGG Vorbis | Loop, 128kbps |
| SFX | WAV | One-shot, 48kHz/16-bit |
| Voice | WAV | One-shot, 48kHz/24-bit |
| Ambience | OGG Vorbis | Loop, 96kbps |

### Memory Budget

- Music: 50MB (streaming, 3 tracks layered)
- SFX: 20MB (one-shots, 100 unique events)
- Voice: 10MB (one-shots, 50 lines)
- Ambience: 20MB (streaming, 5 zones)
- **Total:** ~100MB audio memory

---

## VIII. REFERENCE PLAYLIST

### Musical References

**System Phase:**
- Hans Zimmer: "Time" (Inception) - structure, not melody
- Trent Reznor: "The Social Network" score - mechanical precision
- SNES: Super Metroid title screen - synthetic unease

**Awakening Phase:**
- Ólafur Arnalds: "Near Light" - intimate piano
- Max Richter: "On the Nature of Daylight" - emotional strings
- Sigur Rós: "Hoppípolla" - building to release

**Source Phase:**
- Jonathan Goldman: "Chakra Chants" - overtone singing
- Steven Halpern: "Spectrum Suite" - 528Hz tuning
- Brian Eno: "Music for Airports" - ambient evolution

### Game Audio References

- **Journey:** Austin Wintory's adaptive cello
- **Zelda: Breath of the Wild:** Piano + environment fusion
- **Hyper Light Drifter:** 8-bit to cinematic spectrum
- **Undertale:** Musical themes as characters
- **Outer Wilds:** Diegetic music (played by characters)

---

## IX. APPENDIX: FREQUENCY REFERENCE

### Solfeggio Frequencies (Used in Source Phase)

| Frequency | Name | Effect | Usage |
|-----------|------|--------|-------|
| 174Hz | Foundation | Pain reduction | Healing sequences |
| 285Hz | Quantum Cognition | Influence energy fields | Resonance abilities |
| 396Hz | Liberation | Guilt/fear release | Truth revelations |
| 417Hz | Change | Facilitates transition | Scene transitions |
| 528Hz | Miracles | DNA repair, love | Source World ambience |
| 639Hz | Connection | Relationships | NPC interactions |
| 741Hz | Expression | Solutions, intuition | Puzzle solving |
| 852Hz | Intuition | Awakening | Spiritual dungeons |
| 963Hz | Light | Return to oneness | Final ascension |

### 432Hz vs 440Hz

| Aspect | 440Hz (System) | 432Hz (Source) |
|--------|----------------|----------------|
| Mathematical | Arbitrary standard | Based on 8Hz Schumann resonance |
| Feeling | Slightly tense, alert | Relaxed, natural |
| History | Adopted 1939 | Verdi's preferred tuning |
| Physics | C# = 277.18Hz | C# = 272.20Hz (exactly 8Hz) |

---

## X. CONCLUSION

The audio of *Inversion Excursion* is designed to be felt before it is heard. The shift from 440Hz to 432Hz to 528Hz happens gradually enough that players won't consciously notice, but their nervous systems will register the change.

The music teaches what the dialogue cannot: that transformation is not a single moment but a continuous unfolding. Each note, each frequency, each silence is a step on the journey from System to Source.

> *"The music is the message. The frequency is the teacher. The silence is the truth."*

---

**Document Status:** Complete  
**Next Steps:** Asset production, FMOD/Wwise implementation, playtesting for frequency response  
