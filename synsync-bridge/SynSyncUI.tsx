/**
 * SynSync Bridge - React Components
 * Breathing circle UI and entrainment controls for Farcaster mini app
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SynSyncEngine, 
  EntrainmentConfig, 
  FREQUENCY_PRESETS,
  FrequencyPreset,
  BeatType 
} from './SynSyncEngine';
import { 
  calculateResonance, 
  getResonanceLabel, 
  getResonanceColor,
  getFrequencyName,
  suggestOptimalFrequency,
  CardData
} from './ResonanceCalculator';

// ============================================================================
// BREATHING CIRCLE COMPONENT
// ============================================================================

interface BreathingCircleProps {
  isActive: boolean;
  progress: number;        // 0.0 - 1.0
  frequency: number;       // Current entrainment frequency
  duration: number;        // Total session duration in seconds
  onComplete?: () => void;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  isActive,
  progress,
  frequency,
  duration,
  onComplete
}) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [circleScale, setCircleScale] = useState(1);
  const animationRef = useRef<number>();

  // Breathing pattern based on frequency
  // Alpha (10Hz): 4-7-8 breathing (4s in, 7s hold, 8s out)
  // Theta (6Hz): Box breathing (4s each phase)
  // Gamma (40Hz): Energizing breath (2s in, 1s hold, 2s out)
  // Schumann (7.83Hz): Coherent breathing (5.5s in, 5.5s out)
  const getBreathTiming = () => {
    if (frequency >= 35) return { inhale: 2000, hold: 1000, exhale: 2000, rest: 500 };
    if (frequency >= 8) return { inhale: 4000, hold: 7000, exhale: 8000, rest: 0 };
    if (frequency >= 7.5) return { inhale: 5500, hold: 0, exhale: 5500, rest: 0 };
    return { inhale: 4000, hold: 4000, exhale: 4000, rest: 4000 };
  };

  useEffect(() => {
    if (!isActive) return;

    const timing = getBreathTiming();
    let startTime = Date.now();
    let currentPhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'inhale';

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Determine phase based on elapsed time
      const cycleTime = timing.inhale + timing.hold + timing.exhale + timing.rest;
      const phaseTime = elapsed % cycleTime;

      if (phaseTime < timing.inhale) {
        currentPhase = 'inhale';
        const phaseProgress = phaseTime / timing.inhale;
        setCircleScale(1 + (phaseProgress * 0.3)); // Grow to 1.3x
      } else if (phaseTime < timing.inhale + timing.hold) {
        currentPhase = 'hold';
        setCircleScale(1.3);
      } else if (phaseTime < timing.inhale + timing.hold + timing.exhale) {
        currentPhase = 'exhale';
        const phaseProgress = (phaseTime - timing.inhale - timing.hold) / timing.exhale;
        setCircleScale(1.3 - (phaseProgress * 0.3)); // Shrink to 1.0x
      } else {
        currentPhase = 'rest';
        setCircleScale(1);
      }

      setBreathPhase(currentPhase);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, frequency]);

  // Complete callback
  useEffect(() => {
    if (progress >= 1 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
    }
  };

  const getFrequencyColor = () => {
    if (frequency >= 35) return '#ff6b6b'; // Gamma - red/pink
    if (frequency >= 9) return '#4ecdc4';  // Alpha - teal
    if (frequency >= 7.5) return '#95e1d3'; // Schumann - mint
    return '#a8d8ea'; // Theta - blue
  };

  const remainingSeconds = Math.ceil((1 - progress) * duration);
  const frequencyColor = getFrequencyColor();

  return (
    <div className="synsync-breathing-circle" style={styles.container}>
      {/* Outer glow ring */}
      <div 
        style={{
          ...styles.glowRing,
          boxShadow: `0 0 ${40 * circleScale}px ${frequencyColor}40`,
          opacity: isActive ? 1 : 0.3,
        }}
      />
      
      {/* Main breathing circle */}
      <div
        style={{
          ...styles.circle,
          transform: `scale(${circleScale})`,
          borderColor: frequencyColor,
          boxShadow: `
            inset 0 0 30px ${frequencyColor}30,
            0 0 20px ${frequencyColor}20
          `,
        }}
      >
        {/* Inner content */}
        <div style={styles.innerContent}>
          <div style={styles.phaseText}>{getPhaseText()}</div>
          <div style={styles.timer}>{remainingSeconds}s</div>
          <div style={{ ...styles.frequency, color: frequencyColor }}>
            {getFrequencyName(frequency)}
          </div>
        </div>
        
        {/* Progress ring */}
        <svg style={styles.progressRing} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#ffffff10"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={frequencyColor}
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>
      
      {/* Wave visualization */}
      {isActive && <WaveVisualization frequency={frequency} color={frequencyColor} />}
    </div>
  );
};

// Wave visualization component
const WaveVisualization: React.FC<{ frequency: number; color: string }> = ({ frequency, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Draw sine wave based on frequency
      const amplitude = height / 4;
      const normalizedFreq = frequency / 40; // Normalize to 0-1
      const speed = 0.05 + (normalizedFreq * 0.1);

      for (let x = 0; x < width; x++) {
        const y = height / 2 + 
          Math.sin((x * 0.02) + time) * amplitude +
          Math.sin((x * 0.05) + (time * 1.5)) * (amplitude * 0.3);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      time += speed;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [frequency, color]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      style={styles.waveCanvas}
    />
  );
};

// ============================================================================
// ENTAINMENT CONTROLS COMPONENT
// ============================================================================

interface EntrainmentControlsProps {
  engine: SynSyncEngine;
  currentCard?: CardData;
  hand?: CardData[];
  onResonanceChange?: (resonance: any) => void;
  onProofGenerated?: (proof: any) => void;
}

export const EntrainmentControls: React.FC<EntrainmentControlsProps> = ({
  engine,
  currentCard,
  hand,
  onResonanceChange,
  onProofGenerated
}) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<FrequencyPreset>('alpha');
  const [beatType, setBeatType] = useState<BeatType>('binaural');
  const [progress, setProgress] = useState(0);
  const [resonance, setResonance] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const DURATION = 60; // 60-second sessions

  // Get suggestion based on hand
  useEffect(() => {
    if (hand && hand.length > 0) {
      const freqSuggestion = suggestOptimalFrequency(hand);
      setSuggestion(freqSuggestion);
    }
  }, [hand]);

  // Progress updater
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const prog = engine.getProgress(DURATION);
      setProgress(prog);
      
      if (currentCard) {
        const config = FREQUENCY_PRESETS[selectedPreset];
        const res = calculateResonance(config.beat, currentCard.id);
        setResonance(res);
        onResonanceChange?.(res);
      }
      
      if (prog >= 1) {
        handleComplete();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, selectedPreset, currentCard]);

  const handleStart = async () => {
    setError(null);
    
    const initialized = await engine.initialize();
    if (!initialized) {
      setError('Could not initialize audio. Tap to try again.');
      return;
    }

    const preset = FREQUENCY_PRESETS[selectedPreset];
    const config: EntrainmentConfig = {
      preset: selectedPreset,
      carrierFrequency: preset.carrier,
      beatFrequency: preset.beat,
      beatType,
      duration: DURATION,
      volume: 0.5
    };

    try {
      if (beatType === 'binaural') {
        await engine.startBinaural(config);
      } else {
        await engine.startIsochronic(config);
      }
      setIsActive(true);
      setProgress(0);
    } catch (err) {
      setError('Failed to start entrainment. Try headphones for binaural.');
    }
  };

  const handleStop = () => {
    engine.stop();
    setIsActive(false);
    setProgress(0);
  };

  const handleComplete = () => {
    const config = FREQUENCY_PRESETS[selectedPreset];
    const proof = engine.generateProof({
      preset: selectedPreset,
      carrierFrequency: config.carrier,
      beatFrequency: config.beat,
      beatType,
      duration: DURATION,
      volume: 0.5
    });
    
    onProofGenerated?.(proof);
    handleStop();
  };

  const presetButtons: { key: FrequencyPreset; emoji: string; label: string; desc: string }[] = [
    { key: 'gamma', emoji: '⚡', label: 'Gamma', desc: '40Hz - Focus' },
    { key: 'alpha', emoji: '🌊', label: 'Alpha', desc: '10Hz - Flow' },
    { key: 'theta', emoji: '🌙', label: 'Theta', desc: '6Hz - Deep' },
    { key: 'schumann', emoji: '🌍', label: 'Earth', desc: '7.83Hz - Ground' },
  ];

  return (
    <div style={styles.controlsContainer}>
      {error && (
        <div style={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {/* Suggestion banner */}
      {suggestion && !isActive && (
        <div style={styles.suggestion}>
          <span style={styles.suggestionIcon}>💡</span>
          {suggestion.reason}
        </div>
      )}

      {/* Resonance display */}
      {resonance && isActive && (
        <div style={{
          ...styles.resonanceDisplay,
          background: `linear-gradient(90deg, ${getResonanceColor(resonance.multiplier)}20, transparent)`
        }}>
          <div style={{ color: getResonanceColor(resonance.multiplier), fontWeight: 'bold' }}>
            {getResonanceLabel(resonance.multiplier)}
          </div>
          <div style={styles.multiplier}>
            {resonance.multiplier >= 1 ? '+' : ''}{Math.round((resonance.multiplier - 1) * 100)}% effect
          </div>
        </div>
      )}

      {/* Breathing circle */}
      <BreathingCircle
        isActive={isActive}
        progress={progress}
        frequency={FREQUENCY_PRESETS[selectedPreset].beat}
        duration={DURATION}
        onComplete={handleComplete}
      />

      {/* Preset selector */}
      {!isActive && (
        <div style={styles.presetGrid}>
          {presetButtons.map(({ key, emoji, label, desc }) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              style={{
                ...styles.presetButton,
                borderColor: selectedPreset === key ? '#4ecdc4' : '#333',
                background: selectedPreset === key ? '#4ecdc420' : '#1a1a1a'
              }}
            >
              <span style={styles.presetEmoji}>{emoji}</span>
              <span style={styles.presetLabel}>{label}</span>
              <span style={styles.presetDesc}>{desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Beat type selector */}
      {!isActive && (
        <div style={styles.beatTypeSelector}>
          <button
            onClick={() => setBeatType('binaural')}
            style={{
              ...styles.beatTypeButton,
              background: beatType === 'binaural' ? '#4ecdc4' : '#333'
            }}
          >
            🎧 Binaural (headphones)
          </button>
          <button
            onClick={() => setBeatType('isochronic')}
            style={{
              ...styles.beatTypeButton,
              background: beatType === 'isochronic' ? '#4ecdc4' : '#333'
            }}
          >
            🔊 Isochronic (speakers)
          </button>
        </div>
      )}

      {/* Start/Stop button */}
      <button
        onClick={isActive ? handleStop : handleStart}
        style={{
          ...styles.mainButton,
          background: isActive ? '#ff6b6b' : '#4ecdc4'
        }}
      >
        {isActive ? '⏹ Stop Entrainment' : '▶ Start 60s Session'}
      </button>

      {/* Deep link fallback */}
      {!isActive && (
        <a
          href="https://app.synsync.pro/?source=farcaster&preset=${selectedPreset}"
          style={styles.deepLink}
        >
          Open in SynSync Pro →
        </a>
      )}
    </div>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
  },
  glowRing: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    transition: 'all 0.5s ease',
  },
  circle: {
    position: 'relative',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease-out',
    background: '#0a0a0a',
  },
  innerContent: {
    textAlign: 'center',
    zIndex: 1,
  },
  phaseText: {
    fontSize: '14px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  timer: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  frequency: {
    fontSize: '12px',
    fontWeight: 'bold',
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  waveCanvas: {
    marginTop: '10px',
    opacity: 0.6,
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: '#111',
    borderRadius: '16px',
    maxWidth: '360px',
  },
  error: {
    background: '#ff444420',
    color: '#ff6b6b',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  suggestion: {
    background: '#4ecdc420',
    color: '#4ecdc4',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  suggestionIcon: {
    fontSize: '16px',
  },
  resonanceDisplay: {
    padding: '12px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    width: '100%',
  },
  multiplier: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    width: '100%',
  },
  presetButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid',
    background: '#1a1a1a',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  presetEmoji: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  presetLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  presetDesc: {
    fontSize: '11px',
    color: '#888',
  },
  beatTypeSelector: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },
  beatTypeButton: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  mainButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    color: '#000',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deepLink: {
    color: '#888',
    fontSize: '12px',
    textDecoration: 'none',
    marginTop: '10px',
  },
};

export default EntrainmentControls;
