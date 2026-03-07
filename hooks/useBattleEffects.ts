/**
 * EPWORLD Battle Hooks
 * Additional hooks for battle interactions and effects
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useBattleStore } from '@/lib/store';

// ============================================================================
// TYPES
// ============================================================================

export interface DamageEvent {
  id: string;
  amount: number;
  type: 'damage' | 'heal' | 'critical' | 'miss';
  target: 'player' | 'opponent';
  timestamp: number;
}

export interface BattleAnimationState {
  isShaking: boolean;
  isFlashing: boolean;
  transformationLevel: number;
  showTransformation: boolean;
  damageEvents: DamageEvent[];
}

// ============================================================================
// DAMAGE VISUALIZER HOOK
// ============================================================================

export function useDamageVisualizer() {
  const [damageEvents, setDamageEvents] = useState<DamageEvent[]>([]);

  const showDamage = useCallback((
    amount: number,
    type: 'damage' | 'heal' | 'critical' | 'miss',
    target: 'player' | 'opponent'
  ) => {
    const event: DamageEvent = {
      id: `dmg_${Date.now()}_${Math.random()}`,
      amount,
      type,
      target,
      timestamp: Date.now(),
    };

    setDamageEvents(prev => [...prev, event]);

    // Auto-remove after animation
    setTimeout(() => {
      setDamageEvents(prev => prev.filter(e => e.id !== event.id));
    }, 1200);
  }, []);

  const clearDamageEvents = useCallback(() => {
    setDamageEvents([]);
  }, []);

  return {
    damageEvents,
    showDamage,
    clearDamageEvents,
  };
}

// ============================================================================
// KI SYSTEM HOOK
// ============================================================================

export function useKiSystem(initialKi: number = 0) {
  const [ki, setKi] = useState(initialKi);
  const [level, setLevel] = useState(0);
  const [isTransforming, setIsTransforming] = useState(false);

  const maxKi = 100;

  // Calculate ki level based on current ki
  useEffect(() => {
    const newLevel = Math.floor(ki / 25);
    if (newLevel !== level && newLevel > level) {
      setIsTransforming(true);
      setTimeout(() => setIsTransforming(false), 3000);
    }
    setLevel(newLevel);
  }, [ki, level]);

  const chargeKi = useCallback((amount: number) => {
    setKi(prev => Math.min(maxKi, prev + amount));
  }, []);

  const consumeKi = useCallback((amount: number) => {
    setKi(prev => Math.max(0, prev - amount));
  }, []);

  const setKiLevel = useCallback((newKi: number) => {
    setKi(Math.max(0, Math.min(maxKi, newKi)));
  }, []);

  const getKiState = useCallback(() => {
    return {
      current: ki,
      max: maxKi,
      percentage: (ki / maxKi) * 100,
      level,
      canTransform: ki >= 75,
      spiritBombReady: ki >= 100,
    };
  }, [ki, level]);

  return {
    ki,
    level,
    isTransforming,
    maxKi,
    chargeKi,
    consumeKi,
    setKiLevel,
    getKiState,
  };
}

// ============================================================================
// BATTLE ANIMATIONS HOOK
// ============================================================================

export function useBattleAnimations() {
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState('#ffffff');

  const shakeScreen = useCallback((duration: number = 500, intensity: number = 1) => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), duration);
  }, []);

  const flashScreen = useCallback((color: string = '#ffffff', duration: number = 300) => {
    setFlashColor(color);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), duration);
  }, []);

  const triggerCriticalHit = useCallback(() => {
    shakeScreen(600, 1.2);
    flashScreen('#facc15', 200);
  }, [shakeScreen, flashScreen]);

  const triggerDamageTaken = useCallback(() => {
    shakeScreen(400, 0.8);
    flashScreen('#ef4444', 150);
  }, [shakeScreen, flashScreen]);

  const triggerVictory = useCallback(() => {
    shakeScreen(800, 0.5);
    flashScreen('#22c55e', 500);
  }, [shakeScreen, flashScreen]);

  const triggerDefeat = useCallback(() => {
    shakeScreen(600, 0.3);
    flashScreen('#7f1d1d', 500);
  }, [shakeScreen, flashScreen]);

  return {
    isShaking,
    isFlashing,
    flashColor,
    shakeScreen,
    flashScreen,
    triggerCriticalHit,
    triggerDamageTaken,
    triggerVictory,
    triggerDefeat,
  };
}

// ============================================================================
// TURN TRANSITION HOOK
// ============================================================================

export function useTurnTransition() {
  const { currentTurn } = useBattleStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTurn, setDisplayTurn] = useState(currentTurn);
  const previousTurn = useRef(currentTurn);

  useEffect(() => {
    if (currentTurn !== previousTurn.current) {
      setIsTransitioning(true);
      
      // Wait for exit animation
      setTimeout(() => {
        setDisplayTurn(currentTurn);
        previousTurn.current = currentTurn;
        
        // Wait for enter animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 200);
    }
  }, [currentTurn]);

  return {
    displayTurn,
    isTransitioning,
  };
}

// ============================================================================
// BATTLE LOG HOOK
// ============================================================================

export function useBattleLog(maxEntries: number = 50) {
  const { battleLog } = useBattleStore();
  const [displayedLog, setDisplayedLog] = useState<string[]>([]);
  const [newEntryIndex, setNewEntryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (battleLog.length > displayedLog.length) {
      const newIndex = battleLog.length - 1;
      setNewEntryIndex(newIndex);
      setDisplayedLog(battleLog.slice(-maxEntries));
      
      // Clear highlight after animation
      setTimeout(() => {
        setNewEntryIndex(null);
      }, 500);
    }
  }, [battleLog, displayedLog.length, maxEntries]);

  return {
    displayedLog,
    newEntryIndex,
  };
}

// ============================================================================
// CARD SELECTION HOOK
// ============================================================================

export function useCardSelection() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const selectCard = useCallback((cardId: string) => {
    if (selectedCardId === cardId) {
      setIsConfirming(true);
    } else {
      setSelectedCardId(cardId);
      setIsConfirming(false);
    }
  }, [selectedCardId]);

  const deselectCard = useCallback(() => {
    setSelectedCardId(null);
    setIsConfirming(false);
  }, []);

  const confirmSelection = useCallback(() => {
    const confirmed = selectedCardId;
    deselectCard();
    return confirmed;
  }, [selectedCardId, deselectCard]);

  return {
    selectedCardId,
    isConfirming,
    selectCard,
    deselectCard,
    confirmSelection,
  };
}

// ============================================================================
// COMBO SYSTEM HOOK
// ============================================================================

export function useComboSystem() {
  const [combo, setCombo] = useState(0);
  const [isComboActive, setIsComboActive] = useState(false);
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);

  const incrementCombo = useCallback(() => {
    setCombo(prev => prev + 1);
    setIsComboActive(true);

    // Reset combo after delay
    if (comboTimeout.current) {
      clearTimeout(comboTimeout.current);
    }
    
    comboTimeout.current = setTimeout(() => {
      setCombo(0);
      setIsComboActive(false);
    }, 3000);
  }, []);

  const resetCombo = useCallback(() => {
    setCombo(0);
    setIsComboActive(false);
    if (comboTimeout.current) {
      clearTimeout(comboTimeout.current);
    }
  }, []);

  const getComboText = useCallback(() => {
    if (combo >= 10) return 'GODLIKE!';
    if (combo >= 7) return 'UNSTOPPABLE!';
    if (combo >= 5) return 'DOMINATING!';
    if (combo >= 3) return 'IMPRESSIVE!';
    return `${combo} HITS!`;
  }, [combo]);

  useEffect(() => {
    return () => {
      if (comboTimeout.current) {
        clearTimeout(comboTimeout.current);
      }
    };
  }, []);

  return {
    combo,
    isComboActive,
    incrementCombo,
    resetCombo,
    getComboText,
  };
}

// ============================================================================
// SPECTATOR MODE HOOK
// ============================================================================

export function useSpectatorMode() {
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isLive, setIsLive] = useState(false);

  const enableSpectatorMode = useCallback(() => {
    setIsSpectatorMode(true);
    setIsLive(true);
  }, []);

  const disableSpectatorMode = useCallback(() => {
    setIsSpectatorMode(false);
    setIsLive(false);
  }, []);

  const updateViewerCount = useCallback((count: number) => {
    setViewerCount(count);
  }, []);

  return {
    isSpectatorMode,
    viewerCount,
    isLive,
    enableSpectatorMode,
    disableSpectatorMode,
    updateViewerCount,
  };
}

// ============================================================================
// BATTLE TIMER HOOK (Enhanced)
// ============================================================================

export function useEnhancedBattleTimer(initialTime: number = 60) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isLowTime, setIsLowTime] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime: number = initialTime) => {
    setTimeLeft(newTime);
    setIsLowTime(false);
  }, [initialTime]);

  const formatted = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 10) {
            setIsLowTime(true);
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  return {
    timeLeft,
    isRunning,
    isLowTime,
    start,
    pause,
    reset,
    formatted: formatted(),
    percentage: (timeLeft / initialTime) * 100,
  };
}

// ============================================================================
// MOBILE DETECTION HOOK
// ============================================================================

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    isTouch,
    isReducedMotion: typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false,
  };
}
