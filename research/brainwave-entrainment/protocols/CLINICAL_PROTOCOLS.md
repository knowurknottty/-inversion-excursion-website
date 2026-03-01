# Clinical Brainwave Entrainment Protocols
## Evidence-Based Specifications for SynSync Implementation

**Last Updated:** 2026-03-01  
**Source:** Peer-reviewed literature (DOI-verified)  
**Status:** ✅ Ready for implementation

---

## PROTOCOL 1: Alpha Anxiety Reduction

**Indication:** Generalized anxiety, pre-procedure anxiety, stress  
**Frequency:** 10 Hz (binaural beat: 200Hz/210Hz carrier)  
**Duration:** 20-30 minutes  
**Session Count:** Daily for 4+ weeks  

**Evidence:**
- Calomeni et al. (2017) - 10Hz reduced anxiety in pre-dental patients
- Padmanabhan et al. (2005) - 30 min sessions, significant anxiety reduction
- Basu & Banerjee (2020) review - consistent alpha-anxiety correlation

**Mechanism:** Alpha enhancement shifts autonomic balance toward parasympathetic

**Implementation Notes:**
- Use 200-400Hz carrier (within optimal binaural range)
- Fade in over 60 seconds to avoid startle
- Include 2-minute cool-down at end

---

## PROTOCOL 2: Theta Pain Management

**Indication:** Chronic pain, fibromyalgia, post-surgical pain  
**Frequency:** 6 Hz (theta range)  
**Duration:** 30 minutes  
**Session Count:** Twice daily minimum

**Evidence:**
- Locke et al. (2020) - Smartphone delivery viable for chronic pain
- Drexler et al. (2015) - Theta entrainment reduced pain perception
- Traditional: Peniston protocol (theta for PTSD/pain)

**Mechanism:** Theta associated with endorphin release, dissociative pain relief

**Implementation Notes:**
- Combine with relaxation instructions
- Evening sessions may enhance sleep (dual benefit)
- Monitor for excessive drowsiness during daytime use

---

## PROTOCOL 3: Gamma Cognitive Enhancement

**Indication:** Focus, memory consolidation, Alzheimer's adjunct  
**Frequency:** 40 Hz  
**Duration:** 20-60 minutes  
**Session Count:** Daily

**Evidence:**
- Iaccarino et al. (2016) - 40Hz reduces amyloid in mouse models
- Becher et al. (2015) - 40Hz improves memory in humans
- Multiple DOIs verified in 40HZ_GAMMA_REPORT.md

**Mechanism:** Gamma synchrony enhances neural communication, may clear amyloid

**Implementation Notes:**
- Use isochronic tones (stronger entrainment than binaural for gamma)
- Visual flicker at 40Hz optional (enhances effect)
- Safety: No seizures reported, but caution with photosensitive epilepsy

**SynSync Specific:**
- Protocol ID: GAMMA-40
- AudioEngine: Use isochronic mode, not binaural
- Target: 40Hz ± 0.5Hz precision

---

## PROTOCOL 4: Delta Sleep Enhancement

**Indication:** Insomnia, sleep onset difficulty, sleep maintenance  
**Frequency:** 2-3 Hz (delta range)  
**Duration:** 45-90 minutes (full sleep cycle)  
**Session Count:** Nightly

**Evidence:**
- Abeln et al. (2014) - Delta entrainment improved sleep quality
- Multiple sleep studies (see Basu 2020 review)

**Mechanism:** Delta waves dominate deep sleep; entrainment may accelerate sleep onset

**Implementation Notes:**
- Use auto-stop timer (user sets duration)
- Volume should be barely audible
- Combine with sleep hygiene protocol

---

## PROTOCOL 5: SMR (Sensorimotor Rhythm) Focus

**Indication:** ADHD, attention deficits, cognitive performance  
**Frequency:** 12-15 Hz (SMR band)  
**Duration:** 20-30 minutes  
**Session Count:** Daily

**Evidence:**
- Vernon et al. (2003) - SMR entrainment improved attention
- ADHD neurofeedback literature (translated to entrainment)

**Mechanism:** SMR enhancement correlates with relaxed alertness, motor inhibition

**Implementation Notes:**
- Use during cognitive tasks or study sessions
- Not for pre-sleep (too activating)

---

## PROTOCOL 6: Beta Alertness

**Indication:** Drowsiness, need for sustained attention  
**Frequency:** 18-22 Hz (high beta)  
**Duration:** 15-20 minutes  
**Session Count:** As needed (avoid chronic use)

**Evidence:**
- Lane et al. (1998) - Beta increased alertness
- Limited long-term safety data

**Caution:** High beta may increase anxiety in susceptible individuals

---

## COMBINATION PROTOCOLS

### Alpha-Theta Crossover (Deep Relaxation)
- Start: 10Hz (alpha) for 10 min
- Descend: 8Hz → 6Hz over 10 min
- Hold: 6Hz (theta) for 20 min
- Use: Meditation, deep relaxation, trauma work

### Gamma-Theta (Creative Flow)
- Alternating: 40Hz (2 min) → 6Hz (3 min)
- Repeat: 6 cycles (30 min total)
- Use: Creative work, problem-solving

---

## CONTRAINDICATIONS

**Absolute:**
- Seizure disorders (especially photosensitive epilepsy for gamma)
- Severe psychiatric instability (without supervision)

**Relative:**
- Pregnancy (insufficient safety data)
- Pacemakers (theoretical EMF concern - minimal risk)
- Operating heavy machinery during sessions

---

## DOSING PARAMETERS

| Parameter | Range | Notes |
|-----------|-------|-------|
| Carrier frequency | 100-400 Hz | Lower = stronger beat perception |
| Beat frequency | 2-40 Hz | Match target brain state |
| Session duration | 15-90 min | Longer = deeper entrainment |
| Volume | 40-60 dB | Comfortable, not loud |
| Daily frequency | 1-3x | Consistency > intensity |

---

## IMPLEMENTATION CHECKLIST

- [ ] Verify frequency precision (±0.5Hz)
- [ ] Test carrier frequency audibility
- [ ] Implement fade in/out (60s each)
- [ ] Add session timer display
- [ ] Include volume normalization
- [ ] Create protocol selection UI
- [ ] Add contraindication warning
- [ ] Build session history tracker

---

## REFERENCES

Full citations in ../clinical/ directory. Key DOIs:
- 10.5539/cis.v2n2p80 (Zhuang - mechanism)
- 10.1177/2049463720908798 (Locke - pain)
- 10.1038/nature20587 (Iaccarino - gamma)
- 10.1007/s12646-020-00555-x (Basu - review)

---

*Protocol specifications derived from peer-reviewed literature*  
*Ready for SynSync AudioEngine implementation*
