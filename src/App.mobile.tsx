import { useEffect, useState, useCallback, useRef } from 'react';
import { useJourneyStore } from '@stores/journeyStore';
import { useSwipeGesture } from '@hooks/mobile/useSwipeGesture';
import { useMobileAudio } from '@hooks/mobile/useMobileAudio';
import { useTouchFeedback } from '@hooks/mobile/useTouchFeedback';
import { TorusFieldMobile } from '@components/SacredGeometryMobile/TorusFieldMobile';
import { SacredBackground } from '@components/SacredGeometryMobile/SacredBackground';
import { SwipeableChapter } from '@components/SwipeableChapter';
import { MobileNavigation } from '@components/MobileNavigation';
import { FloatingAudioButton } from '@components/FloatingAudioButton';
import { ChapterBottomSheet } from '@components/ChapterBottomSheet';
import { TouchMeditationTimer } from '@components/TouchMeditationTimer';
import { FadeParagraph } from '@components/TextReveal';
import BOOK_CONTENT, { EPILOGUE } from '@content/bookContent';
import './App.mobile.css';

const INVOCATION = `As the veil of slumber lifts, the path to awakening unfolds...`;
const THE_SPARK = "Lightning cracks the sky of the mind, and for one eternal instant, everything is seen.";

function App() {
  const [showInvocation, setShowInvocation] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  
  const { 
    currentChapter, 
    setJourneyPhase,
    nextChapter, 
    prevChapter,
    setCurrentChapter
  } = useJourneyStore();
  
  const audio = useMobileAudio();
  const { triggerHaptic } = useTouchFeedback();

  const chapter = BOOK_CONTENT[currentChapter - 1];

  // Handle swipe gestures for chapter navigation
  const handleSwipeLeft = useCallback(() => {
    if (currentChapter < BOOK_CONTENT.length) {
      triggerHaptic('light');
      nextChapter();
    }
  }, [currentChapter, nextChapter, triggerHaptic]);

  const handleSwipeRight = useCallback(() => {
    if (currentChapter > 1) {
      triggerHaptic('light');
      prevChapter();
    }
  }, [currentChapter, prevChapter, triggerHaptic]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
  });

  // Handle initial entry
  const handleEnterJourney = useCallback(() => {
    triggerHaptic('medium');
    setShowInvocation(false);
    setJourneyPhase('reading');
    audio.initialize();
  }, [setJourneyPhase, audio, triggerHaptic]);

  // Handle scroll to hide/show header
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingDown = currentScrollY > lastScrollY.current;
          const scrolledPastThreshold = currentScrollY > 100;
          
          setIsScrolling(scrolledPastThreshold);
          setHeaderVisible(!scrollingDown || currentScrollY < 100);
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on chapter change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter]);

  // Handle visibility change for audio
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.pause();
      } else {
        audio.resume();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [audio]);

  // Handle long press on content for reflection mode
  const handleLongPress = useCallback(() => {
    triggerHaptic('medium');
    setShowMeditation(true);
  }, [triggerHaptic]);

  if (!chapter) {
    return (
      <div className="app-mobile">
        <div className="error-state">
          <div className="error-symbol">◈</div>
          <h2>The path has become unclear...</h2>
          <button onClick={() => window.location.reload()} className="reset-btn">
            Return to Beginning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-mobile" {...swipeHandlers}>
      {/* Sacred Geometry Background - Simplified for mobile */}
      {!showInvocation && (
        <>
          <SacredBackground chapterId={currentChapter} />
          <TorusFieldMobile 
            chapterId={currentChapter}
            breathing={true}
            className="bg-geometry-mobile"
          />
        </>
      )}

      {/* Invocation Overlay */}
      {showInvocation && (
        <div className="invocation-overlay-mobile">
          <div className="invocation-content-mobile">
            <div className="invocation-symbol-mobile">◈</div>
            
            <blockquote className="invocation-text-mobile">{INVOCATION}</blockquote>
            <cite className="invocation-author-mobile">~ Kaelor Thane</cite>
            
            <div className="invocation-spark-mobile">
              {THE_SPARK}
            </div>
            <cite className="invocation-author-mobile">~ Phosphorus</cite>
            
            <button 
              className="invocation-enter-mobile" 
              onClick={handleEnterJourney}
              onTouchStart={(e) => e.currentTarget.classList.add('pressing')}
              onTouchEnd={(e) => e.currentTarget.classList.remove('pressing')}
            >
              <span className="enter-text">Enter the Journey</span>
              <span className="enter-arrow">→</span>
            </button>
          </div>
          
          {/* Animated background for invocation */}
          <div className="invocation-bg-mobile">
            <svg viewBox="0 0 200 200" className="floating-mandala-mobile">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.4"/>
            </svg>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showInvocation && (
        <>
          {/* Mobile Header */}
          <header className={`mobile-header ${headerVisible ? 'visible' : 'hidden'} ${isScrolling ? 'scrolled' : ''}`}>
            <div className="header-content">
              <button 
                className="mandala-toggle-mobile"
                onClick={() => setShowBottomSheet(true)}
                aria-label="Open chapter navigation"
              >
                <svg viewBox="0 0 24 24" className="mandala-icon">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </button>

              <h1 className="book-title-mobile">
                <span className="title-chapter">Ch. {chapter.id}</span>
              </h1>

              <div className="header-actions">
                <div className="chapter-indicator">
                  {currentChapter} / {BOOK_CONTENT.length}
                </div>
              </div>
            </div>
            
            {/* Reading Progress Bar */}
            <div className="progress-bar-container">
              <div 
                className="reading-progress-bar-mobile"
                style={{ 
                  transform: `scaleX(${currentChapter / BOOK_CONTENT.length})`,
                }} 
              />
            </div>
          </header>

          {/* Swipeable Chapter Content */}
          <SwipeableChapter
            chapter={chapter}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onLongPress={handleLongPress}
          >
            <main className="app-main-mobile" ref={contentRef}>
              <article className="chapter-content-mobile"
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleLongPress();
                }}
              >
                <header className="chapter-header-mobile">
                  <span className="chapter-number-mobile">Chapter {chapter.id}</span>
                  <h2 className="chapter-title-mobile">{chapter.title}</h2>
                  <p className="chapter-subtitle-mobile">{chapter.subtitle}</p>
                  
                  <div className="chapter-theme-badge-mobile">
                    {chapter.theme}
                  </div>
                </header>

                <blockquote className="epigraph-mobile">
                  <p>"{chapter.epigraph.split(' — ')[0]}"</p>
                  <cite>— {chapter.epigraph.split(' — ')[1]}</cite>
                </blockquote>

                <div className="chapter-sections-mobile">
                  {chapter.sections.map((section, idx) => (
                    <section 
                      key={idx} 
                      className={`content-section-mobile type-${section.type}`}
                    >
                      {section.heading && (
                        <h3 className="section-heading-mobile">{section.heading}</h3>
                      )}
                      
                      <div className="section-body-mobile">
                        {section.type === 'verse' ? (
                          <div className="verse-content-mobile">
                            {section.paragraphs.map((para, pidx) => (
                              para === '' ? (
                                <div key={pidx} className="verse-break-mobile" />
                              ) : (
                                <p key={pidx} className="verse-line-mobile">{para}</p>
                              )
                            ))}
                          </div>
                        ) : section.type === 'dialogue' ? (
                          <div className="dialogue-content-mobile">
                            {section.paragraphs.map((para, pidx) => (
                              <p key={pidx} className="dialogue-line-mobile">{para}</p>
                            ))}
                          </div>
                        ) : section.type === 'reflection' ? (
                          <div className="reflection-content-mobile">
                            <div className="reflection-icon-mobile">◈</div>
                            <FadeParagraph paragraphs={section.paragraphs} />
                            
                            <button 
                              className="meditation-btn-mobile"
                              onClick={() => setShowMeditation(true)}
                              onTouchStart={(e) => e.currentTarget.classList.add('pressing')}
                              onTouchEnd={(e) => e.currentTarget.classList.remove('pressing')}
                            >
                              <span className="btn-icon">◈</span>
                              <span className="btn-text">Begin Practice</span>
                            </button>
                          </div>
                        ) : (
                          <FadeParagraph paragraphs={section.paragraphs} />
                        )}
                      </div>
                    </section>
                  ))}
                </div>

                <footer className="chapter-footer-mobile">
                  <div className="end-mark-mobile">◈ ◈ ◈</div>
                  
                  {/* Chapter navigation hint */}
                  <div className="swipe-hint">
                    <span className="hint-text">Swipe to navigate</span>
                    <div className="hint-arrows">
                      <span className="hint-arrow">←</span>
                      <span className="hint-arrow">→</span>
                    </div>
                  </div>
                </footer>
              </article>

              {/* Epilogue */}
              {currentChapter === 7 && (
                <div className="epilogue-mobile">
                  <div className="epilogue-symbol-mobile">◈</div>
                  <h3 className="epilogue-title-mobile">{EPILOGUE.title}</h3>
                  <p className="epilogue-subtitle-mobile">{EPILOGUE.subtitle}</p>
                  
                  <blockquote className="epilogue-blessing-mobile">
                    {EPILOGUE.blessing.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </blockquote>
                  
                  <cite className="epilogue-author-mobile">~ {EPILOGUE.author}</cite>
                  <p className="epilogue-context-mobile">{EPILOGUE.context}</p>
                </div>
              )}
              
              {/* Bottom spacing for fixed nav */}
              <div className="bottom-spacer" />
            </main>
          </SwipeableChapter>

          {/* Chapter Bottom Sheet */}
          <ChapterBottomSheet
            isOpen={showBottomSheet}
            onClose={() => setShowBottomSheet(false)}
            currentChapter={currentChapter}
            onSelectChapter={(id) => {
              setCurrentChapter(id);
              setShowBottomSheet(false);
            }}
            chapters={BOOK_CONTENT}
          />

          {/* Meditation Timer Modal */}
          <TouchMeditationTimer
            isOpen={showMeditation}
            onClose={() => setShowMeditation(false)}
            defaultDuration={5}
          />

          {/* Floating Audio Button */}
          <FloatingAudioButton 
            isPlaying={audio.isPlaying}
            onToggle={audio.togglePlay}
          />

          {/* Mobile Navigation */}
          <MobileNavigation
            currentChapter={currentChapter}
            totalChapters={BOOK_CONTENT.length}
            onNext={nextChapter}
            onPrev={prevChapter}
            onOpenMenu={() => setShowBottomSheet(true)}
            onHome={() => setCurrentChapter(1)}
          />
        </>
      )}
    </div>
  );
}

export default App;
