'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Coins, X, ExternalLink, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  victory: boolean;
  onMint: () => void;
  battleLog: string[];
  turnCount: number;
}

export function VictoryModal({ isOpen, onClose, victory, onMint, turnCount }: VictoryModalProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  // Trigger confetti on victory
  useEffect(() => {
    if (isOpen && victory) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, victory]);

  const handleMint = async () => {
    setIsMinting(true);
    await onMint();
    setIsMinting(false);
    setMinted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg"
          >
            <div className={`
              rounded-2xl p-8 text-center
              ${victory 
                ? 'bg-gradient-to-b from-amber-900/90 to-slate-900/90 border border-amber-500/30' 
                : 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700'}
            `}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`
                  p-4 rounded-full
                  ${victory ? 'bg-amber-500/20' : 'bg-slate-700'}
                `}
003e
                  {victory ? (
                    <Trophy className="w-12 h-12 text-amber-400" />
                  ) : (
                    <Sparkles className="w-12 h-12 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold mb-2">
                {victory ? 'Victory!' : 'Defeat'}
              </h2>
              
              <p className="text-slate-400 mb-6">
                {victory 
                  ? `You conquered the dungeon in ${turnCount} turns!` 
                  : 'The dungeon proved too powerful this time.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <Stat label="Turns" value={turnCount} />
                <Stat 
                  label="XP Gained" 
                  value={victory ? `+${turnCount * 10}` : '+5'} 
                  positive={true}
                />
                <Stat 
                  label="Tokens" 
                  value={victory ? 'Earned' : 'None'} 
                  positive={victory}
                />
              </div>

              {/* Mint Button */}
              {victory && !minted ? (
                <button
                  onClick={handleMint}
                  disabled={isMinting}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Coins className="w-5 h-5" />
                  {isMinting ? 'Minting...' : 'Mint Victory NFT on Zora'}
                </button>
              ) : minted ? (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                    Successfully Minted!
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    View on Zora <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : null}

              {/* Try Again */}
              <button
                onClick={onClose}
                className="mt-4 text-slate-400 hover:text-white transition-colors"
              >
                {victory ? 'Return to Deck' : 'Try Again'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value, positive }: { label: string; value: string | number; positive?: boolean }) {
  return (
    <div className="p-3 bg-black/20 rounded-lg">
      <div className={`
        text-xl font-bold
        ${positive === true ? 'text-green-400' : positive === false ? 'text-slate-400' : 'text-white'}
      `}>
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
