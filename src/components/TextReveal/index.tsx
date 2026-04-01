import { useEffect, useRef } from 'react';
import './TextReveal.css';

interface FadeParagraphProps {
  paragraphs: string[];
}

export function FadeParagraph({ paragraphs }: FadeParagraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const observedRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
            observedRef.current.delete(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const paragraphs = containerRef.current?.querySelectorAll('.fade-para');
    paragraphs?.forEach((p) => {
      observer.observe(p);
      observedRef.current.add(p);
    });

    return () => {
      observer.disconnect();
    };
  }, [paragraphs]);

  return (
    <div ref={containerRef} className="fade-paragraph-container">
      {paragraphs.map((para, idx) => (
        <p key={idx} className="fade-para">{para}</p>
      ))}
    </div>
  );
}
