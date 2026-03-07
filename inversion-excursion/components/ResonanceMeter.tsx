import React from 'react';
import { motion } from 'framer-motion';

interface ResonanceMeterProps {
  value: number;              // 0-100
  maxValue?: number;
  label?: string;
  showPulse?: boolean;
  isCharged?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  segments?: number;          // Number of segments to show
  variant?: 'linear' | 'circular' | 'wave';
}

const sizeConfig = {
  sm: {
    container: 'h-2',
    circular: 'w-16 h-16',
    text: 'text-xs',
    stroke: 4,
  },
  md: {
    container: 'h-3',
    circular: 'w-24 h-24',
    text: 'text-sm',
    stroke: 6,
  },
  lg: {
    container: 'h-4',
    circular: 'w-32 h-32',
    text: 'text-base',
    stroke: 8,
  },
};

export const ResonanceMeter: React.FC<ResonanceMeterProps> = ({
  value,
  maxValue = 100,
  label = 'Resonance',
  showPulse = true,
  isCharged = false,
  size = 'md',
  className = '',
  segments = 10,
  variant = 'linear',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const config = sizeConfig[size];

  // Get color based on percentage
  const getColor = (pct: number): string => {
    if (pct < 25) return '#3B82F6';    // Blue
    if (pct < 50) return '#8B5CF6';    // Violet
    if (pct < 75) return '#F59E0B';    // Amber
    return '#10B981';                   // Green (charged)
  };

  const mainColor = getColor(percentage);
  const isFull = percentage >= 100;

  // Linear variant
  if (variant === 'linear') {
    return (
      <div className={`w-full ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={maxValue} aria-label={label}>
        {/* Label */}
        {label && (
          <div className="flex justify-between items-center mb-1.5">
            <span className={`${config.text} text-gray-400 font-medium`}>{label}</span>
            <span className={`${config.text} font-mono font-semibold`} style={{ color: mainColor }}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}

        {/* Progress Bar Container */}
        <div className={`
          relative ${config.container} bg-gray-800/50 rounded-full overflow-hidden
          backdrop-blur-sm border border-gray-700/50
        `}>
          {/* Segmented background */}
          <div className="absolute inset-0 flex gap-0.5 px-0.5">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-gray-700/30 my-0.5"
              />
            ))}
          </div>

          {/* Animated fill */}
          <motion.div
            className="absolute inset-y-0.5 left-0.5 rounded-full"
            style={{ backgroundColor: mainColor }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full blur-sm"
              style={{
                backgroundColor: mainColor,
                opacity: 0.5,
              }}
            />

            {/* Leading edge highlight */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 rounded-full" />
          </motion.div>

          {/* Pulse effect when charged */}
          {(isCharged || isFull) && showPulse && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 20px ${mainColor}, 0 0 40px ${mainColor}40`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </div>

        {/* Charging indicator */}
        {(isCharged || isFull) && (
          <motion.div
            className="flex items-center justify-center gap-1 mt-1.5"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">
              Charged
            </span>
          </motion.div>
        )}
      </div>
    );
  }

  // Circular variant
  if (variant === 'circular') {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${config.circular} ${className}`}
        role="progressbar" aria-valuenow={value} aria-valuemax={maxValue} aria-label={label}
      >
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#374151"
            strokeWidth={config.stroke}
            strokeLinecap="round"
          />

          {/* Progress arc */}
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={mainColor}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 ${isCharged ? '10px' : '4px'} ${mainColor})`,
            }}
          />
        </svg>

        {/* Inner content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.span
            className={`${config.text} font-bold`}
            style={{ color: mainColor }}
            animate={{
              scale: isCharged ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isCharged ? Infinity : 0,
            }}
          >
            {Math.round(percentage)}%
          </motion.span>
          {label && (
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
              {label}
            </span>
          )}
        </div>

        {/* Outer glow when charged */}
        {(isCharged || isFull) && showPulse && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 30px ${mainColor}60, inset 0 0 30px ${mainColor}20`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>
    );
  }

  // Wave variant (most visual)
  return (
    <div className={`w-full ${className}`}
      role="progressbar" aria-valuenow={value} aria-valuemax={maxValue} aria-label={label}
    >
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className={`${config.text} text-gray-400 font-medium`}>{label}</span>
          <span className={`${config.text} font-mono font-semibold`} style={{ color: mainColor }}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Wave visualization */}
      <div className={`
        relative h-16 bg-gray-900/50 rounded-lg overflow-hidden
        border border-gray-700/50 backdrop-blur-sm
      `}>
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-gray-600"
              style={{ top: `${20 * (i + 1)}%` }}
            />
          ))}
        </div>

        {/* Animated wave */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={mainColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={mainColor} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Wave path */}
          <motion.path
            fill="url(#waveGradient)"
            animate={{
              d: [
                `M0,${40 - percentage * 0.4} Q25,${40 - percentage * 0.4 - 5} 50,${40 - percentage * 0.4} T100,${40 - percentage * 0.4} V40 H0 Z`,
                `M0,${40 - percentage * 0.4} Q25,${40 - percentage * 0.4 + 5} 50,${40 - percentage * 0.4} T100,${40 - percentage * 0.4} V40 H0 Z`,
                `M0,${40 - percentage * 0.4} Q25,${40 - percentage * 0.4 - 5} 50,${40 - percentage * 0.4} T100,${40 - percentage * 0.4} V40 H0 Z`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Wave line */}
          <motion.path
            fill="none"
            stroke={mainColor}
            strokeWidth="0.5"
            animate={{
              d: [
                `M0,${40 - percentage * 0.4} Q25,${40 - percentage * 0.4 - 5} 50,${40 - percentage * 0.4} T100,${40 - percentage * 0.4}`,
                `M0,${40 - percentage * 0.4} Q25,${40 - percentage * 0.4 + 5} 50,${40 - percentage * 0.4} T100,${40 - percentage * 0.4}`,
                `M0,${40 - percentage * 0.4} Q25,${40 - percentage * 0.4 - 5} 50,${40 - percentage * 0.4} T100,${40 - percentage * 0.4}`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>

        {/* Percentage markers */}
        <div className="absolute inset-0 flex items-end justify-between px-2 pb-1"
003e
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="flex flex-col items-center">
              <div
                className={`w-0.5 h-2 ${mark <= percentage ? 'bg-white/60' : 'bg-gray-600'}`}
              />
              <span className={`text-[8px] ${mark <= percentage ? 'text-white/80' : 'text-gray-600'}`}>
                {mark}%
              </span>
            </div>
          ))}
        </div>

        {/* Charged indicator */}
        {(isCharged || isFull) && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/50"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(34, 197, 94, 0.3)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 10px rgba(34, 197, 94, 0.3)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-green-400">READY</span>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResonanceMeter;
