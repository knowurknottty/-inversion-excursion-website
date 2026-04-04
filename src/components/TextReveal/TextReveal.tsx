import { useEffect, useRef, useState } from 'react';
import { useJourneyStore } from '@stores/journeyStore';

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  speed?: number;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'blockquote';
  onComplete?: () => void;
}

export function TextReveal({
  children,
  className = '',
  delay = 0,
  speed = 30,
  as: Component = 'p',
  onComplete
}: TextRevealProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const journeyPhase = useJourneyStore(state => state.journeyPhase);

  useEffect(() => {
    if (journeyPhase === 'portal') return;
    
    let currentIndex = 0;
    const text = children;
    
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [children, delay, speed, onComplete, journeyPhase]);

  return (
    <Component
      ref={containerRef as any}
      className={`text-reveal ${className} ${isComplete ? 'complete' : ''}`}
    >
      {displayedText}
      {!isComplete && (
        <span className="cursor" />
      )}
    </Component>
  );
}

interface WordRevealProps {
  children: string;
  className?: string;
  wordDelay?: number;
}

export function WordReveal({ children, className = '', wordDelay = 80 }: WordRevealProps) {
  const words = children.split(' ');
  const [visibleCount, setVisibleCount] = useState(0);
  const journeyPhase = useJourneyStore(state => state.journeyPhase);

  useEffect(() => {
    if (journeyPhase === 'portal') return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= words.length) {
        setVisibleCount(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, wordDelay);

    return () => clearInterval(interval);
  }, [words.length, wordDelay, journeyPhase]);

  return (
    <span className={`word-reveal ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className={`word ${i < visibleCount ? 'visible' : ''}`}
          style={{ 
            transitionDelay: `${i * 0.05}s`,
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          {word}
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

interface FadeParagraphProps {
  paragraphs: string[];
  className?: string;
}

export function FadeParagraph({ paragraphs, className = '' }: FadeParagraphProps) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion preference — show all immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setVisibleIndices(new Set(paragraphs.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleIndices((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.15, rootMargin: '-30px' }
    );

    const paragraphs = containerRef.current?.querySelectorAll('[data-index]');
    paragraphs?.forEach((p) => observer.observe(p));

    return () => observer.disconnect();
  }, [paragraphs]);

  return (
    <div ref={containerRef} className={className}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          data-index={index}
          className={`fade-paragraph ${visibleIndices.has(index) ? 'visible' : ''}`}
          style={{ transitionDelay: visibleIndices.has(index) ? `${index * 0.08}s` : '0s' }}
        >
          {paragraph.split('*').map((part, i) => 
            i % 2 === 1 ? <em key={i}>{part}</em> : part
          )}
        </p>
      ))}
    </div>
  );
}
