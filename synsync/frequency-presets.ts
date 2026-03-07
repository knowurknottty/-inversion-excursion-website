/**
 * SynSync Frequency Presets Configuration
 * Scientifically-backed brainwave entrainment frequencies
 * 
 * Sources:
 * - Oster, G. (1973). Auditory beats in the brain. Scientific American.
 * - Dr. Jeffrey Thompson - Neuroacoustic Research
 * - Monroe Institute - Hemi-Sync research
 * - National Center for Biotechnology Information studies
 */

import type { FrequencyPreset, FrequencyBand, Waveform } from './audio-engine';

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

export interface ExtendedFrequencyPreset extends FrequencyPreset {
  band: FrequencyBand;
  harmonicOvertones?: number[];    // For advanced layering
  carrierRange: { min: number; max: number };  // Recommended carrier range
  researchNotes: string[];
}

export const DETAILED_PRESETS: Record<FrequencyBand, ExtendedFrequencyPreset> = {
  delta: {
    band: 'delta',
    name: 'Delta',
    frequency: 2.5,
    description: 'Deep sleep, physical healing, regeneration, access to unconscious',
    benefits: [
      'Deep restorative sleep enhancement',
      'Physical healing acceleration',
      'Human growth hormone (HGH) stimulation',
      'Immune system strengthening',
      'Access to unconscious mind and intuition',
      'Pain relief and comfort'
    ],
    recommendedDuration: 20,
    carrierRange: { min: 100, max: 300 },
    harmonicOvertones: [5.0, 7.5],
    researchNotes: [
      'Delta waves (0.5-4 Hz) dominate in deep sleep (stages 3 & 4)',
      'Associated with healing and regeneration processes',
      'HGH released primarily during delta sleep',
      'Infants spend most of their sleep in delta'
    ]
  },

  theta: {
    band: 'theta',
    name: 'Theta',
    frequency: 6.0,
    description: 'Deep meditation, creativity, REM sleep, emotional healing',
    benefits: [
      'Deep meditative states with less practice',
      'Enhanced creativity and problem solving',
      'Vivid visualization and imagery',
      'Emotional processing and healing',
      'Memory consolidation',
      'Subconscious reprogramming',
      'Enhanced learning and retention'
    ],
    recommendedDuration: 15,
    carrierRange: { min: 150, max: 400 },
    harmonicOvertones: [12.0, 18.0],
    researchNotes: [
      'Theta (4-8 Hz) prominent during REM sleep and deep meditation',
      'Gateway to learning, memory, and intuition',
      'Associated with hypnagogic states (twilight consciousness)',
      'Used in Shamanic journeying practices historically'
    ]
  },

  alpha: {
    band: 'alpha',
    name: 'Alpha',
    frequency: 10.0,
    description: 'Relaxed focus, flow state, stress relief, mind-body coordination',
    benefits: [
      'Relaxed alertness without drowsiness',
      'Stress and anxiety reduction',
      'Enhanced learning and absorption',
      'Improved mind-body coordination',
      'Serotonin production support',
      'Bridge between conscious and subconscious',
      'Present-moment awareness'
    ],
    recommendedDuration: 10,
    carrierRange: { min: 200, max: 500 },
    harmonicOvertones: [20.0],
    researchNotes: [
      'Alpha (8-14 Hz) strongest with eyes closed and relaxed',
      'First brainwave discovered by Hans Berger in 1924',
      'Correlates with decreased heart rate and blood pressure',
      'Optimal for learning new information'
    ]
  },

  beta: {
    band: 'beta',
    name: 'Beta',
    frequency: 20.0,
    description: 'Active focus, cognitive performance, alert problem solving',
    benefits: [
      'Focused attention and concentration',
      'Analytical thinking and logic',
      'Problem solving and decision making',
      'Mental alertness and clarity',
      'Motivation and energy boost',
      'Verbal communication enhancement'
    ],
    recommendedDuration: 10,
    carrierRange: { min: 200, max: 600 },
    harmonicOvertones: [40.0],
    researchNotes: [
      'Beta (14-30 Hz) dominates in normal waking consciousness',
      'Low beta (14-20 Hz): focused, calm thinking',
      'High beta (20-30 Hz): stress, anxiety, racing thoughts',
      'Excessive beta linked to insomnia and anxiety disorders'
    ]
  },

  gamma: {
    band: 'gamma',
    name: 'Gamma',
    frequency: 40.0,
    description: 'Peak cognition, insight, higher consciousness, information processing',
    benefits: [
      'Peak mental performance',
      'Enhanced sensory perception',
      'Insight and "aha" moments',
      'Rapid information processing',
      'Higher states of consciousness',
      'Improved memory recall',
      'Compassion and altruism support'
    ],
    recommendedDuration: 5,
    carrierRange: { min: 300, max: 800 },
    harmonicOvertones: [80.0],
    researchNotes: [
      'Gamma (30-100 Hz) associated with peak concentration',
      '40 Hz specifically studied for cognitive enhancement',
      'Low gamma activity linked to learning disabilities',
      'Monks in meditation show high gamma activity',
      'Important for binding different sensory inputs'
    ]
  },

  schumann: {
    band: 'schumann',
    name: 'Schumann Resonance',
    frequency: 7.83,
    description: 'Earth\'s natural frequency, grounding, harmony with nature',
    benefits: [
      'Grounding and centering effect',
      'Connection to Earth\'s natural rhythm',
      'Stress reduction and relaxation',
      'Improved sleep quality',
      'EMF protection support',
      'Enhanced meditation depth',
      'Circadian rhythm alignment'
    ],
    recommendedDuration: 15,
    carrierRange: { min: 150, max: 400 },
    harmonicOvertones: [14.3, 20.8, 27.3],  // Higher Schumann harmonics
    researchNotes: [
      'Discovered by Winfried Otto Schumann in 1952',
      'Caused by lightning strikes in Earth-ionosphere cavity',
      'Matches human alpha-theta boundary (~8 Hz)',
      'NASA includes Schumann frequency in spacecraft',
      'Disruption linked to health issues in studies'
    ]
  }
};

// ============================================================================
// WAVEFORM RECOMMENDATIONS
// ============================================================================

export interface WaveformRecommendation {
  waveform: Waveform;
  useCase: string;
  effectiveness: 'high' | 'medium' | 'low';
  description: string;
}

export const WAVEFORM_RECOMMENDATIONS: Record<FrequencyBand, WaveformRecommendation[]> = {
  delta: [
    { waveform: 'sine', useCase: 'Deep sleep', effectiveness: 'high', description: 'Pure tone, gentle, best for sleep' },
    { waveform: 'triangle', useCase: 'Healing', effectiveness: 'medium', description: 'Softer harmonics than square' },
    { waveform: 'sawtooth', useCase: 'Stimulation', effectiveness: 'low', description: 'Too harsh for delta' }
  ],
  theta: [
    { waveform: 'sine', useCase: 'Meditation', effectiveness: 'high', description: 'Clean, non-distracting' },
    { waveform: 'triangle', useCase: 'Creativity', effectiveness: 'high', description: 'Richer texture for creative work' },
    { waveform: 'sawtooth', useCase: 'Visualization', effectiveness: 'medium', description: 'More harmonics for vivid imagery' }
  ],
  alpha: [
    { waveform: 'sine', useCase: 'Focus', effectiveness: 'high', description: 'Non-intrusive background' },
    { waveform: 'triangle', useCase: 'Learning', effectiveness: 'high', description: 'Engaging but not distracting' },
    { waveform: 'square', useCase: 'Alertness', effectiveness: 'medium', description: 'Strong presence' }
  ],
  beta: [
    { waveform: 'sine', useCase: 'Concentration', effectiveness: 'medium', description: 'May be too subtle' },
    { waveform: 'square', useCase: 'Energy', effectiveness: 'high', description: 'Sharp, alerting' },
    { waveform: 'sawtooth', useCase: 'Motivation', effectiveness: 'high', description: 'Driving, energetic' }
  ],
  gamma: [
    { waveform: 'sine', useCase: 'Cognition', effectiveness: 'high', description: 'Clean signal for processing' },
    { waveform: 'square', useCase: 'Peak performance', effectiveness: 'medium', description: 'Intense stimulation' }
  ],
  schumann: [
    { waveform: 'sine', useCase: 'Grounding', effectiveness: 'high', description: 'Natural, pure resonance' },
    { waveform: 'triangle', useCase: 'Harmony', effectiveness: 'high', description: 'Earth-like quality' }
  ]
};

// ============================================================================
// PROTOCOL PRESETS
// Combined frequency sequences for specific goals
// ============================================================================

export interface ProtocolPreset {
  name: string;
  description: string;
  sequence: {
    band: FrequencyBand;
    duration: number;  // minutes
    transitionTime: number;  // seconds for crossfade
  }[];
  totalTime: number;
  recommendedUse: string;
}

export const PROTOCOL_PRESETS: ProtocolPreset[] = [
  {
    name: 'Sleep Onset',
    description: 'Transition from active mind to deep sleep',
    sequence: [
      { band: 'alpha', duration: 5, transitionTime: 30 },
      { band: 'theta', duration: 5, transitionTime: 30 },
      { band: 'delta', duration: 15, transitionTime: 30 }
    ],
    totalTime: 25,
    recommendedUse: 'Use 30 minutes before desired sleep time'
  },
  {
    name: 'Creative Flow',
    description: 'Enter creative flow state and maintain it',
    sequence: [
      { band: 'schumann', duration: 3, transitionTime: 20 },
      { band: 'theta', duration: 7, transitionTime: 20 },
      { band: 'alpha', duration: 10, transitionTime: 20 }
    ],
    totalTime: 20,
    recommendedUse: 'During creative work, writing, art, or brainstorming'
  },
  {
    name: 'Focus Sprint',
    description: 'Rapid focus for productivity sprints',
    sequence: [
      { band: 'beta', duration: 10, transitionTime: 10 }
    ],
    totalTime: 10,
    recommendedUse: 'Pomodoro sessions, coding, studying'
  },
  {
    name: 'Deep Meditation',
    description: 'Progress into deep meditative states',
    sequence: [
      { band: 'alpha', duration: 5, transitionTime: 30 },
      { band: 'theta', duration: 15, transitionTime: 30 },
      { band: 'delta', duration: 10, transitionTime: 30 }
    ],
    totalTime: 30,
    recommendedUse: 'Daily meditation practice, spiritual work'
  },
  {
    name: 'Peak Performance',
    description: 'Access gamma for peak cognitive performance',
    sequence: [
      { band: 'beta', duration: 5, transitionTime: 15 },
      { band: 'gamma', duration: 5, transitionTime: 15 }
    ],
    totalTime: 10,
    recommendedUse: 'Short bursts for demanding cognitive tasks'
  },
  {
    name: 'Grounding Reset',
    description: 'Return to centered, grounded state',
    sequence: [
      { band: 'schumann', duration: 10, transitionTime: 20 }
    ],
    totalTime: 10,
    recommendedUse: 'After stressful events, EMF exposure, travel'
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get preset by band name
 */
export function getPreset(band: FrequencyBand): ExtendedFrequencyPreset {
  return DETAILED_PRESETS[band];
}

/**
 * Get all preset names
 */
export function getAllPresetNames(): Array<{ band: FrequencyBand; name: string; frequency: number }> {
  return (Object.keys(DETAILED_PRESETS) as FrequencyBand[]).map(band => ({
    band,
    name: DETAILED_PRESETS[band].name,
    frequency: DETAILED_PRESETS[band].frequency
  }));
}

/**
 * Get recommended waveform for band and use case
 */
export function getRecommendedWaveform(
  band: FrequencyBand, 
  useCase?: string
): Waveform {
  const recommendations = WAVEFORM_RECOMMENDATIONS[band];
  
  if (useCase) {
    const match = recommendations.find(r => 
      r.useCase.toLowerCase() === useCase.toLowerCase()
    );
    if (match) return match.waveform;
  }
  
  // Return highest effectiveness waveform
  const highEffectiveness = recommendations.find(r => r.effectiveness === 'high');
  return highEffectiveness?.waveform || 'sine';
}

/**
 * Get carrier frequency recommendation
 */
export function getCarrierRecommendation(band: FrequencyBand): number {
  const range = DETAILED_PRESETS[band].carrierRange;
  // Return middle of recommended range
  return (range.min + range.max) / 2;
}

/**
 * Get protocol preset by name
 */
export function getProtocol(name: string): ProtocolPreset | undefined {
  return PROTOCOL_PRESETS.find(p => 
    p.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Calculate total protocol time in minutes
 */
export function getProtocolDuration(protocol: ProtocolPreset): number {
  return protocol.totalTime;
}

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export default {
  presets: DETAILED_PRESETS,
  waveforms: WAVEFORM_RECOMMENDATIONS,
  protocols: PROTOCOL_PRESETS,
  getPreset,
  getProtocol,
  getRecommendedWaveform,
  getCarrierRecommendation
};
