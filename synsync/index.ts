/**
 * SynSync Audio Engine - Index File
 * Main entry point for the audio engine module
 */

// Core exports
export {
  AudioEngine,
  createAudioEngine,
  EnvelopeManager,
  PanningManager,
  AudioPerformanceMonitor
} from './audio-engine';

// Types
export type {
  FrequencyBand,
  Waveform,
  FrequencyPreset,
  BinauralConfig,
  IsochronicConfig,
  EnvelopeConfig,
  AudioSession,
  AudioMetrics
} from './audio-engine';

// Frequency presets
export {
  FREQUENCY_PRESETS,
  DETAILED_PRESETS,
  PROTOCOL_PRESETS,
  WAVEFORM_RECOMMENDATIONS,
  getPreset,
  getProtocol,
  getRecommendedWaveform,
  getCarrierRecommendation,
  getAllPresetNames
} from './frequency-presets';

export type {
  ExtendedFrequencyPreset,
  WaveformRecommendation,
  ProtocolPreset
} from './frequency-presets';

// Default export
export { default } from './audio-engine';
