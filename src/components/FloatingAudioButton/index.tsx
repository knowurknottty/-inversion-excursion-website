import './FloatingAudioButton.css';

interface FloatingAudioButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function FloatingAudioButton({ isPlaying, onToggle }: FloatingAudioButtonProps) {
  return (
    <button
      className={`floating-audio-btn ${isPlaying ? 'playing' : ''}`}
      onClick={onToggle}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      aria-pressed={isPlaying}
    >
      <div className="audio-btn-inner">
        <div className="audio-icon-container">
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="audio-icon pause-icon">
              <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
              <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="audio-icon play-icon">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          )}
        </div>
        
        {isPlaying && (
          <div className="audio-waves">
            <span className="wave" />
            <span className="wave" />
            <span className="wave" />
          </div>
        )}
      </div>
      
      {/* Ripple effect when playing */}
      {isPlaying && (
        <>
          <span className="ripple" />
          <span className="ripple delay" />
        </>
      )}
    </button>
  );
}
