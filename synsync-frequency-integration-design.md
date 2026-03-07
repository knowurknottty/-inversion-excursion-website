# SynSync Frequency Integration Design
## The Inversion Excursion - Tier 2 Mini App

> *Design Reference: Interactive card battlers like Slay the Spire meets biofeedback gaming like Nevermind*

---

## 1. FREQUENCY-TO-CARD MAPPING

### 1.1 Protocol Definitions

| Protocol | Frequency | Waveform | Effect Profile | Card Archetype |
|----------|-----------|----------|----------------|----------------|
| **Alpha Bridge** | 10 Hz | Binaural | Calm focus, relaxed alertness | Control/Mid-range |
| **Theta Dream** | 6 Hz (4-8 range) | Isochronic | Deep meditation, creativity | Healing/Buff |
| **Gamma Peak** | 40 Hz | Binaural | Peak cognition, memory | Aggro/Damage |
| **Schumann Earth** | 7.83 Hz | Isochronic | Grounding, balance | Defensive/Utility |
| **Delta Deep** | 2 Hz (0.5-4) | Binaural | Deep sleep, restoration | Recovery/Reset |
| **Beta Boost** | 20 Hz (13-30) | Isochronic | Active thought, energy | Fast/Combo |
| **Solfeggio 528** | 528 Hz carrier | Binaural | Transformation, DNA repair | Mutation/Change |
| **Monroe Focus** | 4 Hz Theta + pink noise | Isochronic | Out-of-body clarity | Precision/Sniper |

### 1.2 Card Frequency Resonance Matrix

```typescript
// Card frequency tags
enum FrequencyResonance {
  ALPHA = 'alpha',      // Control, manipulation, mid-game cards
  THETA = 'theta',      // Healing, buffs, dream logic
  GAMMA = 'gamma',      // Damage, burst, precision
  SCHUMANN = 'schumann', // Defense, shields, grounding
  DELTA = 'delta',      // Full restore, reset, deep heal
  BETA = 'beta',        // Quick plays, combos, energy
  SOLFEGGIO = 'solfeggio', // Transform, polymorph, adapt
  MONROE = 'monroe'     // Critical hits, piercing, focus
}

// Each card has primary and optional secondary resonance
interface CardResonance {
  primary: FrequencyResonance;
  secondary?: FrequencyResonance; // Weaker resonance (25% instead of 50%)
  dissonance?: FrequencyResonance[]; // Frequencies that conflict
}

// Example card mappings
const CARD_RESONANCE_MAP: Record<string, CardResonance> = {
  // Control archetype (Alpha)
  'time_warp': { primary: 'alpha', secondary: 'theta' },
  'gravity_anchor': { primary: 'alpha', dissonance: ['gamma', 'beta'] },
  'silence_field': { primary: 'alpha' },
  
  // Healing archetype (Theta)
  'dream_weave': { primary: 'theta', secondary: 'delta' },
  'mind_mend': { primary: 'theta' },
  'astral_projection': { primary: 'theta', secondary: 'monroe' },
  
  // Damage archetype (Gamma)
  'neural_spike': { primary: 'gamma', secondary: 'beta' },
  'cascade_burst': { primary: 'gamma' },
  'cognition_blade': { primary: 'gamma', dissonance: ['theta', 'delta'] },
  
  // Defense archetype (Schumann)
  'earth_shell': { primary: 'schumann' },
  'grounding_pulse': { primary: 'schumann', secondary: 'alpha' },
  'resonance_shield': { primary: 'schumann' },
  
  // Recovery archetype (Delta)
  'deep_reset': { primary: 'delta' },
  'subconscious_restore': { primary: 'delta', secondary: 'theta' },
  
  // Speed archetype (Beta)
  'rapid_fire': { primary: 'beta', dissonance: ['delta', 'theta'] },
  'neural_accelerator': { primary: 'beta', secondary: 'gamma' },
  
  // Transformation archetype (Solfeggio)
  'frequency_shift': { primary: 'solfeggio' },
  'morphic_resonance': { primary: 'solfeggio', secondary: 'schumann' },
  
  // Precision archetype (Monroe)
  'third_eye': { primary: 'monroe', secondary: 'gamma' },
  'piercing_insight': { primary: 'monroe' }
};
```

### 1.3 Resonance Affinity Wheel

```
                    GAMMA (Peak)
                       ↑
                       |
    BETA ←———— SCHUMANN ————→ ALPHA
    (Boost)   (Earth)    (Bridge)
                       |
                       ↓
              THETA —→ DELTA
              (Dream)  (Deep)
               ↘     ↙
               SOLFEGGIO
              (Transform)
```

**Adjacent frequencies** (connected lines): Secondary resonance possible
**Opposite frequencies**: Dissonance penalty applies

---

## 2. RESONANCE CALCULATION ALGORITHM

### 2.1 Core Formula

```typescript
interface ResonanceState {
  currentProtocol: FrequencyResonance | null;
  entrainmentLevel: number; // 0.0 - 1.0 (verified via challenge)
  sessionTimestamp: number;
  sessionDuration: number;
}

interface CardEffectModifiers {
  damageMultiplier: number;
  healingMultiplier: number;
  durationMultiplier: number;
  costReduction: number;
  bonusEffects: string[];
}

const RESONANCE_BONUS = 0.50;      // +50% for matching primary
const SECONDARY_BONUS = 0.25;      // +25% for matching secondary
const DISSONANCE_PENALTY = -0.20;  // -20% for dissonant frequencies
const HAND_DISHARMONY_THRESHOLD = 3; // Cards with different primary freqs

function calculateResonanceModifiers(
  hand: Card[],
  resonanceState: ResonanceState
): CardEffectModifiers {
  const baseModifiers: CardEffectModifiers = {
    damageMultiplier: 1.0,
    healingMultiplier: 1.0,
    durationMultiplier: 1.0,
    costReduction: 0,
    bonusEffects: []
  };

  // No active entrainment = no bonuses possible
  if (!resonanceState.currentProtocol || resonanceState.entrainmentLevel < 0.6) {
    return applyHandDissonance(hand, baseModifiers);
  }

  const currentFreq = resonanceState.currentProtocol;
  let totalBonus = 0;
  let dissonanceCount = 0;

  hand.forEach(card => {
    const resonance = CARD_RESONANCE_MAP[card.id];
    if (!resonance) return;

    // Primary resonance match
    if (resonance.primary === currentFreq) {
      totalBonus += RESONANCE_BONUS * resonanceState.entrainmentLevel;
      
      // Add special bonus effects at high entrainment
      if (resonanceState.entrainmentLevel > 0.85) {
        baseModifiers.bonusEffects.push(`${card.id}_enhanced`);
      }
    }
    // Secondary resonance match
    else if (resonance.secondary === currentFreq) {
      totalBonus += SECONDARY_BONUS * resonanceState.entrainmentLevel;
    }
    // Dissonance check
    else if (resonance.dissonance?.includes(currentFreq)) {
      dissonanceCount++;
    }
  });

  // Apply calculated bonuses
  const bonusMultiplier = 1 + totalBonus;
  baseModifiers.damageMultiplier *= bonusMultiplier;
  baseModifiers.healingMultiplier *= bonusMultiplier;
  baseModifiers.durationMultiplier *= bonusMultiplier;

  // Apply dissonance penalty
  if (dissonanceCount > 0) {
    const dissonanceMultiplier = 1 + (DISSONANCE_PENALTY * dissonanceCount);
    baseModifiers.damageMultiplier *= dissonanceMultiplier;
    baseModifiers.healingMultiplier *= dissonanceMultiplier;
  }

  // Check for hand disharmony (too many different frequencies)
  const uniqueFrequencies = new Set(hand.map(c => CARD_RESONANCE_MAP[c.id]?.primary)).size;
  if (uniqueFrequencies >= HAND_DISHARMONY_THRESHOLD) {
    baseModifiers.damageMultiplier *= 0.9;
    baseModifiers.healingMultiplier *= 0.9;
    baseModifiers.bonusEffects.push('disharmony_warning');
  }

  return baseModifiers;
}

function applyHandDissonance(
  hand: Card[],
  modifiers: CardEffectModifiers
): CardEffectModifiers {
  // Even without entrainment, conflicting frequencies in hand hurt
  const freqs = hand.map(c => CARD_RESONANCE_MAP[c.id]?.primary).filter(Boolean);
  const uniqueFreqs = new Set(freqs).size;
  
  if (uniqueFreqs >= 3) {
    const disharmonyPenalty = 1 - (0.1 * (uniqueFreqs - 2));
    modifiers.damageMultiplier *= disharmonyPenalty;
    modifiers.healingMultiplier *= disharmonyPenalty;
    modifiers.bonusEffects.push('natural_dissonance');
  }
  
  return modifiers;
}
```

### 2.2 Entrainment Level Decay

```typescript
// Entrainment fades over time to encourage active use
const ENTRAINMENT_DECAY_RATE = 0.05; // per minute
const MAX_ENTRAINMENT_AGE = 30 * 60 * 1000; // 30 minutes max

function getCurrentEntrainmentLevel(state: ResonanceState): number {
  const age = Date.now() - state.sessionTimestamp;
  
  if (age > MAX_ENTRAINMENT_AGE) return 0;
  
  const minutesPassed = age / (60 * 1000);
  const decay = minutesPassed * ENTRAINMENT_DECAY_RATE;
  
  return Math.max(0, state.entrainmentLevel - decay);
}
```

---

## 3. SYNSYNC INTEGRATION SPEC

### 3.1 Deep Link Protocol

```typescript
// SynSync app deep link scheme
interface SynSyncDeepLink {
  // URL Format: synsync://entrain?protocol={id}&duration={sec}&callback={url}&session={uuid}
  
  protocol: string;      // Protocol identifier
  duration: number;      // Session duration in seconds (60 default)
  callback: string;      // Return URL for the mini app
  sessionId: string;     // Unique session identifier
  verifyMode: 'honor' | 'biofeedback' | 'proof'; // Verification level
}

// Example deep link generation
function generateSynSyncLink(request: EntrainmentRequest): string {
  const params = new URLSearchParams({
    protocol: request.protocolId,
    duration: String(request.duration || 60),
    callback: encodeURIComponent(request.callbackUrl),
    session: request.sessionId,
    verify: request.verifyMode || 'biofeedback',
    // Optional: requested frequency for verification
    targetFreq: String(PROTOCOL_FREQUENCIES[request.protocolId])
  });
  
  return `synsync://entrain?${params.toString()}`;
}

// Return callback handling
// Callback URL: https://inversion.app/synsync-return?session={uuid}&result={data}
interface SynSyncReturnPayload {
  sessionId: string;
  protocol: string;
  duration: number;      // Actual duration completed
  completed: boolean;    // Did user complete full session?
  verification: {
    mode: 'honor' | 'biofeedback' | 'proof';
    score: number;       // 0.0 - 1.0 verification confidence
    method: string;      // How was it verified?
    timestamp: number;
    signature?: string;  // HMAC signature for tamper protection
  };
  bioMetrics?: {
    // Optional: if biofeedback was used
    coherenceScore?: number;    // HRV coherence if available
    attentionEstimate?: number; // Derived from session behavior
    completionConsistency?: number; // Were they consistent?
  };
}
```

### 3.2 Web-to-SynSync Bridge (PostMessage API)

```typescript
// For embedded/web version without app install
interface SynSyncWebBridge {
  // Initialize embedded SynSync player
  init(containerId: string, config: SynSyncConfig): Promise<void>;
  
  // Start entrainment session
  startSession(protocol: string, duration: number): Promise<SessionHandle>;
  
  // Event listeners
  on(event: 'frequencyShift' | 'completed' | 'failed', handler: Function): void;
  
  // Get verification proof
  getVerificationProof(): Promise<VerificationProof>;
}

// SynSync integration config
interface SynSyncConfig {
  apiKey: string;           // Your app's API key
  mode: 'embedded' | 'popup' | 'redirect';
  theme: 'light' | 'dark' | 'game';
  audioEngine: 'webaudio' | 'howler' | 'native';
  enableBiofeedback: boolean; // Request microphone access
  callbacks: {
    onComplete: (proof: VerificationProof) => void;
    onAbort: (reason: string) => void;
    onProgress: (percent: number) => void;
  };
}
```

### 3.3 Verification Proof System

```typescript
// Cryptographic proof of entrainment (anti-cheat)
interface VerificationProof {
  // Session identifiers
  sessionId: string;
  protocolId: string;
  startedAt: number;
  completedAt: number;
  
  // Verification data
  verificationLevel: 'honor' | 'biofeedback' | 'signed';
  confidenceScore: number;  // 0.0 - 1.0
  
  // For biofeedback mode
  bioSignature?: {
    sampleCount: number;
    coherenceAverage: number;
    varianceScore: number;  // Lower = more consistent
    timestamp: number;
  };
  
  // Tamper protection
  proofHash: string;        // SHA256 of session data
  signature: string;        // HMAC with server secret
  nonce: string;           // One-time use
}

// Server-side verification
function verifyEntrainmentProof(proof: VerificationProof): boolean {
  // 1. Check signature
  const expectedHash = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`${proof.sessionId}:${proof.startedAt}:${proof.completedAt}`)
    .digest('hex');
  
  if (proof.signature !== expectedHash) return false;
  
  // 2. Check nonce hasn't been used (replay attack prevention)
  if (isNonceUsed(proof.nonce)) return false;
  markNonceUsed(proof.nonce);
  
  // 3. Minimum session duration check
  const duration = proof.completedAt - proof.startedAt;
  if (duration < 55000) return false; // Must be ~60 seconds
  
  // 4. Biofeedback requirements
  if (proof.verificationLevel === 'biofeedback') {
    if (!proof.bioSignature) return false;
    if (proof.bioSignature.sampleCount < 10) return false;
    if (proof.confidenceScore < 0.5) return false;
  }
  
  return true;
}
```

---

## 4. ENTRAINMENT CHALLENGE UI FLOW

### 4.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENTRAINMENT CHALLENGE                        │
└─────────────────────────────────────────────────────────────────┘

[ENCOUNTER START]
        ↓
┌───────────────┐
│ Pre-Battle    │  ← Show enemy, show current hand resonance
│ Resonance     │  ← Highlight frequency gaps in deck
│ Check         │
└───────┬───────┘
        ↓
   ┌────────┐
   │ Need   │────NO────→ [BATTLE WITHOUT BONUS]
   │ Boost? │              (Dissonance penalties still apply)
   └────┬───┘
        │ YES
        ↓
┌───────────────┐
│ Protocol      │  ← Grid of available protocols
│ Selector      │  ← Show which cards each protocol boosts
│               │  ← Visual: card glow preview
└───────┬───────┘
        ↓
┌───────────────┐
│ SynSync       │  ← Option A: Deep link to SynSync app
│ App Check     │
└───────┬───────┘
        ↓
   ┌────────┐
   │ App    │────NO────→ [EMBEDDED PLAYER]
   │ Installed?        │  ← Load Web Audio engine inline
   └────┬───┘
        │ YES
        ↓
┌───────────────┐
│ Deep Link to  │  ← synsync://entrain?...
│ SynSync       │  ← "Opening SynSync Pro..."
└───────────────┘
        ↓
[USER IN SYNSYNC - 60 SECOND SESSION]
        ↓
┌───────────────┐
│ Return with   │  ← Callback: /synsync-return?result=...
│ Proof         │  ← Verify signature, check completion
└───────┬───────┘
        ↓
   ┌────────┐
   │ Verified?│──NO/HONOR─→ [PARTIAL BONUS]
   └────┬───┘    (Honor mode: +10% only, marked differently)
        │ YES
        ↓
┌───────────────┐
│ Entrainment   │  ← Visual: aura builds around player
│ Visualization │  ← Cards of matching frequency GLOW
│               │  ← +50% indicator pulses on boosted cards
└───────┬───────┘
        ↓
┌───────────────┐
│ Enter Battle  │  ← Resonance state active for encounter
│ With Resonance│  ← Timer shows remaining entrainment
└───────────────┘
        ↓
[BATTLE RESOLVED]
        ↓
┌───────────────┐
│ Entrainment   │  ← Decay begins (30-min timer starts)
│ Cooldown      │  ← Can re-entrain for next encounter
└───────────────┘
```

### 4.2 Protocol Selector Component

```typescript
// React/Vue component structure
interface ProtocolSelectorProps {
  availableProtocols: Protocol[];
  currentHand: Card[];
  onSelect: (protocol: Protocol) => void;
  onSkip: () => void;
}

// Visual preview of resonance effects
function ProtocolPreview({ protocol, hand }: { protocol: Protocol, hand: Card[] }) {
  const affectedCards = hand.filter(card => 
    CARD_RESONANCE_MAP[card.id]?.primary === protocol.frequency
  );
  
  const secondaryCards = hand.filter(card => 
    CARD_RESONANCE_MAP[card.id]?.secondary === protocol.frequency
  );
  
  return (
    <div className="protocol-preview">
      <div className="protocol-header">
        <FrequencyWave frequency={protocol.frequency} />
        <h3>{protocol.name}</h3>
        <span className="freq-badge">{protocol.frequency}Hz</span>
      </div>
      
      <div className="resonance-preview">
        <div className="primary-resonance">
          <h4>Primary Resonance (+50%)</h4>
          {affectedCards.map(card => (
            <CardMini 
              key={card.id} 
              card={card} 
              glowColor={protocol.color}
              bonus="+50%"
            />
          ))}
        </div>
        
        {secondaryCards.length > 0 && (
          <div className="secondary-resonance">
            <h4>Secondary Resonance (+25%)</h4>
            {secondaryCards.map(card => (
              <CardMini 
                key={card.id} 
                card={card} 
                glowColor={protocol.color}
                bonus="+25%"
                dimmed
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="session-info">
        <ClockIcon /> 60 seconds
        <HeadphonesIcon /> Binaural beats
        <ShieldIcon /> Anti-cheat verified
      </div>
    </div>
  );
}
```

### 4.3 Entrainment Session UI (Embedded)

```typescript
interface EntrainmentSessionUI {
  // Phase 1: Preparation (5 seconds)
  preparationPhase: {
    countdown: number;      // 5... 4... 3...
    instructions: string;   // "Put on headphones"
    visual: 'breathing_circle'; // Expanding/contracting
  };
  
  // Phase 2: Active Entrainment (60 seconds)
  activePhase: {
    progress: number;       // 0-100%
    timeRemaining: number;  // seconds
    visualizer: 'waveform' | 'mandala' | 'particle_field';
    frequency: number;      // Display current carrier
    
    // Biofeedback indicators (if enabled)
    coherenceMeter?: {
      value: number;        // 0-100
      status: 'seeking' | 'locking' | 'locked' | 'synced';
    };
    
    // Encouragement prompts
    prompts: string[];      // "Breathe with the pulse..."
  };
  
  // Phase 3: Verification (3 seconds)
  verificationPhase: {
    status: 'analyzing' | 'confirmed' | 'retry';
    score: number;          // Entrainment quality
    message: string;
  };
  
  // Phase 4: Return to Battle
  returnPhase: {
    resonanceActive: boolean;
    affectedCards: Card[];
    bonusApplied: string;
  };
}
```

---

## 5. CHEAT PREVENTION SYSTEM

### 5.1 Verification Levels

| Level | Method | Bonus | Trust Required |
|-------|--------|-------|----------------|
| **Honor** | Self-report | +10% | User's word |
| **Biofeedback** | Microphone analysis | +25-40% | Device sensors |
| **Proof** | SynSync signed attestation | +50% | Cryptographic |
| **Prime** | HRV + EEG (future) | +60% | Medical device |

### 5.2 Biofeedback Detection Algorithm

```typescript
// Web Audio API based frequency detection
class EntrainmentVerifier {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode;
  
  async init(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.microphone.connect(this.analyser);
  }
  
  // Detect if user is producing entrainment indicators
  async sampleSession(targetFreq: number): Promise<SampleResult> {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Look for:
    // 1. Breath rate slowing (vagal tone increase)
    // 2. Reduced high-frequency noise (relaxation indicator)
    // 3. Coherent low-frequency patterns
    
    const lowFreqEnergy = this.calculateBandEnergy(dataArray, 0.1, 2);   // Delta/breath
    const midFreqEnergy = this.calculateBandEnergy(dataArray, 4, 12);   // Theta/Alpha
    const highFreqEnergy = this.calculateBandEnergy(dataArray, 20, 100); // Beta/Gamma noise
    
    // Entrainment indicators
    const relaxationRatio = lowFreqEnergy / (highFreqEnergy + 0.001);
    const coherence = this.calculateCoherence(dataArray);
    
    return {
      relaxationRatio,
      coherence,
      timestamp: Date.now(),
      isEntrained: coherence > 0.6 && relaxationRatio > 2.0
    };
  }
  
  // Full session verification
  async verifyEntrainmentSession(
    targetFreq: number,
    durationMs: number
  ): Promise<VerificationResult> {
    const samples: SampleResult[] = [];
    const sampleInterval = 5000; // Sample every 5 seconds
    const requiredSamples = Math.floor(durationMs / sampleInterval);
    
    for (let i = 0; i < requiredSamples; i++) {
      await this.delay(sampleInterval);
      const sample = await this.sampleSession(targetFreq);
      samples.push(sample);
    }
    
    // Calculate session quality
    const entrainmentRatio = samples.filter(s => s.isEntrained).length / samples.length;
    const avgCoherence = samples.reduce((a, s) => a + s.coherence, 0) / samples.length;
    const trend = this.calculateTrend(samples.map(s => s.coherence));
    
    // Scoring
    let score = entrainmentRatio * 0.5; // Base: were they entrained?
    score += avgCoherence * 0.3;        // Quality of entrainment
    score += trend > 0 ? 0.2 : 0;       // Improving trend bonus
    
    return {
      score: Math.min(1, score),
      entrainmentRatio,
      avgCoherence,
      trend,
      samples: samples.length,
      verified: score > 0.5
    };
  }
  
  private calculateCoherence(dataArray: Uint8Array): number {
    // Simplified coherence calculation
    // Real implementation would use FFT peak detection
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const mean = sum / dataArray.length;
    const variance = dataArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dataArray.length;
    return 1 / (1 + Math.sqrt(variance) / 50); // Normalize to 0-1
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 5.3 Behavioral Anti-Cheat

```typescript
// Detect button mashing / automation
class BehavioralAntiCheat {
  private interactionLog: InteractionEvent[] = [];
  
  logInteraction(type: 'click' | 'tap' | 'focus' | 'scroll', timestamp: number): void {
    this.interactionLog.push({ type, timestamp });
  }
  
  analyzePatterns(): CheatRiskScore {
    const clicks = this.interactionLog.filter(e => e.type === 'click');
    
    // Check for inhuman click patterns
    const intervals = [];
    for (let i = 1; i < clicks.length; i++) {
      intervals.push(clicks[i].timestamp - clicks[i-1].timestamp);
    }
    
    // Calculate variance (low variance = robotic)
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    
    // Check for perfect intervals (bot signature)
    const perfectIntervals = intervals.filter(i => Math.abs(i - mean) < 5).length;
    const perfectionRatio = perfectIntervals / intervals.length;
    
    return {
      variance,
      perfectionRatio,
      isSuspicious: variance < 50 || perfectionRatio > 0.8,
      confidence: perfectionRatio > 0.9 ? 0.95 : variance < 30 ? 0.8 : 0.1
    };
  }
  
  // Session-level heuristics
  validateSession(session: SessionData): boolean {
    // 1. Minimum reasonable duration
    if (session.duration < 55000) return false;
    
    // 2. Tab visibility checks
    if (session.tabSwitches > 3) return false; // Distracted or botting
    
    // 3. Audio output verification
    if (!session.audioPlayed) return false;
    
    // 4. Screen interaction during session
    if (session.interactionCount < 2) return false; // Too passive
    if (session.interactionCount > 200) return false; // Too active (bot)
    
    return true;
  }
}
```

### 5.4 Server-Side Verification

```typescript
// Server endpoint for entrainment verification
app.post('/api/verify-entrainment', async (req, res) => {
  const { proof, sessionData } = req.body;
  
  // 1. Validate proof signature
  if (!verifyEntrainmentProof(proof)) {
    return res.status(403).json({ error: 'Invalid proof signature' });
  }
  
  // 2. Check behavioral patterns
  const antiCheat = new BehavioralAntiCheat();
  const riskScore = antiCheat.analyzePatterns(sessionData.interactions);
  
  if (riskScore.isSuspicious) {
    // Flag for review, reduce bonus
    return res.json({
      verified: false,
      reason: 'suspicious_activity',
      allowedBonus: 0.1, // Honor tier only
      flag: 'review_required'
    });
  }
  
  // 3. Calculate final entrainment level
  let entrainmentLevel = proof.confidenceScore;
  
  // Adjust based on verification mode
  const modeMultipliers = {
    'honor': 0.2,      // 20% of base
    'biofeedback': 0.7, // 70% of base
    'proof': 1.0,      // Full bonus
    'prime': 1.2       // 120% of base (future)
  };
  
  entrainmentLevel *= modeMultipliers[proof.verificationLevel] || 0.2;
  
  // 4. Record successful entrainment
  await recordEntrainment({
    userId: req.user.id,
    protocol: proof.protocol,
    entrainmentLevel,
    timestamp: proof.completedAt,
    verificationLevel: proof.verificationLevel
  });
  
  res.json({
    verified: true,
    entrainmentLevel: Math.min(1, entrainmentLevel),
    protocol: proof.protocol,
    expiresAt: Date.now() + (30 * 60 * 1000) // 30 min
  });
});
```

---

## 6. IMPLEMENTATION CHECKLIST

### Phase 1: Core (Week 1)
- [ ] Implement card frequency mapping system
- [ ] Build resonance calculation engine
- [ ] Create protocol selector UI
- [ ] Integrate Web Audio API for embedded player

### Phase 2: Verification (Week 2)
- [ ] Implement honor-mode fallback
- [ ] Add biofeedback microphone detection
- [ ] Build SynSync deep link integration
- [ ] Create proof signature system

### Phase 3: Polish (Week 3)
- [ ] Visual feedback for resonance states
- [ ] Entrainment decay visualization
- [ ] Anti-cheat behavioral analysis
- [ ] Server-side verification endpoint

### Phase 4: Advanced (Future)
- [ ] HRV integration (SynSync Prime)
- [ ] EEG headset support
- [ ] Multiplayer synchronized entrainment
- [ ] Leaderboards for entrainment streaks

---

## 7. REFERENCES

### SynSync Protocols
- Alpha Bridge: 10 Hz binaural, alert relaxation
- Theta Dream: 6 Hz isochronic, deep meditation
- Gamma Peak: 40 Hz binaural, peak cognition
- Schumann Earth: 7.83 Hz isochronic, grounding
- Delta Deep: 2 Hz binaural, deep sleep
- Beta Boost: 20 Hz isochronic, active energy

### Technical References
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Binaural Beat Generation: Carrier + (target/2) and Carrier - (target/2)
- Isochronic Tones: Amplitude modulation at target frequency
- HRV Coherence: https://www.heartmath.com/science/

---

*Design by: SynSync Lead (Tier 2 Mini App Swarm)*
*For: The Inversion Excursion*
