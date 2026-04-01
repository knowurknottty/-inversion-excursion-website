import { useEffect, useRef } from 'react';
import type { BookChapter } from '@content/bookContent';
import './ChapterBottomSheet.css';

interface ChapterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter: number;
  onSelectChapter: (id: number) => void;
  chapters: BookChapter[];
}

export function ChapterBottomSheet({
  isOpen,
  onClose,
  currentChapter,
  onSelectChapter,
  chapters,
}: ChapterBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
      awakening: '#D4AF37',
      reflection: '#C0C0C0',
      mystery: '#4A5568',
      complexity: '#2B6CB0',
      insight: '#F6E05E',
      unity: '#48BB78',
      transformation: '#9F7AEA',
    };
    return colors[theme] || '#D4AF37';
  };

  return (
    <div 
      ref={overlayRef}
      className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={sheetRef}
        className={`bottom-sheet ${isOpen ? 'open' : ''}`}
      >
        <div className="bottom-sheet-handle" />
        
        <div className="bottom-sheet-header">
          <h3 className="bottom-sheet-title">Your Journey</h3>
          <button 
            className="bottom-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        
        <div className="bottom-sheet-content">
          <div className="chapter-list">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                className={`chapter-item ${currentChapter === chapter.id ? 'active' : ''}`}
                onClick={() => onSelectChapter(chapter.id)}
              >
                <div 
                  className="chapter-item-accent"
                  style={{ backgroundColor: getThemeColor(chapter.theme) }}
                />
                
                <div className="chapter-item-content">
                  <div className="chapter-item-header">
                    <span className="chapter-item-number">
                      {String(chapter.id).padStart(2, '0')}
                    </span>
                    <span 
                      className="chapter-item-theme"
                      style={{ color: getThemeColor(chapter.theme) }}
                    >
                      {chapter.theme}
                    </span>
                  </div>
                  
                  <h4 className="chapter-item-title">{chapter.title}</h4>
                  <p className="chapter-item-subtitle">{chapter.subtitle}</p>
                </div>
                
                {currentChapter === chapter.id && (
                  <div className="chapter-item-current-indicator">
                    <span className="current-dot" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bottom-sheet-footer">
          <p className="journey-progress">
            Progress: {currentChapter} of {chapters.length} chapters
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentChapter / chapters.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
