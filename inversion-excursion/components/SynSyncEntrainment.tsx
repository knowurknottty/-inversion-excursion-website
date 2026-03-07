import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BrainwaveProtocol, EntrainmentResult } from '../types';

interface SynSyncEntrainmentProps {
  protocol: BrainwaveProtocol;
  duration?: number;
  onStart?: () => void;
  onComplete: (result: EntrainmentResult) => void;
  onCancel?: () => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

type EntrainmentPhase = 'idle' | 'countdown' | 'active' | 'complete' | 'cancelled';

// Breathing guidance based on frequency
const getBreathingPattern = (frequency: number): { inhale: number; hold: number; exhale: number } => {
  // Lower frequencies = slower breathing
  if (frequency <= 4) return { inhale: 4, hold: 4, exhale: 6 }; // Delta
  if (frequency <= 8) return { inhale: 4, hold: 2, exhale: 4 }; // Theta
  if (frequency <= 12) return { inhale: 3, hold: 1, exhale: 3 }; // Alpha
  if (frequency <= 20) return { inhale: 2, hold: 0, exhale: 2 }; // Beta
  return { inhale: 2, hold: 0, exhale: 2 }; // Gamma
};

// Get color based on protocol
const getProtocolColor = (protocolId: string): string => {
  const colors: Record<string, string> = {
    gamma: '#FF006E',
    beta: '#FB5607',
    alpha: '#FFBE0B',
    theta: '#8338EC',
    delta: '#3A86FF',
  };
  return colors[protocolId] || '#8B5CF6';
};

// Get breathing instruction text
const getBreathingText = (phase: 'inhale' | 'hold' | 'exhale'): string => {
  const texts: Record<string, string[]> = {
    inhale: ['Breathe in...', 'Inhale deeply...', 'Draw in...', 'Fill your lungs...'],
    hold: ['Hold...', 'Pause...', 'Retain...', 'Stay...'],
    exhale: ['Breathe out...', 'Exhale slowly...', 'Release...', 'Let go...'],
  };
  const options = texts[phase];
  return options[Math.floor(Math.random() * options.length)];
};

export const SynSyncEntrainment: React.FC<SynSyncEntrainmentProps> = ({
  protocol,
  duration = 60,
  onStart,
  onComplete,
  onCancel,
  onProgress,
  className = '',
}) => {
  const [phase, setPhase] = useState<EntrainmentPhase>('idle');
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [syncQuality, setSyncQuality] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [deviations, setDeviations] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingPattern = getBreathingPattern(protocol.frequency);
  const protocolColor = getProtocolColor(protocol.id);

  // Initialize audio
  const initAudio = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = protocol.frequency;

      gainNode.gain.value = 0.05;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      oscillator.start();
    } catch (err) {
      console.warn('Audio initialization failed:', err);
    }
  }, [protocol.frequency]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
  }, []);

  // Start entrainment
  const startEntrainment = useCallback(() => {
    setPhase('countdown');
    setTimeRemaining(duration);
    setSyncQuality(0);
    setBreathCount(0);
    setDeviations([]);

    // Countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownInterval);
        setPhase('active');
        initAudio();
        onStart?.();

        // Start breathing cycle
        startBreathingCycle();
      }
    }, 1000);
  }, [duration, initAudio, onStart]);

  // Breathing cycle
  const startBreathingCycle = useCallback(() => {
    const cycle = async () => {
      // Inhale
      setBreathingPhase('inhale');
      await new Promise((r) => setTimeout(r, breathingPattern.inhale * 1000));

      if (phase === 'cancelled') return;

      // Hold (if applicable)
      if (breathingPattern.hold > 0) {
        setBreathingPhase('hold');
        await new Promise((r) => setTimeout(r, breathingPattern.hold * 1000));
      }

      if (phase === 'cancelled') return;

      // Exhale
      setBreathingPhase('exhale');
      await new Promise((r) => setTimeout(r, breathingPattern.exhale * 1000));

      if (phase === 'cancelled') return;

      setBreathCount((prev) => prev + 1);

      // Continue cycle if still active
      if (timeRemaining > 0) {
        cycle();
      }
    };

    cycle();
  }, [breathingPattern, phase, timeRemaining]);

  // Timer effect
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          const progress = ((duration - newTime) / duration) * 100;
          onProgress?.(progress);

          // Simulate sync quality calculation
          const targetBreaths = duration / (breathingPattern.inhale + breathingPattern.hold + breathingPattern.exhale);
          const currentQuality = Math.min(100, (breathCount / targetBreaths) * 100 + Math.random() * 20);
          setSyncQuality(currentQuality);

          if (newTime <= 0) {
            // Complete
            setPhase('complete');
            stopAudio();

            const result: EntrainmentResult = {
              success: currentQuality >= 60,
              quality: currentQuality / 100,
              avgDeviation: deviations.length > 0
                ? deviations.reduce((a, b) => a + b, 0) / deviations.length
                : 0.1,
              timeInSync: duration * (currentQuality / 100),
              bonusMultiplier: currentQuality >= 80 ? 2 : currentQuality >= 60 ? 1.5 : 1,
              startTime: new Date(Date.now() - duration * 1000),
              endTime: new Date(),
            };

            onComplete(result);
            return 0;
          }

          return newTime;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [phase, duration, breathingPattern, breathCount, deviations, onProgress, onComplete, stopAudio]);

  // Cancel entrainment
  const cancelEntrainment = useCallback(() => {
    setPhase('cancelled');
    stopAudio();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel?.();
  }, [onCancel, stopAudio]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Circle animation based on breathing
  const getCircleScale = () => {
    switch (breathingPhase) {
      case 'inhale': return [1, 1.3];
      case 'hold': return [1.3, 1.3];
      case 'exhale': return [1.3, 1];
      default: return [1, 1];
    }
  };

  const getCircleOpacity = () => {
    switch (breathingPhase) {
      case 'inhale': return [0.3, 0.6];
      case 'hold': return [0.6, 0.6];
      case 'exhale': return [0.6, 0.3];
      default: return [0.3, 0.3];
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        animate={{
          background: [
            `radial-gradient(circle at center, ${protocolColor}10 0%, transparent 70%)`,
            `radial-gradient(circle at center, ${protocolColor}20 0%, transparent 70%)`,
            `radial-gradient(circle at center, ${protocolColor}10 0%, transparent 70%)`,
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Idle State */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 text-center"
          >
            <div className="mb-6">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                style={{ backgroundColor: `${protocolColor}20`, color: protocolColor }}
              >
                {protocol.icon}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{protocol.name}</h2>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">{protocol.description}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Target Frequency</span>
                <span className="font-mono" style={{ color: protocolColor }}>
                  {protocol.frequency} Hz
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{duration} seconds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Category</span>
                <span className="capitalize text-white">{protocol.category}</span>
              </div>
            </div>

            <button
              onClick={startEntrainment}
              className="px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105 min-h-[44px]"
              style={{ backgroundColor: protocolColor }}
            >
              Begin Entrainment
            </button>
          </motion.div>
        )}

        {/* Countdown */}
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="relative z-10"
          >
            <motion.div
              className="text-8xl font-bold"
              style={{ color: protocolColor }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: 2,
              }}
            >
              3
            </motion.div>
          </motion.div>
        )}

        {/* Active Entrainment */}
        {phase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Timer */}
            <div className="text-4xl font-mono font-bold text-white mb-8">
              {formatTime(timeRemaining)}
            </div>

            {/* Breathing Circle */}
            <div className="relative w-48 h-48 mb-8">
              {/* Outer ring - progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="none"
                  stroke={protocolColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="289"
                  animate={{
                    strokeDashoffset: 289 - (289 * (duration - timeRemaining)) / duration,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>

              {/* Breathing circle */}
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${protocolColor}40 0%, transparent 70%)`,
                  boxShadow: `0 0 60px ${protocolColor}30`,
                }}
                animate={{
                  scale: getCircleScale(),
                  opacity: getCircleOpacity(),
                }}
                transition={{
                  duration: breathingPattern[breathingPhase],
                  ease: breathingPhase === 'hold' ? 'linear' : 'easeInOut',
                }}
              />

              {/* Inner glow */}
              <motion.div
                className="absolute inset-8 rounded-full"
                style={{
                  backgroundColor: protocolColor,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 60 / protocol.frequency,
                  repeat: Infinity,
                }}
              />

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={breathingPhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-medium text-white"
                >
                  {getBreathingText(breathingPhase)}
                </motion.span>
              </div>
            </div>

            {/* Frequency Wave */}
            <div className="w-full max-w-xs h-16 mb-6">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.path
                    key={i}
                    d={`M0,15 Q25,${15 - (i + 1) * 3} 50,15 T100,15`}
                    fill="none"
                    stroke={protocolColor}
                    strokeWidth="1"
                    opacity={0.3 + i * 0.15}
                    animate={{
                      d: [
                        `M0,15 Q25,${15 - (i + 1) * 3} 50,15 T100,15`,
                        `M0,15 Q25,${15 + (i + 1) * 3} 50,15 T100,15`,
                        `M0,15 Q25,${15 - (i + 1) * 3} 50,15 T100,15`,
                      ],
                    }}
                    transition={{
                      duration: 60 / protocol.frequency,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </svg>
            </div>

            {/* Sync Quality */}
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Sync Quality</span>
                <span
                  className="font-mono"
                  style={{ color: syncQuality >= 80 ? '#10B981' : syncQuality >= 60 ? '#F59E0B' : '#EF4444' }}
                >
                  {Math.round(syncQuality)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: protocolColor }}
                  animate={{ width: `${syncQuality}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={cancelEntrainment}
              className="mt-8 px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* Complete */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center"
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${protocolColor}30` }}
              animate={{
                boxShadow: [
                  `0 0 0 ${protocolColor}00`,
                  `0 0 40px ${protocolColor}50`,
                  `0 0 0 ${protocolColor}00`,
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <svg className="w-12 h-12" style={{ color: protocolColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {syncQuality >= 80 ? 'Perfect Sync!' : syncQuality >= 60 ? 'Good Sync' : 'Sync Achieved'}
            </h2>
            <p className="text-gray-400 mb-6">
              Quality: {Math.round(syncQuality)}%
            </p>

            <div className="bg-gray-800/50 rounded-lg p-4 text-left max-w-xs mx-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Bonus Multiplier</span>
                <span className="font-mono text-amber-400">
                  {syncQuality >= 80 ? '×2.0' : syncQuality >= 60 ? '×1.5' : '×1.0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Breaths Completed</span>
                <span className="text-white">{breathCount}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SynSyncEntrainment;
