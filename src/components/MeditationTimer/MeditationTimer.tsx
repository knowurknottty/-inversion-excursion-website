import { useState, useEffect } from 'react';
import { useJourneyStore } from '@stores/journeyStore';

interface MeditationTimerProps {
  duration?: number; // in minutes
  onComplete?: () => void;
}

export function MeditationTimer({ duration = 5, onComplete }: MeditationTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out' | 'wait'>('in');
  const { setMeditationActive } = useJourneyStore();

  const toggleTimer = () => {
    setIsActive(!isActive);
    setMeditationActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMeditationActive(false);
    setTimeRemaining(duration * 60);
  };

  // Breathing cycle animation
  useEffect(() => {
    if (!isActive) return;

    const breathCycle = setInterval(() => {
      setBreathPhase((prev) => {
        switch (prev) {
          case 'in': return 'hold';
          case 'hold': return 'out';
          case 'out': return 'wait';
          case 'wait': return 'in';
        }
      });
    }, 4000); // 4-4-4-4 box breathing

    return () => clearInterval(breathCycle);
  }, [isActive]);

  // Timer countdown
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setMeditationActive(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onComplete, setMeditationActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const breathText = {
    in: 'Breathe In...',
    hold: 'Hold...',
    out: 'Breathe Out...',
    wait: 'Wait...'
  };

  return (
    <div className={`meditation-timer ${isActive ? 'active' : ''}`}>
      <div className="meditation-circle">
        <div className={`breath-ring ${breathPhase}`}>
          <div className="breath-indicator" />
        </div>
        
        <div className="timer-display">
          <span className="timer-time">{formatTime(timeRemaining)}</span>
          {isActive && (
            <span className="breath-text">{breathText[breathPhase]}</span>
          )}
        </div>
      </div>

      <div className="timer-controls">
        <button 
          className={`timer-btn ${isActive ? 'pause' : 'start'}`}
          onClick={toggleTimer}
        >
          {isActive ? 'Pause' : 'Begin'}
        </button>
        <button className="timer-btn reset" onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  );
}
