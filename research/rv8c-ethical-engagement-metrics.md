# Ethical Engagement Metrics: Measuring "Healthy Addiction"
## Research Vector 8-C: Synthesis Report

---

## Executive Summary

This report establishes a framework for measuring "healthy addiction" — engagement that is deeply compelling yet psychologically beneficial rather than harmful. Traditional metrics like DAU and ARPU incentivize quantity over quality, often leading to exploitative design. This document proposes alternative metrics, warning indicators, and ethical testing principles to validate that inverted engagement mechanics (like those in Wyrd Gun) are creating genuine value rather than dependency.

**Key Insight:** Loss of control is the primary differentiator between addiction and high engagement (Springer Research 2025). Players can love your game intensely while maintaining autonomy — this is the target state.

---

## 1. Alternative Metrics to DAU/ARPU: Engagement Quality vs Quantity

### The Problem with Traditional Metrics

Standard metrics create perverse incentives:
- **DAU (Daily Active Users)** rewards forcing daily logins regardless of player wellbeing
- **ARPU (Average Revenue Per User)** incentivizes extraction over value
- **Session Length** optimizes for time spent, not enjoyment per minute

**Oxford Internet Institute Research (March 2025):** "Players who perceived gaming as beneficial to their lives reported higher overall mental well-being, regardless of how many hours they played." Quality, not quantity, predicts wellbeing.

### Proposed Quality-First Metrics

#### A. Psychological Need Satisfaction Score (PNSS)
Based on Self-Determination Theory (Deci & Ryan), measure:

| Need | Metric | Measurement Method |
|------|--------|-------------------|
| **Autonomy** | Choice density / meaningful options | Track meaningful decisions per session |
| **Competence** | Skill progression satisfaction | Survey + completion rate correlation |
| **Relatedness** | Social connection quality | Voluntary social interactions |

**Target:** All three needs should show positive trends independently of session count.

#### B. Player Experience of Need Satisfaction (PENS)
A validated survey instrument measuring:
- In-game autonomy (choice, volition)
- In-game competence (mastery, optimal challenge)
- In-game relatedness (connection, community)
- Intuitive controls (interface transparency)

**Implementation:** Anonymous post-session micro-surveys (1-2 questions max) distributed naturally at session end.

#### C. Engagement Quality Index (EQI)
Formula:
```
EQI = (Session Satisfaction × Voluntary Return Rate) / (Forced Engagement Events)
```

Where:
- **Session Satisfaction:** Post-session player-reported enjoyment (1-7 scale)
- **Voluntary Return Rate:** % of returns NOT triggered by notifications/FOMO mechanics
- **Forced Engagement Events:** Count of extrinsic pressure triggers used

**Benchmark:** EQI > 4.0 indicates healthy engagement

#### D. Intrinsic Motivation Ratio (IMR)
```
IMR = Intrinsic Motivation Score / (Intrinsic + Extrinsic Motivation Score)
```

Measure via Gaming Motivation Scale (GAMS):
- Intrinsic: "I play because it's fun"
- Integrated: "I play because it's part of who I am"
- Identified: "I play because I value it"
- Introjected: "I play because I'd feel bad if I didn't"
- External: "I play for rewards/achievements"

**Healthy Range:** IMR > 0.6 (majority intrinsic motivation)

#### E. Goal Achievement Correlation (GAC)
Track whether player-defined goals (not game-imposed) are being met:
- Survey: "Did today's session help you achieve what you wanted?"
- Correlation between stated goals and in-game actions
- Progress toward player-defined objectives vs. game-imposed objectives

#### F. PERMA Wellbeing Score
Based on Seligman's PERMA model, adapted for gaming:
- **Positive Emotion:** Joy, satisfaction from play
- **Engagement:** Flow state frequency
- **Relationships:** Quality of social connections
- **Meaning:** Sense of purpose/personal significance
- **Accomplishment:** Achievement satisfaction

**Key Finding:** Research shows "no relation between amount of time people play video games and their well-being." PERMA fulfillment matters more than hours.

---

## 2. Measuring Player Satisfaction vs Compulsion

### The Critical Distinction

**High Engagement (Healthy):**
- Player chooses to play
- Can stop when desired
- Returns because they want to
- Play is harmonious with life

**Compulsion (Harmful):**
- Player feels driven to play
- Difficulty stopping despite wanting to
- Returns because they feel they must
- Play conflicts with other life domains

### Metrics for Satisfaction

#### A. Post-Play Mood Delta
```
Mood Delta = Post-Play Mood - Pre-Play Mood
```

Measure: Short affect scale (3-5 items) before and after sessions
- **Positive Delta:** Player feels better after playing
- **Neutral Delta:** Player feels same
- **Negative Delta:** Player feels worse (WARNING SIGN)

**Target:** >70% of sessions show positive or neutral delta

#### B. Voluntary Stop Rate
What percentage of sessions end because the player chose to stop vs. being forced by external factors?

```
Voluntary Stop Rate = Voluntary Stops / Total Sessions
```

**Interpretation:**
- High VSR (>60%): Players feel in control
- Low VSR (<40%): Players feel trapped

#### C. Return Motivation Survey
When players return, ask (via subtle inline survey):
"Why did you come back today?"
- A) I wanted to (intrinsic)
- B) I had a specific goal (integrated)
- C) I didn't want to lose progress (extrinsic/fear)
- D) I felt like I should (introjected/guilt)

**Target Ratio:** (A+B) / (C+D) > 2.0

### Metrics for Compulsion Warning

#### A. Loss of Control Indicators
From clinical addiction research, track:

| Warning Sign | Metric |
|-------------|--------|
| Failed quit attempts | Player selects "quit" but returns within 5 min |
| Extended play despite intent | Session exceeds stated duration goal |
| Continuation despite negative consequences | Playing during scheduled obligations |

#### B. Preoccupation Score
"How often do you think about the game when not playing?"
- Never / Rarely (healthy)
- Sometimes (moderate)
- Often / Constantly (warning)

#### C. Withdrawal Proxy
Survey question: "How do you feel when you haven't played for a day?"
- Fine / Don't notice (healthy)
- Mildly miss it (normal)
- Anxious / Irritable (warning)
- Can't focus on other things (concern)

### The Harmony vs. Obsession Framework

Research (Przybylski et al.) distinguishes:

**Harmonious Passion:**
- Player controls the activity
- Aligned with personal values
- No conflict with other life areas
- **Metric:** Player-reported life balance > 4/7

**Obsessive Passion:**
- Activity controls the player
- Driven by internal compulsion
- Conflicts with other life areas
- **Metric:** Player-reported inability to stop > 4/7

---

## 3. Warning Indicators: Session Length & Return Patterns

### Session Length Analysis

Traditional view: Longer = better

**Ethical view:** Context matters more than length

#### Healthy Session Patterns

| Pattern | Indication |
|---------|-----------|
| Variable length (30-90 min) | Player-driven engagement |
| Natural endings (completion, satisfaction) | Autonomy preserved |
| Pauses accepted | Player can self-regulate |

#### Warning Patterns

| Pattern | Indication |
|---------|-----------|
| Consistently extended sessions (>3x intended) | Loss of control |
| No natural stopping points | Designed compulsion |
| Resumption after voluntary quit | Addiction pattern |
| Very short, frequent sessions | Compulsive checking |

#### Recommended Metric: Session Control Index
```
SCI = (Sessions Ended by Player Choice) / (Total Sessions)
```

Healthy threshold: SCI > 0.75

### Return Pattern Analysis

#### Healthy Return Patterns

| Pattern | Meaning |
|---------|---------|
| Returns at variable times | Player-driven |
| Returns after completing other activities | Balanced life |
| Returns aligned with player goals | Purposeful engagement |
| Skips days without anxiety | No FOMO dependence |

#### Warning Return Patterns

| Pattern | Meaning |
|---------|---------|
| Returns at same time daily (ritualistic) | Habit formation without consciousness |
| Returns immediately after other activities | Escapism |
| Returns despite stated intent not to | Compulsion |
| Returns triggered by notifications only | External control |

#### Recommended Metric: Voluntary Return Ratio
```
VRR = (Voluntary Returns) / (Total Returns)
```

Exclude returns triggered by:
- Push notifications
- Email/SMS reminders
- FOMO mechanics ("you'll lose streak")
- Time-limited events

Healthy threshold: VRR > 0.60

### The "Addiction Signature" Dashboard

Track these composite indicators:

| Indicator | Warning Threshold | Critical Threshold |
|-----------|------------------|-------------------|
| Sessions extending beyond intent | >30% of sessions | >60% of sessions |
| Negative mood delta | >20% of sessions | >40% of sessions |
| Failed quit attempts | >10% of sessions | >25% of sessions |
| Playing during obligations | Any occurrence | >5% of sessions |
| Preoccupation score | >3/7 | >5/7 |

---

## 4. Ethical A/B Testing Principles

### The Problem with Standard A/B Testing

Traditional A/B testing optimizes for:
- Higher retention (at any cost)
- Longer sessions (regardless of satisfaction)
- More revenue (regardless of player wellbeing)

This creates an incentive gradient toward exploitation.

### The Ethical Testing Framework

#### Principle 1: Optimize for Player-Reported Value, Not Just Behavior

**Unethical:**
- Test which notification timing maximizes returns
- Test which dark pattern increases conversion

**Ethical:**
- Test which features increase post-session satisfaction
- Test which onboarding respects player autonomy

**Rule:** Always include player-reported wellbeing as a dependent variable.

#### Principle 2: Measure Long-Term, Not Just Short-Term

**Unethical:**
- 7-day retention optimization
- Session length increase in first week

**Ethical:**
- 30, 60, 90-day wellbeing trends
- Long-term retention vs. short-term spike

**Rule:** No experiment ships if it increases short-term metrics at the expense of long-term wellbeing.

#### Principle 3: Test for Vulnerable Populations

**Requirement:** Analyze results separately for:
- High-risk players (reported compulsion tendencies)
- Younger players
- Players with reported mental health conditions

**Rule:** A feature that benefits average players but harms vulnerable ones should not ship.

#### Principle 4: Informed Consent for Mechanics Testing

**Ethical requirement:** When testing engagement mechanics:
- Players should know they're in an experiment
- The test's goal ("we're testing if this makes the game more enjoyable") should be disclosed
- Opt-out should be available

**Exception:** UI/UX placement tests that don't affect psychological pressure

#### Principle 5: The "Would You Tell Your Family" Test

Before running any A/B test, ask:
- Would we be comfortable telling players' parents/partners what we're testing?
- Would we defend this test publicly?
- Does this test respect player autonomy?

If no, don't run it.

### Ethical Test Categories

#### Green Light (Always Ethical)
- UI layout optimization
- Tutorial clarity improvements
- Feature discoverability
- Performance optimizations
- Bug fixes

#### Yellow Light (Evaluate Carefully)
- Reward timing adjustments
- Progression curve changes
- Social feature modifications
- Notification content tests

**Requirement:** Include wellbeing metrics; monitor for compulsion indicators

#### Red Light (Never Ethical)
- Dark pattern implementation
- Manipulation of vulnerable players
- Exploitation of loss aversion
- Creating artificial scarcity for engagement
- Any test that knowingly harms player wellbeing

### The Ethical Experiment Checklist

Before launching any A/B test:

- [ ] Player wellbeing is a measured outcome
- [ ] Long-term impact is assessed (minimum 30 days)
- [ ] Vulnerable populations analyzed separately
- [ ] Informed consent obtained where appropriate
- [ ] Rollback plan exists if negative effects detected
- [ ] Team would defend the test publicly
- [ ] Test aligns with stated player goals

---

## 5. Success Criteria for Wyrd Gun Engagement

### The Inverted Design Philosophy

Wyrd Gun (and similar inverted engagement designs) aims to:
- Make players feel powerful, not exploited
- Respect player time and autonomy
- Create compulsion through quality, not pressure
- Build sustainable long-term relationships

### Success Metrics

#### Tier 1: Core Health Indicators (Must Meet)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Post-Session Satisfaction | >5.5/7 | Exit survey |
| Mood Delta (Post - Pre) | >+0.5 points | Pre/post comparison |
| Voluntary Stop Rate | >70% | Session end tracking |
| Voluntary Return Rate | >65% | Return motivation survey |
| PENS Autonomy Score | >5.0/7 | Weekly survey |

#### Tier 2: Quality Indicators (Should Meet)

| Metric | Target | Measurement |
|--------|--------|-------------|
| PENS Competence Score | >5.5/7 | Weekly survey |
| PENS Relatedness Score | >4.5/7 (if social) | Weekly survey |
| Intrinsic Motivation Ratio | >0.65 | Monthly GAMS survey |
| Goal Achievement Correlation | >0.70 | Player goal tracking |
| PERMA Wellbeing Score | Improving trend | Monthly assessment |

#### Tier 3: Sustainability Indicators (Monitor)

| Metric | Target | Measurement |
|--------|--------|-------------|
| 30-Day Retention | >30% | Cohort analysis |
| 90-Day Wellbeing Trend | Stable or improving | Longitudinal survey |
| Session Control Index | >0.75 | Behavioral analysis |
| Player-Reported Life Balance | >4.5/7 | Monthly survey |

### Warning Thresholds (Action Required)

| Indicator | Threshold | Response |
|-----------|-----------|----------|
| Post-session satisfaction declining | 3-week downward trend | Immediate design review |
| Compulsion indicators rising | >15% showing warning signs | Ethical review triggered |
| Voluntary return rate dropping | <50% | Investigate pressure mechanics |
| Negative mood delta increasing | >25% of sessions | Halt and redesign |
| Loss of control reports | Any significant increase | Immediate intervention |

### The Ultimate Success Metric

**Player Testimony Ratio:**
```
PTR = (Positive Player Testimonials) / (Total Testimonials + Negative Reviews)
```

Measure:
- Voluntary player testimonials
- Reviews mentioning "healthy," "respects my time," "can put it down"
- Social media sentiment about engagement quality

**Target:** PTR > 0.80 with explicit mentions of healthy engagement patterns

### Long-Term Success Criteria (6+ Months)

1. **Sustainable Engagement:** Players actively playing 6+ months with stable or improving wellbeing scores
2. **Positive Word Patterns:** Players describing the game using autonomy-respecting language ("I choose to," "I want to" vs "I have to," "I should")
3. **Low Regret Rate:** <10% of former players express regret about time spent
4. **Returning Champion Rate:** Players who quit and return do so voluntarily, not compulsively
5. **Community Health:** Forums/Discord characterized by support, not complaints about addiction

---

## Implementation Recommendations

### Immediate Actions

1. **Deploy PENS Micro-Surveys**
   - 1-2 questions at session end
   - Rotate through autonomy, competence, relatedness
   - Anonymous, optional

2. **Implement Mood Tracking**
   - Optional pre/post session check-in
   - Simple 1-5 mood scale
   - Aggregate anonymously

3. **Create the Addiction Signature Dashboard**
   - Real-time monitoring of warning indicators
   - Automated alerts at thresholds
   - Monthly ethical review meetings

4. **Establish Ethical A/B Testing Protocol**
   - Mandatory checklist before any test
   - Wellbeing as primary outcome for engagement tests
   - No tests without rollback plan

### Medium-Term Actions (1-3 Months)

1. **Baseline Establishment**
   - Full PENS survey to establish baseline
   - PERMA wellbeing assessment
   - GAMS motivation profile

2. **Player Segmentation**
   - Identify high-risk players for special monitoring
   - Segment by motivation type
   - Customize experience to support vulnerable players

3. **Longitudinal Study Design**
   - Track cohorts over 90 days
   - Monitor wellbeing trends
   - Correlate with engagement patterns

### Long-Term Actions (3-6 Months)

1. **Industry Leadership**
   - Publish anonymized ethical metrics
   - Share methodology with industry
   - Establish ethical design standards

2. **Continuous Improvement**
   - Quarterly ethical metric reviews
   - Annual comprehensive wellbeing assessment
   - Iterative design based on findings

---

## Conclusion: How You Know the Inversion Is Working

The inverted engagement model is working when:

1. **Players report feeling in control** — they play because they want to, not because they must
2. **Wellbeing metrics improve or remain stable** — even as engagement deepens
3. **Players describe the experience positively** — using language of choice, not compulsion
4. **Warning indicators remain low** — no significant increase in addiction signatures
5. **Long-term retention is sustainable** — players stay because they're satisfied, not trapped

**The North Star:** If a player had to explain to their loved ones why they play, would they sound like someone describing a healthy hobby they enjoy, or someone making excuses for behavior they can't control?

The ethical engagement framework presented here provides the metrics to answer that question with data, not assumptions.

---

## References & Further Reading

1. Ballou, N., et al. (2025). "Perceived value of video games, but not hours played, predicts mental well-being in casual adult Nintendo players." *Royal Society Open Science*.

2. Charlton, J.P., & Danforth, I.D.W. (2007). "Distinguishing addiction and high engagement in the context of online game playing." *Computers in Human Behavior*.

3. Deci, E.L., & Ryan, R.M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior*. Springer.

4. Przybylski, A.K., Rigby, C.S., & Ryan, R.M. (2010). "A motivational model of video game engagement." *Review of General Psychology*.

5. Ryan, R.M., Rigby, C.S., & Przybylski, A. (2006). "The motivational pull of video games: A self-determination theory approach." *Motivation and Emotion*.

6. Seligman, M.E.P. (2011). *Flourish: A Visionary New Understanding of Happiness and Well-being*. Free Press.

7. Wagener, G.L., & Melzer, A. (2023). "Seligman's PERMA Model in Video Games - The Positive Influence of Video Games on Well-Being." *ICEC 2023*.

8. World Health Organization (2022). ICD-11: Gaming Disorder Criteria.

9. American Psychiatric Association (2022). DSM-5-TR: Internet Gaming Disorder.

10. "Loss of control is a key feature for distinguishing between high engagement and addictive behavior in video gaming." (2025). *Springer*.

---

*Report compiled for Research Vector 8-C: Synthesis - Ethical Engagement Metrics*
*Focus: Validating the Inverted Design Approach for Wyrd Gun*
