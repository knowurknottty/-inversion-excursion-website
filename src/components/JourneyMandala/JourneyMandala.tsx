import { useState } from 'react';
import { useJourneyStore } from '@stores/journeyStore';
import BOOK_CONTENT from '@content/bookContent';

interface JourneyMandalaProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function JourneyMandala({ className = '', isOpen, onClose }: JourneyMandalaProps) {
  const { currentChapter, completedChapters, setCurrentChapter, setJourneyPhase } = useJourneyStore();
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const chapters = BOOK_CONTENT;
  const segmentAngle = 360 / chapters.length;

  const handleChapterSelect = (chapterId: number) => {
    setCurrentChapter(chapterId);
    setJourneyPhase('transition');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`journey-mandala-overlay ${className}`} onClick={onClose}>
      <div className="mandala-container" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 400 400" className="mandala-svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B8860B"/>
              <stop offset="50%" stopColor="#D4AF37"/>
              <stop offset="100%" stopColor="#F4D03F"/>
            </linearGradient>
          </defs>

          {/* Outer ring */}
          <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="1"/>
          <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="2"/>
          <circle cx="200" cy="200" r="60" fill="rgba(212,175,55,0.05)" stroke="url(#goldGradient)" strokeWidth="2"/>

          {/* Chapter segments */}
          {chapters.map((chapter, index) => {
            const angle = (index * segmentAngle - 90) * (Math.PI / 180);
            const isCompleted = completedChapters.includes(chapter.id);
            const isCurrent = currentChapter === chapter.id;
            const isHovered = hoveredSegment === chapter.id;

            const x1 = 200 + 130 * Math.cos(angle);
            const y1 = 200 + 130 * Math.sin(angle);
            const x2 = 200 + 170 * Math.cos(angle);
            const y2 = 200 + 170 * Math.sin(angle);

            return (
              <g 
                key={chapter.id}
                className={`mandala-segment ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleChapterSelect(chapter.id)}
                onMouseEnter={() => setHoveredSegment(chapter.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Connection line */}
                <line
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke={isCurrent ? '#F4D03F' : isCompleted ? '#D4AF37' : 'rgba(212,175,55,0.3)'}
                  strokeWidth={isHovered ? 3 : isCurrent ? 3 : 2}
                  filter={isCurrent ? 'url(#glow)' : undefined}
                  className="segment-line"
                />

                {/* Chapter node */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={isHovered ? 12 : isCurrent ? 10 : 8}
                  fill={isCurrent ? '#F4D03F' : isCompleted ? '#D4AF37' : '#1A0F1A'}
                  stroke={isCurrent ? '#F4D03F' : '#D4AF37'}
                  strokeWidth={2}
                  filter={isCurrent ? 'url(#glow)' : undefined}
                  className="segment-node"
                />

                {/* Chapter number */}
                <text
                  x={x2}
                  y={y2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isCurrent ? '#1A0F1A' : '#D4AF37'}
                  fontSize="10"
                  fontFamily="Cinzel"
                  className="segment-number"
                >
                  {chapter.id}
                </text>

                {/* Chapter title on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x2 > 200 ? x2 + 15 : x2 - 115}
                      y={y2 - 25}
                      width="100"
                      height="50"
                      rx="4"
                      fill="rgba(26,15,26,0.95)"
                      stroke="#D4AF37"
                      strokeWidth="1"
                    />
                    <text
                      x={x2 > 200 ? x2 + 65 : x2 - 65}
                      y={y2 - 8}
                      textAnchor="middle"
                      fill="#D4AF37"
                      fontSize="11"
                      fontFamily="Cinzel"
                      fontWeight="bold"
                    >
                      {chapter.title}
                    </text>
                    <text
                      x={x2 > 200 ? x2 + 65 : x2 - 65}
                      y={y2 + 8}
                      textAnchor="middle"
                      fill="#B8A99A"
                      fontSize="9"
                      fontFamily="Source Serif Pro"
                    >
                      {chapter.theme}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Center - current chapter indicator */}
          <text
            x="200"
            y="195"
            textAnchor="middle"
            fill="#D4AF37"
            fontSize="14"
            fontFamily="Cinzel"
          >
            {chapters[currentChapter - 1]?.title}
          </text>
          <text
            x="200"
            y="212"
            textAnchor="middle"
            fill="#B8A99A"
            fontSize="10"
            fontFamily="Source Serif Pro"
          >
            Chapter {currentChapter} of 7
          </text>
        </svg>

        <button className="mandala-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
