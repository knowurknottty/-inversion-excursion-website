import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card as CardComponent } from './Card';
import { ResonanceMeter } from './ResonanceMeter';
import type { Card, CardTier } from '../types';

interface DeckBuilderProps {
  collection: Card[];
  currentDeck: Card[];
  maxDeckSize?: number;
  sharedResonance: number;
  isLoading?: boolean;
  onAddCard: (card: Card) => void;
  onRemoveCard: (index: number) => void;
  onReorderDeck: (fromIndex: number, toIndex: number) => void;
  onFrequencyTune: (frequency: number) => void;
  onViewCardDetail: (card: Card) => void;
  onSaveDeck?: () => void;
  className?: string;
}

const tierFilters: { tier: CardTier | 'all'; label: string; color: string }[] = [
  { tier: 'all', label: 'All', color: '#8B5CF6' },
  { tier: 'physical', label: 'Physical', color: '#D97706' },
  { tier: 'emotional', label: 'Emotional', color: '#94A3B8' },
  { tier: 'atomic', label: 'Atomic', color: '#EAB308' },
  { tier: 'galactic', label: 'Galactic', color: '#22D3EE' },
  { tier: 'cosmic', label: 'Cosmic', color: '#A855F7' },
];

export const DeckBuilder: React.FC<DeckBuilderProps> = ({
  collection,
  currentDeck,
  maxDeckSize = 7,
  sharedResonance,
  isLoading = false,
  onAddCard,
  onRemoveCard,
  onReorderDeck,
  onFrequencyTune,
  onViewCardDetail,
  onSaveDeck,
  className = '',
}) => {
  const [selectedTier, setSelectedTier] = useState<CardTier | 'all'>('all');
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Filter collection by tier
  const filteredCollection = useMemo(() => {
    if (selectedTier === 'all') return collection;
    return collection.filter((card) => card.tier === selectedTier);
  }, [collection, selectedTier]);

  // Calculate deck stats
  const deckStats = useMemo(() => {
    if (currentDeck.length === 0) return null;

    const avgFrequency = currentDeck.reduce((sum, c) => sum + c.frequency, 0) / currentDeck.length;
    const avgResonance = currentDeck.reduce((sum, c) => sum + c.resonance, 0) / currentDeck.length;
    const avgHarmonic = currentDeck.reduce((sum, c) => sum + c.harmonic, 0) / currentDeck.length;

    const tierCounts = currentDeck.reduce((acc, card) => {
      acc[card.tier] = (acc[card.tier] || 0) + 1;
      return acc;
    }, {} as Record<CardTier, number>);

    return {
      avgFrequency,
      avgResonance,
      avgHarmonic,
      tierCounts,
      synergy: currentDeck.length >= 3 ? Math.round(avgHarmonic * 10) : 0,
    };
  }, [currentDeck]);

  // Check if card can be added
  const canAddCard = useCallback((card: Card) => {
    return currentDeck.length < maxDeckSize && !currentDeck.find((c) => c.id === card.id);
  }, [currentDeck, maxDeckSize]);

  // Handle adding card to deck
  const handleAddCard = useCallback((card: Card) => {
    if (canAddCard(card)) {
      onAddCard(card);
    }
  }, [canAddCard, onAddCard]);

  // Empty slots for visual
  const emptySlots = maxDeckSize - currentDeck.length;

  return (
    <div className={`flex flex-col h-full bg-gray-950 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-white">Deck Builder</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {currentDeck.length}/{maxDeckSize}
          </span>
          {onSaveDeck && (
            <button
              onClick={onSaveDeck}
              disabled={currentDeck.length === 0 || isLoading}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors min-w-[44px] min-h-[44px]"
              aria-label="Save deck"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Shared Resonance Field */}
      <div className="px-4 py-4 bg-gradient-to-b from-gray-900/50 to-transparent">
        <ResonanceMeter
          value={sharedResonance}
          label="Shared Resonance"
          size="lg"
          variant="wave"
          isCharged={sharedResonance >= 100}
          showPulse={true}
        />

        {/* Deck Stats */}
        {deckStats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">Avg Freq</div>
              <div className="text-sm font-mono text-violet-400">
                {deckStats.avgFrequency.toFixed(1)}Hz
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">Resonance</div>
              <div className="text-sm font-mono text-amber-400">
                {Math.round(deckStats.avgResonance)}%
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">Synergy</div>
              <div className="text-sm font-mono text-green-400">
                {deckStats.synergy}%
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Deck Slots */}
      <div className="px-4 py-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Deck</div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Current deck cards */}
          <Reorder.Group
            axis="x"
            values={currentDeck}
            onReorder={(newOrder) => {
              // Find which card moved and where
              newOrder.forEach((card, newIndex) => {
                const oldIndex = currentDeck.findIndex((c) => c.id === card.id);
                if (oldIndex !== -1 && oldIndex !== newIndex) {
                  onReorderDeck(oldIndex, newIndex);
                }
              });
            }}
            className="contents"
          >
            {currentDeck.map((card, index) => (
              <Reorder.Item
                key={card.id}
                value={card}
                className="relative"
                whileDrag={{ scale: 1.1, zIndex: 50 }}
              >
                <motion.div
                  layoutId={`deck-card-${card.id}`}
                  className="relative"
                  onClick={() => onViewCardDetail?.(card)}
                >
                  <CardComponent
                    card={card}
                    size="sm"
                    isSelected={false}
                    showFrequency={true}
                    showTier={false}
                  />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCard(index);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center text-xs z-10 min-w-[20px] min-h-[20px]"
                    aria-label={`Remove ${card.name} from deck`}
                  >
                    ×
                  </button>
                  {/* Slot number */}
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gray-700 text-gray-300 text-[10px] rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <motion.div
              key={`empty-${index}`}
              className={`
                aspect-[2/3] rounded-lg border-2 border-dashed
                ${hoveredSlot === currentDeck.length + index
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-gray-700 bg-gray-800/30'
                }
                flex items-center justify-center min-w-[64px] min-h-[96px]
              `}
              animate={{
                borderColor: hoveredSlot === currentDeck.length + index ? '#8B5CF6' : '#374151',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setHoveredSlot(currentDeck.length + index);
              }}
              onDragLeave={() => setHoveredSlot(null)}
              onDrop={(e) => {
                e.preventDefault();
                setHoveredSlot(null);
                if (draggedCard && canAddCard(draggedCard)) {
                  handleAddCard(draggedCard);
                }
              }}
            >
              <span className="text-gray-600 text-lg">+</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collection Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tier Filters */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {tierFilters.map((filter) => (
            <button
              key={filter.tier}
              onClick={() => setSelectedTier(filter.tier)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                transition-all min-h-[32px]
                ${selectedTier === filter.tier
                  ? 'text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }
              `}
              style={{
                backgroundColor: selectedTier === filter.tier ? filter.color : undefined,
              }}
              aria-pressed={selectedTier === filter.tier}
              aria-label={`Filter by ${filter.label}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Collection Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredCollection.map((card) => {
                const isInDeck = currentDeck.find((c) => c.id === card.id);
                const canAdd = canAddCard(card);

                return (
                  <motion.div
                    key={card.id}
                    layoutId={`collection-card-${card.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`
                      relative cursor-pointer
                      ${isInDeck ? 'opacity-40' : ''}
                      ${!canAdd && !isInDeck ? 'opacity-60' : ''}
                    `}
                    draggable={!isInDeck && canAdd}
                    onDragStart={() => setDraggedCard(card)}
                    onDragEnd={() => setDraggedCard(null)}
                    onClick={() => {
                      if (isInDeck) {
                        const index = currentDeck.findIndex((c) => c.id === card.id);
                        if (index !== -1) onRemoveCard(index);
                      } else if (canAdd) {
                        handleAddCard(card);
                      } else {
                        onViewCardDetail?.(card);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onViewCardDetail?.(card);
                    }}
                  >
                    <CardComponent
                      card={card}
                      size="md"
                      isDisabled={!canAdd && !isInDeck}
                      isSelected={isInDeck !== undefined}
                      showFrequency={true}
                      showTier={true}
                    />

                    {/* In deck indicator */}
                    {isInDeck && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Cannot add indicator */}
                    {!canAdd && !isInDeck && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 px-2 py-1 rounded text-[10px] text-gray-400">
                          {currentDeck.length >= maxDeckSize ? 'Full' : 'Owned'}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {filteredCollection.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">No cards in this tier</p>
            </div>
          )}
        </div>
      </div>

      {/* Frequency Tuner (when deck has 3+ cards) */}
      {currentDeck.length >= 3 && deckStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 bg-gray-900/50 border-t border-gray-800"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Frequency Tuner</span>
            <span className="text-xs font-mono text-violet-400">
              Target: {deckStats.avgFrequency.toFixed(1)}Hz
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={deckStats.avgFrequency}
            onChange={(e) => onFrequencyTune?.(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
            aria-label="Frequency tuner"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>Delta (2Hz)</span>
            <span>Gamma (40Hz)</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeckBuilder;
