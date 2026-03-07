import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Card as CardType, CardTier, BrainwaveState } from '../types';

interface CardProps {
  card: CardType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isHighlighted?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  showFrequency?: boolean;
  showTier?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

// Tier color mappings based on UI contract
const tierStyles: Record<CardTier, {
  bg: string;
  border: string;
  glow: string;
  text: string;
  gradient: string;
  accent: string;
}> = {
  physical: {
    bg: 'bg-amber-900/40',
    border: 'border-amber-600',
    glow: 'shadow-amber-500/40',
    text: 'text-amber-400',
    gradient: 'from-amber-900/50 via-amber-800/30 to-amber-950/60',
    accent: '#D97706',
  },
  emotional: {
    bg: 'bg-slate-700/40',
    border: 'border-slate-400',
    glow: 'shadow-slate-300/40',
    text: 'text-slate-200',
    gradient: 'from-slate-700/50 via-slate-600/30 to-slate-800/60',
    accent: '#94A3B8',
  },
  atomic: {
    bg: 'bg-yellow-900/40',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-400/40',
    text: 'text-yellow-300',
    gradient: 'from-yellow-900/50 via-yellow-800/30 to-yellow-950/60',
    accent: '#EAB308',
  },
  galactic: {
    bg: 'bg-gradient-to-br from-cyan-900/40 via-pink-900/40 to-teal-900/40',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-400/40',
    text: 'text-cyan-300',
    gradient: 'from-cyan-900/50 via-pink-900/40 to-teal-900/50',
    accent: '#22D3EE',
  },
  cosmic: {
    bg: 'bg-gradient-to-br from-black via-purple-950 to-slate-900',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/40',
    text: 'text-purple-300',
    gradient: 'from-black via-purple-950/80 to-slate-900/90',
    accent: '#A855F7',
  },
};

const brainwaveColors: Record<BrainwaveState, string> = {
  gamma: '#FF006E',
  beta: '#FB5607',
  alpha: '#FFBE0B',
  theta: '#8338EC',
  delta: '#3A86FF',
};

// Map frequency to brainwave state
const getBrainwaveState = (frequency: number): BrainwaveState => {
  if (frequency >= 30) return 'gamma';
  if (frequency >= 13) return 'beta';
  if (frequency >= 8) return 'alpha';
  if (frequency >= 4) return 'theta';
  return 'delta';
};

const sizeClasses = {
  sm: { card: 'w-16 h-24', text: 'text-[8px]', title: 'text-[10px]', art: 'h-12' },
  md: { card: 'w-20 h-30', text: 'text-[10px]', title: 'text-xs', art: 'h-16' },
  lg: { card: 'w-24 h-36', text: 'text-xs', title: 'text-sm', art: 'h-20' },
  xl: { card: 'w-32 h-48', text: 'text-sm', title: 'text-base', art: 'h-28' },
};

export const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  isHighlighted = false,
  isSelected = false,
  isDisabled = false,
  showFrequency = true,
  showTier = true,
  onClick,
  onLongPress,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const styles = tierStyles[card.tier];
  const sizes = sizeClasses[size];
  const brainwave = getBrainwaveState(card.frequency);
  const waveColor = brainwaveColors[brainwave];

  // Long press handling
  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      onLongPress?.();
    }, 400);
    return () => clearTimeout(timer);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <motion.div
      className={`
        relative rounded-lg overflow-hidden cursor-pointer select-none
        ${sizes.card}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        aspectRatio: '2/3',
        minWidth: size === 'sm' ? '64px' : size === 'md' ? '80px' : size === 'lg' ? '96px' : '128px',
        minHeight: size === 'sm' ? '96px' : size === 'md' ? '120px' : size === 'lg' ? '144px' : '192px',
      }}
      onClick={!isDisabled ? onClick : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      whileHover={!isDisabled ? { scale: 1.05, y: -4 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      animate={{
        boxShadow: isSelected
          ? `0 0 20px ${styles.accent}, 0 0 40px ${styles.accent}40`
          : isHighlighted
          ? `0 0 15px ${styles.accent}60`
          : `0 4px 6px rgba(0,0,0,0.3)`,
        borderColor: isSelected ? styles.accent : 'transparent',
      }}
      transition={{ duration: 0.2 }}
      role="button"
      aria-label={`${card.name}, ${card.tier} tier, ${card.frequency}Hz`}
      aria-disabled={isDisabled}
      aria-selected={isSelected}
    >
      {/* Card Frame Background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${styles.gradient}
        ${styles.border} border-2 rounded-lg
      `} />

      {/* Animated border glow for special states */}
      {(isSelected || isHighlighted) && (
        <motion.div
          className={`absolute inset-0 rounded-lg ${styles.border} border-2`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Card Content Container */}
      <div className="relative h-full flex flex-col p-1.5">
        {/* Tier Badge */}
        {showTier && (
          <div className={`
            absolute top-1 left-1 z-10
            px-1.5 py-0.5 rounded-full
            ${styles.bg} backdrop-blur-sm
            border ${styles.border} border-opacity-50
          `}>
            <span className={`${sizes.text} ${styles.text} font-medium uppercase tracking-wider`}>
              {card.tier}
            </span>
          </div>
        )}

        {/* Card Art Area */}
        <div className={`
          flex-1 rounded-md overflow-hidden relative
          bg-black/30 mb-1.5
        `}>
          {card.artUrl ? (
            <img
              src={card.artUrl}
              alt={card.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={`
                w-16 h-16 rounded-full opacity-30
                bg-gradient-to-br ${styles.gradient}
                flex items-center justify-center
              `}>
                <span className={`${styles.text} text-2xl font-bold`}>
                  {card.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Frequency Waveform Overlay */}
          {showFrequency && (
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-60">
              <svg
                viewBox="0 0 100 20"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M0,10 Q25,10 50,10 T100,10"
                  stroke={waveColor}
                  strokeWidth="2"
                  fill="none"
                  animate={{
                    d: [
                      'M0,10 Q25,5 50,10 T100,10',
                      'M0,10 Q25,15 50,10 T100,10',
                      'M0,10 Q25,5 50,10 T100,10',
                    ],
                  }}
                  transition={{
                    duration: 2 / (card.frequency / 10),
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Card Name */}
        <h3 className={`
          ${sizes.title} ${styles.text} font-semibold
          truncate leading-tight mb-0.5
          font-serif tracking-wide
        `}>
          {card.name}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center justify-between gap-1 mt-auto">
          {/* Resonance Score */}
          <div className="flex items-center gap-0.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill={styles.accent}>
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <span className={`${sizes.text} text-gray-300`}>
              {Math.round(card.resonance)}
            </span>
          </div>

          {/* Frequency Display */}
          {showFrequency && (
            <div className="flex items-center gap-0.5">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: waveColor }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 60 / card.frequency,
                  repeat: Infinity,
                }}
              />
              <span className={`${sizes.text} text-gray-400`}>
                {card.frequency}Hz
              </span>
            </div>
          )}
        </div>

        {/* Ability Icons (if space permits) */}
        {size !== 'sm' && card.abilities.length > 0 && (
          <div className="flex gap-1 mt-1">
            {card.abilities.slice(0, 3).map((ability, idx) => (
              <div
                key={ability.id}
                className={`
                  w-4 h-4 rounded-full ${styles.bg}
                  flex items-center justify-center
                  border ${styles.border} border-opacity-30
                `}
                title={ability.name}
              >
                <span className={`${sizes.text} ${styles.text}`}>
                  {ability.name.charAt(0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Card;
