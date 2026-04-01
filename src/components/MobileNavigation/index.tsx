import './MobileNavigation.css';

interface MobileNavigationProps {
  currentChapter: number;
  totalChapters: number;
  onNext: () => void;
  onPrev: () => void;
  onOpenMenu: () => void;
  onHome: () => void;
}

export function MobileNavigation({
  currentChapter,
  totalChapters,
  onNext,
  onPrev,
  onOpenMenu,
  onHome,
}: MobileNavigationProps) {
  const canGoPrev = currentChapter > 1;
  const canGoNext = currentChapter < totalChapters;

  return (
    <nav className="mobile-navigation">
      <div className="nav-content">
        <button 
          className="nav-btn nav-home"
          onClick={onHome}
          aria-label="Go to first chapter"
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path d="M12 3L4 9v12h16V9L12 3z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 21V12h6v9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span className="nav-label">Home</span>
        </button>

        <button 
          className="nav-btn nav-journey"
          onClick={onOpenMenu}
          aria-label="Open chapter menu"
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <circle cx="6" cy="6" r="2" fill="currentColor"/>
            <circle cx="6" cy="12" r="2" fill="currentColor"/>
            <circle cx="6" cy="18" r="2" fill="currentColor"/>
            <line x1="11" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="11" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="11" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <span className="nav-label">Journey</span>
        </button>

        <div className="nav-chapter-controls">
          <button
            className={`nav-btn nav-arrow-btn ${!canGoPrev ? 'disabled' : ''}`}
            onClick={onPrev}
            disabled={!canGoPrev}
            aria-label="Previous chapter"
          >
            <svg viewBox="0 0 24 24" className="nav-icon">
              <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="nav-chapter-indicator">
            <span className="chapter-current">{currentChapter}</span>
            <span className="chapter-divider">/</span>
            <span className="chapter-total">{totalChapters}</span>
          </div>

          <button
            className={`nav-btn nav-arrow-btn ${!canGoNext ? 'disabled' : ''}`}
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Next chapter"
          >
            <svg viewBox="0 0 24 24" className="nav-icon">
              <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
