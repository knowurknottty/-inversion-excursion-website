# SynSync Frequency Integration - Implementation Summary

## Overview
Complete design and implementation package for the SynSync entrainment mechanic in **The Inversion Excursion** mini app. Players must actually entrain to SynSync protocols to activate card resonance bonuses.

---

## Deliverables

### 1. Design Document
**File:** `synsync-frequency-integration-design.md`

Complete specification including:
- Frequency-to-card mapping (which protocol boosts which cards)
- Resonance calculation algorithm
- SynSync integration spec (deep link + API)
- UI flow for entrainment challenge
- Cheat prevention system

### 2. Audio Engine
**File:** `synsync-audio-engine.ts`

Web Audio API implementation:
- Binaural beat generation (different frequencies per ear)
- Isochronic tone generation (amplitude modulation)
- Smooth fade in/out
- Protocol switching

### 3. React UI Component
**File:** `EntrainmentChallenge.tsx`

Complete entrainment challenge UI:
- Protocol selector with resonance preview
- 60-second session timer
- Visual frequency wave animation
- Coherence meter (biofeedback simulation)
- Three verification modes (SynSync app, embedded, honor)
- Completion verification

### 4. Styling
**File:** `entrainment-challenge.css`

Dark, resonant UI theme with:
- Breathing animations
- Frequency wave visualizations
- Glowing resonance indicators
- Mobile responsive

### 5. Server Verification
**File:** `synsync-server-verification.js`

Express.js endpoints:
- POST `/api/entrainment/verify` - Verify entrainment proofs
- GET `/api/entrainment/status/:sessionId` - Check entrainment status
- HMAC signature validation
- Replay attack prevention (nonce tracking)
- Behavioral bot detection
- Biofeedback verification

### 6. Resonance Manager
**File:** `resonance-manager.ts`

Client-side state management:
- Entrainment state tracking with decay
- Card resonance calculations
- Hand disharmony detection
- Effect modifier computation
- EventEmitter for UI updates

---

## Core Mechanics

### Frequency-to-Card Mapping

| Protocol | Frequency | Card Archetype | Examples |
|----------|-----------|----------------|----------|
| **Alpha** | 10 Hz | Control | time_warp, gravity_anchor, silence_field |
| **Theta** | 6 Hz | Healing | dream_weave, mind_mend, astral_projection |
| **Gamma** | 40 Hz | Damage | neural_spike, cascade_burst, cognition_blade |
| **Schumann** | 7.83 Hz | Defense | earth_shell, grounding_pulse, resonance_shield |
| **Delta** | 2 Hz | Recovery | deep_reset, subconscious_restore, hibernate |
| **Beta** | 20 Hz | Speed | rapid_fire, neural_accelerator, adrenal_rush |
| **Solfeggio** | 528 Hz | Transform | frequency_shift, morphic_resonance, dna_rewrite |
| **Monroe** | 4 Hz | Precision | third_eye, piercing_insight, astral_sniper |

### Resonance Calculation

```
Bonus Formula:
- Primary resonance: +50% × entrainment_level
- Secondary resonance: +25% × entrainment_level
- Dissonance: -20% per dissonant card
- Hand disharmony (3+ different freqs): -10%
- Opposing frequency pairs: -15%
```

### Verification Levels

| Level | Method | Max Bonus | Anti-Cheat |
|-------|--------|-----------|------------|
| **Honor** | Self-report | +10% | Minimal |
| **Biofeedback** | Microphone analysis | +35% | Pattern detection |
| **Proof** | SynSync signed attestation | +50% | HMAC + server verify |
| **Prime** | HRV/EEG (future) | +60% | Medical device |

### Entrainment Decay

- Full bonus lasts: 30 minutes
- Decay rate: 5% per minute
- Requires re-entrainment after expiration

---

## Integration Flow

```
1. Pre-Battle: Player sees hand resonance analysis
2. Decision: Choose to entrain or battle without bonus
3. Protocol Select: Pick protocol that boosts current hand
4. Verification Mode: SynSync app / Embedded / Honor
5. 60-Second Session: Audio plays, visual feedback
6. Verification: Server validates session
7. Battle: Entrainment bonuses applied to cards
8. Decay: Bonus fades over 30 minutes
```

---

## SynSync PWA Integration

### Deep Link Format
```
synsync://entrain?protocol=alpha&duration=60&callback=https://inversion.app/return&session=xyz123
```

### Callback Return
```
https://inversion.app/synsync-return?session=xyz123&result={signed_payload}
```

### Web Bridge (Fallback)
```typescript
// Embedded Web Audio when app not installed
SynSyncAudioEngine.startProtocol('alpha');
// 60-second session with verification
```

---

## Anti-Cheat Measures

### Client-Side
1. **Session duration tracking** - Minimum 55 seconds
2. **Tab visibility API** - Detect switching away
3. **Audio playback verification** - Confirm tones played
4. **Interaction pattern analysis** - Detect bots (too regular)

### Server-Side
1. **HMAC signatures** - Tamper-proof proof tokens
2. **Nonce tracking** - Prevent replay attacks
3. **Behavioral analysis** - Click timing variance
4. **Biofeedback validation** - Coherence score checks

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Audio Engine | Web Audio API |
| UI | React + CSS3 |
| Verification | HMAC-SHA256 |
| Server | Express.js |
| State | EventEmitter + localStorage |
| Mobile | Deep links / PWA |

---

## Implementation Phases

### Phase 1: Core (Week 1)
- [ ] Card frequency mapping system
- [ ] Resonance calculation engine
- [ ] Protocol selector UI
- [ ] Web Audio integration

### Phase 2: Verification (Week 2)
- [ ] Honor mode fallback
- [ ] Biofeedback microphone detection
- [ ] SynSync deep link
- [ ] Proof signature system

### Phase 3: Polish (Week 3)
- [ ] Visual resonance feedback
- [ ] Decay visualization
- [ ] Anti-cheat behavioral analysis
- [ ] Server verification endpoint

### Phase 4: Advanced (Future)
- [ ] HRV integration (SynSync Prime)
- [ ] EEG headset support
- [ ] Multiplayer synchronized entrainment
- [ ] Entrainment streak leaderboards

---

## Design Philosophy

**Core Insight:** The mechanic bridges the player's *actual mental state* with their in-game performance. This isn't just "press button, get buff"—it's:

1. **Skill-based**: Players learn which protocols work best with their deck
2. **Commitment-based**: 60 seconds of genuine entrainment required
3. **Verifiable**: Multiple anti-cheat layers prevent gaming the system
4. **Accessible**: Honor mode allows participation without full verification
5. **Integrated**: Deep links to SynSync PWA create synergy between products

**The Inversion**: Normally, games distract from wellness. Here, wellness *is* the game mechanic.

---

## API Quick Reference

### ResonanceManager (Client)
```typescript
// Set entrainment from completed session
resonanceManager.setEntrainment('alpha', 0.85, 'biofeedback', 60000);

// Get current modifiers for hand
const mods = resonanceManager.calculateModifiers(hand);
// mods.damageMultiplier = 1.425 (42.5% bonus)

// Listen for decay
resonanceManager.on('entrainmentDecay', ({ level }) => {
  updateAuraVisualization(level);
});
```

### Server Verification
```typescript
// POST /api/entrainment/verify
const result = await fetch('/api/entrainment/verify', {
  method: 'POST',
  body: JSON.stringify({ proof, sessionData })
});
// Returns: { verified, entrainmentLevel, expiresAt }
```

### Audio Engine
```typescript
const audio = new SynSyncAudioEngine();
await audio.init();
await audio.startProtocol('gamma'); // 40Hz binaural
// ... 60 seconds later ...
audio.stop();
```

---

## References

- **SynSync Protocols**: Alpha 10Hz, Theta 6Hz, Gamma 40Hz, Schumann 7.83Hz
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Binaural Beats**: Carrier ± (target/2) Hz
- **Isochronic Tones**: Amplitude modulation at target frequency

---

*Designed for: The Inversion Excursion - Tier 2 Mini App*
*Integration: SynSync Pro / SynSync Prime*
