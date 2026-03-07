import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BattleSnapshot, Reward, CardTier } from '../types';

interface VictoryModalProps {
  result: 'victory' | 'defeat';
  snapshot: BattleSnapshot;
  rewards: Reward[];
  quote: string;
  playerStats?: {
    totalDamage: number;
    resonanceContributed: number;
    cardsPlayed: number;
  };
  onMint: () => Promise<void>;
  onShare: () => void;
  onPlayAgain: () => void;
  onReturn: () => void;
  className?: string;
}

const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-gray-700/50',
    border: 'border-gray-600',
    text: 'text-gray-300',
    glow: 'shadow-gray-500/20',
  },
  uncommon: {
    bg: 'bg-green-900/30',
    border: 'border-green-600',
    text: 'text-green-400',
    glow: 'shadow-green-500/30',
  },
  rare: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-600',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30',
  },
  legendary: {
    bg: 'bg-purple-900/30',
    border: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/40',
  },
  cosmic: {
    bg: 'bg-gradient-to-br from-amber-900/50 via-yellow-900/50 to-orange-900/50',
    border: 'border-amber-500',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/50',
  },
};

const tierEmojis: Record<CardTier, string> = {
  physical: '🥉',
  emotional: '🥈',
  atomic: '🥇',
  galactic: '🌌',
  cosmic: '✨',
};

export const VictoryModal: React.FC<VictoryModalProps> = ({
  result,
  snapshot,
  rewards,
  quote,
  playerStats,
  onMint,
  onShare,
  onPlayAgain,
  onReturn,
  className = '',
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'rewards' | 'stats'>('summary');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isVictory = result === 'victory';

  // Generate battle screenshot on canvas
  const generateScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Background gradient based on result
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    if (isVictory) {
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0A0A0F');
    } else {
      gradient.addColorStop(0, '#2d0a0a');
      gradient.addColorStop(0.5, '#1a0a0a');
      gradient.addColorStop(1, '#0A0A0F');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Add stars/particles
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 600;
      const y = Math.random() * 400;
      const size = Math.random() * 2;
      ctx.globalAlpha = Math.random() * 0.5 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Title
    ctx.font = 'bold 48px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isVictory ? '#F59E0B' : '#EF4444';
    ctx.fillText(isVictory ? 'VICTORY' : 'DEFEAT', 300, 80);

    // VS line
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('⚡ THE INVERSION EXCURSION ⚡', 300, 120);

    // Enemy name
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`vs ${snapshot.enemyName}`, 300, 170);

    // Tier badge
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText(`${tierEmojis[snapshot.enemyTier]} ${snapshot.enemyTier.toUpperCase()}`, 300, 200);

    // Stats
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(`⚔️ ${snapshot.turns} Turns  •  ⏱️ ${Math.floor(snapshot.duration / 60)}m ${snapshot.duration % 60}s`, 300, 250);
    ctx.fillText(`📊 Resonance Peak: ${Math.round(snapshot.resonancePeak)}%`, 300, 280);

    // Cell members
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`Cell: ${snapshot.cellMembers.join(', ')}`, 300, 320);

    // Timestamp
    const date = new Date(snapshot.timestamp);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(date.toLocaleDateString(), 300, 370);

    // Watermark
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#8B5CF6';
    ctx.fillText('The Inversion Excursion', 300, 390);
  }, [isVictory, snapshot]);

  // Generate screenshot on mount
  useEffect(() => {
    generateScreenshot();
  }, [generateScreenshot]);

  // Handle mint
  const handleMint = useCallback(async () => {
    setIsMinting(true);
    try {
      await onMint();
      setHasMinted(true);
    } catch (err) {
      console.error('Mint failed:', err);
    } finally {
      setIsMinting(false);
    }
  }, [onMint]);

  // Download screenshot
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `inversion-excursion-${result}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [result]);

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          boxShadow: isVictory
            ? '0 0 60px rgba(245, 158, 11, 0.3)'
            : '0 0 60px rgba(239, 68, 68, 0.3)',
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Result Header */}
        <div className={`
          relative px-6 py-8 text-center overflow-hidden
          ${isVictory ? 'bg-gradient-to-b from-amber-900/50 to-gray-900' : 'bg-gradient-to-b from-red-900/50 to-gray-900'}
        `}>
          {/* Background effects */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: isVictory
                ? [
                    'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
                    'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.5) 0%, transparent 70%)',
                    'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
                  ]
                : [
                    'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
                    'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
                    'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
                  ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Result Icon */}
          <motion.div
            className={`
              relative w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
              ${isVictory ? 'bg-amber-500/20' : 'bg-red-500/20'}
            `}
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: isVictory
                ? [
                    '0 0 0 rgba(245, 158, 11, 0)',
                    '0 0 30px rgba(245, 158, 11, 0.5)',
                    '0 0 0 rgba(245, 158, 11, 0)',
                  ]
                : undefined,
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-4xl">{isVictory ? '👑' : '💀'}</span>
          </motion.div>

          <h1 className={`
            relative text-4xl font-bold mb-2
            ${isVictory ? 'text-amber-400' : 'text-red-400'}
          `}>
            {isVictory ? 'VICTORY' : 'DEFEAT'}
          </h1>

          <p className="relative text-sm text-gray-400 italic">"{quote}" </p>
        </div>

        {/* Hidden canvas for screenshot generation */}
        <canvas
          ref={canvasRef}
          className="hidden"
          aria-hidden="true"
        />

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {(['summary', 'rewards', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-3 text-sm font-medium capitalize transition-colors min-h-[44px]
                ${activeTab === tab
                  ? isVictory ? 'text-amber-400 border-b-2 border-amber-400' : 'text-red-400 border-b-2 border-red-400'
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
              aria-selected={activeTab === tab}
              role="tab"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-80 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Screenshot Preview */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 border border-gray-700"
003e
                    {/* Placeholder for actual screenshot - in production would show generated canvas */}
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                      <span className="text-4xl mb-2">{isVictory ? '🏆' : '☠️'}</span>
                      <p className="text-lg font-bold text-white">{snapshot.enemyName}</p>
                      <p className="text-sm text-gray-400">
                        {snapshot.turns} turns • {Math.floor(snapshot.duration / 60)}m {snapshot.duration % 60}s
                      </p>
                      <p className="text-xs text-violet-400 mt-1">
                        Peak Resonance: {Math.round(snapshot.resonancePeak)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleMint}
                      disabled={isMinting || hasMinted}
                      className={`
                        flex-1 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2
                        ${hasMinted
                          ? 'bg-green-600 text-white'
                          : isVictory
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }
                        min-h-[44px]
                      `}
                    >
                      {isMinting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            ⚡
                          </motion.span>
                          Minting...
                        </>
                      ) : hasMinted ? (
                        <>✓ Minted</>
                      ) : (
                        <>🎨 Mint Memory</>
                      )}
                    </button>

                    <button
                      onClick={handleDownload}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                      aria-label="Download screenshot"
                    >
                      📥
                    </button>
                  </div>
                </div>

                {/* Share to Cast */}
                <button
                  onClick={onShare}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                  </svg>
                  Share to Cast
                </button>
              </motion.div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {isVictory ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 mb-3">Loot Acquired:</p>

                    {rewards.length > 0 ? (
                      rewards.map((reward, index) => {
                        const colors = rarityColors[reward.rarity] || rarityColors.common;

                        return (
                          <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border
                              ${colors.bg} ${colors.border} ${colors.glow}
                            `}
                          >
                            <div className={`
                              w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                              ${colors.bg}
                            `}>
                              {reward.type === 'card' ? '🃏' : reward.type === 'essence' ? '✨' : reward.type === 'title' ? '🏅' : '🎁'}
                            </div>

                            <div className="flex-1">
                              <p className={`font-medium ${colors.text}`}>{reward.name}</p>
                              <p className="text-xs text-gray-400">{reward.description}</p>
                            </div>

                            {reward.amount && (
                              <span className="text-lg font-bold text-white">+{reward.amount}</span>
                            )}

                            <span className={`
                              text-[10px] px-2 py-1 rounded-full uppercase tracking-wider
                              ${colors.bg} ${colors.text}
                            `}>
                              {reward.rarity}
                            </span>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No rewards this time.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💡</div>
                    <p className="text-gray-300 mb-2">Insight Gained</p>
                    <p className="text-sm text-gray-400">Study the WYRD. Every defeat teaches.</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-900/30 rounded-full">
                      <span>✨</span>
                      <span className="text-violet-400">+12 Essence</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && playerStats && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">⚔️</div>
                    <div className="text-lg font-bold text-white">{playerStats.totalDamage}</div>
                    <div className="text-xs text-gray-400">Damage</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🌊</div>
                    <div className="text-lg font-bold text-violet-400">{Math.round(playerStats.resonanceContributed)}%</div>
                    <div className="text-xs text-gray-400">Resonance</div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🃏</div>
                    <div className="text-lg font-bold text-white">{playerStats.cardsPlayed}</div>
                    <div className="text-xs text-gray-400">Cards</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Battle Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Enemy</span>
                      <span className="text-white">{snapshot.enemyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tier</span>
                      <span className="capitalize text-white">{snapshot.enemyTier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Turns</span>
                      <span className="text-white">{snapshot.turns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-white">
                        {Math.floor(snapshot.duration / 60)}m {snapshot.duration % 60}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resonance Peak</span>
                      <span className="text-violet-400">{Math.round(snapshot.resonancePeak)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onPlayAgain}
            className={`
              flex-1 py-3 rounded-lg font-medium transition-colors min-h-[44px]
              ${isVictory
                ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-600/50'
                : 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50'
              }
            `}
          >
            Play Again
          </button>

          <button
            onClick={onReturn}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors min-h-[44px]"
          >
            Return
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VictoryModal;
