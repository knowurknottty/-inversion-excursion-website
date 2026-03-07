/**
 * usePacing Hook
 * 
 * React hook for managing notification pacing state.
 * Provides easy access to rhythm controls and state.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PacingEngine } from '../pacing-engine';
import {
  NotificationPreferences,
  NotificationRhythm,
  DeepWorkSession,
  DeepWorkState,
  PatienceWallet,
  QueuedNotification,
  PacingEvent,
  PacingEngineState,
  DEFAULT_PREFERENCES,
  DEFAULT_DEEP_WORK_STATE,
  DEFAULT_PATIENCE_WALLET,
} from '../types';

interface UsePacingOptions {
  initialState?: Partial<PacingEngineState>;
  onEvent?: (event: PacingEvent) => void;
  persistKey?: string;
}

interface UsePacingReturn {
  // State
  preferences: NotificationPreferences;
  deepWork: DeepWorkState;
  patience: PatienceWallet;
  notificationQueue: QueuedNotification[];
  
  // Rhythm controls
  rhythm: NotificationRhythm;
  setRhythm: (rhythm: NotificationRhythm) => void;
  
  // Deep work
  isInDeepWork: boolean;
  activeDeepWorkSession: DeepWorkSession | null;
  startDeepWork: () => void;
  endDeepWork: () => void;
  projectedMultiplier: number;
  
  // Preferences
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  
  // Engine access
  engine: PacingEngine;
}

export function usePacing(options: UsePacingOptions = {}): UsePacingReturn {
  const { initialState, onEvent, persistKey } = options;
  
  // Initialize engine
  const engineRef = useRef<PacingEngine>();
  if (!engineRef.current) {
    // Try to load persisted state
    let persistedState: Partial<PacingEngineState> | undefined;
    if (persistKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          persistedState = JSON.parse(saved);
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    engineRef.current = new PacingEngine({
      ...persistedState,
      ...initialState,
    });
  }
  
  const engine = engineRef.current;
  
  // Local state mirrors engine state
  const [state, setState] = useState<PacingEngineState>(() => engine.getState());
  
  // Sync state with engine and persist
  const syncState = useCallback(() => {
    const newState = engine.getState();
    setState(newState);
    
    if (persistKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(persistKey, JSON.stringify(newState));
      } catch {
        // Ignore storage errors
      }
    }
  }, [engine, persistKey]);
  
  // Subscribe to events
  useEffect(() => {
    const unsubscribe = engine.onEvent((event) => {
      syncState();
      onEvent?.(event);
    });
    
    return unsubscribe;
  }, [engine, onEvent, syncState]);
  
  // Rhythm controls
  const setRhythm = useCallback((rhythm: NotificationRhythm) => {
    engine.setRhythm(rhythm);
    syncState();
  }, [engine, syncState]);
  
  // Deep work controls
  const startDeepWork = useCallback(() => {
    engine.setRhythm('deep-work');
    syncState();
  }, [engine, syncState]);
  
  const endDeepWork = useCallback(() => {
    engine.endDeepWork();
    syncState();
  }, [engine, syncState]);
  
  // Preferences
  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    engine.updatePreferences(prefs);
    syncState();
  }, [engine, syncState]);
  
  // Derived values
  const isInDeepWork = state.preferences.rhythm === 'deep-work';
  const projectedMultiplier = isInDeepWork ? engine.getProjectedMultiplier() : 1.0;
  
  return {
    preferences: state.preferences,
    deepWork: state.deepWork,
    patience: state.patience,
    notificationQueue: state.notificationQueue,
    
    rhythm: state.preferences.rhythm,
    setRhythm,
    
    isInDeepWork,
    activeDeepWorkSession: state.deepWork.activeSession,
    startDeepWork,
    endDeepWork,
    projectedMultiplier,
    
    updatePreferences,
    
    engine,
  };
}

export default usePacing;
