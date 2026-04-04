import { useEffect, useState, useCallback, useRef } from 'react';
import { useJourneyStore } from '@stores/journeyStore';
import { useScrollProgress } from '@hooks/desktop/useScrollProgress';
import { useAudioEngine } from '@hooks/desktop/useAudioEngine';
import { TorusField } from '@components/SacredGeometry';
import { ChapterPortal } from '@components/ChapterPortal';
import { MeditationTimer } from '@components/MeditationTimer';
import { FadeParagraph } from '@components/TextReveal';
import { AudioErrorBoundary } from '@components/AudioErrorBoundary';
import { BackToTop } from '@components/BackToTop';
import { ChapterCompletionOverlay } from '@components/ChapterCompletionOverlay';
import BOOK_CONTENT, { EPILOGUE } from '@content/bookContent';
import '@components/BackToTop/BackToTop.css';
import '@components/ChapterCompletionOverlay/ChapterCompletionOverlay.css';
import './App.css';

const INVOCATION = `As the veil of slumber lifts, the path to awakening unfolds...`;
const THE_SPARK = "Lightning cracks the sky of the mind, and for one eternal instant, everything is seen.";

const ROMAN = ['I','II','III','IV','V','VI','VII'];

function toRoman(n: number) {
  return ROMAN[n - 1] ?? String(n);
}

/** Estimate reading time in minutes from an array of paragraphs */
function calcReadingTime(sections: typeof BOOK_CONTENT[0]['sections']) {
  const words = sections.flatMap(s => s.paragraphs).join(' ').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 238));
}

// ─── Journey Map (Table of Contents) Overlay ─────────────────────────────────
function JourneyMap({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentChapter, completedChapters, setCurrentChapter, setJourneyPhase } = useJourneyStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (id: number) => {
    setCurrentChapter(id);
    setJourneyPhase('transition');
    onClose();
  };

  return (
    <div className="journey-map-overlay" onClick={onClose}>
      <div className="journey-map-panel" onClick={e => e.stopPropagation()}>
        <button className="journey-map-close" onClick={onClose} aria-label="Close journey map">✕</button>
        <div className="journey-map-header">
          <div className="journey-map-symbol">◈</div>
          <h2 className="journey-map-title">The Journey</h2>
          <p className="journey-map-subtitle">Seven chapters of awakening</p>
        </div>
        <div className="journey-map-chapters">
          {BOOK_CONTENT.map(ch => {
            const isCompleted = completedChapters.includes(ch.id);
            const isCurrent  = currentChapter === ch.id;
            return (
              <button
                key={ch.id}
                className={`journey-map-card ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleSelect(ch.id)}
              >
                <span className="jmc-numeral">{toRoman(ch.id)}</span>
                <div className="jmc-info">
                  <span className="jmc-title">{ch.title}</span>
                  <span className="jmc-subtitle">{ch.subtitle}</span>
                  <span className="jmc-theme">{ch.theme}</span>
                </div>
                <span className="jmc-status">
                  {isCompleted ? '◉' : isCurrent ? '◎' : '○'}
                </span>
              </button>
            );
          })}
        </div>
        {completedChapters.length > 0 && (
          <p className="journey-map-progress">
            {completedChapters.length} of {BOOK_CONTENT.length} chapters complete
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Invocation particles ─────────────────────────────────────────────────────
interface Particle { x: number; y: number; r: number; dx: number; dy: number; }
const PARTICLES: Particle[] = Array.from({ length: 7 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 1 + Math.random() * 2,
  dx: (Math.random() - 0.5) * 0.02,
  dy: (Math.random() - 0.5) * 0.02,
}));

// ─── Main Desktop App ─────────────────────────────────────────────────────────
function App() {
  const [showInvocation, setShowInvocation] = useState(true);
  const [showPortal, setShowPortal] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [audioErrored, setAudioErrored] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLElement>(null);
  const { progress: scrollProgress } = useScrollProgress();

  const {
    currentChapter,
    completedChapters,
    journeyPhase,
    theme,
    setJourneyPhase,
    enterPortal,
    nextChapter,
    prevChapter,
    completeChapter,
    toggleTheme,
  } = useJourneyStore();

  const audio = useAudioEngine();
  const chapter = BOOK_CONTENT[currentChapter - 1];

  // ── Chapter transition state ──────────────────────────────────────────────
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Apply theme to document ───────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Entry handlers ────────────────────────────────────────────────────────
  const handleEnterJourney = useCallback(() => {
    setShowInvocation(false);
    setShowPortal(true);
    enterPortal();
  }, [enterPortal]);

  const handlePortalEnter = useCallback(() => {
    setShowPortal(false);
    setJourneyPhase('reading');
    if (audio.isInitialized) {
      audio.playChapter(currentChapter);
    }
  }, [currentChapter, audio, setJourneyPhase]);

  // ── Audio — only initialize on explicit user gesture ─────────────────────
  const handleAudioToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    audio.togglePlay();
  }, [audio]);

  // ── Scroll → audio filter ─────────────────────────────────────────────────
  useEffect(() => {
    if (audio.isInitialized && !audioErrored) {
      audio.updateScrollResponse(scrollProgress);
    }
  }, [scrollProgress, audio, audioErrored]);

  // ── Chapter completion at 90% scroll ─────────────────────────────────────
  useEffect(() => {
    if (scrollProgress >= 90 && !showInvocation && !showPortal) {
      if (!completedChapters.includes(currentChapter)) {
        completeChapter(currentChapter);
        setShowCompletion(true);
      }
    }
  }, [scrollProgress, currentChapter, completedChapters, completeChapter, showInvocation, showPortal]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInvocation || showPortal) return;
      const active = document.activeElement;
      const isInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') nextChapter();
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   prevChapter();
      if (e.key === ' ')  { e.preventDefault(); audio.togglePlay(); }
      if (e.key === 'm' || e.key === 'M') setShowMandala(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextChapter, prevChapter, audio, showInvocation, showPortal]);

  // ── Chapter change → scroll to top + transition animation ─────────────────
  useEffect(() => {
    setIsTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const endTransition = setTimeout(() => setIsTransitioning(false), 450);

    if (!showPortal && !showInvocation && audio.isInitialized) {
      audio.playChapter(currentChapter);
    }
    return () => clearTimeout(endTransition);
  }, [currentChapter]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const readingTime = calcReadingTime(chapter.sections);
  const isCompleted = completedChapters.includes(currentChapter);

  return (
    <div className="app">
      {/* Reading progress bar */}
      <div
        className="reading-progress-bar"
        style={{
          transform: `scaleX(${scrollProgress / 100})`,
          opacity: showInvocation || showPortal ? 0 : 1
        }}
      />

      {/* Sacred geometry background */}
      {!showInvocation && (
        <AudioErrorBoundary onAudioDisabled={() => setAudioErrored(true)}>
          <TorusField
            chapterId={currentChapter}
            scrollProgress={scrollProgress}
            breathing={journeyPhase !== 'transition'}
            className="bg-geometry"
          />
        </AudioErrorBoundary>
      )}

      {/* ── Invocation ─────────────────────────────────────────────────── */}
      {showInvocation && (
        <div className="invocation-overlay">
          {/* Particle constellation */}
          <svg className="invocation-particles" aria-hidden="true">
            {PARTICLES.map((p, i) => (
              <circle
                key={i}
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r={p.r}
                fill="rgba(212,175,55,0.5)"
                style={{ animation: `particleDrift ${8 + i * 1.3}s ease-in-out infinite alternate` }}
              />
            ))}
          </svg>

          <div className="invocation-content">
            <div className="invocation-symbol">◈</div>

            <blockquote className="invocation-text">{INVOCATION}</blockquote>
            <cite className="invocation-author">~ Kaelor Thane</cite>

            <div className="invocation-spark">{THE_SPARK}</div>
            <cite className="invocation-author">~ Phosphorus</cite>

            {completedChapters.length > 0 && (
              <p className="invocation-progress">
                {completedChapters.length} of {BOOK_CONTENT.length} chapters complete
              </p>
            )}

            <button className="invocation-enter" onClick={handleEnterJourney}>
              Enter the Journey
              <span className="enter-arrow">→</span>
            </button>
          </div>

          <div className="invocation-geometry">
            <svg viewBox="0 0 200 200" className="floating-mandala">
              <circle cx="100" cy="100" r="95" fill="none" stroke="#D4AF37" strokeWidth="0.3" opacity="0.25"/>
              <circle cx="100" cy="100" r="80" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="#B8860B" strokeWidth="0.5" opacity="0.65"/>
              <circle cx="100" cy="100" r="40" fill="none" stroke="#D4AF37" strokeWidth="1"   opacity="0.8"/>
            </svg>
          </div>
        </div>
      )}

      {/* ── Portal ──────────────────────────────────────────────────────── */}
      {showPortal && <ChapterPortal onEnter={handlePortalEnter} />}

      {/* ── Main reading UI ─────────────────────────────────────────────── */}
      {!showInvocation && !showPortal && (
        <>
          <header className={`app-header ${scrollProgress > 5 ? 'scrolled' : ''}`}>
            <div className="header-left">
              <button
                className="mandala-toggle"
                onClick={() => setShowMandala(true)}
                aria-label="Open journey map"
              >
                <svg viewBox="0 0 24 24" className="mandala-icon" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="6"  fill="none" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="2"  fill="currentColor"/>
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
              {/* Theme toggle */}
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? '☀' : '◐'}
              </button>

              {/* Audio toggle — only available if not errored/disabled */}
              {!audioErrored && !audio.isAudioDisabled && (
                <div className="audio-control">
                  <button
                    className={`audio-toggle ${audio.isPlaying ? 'playing' : ''}`}
                    onClick={handleAudioToggle}
                    aria-label={audio.isPlaying ? 'Pause soundscape' : 'Enable soundscape'}
                    aria-pressed={audio.isPlaying}
                  >
                    {/* Equalizer bars when playing */}
                    {audio.isPlaying && (
                      <span className="audio-bars" aria-hidden="true">
                        <span className="audio-bar" />
                        <span className="audio-bar" />
                        <span className="audio-bar" />
                        <span className="audio-bar" />
                      </span>
                    )}
                    {!audio.isPlaying && <span className="audio-icon">▶</span>}
                    <span className="header-label">
                      {audio.isPlaying ? 'Soundscape' : 'Enable Sound'}
                    </span>
                  </button>
                  {audio.isPlaying && audio.currentChapter && (
                    <span className="audio-scale">{audio.currentChapter.scaleName}</span>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Journey Map */}
          <JourneyMap isOpen={showMandala} onClose={() => setShowMandala(false)} />

          {/* Chapter completion overlay */}
          <ChapterCompletionOverlay
            visible={showCompletion}
            onDone={() => setShowCompletion(false)}
          />

          {/* Back to top */}
          <BackToTop />

          <main className="app-main" ref={contentRef} role="main">
            <article
              ref={chapterRef}
              className={`chapter-content ${isTransitioning ? 'transitioning-out' : 'transitioning-in'}`}
              role="article"
            >
              {/* Chapter header */}
              <header className="chapter-header">
                {/* Roman numeral counter */}
                <span className="chapter-numeral" aria-label={`Chapter ${currentChapter} of ${BOOK_CONTENT.length}`}>
                  {toRoman(currentChapter)} / {toRoman(BOOK_CONTENT.length)}
                </span>

                <h2 className="chapter-title">{chapter.title}</h2>
                <p className="chapter-subtitle">{chapter.subtitle}</p>

                {/* Reading time */}
                <p className="reading-time">✦ {readingTime} min read</p>

                <div className="chapter-theme-wrapper">
                  <div className="chapter-theme-badge">{chapter.theme}</div>
                  <span className="chapter-theme-label">CHAPTER THEME</span>
                </div>
              </header>

              {/* Epigraph */}
              <blockquote className="epigraph">
                <div className="epigraph-symbol" aria-hidden="true">◈</div>
                <p>"{chapter.epigraph.split(' — ')[0]}"</p>
                <cite>— {chapter.epigraph.split(' — ')[1]}</cite>
              </blockquote>

              {/* Sections */}
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
                          <div className="reflection-icon" aria-hidden="true">◈</div>
                          <FadeParagraph paragraphs={section.paragraphs} />
                          <button
                            className="meditation-btn"
                            onClick={() => setShowMeditation(!showMeditation)}
                            aria-expanded={showMeditation}
                            aria-controls="meditation-panel"
                          >
                            {showMeditation ? 'Close Practice' : 'Begin Practice'}
                          </button>
                          {showMeditation && (
                            <div className="meditation-embed" id="meditation-panel">
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
                <div className="end-mark" aria-hidden="true">◈ ◈ ◈</div>
              </footer>
            </article>

            {/* Chapter navigation */}
            <nav className="chapter-nav" aria-label="Chapter navigation">
              <button
                className="nav-btn prev"
                onClick={prevChapter}
                disabled={currentChapter <= 1}
                aria-label="Previous chapter"
              >
                <span className="nav-arrow" aria-hidden="true">←</span>
                <span className="nav-label">Previous</span>
              </button>

              <div className="chapter-dots-wrapper">
                <div className="chapter-dots">
                  {BOOK_CONTENT.map(ch => {
                    const isDone    = completedChapters.includes(ch.id);
                    const isCurrent = currentChapter === ch.id;
                    return (
                      <div key={ch.id} className="chapter-dot-container">
                        <button
                          className={`chapter-dot ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                          onClick={() => {
                            setJourneyPhase('transition');
                            useJourneyStore.getState().setCurrentChapter(ch.id);
                          }}
                          aria-label={`Go to chapter ${ch.id}: ${ch.title}`}
                        />
                        <div className="dot-tooltip">
                          <span className="dot-tooltip-title">{ch.title}</span>
                          <span className="dot-tooltip-sub">{ch.subtitle}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <span className="current-chapter-label">
                  {BOOK_CONTENT[currentChapter - 1]?.title.toUpperCase()}
                </span>
              </div>

              <button
                className="nav-btn next"
                onClick={nextChapter}
                disabled={currentChapter >= BOOK_CONTENT.length}
                aria-label="Next chapter"
              >
                <span className="nav-label">Next</span>
                <span className="nav-arrow" aria-hidden="true">→</span>
              </button>
            </nav>

            {/* Epilogue */}
            {currentChapter === 7 && (
              <div className="epilogue">
                <div className="epilogue-symbol" aria-hidden="true">◈</div>
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
