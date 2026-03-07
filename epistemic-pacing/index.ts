/**
 * Epistemic Pacing System - Index
 * 
 * Central export file for all pacing system modules.
 */

// Types
export * from './types';

// Engine
export { PacingEngine, DEFAULT_STATE, DEFAULT_PREFERENCES } from './pacing-engine';

// Hooks
export { usePacing } from './hooks/usePacing';
export { useDeepWork } from './hooks/useDeepWork';

// Components
export { PacingSelector } from './components/PacingSelector';
export { DeepWorkTimer } from './components/DeepWorkTimer';
export { ReturnRitual } from './components/ReturnRitual';
export { PatienceWallet } from './components/PatienceWallet';

// Default export for convenience
export { default } from './pacing-engine';
