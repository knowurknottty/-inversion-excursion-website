import { useEffect, useState, useCallback, useRef } from 'react';
import { useJourneyStore } from '@stores/journeyStore';
import { useScrollProgress } from '@hooks/desktop/useScrollProgress';
import { useAudioEngine } from '@hooks/desktop/useAudioEngine';
import { TorusField } from '@components/SacredGeometry';
import { ChapterPortal } from '@components/ChapterPortal';
import { JourneyMandala } from '@components/JourneyMandala';
import { MeditationTimer } from '@components/MeditationTimer';
import { FadeParagraph } from '@components/TextReveal';
import BOOK_CONTENT, { EPILOGUE } from '@content/bookContent';
import './App.css';

const INVOCATION = `As the veil of slumber lifts, the path to awakening unfolds...`;
const THE_SPARK = "Lightning cracks the sky of the mind, and for one eternal instant, everything is seen.";

function App() {
  const [showInvocation, setShowInvocation] = useState(true);
  const [showPortal, setShowPortal] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const { progress: scrollProgress } = useScrollProgress();
  
  const { 
    currentChapter, 
    journeyPhase, 
    setJourneyPhase,
    enterPortal,
    nextChapter, 
    prevChapter
  } = useJourneyStore();
  
  const audio = useAudioEngine();

  const chapter = BOOK_CONTENT[currentChapter - 1];

  // Handle initial entry
  const handleEnterJourney = useCallback(() => {
    setShowInvocation(false);
    setShowPortal(true);
    enterPortal();
  }, [enterPortal]);

  // Handle portal entry
  const handlePortalEnter = useCallback(() => {
    setShowPortal(false);
    setJourneyPhase('reading');
    if (audio.isInitialized) {
      audio.playChapter(currentChapter);
    }
  }, [currentChapter, audio, setJourneyPhase]);

  // Initialize audio on first interaction
  const handleAudioInit = useCallback(async () => {
    if (!audio.isInitialized) {
      await audio.initialize();
    }
  }, [audio]);

  // Update audio based on scroll
  useEffect(() => {
    audio.updateScrollResponse(scrollProgress);
  }, [scrollProgress, audio]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInvocation || showPortal) return;
      
      if (e.key === 'ArrowRight' || e.key === 'PageDown') nextChapter();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevChapter();
      if (e.key === ' ') {
        e.preventDefault();
        audio.togglePlay();
      }
      if (e.key === 'm' || e.key === 'M') {
        setShowMandala(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextChapter, prevChapter, audio, showInvocation, showPortal]);

  // Scroll to top on chapter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!showPortal && !showInvocation && audio.isInitialized) {
      audio.playChapter(currentChapter);
    }
  }, [currentChapter, audio, showPortal, showInvocation]);

  if (!chapter) {
    return (
      <div className="app">
        <div className="error-state">
          <h2>The path has become unclear...</h2>
          <button onClick={() => window.location.reload()} className="reset-btn">
            Return to Beginning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" onClick={handleAudioInit}>
      {/* Progress bar */}
      <div 
        className="reading-progress-bar" 
        style={{ 
          transform: `scaleX(${scrollProgress / 100})`,
          opacity: showInvocation || showPortal ? 0 : 1
        }} 
      />

      {/* Sacred Geometry Background */}
      {!showInvocation && (
        <TorusField 
          chapterId={currentChapter}
          scrollProgress={scrollProgress}
          breathing={journeyPhase !== 'transition'}
          className="bg-geometry"
        />
      )}

      {/* Invocation Overlay */}
      {showInvocation && (
        <div className="invocation-overlay">
          <div className="invocation-content">
            <div className="invocation-symbol">◈</div>
            
            <blockquote className="invocation-text">{INVOCATION}</blockquote>
            <cite className="invocation-author">~ Kaelor Thane</cite>
            
            <div className="invocation-spark">
              {THE_SPARK}
            </div>
            
            <cite className="invocation-author">~ Phosphorus</cite>
            
            <button className="invocation-enter" onClick={handleEnterJourney}>
              Enter the Journey
              <span className="enter-arrow">→</span>
            </button>
          </div>
          
          <div className="invocation-geometry">
            <svg viewBox="0 0 200 200" className="floating-mandala">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.4"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5"/>
            </svg>
          </div>
        </div>
      )}

      {/* Chapter Portal */}
      {showPortal && (
        <ChapterPortal onEnter={handlePortalEnter} />
      )}

      {/* Main Content */}
      {!showInvocation && !showPortal && (
        <>
          {/* Header */}
          <header className={`app-header ${scrollProgress > 5 ? 'scrolled' : ''}`}>
            <div className="header-left">
              <button className="mandala-toggle" onClick={() => setShowMandala(true)}>
                <svg viewBox="0 0 24 24" className="mandala-icon">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
                <span className="header-label">Journey</span>
              </button>
            </div>

            <h1 className="book-title">
              <span className="title-main">Inversion</span>
              <span className="title-separator">◈</span>
              <span className="title-main">Excursion</span>
            </h1>

            <div className="header-right">
              <button 
                className={`audio-toggle ${audio.isPlaying ? 'playing' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  audio.togglePlay();
                }}
              >
                <span className="audio-icon">
                  {audio.isPlaying ? '◼' : '▶'}
                </span>
                <span className="header-label">
                  {audio.isPlaying ? 'Soundscape Active' : 'Enable Sound'}
                </span>
              </button>
            </div>
          </header>

          {/* Journey Mandala */}
          <JourneyMandala 
            isOpen={showMandala} 
            onClose={() => setShowMandala(false)} 
          />

          {/* Main Content */}
          <main className="app-main" ref={contentRef}>
            <article className="chapter-content">
              <header className="chapter-header">
                <span className="chapter-number">Chapter {chapter.id}</span>
                <h2 className="chapter-title">{chapter.title}</h2>
                <p className="chapter-subtitle">{chapter.subtitle}</p>
                
                <div className="chapter-theme-badge">
                  {chapter.theme}
                </div>
              </header>

              <blockquote className="epigraph">
                <p>"{chapter.epigraph.split(' — ')[0]}"</p>
                <cite>— {chapter.epigraph.split(' — ')[1]}</cite>
              </blockquote>

              <div className="chapter-sections">
                {chapter.sections.map((section, idx) => (
                  <section 
                    key={idx} 
                    className={`content-section type-${section.type}`}
                  >
                    {section.heading && (
                      <h3 className="section-heading">{section.heading}</h3>
                    )}
                    
                    <div className="section-body">
                      {section.type === 'verse' ? (
                        <div className="verse-content">
                          {section.paragraphs.map((para, pidx) => (
                            para === '' ? (
                              <div key={pidx} className="verse-break" />
                            ) : (
                              <p key={pidx} className="verse-line">{para}</p>
                            )
                          ))}
                        </div>
                      ) : section.type === 'dialogue' ? (
                        <div className="dialogue-content">
                          {section.paragraphs.map((para, pidx) => (
                            <p key={pidx} className="dialogue-line">{para}</p>
                          ))}
                        </div>
                      ) : section.type === 'reflection' ? (
                        <div className="reflection-content">
                          <div className="reflection-icon">◈</div>
                          <FadeParagraph paragraphs={section.paragraphs} />
                          
                          <button 
                            className="meditation-btn"
                            onClick={() => setShowMeditation(!showMeditation)}
                          >
                            {showMeditation ? 'Close Practice' : 'Begin Practice'}
                          </button>
                          
                          {showMeditation && (
                            <div className="meditation-embed">
                              <MeditationTimer duration={5} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <FadeParagraph paragraphs={section.paragraphs} />
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <footer className="chapter-footer">
                <div className="end-mark">◈ ◈ ◈</div>
              </footer>
            </article>

            {/* Chapter Navigation */}
            <nav className="chapter-nav">
              <button 
                className="nav-btn prev"
                onClick={prevChapter}
                disabled={currentChapter <= 1}
              >
                <span className="nav-arrow">←</span>
                <span className="nav-label">Previous</span>
              </button>

              <div className="chapter-dots">
                {BOOK_CONTENT.map((ch) => (
                  <button
                    key={ch.id}
                    className={`chapter-dot ${currentChapter === ch.id ? 'active' : ''}`}
                    onClick={() => {
                      setJourneyPhase('transition');
                      useJourneyStore.getState().setCurrentChapter(ch.id);
                    }}
                    aria-label={`Go to chapter ${ch.id}`}
                  />
                ))}
              </div>

              <button 
                className="nav-btn next"
                onClick={nextChapter}
                disabled={currentChapter >= BOOK_CONTENT.length}
              >
                <span className="nav-label">Next</span>
                <span className="nav-arrow">→</span>
              </button>
            </nav>

            {/* Epilogue */}
            {currentChapter === 7 && (
              <div className="epilogue">
                <div className="epilogue-symbol">◈</div>
                <h3 className="epilogue-title">{EPILOGUE.title}</h3>
                <p className="epilogue-subtitle">{EPILOGUE.subtitle}</p>
                
                <blockquote className="epilogue-blessing">
                  {EPILOGUE.blessing.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </blockquote>
                
                <cite className="epilogue-author">~ {EPILOGUE.author}</cite>
                <p className="epilogue-context">{EPILOGUE.context}</p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}


export default App;
