'use client';

import { useCallback, useEffect, useState } from 'react';
import { useBattleStore, useDeckStore } from '@/lib/store';
import type { Card, DungeonAction, DungeonNarrativeResponse } from '@/lib/types';
import { BATTLE_CONFIG } from '@/lib/constants';

// ============================================
// BATTLE SYSTEM HOOK
// ============================================
export function useBattle(battleId?: string) {
  const battle = useBattleStore();
  const { selectedDeck } = useDeckStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize battle
  const initBattle = useCallback(async (opponentId: string) => {
    battle.startBattle(opponentId);
  }, [battle]);
  
  // Play a card in battle
  const playCard = useCallback(async (card: Card, target?: string) => {
    if (!battle.isActive || battle.currentTurn !== 'player') {
      setError('Not your turn or battle not active');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Record player action
      const action: DungeonAction = {
        type: card.attack > 0 ? 'attack' : card.healing > 0 ? 'heal' : 'special',
        cardId: card.id,
        target,
        value: card.attack || card.healing || 0,
        description: `${card.name} used ${card.specialAbility || 'basic attack'}`
      };
      
      battle.playCard(card, target);
      
      // Call Dungeon AI for response
      const response = await fetch('/api/battle/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battleId: battleId || crypto.randomUUID(),
          action,
          battleState: {
            playerHealth: battle.playerHealth,
            opponentHealth: battle.opponentHealth,
            turnCount: battle.turnCount
          },
          playerDeck: selectedDeck
        } satisfies import('@/lib/types').BattleActionRequest)
      });
      
      if (!response.ok) throw new Error('Failed to process battle action');
      
      const result: DungeonNarrativeResponse = await response.json();
      
      // Apply battle effects
      if (result.battleEffects) {
        if (result.battleEffects.playerHealthDelta) {
          const delta = result.battleEffects.playerHealthDelta;
          if (delta < 0) battle.takeDamage(Math.abs(delta));
          else battle.heal(delta);
        }
        
        if (result.battleEffects.enemyHealthDelta) {
          // Update opponent health (would need additional store action)
          // For now, track via battle log
          battle.addToBattleLog(`Enemy takes ${Math.abs(result.battleEffects.enemyHealthDelta)} damage!`);
        }
      }
      
      // Display AI narrative
      if (result.narrative) {
        battle.setDungeonResponse(result.narrative);
      }
      
      if (result.enemyAction) {
        battle.addToBattleLog(`Enemy: ${result.enemyAction.description}`);
      }
      
      // Check victory conditions
      if (battle.playerHealth <= 0) {
        battle.endBattle(false);
      } else if (result.battleEffects?.enemyHealthDelta && 
                 battle.opponentHealth + result.battleEffects.enemyHealthDelta <= 0) {
        battle.endBattle(true);
      } else {
        // Next turn
        battle.nextTurn();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [battle, battleId, selectedDeck]);
  
  // End battle
  const endBattle = useCallback((victory: boolean) => {
    battle.endBattle(victory);
  }, [battle]);
  
  // Surrender
  const surrender = useCallback(() => {
    battle.endBattle(false);
  }, [battle]);
  
  // Auto-end on turn limit
  useEffect(() => {
    if (battle.turnCount >= BATTLE_CONFIG.maxTurns && battle.isActive) {
      // Player with more health wins
      const victory = battle.playerHealth >= battle.opponentHealth;
      battle.endBattle(victory);
    }
  }, [battle.turnCount, battle.isActive, battle.playerHealth, battle.opponentHealth]);
  
  return {
    ...battle,
    isLoading,
    error,
    initBattle,
    playCard,
    endBattle,
    surrender,
    selectedDeck
  };
}

// ============================================
// BATTLE TURN TIMER HOOK
// ============================================
export function useTurnTimer() {
  const { currentTurn, isActive, nextTurn } = useBattleStore();
  const [timeLeft, setTimeLeft] = useState(BATTLE_CONFIG.turnTimeout / 1000);
  
  useEffect(() => {
    if (!isActive) return;
    
    setTimeLeft(BATTLE_CONFIG.turnTimeout / 1000);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          nextTurn();
          return BATTLE_CONFIG.turnTimeout / 1000;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentTurn, isActive, nextTurn]);
  
  return {
    timeLeft,
    isPlayerTurn: currentTurn === 'player',
    formatted: `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
  };
}
