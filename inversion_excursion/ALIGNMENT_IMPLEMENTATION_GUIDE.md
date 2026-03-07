# ALIGNMENT SYSTEM IMPLEMENTATION GUIDE
## Technical Specification for The Inversion Excursion

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    ALIGNMENT SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Axis Core   │  │  Territory   │  │ Civic Weight │       │
│  │   Engine     │  │   Manager    │  │   Engine     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│                   ┌───────▼───────┐                        │
│                   │ Battle        │                        │
│                   │ Integration   │                        │
│                   └───────┬───────┘                        │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐        │
│  │   Player    │  │    NPC      │  │    Boss     │        │
│  │   Mirror    │  │  Reactions  │  │  Adapter    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. CORE DATA STRUCTURES

### 1.1 Alignment Coordinates

```typescript
interface AlignmentCoordinates {
  documented: number;  // -100 (Hidden) to +100 (Documented)
  accountable: number; // -100 (Protected) to +100 (Accountable)
}

// Territory determination
enum Territory {
  CITIZEN = 'citizen',     // (+, +)
  OFFICIAL = 'official',   // (+, -)
  GHOST = 'ghost',         // (-, +)
  ARCHON = 'archon',       // (-, -)
  NEUTRAL = 'neutral'      // (0, 0)
}

function getTerritory(coords: AlignmentCoordinates): Territory {
  const { documented, accountable } = coords;
  
  if (documented >= 0 && accountable >= 0) return Territory.CITIZEN;
  if (documented >= 0 && accountable < 0) return Territory.OFFICIAL;
  if (documented < 0 && accountable >= 0) return Territory.GHOST;
  if (documented < 0 && accountable < 0) return Territory.ARCHON;
  return Territory.NEUTRAL;
}
```

### 1.2 Entity Alignment State

```typescript
interface EntityAlignmentState {
  // Current position
  coordinates: AlignmentCoordinates;
  
  // Previous position (for crossing detection)
  previousCoordinates: AlignmentCoordinates;
  previousTerritory: Territory;
  
  // Drift tracking
  driftHistory: DriftRecord[];
  totalCivicWeight: number;
  
  // Momentum system
  turnsInCurrentTerritory: number;
  momentumLevel: MomentumLevel;
  
  // Status effects
  activeDrifts: DriftEffect[];
  territoryModifiers: TerritoryModifier[];
}

interface DriftRecord {
  timestamp: number;
  axis: 'documented' | 'accountable';
  amount: number;
  cause: string;
}

enum MomentumLevel {
  NONE = 0,
  SETTLED = 1,      // 2-3 turns
  ESTABLISHED = 2,  // 4-5 turns
  ENTRENCHED = 3    // 6+ turns
}
```

### 1.3 Civic Weight System

```typescript
interface CivicWeightEvent {
  id: string;
  entityId: string;
  weight: number;
  classification: WeightClassification;
  triggers: TriggerEffect[];
  timestamp: number;
}

enum WeightClassification {
  MINOR = 'minor',           // 0-50
  NOTABLE = 'notable',       // 51-150
  SIGNIFICANT = 'significant', // 151-300
  MAJOR = 'major',           // 301-500
  CIVIC_EVENT = 'civic_event' // 500+
}

function calculateCivicWeight(
  startCoords: AlignmentCoordinates,
  endCoords: AlignmentCoordinates,
  isDocumented: boolean,
  crossedProtected: boolean
): number {
  const docDistance = Math.abs(endCoords.documented - startCoords.documented);
  const accDistance = Math.abs(endCoords.accountable - startCoords.accountable);
  const totalDistance = docDistance + accDistance;
  
  const visibilityMultiplier = isDocumented ? 2.0 : 1.0;
  const institutionalImpact = crossedProtected ? 50 : 0;
  
  return (totalDistance * visibilityMultiplier) + institutionalImpact;
}
```

---

## 2. AXIS CORE ENGINE

### 2.1 Alignment Update Pipeline

```typescript
class AlignmentAxisEngine {
  private entities: Map<string, EntityAlignmentState> = new Map();
  private crossingCallbacks: CrossingCallback[] = [];
  
  // Register entity for tracking
  registerEntity(entityId: string, initialCoords: AlignmentCoordinates): void {
    this.entities.set(entityId, {
      coordinates: initialCoords,
      previousCoordinates: { ...initialCoords },
      previousTerritory: getTerritory(initialCoords),
      driftHistory: [],
      totalCivicWeight: 0,
      turnsInCurrentTerritory: 0,
      momentumLevel: MomentumLevel.NONE,
      activeDrifts: [],
      territoryModifiers: []
    });
  }
  
  // Update alignment with full pipeline
  updateAlignment(
    entityId: string,
    deltaDoc: number,
    deltaAcc: number,
    cause: string
  ): AlignmentUpdateResult {
    const state = this.entities.get(entityId);
    if (!state) throw new Error(`Entity ${entityId} not registered`);
    
    // Store previous state
    state.previousCoordinates = { ...state.coordinates };
    state.previousTerritory = getTerritory(state.coordinates);
    
    // Apply changes with clamping
    const newDoc = this.clamp(state.coordinates.documented + deltaDoc);
    const newAcc = this.clamp(state.coordinates.accountable + deltaAcc);
    
    state.coordinates = {
      documented: newDoc,
      accountable: newAcc
    };
    
    // Record drift
    if (deltaDoc !== 0) {
      state.driftHistory.push({
        timestamp: Date.now(),
        axis: 'documented',
        amount: deltaDoc,
        cause
      });
    }
    if (deltaAcc !== 0) {
      state.driftHistory.push({
        timestamp: Date.now(),
        axis: 'accountable',
        amount: deltaAcc,
        cause
      });
    }
    
    // Check for territory crossing
    const currentTerritory = getTerritory(state.coordinates);
    const crossingResult = this.checkTerritoryCrossing(entityId, state);
    
    // Calculate civic weight
    const civicWeight = calculateCivicWeight(
      state.previousCoordinates,
      state.coordinates,
      state.coordinates.documented > 0,
      state.previousCoordinates.accountable < 0 && state.coordinates.accountable >= 0
    );
    
    state.totalCivicWeight += civicWeight;
    
    // Update momentum
    if (currentTerritory === state.previousTerritory) {
      state.turnsInCurrentTerritory++;
      state.momentumLevel = this.calculateMomentum(state.turnsInCurrentTerritory);
    } else {
      state.turnsInCurrentTerritory = 1;
      state.momentumLevel = MomentumLevel.NONE;
    }
    
    return {
      entityId,
      newCoordinates: state.coordinates,
      territory: currentTerritory,
      previousTerritory: state.previousTerritory,
      crossing: crossingResult,
      civicWeight,
      momentumLevel: state.momentumLevel
    };
  }
  
  private clamp(value: number): number {
    return Math.max(-100, Math.min(100, value));
  }
  
  private calculateMomentum(turns: number): MomentumLevel {
    if (turns >= 6) return MomentumLevel.ENTRENCHED;
    if (turns >= 4) return MomentumLevel.ESTABLISHED;
    if (turns >= 2) return MomentumLevel.SETTLED;
    return MomentumLevel.NONE;
  }
}
```

### 2.2 Territory Crossing Detection

```typescript
interface CrossingResult {
  didCross: boolean;
  crossingType: CrossingType | null;
  announcement: string;
  immediateEffects: Effect[];
  ongoingConsequences: Consequence[];
}

enum CrossingType {
  // Single axis crossings
  PROTECTED_TO_ACCOUNTABLE = 'prot_to_acc',
  ACCOUNTABLE_TO_PROTECTED = 'acc_to_prot',
  HIDDEN_TO_DOCUMENTED = 'hid_to_doc',
  DOCUMENTED_TO_HIDDEN = 'doc_to_hid',
  
  // Territory crossings
  CITIZEN_TO_OFFICIAL = 'cit_to_off',
  OFFICIAL_TO_CITIZEN = 'off_to_cit',
  GHOST_TO_ARCHON = 'gho_to_arc',
  ARCHON_TO_GHOST = 'arc_to_gho',
  
  // Diagonal crossings
  CITIZEN_TO_GHOST = 'cit_to_gho',
  CITIZEN_TO_ARCHON = 'cit_to_arc',
  OFFICIAL_TO_GHOST = 'off_to_gho',
  OFFICIAL_TO_ARCHON = 'off_to_arc'
}

const CROSSING_ANNOUNCEMENTS: Record<CrossingType, string> = {
  [CrossingType.PROTECTED_TO_ACCOUNTABLE]: 
    '{name} has fallen from grace',
  [CrossingType.ACCOUNTABLE_TO_PROTECTED]: 
    '{name} has found sanctuary',
  [CrossingType.HIDDEN_TO_DOCUMENTED]: 
    '{name} has been unmasked',
  [CrossingType.DOCUMENTED_TO_HIDDEN]: 
    '{name} has vanished from record',
  [CrossingType.CITIZEN_TO_OFFICIAL]: 
    '{name} has ascended to office',
  [CrossingType.OFFICIAL_TO_CITIZEN]: 
    '{name} has become one of the people',
  [CrossingType.GHOST_TO_ARCHON]: 
    '{name} has claimed the shadow throne',
  [CrossingType.ARCHON_TO_GHOST]: 
    '{name} has lost their protection',
  [CrossingType.CITIZEN_TO_GHOST]: 
    '{name} has disappeared into shadow',
  [CrossingType.CITIZEN_TO_ARCHON]: 
    '{name} has seized hidden power',
  [CrossingType.OFFICIAL_TO_GHOST]: 
    '{name} has gone rogue',
  [CrossingType.OFFICIAL_TO_ARCHON]: 
    '{name} rules from the shadows'
};

function detectCrossing(
  prev: AlignmentCoordinates,
  curr: AlignmentCoordinates,
  prevTerritory: Territory,
  currTerritory: Territory
): CrossingResult {
  const result: CrossingResult = {
    didCross: false,
    crossingType: null,
    announcement: '',
    immediateEffects: [],
    ongoingConsequences: []
  };
  
  // Check axis crossings
  const crossedProtectedToAcc = prev.accountable < 0 && curr.accountable >= 0;
  const crossedAccToProtected = prev.accountable >= 0 && curr.accountable < 0;
  const crossedHiddenToDoc = prev.documented < 0 && curr.documented >= 0;
  const crossedDocToHidden = prev.documented >= 0 && curr.documented < 0;
  
  // Determine crossing type
  if (crossedProtectedToAcc) {
    result.crossingType = CrossingType.PROTECTED_TO_ACCOUNTABLE;
    result.immediateEffects = [
      { type: 'vulnerability_spike', duration: 3, value: 0.25 },
      { type: 'civic_weight_burst', value: 100 },
      { type: 'judgment_window', duration: 3 }
    ];
    result.ongoingConsequences = [
      { type: 'curse_normalization' },
      { type: 'accountability_tracking', multiplier: 1.5 },
      { type: 'reputation_cascade' },
      { type: 'retribution_queue' }
    ];
  } else if (crossedAccToProtected) {
    result.crossingType = CrossingType.ACCOUNTABLE_TO_PROTECTED;
    result.immediateEffects = [
      { type: 'curse_reduction', value: 0.5 },
      { type: 'damage_reduction', value: 0.25 }
    ];
  } else if (crossedHiddenToDoc) {
    result.crossingType = CrossingType.HIDDEN_TO_DOCUMENTED;
    result.immediateEffects = [
      { type: 'exposure_vulnerability', duration: 2 },
      { type: 'tracking_enabled' }
    ];
  } else if (crossedDocToHidden) {
    result.crossingType = CrossingType.DOCUMENTED_TO_HIDDEN;
    result.immediateEffects = [
      { type: 'tracking_disabled' },
      { type: 'resource_scarcity' }
    ];
  }
  
  // Territory change check
  if (prevTerritory !== currTerritory && !result.crossingType) {
    const typeKey = `${prevTerritory.toUpperCase()}_TO_${currTerritory.toUpperCase()}`;
    result.crossingType = CrossingType[typeKey as keyof typeof CrossingType];
  }
  
  result.didCross = result.crossingType !== null;
  
  if (result.crossingType) {
    result.announcement = CROSSING_ANNOUNCEMENTS[result.crossingType];
  }
  
  return result;
}
```

---

## 3. BATTLE INTEGRATION

### 3.1 Territorial Gravity Fields

```typescript
interface GravityField {
  territory: Territory;
  centerX: number;
  centerY: number;
  radius: number;
  strength: number;
}

class TerritorialGravitySystem {
  private fields: Map<string, GravityField> = new Map();
  private entityPositions: Map<string, { x: number; y: number }> = new Map();
  
  // Initialize battlefield with territory zones
  initializeBattlefield(battleType: BattleType): void {
    switch (battleType) {
      case BattleType.DUNGEON:
        // Single territory based on dungeon
        this.createField(Territory.CITIZEN, 0.5, 0.5, 1.0, 1.0);
        break;
      case BattleType.BOSS:
        // Two territories: player (Citizen) vs Boss (Archon)
        this.createField(Territory.CITIZEN, 0.25, 0.5, 0.4, 1.2);
        this.createField(Territory.ARCHON, 0.75, 0.5, 0.4, 1.5);
        break;
      case BattleType.HYBRID:
        // All four territories
        this.createField(Territory.CITIZEN, 0.25, 0.25, 0.35, 1.0);
        this.createField(Territory.OFFICIAL, 0.75, 0.25, 0.35, 1.0);
        this.createField(Territory.GHOST, 0.25, 0.75, 0.35, 1.0);
        this.createField(Territory.ARCHON, 0.75, 0.75, 0.35, 1.0);
        break;
    }
  }
  
  // Calculate gravity effects for card play
  calculateGravityEffect(
    entityId: string,
    card: Card,
    playPosition: { x: number; y: number }
  ): GravityEffect {
    const entityPos = this.entityPositions.get(entityId);
    if (!entityPos) return { modifier: 1.0, effects: [] };
    
    // Find dominant field
    let dominantField: GravityField | null = null;
    let maxInfluence = 0;
    
    for (const field of this.fields.values()) {
      const distance = this.calculateDistance(playPosition, field);
      const influence = field.strength * (1 - distance / field.radius);
      
      if (influence > maxInfluence && distance < field.radius) {
        maxInfluence = influence;
        dominantField = field;
      }
    }
    
    if (!dominantField) return { modifier: 1.0, effects: [] };
    
    // Apply territory-specific effects
    const effects: string[] = [];
    let modifier = 1.0;
    
    switch (dominantField.territory) {
      case Territory.CITIZEN:
        effects.push('transparent');
        modifier = card.frequency === 'beta' ? 1.1 : 1.0;
        break;
      case Territory.OFFICIAL:
        effects.push('bureaucratic');
        modifier = card.frequency === 'alpha' ? 1.15 : 1.0;
        break;
      case Territory.GHOST:
        effects.push('shadow');
        modifier = card.frequency === 'theta' ? 1.2 : 1.0;
        break;
      case Territory.ARCHON:
        effects.push('deep');
        modifier = card.frequency === 'schumann' ? 1.25 : 1.0;
        break;
    }
    
    return { modifier, effects, territory: dominantField.territory };
  }
}
```

### 3.2 Moral Physics Engine

```typescript
interface MoralPhysicsState {
  alignmentMass: number;
  velocity: { doc: number; acc: number };
  friction: number;
  momentum: number;
}

class MoralPhysicsEngine {
  // Calculate alignment mass from card tier
  calculateAlignmentMass(cardTier: CardTier): number {
    const massMap: Record<CardTier, number> = {
      'physical': 1,
      'emotional': 2,
      'atomic': 4,
      'galactic': 8,
      'cosmic': 16,
      'hybrid': 12
    };
    return massMap[cardTier];
  }
  
  // Calculate friction for territory movement
  calculateFriction(
    fromTerritory: Territory,
    toTerritory: Territory,
    entityState: EntityAlignmentState
  ): number {
    const distance = this.getTerritoryDistance(fromTerritory, toTerritory);
    let friction = distance; // Base friction = distance
    
    // Momentum reduces friction
    if (entityState.momentumLevel === MomentumLevel.SETTLED) {
      friction -= 1;
    }
    
    // Civic Weight > 200 grants one free frictionless move
    if (entityState.totalCivicWeight > 200) {
      // This is tracked separately and consumed
    }
    
    return Math.max(0, friction);
  }
  
  private getTerritoryDistance(from: Territory, to: Territory): number {
    const distances: Record<string, number> = {
      'citizen-official': 1,
      'citizen-ghost': 2,
      'citizen-archon': 3,
      'official-ghost': 2,
      'official-archon': 2,
      'ghost-archon': 1
    };
    
    const key = [from, to].sort().join('-');
    return distances[key] || 0;
  }
  
  // Apply physics-based alignment shift
  applyPhysicsShift(
    entityId: string,
    cardMass: number,
    cardTerritory: Territory,
    currentState: EntityAlignmentState
  ): PhysicsShiftResult {
    const currentTerritory = getTerritory(currentState.coordinates);
    
    // Calculate pull toward card's territory
    const docPull = this.calculateAxisPull(
      currentState.coordinates.documented,
      cardTerritory,
      'documented'
    );
    const accPull = this.calculateAxisPull(
      currentState.coordinates.accountable,
      cardTerritory,
      'accountable'
    );
    
    // Scale by mass
    const scaledDocPull = docPull * (cardMass / 16); // Normalize to cosmic tier
    const scaledAccPull = accPull * (cardMass / 16);
    
    return {
      deltaDoc: scaledDocPull,
      deltaAcc: scaledAccPull,
      totalMass: cardMass,
      battlefieldInfluence: cardMass >= 8 // Galactic+ affects entire battlefield
    };
  }
  
  private calculateAxisPull(
    currentValue: number,
    targetTerritory: Territory,
    axis: 'documented' | 'accountable'
  ): number {
    const territoryTargets: Record<Territory, AlignmentCoordinates> = {
      [Territory.CITIZEN]: { documented: 50, accountable: 50 },
      [Territory.OFFICIAL]: { documented: 50, accountable: -50 },
      [Territory.GHOST]: { documented: -50, accountable: 50 },
      [Territory.ARCHON]: { documented: -50, accountable: -50 },
      [Territory.NEUTRAL]: { documented: 0, accountable: 0 }
    };
    
    const target = territoryTargets[targetTerritory][axis];
    const diff = target - currentValue;
    
    // Pull strength is proportional to distance, capped at 20 per action
    return Math.sign(diff) * Math.min(Math.abs(diff) * 0.1, 20);
  }
}
```

---

## 4. PLAYER MIRROR SYSTEM

### 4.1 Choice Tracking

```typescript
interface ChoiceRecord {
  id: string;
  type: ChoiceType;
  alignmentDelta: { doc: number; acc: number };
  narrativeContext: string;
  timestamp: number;
}

enum ChoiceType {
  // Documented/Hidden axis
  TRANSPARENT_ACTION = 'transparent',
  SECRET_ACTION = 'secret',
  PUBLIC_DECLARATION = 'public',
  COVERT_OPERATION = 'covert',
  
  // Accountable/Protected axis
  TAKE_RESPONSIBILITY = 'responsibility',
  SHIFT_BLAME = 'blame',
  ACCEPT_PUNISHMENT = 'punishment',
  USE_PROTECTION = 'protection'
}

const CHOICE_ALIGNMENT_EFFECTS: Record<ChoiceType, { doc: number; acc: number }> = {
  [ChoiceType.TRANSPARENT_ACTION]: { doc: 10, acc: 0 },
  [ChoiceType.SECRET_ACTION]: { doc: -10, acc: 0 },
  [ChoiceType.PUBLIC_DECLARATION]: { doc: 30, acc: 0 },
  [ChoiceType.COVERT_OPERATION]: { doc: -30, acc: 0 },
  [ChoiceType.TAKE_RESPONSIBILITY]: { doc: 0, acc: 10 },
  [ChoiceType.SHIFT_BLAME]: { doc: 0, acc: -10 },
  [ChoiceType.ACCEPT_PUNISHMENT]: { doc: 0, acc: 30 },
  [ChoiceType.USE_PROTECTION]: { doc: 0, acc: -30 }
};

class PlayerMirrorSystem {
  private choiceHistory: ChoiceRecord[] = [];
  private deckModifier: DeckModifierState;
  private npcReactionMatrix: NPCReactionMatrix;
  
  recordChoice(
    playerId: string,
    choiceType: ChoiceType,
    narrativeContext: string
  ): ChoiceResult {
    const effects = CHOICE_ALIGNMENT_EFFECTS[choiceType];
    
    // Scale based on narrative importance
    const importanceMultiplier = this.calculateImportance(narrativeContext);
    const scaledEffects = {
      doc: effects.doc * importanceMultiplier,
      acc: effects.acc * importanceMultiplier
    };
    
    const record: ChoiceRecord = {
      id: generateId(),
      type: choiceType,
      alignmentDelta: scaledEffects,
      narrativeContext,
      timestamp: Date.now()
    };
    
    this.choiceHistory.push(record);
    
    // Apply to alignment system
    const alignmentResult = alignmentEngine.updateAlignment(
      playerId,
      scaledEffects.doc,
      scaledEffects.acc,
      choiceType
    );
    
    // Update deck based on new alignment
    this.updateDeckModifiers(playerId, alignmentResult.newCoordinates);
    
    return {
      record,
      alignmentResult,
      deckChanges: this.getDeckChanges(alignmentResult.newCoordinates)
    };
  }
  
  private updateDeckModifiers(
    playerId: string,
    coords: AlignmentCoordinates
  ): void {
    const territory = getTerritory(coords);
    
    // Reset modifiers
    this.deckModifier = {
      boostedDungeons: [],
      nerfedDungeons: [],
      unlockedCards: [],
      frequencyBonuses: {}
    };
    
    // Apply territory-specific modifiers
    switch (territory) {
      case Territory.CITIZEN:
        this.deckModifier.boostedDungeons = ['pedant'];
        this.deckModifier.nerfedDungeons = ['puppeteer'];
        this.deckModifier.frequencyBonuses = { beta: 1.2 };
        this.deckModifier.unlockedCards = ['public_figure', 'open_book', 'the_record'];
        break;
      case Territory.OFFICIAL:
        this.deckModifier.boostedDungeons = ['alchemist'];
        this.deckModifier.nerfedDungeons = ['inquisitor'];
        this.deckModifier.frequencyBonuses = { alpha: 1.15 };
        this.deckModifier.unlockedCards = ['golden_parachute', 'the_shield', 'impunity'];
        break;
      case Territory.GHOST:
        this.deckModifier.boostedDungeons = ['puppeteer'];
        this.deckModifier.nerfedDungeons = ['pedant'];
        this.deckModifier.frequencyBonuses = { theta: 1.2 };
        this.deckModifier.unlockedCards = ['shadow_walker', 'erased', 'the_void'];
        break;
      case Territory.ARCHON:
        this.deckModifier.boostedDungeons = ['hybrid'];
        this.deckModifier.nerfedDungeons = ['pedant', 'inquisitor'];
        this.deckModifier.frequencyBonuses = { schumann: 1.25 };
        this.deckModifier.unlockedCards = ['shadow_throne', 'deep_state', 'untouchable'];
        break;
    }
  }
}
```

### 4.2 Boss Encounter Adaptation

```typescript
interface BossPhaseConfig {
  phaseNumber: number;
  name: string;
  hp: number;
  alignmentRequirement: Territory;
  mechanicOverride: MechanicOverride;
}

class BossAdapter {
  private bossConfigs: Map<Territory, BossPhaseConfig[]> = new Map();
  
  initializeConfigs(): void {
    // Citizen player config
    this.bossConfigs.set(Territory.CITIZEN, [
      { phaseNumber: 1, name: 'The Corruptor', hp: 150, 
        alignmentRequirement: Territory.OFFICIAL,
        mechanicOverride: { focus: 'integrity_test', vulnerability: 'transparent' } },
      { phaseNumber: 2, name: 'The Temptation', hp: 200,
        alignmentRequirement: Territory.ARCHON,
        mechanicOverride: { focus: 'protection_offer', vulnerability: 'accountable' } },
      { phaseNumber: 3, name: 'The Mirror', hp: 250,
        alignmentRequirement: Territory.CITIZEN,
        mechanicOverride: { focus: 'self_reflection', vulnerability: 'balanced' } },
      { phaseNumber: 4, name: 'The System Unmasked', hp: 300,
        alignmentRequirement: Territory.NEUTRAL,
        mechanicOverride: { focus: 'true_form', vulnerability: 'all' } }
    ]);
    
    // Official player config
    this.bossConfigs.set(Territory.OFFICIAL, [
      { phaseNumber: 1, name: 'The Equalizer', hp: 150,
        alignmentRequirement: Territory.CITIZEN,
        mechanicOverride: { focus: 'remove_advantages', vulnerability: 'protected' } },
      { phaseNumber: 2, name: 'The Mob', hp: 200,
        alignmentRequirement: Territory.GHOST,
        mechanicOverride: { focus: 'accountability_pressure', vulnerability: 'documented' } },
      { phaseNumber: 3, name: 'The Revolution', hp: 250,
        alignmentRequirement: Territory.ARCHON,
        mechanicOverride: { focus: 'power_struggle', vulnerability: 'unstable' } },
      { phaseNumber: 4, name: 'The System Unmasked', hp: 300,
        alignmentRequirement: Territory.NEUTRAL,
        mechanicOverride: { focus: 'true_form', vulnerability: 'all' } }
    ]);
    
    // Ghost player config
    this.bossConfigs.set(Territory.GHOST, [
      { phaseNumber: 1, name: 'The Revealer', hp: 150,
        alignmentRequirement: Territory.CITIZEN,
        mechanicOverride: { focus: 'force_documentation', vulnerability: 'hidden' } },
      { phaseNumber: 2, name: 'The Spotlight', hp: 200,
        alignmentRequirement: Territory.OFFICIAL,
        mechanicOverride: { focus: 'public_exposure', vulnerability: 'isolated' } },
      { phaseNumber: 3, name: 'The Recognition', hp: 250,
        alignmentRequirement: Territory.GHOST,
        mechanicOverride: { focus: 'acknowledgment', vulnerability: 'lonely' } },
      { phaseNumber: 4, name: 'The System Unmasked', hp: 300,
        alignmentRequirement: Territory.NEUTRAL,
        mechanicOverride: { focus: 'true_form', vulnerability: 'all' } }
    ]);
    
    // Archon player config
    this.bossConfigs.set(Territory.ARCHON, [
      { phaseNumber: 1, name: 'The Mirror', hp: 150,
        alignmentRequirement: Territory.ARCHON,
        mechanicOverride: { focus: 'identical_alignment', vulnerability: 'reflected' } },
      { phaseNumber: 2, name: 'The Connection', hp: 200,
        alignmentRequirement: Territory.GHOST,
        mechanicOverride: { focus: 'force_accountability', vulnerability: 'disconnected' } },
      { phaseNumber: 3, name: 'The Exposure', hp: 250,
        alignmentRequirement: Territory.OFFICIAL,
        mechanicOverride: { focus: 'public_reckoning', vulnerability: 'untouchable' } },
      { phaseNumber: 4, name: 'The System Unmasked', hp: 300,
        alignmentRequirement: Territory.NEUTRAL,
        mechanicOverride: { focus: 'true_form', vulnerability: 'all' } }
    ]);
  }
  
  getBossConfig(playerTerritory: Territory): BossPhaseConfig[] {
    return this.bossConfigs.get(playerTerritory) || 
           this.bossConfigs.get(Territory.CITIZEN)!;
  }
  
  checkTrueEndingCondition(playerCoords: AlignmentCoordinates): boolean {
    // True ending requires perfect balance (0,0) or very close
    const tolerance = 5;
    return (
      Math.abs(playerCoords.documented) <= tolerance &&
      Math.abs(playerCoords.accountable) <= tolerance
    );
  }
}
```

---

## 5. DRIFT CONSEQUENCE SYSTEM

### 5.1 Drift Threshold Monitoring

```typescript
interface DriftThreshold {
  axis: 'documented' | 'accountable';
  direction: 'positive' | 'negative';
  threshold: number;
  effectId: string;
}

const DRIFT_THRESHOLDS: DriftThreshold[] = [
  // Documented drift (positive)
  { axis: 'documented', direction: 'positive', threshold: 25, effectId: 'visible' },
  { axis: 'documented', direction: 'positive', threshold: 50, effectId: 'known' },
  { axis: 'documented', direction: 'positive', threshold: 75, effectId: 'famous' },
  { axis: 'documented', direction: 'positive', threshold: 100, effectId: 'legendary' },
  
  // Documented drift (negative)
  { axis: 'documented', direction: 'negative', threshold: -25, effectId: 'obscure' },
  { axis: 'documented', direction: 'negative', threshold: -50, effectId: 'forgotten' },
  { axis: 'documented', direction: 'negative', threshold: -75, effectId: 'myth' },
  { axis: 'documented', direction: 'negative', threshold: -100, effectId: 'erased' },
  
  // Accountable drift (positive)
  { axis: 'accountable', direction: 'positive', threshold: 25, effectId: 'responsible' },
  { axis: 'accountable', direction: 'positive', threshold: 50, effectId: 'liable' },
  { axis: 'accountable', direction: 'positive', threshold: 75, effectId: 'answerable' },
  { axis: 'accountable', direction: 'positive', threshold: 100, effectId: 'sacrificial' },
  
  // Protected drift (negative)
  { axis: 'accountable', direction: 'negative', threshold: -25, effectId: 'connected' },
  { axis: 'accountable', direction: 'negative', threshold: -50, effectId: 'shielded' },
  { axis: 'accountable', direction: 'negative', threshold: -75, effectId: 'untouchable' },
  { axis: 'accountable', direction: 'negative', threshold: -100, effectId: 'sovereign' }
];

const DRIFT_EFFECTS: Record<string, DriftEffect> = {
  // Documented effects
  visible: {
    name: 'Visible',
    description: 'Can be targeted by name from 2x range',
    modifiers: { targetingRange: 2.0 }
  },
  known: {
    name: 'Known',
    description: 'All actions generate 25% more Civic Weight',
    modifiers: { civicWeightMultiplier: 1.25 }
  },
  famous: {
    name: 'Famous',
    description: 'Cannot enter Hidden territories without extreme cost',
    restrictions: ['enter_ghost', 'enter_archon']
  },
  legendary: {
    name: 'Legendary',
    description: 'Permanent public record, history written',
    modifiers: { permanentRecord: true }
  },
  obscure: {
    name: 'Obscure',
    description: 'Targeting range reduced by 25%',
    modifiers: { targetingRange: 0.75 }
  },
  forgotten: {
    name: 'Forgotten',
    description: 'Can only be targeted by area effects',
    restrictions: ['named_targeting']
  },
  myth: {
    name: 'Myth',
    description: 'Existence questioned, reality distortion effects',
    modifiers: { realityDistortion: true }
  },
  erased: {
    name: 'Erased',
    description: 'Cannot be targeted at all, but cannot target others by name',
    restrictions: ['all_targeting', 'named_targeting_self']
  },
  
  // Accountable effects
  responsible: {
    name: 'Responsible',
    description: 'Curses apply at 110% severity',
    modifiers: { curseMultiplier: 1.1 }
  },
  liable: {
    name: 'Liable',
    description: 'Can be held responsible for ally actions',
    mechanics: ['ally_accountability']
  },
  answerable: {
    name: 'Answerable',
    description: 'Must answer for all past actions (retribution queue)',
    mechanics: ['retribution_queue']
  },
  sacrificial: {
    name: 'Sacrificial',
    description: 'Can take damage for others, cannot refuse',
    mechanics: ['sacrificial_protection', 'forced_sacrifice']
  },
  connected: {
    name: 'Connected',
    description: '10% curse reduction',
    modifiers: { curseMultiplier: 0.9 }
  },
  shielded: {
    name: 'Shielded',
    description: 'Can redirect minor consequences to allies',
    mechanics: ['curse_redirect']
  },
  untouchable: {
    name: 'Untouchable',
    description: 'Immune to common accountability effects',
    immunities: ['common_accountability']
  },
  sovereign: {
    name: 'Sovereign',
    description: 'Above the System, but cannot interact with accountable entities',
    restrictions: ['interact_accountable'],
    immunities: ['system_judgment']
  }
};

class DriftConsequenceSystem {
  private activeEffects: Map<string, Set<string>> = new Map(); // entityId -> effectIds
  
  checkThresholds(entityId: string, state: EntityAlignmentState): DriftTrigger[] {
    const triggers: DriftTrigger[] = [];
    
    for (const threshold of DRIFT_THRESHOLDS) {
      const value = threshold.axis === 'documented' 
        ? state.coordinates.documented 
        : state.coordinates.accountable;
      
      const crossed = threshold.direction === 'positive'
        ? value >= threshold.threshold && this.getPreviousValue(state, threshold.axis) < threshold.threshold
        : value <= threshold.threshold && this.getPreviousValue(state, threshold.axis) > threshold.threshold;
      
      if (crossed) {
        triggers.push({
          threshold,
          effect: DRIFT_EFFECTS[threshold.effectId],
          isNew: true
        });
        
        // Add to active effects
        if (!this.activeEffects.has(entityId)) {
          this.activeEffects.set(entityId, new Set());
        }
        this.activeEffects.get(entityId)!.add(threshold.effectId);
      }
    }
    
    return triggers;
  }
  
  private getPreviousValue(state: EntityAlignmentState, axis: 'documented' | 'accountable'): number {
    return axis === 'documented' 
      ? state.previousCoordinates.documented 
      : state.previousCoordinates.accountable;
  }
  
  getActiveEffects(entityId: string): DriftEffect[] {
    const effectIds = this.activeEffects.get(entityId);
    if (!effectIds) return [];
    
    return Array.from(effectIds).map(id => DRIFT_EFFECTS[id]);
  }
}
```

---

## 6. UI/UX INTEGRATION

### 6.1 Alignment Display Components

```typescript
// Alignment Coordinate Display
interface AlignmentHUDProps {
  entityId: string;
  coordinates: AlignmentCoordinates;
  territory: Territory;
  civicWeight: number;
  momentumLevel: MomentumLevel;
}

const AlignmentHUD: React.FC<AlignmentHUDProps> = ({
  coordinates,
  territory,
  civicWeight,
  momentumLevel
}) => {
  return (
    <div className="alignment-hud">
      {/* Territory Indicator */}
      <div className={`territory-badge ${territory}`}>
        {territory.toUpperCase()}
      </div>
      
      {/* Coordinate Grid */}
      <div className="coordinate-grid">
        <div className="axis documented">
          <span className="label">Documented</span>
          <div className="bar">
            <div 
              className="fill" 
              style={{ width: `${(coordinates.documented + 100) / 2}%` }}
            />
            <span className="value">{coordinates.documented}</span>
          </div>
        </div>
        <div className="axis accountable">
          <span className="label">Accountable</span>
          <div className="bar">
            <div 
              className="fill" 
              style={{ width: `${(coordinates.accountable + 100) / 2}%` }}
            />
            <span className="value">{coordinates.accountable}</span>
          </div>
        </div>
      </div>
      
      {/* Civic Weight Meter */}
      <div className="civic-weight">
        <span className="label">Civic Weight</span>
        <div className="meter">
          <div 
            className={`fill ${getWeightClass(civicWeight)}`}
            style={{ width: `${Math.min(civicWeight / 5, 100)}%` }}
          />
          <span className="value">{civicWeight}</span>
        </div>
      </div>
      
      {/* Momentum Indicator */}
      <div className={`momentum ${momentumLevel}`}>
        {momentumLevel > 0 && (
          <span className="indicator">
            {'▓'.repeat(momentumLevel)}
            {'░'.repeat(3 - momentumLevel)}
          </span>
        )}
      </div>
    </div>
  );
};

// Crossing Announcement Component
interface CrossingAnnouncementProps {
  entityName: string;
  crossingType: CrossingType;
  territory: Territory;
}

const CrossingAnnouncement: React.FC<CrossingAnnouncementProps> = ({
  entityName,
  crossingType,
  territory
}) => {
  const announcement = CROSSING_ANNOUNCEMENTS[crossingType].replace('{name}', entityName);
  
  return (
    <div className={`crossing-announcement ${territory}`}>
      <div className="flash-effect" />
      <h2 className="announcement-text">{announcement}</h2>
      <div className="territory-symbol">{getTerritorySymbol(territory)}</div>
    </div>
  );
};
```

### 6.2 Visual Territory Indicators

```css
/* Territory Border Colors */
.territory-citizen {
  border-color: #CD7F32; /* Bronze - transparency has a cost */
  box-shadow: 0 0 10px rgba(205, 127, 50, 0.3);
}

.territory-official {
  border-color: #FFD700; /* Gold - institutional power */
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.territory-ghost {
  border-color: #708090; /* Slate - shadow */
  box-shadow: 0 0 8px rgba(112, 128, 144, 0.2);
  opacity: 0.9;
}

.territory-archon {
  border-color: #2F1B69; /* Deep purple - hidden power */
  box-shadow: 0 0 20px rgba(47, 27, 105, 0.5);
}

/* Crossing Animation */
@keyframes crossingFlash {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1); }
}

.crossing-announcement {
  animation: crossingFlash 2s ease-out;
}

/* Protected → Accountable crack effect */
@keyframes shieldCrack {
  0% { filter: none; }
  50% { filter: brightness(1.5) sepia(1); }
  100% { 
    filter: none;
    border-image: url('crack-texture.png') 30 round;
  }
}

.territory-accountable-crossing {
  animation: shieldCrack 0.5s ease-out;
}
```

---

## 7. INTEGRATION CHECKLIST

### Phase 1: Core Systems (Week 1-2)
- [ ] Implement `AlignmentCoordinates` interface
- [ ] Build `AxisEngine` with update pipeline
- [ ] Create territory classification functions
- [ ] Implement crossing detection system
- [ ] Build civic weight calculator
- [ ] Create announcement system

### Phase 2: Battle Integration (Week 3-4)
- [ ] Implement territorial gravity fields
- [ ] Build alignment mass calculation
- [ ] Create civic friction system
- [ ] Implement moral momentum tracking
- [ ] Integrate with card play system
- [ ] Test boss encounter modifications

### Phase 3: Player Systems (Week 5-6)
- [ ] Build choice tracking system
- [ ] Implement deck modification engine
- [ ] Create NPC reaction matrix
- [ ] Build boss adapter system
- [ ] Implement true ending condition check
- [ ] Create mirror state persistence

### Phase 4: Drift & Consequences (Week 7)
- [ ] Implement drift threshold monitoring
- [ ] Create drift effect database
- [ ] Build consequence trigger system
- [ ] Implement spiral detection
- [ ] Create narrative branching hooks

### Phase 5: UI/UX (Week 8)
- [ ] Build alignment HUD component
- [ ] Create crossing announcement UI
- [ ] Implement territory visual indicators
- [ ] Build civic weight meter
- [ ] Create momentum indicators
- [ ] Add sound effects for crossings

### Phase 6: Testing & Polish (Week 9-10)
- [ ] Unit test all calculation functions
- [ ] Integration test battle scenarios
- [ ] Balance civic weight thresholds
- [ ] Playtest territory crossings
- [ ] Verify narrative branching
- [ ] Performance optimization

---

## 8. EXAMPLE IMPLEMENTATION

### Complete Flow Example

```typescript
// Player starts as neutral citizen
const playerId = 'player_1';
alignmentEngine.registerEntity(playerId, { documented: 0, accountable: 0 });

// Player plays Pedant card (P-3: The Final Footnote)
const pedantCard = {
  tier: 'atomic',
  dungeon: 'pedant',
  frequency: 'gamma',
  alignmentMass: 4
};

// Physics calculation
const physicsShift = physicsEngine.applyPhysicsShift(
  playerId,
  pedantCard.alignmentMass,
  Territory.CITIZEN,
  alignmentEngine.getState(playerId)
);

// Apply to alignment
const updateResult = alignmentEngine.updateAlignment(
  playerId,
  physicsShift.deltaDoc + 5, // Card effect bonus
  physicsShift.deltaAcc,
  'played_pedant_card'
);

// Check for crossing
if (updateResult.crossing.didCross) {
  ui.showCrossingAnnouncement({
    entityName: 'You',
    crossingType: updateResult.crossing.crossingType!,
    territory: updateResult.territory
  });
  
  // Apply immediate effects
  battleSystem.applyEffects(updateResult.crossing.immediateEffects);
}

// Check drift thresholds
const driftTriggers = driftSystem.checkThresholds(
  playerId, 
  alignmentEngine.getState(playerId)
);

for (const trigger of driftTriggers) {
  ui.showDriftNotification(trigger.effect);
  playerState.addModifier(trigger.effect.modifiers);
}

// Update deck
mirrorSystem.updateDeckModifiers(playerId, updateResult.newCoordinates);

// Check for civic event
if (updateResult.civicWeight >= 500) {
  narrativeSystem.triggerCheckpoint('civic_event', playerId);
}
```

---

## 9. PERFORMANCE CONSIDERATIONS

### Optimization Strategies

1. **Batch Alignment Updates**: Process multiple shifts in single frame
2. **Cached Territory Lookups**: Pre-calculate territory boundaries
3. **Lazy Drift Evaluation**: Only check thresholds when values change
4. **Event-Driven Architecture**: Use observers for crossing notifications
5. **Spatial Partitioning**: For gravity field calculations

### Memory Management

```typescript
// Limit drift history to prevent memory bloat
const MAX_DRIFT_HISTORY = 100;

function pruneDriftHistory(state: EntityAlignmentState): void {
  if (state.driftHistory.length > MAX_DRIFT_HISTORY) {
    state.driftHistory = state.driftHistory.slice(-MAX_DRIFT_HISTORY);
  }
}
```

---

*"The code records what the heart decides."*

— The System
