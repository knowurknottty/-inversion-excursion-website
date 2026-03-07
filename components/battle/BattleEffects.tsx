// ============================================================================
// Battle Visual Effects System
// Particle effects, screen shake, and cinematic transitions
// Reference: Arc System Works particle style + DB FighterZ impact frames
// ============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
}

export interface ImpactEffect {
  id: string;
  x: number;
  y: number;
  intensity: 'light' | 'medium' | 'heavy' | 'critical';
  color: string;
}

export interface ScreenShakeOptions {
  intensity: number; // 0-1
  duration: number; // ms
  frequency?: number; // Hz
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

interface ParticleSystemProps {
  particles: Particle[];
  onParticleComplete?: (id: string) => void;
}

export function ParticleSystem({ particles, onParticleComplete }: ParticleSystemProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: particle.x + particle.velocity.x * particle.maxLife,
              y: particle.y + particle.velocity.y * particle.maxLife,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.maxLife / 60, // Assuming 60fps
              ease: "easeOut",
            }}
            onAnimationComplete={() => onParticleComplete?.(particle.id)}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing particles
export function useParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const spawnParticles = useCallback((
    x: number,
    y: number,
    count: number = 10,
    color: string = '#ef4444',
    spread: number = 50
  ) => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const velocity = 2 + Math.random() * 3;
      
      return {
        id: `particle_${Date.now()}_${i}`,
        x,
        y,
        color,
        size: 2 + Math.random() * 4,
        velocity: {
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
        },
        life: 30 + Math.random() * 20,
        maxLife: 30 + Math.random() * 20,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  return {
    particles,
    spawnParticles,
    removeParticle,
    clearParticles,
  };
}

// ============================================================================
// IMPACT EFFECTS
// ============================================================================

interface ImpactFrameProps {
  effect: ImpactEffect;
  onComplete?: () => void;
}

export function ImpactFrame({ effect, onComplete }: ImpactFrameProps) {
  const intensityConfig = {
    light: { scale: 1.5, duration: 0.3, rings: 2 },
    medium: { scale: 2, duration: 0.4, rings: 3 },
    heavy: { scale: 2.5, duration: 0.5, rings: 4 },
    critical: { scale: 3, duration: 0.6, rings: 5 },
  };

  const config = intensityConfig[effect.intensity];

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ left: effect.x, top: effect.y }}
      >
        {/* Flash */}
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: config.scale, opacity: 0 }}
          transition={{ duration: config.duration }}
          className="absolute w-20 h-20 rounded-full"
          style={{
            background: `radial-gradient(circle, ${effect.color} 0%, transparent 70%)`,
          }}
        />

        {/* Rings */}
        {Array.from({ length: config.rings }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: config.scale + i * 0.5, opacity: 0 }}
            transition={{
              duration: config.duration,
              delay: i * 0.05,
            }}
            className="absolute w-20 h-20 rounded-full border-2"
            style={{ borderColor: effect.color }}
          />
        ))}

        {/* Spark particles */}
        {effect.intensity === 'critical' && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: Math.cos((Math.PI * 2 * i) / 8) * 100,
              y: Math.sin((Math.PI * 2 * i) / 8) * 100,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.5 }}
            className="absolute w-2 h-8 rounded-full"
            style={{
              backgroundColor: effect.color,
              transform: `rotate(${(360 * i) / 8}deg)`,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// SCREEN SHAKE
// ============================================================================

interface ScreenShakeProps {
  isShaking: boolean;
  options?: ScreenShakeOptions;
  children: React.ReactNode;
}

export function ScreenShake({ isShaking, options, children }: ScreenShakeProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isShaking) {
      const intensity = options?.intensity || 0.5;
      const duration = options?.duration || 500;
      const frequency = options?.frequency || 60;

      const shakeAnimation = async () => {
        const startTime = Date.now();
        
        while (Date.now() - startTime < duration) {
          const progress = (Date.now() - startTime) / duration;
          const decay = 1 - progress;
          const x = (Math.random() - 0.5) * 20 * intensity * decay;
          const y = (Math.random() - 0.5) * 10 * intensity * decay;
          
          await controls.start({
            x,
            y,
            transition: { duration: 1 / frequency },
          });
        }
        
        await controls.start({ x: 0, y: 0 });
      };

      shakeAnimation();
    }
  }, [isShaking, options, controls]);

  return (
    <motion.div animate={controls} className="w-full h-full">
      {children}
    </motion.div>
  );
}

// Hook for screen shake
export function useScreenShake() {
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback((options?: ScreenShakeOptions) => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), options?.duration || 500);
  }, []);

  return { isShaking, shake };
}

// ============================================================================
// FLASH EFFECTS
// ============================================================================

interface FlashOverlayProps {
  color: string;
  duration?: number;
  onComplete?: () => void;
}

export function FlashOverlay({ color, duration = 300, onComplete }: FlashOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 0.8, 0] }}
      transition={{ duration: duration / 1000 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ backgroundColor: color }}
    />
  );
}

// ============================================================================
// ENERGY AURA
// ============================================================================

interface EnergyAuraProps {
  color: string;
  intensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}

export function EnergyAura({ color, intensity = 'medium', children }: EnergyAuraProps) {
  const intensityConfig = {
    low: { scale: [1, 1.02, 1], opacity: [0.2, 0.3, 0.2], blur: '20px' },
    medium: { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3], blur: '30px' },
    high: { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5], blur: '40px' },
  };

  const config = intensityConfig[intensity];

  return (
    <div className="relative">
      {/* Aura glow */}
      <motion.div
        animate={{
          scale: config.scale,
          opacity: config.opacity,
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: `blur(${config.blur})`,
        }}
      />
      
      {children}
    </div>
  );
}

// ============================================================================
// DAMAGE FLASH
// ============================================================================

interface DamageFlashProps {
  isActive: boolean;
  direction?: 'left' | 'right';
}

export function DamageFlash({ isActive, direction = 'left' }: DamageFlashProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ 
            opacity: 0,
            x: direction === 'left' ? -100 : 100 
          }}
          animate={{ 
            opacity: [0, 0.3, 0.3, 0],
            x: 0 
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to ${direction === 'left' ? 'right' : 'left'}, 
              rgba(239, 68, 68, 0.5) 0%, 
              transparent 50%
            )`,
          }}
        />
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// VICTORY/DEFEAT OVERLAYS
// ============================================================================

interface VictoryOverlayProps {
  isVictory: boolean;
  onComplete?: () => void;
}

export function VictoryOverlay({ isVictory, onComplete }: VictoryOverlayProps) {
  const color = isVictory ? '#22c55e' : '#ef4444';
  const text = isVictory ? 'VICTORY' : 'DEFEAT';
  const Icon = isVictory ? Trophy : Skull;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onAnimationComplete={onComplete}
    >
      {/* Background flash */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
        style={{ backgroundColor: color }}
      />

      {/* Content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-6"
        >
          <Icon className="w-24 h-24 mx-auto" style={{ color }} />
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-6xl md:text-8xl font-black mb-4"
          style={{ 
            color,
            textShadow: `0 0 40px ${color}`,
          }}
        >
          {text}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-slate-400"
        >
          {isVictory ? 'The battle is won!' : 'You have been defeated...'}
        </motion.p>
      </motion.div>

      {/* Particle burst */}
      {isVictory && Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50vw',
            y: '50vh',
            scale: 0,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 80}vw`,
            y: `${50 + (Math.random() - 0.5) * 80}vh`,
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.05,
          }}
          className="absolute w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </motion.div>
  );
}

// Import icons
import { Trophy, Skull } from 'lucide-react';

// ============================================================================
// COMBO COUNTER
// ============================================================================

interface ComboCounterProps {
  count: number;
  isActive: boolean;
}

export function ComboCounter({ count, isActive }: ComboCounterProps) {
  if (!isActive || count < 2) return null;

  const getComboText = () => {
    if (count >= 10) return 'GODLIKE!';
    if (count >= 7) return 'UNSTOPPABLE!';
    if (count >= 5) return 'DOMINATING!';
    if (count >= 3) return 'IMPRESSIVE!';
    return `${count} HITS!`;
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 20 }}
      className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          textShadow: [
            '0 0 20px rgba(250, 204, 21, 0.5)',
            '0 0 40px rgba(250, 204, 21, 0.8)',
            '0 0 20px rgba(250, 204, 21, 0.5)',
          ]
        }}
        transition={{ duration: 0.3, repeat: Infinity }}
        className="text-4xl md:text-6xl font-black text-yellow-400"
        style={{ textShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}
      >
        {getComboText()}
      </motion.div>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-2"
      />
    </motion.div>
  );
}

// ============================================================================
// STUN EFFECT
// ============================================================================

interface StunEffectProps {
  isStunned: boolean;
}

export function StunEffect({ isStunned }: StunEffectProps) {
  if (!isStunned) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Stars */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, -20, -10],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            repeat: Infinity,
          }}
          className="absolute text-yellow-400 text-2xl"
          style={{
            left: `${30 + i * 20}%`,
            top: '20%',
          }}
        >
          ⭐
        </motion.div>
      ))}

      {/* Dizzy lines */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-16 h-1 bg-yellow-400/30 rounded-full"
            style={{
              transform: `rotate(${i * 90}deg) translateX(40px)`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ============================================================================
// CHARGING EFFECT
// ============================================================================

interface ChargingEffectProps {
  isCharging: boolean;
  progress: number; // 0-100
}

export function ChargingEffect({ isCharging, progress }: ChargingEffectProps) {
  if (!isCharging) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      {/* Charging circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="relative w-32 h-32"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-yellow-400/50"
            style={{
              transform: `scale(${1 + i * 0.2})`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1 + i * 0.2, 1.1 + i * 0.2, 1 + i * 0.2],
            }}
            transition={{
              duration: 1,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
      </motion.div>

      {/* Progress text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute text-yellow-400 font-bold text-xl"
      >
        {progress}%
      </motion.div>
    </div>
  );
}
