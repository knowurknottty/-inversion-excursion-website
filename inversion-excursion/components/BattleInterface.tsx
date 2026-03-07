import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardComponent } from './Card';
import { ResonanceMeter } from './ResonanceMeter';
import type {
  BattleState,
  Cell,
  Card,
  EnemyIntention,
  CombatLogEntry,
  EnemyIntentionType,
} from '../types';

interface BattleInterfaceProps {
  battle: BattleState;
  currentUserId: string;
  cell: Cell;
  isPlayerTurn: boolean;
  onPlayCard: (cardId: string, targetId?: string) => void;
  onSynchronize: () => void;
  onResonanceBurst: () => void;
  onDefend: () => void;
  onPass: () => void;
  onConcede?: () => void;
  className?: string;
}

const intentionIcons: Record<EnemyIntentionType, React.ReactNode> = {
  attack: (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  defend: (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  special: (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  charge: (
    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

const intentionColors: Record<EnemyIntentionType, string> = {
  attack: 'bg-red-500/20 border-red-500/50 text-red-400',
  defend: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  special: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  charge: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
};

export const BattleInterface: React.FC<BattleInterfaceProps> = ({
  battle,
  currentUserId,
  cell,
  isPlayerTurn,
  onPlayCard,
  onSynchronize,
  onResonanceBurst,
  onDefend,
  onPass,
  onConcede,
  className = '',
}) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Get current player
  const currentPlayer = useMemo(() => {
    return battle.players.find((p) => p.id === currentUserId);
  }, [battle.players, currentUserId]);

  // Calculate if resonance burst is available
  const canBurst = battle.isResonanceReady && battle.resonanceMeter >= 100;

  // Handle card selection
  const handleCardClick = useCallback((card: Card) => {
    if (!isPlayerTurn) return;

    if (selectedCard?.id === card.id) {
      // Play the card
      onPlayCard(card.id, battle.enemy.id);
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  }, [selectedCard, isPlayerTurn, onPlayCard, battle.enemy.id]);

  // Format combat log timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
  };

  // Get log entry color based on type
  const getLogColor = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'attack': return 'text-red-400';
      case 'defend': return 'text-blue-400';
      case 'heal': return 'text-green-400';
      case 'buff': return 'text-amber-400';
      case 'debuff': return 'text-purple-400';
      case 'resonance': return 'text-violet-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-950 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">⚡</span>
          <h1 className="text-sm font-semibold text-white">Battle: {battle.enemy.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Turn {battle.turnNumber}</span>
          <button
            onClick={() => setShowCombatLog(!showCombatLog)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative min-w-[44px] min-h-[44px]"
            aria-label="Toggle combat log"
            aria-expanded={showCombatLog}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enemy Section */}
      <div className="px-4 py-4">
        <div className="relative bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
          {/* Enemy Avatar & Stats */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500/50 bg-gray-800">
                {battle.enemy.avatarUrl ? (
                  <img
                    src={battle.enemy.avatarUrl}
                    alt={battle.enemy.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">👾</span>
                  </div>
                )}
              </div>
              {/* Phase indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {battle.enemy.phase}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium">{battle.enemy.name}</span>
                <span className="text-xs text-gray-400">
                  {battle.enemy.currentHealth}/{battle.enemy.maxHealth} HP
                </span>
              </div>

              {/* Health Bar */}
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(battle.enemy.currentHealth / battle.enemy.maxHealth) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Enemy Intention */}
          <AnimatePresence mode="wait">
            <motion.div
              key={battle.enemy.intention.type}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`
                mt-4 flex items-center gap-3 p-3 rounded-lg border
                ${intentionColors[battle.enemy.intention.type]}
                ${battle.enemy.intention.warning ? 'animate-pulse' : ''}
              `}
              role="alert"
              aria-live="polite"
            >
              <div className="p-2 bg-black/20 rounded-lg">
                {intentionIcons[battle.enemy.intention.type]}
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider font-medium">
                  Intent: {battle.enemy.intention.type}
                </div>
                <div className="text-sm opacity-90">
                  {battle.enemy.intention.description}
                </div>
              </div>
              {battle.enemy.intention.power > 0 && (
                <div className="text-lg font-bold"
003e
                  {battle.enemy.intention.power}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Cell Formation */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          {battle.players.map((player, index) => (
            <motion.div
              key={player.id}
              className={`
                flex flex-col items-center
                ${player.isActive ? 'scale-110' : 'opacity-60'}
              `}
              animate={{
                scale: player.isActive ? 1.1 : 1,
                opacity: player.isActive ? 1 : 0.6,
              }}
            >
              <div className={`
                w-10 h-10 rounded-full overflow-hidden border-2
                ${player.isActive ? 'border-violet-400' : 'border-gray-600'}
              `}>
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-xs font-semibold">{player.displayName.charAt(0)}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {player.displayName.slice(0, 8)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Resonance Meter */}
        <div className="mt-3">
          <ResonanceMeter
            value={battle.resonanceMeter}
            label="Cell Resonance"
            size="sm"
            isCharged={canBurst}
            showPulse={true}
            variant="linear"
          />
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="px-4 py-2">
        <motion.div
          className={`
            text-center py-2 rounded-lg text-sm font-medium
            ${isPlayerTurn ? 'bg-violet-500/20 text-violet-300' : 'bg-gray-800 text-gray-400'}
          `}
          animate={{
            opacity: isPlayerTurn ? [0.7, 1, 0.7] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isPlayerTurn ? Infinity : 0,
          }}
        >
          {isPlayerTurn ? 'YOUR TURN' : "ENEMY'S TURN"}
        </motion.div>
      </div>

      {/* Combat Log (Collapsible) */}
      <AnimatePresence>
        {showCombatLog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-2 max-h-32 overflow-y-auto bg-gray-900/50 rounded-lg p-2 text-xs">
              {battle.combatLog.slice(-10).map((entry) => (
                <div key={entry.id} className="flex gap-2 py-1 border-b border-gray-800 last:border-0">
                  <span className="text-gray-600">{formatTime(entry.timestamp)}</span>
                  <span className={getLogColor(entry.type)}>{entry.message}</span>
                </div>
              ))}
              {battle.combatLog.length === 0 && (
                <div className="text-gray-500 text-center py-2">Combat started...</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Hand */}
      <div className="flex-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max justify-center">
          <AnimatePresence>
            {currentPlayer?.hand.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50, rotate: -10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                  scale: selectedCard?.id === card.id ? 1.1 : 1,
                  y: selectedCard?.id === card.id ? -10 : 0,
                }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ delay: index * 0.05 }}
              >
                <CardComponent
                  card={card}
                  size="md"
                  isSelected={selectedCard?.id === card.id}
                  isDisabled={!isPlayerTurn}
                  showFrequency={true}
                  onClick={() => handleCardClick(card)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 bg-gray-900/50 border-t border-gray-800">
        <div className="grid grid-cols-4 gap-2">
          {/* Play Card */}
          <button
            onClick={() => {
              if (selectedCard) {
                onPlayCard(selectedCard.id, battle.enemy.id);
                setSelectedCard(null);
              }
            }}
            disabled={!isPlayerTurn || !selectedCard}
            onMouseEnter={() => setHoveredAction('play')}
            onMouseLeave={() => setHoveredAction(null)}
            className={`
              py-3 px-2 rounded-lg font-medium text-sm transition-all
              ${isPlayerTurn && selectedCard
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
              min-h-[44px]
            `}
            aria-label="Play selected card"
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Play</span>
            </div>
          </button>

          {/* Synchronize */}
          <button
            onClick={onSynchronize}
            disabled={!isPlayerTurn}
            className={`
              py-3 px-2 rounded-lg font-medium text-sm transition-all
              ${isPlayerTurn
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
              min-h-[44px]
            `}
            aria-label="Synchronize with SynSync"
          >
            <div className="flex flex-col items-center gap-1"
003e
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Sync</span>
            </div>
          </button>

          {/* Defend */}
          <button
            onClick={onDefend}
            disabled={!isPlayerTurn}
            className={`
              py-3 px-2 rounded-lg font-medium text-sm transition-all
              ${isPlayerTurn
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
              min-h-[44px]
            `}
            aria-label="Defend"
          >
            <div className="flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Defend</span>
            </div>
          </button>

          {/* Resonance Burst */}
          <button
            onClick={onResonanceBurst}
            disabled={!canBurst}
            className={`
              py-3 px-2 rounded-lg font-medium text-sm transition-all relative overflow-hidden
              ${canBurst
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/50'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
              min-h-[44px]
            `}
            aria-label="Resonance Burst"
          >
            {canBurst && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}
            <div className="relative flex flex-col items-center gap-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Burst</span>
            </div>
          </button>
        </div>

        {/* Pass / Concede */}
        <div className="flex justify-between mt-2">
          <button
            onClick={onPass}
            disabled={!isPlayerTurn}
            className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-50 transition-colors px-2 py-1 min-h-[32px]"
          >
            Pass Turn
          </button>
          {onConcede && (
            <button
              onClick={onConcede}
              className="text-xs text-red-500/70 hover:text-red-400 transition-colors px-2 py-1 min-h-[32px]"
            >
              Concede
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleInterface;
