import { useEffect, useState } from 'react';
import { useJourneyStore } from '@stores/journeyStore';
import BOOK_CONTENT from '@content/bookContent';

interface ChapterPortalProps {
  onEnter: () => void;
}

export function ChapterPortal({ onEnter }: ChapterPortalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [portalPhase, setPortalPhase] = useState<'closed' | 'opening' | 'open'>('closed');
  const { hasEnteredPortal, currentChapter, setJourneyPhase } = useJourneyStore();
  const chapter = BOOK_CONTENT[currentChapter - 1];

  const handleEnter = () => {
    setIsAnimating(true);
    setPortalPhase('opening');
    
    setTimeout(() => {
      setPortalPhase('open');
      setJourneyPhase('reading');
      onEnter();
    }, 2000);
  };

  // Skip portal if already entered
  useEffect(() => {
    if (hasEnteredPortal && portalPhase === 'closed') {
      setPortalPhase('open');
      onEnter();
    }
  }, [hasEnteredPortal, onEnter, portalPhase]);

  if (portalPhase === 'open') return null;

  return (
    <div className={`chapter-portal ${portalPhase} ${isAnimating ? 'animating' : ''}`}>
      <div className="portal-background">
        <div className="portal-vortex" />
        <div className="portal-particles" />
      </div>

      <div className="portal-content">
        <div className="portal-chapter-info">
          <span className="portal-number">
            {String(chapter.id).padStart(2, '0')}
          </span>
          
          <h2 className="portal-title">{chapter.title}</h2>
          <p className="portal-subtitle">{chapter.subtitle}</p>
          
          <div className="portal-divider">
            <span className="divider-line" />
            <span className="divider-symbol">◈</span>
            <span className="divider-line" />
          </div>
          
          <blockquote className="portal-epigraph">
            "{chapter.epigraph.split(' — ')[0]}"
            <cite>— {chapter.epigraph.split(' — ')[1]}</cite>
          </blockquote>
        </div>

        <button 
          className="portal-enter-btn"
          onClick={handleEnter}
          disabled={isAnimating}
        >
          <span className="btn-text">
            {chapter.id === 1 ? 'Begin the Journey' : 'Enter Chapter'}
          </span>
          <span className="btn-icon">&gt;</span>
        </button>
      </div>

      <div className="portal-geometry">
        <svg viewBox="0 0 200 200" className="portal-mandala">
          <defs>
            <filter id="portalGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Rotating rings */}
          <g className="portal-ring ring-1">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3"/>
          </g>
          <g className="portal-ring ring-2">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.4"/>
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="20"
                x2="100"
                y2="30"
                stroke="#D4AF37"
                strokeWidth="0.5"
                opacity="0.3"
                transform={`rotate(${i * 30} 100 100)`}
              />
            ))}
          </g>
          
          <g className="portal-ring ring-3">
            <circle cx="100" cy="100" r="70" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5"/>
          </g>
          
          <g className="portal-ring ring-4">
            <polygon
              points="100,40 130,85 185,85 145,115 160,170 100,140 40,170 55,115 15,85 70,85"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.5"
              opacity="0.4"
              filter="url(#portalGlow)"
            />
          </g>
          
          <circle cx="100" cy="100" r="5" fill="#D4AF37" filter="url(#portalGlow)"/>
        </svg>
      </div>
    </div>  );
}
