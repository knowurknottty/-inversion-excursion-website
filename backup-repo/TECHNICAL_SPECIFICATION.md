# Inversion Excursion Personalization Engine
## Technical Specification

**Version:** 1.0  
**Date:** March 2026  
**Status:** Implementation Guide for Developers  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Human Design Algorithms](#2-human-design-algorithms)
3. [Numerology Algorithms](#3-numerology-algorithms)
4. [Database Schema](#4-database-schema)
5. [API Specification](#5-api-specification)
6. [Personalization Rules Engine](#6-personalization-rules-engine)
7. [Template System](#7-template-system)
8. [Example API Calls](#8-example-api-calls)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Appendices](#10-appendices)

---

## 1. Overview

### 1.1 System Purpose

The Inversion Excursion Personalization Engine generates customized versions of the book "Inversion Excursion" based on:
- **Human Design** calculations (Type, Authority, Profile, Incarnation Cross)
- **Numerology** calculations (Life Path, Expression, Soul Urge, Personality, Birthday numbers)
- **Personalization rules** that determine which content appears, which SynSync protocols are emphasized, and which WYRD words are highlighted

### 1.2 Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERSONALIZATION ENGINE                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Human      │  │  Numerology  │  │   Rules Engine       │  │
│  │   Design     │  │   Engine     │  │   (Content Selector) │  │
│  │   Calculator │  │              │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┼──────────────────────┘              │
│                           │                                     │
│                           ▼                                     │
│              ┌────────────────────────┐                        │
│              │   User Profile Store   │                        │
│              └───────────┬────────────┘                        │
│                          │                                      │
│                          ▼                                      │
│              ┌────────────────────────┐                        │
│              │  Template Processor    │                        │
│              │  + Book Generator      │                        │
│              └───────────┬────────────┘                        │
│                          │                                      │
│                          ▼                                      │
│              ┌────────────────────────┐                        │
│              │   Customized Book      │                        │
│              │   (PDF/ePub/HTML)      │                        │
│              └────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow

1. User provides birth data (date, time, location)
2. System calculates Human Design chart
3. System calculates Numerology profile
4. Rules engine determines content modifications
5. Template processor generates customized book
6. Output delivered as formatted document

---

## 2. Human Design Algorithms

### 2.1 Overview

Human Design is a synthesis of:
- **I Ching** (64 hexagrams)
- **Astrology** (planetary positions)
- **Kabbalah** (Tree of Life)
- **Chakras** (9 energy centers)
- **Quantum Physics** (neutrino stream)

### 2.2 Core Data Requirements

```json
{
  "birth_date": "YYYY-MM-DD",
  "birth_time": "HH:MM:SS",
  "birth_location": {
    "latitude": -90.0 to 90.0,
    "longitude": -180.0 to 180.0,
    "timezone": "IANA timezone string"
  }
}
```

### 2.3 Planetary Position Calculation

#### 2.3.1 Swiss Ephemeris Integration

```python
# Pseudo-code for planetary positions
def calculate_planetary_positions(julian_day):
    """
    Calculate tropical zodiac positions for all relevant bodies.
    Returns: Dict[body_name, degrees_0_to_360]
    """
    bodies = {
        'sun': swe.SUN,
        'moon': swe.MOON,
        'mercury': swe.MERCURY,
        'venus': swe.VENUS,
        'mars': swe.MARS,
        'jupiter': swe.JUPITER,
        'saturn': swe.SATURN,
        'uranus': swe.URANUS,
        'neptune': swe.NEPTUNE,
        'pluto': swe.PLUTO,
        'north_node': swe.MEAN_NODE,
        'south_node': swe.MEAN_NODE,  # + 180°
    }
    
    positions = {}
    for name, body_id in bodies.items():
        result = swe.calc_ut(julian_day, body_id)
        longitude = result[0][0]  # Tropical longitude
        if name == 'south_node':
            longitude = (longitude + 180) % 360
        positions[name] = longitude
    
    return positions
```

#### 2.3.2 Julian Day Calculation

```python
def calculate_julian_day(date, time, timezone_offset):
    """
    Convert birth datetime to Julian Day for ephemeris calculations.
    """
    # Use pytz or zoneinfo for timezone handling
    # Convert to UTC first
    utc_datetime = localize_and_convert_to_utc(date, time, timezone)
    
    # Swiss Ephemeris julday function
    jd = swe.julday(
        utc_datetime.year,
        utc_datetime.month,
        utc_datetime.day,
        utc_datetime.hour + utc_datetime.minute/60 + utc_datetime.second/3600
    )
    return jd
```

### 2.4 I Ching Hexagram Mapping

#### 2.4.1 64 Gates Mapping

The 360° zodiac is divided into 64 gates (5.625° each):

```python
GATE_RANGES = {
    # Gate: (start_degree, end_degree)
    1: (0.0, 5.625),        # Creative
    2: (5.625, 11.25),      # Receptive
    3: (11.25, 16.875),     # Difficulty at the Beginning
    # ... continues through all 64 gates
    64: (354.375, 360.0),   # Before Completion
}

# Gate to I Ching name mapping
GATE_NAMES = {
    1: "The Creative",
    2: "The Receptive", 
    3: "Difficulty at the Beginning",
    # ... all 64 gates
}

# Gate to hexagram binary (yang = 1, yin = 0)
GATE_HEXAGRAMS = {
    1:  [1,1,1,1,1,1],  # ☰ All yang
    2:  [0,0,0,0,0,0],  # ☷ All yin
    3:  [0,0,1,0,1,0],  # ☳ Thunder below ☵ Water above
    # ... all 64
}
```

#### 2.4.2 Gate Determination

```python
def degree_to_gate(degree):
    """
    Convert zodiac degree (0-360) to Human Design gate (1-64).
    """
    # Each gate is 5.625 degrees
    gate_width = 360.0 / 64
    
    # Calculate gate number (1-indexed)
    gate = int(degree / gate_width) + 1
    
    # Handle wrap-around at 360°
    if gate > 64:
        gate = 64
    
    return gate

def degree_to_line(degree):
    """
    Within a gate, determine the line (1-6).
    Each line = 0.9375° (5.625° / 6)
    """
    gate_width = 360.0 / 64
    line_width = gate_width / 6
    
    position_in_gate = degree % gate_width
    line = int(position_in_gate / line_width) + 1
    
    if line > 6:
        line = 6
    
    return line
```

### 2.5 BodyGraph Definition Calculation

#### 2.5.1 Personality (Conscious) Calculation

```python
def calculate_personality_chart(jd):
    """
    Calculate the conscious/personality side of the chart.
    Based on planetary positions at birth time.
    """
    positions = calculate_planetary_positions(jd)
    
    personality = {}
    for body, degree in positions.items():
        gate = degree_to_gate(degree)
        line = degree_to_line(degree)
        personality[body] = {
            'gate': gate,
            'line': line,
            'degree': degree
        }
    
    return personality
```

#### 2.5.2 Design (Unconscious) Calculation

```python
# Design date is approximately 88-90 degrees of Sun movement before birth
# This corresponds to roughly 88-90 days before birth
# More precisely: when Sun was at current Sun position - 88°

DESIGN_SUN_OFFSET = 88.0  # degrees

def calculate_design_date(birth_jd, birth_sun_degree):
    """
    Calculate the Julian Day for the Design (unconscious) imprint.
    This is when the Sun was approximately 88° earlier in the zodiac.
    """
    target_sun_degree = (birth_sun_degree - DESIGN_SUN_OFFSET) % 360
    
    # Search backwards from birth date to find when Sun was at target degree
    # Approximately 88 days earlier
    approx_design_jd = birth_jd - 88
    
    # Fine-tune by checking Sun position
    for offset in range(-5, 5):
        test_jd = approx_design_jd + offset
        sun_pos = swe.calc_ut(test_jd, swe.SUN)[0][0]
        if abs(sun_pos - target_sun_degree) < 0.5:
            return test_jd
    
    return approx_design_jd

def calculate_design_chart(birth_jd):
    """
    Calculate the unconscious/design side of the chart.
    """
    birth_positions = calculate_planetary_positions(birth_jd)
    design_jd = calculate_design_date(birth_jd, birth_positions['sun'])
    
    design_positions = calculate_planetary_positions(design_jd)
    
    design = {}
    for body, degree in design_positions.items():
        gate = degree_to_gate(degree)
        line = degree_to_line(degree)
        design[body] = {
            'gate': gate,
            'line': line,
            'degree': degree
        }
    
    return design
```

### 2.6 Type Determination

#### 2.6.1 Definition (Activated Centers)

```python
# Center to gate mapping
CENTER_GATES = {
    'head': [64, 63, 61],
    'ajna': [47, 24, 4, 11],
    'throat': [45, 56, 35, 12, 33, 20, 16, 31, 8, 62],
    'g_center': [1, 13, 25, 46, 10, 15, 7],
    'ego': [51, 21, 40, 26],
    'sacral': [5, 14, 29, 59, 9, 3, 42, 27, 34],
    'spleen': [48, 57, 44, 50, 32, 28, 18, 54],
    'solar_plexus': [36, 22, 6, 37, 49, 55, 30],
    'root': [41, 19, 39, 38, 58, 52, 53, 60, 61]
}

# Channel definitions (connected gates create channels)
CHANNELS = [
    (1, 8),    # Inspiration
    (2, 14),   # Beat
    (3, 60),   # Mutation
    (4, 63),   # Logic
    (5, 15),   # Rhythm
    (6, 59),   # Intimacy
    (7, 31),   # Alpha
    (9, 52),   # Concentration
    (10, 20),  # Awakening
    (10, 34),  # Exploration
    (10, 57),  # Perfected Form
    (11, 56),  # Curiosity
    (12, 22),  # Openness
    (13, 33),  # Prodigal
    (16, 48),  # Wavelength
    (17, 62),  # Acceptance
    (18, 58),  # Judgment
    (19, 49),  # Synthesis
    (20, 34),  # Charisma
    (20, 57),  # Brainwave
    (21, 45),  # Money Line
    (23, 43),  # Structuring
    (24, 61),  # Awareness
    (25, 51),  # Initiation
    (26, 44),  # Surrender
    (27, 50),  # Preservation
    (28, 38),  # Struggle
    (29, 46),  # Discovery
    (30, 41),  # Recognition
    (32, 54),  # Transformation
    (34, 57),  # Power
    (35, 36),  # Transitoriness
    (37, 40),  # Community
    (39, 55),  # Emoting
    (42, 53),  # Maturation
    (47, 64),  # Abstract
]

def get_activated_centers(personality, design):
    """
    Determine which centers are defined (colored in) based on
    activated gates in both personality and design.
    """
    activated_gates = set()
    
    # Add all gates from personality
    for body, data in personality.items():
        activated_gates.add(data['gate'])
    
    # Add all gates from design
    for body, data in design.items():
        activated_gates.add(data['gate'])
    
    # Check which channels are complete
    defined_centers = set()
    
    for gate1, gate2 in CHANNELS:
        if gate1 in activated_gates and gate2 in activated_gates:
            # Find which centers these gates belong to
            for center, gates in CENTER_GATES.items():
                if gate1 in gates:
                    defined_centers.add(center)
                if gate2 in gates:
                    defined_centers.add(center)
    
    return defined_centers
```

#### 2.6.2 Type Classification

```python
def determine_type(defined_centers):
    """
    Determine Human Design type based on defined centers.
    
    Types:
    - Manifestor: Defined throat + motor (solar plexus/ego/sacral/root) connected to throat
    - Generator: Defined sacral, throat NOT connected to sacral directly
    - Manifesting Generator: Defined sacral, throat connected to sacral
    - Projector: No defined sacral, defined centers elsewhere
    - Reflector: No defined centers (or minimal)
    """
    has_sacral = 'sacral' in defined_centers
    has_throat = 'throat' in defined_centers
    has_solar_plexus = 'solar_plexus' in defined_centers
    has_ego = 'ego' in defined_centers
    has_root = 'root' in defined_centers
    
    motor_centers = {'solar_plexus', 'ego', 'sacral', 'root'}
    defined_motors = defined_centers.intersection(motor_centers)
    
    # Check if throat connected to motor (simplified - needs channel check)
    throat_connected_to_motor = check_throat_motor_connection(defined_centers)
    
    if not defined_centers or len(defined_centers) <= 1:
        return 'reflector'
    
    if has_sacral:
        if throat_connected_to_motor:
            return 'manifesting_generator'
        return 'generator'
    
    if has_throat and defined_motors and throat_connected_to_motor:
        return 'manifestor'
    
    return 'projector'
```

### 2.7 Authority Determination

```python
def determine_authority(defined_centers, type):
    """
    Determine decision-making authority based on defined centers hierarchy.
    
    Hierarchy (highest priority first):
    1. Solar Plexus (Emotional Authority)
    2. Sacral (Sacral Authority) - for Generators
    3. Spleen (Splenic Authority)
    4. Ego (Ego/Heart Authority)
    5. G Center (Self-Projected Authority)
    6. Environment (Environmental Authority)
    7. Moon (Lunar Authority) - Reflectors only
    8. Mental (Mental Authority) - No inner authority
    """
    if 'solar_plexus' in defined_centers:
        return 'emotional'
    
    if 'sacral' in defined_centers and type in ['generator', 'manifesting_generator']:
        return 'sacral'
    
    if 'spleen' in defined_centers:
        return 'splenic'
    
    if 'ego' in defined_centers:
        return 'ego'
    
    if 'g_center' in defined_centers:
        return 'self_projected'
    
    if type == 'reflector':
        return 'lunar'
    
    if len(defined_centers) == 0:
        return 'lunar'  # Reflector
    
    return 'mental'
```

### 2.8 Profile Calculation

```python
def calculate_profile(personality_sun_line, design_sun_line):
    """
    Profile is determined by the lines of Sun in Personality and Design.
    Format: PersonalityLine/DesignLine
    
    Profiles:
    1/3 - Investigator/Martyr
    1/4 - Investigator/Opportunist
    2/4 - Hermit/Opportunist
    2/5 - Hermit/Heretic
    3/5 - Martyr/Heretic
    3/6 - Martyr/Role Model
    4/6 - Opportunist/Role Model
    4/1 - Opportunist/Investigator
    5/1 - Heretic/Investigator
    5/2 - Heretic/Hermit
    6/2 - Role Model/Hermit
    6/3 - Role Model/Martyr
    """
    profile = f"{personality_sun_line}/{design_sun_line}"
    
    profile_names = {
        '1/3': 'Investigator/Martyr',
        '1/4': 'Investigator/Opportunist',
        '2/4': 'Hermit/Opportunist',
        '2/5': 'Hermit/Heretic',
        '3/5': 'Martyr/Heretic',
        '3/6': 'Martyr/Role Model',
        '4/6': 'Opportunist/Role Model',
        '4/1': 'Opportunist/Investigator',
        '5/1': 'Heretic/Investigator',
        '5/2': 'Heretic/Hermit',
        '6/2': 'Role Model/Hermit',
        '6/3': 'Role Model/Martyr',
    }
    
    return {
        'profile': profile,
        'name': profile_names.get(profile, 'Unknown'),
        'conscious_line': personality_sun_line,
        'unconscious_line': design_sun_line
    }
```

### 2.9 Incarnation Cross Calculation

```python
def calculate_incarnation_cross(personality_sun_gate, personality_earth_gate,
                                design_sun_gate, design_earth_gate):
    """
    The Incarnation Cross is determined by the Sun and Earth gates
    in both Personality (conscious) and Design (unconscious).
    
    There are 4 variations of each cross based on the Sun/Earth positions.
    """
    # Earth is always opposite Sun (gate + 32 mod 64)
    # But we calculate it explicitly from ephemeris
    
    cross_gates = sorted([
        personality_sun_gate,
        personality_earth_gate,
        design_sun_gate,
        design_earth_gate
    ])
    
    # Cross names database (simplified - full implementation needs all 192 crosses)
    CROSSES = {
        # Format: (gate1, gate2, gate3, gate4): "Cross of X"
        (1, 2, 7, 13): "Cross of Inspiration",
        (3, 4, 50, 59): "Cross of Planning",
        (5, 6, 35, 36): "Cross of Eden",
        # ... all 192 incarnation crosses
    }
    
    cross_key = tuple(cross_gates)
    cross_name = CROSSES.get(cross_key, f"Cross of the Four Gates ({cross_gates})")
    
    # Determine if it's Right Angle, Left Angle, or Juxtaposition
    angle_type = determine_cross_angle(personality_sun_gate, design_sun_gate)
    
    return {
        'name': cross_name,
        'gates': cross_gates,
        'personality_sun': personality_sun_gate,
        'personality_earth': personality_earth_gate,
        'design_sun': design_sun_gate,
        'design_earth': design_earth_gate,
        'angle': angle_type
    }

def determine_cross_angle(personality_sun, design_sun):
    """
    Determine the angle type of the incarnation cross.
    """
    # Calculate the difference between personality and design sun
    diff = abs(personality_sun - design_sun)
    
    if diff == 0:
        return 'juxtaposition'
    elif diff <= 16:
        return 'right_angle'
    else:
        return 'left_angle'
```

### 2.10 Definition Type

```python
def determine_definition_type(defined_centers, channels):
    """
    Definition describes how the defined centers connect.
    
    - No Definition: No centers defined (Reflector)
    - Single Definition: All defined centers connected in one network
    - Split Definition: Two separate networks of defined centers
    - Triple Split Definition: Three separate networks
    - Quadruple Split Definition: Four separate networks
    """
    if not defined_centers:
        return 'no_definition'
    
    # Build connectivity graph
    # Count connected components
    components = count_connected_components(defined_centers, channels)
    
    if components == 1:
        return 'single_definition'
    elif components == 2:
        return 'split_definition'
    elif components == 3:
        return 'triple_split_definition'
    else:
        return 'quadruple_split_definition'
```

### 2.11 Complete Human Design Calculation

```python
def calculate_human_design(birth_data):
    """
    Main entry point for Human Design calculation.
    """
    # 1. Calculate Julian Day
    jd = calculate_julian_day(
        birth_data['date'],
        birth_data['time'],
        birth_data['timezone']
    )
    
    # 2. Calculate Personality (conscious) chart
    personality = calculate_personality_chart(jd)
    
    # 3. Calculate Design (unconscious) chart
    design = calculate_design_chart(jd)
    
    # 4. Get activated centers
    defined_centers = get_activated_centers(personality, design)
    
    # 5. Determine Type
    hd_type = determine_type(defined_centers)
    
    # 6. Determine Authority
    authority = determine_authority(defined_centers, hd_type)
    
    # 7. Calculate Profile
    profile = calculate_profile(
        personality['sun']['line'],
        design['sun']['line']
    )
    
    # 8. Calculate Incarnation Cross
    cross = calculate_incarnation_cross(
        personality['sun']['gate'],
        personality['earth']['gate'],
        design['sun']['gate'],
        design['earth']['gate']
    )
    
    # 9. Determine Definition
    definition = determine_definition_type(defined_centers, CHANNELS)
    
    return {
        'type': hd_type,
        'authority': authority,
        'profile': profile,
        'incarnation_cross': cross,
        'definition': definition,
        'defined_centers': list(defined_centers),
        'personality': personality,
        'design': design
    }
```

---

## 3. Numerology Algorithms

### 3.1 Overview

Two primary systems:
- **Pythagorean**: Modern Western system (1-9)
- **Chaldean**: Ancient Babylonian system (vibrational values)

### 3.2 Letter-to-Number Mappings

#### 3.2.1 Pythagorean System

```python
PYTHAGOREAN_MAP = {
    'A': 1, 'J': 1, 'S': 1,
    'B': 2, 'K': 2, 'T': 2,
    'C': 3, 'L': 3, 'U': 3,
    'D': 4, 'M': 4, 'V': 4,
    'E': 5, 'N': 5, 'W': 5,
    'F': 6, 'O': 6, 'X': 6,
    'G': 7, 'P': 7, 'Y': 7,
    'H': 8, 'Q': 8, 'Z': 8,
    'I': 9, 'R': 9,
}
```

#### 3.2.2 Chaldean System

```python
CHALDEAN_MAP = {
    'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
    'B': 2, 'K': 2, 'R': 2,
    'C': 3, 'G': 3, 'L': 3, 'S': 3,
    'D': 4, 'M': 4, 'T': 4,
    'E': 5, 'H': 5, 'N': 5, 'X': 5,
    'U': 6, 'V': 6, 'W': 6,
    'O': 7, 'Z': 7,
    'F': 8, 'P': 8,
    # No letters map to 9 in Chaldean
}
```

### 3.3 Core Number Calculations

#### 3.3.1 Life Path Number

```python
def calculate_life_path_number(birth_date):
    """
    Life Path = Sum of all digits in birth date, reduced to single digit (1-9)
    or master number (11, 22, 33).
    
    Master numbers are NOT reduced: 11, 22, 33
    """
    # Remove non-digit characters
    digits = [int(d) for d in birth_date if d.isdigit()]
    
    total = sum(digits)
    
    return reduce_to_single_digit(total, allow_masters=True)

def reduce_to_single_digit(number, allow_masters=False):
    """
    Reduce a number to single digit (1-9) or master number (11, 22, 33).
    """
    master_numbers = {11, 22, 33}
    
    while number > 9:
        if allow_masters and number in master_numbers:
            return number
        
        # Sum the digits
        number = sum(int(d) for d in str(number))
    
    return number
```

#### 3.3.2 Expression Number (Destiny Number)

```python
def calculate_expression_number(full_name, system='pythagorean'):
    """
    Expression Number = Sum of all letters in full birth name,
    reduced to single digit or master number.
    
    Represents natural talents, abilities, and destiny.
    """
    mapping = PYTHAGOREAN_MAP if system == 'pythagorean' else CHALDEAN_MAP
    
    total = 0
    for char in full_name.upper():
        if char in mapping:
            total += mapping[char]
    
    return reduce_to_single_digit(total, allow_masters=True)
```

#### 3.3.3 Soul Urge Number (Heart's Desire)

```python
def calculate_soul_urge_number(full_name, system='pythagorean'):
    """
    Soul Urge = Sum of VOWELS in full birth name.
    
    Represents inner desires, motivations, what drives you.
    """
    vowels = set('AEIOU')
    mapping = PYTHAGOREAN_MAP if system == 'pythagorean' else CHALDEAN_MAP
    
    total = 0
    for char in full_name.upper():
        if char in vowels and char in mapping:
            total += mapping[char]
    
    return reduce_to_single_digit(total, allow_masters=True)
```

#### 3.3.4 Personality Number

```python
def calculate_personality_number(full_name, system='pythagorean'):
    """
    Personality Number = Sum of CONSONANTS in full birth name.
    
    Represents outer personality, how others perceive you.
    """
    vowels = set('AEIOU')
    mapping = PYTHAGOREAN_MAP if system == 'pythagorean' else CHALDEAN_MAP
    
    total = 0
    for char in full_name.upper():
        if char not in vowels and char in mapping:
            total += mapping[char]
    
    return reduce_to_single_digit(total, allow_masters=True)
```

#### 3.3.5 Birthday Number

```python
def calculate_birthday_number(day_of_birth):
    """
    Birthday Number = Day of birth (1-31), reduced to single digit.
    
    Represents special talents and traits for this lifetime.
    """
    return reduce_to_single_digit(day_of_birth, allow_masters=True)
```

#### 3.3.6 Maturity Number

```python
def calculate_maturity_number(life_path, expression):
    """
    Maturity Number = Life Path + Expression, reduced.
    
    Represents evolving self from age 35+.
    """
    total = life_path + expression
    return reduce_to_single_digit(total, allow_masters=True)
```

### 3.4 Advanced Numerology

#### 3.4.1 Challenge Numbers

```python
def calculate_challenge_numbers(birth_date):
    """
    Four Challenge Numbers representing life obstacles.
    
    Challenge 1 (Early life): |Month - Day|
    Challenge 2 (Mid life): |Day - Year|
    Challenge 3 (Main): |Challenge 1 - Challenge 2|
    Challenge 4 (Later life): |Month - Year|
    """
    # Parse birth date
    month = int(birth_date[0:2])
    day = int(birth_date[3:5])
    year = int(birth_date[6:10])
    
    # Reduce components
    month_reduced = reduce_to_single_digit(month)
    day_reduced = reduce_to_single_digit(day)
    year_reduced = reduce_to_single_digit(year)
    
    challenge_1 = abs(month_reduced - day_reduced)
    challenge_2 = abs(day_reduced - year_reduced)
    challenge_3 = abs(challenge_1 - challenge_2)
    challenge_4 = abs(month_reduced - year_reduced)
    
    return {
        'early_life': challenge_1,
        'mid_life': challenge_2,
        'main': challenge_3,
        'later_life': challenge_4
    }
```

#### 3.4.2 Pinnacle Numbers

```python
def calculate_pinnacle_numbers(birth_date):
    """
    Four Pinnacle Numbers representing life phases.
    
    Pinnacle 1: Month + Day (Age 0-36)
    Pinnacle 2: Day + Year (Age 27-54)
    Pinnacle 3: Pinnacle 1 + Pinnacle 2 (Age 36-63)
    Pinnacle 4: Month + Year (Age 54+)
    """
    month = int(birth_date[0:2])
    day = int(birth_date[3:5])
    year = int(birth_date[6:10])
    
    month_reduced = reduce_to_single_digit(month)
    day_reduced = reduce_to_single_digit(day)
    year_reduced = reduce_to_single_digit(year)
    
    pinnacle_1 = reduce_to_single_digit(month_reduced + day_reduced)
    pinnacle_2 = reduce_to_single_digit(day_reduced + year_reduced)
    pinnacle_3 = reduce_to_single_digit(pinnacle_1 + pinnacle_2)
    pinnacle_4 = reduce_to_single_digit(month_reduced + year_reduced)
    
    return {
        'first': {'number': pinnacle_1, 'age_range': '0-36'},
        'second': {'number': pinnacle_2, 'age_range': '27-54'},
        'third': {'number': pinnacle_3, 'age_range': '36-63'},
        'fourth': {'number': pinnacle_4, 'age_range': '54+'}
    }
```

### 3.5 Complete Numerology Calculation

```python
def calculate_numerology(birth_data, full_name, system='pythagorean'):
    """
    Main entry point for numerology calculation.
    """
    birth_date = birth_data['date']  # Format: MM/DD/YYYY or YYYY-MM-DD
    day_of_birth = int(birth_date.split('-')[2] if '-' in birth_date else birth_date.split('/')[1])
    
    # Core numbers
    life_path = calculate_life_path_number(birth_date)
    expression = calculate_expression_number(full_name, system)
    soul_urge = calculate_soul_urge_number(full_name, system)
    personality = calculate_personality_number(full_name, system)
    birthday = calculate_birthday_number(day_of_birth)
    maturity = calculate_maturity_number(life_path, expression)
    
    # Advanced numbers
    challenges = calculate_challenge_numbers(birth_date)
    pinnacles = calculate_pinnacle_numbers(birth_date)
    
    return {
        'system': system,
        'core': {
            'life_path': life_path,
            'expression': expression,
            'soul_urge': soul_urge,
            'personality': personality,
            'birthday': birthday,
            'maturity': maturity
        },
        'advanced': {
            'challenges': challenges,
            'pinnacles': pinnacles
        }
    }
```

---

## 4. Database Schema

### 4.1 Overview

PostgreSQL schema with JSONB support for flexible chart data storage.

### 4.2 Entity Relationship Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     users       │────▶│  user_profiles   │────▶│  hd_calculations│
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)          │     │ id (PK)         │
│ email           │     │ user_id (FK)     │     │ profile_id (FK) │
│ created_at      │     │ birth_date       │     │ type            │
│ updated_at      │     │ birth_time       │     │ authority       │
└─────────────────┘     │ birth_location   │     │ profile         │
                        │ full_name        │     │ incarnation_cross│
                        │ timezone         │     │ defined_centers │
                        │ created_at       │     │ personality     │
                        └──────────────────┘     │ design          │
                                │                │ raw_data (JSONB)│
                                │                └─────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │num_calculations  │
                        ├──────────────────┤
                        │ id (PK)          │
                        │ profile_id (FK)  │
                        │ system           │
                        │ core (JSONB)     │
                        │ advanced (JSONB) │
                        └──────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  book_versions  │◀────│  generated_books │◀────│customization_rules│
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)          │     │ id (PK)         │
│ profile_id (FK) │     │ profile_id (FK)  │     │ rule_type        │
│ format          │     │ template_id (FK) │     │ trigger_value    │
│ content (JSONB) │     │ format           │     │ modifications    │
│ file_url        │     │ status           │     │ priority         │
│ created_at      │     │ output_url       │     │ active           │
└─────────────────┘     │ created_at       │     └─────────────────┘
                        └──────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │ book_templates   │
                        ├──────────────────┤
                        │ id (PK)          │
                        │ name             │
                        │ version          │
                        │ structure (JSONB)│
                        │ variables (JSONB)│
                        │ base_content     │
                        └──────────────────┘
```

### 4.3 Table Definitions

#### 4.3.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### 4.3.2 User Profiles Table

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Birth Data
    birth_date DATE NOT NULL,
    birth_time TIME NOT NULL,
    birth_location JSONB NOT NULL, -- {latitude, longitude, city, country}
    timezone VARCHAR(100) NOT NULL,
    
    -- Personal Info
    full_name VARCHAR(255),
    preferred_name VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_profile UNIQUE (user_id)
);

CREATE INDEX idx_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_profiles_birth_date ON user_profiles(birth_date);
```

#### 4.3.3 Human Design Calculations Table

```sql
CREATE TABLE hd_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Core HD Data
    type VARCHAR(50) NOT NULL, -- manifestor, generator, manifesting_generator, projector, reflector
    authority VARCHAR(50) NOT NULL,
    profile VARCHAR(10) NOT NULL, -- e.g., "1/3", "5/1"
    definition VARCHAR(50) NOT NULL, -- single, split, triple_split, quadruple_split, no_definition
    
    -- Incarnation Cross
    incarnation_cross JSONB NOT NULL, -- {name, gates[], angle}
    
    -- Defined Centers
    defined_centers TEXT[] NOT NULL,
    
    -- Full Chart Data
    personality JSONB NOT NULL, -- All planetary positions
    design JSONB NOT NULL,
    
    -- Raw calculation data
    raw_data JSONB,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_hd_profile UNIQUE (profile_id)
);

CREATE INDEX idx_hd_type ON hd_calculations(type);
CREATE INDEX idx_hd_authority ON hd_calculations(authority);
CREATE INDEX idx_hd_profile ON hd_calculations(profile);
```

#### 4.3.4 Numerology Calculations Table

```sql
CREATE TABLE num_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    system VARCHAR(20) NOT NULL DEFAULT 'pythagorean', -- pythagorean, chaldean
    
    -- Core Numbers
    life_path INTEGER NOT NULL,
    expression INTEGER NOT NULL,
    soul_urge INTEGER NOT NULL,
    personality_num INTEGER NOT NULL,
    birthday_num INTEGER NOT NULL,
    maturity_num INTEGER,
    
    -- Advanced Numbers (stored as JSONB for flexibility)
    challenges JSONB,
    pinnacles JSONB,
    
    -- Full data
    raw_data JSONB,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_num_profile UNIQUE (profile_id, system)
);

CREATE INDEX idx_num_life_path ON num_calculations(life_path);
CREATE INDEX idx_num_expression ON num_calculations(expression);
```

#### 4.3.5 Book Templates Table

```sql
CREATE TABLE book_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    description TEXT,
    
    -- Template Structure
    structure JSONB NOT NULL, -- Chapter hierarchy and ordering
    
    -- Variable definitions
    variables JSONB NOT NULL, -- {variable_name: {type, default, description}}
    
    -- Base content (markdown or structured)
    base_content JSONB NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT unique_template_version UNIQUE (name, version)
);

CREATE INDEX idx_templates_active ON book_templates(active);
```

#### 4.3.6 Customization Rules Table

```sql
CREATE TABLE customization_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule Identification
    rule_type VARCHAR(50) NOT NULL, -- hd_type, hd_authority, hd_profile, num_life_path, etc.
    trigger_value VARCHAR(100) NOT NULL, -- e.g., "generator", "5", "emotional"
    
    -- Rule Content
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Modifications to apply
    modifications JSONB NOT NULL, -- See modification schema below
    
    -- Rule Priority (higher = applied later, can override)
    priority INTEGER DEFAULT 100,
    
    -- Conditions
    conditions JSONB, -- Additional conditions for rule application
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rules_type ON customization_rules(rule_type);
CREATE INDEX idx_rules_trigger ON customization_rules(trigger_value);
CREATE INDEX idx_rules_active ON customization_rules(active);
CREATE INDEX idx_rules_priority ON customization_rules(priority);
```

**Modifications Schema (JSONB):**

```json
{
  "content_additions": [
    {
      "chapter": "chapter_id",
      "section": "section_id",
      "position": "before|after|replace",
      "content": "markdown content"
    }
  ],
  "content_removals": ["chapter_id.section_id"],
  "variable_substitutions": {
    "variable_name": "value"
  },
  "emphasis_tags": ["tag1", "tag2"],
  "synsync_protocols": {
    "emphasize": ["protocol_id"],
    "add": ["protocol_id"],
    "modify": {
      "protocol_id": {"frequency": "new_freq", "duration": "new_duration"}
    }
  },
  "wyrd_words": {
    "highlight": ["word1", "word2"],
    "add": ["word3"]
  }
}
```

#### 4.3.7 Generated Books Table

```sql
CREATE TABLE generated_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES book_templates(id),
    
    -- Generation Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- Applied Rules
    applied_rules UUID[], -- References customization_rules
    
    -- Generation Parameters
    format VARCHAR(20) NOT NULL, -- pdf, epub, html
    options JSONB, -- {include_synsync, include_wyrd, ...}
    
    -- Output
    output_url VARCHAR(500),
    file_size_bytes INTEGER,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    CONSTRAINT unique_book_generation UNIQUE (profile_id, template_id, format)
);

CREATE INDEX idx_books_status ON generated_books(status);
CREATE INDEX idx_books_profile ON generated_books(profile_id);
```

#### 4.3.8 Book Versions Table (Content Storage)

```sql
CREATE TABLE book_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES generated_books(id) ON DELETE CASCADE,
    
    version_number INTEGER NOT NULL DEFAULT 1,
    
    -- Content Structure
    content JSONB NOT NULL, -- Full book content with all customizations
    
    -- Chapter breakdown for granular access
    chapters JSONB, -- {chapter_id: {title, content_hash, word_count}}
    
    -- Statistics
    word_count INTEGER,
    page_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_book_version UNIQUE (book_id, version_number)
);
```

### 4.4 Sample Data

#### 4.4.1 Template Structure Example

```sql
INSERT INTO book_templates (name, version, structure, variables, base_content) VALUES (
    'Inversion Excursion Base',
    '1.0',
    '{
        "chapters": [
            {"id": "intro", "title": "Introduction", "order": 1},
            {"id": "hd_fundamentals", "title": "Your Human Design", "order": 2},
            {"id": "type_specific", "title": "{{hd_type_title}}", "order": 3, "conditional": true},
            {"id": "authority", "title": "Your Authority: {{authority_name}}", "order": 4},
            {"id": "numerology", "title": "Your Numbers", "order": 5},
            {"id": "synsync", "title": "SynSync Protocols for {{hd_type}}", "order": 6},
            {"id": "wyrd", "title": "Your WYRD Words", "order": 7},
            {"id": "excursion", "title": "The Inversion Excursion", "order": 8}
        ]
    }',
    '{
        "hd_type": {"type": "string", "description": "Human Design type"},
        "hd_type_title": {"type": "string", "description": "Type-specific chapter title"},
        "authority_name": {"type": "string", "description": "Authority display name"},
        "life_path": {"type": "integer", "description": "Life Path number"},
        "expression": {"type": "integer", "description": "Expression number"},
        "profile": {"type": "string", "description": "HD Profile"},
        "cross_name": {"type": "string", "description": "Incarnation Cross name"}
    }',
    '{"markdown": "...base content..."}'
);
```

---

## 5. API Specification

### 5.1 Base URL

```
Production: https://api.inversionexcursion.com/v1
Staging: https://api-staging.inversionexcursion.com/v1
```

### 5.2 Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {jwt_token}
```

### 5.3 Endpoints

#### 5.3.1 Calculate Human Design

**Endpoint:** `POST /calculate/human-design`

**Request:**

```json
{
  "birth_date": "1990-06-15",
  "birth_time": "14:30:00",
  "birth_location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "city": "New York",
    "country": "USA"
  },
  "timezone": "America/New_York"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-hd-calculation",
    "type": "generator",
    "authority": "sacral",
    "profile": {
      "profile": "1/3",
      "name": "Investigator/Martyr",
      "conscious_line": 1,
      "unconscious_line": 3
    },
    "incarnation_cross": {
      "name": "Cross of Planning",
      "gates": [3, 4, 50, 59],
      "angle": "right_angle"
    },
    "definition": "single_definition",
    "defined_centers": ["sacral", "spleen", "root", "throat"],
    "personality": {
      "sun": {"gate": 3, "line": 1, "degree": 84.5},
      "earth": {"gate": 35, "line": 4, "degree": 264.5},
      "moon": {"gate": 28, "line": 2, "degree": 145.2},
      "north_node": {"gate": 43, "line": 5, "degree": 320.1},
      "south_node": {"gate": 23, "line": 2, "degree": 140.1},
      "mercury": {"gate": 4, "line": 3, "degree": 92.1},
      "venus": {"gate": 15, "line": 6, "degree": 108.7},
      "mars": {"gate": 52, "line": 1, "degree": 180.3},
      "jupiter": {"gate": 44, "line": 4, "degree": 225.8},
      "saturn": {"gate": 6, "line": 2, "degree": 278.4},
      "uranus": {"gate": 17, "line": 5, "degree": 310.2},
      "neptune": {"gate": 36, "line": 3, "degree": 340.5},
      "pluto": {"gate": 54, "line": 1, "degree": 175.9}
    },
    "design": {
      "sun": {"gate": 59, "line": 2, "degree": 196.3},
      "earth": {"gate": 55, "line": 5, "degree": 16.3},
      "moon": {"gate": 38, "line": 3, "degree": 245.7},
      "north_node": {"gate": 11, "line": 1, "degree": 50.2},
      "south_node": {"gate": 44, "line": 4, "degree": 230.2},
      "mercury": {"gate": 50, "line": 6, "degree": 203.8},
      "venus": {"gate": 27, "line": 2, "degree": 218.4},
      "mars": {"gate": 9, "line": 4, "degree": 92.5},
      "jupiter": {"gate": 63, "line": 1, "degree": 135.6},
      "saturn": {"gate": 22, "line": 3, "degree": 188.2},
      "uranus": {"gate": 24, "line": 6, "degree": 220.7},
      "neptune": {"gate": 37, "line": 2, "degree": 250.3},
      "pluto": {"gate": 41, "line": 5, "degree": 85.4}
    }
  },
  "calculated_at": "2026-03-04T23:34:00Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_BIRTH_DATA",
    "message": "Invalid birth time format",
    "field": "birth_time"
  }
}
```

#### 5.3.2 Calculate Numerology

**Endpoint:** `POST /calculate/numerology`

**Request:**

```json
{
  "birth_date": "1990-06-15",
  "full_name": "John Michael Smith",
  "system": "pythagorean"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-num-calculation",
    "system": "pythagorean",
    "core": {
      "life_path": 4,
      "expression": 8,
      "soul_urge": 6,
      "personality": 2,
      "birthday": 6,
      "maturity": 3
    },
    "advanced": {
      "challenges": {
        "early_life": 1,
        "mid_life": 2,
        "main": 1,
        "later_life": 3
      },
      "pinnacles": {
        "first": {"number": 6, "age_range": "0-36"},
        "second": {"number": 8, "age_range": "27-54"},
        "third": {"number": 5, "age_range": "36-63"},
        "fourth": {"number": 3, "age_range": "54+"}
      }
    },
    "interpretations": {
      "life_path": {
        "title": "The Builder",
        "keywords": ["practicality", "organization", "hard work", "stability"],
        "description": "Life Path 4 individuals are the builders and organizers..."
      },
      "expression": {
        "title": "The Powerhouse",
        "keywords": ["ambition", "authority", "success", "material abundance"],
        "description": "Expression 8 indicates natural leadership abilities..."
      }
    }
  },
  "calculated_at": "2026-03-04T23:34:00Z"
}
```

#### 5.3.3 Generate Book

**Endpoint:** `POST /generate/book`

**Request:**

```json
{
  "profile_id": "uuid-user-profile",
  "template_id": "uuid-template",
  "format": "pdf",
  "options": {
    "include_synsync": true,
    "include_wyrd": true,
    "include_numerology": true,
    "language": "en",
    "font_size": "normal",
    "color_scheme": "default"
  }
}
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "book_id": "uuid-generated-book",
    "status": "processing",
    "estimated_completion": "2026-03-04T23:39:00Z",
    "webhook_url": "https://api.inversionexcursion.com/v1/webhooks/book-status/uuid-generated-book"
  }
}
```

**Check Status:** `GET /generate/book/{book_id}`

```json
{
  "success": true,
  "data": {
    "book_id": "uuid-generated-book",
    "status": "completed",
    "progress": 100,
    "output": {
      "url": "https://cdn.inversionexcursion.com/books/uuid-generated-book.pdf",
      "format": "pdf",
      "file_size_bytes": 2847563,
      "expires_at": "2026-04-04T23:34:00Z"
    },
    "applied_rules": [
      {
        "rule_id": "uuid-rule-1",
        "rule_type": "hd_type",
        "trigger_value": "generator",
        "name": "Generator Type Modifications"
      },
      {
        "rule_id": "uuid-rule-2",
        "rule_type": "num_life_path",
        "trigger_value": "4",
        "name": "Life Path 4 Emphasis"
      }
    ],
    "statistics": {
      "word_count": 45230,
      "page_count": 186,
      "customization_count": 47
    },
    "created_at": "2026-03-04T23:34:00Z",
    "completed_at": "2026-03-04T23:37:15Z"
  }
}
```

#### 5.3.4 Customize Chapter

**Endpoint:** `POST /customize/chapter`

**Request:**

```json
{
  "profile_id": "uuid-user-profile",
  "chapter_id": "type_specific",
  "context": {
    "hd_data": {
      "type": "generator",
      "authority": "sacral",
      "profile": "1/3"
    },
    "numerology_data": {
      "life_path": 4,
      "expression": 8
    }
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "chapter_id": "type_specific",
    "title": "The Generator: Responding to Life",
    "content": {
      "sections": [
        {
          "id": "type_overview",
          "title": "Your Strategy: Wait to Respond",
          "content": "As a Generator, your power comes from your ability to respond...",
          "personalization_tags": ["generator", "sacral"]
        },
        {
          "id": "authority_section",
          "title": "Your Sacral Authority",
          "content": "With Sacral Authority, your gut response is your truth...",
          "personalization_tags": ["sacral_authority"]
        },
        {
          "id": "profile_section",
          "title": "The 1/3 Profile: Investigator and Martyr",
          "content": "Your profile combines the deep investigation of Line 1...",
          "personalization_tags": ["profile_1_3"]
        }
      ]
    },
    "applied_modifications": [
      {
        "type": "content_addition",
        "rule": "generator_sacral_emphasis",
        "section": "authority_section"
      },
      {
        "type": "synsync_protocol",
        "protocols": ["sacral_resonance_528hz", "response_meditation"]
      }
    ]
  }
}
```

#### 5.3.5 Get Available Rules

**Endpoint:** `GET /customize/rules`

**Query Parameters:**
- `rule_type` (optional): Filter by type
- `active_only` (optional): boolean, default true

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "uuid-rule-1",
        "rule_type": "hd_type",
        "trigger_value": "generator",
        "name": "Generator Type Modifications",
        "description": "Modifications for Generator type including sacral emphasis",
        "priority": 100,
        "modifications_summary": {
          "content_additions": 3,
          "synsync_protocols": 2,
          "wyrd_words": 5
        }
      }
    ],
    "total": 47,
    "page": 1,
    "per_page": 20
  }
}
```

#### 5.3.6 Preview Customizations

**Endpoint:** `POST /customize/preview`

**Request:**

```json
{
  "profile_id": "uuid-user-profile",
  "sections": ["intro", "type_specific", "synsync"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "profile_summary": {
      "hd_type": "generator",
      "authority": "sacral",
      "profile": "1/3",
      "life_path": 4,
      "expression": 8
    },
    "applicable_rules": [
      {
        "rule_id": "uuid-rule-1",
        "name": "Generator Type Modifications",
        "will_apply": true
      },
      {
        "rule_id": "uuid-rule-5",
        "name": "Sacral Authority Emphasis",
        "will_apply": true
      },
      {
        "rule_id": "uuid-rule-12",
        "name": "Life Path 4 Builder Content",
        "will_apply": true
      }
    ],
    "content_preview": {
      "intro": {
        "original_word_count": 1200,
        "customized_word_count": 1450,
        "key_additions": ["generator_welcome", "sacral_invitation"]
      },
      "type_specific": {
        "original_word_count": 3500,
        "customized_word_count": 5200,
        "key_additions": ["generator_strategy_detail", "response_examples"]
      }
    },
    "synsync_protocols": [
      {
        "id": "protocol_1",
        "name": "Sacral Resonance",
        "frequency": "528Hz",
        "emphasis_level": "primary"
      },
      {
        "id": "protocol_2",
        "name": "Response Cultivation",
        "frequency": "432Hz",
        "emphasis_level": "secondary"
      }
    ],
    "wyrd_words": ["RESPOND", "SACRAL", "BUILD", "WAIT", "SATISFACTION"]
  }
}
```

### 5.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_BIRTH_DATA` | 400 | Birth date/time/location is invalid |
| `INVALID_NAME` | 400 | Name format is invalid |
| `CALCULATION_ERROR` | 500 | Error during chart calculation |
| `TEMPLATE_NOT_FOUND` | 404 | Requested template does not exist |
| `PROFILE_NOT_FOUND` | 404 | User profile not found |
| `GENERATION_FAILED` | 500 | Book generation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |

---

## 6. Personalization Rules Engine

### 6.1 Overview

The Rules Engine determines which content modifications to apply based on:
- Human Design Type, Authority, Profile, Definition
- Numerology Life Path, Expression, Soul Urge
- Combined conditions (e.g., "Generator with Life Path 4")

### 6.2 Rule Structure

```python
class PersonalizationRule:
    """
    Core rule structure for content personalization.
    """
    id: str
    rule_type: RuleType  # hd_type, hd_authority, hd_profile, num_life_path, etc.
    trigger_value: str   # e.g., "generator", "5", "emotional"
    
    # Content modifications
    modifications: ModificationSet
    
    # Rule priority (higher = applied later, can override)
    priority: int
    
    # Optional conditions
    conditions: Optional[RuleConditions]
    
    # Status
    active: bool
```

### 6.3 Rule Types

```python
class RuleType(Enum):
    # Human Design Rules
    HD_TYPE = "hd_type"                    # manifestor, generator, etc.
    HD_AUTHORITY = "hd_authority"          # emotional, sacral, etc.
    HD_PROFILE = "hd_profile"              # 1/3, 5/1, etc.
    HD_DEFINITION = "hd_definition"        # single, split, etc.
    HD_CENTER = "hd_center"                # defined centers
    HD_CROSS = "hd_cross"                  # incarnation cross
    
    # Numerology Rules
    NUM_LIFE_PATH = "num_life_path"        # 1-9, 11, 22, 33
    NUM_EXPRESSION = "num_expression"      # 1-9, 11, 22, 33
    NUM_SOUL_URGE = "num_soul_urge"        # 1-9, 11, 22, 33
    NUM_PERSONALITY = "num_personality"    # 1-9
    NUM_BIRTHDAY = "num_birthday"          # 1-9
    
    # Combined Rules
    COMBINED = "combined"                  # Multiple conditions
```

### 6.4 Modification Types

#### 6.4.1 Content Additions

```python
@dataclass
class ContentAddition:
    chapter: str           # Target chapter ID
    section: str           # Target section ID (optional)
    position: Position     # before, after, replace
    content: str           # Markdown content
    condition: Optional[str]  # Optional conditional logic
```

#### 6.4.2 Variable Substitutions

```python
@dataclass
class VariableSubstitution:
    variable_name: str
    value: str
    value_type: ValueType  # string, number, boolean, markdown
```

#### 6.4.3 SynSync Protocol Modifications

```python
@dataclass
class SynSyncModification:
    emphasize: List[str]   # Protocol IDs to emphasize
    add: List[str]         # Protocol IDs to add
    modify: Dict[str, ProtocolParams]  # Modify existing protocols
    remove: List[str]      # Protocol IDs to remove
```

#### 6.4.4 WYRD Words Modifications

```python
@dataclass
class WyrdModification:
    highlight: List[str]   # Words to highlight/emphasize
    add: List[str]         # Words to add to user's WYRD set
    definitions: Dict[str, str]  # Custom definitions
```

### 6.5 Rule Evaluation Engine

```python
class RulesEngine:
    """
    Evaluates and applies personalization rules based on user profile.
    """
    
    def __init__(self, rules_repository: RulesRepository):
        self.rules = rules_repository
    
    def evaluate(self, profile: UserProfile) -> List[AppliedRule]:
        """
        Evaluate all rules against a user profile.
        Returns ordered list of applicable rules.
        """
        applicable = []
        
        for rule in self.rules.get_active():
            if self._matches(rule, profile):
                applicable.append(rule)
        
        # Sort by priority (ascending - lower numbers first)
        applicable.sort(key=lambda r: r.priority)
        
        return applicable
    
    def _matches(self, rule: PersonalizationRule, profile: UserProfile) -> bool:
        """Check if a rule matches the profile."""
        
        # Check main condition
        value = self._get_profile_value(rule.rule_type, profile)
        if value != rule.trigger_value:
            return False
        
        # Check additional conditions
        if rule.conditions:
            return self._check_conditions(rule.conditions, profile)
        
        return True
    
    def _get_profile_value(self, rule_type: RuleType, profile: UserProfile) -> str:
        """Extract the relevant value from profile based on rule type."""
        
        hd = profile.human_design
        num = profile.numerology
        
        mapping = {
            RuleType.HD_TYPE: hd.type,
            RuleType.HD_AUTHORITY: hd.authority,
            RuleType.HD_PROFILE: hd.profile.profile,
            RuleType.HD_DEFINITION: hd.definition,
            RuleType.NUM_LIFE_PATH: str(num.core.life_path),
            RuleType.NUM_EXPRESSION: str(num.core.expression),
            RuleType.NUM_SOUL_URGE: str(num.core.soul_urge),
        }
        
        return mapping.get(rule_type)
    
    def apply_rules(self, rules: List[PersonalizationRule], 
                    template: BookTemplate) -> CustomizedBook:
        """
        Apply a set of rules to a book template.
        """
        book = CustomizedBook(template=template)
        
        for rule in rules:
            self._apply_modifications(rule.modifications, book)
        
        return book
```

### 6.6 HD Type Rules

#### 6.6.1 Generator Rules

```yaml
rule_id: "hd_type_generator"
rule_type: "hd_type"
trigger_value: "generator"
priority: 100
modifications:
  content_additions:
    - chapter: "type_specific"
      position: "replace"
      content: |
        # The Generator: Responding to Life
        
        As a Generator, you are the life force of the planet. 
        Your Strategy is to **Wait to Respond**.
        
        ## Your Signature: Satisfaction
        
        When you follow your Strategy, you experience deep satisfaction...
        
    - chapter: "synsync"
      section: "protocols"
      position: "after"
      content: |
        ### Sacral Response Protocol
        
        This protocol enhances your natural sacral response mechanism...
        
  variable_substitutions:
    hd_type_title: "The Generator: Responding to Life"
    strategy: "Wait to Respond"
    signature: "Satisfaction"
    not_self_theme: "Frustration"
    
  synsync_protocols:
    emphasize:
      - "sacral_resonance_528hz"
      - "response_cultivation"
    add:
      - "sacral_clearing"
      - "frustration_release"
      
  wyrd_words:
    highlight:
      - "RESPOND"
      - "SACRAL"
      - "SATISFACTION"
      - "WAIT"
      - "LIFE FORCE"
    add:
      - "GENERATOR"
      - "RESPONSE"
```

#### 6.6.2 Manifestor Rules

```yaml
rule_id: "hd_type_manifestor"
rule_type: "hd_type"
trigger_value: "manifestor"
priority: 100
modifications:
  variable_substitutions:
    hd_type_title: "The Manifestor: Initiating Impact"
    strategy: "Inform Before Acting"
    signature: "Peace"
    not_self_theme: "Anger"
    
  synsync_protocols:
    emphasize:
      - "initiation_clarity"
      - "impact_awareness"
    add:
      - "anger_transmutation"
      - "peace_cultivation"
      
  wyrd_words:
    highlight:
      - "INITIATE"
      - "INFORM"
      - "IMPACT"
      - "PEACE"
      - "ACTION"
```

#### 6.6.3 Projector Rules

```yaml
rule_id: "hd_type_projector"
rule_type: "hd_type"
trigger_value: "projector"
priority: 100
modifications:
  variable_substitutions:
    hd_type_title: "The Projector: Guiding Energy"
    strategy: "Wait for the Invitation"
    signature: "Success"
    not_self_theme: "Bitterness"
    
  synsync_protocols:
    emphasize:
      - "recognition_field"
      - "invitation_sensitivity"
    add:
      - "bitterness_release"
      - "success_attunement"
      
  wyrd_words:
    highlight:
      - "GUIDE"
      - "INVITATION"
      - "RECOGNITION"
      - "SUCCESS"
      - "WAIT"
```

#### 6.6.4 Reflector Rules

```yaml
rule_id: "hd_type_reflector"
rule_type: "hd_type"
trigger_value: "reflector"
priority: 100
modifications:
  variable_substitutions:
    hd_type_title: "The Reflector: Mirroring Truth"
    strategy: "Wait a Lunar Cycle"
    signature: "Surprise"
    not_self_theme: "Disappointment"
    
  synsync_protocols:
    emphasize:
      - "lunar_tracking"
      - "environmental_sampling"
    add:
      - "disappointment_release"
      - "surprise_cultivation"
      - "moon_phase_attunement"
      
  wyrd_words:
    highlight:
      - "REFLECT"
      - "MIRROR"
      - "LUNAR"
      - "SURPRISE"
      - "TRUTH"
```

### 6.7 Authority Rules

```yaml
rule_id: "hd_authority_emotional"
rule_type: "hd_authority"
trigger_value: "emotional"
priority: 150
modifications:
  content_additions:
    - chapter: "authority"
      position: "replace"
      content: |
        ## Emotional Authority: Riding the Wave
        
        With Emotional Authority, your truth reveals itself over time...
        
  synsync_protocols:
    add:
      - "emotional_wave_tracking"
      - "clarity_meditation"
      
  wyrd_words:
    add:
      - "WAVE"
      - "CLARITY"
      - "WAIT"
```

### 6.8 Numerology Rules

#### 6.8.1 Life Path Rules

```yaml
rule_id: "num_life_path_1"
rule_type: "num_life_path"
trigger_value: "1"
priority: 200
modifications:
  content_additions:
    - chapter: "numerology"
      section: "life_path"
      position: "after"
      content: |
        ### The Leader's Path
        
        As a Life Path 1, you are here to lead and innovate...
        
  variable_substitutions:
    life_path_title: "The Leader"
    life_path_keywords: "independence, innovation, leadership"
    
  wyrd_words:
    add:
      - "LEADER"
      - "PIONEER"
      - "INDEPENDENT"
```

```yaml
rule_id: "num_life_path_4"
rule_type: "num_life_path"
trigger_value: "4"
priority: 200
modifications:
  content_additions:
    - chapter: "numerology"
      section: "life_path"
      position: "after"
      content: |
        ### The Builder's Foundation
        
        As a Life Path 4, you build the foundations upon which others stand...
        
  variable_substitutions:
    life_path_title: "The Builder"
    life_path_keywords: "stability, organization, hard work"
    
  synsync_protocols:
    add:
      - "grounding_protocol"
      - "structure_meditation"
      
  wyrd_words:
    add:
      - "BUILD"
      - "FOUNDATION"
      - "STRUCTURE"
      - "STABILITY"
```

### 6.9 Combined Rules

```yaml
rule_id: "combined_generator_life_path_4"
rule_type: "combined"
trigger_value: "generator AND life_path_4"
priority: 300
conditions:
  all:
    - rule_type: "hd_type"
      value: "generator"
    - rule_type: "num_life_path"
      value: "4"
modifications:
  content_additions:
    - chapter: "excursion"
      position: "after"
      content: |
        ## The Builder Generator
        
        When the Generator's responsive power meets the 4's building nature,
        you become an unstoppable force of practical creation...
        
  synsync_protocols:
    add:
      - "builder_generator_resonance"
      - "sacral_grounding"
      
  wyrd_words:
    add:
      - "BUILDER"
      - "RESPONSIVE CREATION"
```

---

## 7. Template System

### 7.1 Overview

The Template System uses variable substitution and conditional blocks to generate customized content.

### 7.2 Template Structure

```json
{
  "template_id": "uuid",
  "version": "1.0",
  "structure": {
    "chapters": [
      {
        "id": "intro",
        "title": "Introduction",
        "order": 1,
        "sections": [
          {
            "id": "welcome",
            "title": "Welcome to Your Journey",
            "content_ref": "intro.welcome"
          }
        ]
      },
      {
        "id": "type_specific",
        "title": "{{hd_type_title}}",
        "order": 3,
        "conditional": true,
        "condition": "hd_type != null"
      }
    ]
  },
  "variables": {
    "hd_type": {
      "type": "string",
      "source": "hd_calculation.type",
      "description": "Human Design type"
    },
    "hd_type_title": {
      "type": "string",
      "source": "rule_substitution",
      "default": "Your Human Design Type"
    },
    "strategy": {
      "type": "string",
      "source": "rule_substitution",
      "default": "Follow your Strategy"
    }
  },
  "base_content": {
    "intro.welcome": "Welcome to your personalized Inversion Excursion...",
    "type_specific.strategy": "Your strategy is: {{strategy}}"
  }
}
```

### 7.3 Variable Substitution Syntax

#### 7.3.1 Simple Variables

```markdown
Welcome, {{user_name}}!

Your Human Design type is {{hd_type}}.
Your Life Path number is {{life_path}}.
```

#### 7.3.2 Conditional Blocks

```markdown
{{#if hd_type == "generator"}}
As a Generator, you have sustainable life force energy.
{{/if}}

{{#if authority == "emotional"}}
## Emotional Authority
Take your time making decisions.
{{else}}
## {{authority_name}} Authority
Trust your {{authority}} for decisions.
{{/if}}
```

#### 7.3.3 Loops

```markdown
{{#each defined_centers}}
### {{name}}
{{description}}
{{/each}}

{{#each synsync_protocols}}
## {{name}}
Frequency: {{frequency}}Hz
Duration: {{duration}} minutes
{{/each}}
```

#### 7.3.4 Filters

```markdown
{{hd_type | capitalize}}
{{life_path | ordinal}}  # 4th
{{content | uppercase}}
{{date | format:"MMMM Do, YYYY"}}
```

### 7.4 Template Processor

```python
class TemplateProcessor:
    """
    Processes book templates with variable substitution.
    """
    
    def __init__(self, template: BookTemplate):
        self.template = template
        self.variables = {}
        self.conditions = {}
    
    def set_variable(self, name: str, value: Any):
        """Set a template variable."""
        self.variables[name] = value
    
    def set_variables(self, variables: Dict[str, Any]):
        """Set multiple variables."""
        self.variables.update(variables)
    
    def process(self) -> ProcessedBook:
        """
        Process the template with all variables set.
        """
        book = ProcessedBook()
        
        for chapter in self.template.structure['chapters']:
            if self._should_include_chapter(chapter):
                processed_chapter = self._process_chapter(chapter)
                book.add_chapter(processed_chapter)
        
        return book
    
    def _should_include_chapter(self, chapter: Dict) -> bool:
        """Check if a conditional chapter should be included."""
        if not chapter.get('conditional'):
            return True
        
        condition = chapter.get('condition')
        return self._evaluate_condition(condition)
    
    def _process_chapter(self, chapter: Dict) -> Chapter:
        """Process a single chapter."""
        title = self._substitute_variables(chapter['title'])
        
        sections = []
        for section in chapter.get('sections', []):
            processed_section = self._process_section(section)
            sections.append(processed_section)
        
        return Chapter(
            id=chapter['id'],
            title=title,
            sections=sections
        )
    
    def _process_section(self, section: Dict) -> Section:
        """Process a section with variable substitution."""
        content_ref = section['content_ref']
        content = self.template.base_content.get(content_ref, '')
        
        # Apply variable substitution
        content = self._substitute_variables(content)
        
        # Process conditionals
        content = self._process_conditionals(content)
        
        return Section(
            id=section['id'],
            title=self._substitute_variables(section['title']),
            content=content
        )
    
    def _substitute_variables(self, text: str) -> str:
        """Replace {{variable}} with actual values."""
        pattern = r'\{\{(\w+)(?:\s*\|\s*(\w+))?\}\}'
        
        def replace(match):
            var_name = match.group(1)
            filter_name = match.group(2)
            
            value = self.variables.get(var_name, f'{{{var_name}}}')
            
            if filter_name:
                value = self._apply_filter(value, filter_name)
            
            return str(value)
        
        return re.sub(pattern, replace, text)
    
    def _process_conditionals(self, text: str) -> str:
        """Process {{#if}} and {{#each}} blocks."""
        # Implementation for conditional processing
        pass
```

### 7.5 Content Blocks

#### 7.5.1 Base Content Structure

```json
{
  "base_content": {
    "intro.welcome": {
      "type": "markdown",
      "content": "# Welcome to Your Inversion Excursion\n\n{{welcome_message}}"
    },
    "type_specific.generator": {
      "type": "markdown",
      "content": "...generator specific content..."
    },
    "type_specific.manifestor": {
      "type": "markdown",
      "content": "...manifestor specific content..."
    },
    "synsync.base": {
      "type": "markdown",
      "content": "# SynSync Protocols\n\n{{synsync_intro}}"
    },
    "wyrd.base": {
      "type": "markdown",
      "content": "# Your WYRD Words\n\n{{wyrd_intro}}"
    }
  }
}
```

#### 7.5.2 Dynamic Content Selection

```python
def get_type_specific_content(hd_type: str, template: BookTemplate) -> str:
    """
    Get content block based on HD type.
    """
    content_ref = f"type_specific.{hd_type}"
    
    # Try type-specific content
    if content_ref in template.base_content:
        return template.base_content[content_ref]
    
    # Fallback to generic content
    return template.base_content.get("type_specific.generic", "")
```

---

## 8. Example API Calls

### 8.1 Complete Flow Example

#### Step 1: Create Profile and Calculate HD

**Request:**

```bash
curl -X POST https://api.inversionexcursion.com/v1/calculate/human-design \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "birth_date": "1985-09-23",
    "birth_time": "08:15:00",
    "birth_location": {
      "latitude": 51.5074,
      "longitude": -0.1278,
      "city": "London",
      "country": "UK"
    },
    "timezone": "Europe/London"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "hd-calc-uuid-001",
    "type": "projector",
    "authority": "self_projected",
    "profile": {
      "profile": "5/1",
      "name": "Heretic/Investigator",
      "conscious_line": 5,
      "unconscious_line": 1
    },
    "incarnation_cross": {
      "name": "Cross of the Sleeping Phoenix",
      "gates": [20, 34, 55, 59],
      "angle": "left_angle"
    },
    "definition": "split_definition",
    "defined_centers": ["throat", "g_center", "spleen"],
    "personality": {
      "sun": {"gate": 20, "line": 5, "degree": 180.3},
      "earth": {"gate": 34, "line": 2, "degree": 0.3},
      "moon": {"gate": 10, "line": 4, "degree": 95.7}
    },
    "design": {
      "sun": {"gate": 55, "line": 1, "degree": 92.1},
      "earth": {"gate": 59, "line": 4, "degree": 272.1}
    }
  }
}
```

#### Step 2: Calculate Numerology

**Request:**

```bash
curl -X POST https://api.inversionexcursion.com/v1/calculate/numerology \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "birth_date": "1985-09-23",
    "full_name": "Alexander James Morrison",
    "system": "pythagorean"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "num-calc-uuid-001",
    "system": "pythagorean",
    "core": {
      "life_path": 1,
      "expression": 11,
      "soul_urge": 9,
      "personality": 2,
      "birthday": 5,
      "maturity": 3
    },
    "advanced": {
      "challenges": {
        "early_life": 3,
        "mid_life": 2,
        "main": 1,
        "later_life": 4
      }
    }
  }
}
```

#### Step 3: Preview Customizations

**Request:**

```bash
curl -X POST https://api.inversionexcursion.com/v1/customize/preview \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "profile-uuid-001",
    "sections": ["intro", "type_specific", "authority", "numerology", "synsync"]
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "profile_summary": {
      "hd_type": "projector",
      "authority": "self_projected",
      "profile": "5/1",
      "life_path": 1,
      "expression": 11
    },
    "applicable_rules": [
      {
        "rule_id": "rule-hd-projector",
        "name": "Projector Type Modifications",
        "will_apply": true
      },
      {
        "rule_id": "rule-hd-self-projected",
        "name": "Self-Projected Authority",
        "will_apply": true
      },
      {
        "rule_id": "rule-hd-5-1",
        "name": "5/1 Profile Content",
        "will_apply": true
      },
      {
        "rule_id": "rule-num-life-path-1",
        "name": "Life Path 1 Leader Content",
        "will_apply": true
      },
      {
        "rule_id": "rule-num-expression-11",
        "name": "Master Number 11 Emphasis",
        "will_apply": true
      },
      {
        "rule_id": "rule-combined-projector-1",
        "name": "Projector + Life Path 1",
        "will_apply": true
      }
    ],
    "synsync_protocols": [
      {
        "id": "protocol_recognition",
        "name": "Recognition Field Enhancement",
        "frequency": "639Hz",
        "emphasis_level": "primary"
      },
      {
        "id": "protocol_invitation",
        "name": "Invitation Sensitivity",
        "frequency": "528Hz",
        "emphasis_level": "primary"
      },
      {
        "id": "protocol_leadership",
        "name": "Leadership Attunement",
        "frequency": "852Hz",
        "emphasis_level": "secondary"
      }
    ],
    "wyrd_words": [
      "GUIDE",
      "INVITATION",
      "RECOGNITION",
      "LEADER",
      "INTUITION",
      "HERETIC",
      "INVESTIGATOR"
    ],
    "estimated_customizations": 52
  }
}
```

#### Step 4: Generate Book

**Request:**

```bash
curl -X POST https://api.inversionexcursion.com/v1/generate/book \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "profile-uuid-001",
    "template_id": "template-base-001",
    "format": "pdf",
    "options": {
      "include_synsync": true,
      "include_wyrd": true,
      "include_numerology": true,
      "language": "en"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "book_id": "book-uuid-001",
    "status": "processing",
    "estimated_completion": "2026-03-04T23:42:00Z",
    "queue_position": 3
  }
}
```

#### Step 5: Check Generation Status

**Request:**

```bash
curl https://api.inversionexcursion.com/v1/generate/book/book-uuid-001 \
  -H "Authorization: Bearer {token}"
```

**Response (In Progress):**

```json
{
  "success": true,
  "data": {
    "book_id": "book-uuid-001",
    "status": "processing",
    "progress": 65,
    "current_step": "applying_customizations",
    "estimated_completion": "2026-03-04T23:42:00Z"
  }
}
```

**Response (Completed):**

```json
{
  "success": true,
  "data": {
    "book_id": "book-uuid-001",
    "status": "completed",
    "progress": 100,
    "output": {
      "url": "https://cdn.inversionexcursion.com/books/book-uuid-001.pdf",
      "format": "pdf",
      "file_size_bytes": 3245678,
      "expires_at": "2026-04-04T23:34:00Z"
    },
    "applied_rules": [
      {
        "rule_id": "rule-hd-projector",
        "name": "Projector Type Modifications"
      },
      {
        "rule_id": "rule-hd-self-projected",
        "name": "Self-Projected Authority"
      },
      {
        "rule_id": "rule-hd-5-1",
        "name": "5/1 Profile Content"
      },
      {
        "rule_id": "rule-num-life-path-1",
        "name": "Life Path 1 Leader Content"
      },
      {
        "rule_id": "rule-num-expression-11",
        "name": "Master Number 11 Emphasis"
      }
    ],
    "statistics": {
      "word_count": 48750,
      "page_count": 198,
      "customization_count": 52,
      "synsync_protocols_included": 8,
      "wyrd_words_highlighted": 24
    },
    "created_at": "2026-03-04T23:34:00Z",
    "completed_at": "2026-03-04T23:41:23Z"
  }
}
```

### 8.2 Error Handling Examples

#### Invalid Birth Data

**Request:**

```bash
curl -X POST https://api.inversionexcursion.com/v1/calculate/human-design \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "birth_date": "2025-02-30",
    "birth_time": "25:00:00",
    "birth_location": {
      "latitude": 999,
      "longitude": -999
    }
  }'
```

**Response:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_BIRTH_DATA",
    "message": "Invalid birth data provided",
    "details": [
      {
        "field": "birth_date",
        "message": "Invalid date: February 30 does not exist"
      },
      {
        "field": "birth_time",
        "message": "Invalid time: hour must be 0-23"
      },
      {
        "field": "birth_location.latitude",
        "message": "Latitude must be between -90 and 90"
      }
    ]
  }
}
```

---

## 9. Implementation Roadmap

### 9.1 Phase 1: Basic Calculation (Weeks 1-4)

#### Goals
- Implement core Human Design calculations
- Implement core Numerology calculations
- Basic API endpoints
- Database schema

#### Tasks

**Week 1: Foundation**
- [ ] Set up project structure
- [ ] Implement Swiss Ephemeris integration
- [ ] Implement Julian Day calculations
- [ ] Implement planetary position calculations

**Week 2: Human Design Core**
- [ ] Implement gate/line calculations
- [ ] Implement center/channel definitions
- [ ] Implement Type determination
- [ ] Implement Authority determination
- [ ] Implement Profile calculation
- [ ] Implement Incarnation Cross calculation

**Week 3: Numerology Core**
- [ ] Implement Pythagorean letter mapping
- [ ] Implement Chaldean letter mapping
- [ ] Implement Life Path calculation
- [ ] Implement Expression calculation
- [ ] Implement Soul Urge calculation
- [ ] Implement Personality calculation
- [ ] Implement Birthday calculation

**Week 4: API & Database**
- [ ] Set up PostgreSQL database
- [ ] Create database schema
- [ ] Implement `/calculate/human-design` endpoint
- [ ] Implement `/calculate/numerology` endpoint
- [ ] Write unit tests for calculations
- [ ] Write API integration tests

#### Deliverables
- Working calculation engine
- Database with schema
- Two working API endpoints
- Test coverage > 80%

### 9.2 Phase 2: Rules Engine (Weeks 5-8)

#### Goals
- Implement personalization rules engine
- Create rule management system
- Build template system
- Add customization preview

#### Tasks

**Week 5: Rules Engine Core**
- [ ] Design rule structure
- [ ] Implement rule evaluation engine
- [ ] Implement rule priority system
- [ ] Implement condition evaluation
- [ ] Create rule repository

**Week 6: Rule Content**
- [ ] Create HD Type rules (5 types)
- [ ] Create HD Authority rules (7 authorities)
- [ ] Create HD Profile rules (12 profiles)
- [ ] Create Numerology Life Path rules (9 + 3 master numbers)
- [ ] Create combined rules (top 10 combinations)

**Week 7: Template System**
- [ ] Design template structure
- [ ] Implement variable substitution
- [ ] Implement conditional blocks
- [ ] Implement loop processing
- [ ] Create base template

**Week 8: API Expansion**
- [ ] Implement `/customize/rules` endpoint
- [ ] Implement `/customize/preview` endpoint
- [ ] Implement `/customize/chapter` endpoint
- [ ] Add rule management endpoints (admin)
- [ ] Write tests for rules engine

#### Deliverables
- Working rules engine
- 50+ personalization rules
- Template processor
- Expanded API
- Admin interface for rules

### 9.3 Phase 3: Full Book Generation (Weeks 9-12)

#### Goals
- Complete book generation pipeline
- PDF/ePub/HTML output
- SynSync protocol integration
- WYRD words system
- Production deployment

#### Tasks

**Week 9: Book Generation Core**
- [ ] Design book generation pipeline
- [ ] Implement chapter assembly
- [ ] Implement content merging
- [ ] Implement modification application
- [ ] Create book structure validator

**Week 10: Output Formats**
- [ ] Implement PDF generation (WeasyPrint or Puppeteer)
- [ ] Implement ePub generation
- [ ] Implement HTML generation
- [ ] Design book styling/themes
- [ ] Implement cover generation

**Week 11: SynSync & WYRD Integration**
- [ ] Create SynSync protocol database
- [ ] Implement protocol selection logic
- [ ] Create WYRD words database
- [ ] Implement word highlighting
- [ ] Add audio protocol references

**Week 12: Production**
- [ ] Set up production infrastructure
- [ ] Implement caching layer
- [ ] Add monitoring and logging
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation completion

#### Deliverables
- Complete book generation system
- Multiple output formats
- SynSync integration
- WYRD words system
- Production deployment
- Full documentation

### 9.4 Post-Launch (Ongoing)

#### Phase 4: Enhancement (Months 4-6)
- [ ] Advanced Human Design features (transits, cycles)
- [ ] Additional numerology systems (Kabbalah, Chinese)
- [ ] Machine learning for rule optimization
- [ ] User feedback integration
- [ ] A/B testing framework

#### Phase 5: Scale (Months 7-12)
- [ ] Multi-language support
- [ ] White-label capabilities
- [ ] API for third-party integrations
- [ ] Mobile app
- [ ] Advanced analytics

---

## 10. Appendices

### 10.1 Human Design Reference

#### 10.1.1 The Five Types

| Type | Population | Strategy | Signature | Not-Self Theme |
|------|------------|----------|-----------|----------------|
| Manifestor | ~9% | Inform Before Acting | Peace | Anger |
| Generator | ~37% | Wait to Respond | Satisfaction | Frustration |
| Manifesting Generator | ~33% | Wait to Respond, Then Inform | Satisfaction | Frustration |
| Projector | ~20% | Wait for the Invitation | Success | Bitterness |
| Reflector | ~1% | Wait a Lunar Cycle | Surprise | Disappointment |

#### 10.1.2 Authorities (Decision-Making)

| Authority | Type | Description |
|-----------|------|-------------|
| Emotional | Solar Plexus defined | Wait through emotional wave for clarity |
| Sacral | Sacral defined (Generator/MG) | Listen to gut response (uh-huh/uhn-uhn) |
| Splenic | Spleen defined | Instant intuitive knowing in the now |
| Ego/Heart | Ego defined | Speak from the heart/self |
| Self-Projected | G Center defined | Listen to own voice/tone |
| Environment | No inner authority | Make decisions in correct environment |
| Lunar | Reflector only | Wait through 28-day moon cycle |
| Mental | None | No reliable inner authority |

#### 10.1.3 Profiles

| Profile | Name | Key Traits |
|---------|------|------------|
| 1/3 | Investigator/Martyr | Deep research, trial and error |
| 1/4 | Investigator/Opportunist | Research + networking |
| 2/4 | Hermit/Opportunist | Natural talent + networking |
| 2/5 | Hermit/Heretic | Talent + projection from others |
| 3/5 | Martyr/Heretic | Experimentation + leadership |
| 3/6 | Martyr/Role Model | Trial and error + wisdom |
| 4/6 | Opportunist/Role Model | Networking + wisdom |
| 4/1 | Opportunist/Investigator | Networking + foundation |
| 5/1 | Heretic/Investigator | Leadership + research |
| 5/2 | Heretic/Hermit | Leadership + natural talent |
| 6/2 | Role Model/Hermit | Wisdom + natural talent |
| 6/3 | Role Model/Martyr | Wisdom + experimentation |

### 10.2 Numerology Reference

#### 10.2.1 Life Path Meanings

| Number | Title | Keywords |
|--------|-------|----------|
| 1 | The Leader | Independence, innovation, leadership |
| 2 | The Peacemaker | Cooperation, diplomacy, sensitivity |
| 3 | The Communicator | Creativity, expression, joy |
| 4 | The Builder | Stability, organization, hard work |
| 5 | The Freedom Seeker | Adventure, change, versatility |
| 6 | The Nurturer | Responsibility, service, harmony |
| 7 | The Seeker | Analysis, spirituality, wisdom |
| 8 | The Powerhouse | Ambition, authority, material success |
| 9 | The Humanitarian | Compassion, completion, universal love |
| 11 | The Intuitive (Master) | Illumination, intuition, spiritual insight |
| 22 | The Master Builder | Practical idealism, large-scale achievement |
| 33 | The Master Teacher | Compassionate guidance, spiritual upliftment |

### 10.3 SynSync Protocol Reference

#### 10.3.1 Core Protocols by Type

**Generator Protocols:**
- Sacral Resonance (528Hz)
- Response Cultivation
- Frustration Release
- Satisfaction Attunement

**Manifestor Protocols:**
- Initiation Clarity
- Impact Awareness
- Anger Transmutation
- Peace Cultivation

**Projector Protocols:**
- Recognition Field
- Invitation Sensitivity
- Bitterness Release
- Success Attunement

**Reflector Protocols:**
- Lunar Tracking
- Environmental Sampling
- Disappointment Release
- Surprise Cultivation

### 10.4 WYRD Words Reference

WYRD (Where You Resonate Deeply) words are keywords that carry special resonance for each profile.

#### 10.4.1 Type-Based WYRD Words

| Type | Core WYRD Words |
|------|-----------------|
| Generator | RESPOND, SACRAL, SATISFACTION, LIFE FORCE, BUILD |
| Manifestor | INITIATE, INFORM, IMPACT, PEACE, ACTION |
| Projector | GUIDE, INVITATION, RECOGNITION, SUCCESS, FOCUS |
| Reflector | REFLECT, MIRROR, LUNAR, SURPRISE, SAMPLE |

#### 10.4.2 Number-Based WYRD Words

| Life Path | WYRD Words |
|-----------|------------|
| 1 | LEADER, PIONEER, INDEPENDENT, ORIGINAL |
| 4 | BUILDER, FOUNDATION, STRUCTURE, STABILITY |
| 7 | SEEKER, WISDOM, TRUTH, ANALYSIS |
| 11 | INTUITIVE, ILLUMINATION, INSPIRATION |

---

## Document Information

**Version:** 1.0  
**Last Updated:** March 2026  
**Author:** Inversion Excursion Technical Team  
**Status:** Implementation Guide  

### Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-04 | Initial specification |

---

*End of Technical Specification*
