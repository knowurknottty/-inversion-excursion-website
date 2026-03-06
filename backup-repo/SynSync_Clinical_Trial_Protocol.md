# SynSync Pro Pilot Study Protocol
## A Randomized, Sham-Controlled Trial to Validate 2-Minute Brainwave Entrainment Effectiveness

**Protocol Version:** 1.0  
**Date:** March 2026  
**Study Sponsor:** SynSync Pro (Startup Phase)  
**Principal Investigator:** [To be designated]  
**Protocol ID:** SYN-001-PILOT

---

## 1. EXECUTIVE SUMMARY

This pilot study aims to provide preliminary scientific validation for SynSync Pro's core claim: that a 2-minute brainwave entrainment intervention produces measurable neurophysiological and psychological effects. The study employs a randomized, sham-controlled, double-blind crossover design to maximize scientific rigor while maintaining feasibility for a startup budget.

**Key Innovation:** Most brainwave entrainment studies use 15-30 minute sessions. This study specifically tests whether a 2-minute intervention—aligned with SynSync's product positioning—can demonstrate statistically significant effects.

---

## 2. STUDY POPULATION AND SAMPLE SIZE

### 2.1 Inclusion Criteria

- **Age:** 18-45 years (inclusive)
- **Gender:** All genders eligible
- **Health Status:** Self-reported healthy adults
- **Cognitive Status:** Normal or corrected-to-normal vision and hearing
- **Technology Comfort:** Basic familiarity with smartphone applications
- **Language:** Fluent in English (or local language where study is conducted)

### 2.2 Exclusion Criteria

- History of epilepsy, seizures, or photosensitive epilepsy
- Diagnosed neurological or psychiatric disorders (e.g., bipolar disorder, schizophrenia, severe depression)
- Current use of psychoactive medications (antidepressants, antipsychotics, anxiolytics, stimulants)
- Pregnancy or breastfeeding
- History of traumatic brain injury
- Implanted medical devices (pacemakers, cochlear implants, etc.)
- Current substance abuse or dependence (alcohol, recreational drugs)
- Prior experience with brainwave entrainment products (to reduce expectancy bias)
- Shift workers or individuals with irregular sleep schedules

### 2.3 Sample Size Calculation

**Primary Justification:**

Based on comparable pilot studies in neurofeedback and brainwave entrainment:
- Cidral-Filho et al. (2025): n=30 for 20-minute AVE study, detected large effect sizes (Cohen's d = 0.86-1.39)
- Haag et al. (2024): n=34 for single-session neurofeedback pilot
- Standard pilot study recommendations: 12-50 participants for feasibility and effect size estimation

**Power Analysis:**

Using G*Power 3.1 for within-subjects design:
- **Effect size:** Cohen's d = 0.5 (medium, conservative estimate for 2-minute intervention)
- **Alpha:** 0.05 (two-tailed)
- **Power:** 0.80
- **Design:** Within-subjects (crossover) with 2 conditions
- **Correlation between measures:** r = 0.5 (estimated)

**Calculated minimum:** n = 34 participants

**Recruitment Target:** n = 45 participants (accounting for ~25% attrition/dropout)

**Rationale for 45:**
- Allows for 10-12 dropouts while maintaining minimum powered sample
- Provides buffer for technical failures (EEG artifacts, equipment issues)
- Enables exploratory subgroup analyses (responders vs. non-responders)

---

## 3. STUDY DESIGN

### 3.1 Design Overview

**Type:** Randomized, sham-controlled, double-blind, crossover pilot study

**Conditions:**
1. **Active SynSync:** 2-minute audio-visual brainwave entrainment at target frequency
2. **Sham Control:** 2-minute audio-visual stimulation at non-entrainment frequency

**Blinding:**
- **Participants:** Blind to condition assignment
- **Investigators:** Research assistants administering assessments blind to condition
- **Data Analyst:** Blind to condition until after primary analysis

### 3.2 Sham Control Design

**Critical Design Decision:** The sham must be perceptually identical but physiologically inert.

**Proposed Sham:**
- **Visual:** Same flickering light patterns but at pseudo-random frequencies (no consistent entrainment frequency)
- **Audio:** Same carrier tones but with non-rhythmic modulation or frequencies outside effective entrainment range (>40 Hz or <1 Hz)
- **Duration:** Identical 2-minute exposure
- **User Interface:** Identical app experience, instructions, and feedback

**Validation of Sham:**
- Post-session questionnaire: "Did you notice any difference between sessions?"
- If >30% can reliably distinguish, sham design needs revision

**Alternative Sham Options (if primary fails validation):**
1. **Brown noise + static light:** Same sensory modality, no rhythmic component
2. **Nature sounds + dim light:** Relaxing but non-entrainment
3. **Inverted frequencies:** Active entrainment at non-target band (e.g., beta instead of alpha/theta)

### 3.3 Study Timeline

| Phase | Duration | Activities |
|-------|----------|------------|
| **Screening** | 1 week | Phone/email screening, informed consent |
| **Visit 1 (Baseline)** | 60 min | Demographics, baseline questionnaires, EEG setup training |
| **Visit 2 (Session A)** | 45 min | Pre-assessments → Randomized condition → Post-assessments |
| **Washout** | 3-7 days | Minimum 72 hours between sessions |
| **Visit 3 (Session B)** | 45 min | Pre-assessments → Crossover condition → Post-assessments |
| **Follow-up** | 1 week | Optional: 7-day daily diary (exploratory) |

**Total participation time:** ~3 weeks per participant

### 3.4 Randomization

- **Method:** Computer-generated random sequence (block randomization, block size = 4)
- **Allocation:** 1:1 to sequence (Active→Sham vs. Sham→Active)
- **Concealment:** Sealed envelopes or secure electronic system
- **Stratification:** By sex (to ensure balance, given potential hormonal influences on EEG)

---

## 4. PRIMARY AND SECONDARY ENDPOINTS

### 4.1 Primary Endpoint

**Change in Alpha Power (8-13 Hz) from Pre to Post-Intervention**

- **Measurement:** EEG spectral power at O1, O2 (occipital regions)
- **Time window:** Average power during final 30 seconds of 2-minute session vs. 30-second baseline
- **Rationale:** Alpha entrainment is the most robust and well-documented effect in the literature
- **Success criterion:** Active condition shows significantly greater alpha power increase than sham (p < 0.05)

### 4.2 Secondary Endpoints

**Neurophysiological:**
1. Theta power change (4-8 Hz) at frontal and temporal sites
2. Alpha/Theta ratio change
3. Heart rate variability (HRV) - RMSSD during intervention
4. Time to onset of frequency shift (latency analysis)

**Subjective/Psychological:**
5. State-Trait Anxiety Inventory (STAI-State) - change score
6. Visual Analog Scale (VAS) for relaxation (0-100)
7. Visual Analog Scale (VAS) for mental clarity (0-100)
8. Positive and Negative Affect Schedule (PANAS) - short form
9. Session Evaluation Questionnaire (SEQ) - engagement and experience

**Cognitive:**
10. Attention Network Test (ANT) - reaction time and accuracy
11. N-back task (1-back and 2-back) - working memory
12. Psychomotor Vigilance Task (PVT) - sustained attention

**Exploratory:**
13. Individual differences in response (responder analysis)
14. Baseline characteristics predicting response
15. 7-day follow-up: daily stress and sleep quality ratings

---

## 5. MEASUREMENT TOOLS

### 5.1 EEG Acquisition

**Equipment Options (Budget-Dependent):**

| Tier | Device | Cost | Channels | Pros | Cons |
|------|--------|------|----------|------|------|
| **Budget** | Muse 2 or Muse S | ~$250 | 4 (AF7, AF8, TP9, TP10) | Affordable, validated for research | Limited coverage, no occipital |
| **Mid** | OpenBCI Cyton | ~$500 | 8 | Open source, customizable | Requires technical expertise |
| **Preferred** | BrainVision ActiChamp or equivalent | ~$15K | 32+ | Research-grade, full coverage | High cost |
| **Hybrid** | Emotiv EPOC X | ~$850 | 14 | Good coverage, portable | Moderate signal quality |

**Recommended for Startup Budget:** Emotiv EPOC X or similar 14-channel system

**EEG Protocol:**
- **Sampling rate:** 256 Hz minimum
- **Electrode placement:** International 10-20 system
- **Key sites:** F3, F4, C3, C4, P3, P4, O1, O2, T7, T8 (minimum)
- **Reference:** Linked mastoids or average reference
- **Ground:** AFz or separate ground electrode
- **Impedance:** <10 kΩ before recording

**Preprocessing:**
1. Bandpass filter: 0.5-50 Hz
2. Notch filter: 50/60 Hz (line noise)
3. Artifact rejection: Visual inspection + automated thresholding
4. ICA or SSP for ocular/muscular artifact removal
5. Epoching: 2-second windows with 50% overlap
6. FFT or Welch's method for power spectral density

### 5.2 Physiological Monitoring

**Heart Rate Variability (HRV):**
- **Device:** Polar H10 chest strap or equivalent
- **Metrics:** RMSSD, pNN50, LF/HF ratio
- **Timing:** Continuous during intervention

**Optional:**
- Galvanic skin response (GSR) - emotional arousal
- Respiration rate - relaxation indicator

### 5.3 Cognitive Testing

**Attention Network Test (ANT):**
- Duration: ~20 minutes
- Measures: Alerting, orienting, executive attention
- Platform: E-Prime, PsychoPy, or Inquisit

**N-back Task:**
- Duration: ~10 minutes
- Measures: Working memory updating
- Platform: Same as above

**Psychomotor Vigilance Task (PVT):**
- Duration: 10 minutes
- Measures: Sustained attention, reaction time variability
- Platform: Standardized PVT software or smartphone app

### 5.4 Questionnaires

**Validated Instruments:**

| Measure | Purpose | Timing |
|---------|---------|--------|
| STAI-State | Anxiety | Pre, Post (both sessions) |
| PANAS (short) | Affect | Pre, Post (both sessions) |
| VAS (custom) | Relaxation, Clarity | Pre, Post (both sessions) |
| SEQ (custom) | Experience quality | Post only |
| Credibility/Expectancy | Expectancy effects | Baseline only |
| Blinding check | Sham validation | Post-Session 2 |

---

## 6. STATISTICAL ANALYSIS PLAN

### 6.1 Analysis Population

- **Intent-to-treat (ITT):** All randomized participants
- **Per-protocol:** Participants completing both sessions with usable data
- **Primary analysis:** Per-protocol with sensitivity analysis on ITT

### 6.2 Primary Analysis

**Endpoint:** Change in alpha power (post - pre)

**Model:** Mixed-effects ANOVA or linear mixed model (LMM)

```
Alpha_Change ~ Condition (Active vs Sham) + Session_Order + Baseline_Alpha + (1|Participant)
```

**Planned Contrasts:**
- Active vs. Sham (primary hypothesis)
- Session 1 vs. Session 2 (order effects)
- Interaction: Condition × Order

**Significance level:** α = 0.05 (two-tailed)

**Effect size:** Cohen's d for paired comparisons

### 6.3 Secondary Analyses

**Multiple Comparisons:**
- Bonferroni or FDR correction for secondary endpoints
- Primary endpoint: no correction (single primary)
- Secondary: family-wise error rate controlled at α = 0.05

**Exploratory Analyses:**
1. **Responder analysis:** Define responder as >1 SD improvement in primary outcome; compare proportions
2. **Baseline predictors:** Regression models with baseline alpha, anxiety, expectancy as predictors
3. **Time course:** Within-session time series analysis (0-30s, 30-60s, 60-90s, 90-120s)
4. **Subgroup analyses:** Sex, age tertiles, baseline anxiety level

### 6.4 Missing Data

- **Assumption:** Missing at random (MAR)
- **Method:** Multiple imputation or full information maximum likelihood (FIML) in mixed models
- **Sensitivity:** Complete case analysis as comparison

### 6.5 Software

- **Primary:** R (lme4, afex, ggplot2) or Python (statsmodels, pingouin)
- **EEG:** EEGLAB (MATLAB) or MNE-Python
- **Power:** G*Power 3.1

---

## 7. TIMELINE AND BUDGET ESTIMATES

### 7.1 Project Timeline

| Phase | Duration | Key Milestones |
|-------|----------|----------------|
| **Preparation** | 2-3 months | IRB submission, equipment procurement, protocol finalization |
| **IRB Review** | 1-2 months | Approval received, informed consent finalized |
| **Recruitment** | 2-3 months | 45 participants enrolled |
| **Data Collection** | 3-4 months | All sessions completed |
| **Analysis** | 1-2 months | Data cleaning, statistical analysis |
| **Reporting** | 1 month | Manuscript preparation, poster presentation |
| **Total** | **10-15 months** | From protocol to publication |

### 7.2 Budget Estimates

#### Option A: Lean Startup Budget (~$15,000-25,000)

| Item | Cost (USD) | Notes |
|------|------------|-------|
| **EEG Equipment** | $2,000-5,000 | Emotiv EPOC X or similar; or rental |
| **Software Licenses** | $500-1,000 | E-Prime, PsychoPy donation, analysis software |
| **Participant Compensation** | $4,500-6,750 | $100-150 per participant × 45 |
| **IRB Fees** | $0-2,000 | University-affiliated may be free; commercial IRB ~$1,500-3,000 |
| **Research Assistant** | $3,000-6,000 | Part-time student RA |
| **Statistical Consultant** | $1,000-2,000 | Optional but recommended |
| **Miscellaneous** | $1,000-2,000 | Supplies, printing, participant refreshments |
| **Contingency (10%)** | $1,300-2,500 | |
| **TOTAL** | **$15,000-25,000** | |

#### Option B: Enhanced Budget (~$35,000-50,000)

| Item | Cost (USD) | Notes |
|------|------------|-------|
| **EEG Equipment** | $10,000-15,000 | Research-grade 32-channel system |
| **Software Licenses** | $1,000-2,000 | |
| **Participant Compensation** | $6,750-9,000 | $150-200 per participant |
| **IRB/Regulatory** | $2,000-5,000 | Commercial IRB, protocol consultation |
| **Research Coordinator** | $8,000-12,000 | 0.5 FTE for 6 months |
| **Biostatistician** | $3,000-5,000 | Formal collaboration |
| **Publication Costs** | $1,500-3,000 | Open access fees |
| **Conference Travel** | $2,000-3,000 | Present findings |
| **Contingency (15%)** | $5,000-8,000 | |
| **TOTAL** | **$35,000-50,000** | |

### 7.3 Cost-Saving Strategies

1. **University Partnership:** Collaborate with a university lab (reduces IRB costs, provides equipment access)
2. **Equipment Sharing:** Partner with existing neuroscience lab
3. **Student Researchers:** Use graduate students for credit/hourly
4. **Remote Testing:** For follow-up measures (reduces facility costs)
5. **Open Source Software:** PsychoPy, OpenSesame, R, Python

---

## 8. IRB CONSIDERATIONS

### 8.1 Risk Assessment

**Risk Level:** Minimal

**Justification:**
- Non-invasive intervention
- No known serious adverse effects of audio-visual entrainment at tested parameters
- Short duration (2 minutes)
- Participants can terminate at any time
- No deception involved

**Potential Risks:**
- Mild discomfort from EEG cap/electrodes
- Rare: headache, dizziness, nausea (typically with longer sessions)
- Photosensitive individuals: theoretical seizure risk (mitigated by exclusion criteria)
- Psychological: mild anxiety during cognitive testing

### 8.2 Risk Mitigation

1. **Exclusion criteria** screen out high-risk individuals
2. **Informed consent** clearly describes all risks
3. **Monitoring:** Research assistant present during all sessions
4. **Stop criteria:** Immediate termination if participant reports distress
5. **Medical referral:** Protocol for adverse events

### 8.3 Informed Consent Elements

Required elements per 45 CFR 46:
1. Study purpose and procedures
2. Duration of participation
3. Risks and discomforts
4. Benefits (no direct benefit, contribution to science)
5. Alternatives to participation
6. Confidentiality protections
7. Compensation
8. Voluntary participation and right to withdraw
9. Contact information for questions
10. Statement that this is research

**Additional elements:**
- Explanation of randomization and blinding
- Data sharing plans (de-identified)
- Photographs/video (if applicable)
- Commercial interest disclosure (startup affiliation)

### 8.4 IRB Submission Strategy

**Recommended Path:**

1. **Determine IRB of Record:**
   - If university collaboration: Use university IRB
   - If independent: Use commercial IRB (e.g., WCG, Advarra) or local hospital IRB

2. **Submission Package:**
   - Protocol (this document)
   - Informed consent form
   - Recruitment materials
   - Investigator CV and training certificates
   - Data safety monitoring plan
   - Data confidentiality plan

3. **Review Type:**
   - Likely **expedited review** (Category 7: non-invasive collection of biological specimens)
   - Full board review if IRB determines otherwise

4. **Timeline:**
   - Expedited: 2-4 weeks
   - Full board: 6-8 weeks

### 8.5 Data Safety Monitoring

**Given minimal risk:**
- PI serves as primary monitor
- Quarterly review of adverse events
- Stopping rules: >10% serious adverse events or any unexpected serious event

**Adverse Event Reporting:**
- All AEs documented
- Serious AEs reported to IRB within 24-48 hours
- Annual continuing review

---

## 9. PUBLICATION STRATEGY

### 9.1 Target Journals

**Primary Target (Pilot Study):**
- *Frontiers in Human Neuroscience* (IF ~3.0, open access)
- *Journal of Neurotherapy* (specialized, neurofeedback focus)
- *Applied Psychophysiology and Biofeedback* (IF ~1.5)
- *BMC Psychology* (open access, rigorous)

**Secondary Targets (if effect sizes are large):**
- *Psychophysiology* (IF ~3.5, premier journal)
- *NeuroImage* (IF ~6.0, if imaging included)
- *Brain and Behavior* (open access)

**Conference Presentations:**
- International Society for Neurofeedback and Research (ISNR) Annual Conference
- Society for Psychophysiological Research (SPR) Annual Meeting
- Association for Applied Psychophysiology and Biofeedback (AAPB)

### 9.2 Pre-registration

**Strongly Recommended:**
- Register on ClinicalTrials.gov (required if US-based, FDA-regulated device)
- Or: OSF Registries (free, open science framework)
- Or: AsPredicted.org (quick pre-registration)

**Pre-registration protects against:**
- HARKing (Hypothesizing After Results are Known)
- Publication bias
- p-hacking concerns

### 9.3 Open Science Practices

1. **Data Sharing:** De-identified data on OSF or Figshare
2. **Code Sharing:** Analysis scripts on GitHub
3. **Materials:** Stimuli and protocols shared
4. **Preprint:** Post to bioRxiv or PsyArXiv before journal submission

### 9.4 Authorship Guidelines

**Contributor Roles (CRediT):**
- Conceptualization: [Founder/PI]
- Methodology: [PI, Statistician]
- Investigation: [RA, Coordinator]
- Data Curation: [RA]
- Formal Analysis: [Statistician, PI]
- Writing: [PI, Founding team]
- Funding: [Startup]

**Authorship Order:**
- First author: Primary contributor to execution and writing
- Last author: Senior author (PI)
- Middle authors: By contribution

### 9.5 Timeline to Publication

| Milestone | Target Date |
|-----------|-------------|
| Study completion | Month 10-12 |
| Data analysis complete | Month 12-13 |
| Manuscript draft | Month 13-14 |
| Co-author review | Month 14 |
| Preprint posted | Month 14-15 |
| Journal submission | Month 15 |
| First decision | Month 17-18 |
| Revision/resubmission | Month 19 |
| Acceptance | Month 20-22 |
| Publication | Month 22-24 |

---

## 10. LIMITATIONS AND MITIGATIONS

| Limitation | Mitigation |
|------------|------------|
| Small sample size (pilot) | Power calculation justifies; results inform larger trial |
| Single site | Acknowledge; multi-site for Phase II |
| Short intervention (2 min) | This is the research question; powered for this specific claim |
| Healthy population only | Justified for pilot; clinical populations in future |
| Sham may not be perfect | Blinding check; acknowledge as limitation |
| No long-term follow-up | 7-day diary; longitudinal study planned |
| Startup bias | Independent statistician; pre-registration; open data |

---

## 11. FUTURE DIRECTIONS

**Phase II (if pilot successful):**
- Larger sample (n=100-200)
- Clinical populations (anxiety, insomnia, ADHD)
- Longitudinal design (4-8 weeks)
- Dose-response (1 min, 2 min, 5 min, 10 min)
- Home-based deployment with remote monitoring

**Regulatory Pathway:**
- FDA 510(k) clearance consideration (if marketed for medical indications)
- CE marking for European market
- Wellness device classification (lower regulatory burden)

---

## 12. REFERENCES

1. Cidral-Filho FJ, et al. (2025). Impact of Audiovisual Brainwave Entrainment on Alpha Wave Activity. *Journal of Neurology and Psychology*, 11(1).

2. Haag L, et al. (2024). Exploring trait differences in neurofeedback learners: a single-session sham-controlled pilot study. *Current Psychology*.

3. Faul F, et al. (2007). G*Power 3: A flexible statistical power analysis program. *Behavior Research Methods*, 39(2), 175-191.

4. Thibault RT, Pedder SC. (2022). Individual differences in neurofeedback learning. *Neuroscience & Biobehavioral Reviews*.

5. Halpin S. (2023). Theta Brainwave Entrainment Combined With Natural Environments. *PhD Thesis*, University of Cádiz.

6. World Medical Association. (2013). Declaration of Helsinki. *JAMA*, 310(20), 2191-2194.

7. 45 CFR Part 46 - Protection of Human Subjects.

---

## 13. APPENDICES

### Appendix A: Informed Consent Template
### Appendix B: Questionnaires and Scales
### Appendix C: EEG Acquisition Protocol
### Appendix D: Data Collection Forms
### Appendix E: Adverse Event Log
### Appendix F: Statistical Analysis Code (R/Python)

---

**Protocol End**

*This protocol is a living document and may be updated with IRB approval and version control.*
