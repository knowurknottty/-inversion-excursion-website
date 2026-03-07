import React, { useState, useEffect, useCallback, useRef } from 'react';
import SynSyncAudioEngine from './synsync-audio-engine';

// Types
interface Protocol {
  id: string;
  name: string;
  frequency: number;
  type: 'binaural' | 'isochronic';
  description: string;
  color: string;
}

interface Card {
  id: string;
  name: string;
  resonance: {
    primary: string;
    secondary?: string;
  };
}

interface EntrainmentChallengeProps {
  availableProtocols: Protocol[];
  currentHand: Card[];
  onComplete: (result: EntrainmentResult) => void;
  onCancel: () => void;
  hasSynSyncApp: boolean;
}

interface EntrainmentResult {
  protocol: string;
  entrainmentLevel: number;
  verificationLevel: 'honor' | 'biofeedback' | 'proof';
  duration: number;
  verified: boolean;
}

// Protocol definitions
const PROTOCOLS: Protocol[] = [
  { id: 'alpha', name: 'Alpha Bridge', frequency: 10, type: 'binaural', description: 'Calm focus, relaxed alertness', color: '#6366f1' },
  { id: 'theta', name: 'Theta Dream', frequency: 6, type: 'isochronic', description: 'Deep meditation, creativity', color: '#8b5cf6' },
  { id: 'gamma', name: 'Gamma Peak', frequency: 40, type: 'binaural', description: 'Peak cognition, memory', color: '#f59e0b' },
  { id: 'schumann', name: 'Schumann Earth', frequency: 7.83, type: 'isochronic', description: 'Grounding, balance', color: '#10b981' },
  { id: 'delta', name: 'Delta Deep', frequency: 2, type: 'binaural', description: 'Deep sleep, restoration', color: '#3b82f6' },
  { id: 'beta', name: 'Beta Boost', frequency: 20, type: 'isochronic', description: 'Active thought, energy', color: '#ef4444' }
];

const EntrainmentChallenge: React.FC<EntrainmentChallengeProps> = ({
  currentHand,
  onComplete,
  onCancel,
  hasSynSyncApp
}) => {
  const [phase, setPhase] = useState<'select' | 'prepare' | 'active' | 'verify' | 'complete'>('select');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [verificationScore, setVerificationScore] = useState(0);
  const [useMode, setUseMode] = useState<'embedded' | 'synsync' | 'honor'>('embedded');
  const [coherence, setCoherence] = useState(0);
  
  const audioEngine = useRef(new SynSyncAudioEngine()).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number>(0);

  // Get cards that resonate with selected protocol
  const getResonantCards = useCallback((protocolId: string) => {
    const primary = currentHand.filter(c => c.resonance.primary === protocolId);
    const secondary = currentHand.filter(c => c.resonance.secondary === protocolId && c.resonance.primary !== protocolId);
    return { primary, secondary };
  }, [currentHand]);

  // Start entrainment session
  const startSession = async () => {
    if (!selectedProtocol) return;

    if (useMode === 'synsync' && hasSynSyncApp) {
      // Deep link to SynSync app
      const sessionId = generateSessionId();
      const callbackUrl = encodeURIComponent(`${window.location.origin}/synsync-return`);
      const deepLink = `synsync://entrain?protocol=${selectedProtocol.id}&duration=60&callback=${callbackUrl}&session=${sessionId}`;
      window.location.href = deepLink;
      return;
    }

    setPhase('prepare');
    
    // Preparation countdown
    let prepTime = 5;
    const prepInterval = setInterval(() => {
      prepTime--;
      if (prepTime <= 0) {
        clearInterval(prepInterval);
        beginActiveSession();
      }
    }, 1000);
  };

  const beginActiveSession = async () => {
    if (!selectedProtocol) return;
    
    setPhase('active');
    sessionStartTime.current = Date.now();
    
    // Start audio
    await audioEngine.startProtocol(selectedProtocol.id);
    
    // Begin 60-second countdown
    let remaining = 60;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimeRemaining(remaining);
      setProgress(((60 - remaining) / 60) * 100);
      
      // Simulate coherence for visual feedback
      setCoherence(Math.min(100, coherence + Math.random() * 5));
      
      if (remaining <= 0) {
        completeSession();
      }
    }, 1000);
  };

  const completeSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioEngine.stop();
    
    setPhase('verify');
    
    // Simulate verification analysis
    setTimeout(() => {
      const score = useMode === 'honor' ? 0.3 : 0.7 + Math.random() * 0.3;
      setVerificationScore(score);
      
      setTimeout(() => {
        const result: EntrainmentResult = {
          protocol: selectedProtocol!.id,
          entrainmentLevel: score,
          verificationLevel: useMode === 'honor' ? 'honor' : 'biofeedback',
          duration: Date.now() - sessionStartTime.current,
          verified: score > 0.5
        };
        
        setPhase('complete');
        onComplete(result);
      }, 1500);
    }, 2000);
  };

  const handleHonorMode = () => {
    setUseMode('honor');
    startSession();
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audioEngine.stop();
    };
  }, [audioEngine]);

  // Phase: Protocol Selection
  if (phase === 'select') {
    return (
      <div className="entrainment-challenge">
        <div className="challenge-header">
          <h2>⚡ Entrainment Challenge</h2>
          <p>Select a SynSync protocol to resonate with your cards</p>
        </div>

        <div className="protocol-grid">
          {PROTOCOLS.map(protocol => {
            const { primary, secondary } = getResonantCards(protocol.id);
            const hasResonance = primary.length > 0 || secondary.length > 0;
            
            return (
              <div
                key={protocol.id}
                className={`protocol-card ${selectedProtocol?.id === protocol.id ? 'selected' : ''} ${hasResonance ? 'has-resonance' : ''}`}
                style={{ borderColor: protocol.color }}
                onClick={() => setSelectedProtocol(protocol)}
              >
                <div className="protocol-icon" style={{ background: protocol.color }}>
                  {protocol.frequency}Hz
                </div>
                <h3>{protocol.name}</h3>
                <p>{protocol.description}</p>
                <span className={`type-badge ${protocol.type}`}>{protocol.type}</span>
                
                {hasResonance && (
                  <div className="resonance-preview">
                    {primary.length > 0 && (
                      <span className="primary-match">+50% × {primary.length}</span>
                    )}
                    {secondary.length > 0 && (
                      <span className="secondary-match">+25% × {secondary.length}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedProtocol && (
          <div className="mode-selection">
            <h4>Choose Verification Mode:</h4>
            
            {hasSynSyncApp && (
              <button className="mode-btn primary" onClick={() => { setUseMode('synsync'); startSession(); }}>
                🔗 Open SynSync Pro
                <span className="bonus">+50% bonus</span>
              </button>
            )}
            
            <button className="mode-btn" onClick={() => { setUseMode('embedded'); startSession(); }}>
              🎧 Play Here (Web Audio)
              <span className="bonus">+25-40% bonus</span>
            </button>
            
            <button className="mode-btn honor" onClick={handleHonorMode}>
              ✋ Honor System
              <span className="bonus">+10% bonus</span>
            </button>
          </div>
        )}

        <button className="cancel-btn" onClick={onCancel}>Skip (No Bonus)</button>
      </div>
    );
  }

  // Phase: Preparation
  if (phase === 'prepare') {
    return (
      <div className="entrainment-session">
        <div className="breathing-guide">
          <div className="breathing-circle">
            <span>Prepare</span>
          </div>
          <p>Put on headphones • Breathe deeply</p>
        </div>
      </div>
    );
  }

  // Phase: Active Entrainment
  if (phase === 'active') {
    return (
      <div className="entrainment-session active">
        <div className="session-visualizer"
003e
          <div className="frequency-wave" style={{ 
            background: `radial-gradient(circle, ${selectedProtocol?.color}40 0%, transparent 70%)`,
            animation: `pulse ${60 / (selectedProtocol?.frequency || 10)}s infinite`
          }}>
            <span className="frequency-display">{selectedProtocol?.frequency}Hz</span>
          </div>
          
          <div className="coherence-meter">
            <label>Entrainment Lock</label>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: `${coherence}%`, background: selectedProtocol?.color }} />
            </div>
            <span className={coherence > 60 ? 'locked' : 'seeking'}>
              {coherence > 60 ? '🔒 Locked' : '🔍 Seeking...'}
            </span>
          </div>
        </div>

        <div className="session-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="time-remaining">{timeRemaining}s</span>
        </div>

        <div className="session-prompts">
          <p>{getPrompt(timeRemaining)}</p>
        </div>
      </div>
    );
  }

  // Phase: Verification
  if (phase === 'verify') {
    return (
      <div className="entrainment-session verify">
        <div className="analyzing-spinner">
          <div className="spinner"></div>
          <p>Analyzing entrainment patterns... </p>
        </div>
      </div>
    );
  }

  // Phase: Complete
  return (
    <div className="entrainment-session complete">
      <div className="result-display">
        <div className={`result-badge ${verificationScore > 0.5 ? 'success' : 'partial'}`}>
          {verificationScore > 0.5 ? '✓ Entrained' : '◐ Partial'}
        </div>
        
        <div className="bonus-calculation">
          <p>Entrainment Level: {Math.round(verificationScore * 100)}%</p>
          <p>Card Bonus: +{Math.round(verificationScore * (useMode === 'honor' ? 10 : 50))}%</p>
        </div>
        
        <button onClick={() => onComplete({
          protocol: selectedProtocol!.id,
          entrainmentLevel: verificationScore,
          verificationLevel: useMode === 'honor' ? 'honor' : 'biofeedback',
          duration: 60000,
          verified: verificationScore > 0.5
        })} >
          Enter Battle
        </button>
      </div>
    </div>
  );
};

// Helper: Get session prompts based on time
function getPrompt(timeRemaining: number): string {
  if (timeRemaining > 45) return 'Breathe with the pulse...';
  if (timeRemaining > 30) return 'Let your mind settle...';
  if (timeRemaining > 15) return 'Feel the frequency...';
  return 'Almost there...';
}

export default EntrainmentChallenge;
