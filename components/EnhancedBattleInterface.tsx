/**
 * EPWORLD Battle UX - Enhanced Battle Interface
 * Dragon Ball FighterZ meets Hearthstone aesthetic
 * Reference: Arc System Works particle effects + Blizard card UI
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBattleStore, useDeckStore } from '@/lib/store';
import { useBattle, useTurnTimer } from '@/hooks/useBattle';
import { Card } from './Card';
import { 
  Heart, Zap, Clock, Shield, Swords, Flame, Sparkles, 
  Skull, Trophy, ZapOff, ChevronRight, Users, Eye,
  Target, X, Check, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// ============================================================================
// ANIMATION VARIANTS - Dragon Ball FighterZ inspired
// ============================================================================

const auraVariants = {
  idle: {
    scale: [1, 1.02, 1],
    opacity: [0.3, 0.5, 0.3],
  },
  charged: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 0.8, 0.5],
  },
  super: {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
  },
};

const damageShakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5 }
  }
};

const kiPulseVariants = {
  pulse: {
    scale: [1, 1.3, 1],
    opacity: [0.8, 0, 0.8],
    transition: { duration: 1, repeat: Infinity }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -10,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  selected: {
    scale: 1.1,
    y: -20,
    boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)"
  }
};

const turnIndicatorVariants = {
  player: {
    x: 0,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderColor: "rgba(99, 102, 241, 0.5)"
  },
  opponent: {
    x: "100%",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.5)"
  }
};

// ============================================================================
// TYPES
// ============================================================================

interface DamageNumberProps {
  amount: number;
  type: 'damage' | 'heal' | 'critical' | 'miss';
  onComplete: () => void;
}

interface KiBarProps {
  current: number;
  max: number;
  level: number;
  isTransforming?: boolean;
}

interface ActionConfirmationProps {
  cardName: string;
  cardEffect: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface SpectatorOverlayProps {
  player1Name: string;
  player2Name: string;
  viewerCount: number;
}

// ============================================================================
// DAMAGE NUMBER COMPONENT - Floating combat text
// ============================================================================

function DamageNumber({ amount, type, onComplete }: DamageNumberProps) {
  const colors = {
    damage: "text-red-500",
    heal: "text-green-400",
    critical: "text-yellow-400",
    miss: "text-slate-400"
  };

  const getText = () => {
    if (type === 'miss') return 'MISS!';
    if (type === 'critical') return `${amount}!`;
    return `${amount > 0 ? '-' : '+'}${Math.abs(amount)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        y: [-20, -60, -80],
        scale: [0.5, 1.2, 1, 0.8]
      }}
      transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
      onAnimationComplete={onComplete}
      className={`absolute pointer-events-none z-50 font-black text-4xl ${colors[type]} drop-shadow-lg`}
      style={{ 
        textShadow: type === 'critical' 
          ? '0 0 20px rgba(250, 204, 21, 0.8)' 
          : '2px 2px 4px rgba(0,0,0,0.8)'
      }}
    >
      {getText()}
      {type === 'critical' && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-4 -right-8 text-yellow-300 text-lg"
        >
          CRIT!
        </motion.span>
      )}
    </motion.div>
  );
}

// ============================================================================
// KI BAR COMPONENT - Dragon Ball style energy meter
// ============================================================================

function KiBar({ current, max, level, isTransforming }: KiBarProps) {
  const percentage = (current / max) * 100;
  
  const getLevelColor = () => {
    switch (level) {
      case 0: return "from-blue-400 to-blue-600";
      case 1: return "from-cyan-400 to-cyan-600";
      case 2: return "from-yellow-400 to-yellow-600";
      case 3: return "from-orange-400 to-orange-600";
      case 4: return "from-red-400 to-red-600";
      default: return "from-blue-400 to-blue-600";
    }
  };

  const getGlowColor = () => {
    switch (level) {
      case 0: return "shadow-blue-500/50";
      case 1: return "shadow-cyan-500/50";
      case 2: return "shadow-yellow-500/50";
      case 3: return "shadow-orange-500/50";
      case 4: return "shadow-red-500/50";
      default: return "shadow-blue-500/50";
    }
  };

  return (
    <div className="relative">
      {/* Ki aura background */}
      <motion.div
        animate={isTransforming ? "super" : percentage > 75 ? "charged" : "idle"}
        variants={auraVariants}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-r ${getLevelColor()} opacity-30`}
      />
      
      {/* Ki bar container */}
      <div className="relative h-4 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700">
        {/* Segments for DBZ style */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-slate-800/50 last:border-r-0" />
          ))}
        </div>
        
        {/* Fill */}
        <motion.div
          className={`h-full bg-gradient-to-r ${getLevelColor()} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          
          {/* Sparkle particles at high ki */}
          {percentage > 75 && (
            <motion.div
              variants={kiPulseVariants}
              animate="pulse"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-sm"
            />
          )}
        </motion.div>
      </div>
      
      {/* Ki level indicator */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">KI</span>
        <span className={`text-xs font-bold ${percentage >= 100 ? 'text-yellow-400 animate-pulse' : 'text-slate-300'}`}>
          {current}/{max}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// ACTION CONFIRMATION MODAL
// ============================================================================

function ActionConfirmation({ cardName, cardEffect, onConfirm, onCancel }: ActionConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold">Confirm Action</h3>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <p className="text-lg font-semibold text-indigo-300 mb-1">{cardName}</p>
          <p className="text-sm text-slate-400">{cardEffect}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            <Check className="w-4 h-4" />
            Execute
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// TRANSFORMATION CINEMATIC
// ============================================================================

function TransformationCinematic({ 
  characterName, 
  level, 
  onComplete 
}: { 
  characterName: string; 
  level: number; 
  onComplete: () => void;
}) {
  const levels = [
    { name: "Base Form", color: "from-blue-400 to-cyan-400" },
    { name: "Charged", color: "from-cyan-400 to-teal-400" },
    { name: "Powered Up", color: "from-yellow-400 to-amber-400" },
    { name: "SUPER SAIYAN", color: "from-yellow-300 to-orange-400" },
    { name: "SPIRIT BOMB READY", color: "from-red-400 to-pink-500" }
  ];

  const currentLevel = levels[level] || levels[0];

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      {/* Flash effect */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0.3, 1, 0] }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-white"
      />
      
      {/* Energy waves */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 2, 3], 
            opacity: [0.8, 0.4, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2, 
            delay: i * 0.1,
            repeat: 1
          }}
          className={`absolute w-96 h-96 rounded-full border-4 bg-gradient-to-r ${currentLevel.color} opacity-20`}
        />
      ))}
      
      {/* Character name */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="text-center z-10"
      >
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-slate-400 text-lg mb-2"
        >
          {characterName}
        </motion.p>
        <motion.h2
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          className={`text-5xl md:text-7xl font-black bg-gradient-to-r ${currentLevel.color} bg-clip-text text-transparent`}
          style={{ textShadow: `0 0 40px currentColor` }}
        >
          {currentLevel.name}
        </motion.h2>
      </motion.div>
      
      {/* Screen shake effect */}
      <motion.div
        animate={{ 
          x: [0, -5, 5, -5, 5, 0],
          y: [0, -3, 3, -3, 3, 0]
        }}
        transition={{ duration: 0.3, repeat: 5 }}
        className="absolute inset-0 pointer-events-none"
      />
    </motion.div>
  );
}

// ============================================================================
// SPECTATOR MODE OVERLAY
// ============================================================================

function SpectatorOverlay({ player1Name, player2Name, viewerCount }: SpectatorOverlayProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Match info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">{viewerCount.toLocaleString()} watching</span>
            </div>
            
            <div className="h-4 w-px bg-slate-700" />
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-400">{player1Name}</span>
              <span className="text-slate-500">vs</span>
              <span className="text-sm font-medium text-red-400">{player2Name}</span>
            </div>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-medium text-red-400 uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MOBILE BATTLE CONTROLS
// ============================================================================

function MobileBattleControls({ 
  onAttack, 
  onDefend, 
  onCharge, 
  canAct,
  selectedCard
}: {
  onAttack: () => void;
  onDefend: () => void;
  onCharge: () => void;
  canAct: boolean;
  selectedCard: boolean;
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 p-4 z-30">
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onDefend}
          disabled={!canAct}
          className="flex-1 py-4 px-4 bg-slate-800 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <Shield className="w-5 h-5" />
          <span className="text-xs">Defend</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCharge}
          disabled={!canAct}
          className="flex-1 py-4 px-4 bg-slate-800 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
        >
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-xs">Charge Ki</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAttack}
          disabled={!canAct || !selectedCard}
          className={`flex-[2] py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            canAct && selectedCard
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          <Swords className="w-5 h-5" />
          ATTACK
        </motion.button>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCED BATTLE INTERFACE
// ============================================================================

export function EnhancedBattleInterface() {
  const { selectedDeck } = useDeckStore();
  const { 
    playerHealth, 
    playerMaxHealth, 
    opponentHealth, 
    opponentMaxHealth,
    currentTurn,
    battleLog,
    dungeonResponse,
    victory,
    isActive
  } = useBattleStore();
  
  const battle = useBattle();
  const timer = useTurnTimer();
  
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<Card | null>(null);
  const [damageNumbers, setDamageNumbers] = useState<Array<{id: string; amount: number; type: 'damage' | 'heal' | 'critical' | 'miss'; target: 'player' | 'opponent'}>>([]);
  const [showTransformation, setShowTransformation] = useState(false);
  const [transformationLevel, setTransformationLevel] = useState(0);
  const [playerKi, setPlayerKi] = useState(0);
  const [opponentKi, setOpponentKi] = useState(0);
  const [isSpectatorMode] = useState(false);
  const [spectatorCount] = useState(142);

  const playerHealthPercent = (playerHealth / playerMaxHealth) * 100;
  const opponentHealthPercent = (opponentHealth / opponentMaxHealth) * 100;

  // Handle card selection
  const handleCardSelect = (card: Card) => {
    if (currentTurn !== 'player' || victory !== null) return;
    
    if (selectedCard === card.id) {
      setShowConfirmation(true);
      setPendingAction(card);
    } else {
      setSelectedCard(card.id);
    }
  };

  // Execute action
  const executeAction = async () => {
    if (!pendingAction) return;
    
    setShowConfirmation(false);
    
    // Simulate damage number
    const damageId = Math.random().toString(36);
    const damageAmount = pendingAction.attack || Math.floor(Math.random() * 20) + 10;
    const isCritical = Math.random() > 0.8;
    
    setDamageNumbers(prev => [...prev, {
      id: damageId,
      amount: damageAmount,
      type: isCritical ? 'critical' : 'damage',
      target: 'opponent'
    }]);
    
    await battle.playCard(pendingAction);
    setPendingAction(null);
    setSelectedCard(null);
    
    // Remove damage number after animation
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== damageId));
    }, 1200);
  };

  // Cancel action
  const cancelAction = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  // Check for ki transformation
  useEffect(() => {
    if (playerKi >= 75 && transformationLevel < 3) {
      setTransformationLevel(3);
      setShowTransformation(true);
    } else if (playerKi >= 50 && transformationLevel < 2) {
      setTransformationLevel(2);
    } else if (playerKi >= 25 && transformationLevel < 1) {
      setTransformationLevel(1);
    }
  }, [playerKi, transformationLevel]);

  // Ki regeneration
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setPlayerKi(prev => Math.min(100, prev + 5));
      setOpponentKi(prev => Math.min(100, prev + 5));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <>
      {/* Spectator Overlay */}
      {isSpectatorMode && (
        <SpectatorOverlay 
          player1Name="ResonantWarrior" 
          player2Name="DungeonGuardian" 
          viewerCount={spectatorCount}
        />
      )}
      
      {/* Transformation Cinematic */}
      <AnimatePresence>
        {showTransformation && (
          <TransformationCinematic
            characterName="You"
            level={transformationLevel}
            onComplete={() => setShowTransformation(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Action Confirmation */}
      <AnimatePresence>
        {showConfirmation && pendingAction && (
          <ActionConfirmation
            cardName={pendingAction.name}
            cardEffect={pendingAction.specialAbility || `Deals ${pendingAction.attack} damage`}
            onConfirm={executeAction}
            onCancel={cancelAction}
          />
        )}
      </AnimatePresence>
      
      <div className={`grid lg:grid-cols-3 gap-4 lg:gap-6 ${isSpectatorMode ? 'pt-16' : ''}`}>
        {/* Battle Arena */}
        <section className="lg:col-span-2 space-y-4">
          {/* Opponent Status */}
          <motion.div 
            className="relative p-4 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden"
            animate={currentTurn === 'opponent' ? { 
              boxShadow: ["0 0 0 rgba(239, 68, 68, 0)", "0 0 20px rgba(239, 68, 68, 0.3)", "0 0 0 rgba(239, 68, 68, 0)"]
            } : {}}
            transition={{ duration: 1, repeat: currentTurn === 'opponent' ? Infinity : 0 }}
          >
            {/* Turn indicator glow */}
            {currentTurn === 'opponent' && (
              <motion.div
                layoutId="turnIndicator"
                className="absolute inset-0 bg-red-500/5 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <div className="relative flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center border border-red-500/30"
                  animate={currentTurn === 'opponent' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: currentTurn === 'opponent' ? Infinity : 0 }}
                >
                  <Swords className="w-6 h-6 text-red-400" />
                </motion.div>
                <div>
                  <div className="font-bold text-lg">Dungeon Guardian</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Skull className="w-3 h-3" />
                    Level 1 AI
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-black text-red-400">{opponentHealth}</div>
                <div className="text-xs text-slate-500">/{opponentMaxHealth} HP</div>
              </div>
            </div>
            
            {/* Health bar */}
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-red-500/20"
                animate={opponentHealthPercent < 30 ? { opacity: [0.3, 0.6, 0.3] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 relative"
                initial={{ width: '100%' }}
                animate={{ width: `${opponentHealthPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              </motion.div>
              
              {/* Damage numbers container */}
              <div className="absolute inset-0 flex items-center justify-center">
                {damageNumbers.filter(d => d.target === 'opponent').map(d => (
                  <DamageNumber 
                    key={d.id} 
                    amount={d.amount} 
                    type={d.type} 
                    onComplete={() => {}}
                  />
                ))}
              </div>
            </div>
            
            {/* Ki bar */}
            <div className="mt-2">
              <KiBar current={opponentKi} max={100} level={Math.floor(opponentKi / 25)} />
            </div>
          </motion.div>

          {/* Battle Visualization */}
          <div className="relative aspect-video bg-slate-900/30 rounded-xl border border-slate-800 overflow-hidden">
            {/* Dynamic background */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ 
                  background: currentTurn === 'player' 
                    ? ['radial-gradient(circle at 30% 50%, rgba(99,102,241,0.1) 0%, transparent 50%)', 'radial-gradient(circle at 40% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)']
                    : ['radial-gradient(circle at 70% 50%, rgba(239,68,68,0.1) 0%, transparent 50%)', 'radial-gradient(circle at 60% 50%, rgba(239,68,68,0.15) 0%, transparent 50%)']
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0"
              />
            </div>
            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }} />
            
            {/* Center clash zone */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: currentTurn === 'player' ? [1, 1.05, 1] : [1, 0.95, 1],
                  rotate: currentTurn === 'player' ? [0, 5, -5, 0] : [0, -5, 5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`
                  w-32 h-32 rounded-full flex items-center justify-center
                  ${currentTurn === 'player' 
                    ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30' 
                    : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30'}
                `}
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`
                    text-5xl font-black
                    ${currentTurn === 'player' ? 'text-indigo-400' : 'text-red-400'}
                  `}
                >
                  VS
                </motion.span>
              </motion.div>
            </div>
            
            {/* Turn indicator banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: currentTurn === 'player' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  borderColor: currentTurn === 'player' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                  scale: [1, 1.05, 1]
                }}
                transition={{ scale: { duration: 0.5, repeat: Infinity } }}
                className="px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-wider backdrop-blur-sm"
              >
                <span className={currentTurn === 'player' ? 'text-indigo-300' : 'text-red-300'}>
                  {currentTurn === 'player' ? 'YOUR TURN' : "ENEMY'S TURN"}
                </span>
              </motion.div>
            </div>
            
            {/* Battle effects overlay */}
            <AnimatePresence>
              {currentTurn === 'player' && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                >
                  <div className="w-2 h-20 bg-gradient-to-b from-transparent via-indigo-500 to-transparent opacity-50" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Status */}
          <motion.div 
            className="relative p-4 bg-slate-900/50 rounded-xl border border-slate-800"
            animate={currentTurn === 'player' ? { 
              boxShadow: ["0 0 0 rgba(99, 102, 241, 0)", "0 0 20px rgba(99, 102, 241, 0.3)", "0 0 0 rgba(99, 102, 241, 0)"]
            } : {}}
            transition={{ duration: 1, repeat: currentTurn === 'player' ? Infinity : 0 }}
          >
            {/* Turn indicator glow */}
            {currentTurn === 'player' && (
              <motion.div
                layoutId="turnIndicator"
                className="absolute inset-0 bg-indigo-500/5 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <div className="relative flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-600/10 rounded-full flex items-center justify-center border border-indigo-500/30"
                  animate={currentTurn === 'player' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: currentTurn === 'player' ? Infinity : 0 }}
                >
                  <Shield className="w-6 h-6 text-indigo-400" />
                </motion.div>
                <div>
                  <div className="font-bold text-lg">You</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Resonant Warrior
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">{selectedDeck.length}</span>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-400">{playerHealth}</div>
                  <div className="text-xs text-slate-500">/{playerMaxHealth} HP</div>
                </div>
              </div>
            </div>
            
            {/* Health bar */}
            <div className="relative h-5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-green-500/20"
                animate={playerHealthPercent < 30 ? { opacity: [0.3, 0.6, 0.3] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 relative"
                initial={{ width: '100%' }}
                animate={{ width: `${playerHealthPercent}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              </motion.div>
            </div>
            
            {/* Ki bar */}
            <div className="mt-3">
              <KiBar 
                current={playerKi} 
                max={100} 
                level={Math.floor(playerKi / 25)}
                isTransforming={showTransformation}
              />
            </div>
          </motion.div>

          {/* Hand - Desktop */}
          <div className="hidden lg:grid grid-cols-4 gap-4">
            {selectedDeck.slice(0, 4).map((card, index) => (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                variants={cardHoverVariants}
                whileHover={currentTurn === 'player' && victory === null ? "hover" : undefined}
                whileTap={currentTurn === 'player' && victory === null ? { scale: 0.98 } : undefined}
                animate={selectedCard === card.id ? "selected" : "rest"}
                onClick={() => handleCardSelect(card)}
                disabled={currentTurn !== 'player' || victory !== null}
                className={`
                  transition-all duration-200 relative
                  ${currentTurn !== 'player' || victory !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Selection glow */}
                {selectedCard === card.id && (
                  <motion.div
                    layoutId="cardSelection"
                    className="absolute -inset-2 bg-indigo-500/20 rounded-2xl blur-md -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Card card={card} showFrequency={true} />
                
                {/* Tap hint */}
                {selectedCard === card.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap"
                  >
                    Tap again to play
                  </motion.div>
                )}
              </motion.button>
            ))}
            
            {Array.from({ length: Math.max(0, 4 - selectedDeck.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center bg-slate-900/30"
              >
                <span className="text-slate-700 text-2xl">—</span>
              </div>
            ))}
          </div>
        </section>

        {/* Battle Info Sidebar */}
        <aside className="space-y-4">
          {/* Timer */}
          <motion.div 
            className="p-4 bg-slate-900/50 rounded-xl border border-slate-800"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Turn Timer</span>
              </div>
              {timer.timeLeft < 10 && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-xs text-red-400 font-bold"
                >
                  LOW TIME!
                </motion.span>
              )}
            </div>
            <div className={`text-3xl font-mono font-bold ${timer.timeLeft < 10 ? 'text-red-400' : 'text-slate-200'}`}>
              {timer.formatted}
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${timer.timeLeft < 10 ? 'bg-red-500' : 'bg-indigo-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timer.timeLeft / 60) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          {/* Dungeon AI Response */}
          <AnimatePresence mode="wait">
            {dungeonResponse && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 rounded-xl border border-purple-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Dungeon Master</span>
                </div>
                <p className="text-sm text-purple-100 leading-relaxed">{dungeonResponse}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Battle Log */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Battle Log
              </h3>
              <span className="text-xs text-slate-500">Turn {battle.turnCount}</span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {battleLog.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      text-sm p-3 rounded-lg border-l-2
                      ${entry.includes('Victory') ? 'bg-green-500/10 border-green-500 text-green-300' : ''}
                      ${entry.includes('Defeat') ? 'bg-red-500/10 border-red-500 text-red-300' : ''}
                      ${entry.includes('Enemy') ? 'bg-red-500/5 border-red-500/30 text-red-200' : ''}
                      ${!entry.includes('Victory') && !entry.includes('Defeat') && !entry.includes('Enemy') ? 'bg-slate-800/30 border-slate-600 text-slate-300' : ''}
                    `}
                  >
                    {entry}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 hidden lg:block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => battle.surrender()}
              disabled={victory !== null}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 border border-transparent hover:border-red-500/30"
            >
              <ZapOff className="w-4 h-4" />
              Surrender
            </motion.button>
          </div>
        </aside>
      </div>

      {/* Mobile Controls */}
      <MobileBattleControls
        onAttack={() => pendingAction && executeAction()}
        onDefend={() => battle.addToBattleLog('You brace for impact!')}
        onCharge={() => {
          setPlayerKi(prev => Math.min(100, prev + 25));
          battle.addToBattleLog('You charge your Ki!');
        }}
        canAct={currentTurn === 'player' && victory === null}
        selectedCard={!!selectedCard}
      />
      
      {/* Mobile Card Hand */}
      <div className="lg:hidden fixed bottom-24 left-0 right-0 overflow-x-auto scrollbar-hide px-4 pb-2">
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {selectedDeck.slice(0, 4).map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardSelect(card)}
              disabled={currentTurn !== 'player' || victory !== null}
              className={`
                w-24 flex-shrink-0 transition-all
                ${selectedCard === card.id ? 'scale-110 -translate-y-2' : ''}
                ${currentTurn !== 'player' || victory !== null ? 'opacity-50' : ''}
              `}
            >
              <div className="aspect-[3/4] rounded-lg bg-slate-800 border border-slate-700 p-2">
                <div className="text-xs font-bold truncate">{card.name}</div>
                {card.attack > 0 && (
                  <div className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <Swords className="w-3 h-3" />
                    {card.attack}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}

export default EnhancedBattleInterface;
