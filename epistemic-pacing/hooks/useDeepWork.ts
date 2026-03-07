/**
 * useDeepWork Hook
 * 
 * Specialized hook for deep work session management.
 * Includes timer updates and session analytics.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DeepWorkSession, DeepWorkUnlock, PACING_CONSTANTS } from '../types';

interface UseDeepWorkReturn {
  // Session state
  isActive: boolean;
  session: DeepWorkSession | null;
  
  // Timer
  durationMs: number;
  durationText: string;
  hours: number;
  minutes: number;
  seconds: number;
  
  // Multiplier
  currentMultiplier: number;
  projectedMultiplier: number;
  nextMultiplier: number;
  progressToNext: number;
  
  // Milestones
  achievedUnlocks: DeepWorkUnlock[];
  nextUnlock: { hours: number; unlock: DeepWorkUnlock } | null;
  
  // Controls
  start: () => void;
  end: () => DeepWorkSession | null;
}

interface UseDeepWorkOptions {
  onStart?: (session: DeepWorkSession) => void;
  onEnd?: (session: DeepWorkSession) => void;
  tickInterval?: number;
}

export function useDeepWork(options: UseDeepWorkOptions = {}): UseDeepWorkReturn {
  const { onStart, onEnd, tickInterval = 1000 } = options;
  
  const [session, setSession] = useState<DeepWorkSession | null>(null);
  const [now, setNow] = useState(Date.now());
  const startTimeRef = useRef<number | null>(null);
  
  // Calculate duration
  const durationMs = session ? now - session.startedAt : 0;
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const durationText = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const hoursDecimal = durationMs / (1000 * 60 * 60);
  
  // Calculate multipliers
  const currentMultiplier = calculateMultiplier(hoursDecimal);
  const projectedMultiplier = currentMultiplier;
  const nextMultiplier = getNextMultiplier(hoursDecimal);
  const progressToNext = getProgressToNext(hoursDecimal);
  
  // Calculate unlocks
  const achievedUnlocks = getUnlocksForDuration(hoursDecimal);
  const nextUnlock = getNextUnlock(hoursDecimal);
  
  // Timer effect
  useEffect(() => {
    if (!session) return;
    
    const interval = setInterval(() => {
      setNow(Date.now());
    }, tickInterval);
    
    return () => clearInterval(interval);
  }, [session, tickInterval]);
  
  // Start session
  const start = useCallback(() => {
    const newSession: DeepWorkSession = {
      id: generateId(),
      startedAt: Date.now(),
      endedAt: null,
      durationMs: 0,
      multiplierAchieved: 1.0,
      completed: false,
      patienceEarned: 0,
      unlocks: [],
    };
    
    startTimeRef.current = newSession.startedAt;
    setSession(newSession);
    setNow(Date.now());
    onStart?.(newSession);
  }, [onStart]);
  
  // End session
  const end = useCallback((): DeepWorkSession | null => {
    if (!session) return null;
    
    const endedAt = Date.now();
    const finalDuration = endedAt - session.startedAt;
    const finalHours = finalDuration / (1000 * 60 * 60);
    
    const completedSession: DeepWorkSession = {
      ...session,
      endedAt,
      durationMs: finalDuration,
      multiplierAchieved: calculateMultiplier(finalHours),
      completed: finalHours >= 0.5, // Must be at least 30 min to count
      patienceEarned: Math.floor(finalHours * PACING_CONSTANTS.PATIENCE_PER_HOUR),
      unlocks: getUnlocksForDuration(finalHours),
    };
    
    setSession(null);
    onEnd?.(completedSession);
    
    return completedSession;
  }, [session, onEnd]);
  
  return {
    isActive: session !== null,
    session,
    
    durationMs,
    durationText,
    hours,
    minutes,
    seconds,
    
    currentMultiplier,
    projectedMultiplier,
    nextMultiplier,
    progressToNext,
    
    achievedUnlocks,
    nextUnlock,
    
    start,
    end,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateMultiplier(hours: number): number {
  const tiers = PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS;
  
  if (hours >= 48) return tiers[48];
  if (hours >= 24) return tiers[24];
  if (hours >= 12) return tiers[12];
  if (hours >= 8) return tiers[8];
  if (hours >= 4) return tiers[4];
  
  // Linear interpolation between 0 and 4 hours
  return 1.0 + (hours / 4) * (tiers[4] - 1.0);
}

function getNextMultiplier(hours: number): number {
  const tiers = PACING_CONSTANTS.DEEP_WORK_MULTIPLIERS;
  
  if (hours < 4) return tiers[4];
  if (hours < 8) return tiers[8];
  if (hours < 12) return tiers[12];
  if (hours < 24) return tiers[24];
  return tiers[48];
}

function getProgressToNext(hours: number): number {
  if (hours < 4) return hours / 4;
  if (hours < 8) return (hours - 4) / 4;
  if (hours < 12) return (hours - 8) / 4;
  if (hours < 24) return (hours - 12) / 12;
  if (hours < 48) return (hours - 24) / 24;
  return 1;
}

function getUnlocksForDuration(hours: number): DeepWorkUnlock[] {
  const unlocks: DeepWorkUnlock[] = [];
  
  if (hours >= 4) unlocks.push('focused-mind');
  if (hours >= 8) unlocks.push('subconscious-processing');
  if (hours >= 12) unlocks.push('pattern-recognition');
  if (hours >= 24) unlocks.push('major-revelation-chance');
  if (hours >= 48) unlocks.push('legendary-insight');
  
  return unlocks;
}

function getNextUnlock(hours: number): { hours: number; unlock: DeepWorkUnlock } | null {
  if (hours < 4) return { hours: 4, unlock: 'focused-mind' };
  if (hours < 8) return { hours: 8, unlock: 'subconscious-processing' };
  if (hours < 12) return { hours: 12, unlock: 'pattern-recognition' };
  if (hours < 24) return { hours: 24, unlock: 'major-revelation-chance' };
  if (hours < 48) return { hours: 48, unlock: 'legendary-insight' };
  return null;
}

export default useDeepWork;
