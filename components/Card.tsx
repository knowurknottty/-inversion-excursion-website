'use client';

import { useCardFrequency } from '@/hooks/useSynSync';
import type { Card as CardType } from '@/lib/types';
import { Fire, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  showFrequency?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const ELEMENT_ICONS = {
  fire: Fire,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles
};

const ELEMENT_COLORS = {
  fire: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  water: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  earth: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  air: 'from-slate-400/20 to-white/10 border-slate-400/30',
  aether: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
};

const RARITY_COLORS = {
  common: 'text-slate-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400'
};

export function Card({ card, isSelected, showFrequency, onClick, disabled }: CardProps) {
  const frequency = useCardFrequency(card.frequency, card.entrainmentTarget);
  const ElementIcon = ELEMENT_ICONS[card.element];
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative w-full aspect-[3/4] rounded-xl overflow-hidden
        bg-gradient-to-br ${ELEMENT_COLORS[card.element]}
        border-2 transition-all duration-300
        ${isSelected ? 'border-indigo-400 shadow-lg shadow-indigo-500/30 scale-105' : 'border-slate-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-500'}
      `}
    >
      {/* Frequency Glow Effect */}
      {frequency.isInSync && (
        <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
      )}
      
      {/* Card Content */}
      <div className="relative h-full p-3 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1">
            <ElementIcon className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">{card.element}</span>
          </div>
          <span className={`text-xs font-bold ${RARITY_COLORS[card.rarity]}`}>
            {card.rarity.toUpperCase()}
          </span>
        </div>
        
        {/* Image Placeholder */}
        <div className="flex-1 bg-slate-800/50 rounded-lg mb-2 flex items-center justify-center">
          <ElementIcon className="w-12 h-12 opacity-30" />
        </div>
        
        {/* Name */}
        <h3 className="font-semibold text-sm mb-1 truncate">{card.name}</h3>
        
        {/* Stats */}
        <div className="flex justify-between text-xs mb-2">
          <span className="text-red-400">⚔️ {card.attack}</span>
          <span className="text-blue-400">🛡️ {card.defense}</span>
          <span className="text-green-400">💚 {card.healing}</span>
        </div>
        
        {/* Frequency Display */}
        {showFrequency && (
          <div className={`
            text-xs p-1.5 rounded text-center transition-colors
            ${frequency.isInSync ? 'bg-green-500/20 text-green-300' : 'bg-slate-800/50 text-slate-400'}
          `}>
            <div className="font-mono">{card.frequency}Hz</div>
            <div className="text-[10px] opacity-75">
              {frequency.brainwaveBand} • {card.entrainmentTarget}Hz
            </div>
            {frequency.isInSync && (
              <div className="text-[10px] text-green-400">+{(frequency.syncBonus * 100).toFixed(0)}% Sync</div>
            )}
          </div>
        )}
      </div>
      
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-indigo-400 rounded-full" />
      )}
    </div>
  );
}
