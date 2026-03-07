'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDeckStore, useBattleStore } from '@/lib/store';
import { Navigation } from '@/components/Navigation';
import { BattleInterface } from '@/components/BattleInterface';
import { VictoryModal } from '@/components/VictoryModal';
import { useBattle } from '@/hooks/useBattle';
import { Swords } from 'lucide-react';

export default function BattlePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { selectedDeck } = useDeckStore();
  const { isActive, victory } = useBattleStore();
  const battle = useBattle();
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (selectedDeck.length === 0 && !isActive) {
      router.push('/deck');
      return;
    }

    // Start battle if not active
    if (!isActive && selectedDeck.length > 0) {
      battle.initBattle('ai-dungeon-master');
    }
  }, [isAuthenticated, isActive, selectedDeck.length, router, battle]);

  // Show victory modal when battle ends
  useEffect(() => {
    if (victory !== null) {
      setShowVictoryModal(true);
    }
  }, [victory]);

  const handleVictoryClose = () => {
    setShowVictoryModal(false);
    router.push('/deck');
  };

  const handleMint = async () => {
    // Mint victory NFT
    try {
      const response = await fetch('/api/mint/victory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          victory: victory === true,
          deck: selectedDeck,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Failed to mint:', err);
    }
  };

  if (!isAuthenticated || selectedDeck.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Swords className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold">Battle</h1>
          </div>
        </header>

        <BattleInterface />

        <VictoryModal
          isOpen={showVictoryModal}
          onClose={handleVictoryClose}
          victory={victory === true}
          onMint={handleMint}
          battleLog={battle.battleLog}
          turnCount={battle.turnCount}
        />
      </main>
    </div>
  );
}
