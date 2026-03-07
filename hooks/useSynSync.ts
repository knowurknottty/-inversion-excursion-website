'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSynSyncStore } from '@/lib/store';
import { SYNSYNC_CONFIG } from '@/lib/constants';

// ============================================
// SYNSYNC AUDIO ENGINE HOOK
// ============================================
export function useSynSync() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const binauralNodeRef = useRef<OscillatorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const store = useSynSyncStore();
  
  // Initialize audio context
  const initAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SYNSYNC_CONFIG.sampleRate
      });
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);
  
  // Create binaural beat for brainwave entrainment
  const createBinauralBeat = useCallback((baseFreq: number, targetEntrainment: number) => {
    if (!audioContextRef.current) return;
    
    // Left ear: base frequency
    const leftOsc = audioContextRef.current.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.value = baseFreq;
    
    // Right ear: base + entrainment frequency
    const rightOsc = audioContextRef.current.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.value = baseFreq + targetEntrainment;
    
    // Create stereo panner
    const leftPanner = audioContextRef.current.createStereoPanner();
    leftPanner.pan.value = -1;
    
    const rightPanner = audioContextRef.current.createStereoPanner();
    rightPanner.pan.value = 1;
    
    // Connect nodes
    leftOsc.connect(leftPanner);
    rightOsc.connect(rightPanner);
    
    const masterGain = audioContextRef.current.createGain();
    masterGain.gain.value = store.isMuted ? 0 : store.volume;
    
    leftPanner.connect(masterGain);
    rightPanner.connect(masterGain);
    masterGain.connect(audioContextRef.current.destination);
    
    oscillatorRef.current = leftOsc;
    binauralNodeRef.current = rightOsc;
    gainNodeRef.current = masterGain;
    
    return { leftOsc, rightOsc };
  }, [store.isMuted, store.volume]);
  
  // Start audio playback
  const play = useCallback(async (frequency?: number, entrainmentTarget?: number) => {
    await initAudio();
    
    // Stop existing
    stop();
    
    const freq = frequency ?? store.frequency;
    const target = entrainmentTarget ?? store.targetEntrainment;
    
    const oscillators = createBinauralBeat(freq, target);
    
    if (oscillators) {
      oscillators.leftOsc.start();
      oscillators.rightOsc.start();
      store.setPlaying(true);
      
      // Start entrainment interpolation loop
      const updateLoop = () => {
        store.updateEntrainment();
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      };
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    }
  }, [initAudio, createBinauralBeat, stop, store]);
  
  // Stop audio playback
  const stop = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    
    if (binauralNodeRef.current) {
      binauralNodeRef.current.stop();
      binauralNodeRef.current.disconnect();
      binauralNodeRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    store.setPlaying(false);
  }, [store]);
  
  // Update frequency in real-time
  const updateFrequency = useCallback((newFreq: number) => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(
        newFreq,
        audioContextRef.current!.currentTime
      );
    }
    if (binauralNodeRef.current) {
      binauralNodeRef.current.frequency.setValueAtTime(
        newFreq + store.targetEntrainment,
        audioContextRef.current!.currentTime
      );
    }
    store.setFrequency(newFreq);
  }, [store]);
  
  // Get current brainwave band
  const getBrainwaveBand = useCallback((entrainment: number) => {
    const { brainwaveBands } = SYNSYNC_CONFIG;
    
    if (entrainment <= brainwaveBands.delta.max) return 'delta';
    if (entrainment <= brainwaveBands.theta.max) return 'theta';
    if (entrainment <= brainwaveBands.alpha.max) return 'alpha';
    if (entrainment <= brainwaveBands.beta.max) return 'beta';
    return 'gamma';
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, [stop]);
  
  return {
    ...store,
    play,
    stop,
    updateFrequency,
    getBrainwaveBand,
    isInitialized: !!audioContextRef.current
  };
}

// ============================================
// CARD FREQUENCY SYNC HOOK
// ============================================
export function useCardFrequency(cardFrequency: number, cardEntrainment: number) {
  const synSync = useSynSync();
  const [isInSync, setIsInSync] = useState(false);
  const [syncBonus, setSyncBonus] = useState(0);
  
  // Check if current audio matches card frequency
  useEffect(() => {
    const freqDiff = Math.abs(synSync.frequency - cardFrequency);
    const entrainmentDiff = Math.abs(synSync.currentEntrainment - cardEntrainment);
    
    // Within 5Hz frequency difference and 2Hz entrainment difference = in sync
    const inSync = freqDiff < 5 && entrainmentDiff < 2;
    setIsInSync(inSync);
    
    if (inSync) {
      // Calculate sync bonus (0 to 0.2 based on how close)
      const freqBonus = Math.max(0, 0.1 - (freqDiff / 50));
      const entBonus = Math.max(0, 0.1 - (entrainmentDiff / 20));
      setSyncBonus(freqBonus + entBonus);
    } else {
      setSyncBonus(0);
    }
  }, [synSync.frequency, synSync.currentEntrainment, cardFrequency, cardEntrainment]);
  
  // Activate card frequency
  const activateCardFrequency = useCallback(() => {
    if (!synSync.isPlaying) {
      synSync.play(cardFrequency, cardEntrainment);
    } else {
      synSync.updateFrequency(cardFrequency);
    }
  }, [synSync, cardFrequency, cardEntrainment]);
  
  return {
    isInSync,
    syncBonus,
    activateCardFrequency,
    currentFrequency: synSync.frequency,
    targetFrequency: cardFrequency,
    brainwaveBand: synSync.getBrainwaveBand(cardEntrainment)
  };
}
