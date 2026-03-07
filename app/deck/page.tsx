'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDeckStore } from '@/lib/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/Card';
import { useSynSync } from '@/hooks/useSynSync';
import { Plus, Save, Trash2 } from 'lucide-react';

// Sample cards for demo
const SAMPLE_CARDS = [
  { id: '1', name: 'Solar Flare', element: 'fire', frequency: 528, entrainmentTarget: 10, rarity: 'rare', attack: 25, defense: 5, description: 'A burst of solar energy.', image: '/cards/fire1.png' },
  { id: '2', name: 'Deep Ocean', element: 'water', frequency: 432, entrainmentTarget: 8, rarity: 'common', attack: 15, defense: 15, description: 'The calming depths.', image: '/cards/water1.png' },
  { id: '3', name: 'Mountain Core', element: 'earth', frequency: 396, entrainmentTarget: 6, rarity: 'epic', attack: 10, defense: 30, description: 'Unshakeable foundation.', image: '/cards/earth1.png' },
  { id: '4', name: 'Zephyr Wind', element: 'air', frequency: 852, entrainmentTarget: 12, rarity: 'common', attack: 20, defense: 5, description: 'Swift as the breeze.', image: '/cards/air1.png' },
  { id: '5', name: 'Void Resonance', element: 'aether', frequency: 963, entrainmentTarget: 40, rarity: 'legendary', attack: 50, defense: 20, description: 'Beyond the elements.', image: '/cards/aether1.png' },
];

export default function DeckPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { selectedDeck, selectCard, deselectCard, clearDeck, maxDeckSize } = useDeckStore();
  const synSync = useSynSync();
  const [saved, setSaved] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleCardClick = (card: typeof SAMPLE_CARDS[0]) => {
    const isSelected = selectedDeck.find(c => c.id === card.id);
    
    if (isSelected) {
      deselectCard(card.id);
    } else if (selectedDeck.length < maxDeckSize) {
      selectCard(card as any);
      // Play card's frequency briefly
      synSync.play(card.frequency, card.entrainmentTarget);
      setTimeout(() => synSync.stop(), 1000);
    }
  };

  const handleSave = () => {
    // Save to API/localStorage (already persisted via Zustand)
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Deck Builder</h1>
          <p className="text-slate-400">Select {maxDeckSize} cards for battle. Click cards to hear their frequency.</p>
        </header>

        {/* Selected Deck */}
        <section className="mb-8 p-6 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Your Deck ({selectedDeck.length}/{maxDeckSize})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={clearDeck}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                disabled={selectedDeck.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                disabled={selectedDeck.length === 0}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Deck'}
              </button>
            </div>
          </div>
          
          {selectedDeck.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedDeck.map(card => (
                <button
                  key={card.id}
                  onClick={() => deselectCard(card.id)}
                  className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  {card.name} ×
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No cards selected. Click cards below to add them.</p>
          )}
        </section>

        {/* Available Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Available Cards</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SAMPLE_CARDS.map(card => {
              const isSelected = selectedDeck.find(c => c.id === card.id);
              const isDisabled = !isSelected && selectedDeck.length >= maxDeckSize;
              
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={isDisabled}
                  className={`relative transition-all ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  <Card
                    card={card as any}
                    isSelected={!!isSelected}
                    showFrequency={true}
                  />
                  
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 rotate-45" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
