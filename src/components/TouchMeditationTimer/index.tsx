import { useState, useEffect, useCallback, useRef } from 'react';
import { useTouchFeedback } from '@hooks/mobile/useTouchFeedback';
import './TouchMeditationTimer.css';

interface TouchMeditationTimerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDuration?: number;
}

export function TouchMeditationTimer({
  isOpen,
  onClose,
  defaultDuration = 5,
}: TouchMeditationTimerProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out' | 'wait'>('in');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { triggerHaptic } = useTouchFeedback();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = useCallback(() => {
    setIsActive(true);
    triggerHaptic('success');
    
    // Start breath cycle
    let phase: 'in' | 'hold' | 'out' | 'wait' = 'in';
    setBreathPhase(phase);
    
    breathIntervalRef.current = setInterval(() => {
      triggerHaptic('light');
      
      switch (phase) {
        case 'in':
          phase = 'hold';
          break;
        case 'hold':
          phase = 'out';
          break;
        case 'out':
          phase = 'wait';
          break;
        case 'wait':
          phase = 'in';
          break;
      }
      setBreathPhase(phase);
    }, 4000);
    
    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer complete
          triggerHaptic('success');
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [triggerHaptic]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimeRemaining(duration * 60);
    setBreathPhase('in');
  }, [pauseTimer, duration]);

  const adjustDuration = useCallback((amount: number) => {
    setDuration((prev) => {
      const newDuration = Math.max(1, Math.min(60, prev + amount));
      if (!isActive) {
        setTimeRemaining(newDuration * 60);
      }
      return newDuration;
    });
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      pauseTimer();
      setTimeRemaining(duration * 60);
      setBreathPhase('in');
    }
  }, [isOpen, pauseTimer, duration]);

  if (!isOpen) return null;

  const getBreathText = () => {
    switch (breathPhase) {
      case 'in': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'out': return 'Breathe Out';
      case 'wait': return 'Wait';
    }
  };

  return (
    <div className="meditation-modal-overlay">
      <div className="meditation-modal">
        <button 
          className="meditation-close"
          onClick={onClose}
          aria-label="Close meditation"
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="meditation-content">
          <div className="breath-circle-container">
            <div className={`breath-circle ${breathPhase} ${isActive ? 'active' : ''}`}>
              <div className="breath-ring ring-1" />
              <div className="breath-ring ring-2" />
              <div className="breath-ring ring-3" />
              
              <div className="breath-center">
                <span className="timer-display">{formatTime(timeRemaining)}</span>
                {isActive && (
                  <span className="breath-text">{getBreathText()}</span>
                )}
              </div>
            </div>
          </div>

          <div className="meditation-controls">
            {!isActive ? (
              <>
                <div className="duration-selector">
                  <button 
                    className="duration-btn"
                    onClick={() => adjustDuration(-1)}
                    disabled={duration <= 1}
                  >
                    -
                  </button>
                  
                  <span className="duration-display">{duration} min</span>
                  
                  <button 
                    className="duration-btn"
                    onClick={() => adjustDuration(1)}
                    disabled={duration >= 60}
                  >
                    +
                  </button>
                </div>
                
                <button 
                  className="meditation-action-btn start"
                  onClick={startTimer}
                >
                  Begin Practice
                </button>
              </>
            ) : (
              <>
                <button 
                  className="meditation-action-btn pause"
                  onClick={pauseTimer}
                >
                  Pause
                </button>
                
                <button 
                  className="meditation-action-btn reset"
                  onClick={resetTimer}
                >
                  Reset
                </button>
              </>
            )}
          </div>

          <div className="meditation-instruction">
            <p>Follow the circle's rhythm</p>
            <p className="instruction-sub">Expand on inhale, contract on exhale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
