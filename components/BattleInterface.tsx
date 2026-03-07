'use client';

import { useState } from 'react';
import { useBattleStore, useDeckStore } from '@/lib/store';
import { useBattle, useTurnTimer } from '@/hooks/useBattle';
import { Card } from './Card';
import { Heart, Zap, Clock, Shield, Swords } from 'lucide-react';

export function BattleInterface() {
  const { selectedDeck } = useDeckStore();
  const { 
    playerHealth, 
    playerMaxHealth, 
    opponentHealth, 
    opponentMaxHealth,
    currentTurn,
    battleLog,
    dungeonResponse,
    victory
  } = useBattleStore();
  
  const battle = useBattle();
  const timer = useTurnTimer();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleCardPlay = async (cardId: string) => {
    const card = selectedDeck.find(c => c.id === cardId);
    if (!card || currentTurn !== 'player' || victory !== null) return;
    
    setSelectedCard(cardId);
    await battle.playCard(card);
    setSelectedCard(null);
  };

  const playerHealthPercent = (playerHealth / playerMaxHealth) * 100;
  const opponentHealthPercent = (opponentHealth / opponentMaxHealth) * 100;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Battle Arena */}
      <section className="lg:col-span-2 space-y-6">
        {/* Opponent Status */}
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Swords className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-semibold">Dungeon Guardian</div>
                <div className="text-xs text-slate-500">Level 1 AI</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{opponentHealth}/{opponentMaxHealth}</div>
              <div className="text-xs text-slate-500">HP</div>
            </div>
          </div>
          
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${opponentHealthPercent}%` }}
            />
          </div>
        </div>

        {/* Battle Visualization */}
        <div className="aspect-video bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-purple-500/5" />
          
          {/* Center clash indicator */}
          <div className={`
            w-24 h-24 rounded-full flex items-center justify-center
            ${currentTurn === 'player' ? 'bg-indigo-500/20' : 'bg-red-500/20'}
            transition-colors duration-500
          `}>
            <div className={`
              text-4xl font-bold
              ${currentTurn === 'player' ? 'text-indigo-400' : 'text-red-400'}
            `}>
              VS
            </div>
          </div>
          
          {/* Turn indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className={`
              px-4 py-1 rounded-full text-sm font-medium
              ${currentTurn === 'player' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-red-500/20 text-red-300'}
            `}>
              {currentTurn === 'player' ? 'Your Turn' : "Enemy's Turn"}
            </div>
          </div>
        </div>

        {/* Player Status */}
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold">You</div>
                <div className="text-xs text-slate-500">Resonant Warrior</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Zap className="w-5 h-5" />
                <span>{selectedDeck.length}</span>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">{playerHealth}/{playerMaxHealth}</div>
                <div className="text-xs text-slate-500">HP</div>
              </div>
            </div>
          </div>
          
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${playerHealthPercent}%` }}
            />
          </div>
        </div>

        {/* Hand */}
        <div className="grid grid-cols-4 gap-3">
          {selectedDeck.slice(0, 4).map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardPlay(card.id)}
              disabled={currentTurn !== 'player' || victory !== null}
              className={`
                transition-all duration-200
                ${currentTurn === 'player' ? 'hover:scale-105 hover:-translate-y-2' : 'opacity-70'}
                ${selectedCard === card.id ? 'scale-105 -translate-y-4' : ''}
              `}
            >
              <Card card={card} showFrequency={true} />
            </button>
          ))}
          
          {Array.from({ length: 4 - selectedDeck.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center"
            >
              <span className="text-slate-700">—</span>
            </div>
          ))}
        </div>
      </section>

      {/* Battle Info */}
      <aside className="space-y-4">
        {/* Timer */}
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Turn Timer</span>
          </div>
          <div className="text-2xl font-mono">{timer.formatted}</div>
        </div>

        {/* Dungeon AI Response */}
        {dungeonResponse && (
          <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
            <div className="text-xs text-purple-400 mb-1">Dungeon Master</div>
            <p className="text-sm text-purple-100">{dungeonResponse}</p>
          </div>
        )}

        {/* Battle Log */}
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
          <h3 className="font-semibold mb-3">Battle Log</h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {battleLog.map((entry, i) => (
              <div
                key={i}
                className={`
                  text-sm p-2 rounded
                  ${entry.includes('Victory') ? 'bg-green-500/20 text-green-300' : ''}
                  ${entry.includes('Defeat') ? 'bg-red-500/20 text-red-300' : ''}
                  ${!entry.includes('Victory') && !entry.includes('Defeat') ? 'bg-slate-800/50' : ''}
                `}
              >
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* Surrender */}
        <button
          onClick={() => battle.surrender()}
          disabled={victory !== null}
          className="w-full py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          Surrender
        </button>
      </aside>
    </div>
  );
}
